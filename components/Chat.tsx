import React from 'react';

const Chat: React.FC = () => {
    return (
        <div className="bg-bg-card rounded-lg p-6 shadow-lg flex flex-col items-center justify-center text-center h-[70vh]">
            <i className="fas fa-comments-slash text-6xl text-danger mb-6"></i>
            <h2 className="text-3xl font-bold text-light mb-3">
                Chat Interno Desativado
            </h2>
            <p className="text-gray-text max-w-lg mb-8">
                A funcionalidade de chat em tempo real foi desativada devido a uma incompatibilidade de configuração com o backend.
            </p>
            <div className="bg-bg-main p-4 rounded-lg text-left text-sm">
                <p className="font-semibold text-warning">Detalhe Técnico:</p>
                <p className="text-gray-text mt-1">
                    O projeto Firebase associado está configurado no modo "Datastore Mode", que não suporta as operações em tempo real do Cloud Firestore SDK utilizado nesta aplicação.
                </p>
            </div>
        </div>
    );
};

export default Chat;
