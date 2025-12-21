
import React, { useState } from 'react';
import KanbanBoard from './KanbanBoard';
import NewDemandModal from './NewDemandModal';
import ImageEditModal from './ImageEditModal';
import DemandDetailsModal from './DemandDetailsModal';
import { Demand, Photo, DemandStatus } from '../types';
import GanttView from './GanttView';
import { useAppStore } from '../hooks/useAppStore';
import { useLanguage } from '../hooks/useLanguage';

const DemandDashboard: React.FC = () => {
  const { demands, setDemands, columnTitles, setColumnTitles, addKanbanColumn, removeKanbanColumn } = useAppStore();
  const { t } = useLanguage();
  const [isNewDemandModalOpen, setIsNewDemandModalOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [viewingDemand, setViewingDemand] = useState<Demand | null>(null);
  const [demandToEdit, setDemandToEdit] = useState<Demand | null>(null);
  const [viewMode, setViewMode] = useState<'kanban' | 'gantt'>('kanban');
  const [defaultStatusForNewDemand, setDefaultStatusForNewDemand] = useState<DemandStatus>('demandas');

  const formatDateBR = (date: Date) => date.toLocaleDateString('pt-BR');
  const generateProtocolo = () => `ECOLOG-${Math.floor(Math.random() * 9000) + 1000}`;

  const handleSaveDemand = (demandData: Omit<Demand, 'id' | 'date' | 'status'>, id?: string) => {
    if (id) {
        // Editing existing demand
        setDemands(prev => prev.map(d => (d.id === id ? { ...d, ...demandData } : d)));
    } else {
        // Creating new demand
        const newDemand: Demand = {
            ...demandData,
            id: generateProtocolo(),
            date: formatDateBR(new Date()),
            status: defaultStatusForNewDemand,
        };
        setDemands(prev => [...prev, newDemand]);
    }
    setIsNewDemandModalOpen(false);
    setDemandToEdit(null);
  };
  
  const handleOpenImageEditor = (photo: Photo) => {
    setEditingPhoto(photo);
  };
  
  const handleCloseImageEditor = () => {
    setEditingPhoto(null);
  };

  const handleSaveEditedImage = (editedPhoto: Photo) => {
      // In a real app, you'd find the demand and update the photo within it.
      // For this example, we'll log it, assuming the NewDemandModal handles its internal state.
      console.log("Image to be saved in modal state:", editedPhoto);
      setEditingPhoto(null); // Close the modal
  };

  const handleOpenNewDemandModal = (status: DemandStatus = 'demandas') => {
    setDemandToEdit(null);
    setDefaultStatusForNewDemand(status);
    setIsNewDemandModalOpen(true);
  }

  const handleEditDemand = (demand: Demand) => {
    setDemandToEdit(demand);
    setIsNewDemandModalOpen(true);
  }

  const handleDeleteDemand = (id: string) => {
    setDemands(prev => prev.filter(d => d.id !== id));
  };

  const handleStatusChange = (id: string, newStatus: DemandStatus) => {
      setDemands(prev => prev.map(d => d.id === id ? { ...d, status: newStatus } : d));
  };


  const handleUpdateColumnTitle = (status: DemandStatus, newTitle: string) => {
    setColumnTitles(prev => ({ ...prev, [status]: newTitle }));
  };

  return (
    <div className="relative h-[calc(100vh-250px)] flex flex-col">
       <div className="flex justify-between items-center px-5 pt-2">
            <h2 className="text-2xl font-bold text-light">{t('demandDashboard')}</h2>
            <div className="flex items-center gap-2 p-1 rounded-lg bg-bg-main">
                <button 
                    onClick={() => setViewMode('kanban')} 
                    className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${viewMode === 'kanban' ? 'bg-secondary text-white' : 'text-gray-text hover:bg-border-color'}`}
                >
                    <i className="fas fa-th-large mr-2"></i>Kanban
                </button>
                <button 
                    onClick={() => setViewMode('gantt')} 
                    className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${viewMode === 'gantt' ? 'bg-secondary text-white' : 'text-gray-text hover:bg-border-color'}`}
                >
                    <i className="fas fa-chart-bar mr-2"></i>Gantt
                </button>
            </div>
       </div>

      {viewMode === 'kanban' ? (
        <KanbanBoard 
          demands={demands} 
          setDemands={setDemands} 
          onCardClick={setViewingDemand} 
          onAddDemand={handleOpenNewDemandModal}
          columnTitles={columnTitles}
          onUpdateColumnTitle={handleUpdateColumnTitle}
          onEdit={handleEditDemand}
          onDelete={handleDeleteDemand}
          onStatusChange={handleStatusChange}
          onAddColumn={addKanbanColumn}
          onRemoveColumn={removeKanbanColumn}
        />
      ) : (
        <GanttView demands={demands} onEdit={handleEditDemand} setDemands={setDemands} />
      )}
      
      <button 
        onClick={() => handleOpenNewDemandModal()}
        className="fixed bottom-8 right-8 w-16 h-16 bg-secondary text-white border-none rounded-full text-3xl flex items-center justify-center cursor-pointer shadow-lg transition-all duration-200 ease-in-out hover:scale-110 hover:rotate-90 hover:shadow-2xl z-[1000]"
        title="Adicionar Nova Demanda"
      >
        <i className="fas fa-plus"></i>
      </button>

      <NewDemandModal
        isOpen={isNewDemandModalOpen}
        onClose={() => { setIsNewDemandModalOpen(false); setDemandToEdit(null); }}
        onSave={handleSaveDemand}
        openImageEditor={handleOpenImageEditor}
        demandToEdit={demandToEdit}
      />
      
      <ImageEditModal
        photo={editingPhoto}
        onClose={handleCloseImageEditor}
        onSave={handleSaveEditedImage}
      />
      
      <DemandDetailsModal demand={viewingDemand} onClose={() => setViewingDemand(null)} onEdit={handleEditDemand} />
    </div>
  );
};

export default DemandDashboard;
