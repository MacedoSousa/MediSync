import React from 'react';

function PagePlaceholder({ title, description }) {
  return (
    <div style={{ textAlign: 'center', marginTop: '10vh' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: 8 }}>{title}</h1>
      <p style={{ color: '#64748b' }}>{description ?? 'Funcionalidade em desenvolvimento.'}</p>
    </div>
  );
}

export default PagePlaceholder;
