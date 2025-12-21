
import React from 'react';
import { Demand, DemandStatus, DEMANDA_STATUSES } from '../types';
import { formatBrDate } from '../utils/helpers';

interface KanbanCardProps {
  demand: Demand;
  handleDragStart: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
  handleDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  onCardClick: (demand: Demand) => void;
  onEdit: (demand: Demand) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, newStatus: DemandStatus) => void;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ demand, handleDragStart, handleDragEnd, onCardClick, onEdit, onDelete, onStatusChange }) => {

    const handleMove = () => {
        const currentIndex = DEMANDA_STATUSES.indexOf(demand.status);
        const nextIndex = (currentIndex + 1) % DEMANDA_STATUSES.length;
        onStatusChange(demand.id, DEMANDA_STATUSES[nextIndex]);
    };

    const getWhatsAppLink = (contact: string) => {
        if (!contact) return null;
        const digits = contact.replace(/\D/g, ''); 
        if (digits.length < 10) return null; // Simple validation for a phone number
        return `https://wa.me/${digits}`;
    };

    const whatsAppLink = getWhatsAppLink(demand.contact);

    const displayDate = demand.dateStart
        ? `${formatBrDate(new Date(demand.dateStart + 'T00:00:00'))}${demand.timeStart ? ` ${demand.timeStart}` : ''} → ${demand.dateEnd ? formatBrDate(new Date(demand.dateEnd + 'T00:00:00')) : ''}${demand.timeEnd ? ` ${demand.timeEnd}` : ''}`
        : demand.date;

    return (
        <div
            className="bg-bg-card p-4 rounded-lg mb-2.5 border-l-4 border-gray-400 cursor-grab transition-all duration-200 ease-in-out shadow-md hover:shadow-xl hover:-translate-y-0.5"
            draggable
            onDragStart={(e) => handleDragStart(e, demand.id)}
            onDragEnd={handleDragEnd}
            onClick={() => onCardClick(demand)}
            data-id={demand.id}
        >
            <h4 className="text-lg font-bold mb-1 text-light">{demand.client}</h4>
            <p className="text-sm mb-2.5 text-gray-text break-words">{demand.service}</p>
            <div className="text-xs text-gray-text flex justify-between items-center">
                <span><i className="fas fa-calendar-alt mr-1"></i> {displayDate}</span>
                <span className="font-bold bg-black/20 px-1.5 py-0.5 rounded">{demand.id}</span>
            </div>
            <div className="mt-3 pt-2 border-t border-border-color/50 flex items-center gap-2">
                <button onClick={(e) => { e.stopPropagation(); onEdit(demand); }} className="action-btn text-blue-400" title="Editar"><i className="fas fa-edit"></i></button>
                <button onClick={(e) => { e.stopPropagation(); handleMove(); }} className="action-btn text-purple-400" title="Mover Status"><i className="fas fa-arrow-right"></i></button>
                
                {whatsAppLink && (
                    <a
                        href={whatsAppLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="action-btn text-green-500"
                        title="Iniciar Conversa no WhatsApp"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <i className="fab fa-whatsapp"></i>
                    </a>
                )}
                
                <div className="flex-grow"></div> 

                <button onClick={(e) => { e.stopPropagation(); onDelete(demand.id); }} className="action-btn text-red-500" title="Excluir"><i className="fas fa-trash"></i></button>
            </div>
            <style>{`.action-btn { background: transparent; border: none; font-size: 0.9rem; padding: 4px; cursor: pointer; transition: all 0.2s; } .action-btn:hover { transform: scale(1.2); }`}</style>
        </div>
    );
};

export default KanbanCard;
