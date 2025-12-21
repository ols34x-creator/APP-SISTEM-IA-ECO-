
import React, { useState, useMemo } from 'react';
import { useAppStore } from '../hooks/useAppStore';

const History: React.FC = () => {
    const { history, clearHistory } = useAppStore();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredHistory = useMemo(() => {
        if (!searchTerm.trim()) {
            return history;
        }
        return history.filter(log => 
            log.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.timestamp.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [history, searchTerm]);

    return (
        <div className="bg-bg-card rounded-lg p-5 shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <h3 className="text-lg font-semibold text-light">Histórico de Atividades do Sistema</h3>
                <button 
                    onClick={clearHistory}
                    className="px-4 py-2 bg-border-color text-light font-semibold rounded-md hover:bg-opacity-90 flex items-center gap-2"
                >
                    <i className="fas fa-trash"></i> Limpar Histórico
                </button>
            </div>
            <div className="mb-4 relative">
                <input
                    type="text"
                    placeholder="Pesquisar ações ou hora..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-bg-main border border-border-color rounded-md py-2 pl-10 pr-4 text-light focus:outline-none focus:ring-2 focus:ring-secondary"
                    aria-label="Search history"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-search text-gray-text"></i>
                </div>
            </div>
            <div className="h-96 bg-bg-main border border-border-color rounded p-4 overflow-y-auto font-mono text-sm text-gray-text space-y-2">
                {filteredHistory.length > 0 ? filteredHistory.map((log) => (
                    <div key={log.id}>
                        <span className="text-secondary mr-2">[{new Date(log.timestamp).toLocaleString('pt-BR')}]</span>
                        <span className="text-light">{log.content}</span>
                    </div>
                )) : (
                    <p>
                        {searchTerm 
                            ? 'Nenhuma atividade encontrada para o termo pesquisado.'
                            : 'Nenhuma atividade registrada.'
                        }
                    </p>
                )}
            </div>
        </div>
    );
};

export default History;