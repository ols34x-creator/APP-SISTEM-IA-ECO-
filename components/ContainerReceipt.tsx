import React, { useState } from 'react';

const ContainerReceipt: React.FC = () => {
    const [formData, setFormData] = useState({
        numeroContainer: 'MSCU1234567',
        tipoContainer: "40' HC",
        booking: 'BR789012',
        tipoMovimento: 'IMPORTAÇÃO',
        porto: 'SANTOS → RIO',
        placaCavalo: 'ABC1D23',
        placaCarreta: 'XYZ4E56',
        motorista: 'JOÃO SILVA',
        cpfMotorista: '123.456.789-00',
        cliente: 'IMPORTADORA BRASIL LTDA',
        cnpjCliente: '12.345.678/0001-90',
        valorFrete: '1850.00',
        formaPagamento: 'PIX',
        observacoes: '',
    });
    const [customFields, setCustomFields] = useState<{id: string, label: string, value: string}[]>([]);
    const [printTemplate, setPrintTemplate] = useState<'thermal' | 'a4'>('thermal');
    const [showReceipt, setShowReceipt] = useState(false);
    const [receiptData, setReceiptData] = useState<any>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddCustomField = () => {
        setCustomFields([...customFields, { id: Date.now().toString(), label: '', value: '' }]);
    };

    const handleCustomFieldChange = (id: string, field: 'label' | 'value', value: string) => {
        setCustomFields(customFields.map(f => f.id === id ? { ...f, [field]: value } : f));
    };

    const handleRemoveCustomField = (id: string) => {
        setCustomFields(customFields.filter(f => f.id !== id));
    };

    const handleGenerate = () => {
        const data = {
            ...formData,
            customFields,
            dataEmissao: new Date().toLocaleString('pt-BR'),
        };
        setReceiptData(data);
        setShowReceipt(true);
    };
    
    const handlePrint = () => {
        const printContent = document.getElementById('receipt-content')?.innerHTML;
        if (!printContent) return;

        let styles = '';
        if (printTemplate === 'thermal') {
            styles = `
                @page { size: 80mm auto; margin: 5mm; }
                body { 
                    font-family: 'Courier New', monospace; 
                    font-size: 10pt; 
                    color: #000;
                    width: 70mm; /* Largura da filipeta */
                    margin: 0;
                    padding: 0;
                }
                .notinha { padding: 5mm; background: #fff !important; border: none; }
                .cabecalho { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 8px; margin-bottom: 8px; }
                .destaque { font-weight: bold; text-transform: uppercase; margin: 8px 0 4px; }
                .linha { display: flex; justify-content: space-between; margin: 3px 0; word-break: break-word; }
                .linha span:first-child { white-space: nowrap; margin-right: 5px; }
                .separador { border-top: 1px dashed #000; margin: 8px 0; }
                .assinatura { margin-top: 25px; text-align: center; }
                .assinatura-linha { border-bottom: 1px solid #000; height: 20px; width: 80%; margin: 0 auto; }
                .rodape { text-align: center; font-size: 8pt; margin-top: 15px; }
                .grid-container { display: block; }
                .hide-thermal { display: none; }
            `;
        } else {
            // A4 Styles
            styles = `
                @page { size: A4; margin: 20mm; }
                body { 
                    font-family: Arial, sans-serif; 
                    font-size: 12pt; 
                    color: #000;
                    width: 100%;
                    margin: 0;
                    padding: 0;
                }
                .notinha { padding: 0; background: #fff !important; border: none; width: 100%; max-width: 100%; }
                .cabecalho { text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 20px; }
                .cabecalho div { margin-bottom: 5px; font-size: 12pt; }
                .cabecalho .destaque { font-size: 16pt; margin-bottom: 10px; }
                .destaque { font-weight: bold; text-transform: uppercase; margin: 20px 0 10px; font-size: 14pt; background-color: #f0f0f0; padding: 5px; border-left: 5px solid #000; }
                .linha { display: flex; margin: 5px 0; border-bottom: 1px solid #eee; padding-bottom: 5px; }
                .linha span:first-child { font-weight: bold; width: 220px; }
                .separador { display: none; }
                .assinatura { margin-top: 50px; text-align: center; float: right; width: 40%; }
                .assinatura-linha { border-bottom: 1px solid #000; height: 20px; width: 100%; margin: 0 auto; }
                .rodape { text-align: center; font-size: 10pt; margin-top: 50px; clear: both; border-top: 1px solid #ccc; padding-top: 10px; }
                .grid-container { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
                .hide-a4 { display: none; }
                .obs-box { border: 1px solid #ccc; padding: 10px; min-height: 50px; }
            `;
        }

        const printWindow = window.open('', '_blank');
        printWindow?.document.write(`
            <html>
                <head><title>Recibo de Container</title>
                <style>${styles}</style>
                </head>
                <body>
                    <div id="print-version"></div>
                    <script>
                        document.getElementById('print-version').innerHTML = \`${printContent.replace(/`/g, '\\`')}\`;
                        window.onload = function() { 
                            window.print(); 
                            setTimeout(function(){ window.close(); }, 150); 
                        };
                    <\/script>
                </body>
            </html>`);
        printWindow?.document.close();
    };
    

    const ReceiptContent = ({ data }: { data: any }) => (
        <div id="receipt-content" className={`notinha ${printTemplate === 'thermal' ? 'bg-[#FFFFE0] p-4 border border-gray-400 font-mono text-xs text-black max-w-xs mx-auto shadow-lg' : 'bg-white p-8 border border-gray-200 font-sans text-sm text-black w-full shadow-lg'}`}>
            <div className="cabecalho text-center border-b border-dashed border-black pb-2 mb-2">
                <div className="destaque font-bold uppercase text-sm">IMPÉRIOLOG-ECO.LOG</div>
                <div>AVENIDA BRASIL 2520 - CAJU</div>
                <div>RIO DE JANEIRO - RJ</div>
                <div>CNPJ: 32.243.464/0001-15</div>
                <div>Tel: (21) 2594-1889</div>
            </div>

            {printTemplate === 'a4' ? (
                <div className="grid-container">
                    <div>
                        <div className="destaque">DADOS DO CONTAINER</div>
                        <div className="linha"><span>CONTAINER:</span><span>{data.numeroContainer}</span></div>
                        <div className="linha"><span>TIPO:</span><span>{data.tipoContainer}</span></div>
                        <div className="linha"><span>BOOKING:</span><span>{data.booking}</span></div>
                        <div className="linha"><span>MOVIMENTO:</span><span>{data.tipoMovimento}</span></div>
                        <div className="linha"><span>PORTO:</span><span>{data.porto}</span></div>
                    </div>
                    <div>
                        <div className="destaque">DADOS CAMINHÃO</div>
                        <div className="linha"><span>CAVALO:</span><span>{data.placaCavalo}</span></div>
                        <div className="linha"><span>CARRETA:</span><span>{data.placaCarreta}</span></div>
                        <div className="linha"><span>MOTORISTA:</span><span>{data.motorista}</span></div>
                        <div className="linha"><span>CPF:</span><span>{data.cpfMotorista}</span></div>
                    </div>
                </div>
            ) : (
                <>
                    <div className="linha"><span>CONTAINER:</span><span>{data.numeroContainer}</span></div>
                    <div className="linha"><span>TIPO:</span><span>{data.tipoContainer}</span></div>
                    <div className="linha"><span>BOOKING:</span><span>{data.booking}</span></div>
                    <div className="separador"></div>
                    <div className="linha"><span>MOVIMENTO:</span><span>{data.tipoMovimento}</span></div>
                    <div className="linha"><span>PORTO:</span><span>{data.porto}</span></div>
                    <div className="separador"></div>
                    <div className="destaque">DADOS CAMINHÃO</div>
                    <div className="linha"><span>CAVALO:</span><span>{data.placaCavalo}</span></div>
                    <div className="linha"><span>CARRETA:</span><span>{data.placaCarreta}</span></div>
                    <div className="linha"><span>MOTORISTA:</span><span className="text-right">{data.motorista}</span></div>
                    <div className="linha"><span>CPF:</span><span>{data.cpfMotorista}</span></div>
                </>
            )}

            {printTemplate === 'a4' ? (
                <div className="grid-container">
                    <div>
                        <div className="destaque">DADOS CLIENTE</div>
                        <div className="linha"><span>RAZÃO SOCIAL:</span><span>{data.cliente}</span></div>
                        <div className="linha"><span>CNPJ:</span><span>{data.cnpjCliente}</span></div>
                    </div>
                    <div>
                        <div className="destaque">PAGAMENTO</div>
                        <div className="linha"><span>VALOR FRETE:</span><span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(data.valorFrete))}</span></div>
                        <div className="linha"><span>FORMA:</span><span>{data.formaPagamento}</span></div>
                    </div>
                </div>
            ) : (
                <>
                    <div className="separador"></div>
                    <div className="destaque">DADOS CLIENTE</div>
                    <div className="linha"><span>RAZÃO SOCIAL:</span></div>
                    <div className="text-left my-1">{data.cliente}</div>
                    <div className="linha"><span>CNPJ:</span><span>{data.cnpjCliente}</span></div>
                    <div className="separador"></div>
                    <div className="destaque">PAGAMENTO</div>
                    <div className="linha"><span>VALOR FRETE:</span><span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(data.valorFrete))}</span></div>
                    <div className="linha"><span>FORMA:</span><span>{data.formaPagamento}</span></div>
                </>
            )}

            {data.customFields && data.customFields.length > 0 && (
                <>
                    {printTemplate === 'thermal' && <div className="separador"></div>}
                    <div className="destaque">OUTROS DADOS</div>
                    {data.customFields.map((field: any, idx: number) => (
                        <div key={idx} className="linha"><span>{field.label.toUpperCase()}:</span><span>{field.value}</span></div>
                    ))}
                </>
            )}

            {data.observacoes && (
                <>
                    {printTemplate === 'thermal' && <div className="separador"></div>}
                    <div className="destaque">OBSERVAÇÕES</div>
                    <div className={`${printTemplate === 'a4' ? 'obs-box' : 'text-left my-1'}`}>{data.observacoes}</div>
                </>
            )}

            {printTemplate === 'thermal' ? <div className="separador"></div> : null}
            
            <div className="destaque" style={printTemplate === 'a4' ? {marginTop: '20px'} : {}}>DADOS BANCÁRIOS</div>
            <div className="linha"><span>PIX:</span><span>32.243.464/0001-15</span></div>
            <div className="linha"><span>AG/CONTA:</span><span>0001/123456-7</span></div>
            <div className="linha"><span>BANCO:</span><span>ITAÚ</span></div>
            
            {printTemplate === 'thermal' && <div className="separador"></div>}
            
            <div className="assinatura text-center mt-4">
                <div className="assinatura-linha w-4/5 border-b border-black h-5 mx-auto"></div>
                <div>ASSINATURA MOTORISTA</div>
            </div>
            <div className="rodape text-center mt-4 text-[9px]">
                <div>RECIBO VÁLIDO PARA PAGAMENTO</div><div>EMITIDO EM: <span>{data.dataEmissao}</span></div>
            </div>
        </div>
    );

    return (
        <div className="flex flex-wrap gap-6 text-light">
            <div className="flex-1 min-w-[350px] bg-bg-card p-5 rounded-lg shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">📋 IMPÉRIOLOG - Dados do Container</h2>
                    <select 
                        value={printTemplate} 
                        onChange={(e) => setPrintTemplate(e.target.value as any)}
                        className="bg-bg-main text-sm p-2 rounded border border-border-color focus:outline-none focus:border-primary"
                    >
                        <option value="thermal">🖨️ Térmica (80mm)</option>
                        <option value="a4">📄 Padrão A4</option>
                    </select>
                </div>

                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {Object.keys(formData).map(key => {
                        if (key === 'observacoes') return null;
                        return (
                            <div key={key} className="form-group">
                                <label className="capitalize text-sm font-semibold text-gray-text">{key.replace(/([A-Z])/g, ' $1')}</label>
                                {key === 'tipoContainer' || key === 'tipoMovimento' || key === 'formaPagamento' ? (
                                    <select name={key} value={(formData as any)[key]} onChange={handleChange} className="form-input">
                                        {key === 'tipoContainer' && <><option>20' DC</option><option>40' DC</option><option>40' HC</option><option>40' RF</option></>}
                                        {key === 'tipoMovimento' && <><option>IMPORTAÇÃO</option><option>EXPORTAÇÃO</option><option>TRANSBORDO</option></>}
                                        {key === 'formaPagamento' && <><option>PIX</option><option>TRANSFERÊNCIA</option><option>BOLETO</option></>}
                                    </select>
                                ) : (
                                    <input type={key === 'valorFrete' ? 'number' : 'text'} name={key} value={(formData as any)[key]} onChange={handleChange} className="form-input" />
                                )}
                            </div>
                        );
                    })}

                    {/* Custom Fields Section */}
                    <div className="border-t border-border-color pt-3 mt-3">
                        <label className="text-sm font-semibold text-secondary block mb-2">Campos Personalizados</label>
                        {customFields.map((field) => (
                            <div key={field.id} className="flex gap-2 mb-2">
                                <input 
                                    placeholder="Rótulo" 
                                    value={field.label} 
                                    onChange={(e) => handleCustomFieldChange(field.id, 'label', e.target.value)}
                                    className="form-input w-1/3 text-xs"
                                />
                                <input 
                                    placeholder="Valor" 
                                    value={field.value} 
                                    onChange={(e) => handleCustomFieldChange(field.id, 'value', e.target.value)}
                                    className="form-input w-full text-xs"
                                />
                                <button onClick={() => handleRemoveCustomField(field.id)} className="text-red-500 hover:text-red-400 px-2">
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                        ))}
                        <button onClick={handleAddCustomField} className="text-xs text-primary hover:text-primary/80 font-bold flex items-center gap-1">
                            <i className="fas fa-plus-circle"></i> Adicionar Campo
                        </button>
                    </div>

                    {/* Observations */}
                    <div className="form-group mt-3">
                        <label className="text-sm font-semibold text-gray-text">Observações / Notas</label>
                        <textarea 
                            name="observacoes" 
                            value={formData.observacoes} 
                            onChange={handleChange} 
                            className="form-input min-h-[80px]"
                            placeholder="Informações adicionais..."
                        ></textarea>
                    </div>

                    <button onClick={handleGenerate} className="w-full mt-4 px-4 py-3 bg-primary text-white font-bold rounded-md hover:bg-opacity-90 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-shadow">
                        <i className="fas fa-receipt"></i> GERAR RECIBO
                    </button>
                </div>
            </div>

            {showReceipt && receiptData && (
                <div className="flex-1 min-w-[350px] flex flex-col items-center">
                    <div className="w-full max-h-[700px] overflow-y-auto border border-border-color rounded-lg bg-gray-500/10 p-4 flex justify-center">
                        <ReceiptContent data={receiptData} />
                    </div>
                    <button onClick={handlePrint} className="w-full max-w-xs mt-4 px-4 py-3 bg-secondary text-white font-bold rounded-md hover:bg-opacity-90 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-shadow">
                        <i className="fas fa-print"></i> IMPRIMIR
                    </button>
                </div>
            )}
            <style>{`
                .form-input { width: 100%; padding: 8px; border: 1px solid rgb(var(--color-border-color)); border-radius: 5px; background-color: rgb(var(--color-bg-main)); color: rgb(var(--color-light)); font-size: 14px; }
                .linha { display: flex; justify-content: space-between; margin: 3px 0; word-break: break-all; }
                .linha span:first-child { white-space: nowrap; margin-right: 5px; }
                .separador { border-top: 1px dashed #000; margin: 8px 0; }
                .destaque { font-weight: bold; text-transform: uppercase; margin: 8px 0 4px; }
            `}</style>
        </div>
    );
};

export default ContainerReceipt;