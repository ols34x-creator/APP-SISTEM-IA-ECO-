import React from 'react';

const TechUrlShortener: React.FC = () => (
  <iframe 
    src="/url_shortener.html" 
    title="Encurtador de URL" 
    style={{ width: '100%', height: '85vh', border: 'none', borderRadius: '8px' }} 
  />
);

export default TechUrlShortener;
