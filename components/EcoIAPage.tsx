
import React, { useState, useEffect } from 'react';
import { useAppStore } from '../hooks/useAppStore';
import { TabId } from '../types';

// Browser compatibility check
// @ts-ignore
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

if (recognition) {
  recognition.continuous = false;
  recognition.lang = 'pt-BR';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
}

const commandMap: { [key: string]: TabId } = {
    'painel': 'dashboard',
    'visão geral': 'dashboard',
    'calendário': 'operational-calendar',
    'transações': 'transactions',
    'movimento': 'transactions',
    'financeiro': 'analytical-dashboard',
    'aprovações': 'general-approvals',
    'receitas': 'faturamento-receita',
    'custos fixos': 'custos-fixos',
    'custos variáveis': 'custos-variaveis',
    'relatório': 'operational-report',
    'radar': 'cost-radar',
    'atrasos': 'account-delays',
    'juros': 'interest-reports',
    'reembolso': 'reimbursement',
    'justificativa': 'reimbursement',
    'cotação': 'freight-quotation',
    'planilha': 'freight-sheet',
    'chamados': 'briefing',
    'andamento': 'briefing',
    'frota': 'fleet-control',
    'checklist': 'port-checklist',
    'leitor': 'cte-reader',
    'recibo': 'container-receipt',
    'predial': 'gestao-predial',
    'compliance': 'compliance',
    'irregularidade': 'compliance',
    'sites': 'eco-sites',
    'oficina': 'oficina-system',
    'funilaria': 'oficina-system',
    'ordem de serviço': 'oficina-system',
    'os': 'oficina-system',
    'usuários': 'user-management',
    'colaboradores': 'collaborator-registration',
    'notas': 'eco-note',
    'agenda': 'eco-agenda',
    'dados': 'dados-gerais-pg',
    'arquivos': 'eco-files',
    'drive': 'eco-drive',
    'ocr': 'ocr-reader',
    'histórico': 'history',
    'adicionar': 'financial-entries'
};

const EcoIAPage: React.FC = () => {
    const { setActiveTab } = useAppStore();
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [feedback, setFeedback] = useState('Clique no microfone e diga para onde quer ir.');
    const [isSupported, setIsSupported] = useState(true);
    const [cardIconColor, setCardIconColor] = useState('text-secondary');

    useEffect(() => {
        if (!recognition) {
            setIsSupported(false);
            setFeedback('Reconhecimento de voz não é suportado neste navegador. Tente usar o Google Chrome.');
            return;
        }

        const handleResult = (event: any) => {
            const command = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
            setTranscript(`Você disse: "${command}"`);
            
            const foundKey = Object.keys(commandMap).find(key => command.includes(key));
            
            if (foundKey) {
                const destination = commandMap[foundKey];
                setFeedback(`Entendido! Navegando para ${foundKey}...`);
                setActiveTab(destination);
            } else {
                setFeedback(`Comando "${command}" não reconhecido. Tente novamente.`);
            }
            setIsListening(false);
        };

        const handleError = (event: any) => {
            setIsListening(false);
            setFeedback(`Erro: ${event.error || 'Falha na escuta'}`);
        };
        
        recognition.addEventListener('result', handleResult);
        recognition.addEventListener('error', handleError);
        recognition.addEventListener('end', () => setIsListening(false));

        return () => {
            recognition.removeEventListener('result', handleResult);
            recognition.removeEventListener('error', handleError);
        };
    }, [setActiveTab]);

    const toggleListening = () => {
        if (!isSupported || !recognition) return;
        if (isListening) {
            recognition.stop();
        } else {
            try {
                const utterance = new SpeechSynthesisUtterance("Eco.IA ouvindo.");
                utterance.lang = 'pt-BR';
                window.speechSynthesis.speak(utterance);
                setTranscript('');
                setFeedback('Ouvindo...');
                recognition.start();
                setIsListening(true);
            } catch (error) {
                console.error("Error:", error);
            }
        }
    };

    const exampleCards = [
        { icon: 'fa-truck-moving', label: 'Ver Frota', command: 'frota' },
        { icon: 'fa-file-invoice-dollar', label: 'Financeiro', command: 'financeiro' },
        { icon: 'fa-users', label: 'Usuários', command: 'usuários' },
        { icon: 'fa-clipboard-list', label: 'Relatórios', command: 'relatório' },
    ];

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
            <div className="bg-bg-card rounded-lg p-8 shadow-lg text-center w-full max-w-2xl">
                <h2 className="text-3xl font-bold text-light mb-2"><i className="fas fa-microphone-alt mr-3 text-secondary"></i>Eco.IA Command</h2>
                <p className="text-gray-text mb-8">{feedback}</p>
                <div className="relative inline-block">
                     {isListening && <span className="absolute inset-0 rounded-full bg-secondary opacity-75 animate-ping"></span>}
                    <button onClick={toggleListening} disabled={!isSupported} className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 text-white text-5xl shadow-lg ${isListening ? 'bg-red-500' : 'bg-secondary hover:bg-primary'}`}>
                        <i className="fas fa-microphone-alt"></i>
                    </button>
                </div>
                {transcript && <div className="mt-8 animate-fade-in-up"><p className="text-light font-mono bg-bg-main p-4 rounded-md border-l-4 border-secondary text-lg">{transcript}</p></div>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl">
                {exampleCards.map((card, index) => (
                    <div key={index} className="bg-bg-card p-4 rounded-lg shadow-md flex flex-col items-center justify-center text-center hover:bg-bg-card/80 cursor-pointer" onClick={() => setActiveTab(commandMap[card.command])}>
                        <div className="w-12 h-12 rounded-full bg-bg-main flex items-center justify-center mb-2"><i className={`fas ${card.icon} text-secondary`}></i></div>
                        <h3 className="text-light font-semibold text-sm">{card.label}</h3>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EcoIAPage;
