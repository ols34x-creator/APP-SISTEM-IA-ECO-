
import React, { useMemo, useState, useEffect } from 'react';
import { useAppStore } from '../hooks/useAppStore';
import { FinancialRecord, ReceivableRecord, RevenueRecord, RecordType } from '../types';
import DraggableWrapper from './DraggableWrapper';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Date(date.getTime() + date.getTimezoneOffset() * 60000).toLocaleDateString('pt-BR');
};

const ChangeIndicator: React.FC<{ value: number; positiveIsGood?: boolean }> = ({ value, positiveIsGood = true }) => {
    if (!isFinite(value) || value === 0) {
        return <span className="text-gray-text">-</span>;
    }
    const isPositive = value > 0;
    let colorClass = '';

    if (positiveIsGood) {
        colorClass = isPositive ? 'text-success' : 'text-danger';
    } else { // For costs, positive change is bad (red)
        colorClass = isPositive ? 'text-danger' : 'text-success';
    }

    const icon = isPositive ? '↑' : '↓';

    return (
        <span className={`flex items-center gap-1 font-bold text-xs ${colorClass}`}>
            {icon} {Math.abs(value).toFixed(1)}%
        </span>
    );
};

const KpiCard: React.FC<{ title: string; value: string | number; changeComponent: React.ReactNode; icon: string; color: string; }> = ({ title, value, changeComponent, icon, color }) => (
    <div className={`bg-bg-main p-5 rounded-lg shadow-md border-l-4 ${color} flex items-center justify-between transform hover:-translate-y-1 transition-all duration-200`}>
        <div>
            <p className="text-xs font-bold uppercase text-gray-400 tracking-wide">{title}</p>
            <p className="text-2xl font-extrabold text-light mt-1">{value}</p>
            <div className="mt-1">{changeComponent}</div>
        </div>
        <div className={`text-3xl opacity-20 ${color.replace('border-', 'text-')}`}>
            <i className={`fas ${icon}`}></i>
        </div>
    </div>
);

const TableCard: React.FC<{ title: string; children: React.ReactNode; actions?: React.ReactNode }> = ({ title, children, actions }) => (
    <div className="bg-bg-card rounded-lg p-6 shadow-lg mb-6 overflow-x-auto border border-border-color/50 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-light flex items-center gap-2">
                <span className="w-1 h-6 bg-secondary rounded-full"></span>
                {title}
            </h3>
            <div>{actions}</div>
        </div>
        <div>
            {children}
        </div>
    </div>
);

type ViewMode = 'overview' | 'fixedCosts' | 'variableCosts' | 'revenues' | 'receivables';

const Transactions: React.FC = () => {
    const { financialData, deleteRecord, markAsPaid, setActiveTab, logAction, isLayoutMode, layouts, setLayouts, activeTab } = useAppStore();
    const [draggedId, setDraggedId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('overview');
    
    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');

    const [dolar, setDolar] = useState("Carregando...");

    useEffect(() => {
        fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL')
            .then(res => res.json())
            .then(data => {
                const dolarValue = parseFloat(data.USDBRL.bid);
                setDolar(formatCurrency(dolarValue));
            })
            .catch(() => setDolar('Erro ao carregar'));
    }, []);

    const pageId = activeTab;
    const initialLayout = useMemo(() => ['financialSummary', 'monthlyChart', 'cashFlowChart', 'clientChart', 'portUpdates'], []);
    const layout = useMemo(() => layouts[pageId] || initialLayout, [layouts, pageId, initialLayout]);
    
    // Generic Filter Function
    const filterData = <T extends { name: string; description: string; category: string; date?: string; dueDate?: string }>(data: T[]): T[] => {
        return data.filter(item => {
            const matchesSearch = !searchTerm || 
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.description.toLowerCase().includes(searchTerm.toLowerCase());
            
            const itemDateStr = item.date || item.dueDate;
            const itemDate = itemDateStr ? new Date(itemDateStr) : null;
            
            const matchesStart = !startDate || (itemDate && itemDate >= new Date(startDate));
            const matchesEnd = !endDate || (itemDate && itemDate <= new Date(endDate));
            
            const matchesCategory = !categoryFilter || item.category === categoryFilter;

            return matchesSearch && matchesStart && matchesEnd && matchesCategory;
        });
    };

    const filteredFixedCosts = useMemo(() => filterData(financialData.fixedCosts), [financialData.fixedCosts, searchTerm, startDate, endDate, categoryFilter]);
    const filteredVariableCosts = useMemo(() => filterData(financialData.variableCosts), [financialData.variableCosts, searchTerm, startDate, endDate, categoryFilter]);
    const filteredRevenues = useMemo(() => filterData(financialData.revenues), [financialData.revenues, searchTerm, startDate, endDate, categoryFilter]);
    const filteredReceivables = useMemo(() => filterData(financialData.receivables), [financialData.receivables, searchTerm, startDate, endDate, categoryFilter]);

    // Extract unique categories based on current view for the dropdown
    const availableCategories = useMemo(() => {
        let sourceData: any[] = [];
        if (viewMode === 'overview') {
            sourceData = [...financialData.fixedCosts, ...financialData.variableCosts, ...financialData.revenues];
        } else if (viewMode === 'fixedCosts') {
            sourceData = financialData.fixedCosts;
        } else if (viewMode === 'variableCosts') {
            sourceData = financialData.variableCosts;
        } else if (viewMode === 'revenues') {
            sourceData = financialData.revenues;
        } else if (viewMode === 'receivables') {
            sourceData = financialData.receivables;
        }
        const categories = new Set(sourceData.map(item => item.category));
        return Array.from(categories).sort();
    }, [financialData, viewMode]);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
        setDraggedId(id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragEnd = () => {
        setDraggedId(null);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
        if (!draggedId || draggedId === targetId) return;
        const draggedIndex = layout.indexOf(draggedId);
        const targetIndex = layout.indexOf(targetId);
        
        const newLayout = [...layout];
        const [removed] = newLayout.splice(draggedIndex, 1);
        newLayout.splice(targetIndex, 0, removed);
        
        setLayouts(prev => ({...prev, [pageId]: newLayout}));
        setDraggedId(null);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const isRecordInvalid = (item: FinancialRecord | RevenueRecord | ReceivableRecord, type: RecordType): boolean => {
        if (!item.name || !item.description || item.value == null || !item.category) {
            return true;
        }

        switch (type) {
            case 'fixedCosts':
            case 'variableCosts':
                return !(item as FinancialRecord).date;
            case 'revenues':
                const revenue = item as RevenueRecord;
                return !revenue.date || !revenue.client;
            case 'receivables':
                const receivable = item as ReceivableRecord;
                return !receivable.dueDate || !receivable.client;
            default:
                return false;
        }
    };

    const exportToCSV = (data: any[], filename: string) => {
        if (data.length === 0) {
            alert("Não há dados para exportar.");
            return;
        }

        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => 
                headers.map(header => {
                    let cell = row[header] === null || row[header] === undefined ? '' : String(row[header]);
                    cell = cell.replace(/"/g, '""'); // Escape double quotes
                    if (cell.search(/("|,|\n)/g) >= 0) {
                        cell = `"${cell}"`;
                    }
                    return cell;
                }).join(',')
            )
        ].join('\n');

        const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        logAction(`Exported ${filename}`);
    };

    const handleEdit = (type: RecordType, id: number) => {
        if(confirm(`Editar este registro irá redirecioná-lo para a tela de lançamento e remover o item atual da lista. Deseja continuar?`)) {
            deleteRecord(type, id);
            setActiveTab('financial-entries');
        }
    };

    const handleDelete = (type: RecordType, id: number) => {
        if (window.confirm('Tem certeza que deseja excluir este registro?')) {
            deleteRecord(type, id);
        }
    };
    
    // --- Data Calculation for Charts ---
    const summaryData = useMemo(() => {
        const calculateChange = (current: number, previous: number) => {
            if (previous === 0) return current > 0 ? Infinity : 0;
            return ((current - previous) / previous) * 100;
        };

        const getMonthData = (monthOffset: number) => {
            const now = new Date();
            const targetDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
            const month = targetDate.getMonth();
            const year = targetDate.getFullYear();
            
            const filterByMonth = (record: { date: string }) => {
                if (!record.date) return false;
                const recordDate = new Date(record.date);
                return recordDate.getMonth() === month && recordDate.getFullYear() === year;
            };

            const revenues = financialData.revenues.filter(filterByMonth).reduce((sum, item) => sum + item.value, 0);
            const fixedCosts = financialData.fixedCosts.filter(filterByMonth).reduce((sum, item) => sum + item.value, 0);
            const variableCosts = financialData.variableCosts.filter(filterByMonth).reduce((sum, item) => sum + item.value, 0);
            const netProfit = revenues - (fixedCosts + variableCosts);
            
            return { revenues, fixedCosts, variableCosts, netProfit };
        };
        
        const currentMonth = getMonthData(0);
        const prevMonth = getMonthData(1);
        
        return {
            revenue: { value: currentMonth.revenues, change: calculateChange(currentMonth.revenues, prevMonth.revenues) },
            fixed: { value: currentMonth.fixedCosts, change: calculateChange(currentMonth.fixedCosts, prevMonth.fixedCosts) },
            variable: { value: currentMonth.variableCosts, change: calculateChange(currentMonth.variableCosts, prevMonth.variableCosts) },
            profit: { value: currentMonth.netProfit, change: calculateChange(currentMonth.netProfit, prevMonth.netProfit) },
        };
    }, [financialData]);

    const clientChartData = useMemo(() => {
        const clientData: { [key: string]: number } = {};
        financialData.revenues.forEach(item => {
            const client = item.client || 'N/A';
            clientData[client] = (clientData[client] || 0) + item.value;
        });

        const labels = Object.keys(clientData);
        const data = Object.values(clientData);
        return { labels, data };
    }, [financialData]);
    
    const monthlyChartData = useMemo(() => {
        const labels: string[] = [];
        const monthlyRevenues: number[] = [];
        const monthlyExpenses: number[] = [];
        const monthlyNetProfit: number[] = [];
        const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        const now = new Date();

        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const month = date.getMonth();
            const year = date.getFullYear();
            labels.push(`${monthNames[month]}/${year.toString().slice(-2)}`);
            
            const revenue = financialData.revenues
                .filter(r => { const d = new Date(r.date); return d.getMonth() === month && d.getFullYear() === year; })
                .reduce((s, i) => s + i.value, 0);
            
            const expense = [...financialData.fixedCosts, ...financialData.variableCosts]
                .filter(c => { const d = new Date(c.date); return d.getMonth() === month && d.getFullYear() === year; })
                .reduce((s, i) => s + i.value, 0);

            monthlyRevenues.push(revenue);
            monthlyExpenses.push(expense);
            monthlyNetProfit.push(revenue - expense);
        }

        return { labels, monthlyRevenues, monthlyExpenses, monthlyNetProfit };
    }, [financialData]);

    const commonChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#94A3B8' } } },
        scales: { 
            x: { ticks: { color: '#94A3B8' }, grid: { color: '#334155' } }, 
            y: { ticks: { color: '#94A3B8', callback: (value: any) => `R$${value/1000}k` }, grid: { color: '#334155' } } 
        }
    };
    
    // --- Components for Overview Layout ---
    const componentsMap = {
        financialSummary: (
            <div className="bg-bg-card rounded-lg p-6 shadow-lg mb-6 border border-border-color/50">
                <h3 className="text-xl font-bold text-light flex items-center gap-2 mb-6">
                    <span className="w-1 h-6 bg-secondary rounded-full"></span>
                    Resumo Financeiro (Mês Atual)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <KpiCard 
                        title="Receita Bruta" 
                        value={formatCurrency(summaryData.revenue.value)} 
                        changeComponent={<ChangeIndicator value={summaryData.revenue.change} positiveIsGood={true} />}
                        icon="fa-hand-holding-usd" 
                        color="border-green-500" 
                    />
                    <KpiCard 
                        title="Custos Fixos" 
                        value={formatCurrency(summaryData.fixed.value)} 
                        changeComponent={<ChangeIndicator value={summaryData.fixed.change} positiveIsGood={false} />}
                        icon="fa-building" 
                        color="border-red-500" 
                    />
                    <KpiCard 
                        title="Custos Variáveis" 
                        value={formatCurrency(summaryData.variable.value)} 
                        changeComponent={<ChangeIndicator value={summaryData.variable.change} positiveIsGood={false} />}
                        icon="fa-gas-pump" 
                        color="border-yellow-500" 
                    />
                    <KpiCard 
                        title="Lucro Líquido" 
                        value={formatCurrency(summaryData.profit.value)} 
                        changeComponent={<ChangeIndicator value={summaryData.profit.change} positiveIsGood={true} />}
                        icon="fa-chart-line" 
                        color={summaryData.profit.value >= 0 ? "border-blue-500" : "border-red-600"} 
                    />
                </div>
            </div>
        ),
        portUpdates: (
            <TableCard title="Indicadores de Mercado">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-bg-main border border-border-color rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
                        <h4 className="text-sm text-gray-text mb-2 font-semibold">Dólar (USD)</h4>
                        <p className="text-3xl font-bold text-light tracking-tight">{dolar}</p>
                    </div>
                    <div className="bg-bg-main border border-border-color rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
                        <h4 className="text-sm text-gray-text mb-2 font-semibold">Diesel S10 (Méd)</h4>
                        <p className="text-3xl font-bold text-light tracking-tight">R$ 6,10</p>
                    </div>
                    <div className="bg-bg-main border border-border-color rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
                        <h4 className="text-sm text-gray-text mb-2 font-semibold">Selic (Meta)</h4>
                        <p className="text-3xl font-bold text-light tracking-tight">11,25%</p>
                    </div>
                    <div className="bg-bg-main border border-border-color rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
                        <h4 className="text-sm text-gray-text mb-2 font-semibold">Notícias</h4>
                        <a href="#" className="text-secondary hover:underline block mt-1 text-sm leading-snug">Novas tarifas portuárias aprovadas para 2025...</a>
                    </div>
                </div>
            </TableCard>
        ),
        monthlyChart: (
            <TableCard title="Receita vs Despesas (Últimos 6 Meses)">
                <div className="h-96 w-full">
                     <Bar 
                        options={commonChartOptions as any} 
                        data={{
                            labels: monthlyChartData.labels,
                            datasets: [
                                { label: 'Receita', data: monthlyChartData.monthlyRevenues, backgroundColor: '#4ADE80', borderRadius: 4 },
                                { label: 'Despesas', data: monthlyChartData.monthlyExpenses, backgroundColor: '#F87171', borderRadius: 4 }
                            ]
                        }} 
                    />
                </div>
            </TableCard>
        ),
        cashFlowChart: (
            <TableCard title="Fluxo de Caixa Mensal (Receitas - Despesas)">
                <div className="h-96 w-full">
                     <Bar
                        options={commonChartOptions as any}
                        data={{
                            labels: monthlyChartData.labels,
                            datasets: [
                                {
                                    label: 'Saldo Líquido',
                                    data: monthlyChartData.monthlyNetProfit,
                                    backgroundColor: monthlyChartData.monthlyNetProfit.map(v => v >= 0 ? '#4ADE80' : '#F87171'),
                                    borderRadius: 4,
                                }
                            ]
                        }}
                    />
                </div>
            </TableCard>
        ),
        clientChart: (
            <TableCard title="Margem por Cliente">
                <div className="h-96 w-full">
                     <Bar
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                             plugins: { legend: { display: false } },
                             scales: { 
                                x: { ticks: { color: '#94A3B8' }, grid: { color: '#334155' } }, 
                                y: { ticks: { color: '#94A3B8', callback: (value: any) => `R$${value/1000}k` }, grid: { color: '#334155' } } 
                            }
                        }}
                        data={{
                            labels: clientChartData.labels,
                            datasets: [{
                                label: 'Receita',
                                data: clientChartData.data,
                                backgroundColor: '#4ADE80',
                                borderRadius: 4,
                            }]
                        }}
                    />
                </div>
            </TableCard>
        ),
    };
    
    // --- Render Logic ---

    const renderTable = (type: RecordType, data: any[], title: string, csvName: string) => {
        const isReceivable = type === 'receivables';
        return (
            <TableCard 
                title={title}
                actions={
                    <button 
                        onClick={() => exportToCSV(data, csvName)}
                        className="px-4 py-2 bg-secondary text-white text-xs font-semibold rounded-md hover:bg-opacity-90 flex items-center gap-2 shadow-md hover:shadow-lg transition-shadow"
                    >
                        <i className="fas fa-file-csv"></i> Exportar CSV
                    </button>
                }
            >
                <table className="w-full text-sm text-left text-gray-text">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-700">
                        <tr>
                            <th className="px-6 py-3">Nome</th>
                            <th className="px-6 py-3">Descrição</th>
                            <th className="px-6 py-3">Categoria</th>
                            <th className="px-6 py-3">Valor</th>
                            <th className="px-6 py-3">{isReceivable ? 'Vencimento' : 'Data'}</th>
                            {isReceivable && <th className="px-6 py-3">Status</th>}
                            <th className="px-6 py-3 text-center">Anexo</th>
                            <th className="px-6 py-3">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-color">
                        {data.map((item) => {
                            const isInvalid = isRecordInvalid(item, type);
                            const rowClass = isInvalid
                                ? 'bg-red-900/50 hover:bg-red-800/60'
                                : 'bg-bg-card hover:bg-border-color';
                            return (
                                <tr key={item.id} className={`${rowClass} transition-colors`} title={item.observation || 'Sem observações.'}>
                                    <td className="px-6 py-4 font-medium">{item.name}</td>
                                    <td className="px-6 py-4">{item.description}</td>
                                    <td className="px-6 py-4"><span className="px-2 py-1 bg-gray-700 rounded text-xs">{item.category}</span></td>
                                    <td className={`px-6 py-4 font-bold ${['revenues', 'receivables'].includes(type) ? 'text-success' : 'text-light'}`}>{formatCurrency(item.value)}</td>
                                    <td className="px-6 py-4">{formatDate(isReceivable ? item.dueDate : item.date)}</td>
                                    {isReceivable && (
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${item.status === 'paid' ? 'bg-green-500/20 text-success' : 'bg-yellow-500/20 text-warning'}`}>
                                                {item.status === 'paid' ? 'PAGO' : 'PENDENTE'}
                                            </span>
                                        </td>
                                    )}
                                    <td className="px-6 py-4 text-center">{item.attachment ? <i className="fas fa-paperclip text-secondary"></i> : ''}</td>
                                    <td className="px-6 py-4 space-x-3">
                                        {isReceivable && item.status === 'pending' && <button onClick={() => markAsPaid(item.id)} className="text-green-400 hover:text-green-300 transition-colors" title="Marcar como pago"><i className="fas fa-check-circle"></i></button>}
                                        <button onClick={() => handleEdit(type, item.id)} className="text-blue-400 hover:text-blue-300 transition-colors" title="Editar"><i className="fas fa-pencil-alt"></i></button>
                                        <button onClick={() => handleDelete(type, item.id)} className="text-red-500 hover:text-red-400 transition-colors" title="Excluir"><i className="fas fa-trash"></i></button>
                                    </td>
                                </tr>
                            );
                        })}
                        {data.length === 0 && (
                            <tr>
                                <td colSpan={8} className="px-6 py-8 text-center text-gray-500 italic">
                                    Nenhum registro encontrado para os filtros selecionados.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </TableCard>
        );
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-full">
             {/* Sidebar Navigation */}
            <div className="lg:w-64 flex-shrink-0 flex flex-col gap-2 bg-bg-card p-4 rounded-lg shadow-lg h-fit lg:sticky lg:top-0">
                <h3 className="text-gray-400 text-xs font-bold uppercase mb-2 px-2">Navegação</h3>
                
                <button onClick={() => setViewMode('overview')} className={`w-full text-left px-4 py-3 rounded-lg font-semibold text-sm transition-all flex items-center gap-3 ${viewMode === 'overview' ? 'bg-secondary text-white shadow-md' : 'text-gray-400 hover:bg-bg-main hover:text-light'}`}>
                    <i className="fas fa-chart-line w-5 text-center"></i> Visão Geral
                </button>
                
                <div className="h-px bg-border-color my-1 mx-2"></div>
                <h3 className="text-gray-400 text-xs font-bold uppercase my-2 px-2">Custos</h3>

                <button onClick={() => setViewMode('fixedCosts')} className={`w-full text-left px-4 py-3 rounded-lg font-semibold text-sm transition-all flex items-center gap-3 ${viewMode === 'fixedCosts' ? 'bg-red-600 text-white shadow-md' : 'text-gray-400 hover:bg-bg-main hover:text-light'}`}>
                    <i className="fas fa-building w-5 text-center"></i> Custos Fixos
                </button>
                <button onClick={() => setViewMode('variableCosts')} className={`w-full text-left px-4 py-3 rounded-lg font-semibold text-sm transition-all flex items-center gap-3 ${viewMode === 'variableCosts' ? 'bg-orange-600 text-white shadow-md' : 'text-gray-400 hover:bg-bg-main hover:text-light'}`}>
                    <i className="fas fa-gas-pump w-5 text-center"></i> Custos Variáveis
                </button>
                
                <div className="h-px bg-border-color my-1 mx-2"></div>
                <h3 className="text-gray-400 text-xs font-bold uppercase my-2 px-2">Entradas</h3>

                <button onClick={() => setViewMode('revenues')} className={`w-full text-left px-4 py-3 rounded-lg font-semibold text-sm transition-all flex items-center gap-3 ${viewMode === 'revenues' ? 'bg-green-600 text-white shadow-md' : 'text-gray-400 hover:bg-bg-main hover:text-light'}`}>
                    <i className="fas fa-hand-holding-usd w-5 text-center"></i> Receitas
                </button>
                <button onClick={() => setViewMode('receivables')} className={`w-full text-left px-4 py-3 rounded-lg font-semibold text-sm transition-all flex items-center gap-3 ${viewMode === 'receivables' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-bg-main hover:text-light'}`}>
                    <i className="fas fa-file-invoice-dollar w-5 text-center"></i> Contas a Receber
                </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col gap-6 min-w-0">
                 {/* Filter Bar */}
                <div className="bg-bg-card rounded-lg p-4 shadow-sm border border-border-color flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex-1 w-full relative">
                        <input
                            type="text"
                            placeholder="Pesquisar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-bg-main border border-border-color rounded-md py-2 pl-10 pr-4 text-light focus:outline-none focus:ring-2 focus:ring-secondary"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i className="fas fa-search text-gray-text"></i>
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
                        <div className="flex items-center gap-2">
                            <label className="text-xs text-gray-text font-bold uppercase">De:</label>
                            <input 
                                type="date" 
                                value={startDate} 
                                onChange={(e) => setStartDate(e.target.value)} 
                                className="bg-bg-main border border-border-color rounded-md p-2 text-sm text-light focus:outline-none focus:border-secondary"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-xs text-gray-text font-bold uppercase">Até:</label>
                            <input 
                                type="date" 
                                value={endDate} 
                                onChange={(e) => setEndDate(e.target.value)} 
                                className="bg-bg-main border border-border-color rounded-md p-2 text-sm text-light focus:outline-none focus:border-secondary"
                            />
                        </div>
                        <select 
                            value={categoryFilter} 
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="bg-bg-main border border-border-color rounded-md p-2 text-sm text-light focus:outline-none focus:border-secondary min-w-[150px]"
                        >
                            <option value="">Todas Categorias</option>
                            {availableCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                        {(searchTerm || startDate || endDate || categoryFilter) && (
                            <button 
                                onClick={() => { setSearchTerm(''); setStartDate(''); setEndDate(''); setCategoryFilter(''); }}
                                className="text-red-400 hover:text-red-300 text-sm font-semibold px-2"
                            >
                                Limpar
                            </button>
                        )}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1">
                    {viewMode === 'overview' && (
                        <div className="space-y-8 animate-fade-in">
                            {layout.map(id => (
                                <DraggableWrapper 
                                    key={id} 
                                    id={id}
                                    isDraggable={isLayoutMode}
                                    onDragStart={handleDragStart}
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                    onDragEnd={handleDragEnd}
                                >
                                    {componentsMap[id as keyof typeof componentsMap]}
                                </DraggableWrapper>
                            ))}
                        </div>
                    )}

                    {viewMode === 'fixedCosts' && renderTable('fixedCosts', filteredFixedCosts, 'Custos Fixos Detalhados', 'custos_fixos.csv')}
                    {viewMode === 'variableCosts' && renderTable('variableCosts', filteredVariableCosts, 'Custos Variáveis Detalhados', 'custos_variaveis.csv')}
                    {viewMode === 'revenues' && renderTable('revenues', filteredRevenues, 'Receitas (Faturamento)', 'receitas.csv')}
                    {viewMode === 'receivables' && renderTable('receivables', filteredReceivables, 'Contas a Receber (Previsto)', 'recebiveis.csv')}
                </div>
            </div>
        </div>
    );
};

export default Transactions;
