
import React, { useState } from 'react';
import { Frete, ClientNote, FreightColumn } from '../types';
import FreteCard from './FreteCard';
import FreightDetailModal from './FreightDetailModal';
import ClientNotesModal from './ClientNotesModal';
import ColumnCustomizerModal, { ColumnConfig } from './ColumnCustomizerModal';
import { PlusIcon, TableCellsIcon, KanbanIcon, AdjustmentsHorizontalIcon, PencilIcon, TrashIcon } from './icons';

interface FreightSheetProps {
    fretes: Frete[];
    onAddFrete: (frete: Frete) => void;
    onUpdateFrete: (frete: Frete) => void;
    onDeleteFrete: (id: string) => void;
    clientNotes: ClientNote[];
    onAddClientNote: (note: ClientNote) => void;
    onOpenDetailModal: (frete: Frete) => void;
}

const FreightSheet: React.FC<FreightSheetProps> = ({ 
    fretes, 
    onAddFrete, 
    onUpdateFrete, 
    onDeleteFrete,
    clientNotes,
    onAddClientNote,
    onOpenDetailModal 
}) => {
    const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFrete, setSelectedFrete] = useState<Frete | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isClientNotesModalOpen, setIsClientNotesModalOpen] = useState(false);
    const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
    const [selectedClientForNotes, setSelectedClientForNotes] = useState('');

    // Default Columns for Table View
    const [tableColumns, setTableColumns] = useState<ColumnConfig[]>([
        { key: 'data', header: 'Data', visible: true },
        { key: 'cliente', header: 'Cliente', visible: true },
        { key: 'container', header: 'Container', visible: true },
        { key: 'tipo', header: 'Tipo', visible: true },
        { key: 'destino', header: 'Destino', visible: true },
        { key: 'motorista', header: 'Motorista', visible: true },
        { key: 'status', header: 'Status', visible: true },
    ]);

    // Define Kanban Columns (Status)
    const freightColumns: FreightColumn[] = [
        { id: 'Aguardando Alocação', title: 'Aguardando Alocação', color: 'border-yellow-500' },
        { id: 'Em Rota / Coletando', title: 'Em Rota / Coletando', color: 'border-blue-500' },
        { id: 'Em Trânsito', title: 'Em Trânsito', color: 'border-purple-500' },
        { id: 'Pendente de Entrega', title: 'Pendente de Entrega', color: 'border-orange-500' },
        { id: 'Fechamento / Faturamento', title: 'Fechamento / Faturamento', color: 'border-green-500' }
    ];

    const filteredFretes = fretes.filter(f => 
        f.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.container.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.motorista.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.destino.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddRow = () => {
        const newFrete: Frete = {
            id: `frete-${Date.now()}`, operador: '', cliente: '',
            data: new Date().toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit', day: '2-digit' }).split('/').reverse().join('-'),
            horario: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            di_br: '', referencia: '', container: '', free_time: '', 
            peso: 0, cargoType: '', cargoVolume: 0, 
            terminal: '', tipo: '', destino: '', motorista: '',
            cavalo: '', carreta: '', cte: '', vrFrete: 0, obs: '', status: freightColumns[0]?.id || 'Aguardando Alocação',
            attachments: [], comments: [],
        };
        onAddFrete(newFrete);
        openDetailModal(newFrete);
    };

    const openDetailModal = (frete: Frete) => {
        setSelectedFrete(frete);
        setIsDetailModalOpen(true);
    };

    const openClientNotes = (clientName: string) => {
        setSelectedClientForNotes(clientName);
        setIsClientNotesModalOpen(true);
    };

    // Drag & Drop handlers for Kanban
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
        e.dataTransfer.setData('freteId', id);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, status: string) => {
        e.preventDefault();
        const freteId = e.dataTransfer.getData('freteId');
        const frete = fretes.find(f => f.id === freteId);
        if (frete && frete.status !== status) {
            onUpdateFrete({ ...frete, status, lastStatusChange: Date.now() });
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    return (
        <div className="flex flex-col h-full bg-bg-card rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-border-color bg-bg-main flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-light flex items-center gap-2">
                        <i className="fas fa-table text-primary"></i> Planilha de Fretes
                    </h2>
                    <div className="flex bg-bg-card rounded p-1 border border-border-color">
                        <button onClick={() => setViewMode('kanban')} className={`p-2 rounded ${viewMode === 'kanban' ? 'bg-primary text-white' : 'text-gray-400 hover:text-light'}`} title="Kanban"><KanbanIcon /></button>
                        <button onClick={() => setViewMode('table')} className={`p-2 rounded ${viewMode === 'table' ? 'bg-primary text-white' : 'text-gray-400 hover:text-light'}`} title="Tabela"><TableCellsIcon /></button>
                    </div>
                </div>
                
                <div className="flex gap-3 w-full md:w-auto">
                    <input 
                        type="text" 
                        placeholder="Pesquisar..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-bg-card border border-border-color rounded px-3 py-2 text-sm text-light focus:outline-none focus:border-primary flex-grow md:w-64"
                    />
                    {viewMode === 'table' && (
                        <button onClick={() => setIsColumnModalOpen(true)} className="p-2 bg-bg-card border border-border-color rounded text-gray-400 hover:text-light" title="Configurar Colunas">
                            <AdjustmentsHorizontalIcon />
                        </button>
                    )}
                    <button onClick={handleAddRow} className="bg-primary hover:bg-opacity-90 text-white px-4 py-2 rounded font-bold flex items-center gap-2">
                        <PlusIcon /> <span className="hidden sm:inline">Adicionar</span>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-grow overflow-auto p-4 bg-bg-main/50">
                {viewMode === 'kanban' ? (
                    <div className="flex gap-4 h-full min-w-full overflow-x-auto pb-4">
                        {freightColumns.map(col => (
                            <div 
                                key={col.id} 
                                className="min-w-[300px] w-[300px] flex flex-col bg-bg-card rounded-lg border-t-4"
                                style={{ borderColor: col.color.replace('border-', '') === 'yellow-500' ? '#eab308' : 
                                                 col.color.replace('border-', '') === 'blue-500' ? '#3b82f6' : 
                                                 col.color.replace('border-', '') === 'purple-500' ? '#a855f7' : 
                                                 col.color.replace('border-', '') === 'orange-500' ? '#f97316' : 
                                                 '#22c55e' }}
                                onDrop={(e) => handleDrop(e, col.id)}
                                onDragOver={handleDragOver}
                            >
                                <div className="p-3 font-bold text-light border-b border-border-color flex justify-between">
                                    <span>{col.title}</span>
                                    <span className="bg-bg-main px-2 rounded text-sm text-gray-400">{filteredFretes.filter(f => f.status === col.id).length}</span>
                                </div>
                                <div className="p-2 flex-grow overflow-y-auto space-y-2 custom-scrollbar">
                                    {filteredFretes.filter(f => f.status === col.id).map(frete => (
                                        <FreteCard 
                                            key={frete.id}
                                            frete={frete}
                                            isDragging={false}
                                            isAnyDragging={false}
                                            onDragStart={handleDragStart}
                                            onDragEnd={() => {}}
                                            onDeleteFrete={onDeleteFrete}
                                            onUpdateFrete={onUpdateFrete}
                                            onOpenDetailModal={openDetailModal}
                                            hasSlaBreach={false}
                                            isJustDropped={false}
                                            columns={freightColumns}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-bg-card rounded-lg border border-border-color overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-text">
                                <thead className="text-xs text-gray-400 uppercase bg-bg-main border-b border-border-color">
                                    <tr>
                                        {tableColumns.filter(c => c.visible).map(col => (
                                            <th key={col.key} className="px-6 py-3 whitespace-nowrap">{col.header}</th>
                                        ))}
                                        <th className="px-6 py-3 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-color">
                                    {filteredFretes.map(frete => (
                                        <tr key={frete.id} className="hover:bg-bg-main/50 transition-colors">
                                            {tableColumns.filter(c => c.visible).map(col => (
                                                <td key={col.key} className="px-6 py-4 whitespace-nowrap">
                                                    {col.key === 'cliente' ? (
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-light cursor-pointer hover:underline" onClick={() => openClientNotes(frete.cliente)}>{frete.cliente}</span>
                                                            {clientNotes.some(n => n.clientName === frete.cliente) && <span className="w-2 h-2 rounded-full bg-blue-500" title="Possui observações"></span>}
                                                        </div>
                                                    ) : (
                                                        (frete as any)[col.key] || '-'
                                                    )}
                                                </td>
                                            ))}
                                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                                <div className="flex justify-end gap-3">
                                                    <button 
                                                        onClick={() => openDetailModal(frete)} 
                                                        className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-bold transition-colors"
                                                        title="Editar Frete"
                                                    >
                                                        <PencilIcon className="w-3.5 h-3.5" /> <span>Editar</span>
                                                    </button>
                                                    <button 
                                                        onClick={() => onDeleteFrete(frete.id)} 
                                                        className="flex items-center gap-1 text-red-500 hover:text-red-400 font-bold transition-colors"
                                                        title="Excluir Frete"
                                                    >
                                                        <TrashIcon className="w-3.5 h-3.5" /> <span>Excluir</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <FreightDetailModal 
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                frete={selectedFrete}
                onSave={(updatedFrete) => {
                    if (selectedFrete) {
                        onUpdateFrete(updatedFrete);
                    } else {
                        onAddFrete(updatedFrete);
                    }
                    setIsDetailModalOpen(false);
                }}
            />

            <ClientNotesModal 
                isOpen={isClientNotesModalOpen}
                onClose={() => setIsClientNotesModalOpen(false)}
                clientName={selectedClientForNotes}
                notes={clientNotes}
                onAddClientNote={onAddClientNote}
            />

            <ColumnCustomizerModal 
                isOpen={isColumnModalOpen}
                onClose={() => setIsColumnModalOpen(false)}
                columns={tableColumns}
                onSave={setTableColumns}
            />
        </div>
    );
};

export default FreightSheet;
