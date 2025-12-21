
import React, { useEffect, useRef } from 'react';

// Define global QRCode type if using the CDN script
declare const QRCode: any;

interface DacteData {
    tipo: string; // "normal" | "os"
    chave: string;
    modelo: string;
    serie: string;
    numero: string;
    dtEmissao: string;
    total: number;
    issuerName: string;
    issuerCNPJ: string;
    sender: { name: string; cnpj: string; city: string; uf: string; };
    receiver: { name: string; cnpj: string; city: string; uf: string; };
    items: Array<{ code: string; description: string; quantity: number; unitValue: number; }>;
}

interface DactePreviewProps {
    data: DacteData;
    onPrint?: () => void;
    onDownloadXml?: () => void;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const formatChave = (chave: string) => {
    return chave.replace(/(\d{4})/g, '$1 ').trim();
};

const DactePreview: React.FC<DactePreviewProps> = ({ data, onPrint, onDownloadXml }) => {
    const qrRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (data.chave && qrRef.current) {
            qrRef.current.innerHTML = '';
            try {
                if (typeof QRCode !== 'undefined') {
                    new QRCode(qrRef.current, {
                        text: data.chave,
                        width: 90,
                        height: 90,
                        colorDark: "#000000",
                        colorLight: "#ffffff",
                        correctLevel: QRCode.CorrectLevel.L
                    });
                } else {
                    qrRef.current.innerHTML = '<div class="text-[8px] text-red-500 p-1 border border-red-500">QR Code Lib Missing</div>';
                }
            } catch (e) {
                console.error("Erro ao gerar QR Code:", e);
                qrRef.current.innerHTML = '<div class="text-[8px] text-red-500">Erro QR</div>';
            }
        }
    }, [data.chave]);

    // Helper component for a standard data box
    const Box = ({ label, value, className = "", center = false, bold = true }: { label: string, value: React.ReactNode, className?: string, center?: boolean, bold?: boolean }) => (
        <div className={`border-r border-b border-black px-1 py-0.5 flex flex-col justify-start h-full ${className}`}>
            <span className="text-[7px] uppercase font-bold text-gray-600 leading-none mb-0.5">{label}</span>
            <span className={`text-[10px] leading-tight ${center ? 'text-center' : ''} ${bold ? 'font-bold' : ''} truncate`}>{value}</span>
        </div>
    );

    return (
        <div className="flex flex-col gap-4 font-sans">
            {/* Toolbar */}
            <div className="flex justify-end gap-2 no-print">
                {onDownloadXml && (
                    <button onClick={onDownloadXml} className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 text-xs font-bold flex items-center gap-2 transition-colors uppercase tracking-wider">
                        <i className="fas fa-file-code"></i> Baixar XML
                    </button>
                )}
                {onPrint && (
                    <button onClick={onPrint} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs font-bold flex items-center gap-2 transition-colors uppercase tracking-wider">
                        <i className="fas fa-print"></i> Imprimir
                    </button>
                )}
            </div>

            {/* Document Container */}
            <div id="dacte-print-area" className="bg-white text-black p-4 shadow-2xl overflow-x-auto">
                {/* A4 width simulation approx 210mm -> ~800px for screen */}
                <div className="min-w-[800px] max-w-[800px] mx-auto border-2 border-black relative bg-white">
                    
                    {/* Watermark */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                        <span className="text-6xl font-bold transform -rotate-45 text-gray-100 whitespace-nowrap opacity-50">
                            SEM VALOR FISCAL
                        </span>
                    </div>

                    {/* HEADER AREA */}
                    <div className="grid grid-cols-12 border-b-2 border-black relative z-10">
                        {/* Emitente / Logo */}
                        <div className="col-span-5 border-r border-black p-2 flex flex-col justify-center items-center text-center">
                            <div className="w-full h-16 flex items-center justify-center mb-1">
                                <i className="fas fa-truck-moving text-4xl text-gray-800"></i>
                            </div>
                            <div className="font-bold text-sm uppercase">{data.issuerName}</div>
                            <div className="text-[8px] leading-tight text-gray-600 mt-1">
                                AV. EXEMPLO, 1000 - DISTRITO INDUSTRIAL<br />
                                CNPJ: {data.issuerCNPJ} | IE: 123.456.789.123
                            </div>
                        </div>

                        {/* DACTE Title */}
                        <div className="col-span-2 border-r border-black flex flex-col items-center justify-center p-1 bg-gray-50">
                            <h1 className="text-xl font-black tracking-tighter">DACTE</h1>
                            <span className="text-[7px] text-center leading-none mt-1">
                                Documento Auxiliar do Conhecimento de Transporte Eletrônico
                            </span>
                            <div className="mt-2 w-full grid grid-cols-1 divide-y divide-black border border-black">
                                <div className="bg-white text-center text-[9px] font-bold py-1">{data.tipo === 'os' ? 'CT-e OS' : 'CT-e Normal'}</div>
                            </div>
                        </div>

                        {/* Barcode & Key */}
                        <div className="col-span-5 flex flex-col">
                            <div className="h-14 p-2 flex items-center justify-center border-b border-black bg-white">
                                {/* Simulated Barcode with CSS */}
                                <div 
                                    className="w-full h-full"
                                    style={{
                                        background: `repeating-linear-gradient(to right, 
                                            #000 0px, #000 2px, transparent 2px, transparent 4px,
                                            #000 4px, #000 5px, transparent 5px, transparent 9px,
                                            #000 9px, #000 12px, transparent 12px, transparent 14px,
                                            #000 14px, #000 15px, transparent 15px, transparent 19px)` 
                                    }}
                                ></div>
                            </div>
                            <div className="flex-1 p-1 flex flex-col justify-center">
                                <span className="text-[8px] font-bold uppercase ml-1">Chave de Acesso</span>
                                <div className="text-center font-mono text-[11px] font-bold tracking-wide bg-gray-50 rounded border border-gray-300 mx-1 py-0.5">
                                    {formatChave(data.chave)}
                                </div>
                            </div>
                            <div className="border-t border-black p-1 text-center">
                                <span className="text-[8px] text-gray-600 uppercase">
                                    Consulta de autenticidade no portal nacional do CT-e, no site da Sefaz Autorizadora, ou em http://www.cte.fazenda.gov.br
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* INFO ROW 1 */}
                    <div className="grid grid-cols-12 border-b border-black bg-gray-50 relative z-10">
                        <Box label="Protocolo de Autorização de Uso" value={`13323000${Math.floor(Math.random()*1000000)} - ${new Date().toLocaleString('pt-BR')}`} className="col-span-6 border-r" />
                        <Box label="Modelo" value={data.modelo} className="col-span-1 border-r" center />
                        <Box label="Série" value={data.serie} className="col-span-1 border-r" center />
                        <Box label="Número" value={data.numero} className="col-span-2 border-r" center />
                        <Box label="FL" value="1/1" className="col-span-1 border-r" center />
                        <Box label="Data/Hora Emissão" value={data.dtEmissao} className="col-span-1 border-none" center />
                    </div>

                    {/* INFO ROW 2 */}
                    <div className="grid grid-cols-12 border-b border-black relative z-10">
                        <Box label="CFOP" value="5353" className="col-span-1" center />
                        <Box label="Natureza da Operação" value="PRESTACAO DE SERVICO DE TRANSPORTE" className="col-span-5" />
                        <Box label="Origem da Prestação" value={`${data.sender.city} - ${data.sender.uf}`} className="col-span-3" />
                        <Box label="Destino da Prestação" value={`${data.receiver.city} - ${data.receiver.uf}`} className="col-span-3 border-none" />
                    </div>

                    {/* ACTORS */}
                    <div className="border-b-2 border-black relative z-10">
                        <div className="bg-gray-200 text-[8px] font-bold px-1 border-b border-black uppercase">Remetente</div>
                        <div className="grid grid-cols-12">
                            <Box label="Nome / Razão Social" value={data.sender.name} className="col-span-6" />
                            <Box label="CNPJ / CPF" value={data.sender.cnpj} className="col-span-2" />
                            <Box label="IE" value="ISENTO" className="col-span-2" />
                            <Box label="Município / UF" value={`${data.sender.city} - ${data.sender.uf}`} className="col-span-2 border-none" />
                        </div>
                        <div className="bg-gray-200 text-[8px] font-bold px-1 border-y border-black uppercase">Destinatário</div>
                        <div className="grid grid-cols-12">
                            <Box label="Nome / Razão Social" value={data.receiver.name} className="col-span-6" />
                            <Box label="CNPJ / CPF" value={data.receiver.cnpj} className="col-span-2" />
                            <Box label="IE" value="ISENTO" className="col-span-2" />
                            <Box label="Município / UF" value={`${data.receiver.city} - ${data.receiver.uf}`} className="col-span-2 border-none" />
                        </div>
                         <div className="bg-gray-200 text-[8px] font-bold px-1 border-y border-black uppercase">Tomador do Serviço</div>
                        <div className="grid grid-cols-12">
                             {/* Assuming Receiver is Tomador for simplicity in this simulation */}
                            <Box label="Nome / Razão Social" value={data.receiver.name} className="col-span-6" />
                            <Box label="CNPJ / CPF" value={data.receiver.cnpj} className="col-span-2" />
                            <Box label="Endereço" value="ENDEREÇO NÃO INFORMADO NA SIMULAÇÃO" className="col-span-2" />
                            <Box label="Município / UF" value={`${data.receiver.city} - ${data.receiver.uf}`} className="col-span-2 border-none" />
                        </div>
                    </div>

                    {/* PRODUCT / CARGO INFO */}
                    <div className="border-b border-black relative z-10">
                         <div className="bg-gray-200 text-[8px] font-bold px-1 border-b border-black uppercase">Informações da Carga / Produto Predominante</div>
                         <div className="grid grid-cols-12">
                             <Box label="Produto Predominante" value={data.items[0]?.description || "DIVERSOS"} className="col-span-4" />
                             <Box label="Outras Características" value="-" className="col-span-2" />
                             <Box label="Valor Total Carga" value={formatCurrency(data.items.reduce((acc, i) => acc + (i.unitValue * i.quantity), 0))} className="col-span-2" />
                             <Box label="Peso Bruto (kg)" value={(data.items.reduce((acc, i) => acc + i.quantity, 0) * 100).toFixed(2)} className="col-span-2" />
                             <Box label="Volume (m3)" value="10.00" className="col-span-2 border-none" />
                         </div>
                    </div>

                    {/* COMPONENTES DO VALOR */}
                    <div className="grid grid-cols-12 border-b border-black relative z-10 min-h-[60px]">
                        <div className="col-span-8 border-r border-black flex flex-col">
                             <div className="bg-gray-200 text-[8px] font-bold px-1 border-b border-black uppercase">Componentes do Valor da Prestação</div>
                             <div className="flex-grow p-1">
                                 <table className="w-full text-[9px]">
                                     <thead>
                                         <tr className="text-left"><th>Nome</th><th>Valor</th></tr>
                                     </thead>
                                     <tbody>
                                         <tr><td>FRETE PESO</td><td>{formatCurrency(data.total * 0.8)}</td></tr>
                                         <tr><td>PEDÁGIO</td><td>{formatCurrency(data.total * 0.1)}</td></tr>
                                         <tr><td>OUTROS</td><td>{formatCurrency(data.total * 0.1)}</td></tr>
                                     </tbody>
                                 </table>
                             </div>
                        </div>
                        <div className="col-span-4 flex flex-col">
                            <div className="bg-gray-200 text-[8px] font-bold px-1 border-b border-black uppercase text-center">Valor Total do Serviço</div>
                            <div className="flex-grow flex items-center justify-center">
                                <span className="text-xl font-bold">{formatCurrency(data.total)}</span>
                            </div>
                            <div className="border-t border-black px-1">
                                <span className="text-[8px] uppercase font-bold">Valor a Receber</span>
                                <div className="text-right font-bold">{formatCurrency(data.total)}</div>
                            </div>
                        </div>
                    </div>

                    {/* IMPOSTOS */}
                    <div className="grid grid-cols-12 border-b border-black relative z-10">
                         <div className="col-span-12 bg-gray-200 text-[8px] font-bold px-1 border-b border-black uppercase">Informações Relativas ao Imposto (ICMS)</div>
                         <Box label="Situação Tributária" value="00 - TRIBUTADA INTEGRALMENTE" className="col-span-4" />
                         <Box label="Base de Cálculo" value={formatCurrency(data.total)} className="col-span-3" />
                         <Box label="Alíquota ICMS" value="12.00%" className="col-span-2" />
                         <Box label="Valor ICMS" value={formatCurrency(data.total * 0.12)} className="col-span-3 border-none" />
                    </div>

                     {/* OBS */}
                     <div className="border-b-2 border-black min-h-[50px] p-1 relative z-10">
                        <span className="text-[7px] uppercase font-bold text-gray-600 block">Observações Gerais</span>
                        <p className="text-[9px] leading-tight font-mono mt-1">
                            DOCUMENTO EMITIDO EM AMBIENTE DE HOMOLOGAÇÃO. SEM VALOR FISCAL. TRANSPORTE DE CARGA GERAL.
                            MERCADORIA DEVE ESTAR ACOMPANHADA DAS RESPECTIVAS NOTAS FISCAIS.
                            MOTORISTA: JOÃO DA SILVA (CPF: 000.000.000-00). PLACA: ABC-1234.
                        </p>
                    </div>

                    {/* FOOTER */}
                    <div className="grid grid-cols-12 bg-white relative z-10 h-28">
                         <div className="col-span-9 p-2 border-r border-black flex flex-col justify-between">
                             <div>
                                <span className="text-[9px] font-bold uppercase">Declaração</span>
                                <p className="text-[8px] text-justify mt-1">
                                    DECLARO QUE RECEBI OS VOLUMES DESTE CONHECIMENTO EM PERFEITO ESTADO PELO QUE DOU POR CUMPRIDO O PRESENTE CONTRATO DE TRANSPORTE.
                                </p>
                             </div>
                             <div className="grid grid-cols-3 gap-4 mt-2">
                                 <div className="border-t border-black pt-1 text-[7px] text-center">NOME / RG</div>
                                 <div className="border-t border-black pt-1 text-[7px] text-center">ASSINATURA / CARIMBO</div>
                                 <div className="border-t border-black pt-1 text-[7px] text-center">DATA / HORA</div>
                             </div>
                         </div>
                         <div className="col-span-3 flex items-center justify-center p-2">
                             <div ref={qrRef}></div>
                         </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default DactePreview;