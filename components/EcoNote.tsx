import React, { useState } from 'react';
import { useAppStore } from '../hooks/useAppStore';
import { Note } from '../types';

const NoteCard: React.FC<{ note: Note }> = ({ note }) => {
    const { updateNote, deleteNote, toggleNoteLock } = useAppStore();

    const cardColors = {
        yellow: 'bg-yellow-200 border-yellow-300 text-yellow-800',
        pink: 'bg-pink-200 border-pink-300 text-pink-800',
        blue: 'bg-blue-200 border-blue-300 text-blue-800',
        green: 'bg-green-200 border-green-300 text-green-800',
    };

    const headerColors = {
        yellow: 'bg-yellow-300',
        pink: 'bg-pink-300',
        blue: 'bg-blue-300',
        green: 'bg-green-300',
    };

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        updateNote(note.id, e.target.value);
    };
    
    return (
        <div className={`rounded-lg shadow-md flex flex-col transform transition-transform duration-200 hover:scale-105 hover:shadow-xl ${cardColors[note.color]}`}>
            <div className={`p-2 rounded-t-lg flex justify-end items-center gap-2 ${headerColors[note.color]}`}>
                <button 
                    onClick={() => toggleNoteLock(note.id)} 
                    className="text-sm hover:text-white transition-colors"
                    title={note.isLocked ? 'Desbloquear' : 'Bloquear'}
                >
                    <i className={`fas ${note.isLocked ? 'fa-lock' : 'fa-lock-open'}`}></i>
                </button>
                <button 
                    onClick={() => deleteNote(note.id)} 
                    className="text-sm hover:text-white transition-colors"
                    title="Apagar nota"
                >
                    <i className="fas fa-trash-alt"></i>
                </button>
            </div>
            <textarea
                value={note.content}
                onChange={handleContentChange}
                disabled={note.isLocked}
                className="flex-grow p-4 bg-transparent resize-none focus:outline-none disabled:cursor-not-allowed font-medium"
                placeholder="Nota vazia..."
                rows={6}
            />
            <div className="p-2 text-xs text-right opacity-70 border-t border-current border-opacity-20">
                {new Date(note.timestamp).toLocaleDateString('pt-BR')}
            </div>
        </div>
    );
};


const EcoNote: React.FC = () => {
    const { notes, addNote } = useAppStore();
    const [newNoteContent, setNewNoteContent] = useState('');
    const [newNoteColor, setNewNoteColor] = useState<'yellow' | 'pink' | 'blue' | 'green'>('yellow');

    const handleAddNote = (e: React.FormEvent) => {
        e.preventDefault();
        if (newNoteContent.trim()) {
            addNote({
                content: newNoteContent,
                color: newNoteColor,
            });
            setNewNoteContent('');
        }
    };

    const colorOptions: Array<Note['color']> = ['yellow', 'pink', 'blue', 'green'];
    const colorClasses = {
        yellow: 'bg-yellow-300',
        pink: 'bg-pink-300',
        blue: 'bg-blue-300',
        green: 'bg-green-300',
    };

    return (
        <div className="space-y-6">
            <div className="bg-bg-card rounded-lg p-5 shadow-lg">
                <h2 className="text-xl font-bold text-light mb-4 flex items-center gap-3">
                    <i className="fas fa-plus-circle text-primary"></i>
                    Adicionar Nova Nota
                </h2>
                <form onSubmit={handleAddNote} className="space-y-4">
                    <textarea
                        value={newNoteContent}
                        onChange={(e) => setNewNoteContent(e.target.value)}
                        className="w-full p-3 bg-bg-main border border-border-color rounded-md text-light focus:outline-none focus:ring-2 focus:ring-secondary"
                        rows={4}
                        placeholder="Escreva sua nota aqui..."
                        required
                    />
                    <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <span className="text-gray-text">Cor:</span>
                            {colorOptions.map(color => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setNewNoteColor(color)}
                                    className={`w-8 h-8 rounded-full transition-transform transform hover:scale-110 ${colorClasses[color]} ${newNoteColor === color ? 'ring-2 ring-offset-2 ring-offset-bg-card ring-white' : ''}`}
                                    title={`Cor ${color}`}
                                />
                            ))}
                        </div>
                        <button type="submit" className="px-6 py-2 bg-primary text-white font-semibold rounded-md hover:bg-opacity-90 shadow-md hover:shadow-lg transition-shadow">
                            Adicionar Nota
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-bg-card rounded-lg p-5 shadow-lg">
                <h2 className="text-xl font-bold text-light mb-4 flex items-center gap-3">
                     <i className="fas fa-clipboard-list text-primary"></i>
                     Quadro de Notas
                </h2>
                 {notes.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {notes.map(note => (
                            <NoteCard key={note.id} note={note} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-text py-10">
                        <i className="fas fa-sticky-note fa-3x mb-4"></i>
                        <p>Seu quadro de notas está vazio.</p>
                        <p>Adicione uma nova nota acima para começar!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EcoNote;
