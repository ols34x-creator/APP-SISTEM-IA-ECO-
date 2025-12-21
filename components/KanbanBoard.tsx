import React, { useState } from 'react';
import { Demand, DemandStatus } from '../types';
import KanbanColumn from './KanbanColumn';

interface KanbanBoardProps {
  demands: Demand[];
  setDemands: React.Dispatch<React.SetStateAction<Demand[]>>;
  onCardClick: (demand: Demand) => void;
  onAddDemand: (status: DemandStatus) => void;
  columnTitles: Record<string, string>;
  onUpdateColumnTitle: (status: string, newTitle: string) => void;
  onEdit: (demand: Demand) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, newStatus: string) => void;
  onAddColumn: (title: string) => void;
  onRemoveColumn: (key: string) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ demands, setDemands, onCardClick, onAddDemand, columnTitles, onUpdateColumnTitle, onEdit, onDelete, onStatusChange, onAddColumn, onRemoveColumn }) => {
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    setDraggingCardId(id);
    e.currentTarget.classList.add('opacity-50', 'rotate-3');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('opacity-50', 'rotate-3');
    setDraggingCardId(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, newStatus: string) => {
    e.preventDefault();
    if (!draggingCardId) return;

    setDemands(prevDemands => {
      const card = prevDemands.find(d => d.id === draggingCardId);
      if (card && card.status !== newStatus) {
        return prevDemands.map(d => (d.id === draggingCardId ? { ...d, status: newStatus } : d));
      }
      return prevDemands;
    });
  };

  const handleAddColumnSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (newColumnTitle.trim()) {
          onAddColumn(newColumnTitle.trim());
          setNewColumnTitle('');
          setIsAddingColumn(false);
      }
  };

  const columns = Object.keys(columnTitles);

  return (
    <div className="flex gap-5 p-5 flex-grow overflow-x-auto h-full">
      {columns.map(status => (
        <KanbanColumn
          key={status}
          title={columnTitles[status]}
          status={status}
          demands={demands.filter(d => d.status === status)}
          handleDragStart={handleDragStart}
          handleDragEnd={handleDragEnd}
          handleDrop={handleDrop}
          handleDragOver={handleDragOver}
          onCardClick={onCardClick}
          onAddDemand={onAddDemand}
          onUpdateColumnTitle={onUpdateColumnTitle}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
          onRemoveColumn={onRemoveColumn}
        />
      ))}
      
      <div className="min-w-[300px] flex flex-col">
          {isAddingColumn ? (
              <form onSubmit={handleAddColumnSubmit} className="bg-bg-main p-4 rounded-lg border-2 border-dashed border-border-color">
                  <h4 className="text-light font-bold mb-3">Nova Coluna</h4>
                  <input 
                      type="text" 
                      value={newColumnTitle}
                      onChange={(e) => setNewColumnTitle(e.target.value)}
                      placeholder="Título da coluna..."
                      className="w-full bg-bg-card border border-border-color rounded p-2 text-sm text-light mb-3 focus:outline-none focus:border-secondary"
                      autoFocus
                  />
                  <div className="flex gap-2 justify-end">
                      <button type="button" onClick={() => setIsAddingColumn(false)} className="px-3 py-1.5 text-xs text-gray-400 hover:text-light">Cancelar</button>
                      <button type="submit" className="px-3 py-1.5 text-xs bg-primary text-white rounded font-bold hover:bg-opacity-90">Adicionar</button>
                  </div>
              </form>
          ) : (
              <button 
                  onClick={() => setIsAddingColumn(true)}
                  className="w-full h-full min-h-[100px] flex flex-col items-center justify-center bg-bg-main/30 border-2 border-dashed border-border-color rounded-lg text-gray-500 hover:text-light hover:border-secondary hover:bg-bg-main/50 transition-all cursor-pointer p-4"
              >
                  <i className="fas fa-plus text-2xl mb-2"></i>
                  <span className="font-bold">Adicionar Coluna</span>
              </button>
          )}
      </div>
    </div>
  );
};

export default KanbanBoard;