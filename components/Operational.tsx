
import React, { useState, useMemo } from 'react';
import { useAppStore } from '../hooks/useAppStore';
import { CalendarEvent, FinancialRecord } from '../types';
import { useLanguage } from '../hooks/useLanguage';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Date(date.getTime() + date.getTimezoneOffset() * 60000).toLocaleDateString('pt-BR');
};

const handlePrintForm = (title: string, content: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert("Não foi possível abrir a janela de impressão. Por favor, desative o bloqueador de pop-ups.");
        return;
    }
    printWindow.document.write(`
        <html>
            <head>
                <title>${title}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; font-size: 12pt; color: #333; }
                    .form-container { max-width: 680px; margin: auto; }
                    h3, h4 { margin-top: 20px; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px; text-align: center; }
                    h4 { text-align: left; font-size: 1.1em; }
                    p { margin: 8px 0; }
                    .field { display: inline-block; border-bottom: 1px solid #333; min-width: 200px; padding: 0 5px; font-weight: bold; }
                    .textarea-content {
                        border: 1px solid #ccc;
                        padding: 10px;
                        min-height: 80px;
                        margin-top: 5px;
                        white-space: pre-wrap;
                        word-wrap: break-word;
                    }
                    .declaration { margin-top: 30px; font-style: italic; font-size: 11pt; text-align: justify; }
                    .signature-line { margin-top: 60px; text-align: center; }
                    .signature-line p { margin: 0; }
                </style>
            </head>
            <body>
                <main class="form-container">
                    ${content}
                </main>
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(function() { window.close(); }, 150);
                    }
                <\/script>
            </body>
        </html>
    `);
    printWindow.document.close();
};


export const ReimbursementForm = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        role: '',
        employeeId: '',
        requestDate: new Date().toISOString().split('T')[0],
        expenseType: 'Alimentação',
        otherExpenseType: '',
        expenseDate: '',
        amount: '',
        location: '',
        justification: '',
        description: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    }

    const generateAndPrint = () => {
        const expenseTypeDisplay = formData.expenseType === 'Outros' ? `Outros: ${formData.otherExpenseType}` : formData.expenseType;
        const printContent = `
            <h3>FORMULÁRIO DE JUSTIFICATIVA DE REEMBOLSO SEM COMPROVANTE</h3>
            
            <h4>1. IDENTIFICAÇÃO DO SOLICITANTE</h4>
            <p><strong>Nome completo:</strong> <span class="field">${formData.fullName || '&nbsp;'}</span></p>
            <p><strong>Cargo / Setor:</strong> <span class="field">${formData.role || '&nbsp;'}</span></p>
            <p><strong>Matrícula / ID:</strong> <span class="field">${formData.employeeId || '&nbsp;'}</span></p>
            <p><strong>Data da solicitação:</strong> <span class="field">${formData.requestDate ? new Date(formData.requestDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : '&nbsp;'}</span></p>

            <h4>2. DETALHAMENTO DO REEMBOLSO</h4>
            <p><strong>Tipo de despesa:</strong> <span class="field">${expenseTypeDisplay || '&nbsp;'}</span></p>
            <p><strong>Data da despesa:</strong> <span class="field">${formData.expenseDate ? new Date(formData.expenseDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : '&nbsp;'}</span></p>
            <p><strong>Valor solicitado:</strong> <span class="field">R$ ${formData.amount || '&nbsp;'}</span></p>
            <p><strong>Local / cidade:</strong> <span class="field">${formData.location || '&nbsp;'}</span></p>

            <h4>3. JUSTIFICATIVA DA AUSÊNCIA DE COMPROVANTE</h4>
            <div class="textarea-content">${formData.justification.replace(/\n/g, '<br />') || 'Nenhuma justificativa fornecida.'}</div>
            
            <h4>4. DESCRIÇÃO DA DESPESA E CONTEXTO</h4>
            <div class="textarea-content">${formData.description.replace(/\n/g, '<br />') || 'Nenhuma descrição fornecida.'}</div>

            <h4>5. DECLARAÇÃO DO SOLICITANTE</h4>
            <p class="declaration">
                Declaro, sob minha responsabilidade, que as informações prestadas neste formulário são verdadeiras e correspondem a despesas efetivamente realizadas em função do serviço.
                Estou ciente de que a falsidade das informações poderá implicar em sanções disciplinares e/ou legais.
            </p>

            <div class="signature-line">
                <p>___________________________________________</p>
                <p>Assinatura do solicitante</p>
            </div>
             <p style="text-align: center; margin-top: 20px;"><strong>Data:</strong> ____ / ____ / ______</p>
        `;
        handlePrintForm("Justificativa de Reembolso", printContent);
    };

    return (
        <div>
             <h2 className="text-xl font-bold mb-4 text-light"><i className="fas fa-file-signature mr-2 text-primary"></i> Formulário de Justificativa de Reembolso</h2>
             <div className="bg-bg-card p-5 rounded-lg space-y-6 border border-border-color">
                <fieldset className="border border-border-color p-4 rounded-md">
                    <legend className="px-2 font-semibold text-secondary">1. IDENTIFICAÇÃO DO SOLICITANTE</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <input className="form-input" name="fullName" placeholder="Nome completo" value={formData.fullName} onChange={handleChange} />
                        <input className="form-input" name="role" placeholder="Cargo / Setor" value={formData.role} onChange={handleChange} />
                        <input className="form-input" name="employeeId" placeholder="Matrícula / ID" value={formData.employeeId} onChange={handleChange} />
                        <input className="form-input" name="requestDate" type="date" value={formData.requestDate} onChange={handleChange} />
                    </div>
                </fieldset>
                
                <fieldset className="border border-border-color p-4 rounded-md">
                    <legend className="px-2 font-semibold text-secondary">2. DETALHAMENTO DO REEMBOLSO</legend>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                         <select className="form-select" name="expenseType" value={formData.expenseType} onChange={handleChange}>
                             <option>Alimentação</option>
                             <option>Transporte</option>
                             <option>Hospedagem</option>
                             <option>Outros</option>
                         </select>
                         {formData.expenseType === 'Outros' && <input className="form-input" name="otherExpenseType" placeholder="Especifique o tipo" value={formData.otherExpenseType} onChange={handleChange} />}
                         <input className="form-input" name="expenseDate" type="date" value={formData.expenseDate} onChange={handleChange} />
                         <input className="form-input" name="amount" type="number" placeholder="Valor solicitado R$" value={formData.amount} onChange={handleChange} />
                         <input className="form-input" name="location" placeholder="Local / Cidade" value={formData.location} onChange={handleChange} />
                    </div>
                </fieldset>

                <fieldset className="border border-border-color p-4 rounded-md">
                    <legend className="px-2 font-semibold text-secondary">3. JUSTIFICATIVA DA AUSÊNCIA DE COMPROVANTE</legend>
                    <textarea className="form-input w-full mt-2" name="justification" rows={4} placeholder="Descreva o motivo..." value={formData.justification} onChange={handleChange}></textarea>
                </fieldset>
                
                <fieldset className="border border-border-color p-4 rounded-md">
                    <legend className="px-2 font-semibold text-secondary">4. DESCRIÇÃO DA DESPESA E CONTEXTO</legend>
                    <textarea className="form-input w-full mt-2" name="description" rows={4} placeholder="Explique o serviço ou despesa e o contexto..." value={formData.description} onChange={handleChange}></textarea>
                </fieldset>

                 <button onClick={generateAndPrint} className="w-full px-4 py-3 bg-secondary text-white font-bold rounded-md hover:bg-opacity-90 flex items-center justify-center gap-2 transition-transform duration-200 hover:scale-105 shadow-md hover:shadow-lg">
                    <i className="fas fa-print"></i> GERAR PDF / IMPRIMIR
                 </button>
             </div>
             <style>{`
                .form-group { display: flex; flex-direction: column; }
                .form-input, .form-select {
                    padding: 0.6rem;
                    border: 1px solid #374151;
                    border-radius: 0.375rem;
                    font-size: 1rem;
                    background-color: #111827;
                    color: #f9fafb;
                    width: 100%;
                }
                .form-input:focus, .form-select:focus {
                    outline: none; border-color: #20b8a6;
                }
            `}</style>
        </div>
    );
};


export const AccountDelayReport = () => {
    const { calendarEvents } = useAppStore();
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const delayedAccounts = useMemo(() => calendarEvents.filter(event => {
        if (event.status !== 'pending') return false;
        const dueDate = new Date(event.dueDate);
        // Ensure timezone doesn't shift the date
        const utcDueDate = new Date(dueDate.getUTCFullYear(), dueDate.getUTCMonth(), dueDate.getUTCDate());
        const utcNow = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
        
        return utcDueDate.getMonth() === currentMonth && 
               utcDueDate.getFullYear() === currentYear &&
               utcNow > utcDueDate;
    }), [calendarEvents, currentMonth, currentYear]);

    return (
        <div>
            <h2 className="text-xl font-bold mb-4 text-light"><i className="fas fa-file-invoice-dollar mr-2 text-warning"></i> Relatório de Atrasos de Contas - {new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(now)}</h2>
            <div className="bg-bg-card p-4 rounded-lg overflow-x-auto border border-border-color">
                {delayedAccounts.length > 0 ? (
                    <table className="w-full text-sm text-left text-gray-text">
                        <thead className="text-xs text-gray-400 uppercase bg-bg-main">
                            <tr>
                                <th className="px-4 py-3">Descrição</th>
                                <th className="px-4 py-3">Data de Vencimento</th>
                                <th className="px-4 py-3">Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {delayedAccounts.map(event => (
                                <tr key={event.id} className="border-b border-border-color hover:bg-bg-main/50">
                                    <td className="px-4 py-3 font-medium text-light">{event.description}</td>
                                    <td className="px-4 py-3 text-red-400 font-semibold">{formatDate(event.dueDate)}</td>
                                    <td className="px-4 py-3">{formatCurrency(event.value)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-center text-gray-400 py-4">Nenhuma conta em atraso para o mês atual.</p>
                )}
            </div>
        </div>
    );
};

export const InterestPaidReport = () => {
    const { calendarEvents } = useAppStore();
    const MOCK_INTEREST_RATE = 0.02; // 2%

    const latePayments = useMemo(() => calendarEvents.filter(event => 
        event.status === 'completed' &&
        event.completionDate &&
        new Date(event.completionDate) > new Date(event.dueDate)
    ), [calendarEvents]);

    const totalInterest = useMemo(() => latePayments.reduce((sum, event) => {
        return sum + (event.value * MOCK_INTEREST_RATE);
    }, 0), [latePayments]);

    return (
        <div>
            <h2 className="text-xl font-bold mb-4 text-light"><i className="fas fa-percent mr-2 text-danger"></i> Total de Juros Pagos por Atrasos</h2>
            <div className="bg-bg-card p-5 rounded-lg text-center mb-5 border border-border-color">
                <p className="text-gray-400">Valor Total Estimado de Juros Pagos</p>
                <p className="text-4xl font-bold text-red-500 my-2">{formatCurrency(totalInterest)}</p>
                <p className="text-xs text-gray-500">(Baseado em uma taxa simulada de {MOCK_INTEREST_RATE * 100}%)</p>
            </div>
            <div className="bg-bg-card p-4 rounded-lg overflow-x-auto border border-border-color">
                <h3 className="font-semibold mb-3 text-light">Detalhes dos Pagamentos em Atraso</h3>
                 {latePayments.length > 0 ? (
                    <table className="w-full text-sm text-left text-gray-text">
                        <thead className="text-xs text-gray-400 uppercase bg-bg-main">
                            <tr>
                                <th className="px-4 py-3">Descrição</th>
                                <th className="px-4 py-3">Vencimento</th>
                                <th className="px-4 py-3">Data do Pagamento</th>
                                <th className="px-4 py-3">Valor Original</th>
                                <th className="px-4 py-3">Juros Estimado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {latePayments.map(event => (
                                <tr key={event.id} className="border-b border-border-color hover:bg-bg-main/50">
                                    <td className="px-4 py-3 font-medium text-light">{event.description}</td>
                                    <td className="px-4 py-3">{formatDate(event.dueDate)}</td>
                                    <td className="px-4 py-3 font-semibold text-yellow-500">{formatDate(event.completionDate)}</td>
                                    <td className="px-4 py-3">{formatCurrency(event.value)}</td>
                                    <td className="px-4 py-3 text-red-400">{formatCurrency(event.value * MOCK_INTEREST_RATE)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-center text-gray-400 py-4">Nenhum pagamento com juros por atraso registrado.</p>
                )}
            </div>
        </div>
    );
};


export const OperationalCalendar = () => {
    const { calendarEvents, addCalendarEvent, updateCalendarEvent, completeCalendarEvent } = useAppStore();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [formState, setFormState] = useState({ description: '', value: '', dueDate: '', reminderMinutes: '' });
    const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
    const [justification, setJustification] = useState('');

    const { month, year, daysInMonth } = useMemo(() => {
        const month = currentDate.getMonth();
        const year = currentDate.getFullYear();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonthCount = new Date(year, month + 1, 0).getDate();
        
        const days = [];
        for (let i = 0; i < firstDay; i++) days.push({ key: `pad-${i}`, day: null });
        for (let i = 1; i <= daysInMonthCount; i++) days.push({ key: `day-${i}`, day: i });
        
        return { month, year, daysInMonth: days };
    }, [currentDate]);

    const changeMonth = (offset: number) => {
        setCurrentDate(new Date(year, month + offset, 1));
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formState.description && formState.value && formState.dueDate) {
            addCalendarEvent({
                description: formState.description,
                value: parseFloat(formState.value),
                dueDate: formState.dueDate,
                reminderMinutes: formState.reminderMinutes ? parseInt(formState.reminderMinutes, 10) : undefined
            });
            setFormState({ description: '', value: '', dueDate: '', reminderMinutes: '' });
        } else {
            alert('Por favor, preencha todos os campos obrigatórios.');
        }
    };
    
    const handleSaveEvent = () => {
        if (editingEvent) {
            updateCalendarEvent(editingEvent);
            setEditingEvent(null);
        }
    };

    const handleMarkAsPaid = () => {
        if (editingEvent && justification.trim()) {
            completeCalendarEvent(editingEvent.id, justification);
            setEditingEvent(null);
            setJustification('');
        } else {
            alert("Por favor, forneça uma justificativa para marcar como pago.");
        }
    };

    return (
        <div className="bg-bg-card p-5 rounded-lg shadow-lg border border-border-color">
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => changeMonth(-1)} className="px-3 py-1 rounded bg-bg-main hover:bg-border-color text-light"><i className="fas fa-chevron-left"></i></button>
                <h2 className="text-xl font-bold text-light">{new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(currentDate)}</h2>
                <button onClick={() => changeMonth(1)} className="px-3 py-1 rounded bg-bg-main hover:bg-border-color text-light"><i className="fas fa-chevron-right"></i></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center font-semibold text-gray-400 mb-2">
                <div>Dom</div><div>Seg</div><div>Ter</div><div>Qua</div><div>Qui</div><div>Sex</div><div>Sáb</div>
            </div>
            <div className="grid grid-cols-7 gap-1">
                {daysInMonth.map(d => {
                    const eventsForDay = d.day ? calendarEvents.filter(e => {
                        const eventDate = new Date(e.dueDate);
                        return eventDate.getUTCFullYear() === year &&
                               eventDate.getUTCMonth() === month &&
                               eventDate.getUTCDate() === d.day;
                    }) : [];
                    return (
                        <div key={d.key} className={`h-28 p-1.5 rounded bg-bg-main flex flex-col gap-1 overflow-hidden ${d.day ? 'border border-transparent hover:border-primary' : 'opacity-30'}`}>
                            <span className="font-bold text-gray-300">{d.day}</span>
                            <div className="overflow-y-auto space-y-1 custom-scrollbar">
                                {eventsForDay.map(event => (
                                    <div 
                                        key={event.id} 
                                        onClick={() => { setEditingEvent(event); setJustification(event.justification || ''); }}
                                        title={`${event.description} - ${formatCurrency(event.value)}`} 
                                        className={`text-[10px] p-1 rounded truncate cursor-pointer ${event.status === 'completed' ? 'bg-green-900/50 text-green-300 border-l-2 border-green-500' : 'bg-blue-900/50 text-blue-300 border-l-2 border-blue-500'}`}
                                    >
                                        {event.reminderMinutes && <i className="fas fa-bell mr-1"></i>}
                                        {event.description}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="mt-6 pt-4 border-t border-border-color">
                <h3 className="text-lg font-semibold mb-3 text-light">Cadastrar Conta ou Dívida</h3>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div className="form-group">
                        <label className="text-xs font-semibold text-gray-400 mb-1 block" htmlFor="op-description">Descrição</label>
                        <input className="form-input" type="text" id="op-description" name="description" value={formState.description} onChange={handleFormChange} required />
                    </div>
                     <div className="form-group">
                        <label className="text-xs font-semibold text-gray-400 mb-1 block" htmlFor="op-value">Valor (R$)</label>
                        <input className="form-input" type="number" id="op-value" name="value" step="0.01" min="0" value={formState.value} onChange={handleFormChange} required />
                    </div>
                     <div className="form-group">
                        <label className="text-xs font-semibold text-gray-400 mb-1 block" htmlFor="op-dueDate">Data de Vencimento</label>
                        <input className="form-input" type="date" id="op-dueDate" name="dueDate" value={formState.dueDate} onChange={handleFormChange} required />
                    </div>
                    <div className="form-group">
                        <label className="text-xs font-semibold text-gray-400 mb-1 block" htmlFor="op-reminder">Lembrete</label>
                        <select className="form-select" id="op-reminder" name="reminderMinutes" value={formState.reminderMinutes} onChange={handleFormChange}>
                            <option value="">Nenhum</option>
                            <option value="15">15 minutos antes</option>
                            <option value="60">1 hora antes</option>
                            <option value="1440">1 dia antes</option>
                            <option value="2880">2 dias antes</option>
                        </select>
                    </div>
                    <button type="submit" className="px-4 py-2 bg-primary text-white font-semibold rounded-md hover:bg-opacity-90 h-[42px] shadow-md hover:shadow-lg transition-shadow">Adicionar</button>
                </form>
            </div>
             {editingEvent && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-bg-card rounded-lg p-6 shadow-xl w-full max-w-md text-light border border-border-color">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">Gerenciar Evento</h3>
                            <button onClick={() => setEditingEvent(null)} className="text-gray-400 hover:text-white">&times;</button>
                        </div>

                        <div className="space-y-3 mb-6 bg-bg-main p-4 rounded border border-border-color">
                            <p><strong className="text-gray-text text-xs uppercase">Descrição:</strong><br/>{editingEvent.description}</p>
                            <p><strong className="text-gray-text text-xs uppercase">Valor:</strong><br/><span className="text-lg font-bold text-success">{formatCurrency(editingEvent.value)}</span></p>
                            <p><strong className="text-gray-text text-xs uppercase">Vencimento:</strong><br/>{formatDate(editingEvent.dueDate)}</p>
                            {editingEvent.status === 'completed' && (
                                <p className="bg-green-500/10 p-2 rounded border border-green-500/30 text-xs text-green-400">
                                    <i className="fas fa-check-circle mr-1"></i> Evento já concluído em {formatDate(editingEvent.completionDate)}
                                </p>
                            )}
                        </div>

                        {editingEvent.status === 'pending' ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 mb-2 block uppercase">Justificativa / Comprovante de Pagamento</label>
                                    <textarea 
                                        className="form-input min-h-[80px]" 
                                        value={justification}
                                        onChange={(e) => setJustification(e.target.value)}
                                        placeholder="Ex: Pagamento realizado via PIX..."
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={handleMarkAsPaid} className="flex-1 px-4 py-2 bg-success text-white font-bold rounded-md hover:bg-green-600 shadow-md transition-all flex items-center justify-center gap-2">
                                        <i className="fas fa-check-double"></i> Marcar como Pago
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <label className="text-xs font-bold text-gray-400 mb-2 block uppercase">Justificativa Registrada</label>
                                <div className="p-3 bg-bg-main rounded border border-border-color italic text-sm text-gray-300">
                                    {editingEvent.justification || "Nenhuma justificativa fornecida."}
                                </div>
                            </div>
                        )}

                        <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-border-color">
                            <button onClick={() => setEditingEvent(null)} className="px-4 py-2 bg-border-color text-light font-semibold rounded-md hover:bg-opacity-80">Fechar</button>
                            {editingEvent.status === 'pending' && (
                                <button onClick={handleSaveEvent} className="px-4 py-2 bg-primary text-white font-semibold rounded-md hover:bg-opacity-90">Salvar Alterações</button>
                            )}
                        </div>
                    </div>
                </div>
            )}
            <style>{`
                .form-input, .form-select {
                    padding: 0.5rem;
                    border: 1px solid #374151;
                    border-radius: 0.375rem;
                    font-size: 0.9rem;
                    background-color: #111827;
                    color: #f9fafb;
                    width: 100%;
                }
            `}</style>
        </div>
    );
};

export const OperationalCostRadar: React.FC = () => {
    const { financialData } = useAppStore();
    const [period, setPeriod] = useState<'month' | 'quarter' | 'semester' | 'year'>('month');

    // Define mapping for categorizing raw data into radar axes
    const categoryMap: Record<string, string> = {
        // Operational
        'Combustível': 'Operacional',
        'Pedágios': 'Operacional',
        'Mão de Obra': 'Operacional',
        'Frota': 'Frota',
        'Manutenção': 'Frota',
        // Infrastructure
        'Infra: aluguel': 'Infraestrutura',
        'Infra: energia': 'Infraestrutura',
        'Internet': 'Infraestrutura',
        // Taxes
        'Impostos': 'Impostos',
        'ICMS': 'Impostos',
        'ISS': 'Impostos',
        // Personnel
        'Pessoal: Salários': 'Pessoal',
        'Benefícios': 'Pessoal',
    };

    const getFilteredData = (offsetMonth: number = 0) => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        let startDate = new Date();
        let endDate = new Date();

        // Adjust timeframe based on selected period
        if (period === 'month') {
            startDate = new Date(currentYear, currentMonth - offsetMonth, 1);
            endDate = new Date(currentYear, currentMonth - offsetMonth + 1, 0);
        } else if (period === 'quarter') {
            // 3 months window
            startDate = new Date(currentYear, currentMonth - (3 * (offsetMonth + 1)) + 1, 1); // Simplified offset logic
            endDate = new Date(currentYear, currentMonth + 1, 0); // Always ending now for current period
            if (offsetMonth > 0) {
                 // Logic for previous quarter: just shift back 3 months
                 endDate = new Date(currentYear, currentMonth - 2, 0);
                 startDate = new Date(currentYear, currentMonth - 5, 1);
            }
        } else if (period === 'semester') {
             startDate = new Date(currentYear, currentMonth - 6, 1);
             if(offsetMonth > 0) {
                 endDate = new Date(currentYear, currentMonth - 6, 0);
                 startDate = new Date(currentYear, currentMonth - 12, 1);
             }
        } else {
            startDate = new Date(currentYear, 0, 1);
            if(offsetMonth > 0) {
                startDate = new Date(currentYear - 1, 0, 1);
                endDate = new Date(currentYear - 1, 11, 31);
            }
        }

        const allCosts = [...financialData.fixedCosts, ...financialData.variableCosts];
        
        const filteredCosts = allCosts.filter(item => {
            const itemDate = new Date(item.date);
            return itemDate >= startDate && itemDate <= endDate;
        });

        // Aggregate by Radar Categories
        const aggregated: Record<string, number> = {
            'Operacional': 0,
            'Infraestrutura': 0,
            'Impostos': 0,
            'Pessoal': 0,
            'Frota': 0
        };

        filteredCosts.forEach(item => {
            let mappedCat = 'Operacional'; // Default
            // Simple text matching for categorization
            for (const key in categoryMap) {
                if (item.category.includes(key) || item.description.includes(key)) {
                    mappedCat = categoryMap[key];
                    break;
                }
            }
            if(aggregated[mappedCat] !== undefined) {
                aggregated[mappedCat] += item.value;
            }
        });

        return [aggregated['Operacional'], aggregated['Infraestrutura'], aggregated['Impostos'], aggregated['Pessoal'], aggregated['Frota']];
    };

    const currentData = useMemo(() => getFilteredData(0), [financialData, period]);
    const previousData = useMemo(() => getFilteredData(1), [financialData, period]);

    const data = {
        labels: ['Operacional', 'Infraestrutura', 'Impostos', 'Pessoal', 'Frota'],
        datasets: [
            {
                label: 'Período Atual',
                data: currentData,
                backgroundColor: 'rgba(20, 184, 166, 0.2)', // Primary color with opacity
                borderColor: 'rgba(20, 184, 166, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(20, 184, 166, 1)',
            },
            {
                label: 'Período Anterior',
                data: previousData,
                backgroundColor: 'rgba(94, 163, 184, 0)', // Transparent fill
                borderColor: 'rgba(148, 163, 184, 0.5)', // Gray text color
                borderWidth: 1,
                borderDash: [5, 5],
                pointBackgroundColor: 'rgba(148, 163, 184, 1)',
            },
        ],
    };

    const options = {
        scales: {
            r: {
                angleLines: {
                    color: 'rgba(255, 255, 255, 0.1)',
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                },
                pointLabels: {
                    color: 'rgba(248, 250, 252, 0.8)', // Text light
                    font: {
                        size: 12,
                    },
                },
                ticks: {
                    display: false, // Hide scale numbers for cleaner look
                    backdropColor: 'transparent',
                },
            },
        },
        plugins: {
            legend: {
                labels: {
                    color: '#94A3B8',
                },
            },
            tooltip: {
                callbacks: {
                    label: function(context: any) {
                        return `${context.dataset.label}: ${formatCurrency(context.raw)}`;
                    }
                }
            }
        },
        maintainAspectRatio: false,
    };

    return (
        <div className="bg-bg-card p-6 rounded-lg shadow-lg border-l-4 border-primary h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-light flex items-center gap-2">
                    <i className="fas fa-spider text-primary"></i> Radar de Custos
                </h2>
                <select 
                    value={period} 
                    onChange={(e) => setPeriod(e.target.value as any)}
                    className="bg-bg-main border border-border-color text-light text-sm rounded-md p-1 focus:outline-none focus:ring-1 focus:ring-primary"
                >
                    <option value="month">Este Mês</option>
                    <option value="quarter">Últimos 3 Meses</option>
                    <option value="semester">Últimos 6 Meses</option>
                    <option value="year">Este Ano</option>
                </select>
            </div>
            <div className="flex-grow min-h-[300px] relative">
                <Radar data={data} options={options} />
            </div>
            <div className="mt-4 text-xs text-gray-text text-center">
                Comparativo visual entre as principais categorias de custo do período selecionado versus o anterior.
            </div>
        </div>
    );
};
