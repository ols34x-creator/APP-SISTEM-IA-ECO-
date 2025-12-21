
import React, { useMemo, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Bar, Doughnut, Chart } from 'react-chartjs-2';
import { useAppStore } from '../hooks/useAppStore';
import { CalendarEvent, RecordType, FinancialRecord, RevenueRecord, ReceivableRecord, Demand, Vehicle, MaintenanceTask } from '../types';
import { useLanguage } from '../hooks/useLanguage';
import DraggableWrapper from './DraggableWrapper';


ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const isRecordInvalid = (item: FinancialRecord | RevenueRecord | ReceivableRecord, type: RecordType): boolean => {
    if (!item.name || !item.description || item.value == null || !item.category) return true;
    switch (type) {
        case 'fixedCosts': case 'variableCosts': return !(item as FinancialRecord).date;
        case 'revenues': return !(item as RevenueRecord).date || !(item as RevenueRecord).client;
        case 'receivables': return !(item as ReceivableRecord).dueDate || !(item as ReceivableRecord).client;
        default: return false;
    }
};

const isDemandInvalid = (demand: Demand): boolean => {
    return !demand.client || !demand.service || !demand.prazo || !demand.responsavel;
};

const AlertsPanel = () => {
    const { financialData, calendarEvents, completeCalendarEvent, demands, fleetData, maintenanceTasks } = useAppStore();
    const { t } = useLanguage();
    const [modalState, setModalState] = useState<{isOpen: boolean; event: CalendarEvent | null; justification: string}>({
        isOpen: false,
        event: null,
        justification: ''
    });

    const alerts = useMemo(() => {
        const generatedAlerts = [];
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        // 1. Upcoming Payments
        const fiveDaysFromNow = new Date(now);
        fiveDaysFromNow.setDate(now.getDate() + 5);
        
        const upcomingPayments = calendarEvents.filter(e => {
            const dueDate = new Date(e.dueDate);
            return e.status === 'pending' && dueDate >= now && dueDate <= fiveDaysFromNow;
        });

        upcomingPayments.forEach(event => {
            generatedAlerts.push({
                id: `payment-${event.id}`,
                type: 'warning',
                icon: 'fa-file-invoice-dollar',
                title: 'Vencimento Próximo',
                message: `A conta "${event.description}" no valor de ${formatCurrency(event.value)} vence em ${new Date(event.dueDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}.`,
                action: () => setModalState({ isOpen: true, event, justification: '' }),
                actionLabel: 'Pagar'
            });
        });
        
        const { totalRevenue, totalFixedCosts, totalVariableCosts, netProfit } = {
            totalRevenue: financialData.revenues.reduce((sum, item) => sum + item.value, 0),
            totalFixedCosts: financialData.fixedCosts.reduce((sum, item) => sum + item.value, 0),
            totalVariableCosts: financialData.variableCosts.reduce((sum, item) => sum + item.value, 0),
            get netProfit() { return this.totalRevenue - this.totalFixedCosts - this.totalVariableCosts }
        };

        // 2. High Cost
        const allCosts = [...financialData.fixedCosts, ...financialData.variableCosts];
        const highCostThreshold = totalRevenue * 0.25; // An expense is "high" if it's > 25% of total revenue
        const highCostItems = allCosts.filter(c => c.value > highCostThreshold && totalRevenue > 0);
        if (highCostItems.length > 0) {
            generatedAlerts.push({
                id: 'high-cost',
                type: 'danger',
                icon: 'fa-chart-line',
                title: 'Alerta de Alto Custo',
                message: `Detectado ${highCostItems.length} custo(s) (${highCostItems.map(c => c.description).join(', ')}) com valor elevado (>25% da receita).`
            });
        }
        
        // 3. Incomplete Data (Financial)
        const allRecords = [
            ...financialData.fixedCosts.map(r => ({ ...r, type: 'fixedCosts' as RecordType })),
            ...financialData.variableCosts.map(r => ({ ...r, type: 'variableCosts' as RecordType })),
            ...financialData.revenues.map(r => ({ ...r, type: 'revenues' as RecordType })),
            ...financialData.receivables.map(r => ({ ...r, type: 'receivables' as RecordType })),
        ];

        const incompleteRecords = allRecords.filter(r => isRecordInvalid(r, r.type) || !r.attachment);
        if (incompleteRecords.length > 0) {
            const recordNames = incompleteRecords.map(r => r.name || `ID ${r.id}`).slice(0, 3).join(', ');
            const additionalCount = incompleteRecords.length > 3 ? ` e mais ${incompleteRecords.length - 3}` : '';
            
            generatedAlerts.push({
                id: 'incomplete-data',
                type: 'info',
                icon: 'fa-clipboard-list',
                title: 'Dados Pendentes',
                message: `${incompleteRecords.length} registros precisam de revisão (Campos ou anexos faltando). Ex: ${recordNames}${additionalCount}.`
            });
        }
        
        // 4. Costs exceed revenue
        if (netProfit < 0) {
            generatedAlerts.push({
                id: 'negative-balance',
                type: 'danger',
                icon: 'fa-balance-scale-right',
                title: 'Balanço Negativo',
                message: `O total de custos (${formatCurrency(totalFixedCosts + totalVariableCosts)}) superou a receita (${formatCurrency(totalRevenue)}). Atenção imediata necessária.`
            });
        }

        // 5. Incomplete Demands
        const incompleteDemands = demands.filter(isDemandInvalid);
        if(incompleteDemands.length > 0) {
             generatedAlerts.push({
                id: 'incomplete-demands',
                type: 'info',
                icon: 'fa-tasks',
                title: 'Demandas Incompletas',
                message: `Existem ${incompleteDemands.length} demandas com dados obrigatórios faltando (prazo, responsável, etc).`
            });
        }
        
        // 6. Demands nearing deadline
        const demandsNearDeadline = demands.filter(d => {
            if (!d.prazo || d.status === 'concluido') return false;
            const deadline = new Date(d.prazo);
            const daysDiff = (deadline.getTime() - now.getTime()) / (1000 * 3600 * 24);
            return daysDiff > 0 && daysDiff <= 3;
        });

        if (demandsNearDeadline.length > 0) {
             generatedAlerts.push({
                id: 'demands-deadline',
                type: 'warning',
                icon: 'fa-hourglass-half',
                title: 'Prazos Expirando',
                message: `${demandsNearDeadline.length} demandas estão a menos de 3 dias do prazo final.`
            });
        }

        // 7. Overdue Maintenance
        const overdueMaintenance = maintenanceTasks.filter(task => {
            if (task.status !== 'Agendada') return false;
            const taskDate = new Date(task.date + 'T00:00:00');
            return taskDate < now;
        });

        if (overdueMaintenance.length > 0) {
            const vehicle = fleetData.find(v => v.id === overdueMaintenance[0].vehicleId);
             generatedAlerts.push({
                id: 'overdue-maintenance',
                type: 'danger',
                icon: 'fa-tools',
                title: 'Manutenção Vencida',
                message: `${overdueMaintenance.length} tarefa(s) de manutenção atrasadas. Ex: ${overdueMaintenance[0].serviceType} para ${vehicle?.plate || 'veículo'}.`
            });
        }

        return generatedAlerts;
    }, [financialData, calendarEvents, completeCalendarEvent, demands, fleetData, maintenanceTasks]);

    const handleCompleteEvent = () => {
        if (modalState.event && modalState.justification.trim()) {
            completeCalendarEvent(modalState.event.id, modalState.justification);
            setModalState({ isOpen: false, event: null, justification: '' });
        } else {
            alert("Por favor, forneça uma justificativa.");
        }
    };

    if (alerts.length === 0) return null;
    
    const alertStyles = {
        danger: { wrapper: 'bg-red-500/5 border-red-500', iconBg: 'text-red-500', title: 'text-red-400' },
        warning: { wrapper: 'bg-yellow-500/5 border-yellow-500', iconBg: 'text-yellow-500', title: 'text-yellow-400' },
        info: { wrapper: 'bg-blue-500/5 border-blue-500', iconBg: 'text-blue-500', title: 'text-blue-400' }
    };

    return (
        <>
            <div className="bg-bg-card rounded-xl p-6 shadow-lg mb-6 border border-border-color/50">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-xl font-bold text-light flex items-center gap-3">
                        <div className="relative">
                            <i className="fas fa-bell text-secondary"></i>
                            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                        </div>
                        {t('biAlertsPanel')}
                    </h3>
                    <span className="bg-bg-main px-3 py-1 rounded-full text-xs font-bold text-gray-text border border-border-color">
                        {alerts.length} Alertas Ativos
                    </span>
                </div>
                
                <div className="space-y-4">
                    {alerts.map(alert => {
                        const style = alertStyles[alert.type as keyof typeof alertStyles];
                        return (
                            <div key={alert.id} className={`relative overflow-hidden rounded-lg border-l-4 p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:bg-bg-main/50 ${style.wrapper}`}>
                                <div className="flex items-start gap-4">
                                    {/* Icon Wrapper */}
                                    <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-bg-card shadow-sm border border-border-color/50 ${style.iconBg}`}>
                                        <i className={`fas ${alert.icon} text-xl`}></i>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <h4 className={`text-sm font-bold uppercase tracking-wide mb-1 ${style.title}`}>
                                            {alert.title}
                                        </h4>
                                        <p className="text-sm text-gray-300 leading-relaxed">
                                            {alert.message}
                                        </p>
                                    </div>

                                    {/* Action Button */}
                                    {alert.action && (
                                        <div className="flex flex-col justify-center self-center">
                                            <button
                                                onClick={alert.action}
                                                className="group flex items-center gap-2 rounded-full bg-bg-card px-5 py-2 text-xs font-bold text-light shadow-sm border border-border-color transition-all hover:bg-secondary hover:text-white hover:border-secondary whitespace-nowrap"
                                            >
                                                {alert.actionLabel}
                                                <i className="fas fa-arrow-right transition-transform group-hover:translate-x-1"></i>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Modal for Resolving Alerts */}
            {modalState.isOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-bg-card rounded-xl p-6 shadow-2xl w-full max-w-md border border-border-color">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-light">Resolver Pendência</h3>
                            <button onClick={() => setModalState({ isOpen: false, event: null, justification: '' })} className="text-gray-400 hover:text-light">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        
                        <div className="bg-bg-main p-4 rounded-lg mb-4 border border-border-color">
                            <p className="text-gray-400 text-xs uppercase font-bold mb-1">Item</p>
                            <p className="font-semibold text-light text-lg mb-2">{modalState.event?.description}</p>
                            <div className="flex justify-between items-center border-t border-border-color pt-2 mt-2">
                                <span className="text-sm text-gray-400">Valor</span>
                                <span className="font-bold text-success text-lg">{formatCurrency(modalState.event?.value ?? 0)}</span>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="justification" className="block text-sm font-bold text-gray-300 mb-2">Justificativa / Comprovante</label>
                            <textarea
                                id="justification"
                                value={modalState.justification}
                                onChange={(e) => setModalState(s => ({ ...s, justification: e.target.value }))}
                                className="w-full bg-bg-main border border-border-color rounded-lg p-3 text-sm text-light focus:outline-none focus:ring-2 focus:ring-secondary min-h-[100px]"
                                placeholder="Ex: Pagamento efetuado via PIX (Comprovante #123)..."
                            />
                        </div>
                        
                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={() => setModalState({ isOpen: false, event: null, justification: '' })} className="px-4 py-2 text-gray-400 font-semibold hover:text-light transition-colors">Cancelar</button>
                            <button onClick={handleCompleteEvent} className="px-6 py-2 bg-success text-white font-bold rounded-lg hover:bg-green-600 shadow-lg transition-all transform hover:-translate-y-0.5">
                                <i className="fas fa-check mr-2"></i> Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

const KpiCard: React.FC<{ title: string; value: string | number; change?: string; changeType?: 'positive' | 'negative'; icon: string; iconBg: string; borderColor: string; }> = ({ title, value, change, changeType, icon, iconBg, borderColor }) => (
    <div className={`bg-bg-main rounded-lg p-5 shadow-md border-l-4 ${borderColor} transform hover:-translate-y-1 transition-transform duration-300 h-full flex flex-col justify-between`}>
        <div>
            <div className="flex justify-between items-center mb-3">
                <div className="text-sm font-semibold text-gray-text">{title}</div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl text-white shadow-sm ${iconBg}`}>{icon}</div>
            </div>
            <div className="text-3xl font-bold text-light mb-1">{value}</div>
        </div>
        {change && changeType && (
            <div className={`text-xs flex items-center gap-1 mt-2 font-medium ${changeType === 'positive' ? 'text-success' : 'text-danger'}`}>
                <span>{changeType === 'positive' ? '↑' : '↓'}</span>
                <span>{change}% vs mês anterior</span>
            </div>
        )}
    </div>
);


const ChartCard: React.FC<{ title: string; children: React.ReactNode; actions?: React.ReactNode; }> = ({ title, children, actions }) => (
    <div className="bg-bg-card rounded-lg p-6 shadow-lg h-full flex flex-col border border-border-color/50">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-light flex items-center gap-2">
                <span className="w-1 h-6 bg-secondary rounded-full"></span>
                {title}
            </h3>
            <div>{actions}</div>
        </div>
        <div className="h-96 w-full flex-grow relative">{children}</div>
    </div>
);

const Dashboard: React.FC = () => {
    const { financialData, fleetData, maintenanceTasks, demands, isLayoutMode, layouts, setLayouts, activeTab } = useAppStore();
    const { t } = useLanguage();
    const [draggedId, setDraggedId] = useState<string | null>(null);
    
    const pageId = activeTab;
    const initialLayout = useMemo(() => ['alerts', 'financialSummary', 'operationalSummary', 'cashFlowDistribution', 'revenueByClient', 'fleetMaintenance'], []);
    const layout = useMemo(() => layouts[pageId] || initialLayout, [layouts, pageId, initialLayout]);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
        setDraggedId(id);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', id);
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
        e.dataTransfer.dropEffect = 'move';
    };


    const kpiValues = useMemo(() => {
        const totalRevenue = financialData.revenues.reduce((sum, item) => sum + item.value, 0);
        const totalFixedCosts = financialData.fixedCosts.reduce((sum, item) => sum + item.value, 0);
        const totalVariableCosts = financialData.variableCosts.reduce((sum, item) => sum + item.value, 0);
        const totalReceivables = financialData.receivables.filter(item => item.status === 'pending').reduce((sum, item) => sum + item.value, 0);
        const netProfit = totalRevenue - totalFixedCosts - totalVariableCosts;
        
        const operationalVehicles = fleetData.filter(v => v.status === 'Operacional').length;
        const maintenanceNow = fleetData.filter(v => v.status === 'Em Manutenção').length;
        const scheduledMaintenance = maintenanceTasks.filter(t => t.status === 'Agendada').length;
        const openDemands = demands.filter(d => d.status !== 'concluido').length;
        
        return { 
            totalRevenue, totalFixedCosts, totalVariableCosts, totalReceivables, netProfit,
            operationalVehicles, maintenanceNow, scheduledMaintenance, openDemands
        };
    }, [financialData, fleetData, maintenanceTasks, demands]);

    const chartData = useMemo(() => {
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
            
            const revenue = financialData.revenues.filter(r => { const d = new Date(r.date); return d.getMonth() === month && d.getFullYear() === year; }).reduce((s, i) => s + i.value, 0);
            const expense = [...financialData.fixedCosts, ...financialData.variableCosts].filter(c => { const d = new Date(c.date); return d.getMonth() === month && d.getFullYear() === year; }).reduce((s, i) => s + i.value, 0);

            monthlyRevenues.push(revenue);
            monthlyExpenses.push(expense);
        }

        const costDistribution: { [key: string]: number } = {};
        [...financialData.fixedCosts, ...financialData.variableCosts].forEach(item => {
            const category = item.category.split(':')[0] || 'Outros';
            costDistribution[category] = (costDistribution[category] || 0) + item.value;
        });

        const monthlyNetProfit = monthlyRevenues.map((r, i) => r - monthlyExpenses[i]);

        return {
            labels,
            monthlyRevenues,
            monthlyExpenses,
            monthlyNetProfit,
            costDistribution,
        };
    }, [financialData]);

    const fleetChartData = useMemo(() => {
        const fleetStatusCounts = {
            'Operacional': 0,
            'Em Manutenção': 0,
            'Inativo': 0,
        };
        fleetData.forEach(v => {
            fleetStatusCounts[v.status]++;
        });

        const maintenanceCostByVehicle: { [key: string]: number } = {};
        maintenanceTasks.forEach(task => {
            const vehicle = fleetData.find(v => v.id === task.vehicleId);
            if (vehicle) {
                const plate = vehicle.plate;
                maintenanceCostByVehicle[plate] = (maintenanceCostByVehicle[plate] || 0) + task.cost;
            }
        });

        return {
            fleetStatusLabels: Object.keys(fleetStatusCounts),
            fleetStatusData: Object.values(fleetStatusCounts),
            maintenanceCostLabels: Object.keys(maintenanceCostByVehicle),
            maintenanceCostData: Object.values(maintenanceCostByVehicle),
        };
    }, [fleetData, maintenanceTasks]);
    
    const clientRevenueData = useMemo(() => {
        const clientRevenue: { [key: string]: number } = {};
        financialData.revenues.forEach(item => {
            const client = item.client || 'Cliente não identificado';
            clientRevenue[client] = (clientRevenue[client] || 0) + item.value;
        });

        // Sorting from largest to smallest revenue
        const sortedClients = Object.entries(clientRevenue).sort(([, a], [, b]) => b - a);

        return {
            labels: sortedClients.map(([client]) => client),
            data: sortedClients.map(([, revenue]) => revenue),
        };
    }, [financialData]);

    const commonChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#94A3B8', font: { size: 12 } } } },
        scales: { 
            x: { ticks: { color: '#94A3B8', font: { size: 11 } }, grid: { color: '#334155' } }, 
            y: { ticks: { color: '#94A3B8', callback: (value: any) => `R$${value/1000}k`, font: { size: 11 } }, grid: { color: '#334155' } } 
        }
    };

    const componentsMap = useMemo(() => ({
        alerts: <AlertsPanel />,
        financialSummary: (
            <div className="bg-bg-card rounded-lg p-6 shadow-lg border border-border-color/50">
                <h3 className="text-xl font-bold text-light mb-6 flex items-center"><i className="fas fa-dollar-sign mr-3 text-primary p-2 bg-primary/10 rounded-lg"></i> {t('financialSummaryPanel')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                    <KpiCard title={t('totalRevenue')} value={formatCurrency(kpiValues.totalRevenue)} change="12" changeType="positive" icon="💰" iconBg="bg-success/80" borderColor="border-success" />
                    <KpiCard title={t('fixedCosts')} value={formatCurrency(kpiValues.totalFixedCosts)} change="5" changeType="negative" icon="🏢" iconBg="bg-danger/80" borderColor="border-danger" />
                    <KpiCard title={t('variableCosts')} value={formatCurrency(kpiValues.totalVariableCosts)} change="8" changeType="positive" icon="⛽" iconBg="bg-warning/80" borderColor="border-warning" />
                    <KpiCard title={t('netProfit')} value={formatCurrency(kpiValues.netProfit)} change="15" changeType="positive" icon="📈" iconBg="bg-secondary/80" borderColor="border-secondary" />
                    <KpiCard title={t('receivables')} value={formatCurrency(kpiValues.totalReceivables)} change="3" changeType="negative" icon="📋" iconBg="bg-primary/80" borderColor="border-primary" />
                </div>
            </div>
        ),
        operationalSummary: (
            <div className="bg-bg-card rounded-lg p-6 shadow-lg border border-border-color/50">
                <h3 className="text-xl font-bold text-light mb-6 flex items-center"><i className="fas fa-cogs mr-3 text-primary p-2 bg-primary/10 rounded-lg"></i> {t('operationalSummaryPanel')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <KpiCard title={t('operationalVehicles')} value={kpiValues.operationalVehicles} icon="🚚" iconBg="bg-success/80" borderColor="border-success" />
                    <KpiCard title={t('inMaintenance')} value={kpiValues.maintenanceNow} icon="🛠️" iconBg="bg-warning/80" borderColor="border-warning" />
                    <KpiCard title={t('scheduledMaintenance')} value={kpiValues.scheduledMaintenance} icon="📅" iconBg="bg-blue-500/80" borderColor="border-blue-400" />
                    <KpiCard title={t('openDemands')} value={kpiValues.openDemands} icon="📂" iconBg="bg-purple-500/80" borderColor="border-purple-400" />
                </div>
            </div>
        ),
        cashFlowDistribution: (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div>
                    <ChartCard title="Receita, Despesas e Lucro Mensal" actions={<select className="bg-bg-main border border-border-color rounded p-1 text-xs"><option>Últimos 6 meses</option></select>}>
                        <Chart type='bar' options={commonChartOptions as any} data={{
                            labels: chartData.labels,
                            datasets: [
                                {
                                    type: 'bar' as const,
                                    label: 'Receitas',
                                    data: chartData.monthlyRevenues,
                                    backgroundColor: 'rgba(var(--color-success-val), 0.7)',
                                    borderRadius: 4,
                                },
                                {
                                    type: 'bar' as const,
                                    label: 'Despesas',
                                    data: chartData.monthlyExpenses,
                                    backgroundColor: 'rgba(var(--color-danger-val), 0.7)',
                                    borderRadius: 4,
                                },
                                {
                                    type: 'line' as const,
                                    label: 'Lucro Líquido',
                                    data: chartData.monthlyNetProfit,
                                    borderColor: 'rgb(var(--color-secondary-val))',
                                    backgroundColor: 'rgba(var(--color-secondary-val), 0.5)',
                                    borderWidth: 3,
                                    fill: false,
                                    tension: 0.4,
                                    pointRadius: 4,
                                    pointHoverRadius: 6,
                                    pointBackgroundColor: 'rgb(var(--color-secondary-val))'
                                }
                            ]
                        }} />
                    </ChartCard>
                </div>
                <div>
                     <ChartCard title={t('costDistribution')} actions={<select className="bg-bg-main border border-border-color rounded p-1 text-xs"><option>Mês Atual</option></select>}>
                        <Doughnut options={{...commonChartOptions, scales: undefined, plugins: { legend: { position: 'right', labels: { color: 'rgb(var(--color-gray-text-val))', font: { size: 13 } } } }}} data={{
                            labels: Object.keys(chartData.costDistribution),
                            datasets: [{
                                data: Object.values(chartData.costDistribution),
                                backgroundColor: ['#06B6D4', '#14B8A6', '#FBBF24', '#F87171', '#8B5CF6', '#EC4899'],
                                borderColor: 'rgb(var(--color-bg-card-val))',
                                borderWidth: 3,
                            }]
                        }} />
                    </ChartCard>
                </div>
            </div>
        ),
        revenueByClient: (
            <ChartCard title="Ranking de Receita por Cliente">
                <Bar
                    options={{
                        ...commonChartOptions,
                        indexAxis: 'y', // Makes the chart horizontal for better readability of client names
                        plugins: {
                            legend: {
                                display: false
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        let label = context.dataset.label || '';
                                        if (label) {
                                            label += ': ';
                                        }
                                        if (context.parsed.x !== null) {
                                            label += formatCurrency(context.parsed.x);
                                        }
                                        return label;
                                    }
                                }
                            }
                        },
                        scales: {
                            x: {
                                ticks: { color: '#94A3B8', callback: (value: any) => `R$${value/1000}k` }, 
                                grid: { color: '#334155' } 
                            },
                            y: {
                                ticks: { color: '#94A3B8' }, 
                                grid: { color: 'transparent' }
                            }
                        }
                    }}
                    data={{
                        labels: clientRevenueData.labels,
                        datasets: [{
                            label: 'Receita Total',
                            data: clientRevenueData.data,
                            backgroundColor: 'rgba(var(--color-primary-val), 0.7)',
                            borderColor: 'rgb(var(--color-primary-val))',
                            borderWidth: 1,
                            borderRadius: 4,
                        }]
                    }}
                />
            </ChartCard>
        ),
        fleetMaintenance: (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title={t('fleetStatus')}>
                    <Bar 
                        options={{...commonChartOptions, scales: { x: commonChartOptions.scales.x, y: {...commonChartOptions.scales.y, ticks: { color: 'rgb(var(--color-gray-text-val))', stepSize: 1 } } }}} 
                        data={{
                            labels: fleetChartData.fleetStatusLabels,
                            datasets: [{
                                label: 'Nº de Veículos',
                                data: fleetChartData.fleetStatusData,
                                backgroundColor: ['rgb(var(--color-success-val))', 'rgb(var(--color-warning-val))', 'rgb(var(--color-danger-val))'],
                                borderRadius: 4,
                            }]
                        }} 
                    />
                </ChartCard>
                <ChartCard title={t('maintenanceCostsPerVehicle')}>
                    <Doughnut 
                        options={{...commonChartOptions, scales: undefined, plugins: { legend: { position: 'right', labels: { color: 'rgb(var(--color-gray-text-val))', font: { size: 13 } } } }}} 
                        data={{
                            labels: fleetChartData.maintenanceCostLabels,
                            datasets: [{
                                data: fleetChartData.maintenanceCostData,
                                backgroundColor: ['#3B82F6', '#14B8A6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'],
                                borderColor: 'rgb(var(--color-bg-card-val))',
                                borderWidth: 3,
                            }]
                        }} 
                    />
                </ChartCard>
            </div>
        )
    }), [kpiValues, chartData, fleetChartData, t, commonChartOptions, clientRevenueData]);


    return (
        <div className="space-y-8">
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
    );
};

export default Dashboard;
