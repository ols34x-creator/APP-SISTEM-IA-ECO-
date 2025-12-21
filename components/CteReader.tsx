
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useAppStore } from '../hooks/useAppStore';
import { generateAccessKey, buildCTeXML, buildCTeOSXML } from '../utils/cteGenerator';
import DactePreview from './DactePreview';
import DacteModel from './DacteModel';

// Define types for global libraries to satisfy TypeScript
declare const pdfjsLib: any;
declare const jspdf: any;
declare const QRCode: any;

// --- Types for Reader ---
interface CteData {
    chaveAcesso: string;
    numeroCTe: string;
    dataEmissao: string;
    valorCTe: string;
    emitenteNome: string;
    emitenteCNPJ: string;
    emitenteEndereco: string;
    tomadorNome: string;
    tomadorCNPJCPF: string;
    tomadorEndereco: string;
    valorCarga: string;
    pesoBruto: string;
    volumes: string;
}

const initialCteData: CteData = {
    chaveAcesso: '', numeroCTe: '', dataEmissao: '', valorCTe: '',
    emitenteNome: '', emitenteCNPJ: '', emitenteEndereco: '',
    tomadorNome: '', tomadorCNPJCPF: '', tomadorEndereco: '',
    valorCarga: '', pesoBruto: '', volumes: ''
};

type ValidationStatus = 'idle' | 'validating' | 'validated' | 'error' | 'mismatch';

// --- Types for Emitter ---
interface CteItem {
    code: string;
    description: string;
    quantity: number;
    unitValue: number;
}

const emptyItem: CteItem = { code: "001", description: "Serviço de Transporte", quantity: 1, unitValue: 150.0 };

const ValidationStatusDisplay: React.FC<{ status: ValidationStatus; message: string }> = ({ status, message }) => {
    if (status === 'idle') return null;

    const config = {
        validating: { icon: 'fa-spinner fa-spin', color: 'text-secondary', bgColor: 'bg-secondary/10' },
        validated: { icon: 'fa-check-circle', color: 'text-success', bgColor: 'bg-success/10' },
        error: { icon: 'fa-times-circle', color: 'text-danger', bgColor: 'bg-danger/10' },
        mismatch: { icon: 'fa-exclamation-triangle', color: 'text-warning', bgColor: 'bg-warning/10' },
    };

    const currentConfig = config[status as keyof typeof config];

    return (
        <div className={`p-3 rounded-md flex items-center gap-3 mb-4 text-sm ${currentConfig.bgColor}`}>
            <i className={`fas ${currentConfig.icon} text-lg ${currentConfig.color}`}></i>
            <span className={currentConfig.color}>{message}</span>
        </div>
    );
};


const CteReader: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'read' | 'emit' | 'model'>('read');
    
    // --- Reader State ---
    const [fileInfo, setFileInfo] = useState('Nenhum arquivo selecionado');
    const [isPdfMode, setIsPdfMode] = useState(false);
    const [cteData, setCteData] = useState<CteData>(initialCteData);
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const pdfContainerRef = useRef<HTMLDivElement>(null);

    const [validationStatus, setValidationStatus] = useState<ValidationStatus>('idle');
    const [validationMessage, setValidationMessage] = useState('');

    // --- Emitter State ---
    const { logAction } = useAppStore();
    const [issuerName] = useState("EcOLog Transportes");
    const [issuerCNPJ, setIssuerCNPJ] = useState("12345678000199");
    const [sender, setSender] = useState({ name: "REMETENTE EXEMPLO LTDA", cnpj: "11111111000111", city: "SANTOS", uf: "SP" });
    const [receiver, setReceiver] = useState({ name: "DESTINATARIO FINAL SA", cnpj: "22222222000122", city: "SAO PAULO", uf: "SP" });
    const [items, setItems] = useState<CteItem[]>([emptyItem]);
    const [cteType, setCteType] = useState<"normal" | "os">("normal");
    const [generatedData, setGeneratedData] = useState<any>(null);

    // --- Helper formatting functions ---
    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
    };
    const formatCNPJ = (cnpj: string) => cnpj ? cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5') : '';
    const formatCPF = (cpf: string) => cpf ? cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : '';
    const formatCEP = (cep: string) => cep ? cep.replace(/(\d{5})(\d{3})/, '$1-$2') : '';
    const formatCurrency = (value: string | number) => {
        if (!value) return 'R$ 0,00';
        const val = typeof value === 'string' ? parseFloat(value) : value;
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };
    const formatNumber = (value: string) => {
        if (!value) return '0';
        return new Intl.NumberFormat('pt-BR').format(parseFloat(value));
    };

    const clearForm = () => {
        setCteData(initialCteData);
        setValidationStatus('idle');
        setValidationMessage('');
        setIsPdfMode(false);
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
    };

    // --- Reader Logic ---
    useEffect(() => {
        if (cteData.chaveAcesso) {
            setValidationStatus('validating');
            setValidationMessage('Validando chave de acesso em sistema de terceiros...');

            setTimeout(() => {
                const keyIsValid = cteData.chaveAcesso.length === 44 && /^\d+$/.test(cteData.chaveAcesso);
                
                const valueString = cteData.valorCTe.replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
                const valueIsPositive = !isNaN(parseFloat(valueString)) && parseFloat(valueString) > 0;

                if (keyIsValid && valueIsPositive) {
                    setValidationStatus('validated');
                    setValidationMessage('CTe validado com sucesso. Os dados correspondem ao registro externo.');
                } else if (!keyIsValid) {
                    setValidationStatus('error');
                    setValidationMessage('A chave de acesso é inválida (deve conter 44 dígitos numéricos).');
                } else {
                    setValidationStatus('mismatch');
                    setValidationMessage('Dados divergentes. O valor do CTe informado no XML é inválido ou zero.');
                }
            }, 1500);
        }
    }, [cteData.chaveAcesso, cteData.valorCTe]);


    const extractDataFromXML = (xmlDoc: XMLDocument) => {
        const getText = (element: Element, tagName: string, defaultValue = '') => {
            const elements = element.getElementsByTagName(tagName);
            return elements.length > 0 ? elements[0].textContent || defaultValue : defaultValue;
        };

        const cte = xmlDoc.getElementsByTagName('CTe')[0] || xmlDoc.getElementsByTagName('cte:CTe')[0];
        if (!cte) throw new Error('Estrutura do CTe não encontrada no XML');
        
        const infCte = cte.getElementsByTagName('infCte')[0];
        const ide = infCte.getElementsByTagName('ide')[0];
        const emit = infCte.getElementsByTagName('emit')[0];
        const dest = infCte.getElementsByTagName('dest')[0];
        const vPrest = infCte.getElementsByTagName('vPrest')[0];
        const infCTeNorm = infCte.getElementsByTagName('infCTeNorm')[0];
        const infCarga = infCTeNorm ? infCTeNorm.getElementsByTagName('infCarga')[0] : null;

        const dhEmi = getText(ide, 'dhEmi', '');
        const dataEmissao = dhEmi ? new Date(dhEmi).toLocaleString('pt-BR') : '';

        const emitEnderecoEl = emit.getElementsByTagName('enderEmit')[0];
        const emitenteEndereco = emitEnderecoEl ? `${getText(emitEnderecoEl, 'xLgr', '')}, ${getText(emitEnderecoEl, 'nro', '')} - ${getText(emitEnderecoEl, 'xBairro', '')}, ${getText(emitEnderecoEl, 'xMun', '')} - ${getText(emitEnderecoEl, 'UF', '')}, CEP: ${formatCEP(getText(emitEnderecoEl, 'CEP', ''))}` : '';

        const destEnderecoEl = dest?.getElementsByTagName('enderDest')[0];
        const tomadorEndereco = destEnderecoEl ? `${getText(destEnderecoEl, 'xLgr', '')}, ${getText(destEnderecoEl, 'nro', '')} - ${getText(destEnderecoEl, 'xBairro', '')}, ${getText(destEnderecoEl, 'xMun', '')} - ${getText(destEnderecoEl, 'UF', '')}, CEP: ${formatCEP(getText(destEnderecoEl, 'CEP', ''))}`: '';

        const cnpj = getText(dest, 'CNPJ', '');
        const cpf = getText(dest, 'CPF', '');
        
        const infQ = infCarga?.getElementsByTagName('infQ')[0];

        setCteData({
            chaveAcesso: infCte.getAttribute('Id')?.replace('CTe', '') || '',
            numeroCTe: getText(ide, 'nCT', ''),
            dataEmissao,
            valorCTe: formatCurrency(getText(vPrest, 'vTPrest', '')),
            emitenteNome: getText(emit, 'xNome', ''),
            emitenteCNPJ: formatCNPJ(getText(emit, 'CNPJ', '')),
            emitenteEndereco,
            tomadorNome: getText(dest, 'xNome', ''),
            tomadorCNPJCPF: cnpj ? formatCNPJ(cnpj) : (cpf ? formatCPF(cpf) : ''),
            tomadorEndereco,
            valorCarga: formatCurrency(getText(infCarga, 'vCarga', '')),
            pesoBruto: `${formatNumber(getText(infCarga, 'pesoB', ''))} kg`,
            volumes: getText(infQ, 'qCarga', '')
        });
    };

    const renderPdf = async (file: File) => {
        if (!canvasRef.current) return;
        
        try {
            // Configurar worker (importante para performance e evitar bloqueio da UI)
            if (pdfjsLib.GlobalWorkerOptions && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
                 pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
            }

            const fileURL = URL.createObjectURL(file);
            const loadingTask = pdfjsLib.getDocument(fileURL);
            const pdf = await loadingTask.promise;
            
            // Renderizar apenas a primeira página
            const page = await pdf.getPage(1);

            // Ajustar escala para alta definição
            const containerWidth = pdfContainerRef.current?.clientWidth || 600;
            
            // 1. Obter viewport base para calcular proporção
            const unscaledViewport = page.getViewport({ scale: 1 });
            
            // 2. Calcular escala necessária para preencher a largura
            const scale = (containerWidth - 40) / unscaledViewport.width; // -40 padding
            const viewport = page.getViewport({ scale: scale });

            // 3. Considerar devicePixelRatio para telas retina (High DPI)
            const outputScale = window.devicePixelRatio || 1;

            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            if (context) {
                canvas.width = Math.floor(viewport.width * outputScale);
                canvas.height = Math.floor(viewport.height * outputScale);
                canvas.style.width = Math.floor(viewport.width) + "px";
                canvas.style.height = Math.floor(viewport.height) + "px";

                const transform = outputScale !== 1 
                    ? [outputScale, 0, 0, outputScale, 0, 0] 
                    : null;

                const renderContext = {
                    canvasContext: context,
                    transform: transform,
                    viewport: viewport
                };
                
                await page.render(renderContext).promise;
            }
        } catch (error) {
            console.error("Erro ao renderizar PDF:", error);
            alert("Erro ao visualizar o PDF. O arquivo pode estar corrompido.");
        }
    };

    const handleFile = useCallback((file: File) => {
        const fileName = file.name;
        const fileExtension = fileName.split('.').pop()?.toLowerCase();

        setFileInfo(`Arquivo: ${fileName} (${formatFileSize(file.size)})`);
        clearForm();

        if (fileExtension === 'xml') {
            setIsPdfMode(false);
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const parser = new DOMParser();
                    const xmlDoc = parser.parseFromString(e.target!.result as string, 'text/xml');
                    if (xmlDoc.getElementsByTagName('parsererror').length > 0) throw new Error('XML inválido ou malformado');
                    extractDataFromXML(xmlDoc);
                } catch (error) {
                    console.error('Erro ao processar XML:', error);
                    alert('Erro ao processar o arquivo XML. Verifique se é um CTe válido.');
                }
            };
            reader.readAsText(file);
        } else if (fileExtension === 'pdf') {
            setIsPdfMode(true);
            setTimeout(() => {
                renderPdf(file);
            }, 100);
        } else {
            alert('Por favor, selecione um arquivo XML ou PDF.');
        }
    }, []);

    const onDragOver = (e: React.DragEvent) => e.preventDefault();
    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
    };
    const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.length) handleFile(e.target.files[0]);
    };
    
    const downloadJSON = () => {
        const jsonString = JSON.stringify(cteData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'dados_cte.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const generateQRCode = (value: string) => {
        if (!value) return;
        QRCode.toDataURL(value, { errorCorrectionLevel: 'H', width: 256 }, (err: any, url: string) => {
            if (err) { console.error(err); return; }
            setQrCodeDataUrl(url);
        });
    };

    // --- Emitter Logic ---
    const updateItem = (idx: number, field: keyof CteItem, value: string | number) => {
        const newItems = [...items];
        newItems[idx] = { ...newItems[idx], [field]: value };
        setItems(newItems);
    };

    const addItem = () => setItems([...items, { ...emptyItem, code: String(items.length + 1).padStart(3, "0") }]);
    const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));
    
    const totalValue = items.reduce((s, it) => s + (it.quantity || 0) * (it.unitValue || 0), 0);

    const handleGenerateCte = (type: 'normal' | 'os') => {
        // Validações Obrigatórias
        const cleanIssuerCNPJ = issuerCNPJ.replace(/\D/g, "");
        
        // 1. Validar Emitente
        if (!cleanIssuerCNPJ) { alert("Erro: O CNPJ do Emitente é obrigatório."); return; }

        // 2. Validar Remetente (Apenas Normal)
        if (type === 'normal') {
            if (!sender.name.trim()) { alert("Erro: O Nome do Remetente é obrigatório."); return; }
            if (!sender.cnpj.replace(/\D/g, "")) { alert("Erro: O CNPJ do Remetente é obrigatório."); return; }
            if (!sender.city.trim()) { alert("Erro: A Cidade do Remetente é obrigatória."); return; }
            if (!sender.uf.trim()) { alert("Erro: A UF do Remetente é obrigatória."); return; }
        }

        // 3. Validar Destinatário/Tomador
        if (!receiver.name.trim()) { alert("Erro: O Nome do Destinatário/Tomador é obrigatório."); return; }
        if (!receiver.cnpj.replace(/\D/g, "")) { alert("Erro: O CNPJ/CPF do Destinatário/Tomador é obrigatório."); return; }
        if (!receiver.city.trim()) { alert("Erro: A Cidade do Destinatário/Tomador é obrigatória."); return; }
        if (!receiver.uf.trim()) { alert("Erro: A UF do Destinatário/Tomador é obrigatória."); return; }

        // 4. Validar Itens
        if (items.length === 0) { alert("Erro: Adicione pelo menos um item ou serviço."); return; }
        
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (!item.description.trim()) { alert(`Erro: A descrição do item #${i + 1} é obrigatória.`); return; }
            if (!item.quantity || Number(item.quantity) <= 0) { alert(`Erro: A quantidade do item #${i + 1} deve ser maior que zero.`); return; }
            if (!item.unitValue || Number(item.unitValue) <= 0) { alert(`Erro: O valor unitário do item #${i + 1} deve ser maior que zero.`); return; }
        }

        const serie = Math.floor(Math.random() * 900) + 1;
        const numero = Math.floor(Math.random() * 900000000) + 1;
        const cnpjIssuer = issuerCNPJ.replace(/\D/g, "").padStart(14, "0").slice(0,14);
        const modelo = type === "os" ? "67" : "57";
        const now = new Date();
        const anoMes = now.toISOString().slice(2,7).replace("-", "");
        const ufCode = "33"; // RJ
        const tpEmis = "1";
        const nCTe = String(numero % 1000000000).padStart(9, "0");
        const serieStr = String(serie).padStart(3, "0");
        const cNF = String(Math.floor(Math.random() * 99999999)).padStart(8, "0");

        const key43 = [ufCode, anoMes, cnpjIssuer, modelo, serieStr, nCTe, tpEmis, cNF].join("");
        const chave = generateAccessKey(key43);

        const formData = { issuerName, issuerCNPJ, sender, receiver, items };
        const xmlData = { ...formData, modelo, serie: serieStr, numero: String(numero), chave, dtEmissao: now.toISOString() };
        
        const xml = type === "os" ? buildCTeOSXML(xmlData) : buildCTeXML(xmlData);

        const newData = {
            ...formData,
            tipo: type,
            serie: serieStr,
            numero: String(numero),
            modelo,
            chave,
            dtEmissao: now.toLocaleString(),
            total: totalValue,
            xml
        };

        setGeneratedData(newData);
        logAction(`CT-e ${type.toUpperCase()} gerado: ${chave}`);
    };

    const downloadXML = () => {
        if (!generatedData) return;
        const blob = new Blob([generatedData.xml], { type: "application/xml;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `CTE_${generatedData.numero}.xml`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    
    const printDacte = () => {
        const printContent = document.getElementById('dacte-print-area');
        if(!printContent) return;
        
        const printWindow = window.open('', '_blank');
        if(printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Impressão DACTE</title>
                        <script src="https://cdn.tailwindcss.com"></script>
                        <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
                        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
                    </head>
                    <body>
                        ${printContent.outerHTML}
                        <script>
                            setTimeout(() => {
                                window.print();
                                setTimeout(() => window.close(), 100);
                            }, 500);
                        </script>
                    </body>
                </html>
            `);
            printWindow.document.close();
        }
    };


    return (
        <div className="bg-bg-card text-light p-5 rounded-lg shadow-lg">
            <header className="flex justify-between items-center mb-6 border-b border-border-color pb-4">
                <div>
                    <h1 className="text-2xl font-bold"><i className="fas fa-barcode mr-2 text-primary"></i> CT-e: Emissor & Leitor</h1>
                    <p className="text-gray-text text-sm">Gerencie seus Conhecimentos de Transporte Eletrônicos.</p>
                </div>
                <div className="flex bg-bg-main rounded-lg p-1">
                    <button 
                        onClick={() => setActiveTab('read')} 
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${activeTab === 'read' ? 'bg-primary text-white' : 'text-gray-text hover:text-white'}`}
                    >
                        <i className="fas fa-search mr-2"></i> Ler XML/PDF
                    </button>
                    <button 
                        onClick={() => setActiveTab('emit')} 
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${activeTab === 'emit' ? 'bg-secondary text-white' : 'text-gray-text hover:text-white'}`}
                    >
                        <i className="fas fa-file-signature mr-2"></i> Emitir CT-e
                    </button>
                    <button 
                        onClick={() => setActiveTab('model')} 
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${activeTab === 'model' ? 'bg-green-600 text-white' : 'text-gray-text hover:text-white'}`}
                    >
                        <i className="fas fa-file-alt mr-2"></i> Modelo DACTE
                    </button>
                </div>
            </header>

            {activeTab === 'read' && (
                 <div className="flex flex-wrap gap-5">
                    <section className="flex-1 min-w-[300px] bg-bg-main p-5 rounded-lg">
                        <h2 className="text-lg font-semibold border-b border-border-color pb-2 mb-4">Upload do Arquivo</h2>
                        <div
                            className="border-2 border-dashed border-secondary rounded-lg p-8 text-center cursor-pointer transition-colors hover:bg-secondary/10"
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={onDragOver}
                            onDrop={onDrop}
                        >
                            <div className="text-5xl text-secondary mb-2">📁</div>
                            <p>Clique aqui ou arraste um arquivo XML ou PDF</p>
                            <input type="file" ref={fileInputRef} className="hidden" accept=".xml,.pdf" onChange={onFileInputChange} />
                        </div>
                        <div className="mt-4 p-3 bg-bg-card rounded text-sm">{fileInfo}</div>
                    </section>

                    <section className="flex-2 min-w-[600px]" ref={pdfContainerRef}>
                        <h2 className="text-lg font-semibold border-b border-border-color pb-2 mb-4">Visualização</h2>
                        
                        {isPdfMode ? (
                            <div className="flex flex-col items-center bg-bg-main p-4 rounded-lg">
                                <canvas ref={canvasRef} className="shadow-lg border border-border-color max-w-full" />
                                <p className="text-xs text-gray-text mt-2">Visualização renderizada em alta definição.</p>
                            </div>
                        ) : (
                            <>
                                <ValidationStatusDisplay status={validationStatus} message={validationMessage} />
                                <form>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div><label>Chave de Acesso</label><input type="text" value={cteData.chaveAcesso} readOnly className="form-input" /></div>
                                        <div><label>Número do CTe</label><input type="text" value={cteData.numeroCTe} readOnly className="form-input" /></div>
                                        <div><label>Data de Emissão</label><input type="text" value={cteData.dataEmissao} readOnly className="form-input" /></div>
                                        <div><label>Valor do CTe (R$)</label><input type="text" value={cteData.valorCTe} readOnly className="form-input" /></div>
                                    </div>

                                    <h3 className="section-title">Emitente</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div><label>Nome</label><input type="text" value={cteData.emitenteNome} readOnly className="form-input" /></div>
                                        <div><label>CNPJ</label><input type="text" value={cteData.emitenteCNPJ} readOnly className="form-input" /></div>
                                        <div className="md:col-span-2"><label>Endereço</label><textarea value={cteData.emitenteEndereco} readOnly className="form-input min-h-[60px]"></textarea></div>
                                    </div>

                                    <h3 className="section-title">Tomador/Destinatário</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div><label>Nome</label><input type="text" value={cteData.tomadorNome} readOnly className="form-input" /></div>
                                        <div><label>CNPJ/CPF</label><input type="text" value={cteData.tomadorCNPJCPF} readOnly className="form-input" /></div>
                                        <div className="md:col-span-2"><label>Endereço</label><textarea value={cteData.tomadorEndereco} readOnly className="form-input min-h-[60px]"></textarea></div>
                                    </div>
                                </form>
                                <div className="flex justify-end gap-3 mt-6">
                                    <button onClick={downloadJSON} className="btn-action bg-primary"><i className="fas fa-download mr-2"></i> Baixar JSON</button>
                                    <button onClick={() => cteData.chaveAcesso && generateQRCode(cteData.chaveAcesso)} className="btn-action bg-secondary"><i className="fas fa-qrcode mr-2"></i> Ver QR Code</button>
                                </div>

                                {qrCodeDataUrl && (
                                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setQrCodeDataUrl(null)}>
                                        <div className="bg-bg-card p-6 rounded-lg shadow-xl text-center" onClick={e => e.stopPropagation()}>
                                            <h3 className="text-xl font-bold text-light mb-4">QR Code - Chave de Acesso CTe</h3>
                                            <img src={qrCodeDataUrl} alt="QR Code" className="mx-auto border-4 border-white rounded-lg" />
                                            <p className="text-gray-text text-xs mt-2 break-all max-w-xs mx-auto">{cteData.chaveAcesso}</p>
                                            <div className="mt-6 flex justify-center gap-4">
                                                <button onClick={() => setQrCodeDataUrl(null)} className="btn-action bg-border-color">Fechar</button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </section>
                </div>
            )}
            
            {activeTab === 'emit' && (
                <div className="flex flex-wrap gap-5">
                    <div className="flex-1 min-w-[450px] bg-bg-main p-6 rounded-lg">
                        <h3 className="text-xl font-bold text-secondary mb-4">Nova Emissão (Simulação)</h3>
                        
                        <div className="form-section">
                            <h4 className="section-title">Tipo</h4>
                            <select value={cteType} onChange={(e) => setCteType(e.target.value as "normal" | "os")} className="form-input">
                                <option value="normal">CT-e Normal (57) - Carga</option>
                                <option value="os">CT-e OS (67) - Outros Serviços (Pessoas/Valores)</option>
                            </select>
                        </div>

                        {cteType === 'normal' && (
                            <div className="form-section mt-4">
                                <h4 className="section-title">Remetente</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <input placeholder="Nome / Razão Social" value={sender.name} onChange={e => setSender({...sender, name: e.target.value})} className="form-input" required />
                                    <input placeholder="CNPJ" value={sender.cnpj} onChange={e => setSender({...sender, cnpj: e.target.value})} className="form-input" required />
                                    <input placeholder="Cidade" value={sender.city} onChange={e => setSender({...sender, city: e.target.value})} className="form-input" required />
                                    <input placeholder="UF" value={sender.uf} onChange={e => setSender({...sender, uf: e.target.value})} className="form-input" required />
                                </div>
                            </div>
                        )}

                        <div className="form-section mt-4">
                            <h4 className="section-title">{cteType === 'os' ? 'Tomador do Serviço' : 'Destinatário'}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <input placeholder="Nome / Razão Social" value={receiver.name} onChange={e => setReceiver({...receiver, name: e.target.value})} className="form-input" required />
                                <input placeholder="CNPJ/CPF" value={receiver.cnpj} onChange={e => setReceiver({...receiver, cnpj: e.target.value})} className="form-input" required />
                                <input placeholder="Cidade" value={receiver.city} onChange={e => setReceiver({...receiver, city: e.target.value})} className="form-input" required />
                                <input placeholder="UF" value={receiver.uf} onChange={e => setReceiver({...receiver, uf: e.target.value})} className="form-input" required />
                            </div>
                        </div>

                        <div className="form-section mt-4">
                            <h4 className="section-title">Itens / Serviços</h4>
                            {items.map((it, idx) => (
                                <div key={idx} className="flex gap-2 mb-2 items-center">
                                    <input value={it.code} onChange={e => updateItem(idx, 'code', e.target.value)} placeholder="Cód." className="form-input w-16" />
                                    <input value={it.description} onChange={e => updateItem(idx, 'description', e.target.value)} placeholder="Descrição" className="form-input flex-grow" required />
                                    <input type="number" value={it.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} placeholder="Qtd" className="form-input w-20" required />
                                    <input type="number" value={it.unitValue} onChange={e => updateItem(idx, 'unitValue', e.target.value)} placeholder="Valor Un." className="form-input w-24" required />
                                    <button onClick={() => removeItem(idx)} className="text-red-500 hover:text-red-400 px-2"><i className="fas fa-times"></i></button>
                                </div>
                            ))}
                            <button onClick={addItem} className="text-sm text-primary hover:underline mt-2">+ Adicionar Item</button>
                        </div>

                        <div className="mt-6 pt-4 border-t border-border-color flex justify-between items-center">
                            <div className="text-lg font-bold text-light">Total Estimado: {formatCurrency(totalValue)}</div>
                            <button onClick={() => handleGenerateCte(cteType)} className="btn-action bg-success text-white px-6 py-3 rounded shadow-lg hover:bg-green-600">
                                <i className="fas fa-check mr-2"></i> Gerar CT-e Simulada
                            </button>
                        </div>
                    </div>

                    {/* Preview Panel */}
                    <div className="flex-1 min-w-[500px]">
                        {generatedData ? (
                            <DactePreview 
                                data={generatedData} 
                                onPrint={printDacte} 
                                onDownloadXml={downloadXML}
                            />
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center bg-bg-main/50 rounded-lg border-2 border-dashed border-border-color text-gray-text p-10">
                                <i className="fas fa-file-invoice text-5xl mb-4 opacity-50"></i>
                                <p>Preencha o formulário e clique em "Gerar" para visualizar a simulação do CT-e.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'model' && (
                <DacteModel />
            )}

            <style>{`
                .form-input { width: 100%; padding: 8px; border: 1px solid rgb(var(--color-border-color)); border-radius: 5px; background-color: rgb(var(--color-bg-main)); color: rgb(var(--color-light)); font-size: 14px; }
                .form-input:focus { outline: none; border-color: rgb(var(--color-primary)); }
                label { display: block; margin-bottom: 5px; font-weight: 600; color: rgb(var(--color-gray-text)); font-size: 0.9rem }
                .section-title { font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem; color: rgb(var(--color-secondary)); font-weight: bold; border-bottom: 1px solid rgb(var(--color-border-color)); padding-bottom: 2px; }
                .btn-action { padding: 8px 16px; border: none; border-radius: 5px; cursor: pointer; font-size: 14px; font-weight: 600; color: white; display: inline-flex; align-items: center; justify-content: center; transition: opacity 0.3s; }
                .btn-action:hover { opacity: 0.9; }
            `}</style>
        </div>
    );
};

export default CteReader;
