import React from 'react';

const EcoSis: React.FC = () => (
  <iframe 
    src="/eco_sis.html" 
    title="Eco.Sis - Calendário Financeiro" 
    style={{ 
        width: '100%', 
        height: 'calc(100vh - 120px)', 
        border: 'none', 
        borderRadius: '8px',
        backgroundColor: '#1e293b' /* Matches the card background to prevent white flash */
    }} 
  />
);

export default EcoSis;