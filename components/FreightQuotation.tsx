import React, { useState, useEffect } from 'react';
import { useAppStore } from '../hooks/useAppStore';
import CostCalculator from './CostCalculator';
import { FreightAnalysis } from '../types';

// --- Types ---
interface CityDistanceData {
    state: string;
    sigla: string;
    municipio: string;
    distance: number;
}

const cityDistances: CityDistanceData[] = [
    { state: "RJ", sigla: "RJA", municipio: "Rio de Janeiro (Capital)", distance: 0 },
    { state: "RJ", sigla: "NIT", municipio: "Niterói", distance: 28 },
    { state: "RJ", sigla: "DDC", municipio: "Duque de Caxias", distance: 48 },
    { state: "RJ", sigla: "SGO", municipio: "São Gonçalo", distance: 60 },
    { state: "RJ", sigla: "NIG", municipio: "Nova Iguaçu", distance: 80 },
    { state: "RJ", sigla: "PET", municipio: "Petrópolis", distance: 136 },
    { state: "SP", sigla: "SPA", municipio: "São Paulo (Capital)", distance: 430 },
    { state: "SP", sigla: "SAN", municipio: "Santos", distance: 500 },
    { state: "SP", sigla: "CAM", municipio: "Campinas", distance: 510 },
    { state: "MG", sigla: "BHE", municipio: "Belo Horizonte", distance: 440 },
    { state: "ES", sigla: "VIX", municipio: "Vitória", distance: 520 },
    { state: "PR", sigla: "CUR", municipio: "Curitiba", distance: 850 },
];

// --- Main Component ---
const FreightQuotation: React.FC = () => {
    const { freightAnalyses, addFreightAnalysis, deleteFreightAnalysis } = useAppStore();
    const [formData, setFormData] = useState({
        clientName: '',
        cnpj: '',
        contactMethod: 'E-mail',
        contactValue: '',
        serviceType: 'Transporte Rodoviário',
        origin: '',
        destination: '',
        address: '',
        baseKm: 0,
        finalKm: 0,
        description: '',
        editorName: 'Operador Logístico',
        serviceValue: 0,
        pricePerKm: 4.50,
        costDescription: '',
    });

    const [timer, setTimer] = useState({ seconds: 0, isActive: false });
    const [progress, setProgress] = useState(0);
    const [originName, setOriginName] = useState('');
    const [destinationName, setDestinationName] = useState('');

    // Timer Logic
    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | null = null;
        if (timer.isActive) {
            interval = setInterval(() => {
                setTimer(prev => ({ ...prev, seconds: prev.seconds + 1 }));
                setProgress(prev => (prev >= 100 ? 0 : prev + (100 / 60))); 
            }, 1000);
        }
        return () => { if (interval) clearInterval(interval); };
    }, [timer.isActive]);

    const formatTime = (totalSeconds: number) => {
        const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const seconds = (totalSeconds % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    };

    const handleTimerToggle = () => setTimer(prev => ({ ...prev, isActive: !prev.isActive }));
    const handleTimerReset = () => { setTimer({ seconds: 0, isActive: false }); setProgress(0); };

    // Location & Calc Logic
    const handleLocationChange = (field: 'origin' | 'destination', value: string) => {
        const upperValue = value.toUpperCase();
        setFormData(prev => ({...prev, [field]: upperValue}));

        const city = cityDistances.find(c => c.sigla === upperValue);
        if (field === 'origin') setOriginName(city ? city.municipio : '');
        if (field === 'destination') setDestinationName(city ? city.municipio : '');
    };
    
    useEffect(() => {
        const destCity = cityDistances.find(c => c.sigla === formData.destination);
        const originCity = cityDistances.find(c => c.sigla === formData.origin);
        
        let totalKm = 0;
        if (destCity) {
             totalKm = destCity.distance;
             if (originCity && originCity.sigla !== 'RJA') {
                 totalKm = Math.abs(destCity.distance - originCity.distance); 
             }
        }

        setFormData(prev => {
            const finalKm = totalKm * 2; // Round trip
            // Note: We do NOT automatically update serviceValue here to allow manual override.
            // User must click "Calcular" or type it manually.
            return {
                ...prev, 
                baseKm: totalKm, 
                finalKm: finalKm,
            };
        });
    }, [formData.destination, formData.origin]);

    const calculateSuggestedValue = () => {
        const suggested = formData.finalKm * formData.pricePerKm;
        setFormData(prev => ({ ...prev, serviceValue: suggested }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const isNumeric = ['serviceValue', 'finalKm', 'pricePerKm'].includes(name);
        setFormData(prev => ({ ...prev, [name]: isNumeric ? parseFloat(value) || 0 : value }));
    };

    // Map Feature
    const openMap = () => {
        if (!formData.address) {
            alert("Por favor, insira um endereço primeiro.");
            return;
        }
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formData.address)}`, '_blank');
    };

    const handleSave = () => {
        if (!formData.clientName || !formData.destination) {
            alert("Preencha pelo menos o Nome do Cliente e o Destino.");
            return;
        }

        const newAnalysis: FreightAnalysis = {
            id: `FA-${Date.now()}`,
            createdAt: new Date().toISOString(),
            clientName: formData.clientName,
            cnpj: formData.cnpj,
            origin: formData.origin,
            destination: formData.destination,
            serviceType: formData.serviceType,
            totalKm: formData.finalKm,
            totalValue: formData.serviceValue,
            pricePerKm: formData.pricePerKm,
            data: formData
        };

        addFreightAnalysis(newAnalysis);
        if (timer.isActive) handleTimerToggle(); // Stop timer on save
    };

    const handleClear = () => {
        if (window.confirm("Limpar formulário para nova cotação?")) {
            setFormData({
                clientName: '', cnpj: '', contactMethod: 'E-mail', contactValue: '', serviceType: 'Transporte Rodoviário',
                origin: '', destination: '', address: '', baseKm: 0, finalKm: 0, description: '',
                editorName: 'Operador Logístico', serviceValue: 0, pricePerKm: 4.50, costDescription: ''
            });
            handleTimerReset();
            setOriginName('');
            setDestinationName('');
        }
    };

    const loadAnalysis = (analysis: FreightAnalysis) => {
        if (window.confirm("Carregar esta cotação substituirá os dados atuais do formulário. Continuar?")) {
            if (analysis.data) {
                setFormData(analysis.data);
                const destCity = cityDistances.find(c => c.sigla === analysis.data.destination);
                if (destCity) setDestinationName(destCity.municipio);
                const originCity = cityDistances.find(c => c.sigla === analysis.data.origin);
                if (originCity) setOriginName(originCity.municipio);
            }
        }
    };

    return (
        <div className="flex flex-col xl:flex-row gap-6">
            <div className="flex-grow bg-bg-card p-8 rounded-xl shadow-lg text-light relative overflow-hidden">
                {/* Cyberpunk Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary"></div>
                
                <header className="text-center mb-10 border-b border-border-color pb-6">
                    <h2 className="text-3xl font-bold flex items-center justify-center gap-3 text-light">
                        <i className="fas fa-chart-network text-primary animate-pulse"></i>
                        Analista de Custos & Cadastro
                    </h2>
                    <p className="mt-2 text-gray-text max-w-2xl mx-auto text-sm">
                        Simulação de viabilidade econômica e cadastro operacional inteligente.
                    </p>
                </header>
                
                <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
                    {/* Section 1: Client Data */}
                    <section>
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-secondary uppercase tracking-wider">
                            <span className="bg-secondary text-bg-main w-6 h-6 rounded flex items-center justify-center text-xs font-bold">1</span>
                            Dados do Cliente
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-bg-main/50 rounded-xl border border-border-color hover:border-secondary/50 transition-colors">
                            <div className="form-group">
                                <label className="form-label">Nome do Cliente</label>
                                <input name="clientName" type="text" value={formData.clientName} onChange={handleChange} className="form-input" placeholder="Ex: Indústria XYZ Ltda" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">CNPJ</label>
                                <input name="cnpj" type="text" value={formData.cnpj} onChange={handleChange} placeholder="00.000.000/0001-00" className="form-input"/>
                            </div>
                            
                            {/* Address with Map Button */}
                            <div className="form-group md:col-span-2">
                                <label className="form-label flex justify-between">
                                    <span>Endereço Completo</span>
                                    {formData.address && <span className="text-xs text-success"><i className="fas fa-check-circle"></i> Localização pronta</span>}
                                </label>
                                <div className="flex gap-2">
                                    <input 
                                        name="address" 
                                        type="text" 
                                        value={formData.address} 
                                        onChange={handleChange} 
                                        placeholder="Rua, Número, Bairro, Cidade - UF" 
                                        className="form-input flex-grow"
                                    />
                                    <button 
                                        type="button" 
                                        onClick={openMap} 
                                        title="Visualizar no Google Maps"
                                        className={`px-4 py-2 rounded-md border font-bold text-sm transition-all flex items-center ${formData.address ? 'bg-blue-600 text-white border-blue-500 hover:bg-blue-700' : 'bg-bg-main text-gray-500 border-border-color cursor-not-allowed'}`}
                                        disabled={!formData.address}
                                    >
                                        <i className="fas fa-map-marked-alt mr-2"></i> Mapa
                                    </button>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Contato Principal</label>
                                <div className="flex gap-2">
                                    <select name="contactMethod" value={formData.contactMethod} onChange={handleChange} className="form-select w-1/3">
                                        <option>WhatsApp</option>
                                        <option>Celular</option>
                                        <option>E-mail</option>
                                    </select>
                                    <input name="contactValue" type="text" value={formData.contactValue} onChange={handleChange} placeholder="Digite o contato..." className="form-input w-2/3"/>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Tipo de Serviço</label>
                                <select name="serviceType" value={formData.serviceType} onChange={handleChange} className="form-select">
                                    <optgroup label="🚛 Transporte">
                                        <option>Transporte Rodoviário</option>
                                        <option>Carga Fracionada (LTL)</option>
                                        <option>Carga de Lotação (FTL)</option>
                                        <option>Porta a Porta</option>
                                    </optgroup>
                                    <optgroup label="📦 Logística">
                                        <option>Armazenagem</option>
                                        <option>Distribuição Urbana</option>
                                    </optgroup>
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* Section 2: Route & Time */}
                    <section>
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-secondary uppercase tracking-wider">
                            <span className="bg-secondary text-bg-main w-6 h-6 rounded flex items-center justify-center text-xs font-bold">2</span>
                            Rota e SLA
                        </h3>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-6 p-6 bg-bg-main/50 rounded-xl border border-border-color hover:border-secondary/50 transition-colors">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="form-label flex items-center gap-2"><i className="fas fa-map-marker-alt text-red-500"></i> Origem (SIGLA)</label>
                                        <input name="origin" type="text" value={formData.origin} onChange={e => handleLocationChange('origin', e.target.value)} list="cities" placeholder="Ex: RJA" className="form-input uppercase font-mono"/>
                                        <p className="text-xs text-gray-400 mt-1 h-4">{originName}</p>
                                    </div>
                                    <div>
                                        <label className="form-label flex items-center gap-2"><i className="fas fa-flag-checkered text-green-500"></i> Destino (SIGLA)</label>
                                        <input name="destination" type="text" value={formData.destination} onChange={e => handleLocationChange('destination', e.target.value)} list="cities" placeholder="Ex: SPA" className="form-input uppercase font-mono"/>
                                        <p className="text-xs text-gray-400 mt-1 h-4">{destinationName}</p>
                                    </div>
                                    <datalist id="cities">
                                        {cityDistances.map(city => <option key={city.sigla} value={city.sigla}>{city.municipio}</option>)}
                                    </datalist>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                                    <div>
                                        <label className="form-label">KM Base (Ida)</label>
                                        <input type="text" value={`${formData.baseKm} km`} readOnly className="form-input bg-bg-card text-gray-400 cursor-default"/>
                                    </div>
                                    <div>
                                        <label className="form-label">KM Total (Ida/Volta)</label>
                                        <input name="finalKm" type="number" value={formData.finalKm} onChange={handleChange} className="form-input"/>
                                    </div>
                                    <div>
                                        <label className="form-label">Preço / KM (R$)</label>
                                        <input name="pricePerKm" type="number" step="0.10" value={formData.pricePerKm} onChange={handleChange} className="form-input text-secondary font-bold"/>
                                    </div>
                                    <div className="relative">
                                        <label className="form-label font-bold text-primary">Valor Frete (R$)</label>
                                        <div className="relative flex items-center">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <i className="fas fa-dollar-sign text-primary"></i>
                                            </div>
                                            <input 
                                                name="serviceValue" 
                                                type="number" 
                                                step="0.01" 
                                                value={formData.serviceValue} 
                                                onChange={handleChange} 
                                                className="form-input border-primary text-primary font-bold text-lg bg-primary/10 pl-8 focus:ring-2 focus:ring-primary"
                                                placeholder="0.00"
                                            />
                                            <button 
                                                onClick={calculateSuggestedValue} 
                                                type="button"
                                                className="absolute right-1 top-1 bottom-1 px-2 bg-primary/20 hover:bg-primary/40 text-primary rounded text-xs"
                                                title="Calcular com base na KM"
                                            >
                                                Auto
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Timer Widget */}
                            <div className="flex flex-col items-center justify-center bg-bg-main p-6 rounded-xl border border-border-color shadow-inner relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-2">
                                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block"></span>
                                </div>
                                <h4 className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-wider">Tempo de Atendimento</h4>
                                <div className="relative mb-4">
                                    <div className={`absolute inset-0 flex items-center justify-center text-7xl opacity-10 text-primary ${timer.isActive ? 'animate-pulse' : ''}`}>
                                        <i className="fas fa-stopwatch"></i>
                                    </div>
                                    <span className="text-5xl font-mono font-bold text-white relative z-10 drop-shadow-lg">{formatTime(timer.seconds)}</span>
                                </div>
                                <div className="w-full bg-bg-card rounded-full h-2 mb-6 overflow-hidden border border-border-color">
                                    <div className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-1000 ease-linear" style={{ width: `${progress}%` }}></div>
                                </div>
                                <div className="flex gap-3">
                                    <button type="button" onClick={handleTimerToggle} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg transform hover:scale-110 ${timer.isActive ? 'bg-yellow-600 text-white hover:bg-yellow-500' : 'bg-green-600 text-white hover:bg-green-500'}`}>
                                        {timer.isActive ? <i className="fas fa-pause"></i> : <i className="fas fa-play"></i>}
                                    </button>
                                    <button type="button" onClick={handleTimerReset} className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-700 text-white hover:bg-gray-600 transition-all shadow-lg transform hover:scale-110">
                                        <i className="fas fa-redo"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section 3: Financial Analysis */}
                    <section>
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-secondary uppercase tracking-wider">
                            <span className="bg-secondary text-bg-main w-6 h-6 rounded flex items-center justify-center text-xs font-bold">3</span>
                            Análise Financeira Detalhada
                        </h3>
                        <div className="border-t border-border-color pt-4">
                            <CostCalculator totalValue={formData.serviceValue} />
                        </div>
                        
                        <div className="mt-6 grid grid-cols-1 gap-4">
                             <div>
                                 <label className="form-label">Notas sobre Custos Adicionais</label>
                                 <textarea name="costDescription" value={formData.costDescription} onChange={handleChange} rows={3} placeholder="Descreva custos extras, pedágios não previstos ou taxas..." className="form-input"></textarea>
                            </div>
                        </div>
                    </section>

                    {/* Footer Actions */}
                    <div className="flex justify-between items-center pt-6 border-t border-border-color sticky bottom-0 bg-bg-card py-4 z-10">
                        <div className="text-sm text-gray-text italic">
                            Editor: <span className="text-secondary font-semibold">{formData.editorName}</span>
                        </div>
                        <div className="flex gap-3">
                            <button type="button" onClick={handleClear} className="flex items-center gap-2 font-bold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-5 py-3 rounded-lg transition-colors border border-red-500/30">
                                <i className="fas fa-trash"></i> Limpar
                            </button>
                            <button type="button" onClick={handleSave} className="flex items-center gap-2 font-bold text-bg-main bg-primary hover:bg-primary/90 px-8 py-3 rounded-lg shadow-[0_0_15px_rgba(20,184,166,0.5)] hover:shadow-[0_0_25px_rgba(20,184,166,0.7)] transition-all transform hover:-translate-y-1">
                                <i className="fas fa-save"></i> Salvar Análise
                            </button>
                        </div>
                    </div>
                </form>
                <style>{`
                    .form-label { display: block; margin-bottom: 0.5rem; font-weight: 600; color: #94A3B8; font-size: 0.9rem; }
                    .form-input, .form-select {
                        width: 100%; padding: 0.75rem;
                        background-color: #0F172A; border: 1px solid #334155;
                        border-radius: 0.5rem; color: #F8FAFC;
                        transition: border-color 0.2s, box-shadow 0.2s;
                    }
                    .form-input:focus, .form-select:focus {
                        outline: none; border-color: #14B8A6;
                        box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.2);
                    }
                `}</style>
            </div>

            {/* Sidebar History */}
            <div className="w-full xl:w-80 flex-shrink-0 bg-bg-main p-5 rounded-xl border border-border-color h-fit shadow-xl">
                <h3 className="font-bold text-light mb-4 flex items-center gap-2 border-b border-border-color pb-2">
                    <i className="fas fa-history text-secondary"></i> Histórico Recente
                </h3>
                <div className="space-y-3 max-h-[800px] overflow-y-auto pr-1 custom-scrollbar">
                    {freightAnalyses.length === 0 ? (
                        <p className="text-gray-text text-sm text-center py-8 opacity-50">Nenhuma cotação salva.</p>
                    ) : (
                        freightAnalyses.map(analysis => (
                            <div key={analysis.id} className="bg-bg-card p-3 rounded-lg border border-border-color hover:border-primary group cursor-pointer transition-all hover:translate-x-1" onClick={() => loadAnalysis(analysis)}>
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-bold text-light truncate max-w-[150px]" title={analysis.clientName}>{analysis.clientName}</span>
                                    <span className="text-[10px] text-gray-500">{new Date(analysis.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                                    <span className="bg-black/30 px-1 rounded">{analysis.origin || '?'}</span> 
                                    <i className="fas fa-arrow-right text-[10px]"></i> 
                                    <span className="bg-black/30 px-1 rounded">{analysis.destination || '?'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-success text-sm">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(analysis.totalValue)}</span>
                                    <button onClick={(e) => { e.stopPropagation(); deleteFreightAnalysis(analysis.id); }} className="text-gray-600 hover:text-red-500 p-1 transition-colors">
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default FreightQuotation;