import React, { useState } from 'react';

interface EmbeddedSiteProps {
    url: string;
    title: string;
}

const EmbeddedSite: React.FC<EmbeddedSiteProps> = ({ url, title }) => {
    const [isLoading, setIsLoading] = useState(true);

    return (
        <div className="w-full h-full flex flex-col bg-bg-card rounded-lg overflow-hidden shadow-lg border border-border-color relative">
            <div className="bg-bg-main p-3 border-b border-border-color flex justify-between items-center z-10">
                <h3 className="font-bold text-light flex items-center gap-2">
                    <i className="fas fa-globe text-secondary"></i> {title}
                </h3>
                <div className="flex items-center gap-2">
                    {isLoading && <span className="text-xs text-gray-400 animate-pulse mr-2">Carregando...</span>}
                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-bg-card px-3 py-1.5 rounded-md border border-border-color hover:border-secondary transition-colors">
                        Abrir em nova aba <i className="fas fa-external-link-alt"></i>
                    </a>
                </div>
            </div>
            
            <div className="flex-grow relative bg-white">
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-0">
                        <i className="fas fa-circle-notch fa-spin text-4xl text-gray-400"></i>
                    </div>
                )}
                <iframe 
                    src={url} 
                    title={title}
                    className="w-full h-full border-none relative z-10"
                    allowFullScreen
                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-popups-to-escape-sandbox"
                    onLoad={() => setIsLoading(false)}
                />
            </div>
        </div>
    );
};

export default EmbeddedSite;