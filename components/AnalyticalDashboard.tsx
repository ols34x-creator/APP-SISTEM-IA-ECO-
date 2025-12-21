
import React, { useMemo, useState } from 'react';
import { useAppStore } from '../hooks/useAppStore';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const AnalyticalDashboard: React.FC = () => {
    const { financialData } = useAppStore();
    const [selectedDate, setSelectedDate] = useState(new Date());

    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    // --- Data Processing ---

    // 1. Monthly Overview (For Bar Chart - Last 6 Months)
    const monthlyOverviewData = useMemo(() => {
        const labels: string[] = [];
        const revenuesData: number[] = [];
        const fixedCostsData: number[] = [];
        const variableCostsData: number[] = [];

        for (let i = 5; i >= 0; i--) {
            const d = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - i, 1);
            const month = d.getMonth();
            const year = d.getFullYear();
            labels.push(`${monthNames[month].substring(0, 3)}/${year}`);

            const rev = financialData.revenues.filter(r => { 
                const rd = new Date(r.date); return rd.getMonth() === month && rd.getFullYear() === year; 
            }).reduce((acc, curr) => acc + curr.value, 0);

            const fixed = financialData.fixedCosts.filter(c => { 
                const cd = new Date(c.date); return cd.getMonth() === month && cd.getFullYear() === year; 
            }).reduce((acc, curr) => acc + curr.value, 0);

            const variable = financialData.variableCosts.filter(c => { 
                const cd = new Date(c.date); return cd.getMonth() === month && cd.getFullYear() === year; 
            }).reduce((acc, curr) => acc + curr.value, 0);

            revenuesData.push(rev);
            fixedCostsData.push(fixed);
            variableCostsData.push(variable);
        }

        return {
            labels,
            datasets: [
                { label: 'Receitas', data: revenuesData, backgroundColor: '#10B981', borderRadius: 4 },
                { label: 'Custos Fixos', data: fixedCostsData, backgroundColor: '#EF4444', borderRadius: 4 },
                { label: 'Custos Variáveis', data: variableCostsData, backgroundColor: '#F59E0B', borderRadius: 4 },
            ]
        };
    }, [financialData, selectedDate]);

    // 2. Specific Month Analysis
    const currentMonthStats = useMemo(() => {
        const month = selectedDate.getMonth();
        const year = selectedDate.getFullYear();

        const filterByMonth = (item: any) => {
            const d = new Date(item.date);
            return d.getMonth() === month && d.getFullYear() === year;
        };

        const revenues = financialData.revenues.filter(filterByMonth).reduce((acc, curr) => acc + curr.value, 0);
        const fixedCosts = financialData.fixedCosts.filter(filterByMonth).reduce((acc, curr) => acc + curr.value, 0);
        const variableCosts = financialData.variableCosts.filter(filterByMonth).reduce((acc, curr) => acc + curr.value, 0);
        const totalCosts = fixedCosts + variableCosts;
        const balance = revenues - totalCosts;

        // Category Breakdown for Pie Chart (Top Categories)
        const categoryMap: Record<string, number> = {};
        [...financialData.fixedCosts, ...financialData.variableCosts].filter(filterByMonth).forEach(item => {
            const cat = item.category || 'Outros';
            categoryMap[cat] = (categoryMap[cat] || 0) + item.value;
        });

        const sortedCategories = Object.entries(categoryMap)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5); // Top 5

        return {
            revenues,
            fixedCosts,
            variableCosts,
            totalCosts,
            balance,
            categoryLabels: sortedCategories.map(([k]) => k),
            categoryValues: sortedCategories.map(([, v]) => v)
        };
    }, [financialData, selectedDate]);

    // --- Navigation Handlers ---
    const handlePrevMonth = () => {
        setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));
    };

    // --- Chart Options ---
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { labels: { color: '#94A3B8' } },
            tooltip: {
                callbacks: {
                    label: function(context: any) {
                        let label = context.dataset.label || context.label || '';
                        if (label) label += ': ';
                        if (context.parsed.y !== null) label += formatCurrency(context.parsed.y);
                        else if (context.parsed !== null) label += formatCurrency(context.parsed);
                        return label;
                    }
                }
            }
        },
        scales: {
            x: { ticks: { color: '#94A3B8' }, grid: { color: '#334155' } },
            y: { ticks: { color: '#94A3B8', callback: (value: any) => `R$${value/1000}k` }, grid: { color: '#334155' } }
        }
    };

    const pieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'right' as const, labels: { color: '#94A3B8' } },
        }
    };

    return (
        <div className="space-y-6 pb-10 animate-fade-in">
            {/* Header / Date Controls */}
            <div className="bg-bg-card p-6 rounded-lg shadow-lg flex flex-col md:flex-row justify-between items-center border border-border-color">
                <div>
                    <h2 className="text-2xl font-bold text-light flex items-center gap-2">
                        <i className="fas fa-chart-pie text-secondary"></i> Dashboard Analítico
                    </h2>
                    <p className="text-gray-text text-sm">Visão consolidada de receitas e despesas.</p>
                </div>
                <div className="flex items-center gap-4 mt-4 md:mt-0 bg-bg-main p-2 rounded-lg border border-border-color">
                    <button onClick={handlePrevMonth} className="text-gray-400 hover:text-light transition-colors p-2"><i className="fas fa-chevron-left"></i></button>
                    <span className="text-light font-bold min-w-[150px] text-center capitalize">
                        {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                    </span>
                    <button onClick={handleNextMonth} className="text-gray-400 hover:text-light transition-colors p-2"><i className="fas fa-chevron-right"></i></button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-bg-card p-5 rounded-lg border-l-4 border-green-500 shadow-md">
                    <p className="text-sm font-semibold text-gray-400 uppercase">Receita Total</p>
                    <p className="text-2xl font-bold text-green-400">{formatCurrency(currentMonthStats.revenues)}</p>
                </div>
                <div className="bg-bg-card p-5 rounded-lg border-l-4 border-red-500 shadow-md">
                    <p className="text-sm font-semibold text-gray-400 uppercase">Custos Totais</p>
                    <p className="text-2xl font-bold text-red-400">{formatCurrency(currentMonthStats.totalCosts)}</p>
                    <div className="text-xs text-gray-500 mt-1 flex justify-between">
                        <span>Fixo: {formatCurrency(currentMonthStats.fixedCosts)}</span>
                        <span>Var: {formatCurrency(currentMonthStats.variableCosts)}</span>
                    </div>
                </div>
                <div className="bg-bg-card p-5 rounded-lg border-l-4 border-blue-500 shadow-md">
                    <p className="text-sm font-semibold text-gray-400 uppercase">Saldo Líquido</p>
                    <p className={`text-2xl font-bold ${currentMonthStats.balance >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                        {formatCurrency(currentMonthStats.balance)}
                    </p>
                </div>
                <div className="bg-bg-card p-5 rounded-lg border-l-4 border-yellow-500 shadow-md">
                    <p className="text-sm font-semibold text-gray-400 uppercase">Margem de Lucro</p>
                    <p className="text-2xl font-bold text-yellow-400">
                        {currentMonthStats.revenues > 0 
                            ? ((currentMonthStats.balance / currentMonthStats.revenues) * 100).toFixed(1) 
                            : '0.0'}%
                    </p>
                </div>
            </div>

            {/* Main Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Cash Flow Chart (Bar) */}
                <div className="lg:col-span-2 bg-bg-card p-6 rounded-lg shadow-lg border border-border-color">
                    <h3 className="text-lg font-bold text-light mb-4">Fluxo de Caixa (Últimos 6 Meses)</h3>
                    <div className="h-80">
                        <Bar options={commonOptions as any} data={monthlyOverviewData} />
                    </div>
                </div>

                {/* Cost Distribution (Doughnut) */}
                <div className="bg-bg-card p-6 rounded-lg shadow-lg border border-border-color flex flex-col">
                    <h3 className="text-lg font-bold text-light mb-4">Distribuição de Custos ({monthNames[selectedDate.getMonth()]})</h3>
                    <div className="flex-grow relative min-h-[250px] flex items-center justify-center">
                        {currentMonthStats.totalCosts > 0 ? (
                            <Doughnut 
                                data={{
                                    labels: ['Fixos', 'Variáveis'],
                                    datasets: [{
                                        data: [currentMonthStats.fixedCosts, currentMonthStats.variableCosts],
                                        backgroundColor: ['#EF4444', '#F59E0B'],
                                        borderColor: '#1E293B',
                                        borderWidth: 2
                                    }]
                                }} 
                                options={{
                                    ...pieOptions,
                                    cutout: '70%',
                                    plugins: { legend: { position: 'bottom', labels: { color: '#94A3B8' } } }
                                }}
                            />
                        ) : (
                            <p className="text-gray-500 italic">Sem custos registrados neste mês.</p>
                        )}
                        {currentMonthStats.totalCosts > 0 && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="text-center">
                                    <p className="text-xs text-gray-400">Total</p>
                                    <p className="text-sm font-bold text-light">{formatCurrency(currentMonthStats.totalCosts)}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Row: Top Expenses */}
            <div className="bg-bg-card p-6 rounded-lg shadow-lg border border-border-color">
                <h3 className="text-lg font-bold text-light mb-4">Top 5 Categorias de Custo ({monthNames[selectedDate.getMonth()]})</h3>
                {currentMonthStats.categoryValues.length > 0 ? (
                    <div className="h-64">
                         <Bar 
                            options={{
                                indexAxis: 'y' as const,
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                                scales: {
                                    x: { grid: { color: '#334155' }, ticks: { color: '#94A3B8', callback: (val) => `R$${Number(val)/1000}k` } },
                                    y: { grid: { display: false }, ticks: { color: '#F1F5F9' } }
                                }
                            }} 
                            data={{
                                labels: currentMonthStats.categoryLabels,
                                datasets: [{
                                    label: 'Valor',
                                    data: currentMonthStats.categoryValues,
                                    backgroundColor: ['#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#F43F5E'],
                                    borderRadius: 4,
                                    barThickness: 20
                                }]
                            }} 
                        />
                    </div>
                ) : (
                     <div className="h-32 flex items-center justify-center text-gray-500 italic">
                        Nenhum dado de categoria disponível.
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalyticalDashboard;
    