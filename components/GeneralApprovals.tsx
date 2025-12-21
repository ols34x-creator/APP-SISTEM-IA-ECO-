
import React, { useState, useMemo } from 'react';
import { useAppStore } from '../hooks/useAppStore';
import { useAuth } from '../hooks/useAuth';
import { ApprovalRequest, ApprovalType, ApprovalStatus } from '../types';

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const typeColors: Record<ApprovalType, string> = {
    'Serviço': 'border-blue-500 text-blue-500',
    'Peças': 'border-orange-500 text-orange-500',
    'Roupas': 'border-purple-500 text-purple-500',
    'Pagamento': 'border-green-500 text-green-500',
    'Outros': 'border-gray-500 text-gray-500',
};

const statusColors: Record<ApprovalStatus, string> = {
    'pending': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
    'approved': 'bg-green-500/20 text-green-300 border-green-500/50',
    'rejected': 'bg-red-500/20 text-red-300 border-red-500/50',
};

const statusLabels: Record<ApprovalStatus, string> = {
    'pending': 'Pendente',
    'approved': 'Aprovado',
    'rejected': 'Rejeitado',
};

const GeneralApprovals: React.FC = () => {
    const { approvalRequests, addApprovalRequest, approveRequest, rejectRequest } = useAppStore();
    const { currentUser } = useAuth();
    const [view, setView] = useState<'pending' | 'history'>('pending');
    
    // State for inline form visibility
    const [isFormOpen, setIsFormOpen] = useState(false);
    
    const [rejectModalOpen, setRejectModalOpen] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState('');

    const [newRequest, setNewRequest] = useState<{
        type: ApprovalType;
        description: string;
        value: string;
        requester: string;
    }>({
        type: 'Serviço',
        description: '',
        value: '',
        requester: currentUser?.name || '',
    });

    const filteredRequests = useMemo(() => {
        if (view === 'pending') {
            return approvalRequests.filter(r => r.status === 'pending');
        }
        return approvalRequests.filter(r => r.status !== 'pending').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [approvalRequests, view]);

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newRequest.description || !newRequest.value || !newRequest.requester) {
            alert("Preencha todos os campos obrigatórios.");
            return;
        }

        addApprovalRequest({
            type: newRequest.type,
            description: newRequest.description,
            value: parseFloat(newRequest.value),
            requester: newRequest.requester,
            date: new Date().toISOString().split('T')[0],
        });

        setIsFormOpen(false);
        setNewRequest({ type: 'Serviço', description: '', value: '', requester: currentUser?.name || '' });
    };

    const handleRejectSubmit = () => {
        if (rejectModalOpen && rejectReason.trim()) {
            rejectRequest(rejectModalOpen, rejectReason);
            setRejectModalOpen(null);
            setRejectReason('');
        } else {
            alert("Justificativa é obrigatória para rejeição.");
        }
    };

    return (
        <div className="bg-bg-card rounded-lg p-6 shadow-lg min-h-[80vh]">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 border-b border-border-color pb-4">
                <h2 className="text-2xl font-bold text-light flex items-center gap-3">
                    <i className="fas fa-check-double text-primary"></i> Aprovações em Geral
                </h2>
                <div className="flex gap-3">
                    <div className="bg-bg-main rounded-lg p-1 flex">
                        <button 
                            onClick={() => setView('pending')}
                            className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${view === 'pending' ? 'bg-bg-card text-light shadow-sm' : 'text-gray-500 hover:text-light'}`}
                        >
                            Pendentes ({approvalRequests.filter(r => r.status === 'pending').length})
                        </button>
                        <button 
                            onClick={() => setView('history')}
                            className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${view === 'history' ? 'bg-bg-card text-light shadow-sm' : 'text-gray-500 hover:text-light'}`}
                        >
                            Histórico
                        </button>
                    </div>
                    <button 
                        onClick={() => setIsFormOpen(!isFormOpen)}
                        className={`px-4 py-2 rounded-md font-bold flex items-center gap-2 shadow-md transition-all ${isFormOpen ? 'bg-border-color text-gray-300' : 'bg-primary hover:bg-opacity-90 text-white'}`}
                    >
                        <i className={`fas ${isFormOpen ? 'fa-minus' : 'fa-plus'}`}></i> 
                        {isFormOpen ? 'Cancelar' : 'Nova Solicitação'}
                    </button>
                </div>
            </div>

            {/* Inline Creation Form */}
            {isFormOpen && (
                <div className="bg-bg-main/50 p-6 rounded-lg border border-border-color mb-8 animate-fade-in shadow-inner">
                    <h3 className="text-lg font-bold text-light mb-4 flex items-center gap-2">
                        <i className="fas fa-pen-square text-secondary"></i> Registrar Solicitação
                    </h3>
                    <form onSubmit={handleCreateSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Tipo</label>
                                <select 
                                    value={newRequest.type} 
                                    onChange={e => setNewRequest({...newRequest, type: e.target.value as ApprovalType})}
                                    className="w-full bg-bg-card border border-border-color rounded p-2.5 text-light focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all"
                                >
                                    <option value="Serviço">Serviço</option>
                                    <option value="Peças">Peças</option>
                                    <option value="Roupas">Roupas</option>
                                    <option value="Pagamento">Pagamentos</option>
                                    <option value="Outros">Outros</option>
                                </select>
                            </div>
                            <div className="lg:col-span-2">
                                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Descrição</label>
                                <input 
                                    type="text" 
                                    value={newRequest.description} 
                                    onChange={e => setNewRequest({...newRequest, description: e.target.value})}
                                    className="w-full bg-bg-card border border-border-color rounded p-2.5 text-light focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all"
                                    placeholder="Ex: Troca de pneus caminhão ABC-1234"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Valor (R$)</label>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    value={newRequest.value} 
                                    onChange={e => setNewRequest({...newRequest, value: e.target.value})}
                                    className="w-full bg-bg-card border border-border-color rounded p-2.5 text-light focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all"
                                    placeholder="0.00"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Solicitante</label>
                                <input 
                                    type="text" 
                                    value={newRequest.requester} 
                                    onChange={e => setNewRequest({...newRequest, requester: e.target.value})}
                                    className="w-full bg-bg-card border border-border-color rounded p-2.5 text-light focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all"
                                    required
                                />
                            </div>
                            <div className="lg:col-span-3 flex items-end justify-end">
                                <button type="submit" className="px-6 py-2.5 bg-success text-white font-bold rounded hover:bg-green-600 transition-colors shadow-lg flex items-center gap-2">
                                    <i className="fas fa-check"></i> Enviar Solicitação
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* Content */}
            {view === 'pending' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRequests.map(request => (
                        <div key={request.id} className={`bg-bg-main border-l-4 ${typeColors[request.type].split(' ')[0]} rounded-r-lg p-5 shadow-sm hover:shadow-md transition-all`}>
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-xs font-bold px-2 py-1 rounded-full border ${typeColors[request.type].replace('border-', 'bg-').replace('text-', 'text-white bg-opacity-20 border-opacity-30')}`}>
                                    {request.type === 'Pagamento' ? 'Pagamentos' : request.type}
                                </span>
                                <span className="text-xs text-gray-500">{new Date(request.date).toLocaleDateString('pt-BR')}</span>
                            </div>
                            
                            <h3 className="font-bold text-lg text-light mb-1">{request.description}</h3>
                            <p className="text-sm text-gray-400 mb-4">Solicitante: <span className="text-light">{request.requester}</span></p>
                            
                            <div className="flex justify-between items-end border-t border-border-color pt-3">
                                <span className="text-xl font-bold text-light">{formatCurrency(request.value)}</span>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => setRejectModalOpen(request.id)}
                                        className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors"
                                        title="Rejeitar"
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                    <button 
                                        onClick={() => approveRequest(request.id)}
                                        className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white flex items-center justify-center transition-colors"
                                        title="Aprovar"
                                    >
                                        <i className="fas fa-check"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredRequests.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center h-64 text-gray-500">
                            <i className="fas fa-check-circle text-5xl mb-4 opacity-50"></i>
                            <p>Tudo certo! Nenhuma aprovação pendente.</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="overflow-x-auto bg-bg-main rounded-lg border border-border-color">
                    <table className="w-full text-sm text-left text-gray-text">
                        <thead className="text-xs text-gray-400 uppercase bg-bg-card border-b border-border-color">
                            <tr>
                                <th className="px-4 py-3">Data</th>
                                <th className="px-4 py-3">Tipo</th>
                                <th className="px-4 py-3">Descrição</th>
                                <th className="px-4 py-3">Solicitante</th>
                                <th className="px-4 py-3">Valor</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Obs</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRequests.map(request => (
                                <tr key={request.id} className="border-b border-border-color hover:bg-bg-card/50 transition-colors">
                                    <td className="px-4 py-3 whitespace-nowrap">{new Date(request.date).toLocaleDateString('pt-BR')}</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full border ${typeColors[request.type].replace('border-', 'bg-').replace('text-', 'text-white bg-opacity-20 border-opacity-30')}`}>
                                            {request.type === 'Pagamento' ? 'Pagamentos' : request.type}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 font-medium text-light">{request.description}</td>
                                    <td className="px-4 py-3">{request.requester}</td>
                                    <td className="px-4 py-3 text-light font-bold">{formatCurrency(request.value)}</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full border ${statusColors[request.status]}`}>
                                            {statusLabels[request.status]}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-xs italic max-w-[200px] truncate" title={request.justification}>
                                        {request.justification || '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredRequests.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                            <i className="fas fa-history text-5xl mb-4 opacity-50"></i>
                            <p>Nenhum histórico encontrado.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Reject Modal */}
            {rejectModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[2000] p-4" onClick={() => setRejectModalOpen(null)}>
                    <div className="bg-bg-card p-6 rounded-lg shadow-xl w-full max-w-md border border-border-color" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-red-400 mb-4">Rejeitar Solicitação</h3>
                        <p className="text-sm text-gray-300 mb-4">Por favor, informe o motivo da rejeição:</p>
                        <textarea 
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                            className="w-full bg-bg-main border border-border-color rounded p-3 text-light min-h-[100px]"
                            placeholder="Motivo..."
                            autoFocus
                        ></textarea>
                        <div className="flex justify-end gap-2 mt-4">
                            <button onClick={() => setRejectModalOpen(null)} className="px-4 py-2 bg-border-color rounded text-light hover:bg-opacity-80">Cancelar</button>
                            <button onClick={handleRejectSubmit} className="px-4 py-2 bg-red-600 text-white font-bold rounded hover:bg-red-700">Rejeitar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GeneralApprovals;
