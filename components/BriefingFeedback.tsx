import React, { useState } from 'react';
import { useAppStore } from '../hooks/useAppStore';

const NpsRating: React.FC<{ score: number | null; setScore: (score: number) => void }> = ({ score, setScore }) => {
    const scores = Array.from({ length: 11 }, (_, i) => i); // 0 to 10

    const getColor = (s: number) => {
        if (s <= 6) return 'bg-red-500/80 hover:bg-red-600';
        if (s <= 8) return 'bg-yellow-500/80 hover:bg-yellow-600';
        return 'bg-green-500/80 hover:bg-green-600';
    };
    
    return (
        <div className="flex flex-wrap items-center gap-2">
            {scores.map((s) => (
                <button
                    key={s}
                    type="button"
                    onClick={() => setScore(s)}
                    className={`w-10 h-10 rounded-full text-sm font-bold transition-all duration-200 transform hover:scale-110
                        ${score === s 
                            ? `${getColor(s)} text-white ring-2 ring-offset-2 ring-offset-bg-card ring-white`
                            : 'bg-border-color text-gray-text hover:bg-opacity-80'
                        }`}
                >
                    {s}
                </button>
            ))}
        </div>
    );
};

const BriefingFeedback: React.FC = () => {
    const { logAction } = useAppStore();
    const [npsScore, setNpsScore] = useState<number | null>(null);
    const [attachments, setAttachments] = useState<File[]>([]);
    const [formData, setFormData] = useState({
        clientIdentifier: '',
        senderName: '',
        clientPhone: '',
        clientEmail: '',
        message: ''
    });

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setAttachments(Array.from(e.target.files));
        }
    };

    const resetForm = () => {
        setFormData({
            clientIdentifier: '',
            senderName: '',
            clientPhone: '',
            clientEmail: '',
            message: ''
        });
        setNpsScore(null);
        setAttachments([]);
        const fileInput = document.getElementById('attachments') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    const handleSend = (channel: 'whatsapp' | 'sms' | 'email') => {
        const { clientIdentifier, message, clientPhone, clientEmail } = formData;
        
        if (!clientIdentifier || !message) {
            alert('Por favor, preencha o campo "Cliente" e a mensagem antes de enviar.');
            return;
        }

        const npsText = npsScore !== null ? `\n\nNossa pesquisa de satisfação foi avaliada com a nota: ${npsScore}/10.` : '';
        const fullMessage = `${message}${npsText}`;

        switch (channel) {
            case 'whatsapp':
                if (!clientPhone) { alert('Por favor, insira um número de WhatsApp.'); return; }
                const cleanPhone = clientPhone.replace(/\D/g, '');
                window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(fullMessage)}`, '_blank');
                logAction(`Tentativa de envio via WhatsApp para ${clientIdentifier} (${cleanPhone})`);
                break;
            case 'sms':
                if (!clientPhone) { alert('Por favor, insira um número de telefone para SMS.'); return; }
                window.location.href = `sms:${clientPhone.replace(/\D/g, '')}?body=${encodeURIComponent(fullMessage)}`;
                logAction(`Tentativa de envio via SMS para ${clientIdentifier} (${clientPhone})`);
                break;
            case 'email':
                if (!clientEmail) { alert('Por favor, insira um email.'); return; }
                const subject = `Comunicação sobre: ${clientIdentifier}`;
                window.location.href = `mailto:${clientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(fullMessage)}`;
                logAction(`Tentativa de envio via Email para ${clientIdentifier} (${clientEmail})`);
                break;
        }
    };
    
    const handleLogSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        logAction(`Comunicação para '${formData.clientIdentifier}' registrada por '${formData.senderName}'. NPS: ${npsScore ?? 'N/A'}.`);
        alert('Comunicação registrada no sistema!');
        resetForm();
    };

    return (
        <div className="bg-bg-card rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-light mb-2">Comunicação com Cliente e Pesquisa de Satisfação</h2>
            <p className="text-gray-text mb-6">Utilize este painel para enviar retornos, solicitar feedback e registrar a satisfação do cliente.</p>

            <form onSubmit={handleLogSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                        <label className="form-label" htmlFor="clientIdentifier">Cliente / ID da Operação</label>
                        <input className="form-input" type="text" id="clientIdentifier" name="clientIdentifier" value={formData.clientIdentifier} onChange={handleFormChange} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="senderName">Seu Nome / Departamento</label>
                        <input className="form-input" type="text" id="senderName" name="senderName" value={formData.senderName} onChange={handleFormChange} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="clientEmail">Email do Cliente</label>
                        <input className="form-input" type="email" id="clientEmail" name="clientEmail" value={formData.clientEmail} onChange={handleFormChange} placeholder="necessário para envio por email" />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="clientPhone">Nº de WhatsApp / SMS do Cliente</label>
                        <input className="form-input" type="tel" id="clientPhone" name="clientPhone" value={formData.clientPhone} onChange={handleFormChange} placeholder="com código do país e DDD" />
                    </div>
                </div>
                
                <div className="form-group">
                    <label className="form-label" htmlFor="message">Mensagem para o Cliente</label>
                    <textarea className="form-input min-h-[150px]" id="message" name="message" value={formData.message} onChange={handleFormChange} required></textarea>
                </div>
                
                <div className="form-group">
                    <label className="form-label">Pesquisa de Satisfação (NPS)</label>
                    <p className="text-xs text-gray-text mb-2">De 0 a 10, qual a probabilidade de você recomendar nossos serviços?</p>
                    <NpsRating score={npsScore} setScore={setNpsScore} />
                </div>

                <div className="form-group">
                    <label className="form-label" htmlFor="attachments">Anexar Arquivos (opcional)</label>
                    <input 
                        className="form-input p-[7px] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-secondary file:text-white hover:file:bg-opacity-90" 
                        type="file" id="attachments" name="attachments" multiple onChange={handleFileChange}
                    />
                     {attachments.length > 0 && (
                        <div className="mt-2 text-xs text-gray-text">
                            {attachments.length} arquivo(s) selecionado(s): {attachments.map(f => f.name).join(', ')}
                        </div>
                    )}
                </div>
                
                <div className="pt-4 border-t border-border-color space-y-4">
                    <div className="flex flex-wrap items-center gap-4">
                        <label className="font-semibold text-light">Canais de Envio:</label>
                        <button type="button" onClick={() => handleSend('whatsapp')} className="btn-channel bg-[#25D366]"><i className="fab fa-whatsapp"></i> WhatsApp</button>
                        <button type="button" onClick={() => handleSend('sms')} className="btn-channel bg-[#3B82F6]"><i className="fas fa-sms"></i> SMS</button>
                        <button type="button" onClick={() => handleSend('email')} className="btn-channel bg-[#F59E0B]"><i className="fas fa-envelope"></i> Email</button>
                    </div>
                     <div className="flex justify-end gap-4">
                        <button type="button" onClick={resetForm} className="px-6 py-2 bg-border-color text-light font-semibold rounded-md hover:bg-opacity-90 shadow-md hover:shadow-lg transition-shadow">Limpar</button>
                        <button type="submit" className="px-6 py-2 bg-primary text-white font-semibold rounded-md hover:bg-opacity-90 shadow-md hover:shadow-lg transition-shadow">Apenas Registrar no Sistema</button>
                    </div>
                </div>
            </form>
            <style>
            {`
                .btn-channel {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 1rem;
                    border-radius: 9999px;
                    color: white;
                    font-weight: 600;
                    font-size: 0.875rem;
                    transition: transform 0.2s;
                }
                .btn-channel:hover {
                    transform: scale(1.05);
                }
            `}
            </style>
        </div>
    );
};

export default BriefingFeedback;
