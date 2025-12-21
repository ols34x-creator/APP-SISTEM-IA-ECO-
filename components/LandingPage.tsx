

import React from 'react';
import { useLanguage } from '../hooks/useLanguage';

interface LandingPageProps {
  onEnter: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  const { t } = useLanguage();
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-bg-main flex items-center justify-center">
        {/* Background Gradient */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-bg-main via-bg-card to-bg-main"></div>
        
        {/* Animated Abstract Shapes */}
        <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full mix-blend-screen filter blur-3xl animate-blob"></div>
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-secondary/30 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-1/3 w-96 h-96 bg-purple-500/30 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 text-center p-8 max-w-3xl w-full flex flex-col items-center">
            {/* Logo / Icon Area */}
            <div className="mb-8 animate-fade-in-up">
                <div className="w-24 h-24 bg-gradient-to-br from-bg-card to-bg-main border border-border-color rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/20 transform rotate-6 hover:rotate-0 transition-all duration-700 ease-out group cursor-default">
                    <i className="fas fa-brain text-5xl text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.8)] group-hover:scale-110 transition-transform duration-500"></i>
                </div>
            </div>

            {/* Text Content */}
            <div className="space-y-2 mb-10">
                <h2 className="text-secondary font-bold tracking-[0.3em] uppercase text-sm animate-fade-in-up animation-delay-100">
                    Sistema de Gestão Integrada
                </h2>
                <h1 className="text-6xl md:text-8xl font-black text-light tracking-tighter animate-fade-in-up animation-delay-200 drop-shadow-lg">
                    ECO. <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">IA</span>
                </h1>
                <div className="h-1 w-24 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full my-6 animate-width-expand"></div>
                <p className="text-gray-text text-lg md:text-xl max-w-lg mx-auto leading-relaxed animate-fade-in-up animation-delay-300">
                    Bem-vindo ao seu ambiente de controle. Eficiência, dados e inteligência em um só lugar.
                </p>
            </div>

            {/* Call to Action */}
            <div className="animate-fade-in-up animation-delay-500">
                <button 
                    onClick={onEnter}
                    className="group relative inline-flex items-center justify-center px-10 py-4 font-bold text-white transition-all duration-300 bg-primary rounded-full hover:bg-primary/90 hover:scale-105 hover:shadow-[0_0_30px_rgba(var(--color-primary-val),0.5)] focus:outline-none ring-offset-2 focus:ring-2 ring-primary ring-offset-bg-main"
                >
                    <span className="relative flex items-center gap-3 text-lg tracking-wide">
                        ENTRAR NO SISTEMA 
                        <i className="fas fa-arrow-right group-hover:translate-x-2 transition-transform duration-300"></i>
                    </span>
                </button>
            </div>
            
            {/* Footer info */}
            <div className="mt-20 text-gray-600 text-xs font-mono uppercase tracking-widest animate-fade-in-up animation-delay-700 opacity-60 hover:opacity-100 transition-opacity">
                ECO.LOG &bull; Tecnologias &bull; v3.0
            </div>
        </div>

        <style>{`
            @keyframes blob {
                0% { transform: translate(0px, 0px) scale(1); }
                33% { transform: translate(30px, -50px) scale(1.1); }
                66% { transform: translate(-20px, 20px) scale(0.9); }
                100% { transform: translate(0px, 0px) scale(1); }
            }
            .animate-blob {
                animation: blob 10s infinite cubic-bezier(0.4, 0, 0.2, 1);
            }
            .animation-delay-2000 { animation-delay: 2s; }
            .animation-delay-4000 { animation-delay: 4s; }
            
            .animate-fade-in-up {
                animation: fadeInUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                opacity: 0;
                transform: translateY(30px);
            }
            .animation-delay-100 { animation-delay: 0.1s; }
            .animation-delay-200 { animation-delay: 0.2s; }
            .animation-delay-300 { animation-delay: 0.3s; }
            .animation-delay-500 { animation-delay: 0.5s; }
            .animation-delay-700 { animation-delay: 0.7s; }
            
            .animate-width-expand {
                animation: widthExpand 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                width: 0;
            }

            @keyframes fadeInUp {
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            @keyframes widthExpand {
                to {
                    width: 6rem;
                }
            }
        `}</style>
    </div>
  );
};

export default LandingPage;
