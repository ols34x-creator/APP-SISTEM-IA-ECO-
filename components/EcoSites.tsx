import React, { useState, useEffect } from 'react';
import { useAppStore } from '../hooks/useAppStore';

const EcoSites: React.FC = () => {
    const { ecoSites, addEcoSite, deleteEcoSite } = useAppStore();
    const [activeSiteId, setActiveSiteId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newSiteTitle, setNewSiteTitle] = useState('');
    const [newSiteUrl, setNewSiteUrl] = useState('');

    useEffect(() => {
        // Automatically select the first site if none is selected and sites exist
        if (!activeSiteId && ecoSites.length > 0) {
            setActiveSiteId(ecoSites[0].id);
        } else if (activeSiteId && !ecoSites.find(s => s.id === activeSiteId) && ecoSites.length > 0) {
            // If active site was deleted, select the first available
            setActiveSiteId(ecoSites[0].id);
        } else if (ecoSites.length === 0) {
            setActiveSiteId(null);
        }
    }, [ecoSites, activeSiteId]);

    const handleAddSite = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSiteTitle.trim() || !newSiteUrl.trim()) {
            alert("Preencha título e URL.");
            return;
        }

        // Basic URL validation/fix
        let formattedUrl = newSiteUrl.trim();
        if (!/^https?:\/\//i.test(formattedUrl)) {
            formattedUrl = 'https://' + formattedUrl;
        }

        addEcoSite({ title: newSiteTitle, url: formattedUrl });
        setIsModalOpen(false);
        setNewSiteTitle('');
        setNewSiteUrl('');
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm("Tem certeza que deseja remover este site?")) {
            deleteEcoSite(id);
        }
    };

    const activeSite = ecoSites.find(s => s.id === activeSiteId);

    return (
        <div className="bg-bg-card rounded-lg shadow-lg h-[calc(100vh-150px)] flex flex-col overflow-hidden">
            {/* Header / Tabs */}
            <div className="flex border-b border-border-color bg-bg-main overflow-x-auto items-center">
                {ecoSites.map(site => (
                    <div 
                        key={site.id}
                        className={`group flex items-center px-6 py-4 cursor-pointer transition-colors border-r border-border-color min-w-[150px] justify-between
                            ${activeSiteId === site.id 
                                ? 'bg-bg-card text-primary border-t-2 border-t-primary' 
                                : 'text-gray-text hover:text-light hover:bg-bg-card/50'}`}
                        onClick={() => setActiveSiteId(site.id)}
                    >
                        <span className="font-semibold text-sm truncate mr-2">{site.title}</span>
                        <button 
                            onClick={(e) => handleDelete(site.id, e)}
                            className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-500 transition-opacity p-1"
                            title="Remover site"
                        >
                            <i className="fas fa-times text-xs"></i>
                        </button>
                    </div>
                ))}
                
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-4 text-gray-400 hover:text-primary hover:bg-bg-card/50 transition-colors flex items-center justify-center min-w-[50px]"
                    title="Adicionar Novo Site"
                >
                    <i className="fas fa-plus text-lg"></i>
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-grow relative bg-white">
                {activeSite ? (
                    <iframe
                        src={activeSite.url}
                        title={activeSite.title}
                        className="w-full h-full border-none"
                        sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 bg-bg-card">
                        <i className="fas fa-globe text-6xl mb-4 opacity-50"></i>
                        <h3 className="text-xl font-bold mb-2">Nenhum site selecionado</h3>
                        <p className="mb-6">Adicione URLs personalizadas para acesso rápido.</p>
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="px-6 py-3 bg-primary text-white rounded-md font-bold hover:bg-opacity-90 shadow-lg"
                        >
                            <i className="fas fa-plus mr-2"></i> Adicionar Site
                        </button>
                    </div>
                )}
            </div>

            {/* Add Site Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[2000]" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-bg-card p-6 rounded-lg shadow-xl w-full max-w-md border border-border-color" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-light">Adicionar Novo Site</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <form onSubmit={handleAddSite} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Título / Nome</label>
                                <input 
                                    type="text" 
                                    value={newSiteTitle}
                                    onChange={e => setNewSiteTitle(e.target.value)}
                                    className="w-full bg-bg-main border border-border-color rounded p-2 text-light focus:border-primary outline-none"
                                    placeholder="Ex: Painel de Pedidos"
                                    autoFocus
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">URL (Endereço Web)</label>
                                <input 
                                    type="text" 
                                    value={newSiteUrl}
                                    onChange={e => setNewSiteUrl(e.target.value)}
                                    className="w-full bg-bg-main border border-border-color rounded p-2 text-light focus:border-primary outline-none"
                                    placeholder="Ex: https://meusite.com"
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-border-color rounded text-light hover:bg-opacity-80">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-primary text-white font-bold rounded hover:bg-opacity-90">Adicionar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EcoSites;