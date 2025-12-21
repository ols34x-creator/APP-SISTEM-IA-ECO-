
import React, { useState, useMemo } from 'react';
import { useAppStore } from '../hooks/useAppStore';
import PlanilhaCustosTransporte from './PlanilhaCustosTransporte';

type ReceiptTab = 'terceiros' | 'servicos' | 'adiantamento' | 'pagamento-colaborador' | 'relatorio-custos' | 'planilha-transporte' | 'comprovante-custos' | 'resumo-transporte' | 'compilacao-feedback' | 'dse';

interface ReceiptCategory {
    id: string;
    label: string;
    icon: string;
    tabs: ReceiptTab[];
}

const CATEGORIES: ReceiptCategory[] = [
    {
        id: 'logistics',
        label: 'Logística & Frota',
        icon: 'fa-truck-loading',
        tabs: ['resumo-transporte', 'planilha-transporte', 'dse', 'compilacao-feedback']
    },
    {
        id: 'payments',
        label: 'Pagamentos & Terceiros',
        icon: 'fa-hand-holding-usd',
        tabs: ['terceiros', 'servicos', 'pagamento-colaborador']
    },
    {
        id: 'management',
        label: 'Gestão Interna',
        icon: 'fa-file-invoice-dollar',
        tabs: ['adiantamento', 'comprovante-custos', 'relatorio-custos']
    }
];

const TABS_INFO: Record<ReceiptTab, { text: string; icon: string; desc: string }> = {
    'resumo-transporte': { text: 'Resumo de Transporte', icon: 'fa-route', desc: 'Resumo consolidado para operações de carga.' },
    'planilha-transporte': { text: 'Planilha de Custos', icon: 'fa-calculator', desc: 'Cálculo detalhado de custos operacionais.' },
    'dse': { text: 'DSE - Exportação', icon: 'fa-file-export', desc: 'Declaração Simplificada de Exportação para despacho.' },
    'compilacao-feedback': { text: 'Compilador de Feedback', icon: 'fa-file-contract', desc: 'Gera relatórios de serviço com anexos.' },
    'terceiros': { text: 'Recibo de Terceiros', icon: 'fa-user-friends', desc: 'Pagamento a prestadores sem vínculo direto.' },
    'servicos': { text: 'Recibo de Serviços', icon: 'fa-briefcase', desc: 'Comprovante de prestação de serviços diversos.' },
    'pagamento-colaborador': { text: 'Pagamento Colaborador', icon: 'fa-file-signature', desc: 'Holerite e recibos salariais internos.' },
    'adiantamento': { text: 'Adiantamento', icon: 'fa-money-bill-wave', desc: 'Solicitação e recibo de valores antecipados.' },
    'comprovante-custos': { text: 'Comprovante de Custos', icon: 'fa-receipt', desc: 'Registro de despesas pontuais de campo.' },
    'relatorio-custos': { text: 'Relatório de Custos', icon: 'fa-chart-line', desc: 'Consolidação de gastos por período ou projeto.' },
};

// Utility components for better organization
const FormSection: React.FC<{ title: string; icon: string; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-bg-main/20 p-6 rounded-2xl border border-border-color/30 mb-8 last:mb-0 shadow-sm transition-all hover:border-secondary/20">
        <h3 className="text-xs font-black text-secondary uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                <i className={`fas ${icon}`}></i>
            </span>
            {title}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {children}
        </div>
    </div>
);

const InputGroup: React.FC<{ label: string; icon?: string; children: React.ReactNode; className?: string }> = ({ label, icon, children, className = "" }) => (
    <div className={`flex flex-col gap-2 ${className}`}>
        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1 flex items-center gap-2">
            {icon && <i className={`fas ${icon} text-secondary`}></i>}
            {label}
        </label>
        {children}
    </div>
);

const handlePrintForm = (title: string, content: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert("Não foi possível abrir a janela de impressão. Por favor, desative o bloqueador de pop-ups.");
        return;
    }
    printWindow.document.write(`
        <html>
            <head>
                <title>${title}</title>
                <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 1.5cm; font-size: 10pt; color: #1e293b; background: white; }
                    @page { size: A4; margin: 0; }
                    .header { text-align: center; border-bottom: 3px solid #0f172a; padding-bottom: 15px; margin-bottom: 25px; }
                    .titulo { font-size: 16pt; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 1px; }
                    .subtitulo { font-size: 10pt; color: #64748b; margin-top: 5px; font-weight: 600; }
                    .caixa { border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 15px; background: #fff; break-inside: avoid; }
                    .caixa-titulo { background: #f8fafc; color: #0f172a; padding: 6px 12px; margin: -12px -12px 12px -12px; border-radius: 8px 8px 0 0; font-weight: 800; font-size: 9pt; border-bottom: 1.5px solid #e2e8f0; text-transform: uppercase; }
                    .linha { display: flex; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #f1f5f9; }
                    .linha:last-child { border-bottom: none; margin-bottom: 0; }
                    .rotulo { font-weight: 700; min-width: 140px; color: #475569; font-size: 9pt; }
                    .valor { color: #1e293b; flex: 1; font-weight: 500; }
                    .valor-principal { text-align: center; font-size: 18pt; font-weight: 800; color: #0f172a; border: 3px solid #0f172a; border-radius: 12px; padding: 15px; margin: 25px 0; background: #f8fafc; }
                    .item-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                    .item-table th, .item-table td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; }
                    .item-table th { background: #f8fafc; font-size: 9pt; font-weight: 800; color: #475569; text-transform: uppercase; }
                    .signature-area { display: flex; justify-content: space-around; margin-top: 60px; }
                    .sig-box { text-align: center; border-top: 1.5px solid #0f172a; width: 220px; padding-top: 8px; font-size: 9pt; font-weight: 600; }
                </style>
            </head>
            <body>
                <main>${content}</main>
                <script>window.onload = function() { window.print(); setTimeout(function() { window.close(); }, 200); }</script>
            </body>
        </html>
    `);
    printWindow.document.close();
};

const ReciboDSE = () => {
    const [form, setForm] = useState({ 
        numeroDse: `DSE-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        exportador: 'IMPÉRIO ECO LOG LTDA',
        cnpjExportador: '32.243.464/0001-15',
        consignatario: '',
        paisDestino: '',
        descricaoMercadoria: '',
        ncm: '',
        valorMoeda: '',
        moeda: 'USD',
        pesoBruto: '',
        volumes: '1',
        localDespacho: 'PORTO DO RIO DE JANEIRO'
    });

    const generate = (e: React.FormEvent) => {
        e.preventDefault();
        const content = `
            <div class="header">
                <div class="titulo">Declaração Simplificada de Exportação</div>
                <div class="subtitulo">Protocolo de Registro: ${form.numeroDse}</div>
            </div>
            <div class="caixa">
                <div class="caixa-titulo">Identificação do Exportador</div>
                <div class="linha"><div class="rotulo">Razão Social:</div><div class="valor">${form.exportador}</div></div>
                <div class="linha"><div class="rotulo">CNPJ:</div><div class="valor">${form.cnpjExportador}</div></div>
                <div class="linha"><div class="rotulo">Local de Despacho:</div><div class="valor">${form.localDespacho}</div></div>
            </div>
            <div class="caixa">
                <div class="caixa-titulo">Dados do Destinatário (Consignatário)</div>
                <div class="linha"><div class="rotulo">Nome/Empresa:</div><div class="valor">${form.consignatario}</div></div>
                <div class="linha"><div class="rotulo">País de Destino:</div><div class="valor">${form.paisDestino}</div></div>
            </div>
            <div class="caixa">
                <div class="caixa-titulo">Detalhamento da Carga</div>
                <div class="linha"><div class="rotulo">Mercadoria:</div><div class="valor">${form.descricaoMercadoria}</div></div>
                <div class="linha"><div class="rotulo">NCM:</div><div class="valor">${form.ncm}</div></div>
                <div class="linha"><div class="rotulo">Peso Bruto:</div><div class="valor">${form.pesoBruto} kg</div></div>
                <div class="linha"><div class="rotulo">Volumes:</div><div class="valor">${form.volumes}</div></div>
            </div>
            <div class="valor-principal">VALOR DA OPERAÇÃO: ${form.moeda} ${parseFloat(form.valorMoeda).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
            <p style="font-size: 8pt; text-align: center; color: #64748b; margin-top: 20px;">Declaração emitida para fins de trâmite logístico e conferência de exportação simplificada.</p>
            <div class="signature-area">
                <div class="sig-box">Visto Exportador</div>
                <div class="sig-box">Visto Recinto Alfandegado</div>
            </div>
        `;
        handlePrintForm("DSE - Exportação", content);
    };

    return (
        <form onSubmit={generate}>
            <FormSection title="Dados da Declaração" icon="fa-globe-americas">
                <InputGroup label="Número DSE (Automático)"><input className="form-input opacity-60" value={form.numeroDse} readOnly /></InputGroup>
                <InputGroup label="Local de Despacho"><input className="form-input" value={form.localDespacho} onChange={e => setForm({...form, localDespacho: e.target.value})} /></InputGroup>
                <InputGroup label="Consignatário (Importador)"><input className="form-input" value={form.consignatario} onChange={e => setForm({...form, consignatario: e.target.value})} required /></InputGroup>
                <InputGroup label="País de Destino"><input className="form-input" value={form.paisDestino} onChange={e => setForm({...form, paisDestino: e.target.value})} required /></InputGroup>
            </FormSection>
            
            <FormSection title="Informações Técnicas da Carga" icon="fa-box-open">
                <InputGroup label="Descrição da Mercadoria"><input className="form-input" value={form.descricaoMercadoria} onChange={e => setForm({...form, descricaoMercadoria: e.target.value})} required /></InputGroup>
                <InputGroup label="NCM"><input className="form-input" value={form.ncm} onChange={e => setForm({...form, ncm: e.target.value})} placeholder="Ex: 8708.99.90" /></InputGroup>
                <div className="grid grid-cols-2 gap-4 col-span-2">
                    <InputGroup label="Moeda">
                        <select className="form-input" value={form.moeda} onChange={e => setForm({...form, moeda: e.target.value})}>
                            <option value="USD">Dólar (USD)</option>
                            <option value="EUR">Euro (EUR)</option>
                            <option value="BRL">Real (BRL)</option>
                        </select>
                    </InputGroup>
                    <InputGroup label="Valor na Moeda"><input type="number" step="0.01" className="form-input" value={form.valorMoeda} onChange={e => setForm({...form, valorMoeda: e.target.value})} required /></InputGroup>
                </div>
                <InputGroup label="Peso Bruto (kg)"><input type="number" className="form-input" value={form.pesoBruto} onChange={e => setForm({...form, pesoBruto: e.target.value})} /></InputGroup>
                <InputGroup label="Quantidade de Volumes"><input type="number" className="form-input" value={form.volumes} onChange={e => setForm({...form, volumes: e.target.value})} /></InputGroup>
            </FormSection>
            
            <button type="submit" className="w-full mt-4 p-4 bg-primary text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-all uppercase tracking-widest">
                <i className="fas fa-file-export mr-2"></i> GERAR DECLARAÇÃO DSE
            </button>
        </form>
    );
};

const ResumoTransporte = () => {
    const [form, setForm] = useState({ cliente: '', container: '', motorista: '', placa: '', origem: '', destino: '', valor: '', data: new Date().toISOString().split('T')[0] });
    const generate = (e: React.FormEvent) => {
        e.preventDefault();
        const content = `
            <div class="header"><div class="titulo">Resumo de Operação de Transporte</div><div class="subtitulo">IMPÉRIO ECO LOG LTDA</div></div>
            <div class="caixa">
                <div class="caixa-titulo">Dados da Viagem</div>
                <div class="linha"><div class="rotulo">Cliente:</div><div class="valor">${form.cliente}</div></div>
                <div class="linha"><div class="rotulo">Container:</div><div class="valor">${form.container}</div></div>
                <div class="linha"><div class="rotulo">Motorista:</div><div class="valor">${form.motorista}</div></div>
                <div class="linha"><div class="rotulo">Placa:</div><div class="valor">${form.placa}</div></div>
            </div>
            <div class="caixa">
                <div class="caixa-titulo">Trajeto</div>
                <div class="linha"><div class="rotulo">Origem:</div><div class="valor">${form.origem}</div></div>
                <div class="linha"><div class="rotulo">Destino:</div><div class="valor">${form.destino}</div></div>
            </div>
            <div class="valor-principal">VALOR DO FRETE: R$ ${parseFloat(form.valor).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
            <div class="signature-area"><div class="sig-box">Assinatura Operacional</div><div class="sig-box">Visto Motorista</div></div>
        `;
        handlePrintForm("Resumo de Transporte", content);
    };
    return (
        <form onSubmit={generate}>
            <FormSection title="Dados da Operação" icon="fa-truck">
                <InputGroup label="Cliente"><input className="form-input" value={form.cliente} onChange={e => setForm({...form, cliente: e.target.value})} required /></InputGroup>
                <InputGroup label="Identificação Container"><input className="form-input" value={form.container} onChange={e => setForm({...form, container: e.target.value})} /></InputGroup>
                <InputGroup label="Motorista"><input className="form-input" value={form.motorista} onChange={e => setForm({...form, motorista: e.target.value})} /></InputGroup>
                <InputGroup label="Placa Veículo"><input className="form-input" value={form.placa} onChange={e => setForm({...form, placa: e.target.value})} /></InputGroup>
                <InputGroup label="Origem"><input className="form-input" value={form.origem} onChange={e => setForm({...form, origem: e.target.value})} /></InputGroup>
                <InputGroup label="Destino"><input className="form-input" value={form.destino} onChange={e => setForm({...form, destino: e.target.value})} /></InputGroup>
                <InputGroup label="Valor do Frete (R$)"><input type="number" step="0.01" className="form-input" value={form.valor} onChange={e => setForm({...form, valor: e.target.value})} /></InputGroup>
            </FormSection>
            <button type="submit" className="w-full mt-4 p-4 bg-primary text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-all">GERAR RESUMO</button>
        </form>
    );
};

const ReciboTerceiros = () => {
    const [form, setForm] = useState({ nome: '', documento: '', servico: '', valor: '', data: new Date().toISOString().split('T')[0] });
    const generate = (e: React.FormEvent) => {
        e.preventDefault();
        const content = `
            <div class="header"><div class="titulo">Recibo de Pagamento a Terceiros</div><div class="subtitulo">IMPÉRIO ECO LOG LTDA</div></div>
            <p>Recebemos de <strong>IMPÉRIO ECO LOG LTDA</strong> a importância de <strong>R$ ${parseFloat(form.valor).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</strong> referente a: <strong>${form.servico}</strong>.</p>
            <div class="caixa">
                <div class="caixa-titulo">Dados do Beneficiário</div>
                <div class="linha"><div class="rotulo">Nome:</div><div class="valor">${form.nome}</div></div>
                <div class="linha"><div class="rotulo">CNPJ/CPF:</div><div class="valor">${form.documento}</div></div>
            </div>
            <div class="signature-area"><div class="sig-box">Assinatura do Recebedor</div></div>
        `;
        handlePrintForm("Recibo de Terceiros", content);
    };
    return (
        <form onSubmit={generate}>
            <FormSection title="Dados do Beneficiário" icon="fa-user-friends">
                <InputGroup label="Nome / Razão Social"><input className="form-input" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} required /></InputGroup>
                <InputGroup label="CNPJ ou CPF"><input className="form-input" value={form.documento} onChange={e => setForm({...form, documento: e.target.value})} required /></InputGroup>
                <InputGroup label="Descrição do Serviço"><input className="form-input" value={form.servico} onChange={e => setForm({...form, servico: e.target.value})} /></InputGroup>
                <InputGroup label="Valor (R$)"><input type="number" step="0.01" className="form-input" value={form.valor} onChange={e => setForm({...form, valor: e.target.value})} /></InputGroup>
            </FormSection>
            <button type="submit" className="w-full mt-4 p-4 bg-secondary text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-all">GERAR RECIBO TERCEIROS</button>
        </form>
    );
};

const ReciboAdiantamento = () => {
    const [form, setForm] = useState({ favorecido: '', motivo: '', valor: '', data: new Date().toISOString().split('T')[0] });
    const generate = (e: React.FormEvent) => {
        e.preventDefault();
        const content = `
            <div class="header"><div class="titulo">Vale de Adiantamento</div><div class="subtitulo">IMPÉRIO ECO LOG LTDA</div></div>
            <div class="valor-principal">VALOR: R$ ${parseFloat(form.valor).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
            <p>Pela presente, confesso ter recebido a título de adiantamento para <strong>${form.motivo}</strong> a quantia supra mencionada.</p>
            <div class="caixa">
                <div class="linha"><div class="rotulo">Favorecido:</div><div class="valor">${form.favorecido}</div></div>
                <div class="linha"><div class="rotulo">Data:</div><div class="valor">${new Date(form.data).toLocaleDateString('pt-BR')}</div></div>
            </div>
            <div class="signature-area"><div class="sig-box">Assinatura Favorecido</div><div class="sig-box">Autorizado por</div></div>
        `;
        handlePrintForm("Vale Adiantamento", content);
    };
    return (
        <form onSubmit={generate}>
            <FormSection title="Solicitação de Adiantamento" icon="fa-money-bill-wave">
                <InputGroup label="Favorecido"><input className="form-input" value={form.favorecido} onChange={e => setForm({...form, favorecido: e.target.value})} required /></InputGroup>
                <InputGroup label="Finalidade do Valor"><input className="form-input" value={form.motivo} onChange={e => setForm({...form, motivo: e.target.value})} /></InputGroup>
                <InputGroup label="Valor Solicitado (R$)"><input type="number" step="0.01" className="form-input" value={form.valor} onChange={e => setForm({...form, valor: e.target.value})} /></InputGroup>
                <InputGroup label="Data"><input type="date" className="form-input" value={form.data} onChange={e => setForm({...form, data: e.target.value})} /></InputGroup>
            </FormSection>
            <button type="submit" className="w-full mt-4 p-4 bg-orange-600 text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-all">EMITIR VALE ADIANTAMENTO</button>
        </form>
    );
};

const ServiceFeedbackCompiler = () => {
    const { logAction } = useAppStore();
    const [editorText, setEditorText] = useState('');
    const [documents, setDocuments] = useState<{ name: string; type: string; size: string }[]>([]);

    const serviceTemplate = `Prezados, boa tarde!

Segue feedback de realização de serviço, em anexo recibo de prestação do mesmo e imagens da realização.

Serviço foi executado pela IMPÉRIO ECO LOG, inscrita no CNPJ nº 32.243.464/0001-15, com sede na Avenida Brasil, nº 02520, bairro Caju, Rio de Janeiro – RJ.

A operação ocorreu na modalidade rodoviária, classificada como serviço normal, referente à natureza da operação 5351 – Prestação de Serviço de Transporte Estadual, compreendendo o trajeto Rio de Janeiro – RJ até Magé – RJ.

Tendo como destinatário a empresa MULTI-RIO OPERAÇÕES PORTUÁRIAS S/A, figurando como remetente a empresa estrangeira SHANGHAI BACHINA IMPORT EXPORT CO., LTD (China).

A carga transportada consistiu em mercadorias diversas, acondicionadas em 555 volumes (caixas), totalizando 15.100 kg de peso bruto.

O valor total do frete foi fixado em R$ 2.500,00 (dois mil e quinhentos reais).

[INSIRA AQUI DETALHES ADICIONAIS DO SERVIÇO]

Atenciosamente,
Equipe Logística`;

    const insertTemplate = () => {
        setEditorText(serviceTemplate);
        logAction('Template de feedback de serviço inserido.');
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files).map((f: File) => ({
                name: f.name,
                type: f.name.split('.').pop()?.toUpperCase() || 'DOC',
                size: (f.size / 1024 / 1024).toFixed(2) + ' MB'
            }));
            setDocuments([...documents, ...newFiles]);
            logAction(`${newFiles.length} documentos anexados ao compilador.`);
        }
    };

    const removeDoc = (index: number) => {
        setDocuments(documents.filter((_, i) => i !== index));
    };

    const exportDoc = (format: 'pdf' | 'doc' | 'txt') => {
        if (!editorText.trim()) {
            alert('O editor está vazio. Insira o texto do feedback primeiro.');
            return;
        }
        const date = new Date().toISOString().split('T')[0];
        const fileName = `Feedback_Servico_${date}.${format}`;
        
        if (format === 'txt') {
            const blob = new Blob([editorText], { type: 'text/plain' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = fileName;
            link.click();
        } else if (format === 'doc') {
            const content = `<html><body>${editorText.replace(/\n/g, '<br>')}</body></html>`;
            const blob = new Blob([content], { type: 'application/msword' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = fileName;
            link.click();
        } else {
            const printWindow = window.open('', '_blank');
            printWindow?.document.write(`<html><head><title>${fileName}</title></head><body><div style="white-space:pre-wrap">${editorText}</div><script>window.print();</script></body></html>`);
            printWindow?.document.close();
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            <div className="lg:col-span-1 space-y-6">
                <FormSection title="Anexar Documentos" icon="fa-cloud-upload-alt">
                    <label className="w-full h-40 border-2 border-dashed border-border-color rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group">
                        <i className="fas fa-file-upload text-3xl text-gray-600 group-hover:text-primary mb-3"></i>
                        <span className="text-sm font-bold text-gray-500 text-center">Arraste ou clique para anexar</span>
                        <input type="file" multiple className="hidden" onChange={handleFileUpload} />
                    </label>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                        {documents.map((doc, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-bg-main/40 border border-border-color/30 rounded-xl">
                                <span className="text-xs font-bold text-light truncate w-32">{doc.name}</span>
                                <button onClick={() => removeDoc(idx)} className="text-gray-600 hover:text-danger"><i className="fas fa-trash-alt"></i></button>
                            </div>
                        ))}
                    </div>
                </FormSection>
            </div>
            <div className="lg:col-span-2 space-y-6">
                <FormSection title="Compilação do Feedback" icon="fa-edit">
                    <div className="flex gap-2 mb-2">
                        <button onClick={insertTemplate} className="px-4 py-2 bg-secondary/20 text-secondary text-[10px] font-black uppercase rounded-lg hover:bg-secondary hover:text-white">USAR TEMPLATE</button>
                    </div>
                    <textarea className="form-input min-h-[400px] font-mono text-sm" value={editorText} onChange={(e) => setEditorText(e.target.value)} />
                    <div className="grid grid-cols-3 gap-4 mt-6">
                        <button onClick={() => exportDoc('pdf')} className="p-4 bg-bg-main/50 border border-border-color/40 rounded-2xl flex flex-col items-center gap-2"><i className="fas fa-file-pdf"></i> PDF</button>
                        <button onClick={() => exportDoc('doc')} className="p-4 bg-bg-main/50 border border-border-color/40 rounded-2xl flex flex-col items-center gap-2"><i className="fas fa-file-word"></i> Word</button>
                        <button onClick={() => exportDoc('txt')} className="p-4 bg-bg-main/50 border border-border-color/40 rounded-2xl flex flex-col items-center gap-2"><i className="fas fa-file-alt"></i> Texto</button>
                    </div>
                </FormSection>
            </div>
        </div>
    );
};

const ReciboPagamentoColaborador = () => {
    const [formState, setFormState] = useState({ colaborador: '', cpf: '', cargo: '', mesReferencia: '', salarioBruto: '', descontos: '', outrosProventos: '', empresa: 'IMPÉRIO ECO LOG LTDA', data: new Date().toISOString().split('T')[0] });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setFormState(prev => ({...prev, [e.target.name]: e.target.value}));
    const generateAndPrint = (e: React.FormEvent) => {
        e.preventDefault();
        const bruto = parseFloat(formState.salarioBruto) || 0;
        const extra = parseFloat(formState.outrosProventos) || 0;
        const desc = parseFloat(formState.descontos) || 0;
        const liquido = (bruto + extra) - desc;
        const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
        const content = `
            <div class="header"><div class="titulo">Recibo de Pagamento Salarial</div><div class="subtitulo">${formState.empresa}</div></div>
            <div class="caixa">
                <div class="caixa-titulo">Identificação do Profissional</div>
                <div class="linha"><div class="rotulo">Colaborador:</div><div class="valor">${formState.colaborador}</div></div>
                <div class="linha"><div class="rotulo">CPF:</div><div class="valor">${formState.cpf}</div></div>
                <div class="linha"><div class="rotulo">Função:</div><div class="valor">${formState.cargo}</div></div>
            </div>
            <div class="valor-principal">LÍQUIDO A RECEBER: ${fmt(liquido)}</div>
            <div class="signature-area"><div class="sig-box">Assinatura Colaborador</div><div class="sig-box">${formState.empresa}</div></div>
        `;
        handlePrintForm("Holerite", content);
    };
    return (
        <form onSubmit={generateAndPrint}>
            <FormSection title="Dados do Profissional" icon="fa-user-tie">
                <InputGroup label="Nome do Colaborador"><input className="form-input" name="colaborador" value={formState.colaborador} onChange={handleChange} required /></InputGroup>
                <InputGroup label="CPF"><input className="form-input" name="cpf" value={formState.cpf} onChange={handleChange} required /></InputGroup>
                <InputGroup label="Mês de Referência"><input className="form-input" name="mesReferencia" value={formState.mesReferencia} onChange={handleChange} placeholder="Ex: Outubro/2025" /></InputGroup>
                <InputGroup label="Salário Base (R$)"><input className="form-input" name="salarioBruto" type="number" step="0.01" value={formState.salarioBruto} onChange={handleChange} required /></InputGroup>
                <InputGroup label="Descontos (R$)"><input className="form-input" name="descontos" type="number" step="0.01" value={formState.descontos} onChange={handleChange} /></InputGroup>
                <InputGroup label="Extras (R$)"><input className="form-input" name="outrosProventos" type="number" step="0.01" value={formState.outrosProventos} onChange={handleChange} /></InputGroup>
            </FormSection>
            <button type="submit" className="w-full mt-4 p-4 bg-primary text-white font-bold rounded-xl shadow-lg">GERAR HOLERITE</button>
        </form>
    );
};

const RelatorioCustos = () => {
    const [header, setHeader] = useState({ operacao: '', responsavel: '', data: new Date().toISOString().split('T')[0] });
    const [items, setItems] = useState([{ id: 1, desc: '', valor: '' }]);
    const addItem = () => setItems([...items, { id: Date.now(), desc: '', valor: '' }]);
    const updateItem = (id: number, f: string, v: string) => setItems(items.map(i => i.id === id ? {...i, [f]: v} : i));
    const generateAndPrint = (e: React.FormEvent) => {
        e.preventDefault();
        const total = items.reduce((acc, curr) => acc + (parseFloat(curr.valor) || 0), 0);
        const rows = items.map(i => `<tr><td>${i.desc}</td><td style="text-align:right">${parseFloat(i.valor).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td></tr>`).join('');
        const content = `
            <div class="header"><div class="titulo">Relatório de Custos Operacionais</div></div>
            <div class="caixa">
                <div class="linha"><div class="rotulo">Referência:</div><div class="valor">${header.operacao}</div></div>
                <div class="linha"><div class="rotulo">Responsável:</div><div class="valor">${header.responsavel}</div></div>
            </div>
            <table class="item-table"><thead><tr><th>Descrição</th><th style="text-align:right">Valor</th></tr></thead><tbody>${rows}</tbody><tfoot><tr><th>TOTAL</th><th style="text-align:right">${total.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</th></tr></tfoot></table>
        `;
        handlePrintForm("Relatório de Custos", content);
    };
    return (
        <form onSubmit={generateAndPrint} className="space-y-6">
            <FormSection title="Dados Gerais" icon="fa-file-alt">
                <InputGroup label="Operação"><input className="form-input" value={header.operacao} onChange={e => setHeader({...header, operacao: e.target.value})} /></InputGroup>
                <InputGroup label="Responsável"><input className="form-input" value={header.responsavel} onChange={e => setHeader({...header, responsavel: e.target.value})} /></InputGroup>
            </FormSection>
            <div className="bg-bg-main/10 p-4 rounded-xl space-y-2">
                {items.map(item => (
                    <div key={item.id} className="flex gap-2">
                        <input className="form-input flex-grow" placeholder="Item" value={item.desc} onChange={e => updateItem(item.id, 'desc', e.target.value)} />
                        <input type="number" step="0.01" className="form-input w-32" placeholder="Valor" value={item.valor} onChange={e => updateItem(item.id, 'valor', e.target.value)} />
                    </div>
                ))}
                <button type="button" onClick={addItem} className="text-secondary text-sm font-bold">+ ADICIONAR ITEM</button>
            </div>
            <button type="submit" className="w-full p-4 bg-secondary text-white font-bold rounded-xl shadow-lg">GERAR RELATÓRIO</button>
        </form>
    );
};

const ComprovanteCustos = () => {
    const [form, setForm] = useState({ finalidade: '', local: '', valor: '', data: new Date().toISOString().split('T')[0] });
    const generate = (e: React.FormEvent) => {
        e.preventDefault();
        const content = `
            <div class="header"><div class="titulo">Comprovante de Despesa Local</div></div>
            <div class="caixa">
                <div class="linha"><div class="rotulo">Localização:</div><div class="valor">${form.local}</div></div>
                <div class="linha"><div class="rotulo">Finalidade:</div><div class="valor">${form.finalidade}</div></div>
            </div>
            <div class="valor-principal">R$ ${parseFloat(form.valor).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
            <p>Comprovante emitido eletronicamente para fins de prestação de contas internas.</p>
        `;
        handlePrintForm("Comprovante de Custos", content);
    };
    return (
        <form onSubmit={generate}>
            <FormSection title="Dados da Despesa" icon="fa-receipt">
                <InputGroup label="Local da Despesa"><input className="form-input" value={form.local} onChange={e => setForm({...form, local: e.target.value})} required /></InputGroup>
                <InputGroup label="Finalidade"><input className="form-input" value={form.finalidade} onChange={e => setForm({...form, finalidade: e.target.value})} /></InputGroup>
                <InputGroup label="Valor (R$)"><input type="number" step="0.01" className="form-input" value={form.valor} onChange={e => setForm({...form, valor: e.target.value})} /></InputGroup>
            </FormSection>
            <button type="submit" className="w-full mt-4 p-4 bg-primary text-white font-bold rounded-xl">GERAR COMPROVANTE</button>
        </form>
    );
};

const Receipts: React.FC = () => {
    const [activeTab, setActiveTab] = useState<ReceiptTab>('resumo-transporte');
    const { logAction } = useAppStore();
    const activeCategory = CATEGORIES.find(cat => cat.tabs.includes(activeTab))?.id || 'logistics';

    return (
        <div className="space-y-6">
            <div className="bg-bg-card rounded-3xl p-8 shadow-2xl border border-border-color/50 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none"><i className="fas fa-receipt text-[150px] text-primary rotate-12"></i></div>
                <div className="relative z-10">
                    <h2 className="text-3xl font-black text-light mb-2 tracking-tight">Centro de Documentação</h2>
                    <p className="text-gray-text text-lg max-w-2xl mb-10">Emita recibos, ordens de transporte e comprovantes financeiros profissionais.</p>
                    <div className="flex flex-col gap-6 mb-10">
                        <div className="flex flex-wrap gap-3 p-1.5 bg-bg-main/50 rounded-2xl border border-border-color/30 w-fit">
                            {CATEGORIES.map(cat => (
                                <button key={cat.id} onClick={() => { setActiveTab(cat.tabs[0]); logAction(`Categoria alterada: ${cat.label}`); }}
                                    className={`flex items-center gap-3 px-6 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeCategory === cat.id ? 'bg-secondary text-white shadow-xl' : 'bg-transparent text-gray-500 hover:text-light'}`}>
                                    <i className={`fas ${cat.icon} text-sm`}></i>{cat.label}
                                </button>
                            ))}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {CATEGORIES.find(c => c.id === activeCategory)?.tabs.map(tabId => {
                                const info = TABS_INFO[tabId];
                                const isActive = activeTab === tabId;
                                return (
                                    <button key={tabId} onClick={() => { setActiveTab(tabId); logAction(`Recibo selecionado: ${info.text}`); }}
                                        className={`flex flex-col items-start p-4 rounded-2xl border-2 transition-all text-left group ${isActive ? 'bg-primary/10 border-primary shadow-lg' : 'bg-bg-main/30 border-border-color/30 hover:border-secondary/40'}`}>
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${isActive ? 'bg-primary text-white' : 'bg-bg-card text-gray-500'}`}><i className={`fas ${info.icon} text-lg`}></i></div>
                                        <span className={`text-sm font-black mb-1 ${isActive ? 'text-light' : 'text-gray-400'}`}>{info.text}</span>
                                        <span className="text-[10px] text-gray-500 font-bold leading-tight">{info.desc}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <div className="mt-4 min-h-[500px] border-t border-border-color/30 pt-10">
                        {activeTab === 'resumo-transporte' && <ResumoTransporte />}
                        {activeTab === 'terceiros' && <ReciboTerceiros />}
                        {activeTab === 'servicos' && <ReciboTerceiros />}
                        {activeTab === 'adiantamento' && <ReciboAdiantamento />}
                        {activeTab === 'pagamento-colaborador' && <ReciboPagamentoColaborador />}
                        {activeTab === 'relatorio-custos' && <RelatorioCustos />}
                        {activeTab === 'compilacao-feedback' && <ServiceFeedbackCompiler />}
                        {activeTab === 'comprovante-custos' && <ComprovanteCustos />}
                        {activeTab === 'planilha-transporte' && <PlanilhaCustosTransporte />}
                        {activeTab === 'dse' && <ReciboDSE />}
                    </div>
                </div>
            </div>
            <style>{`.form-input { padding: 1rem 1.2rem; border: 2px solid #334155; border-radius: 1rem; font-size: 0.9rem; font-weight: 500; background-color: #0f172a; color: #f8fafc; width: 100%; transition: all 0.3s; } .form-input:focus { outline: none; border-color: #14b8a6; background-color: #1e293b; }`}</style>
        </div>
    );
};

export default Receipts;
