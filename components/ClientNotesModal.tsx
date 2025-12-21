
import React, { useState } from 'react';
import { ClientNote } from '../types';
import { XIcon, PlusIcon } from './icons';

interface ClientNotesModalProps {
    isOpen: boolean;
    onClose: () => void;
    clientName: string;
    notes: ClientNote[];
    onAddClientNote: (note: ClientNote) => void;
}

const ClientNotesModal: React.FC<ClientNotesModalProps> = ({ isOpen, onClose, clientName, notes, onAddClientNote }) => {
    const [newNote, setNewNote] = useState('');

    const clientNotes = notes.filter(n => n.clientName === clientName);

    const handleAdd = () => {
        if (newNote.trim()) {
            onAddClientNote({
                id: `note-${Date.now()}`,
                clientName,
                text: newNote,
                date: new Date().toLocaleDateString('pt-BR')
            });
            setNewNote('');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Observações para: <span className="text-blue-600">{clientName}</span></h3>
                    <button onClick={onClose}><XIcon className="w-5 h-5 text-slate-500" /></button>
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 h-64 overflow-y-auto mb-4 border border-slate-200 dark:border-slate-700">
                    {clientNotes.length === 0 ? (
                        <p className="text-center text-slate-400 text-sm mt-10">Nenhuma observação cadastrada para este cliente.</p>
                    ) : (
                        <ul className="space-y-3">
                            {clientNotes.map(note => (
                                <li key={note.id} className="bg-white dark:bg-slate-800 p-3 rounded shadow-sm text-sm border border-slate-100 dark:border-slate-700">
                                    <p className="text-slate-700 dark:text-slate-200 mb-1">{note.text}</p>
                                    <p className="text-xs text-slate-400 text-right">{note.date}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="flex gap-2">
                    <textarea 
                        value={newNote}
                        onChange={e => setNewNote(e.target.value)}
                        placeholder="Adicionar nova observação..."
                        className="flex-1 p-2 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                        rows={2}
                    />
                    <button onClick={handleAdd} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1 font-semibold">
                        <PlusIcon className="w-4 h-4" /> Salvar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClientNotesModal;
