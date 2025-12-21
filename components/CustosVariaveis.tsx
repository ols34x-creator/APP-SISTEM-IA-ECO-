
import React, { useMemo, useState } from 'react';
import { useAppStore } from '../hooks/useAppStore';
import { FinancialRecord, RecordType } from '../types';
import { GoogleGenAI } from "@google/genai";
import CostFormModal from './CostFormModal';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartEvent, ActiveElement } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Date(date.getTime() + date.getTimezoneOffset() * 60000).toLocaleDateString('pt-BR');
};

const variableCostCategories = [
    "Frota", 
    "Equipamentos", 
    "Reembolsos", 
    "Gente", 
    "Licenciamento",
    "Multas",
    "Despesas bancárias",
    "Combustível",
    "Manutenção",
    "Pedágios",
    "Outros"
];

const TableCard: React.FC<{ title: string; children: React.ReactNode; actions?: React.ReactNode }> = ({ title, children, actions }) => (
    <div className="bg-bg-card rounded-lg p-5 shadow-lg mb-5 overflow-x-auto">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-light">{title}</h3>
            <div>{actions}</div>
        </div>
        <div>{children}</div>
    </div>
);

const CustosVariaveis: React.FC = () => {
    const { financialData, deleteRecord, addRecord, logAction } = useAppStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const chartData = useMemo(() => {
        const costs = financialData.variableCosts;
        const categoryTotals: Record<string, number> = {};
        
        costs.forEach(item => {
            const cat = item.category || 'Outros';
            categoryTotals[cat] = (categoryTotals[cat] || 0) + item.value;
        });

        const sortedCategories = Object.entries(categoryTotals)
            .sort(([, a], [, b]) => b - a);

        return {
            labels: sortedCategories.map(([cat]) => cat),
            datasets: [{
                data: sortedCategories.map(([, val]) => val),
                backgroundColor: [
                    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
                    '#8B5CF6', '#EC4899', '#06B6D4', '#6366F1', 
                    '#84CC16', '#F97316', '#14B8A6', '#D946EF'
                ],
                borderColor: 'rgba(30, 41, 59, 0.5)',
                borderWidth: 1,
            }],
            topCosts: sortedCategories.slice(0, 5)
        };
    }, [financialData.variableCosts]);

    const filteredData = useMemo(() => {
        let data = financialData.variableCosts;
        if (selectedCategory) data = data.filter(item => item.category === selectedCategory);
        if (!searchTerm) return data;
        const lowercasedFilter = searchTerm.toLowerCase();
        return data.filter(item =>
            item.name.toLowerCase().includes(lowercasedFilter) ||
            item.description.toLowerCase().includes(lowercasedFilter)
        );
    }, [financialData.variableCosts, searchTerm, selectedCategory]);

    const handleDelete = (id: number) => {
        if (window.confirm('Tem certeza que deseja excluir este registro?')) {
            deleteRecord('variableCosts', id);
        }
    };

    const handleSave = (records: any[]) => {
        records.forEach(record => {
            addRecord('variable-cost', record);
        });
        logAction(`${records.length} custo(s) variável(is) adicionado(s) em lote.`);
    };
    
    const exportToCSV = (data: any[], filename: string) => {
        if (data.length === 0) { alert("Não há dados para exportar."); return; }
        const headers = Object.keys(data[0]);
        const csvContent = [ headers.join(','), ...data.map(row => headers.map(header => { let cell = row[header] === null || row[header] === undefined ? '' : String(row[header]); cell = cell.replace(/"/g, '""'); if (cell.search(/("|,|\n)/g) >= 0) { cell = `"${cell}"`; } return cell; }).join(',')) ].join('\n');
        const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        logAction(`Exported ${filename}`);
    };

    const handleAiAnalysis = async () => {
        if (!process.env.API_KEY) { alert("Chave de API não configurada."); return; }
        setIsAnalyzing(true);
        setAiAnalysis(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const dataSummary = JSON.stringify(filteredData.map(d => ({ category: d.category, value: d.value, description: d.description, date: d.date })));
            const prompt = `Analise os seguintes dados de custos VARIÁVEIS de uma empresa de logística: ${dataSummary}. Forneça diagnóstico e sugestões em Markdown.`;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            setAiAnalysis(response.text);
        } catch (error) {
            console.error("Erro na análise de IA:", error);
            alert("Erro ao gerar análise. Tente novamente.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div>
             <CostFormModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSave={handleSave} 
                title="Lançamento em Lote: Custos Variáveis"
                categories={variableCostCategories}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2 bg-bg-card rounded-lg p-5 shadow-lg border border-border-color">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-light flex items-center gap-2">
                            <i className="fas fa-chart-pie text-primary"></i> Distribuição de Custos Variáveis
                        </h3>
                    </div>
                    <div className="h-64 relative flex justify-center">
                        {chartData.datasets[0].data.length > 0 ? (
                            <Doughnut data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: '#94A3B8', boxWidth: 12, padding: 15 } } }}} />
                        ) : (
                            <div className="flex items-center justify-center text-gray-text italic">Sem dados para exibir</div>
                        )}
                    </div>
                </div>
                <div className="bg-bg-card rounded-lg p-5 shadow-lg border border-border-color">
                    <h3 className="text-lg font-semibold text-light mb-4 flex items-center gap-2"><i className="fas fa-list-ol text-secondary"></i> Top 5</h3>
                    <div className="space-y-3">
                        {chartData.topCosts.map(([cat, val], idx) => (
                            <div key={idx} className="flex justify-between items-center p-2 bg-bg-main rounded border-l-4" style={{ borderLeftColor: chartData.datasets[0].backgroundColor[idx % 12] }}>
                                <span className="text-sm text-light font-medium truncate mr-2">{cat}</span>
                                <span className="text-sm font-bold text-gray-text">{formatCurrency(val)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mb-4 relative">
                <input type="text" placeholder="Pesquisar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-bg-card border border-border-color rounded-md py-2 pl-10 pr-4 text-light focus:outline-none focus:ring-2 focus:ring-secondary" />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><i className="fas fa-search text-gray-text"></i></div>
            </div>

            <TableCard 
                title="Tabela de Custos Variáveis"
                actions={
                    <div className="flex gap-2">
                         <button onClick={() => setIsModalOpen(true)} className="px-3 py-1 bg-primary text-white text-xs font-semibold rounded-md hover:bg-opacity-90 flex items-center gap-1 shadow-md">
                            <i className="fas fa-plus mr-1"></i> Adicionar Lote
                        </button>
                        <button onClick={() => exportToCSV(filteredData, 'custos_variaveis.csv')} className="px-3 py-1 bg-secondary text-white text-xs font-semibold rounded-md hover:bg-opacity-90 flex items-center gap-1 shadow-md">
                            <i className="fas fa-file-csv mr-1"></i> Exportar
                        </button>
                    </div>
                }
            >
                <table className="w-full text-sm text-left text-gray-text">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-700">
                        <tr>
                            <th className="px-6 py-3">Nome</th>
                            <th className="px-6 py-3">Categoria</th>
                            <th className="px-6 py-3">Valor</th>
                            <th className="px-6 py-3">Data</th>
                            <th className="px-6 py-3">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map((item: FinancialRecord) => (
                            <tr key={item.id} className="bg-bg-card border-b border-border-color hover:bg-border-color">
                                <td className="px-6 py-4">{item.name}</td>
                                <td className="px-6 py-4">{item.category}</td>
                                <td className="px-6 py-4">{formatCurrency(item.value)}</td>
                                <td className="px-6 py-4">{formatDate(item.date)}</td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-400"><i className="fas fa-trash"></i></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </TableCard>
        </div>
    );
};

export default CustosVariaveis;
