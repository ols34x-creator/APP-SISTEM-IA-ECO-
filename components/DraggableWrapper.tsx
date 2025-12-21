import React from 'react';

interface DraggableWrapperProps {
  id: string;
  isDraggable: boolean;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, targetId: string) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  children: React.ReactNode;
}

const DraggableWrapper: React.FC<DraggableWrapperProps> = ({ id, isDraggable, onDragStart, onDrop, onDragOver, onDragEnd, children }) => {

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    onDragStart(e, id);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Prevent default to allow drop
    onDrop(e, id);
  };
  
  return (
    <div
      draggable={isDraggable}
      onDragStart={isDraggable ? handleDragStart : undefined}
      onDragEnd={isDraggable ? onDragEnd : undefined}
      onDrop={isDraggable ? handleDrop : undefined}
      onDragOver={isDraggable ? onDragOver : undefined}
      className={`transition-all duration-300 ${isDraggable ? 'border-2 border-dashed border-secondary p-2 rounded-lg my-2 cursor-move relative' : ''}`}
    >
      {isDraggable && <div className="absolute top-2 right-3 text-secondary" title="Arraste para mover"><i className="fas fa-arrows-alt"></i></div>}
      {children}
    </div>
  );
};

export default DraggableWrapper;
