
// Gera chave de 44 dígitos com DV mod 11.
// Recebe base43 (construída externamente).
export function generateAccessKey(base43: string): string {
  let base = base43 || "";
  if (!base || base.length !== 43) {
    base = "";
    while (base.length < 43) base += Math.floor(Math.random() * 10);
    base = base.slice(0,43);
  }
  const dv = mod11DV(base);
  return base + dv;
}

function mod11DV(numStr: string): string {
  let sum = 0;
  let factor = 2;
  for (let i = numStr.length - 1; i >= 0; i--) {
    sum += Number(numStr[i]) * factor;
    factor++;
    if (factor > 9) factor = 2;
  }
  const rest = sum % 11;
  let dv = 11 - rest;
  if (dv === 0 || dv === 10 || dv === 11) dv = 0;
  return String(dv);
}

// Simples utilitário para escapar XML
function esc(s: any): string {
  if (s == null) return "";
  return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

// Gera XML simplificado do CT-e (modelo 57) — sem assinatura, apenas demonstrativo
export function buildCTeXML(data: any): string {
  const { issuerName, issuerCNPJ, sender, receiver, items, modelo, serie, numero, chave, dtEmissao } = data;
  const total = (items || []).reduce((s: number, i: any) => s + (Number(i.quantity)||0)*(Number(i.unitValue)||0), 0).toFixed(2);
  let itemsXml = "";
  (items || []).forEach((it: any) => {
    itemsXml += `
      <infUnidTransp>
        <nItem>${esc(it.code)}</nItem>
        <xProd>${esc(it.description)}</xProd>
        <qCarga>${esc(String(it.quantity))}</qCarga>
        <vUnit>${esc((Number(it.unitValue)||0).toFixed(2))}</vUnit>
        <vProd>${esc(((Number(it.quantity)||0)*(Number(it.unitValue)||0)).toFixed(2))}</vProd>
      </infUnidTransp>
    `;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<cteProc>
  <CTe versao="3.00">
    <infCte Id="CTe${chave}" versao="3.00">
      <ide>
        <cUF>33</cUF>
        <cCT>000000</cCT>
        <CFOP>5353</CFOP>
        <natOp>Prestacao de servico de transporte</natOp>
        <mod>${esc(modelo)}</mod>
        <serie>${esc(serie)}</serie>
        <nCT>${esc(numero)}</nCT>
        <dhEmi>${esc(dtEmissao)}</dhEmi>
      </ide>
      <compl>
        <xObs>Simulação gerada por software de teste - IMPERIO LOG</xObs>
      </compl>
      <emit>
        <CNPJ>${esc(issuerCNPJ)}</CNPJ>
        <xNome>${esc(issuerName)}</xNome>
      </emit>
      <rem>
        <CNPJ>${esc(sender.cnpj)}</CNPJ>
        <xNome>${esc(sender.name)}</xNome>
        <xMun>${esc(sender.city)}</xMun>
      </rem>
      <dest>
        <CNPJ>${esc(receiver.cnpj)}</CNPJ>
        <xNome>${esc(receiver.name)}</xNome>
        <xMun>${esc(receiver.city)}</xMun>
      </dest>

      <infCTeNorm>
        <infCarga>
          ${itemsXml}
        </infCarga>
      </infCTeNorm>

      <vPrest>
        <vTPrest>${esc(total)}</vTPrest>
        <vRec>${esc(total)}</vRec>
      </vPrest>
      <autXML>
        <chCTe>${esc(chave)}</chCTe>
      </autXML>
    </infCte>
  </CTe>
</cteProc>`;

  return xml;
}

// Gera XML simplificado do CT-e OS (modelo 67) — sem assinatura
// Estrutura ajustada para seguir o padrão CTe OS
export function buildCTeOSXML(data: any): string {
  const { issuerName, issuerCNPJ, receiver, items, modelo, serie, numero, chave, dtEmissao } = data;
  const total = (items || []).reduce((s: number, i: any) => s + (Number(i.quantity)||0)*(Number(i.unitValue)||0), 0).toFixed(2);
  
  // No CT-e OS (67), os itens de serviço ficam em <infServico>
  let infServicoXml = "";
  if (items && items.length > 0) {
     // Geralmente é um resumo, mas vamos listar o primeiro item ou somar
     const firstItem = items[0];
     infServicoXml = `
      <infServico>
        <xDescServ>${esc(firstItem.description)}</xDescServ>
        <qCarga>${esc(String(firstItem.quantity))}</qCarga>
      </infServico>
     `;
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<cteOSProc>
  <CTeOS versao="3.00">
    <infCteOS Id="CTeOS${chave}" versao="3.00">
      <ide>
        <cUF>33</cUF>
        <cCT>000000</cCT>
        <CFOP>5357</CFOP>
        <natOp>Prestacao de servico de transporte - OS</natOp>
        <mod>${esc(modelo)}</mod>
        <serie>${esc(serie)}</serie>
        <nCT>${esc(numero)}</nCT>
        <dhEmi>${esc(dtEmissao)}</dhEmi>
        <tpImp>1</tpImp>
        <tpEmis>1</tpEmis>
        <cDV>${chave.slice(-1)}</cDV>
        <tpAmb>2</tpAmb>
        <tpCte>0</tpCte>
        <procEmi>0</procEmi>
        <verProc>1.0</verProc>
      </ide>
      <emit>
        <CNPJ>${esc(issuerCNPJ)}</CNPJ>
        <xNome>${esc(issuerName)}</xNome>
        <enderEmit>
            <xLgr>AVENIDA BRASIL</xLgr>
            <nro>2520</nro>
            <xBairro>CAJU</xBairro>
            <cMun>3304557</cMun>
            <xMun>RIO DE JANEIRO</xMun>
            <UF>RJ</UF>
        </enderEmit>
      </emit>
      
      <!-- Tomador do Serviço -->
      <toma>
        <CNPJ>${esc(receiver.cnpj)}</CNPJ>
        <xNome>${esc(receiver.name)}</xNome>
        <enderToma>
            <xLgr>ENDERECO DO TOMADOR</xLgr>
            <nro>123</nro>
            <xBairro>CENTRO</xBairro>
            <cMun>3304557</cMun>
            <xMun>${esc(receiver.city)}</xMun>
            <UF>${esc(receiver.uf)}</UF>
        </enderToma>
      </toma>

      <vPrest>
        <vTPrest>${esc(total)}</vTPrest>
        <vRec>${esc(total)}</vRec>
        <Comp>
            <xNome>Tarifa</xNome>
            <vComp>${esc(total)}</vComp>
        </Comp>
      </vPrest>

      <imp>
         <ICMS>
            <ICMS00>
                <CST>00</CST>
                <vBC>${esc(total)}</vBC>
                <pICMS>12.00</pICMS>
                <vICMS>${esc((Number(total) * 0.12).toFixed(2))}</vICMS>
            </ICMS00>
         </ICMS>
      </imp>

      ${infServicoXml}

      <autXML>
        <chCTeOS>${esc(chave)}</chCTeOS>
      </autXML>
    </infCteOS>
  </CTeOS>
</cteOSProc>`;

  return xml;
}
