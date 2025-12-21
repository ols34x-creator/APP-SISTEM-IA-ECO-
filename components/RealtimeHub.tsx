import React from 'react';

const RealtimeHub: React.FC = () => {
    return (
        <div className="bg-bg-card rounded-lg p-6 shadow-lg flex flex-col items-center justify-center text-center h-[70vh]">
            <i className="fas fa-plug text-6xl text-danger mb-6"></i>
            <h2 className="text-3xl font-bold text-light mb-3">
                Realtime Hub Desativado
            </h2>
            <p className="text-gray-text max-w-lg mb-8">
                Esta funcionalidade, que depende de uma conexão em tempo real com o banco de dados, foi desativada.
            </p>
            <div className="bg-bg-main p-4 rounded-lg text-left text-sm">
                <p className="font-semibold text-warning">Detalhe Técnico:</p>
                <p className="text-gray-text mt-1">
                    O projeto Firebase associado está configurado no modo "Datastore Mode", que é incompatível com as bibliotecas do "Cloud Firestore in Native Mode" utilizadas aqui. Para reativar, é necessário um projeto Firebase configurado no modo "Native Mode".
                </p>
            </div>
        </div>
    );
};

export default RealtimeHub;
