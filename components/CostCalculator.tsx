
import React, { useEffect, useMemo } from 'react';

interface CostCalculatorProps {
    totalValue: number;
}

const costData = {
    operational: {
        total: 58,
        items: [
            { name: "Combustível (Diesel)", value: 30 },
            { name: "Mão de Obra (Motorista/Ajudante)", value: 11 },
            { name: "Distribuição Urbana (Last Mile)", value: 6 },
            { name: "Pedágios", value: 4 },
            { name: "Escolta / Segurança", value: 3 },
            { name: "Transporte de Contêineres (Adicional)", value: 2 },
            { name: "Seguro Carga / Transporte", value: 1 },
            { name: "Rastreamento / Monitoramento", value: 1 },
        ]
    },
    infrastructure: {
        total: 9,
        items: [
            { name: "Logística Integrada / CD e Fulfillment", value: 4 },
            { name: "Armazenagem (Geral e Alfandegada)", value: 3 },
            { name: "Gestão de Documentação", value: 2 },
        ]
    },
    taxes: {
        total: 23,
        items: [
            { name: "ICMS", value: 9 },
            { name: "PIS", value: 3 },
            { name: "COFINS", value: 3 },
            { name: "IRPJ", value: 2 },
            { name: "CSLL", value: 2 },
            { name: "ISS (Transporte municipal)", value: 2 },
            { name: "IPI (Na compra de bens)", value: 2 },
        ]
    },
    profit: {
        total: 10,
        items: [
            { name: "Lucro Operacional Líquido", value: 10 },
        ]
    }
};

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const Category: React.FC<{ title: string, total: number, items: {name: string, value: number}[], colorClass: string, totalValue: number }> = ({ title, total, items, colorClass, totalValue }) => {
    const categoryValue = (total / 100) * totalValue;

    return (
        <div className="mb-6 border border-border-color rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-bg-card">
            <div className="bg-bg-main/50 px-5 py-4 border-b border-border-color flex justify-between items-center flex-wrap gap-2">
                <div className="text-base md:text-lg font-bold text-light flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${colorClass}`}></span>
                    {title}
                </div>
                <div className="text-base font-bold bg-bg-main border border-border-color text-light px-3 py-1 rounded-md shadow-sm">
                    {total}% <span className="text-gray-text mx-1">|</span> {formatCurrency(categoryValue)}
                </div>
            </div>
            <div>
                {items.map(item => {
                    const itemValue = (item.value / 100) * totalValue;
                    return (
                        <div key={item.name} className="flex flex-col md:flex-row justify-between md:items-center px-5 py-3 border-b border-border-color last:border-b-0 hover:bg-bg-main/30 transition-colors">
                            <div className="flex-1 text-sm text-gray-300 mb-2 md:mb-0">{item.name}</div>
                            <div className="flex items-center w-full md:w-auto">
                                <div className={`font-bold text-light min-w-[40px] text-right text-xs`}>{item.value}%</div>
                                <div className="w-full md:w-32 h-2 bg-bg-main rounded-full overflow-hidden mx-3">
                                    <div className={`h-full rounded-full ${colorClass} progress-fill transition-all duration-1000 ease-out`} style={{ width: `${(item.value / total) * 100}%` }}></div>
                                </div>
                                <div className="font-mono font-semibold text-gray-text min-w-[90px] text-right text-sm">{formatCurrency(itemValue)}</div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

const ProfitAnalysis: React.FC<{ totalValue: number }> = ({ totalValue }) => {
    const profitMargin = costData.profit.total;
    const profitValue = (profitMargin / 100) * totalValue;
    
    let statusColor = 'bg-green-600';
    let statusIcon = <i className="fas fa-check-circle text-white w-6 h-6"></i>;
    let message = "A margem está dentro do esperado para sustentabilidade.";

    if (profitMargin < 5) {
        statusColor = 'bg-red-600';
        statusIcon = <i className="fas fa-times-circle text-white w-6 h-6"></i>;
        message = "A margem está muito baixa. Risco de prejuízo operacional.";
    } else if (profitMargin < 15) {
        statusColor = 'bg-yellow-600';
        statusIcon = <i className="fas fa-exclamation-triangle text-white w-6 h-6"></i>;
        message = "Margem apertada. Monitore custos extras.";
    }

    return (
        <div className={`p-6 rounded-xl text-white shadow-lg mb-8 transition-all duration-500 ${statusColor}`}>
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="text-lg font-bold flex items-center gap-2">
                        {statusIcon}
                        Análise de Saúde Financeira
                    </h4>
                    <p className="text-white/90 mt-1 text-sm">{message}</p>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-bold">{formatCurrency(profitValue)}</div>
                    <div className="text-sm font-semibold opacity-90">Lucro Líquido Estimado ({profitMargin}%)</div>
                </div>
            </div>
            <div className="w-full bg-black/20 h-3 rounded-full mt-4 overflow-hidden">
                <div className="bg-white h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(profitMargin * 3, 100)}%` }}></div>
            </div>
        </div>
    );
};

const CostCalculator: React.FC<CostCalculatorProps> = ({ totalValue = 0 }) => {
    const summaryItems = [
        { label: 'Operacional', value: costData.operational.total, color: 'bg-red-500' },
        { label: 'Impostos', value: costData.taxes.total, color: 'bg-purple-500' },
        { label: 'Infraestrutura', value: costData.infrastructure.total, color: 'bg-yellow-500' },
        { label: 'Lucro Líquido', value: costData.profit.total, color: 'bg-green-500' },
    ];

    return (
        <div id="cost-calculator-container" className="mt-4">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 bg-bg-main p-6 rounded-xl border border-border-color">
                <div className="text-left">
                    <h3 className="text-xl font-bold text-light">Estrutura de Custos</h3>
                    <p className="text-sm text-gray-text">Simulação baseada no valor total do frete calculado</p>
                </div>
                <div className="w-full md:w-auto text-right">
                    <label className="block text-xs font-bold text-gray-text mb-1 uppercase tracking-wide">Valor Total do Serviço</label>
                    <div className="text-2xl font-bold text-light">
                        {formatCurrency(totalValue)}
                    </div>
                </div>
            </div>

            <ProfitAnalysis totalValue={totalValue} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Category title="Operacional & Diretos" total={costData.operational.total} items={costData.operational.items} colorClass="bg-red-500" totalValue={totalValue} />
                <div className="space-y-6">
                    <Category title="Infraestrutura" total={costData.infrastructure.total} items={costData.infrastructure.items} colorClass="bg-yellow-500" totalValue={totalValue} />
                    <Category title="Impostos" total={costData.taxes.total} items={costData.taxes.items} colorClass="bg-purple-500" totalValue={totalValue} />
                    <Category title="Margem de Lucro" total={costData.profit.total} items={costData.profit.items} colorClass="bg-green-500" totalValue={totalValue} />
                </div>
            </div>

            <div className="mt-8 p-6 bg-bg-card border border-border-color rounded-xl shadow-lg">
                <h3 className="text-lg font-bold text-light mb-4 flex items-center gap-2">
                    <span className="w-2 h-6 bg-secondary rounded-full"></span>
                    Resumo Executivo
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {summaryItems.map(item => {
                        const itemValue = (item.value / 100) * totalValue;
                        return (
                            <div key={item.label} className="bg-bg-main p-4 rounded-lg border border-border-color">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`w-2 h-2 rounded-full ${item.color}`}></span>
                                    <span className="text-xs font-semibold text-gray-400 uppercase">{item.label}</span>
                                </div>
                                <div className="text-xl font-bold text-light">{formatCurrency(itemValue)}</div>
                                <div className="text-xs text-gray-500 mt-1">{item.value}% do total</div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};

export default CostCalculator;
