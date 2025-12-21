
import React, { useState } from 'react';
import { XIcon } from './icons';

export interface ColumnConfig {
    key: string;
    header: string;
    visible: boolean;
}

interface ColumnCustomizerModalProps {
    isOpen: boolean;
    onClose: () => void;
    columns: ColumnConfig[];
    onSave: (columns: ColumnConfig[]) => void;
}

const ColumnCustomizerModal: React.FC<ColumnCustomizerModalProps> = ({ isOpen, onClose, columns, onSave }) => {
    const [localColumns, setLocalColumns] = useState(columns);

    const toggleColumn = (key: string) => {
        setLocalColumns(prev => prev.map(col => col.key === key ? { ...col, visible: !col.visible } : col));
    };

    const handleSave = () => {
        onSave(localColumns);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Personalizar Colunas</h3>
                    <button onClick={onClose}><XIcon className="w-5 h-5 text-slate-500" /></button>
                </div>
                <div className="space-y-2 max-h-[60vh] overflow-y-auto mb-6">
                    {localColumns.map(col => (
                        <label key={col.key} className="flex items-center p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={col.visible} 
                                onChange={() => toggleColumn(col.key)}
                                className="mr-3 w-4 h-4 accent-blue-600"
                            />
                            <span className="text-sm text-slate-700 dark:text-slate-200">{col.header}</span>
                        </label>
                    ))}
                </div>
                <div className="flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded">Cancelar</button>
                    <button onClick={handleSave} className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">Salvar</button>
                </div>
            </div>
        </div>
    );
};

export default ColumnCustomizerModal;
