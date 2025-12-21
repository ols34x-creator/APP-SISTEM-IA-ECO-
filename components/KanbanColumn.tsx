import React, { useState, useEffect } from 'react';
import { Demand, DemandStatus, STATUS_ICON_MAP, STATUS_COLOR_MAP } from '../types';
import KanbanCard from './KanbanCard';

interface KanbanColumnProps {
  title: string;
  status: string;
  demands: Demand[];
  handleDragStart: (e: React.DragEvent<HTMLDivElement>, id:string) => void;
  handleDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>, status: string) => void;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onCardClick: (demand: Demand) => void;
  onAddDemand: (status: DemandStatus) => void;
  onUpdateColumnTitle: (status: string, newTitle: string) => void;
  onEdit: (demand: Demand) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, newStatus: string) => void;
  onRemoveColumn: (key: string) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ title, status, demands, handleDragStart, handleDragEnd, handleDrop, handleDragOver, onCardClick, onAddDemand, onUpdateColumnTitle, onEdit, onDelete, onStatusChange, onRemoveColumn }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(title);

  useEffect(() => {
    if (!isEditing) {
      setNewTitle(title);
    }
  }, [title, isEditing]);

  const handleSaveTitle = () => {
    if (newTitle.trim() && newTitle.trim() !== title) {
      onUpdateColumnTitle(status, newTitle.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setNewTitle(title);
    setIsEditing(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleDeleteColumn = () => {
    if (demands.length > 0) {
        alert("Não é possível excluir uma coluna que contém demandas. Mova ou exclua os itens primeiro.");
        return;
    }
    if (confirm(`Tem certeza que deseja excluir a coluna "${title}"? Esta ação não pode ser desfeita.`)) {
      onRemoveColumn(status);
    }
  };

  // Default color fallback if dynamic key is used
  const borderColorClass = STATUS_COLOR_MAP[status] || 'border-gray-500';
  const iconClass = STATUS_ICON_MAP[status] || 'fa-columns';

  return (
    <div 
      className="bg-bg-main rounded-lg p-4 flex flex-col max-h-full min-w-[300px] w-[300px]"
      onDrop={(e) => handleDrop(e, status)}
      onDragOver={handleDragOver}
    >
      <div className={`mb-4 pb-2.5 border-b-4 flex items-center justify-between ${borderColorClass}`}>
        {isEditing ? (
          <div className="flex-grow flex items-center gap-2">
            <input 
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSaveTitle}
              autoFocus
              className="w-full bg-bg-card border border-border-color rounded px-2 py-1 text-xl font-bold text-light focus:outline-none focus:ring-2 focus:ring-secondary"
            />
            <button onClick={handleSaveTitle} title="Salvar" className="text-gray-text hover:text-green-400 transition-colors"><i className="fas fa-check"></i></button>
            <button onClick={handleCancelEdit} title="Cancelar" className="text-gray-text hover:text-red-400 transition-colors"><i className="fas fa-times"></i></button>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-bold flex items-center gap-2.5 text-light truncate" title={title}>
                <i className={`fas ${iconClass}`}></i> {title}
            </h3>
            <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs font-bold bg-bg-card px-2 py-0.5 rounded text-gray-400">{demands.length}</span>
                <button onClick={() => onAddDemand(status)} title="Adicionar Demanda" className="text-gray-text hover:text-light transition-colors">
                    <i className="fas fa-plus-circle"></i>
                </button>
                <button onClick={() => setIsEditing(true)} title="Editar Coluna" className="text-gray-text hover:text-light transition-colors">
                    <i className="fas fa-pencil-alt"></i>
                </button>
                <button onClick={handleDeleteColumn} title="Excluir Coluna" className="text-gray-text hover:text-red-500 transition-colors">
                    <i className="fas fa-trash-alt"></i>
                </button>
            </div>
          </>
        )}
      </div>

      <div className="flex-grow overflow-y-auto pr-1 min-h-[200px] custom-scrollbar">
        {demands.map(demand => (
          <KanbanCard 
            key={demand.id} 
            demand={demand} 
            handleDragStart={handleDragStart} 
            handleDragEnd={handleDragEnd} 
            onCardClick={onCardClick}
            onEdit={onEdit}
            onDelete={onDelete}
            onStatusChange={onStatusChange}
          />
        ))}
        {demands.length === 0 && (
            <div className="h-20 border-2 border-dashed border-border-color rounded-lg flex items-center justify-center text-gray-500 text-sm opacity-50">
                Vazio
            </div>
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;