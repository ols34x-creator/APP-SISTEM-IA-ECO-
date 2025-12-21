
import React, { useState, useEffect, useMemo } from 'react';
import { useAppStore, SIDEBAR_MENU_STRUCTURE } from '../hooks/useAppStore';
import { useAuth } from '../hooks/useAuth';
import { TabId } from '../types';
import ChatWidget from './ChatWidget';
import NotificationPanel from './NotificationPanel';
import { useLanguage } from '../hooks/useLanguage';
import LayoutSettingsModal from './LayoutSettingsModal';
import { SettingsModal } from './SettingsModal';
import MusicPlayer from './MusicPlayer';
import OnlineUsersPanel from './OnlineUsersPanel';

interface SidebarProps {
    onSettingsClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onSettingsClick }) => {
    const { activeTab, setActiveTab, isSidebarPinned, setIsSidebarPinned } = useAppStore();
    const { currentUser } = useAuth();
    const { t } = useLanguage();
    
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

    const filteredMenu = useMemo(() => {
        if (!currentUser) return [];
        return SIDEBAR_MENU_STRUCTURE.filter(section => {
            const hasSectionRole = !section.roles || section.roles.includes(currentUser.role);
            const hasSectionSector = !section.sectors || section.sectors.includes(currentUser.sector);
            if (currentUser.role !== 'Admin' && (!hasSectionRole || !hasSectionSector)) return false;
            const visibleItems = section.items.filter(item => {
                const hasItemRole = !item.roles || item.roles.includes(currentUser.role);
                const hasItemSector = !item.sectors || item.sectors.includes(currentUser.sector);
                return currentUser.role === 'Admin' || (hasItemRole && hasItemSector);
            });
            return visibleItems.length > 0;
        }).map(section => ({
            ...section,
            items: section.items.filter(item => {
                const hasItemRole = !item.roles || item.roles.includes(currentUser.role);
                const hasItemSector = !item.sectors || item.sectors.includes(currentUser.sector);
                return currentUser.role === 'Admin' || (hasItemRole && hasItemSector);
            })
        }));
    }, [currentUser]);

    useEffect(() => {
        const currentSection = filteredMenu.find(section => 
            section.items.some(item => item.id === activeTab)
        );
        if (currentSection) {
             setExpandedSections(prev => ({ ...prev, [currentSection.id]: true }));
        }
    }, [activeTab, filteredMenu]);

    const toggleSection = (sectionId: string) => {
        setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
    };

    const handleQuickEmail = () => {
        const subject = encodeURIComponent("Suporte EcoLog - Solicitação");
        const body = encodeURIComponent(`Olá, sou ${currentUser?.name}.\nPreciso de suporte no seguinte:\n`);
        window.location.href = `mailto:suporte@ecolog.com?subject=${subject}&body=${body}`;
    };

    return (
        <nav className={`fixed top-0 left-0 h-full bg-bg-card/95 backdrop-blur-xl border-r border-border-color/50 z-50 transition-all duration-500 ease-in-out flex flex-col ${isSidebarPinned ? 'w-72' : 'w-[70px] hover:w-72 group shadow-2xl'}`}>
            <div className="flex-shrink-0 flex items-center px-5 h-20 text-light overflow-hidden border-b border-border-color/20">
                <div className="min-w-[30px] h-[30px] bg-gradient-to-tr from-primary to-secondary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                    <i className="fas fa-brain text-white text-sm"></i>
                </div>
                <span className={`ml-4 font-black text-xl tracking-tighter transition-all duration-300 whitespace-nowrap ${isSidebarPinned ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    ECO.<span className="text-primary">IA</span>
                </span>
            </div>
            
            <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar py-6 px-2">
                <ul className="space-y-1.5">
                    {filteredMenu.map(section => {
                        const isExpanded = !!expandedSections[section.id];
                        const hasActiveItem = section.items.some(item => item.id === activeTab);

                        return (
                            <li key={section.id} className="mb-2">
                                <button
                                    onClick={() => toggleSection(section.id)}
                                    className={`flex items-center justify-between w-full p-3 rounded-xl transition-all duration-300
                                        ${hasActiveItem ? 'text-primary' : 'text-gray-text'} 
                                        ${isExpanded ? 'bg-bg-main/40' : 'hover:bg-border-color/30 hover:text-light'}
                                    `}
                                >
                                    <div className="flex items-center">
                                        <span className={`text-lg w-[30px] flex justify-center transition-transform duration-300 ${hasActiveItem ? 'scale-110 text-primary' : ''}`}>
                                            <i className={`fas ${section.icon}`}></i>
                                        </span>
                                        <span className={`ml-4 font-bold text-[11px] uppercase tracking-[0.15em] transition-all duration-300 whitespace-nowrap ${isSidebarPinned ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0'}`}>
                                            {t(section.titleKey)}
                                        </span>
                                    </div>
                                    <i className={`fas fa-chevron-right text-[9px] transition-transform duration-300 
                                        ${isExpanded ? 'rotate-90' : ''} 
                                        ${isSidebarPinned ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                                    `}></i>
                                </button>
                                
                                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[800px] mt-1 opacity-100' : 'max-h-0 opacity-0'}`}>
                                    <ul className="space-y-1 pl-2">
                                        {section.items.map(item => {
                                            const isActive = activeTab === item.id;
                                            return (
                                                <li key={item.id}>
                                                    <button
                                                        onClick={() => setActiveTab(item.id as TabId)}
                                                        className={`flex items-center w-full p-2.5 rounded-lg transition-all duration-200 text-xs font-semibold
                                                            ${isActive
                                                                ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]'
                                                                : 'text-gray-400 hover:text-light hover:bg-border-color/20'
                                                            }`}
                                                    >
                                                        <span className="w-8 flex justify-center">
                                                            <i className={`fas ${item.icon} text-[14px]`}></i>
                                                        </span>
                                                        <span className={`ml-3 transition-all duration-300 whitespace-nowrap ${isSidebarPinned ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0'}`}>
                                                            {t(item.textKey)}
                                                        </span>
                                                    </button>
                                                </li>
                                            )
                                        })}
                                    </ul>
                                </div>
                            </li>
                        );
                    })}
                </ul>

                <div className={`${isSidebarPinned ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity duration-300`}>
                    <OnlineUsersPanel />
                </div>
            </div>

            <div className="flex-shrink-0 mt-auto border-t border-border-color/20 p-3 bg-bg-card/50">
                <button
                    onClick={handleQuickEmail}
                    className="flex items-center p-3 w-full text-gray-text hover:bg-secondary/10 hover:text-secondary rounded-xl transition-all duration-300 mb-2"
                >
                    <span className="text-lg w-[30px] flex justify-center text-secondary"><i className="fas fa-envelope"></i></span>
                    <span className={`ml-4 text-[10px] font-black uppercase tracking-widest transition-opacity duration-300 ${isSidebarPinned ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>Enviar E-mail</span>
                </button>

                {currentUser?.role === 'Admin' && (
                    <button
                        onClick={onSettingsClick}
                        className="flex items-center p-3 w-full text-gray-text hover:bg-warning/10 hover:text-warning rounded-xl transition-all duration-300 mb-2"
                    >
                        <span className="text-lg w-[30px] flex justify-center text-warning"><i className="fas fa-shield-alt"></i></span>
                        <span className={`ml-4 text-[10px] font-black uppercase tracking-widest transition-opacity duration-300 ${isSidebarPinned ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>Admin Settings</span>
                    </button>
                )}
                <button
                    onClick={() => setIsSidebarPinned(!isSidebarPinned)}
                    className="flex items-center p-3 w-full text-gray-text hover:bg-primary/10 hover:text-primary rounded-xl transition-all duration-300"
                >
                    <span className={`text-lg w-[30px] flex justify-center transition-transform duration-500 ${isSidebarPinned ? 'rotate-90 text-primary' : ''}`}>
                        <i className="fas fa-thumbtack"></i>
                    </span>
                    <span className={`ml-4 text-[10px] font-black uppercase tracking-widest transition-opacity duration-300 ${isSidebarPinned ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        {isSidebarPinned ? 'Lock Menu' : 'Pin Menu'}
                    </span>
                </button>
            </div>
        </nav>
    );
};

const Header: React.FC = () => {
    const { headerBehavior } = useAppStore();
    const { currentUser, logout } = useAuth();
    const { t } = useLanguage();
    const [isLayoutModalOpen, setIsLayoutModalOpen] = useState(false);
    const [date, setDate] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setDate(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const userInitials = currentUser?.name.split(' ').map(n => n[0]).join('').toUpperCase() || '..';

    const headerClass = `flex-shrink-0 bg-bg-card/80 backdrop-blur-md px-6 py-4 border-b border-border-color/50 z-40 ${headerBehavior === 'sticky' ? 'sticky top-0' : 'relative'}`;

    return (
        <>
        <header className={headerClass}>
            <div className="flex justify-between items-center max-w-[1600px] mx-auto">
                <div className="flex items-center gap-6">
                     <div className="hidden lg:flex flex-col">
                        <h2 className="text-sm font-bold text-light leading-none mb-1">Centro de Operações</h2>
                        <p className="text-[10px] text-primary uppercase font-black tracking-widest">{currentUser?.sector}</p>
                     </div>
                     <div className="h-8 w-px bg-border-color/50 hidden lg:block"></div>
                     <div className="text-xs font-mono text-gray-text bg-bg-main/50 px-3 py-1.5 rounded-lg border border-border-color/30 flex items-center gap-3">
                         <span className="text-secondary"><i className="far fa-calendar-alt mr-2"></i>{date.toLocaleDateString('pt-BR')}</span>
                         <span className="text-light font-bold"><i className="far fa-clock mr-2"></i>{date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                     </div>
                </div>

                <div className="flex items-center gap-4">
                    <button onClick={() => setIsLayoutModalOpen(true)} className="w-10 h-10 bg-bg-main border border-border-color/50 text-gray-text rounded-xl hover:text-primary hover:border-primary transition-all flex items-center justify-center shadow-inner" title="Interface">
                        <i className="fas fa-palette text-sm"></i>
                    </button>
                    
                    <div className="h-6 w-px bg-border-color/50 mx-1"></div>
                    
                    <div className="flex items-center gap-4 pl-2">
                        <div className="text-right hidden sm:block">
                            <div className="font-black text-[13px] text-light leading-none">{currentUser?.name}</div>
                            <div className="text-[9px] text-gray-text font-bold uppercase mt-1 tracking-widest">{currentUser?.role}</div>
                        </div>
                        <div className="relative group">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-secondary to-purple-600 p-0.5 shadow-lg cursor-pointer transform hover:scale-105 transition-all">
                                <div className="w-full h-full rounded-[10px] bg-bg-card flex items-center justify-center text-white font-black text-xs">{userInitials}</div>
                            </div>
                            <div className="absolute right-0 top-full mt-3 w-48 bg-bg-card border border-border-color shadow-2xl rounded-2xl p-2 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 transition-all z-[100]">
                                <div className="p-3 border-b border-border-color/50 mb-1">
                                    <p className="text-[10px] text-gray-text uppercase font-bold tracking-widest">Sessão Ativa</p>
                                    <p className="text-xs text-light font-bold truncate">{currentUser?.email || currentUser?.matricula}</p>
                                </div>
                                <button onClick={logout} className="w-full text-left p-3 text-red-400 hover:bg-red-400/10 rounded-xl transition-colors flex items-center gap-3 font-bold text-xs">
                                    <i className="fas fa-power-off"></i> Encerrar Acesso
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
        <LayoutSettingsModal isOpen={isLayoutModalOpen} onClose={() => setIsLayoutModalOpen(false)} />
        </>
    );
};

interface AppShellProps {
    children: React.ReactNode;
    onReturnToLanding: () => void;
}

const AppShell: React.FC<AppShellProps> = ({ children }) => {
    const { isMusicPlayerOpen, isSidebarPinned } = useAppStore();
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-bg-main text-gray-text selection:bg-primary/30">
            <Sidebar onSettingsClick={() => setIsSettingsModalOpen(true)} />
            
            <div className={`flex flex-col flex-1 transition-all duration-500 ease-in-out ${isSidebarPinned ? 'ml-72' : 'ml-[70px]'}`}>
                <Header />
                
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-bg-main/50 relative">
                    <div className="p-6 max-w-[1600px] mx-auto min-h-full flex flex-col">
                        {children}
                        
                        <footer className="mt-auto pt-12 pb-8 border-t border-border-color/20 text-center">
                            <div className="flex items-center justify-center gap-4 mb-3">
                                <div className="h-px w-12 bg-border-color/30"></div>
                                <i className="fas fa-brain text-primary text-sm opacity-50"></i>
                                <div className="h-px w-12 bg-border-color/30"></div>
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-text/40">
                                EcoLog Intelligence &bull; Core Engine v5.2 &bull; NeuroTech Systems
                            </p>
                        </footer>
                    </div>
                </div>
            </div>

            {isMusicPlayerOpen && <MusicPlayer />}
            <ChatWidget />
            <NotificationPanel />
            <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(var(--color-primary-val), 0.2);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(var(--color-primary-val), 0.5);
                }
                
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up { animation: fade-in-up 0.4s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default AppShell;
