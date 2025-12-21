import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations } from '../translations';

export type Language = 'pt' | 'en' | 'es' | 'zh' | 'ja';

// Use 'pt' as the reference for keys to get autocompletion
export type TranslationKeys = keyof (typeof translations)['pt'];

interface LanguageState {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: TranslationKeys | string) => string;
}

const LanguageContext = createContext<LanguageState | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>('pt');

    useEffect(() => {
        const storedLang = localStorage.getItem('ecolog-language') as Language;
        if (storedLang && Object.keys(translations).includes(storedLang)) {
            setLanguage(storedLang);
        }
    }, []);

    const handleSetLanguage = (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem('ecolog-language', lang);
    };

    const t = (key: TranslationKeys | string): string => {
        // Fallback chain: selected language -> portuguese -> the key itself
        return (translations[language] as any)[key] || (translations['pt'] as any)[key] || key;
    };

    const value: LanguageState = {
        language,
        setLanguage: handleSetLanguage,
        t,
    };

    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = (): LanguageState => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
