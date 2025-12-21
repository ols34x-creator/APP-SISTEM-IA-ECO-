
import React, { useMemo, useState, useEffect } from 'react';
import { useAppStore } from '../hooks/useAppStore';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

interface FiscalTask {
    id: string;
    name: string;
    deadlineDay: number;
    status: 'pending' | 'done' | 'late';
}

interface AccountingDemand {
    id: string;
    description: string;
    status: 'open' | 'closed';
    date: string;
}

const initialTasks: FiscalTask[] = [
    { id: 'das', name: 'DAS (Simples Nacional)', deadlineDay: 20, status: 'pending' },
    { id: 'dctf', name: 'DCTFWeb', deadlineDay: 15, status: 'pending' },
    { id: 'fgts', name: 'FGTS Digital', deadlineDay: 20, status: 'pending' },
    { id: 'reinf', name: 'EFD Reinf', deadlineDay: 15, status: 'done' },
    { id: 'iss', name: 'ISS (Municipal)', deadlineDay: 10, status: 'late' },
];

const KpiCard: React.FC<{ title: string; value: string; icon: string; color: string; subValue?: string }> = ({ title, value, icon, color, subValue }) => (
    <div className={`bg-bg-main rounded-lg p-5 shadow-lg border-l-4 ${color} flex items-center justify-between`}>
        <div>
            <p className="text-sm font-medium text-gray-text">{title}</p>
            <p className="text-2xl font-bold text-light mt-1">{value}</p>
            {subValue && <p className="text-xs text-gray-500 mt-1">{subValue}</p>}
        </div>
        <div className={`text-3xl opacity-20 ${color.replace('border-', 'text-')}`}>
            <i className={`fas ${icon}`}></i>
        </div>
    </div>
);

const AdvncContabil: React.FC = () => {
    const { financialData, companySettings } = useAppStore();
    
    // State for Fiscal Tasks
    const [fiscalTasks, setFiscalTasks] = useState<FiscalTask[]>(initialTasks);
    
    // State for Accounting Demands
    const [demands, setDemands] = useState<AccountingDemand[]>([]);
    const [newDemandText, setNewDemandText] = useState('');

    // State for Simulation
    const [simulatedTaxRate, setSimulatedTaxRate] = useState(companySettings.defaultTaxRate);

    useEffect(() => {
        const savedTasks = localStorage.getItem('ecolog-fiscal-tasks');
        if (savedTasks) setFiscalTasks(JSON.parse(savedTasks));

        const savedDemands = localStorage.getItem('ecolog-accounting-demands');
        if (savedDemands) setDemands(JSON.parse(savedDemands));
        
        setSimulatedTaxRate(companySettings.defaultTaxRate);
    }, [companySettings.defaultTaxRate]);

    useEffect(() => {
        localStorage.setItem('ecolog-fiscal-tasks', JSON.stringify(fiscalTasks));
    }, [fiscalTasks]);

    useEffect(() => {
        localStorage.setItem('ecolog-accounting-demands', JSON.stringify(demands));
    }, [demands]);

    const accountingData = useMemo(() => {
        const totalRevenue = financialData.revenues.reduce((sum, r) => sum + r.value, 0);
        const totalExpenses = [...financialData.fixedCosts, ...financialData.variableCosts].reduce((sum, c) => sum + c.value, 0);
        
        // Dynamic calculation based on simulator or setting
        const taxRate = simulatedTaxRate / 100; 
        const estimatedTaxes = totalRevenue * taxRate;
        
        const grossProfit = totalRevenue - totalExpenses;
        const netProfit = grossProfit - estimatedTaxes;
        
        const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

        return { totalRevenue, totalExpenses, estimatedTaxes, grossProfit, netProfit, profitMargin };
    }, [financialData, simulatedTaxRate]);

    const toggleTaskStatus = (id: string) => {
        setFiscalTasks(prev => prev.map(t => {
            if (t.id === id) {
                const nextStatus = t.status === 'pending' ? 'done' : t.status === 'done' ? 'late' : 'pending';
                return { ...t, status: nextStatus };
            }
            return t;
        }));
    };

    const handleAddDemand = () => {
        if (!newDemandText.trim()) return;
        const newDemand: AccountingDemand = {
            id: Date.now().toString(),
            description: newDemandText,
            status: 'open',
            date: new Date().toLocaleDateString('pt-BR')
        };
        setDemands(prev => [newDemand, ...prev]);
        setNewDemandText('');
    };

    const toggleDemandStatus = (id: string) => {
        setDemands(prev => prev.map(d => d.id === id ? { ...d, status: d.status === 'open' ? 'closed' : 'open' } : d));
    };

    const deleteDemand = (id: string) => {
        setDemands(prev => prev.filter(d => d.id !== id));
    };

    const dreData = {
        labels: ['Receita Bruta', '(-) Impostos', '(=) Receita Líquida', '(-) Custos', '(=) Resultado'],
        datasets: [
            {
                label: 'Valores (R$)',
                data: [
                    accountingData.totalRevenue, 
                    accountingData.estimatedTaxes, 
                    accountingData.totalRevenue - accountingData.estimatedTaxes, 
                    accountingData.totalExpenses, 
                    accountingData.netProfit
                ],
                backgroundColor: [
                    '#22c55e', // Green
                    '#ef4444', // Red
                    '#3b82f6', // Blue
                    '#f59e0b', // Orange
                    accountingData.netProfit >= 0 ? '#10b981' : '#dc2626' // Result
                ],
            },
        ],
    };

    const getStatusBadge = (status: string) => {
        switch(status) {
            case 'done': return <span className="text-xs bg-green-900 text-green-200 px-2 py-1 rounded border border-green-700">Enviado/Pago</span>;
            case 'late': return <span className="text-xs bg-red-900 text-red-200 px-2 py-1 rounded border border-red-700">Atrasado</span>;
            default: return <span className="text-xs bg-yellow-900 text-yellow-200 px-2 py-1 rounded border border-yellow-700">Pendente</span>;
        }
    };

    return (
        <div className="space-y-6 pb-10">
            <div className="flex flex-col md:flex-row justify-between items-center bg-bg-card p-6 rounded-lg shadow-lg">
                <div>
                    <h2 className="text-2xl font-bold text-light flex items-center gap-3">
                        <i className="fas fa-book-open text-primary"></i> ADVNC | Painel Contábil
                    </h2>
                    <p className="text-gray-text text-sm mt-1">Visão consolidada para contabilidade e gestão fiscal.</p>
                </div>
                <div className="text-right mt-4 md:mt-0 bg-bg-main p-3 rounded-lg border border-border-color">
                    <p className="text-xs text-gray-text font-semibold">REGIME TRIBUTÁRIO</p>
                    <p className="text-light font-bold text-lg">{companySettings.taxRegime}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard 
                    title="Receita Bruta (Período)" 
                    value={formatCurrency(accountingData.totalRevenue)} 
                    icon="fa-coins" 
                    color="border-green-500" 
                />
                <KpiCard 
                    title="Impostos Estimados" 
                    value={formatCurrency(accountingData.estimatedTaxes)} 
                    subValue={`Simulação: ${simulatedTaxRate}%`}
                    icon="fa-file-invoice-dollar" 
                    color="border-red-500" 
                />
                <KpiCard 
                    title="Custos & Despesas" 
                    value={formatCurrency(accountingData.totalExpenses)} 
                    icon="fa-chart-pie" 
                    color="border-orange-500" 
                />
                <KpiCard 
                    title="Resultado Líquido" 
                    value={formatCurrency(accountingData.netProfit)} 
                    subValue={`Margem: ${accountingData.profitMargin.toFixed(1)}%`}
                    icon="fa-balance-scale" 
                    color={accountingData.netProfit >= 0 ? "border-blue-500" : "border-red-600"} 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* DRE Chart */}
                <div className="lg:col-span-2 bg-bg-card p-6 rounded-lg shadow-lg border border-border-color">
                    <div className="flex justify-between items-center mb-4 border-b border-border-color pb-2">
                        <h3 className="text-lg font-bold text-light">DRE Gerencial (Dinâmico)</h3>
                        <div className="flex items-center gap-2 bg-bg-main px-3 py-1 rounded border border-border-color">
                            <label className="text-xs text-gray-400">Simular Alíquota:</label>
                            <input 
                                type="number" 
                                value={simulatedTaxRate} 
                                onChange={(e) => setSimulatedTaxRate(Number(e.target.value))}
                                className="w-12 bg-transparent text-light text-right font-bold text-sm outline-none border-b border-gray-500 focus:border-primary"
                            />
                            <span className="text-sm text-gray-400">%</span>
                        </div>
                    </div>
                    <div className="h-80">
                        <Bar 
                            data={dreData} 
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                indexAxis: 'y',
                                plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => formatCurrency(ctx.raw as number) } } },
                                scales: { x: { grid: { color: '#334155' }, ticks: { color: '#94a3b8' } }, y: { grid: { display: false }, ticks: { color: '#f1f5f9' } } }
                            }} 
                        />
                    </div>
                </div>

                {/* Fiscal Obligations */}
                <div className="bg-bg-card p-6 rounded-lg shadow-lg border border-border-color flex flex-col">
                    <h3 className="text-lg font-bold text-light mb-4 border-b border-border-color pb-2">
                        <i className="fas fa-calendar-check mr-2 text-secondary"></i> Obrigações Fiscais
                    </h3>
                    <div className="space-y-2 flex-grow overflow-y-auto max-h-[300px] pr-1 custom-scrollbar">
                        {fiscalTasks.map(task => (
                            <div 
                                key={task.id} 
                                onClick={() => toggleTaskStatus(task.id)}
                                className="flex items-center justify-between p-3 bg-bg-main rounded border border-border-color hover:border-secondary cursor-pointer transition-all"
                            >
                                <div>
                                    <p className="text-sm font-semibold text-light">{task.name}</p>
                                    <p className="text-xs text-gray-500">Vencimento dia {task.deadlineDay}</p>
                                </div>
                                <div>{getStatusBadge(task.status)}</div>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-4 text-center">Clique no item para alterar o status</p>
                </div>
            </div>

            {/* Accounting Demands */}
            <div className="bg-bg-card p-6 rounded-lg shadow-lg border border-border-color">
                <h3 className="text-lg font-bold text-light mb-4 border-b border-border-color pb-2">
                    <i className="fas fa-tasks mr-2 text-primary"></i> Demandas & Solicitações ao Contador
                </h3>
                
                <div className="flex gap-2 mb-6">
                    <input 
                        type="text" 
                        value={newDemandText}
                        onChange={(e) => setNewDemandText(e.target.value)}
                        placeholder="Nova solicitação (ex: Gerar balancete, Enviar folha de pagamento...)"
                        className="flex-1 bg-bg-main border border-border-color rounded p-2 text-light focus:border-primary outline-none"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddDemand()}
                    />
                    <button onClick={handleAddDemand} className="bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded font-bold transition-colors">
                        <i className="fas fa-plus"></i>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {demands.length === 0 && <p className="text-gray-500 text-sm col-span-2 text-center py-4">Nenhuma demanda pendente.</p>}
                    
                    {demands.map(demand => (
                        <div key={demand.id} className={`p-3 rounded border flex justify-between items-start transition-all ${demand.status === 'closed' ? 'bg-bg-main/50 border-border-color opacity-60' : 'bg-bg-main border-l-4 border-l-secondary border-y-border-color border-r-border-color'}`}>
                            <div className="flex items-start gap-3">
                                <button 
                                    onClick={() => toggleDemandStatus(demand.id)}
                                    className={`mt-1 w-5 h-5 rounded border flex items-center justify-center ${demand.status === 'closed' ? 'bg-green-600 border-green-600 text-white' : 'border-gray-500 text-transparent hover:border-secondary'}`}
                                >
                                    <i className="fas fa-check text-xs"></i>
                                </button>
                                <div>
                                    <p className={`text-sm font-medium ${demand.status === 'closed' ? 'text-gray-500 line-through' : 'text-light'}`}>{demand.description}</p>
                                    <p className="text-xs text-gray-600">{demand.date}</p>
                                </div>
                            </div>
                            <button onClick={() => deleteDemand(demand.id)} className="text-gray-600 hover:text-red-500 transition-colors">
                                <i className="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdvncContabil;
