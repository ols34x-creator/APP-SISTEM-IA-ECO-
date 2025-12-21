
import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../hooks/useAppStore';
import { parseCteXML } from '../utils/cteParser';
import { validateFileFormat, ALLOWED_EXTENSIONS } from '../services/fileService';

type FormType = 'revenue' | 'receivable' | 'fixed-cost' | 'variable-cost';

const categories = {
    'fixed-cost': ["Infra: aluguel", "Infra: escritório adm", "Infra: energia", "Pessoal: Salários", "Seguros", "Pró-labore", "Salários administrativos (gestores, despachantes, contadores etc.)", "Encargos sociais e trabalhistas", "Benefícios (vale-refeição, plano de saúde, etc.)", "Aluguel de escritório, pátio ou garagem", "Energia elétrica", "Água", "Telefone fixo", "Internet", "Sistemas de gestão (TMS, ERP)", "Segurança patrimonial", "Limpeza e manutenção predial", "Depreciação dos veículos", "IPVA", "Seguro dos veículos (casco e terceiros)", "Rastreamento e monitoramento (mensalidade)", "Juros e amortizações de financiamentos", "Contabilidade", "Assessoria jurídica", "Outros"],
    'variable-cost': ["Frota", "Equipamentos", "Reembolsos", "Gente", "Licenciamento", "Multas", "Despesas bancárias", "Outros"],
    'revenue': ["Frete", "Armazenagem", "Logística", "Outros"],
    'receivable': ["Frete", "Armazenagem", "Logística", "Outros"]
};

const FormSelector: React.FC<{ activeForm: FormType, setActiveForm: (type: FormType) => void }> = ({ activeForm, setActiveForm }) => {
    const tabs: { id: FormType, label: string, icon: string, color: string }[] = [
        { id: 'revenue', label: 'Receita', icon: 'fa-arrow-up', color: 'text-green-400' },
        { id: 'receivable', label: 'Recebível', icon: 'fa-file-invoice-dollar', color: 'text-blue-400' },
        { id: 'fixed-cost', label: 'Custo Fixo', icon: 'fa-arrow-down', color: 'text-red-400' },
        { id: 'variable-cost', label: 'Custo Variável', icon: 'fa-arrows-alt-v', color: 'text-yellow-400' },
    ];

    return (
        <div className="flex flex-wrap border-b border-border-color mb-6 rounded-lg overflow-hidden shadow-md">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveForm(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-3 p-4 text-sm font-semibold transition-colors duration-200 min-w-[180px]
                        ${activeForm === tab.id ? 'bg-primary text-white' : 'bg-bg-main text-gray-300 hover:bg-border-color'}`}
                >
                    <i className={`fas ${tab.icon} ${activeForm === tab.id ? 'text-white' : tab.color}`}></i> {tab.label}
                </button>
            ))}
        </div>
    );
};

const FinancialEntries: React.FC = () => {
    const { addRecord } = useAppStore();
    const [activeForm, setActiveForm] = useState<FormType>('revenue');
    const [currentCategories, setCurrentCategories] = useState<string[]>([]);
    const formRef = useRef<HTMLFormElement>(null);
    const cteFileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setCurrentCategories(categories[activeForm] || []);
    }, [activeForm]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        const value = parseFloat(data.value as string);

        if (isNaN(value) || value <= 0) {
            alert("Por favor, insira um valor numérico positivo.");
            return;
        }

        const attachmentFile = data.attachment as File;
        if (attachmentFile && attachmentFile.size > 0) {
            if (!validateFileFormat(attachmentFile)) {
                alert(`O formato do anexo "${attachmentFile.name}" não é permitido. Aceitos: ${ALLOWED_EXTENSIONS.join(', ')}`);
                return;
            }
        }

        const newRecord = {
            id: Date.now(),
            name: data.name as string,
            description: data.description as string,
            category: data.category as string,
            value: value,
            date: data.date as string,
            client: data.client as string,
            dueDate: data.dueDate as string,
            status: 'pending' as 'pending',
            attachment: attachmentFile && attachmentFile.size > 0 ? attachmentFile.name : undefined,
            observation: data.observation as string,
        };

        addRecord(activeForm, newRecord);
        alert('Registro adicionado com sucesso!');
        formRef.current?.reset();
    };

    const handleCteFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && (file.type === 'text/xml' || file.name.endsWith('.xml'))) {
            try {
                const xmlText = await file.text();
                const parsedData = parseCteXML(xmlText);
                const form = formRef.current;

                if (form && parsedData) {
                    // Pre-select a relevant form type
                    setActiveForm('receivable');

                    (form.elements.namedItem('name') as HTMLInputElement).value = `Frete CTe ${parsedData.numeroCTe}`;
                    (form.elements.namedItem('description') as HTMLInputElement).value = `Serviço de transporte referente à chave de acesso: ${parsedData.chaveAcesso}`;
                    (form.elements.namedItem('value') as HTMLInputElement).value = parsedData.valorCTe;

                    // Delay setting conditional fields to ensure they exist after re-render
                    setTimeout(() => {
                        const clientInput = form.elements.namedItem('client') as HTMLInputElement;
                        if(clientInput) clientInput.value = parsedData.tomadorNome;

                        const dateInput = form.elements.namedItem('dueDate') as HTMLInputElement;
                        if(dateInput) dateInput.value = parsedData.dataEmissao;

                        const categorySelect = form.elements.namedItem('category') as HTMLSelectElement;
                        if (categorySelect) categorySelect.value = 'Frete';

                    }, 100);

                    alert('Dados do CTe importados com sucesso!');
                } else {
                    alert('Não foi possível extrair os dados do CTe. Verifique se o arquivo XML é válido.');
                }
            } catch (error) {
                console.error("Error reading CTe file:", error);
                alert("Ocorreu um erro ao ler o arquivo.");
            }
        } else {
            alert('Por favor, selecione um arquivo XML.');
        }
        // Reset file input to allow re-uploading the same file
        if (e.target) e.target.value = '';
    };

    const getFormTitle = () => {
        switch (activeForm) {
            case 'revenue': return 'Registrar Nova Receita';
            case 'receivable': return 'Registrar Novo Recebível';
            case 'fixed-cost': return 'Registrar Novo Custo Fixo';
            case 'variable-cost': return 'Registrar Novo Custo Variável';
        }
    };

    return (
        <div className="bg-bg-card rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-light mb-2">Lançamentos Financeiros</h2>
            <p className="text-gray-text mb-6">Selecione o tipo de lançamento e preencha o formulário para alimentar os painéis de BI.</p>
            
            <FormSelector activeForm={activeForm} setActiveForm={setActiveForm} />
            
            <div className="mb-6 flex justify-end">
                <button
                    type="button"
                    onClick={() => cteFileInputRef.current?.click()}
                    className="px-4 py-2 bg-secondary text-white font-semibold rounded-md hover:bg-opacity-90 shadow-md hover:shadow-lg transition-shadow flex items-center gap-2"
                >
                    <i className="fas fa-barcode"></i> Importar de CTe (XML)
                </button>
                <input
                    type="file"
                    ref={cteFileInputRef}
                    onChange={handleCteFileChange}
                    className="hidden"
                    accept=".xml,text/xml"
                />
            </div>

            <form ref={formRef} id="record-form" onSubmit={handleSubmit}>
                <h3 className="text-lg font-semibold text-primary mb-4">{getFormTitle()}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <div className="form-group">
                        <label className="form-label" htmlFor="record-name">Nome / Título</label>
                        <input className="form-input" type="text" id="record-name" name="name" required minLength={3} />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="record-category">Categoria</label>
                        <select className="form-select" id="record-category" name="category" required>
                            <option value="">Selecione...</option>
                            {currentCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="record-value">Valor (R$)</label>
                        <input className="form-input" type="number" id="record-value" name="value" step="0.01" min="0.01" required />
                    </div>

                    {(activeForm === 'revenue' || activeForm === 'receivable') && (
                        <div className="form-group">
                            <label className="form-label" htmlFor="record-client">Cliente</label>
                            <input className="form-input" type="text" id="record-client" name="client" required />
                        </div>
                    )}

                    {activeForm === 'receivable' ? (
                        <div className="form-group">
                            <label className="form-label" htmlFor="record-due-date">Data de Vencimento</label>
                            <input className="form-input" type="date" id="record-due-date" name="dueDate" required />
                        </div>
                    ) : (
                         <div className="form-group">
                            <label className="form-label" htmlFor="record-date">Data do Lançamento</label>
                            <input className="form-input" type="date" id="record-date" name="date" required />
                        </div>
                    )}
                    
                     <div className="form-group">
                        <label className="form-label" htmlFor="record-attachment">Anexo (Opcional)</label>
                        <input className="form-input p-[7px] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-secondary file:text-white hover:file:bg-opacity-90" type="file" id="record-attachment" name="attachment" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
                    </div>

                    <div className="form-group md:col-span-2 lg:col-span-3">
                        <label className="form-label" htmlFor="record-description">Descrição</label>
                        <textarea className="form-input min-h-[80px]" id="record-description" name="description" required ></textarea>
                    </div>

                     <div className="form-group md:col-span-2 lg:col-span-3">
                        <label className="form-label" htmlFor="record-observation">Observação (Opcional)</label>
                        <textarea className="form-input" id="record-observation" name="observation" ></textarea>
                    </div>
                </div>

                <div className="mt-6 flex gap-4">
                    <button type="submit" className="px-5 py-3 bg-success text-white font-bold rounded-md hover:bg-opacity-90 shadow-md hover:shadow-lg transition-shadow flex items-center gap-2">
                        <i className="fas fa-check-circle"></i> Salvar Lançamento
                    </button>
                    <button type="reset" className="px-5 py-3 bg-border-color text-light font-semibold rounded-md hover:bg-opacity-90 shadow-md hover:shadow-lg transition-shadow">
                        Limpar Campos
                    </button>
                </div>
            </form>
             <style>{`
                .form-group { display: flex; flex-direction: column; }
                .form-label { margin-bottom: 0.5rem; font-size: 0.875rem; font-weight: 500; color: #d1d5db; }
                .form-input, .form-select, .form-textarea {
                    padding: 0.75rem;
                    border: 1px solid #374151;
                    border-radius: 0.375rem;
                    font-size: 1rem;
                    background-color: #111827;
                    color: #f9fafb;
                    transition: border-color 0.2s, box-shadow 0.2s;
                }
                .form-input:focus, .form-select:focus, .form-textarea:focus {
                    outline: none;
                    border-color: #3498db;
                    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
                }
            `}</style>
        </div>
    );
};

export default FinancialEntries;
