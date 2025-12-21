
import React, { useState, useMemo } from 'react';
import { useAppStore } from '../hooks/useAppStore';
import { useAuth } from '../hooks/useAuth';
import { ComplianceRecord, ComplianceType, ComplianceSeverity, ComplianceStatus, Attachment } from '../types';
import { fileToBase64, base64ToSrc, validateFileFormat, ALLOWED_EXTENSIONS } from '../services/fileService';

const Compliance: React.FC = () => {
    const { complianceRecords, addComplianceRecord, updateComplianceRecord, deleteComplianceRecord } = useAppStore();
    const { currentUser } = useAuth();
    
    const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Initial Form State
    const initialFormState: Partial<ComplianceRecord> = {
        title: '',
        type: 'Segurança',
        severity: 'Baixa',
        status: 'Pendente',
        description: '',
        observation: '',
        date: new Date().toISOString().split('T')[0],
        responsible: currentUser?.name || '',
        involvedPerson: '',
        attachments: []
    };
    
    const [formData, setFormData] = useState<Partial<ComplianceRecord>>(initialFormState);

    const filteredRecords = useMemo(() => {
        if (!searchTerm) return complianceRecords;
        const lowerSearch = searchTerm.toLowerCase();
        return complianceRecords.filter(r => 
            r.title.toLowerCase().includes(lowerSearch) ||
            r.description.toLowerCase().includes(lowerSearch) ||
            r.responsible.toLowerCase().includes(lowerSearch) ||
            (r.involvedPerson && r.involvedPerson.toLowerCase().includes(lowerSearch))
        ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [complianceRecords, searchTerm]);

    const handleNew = () => {
        setEditingId(null);
        setFormData({ ...initialFormState, responsible: currentUser?.name || '' });
        setIsModalOpen(true);
    };

    const handleEdit = (record: ComplianceRecord) => {
        setEditingId(record.id);
        setFormData(record);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir este registro de irregularidade?')) {
            deleteComplianceRecord(id);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.title || !formData.description) {
            alert('Título e Descrição são obrigatórios.');
            return;
        }

        if (editingId) {
            updateComplianceRecord({ ...formData, id: editingId } as ComplianceRecord);
        } else {
            addComplianceRecord(formData as Omit<ComplianceRecord, 'id' | 'createdAt'>);
        }
        
        setIsModalOpen(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            if (!validateFileFormat(file)) {
                alert(`O formato do arquivo "${file.name}" não é permitido. Aceitos: ${ALLOWED_EXTENSIONS.join(', ')}`);
                return;
            }
            const base64 = await fileToBase64(file);
            const newAttachment: Attachment = {
                id: `att-${Date.now()}`,
                name: file.name,
                size: file.size,
                url: base64,
                type: file.type
            };
            setFormData(prev => ({
                ...prev,
                attachments: [...(prev.attachments || []), newAttachment]
            }));
        }
    };

    const handleRemoveAttachment = (attId: string) => {
        setFormData(prev => ({
            ...prev,
            attachments: prev.attachments?.filter(a => a.id !== attId)
        }));
    };

    const handlePrintWarning = (record: ComplianceRecord) => {
        // Use the involvedPerson from record if available, otherwise prompt
        const employeeName = record.involvedPerson || prompt("Digite o Nome do Colaborador a ser advertido:");
        if (!employeeName) return;
        
        const employeeCpf = prompt("Digite o CPF do Colaborador (Opcional):") || "____________________";

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert("Habilite os pop-ups para imprimir.");
            return;
        }

        const dateFormatted = new Date(record.date).toLocaleDateString('pt-BR');
        const today = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });

        const htmlContent = `
            <html>
            <head>
                <title>Termo de Advertência Disciplinar</title>
                <style>
                    body { font-family: 'Times New Roman', serif; padding: 40px; margin: 0; color: #000; line-height: 1.6; }
                    .container { max-width: 800px; margin: 0 auto; }
                    .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #000; padding-bottom: 20px; }
                    .title { font-size: 18px; font-weight: bold; text-transform: uppercase; margin-bottom: 30px; text-align: center; text-decoration: underline; }
                    .content { text-align: justify; margin-bottom: 30px; font-size: 14px; }
                    .details { background-color: #f0f0f0; padding: 15px; border: 1px solid #ccc; margin: 20px 0; font-family: Arial, sans-serif; font-size: 12px; }
                    .signatures { margin-top: 80px; display: flex; justify-content: space-between; }
                    .sig-block { text-align: center; width: 45%; }
                    .line { border-top: 1px solid #000; margin-bottom: 5px; }
                    .footer { margin-top: 50px; font-size: 10px; text-align: center; color: #555; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>ECOLOG - GESTÃO & OPERAÇÕES</h2>
                        <p>Departamento de Recursos Humanos e Compliance</p>
                    </div>

                    <div class="title">TERMO DE ADVERTÊNCIA DISCIPLINAR</div>

                    <div class="content">
                        <p>Ao Sr.(a) <strong>${employeeName.toUpperCase()}</strong></p>
                        <p>CPF: ${employeeCpf}</p>
                        <br/>
                        <p>Vimos pela presente aplicar-lhe a pena de <strong>ADVERTÊNCIA DISCIPLINAR</strong>, em razão da ocorrência abaixo descrita, que configura infração às normas da empresa e/ou legislação trabalhista vigente.</p>
                        
                        <div class="details">
                            <p><strong>Data da Ocorrência:</strong> ${dateFormatted}</p>
                            <p><strong>Tipo de Infração:</strong> ${record.type} (Gravidade: ${record.severity})</p>
                            <p><strong>Motivo/Descrição:</strong></p>
                            <p>${record.description}</p>
                            ${record.observation ? `<p><strong>Observações Adicionais:</strong> ${record.observation}</p>` : ''}
                        </div>

                        <p>Esclarecemos que a reincidência em falhas desta natureza, ou o cometimento de outras infrações, poderá ensejar medidas disciplinares mais severas, conforme o Artigo 482 da Consolidação das Leis do Trabalho (CLT), podendo culminar em suspensão ou até mesmo demissão por Justa Causa.</p>
                        
                        <p>Solicitamos sua colaboração para que fatos como este não voltem a ocorrer, mantendo a conduta profissional esperada.</p>
                    </div>

                    <br/>
                    <p style="text-align: right;">${formData.city || 'Local'}, ${today}.</p>

                    <div class="signatures">
                        <div class="sig-block">
                            <div class="line"></div>
                            <p><strong>EMPREGADOR</strong></p>
                            <p>Ecolog Transportes</p>
                        </div>
                        <div class="sig-block">
                            <div class="line"></div>
                            <p><strong>${employeeName.toUpperCase()}</strong></p>
                            <p>Colaborador(a)</p>
                        </div>
                    </div>

                    <div class="signatures" style="margin-top: 60px;">
                        <div class="sig-block">
                            <div class="line"></div>
                            <p>Testemunha 01</p>
                        </div>
                        <div class="sig-block">
                            <div class="line"></div>
                            <p>Testemunha 02</p>
                        </div>
                    </div>

                    <div class="footer">
                        Este documento deve ser arquivado no prontuário do colaborador.
                    </div>
                </div>
                <script>
                    window.onload = function() { window.print(); }
                </script>
            </body>
            </html>
        `;

        printWindow.document.write(htmlContent);
        printWindow.document.close();
    };

    // Styling Helpers
    const getSeverityBadge = (severity: ComplianceSeverity) => {
        const styles = {
            'Baixa': 'bg-green-500/20 text-green-300 border-green-500/30',
            'Média': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
            'Alta': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
            'Crítica': 'bg-red-500/20 text-red-300 border-red-500/30'
        };
        return <span className={`px-2 py-1 rounded text-xs font-bold border ${styles[severity]}`}>{severity}</span>;
    };

    const getStatusBadge = (status: ComplianceStatus) => {
        const styles = {
            'Pendente': 'bg-red-500/10 text-red-300',
            'Em Análise': 'bg-blue-500/10 text-blue-300',
            'Resolvido': 'bg-green-500/10 text-green-300',
            'Arquivado': 'bg-gray-500/10 text-gray-400'
        };
        return <span className={`px-2 py-1 rounded text-xs border border-transparent ${styles[status]}`}>{status}</span>;
    };

    // Render Components
    const renderKanban = () => {
        const statuses: ComplianceStatus[] = ['Pendente', 'Em Análise', 'Resolvido', 'Arquivado'];
        
        return (
            <div className="flex gap-4 overflow-x-auto pb-4 h-[600px]">
                {statuses.map(status => {
                    const records = filteredRecords.filter(r => r.status === status);
                    return (
                        <div key={status} className="min-w-[300px] w-[300px] bg-bg-main rounded-lg flex flex-col border border-border-color">
                            <div className="p-3 font-bold text-light border-b border-border-color flex justify-between items-center sticky top-0 bg-bg-main z-10 rounded-t-lg">
                                <span>{status}</span>
                                <span className="bg-bg-card px-2 py-0.5 rounded text-xs text-gray-400">{records.length}</span>
                            </div>
                            <div className="p-2 space-y-3 overflow-y-auto flex-grow custom-scrollbar">
                                {records.map(record => (
                                    <div key={record.id} className="bg-bg-card p-3 rounded border border-border-color hover:border-secondary transition-all shadow-sm group relative">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-xs text-gray-500">{new Date(record.date).toLocaleDateString('pt-BR')}</span>
                                            {getSeverityBadge(record.severity)}
                                        </div>
                                        <h4 className="font-bold text-light text-sm mb-1">{record.title}</h4>
                                        <p className="text-xs text-gray-400 mb-2 truncate">{record.type}</p>
                                        
                                        {record.involvedPerson && (
                                            <div className="text-xs text-secondary bg-secondary/10 p-1 rounded mb-2">
                                                <i className="fas fa-user-tag mr-1"></i> {record.involvedPerson}
                                            </div>
                                        )}

                                        <div className="flex justify-between items-center mt-3 pt-2 border-t border-border-color/50">
                                            <div className="flex gap-2">
                                                {record.attachments && record.attachments.length > 0 && (
                                                    <span className="text-xs text-gray-500"><i className="fas fa-paperclip"></i> {record.attachments.length}</span>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleEdit(record)} className="text-blue-400 hover:text-white transition-colors" title="Editar"><i className="fas fa-edit"></i></button>
                                                <button onClick={() => handleDelete(record.id)} className="text-red-500 hover:text-white transition-colors" title="Excluir"><i className="fas fa-trash"></i></button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {records.length === 0 && <div className="text-center text-gray-600 text-xs py-4 italic">Vazio</div>}
                            </div>
                        </div>
                    )
                })}
            </div>
        );
    };

    const renderList = () => (
        <div className="overflow-x-auto bg-bg-main rounded-lg border border-border-color">
            <table className="w-full text-sm text-left text-gray-text">
                <thead className="text-xs text-gray-400 uppercase bg-bg-card border-b border-border-color">
                    <tr>
                        <th className="px-6 py-3">Data</th>
                        <th className="px-6 py-3">Título / Tipo</th>
                        <th className="px-6 py-3">Envolvido</th>
                        <th className="px-6 py-3">Severidade</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Anexos</th>
                        <th className="px-6 py-3 text-right">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border-color">
                    {filteredRecords.map(record => (
                        <tr key={record.id} className="hover:bg-bg-card/50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">{new Date(record.date).toLocaleDateString('pt-BR')}</td>
                            <td className="px-6 py-4">
                                <div className="font-bold text-light">{record.title}</div>
                                <div className="text-xs text-gray-500">{record.type}</div>
                            </td>
                            <td className="px-6 py-4 font-semibold text-light">{record.involvedPerson || '-'}</td>
                            <td className="px-6 py-4">{getSeverityBadge(record.severity)}</td>
                            <td className="px-6 py-4">{getStatusBadge(record.status)}</td>
                            <td className="px-6 py-4 text-center">
                                {record.attachments && record.attachments.length > 0 ? (
                                    <span className="text-secondary cursor-help" title={`${record.attachments.length} arquivos`}>
                                        <i className="fas fa-paperclip"></i> {record.attachments.length}
                                    </span>
                                ) : '-'}
                            </td>
                            <td className="px-6 py-4 text-right space-x-2">
                                <button onClick={() => handlePrintWarning(record)} className="text-gray-400 hover:text-white p-1 bg-gray-600/20 rounded" title="Gerar Termo de Advertência">
                                    <i className="fas fa-print"></i>
                                </button>
                                <button onClick={() => handleEdit(record)} className="text-blue-400 hover:text-blue-300 p-1 bg-blue-500/10 rounded"><i className="fas fa-edit"></i></button>
                                <button onClick={() => handleDelete(record.id)} className="text-red-500 hover:text-red-400 p-1 bg-red-500/10 rounded"><i className="fas fa-trash"></i></button>
                            </td>
                        </tr>
                    ))}
                    {filteredRecords.length === 0 && (
                        <tr>
                            <td colSpan={7} className="px-6 py-12 text-center text-gray-500 italic">
                                <i className="fas fa-check-circle text-4xl mb-2 text-green-500/20 block"></i>
                                Nenhuma irregularidade encontrada.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="bg-bg-card rounded-lg p-6 shadow-lg min-h-[80vh]">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 border-b border-border-color pb-4">
                <div>
                    <h2 className="text-2xl font-bold text-light flex items-center gap-3">
                        <i className="fas fa-shield-alt text-secondary"></i> Compliance & Irregularidades
                    </h2>
                    <p className="text-gray-text text-sm mt-1">Gestão de não conformidades, segurança e ética.</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto items-center flex-wrap">
                    <div className="bg-bg-main p-1 rounded-lg flex border border-border-color">
                        <button 
                            onClick={() => setViewMode('list')} 
                            className={`px-3 py-1 rounded text-xs font-bold transition-all ${viewMode === 'list' ? 'bg-secondary text-white' : 'text-gray-400 hover:text-light'}`}
                        >
                            <i className="fas fa-list"></i> Lista
                        </button>
                        <button 
                            onClick={() => setViewMode('kanban')} 
                            className={`px-3 py-1 rounded text-xs font-bold transition-all ${viewMode === 'kanban' ? 'bg-secondary text-white' : 'text-gray-400 hover:text-light'}`}
                        >
                            <i className="fas fa-columns"></i> Kanban
                        </button>
                    </div>
                    <div className="relative flex-grow md:flex-grow-0">
                        <input 
                            type="text" 
                            placeholder="Pesquisar..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-bg-main border border-border-color rounded-md py-2 pl-10 pr-4 text-light focus:outline-none focus:ring-2 focus:ring-secondary text-sm"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i className="fas fa-search text-gray-text text-xs"></i>
                        </div>
                    </div>
                    <button onClick={handleNew} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-bold flex items-center gap-2 shadow-md transition-colors whitespace-nowrap text-sm">
                        <i className="fas fa-exclamation-triangle"></i> Nova Irregularidade
                    </button>
                </div>
            </div>

            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-bg-main p-4 rounded-lg border-l-4 border-red-500 shadow-sm">
                    <p className="text-xs text-gray-400 font-bold uppercase">Irregularidades Críticas</p>
                    <p className="text-2xl font-bold text-light">{complianceRecords.filter(r => r.severity === 'Crítica' && r.status !== 'Resolvido').length}</p>
                </div>
                <div className="bg-bg-main p-4 rounded-lg border-l-4 border-yellow-500 shadow-sm">
                    <p className="text-xs text-gray-400 font-bold uppercase">Pendentes de Ação</p>
                    <p className="text-2xl font-bold text-light">{complianceRecords.filter(r => r.status === 'Pendente').length}</p>
                </div>
                <div className="bg-bg-main p-4 rounded-lg border-l-4 border-blue-500 shadow-sm">
                    <p className="text-xs text-gray-400 font-bold uppercase">Em Análise</p>
                    <p className="text-2xl font-bold text-light">{complianceRecords.filter(r => r.status === 'Em Análise').length}</p>
                </div>
                <div className="bg-bg-main p-4 rounded-lg border-l-4 border-green-500 shadow-sm">
                    <p className="text-xs text-gray-400 font-bold uppercase">Total Resolvidos</p>
                    <p className="text-2xl font-bold text-light">{complianceRecords.filter(r => r.status === 'Resolvido').length}</p>
                </div>
            </div>

            {/* View Render */}
            {viewMode === 'list' ? renderList() : renderKanban()}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[2000] p-4" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-bg-card p-6 rounded-lg shadow-xl w-full max-w-3xl border border-border-color max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6 border-b border-border-color pb-4">
                            <h3 className="text-xl font-bold text-light flex items-center gap-2">
                                <i className="fas fa-exclamation-circle text-secondary"></i>
                                {editingId ? 'Editar Irregularidade' : 'Reportar Nova Irregularidade'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><i className="fas fa-times text-xl"></i></button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Título</label>
                                    <input name="title" value={formData.title} onChange={handleInputChange} className="w-full bg-bg-main border border-border-color rounded p-2 text-light" required placeholder="Resumo do incidente" />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Data da Ocorrência</label>
                                    <input type="date" name="date" value={formData.date} onChange={handleInputChange} className="w-full bg-bg-main border border-border-color rounded p-2 text-light" required />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Tipo</label>
                                    <select name="type" value={formData.type} onChange={handleInputChange} className="w-full bg-bg-main border border-border-color rounded p-2 text-light">
                                        <option>Segurança</option>
                                        <option>Meio Ambiente</option>
                                        <option>Ética</option>
                                        <option>Procedimental</option>
                                        <option>Legal</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Severidade</label>
                                    <select name="severity" value={formData.severity} onChange={handleInputChange} className="w-full bg-bg-main border border-border-color rounded p-2 text-light">
                                        <option>Baixa</option>
                                        <option>Média</option>
                                        <option>Alta</option>
                                        <option>Crítica</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Status</label>
                                    <select name="status" value={formData.status} onChange={handleInputChange} className="w-full bg-bg-main border border-border-color rounded p-2 text-light">
                                        <option>Pendente</option>
                                        <option>Em Análise</option>
                                        <option>Resolvido</option>
                                        <option>Arquivado</option>
                                    </select>
                                </div>
                            </div>

                            {/* Envolvido Section */}
                            <div className="bg-red-900/10 p-4 rounded border border-red-900/30">
                                <label className="block text-sm font-bold text-red-300 mb-1">Envolvido / Acusado</label>
                                <input 
                                    name="involvedPerson" 
                                    value={formData.involvedPerson} 
                                    onChange={handleInputChange} 
                                    className="w-full bg-bg-main border border-red-900/30 rounded p-2 text-light" 
                                    placeholder="Nome do colaborador envolvido (para o termo de advertência)" 
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Descrição Detalhada</label>
                                <textarea name="description" value={formData.description} onChange={handleInputChange} rows={4} className="w-full bg-bg-main border border-border-color rounded p-2 text-light" placeholder="Descreva o que aconteceu..." required></textarea>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-1 font-bold text-yellow-500"><i className="fas fa-sticky-note mr-1"></i> Observação (Compliance)</label>
                                <textarea name="observation" value={formData.observation} onChange={handleInputChange} rows={3} className="w-full bg-bg-main border border-yellow-500/50 rounded p-2 text-light focus:border-yellow-500 outline-none" placeholder="Notas internas, ações tomadas ou observações adicionais..."></textarea>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Responsável pelo Registro</label>
                                    <input name="responsible" value={formData.responsible} onChange={handleInputChange} className="w-full bg-bg-main border border-border-color rounded p-2 text-light" />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Anexar Fotos / Arquivos</label>
                                    <input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" multiple onChange={handleFileUpload} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-secondary file:text-white hover:file:bg-opacity-80"/>
                                </div>
                            </div>

                            {/* Attachments List */}
                            {formData.attachments && formData.attachments.length > 0 && (
                                <div className="bg-bg-main p-3 rounded border border-border-color">
                                    <p className="text-xs text-gray-400 mb-2 font-bold">Anexos:</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {formData.attachments.map((att, idx) => (
                                            <div key={idx} className="flex justify-between items-center bg-bg-card p-2 rounded text-xs">
                                                <span className="truncate max-w-[150px]" title={att.name}>{att.name}</span>
                                                <div className="flex gap-2">
                                                    {att.type?.startsWith('image/') && (
                                                        <button 
                                                            type="button" 
                                                            onClick={() => {
                                                                const win = window.open();
                                                                win?.document.write(`<img src="${base64ToSrc(att.url || '', att.type || '')}" style="max-width:100%"/>`);
                                                            }}
                                                            className="text-blue-400 hover:text-white"
                                                        >
                                                            <i className="fas fa-eye"></i>
                                                        </button>
                                                    )}
                                                    <button type="button" onClick={() => handleRemoveAttachment(att.id)} className="text-red-500 hover:text-white">
                                                        <i className="fas fa-times"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-4 border-t border-border-color mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-border-color rounded text-light hover:bg-opacity-80">Cancelar</button>
                                <button type="submit" className="px-6 py-2 bg-secondary text-white font-bold rounded hover:bg-opacity-90 shadow-lg">Salvar Registro</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Compliance;
