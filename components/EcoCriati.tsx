
import React, { useState } from 'react';
import { useAppStore } from '../hooks/useAppStore';
import { EcoCriatiRecord, CustomField } from '../types';

const ICON_OPTIONS = ['fa-star', 'fa-heart', 'fa-bolt', 'fa-rocket', 'fa-shield-alt', 'fa-cog', 'fa-key', 'fa-link'];
const COLOR_OPTIONS = ['#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#eab308'];

const EcoCriati: React.FC = () => {
    const { ecoCriatiRecords, addEcoCriatiRecord, deleteEcoCriatiRecord } = useAppStore();
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        icon: 'fa-star',
        color: '#14b8a6',
        customFields: [] as CustomField[]
    });

    const handleAddField = () => {
        setFormData(prev => ({
            ...prev,
            customFields: [...prev.customFields, { id: `cf-${Date.now()}`, label: '', value: '' }]
        }));
    };

    const handleFieldChange = (id: string, field: 'label' | 'value', val: string) => {
        setFormData(prev => ({
            ...prev,
            customFields: prev.customFields.map(f => f.id === id ? { ...f, [field]: val } : f)
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title) return;
        addEcoCriatiRecord(formData);
        setIsAdding(false);
        setFormData({ title: '', description: '', icon: 'fa-star', color: '#14b8a6', customFields: [] });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-bg-card p-6 rounded-2xl border border-border-color/50 shadow-xl">
                <div>
                    <h2 className="text-3xl font-black text-light tracking-tight flex items-center gap-3">
                        <i className="fas fa-magic text-secondary animate-pulse"></i> ECO.CRIATI
                    </h2>
                    <p className="text-gray-text text-sm mt-1">Crie seus próprios painéis, guias de bolso ou registros personalizados.</p>
                </div>
                <button 
                    onClick={() => setIsAdding(true)}
                    className="bg-primary text-white font-black uppercase tracking-widest px-6 py-3 rounded-xl hover:opacity-90 shadow-lg shadow-primary/20 transition-all transform hover:-translate-y-1"
                >
                    <i className="fas fa-plus mr-2"></i> Criar Novo
                </button>
            </div>

            {isAdding && (
                <div className="bg-bg-card p-8 rounded-2xl border border-secondary/30 animate-fade-in shadow-2xl relative">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 block mb-2">Título do Registro</label>
                                    <input 
                                        className="w-full bg-bg-main border border-border-color rounded-xl p-3 text-light focus:border-primary transition-all outline-none"
                                        placeholder="Ex: Guia de Despacho Santos"
                                        value={formData.title}
                                        onChange={e => setFormData({...formData, title: e.target.value})}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 block mb-2">Descrição Curta</label>
                                    <textarea 
                                        className="w-full bg-bg-main border border-border-color rounded-xl p-3 text-light focus:border-primary transition-all outline-none h-24 resize-none"
                                        placeholder="Para que serve este registro?"
                                        value={formData.description}
                                        onChange={e => setFormData({...formData, description: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 block">Personalização Visual</label>
                                <div className="flex gap-3 flex-wrap">
                                    {ICON_OPTIONS.map(icon => (
                                        <button 
                                            key={icon} type="button" onClick={() => setFormData({...formData, icon})}
                                            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${formData.icon === icon ? 'bg-secondary text-white' : 'bg-bg-main text-gray-500 hover:text-light'}`}
                                        >
                                            <i className={`fas ${icon}`}></i>
                                        </button>
                                    ))}
                                </div>
                                <div className="flex gap-3 flex-wrap">
                                    {COLOR_OPTIONS.map(color => (
                                        <button 
                                            key={color} type="button" onClick={() => setFormData({...formData, color})}
                                            className={`w-10 h-10 rounded-full transition-all border-2 ${formData.color === color ? 'border-white scale-110' : 'border-transparent'}`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="bg-bg-main/50 p-6 rounded-2xl border border-border-color/30">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xs font-black uppercase tracking-widest text-primary">Campos de Informação</h3>
                                <button type="button" onClick={handleAddField} className="text-[10px] font-black bg-secondary/10 text-secondary px-3 py-1.5 rounded-lg hover:bg-secondary hover:text-white transition-all uppercase">
                                    + Add Campo
                                </button>
                            </div>
                            <div className="space-y-3">
                                {formData.customFields.map((field, idx) => (
                                    <div key={field.id} className="flex gap-3 items-center animate-slide-up">
                                        <input 
                                            className="flex-1 bg-bg-card border border-border-color rounded-lg p-2 text-xs text-light"
                                            placeholder="Nome (ex: Senha)"
                                            value={field.label}
                                            onChange={e => handleFieldChange(field.id, 'label', e.target.value)}
                                        />
                                        <input 
                                            className="flex-[2] bg-bg-card border border-border-color rounded-lg p-2 text-xs text-light"
                                            placeholder="Valor"
                                            value={field.value}
                                            onChange={e => handleFieldChange(field.id, 'value', e.target.value)}
                                        />
                                        <button type="button" onClick={() => setFormData({...formData, customFields: formData.customFields.filter(f => f.id !== field.id)})} className="text-danger hover:scale-110 transition-transform p-2">
                                            <i className="fas fa-times"></i>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-2 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-light transition-colors">Cancelar</button>
                            <button type="submit" className="px-8 py-3 bg-success text-white font-black uppercase tracking-widest rounded-xl hover:opacity-90 shadow-lg">Finalizar Criação</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {ecoCriatiRecords.map(record => (
                    <div key={record.id} className="bg-bg-card rounded-2xl border border-border-color/50 p-5 shadow-lg group hover:border-secondary/40 transition-all hover:translate-x-1">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: record.color }}>
                                <i className={`fas ${record.icon} text-xl`}></i>
                            </div>
                            <button onClick={() => deleteEcoCriatiRecord(record.id)} className="text-gray-600 hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity p-2">
                                <i className="fas fa-trash-alt"></i>
                            </button>
                        </div>
                        <h3 className="text-lg font-black text-light truncate mb-1">{record.title}</h3>
                        <p className="text-xs text-gray-text leading-relaxed line-clamp-2 mb-4">{record.description}</p>
                        
                        <div className="space-y-2 mt-4 pt-4 border-t border-border-color/30">
                            {record.customFields.map(field => (
                                <div key={field.id} className="flex justify-between items-center text-[10px]">
                                    <span className="font-black uppercase text-gray-500 tracking-wider">{field.label}:</span>
                                    <span className="font-bold text-light bg-bg-main px-2 py-0.5 rounded border border-border-color/50">{field.value}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 pt-3 text-[9px] text-gray-600 text-right italic uppercase font-bold">
                            CRIADO EM {new Date(record.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EcoCriati;
