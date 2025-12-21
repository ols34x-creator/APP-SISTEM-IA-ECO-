
import React, { useState, useEffect } from 'react';

interface CostRow {
    id: string;
    name: string;
    category: string;
    value: string;
    date: string;
    observation: string;
}

interface CostFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (records: any[]) => void;
    title: string;
    categories: string[];
}

const CostFormModal: React.FC<CostFormModalProps> = ({ isOpen, onClose, onSave, title, categories }) => {
    const createEmptyRow = (): CostRow => ({
        id: Math.random().toString(36).substr(2, 9),
        name: '',
        category: '',
        value: '',
        date: new Date().toISOString().split('T')[0],
        observation: ''
    });

    const [rows, setRows] = useState<CostRow[]>([createEmptyRow()]);
    const [errors, setErrors] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        if (isOpen) {
            setRows([createEmptyRow()]);
            setErrors({});
        }
    }, [isOpen]);

    const handleAddRow = () => {
        setRows(prev => [...prev, createEmptyRow()]);
    };

    const handleRemoveRow = (id: string) => {
        if (rows.length > 1) {
            setRows(prev => prev.filter(row => row.id !== id));
        }
    };

    const handleChange = (id: string, name: keyof CostRow, value: string) => {
        setRows(prev => prev.map(row => row.id === id ? { ...row, [name]: value } : row));
        // Limpar erro ao digitar
        if (errors[`${id}-${name}`]) {
            const newErrors = { ...errors };
            delete newErrors[`${id}-${name}`];
            setErrors(newErrors);
        }
    };

    const validate = () => {
        const newErrors: { [key: string]: boolean } = {};
        let isValid = true;

        rows.forEach(row => {
            if (!row.name.trim()) { newErrors[`${row.id}-name`] = true; isValid = false; }
            if (!row.category) { newErrors[`${row.id}-category`] = true; isValid = false; }
            const val = parseFloat(row.value);
            if (!row.value || isNaN(val) || val <= 0) { newErrors[`${row.id}-value`] = true; isValid = false; }
            if (!row.date) { newErrors[`${row.id}-date`] = true; isValid = false; }
        });

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        
        const recordsToSave = rows.map(row => ({
            id: Date.now() + Math.random(),
            name: row.name,
            category: row.category,
            value: parseFloat(row.value),
            date: row.date,
            observation: row.observation,
            timestamp: new Date().toISOString()
        }));

        onSave(recordsToSave);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[2002] backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-bg-card rounded-2xl shadow-2xl w-full max-w-6xl text-light relative border border-border-color flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-border-color">
                    <div>
                        <h2 className="text-2xl font-bold text-primary">{title}</h2>
                        <p className="text-gray-text text-sm">Adicione múltiplas linhas para registrar vários itens de uma vez.</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-bg-main text-gray-text hover:text-light transition-all">
                        <i className="fas fa-times text-xl"></i>
                    </button>
                </div>

                {/* Form Body */}
                <div className="flex-grow overflow-y-auto p-6 custom-scrollbar">
                    <form id="multi-cost-form" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            {/* Desktop Headers */}
                            <div className="hidden lg:grid grid-cols-12 gap-4 px-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
                                <div className="col-span-1 text-center">#</div>
                                <div className="col-span-3">Nome / Título</div>
                                <div className="col-span-3">Categoria</div>
                                <div className="col-span-2 text-right">Valor (R$)</div>
                                <div className="col-span-2">Data</div>
                                <div className="col-span-1"></div>
                            </div>

                            {rows.map((row, index) => (
                                <div key={row.id} className="grid grid-cols-1 lg:grid-cols-12 gap-3 p-4 bg-bg-main/40 border border-border-color rounded-xl relative group hover:border-secondary/30 transition-all animate-fade-in-up">
                                    {/* Line Number */}
                                    <div className="hidden lg:flex col-span-1 items-center justify-center font-bold text-gray-600">
                                        {index + 1}
                                    </div>

                                    {/* Name */}
                                    <div className="col-span-3">
                                        <label className="lg:hidden text-[10px] font-bold text-gray-500 uppercase mb-1 block">Nome</label>
                                        <input 
                                            type="text" 
                                            value={row.name} 
                                            onChange={e => handleChange(row.id, 'name', e.target.value)}
                                            placeholder="Ex: Aluguel"
                                            className={`form-input-sm ${errors[`${row.id}-name`] ? 'border-danger' : ''}`}
                                        />
                                    </div>

                                    {/* Category */}
                                    <div className="col-span-3">
                                        <label className="lg:hidden text-[10px] font-bold text-gray-500 uppercase mb-1 block">Categoria</label>
                                        <select 
                                            value={row.category} 
                                            onChange={e => handleChange(row.id, 'category', e.target.value)}
                                            className={`form-select-sm ${errors[`${row.id}-category`] ? 'border-danger' : ''}`}
                                        >
                                            <option value="">Selecione...</option>
                                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>

                                    {/* Value */}
                                    <div className="col-span-2">
                                        <label className="lg:hidden text-[10px] font-bold text-gray-500 uppercase mb-1 block">Valor</label>
                                        <input 
                                            type="number" 
                                            step="0.01"
                                            value={row.value} 
                                            onChange={e => handleChange(row.id, 'value', e.target.value)}
                                            placeholder="0,00"
                                            className={`form-input-sm text-right font-bold text-success ${errors[`${row.id}-value`] ? 'border-danger' : ''}`}
                                        />
                                    </div>

                                    {/* Date */}
                                    <div className="col-span-2">
                                        <label className="lg:hidden text-[10px] font-bold text-gray-500 uppercase mb-1 block">Data</label>
                                        <input 
                                            type="date" 
                                            value={row.date} 
                                            onChange={e => handleChange(row.id, 'date', e.target.value)}
                                            className={`form-input-sm ${errors[`${row.id}-date`] ? 'border-danger' : ''}`}
                                        />
                                    </div>

                                    {/* Remove Action */}
                                    <div className="col-span-1 flex items-center justify-end">
                                        <button 
                                            type="button"
                                            onClick={() => handleRemoveRow(row.id)}
                                            disabled={rows.length === 1}
                                            className="w-10 h-10 flex items-center justify-center rounded-lg text-danger hover:bg-danger/10 disabled:opacity-0 transition-all"
                                            title="Remover Linha"
                                        >
                                            <i className="fas fa-trash-alt"></i>
                                        </button>
                                    </div>

                                    {/* Full Width Observation (Optional Toggle or Inline) */}
                                    <div className="col-span-12 lg:pl-[8.33%] mt-1">
                                        <input 
                                            type="text" 
                                            placeholder="Observação (opcional)" 
                                            value={row.observation}
                                            onChange={e => handleChange(row.id, 'observation', e.target.value)}
                                            className="w-full bg-transparent border-none text-[11px] text-gray-400 focus:text-light focus:outline-none italic"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button 
                            type="button"
                            onClick={handleAddRow}
                            className="w-full mt-4 p-4 border-2 border-dashed border-border-color rounded-xl text-gray-500 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all font-bold flex items-center justify-center gap-2 group"
                        >
                            <i className="fas fa-plus-circle group-hover:scale-125 transition-transform"></i>
                            Adicionar Nova Linha de Gasto
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-border-color bg-bg-main/20 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-sm text-gray-text">
                        Total de <span className="text-light font-bold">{rows.length}</span> item(ns) a serem registrados.
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <button type="button" onClick={onClose} className="flex-1 sm:flex-none px-6 py-3 bg-border-color text-light font-bold rounded-xl hover:bg-opacity-80 transition-all">
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            form="multi-cost-form"
                            className="flex-1 sm:flex-none px-10 py-3 bg-primary text-white font-black uppercase tracking-wider rounded-xl hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all transform hover:-translate-y-0.5 active:scale-95"
                        >
                            <i className="fas fa-save mr-2"></i> Gravar Lote
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                .form-input-sm {
                    width: 100%;
                    padding: 0.6rem 0.75rem;
                    background-color: #0f172a;
                    border: 1px solid #334155;
                    border-radius: 0.5rem;
                    color: #f8fafc;
                    font-size: 0.875rem;
                    transition: all 0.2s;
                    outline: none;
                }
                .form-input-sm:focus { border-color: #14b8a6; box-shadow: 0 0 0 2px rgba(20, 184, 166, 0.1); }
                .form-input-sm.border-danger { border-color: #ef4444; }
                
                .form-select-sm {
                    width: 100%;
                    padding: 0.6rem 0.75rem;
                    background-color: #0f172a;
                    border: 1px solid #334155;
                    border-radius: 0.5rem;
                    color: #f8fafc;
                    font-size: 0.875rem;
                    outline: none;
                }
                .form-select-sm:focus { border-color: #14b8a6; }
                .form-select-sm.border-danger { border-color: #ef4444; }
            `}</style>
        </div>
    );
};

export default CostFormModal;
