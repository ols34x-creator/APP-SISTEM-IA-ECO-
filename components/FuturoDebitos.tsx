
import React, { useMemo } from 'react';
import { useAppStore } from '../hooks/useAppStore';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const FuturoDebitos: React.FC = () => {
    const { financialData, calendarEvents } = useAppStore();

    const analysis = useMemo(() => {
        // Entradas Futuras: Recebíveis pendentes
        const totalReceivables = financialData.receivables
            .filter(r => r.status === 'pending')
            .reduce((sum, r) => sum + r.value, 0);

        // Saídas Futuras: Calendário Operacional pendente
        const totalScheduledDebts = calendarEvents
            .filter(e => e.status === 'pending')
            .reduce((sum, e) => sum + e.value, 0);

        const netBalance = totalReceivables - totalScheduledDebts;
        const isHealthy = netBalance >= 0;

        return { totalReceivables, totalScheduledDebts, netBalance, isHealthy };
    }, [financialData.receivables, calendarEvents]);

    const chartData = {
        labels: ['Futuro Financeiro'],
        datasets: [
            {
                label: 'Recebíveis (Entradas)',
                data: [analysis.totalReceivables],
                backgroundColor: 'rgba(34, 197, 94, 0.7)',
                borderRadius: 8,
            },
            {
                label: 'Débitos Agendados (Saídas)',
                data: [analysis.totalScheduledDebts],
                backgroundColor: 'rgba(239, 68, 68, 0.7)',
                borderRadius: 8,
            }
        ]
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-bg-card p-8 rounded-3xl border border-border-color/50 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <i className="fas fa-balance-scale text-[120px] text-primary"></i>
                </div>
                
                <div className="relative z-10">
                    <h2 className="text-3xl font-black text-light tracking-tight mb-2">Futuro x Débitos</h2>
                    <p className="text-gray-text text-lg max-w-2xl mb-8">Análise de previsibilidade: O que está por vir vs. compromissos assumidos.</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        <div className="bg-bg-main p-6 rounded-2xl border border-success/30 shadow-lg">
                            <p className="text-[10px] font-black uppercase tracking-widest text-success mb-2">A Receber (Pendentes)</p>
                            <p className="text-3xl font-black text-light">{formatCurrency(analysis.totalReceivables)}</p>
                            <div className="mt-4 h-1 w-full bg-success/20 rounded-full overflow-hidden">
                                <div className="h-full bg-success w-full animate-pulse"></div>
                            </div>
                        </div>

                        <div className="bg-bg-main p-6 rounded-2xl border border-danger/30 shadow-lg">
                            <p className="text-[10px] font-black uppercase tracking-widest text-danger mb-2">A Pagar (Agendados)</p>
                            <p className="text-3xl font-black text-light">{formatCurrency(analysis.totalScheduledDebts)}</p>
                            <div className="mt-4 h-1 w-full bg-danger/20 rounded-full overflow-hidden">
                                <div className="h-full bg-danger w-full animate-pulse"></div>
                            </div>
                        </div>

                        <div className={`p-6 rounded-2xl border shadow-lg transition-all ${analysis.isHealthy ? 'bg-primary/10 border-primary/30' : 'bg-danger/10 border-danger/30'}`}>
                            <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${analysis.isHealthy ? 'text-primary' : 'text-danger'}`}>Balanço Líquido Previsto</p>
                            <p className={`text-3xl font-black ${analysis.isHealthy ? 'text-primary' : 'text-danger'}`}>{formatCurrency(analysis.netBalance)}</p>
                            <p className="text-[10px] text-gray-500 font-bold mt-3 italic">
                                {analysis.isHealthy ? 'Fluxo de caixa positivo projetado.' : 'Atenção: Necessário aporte ou renegociação.'}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-bg-main/50 p-6 rounded-2xl border border-border-color/40 h-[400px]">
                            <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                                <i className="fas fa-chart-bar text-secondary"></i> Comparativo de Volume
                            </h3>
                            <Bar 
                                data={chartData} 
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: { legend: { display: false } },
                                    scales: {
                                        y: { grid: { color: '#334155' }, ticks: { color: '#94A3B8' } },
                                        x: { grid: { display: false }, ticks: { color: '#94A3B8' } }
                                    }
                                }} 
                            />
                        </div>

                        <div className="bg-bg-main/50 p-6 rounded-2xl border border-border-color/40 flex flex-col h-[400px]">
                            <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                                <i className="fas fa-list-ul text-warning"></i> Próximos Eventos Críticos
                            </h3>
                            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                                {financialData.receivables.filter(r => r.status === 'pending').slice(0, 3).map(r => (
                                    <div key={r.id} className="bg-bg-card p-4 rounded-xl border border-border-color/50 flex justify-between items-center group hover:border-success/40 transition-all">
                                        <div>
                                            <p className="text-xs font-bold text-success uppercase tracking-widest">Entrada</p>
                                            <p className="text-sm font-black text-light truncate max-w-[200px]">{r.client}</p>
                                        </div>
                                        <p className="font-bold text-light">{formatCurrency(r.value)}</p>
                                    </div>
                                ))}
                                {calendarEvents.filter(e => e.status === 'pending').slice(0, 3).map(e => (
                                    <div key={e.id} className="bg-bg-card p-4 rounded-xl border border-border-color/50 flex justify-between items-center group hover:border-danger/40 transition-all">
                                        <div>
                                            <p className="text-xs font-bold text-danger uppercase tracking-widest">Saída</p>
                                            <p className="text-sm font-black text-light truncate max-w-[200px]">{e.description}</p>
                                        </div>
                                        <p className="font-bold text-light">{formatCurrency(e.value)}</p>
                                    </div>
                                ))}
                                {analysis.totalReceivables === 0 && analysis.totalScheduledDebts === 0 && (
                                    <p className="text-center text-gray-600 italic py-10">Sem movimentações futuras pendentes.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FuturoDebitos;
