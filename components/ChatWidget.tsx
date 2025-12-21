
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useAppStore, SIDEBAR_MENU_STRUCTURE } from '../hooks/useAppStore';
import { FinancialRecord, RevenueRecord, ReceivableRecord, RecordType, Demand, TabId } from '../types';
import { useAuth } from '../hooks/useAuth';
import { GoogleGenAI } from "@google/genai";

interface Message {
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

// @ts-ignore
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

if (recognition) {
    recognition.continuous = false;
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
}

const voiceCommands: { [key: string]: TabId } = {
    'painel': 'dashboard', 'dashboard': 'dashboard', 'início': 'dashboard',
    'transações': 'transactions', 'financeiro': 'transactions', 'movimento': 'transactions',
    'adicionar': 'financial-entries', 'novo registro': 'financial-entries', 'lançamento': 'financial-entries',
    'frota': 'fleet-control', 'veículos': 'fleet-control', 'manutenção': 'fleet-control',
    'custos fixos': 'custos-fixos', 'custos variáveis': 'custos-variaveis',
    'receitas': 'faturamento-receita', 'faturamento': 'faturamento-receita',
    'contabilidade': 'advnc-contabil', 'fiscal': 'advnc-contabil',
    'notas': 'eco-note', 'agenda': 'eco-agenda', 'drive': 'eco-drive',
    'usuários': 'user-management', 'operacional': 'freight-sheet',
    'mapas': 'freight-quotation', 'rota': 'freight-quotation',
    'checklist': 'port-checklist', 'cte': 'cte-reader', 'configurações': 'dados-gerais-pg',
};

const ChatWidget: React.FC = () => {
    const { financialData, calendarEvents, setActiveTab, checkPermission } = useAppStore();
    const { currentUser } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    const alerts = useMemo(() => {
        const generatedAlerts = [];
        if (currentUser?.role === 'Admin' || currentUser?.sector === 'FlowCapital') {
            const pending = calendarEvents.filter(e => e.status === 'pending');
            if (pending.length > 0) generatedAlerts.push({ title: 'Contas a Vencer', message: `Existem ${pending.length} contas próximas.` });
        }
        return generatedAlerts;
    }, [calendarEvents, currentUser]);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            let initialMessage = `👋 Olá, **${currentUser?.name}**! Eu sou o **Eco.IA**.\n\nComo pertenço ao seu ambiente logístico, posso te ajudar a navegar ou consultar dados do setor **${currentUser?.sector}**.`;
            if (alerts.length > 0) initialMessage += `\n\n⚠️ **Alerta:** Existem pendências financeiras sob sua supervisão.`;
            setMessages([{ text: initialMessage, sender: 'bot', timestamp: new Date() }]);
        }
    }, [isOpen, alerts, currentUser]);

    useEffect(() => {
        if (messagesContainerRef.current) messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }, [messages, isLoading, isListening]);

    const handleVoiceCommand = (transcript: string) => {
        const userMsg: Message = { text: `🎤 "${transcript}"`, sender: 'user', timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        const lowerTranscript = transcript.toLowerCase().trim();
        
        const commandKey = Object.keys(voiceCommands).sort((a, b) => b.length - a.length).find(key => lowerTranscript.includes(key));

        if (commandKey) {
            const targetTab = voiceCommands[commandKey];
            if (checkPermission(currentUser, targetTab)) {
                addBotMessage(`🚀 Autorizado. Navegando para **${commandKey.toUpperCase()}**...`);
                setTimeout(() => setActiveTab(targetTab), 800);
            } else {
                addBotMessage(`🚫 Desculpe, **${currentUser?.name}**. Você não tem permissão de nível ${currentUser?.role} para acessar esta área.`);
            }
        } else {
            processTextWithAI(transcript);
        }
    };

    const addBotMessage = (text: string) => setMessages(prev => [...prev, { text, sender: 'bot', timestamp: new Date() }]);

    const processTextWithAI = async (text: string) => {
        setIsLoading(true);
        try {
            if (!process.env.API_KEY) throw new Error("API Key missing");
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Usuário: ${currentUser?.name}, Cargo: ${currentUser?.role}, Setor: ${currentUser?.sector}.
                O sistema é o EcoLog. Ele disse: "${text}".
                
                REGRAS DE SEGURANÇA:
                1. Não forneça dados sensíveis se o cargo não for Admin.
                2. Se ele pedir para apagar algo, diga que apenas o Administrador pode via painel físico.
                3. Responda de forma curta e logística.`,
            });
            addBotMessage(response.text);
        } catch (error) {
            addBotMessage("🔌 Erro de conexão com o núcleo cerebral.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async (e: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent) => {
        if ((e.type === 'keydown' && (e as React.KeyboardEvent).key !== 'Enter') || inputValue.trim() === '' || isLoading) return;
        if (e.type === 'keydown') (e as React.KeyboardEvent).preventDefault();

        const text = inputValue;
        setMessages(prev => [...prev, { text, sender: 'user', timestamp: new Date() }]);
        setInputValue('');
        
        const commandKey = Object.keys(voiceCommands).sort((a, b) => b.length - a.length).find(key => text.toLowerCase().includes(key));
        
        if (commandKey) {
            const targetTab = voiceCommands[commandKey];
            if (checkPermission(currentUser, targetTab)) {
                addBotMessage(`📂 Abrindo **${commandKey.toUpperCase()}**...`);
                setTimeout(() => setActiveTab(targetTab), 500);
            } else {
                addBotMessage(`🔒 Acesso negado por regras de governança para o setor ${currentUser?.sector}.`);
            }
        } else {
            await processTextWithAI(text);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[2000] font-sans isolate">
            {isOpen && (
                <div className="absolute bottom-20 right-0 w-[380px] h-[600px] bg-bg-card/95 backdrop-blur-xl border border-border-color/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up ring-1 ring-white/10 origin-bottom-right">
                    <div className="p-4 bg-gradient-to-r from-bg-card via-bg-main to-bg-card border-b border-border-color flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shadow-lg"><i className="fas fa-robot"></i></div>
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-bg-card rounded-full"></span>
                            </div>
                            <div>
                                <h3 className="font-bold text-light text-sm">Eco.IA Gov</h3>
                                <p className="text-[8px] text-primary uppercase font-black tracking-widest">Protocolo Seguro</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-all"><i className="fas fa-times"></i></button>
                    </div>

                    <div ref={messagesContainerRef} className="flex-1 p-4 overflow-y-auto space-y-4 bg-bg-main/30 custom-scrollbar">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                                <div className={`max-w-[85%] p-3 rounded-xl text-sm shadow-sm ${msg.sender === 'user' ? 'bg-secondary text-white' : 'bg-bg-card border border-border-color text-gray-100'}`}>
                                    <div className="leading-relaxed" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br />') }} />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-3 bg-bg-card border-t border-border-color">
                        <div className="flex items-center gap-2 bg-bg-main rounded-full border border-border-color px-2 py-1.5 focus-within:border-primary transition-all">
                            <button onClick={() => { recognition?.start(); setIsListening(true); }} className={`w-8 h-8 rounded-full flex items-center justify-center ${isListening ? 'bg-danger animate-pulse' : 'text-gray-400 hover:text-primary'}`}><i className="fas fa-microphone"></i></button>
                            <input type="text" className="flex-1 bg-transparent text-xs text-light focus:outline-none" placeholder="Pergunte ao sistema..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleSendMessage} />
                        </div>
                    </div>
                </div>
            )}
            <button onClick={() => setIsOpen(!isOpen)} className="w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-2xl text-white bg-primary hover:scale-110 transition-all z-20"><i className={`fas ${isOpen ? 'fa-times' : 'fa-brain'}`}></i></button>
        </div>
    );
};

export default ChatWidget;
