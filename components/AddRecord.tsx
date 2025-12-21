import React, { useState, useEffect } from 'react';
import { useAppStore } from '../hooks/useAppStore';

const categories = {
    "fixed-cost": [
        "Infra: aluguel", 
        "Infra: escritório adm", 
        "Infra: energia", 
        "Pessoal: Salários", 
        "Seguros", 
        "Pró-labore",
        "Salários administrativos (gestores, despachantes, contadores etc.)",
        "Encargos sociais e trabalhistas",
        "Benefícios (vale-refeição, plano de saúde, etc.)",
        "Aluguel de escritório, pátio ou garagem",
        "Energia elétrica",
        "Água",
        "Telefone fixo",
        "Internet",
        "Sistemas de gestão (TMS, ERP)",
        "Segurança patrimonial",
        "Limpeza e manutenção predial",
        "Depreciação dos veículos",
        "IPVA",
        "Seguro dos veículos (casco e terceiros)",
        "Rastreamento e monitoramento (mensalidade)",
        "Juros e amortizações de financiamentos",
        "Contabilidade",
        "Assessoria jurídica",
        "Outros"
    ],
    "variable-cost": [
        "Frota", 
        "Equipamentos", 
        "Reembolsos", 
        "Gente", 
        "Licenciamento",
        "Multas",
        "Despesas bancárias",
        "Outros"
    ],
    "revenue": ["Frete", "Armazenagem", "Logística", "Outros"],
    "receivable": ["Frete", "Armazenagem", "Logística", "Outros"]
};

const AddRecord: React.FC = () => {
    const { addRecord, setActiveTab } = useAppStore();
    const [recordType, setRecordType] = useState('');
    const [currentCategories, setCurrentCategories] = useState<string[]>([]);

    useEffect(() => {
        setCurrentCategories(categories[recordType as keyof typeof categories] || []);
    }, [recordType]);

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

        addRecord(recordType, newRecord);
        alert('Registro adicionado com sucesso!');
        e.currentTarget.reset();
        setRecordType('');
        setActiveTab('transactions');
    };

    return (
        <div className="bg-bg-card rounded-lg p-5 shadow-lg">
            <h3 className="text-lg font-semibold text-light mb-4">Adicionar Novo Registro</h3>
            <form id="record-form" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="form-group">
                        <label className="form-label" htmlFor="record-type">Tipo de Registro</label>
                        <select
                            className="form-select"
                            id="record-type"
                            name="type"
                            required
                            value={recordType}
                            onChange={(e) => setRecordType(e.target.value)}
                        >
                            <option value="">Selecione...</option>
                            <option value="fixed-cost">Custo Fixo</option>
                            <option value="variable-cost">Custo Variável</option>
                            <option value="revenue">Receita</option>
                            <option value="receivable">Recebível</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="record-name">Nome</label>
                        <input className="form-input" type="text" id="record-name" name="name" required minLength={3} />
                    </div>
                     <div className="form-group">
                        <label className="form-label" htmlFor="record-description">Descrição</label>
                        <input className="form-input" type="text" id="record-description" name="description" required />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="record-attachment">Anexo (Foto ou PDF)</label>
                        <input className="form-input p-[7px]" type="file" id="record-attachment" name="attachment" accept="image/*,.pdf" />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="record-category">Categoria</label>
                        <select className="form-select" id="record-category" name="category" required disabled={!recordType}>
                            <option value="">Selecione...</option>
                            {currentCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="record-value">Valor (R$)</label>
                        <input className="form-input" type="number" id="record-value" name="value" step="0.01" min="0.01" required />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="record-date">Data</label>
                        <input className="form-input" type="date" id="record-date" name="date" required />
                    </div>
                    {(recordType === 'revenue' || recordType === 'receivable') && (
                        <div className="form-group">
                            <label className="form-label" htmlFor="record-client">Cliente</label>
                            <input className="form-input" type="text" id="record-client" name="client" required />
                        </div>
                    )}
                    {recordType === 'receivable' && (
                         <div className="form-group">
                            <label className="form-label" htmlFor="record-due-date">Data de Vencimento</label>
                            <input className="form-input" type="date" id="record-due-date" name="dueDate" required />
                        </div>
                    )}
                     <div className="form-group md:col-span-2 lg:col-span-3">
                        <label className="form-label" htmlFor="record-observation">Observação (Opcional)</label>
                        <textarea className="form-input" name="observation" id="record-observation" rows={3}></textarea>
                    </div>
                </div>
                <div className="mt-6 flex gap-4">
                    <button type="submit" className="px-4 py-2 bg-primary text-white font-semibold rounded-md hover:bg-opacity-90 shadow-md hover:shadow-lg transition-shadow">Adicionar Registro</button>
                    <button type="reset" className="px-4 py-2 bg-border-color text-light font-semibold rounded-md hover:bg-opacity-90 shadow-md hover:shadow-lg transition-shadow">Limpar</button>
                </div>
            </form>
        </div>
    );
};

// Reusable form styles
const formStyles = `
.form-group { display: flex; flex-direction: column; }
.form-label { margin-bottom: 0.5rem; font-weight: 500; color: #f9fafb; }
.form-input, .form-select {
    padding: 0.75rem;
    border: 1px solid #374151;
    border-radius: 0.375rem;
    font-size: 1rem;
    background-color: #111827;
    color: #f9fafb;
    transition: border-color 0.2s, box-shadow 0.2s;
}
.form-input:focus, .form-select:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}
.form-input:invalid, .form-select:invalid {
    border-color: #e74c3c;
}
.form-input:invalid:focus, .form-select:invalid:focus {
    box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
}
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = formStyles;
document.head.appendChild(styleSheet);


export default AddRecord;