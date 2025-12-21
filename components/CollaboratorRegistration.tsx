
import React, { useState, useEffect } from 'react';
import { Collaborator, CollaboratorStatus } from '../types';
import { fileToBase64, base64ToSrc } from '../services/fileService';

const CollaboratorRegistration: React.FC = () => {
    const [view, setView] = useState<'list' | 'form'>('list');
    const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
    const [formData, setFormData] = useState<Partial<Collaborator>>({});
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    // Initial State for a new collaborator
    const initialFormState: Partial<Collaborator> = {
        fullName: '', cpf: '', rg: '', birthDate: '', gender: 'Masculino', maritalStatus: 'Solteiro',
        email: '', phone: '', address: '', city: '', state: '', zipCode: '',
        admissionDate: '', position: '', sector: '', salary: 0, contractType: 'CLT', status: 'Ativo',
        bankName: '', agency: '', accountNumber: '', pixKey: ''
    };

    useEffect(() => {
        const saved = localStorage.getItem('ecolog-collaborators');
        if (saved) {
            try {
                setCollaborators(JSON.parse(saved));
            } catch (e) {
                console.error("Error parsing collaborators", e);
            }
        }
    }, []);

    const saveCollaborators = (newList: Collaborator[]) => {
        setCollaborators(newList);
        localStorage.setItem('ecolog-collaborators', JSON.stringify(newList));
    };

    const handleNew = () => {
        setFormData(initialFormState);
        setPhotoPreview(null);
        setView('form');
    };

    const handleEdit = (collaborator: Collaborator) => {
        setFormData(collaborator);
        setPhotoPreview(collaborator.photoUrl ? base64ToSrc(collaborator.photoUrl, 'image/jpeg') : null);
        setView('form');
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir este colaborador?')) {
            const newList = collaborators.filter(c => c.id !== id);
            saveCollaborators(newList);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'salary' ? parseFloat(value) || 0 : value
        }));
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const base64 = await fileToBase64(file);
            setFormData(prev => ({ ...prev, photoUrl: base64 }));
            setPhotoPreview(base64ToSrc(base64, file.type));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.fullName || !formData.cpf) {
            alert("Nome e CPF são obrigatórios.");
            return;
        }

        const newCollaborator = { ...formData } as Collaborator;
        
        if (!newCollaborator.id) {
            newCollaborator.id = `colab-${Date.now()}`;
            saveCollaborators([...collaborators, newCollaborator]);
        } else {
            const newList = collaborators.map(c => c.id === newCollaborator.id ? newCollaborator : c);
            saveCollaborators(newList);
        }
        
        setView('list');
    };

    const StatusBadge = ({ status }: { status: CollaboratorStatus }) => {
        const colors = {
            'Ativo': 'bg-green-500/20 text-green-300 border-green-500/30',
            'Férias': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
            'Afastado': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
            'Desligado': 'bg-red-500/20 text-red-300 border-red-500/30'
        };
        return <span className={`px-2 py-1 rounded text-xs font-semibold border ${colors[status] || colors['Ativo']}`}>{status}</span>;
    };

    return (
        <div className="bg-bg-card rounded-lg p-6 shadow-lg min-h-[80vh]">
            {view === 'list' ? (
                <>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-light flex items-center gap-3">
                            <i className="fas fa-id-card text-primary"></i> Cadastro de Colaboradores
                        </h2>
                        <button onClick={handleNew} className="bg-primary hover:bg-opacity-90 text-white px-4 py-2 rounded-md font-bold flex items-center gap-2 shadow-md">
                            <i className="fas fa-plus"></i> Novo Cadastro
                        </button>
                    </div>

                    <div className="overflow-x-auto bg-bg-main rounded-lg border border-border-color">
                        <table className="w-full text-sm text-left text-gray-text">
                            <thead className="text-xs text-gray-400 uppercase bg-bg-card border-b border-border-color">
                                <tr>
                                    <th className="px-6 py-3">Colaborador</th>
                                    <th className="px-6 py-3">Cargo / Setor</th>
                                    <th className="px-6 py-3">Contato</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-color">
                                {collaborators.map(colab => (
                                    <tr key={colab.id} className="hover:bg-bg-card/50 transition-colors">
                                        <td className="px-6 py-4 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-700 flex-shrink-0 overflow-hidden">
                                                {colab.photoUrl ? (
                                                    <img src={base64ToSrc(colab.photoUrl, 'image/jpeg')} alt={colab.fullName} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-500"><i className="fas fa-user"></i></div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-light">{colab.fullName}</div>
                                                <div className="text-xs">{colab.cpf}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-light">{colab.position}</div>
                                            <div className="text-xs">{colab.sector}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>{colab.email}</div>
                                            <div className="text-xs">{colab.phone}</div>
                                        </td>
                                        <td className="px-6 py-4"><StatusBadge status={colab.status} /></td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button onClick={() => handleEdit(colab)} className="text-blue-400 hover:text-blue-300 p-1"><i className="fas fa-pencil-alt"></i></button>
                                            <button onClick={() => handleDelete(colab.id)} className="text-red-500 hover:text-red-400 p-1"><i className="fas fa-trash"></i></button>
                                        </td>
                                    </tr>
                                ))}
                                {collaborators.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500 italic">Nenhum colaborador cadastrado.</td>
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
                            {formData.id ? 'Editar Colaborador' : 'Novo Colaborador'}
                        </h2>
                        <button type="button" onClick={() => setView('list')} className="text-gray-400 hover:text-light"><i className="fas fa-times text-xl"></i></button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Photo Upload */}
                        <div className="lg:col-span-1 flex flex-col items-center gap-4">
                            <div className="w-40 h-40 rounded-full bg-bg-main border-4 border-border-color overflow-hidden relative group">
                                {photoPreview ? (
                                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-4xl text-gray-600"><i className="fas fa-camera"></i></div>
                                )}
                                <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                                    <span className="text-white text-sm font-bold"><i className="fas fa-upload mr-1"></i> Alterar</span>
                                    <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                                </label>
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold text-light">{formData.fullName || 'Nome do Colaborador'}</p>
                                <p className="text-xs text-gray-500">{formData.position || 'Cargo'}</p>
                            </div>
                        </div>

                        {/* Form Fields */}
                        <div className="lg:col-span-3 space-y-6">
                            {/* Personal */}
                            <section className="bg-bg-main/50 p-4 rounded-lg border border-border-color">
                                <h3 className="text-sm font-bold text-secondary uppercase mb-3 border-b border-border-color pb-1">Dados Pessoais</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="form-label">Nome Completo</label>
                                        <input className="form-input" name="fullName" value={formData.fullName} onChange={handleInputChange} required />
                                    </div>
                                    <div>
                                        <label className="form-label">CPF</label>
                                        <input className="form-input" name="cpf" value={formData.cpf} onChange={handleInputChange} required placeholder="000.000.000-00" />
                                    </div>
                                    <div>
                                        <label className="form-label">RG</label>
                                        <input className="form-input" name="rg" value={formData.rg} onChange={handleInputChange} />
                                    </div>
                                    <div>
                                        <label className="form-label">Data de Nascimento</label>
                                        <input className="form-input" type="date" name="birthDate" value={formData.birthDate} onChange={handleInputChange} />
                                    </div>
                                    <div>
                                        <label className="form-label">Gênero</label>
                                        <select className="form-input" name="gender" value={formData.gender} onChange={handleInputChange}>
                                            <option>Masculino</option><option>Feminino</option><option>Outro</option>
                                        </select>
                                    </div>
                                </div>
                            </section>

                            {/* Contact */}
                            <section className="bg-bg-main/50 p-4 rounded-lg border border-border-color">
                                <h3 className="text-sm font-bold text-secondary uppercase mb-3 border-b border-border-color pb-1">Contato e Endereço</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="form-label">Email</label>
                                        <input className="form-input" type="email" name="email" value={formData.email} onChange={handleInputChange} />
                                    </div>
                                    <div>
                                        <label className="form-label">Celular</label>
                                        <input className="form-input" name="phone" value={formData.phone} onChange={handleInputChange} />
                                    </div>
                                    <div>
                                        <label className="form-label">CEP</label>
                                        <input className="form-input" name="zipCode" value={formData.zipCode} onChange={handleInputChange} />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="form-label">Endereço</label>
                                        <input className="form-input" name="address" value={formData.address} onChange={handleInputChange} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="form-label">Cidade</label>
                                            <input className="form-input" name="city" value={formData.city} onChange={handleInputChange} />
                                        </div>
                                        <div>
                                            <label className="form-label">UF</label>
                                            <input className="form-input" name="state" value={formData.state} onChange={handleInputChange} maxLength={2} />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Contractual */}
                            <section className="bg-bg-main/50 p-4 rounded-lg border border-border-color">
                                <h3 className="text-sm font-bold text-secondary uppercase mb-3 border-b border-border-color pb-1">Dados Contratuais</h3>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="form-label">Cargo</label>
                                        <input className="form-input" name="position" value={formData.position} onChange={handleInputChange} />
                                    </div>
                                    <div>
                                        <label className="form-label">Setor</label>
                                        <input className="form-input" name="sector" value={formData.sector} onChange={handleInputChange} />
                                    </div>
                                    <div>
                                        <label className="form-label">Salário (R$)</label>
                                        <input className="form-input" type="number" name="salary" value={formData.salary} onChange={handleInputChange} />
                                    </div>
                                    <div>
                                        <label className="form-label">Admissão</label>
                                        <input className="form-input" type="date" name="admissionDate" value={formData.admissionDate} onChange={handleInputChange} />
                                    </div>
                                    <div>
                                        <label className="form-label">Tipo Contrato</label>
                                        <select className="form-input" name="contractType" value={formData.contractType} onChange={handleInputChange}>
                                            <option>CLT</option><option>PJ</option><option>Estágio</option><option>Temporário</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="form-label">Status</label>
                                        <select className="form-input" name="status" value={formData.status} onChange={handleInputChange}>
                                            <option>Ativo</option><option>Férias</option><option>Afastado</option><option>Desligado</option>
                                        </select>
                                    </div>
                                </div>
                            </section>

                            {/* Bank Info */}
                            <section className="bg-bg-main/50 p-4 rounded-lg border border-border-color">
                                <h3 className="text-sm font-bold text-secondary uppercase mb-3 border-b border-border-color pb-1">Dados Bancários</h3>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="form-label">Banco</label>
                                        <input className="form-input" name="bankName" value={formData.bankName} onChange={handleInputChange} />
                                    </div>
                                    <div>
                                        <label className="form-label">Agência</label>
                                        <input className="form-input" name="agency" value={formData.agency} onChange={handleInputChange} />
                                    </div>
                                    <div>
                                        <label className="form-label">Conta</label>
                                        <input className="form-input" name="accountNumber" value={formData.accountNumber} onChange={handleInputChange} />
                                    </div>
                                    <div>
                                        <label className="form-label">Chave PIX</label>
                                        <input className="form-input" name="pixKey" value={formData.pixKey} onChange={handleInputChange} />
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-border-color">
                        <button type="button" onClick={() => setView('list')} className="px-6 py-2 bg-border-color hover:bg-opacity-80 rounded-md font-semibold text-light">Cancelar</button>
                        <button type="submit" className="px-6 py-2 bg-success hover:bg-green-600 text-white rounded-md font-bold shadow-lg">
                            <i className="fas fa-save mr-2"></i> Salvar Colaborador
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

export default CollaboratorRegistration;
