
import React, { useMemo, useState, useRef } from 'react';
import { Demand } from '../types';
import { formatBrDate } from '../utils/helpers';

interface GanttViewProps {
  demands: Demand[];
  onEdit: (demand: Demand) => void;
  setDemands: React.Dispatch<React.SetStateAction<Demand[]>>;
}

const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const GanttView: React.FC<GanttViewProps> = ({ demands, onEdit, setDemands }) => {
  const [draggedItem, setDraggedItem] = useState<{ id: string; durationDays: number } | null>(null);
  const timelineContainerRef = useRef<HTMLDivElement>(null);

  const { timelineDays, ganttItems } = useMemo(() => {
    const validDemands = demands.filter(d => d.dateStart && d.dateEnd);
    if (validDemands.length === 0) {
      return { timelineDays: [], ganttItems: [] };
    }

    const sorted = [...validDemands].sort((a, b) => new Date(a.dateStart!).getTime() - new Date(b.dateStart!).getTime());

    const starts = sorted.map(i => new Date(i.dateStart! + 'T00:00:00'));
    const ends = sorted.map(i => new Date(i.dateEnd! + 'T00:00:00'));

    let minD = new Date(Math.min(...starts.map(d => d.getTime())));
    let maxD = new Date(Math.max(...ends.map(d => d.getTime())));

    minD.setDate(minD.getDate() - 2);
    maxD.setDate(maxD.getDate() + 2);

    const dayCount = Math.ceil((maxD.getTime() - minD.getTime()) / (1000 * 3600 * 24));
    if (dayCount > 180) { // Safety cap
        maxD = new Date(minD);
        maxD.setDate(minD.getDate() + 180);
    }

    const finalDayCount = Math.min(dayCount, 181);

    const days = Array.from({ length: finalDayCount }, (_, i) => {
      const d = new Date(minD);
      d.setDate(minD.getDate() + i);
      return d;
    });

    const items = sorted.map(item => {
      const itemStart = new Date(item.dateStart! + 'T00:00:00');
      const itemEnd = new Date(item.dateEnd! + 'T00:00:00');

      const startOffset = Math.max(1, Math.ceil((itemStart.getTime() - minD.getTime()) / (1000 * 3600 * 24)));
      const duration = Math.max(1, Math.ceil((itemEnd.getTime() - itemStart.getTime()) / (1000 * 3600 * 24)) + 1);
      return { ...item, startOffset, duration };
    });

    return { timelineDays: days, ganttItems: items };
  }, [demands]);

  const getBarColor = (status: Demand['status']) => {
    switch (status) {
      case 'concluido': return 'from-completed to-green-400';
      case 'execucao': return 'from-scheduled to-blue-400';
      case 'analise': return 'from-at-risk to-yellow-400';
      default: return 'from-delayed to-red-400';
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, item: {id: string, duration: number}) => {
      setDraggedItem({ id: item.id, durationDays: item.duration });
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', item.id);
      e.currentTarget.style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
      e.currentTarget.style.opacity = '1';
      setDraggedItem(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (!draggedItem || !timelineContainerRef.current) return;

      const rect = timelineContainerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - 250; // 250 is the width of the label column
      const dayIndex = Math.max(0, Math.floor(x / 40)); // 40 is the width of each day column

      if (dayIndex >= timelineDays.length) return;

      const newStartDate = new Date(timelineDays[dayIndex]);
      const newEndDate = new Date(newStartDate);
      newEndDate.setDate(newStartDate.getDate() + draggedItem.durationDays - 1);

      setDemands(prevDemands => 
          prevDemands.map(d => 
              d.id === draggedItem.id 
              ? { ...d, dateStart: formatDateForInput(newStartDate), dateEnd: formatDateForInput(newEndDate) } 
              : d
          )
      );
      
      setDraggedItem(null);
  };

  if (demands.length > 0 && ganttItems.length === 0) {
    return (
      <div className="flex-grow flex items-center justify-center text-gray-text p-5">
          <div className="text-center">
            <i className="fas fa-calendar-times fa-3x mb-4"></i>
            <h3 className="text-xl font-semibold text-light">Nenhuma demanda com datas</h3>
            <p>Adicione datas de início e fim às suas demandas para visualizá-las no gráfico de Gantt.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow p-5 overflow-auto bg-bg-main">
        <div 
            ref={timelineContainerRef}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="relative" 
            style={{ minWidth: `${timelineDays.length * 40 + 250}px` }}
        >
            {/* Header */}
            <div className="sticky top-0 z-10 grid bg-bg-main" style={{ gridTemplateColumns: `250px repeat(${timelineDays.length}, 40px)` }}>
                <div className="font-bold text-light p-2 border-b-2 border-border-color">Demandas</div>
                {timelineDays.map((day, i) => (
                    <div key={i} className="text-center text-xs text-gray-text p-2 border-b-2 border-l border-border-color">
                        {formatBrDate(day)}
                    </div>
                ))}
            </div>

            {/* Rows */}
            <div className="relative">
                {ganttItems.map((item, i) => (
                    <div key={item.id} className="grid items-center h-12" style={{ gridTemplateColumns: `250px repeat(${timelineDays.length}, 40px)`}}>
                        <div className="text-sm text-light font-semibold truncate px-2 py-1 border-r border-t border-border-color h-full flex items-center">{item.client}</div>
                        <div 
                            className="h-full col-start-2 border-t border-border-color" 
                            style={{ gridColumnEnd: timelineDays.length + 2 }}
                        >
                            {/* The actual bar container */}
                            <div 
                                className="h-full relative"
                                style={{
                                    gridColumnStart: item.startOffset,
                                    gridColumnEnd: `span ${item.duration}`,
                                }}
                            >
                                <div 
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, item)}
                                    onDragEnd={handleDragEnd}
                                    onClick={() => onEdit(item)}
                                    className="absolute top-2 bottom-2 left-0 right-1 rounded-md shadow-md hover:scale-105 hover:shadow-xl transition-transform duration-200 cursor-move"
                                    title={`${item.client} - ${item.service}`}
                                >
                                    <div className={`h-full w-full flex items-center px-2 rounded bg-gradient-to-r ${getBarColor(item.status)}`}>
                                        <i className="fas fa-truck text-white mr-2 text-base"></i>
                                        <span className="text-white text-xs font-bold truncate">{item.service}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                {/* Vertical grid lines */}
                 <div className="absolute top-0 left-[250px] h-full flex pointer-events-none">
                    {timelineDays.map((_, i) => (
                        <div key={i} className="w-10 h-full border-l border-border-color/50"></div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
};

export default GanttView;
