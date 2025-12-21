
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Demand, Comment, User } from '../types';
import { base64ToSrc } from '../services/fileService';
import { useAuth } from '../hooks/useAuth';
import { useAppStore } from '../hooks/useAppStore';

interface DemandDetailsModalProps {
  demand: Demand | null;
  onClose: () => void;
  onEdit: (demand: Demand) => void;
}

const DetailItem: React.FC<{ label: string; value: React.ReactNode; className?: string }> = ({ label, value, className }) => (
    <div className={className}>
        <p className="text-sm text-gray-text">{label}</p>
        <p className="text-light font-semibold">{value || '-'}</p>
    </div>
);

const DemandDetailsModal: React.FC<DemandDetailsModalProps> = ({ demand, onClose, onEdit }) => {
    const { currentUser, users } = useAuth();
    const { addNotification, setDemands } = useAppStore();
    const [commentText, setCommentText] = useState('');
    const [showMentionList, setShowMentionList] = useState(false);
    const commentInputRef = useRef<HTMLTextAreaElement>(null);

    const urgencyColorMap = {
        'Baixa': 'bg-green-500/20 text-green-300',
        'Média': 'bg-yellow-500/20 text-yellow-300',
        'Alta': 'bg-orange-500/20 text-orange-300',
        'Crítica': 'bg-red-500/20 text-red-300',
    };

    const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setCommentText(value);

        // Detectar o @ para mostrar a lista de usuários
        const lastChar = value[value.length - 1];
        if (lastChar === '@') {
            setShowMentionList(true);
        } else if (lastChar === ' ' || value === '') {
            setShowMentionList(false);
        }
    };

    const handleSelectMention = (user: User) => {
        setCommentText(prev => prev + user.name + ' ');
        setShowMentionList(false);
        commentInputRef.current?.focus();
    };

    const handleAddComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim() || !demand) return;

        // Detectar menções no texto para notificação
        const mentionedUsers = users.filter(u => commentText.includes(`@${u.name}`));
        mentionedUsers.forEach(u => {
            addNotification({
                message: `Você foi mencionado por ${currentUser?.name} na demanda ${demand.id}`,
                type: 'warning'
            });
        });

        const newComment: Comment = {
            id: `c-${Date.now()}`,
            text: commentText,
            author: currentUser?.name || 'Sistema',
            date: new Date().toLocaleString('pt-BR'),
            mentions: mentionedUsers.map(u => u.name)
        };

        const updatedDemand = {
            ...demand,
            comments: [newComment, ...(demand.comments || [])]
        };

        setDemands(prev => prev.map(d => d.id === demand.id ? updatedDemand : d));
        setCommentText('');
    };

    const renderTextWithMentions = (text: string) => {
        const parts = text.split(/(@[a-zA-Z\s]+)/g);
        return parts.map((part, i) => {
            if (part.startsWith('@')) {
                return <span key={i} className="text-secondary font-bold bg-secondary/10 px-1 rounded">{part}</span>;
            }
            return part;
        });
    };

    if (!demand) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1001] backdrop-blur-sm" onClick={onClose}>
            <div className="bg-bg-card p-8 rounded-2xl shadow-2xl w-full max-w-5xl text-light max-h-[90vh] overflow-hidden flex flex-col border border-border-color" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-3xl font-black mb-1">Detalhes da Operação</h2>
                        <p className="text-secondary font-mono bg-secondary/10 px-3 py-1 rounded-full text-xs inline-block tracking-widest">{demand.id}</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-bg-main text-gray-text hover:text-light transition-all text-2xl">&times;</button>
                </div>

                <div className="flex-grow overflow-y-auto custom-scrollbar pr-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Coluna de Informações */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-bg-main/30 p-6 rounded-2xl border border-border-color/30">
                                <DetailItem label="Cliente" value={demand.client} />
                                <DetailItem label="Contato" value={demand.contact} />
                                <DetailItem label="Setor" value={demand.setor} />
                                <DetailItem label="Data de Criação" value={demand.date} />
                                <DetailItem label="Prazo Final" value={demand.prazo ? new Date(demand.prazo).toLocaleString('pt-BR') : '-'} />
                                <div className="form-group">
                                    <p className="text-xs text-gray-500 uppercase font-black tracking-widest mb-1">Urgência</p>
                                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${urgencyColorMap[demand.urgencia as keyof typeof urgencyColorMap]}`}>{demand.urgencia}</span>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Escopo do Serviço</h3>
                                <div className="bg-bg-main p-5 rounded-2xl border border-border-color/50">
                                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-300">{demand.service}</pre>
                                </div>
                            </div>

                            {demand.photos.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Registros Fotográficos</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {demand.photos.map(photo => (
                                            <a key={photo.id} href={base64ToSrc(photo.src, 'image/jpeg')} target="_blank" rel="noopener noreferrer" className="group relative">
                                                <img src={base64ToSrc(photo.src, 'image/jpeg')} alt={photo.name} className="w-full h-32 object-cover rounded-xl shadow-md group-hover:scale-105 transition-all duration-300" />
                                                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl"><i className="fas fa-search-plus text-white"></i></div>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Coluna de Interação / Comentários */}
                        <div className="lg:col-span-1 flex flex-col h-full bg-bg-main/20 rounded-2xl border border-border-color/30 overflow-hidden">
                            <div className="p-4 border-b border-border-color/50 bg-bg-main/40">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary">Atenção e Comentários</h3>
                            </div>
                            
                            <div className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar min-h-[300px]">
                                {demand.comments && demand.comments.length > 0 ? (
                                    demand.comments.map(comment => (
                                        <div key={comment.id} className="bg-bg-card p-3 rounded-xl border border-border-color/50 animate-fade-in shadow-sm">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-[10px] font-black text-primary uppercase">{comment.author}</span>
                                                <span className="text-[9px] text-gray-500">{comment.date}</span>
                                            </div>
                                            <p className="text-xs text-gray-300 leading-relaxed">
                                                {renderTextWithMentions(comment.text)}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-600 text-center p-6">
                                        <i className="fas fa-comments text-3xl mb-2 opacity-20"></i>
                                        <p className="text-[11px] font-bold">Nenhum comentário. Use @ para marcar alguém.</p>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 bg-bg-card border-t border-border-color/50 relative">
                                {showMentionList && (
                                    <div className="absolute bottom-full left-0 w-full bg-bg-card border border-border-color shadow-2xl rounded-t-xl overflow-hidden z-20 animate-slide-up">
                                        <div className="p-2 bg-bg-main text-[9px] font-black text-gray-500 uppercase tracking-widest border-b border-border-color">Marcar para atenção:</div>
                                        <div className="max-h-40 overflow-y-auto custom-scrollbar">
                                            {users.map(u => (
                                                <button key={u.id} onClick={() => handleSelectMention(u)} className="w-full text-left p-3 hover:bg-primary/10 text-xs font-bold text-gray-300 hover:text-primary transition-colors flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-md bg-bg-main border border-border-color flex items-center justify-center text-[8px]">{u.name[0]}</div>
                                                    {u.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                <form onSubmit={handleAddComment}>
                                    <textarea
                                        ref={commentInputRef}
                                        value={commentText}
                                        onChange={handleCommentChange}
                                        placeholder="Escreva algo ou use @ para atenção..."
                                        className="w-full bg-bg-main border border-border-color/50 rounded-xl p-3 text-xs text-light focus:border-secondary transition-all outline-none resize-none"
                                        rows={3}
                                    />
                                    <div className="flex justify-between items-center mt-3">
                                        <div className="flex gap-2">
                                            <button type="button" onClick={() => setCommentText(prev => prev + '@')} className="text-gray-500 hover:text-secondary p-1"><i className="fas fa-at"></i></button>
                                        </div>
                                        <button type="submit" className="bg-secondary text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg hover:bg-secondary/80 transition-all shadow-lg shadow-secondary/20">
                                            Enviar
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-border-color/30">
                    <button onClick={() => { onEdit(demand); onClose(); }} className="px-8 py-3 bg-primary text-white font-black uppercase tracking-widest rounded-xl hover:opacity-90 shadow-xl shadow-primary/20 transition-all transform hover:-translate-y-1">
                        <i className="fas fa-edit mr-2"></i>Editar Demanda
                    </button>
                    <button onClick={onClose} className="px-8 py-3 bg-bg-main text-gray-text font-black uppercase tracking-widest rounded-xl hover:text-light transition-all">Fechar</button>
                </div>
            </div>
        </div>
    );
};

export default DemandDetailsModal;
