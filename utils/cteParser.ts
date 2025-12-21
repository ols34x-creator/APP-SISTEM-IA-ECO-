
export interface ParsedCteData {
    numeroCTe: string;
    dataEmissao: string; // YYYY-MM-DD
    valorCTe: string;    // "123.45"
    tomadorNome: string;
    chaveAcesso: string;
}

export const parseCteXML = (xmlString: string): ParsedCteData | null => {
    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

        if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
            console.error('XML parsing error.');
            return null;
        }

        const getText = (element: Element | undefined, tagName: string, defaultValue = ''): string => {
            if (!element) return defaultValue;
            const elements = element.getElementsByTagName(tagName);
            return elements.length > 0 ? elements[0].textContent || defaultValue : defaultValue;
        };

        const cte = xmlDoc.getElementsByTagName('CTe')[0] || xmlDoc.getElementsByTagName('cte:CTe')[0];
        if (!cte) return null;

        const infCte = cte.getElementsByTagName('infCte')[0];
        if (!infCte) return null;
        
        const ide = infCte.getElementsByTagName('ide')[0];
        const dest = infCte.getElementsByTagName('dest')[0];
        const vPrest = infCte.getElementsByTagName('vPrest')[0];
        
        // Data de emissão (YYYY-MM-DD)
        const dhEmi = getText(ide, 'dhEmi', '');
        const dataEmissao = dhEmi ? dhEmi.split('T')[0] : new Date().toISOString().split('T')[0];

        // Tomador - geralmente o destinatário
        const tomadorNome = getText(dest, 'xNome', '');
        
        // Valor do CTe
        const valorCTe = getText(vPrest, 'vTPrest', '0.00');

        const parsedData: ParsedCteData = {
            chaveAcesso: infCte.getAttribute('Id')?.replace('CTe', '') || '',
            numeroCTe: getText(ide, 'nCT', ''),
            dataEmissao: dataEmissao,
            valorCTe: valorCTe,
            tomadorNome: tomadorNome,
        };

        // Validate essential fields
        if (!parsedData.chaveAcesso || !parsedData.numeroCTe || !parsedData.valorCTe) {
            console.error("Essential CTe data not found in XML.", parsedData);
            return null;
        }

        return parsedData;

    } catch (error) {
        console.error('Error parsing CTe XML:', error);
        return null;
    }
};
