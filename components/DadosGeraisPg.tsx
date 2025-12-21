import React, { useState, useEffect } from 'react';
import { useAppStore } from '../hooks/useAppStore';
import { CompanySettings } from '../types';

const DadosGeraisPg: React.FC = () => {
    const { companySettings, updateCompanySettings } = useAppStore();
    const [formData, setFormData] = useState<CompanySettings>(companySettings);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        setFormData(companySettings);
    }, [companySettings]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'defaultTaxRate' ? parseFloat(value) : value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateCompanySettings(formData);
        setIsEditing(false);
    };

    const InputField = ({ label, name, type = 'text', disabled = false }: { label: string, name: keyof CompanySettings, type?: string, disabled?: boolean }) => (
        <div className="form-group">
            <label className="form-label">{label}</label>
            <input 
                type={type}
                name={name}
                value={formData[name]}
                onChange={handleChange}
                disabled={disabled}
                className="form-input disabled:opacity-50 disabled:cursor-not-allowed"
            />
        </div>
    );

    return (
        <div className="bg-bg-card rounded-lg p-6 shadow-lg min-h-[70vh]">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-border-color">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/20 rounded-lg">
                        <i className="fas fa-database text-2xl text-primary"></i>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-light">Dados Gerais da Empresa</h2>
                        <p className="text-gray-text text-sm">Configurações globais utilizadas em relatórios e cálculos.</p>
                    </div>
                </div>
                <button 
                    onClick={() => isEditing ? handleSubmit(new Event('submit') as any) : setIsEditing(true)}
                    className={`px-6 py-2 rounded-md font-bold transition-all shadow-md ${isEditing ? 'bg-success hover:bg-green-600 text-white' : 'bg-secondary hover:bg-blue-600 text-white'}`}
                >
                    {isEditing ? <><i className="fas fa-save mr-2"></i> Salvar Alterações</> : <><i className="fas fa-edit mr-2"></i> Editar Dados</>}
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Company Identity */}
                <section>
                    <h3 className="text-lg font-semibold text-secondary mb-4 flex items-center gap-2">
                        <i className="fas fa-building"></i> Identificação Corporativa
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField label="Razão Social / Nome Fantasia" name="companyName" disabled={!isEditing} />
                        <InputField label="CNPJ" name="cnpj" disabled={!isEditing} />
                    </div>
                </section>

                {/* Location */}
                <section>
                    <h3 className="text-lg font-semibold text-secondary mb-4 flex items-center gap-2">
                        <i className="fas fa-map-marker-alt"></i> Localização
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-3">
                            <InputField label="Endereço Completo" name="address" disabled={!isEditing} />
                        </div>
                        <InputField label="Cidade" name="city" disabled={!isEditing} />
                        <InputField label="Estado (UF)" name="state" disabled={!isEditing} />
                    </div>
                </section>

                {/* Fiscal & System Settings */}
                <section>
                    <h3 className="text-lg font-semibold text-secondary mb-4 flex items-center gap-2">
                        <i className="fas fa-calculator"></i> Parâmetros Fiscais e do Sistema
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="form-group">
                            <label className="form-label">Regime Tributário</label>
                            <select 
                                name="taxRegime" 
                                value={formData.taxRegime} 
                                onChange={handleChange} 
                                disabled={!isEditing}
                                className="form-select disabled:opacity-50"
                            >
                                <option value="Simples Nacional">Simples Nacional</option>
                                <option value="Lucro Presumido">Lucro Presumido</option>
                                <option value="Lucro Real">Lucro Real</option>
                            </select>
                        </div>
                        <InputField label="Alíquota Padrão de Imposto (%)" name="defaultTaxRate" type="number" disabled={!isEditing} />
                        <InputField label="Moeda do Sistema" name="systemCurrency" disabled={!isEditing} />
                    </div>
                </section>
            </form>

            {!isEditing && (
                <div className="mt-10 p-4 bg-blue-900/20 border border-blue-800 rounded-lg flex items-start gap-3">
                    <i className="fas fa-info-circle text-blue-400 mt-1"></i>
                    <p className="text-sm text-blue-200">
                        Estes dados são utilizados automaticamente para preenchimento de cabeçalhos de relatórios, 
                        cálculos estimativos de impostos no painel contábil e emissão de recibos. 
                        Mantenha-os sempre atualizados.
                    </p>
                </div>
            )}
            
            <style>{`
                .form-label { display: block; margin-bottom: 0.5rem; font-size: 0.9rem; font-weight: 600; color: #e2e8f0; }
                .form-input, .form-select { width: 100%; padding: 0.75rem; background-color: #0f172a; border: 1px solid #334155; border-radius: 0.5rem; color: #f8fafc; transition: all 0.2s; }
                .form-input:focus, .form-select:focus { border-color: #3b82f6; outline: none; box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2); }
            `}</style>
        </div>
    );
};

export default DadosGeraisPg;