
import React, { useState, useEffect } from 'react';
import { Frete } from '../types';
import { XIcon } from './icons';

interface FreightDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    frete: Frete | null;
    onSave: (frete: Frete) => void;
}

const FormField = ({ label, name, value, onChange, type = 'text', isNumeric = false, placeholder = '' }: any) => (
    <div className="flex flex-col">
        <label className="text-xs font-semibold text-gray-400 mb-1">{label}</label>
        <input 
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            className="bg-bg-main border border-border-color rounded px-3 py-2 text-sm text-light focus:outline-none focus:border-primary"
            placeholder={placeholder}
            step={isNumeric ? "0.01" : undefined}
        />
    </div>
);

const FreightDetailModal: React.FC<FreightDetailModalProps> = ({ isOpen, onClose, frete, onSave }) => {
    const [formData, setFormData] = useState<Partial<Frete>>({});

    useEffect(() => {
        if (frete) {
            setFormData({ ...frete });
        } else {
            setFormData({});
        }
    }, [frete, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.cliente) {
            onSave(formData as Frete);
        } else {
            alert('Cliente é obrigatório');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1002]" onClick={onClose}>
            <div className="bg-bg-card p-6 rounded-lg shadow-xl w-full max-w-4xl text-light max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6 border-b border-border-color pb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <i className="fas fa-truck-loading text-primary"></i> Detalhes do Frete
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><XIcon className="w-6 h-6" /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <FormField label="Cliente" name="cliente" value={formData.cliente} onChange={handleChange} />
                        <FormField label="Data" name="data" value={formData.data} onChange={handleChange} type="date" />
                        <FormField label="Horário" name="horario" value={formData.horario} onChange={handleChange} type="time" />
                        <FormField label="Status" name="status" value={formData.status} onChange={handleChange} />
                    </div>

                    {/* Freight Details */}
                    <div>
                        <h3 className="text-base font-bold text-slate-700 dark:text-slate-300 border-b pb-2 border-slate-200 dark:border-slate-600 mb-4">Dados da Carga</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            <FormField label="Container" name="container" value={formData.container} onChange={handleChange} />
                            <FormField label="Tipo Container" name="tipo" value={formData.tipo} onChange={handleChange} placeholder="Ex: 40' HC" />
                            <FormField label="Tipo de Carga" name="cargoType" value={formData.cargoType} onChange={handleChange} placeholder="Ex: Eletrônicos" />
                            <FormField label="Peso Bruto (kg)" name="peso" value={formData.peso} onChange={handleNumericChange} isNumeric type="number" />
                            <FormField label="Volume (m³)" name="cargoVolume" value={formData.cargoVolume} onChange={handleNumericChange} isNumeric type="number" />
                            <FormField label="DI / BR" name="di_br" value={formData.di_br} onChange={handleChange} />
                            <FormField label="Referência" name="referencia" value={formData.referencia} onChange={handleChange} />
                            <FormField label="Free Time" name="free_time" value={formData.free_time} onChange={handleChange} />
                        </div>
                    </div>

                    {/* Transport Details */}
                    <div>
                        <h3 className="text-base font-bold text-slate-700 dark:text-slate-300 border-b pb-2 border-slate-200 dark:border-slate-600 mb-4">Transporte & Logística</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField label="Origem / Terminal" name="terminal" value={formData.terminal} onChange={handleChange} />
                            <FormField label="Destino" name="destino" value={formData.destino} onChange={handleChange} />
                            <FormField label="Operador Logístico" name="operador" value={formData.operador} onChange={handleChange} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <FormField label="Motorista" name="motorista" value={formData.motorista} onChange={handleChange} />
                            <div className="grid grid-cols-2 gap-2">
                                <FormField label="Placa Cavalo" name="cavalo" value={formData.cavalo} onChange={handleChange} />
                                <FormField label="Placa Carreta" name="carreta" value={formData.carreta} onChange={handleChange} />
                            </div>
                            <FormField label="CT-e" name="cte" value={formData.cte} onChange={handleChange} />
                        </div>
                    </div>

                    {/* Financial & Notes */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-gray-400 mb-1">Valor do Frete (R$)</label>
                            <input 
                                type="number"
                                name="vrFrete"
                                value={formData.vrFrete}
                                onChange={handleNumericChange}
                                className="w-full bg-bg-main border border-border-color rounded px-3 py-2 text-lg font-bold text-green-400 focus:outline-none focus:border-primary"
                                step="0.01"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-xs font-semibold text-gray-400 mb-1">Observações</label>
                            <textarea 
                                name="obs" 
                                value={formData.obs} 
                                onChange={handleChange}
                                className="w-full bg-bg-main border border-border-color rounded px-3 py-2 text-sm text-light focus:outline-none focus:border-primary"
                                rows={2}
                            ></textarea>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-border-color">
                        <button type="button" onClick={onClose} className="px-6 py-2 bg-border-color hover:bg-opacity-80 rounded font-semibold text-light transition-colors">Cancelar</button>
                        <button type="submit" className="px-6 py-2 bg-primary hover:bg-opacity-90 rounded font-bold text-white shadow-lg transition-colors">Salvar Alterações</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FreightDetailModal;
