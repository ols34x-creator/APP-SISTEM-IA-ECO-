import React, { useMemo } from 'react';
import { useAppStore } from '../hooks/useAppStore';
import { CalendarEvent } from '../types';

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Date(date.getTime() + date.getTimezoneOffset() * 60000).toLocaleDateString('pt-BR');
};

const KpiCard: React.FC<{ title: string; value: string | number; icon: string; color: string; }> = ({ title, value, icon, color }) => (
    <div className={`bg-trade-secondary p-5 rounded-lg shadow-lg border-l-4 ${color}`}>
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-400 font-medium">{title}</p>
                <p className="text-3xl font-bold text-light">{value}</p>
            </div>
            <div className="text-4xl opacity-30">
                <i className={`fas ${icon}`}></i>
            </div>
        </div>
    </div>
);


const OperationalReport: React.FC = () => {
    const { calendarEvents } = useAppStore();

    const reportData = useMemo(() => {
        const totalEvents = calendarEvents.length;
        const pendingEvents = calendarEvents.filter(e => e.status === 'pending');
        const completedEvents = calendarEvents.filter(e => e.status === 'completed');

        const totalPendingValue = pendingEvents.reduce((sum, event) => sum + event.value, 0);
        const totalCompletedValue = completedEvents.reduce((sum, event) => sum + event.value, 0);
        
        return {
            totalEvents,
            pendingCount: pendingEvents.length,
            completedCount: completedEvents.length,
            totalPendingValue,
            totalCompletedValue
        };
    }, [calendarEvents]);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold mb-4"><i className="fas fa-chart-pie mr-2"></i>Resumo do Calendário Operacional</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <KpiCard title="Total de Contas" value={reportData.totalEvents} icon="fa-calendar-alt" color="border-primary" />
                    <KpiCard title="Contas Pendentes" value={reportData.pendingCount} icon="fa-hourglass-half" color="border-warning" />
                    <KpiCard title="Contas Concluídas" value={reportData.completedCount} icon="fa-check-circle" color="border-success" />
                    <KpiCard title="Valor Total Pendente" value={formatCurrency(reportData.totalPendingValue)} icon="fa-dollar-sign" color="border-warning" />
                    <KpiCard title="Valor Total Concluído" value={formatCurrency(reportData.totalCompletedValue)} icon="fa-hand-holding-usd" color="border-success" />
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-3">Todas as Contas Registradas</h3>
                <div className="bg-trade-secondary p-4 rounded-lg overflow-x-auto max-h-[400px]">
                    {calendarEvents.length > 0 ? (
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-400 uppercase bg-gray-700/50 sticky top-0">
                                <tr>
                                    <th className="px-4 py-3">Descrição</th>
                                    <th className="px-4 py-3">Data de Vencimento</th>
                                    <th className="px-4 py-3">Valor</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Data de Conclusão</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {calendarEvents.map(event => (
                                    <tr key={event.id} className="hover:bg-gray-700/30">
                                        <td className="px-4 py-3 font-medium">{event.description}</td>
                                        <td className="px-4 py-3">{formatDate(event.dueDate)}</td>
                                        <td className="px-4 py-3">{formatCurrency(event.value)}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${event.status === 'completed' ? 'bg-green-500/20 text-success' : 'bg-yellow-500/20 text-warning'}`}>
                                                {event.status === 'completed' ? 'Concluído' : 'Pendente'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">{formatDate(event.completionDate)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-center text-gray-400 py-4">Nenhum evento no calendário para exibir.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OperationalReport;