
import React from 'react';
import { useAuth } from '../hooks/useAuth';

const OnlineUsersPanel: React.FC = () => {
    const { users, currentUser } = useAuth();

    // Simulação de status online (em um app real viria do Firebase/Socket)
    const onlineStatusMap: Record<string, 'online' | 'away'> = {
        [currentUser?.id || '']: 'online',
        'user-1': 'online',
        'user-2': 'away',
        'user-4': 'online'
    };

    return (
        <div className="mt-4 border-t border-border-color/20 pt-4 px-3">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Usuários Online</h3>
                <span className="flex h-2 w-2 rounded-full bg-success animate-pulse"></span>
            </div>
            
            <div className="space-y-3">
                {users.slice(0, 5).map(user => {
                    const status = onlineStatusMap[user.id] || 'away';
                    const isMe = user.id === currentUser?.id;

                    return (
                        <div key={user.id} className="flex items-center gap-3 group">
                            <div className="relative">
                                <div className="w-8 h-8 rounded-lg bg-bg-main border border-border-color/50 flex items-center justify-center text-[10px] font-bold text-gray-400 group-hover:border-primary/50 transition-all">
                                    {user.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <span className={`absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-bg-card ${status === 'online' ? 'bg-success' : 'bg-gray-600'}`}></span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-bold text-light truncate leading-none">
                                    {user.name} {isMe && <span className="text-[9px] text-primary">(Eu)</span>}
                                </p>
                                <p className="text-[9px] text-gray-500 font-medium uppercase tracking-wider mt-1">{user.sector}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            <button className="w-full mt-4 py-2 border border-border-color/30 rounded-lg text-[9px] font-black uppercase tracking-widest text-gray-500 hover:bg-bg-main hover:text-light transition-all">
                Ver Todos Usuários
            </button>
        </div>
    );
};

export default OnlineUsersPanel;
