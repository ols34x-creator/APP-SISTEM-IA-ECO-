import React, { useState, useMemo } from 'react';
import { useAppStore } from '../hooks/useAppStore';
import { BusinessPartner, CustomField } from '../types';

interface GeneralRegistrationProps {
    type: 'Cliente' | 'Oficina' | 'Fornecedor' | 'Prestador';
}

const GeneralRegistration: React.FC<GeneralRegistrationProps> = ({ type }) => {
    const { partners, addPartner, updatePartner, deletePartner } = useAppStore();
    const [view, setView] = useState<'list' | 'form'>('list');
    const [formData, setFormData] = useState<Partial<BusinessPartner>>({});
    const [searchTerm, setSearchTerm] = useState('');

    const initialFormState: Partial<BusinessPartner> = {
        type: type,
        name: '',
        document: '',
        contactName: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        state: '',
        notes: '',
        status: 'Ativo',
        customFields: []
    };

    const filteredPartners = useMemo(() => {
        return partners.filter(p => 
            p.type === type && 
            (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
             p.document.includes(searchTerm))
        );
    }, [partners, type, searchTerm]);

    const handleNew = () => {
        setFormData(initialFormState);
        setView('form');
    };

    const handleEdit = (partner: BusinessPartner) => {
        setFormData({ ...partner, customFields: partner.customFields || [] });
        setView('form');
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir este registro?')) {
            deletePartner(id);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Custom Field Handlers
    const handleAddCustomField = () => {
        const newField: CustomField = { id: `cf-${Date.now()}`, label: '', value: '' };
        setFormData(prev => ({
            ...prev,
            customFields: [...(prev.customFields || []), newField]
        }));
    };

    const handleCustomFieldChange = (id: string, field: keyof CustomField, value: string) => {
        setFormData(prev => ({
            ...prev,
            customFields: prev.customFields?.map(cf => cf.id === id ? { ...cf, [field]: value } : cf)
        }));
    };

    const handleRemoveCustomField = (id: string) => {
        setFormData(prev => ({
            ...prev,
            customFields: prev.customFields?.filter(cf => cf.id !== id)
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.name || !formData.document) {
            alert("Nome e Documento (CNPJ/CPF) são obrigatórios.");
            return;
        }

        const newPartner = { ...formData, type } as BusinessPartner;
        
        if (newPartner.id) {
            updatePartner(newPartner);
        } else {
            addPartner(newPartner);
        }
        
        setView('list');
    };

    const getIcon = () => {
        switch(type) {
            case 'Cliente': return 'fa-user-tie';
            case 'Oficina': return 'fa-tools';
            case 'Fornecedor': return 'fa-boxes';
            case 'Prestador': return 'fa-handshake';
            default: return 'fa-folder';
        }
    };

    return (
        <div className="bg-bg-card rounded-lg p-6 shadow-lg min-h-[80vh]">
            {view === 'list' ? (
                <>
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <h2 className="text-2xl font-bold text-light flex items-center gap-3">
                            <i className={`fas ${getIcon()} text-primary`}></i> Cadastro de {type}s
                        </h2>
                        <div className="flex gap-3 w-full md:w-auto">
                            <div className="relative flex-grow md:flex-grow-0">
                                <input 
                                    type="text" 
                                    placeholder="Pesquisar..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-bg-main border border-border-color rounded-md py-2 pl-10 pr-4 text-light focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <i className="fas fa-search text-gray-text"></i>
                                </div>
                            </div>
                            <button onClick={handleNew} className="bg-primary hover:bg-opacity-90 text-white px-4 py-2 rounded-md font-bold flex items-center gap-2 shadow-md whitespace-nowrap">
                                <i className="fas fa-plus"></i> Novo
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto bg-bg-main rounded-lg border border-border-color">
                        <table className="w-full text-sm text-left text-gray-text">
                            <thead className="text-xs text-gray-400 uppercase bg-bg-card border-b border-border-color">
                                <tr>
                                    <th className="px-6 py-3">Nome / Razão Social</th>
                                    <th className="px-6 py-3">Documento</th>
                                    <th className="px-6 py-3">Contato</th>
                                    <th className="px-6 py-3">Cidade/UF</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-color">
                                {filteredPartners.map(partner => (
                                    <tr key={partner.id} className="hover:bg-bg-card/50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-light">{partner.name}</td>
                                        <td className="px-6 py-4">{partner.document}</td>
                                        <td className="px-6 py-4">
                                            <div>{partner.contactName}</div>
                                            <div className="text-xs">{partner.phone}</div>
                                        </td>
                                        <td className="px-6 py-4">{partner.city}/{partner.state}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold border ${partner.status === 'Ativo' ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'}`}>
                                                {partner.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button onClick={() => handleEdit(partner)} className="text-blue-400 hover:text-blue-300 p-1"><i className="fas fa-pencil-alt"></i></button>
                                            <button onClick={() => handleDelete(partner.id)} className="text-red-500 hover:text-red-400 p-1"><i className="fas fa-trash"></i></button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredPartners.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500 italic">Nenhum registro encontrado.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
                    <div className="flex justify-between items-center border-b border-border-color pb-4">
                        <h2 className="text-xl font-bold text-light">
                            {formData.id ? `Editar ${type}` : `Novo ${type}`}
                        </h2>
                        <button type="button" onClick={() => setView('list')} className="text-gray-400 hover:text-light"><i className="fas fa-times text-xl"></i></button>
                    </div>

                    <div className="bg-bg-main/50 p-6 rounded-lg border border-border-color">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="md:col-span-2">
                                <label className="form-label">Nome / Razão Social <span className="text-red-500">*</span></label>
                                <input className="form-input" name="name" value={formData.name} onChange={handleInputChange} required />
                            </div>
                            <div>
                                <label className="form-label">CNPJ / CPF <span className="text-red-500">*</span></label>
                                <input className="form-input" name="document" value={formData.document} onChange={handleInputChange} required />
                            </div>
                            
                            <div>
                                <label className="form-label">Nome de Contato</label>
                                <input className="form-input" name="contactName" value={formData.contactName} onChange={handleInputChange} />
                            </div>
                            <div>
                                <label className="form-label">Telefone / Celular</label>
                                <input className="form-input" name="phone" value={formData.phone} onChange={handleInputChange} />
                            </div>
                            <div>
                                <label className="form-label">Email</label>
                                <input className="form-input" type="email" name="email" value={formData.email} onChange={handleInputChange} />
                            </div>

                            <div className="md:col-span-2">
                                <label className="form-label">Endereço</label>
                                <input className="form-input" name="address" value={formData.address} onChange={handleInputChange} />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="form-label">Cidade</label>
                                    <input className="form-input" name="city" value={formData.city} onChange={handleInputChange} />
                                </div>
                                <div>
                                    <label className="form-label">UF</label>
                                    <input className="form-input" name="state" value={formData.state} onChange={handleInputChange} maxLength={2} />
                                </div>
                            </div>

                            <div>
                                <label className="form-label">Status</label>
                                <select className="form-input" name="status" value={formData.status} onChange={handleInputChange}>
                                    <option>Ativo</option>
                                    <option>Inativo</option>
                                </select>
                            </div>

                            <div className="md:col-span-3">
                                <label className="form-label">Observações</label>
                                <textarea className="form-input" name="notes" value={formData.notes} onChange={handleInputChange} rows={3} />
                            </div>
                        </div>
                    </div>

                    {/* Custom Fields Section */}
                    <div className="bg-bg-main/30 p-6 rounded-lg border border-border-color">
                        <div className="flex justify-between items-center mb-4 border-b border-border-color pb-2">
                            <h3 className="text-lg font-bold text-light flex items-center gap-2">
                                <i className="fas fa-list-ul text-secondary"></i> Campos Personalizados
                            </h3>
                            <button type="button" onClick={handleAddCustomField} className="text-xs bg-secondary text-white px-3 py-1.5 rounded hover:bg-primary transition-colors font-bold flex items-center gap-1">
                                <i className="fas fa-plus"></i> Adicionar Campo
                            </button>
                        </div>
                        
                        <div className="space-y-3">
                            {formData.customFields && formData.customFields.length > 0 ? (
                                formData.customFields.map((field) => (
                                    <div key={field.id} className="flex flex-col md:flex-row gap-3 items-end bg-bg-card p-3 rounded border border-border-color">
                                        <div className="flex-1 w-full">
                                            <label className="text-xs text-gray-400 font-semibold mb-1 block">Título do Campo</label>
                                            <input 
                                                type="text" 
                                                placeholder="Ex: Data de Aniversário" 
                                                value={field.label} 
                                                onChange={(e) => handleCustomFieldChange(field.id, 'label', e.target.value)}
                                                className="form-input text-sm py-1"
                                            />
                                        </div>
                                        <div className="flex-[2] w-full">
                                            <label className="text-xs text-gray-400 font-semibold mb-1 block">Valor / Informação</label>
                                            <input 
                                                type="text" 
                                                placeholder="Ex: 15/05" 
                                                value={field.value} 
                                                onChange={(e) => handleCustomFieldChange(field.id, 'value', e.target.value)}
                                                className="form-input text-sm py-1"
                                            />
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={() => handleRemoveCustomField(field.id)}
                                            className="bg-red-500/10 hover:bg-red-500/20 text-red-500 p-2 rounded transition-colors"
                                            title="Remover campo"
                                        >
                                            <i className="fas fa-trash-alt"></i>
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-gray-500 text-sm py-4 italic border-2 border-dashed border-border-color rounded">
                                    Nenhum campo personalizado adicionado.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-border-color">
                        <button type="button" onClick={() => setView('list')} className="px-6 py-2 bg-border-color hover:bg-opacity-80 rounded-md font-semibold text-light">Cancelar</button>
                        <button type="submit" className="px-6 py-2 bg-success hover:bg-green-600 text-white rounded-md font-bold shadow-lg">
                            <i className="fas fa-save mr-2"></i> Salvar Registro
                        </button>
                    </div>
                </form>
            )}
            <style>{`
                .form-label { display: block; margin-bottom: 0.25rem; font-size: 0.75rem; font-weight: 600; color: #94a3b8; text-transform: uppercase; }
                .form-input { width: 100%; padding: 0.5rem; background-color: #0f172a; border: 1px solid #334155; border-radius: 0.375rem; color: #f8fafc; font-size: 0.875rem; transition: border-color 0.2s; }
                .form-input:focus { outline: none; border-color: #3b82f6; }
            `}</style>
        </div>
    );
};

export default GeneralRegistration;