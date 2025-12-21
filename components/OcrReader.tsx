
import React, { useState, useRef } from 'react';
import { analyzeDocument } from '../services/geminiService';
import { fileToBase64, base64ToSrc } from '../services/fileService';

interface OcrResult {
    fullText: string;
    documentType: string;
    keyFields: Record<string, string>;
}

const OcrReader: React.FC = () => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [textContent, setTextContent] = useState<string | null>(null);
    const [fileType, setFileType] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<OcrResult | null>(null);
    const [activeTab, setActiveTab] = useState<'fields' | 'text'>('fields');
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // New field state
    const [newFieldKey, setNewFieldKey] = useState('');
    const [newFieldValue, setNewFieldValue] = useState('');

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setFileType(file.type);
            setResult(null);
            setPreviewUrl(null);
            setTextContent(null);

            // Handle Text-based files for preview
            if (file.type === 'text/plain' || file.type === 'text/xml' || file.type === 'text/html' || file.name.endsWith('.xml') || file.name.endsWith('.txt') || file.name.endsWith('.html')) {
                 const text = await file.text();
                 setTextContent(text);
            } 
            // Handle Images
            else if (file.type.startsWith('image/')) {
                const base64 = await fileToBase64(file);
                setPreviewUrl(base64ToSrc(base64, file.type));
            }
            // PDF does not get a preview URL (shows icon)
        }
    };

    const handleProcess = async () => {
        if (!imageFile) return;

        setIsLoading(true);
        try {
            const base64 = await fileToBase64(imageFile);
            // Determine mime type to send to Gemini (sometimes browser detects .xml as empty string or text/xml)
            let mimeToSend = imageFile.type;
            if (!mimeToSend || mimeToSend === '') {
                if (imageFile.name.endsWith('.xml')) mimeToSend = 'text/xml';
                if (imageFile.name.endsWith('.txt')) mimeToSend = 'text/plain';
                if (imageFile.name.endsWith('.html')) mimeToSend = 'text/html';
            }
            
            const data = await analyzeDocument(base64, mimeToSend);
            setResult(data);
        } catch (error: any) {
            console.error("OCR Error:", error);
            alert(`Erro ao processar: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setImageFile(null);
        setPreviewUrl(null);
        setTextContent(null);
        setResult(null);
        setFileType('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert("Texto copiado!");
    };

    const handleFieldChange = (key: string, value: string) => {
        if (result) {
            setResult({
                ...result,
                keyFields: {
                    ...result.keyFields,
                    [key]: value
                }
            });
        }
    };

    const handleDeleteField = (keyToDelete: string) => {
        if (result) {
            const newFields = { ...result.keyFields };
            delete newFields[keyToDelete];
            setResult({ ...result, keyFields: newFields });
        }
    };

    const handleAddField = () => {
        if (result && newFieldKey.trim()) {
            setResult({
                ...result,
                keyFields: {
                    ...result.keyFields,
                    [newFieldKey]: newFieldValue
                }
            });
            setNewFieldKey('');
            setNewFieldValue('');
        }
    };

    const handlePrint = () => {
        if (!result) return;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            const fieldsHtml = Object.entries(result.keyFields)
                .map(([key, value]) => `
                    <div class="field-row">
                        <span class="label">${key}:</span>
                        <span class="value">${value}</span>
                    </div>
                `).join('');

            printWindow.document.write(`
                <html>
                    <head>
                        <title>Relatório de Extração OCR</title>
                        <style>
                            body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
                            h1 { color: #1a3a8f; border-bottom: 2px solid #1a3a8f; padding-bottom: 10px; }
                            .meta { font-size: 0.9em; color: #666; margin-bottom: 30px; }
                            .field-row { display: flex; border-bottom: 1px solid #eee; padding: 10px 0; }
                            .label { font-weight: bold; width: 200px; color: #555; }
                            .value { flex: 1; }
                            .footer { margin-top: 50px; font-size: 0.8em; text-align: center; color: #999; }
                        </style>
                    </head>
                    <body>
                        <h1>Dados Extraídos - ${result.documentType}</h1>
                        <div class="meta">
                            <p><strong>Arquivo Original:</strong> ${imageFile?.name}</p>
                            <p><strong>Data de Extração:</strong> ${new Date().toLocaleString()}</p>
                        </div>
                        <div class="content">
                            ${fieldsHtml}
                        </div>
                        <div class="footer">
                            Gerado por EcoLog OCR Inteligente
                        </div>
                        <script>
                            window.onload = function() { window.print(); }
                        </script>
                    </body>
                </html>
            `);
            printWindow.document.close();
        }
    };

    return (
        <div className="bg-bg-card rounded-lg p-6 shadow-lg min-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-6 border-b border-border-color pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/20 rounded-lg">
                        <i className="fas fa-eye text-2xl text-primary"></i>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-light">Leitor OCR Inteligente</h2>
                        <p className="text-gray-text text-sm">Suporte a PDF, IMG, TXT, XML, HTML com entrada manual.</p>
                    </div>
                </div>
                {imageFile && (
                    <div className="flex gap-2">
                        <button onClick={handleClear} className="px-4 py-2 bg-border-color hover:bg-red-500/20 text-light hover:text-red-400 rounded-md transition-all text-sm font-semibold flex items-center gap-2">
                            <i className="fas fa-trash"></i> Limpar
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-grow">
                {/* Left Column: Upload & Preview */}
                <div className="flex flex-col gap-4">
                    {!imageFile ? (
                        <div 
                            className="flex-grow border-2 border-dashed border-border-color hover:border-primary/50 bg-bg-main/30 rounded-xl flex flex-col items-center justify-center p-10 cursor-pointer transition-all group min-h-[400px]"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="w-20 h-20 bg-bg-card rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                                <i className="fas fa-cloud-upload-alt text-4xl text-gray-400 group-hover:text-primary transition-colors"></i>
                            </div>
                            <h3 className="text-lg font-bold text-light mb-2">Clique para fazer upload</h3>
                            <p className="text-sm text-gray-text text-center max-w-xs">
                                Suporta: <strong>Imagens, PDF, TXT, XML, HTML</strong>.
                            </p>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleFileSelect} 
                                className="hidden" 
                                accept="image/*,application/pdf,text/plain,text/html,text/xml,application/xml" 
                            />
                        </div>
                    ) : (
                        <div className="relative rounded-xl overflow-hidden border border-border-color bg-black flex items-center justify-center h-full min-h-[400px]">
                            {previewUrl ? (
                                <img src={previewUrl} alt="Documento" className="max-w-full max-h-[600px] object-contain" />
                            ) : textContent ? (
                                <div className="w-full h-full p-4 bg-gray-900 overflow-auto max-h-[600px]">
                                    <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">{textContent}</pre>
                                </div>
                            ) : (
                                <div className="text-center p-10">
                                    <i className="fas fa-file-pdf text-6xl text-red-500 mb-4"></i>
                                    <p className="text-light font-semibold text-lg">{imageFile.name}</p>
                                    <p className="text-gray-400 text-sm">Arquivo pronto para análise</p>
                                </div>
                            )}
                            
                            {!result && !isLoading && (
                                <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                                    <button 
                                        onClick={handleProcess}
                                        className="px-8 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-full shadow-lg hover:shadow-primary/50 transition-all transform hover:-translate-y-1 flex items-center gap-2"
                                    >
                                        <i className="fas fa-magic"></i> Extrair Dados
                                    </button>
                                </div>
                            )}
                            {isLoading && (
                                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-sm">
                                    <i className="fas fa-circle-notch fa-spin text-5xl text-primary mb-4"></i>
                                    <p className="text-light font-semibold animate-pulse">Analisando documento...</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Column: Results */}
                <div className="flex flex-col bg-bg-main rounded-xl border border-border-color overflow-hidden">
                    <div className="flex border-b border-border-color">
                        <button 
                            className={`flex-1 py-4 text-sm font-bold text-center transition-colors ${activeTab === 'fields' ? 'bg-bg-card text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-light hover:bg-bg-card/50'}`}
                            onClick={() => setActiveTab('fields')}
                        >
                            <i className="fas fa-list-ul mr-2"></i> Dados Estruturados
                        </button>
                        <button 
                            className={`flex-1 py-4 text-sm font-bold text-center transition-colors ${activeTab === 'text' ? 'bg-bg-card text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-light hover:bg-bg-card/50'}`}
                            onClick={() => setActiveTab('text')}
                        >
                            <i className="fas fa-align-left mr-2"></i> Texto Bruto
                        </button>
                    </div>

                    <div className="p-6 flex-grow overflow-y-auto max-h-[600px] custom-scrollbar">
                        {!result ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
                                <i className="fas fa-file-invoice text-6xl mb-4"></i>
                                <p>O resultado da análise aparecerá aqui.</p>
                            </div>
                        ) : (
                            <div className="animate-fade-in h-full flex flex-col">
                                {activeTab === 'fields' ? (
                                    <div className="space-y-4 flex-grow">
                                        <div className="flex justify-between items-center">
                                            <div className="bg-secondary/10 border border-secondary/30 rounded-lg p-2 px-4">
                                                <span className="text-xs font-bold text-secondary uppercase tracking-wider mr-2">Tipo:</span>
                                                <span className="text-sm font-bold text-light">{result.documentType || 'Desconhecido'}</span>
                                            </div>
                                            <button onClick={handlePrint} className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700 flex items-center gap-2">
                                                <i className="fas fa-print"></i> Imprimir
                                            </button>
                                        </div>
                                        
                                        <div className="grid gap-3">
                                            {Object.entries(result.keyFields || {}).map(([key, value]) => (
                                                <div key={key} className="bg-bg-card p-3 rounded border border-border-color flex flex-col group">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-xs text-gray-400 uppercase font-semibold">{key}</span>
                                                        <button onClick={() => handleDeleteField(key)} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity text-xs hover:bg-red-500/10 p-1 rounded">
                                                            <i className="fas fa-trash"></i>
                                                        </button>
                                                    </div>
                                                    <div className="flex justify-between items-center gap-2">
                                                        <input 
                                                            type="text"
                                                            value={value}
                                                            onChange={(e) => handleFieldChange(key, e.target.value)}
                                                            className="bg-transparent border-b border-transparent hover:border-border-color focus:border-primary focus:outline-none text-light font-medium w-full"
                                                        />
                                                        <button onClick={() => copyToClipboard(String(value))} className="text-gray-500 hover:text-primary transition-colors" title="Copiar">
                                                            <i className="far fa-copy"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                            {Object.keys(result.keyFields || {}).length === 0 && (
                                                <p className="text-center text-gray-500 italic py-4">Nenhum campo específico identificado automaticamente.</p>
                                            )}
                                            
                                            {/* Add New Field Section */}
                                            <div className="bg-bg-card/50 p-3 rounded border border-dashed border-border-color mt-2">
                                                <p className="text-xs text-gray-400 mb-2 font-bold">Adicionar Campo Manual</p>
                                                <div className="flex gap-2">
                                                    <input 
                                                        type="text" 
                                                        placeholder="Nome do Campo" 
                                                        value={newFieldKey}
                                                        onChange={e => setNewFieldKey(e.target.value)}
                                                        className="bg-bg-main border border-border-color rounded px-2 py-1 text-xs text-light flex-1 focus:outline-none focus:border-primary"
                                                    />
                                                    <input 
                                                        type="text" 
                                                        placeholder="Valor" 
                                                        value={newFieldValue}
                                                        onChange={e => setNewFieldValue(e.target.value)}
                                                        className="bg-bg-main border border-border-color rounded px-2 py-1 text-xs text-light flex-1 focus:outline-none focus:border-primary"
                                                    />
                                                    <button 
                                                        onClick={handleAddField}
                                                        disabled={!newFieldKey.trim()}
                                                        className="bg-primary text-white px-3 py-1 rounded text-xs font-bold hover:bg-primary/80 disabled:opacity-50"
                                                    >
                                                        <i className="fas fa-plus"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative group h-full">
                                        <textarea 
                                            readOnly 
                                            value={result.fullText} 
                                            className="w-full h-full bg-bg-card p-4 rounded-lg border border-border-color text-sm text-gray-300 font-mono resize-none focus:outline-none custom-scrollbar"
                                        ></textarea>
                                        <button 
                                            onClick={() => copyToClipboard(result.fullText)}
                                            className="absolute top-4 right-4 bg-bg-main p-2 rounded hover:bg-primary hover:text-white transition-colors shadow-md border border-border-color"
                                            title="Copiar tudo"
                                        >
                                            <i className="far fa-copy"></i>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OcrReader;
