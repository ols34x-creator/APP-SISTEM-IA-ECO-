
import React, { useMemo, useState, useEffect } from 'react';
import { useAppStore } from '../hooks/useAppStore';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const Reports: React.FC = () => {
    const { financialData } = useAppStore();
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

    const summaryData = useMemo(() => {
        const totalRevenue = financialData.revenues.reduce((sum, item) => sum + item.value, 0);
        const totalFixedCosts = financialData.fixedCosts.reduce((sum, item) => sum + item.value, 0);
        const totalVariableCosts = financialData.variableCosts.reduce((sum, item) => sum + item.value, 0);
        const netProfit = totalRevenue - totalFixedCosts - totalVariableCosts;
        const totalExpenses = totalFixedCosts + totalVariableCosts;

        return [
            { category: 'Receita Total', value: totalRevenue, percentage: totalRevenue > 0 ? 100 : 0, change: '...' },
            { category: 'Custos Fixos', value: totalFixedCosts, percentage: totalExpenses > 0 ? (totalFixedCosts / totalExpenses * 100) : 0, change: '...' },
            { category: 'Custos Variáveis', value: totalVariableCosts, percentage: totalExpenses > 0 ? (totalVariableCosts / totalExpenses * 100) : 0, change: '...' },
            { category: 'Lucro Líquido', value: netProfit, percentage: totalRevenue > 0 ? (netProfit / totalRevenue * 100) : 0, change: '...' }
        ];
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
        }

        return { labels, monthlyRevenues, monthlyExpenses };
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

    return (
        <div className="space-y-5">
            <div className="bg-bg-card rounded-lg p-5 shadow-lg">
                <h3 className="text-lg font-semibold text-light mb-4">Resumo Financeiro</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-text">
                        <thead className="text-xs text-gray-400 uppercase bg-gray-700">
                            <tr>
                                <th className="px-6 py-3">Categoria</th>
                                <th className="px-6 py-3">Valor</th>
                                <th className="px-6 py-3">% do Total</th>
                                <th className="px-6 py-3">Variação</th>
                            </tr>
                        </thead>
                        <tbody>
                            {summaryData.map(item => (
                                <tr key={item.category} className="bg-bg-card border-b border-border-color">
                                    <td className="px-6 py-4 font-medium text-light">{item.category}</td>
                                    <td className="px-6 py-4">{formatCurrency(item.value)}</td>
                                    <td className="px-6 py-4">{item.percentage.toFixed(1)}%</td>
                                    <td className="px-6 py-4 text-success">{item.change}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-bg-card rounded-lg p-5 shadow-lg">
                <h3 className="text-lg font-semibold text-light mb-4">Atualizações Portuárias</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-bg-main border border-border-color rounded p-4">
                        <h4 className="text-sm text-gray-text mb-1">Dólar (USD)</h4>
                        <p className="text-2xl font-bold text-light">{dolar}</p>
                    </div>
                    <div className="bg-bg-main border border-border-color rounded p-4">
                        <h4 className="text-sm text-gray-text mb-1">Pedágio (Exemplo)</h4>
                        <p className="text-2xl font-bold text-light">R$ 18,50</p>
                    </div>
                    <div className="bg-bg-main border border-border-color rounded p-4">
                        <h4 className="text-sm text-gray-text mb-1">Imposto (Exemplo)</h4>
                        <p className="text-2xl font-bold text-light">17%</p>
                    </div>
                    <div className="bg-bg-main border border-border-color rounded p-4">
                        <h4 className="text-sm text-gray-text mb-1">Notícias</h4>
                        <a href="#" className="text-secondary hover:underline block mt-2 text-sm">Porto do Rio de Janeiro anuncia nova dragagem...</a>
                    </div>
                </div>
            </div>
            
            <div className="bg-bg-card rounded-lg p-5 shadow-lg">
                <h3 className="text-lg font-semibold text-light mb-4">Receita vs Despesas (Últimos 6 Meses)</h3>
                <div className="h-72 w-full">
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
            </div>

            <div className="bg-bg-card rounded-lg p-5 shadow-lg">
                <h3 className="text-lg font-semibold text-light mb-4">Margem por Cliente</h3>
                <div className="h-72 w-full">
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
            </div>
        </div>
    );
};

export default Reports;