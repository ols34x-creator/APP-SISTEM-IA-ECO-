
import React, { useState, useRef, useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import { useAuth } from '../hooks/useAuth';

ChartJS.register(ArcElement, Tooltip, Legend, Title);
declare const XLSX: any;

interface RowData {
  id: string;
  description: string;
  monthlyValue: number;
  observations: string;
  category: 'fixo' | 'variavel' | 'outro';
}

const initialData: RowData[] = [
    { id: 'f1', description: 'Salários + Encargos', monthlyValue: 0, observations: 'Inclui INSS, FGTS, férias', category: 'fixo' },
    { id: 'f2', description: 'Benefícios (VA/VR, Plano Saúde)', monthlyValue: 0, observations: 'Vale alimentação/refeição', category: 'fixo' },
    { id: 'f3', description: 'Treinamentos e Desenvolvimento', monthlyValue: 0, observations: 'Cursos, certificações', category: 'fixo' },
    { id: 'f4', description: 'Aluguel do Galpão/Escritório', monthlyValue: 0, observations: 'Área: m²', category: 'fixo' },
    { id: 'f5', description: 'IPTU e Taxas Municipais', monthlyValue: 0, observations: 'Alvará, AVCB, licenças', category: 'fixo' },
    { id: 'f6', description: 'Energia Elétrica', monthlyValue: 0, observations: 'Consumo: kWh/mês', category: 'fixo' },
    { id: 'f7', description: 'Água e Esgoto', monthlyValue: 0, observations: '-', category: 'fixo' },
    { id: 'f8', description: 'Internet e Telefonia', monthlyValue: 0, observations: 'Planos corporativos', category: 'fixo' },
    { id: 'f9', description: 'Contabilidade e Assessoria', monthlyValue: 0, observations: 'Honorários mensais', category: 'fixo' },
    { id: 'f10', description: 'Softwares e Sistemas', monthlyValue: 0, observations: 'ERP, CT-e, MDF-e, Rastreador', category: 'fixo' },
    { id: 'f11', description: 'Material de Escritório', monthlyValue: 0, observations: 'Papelaria, impressos', category: 'fixo' },
    { id: 'v1', description: 'Diesel', monthlyValue: 0, observations: 'Litros/mês: ', category: 'variavel' },
    { id: 'v2', description: 'ARLA 32', monthlyValue: 0, observations: '-', category: 'variavel' },
    { id: 'v3', description: 'Óleo Lubrificante', monthlyValue: 0, observations: 'Trocas periódicas', category: 'variavel' },
    { id: 'v4', description: 'Manutenção Preventiva', monthlyValue: 0, observations: 'Revisões programadas', category: 'variavel' },
    { id: 'v5', description: 'Manutenção Corretiva', monthlyValue: 0, observations: 'Consertos e reparos', category: 'variavel' },
    { id: 'v6', description: 'Pneus e Recapagem', monthlyValue: 0, observations: 'Vida útil: km', category: 'variavel' },
    { id: 'v7', description: 'Pedágios', monthlyValue: 0, observations: 'Por viagem/km', category: 'variavel' },
    { id: 'v8', description: 'Alimentação e Hospedagem', monthlyValue: 0, observations: 'Diárias motoristas', category: 'variavel' },
    { id: 'o1', description: 'Impostos e Tributos', monthlyValue: 0, observations: 'ISS, ICMS, DIFAL', category: 'outro' },
    { id: 'o2', description: 'Taxas e Alvarás', monthlyValue: 0, observations: 'ANTT, RNTRC', category: 'outro' },
    { id: 'o3', description: 'Seguros', monthlyValue: 0, observations: 'Frota, carga, patrimonial', category: 'outro' },
];


const PlanilhaCustosTransporte: React.FC = () => {
    const { logout } = useAuth();
    const [rows, setRows] = useState<RowData[]>(initialData);
    const [faturamento, setFaturamento] = useState(150000);
    const [editingCell, setEditingCell] = useState<string | null>(null);
    const tableRef = useRef<HTMLTableElement>(null);

    const formatCurrency = (value: number) => 'R$ ' + value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const totals = useMemo(() => {
        const totalFixo = rows.filter(r => r.category === 'fixo').reduce((sum, row) => sum + row.monthlyValue, 0);
        const totalVariavel = rows.filter(r => r.category === 'variavel').reduce((sum, row) => sum + row.monthlyValue, 0);
        const totalOutros = rows.filter(r => r.category === 'outro').reduce((sum, row) => sum + row.monthlyValue, 0);
        const totalGeral = totalFixo + totalVariavel + totalOutros;
        const margem = faturamento > 0 ? ((faturamento - totalGeral) / faturamento * 100) : 0;
        return { totalFixo, totalVariavel, totalOutros, totalGeral, margem };
    }, [rows, faturamento]);

    const chartData = useMemo(() => ({
        labels: ['Custos Fixos', 'Custos Variáveis', 'Outros Custos'],
        datasets: [{
            data: [totals.totalFixo, totals.totalVariavel, totals.totalOutros],
            backgroundColor: ['#3B82F6', '#22C55E', '#EF4444'],
            borderColor: 'transparent'
        }]
    }), [totals]);
    
    const fixedCostsChartData = useMemo(() => {
        const fixedCostItems = rows.filter(r => r.category === 'fixo' && r.monthlyValue > 0);
        return {
            labels: fixedCostItems.map(r => r.description),
            datasets: [{
                data: fixedCostItems.map(r => r.monthlyValue),
                backgroundColor: [
                    '#3B82F6', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#14B8A6', '#6366F1', '#F43F5E'
                ],
                borderWidth: 0,
                hoverOffset: 4
            }]
        };
    }, [rows]);

    const handleCellChange = (id: string, field: 'monthlyValue' | 'description' | 'observations', value: string | number) => {
        setRows(prevRows => prevRows.map(row => row.id === id ? { ...row, [field]: value } : row));
    };

    const finishEdit = () => setEditingCell(null);

    const addNewRow = () => {
        const newRow: RowData = {
            id: `custom-${Date.now()}`,
            description: 'Novo Custo',
            monthlyValue: 0,
            observations: 'Descrição',
            category: 'outro'
        };
        setRows(prev => [...prev, newRow]);
    };
    
    const clearAll = () => {
        if (window.confirm('Tem certeza que deseja zerar todos os valores?')) {
            setRows(prev => prev.map(row => ({ ...row, monthlyValue: 0 })));
        }
    };

    const saveData = () => {
        try {
            localStorage.setItem('costSpreadsheetData', JSON.stringify(rows));
            alert('Dados salvos com sucesso!');
        } catch (e) {
            alert('Erro ao salvar os dados.');
        }
    };
    
    const loadData = () => {
        const savedData = localStorage.getItem('costSpreadsheetData');
        if (savedData) {
            try {
                setRows(JSON.parse(savedData));
                alert('Dados carregados com sucesso!');
            } catch (e) {
                alert('Erro ao carregar os dados salvos.');
            }
        } else {
            alert('Nenhum dado salvo encontrado.');
        }
    };
    
    const exportToExcel = () => {
        if (tableRef.current) {
            const wb = XLSX.utils.table_to_book(tableRef.current);
            XLSX.writeFile(wb, 'planilha_custos_transporte.xlsx');
        }
    };
    
    const renderRow = (row: RowData, totalGeral: number) => {
        const annualValue = row.monthlyValue * 12;
        const percentage = totalGeral > 0 ? (row.monthlyValue / totalGeral * 100) : 0;
        
        const isEditingDesc = editingCell === `${row.id}-desc`;
        const isEditingObs = editingCell === `${row.id}-obs`;

        return (
            <tr key={row.id} className="border-b border-border-color hover:bg-bg-main/50 transition-colors group">
                <td className="px-4 py-2 cursor-pointer hover:text-secondary relative" onClick={() => !isEditingDesc && setEditingCell(`${row.id}-desc`)}>
                    {isEditingDesc ? (
                        <input type="text" value={row.description}
                               onChange={(e) => handleCellChange(row.id, 'description', e.target.value)}
                               onBlur={finishEdit} autoFocus
                               className="w-full bg-bg-main border border-secondary rounded px-2 py-1 text-light focus:outline-none" />
                    ) : (
                        <div className="flex items-center gap-2">
                             {isEditingDesc ? '' : <i className="fas fa-pen text-gray-600 text-[10px] opacity-0 group-hover:opacity-100"></i>}
                             {row.description}
                        </div>
                    )}
                </td>
                <td className="px-4 py-2">
                    <input 
                        type="number" 
                        className="w-full bg-bg-main border border-border-color rounded px-2 py-1 text-light text-right focus:border-secondary focus:outline-none" 
                        value={row.monthlyValue} 
                        onChange={(e) => handleCellChange(row.id, 'monthlyValue', parseFloat(e.target.value) || 0)} 
                    />
                </td>
                <td className="px-4 py-2 text-right font-mono">{formatCurrency(annualValue)}</td>
                <td className="px-4 py-2 text-right font-mono">{percentage.toFixed(1)}%</td>
                <td className="px-4 py-2 cursor-pointer hover:text-secondary relative" onClick={() => !isEditingObs && setEditingCell(`${row.id}-obs`)}>
                    {isEditingObs ? (
                        <input type="text" value={row.observations}
                               onChange={(e) => handleCellChange(row.id, 'observations', e.target.value)}
                               onBlur={finishEdit} autoFocus
                               className="w-full bg-bg-main border border-secondary rounded px-2 py-1 text-light focus:outline-none" />
                    ) : (
                        <div className="flex items-center gap-2">
                             {isEditingObs ? '' : <i className="fas fa-pen text-gray-600 text-[10px] opacity-0 group-hover:opacity-100"></i>}
                             {row.observations}
                        </div>
                    )}
                </td>
            </tr>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Header Card */}
            <div className="bg-bg-card rounded-lg p-6 shadow-lg border-t-4 border-secondary text-center">
                <h2 className="text-3xl font-bold text-light mb-2 flex justify-center items-center gap-3">
                    <i className="fas fa-chart-bar text-secondary"></i> RESULTADO DE CUSTOS
                </h2>
                <p className="text-gray-text">Planilha Completa Editável • Cálculos Automáticos • Análise em Tempo Real</p>
            </div>

            {/* Controls Card */}
            <div className="bg-bg-card rounded-lg p-5 shadow-lg flex flex-wrap gap-4 justify-center items-center border border-border-color">
                 <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded shadow transition-all flex items-center gap-2" onClick={exportToExcel}>
                    <i className="fas fa-file-excel"></i> Exportar para Excel
                 </button>
                 <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded shadow transition-all flex items-center gap-2" onClick={addNewRow}>
                    <i className="fas fa-plus"></i> Adicionar Linha
                 </button>
                 <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded shadow transition-all flex items-center gap-2" onClick={clearAll}>
                    <i className="fas fa-trash"></i> Zerar Planilha
                 </button>
                 <div className="h-8 w-px bg-border-color mx-2 hidden md:block"></div>
                 <button className="px-4 py-2 bg-secondary hover:bg-blue-600 text-white font-bold rounded shadow transition-all flex items-center gap-2" onClick={saveData}>
                    <i className="fas fa-save"></i> Salvar Dados
                 </button>
                 <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded shadow transition-all flex items-center gap-2" onClick={loadData}>
                    <i className="fas fa-folder-open"></i> Carregar Dados
                 </button>
                 <button className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded shadow transition-all flex items-center gap-2" onClick={logout}>
                    <i className="fas fa-sign-out-alt"></i> Sair / Tela de Login
                 </button>
            </div>

            <div className="bg-secondary/10 border border-secondary/30 rounded-lg p-4 text-center text-light text-sm">
                <i className="fas fa-lightbulb text-yellow-400 mr-2"></i> 
                <strong>Dica:</strong> Clique nas células de descrição ou observações para editar o texto. Os valores são recalculados automaticamente.
            </div>

            {/* Spreadsheet Container */}
            <div className="bg-bg-card rounded-lg shadow-lg overflow-hidden border border-border-color">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-text" ref={tableRef}>
                        <thead className="text-xs text-gray-400 uppercase bg-bg-main border-b border-border-color">
                            <tr>
                                <th className="px-6 py-4 w-[40%]">DESCRIÇÃO DO CUSTO</th>
                                <th className="px-6 py-4 w-[15%] text-right">VALOR MENSAL (R$)</th>
                                <th className="px-6 py-4 w-[15%] text-right">VALOR ANUAL (R$)</th>
                                <th className="px-6 py-4 w-[10%] text-right">% DO TOTAL</th>
                                <th className="px-6 py-4 w-[20%]">OBSERVAÇÕES</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Fixed Costs Section */}
                            <tr className="bg-primary/10 border-b border-primary/20">
                                <td colSpan={5} className="px-6 py-3 font-bold text-primary"><i className="fas fa-building mr-2"></i> CUSTOS FIXOS - ESTRUTURA E ADMINISTRAÇÃO</td>
                            </tr>
                            <tr className="bg-bg-main/30"><td colSpan={5} className="px-6 py-2 text-xs font-semibold text-secondary uppercase tracking-wider">👥 Pessoal Administrativo</td></tr>
                            {rows.filter(r => r.category === 'fixo').slice(0, 3).map(row => renderRow(row, totals.totalGeral))}
                            
                            <tr className="bg-bg-main/30"><td colSpan={5} className="px-6 py-2 text-xs font-semibold text-secondary uppercase tracking-wider">🏭 Estrutura Física</td></tr>
                             {rows.filter(r => r.category === 'fixo').slice(3, 8).map(row => renderRow(row, totals.totalGeral))}
                            
                            <tr className="bg-bg-main/30"><td colSpan={5} className="px-6 py-2 text-xs font-semibold text-secondary uppercase tracking-wider">💻 Custos Administrativos</td></tr>
                            {rows.filter(r => r.category === 'fixo').slice(8).map(row => renderRow(row, totals.totalGeral))}

                            <tr className="bg-green-900/20 font-bold text-green-400 border-y border-green-900/50">
                                <td className="px-6 py-3">TOTAL CUSTOS FIXOS</td>
                                <td className="px-6 py-3 text-right">{formatCurrency(totals.totalFixo)}</td>
                                <td className="px-6 py-3 text-right">{formatCurrency(totals.totalFixo * 12)}</td>
                                <td className="px-6 py-3 text-right">{totals.totalGeral > 0 ? ((totals.totalFixo / totals.totalGeral) * 100).toFixed(1) + '%' : '0%'}</td>
                                <td className="px-6 py-3 text-center">-</td>
                            </tr>

                            {/* Variable Costs Section */}
                            <tr className="bg-primary/10 border-b border-primary/20 mt-4">
                                <td colSpan={5} className="px-6 py-3 font-bold text-primary"><i className="fas fa-truck mr-2"></i> CUSTOS VARIÁVEIS - OPERAÇÃO E FROTA</td>
                            </tr>
                            <tr className="bg-bg-main/30"><td colSpan={5} className="px-6 py-2 text-xs font-semibold text-secondary uppercase tracking-wider">⛽ Combustíveis e Lubrificantes</td></tr>
                            {rows.filter(r => r.category === 'variavel').slice(0, 3).map(row => renderRow(row, totals.totalGeral))}
                            
                            <tr className="bg-bg-main/30"><td colSpan={5} className="px-6 py-2 text-xs font-semibold text-secondary uppercase tracking-wider">🔧 Manutenção da Frota</td></tr>
                            {rows.filter(r => r.category === 'variavel').slice(3, 6).map(row => renderRow(row, totals.totalGeral))}
                            
                            <tr className="bg-bg-main/30"><td colSpan={5} className="px-6 py-2 text-xs font-semibold text-secondary uppercase tracking-wider">🛣️ Custos de Viagem</td></tr>
                            {rows.filter(r => r.category === 'variavel').slice(6).map(row => renderRow(row, totals.totalGeral))}

                            <tr className="bg-green-900/20 font-bold text-green-400 border-y border-green-900/50">
                                <td className="px-6 py-3">TOTAL CUSTOS VARIÁVEIS</td>
                                <td className="px-6 py-3 text-right">{formatCurrency(totals.totalVariavel)}</td>
                                <td className="px-6 py-3 text-right">{formatCurrency(totals.totalVariavel * 12)}</td>
                                <td className="px-6 py-3 text-right">{totals.totalGeral > 0 ? ((totals.totalVariavel / totals.totalGeral) * 100).toFixed(1) + '%' : '0%'}</td>
                                <td className="px-6 py-3 text-center">-</td>
                            </tr>
                            
                            {/* Other Costs Section */}
                            <tr className="bg-primary/10 border-b border-primary/20">
                                <td colSpan={5} className="px-6 py-3 font-bold text-primary"><i className="fas fa-file-invoice-dollar mr-2"></i> OUTROS CUSTOS</td>
                            </tr>
                            {rows.filter(r => r.category === 'outro').map(row => renderRow(row, totals.totalGeral))}

                            {/* Grand Total */}
                            <tr className="bg-red-900/20 font-bold text-red-400 border-t-2 border-red-900/50 text-lg">
                                <td className="px-6 py-4">TOTAL GERAL DE CUSTOS</td>
                                <td className="px-6 py-4 text-right">{formatCurrency(totals.totalGeral)}</td>
                                <td className="px-6 py-4 text-right">{formatCurrency(totals.totalGeral * 12)}</td>
                                <td className="px-6 py-4 text-right">100%</td>
                                <td className="px-6 py-4 text-center">-</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Dashboard / Metrics Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-bg-card p-6 rounded-lg shadow-lg border border-border-color text-center">
                    <div className="text-gray-text text-sm uppercase font-semibold">Custo Fixo Mensal</div>
                    <div className="text-3xl font-bold text-light my-2">{formatCurrency(totals.totalFixo)}</div>
                    <div className="text-xs text-secondary">{totals.totalGeral > 0 ? ((totals.totalFixo / totals.totalGeral) * 100).toFixed(1) : 0}% do total</div>
                </div>
                <div className="bg-bg-card p-6 rounded-lg shadow-lg border border-border-color text-center">
                    <div className="text-gray-text text-sm uppercase font-semibold">Custo Variável Mensal</div>
                    <div className="text-3xl font-bold text-light my-2">{formatCurrency(totals.totalVariavel)}</div>
                    <div className="text-xs text-secondary">{totals.totalGeral > 0 ? ((totals.totalVariavel / totals.totalGeral) * 100).toFixed(1) : 0}% do total</div>
                </div>
                <div className="bg-bg-card p-6 rounded-lg shadow-lg border border-border-color text-center">
                    <div className="text-gray-text text-sm uppercase font-semibold">Custo Total Anual</div>
                    <div className="text-3xl font-bold text-light my-2">{formatCurrency(totals.totalGeral * 12)}</div>
                    <div className="text-xs text-gray-text">Projeção 12 meses</div>
                </div>
                <div className="bg-bg-card p-6 rounded-lg shadow-lg border border-border-color text-center">
                    <div className="text-gray-text text-sm uppercase font-semibold">Margem Operacional</div>
                    <div className={`text-3xl font-bold my-2 ${totals.margem >= 0 ? 'text-green-400' : 'text-red-400'}`}>{totals.margem.toFixed(1)}%</div>
                    <div className="text-xs text-gray-text">(com faturamento {formatCurrency(faturamento)})</div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-bg-card p-6 rounded-lg shadow-lg border border-border-color">
                    <h3 className="text-center font-bold text-lg mb-4 text-light">Distribuição Geral de Custos</h3>
                    <div className="h-80">
                        <Doughnut data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#94A3B8' } }}}} />
                    </div>
                </div>
                <div className="bg-bg-card p-6 rounded-lg shadow-lg border border-border-color">
                    <h3 className="text-center font-bold text-lg mb-4 text-light">Distribuição Percentual de Custos Fixos</h3>
                    <div className="h-80">
                        <Doughnut data={fixedCostsChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#94A3B8' } }}}} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlanilhaCustosTransporte;
