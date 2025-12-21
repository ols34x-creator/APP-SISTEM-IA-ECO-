
import React from 'react';

const EcoWhatsApp: React.FC = () => {
    return (
        <div className="bg-bg-card rounded-lg p-6 shadow-lg flex flex-col items-center justify-center text-center h-[70vh]">
            
            <i className="fab fa-whatsapp text-8xl text-green-500 mb-6"></i>
            
            <h2 className="text-3xl font-bold text-light mb-3">
                Integração com WhatsApp Web
            </h2>
            
            <p className="text-gray-text max-w-lg mb-8">
                Acesse suas conversas do WhatsApp diretamente do seu navegador para uma comunicação mais ágil. Sua sessão permanecerá ativa após o primeiro login.
            </p>

            <a
                href="https://web.whatsapp.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-primary text-white font-bold rounded-lg hover:bg-opacity-90 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-3 text-lg"
            >
                <i className="fas fa-external-link-alt"></i>
                Abrir WhatsApp Web em Nova Aba
            </a>

            <div className="mt-10 pt-6 border-t border-border-color w-full max-w-2xl">
                <h3 className="text-lg font-semibold text-light mb-4">
                    <i className="fas fa-bell mr-2 text-secondary"></i>
                    Receba Notificações em Tempo Real
                </h3>
                <p className="text-sm text-gray-text">
                    Para ser notificado sobre novas mensagens, ative as <span className="font-semibold text-light">notificações de área de trabalho</span> quando o WhatsApp Web solicitar. Isso garantirá que você não perca nenhuma mensagem importante.
                </p>
            </div>

        </div>
    );
};

export default EcoWhatsApp;
