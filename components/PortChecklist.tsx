
import React, { useState, useRef, useEffect } from 'react';
import { fileToBase64, base64ToSrc, validateFileFormat, ALLOWED_EXTENSIONS } from '../services/fileService';

// --- Types ---
interface AttachmentState {
    [key: string]: string | null; // Stores base64 string
}

interface ActiveSlot {
    id: string;
    label: string;
    type: 'photo' | 'document';
}

const CaptureModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (base64: string) => void;
    slotLabel: string;
}> = ({ isOpen, onClose, onSave, slotLabel }) => {
    const [mode, setMode] = useState<'select' | 'camera'>('select');
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) setMode('select');
        return () => stopCamera();
    }, [isOpen]);

    const startCamera = async () => {
        try {
            setMode('camera');
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } 
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            alert("Não foi possível acessar a câmera. Verifique as permissões.");
            setMode('select');
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    };

    const captureImage = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            if (context) {
                canvasRef.current.width = videoRef.current.videoWidth;
                canvasRef.current.height = videoRef.current.videoHeight;
                context.drawImage(videoRef.current, 0, 0);
                const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.8);
                const base64 = dataUrl.split(',')[1]; 
                onSave(base64);
                stopCamera();
                onClose();
            }
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (!validateFileFormat(file)) {
                alert(`O arquivo "${file.name}" não é permitido. Formatos aceitos: ${ALLOWED_EXTENSIONS.join(', ')}`);
                return;
            }
            try {
                const base64 = await fileToBase64(file);
                onSave(base64);
                onClose();
            } catch (err) {
                alert("Erro ao ler arquivo.");
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[2000]" onClick={onClose}>
            <div className="bg-bg-card p-6 rounded-lg shadow-2xl w-full max-w-md border border-border-color" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-light">Anexar: {slotLabel}</h3>
                    <button onClick={() => { stopCamera(); onClose(); }} className="text-gray-400 hover:text-white">
                        <i className="fas fa-times text-xl"></i>
                    </button>
                </div>

                {mode === 'select' ? (
                    <div className="grid grid-cols-2 gap-4">
                        <button 
                            onClick={startCamera}
                            className="flex flex-col items-center justify-center p-6 bg-bg-main border-2 border-border-color hover:border-primary hover:bg-primary/10 rounded-lg transition-all group"
                        >
                            <i className="fas fa-camera text-4xl text-secondary mb-3 group-hover:scale-110 transition-transform"></i>
                            <span className="font-semibold text-light">Usar Câmera</span>
                        </button>
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="flex flex-col items-center justify-center p-6 bg-bg-main border-2 border-border-color hover:border-primary hover:bg-primary/10 rounded-lg transition-all group"
                        >
                            <i className="fas fa-folder-open text-4xl text-warning mb-3 group-hover:scale-110 transition-transform"></i>
                            <span className="font-semibold text-light">Escolher Arquivo</span>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" 
                                onChange={handleFileUpload} 
                            />
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden mb-4">
                            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
                            <canvas ref={canvasRef} className="hidden"></canvas>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => { stopCamera(); setMode('select'); }} className="px-4 py-2 bg-gray-600 text-white rounded-md">
                                Voltar
                            </button>
                            <button onClick={captureImage} className="px-6 py-2 bg-red-600 text-white font-bold rounded-full shadow-lg hover:bg-red-700 hover:scale-105 transition-all">
                                <i className="fas fa-camera mr-2"></i> Capturar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Main Component ---
const PortChecklist: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'container' | 'caminhao'>('container');
    const [attachments, setAttachments] = useState<AttachmentState>({});
    const [operatorName, setOperatorName] = useState('');
    
    // Modal State
    const [activeSlot, setActiveSlot] = useState<ActiveSlot | null>(null);

    const handleSlotClick = (id: string, label: string, type: 'photo' | 'document') => {
        setActiveSlot({ id, label, type });
    };

    const handleSaveMedia = (base64: string) => {
        if (activeSlot) {
            setAttachments(prev => ({ ...prev, [activeSlot.id]: base64 }));
            setActiveSlot(null);
        }
    };

    const finalizeInspection = () => {
        if (!operatorName.trim()) {
            alert("Campo Obrigatório: Por favor, preencha o nome do Operador antes de finalizar.");
            return;
        }

        // Verify required checklist items (basic logic)
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        let allChecked = true;
        checkboxes.forEach((cb: any) => { if (!cb.checked) allChecked = false; });

        if (allChecked) {
             alert(`Inspeção finalizada com sucesso por ${operatorName}! Dados salvos.`);
        } else {
             if (confirm('Alguns itens não foram marcados. Deseja finalizar mesmo assim?')) {
                 alert(`Inspeção finalizada com pendências por ${operatorName}.`);
             }
        }
    };

    const ChecklistItem: React.FC<{ id: string; label: string; defaultChecked?: boolean }> = ({ id, label, defaultChecked }) => (
        <div className="flex items-center p-4 border-b border-border-color transition-colors hover:bg-border-color/50">
            <input type="checkbox" id={id} defaultChecked={defaultChecked} className="mr-4 w-5 h-5 accent-primary cursor-pointer" />
            <label htmlFor={id} className="flex-grow text-light cursor-pointer select-none">{label}</label>
        </div>
    );

    const PhotoSlot: React.FC<{ id: string; label: string }> = ({ id, label }) => {
        const imageSrc = attachments[id] ? base64ToSrc(attachments[id]!, 'image/jpeg') : null;

        return (
            <div 
                onClick={() => handleSlotClick(id, label, 'photo')}
                className={`w-full h-36 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden group
                    ${imageSrc ? 'border-primary bg-bg-main' : 'border-border-color bg-bg-main hover:border-secondary hover:bg-secondary/10'}`}
            >
                {imageSrc ? (
                    <>
                        <img src={imageSrc} alt={label} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white">
                            <i className="fas fa-sync text-2xl mb-1"></i>
                            <span className="text-xs font-bold">Alterar</span>
                        </div>
                    </>
                ) : (
                    <>
                        <i className="fas fa-camera text-3xl text-gray-500 mb-2 group-hover:text-secondary transition-colors"></i>
                        <span className="text-sm text-gray-400 group-hover:text-light transition-colors">{label}</span>
                    </>
                )}
            </div>
        );
    };

    const DocSlot: React.FC<{ id: string; label: string; icon: string }> = ({ id, label, icon }) => {
        const hasDoc = !!attachments[id];
        return (
            <div 
                onClick={() => handleSlotClick(id, label, 'document')}
                className={`p-5 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all transform hover:-translate-y-1 hover:shadow-lg border
                    ${hasDoc ? 'bg-green-500/10 border-green-500' : 'bg-bg-main border-border-color hover:border-secondary'}`}
            >
                {hasDoc ? (
                    <>
                        <div className="relative">
                            <i className={`fas ${icon} text-3xl text-green-500 mb-3`}></i>
                            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] px-1 rounded-full"><i className="fas fa-check"></i></span>
                        </div>
                        <span className="text-sm font-semibold text-center text-green-400">{label} (Anexado)</span>
                    </>
                ) : (
                    <>
                        <i className={`fas ${icon} text-3xl text-primary mb-3`}></i>
                        <span className="text-sm font-semibold text-center text-light">{label}</span>
                    </>
                )}
            </div>
        );
    };

    const ChecklistContent = () => (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <section>
                    <h3 className="section-title"><i className="fas fa-clipboard-check"></i>INSPEÇÃO DO CONTAINER</h3>
                    <ChecklistItem id="c1" label="Verificação de danos estruturais (externo)" />
                    <ChecklistItem id="c2" label="Verificação de limpeza interna" />
                    <ChecklistItem id="c3" label="Verificação de vazamentos e umidade" />
                    <ChecklistItem id="c4" label="Conferência de numeração e selos" defaultChecked />
                </section>
                <section>
                    <h3 className="section-title"><i className="fas fa-pallet"></i>INSPEÇÃO DA MERCADORIA</h3>
                    <ChecklistItem id="m1" label="Conferência de quantidade e descrição" defaultChecked />
                    <ChecklistItem id="m2" label="Verificação de avarias na embalagem" />
                    <ChecklistItem id="m3" label="Conferência de peso e cubagem" />
                    <ChecklistItem id="m4" label="Verificação de estufagem/armazenamento" defaultChecked />
                </section>
            </div>
            <section className="mt-8">
                <h3 className="section-title"><i className="fas fa-camera"></i>FOTOS (Até 10)</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                    {Array.from({ length: 10 }).map((_, i) => <PhotoSlot key={`cont_ph_${i}`} id={`cont_ph_${i}`} label={`Foto ${i + 1}`} />)}
                </div>
            </section>
        </>
    );

    const TruckChecklistContent = () => (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <section>
                    <h3 className="section-title"><i className="fas fa-tools"></i>INSPEÇÃO MECÂNICA</h3>
                    <ChecklistItem id="t1" label="Verificação de pneus (pressão e desgaste)" />
                    <ChecklistItem id="t2" label="Verificação de freios" defaultChecked />
                    <ChecklistItem id="t3" label="Verificação de sistema elétrico" />
                </section>
                <section>
                    <h3 className="section-title"><i className="fas fa-shield-alt"></i>INSPEÇÃO DE SEGURANÇA</h3>
                    <ChecklistItem id="s1" label="Verificação de extintor de incêndio" />
                    <ChecklistItem id="s2" label="Kit de emergência" defaultChecked />
                    <ChecklistItem id="s3" label="Documentação do veículo" defaultChecked />
                </section>
            </div>
             <section className="mt-8">
                <h3 className="section-title"><i className="fas fa-camera"></i>FOTOS DO CAMINHÃO (Até 10)</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                    {Array.from({ length: 10 }).map((_, i) => <PhotoSlot key={`truck_ph_${i}`} id={`truck_ph_${i}`} label={`Foto ${i + 1}`} />)}
                </div>
            </section>
        </>
    );

    return (
        <div className="text-light pb-10">
             <style>{`.section-title { font-size: 1.25rem; margin-bottom: 1rem; padding: 0.5rem 0; border-bottom: 2px solid rgb(var(--color-border-color)); color: rgb(var(--color-secondary)); display: flex; align-items: center; gap: 0.5rem; font-weight: bold; }`}</style>
            
            <CaptureModal 
                isOpen={!!activeSlot}
                onClose={() => setActiveSlot(null)}
                onSave={handleSaveMedia}
                slotLabel={activeSlot?.label || ''}
            />

            <header className="bg-bg-card p-5 mb-6 rounded-lg shadow-lg flex flex-col md:flex-row justify-between items-center border-l-4 border-primary gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                        <i className="fas fa-clipboard-check text-2xl text-primary"></i>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Checklist Operacional</h1>
                        <p className="text-sm text-gray-text">Controle de qualidade e segurança portuária</p>
                    </div>
                </div>
                <div className="bg-bg-main p-3 rounded-lg text-sm border border-border-color flex items-center gap-2 w-full md:w-auto">
                    <i className="fas fa-user-circle text-secondary text-lg"></i>
                    <div className="flex flex-col w-full">
                        <span className="text-xs text-gray-500 uppercase font-bold">Operador Responsável <span className="text-red-500">*</span></span>
                        <input 
                            type="text" 
                            value={operatorName} 
                            onChange={(e) => setOperatorName(e.target.value)} 
                            placeholder="Digite seu nome..." 
                            className="bg-transparent border-none outline-none text-light font-bold w-full placeholder-gray-600"
                        />
                    </div>
                </div>
            </header>
            
            <div className="flex mb-6 bg-bg-main p-1 rounded-lg border border-border-color">
                <button onClick={() => setActiveTab('container')} className={`tab-btn ${activeTab === 'container' ? 'active' : ''}`}><i className="fas fa-box"></i> CONTAINER / MERCADORIA</button>
                <button onClick={() => setActiveTab('caminhao')} className={`tab-btn ${activeTab === 'caminhao' ? 'active' : ''}`}><i className="fas fa-truck"></i> VEÍCULO / CAMINHÃO</button>
            </div>

            <div className="bg-bg-card p-6 rounded-lg shadow-lg border border-border-color">
                {activeTab === 'container' ? <ChecklistContent /> : <TruckChecklistContent />}
                
                 <section className="mt-8">
                    <h3 className="section-title"><i className="fas fa-file-alt"></i>ANEXOS DE DOCUMENTOS</h3>
                     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5 mt-4">
                        <DocSlot id="doc_nf" label="NOTA FISCAL (NF)" icon="fa-file-invoice" />
                        <DocSlot id="doc_port" label="NOTAS PORTUÁRIAS" icon="fa-file-contract" />
                        <DocSlot id="doc_cd" label="CONHECIMENTO (CD)" icon="fa-file-export" />
                        <DocSlot id="doc_di" label="DECLARAÇÃO (DI)" icon="fa-file-import" />
                        <DocSlot id="doc_cti" label="CERTIFICADO (CTI)" icon="fa-file-signature" />
                        <DocSlot id="doc_outros" label="OUTROS" icon="fa-folder-open" />
                    </div>
                </section>
                
                <div className="mt-8 pt-6 border-t border-border-color flex flex-wrap gap-4 justify-end">
                    <button className="btn bg-bg-main border border-border-color text-gray-text hover:text-white hover:border-gray-400"><i className="fas fa-save"></i> SALVAR RASCUNHO</button>
                    <button className="btn bg-secondary hover:bg-opacity-90"><i className="fas fa-print"></i> IMPRIMIR</button>
                    <button className="btn bg-green-600 hover:bg-green-700 shadow-lg" onClick={finalizeInspection}><i className="fas fa-check-circle"></i> FINALIZAR INSPEÇÃO</button>
                </div>
            </div>
             <style>{`
                .tab-btn { flex: 1; padding: 1rem; border-radius: 0.5rem; font-weight: 700; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 0.8rem; background-color: transparent; color: rgb(var(--color-gray-text)); }
                .tab-btn.active { background-color: rgb(var(--color-bg-card)); color: rgb(var(--color-primary)); box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
                .tab-btn:not(.active):hover { color: rgb(var(--color-light)); }
                .btn { padding: 0.8rem 1.5rem; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 700; transition: all 0.2s; display: flex; align-items: center; gap: 0.5rem; color: white; font-size: 0.9rem; }
            `}</style>
        </div>
    );
};

export default PortChecklist;
