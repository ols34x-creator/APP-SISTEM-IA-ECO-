import React, { useMemo, useState } from 'react';
import { useAppStore } from '../hooks/useAppStore';
import { RevenueRecord, ReceivableRecord } from '../types';

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Date(date.getTime() + date.getTimezoneOffset() * 60000).toLocaleDateString('pt-BR');
};

const TableCard: React.FC<{ title: string; children: React.ReactNode; actions?: React.ReactNode }> = ({ title, children, actions }) => (
    <div className="bg-bg-card rounded-lg p-5 shadow-lg mb-5 overflow-x-auto">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-light">{title}</h3>
            <div>{actions}</div>
        </div>
        <div>{children}</div>
    </div>
);

const FaturamentoReceita: React.FC = () => {
    const { financialData, deleteRecord, markAsPaid, setActiveTab } = useAppStore();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredRevenues = useMemo(() => {
        if (!searchTerm) return financialData.revenues;
        const lowercasedFilter = searchTerm.toLowerCase();
        return financialData.revenues.filter(item =>
            item.name.toLowerCase().includes(lowercasedFilter) ||
            item.description.toLowerCase().includes(lowercasedFilter) ||
            item.client.toLowerCase().includes(lowercasedFilter)
        );
    }, [financialData.revenues, searchTerm]);

    const filteredReceivables = useMemo(() => {
        if (!searchTerm) return financialData.receivables;
        const lowercasedFilter = searchTerm.toLowerCase();
        return financialData.receivables.filter(item =>
            item.name.toLowerCase().includes(lowercasedFilter) ||
            item.description.toLowerCase().includes(lowercasedFilter) ||
            item.client.toLowerCase().includes(lowercasedFilter)
        );
    }, [financialData.receivables, searchTerm]);


    const handleEditRevenue = (id: number) => {
        alert(`A edição excluirá o item. Você pode recriá-lo na aba 'Adicionar'.`);
        deleteRecord('revenues', id);
        setActiveTab('financial-entries');
    };
    
    const handleDeleteRevenue = (id: number) => {
        if (window.confirm('Tem certeza que deseja excluir este registro?')) {
            deleteRecord('revenues', id);
        }
    };

    const handleEditReceivable = (id: number) => {
        alert(`A edição excluirá o item. Você pode recriá-lo na aba 'Adicionar'.`);
        deleteRecord('receivables', id);
        setActiveTab('financial-entries');
    };

    const handleDeleteReceivable = (id: number) => {
        if (window.confirm('Tem certeza que deseja excluir este registro?')) {
            deleteRecord('receivables', id);
        }
    };

    return (
        <div className="space-y-6">
            <div className="mb-4 relative">
                <input
                    type="text"
                    placeholder="Pesquisar por nome, descrição ou cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-bg-card border border-border-color rounded-md py-2 pl-10 pr-4 text-light focus:outline-none focus:ring-2 focus:ring-secondary"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-search text-gray-text"></i>
                </div>
            </div>
            
            <TableCard title="Receitas (Faturamento Realizado)">
                <table className="w-full text-sm text-left text-gray-text">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-3">Nome</th>
                            <th scope="col" className="px-6 py-3">Cliente</th>
                            <th scope="col" className="px-6 py-3">Valor</th>
                            <th scope="col" className="px-6 py-3">Data</th>
                            <th scope="col" className="px-6 py-3">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRevenues.map((item: RevenueRecord) => (
                            <tr key={item.id} className="bg-bg-card border-b border-border-color hover:bg-border-color">
                                <td className="px-6 py-4">{item.name}</td>
                                <td className="px-6 py-4">{item.client}</td>
                                <td className="px-6 py-4">{formatCurrency(item.value)}</td>
                                <td className="px-6 py-4">{formatDate(item.date)}</td>
                                <td className="px-6 py-4 space-x-2">
                                    <button onClick={() => handleEditRevenue(item.id)} className="text-blue-400 hover:text-blue-300">✏️</button>
                                    <button onClick={() => handleDeleteRevenue(item.id)} className="text-red-500 hover:text-red-400">🗑️</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </TableCard>

             <TableCard title="Contas a Receber (Recebíveis)">
                <table className="w-full text-sm text-left text-gray-text">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-3">Nome</th>
                            <th scope="col" className="px-6 py-3">Cliente</th>
                            <th scope="col" className="px-6 py-3">Valor</th>
                            <th scope="col" className="px-6 py-3">Vencimento</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredReceivables.map((item: ReceivableRecord) => (
                             <tr key={item.id} className="bg-bg-card border-b border-border-color hover:bg-border-color">
                                <td className="px-6 py-4">{item.name}</td>
                                <td className="px-6 py-4">{item.client}</td>
                                <td className="px-6 py-4">{formatCurrency(item.value)}</td>
                                <td className="px-6 py-4">{formatDate(item.dueDate)}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${item.status === 'paid' ? 'bg-green-500/20 text-success' : 'bg-yellow-500/20 text-warning'}`}>
                                        {item.status === 'paid' ? 'Pago' : 'Pendente'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 space-x-2">
                                    {item.status === 'pending' && <button onClick={() => markAsPaid(item.id)} className="text-green-400 hover:text-green-300" title="Marcar como pago">💰</button>}
                                    <button onClick={() => handleEditReceivable(item.id)} className="text-blue-400 hover:text-blue-300" title="Editar">✏️</button>
                                    <button onClick={() => handleDeleteReceivable(item.id)} className="text-red-500 hover:text-red-400" title="Excluir">🗑️</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </TableCard>
        </div>
    );
};

export default FaturamentoReceita;
