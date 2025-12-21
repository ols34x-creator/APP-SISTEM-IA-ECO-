import React, { useState } from 'react';
import CollaboratorRegistration from './CollaboratorRegistration';
import FleetControl from './FleetControl';
import GeneralRegistration from './GeneralRegistration';

type RegistrationType = 'colaboradores' | 'veiculos' | 'clientes' | 'oficinas' | 'fornecedores' | 'prestadores';

const RegistrationControl: React.FC = () => {
    const [activeSubTab, setActiveSubTab] = useState<RegistrationType>('colaboradores');

    const tabs: { id: RegistrationType; label: string; icon: string; color: string }[] = [
        { id: 'colaboradores', label: 'Colaboradores & Motoristas', icon: 'fa-id-card', color: 'text-blue-400' },
        { id: 'veiculos', label: 'Veículos & Frota', icon: 'fa-truck', color: 'text-green-400' },
        { id: 'clientes', label: 'Clientes', icon: 'fa-user-tie', color: 'text-purple-400' },
        { id: 'oficinas', label: 'Oficinas', icon: 'fa-tools', color: 'text-orange-400' },
        { id: 'fornecedores', label: 'Fornecedores', icon: 'fa-boxes', color: 'text-yellow-400' },
        { id: 'prestadores', label: 'Prestadores de Serviço', icon: 'fa-handshake', color: 'text-teal-400' },
    ];

    const renderContent = () => {
        switch (activeSubTab) {
            case 'colaboradores':
                return <CollaboratorRegistration />;
            case 'veiculos':
                return <FleetControl />;
            case 'clientes':
                return <GeneralRegistration type="Cliente" />;
            case 'oficinas':
                return <GeneralRegistration type="Oficina" />;
            case 'fornecedores':
                return <GeneralRegistration type="Fornecedor" />;
            case 'prestadores':
                return <GeneralRegistration type="Prestador" />;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-bg-card rounded-lg p-6 shadow-lg">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-light flex items-center gap-3">
                            <i className="fas fa-folder-plus text-primary"></i> 
                            Controle de Cadastros Unificado
                        </h2>
                        <p className="text-gray-text text-sm mt-1">
                            Gerencie todos os registros do sistema em um único local.
                        </p>
                    </div>
                </div>

                {/* Sub-tab Navigation */}
                <div className="flex flex-wrap gap-2 border-b border-border-color pb-4 mb-6">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveSubTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 
                                ${activeSubTab === tab.id 
                                    ? 'bg-bg-main text-light shadow-inner border border-border-color' 
                                    : 'text-gray-400 hover:text-light hover:bg-bg-main/50'
                                }`}
                        >
                            <i className={`fas ${tab.icon} ${activeSubTab === tab.id ? tab.color : ''}`}></i>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="animate-fade-in">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default RegistrationControl;