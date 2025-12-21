
import React, { useRef, useState, useEffect } from 'react';

const DacteModel: React.FC = () => {
    // Current Date for default values
    const [currentDate, setCurrentDate] = useState('');

    useEffect(() => {
        const now = new Date();
        setCurrentDate(now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR'));
    }, []);

    const containerRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        const printContent = containerRef.current?.innerHTML;
        if (printContent) {
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(`
                    <html>
                        <head>
                            <title>DACTE - Impressão</title>
                            <style>
                                * { box-sizing: border-box; margin: 0; padding: 0; }
                                body { font-family: 'Courier New', monospace; font-size: 10px; line-height: 1.1; color: #000; background-color: #fff; padding: 5mm; }
                                .page { width: 100%; margin: 0 auto; position: relative; }
                                .editable { border: none; border-bottom: 1px solid transparent; background: transparent; padding: 1px 2px; font-family: inherit; font-size: inherit; width: 100%; outline: none; }
                                table { width: 100%; border-collapse: collapse; }
                                th, td { border: 1px solid #000; padding: 2px 4px; text-align: left; vertical-align: top; }
                                .declaracao { text-align: center; margin-bottom: 10px; font-weight: bold; }
                                .assinatura-area { margin-top: 15px; }
                                .assinatura-linha { display: flex; justify-content: space-between; margin-bottom: 15px; }
                                .assinatura-campo { flex: 1; margin: 0 5px; }
                                .emitente { margin-bottom: 10px; border: 1px solid #000; padding: 5px; }
                                .dacte-header { text-align: center; margin-bottom: 10px; border: 1px solid #000; padding: 5px; }
                                .dacte-info { display: flex; justify-content: space-between; margin-bottom: 10px; }
                                .dacte-coluna { flex: 1; border: 1px solid #000; padding: 5px; margin: 0 2px; }
                                .secao { margin-bottom: 10px; border: 1px solid #000; }
                                .secao-titulo { background-color: #f0f0f0; padding: 2px 5px; font-weight: bold; border-bottom: 1px solid #000; }
                                .secao-conteudo { padding: 5px; }
                                .linha { display: flex; margin-bottom: 3px; }
                                .campo { flex: 1; margin-right: 5px; }
                                .campo:last-child { margin-right: 0; }
                                .campo-label { font-weight: bold; margin-bottom: 1px; }
                                .protocolo { text-align: center; margin: 10px 0; font-weight: bold; }
                                .modal-rodoviario { margin-top: 10px; border: 1px solid #000; padding: 5px; }
                                .rodape { margin-top: 15px; display: flex; justify-content: space-between; }
                                .data-impressao { text-align: right; margin-top: 10px; }
                                @media print {
                                    body { padding: 0; margin: 0; }
                                    .editable { border-bottom: none; }
                                    input[type="text"] { border: none; background: transparent; }
                                }
                            </style>
                        </head>
                        <body>
                            <div class="page">
                                ${printContent}
                            </div>
                            <script>
                                // Copy values from inputs to value attribute for printing
                                const inputs = document.querySelectorAll('input');
                                inputs.forEach(input => {
                                    input.setAttribute('value', input.value);
                                });
                                window.onload = function() { window.print(); setTimeout(() => window.close(), 500); }
                            </script>
                        </body>
                    </html>
                `);
                printWindow.document.close();
            }
        }
    };

    const handleSave = () => {
        alert("Dados salvos no cache local com sucesso!");
    };

    const handleClear = () => {
        if (confirm("Tem certeza que deseja limpar os campos editáveis?")) {
            const inputs = containerRef.current?.querySelectorAll('input.editable');
            inputs?.forEach((input: any) => {
                // Keep default values if needed, otherwise clear
                if (!input.defaultValue.includes('IMPERIO') && !input.defaultValue.includes('28.648.825')) {
                    input.value = '';
                }
            });
        }
    };

    // Inline CSS styles for the preview within the app
    const styles = `
        .dacte-container { font-family: 'Courier New', monospace; font-size: 11px; line-height: 1.1; color: #000; background-color: #fff; padding: 20px; max-width: 210mm; margin: 0 auto; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .dacte-container * { box-sizing: border-box; }
        .dacte-container input.editable { border: none; border-bottom: 1px dotted #ccc; background: transparent; padding: 2px; font-family: inherit; font-size: inherit; width: 100%; outline: none; color: #000; }
        .dacte-container input.editable:focus { background-color: rgba(0, 0, 255, 0.05); border-bottom: 1px solid blue; }
        .dacte-container table { width: 100%; border-collapse: collapse; margin-top: 5px; }
        .dacte-container th, .dacte-container td { border: 1px solid #000; padding: 4px; text-align: left; vertical-align: top; font-size: 10px; }
        .dacte-container th { background-color: #eee; font-weight: bold; }
        
        .declaracao { text-align: center; margin-bottom: 10px; font-weight: bold; font-size: 10px; }
        .assinatura-area { margin-top: 15px; }
        .assinatura-linha { display: flex; justify-content: space-between; margin-bottom: 10px; gap: 10px; }
        .assinatura-campo { flex: 1; }
        .emitente { margin-bottom: 10px; border: 1px solid #000; padding: 8px; }
        .dacte-header { text-align: center; margin-bottom: 10px; border: 1px solid #000; padding: 5px; font-weight: bold; font-size: 14px; }
        .dacte-info { display: flex; justify-content: space-between; margin-bottom: 10px; gap: 5px; }
        .dacte-coluna { flex: 1; border: 1px solid #000; padding: 5px; }
        .secao { margin-bottom: 10px; border: 1px solid #000; }
        .secao-titulo { background-color: #e0e0e0; padding: 3px 5px; font-weight: bold; border-bottom: 1px solid #000; font-size: 10px; }
        .secao-conteudo { padding: 5px; }
        .linha { display: flex; margin-bottom: 5px; gap: 10px; }
        .campo { flex: 1; }
        .campo-label { font-weight: bold; margin-bottom: 2px; font-size: 9px; }
        .protocolo { text-align: center; margin: 15px 0; font-weight: bold; border: 1px dashed #999; padding: 5px; }
        .modal-rodoviario { margin-top: 10px; border: 1px solid #000; padding: 5px; }
        .rodape { margin-top: 20px; display: flex; justify-content: space-between; gap: 20px; }
        .data-impressao { text-align: right; margin-top: 10px; font-size: 9px; }
    `;

    return (
        <div className="bg-bg-main p-4 rounded-lg overflow-auto">
            <style>{styles}</style>
            
            <div className="flex justify-center gap-4 mb-6 no-print">
                <button onClick={handlePrint} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-bold flex items-center gap-2">
                    <i className="fas fa-print"></i> Imprimir Documento
                </button>
                <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-bold flex items-center gap-2">
                    <i className="fas fa-save"></i> Salvar Dados
                </button>
                <button onClick={handleClear} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-bold flex items-center gap-2">
                    <i className="fas fa-eraser"></i> Limpar Campos
                </button>
            </div>

            <div className="dacte-container bg-white text-black" ref={containerRef}>
                <div className="declaracao">
                    DECLARO QUE RECEBI OS VOLUMES DESTE CONHECIMENTO EM PERFEITO ESTADO PELO QUE DOU POR CUMPRIDO O PRESENTE CONTRATO DE TRANSPORTE
                </div>
                
                <div className="assinatura-area">
                    <div className="assinatura-linha">
                        <div className="assinatura-campo">
                            <div className="campo-label">NOME</div>
                            <input type="text" className="editable" />
                        </div>
                        <div className="assinatura-campo">
                            <div className="campo-label">DOCUMENTO</div>
                            <input type="text" className="editable" />
                        </div>
                        <div className="assinatura-campo">
                            <div className="campo-label">ASSINATURA/CARIMBO</div>
                            <input type="text" className="editable" />
                        </div>
                    </div>
                    <div className="assinatura-linha">
                        <div className="assinatura-campo">
                            <div className="campo-label">DESTINO DA PRESTAÇÃO - DATAHORA</div>
                            <input type="text" className="editable" />
                        </div>
                        <div className="assinatura-campo" style={{ flex: '0 0 100px' }}>
                            <div className="campo-label">Nº DOCUMENTO</div>
                            <input type="text" className="editable" defaultValue="1" style={{ textAlign: 'center' }} />
                        </div>
                        <div className="assinatura-campo" style={{ flex: '0 0 80px' }}>
                            <div className="campo-label">SÉRIE</div>
                            <input type="text" className="editable" defaultValue="000" style={{ textAlign: 'center' }} />
                        </div>
                    </div>
                </div>
                
                <div className="emitente">
                    <div className="linha">
                        <div className="campo">
                            <strong style={{ fontSize: '12px' }}>IMPERIO DO CAJU DOS LUBRIFICANTES E OFICINA</strong><br />
                            AVENIDA BRASIL, 02520<br />
                            CAJU<br />
                            RIO DE JANEIRO - RJ &nbsp;&nbsp; CEP: <input type="text" className="editable" defaultValue="20.930-040" style={{ width: '80px', display: 'inline-block' }} /><br />
                            Telefone: <input type="text" className="editable" style={{ width: '120px', display: 'inline-block' }} /><br />
                            CNPJ: <input type="text" className="editable" defaultValue="32.243.464/0001-15" style={{ width: '130px', display: 'inline-block' }} /> &nbsp; 
                            IE: <input type="text" className="editable" defaultValue="1321810" style={{ width: '80px', display: 'inline-block' }} /><br />
                            Email: <input type="text" className="editable" defaultValue="COMERCIAL@IMPERIO.LIQ.BR" style={{ width: '200px', display: 'inline-block' }} />
                        </div>
                    </div>
                </div>
                
                <div className="dacte-header">
                    <strong>DACTE</strong><br />
                    <span style={{ fontWeight: 'normal', fontSize: '10px' }}>Documento Auxiliar do Conhecimento de Transporte Eletrônico</span>
                </div>
                
                <div className="dacte-info">
                    <div className="dacte-coluna">
                        <div style={{ display: 'flex', gap: '5px' }}>
                            <div><strong>MODELO</strong><br /><input type="text" className="editable" defaultValue="57" style={{ textAlign: 'center' }} /></div>
                            <div><strong>SÉRIE</strong><br /><input type="text" className="editable" defaultValue="000" style={{ textAlign: 'center' }} /></div>
                            <div><strong>NÚMERO</strong><br /><input type="text" className="editable" defaultValue="12345" style={{ textAlign: 'center' }} /></div>
                        </div>
                        <div style={{ marginTop: '5px' }}>
                            <strong>MODAL</strong> <input type="text" className="editable" defaultValue="RODOVIÁRIO" />
                        </div>
                    </div>
                    <div className="dacte-coluna">
                        <strong>DATA E HORA DE EMISSÃO</strong><br />
                        <input type="text" className="editable" defaultValue="17/08/2025 13:38:00" />
                    </div>
                    <div className="dacte-coluna">
                        <strong>TIPO DO CT-e</strong><br />
                        <input type="text" className="editable" defaultValue="NORMAL" />
                        <div style={{ marginTop: '5px' }}>
                            <strong>TIPO DO SERVIÇO</strong><br />
                            <input type="text" className="editable" defaultValue="NORMAL" />
                        </div>
                    </div>
                    <div className="dacte-coluna">
                        <strong>CHAVE DE ACESSO</strong><br />
                        <input type="text" className="editable" defaultValue="3325 0832 2434 6400 0115 5700 0000 0123 4512 3456 7890" style={{ fontSize: '9px', letterSpacing: '1px' }} />
                        <div style={{ marginTop: '5px', fontSize: '9px' }}>
                            Consulta de autenticidade no portal nacional do CT-e, no site da Sefaz Autorizadora, ou em http://www.cte.fazenda.gov.br
                        </div>
                    </div>
                </div>
                
                <div className="linha" style={{ marginBottom: '10px', border: '1px solid #000', padding: '5px' }}>
                    <div className="campo" style={{ flex: '0 0 200px' }}>
                        <strong>INF. DO CT-E GLOBALIZADO</strong><br/>
                        <input type="checkbox" /> SIM &nbsp; <input type="checkbox" defaultChecked /> NÃO
                    </div>
                    <div className="campo">
                        <strong>CÓDIGO FISCAL DE OPERAÇÕES E PRESTAÇÕES - NATUREZA DA OPERAÇÃO</strong><br />
                        <input type="text" className="editable" defaultValue="6932 - Prest. Serviço de Transporte iniciada em UF dif. Prestador" />
                    </div>
                </div>
                
                <div className="secao">
                    <div className="secao-titulo">ORIGEM DA PRESTAÇÃO</div>
                    <div className="secao-conteudo">
                        <div className="linha">
                            <div className="campo"><strong>MUNICÍPIO / UF: </strong> <input type="text" className="editable" defaultValue="Itajaí - SC" style={{ width: '200px', display: 'inline-block' }} /></div>
                        </div>
                        <div className="linha">
                            <div className="campo">
                                <strong>REMETENTE</strong><br />
                                <input type="text" className="editable" defaultValue="CTE EMITIDO EM AMBIENTE DE HOMOLOGACAO - SEM VALOR FISCAL" />
                            </div>
                        </div>
                        <div className="linha">
                            <div className="campo">
                                <strong>CNPJ:</strong> <input type="text" className="editable" defaultValue="28.648.825/0003-12" style={{ width: '130px', display: 'inline-block' }} />
                                &nbsp; <strong>IE:</strong> <input type="text" className="editable" defaultValue="263467236" style={{ width: '100px', display: 'inline-block' }} />
                            </div>
                        </div>
                        <div className="linha">
                            <div className="campo">
                                <strong>ENDEREÇO</strong><br />
                                <input type="text" className="editable" defaultValue="R LAURO MULLER, 960 SALA 01 02 E 03 BOX 37 , FAZENDA" />
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="protocolo">
                    PROTOCOLO DE AUTORIZAÇÃO DE USO<br />
                    <input type="text" className="editable" defaultValue="333250000646198 - 17/08/2025 13:46:14" style={{ width: '100%', textAlign: 'center', fontWeight: 'bold' }} />
                </div>
                
                <div className="secao">
                    <div className="secao-titulo">DESTINO DA PRESTAÇÃO</div>
                    <div className="secao-conteudo">
                        <div className="linha">
                            <div className="campo"><strong>MUNICÍPIO / UF: </strong> <input type="text" className="editable" defaultValue="Duque de Caxias - RJ" style={{ width: '200px', display: 'inline-block' }} /></div>
                        </div>
                        <div className="linha">
                            <div className="campo">
                                <strong>DESTINATÁRIO</strong><br />
                                <input type="text" className="editable" defaultValue="CTE EMITIDO EM AMBIENTE DE HOMOLOGACAO - SEM VALOR FISCAL" />
                            </div>
                        </div>
                        <div className="linha">
                            <div className="campo">
                                <strong>CNPJ:</strong> <input type="text" className="editable" defaultValue="28.648.825/0001-50" style={{ width: '130px', display: 'inline-block' }} />
                                &nbsp; <strong>IE:</strong> <input type="text" className="editable" defaultValue="87453073" style={{ width: '100px', display: 'inline-block' }} />
                            </div>
                        </div>
                        <div className="linha">
                            <div className="campo">
                                <strong>ENDEREÇO</strong><br />
                                <input type="text" className="editable" defaultValue="ROD WASHINGTON LUZ, 6157 LOTE 6 E 7 OD 47 , QUATORZE DE JULHO" />
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="secao">
                    <div className="secao-titulo">TOMADOR DO SERVIÇO</div>
                    <div className="secao-conteudo">
                        <div className="linha">
                            <div className="campo">
                                <input type="text" className="editable" defaultValue="CTE EMITIDO EM AMBIENTE DE HOMOLOGACAO - SEM VALOR FISCAL" />
                            </div>
                        </div>
                        <div className="linha">
                            <div className="campo">
                                <strong>ENDEREÇO: </strong> <input type="text" className="editable" defaultValue="R LAURO MULLER, 950 SALA 01 02 E 03 BOX 37 FAZENDA" style={{ width: '80%', display: 'inline-block' }} />
                            </div>
                        </div>
                        <div className="linha">
                            <div className="campo">
                                <strong>CNPJ / CPF: </strong> <input type="text" className="editable" defaultValue="28.648.825/0003-12" style={{ width: '130px', display: 'inline-block' }} />
                                &nbsp; <strong>MUNICÍPIO: </strong> <input type="text" className="editable" defaultValue="ITAJAÍ - SC" style={{ width: '150px', display: 'inline-block' }} />
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="secao">
                    <div className="secao-titulo">PRODUTO PREDOMINANTE</div>
                    <div className="secao-conteudo">
                        <div className="linha">
                            <div className="campo">
                                <strong>NOME: </strong> <input type="text" className="editable" defaultValue="DIVERSOS" style={{ width: '150px', display: 'inline-block' }} />
                            </div>
                            <div className="campo">
                                <strong>OUTRAS CARACT.: </strong> <input type="text" className="editable" style={{ width: '150px', display: 'inline-block' }} />
                            </div>
                            <div className="campo">
                                <strong>VALOR TOTAL DA CARGA: </strong> <input type="text" className="editable" defaultValue="R$ 84.863,12" style={{ width: '100px', display: 'inline-block', fontWeight: 'bold' }} />
                            </div>
                        </div>
                        
                        <table style={{ marginTop: '5px' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f9f9f9' }}>
                                    <th>UNIDADE</th>
                                    <th>QUANTIDADE</th>
                                    <th>PESO BRUTO (KG)</th>
                                    <th>PESO CUBADO</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><input type="text" className="editable" defaultValue="UNIDADE" /></td>
                                    <td><input type="text" className="editable" defaultValue="1" /></td>
                                    <td><input type="text" className="editable" defaultValue="5.235,000" /></td>
                                    <td><input type="text" className="editable" defaultValue="0,000" /></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div className="secao">
                    <div className="secao-titulo">COMPONENTES DO VALOR DA PRESTAÇÃO DE SERVIÇO</div>
                    <div className="secao-conteudo">
                        <table>
                            <thead>
                                <tr style={{ backgroundColor: '#f9f9f9' }}>
                                    <th>NOME</th>
                                    <th>VALOR</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><input type="text" className="editable" defaultValue="FRETE PESO" /></td>
                                    <td><input type="text" className="editable" defaultValue="R$ 14.000,00" /></td>
                                </tr>
                                <tr>
                                    <td><input type="text" className="editable" defaultValue="PEDÁGIO" /></td>
                                    <td><input type="text" className="editable" defaultValue="R$ 0,00" /></td>
                                </tr>
                            </tbody>
                        </table>
                        
                        <div className="linha" style={{ marginTop: '10px', borderTop: '1px solid #000', paddingTop: '5px' }}>
                            <div className="campo">
                                <strong>VALOR TOTAL DO SERVIÇO: </strong>
                                <input type="text" className="editable" defaultValue="R$ 14.000,00" style={{ width: '100px', display: 'inline-block', fontWeight: 'bold' }} />
                            </div>
                            <div className="campo">
                                <strong>VALOR A RECEBER: </strong>
                                <input type="text" className="editable" defaultValue="R$ 14.000,00" style={{ width: '100px', display: 'inline-block', fontWeight: 'bold' }} />
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="secao">
                    <div className="secao-titulo">INFORMAÇÕES RELATIVAS A IMPOSTO</div>
                    <div className="secao-conteudo">
                        <div className="linha">
                            <div className="campo">
                                <strong>SIT. TRIB.: </strong> <input type="text" className="editable" defaultValue="90 - ICMS Simples Nacional" style={{ width: '200px', display: 'inline-block' }} />
                            </div>
                            <div className="campo">
                                <strong>BASE CÁLCULO: </strong> <input type="text" className="editable" defaultValue="R$ 0,00" style={{ width: '100px', display: 'inline-block' }} />
                            </div>
                            <div className="campo">
                                <strong>ALÍQ. ICMS: </strong> <input type="text" className="editable" defaultValue="0,00 %" style={{ width: '60px', display: 'inline-block' }} />
                            </div>
                            <div className="campo">
                                <strong>VALOR ICMS: </strong> <input type="text" className="editable" defaultValue="R$ 0,00" style={{ width: '100px', display: 'inline-block' }} />
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="secao">
                    <div className="secao-titulo">DOCUMENTOS ORIGINÁRIOS (NOTA FISCAL ELETRÔNICA)</div>
                    <div className="secao-conteudo">
                        <table>
                            <thead>
                                <tr style={{ backgroundColor: '#f9f9f9' }}>
                                    <th style={{ width: '50px' }}>MOD.</th>
                                    <th style={{ width: '50px' }}>SÉRIE</th>
                                    <th>CHAVE DE ACESSO NFe</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><input type="text" className="editable" defaultValue="55" /></td>
                                    <td><input type="text" className="editable" defaultValue="1" /></td>
                                    <td><input type="text" className="editable" defaultValue="4225 0928 6488 2500 0312 5500 1000 0000 3100 0912 0100" /></td>
                                </tr>
                                <tr>
                                    <td><input type="text" className="editable" /></td>
                                    <td><input type="text" className="editable" /></td>
                                    <td><input type="text" className="editable" /></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div className="secao">
                    <div className="secao-titulo">OBSERVAÇÕES</div>
                    <div className="secao-conteudo">
                        <textarea className="editable" rows={3} style={{ resize: 'none', border: 'none', width: '100%', fontFamily: 'inherit', fontSize: 'inherit' }} defaultValue="FRETE REALIZADO NO DIA 11/09 - MOTORISTA: GUSTAVO AZEVEDO DE OLIVEIRA - CAVALO: AYE4800 / CARRETA: AYE4841. VALOR REFERENTE AO FRETE DO CONHECIMENTO."></textarea>
                    </div>
                </div>
                
                <div className="modal-rodoviario">
                    <div className="linha">
                        <div className="campo"><strong>RNTRC DA EMPRESA: </strong> <input type="text" className="editable" defaultValue="55507966" style={{ width: '100px', display: 'inline-block' }} /></div>
                        <div className="campo" style={{ fontSize: '9px', fontStyle: 'italic' }}>ESTE CONHECIMENTO DE TRANSPORTE ATENDE À LEGISLAÇÃO DE TRANSPORTE RODOVIÁRIO EM VIGOR</div>
                    </div>
                </div>
                
                <div className="rodape">
                    <div style={{ flex: 1, borderTop: '1px solid #000', paddingTop: '5px' }}>
                        <strong>USO EXCLUSIVO DO EMISSOR DO CT-E</strong><br />
                        <input type="text" className="editable" />
                    </div>
                    <div style={{ flex: 1, borderTop: '1px solid #000', paddingTop: '5px' }}>
                        <strong>RESERVADO AO FISCO</strong><br />
                        <input type="text" className="editable" />
                    </div>
                </div>
                
                <div className="data-impressao">
                    <strong>DATA E HORA DA IMPRESSÃO:</strong> {currentDate}
                </div>
            </div>
        </div>
    );
};

export default DacteModel;
