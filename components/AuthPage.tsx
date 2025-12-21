
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';

interface LoginCardProps {
    title: string;
    subtitle: string;
    onLogin?: (matricula: string) => Promise<boolean>;
    onCustomAction?: (value: string) => void;
    iconClass?: string;
    buttonText?: string;
    buttonIconClass?: string;
    isCustom?: boolean;
    inputLabel?: string;
    inputPlaceholder?: string;
}

const LoginCard: React.FC<LoginCardProps> = ({ 
    title, 
    subtitle, 
    onLogin, 
    onCustomAction,
    iconClass, 
    buttonText, 
    buttonIconClass, 
    isCustom,
    inputLabel,
    inputPlaceholder
}) => {
    const { t } = useLanguage();
    const [inputValue, setInputValue] = useState('');
    const [error, setError] = useState('');

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (onCustomAction) {
            if (!inputValue.trim()) {
                setError('Por favor, preencha o campo.');
                return;
            }
            onCustomAction(inputValue);
        } else if (onLogin) {
            const success = await onLogin(inputValue);
            if (!success) {
                setError('Matrícula inválida.');
            }
        }
    };

    const finalButtonText = buttonText || t('login');
    const label = inputLabel || t('matricula');

    return (
        <div className={`w-full max-w-sm bg-bg-card p-8 rounded-2xl shadow-2xl flex flex-col items-center justify-center transform transition-transform duration-300 hover:-translate-y-2 ${isCustom ? 'border-2 border-dashed border-primary/30' : ''}`}>
            <div className="text-center mb-6">
                {iconClass && <i className={`${iconClass} text-5xl text-primary mb-4`}></i>}
                <h2 className="text-2xl font-bold text-light whitespace-nowrap">{title}</h2>
                <p className="text-gray-text mt-1 text-sm">{subtitle}</p>
            </div>
            <form onSubmit={handleFormSubmit} className="space-y-6 w-full">
                <div className="form-group">
                    <label className="form-label" htmlFor={`input-${title.replace(/\s/g, '')}`}>{label}</label>
                    <input 
                        className="form-input text-lg text-center" 
                        type="text" 
                        id={`input-${title.replace(/\s/g, '')}`}
                        value={inputValue} 
                        onChange={e => setInputValue(e.target.value)} 
                        placeholder={inputPlaceholder}
                        required 
                    />
                </div>
                
                {error && <p className="text-danger text-sm text-center">{error}</p>}

                <div>
                    <button type="submit" className="w-full px-4 py-3 bg-primary text-white font-bold rounded-md hover:bg-opacity-90 shadow-md hover:shadow-lg transition-shadow flex items-center justify-center gap-2">
                        {buttonIconClass && <i className={buttonIconClass}></i>}
                        {finalButtonText}
                    </button>
                </div>
            </form>
        </div>
    );
};

const AuthPage: React.FC = () => {
    const { login } = useAuth();
    
    return (
        <div className="min-h-screen bg-bg-main flex items-center justify-center p-4 relative">
            <div className="flex flex-wrap items-stretch justify-center gap-8 relative z-10">
                <LoginCard 
                    title="EcoLog" 
                    subtitle="Sistema Completo de Gestão Logística" 
                    iconClass="fas fa-truck-moving"
                    buttonText="Entrar no Sistema"
                    buttonIconClass="fas fa-arrow-right"
                    onLogin={login} 
                />
            </div>

             <style>{`
                .form-group label { display: block; margin-bottom: 5px; font-weight: 500; color: #94A3B8; }
                .form-input, .form-select {
                    padding: 0.75rem;
                    border: 1px solid #374151;
                    border-radius: 0.375rem;
                    font-size: 1rem;
                    background-color: #0F172A;
                    color: #f9fafb;
                    width: 100%;
                }
                .form-input:focus, .form-select:focus {
                    outline: none;
                    border-color: #14B8A6;
                    box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1);
                }
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default AuthPage;
