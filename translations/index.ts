
export type Language = 'pt' | 'en' | 'es' | 'zh' | 'ja';

export const translations = {
  pt: {
    // ... (keep existing)
    comprovantes: 'Comprovantes',
    dse: 'DSE - Exportação',
    // ... (rest of translation keys)
    faturamentoReceita: 'Faturamento/Receita',
    custosFixos: 'Custos Fixos',
    custosVariaveis: 'Custos Variáveis',
    operationalReport: 'Relatório Operacional',
    costRadar: 'Análise de Custos (Radar)',
    accountDelays: 'Atrasos de Contas',
    interestReports: 'Juros por Atraso',
    reimbursement: 'Justificativa',
    ecoAuto: 'Eco.Auto',
    oficinaSystem: 'Sistema Oficina',
    // ...
  },
  en: {
    dse: 'SDE - Simplified Export Declaration',
    // ...
  },
  es: {
    dse: 'DSE - Declaración de Exportación',
  },
  zh: {
    dse: 'DSE - 出口声明',
  },
  ja: {
    dse: 'DSE - 輸出申告',
  }
};
