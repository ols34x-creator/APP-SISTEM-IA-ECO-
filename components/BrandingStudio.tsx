
import React, { useState } from 'react';
import { generateEcoLogLogo } from '../services/geminiService';
import { useAppStore } from '../hooks/useAppStore';

const BrandingStudio: React.FC = () => {
    const { addNotification } = useAppStore();
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const url = await generateEcoLogLogo();
            setLogoUrl(url);
            addNotification({ message: 'Identidade Visual gerada com sucesso!', type: 'success' });
        } catch (error) {
            addNotification({ message: 'Erro ao gerar logo. Verifique sua chave de API.', type: 'danger' });
        } finally {
            setIsGenerating(false);
        }
    };

    const downloadLogo = () => {
        if (!logoUrl) return;
        const link = document.createElement('a');
        link.href = logoUrl;
        link.download = 'ecolog_official_branding.png';
        link.click();
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="bg-bg-card rounded-3xl p-10 shadow-2xl border border-border-color/50 overflow-hidden relative">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
                    <i className="fas fa-palette text-[200px] text-primary -rotate-12"></i>
                </div>

                <div className="relative z-10">
                    <div className="max-w-2xl">
                        <h2 className="text-4xl font-black text-light tracking-tighter mb-4 uppercase italic">
                            Estúdio de <span className="text-primary">Branding</span>
                        </h2>
                        <p className="text-gray-text text-lg leading-relaxed mb-8">
                            Utilize o poder do <span className="text-secondary font-bold">Gemini 2.5 Flash Image</span> para materializar a visão da EcoLog. 
                            Nossa identidade funde a <span className="text-success font-bold">sustentabilidade</span> orgânica com o <span className="text-primary font-bold">intelecto digital</span> da logística moderna.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <div className="bg-bg-main p-6 rounded-2xl border border-border-color/50 space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-widest text-primary">Conceitos Integrados</h3>
                                <ul className="space-y-3">
                                    <li className="flex items-center gap-3 text-sm text-gray-300">
                                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] text-primary"><i className="fas fa-brain"></i></div>
                                        Cérebro: Inteligência Centralizada e Tomada de Decisão
                                    </li>
                                    <li className="flex items-center gap-3 text-sm text-gray-300">
                                        <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center text-[10px] text-secondary"><i className="fas fa-project-diagram"></i></div>
                                        Circuitos: Conectividade e Redes Logísticas Globais
                                    </li>
                                    <li className="flex items-center gap-3 text-sm text-gray-300">
                                        <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center text-[10px] text-success"><i className="fas fa-leaf"></i></div>
                                        Folha: Compromisso com a Logística Verde e ESG
                                    </li>
                                </ul>
                            </div>

                            <button 
                                onClick={handleGenerate}
                                disabled={isGenerating}
                                className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl transition-all flex items-center justify-center gap-3
                                    ${isGenerating 
                                        ? 'bg-bg-main text-gray-600 cursor-not-allowed' 
                                        : 'bg-gradient-to-r from-primary to-secondary text-white hover:scale-[1.02] hover:shadow-primary/30 active:scale-95'}`}
                            >
                                {isGenerating ? (
                                    <>
                                        <i className="fas fa-circle-notch fa-spin"></i> Materializando Visão...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-magic"></i> Gerar Identidade Oficial
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="flex flex-col items-center justify-center">
                            <div className={`w-80 h-80 rounded-[40px] bg-bg-main border-2 border-dashed flex items-center justify-center overflow-hidden transition-all duration-700 shadow-2xl relative group
                                ${logoUrl ? 'border-primary/50' : 'border-border-color'}`}>
                                
                                {logoUrl ? (
                                    <>
                                        <img src={logoUrl} alt="EcoLog Official Logo" className="w-full h-full object-cover animate-fade-in" />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                            <button onClick={downloadLogo} className="bg-white text-bg-main p-3 rounded-full hover:scale-110 transition-transform shadow-lg"><i className="fas fa-download"></i></button>
                                            <button onClick={handleGenerate} className="bg-primary text-white p-3 rounded-full hover:scale-110 transition-transform shadow-lg"><i className="fas fa-sync-alt"></i></button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center p-8 space-y-4">
                                        <div className="w-20 h-20 bg-bg-card rounded-3xl mx-auto flex items-center justify-center text-3xl text-gray-700">
                                            <i className="fas fa-image"></i>
                                        </div>
                                        <p className="text-xs font-bold text-gray-600 uppercase tracking-widest leading-relaxed">
                                            Aguardando processamento do núcleo cerebral...
                                        </p>
                                    </div>
                                )}

                                {isGenerating && (
                                    <div className="absolute inset-0 bg-bg-main/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-20">
                                        <div className="flex gap-2">
                                            <div className="w-3 h-3 bg-primary rounded-full animate-bounce delay-75"></div>
                                            <div className="w-3 h-3 bg-secondary rounded-full animate-bounce delay-150"></div>
                                            <div className="w-3 h-3 bg-success rounded-full animate-bounce delay-300"></div>
                                        </div>
                                        <span className="text-[10px] font-black text-light uppercase tracking-[0.3em]">IA Processando...</span>
                                    </div>
                                )}
                            </div>
                            
                            {logoUrl && (
                                <p className="mt-6 text-[10px] text-gray-500 font-bold uppercase tracking-widest animate-fade-in">
                                    Identidade Gerada via <span className="text-primary">Gemini Vision Core</span>
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Showcase Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-bg-card p-6 rounded-2xl border border-border-color/30">
                    <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Simulação Papelaria</h4>
                    <div className="aspect-[4/3] bg-bg-main rounded-xl border border-border-color/20 flex flex-col p-4">
                        <div className="w-12 h-1 border-b border-primary/30 mb-2"></div>
                        <div className="flex gap-2 items-center mb-6">
                            <div className="w-4 h-4 rounded bg-gray-700 overflow-hidden">{logoUrl && <img src={logoUrl} className="w-full h-full opacity-50 grayscale" />}</div>
                            <div className="w-16 h-1 bg-gray-800 rounded"></div>
                        </div>
                        <div className="space-y-2">
                            <div className="w-full h-1 bg-gray-800/40 rounded"></div>
                            <div className="w-full h-1 bg-gray-800/40 rounded"></div>
                            <div className="w-2/3 h-1 bg-gray-800/40 rounded"></div>
                        </div>
                    </div>
                </div>
                <div className="bg-bg-card p-6 rounded-2xl border border-border-color/30">
                    <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Uniformes & Frota</h4>
                    <div className="aspect-[4/3] bg-bg-main rounded-xl border border-border-color/20 flex items-center justify-center">
                        <div className="relative">
                            <i className="fas fa-truck-moving text-4xl text-gray-800"></i>
                            <div className="absolute top-1 left-2 w-4 h-4 rounded-full overflow-hidden border border-white/10">
                                {logoUrl && <img src={logoUrl} className="w-full h-full" />}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-bg-card p-6 rounded-2xl border border-border-color/30">
                    <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Paleta Oficial</h4>
                    <div className="grid grid-cols-3 gap-2">
                        <div className="h-16 rounded-lg bg-[#14b8a6] flex items-end p-2 text-[8px] font-black text-white">#14B8A6</div>
                        <div className="h-16 rounded-lg bg-[#3b82f6] flex items-end p-2 text-[8px] font-black text-white">#3B82F6</div>
                        <div className="h-16 rounded-lg bg-[#0F172A] flex items-end p-2 text-[8px] font-black text-white border border-white/10">#0F172A</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BrandingStudio;
