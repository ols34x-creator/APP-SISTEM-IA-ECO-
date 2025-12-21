
import React from 'react';
import { Frete, FreightColumn } from '../types';
import { TruckIcon, CalendarIcon, MapIcon, PencilIcon, TrashIcon, EllipsisHorizontalIcon } from './icons';

interface FreteCardProps {
    frete: Frete;
    onDragStart: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
    onDragEnd: () => void;
    isDragging: boolean;
    isAnyDragging: boolean;
    onDeleteFrete: (id: string) => void;
    onUpdateFrete: (frete: Frete) => void;
    onOpenDetailModal: (frete: Frete) => void;
    hasSlaBreach: boolean;
    isJustDropped: boolean;
    columns?: FreightColumn[];
}

const FreteCard: React.FC<FreteCardProps> = ({ frete, onDragStart, onDragEnd, onOpenDetailModal, onDeleteFrete, onUpdateFrete, columns }) => {
    
    const cardStyle = frete.cardColor ? { borderLeftColor: frete.cardColor, borderLeftWidth: '4px' } : {};

    const handleMoveTo = (columnId: string) => {
        onUpdateFrete({ ...frete, status: columnId, lastStatusChange: Date.now() });
    };

    const handleChangeColor = (color: string) => {
        onUpdateFrete({ ...frete, cardColor: color });
    };

    return (
        <div
            className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 cursor-pointer hover:shadow-lg transition-shadow group relative"
            draggable
            onDragStart={(e) => onDragStart(e, frete.id)}
            onDragEnd={onDragEnd}
            onClick={() => onOpenDetailModal(frete)}
            style={cardStyle}
        >
            <div className="flex justify-between items-start mb-2">
                <h5 className="font-bold text-slate-800 dark:text-slate-100 truncate" title={frete.cliente}>{frete.cliente}</h5>
                <span className="text-xs font-mono bg-slate-100 dark:bg-slate-700 px-1 rounded text-slate-500">{frete.container || 'S/N'}</span>
            </div>
            
            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                <div className="flex items-center gap-1">
                    <CalendarIcon className="w-3 h-3" />
                    <span>{frete.data} {frete.horario}</span>
                </div>
                <div className="flex items-center gap-1">
                    <MapIcon className="w-3 h-3" />
                    <span className="truncate">{frete.destino}</span>
                </div>
                {frete.motorista && (
                    <div className="flex items-center gap-1">
                        <TruckIcon className="w-3 h-3" />
                        <span className="truncate">{frete.motorista}</span>
                    </div>
                )}
            </div>

            {/* Direct Action Buttons Footer */}
            <div className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <div className="flex gap-2">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onOpenDetailModal(frete); }} 
                        className="text-blue-500 hover:text-blue-400 p-1 transition-transform hover:scale-110" 
                        title="Editar Frete"
                    >
                        <PencilIcon className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onDeleteFrete(frete.id); }} 
                        className="text-red-500 hover:text-red-400 p-1 transition-transform hover:scale-110" 
                        title="Excluir Frete"
                    >
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
                
                <div className="relative group/menu">
                    <button className="p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded" onClick={(e) => e.stopPropagation()}>
                        <EllipsisHorizontalIcon className="w-4 h-4" />
                    </button>
                    {/* Dropdown Menu */}
                    <div className="absolute right-0 bottom-full mb-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded shadow-lg p-2 z-20 hidden group-hover/menu:block min-w-[150px] animate-fade-in">
                        {columns && (
                            <div className="mb-2 border-b border-slate-100 dark:border-slate-700 pb-2">
                                <div className="text-[10px] uppercase font-bold text-gray-400 mb-1 px-2">Mover para</div>
                                {columns.map(col => (
                                    <button 
                                        key={col.id}
                                        onClick={(e) => { e.stopPropagation(); handleMoveTo(col.id); }}
                                        className="w-full text-left px-2 py-1 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded truncate"
                                    >
                                        {col.title}
                                    </button>
                                ))}
                            </div>
                        )}
                        
                        <div className="px-2">
                             <div className="text-[10px] uppercase font-bold text-gray-400 mb-1">Destaque Visual</div>
                             <div className="flex gap-1 flex-wrap">
                                {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'].map(color => (
                                    <div 
                                        key={color} 
                                        className="w-3.5 h-3.5 rounded-full cursor-pointer hover:scale-110 shadow-sm"
                                        style={{ backgroundColor: color }}
                                        onClick={(e) => { e.stopPropagation(); handleChangeColor(color); }}
                                    ></div>
                                ))}
                                <div 
                                    className="w-3.5 h-3.5 rounded-full cursor-pointer hover:scale-110 border border-gray-300 flex items-center justify-center bg-white"
                                    title="Remover cor"
                                    onClick={(e) => { e.stopPropagation(); handleChangeColor(''); }}
                                >
                                    <span className="text-[8px] text-gray-400">&times;</span>
                                </div>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FreteCard;
