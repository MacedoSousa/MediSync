import React from 'react';

const ActionCard = ({ est, userPos, originInput, setOriginInput, onClose }) => {
  if (!est) return null;

  const originParamStr = originInput.trim()
    ? encodeURIComponent(originInput.trim())
    : userPos
      ? `${userPos.lat},${userPos.lng}`
      : '';

  const googleLink = originParamStr
    ? `https://www.google.com/maps/dir/?api=1&origin=${originParamStr}&destination=${est.lat},${est.lng}`
    : `https://www.google.com/maps/dir/?api=1&destination=${est.lat},${est.lng}`;

  const wazeLink = originParamStr
    ? `https://waze.com/ul?ll=${est.lat},${est.lng}&from=${originParamStr}&navigate=yes`
    : `https://waze.com/ul?ll=${est.lat},${est.lng}&navigate=yes`;

  return (
    <div style={{ position: 'fixed', top: 12, right: 12, width: 'min(92vw,340px)', boxSizing: 'border-box', background: '#111827', color: '#f1f5f9', padding: 16, borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.4)', zIndex: 1000 }}>
      <button onClick={onClose} style={{ position: 'absolute', top: 8, right: 12, background: 'transparent', border: 0, color: '#f1f5f9', fontSize: 20, cursor: 'pointer' }}>×</button>
      <h3 style={{ margin: '0 0 4px', fontSize: 16, lineHeight: '1.3' }}>{est.nome.split(',')[0]}</h3>
      <p style={{ margin: '0 0 12px', fontSize: 14, color: '#9ca3af' }}>{est.tipo.charAt(0).toUpperCase() + est.tipo.slice(1)}</p>
      <input
        value={originInput}
        onChange={(e) => setOriginInput(e.target.value)}
        placeholder="Ponto de partida (ex.: Av Paulista, 1000)"
        style={{ width: '100%', padding: '8px 10px', marginBottom: 12, borderRadius: 6, border: '1px solid #374151', background: '#1f2937', color: '#f1f5f9', boxSizing: 'border-box' }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <a
          href={googleLink}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#3b82f6 0%,#2563eb 100%)', padding: 10, borderRadius: 8, textDecoration: 'none', color: '#fff', fontWeight: 600 }}
        >
          <span role="img" aria-label="maps">🗺️</span> Google Maps
        </a>
        <a
          href={wazeLink}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#67e8f9 0%,#0ea5e9 100%)', padding: 10, borderRadius: 8, textDecoration: 'none', color: '#fff', fontWeight: 600 }}
        >
          <span role="img" aria-label="car">🚗</span> Waze
        </a>
        {est.phone && (
          <a
            href={`tel:${est.phone}`}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#34d399 0%,#059669 100%)', padding: 10, borderRadius: 8, textDecoration: 'none', color: '#fff', fontWeight: 600 }}
          >
            <span role="img" aria-label="phone">📞</span> Ligar
          </a>
        )}
        {est.whatsapp && (
          <a
            href={`https://wa.me/${est.whatsapp.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#25d366 0%,#128c7e 100%)', padding: 10, borderRadius: 8, textDecoration: 'none', color: '#fff', fontWeight: 600 }}
          >
            <span role="img" aria-label="whatsapp">💬</span> WhatsApp
          </a>
        )}
        <a
          href={`/agendamento?nome=${encodeURIComponent(est.nome)}&lat=${est.lat}&lng=${est.lng}&tipo=${est.tipo}`}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#fffbe9 0%,#f8d477 100%)', padding: 10, borderRadius: 8, textDecoration: 'none', color: '#374151', fontWeight: 600 }}
        >
          <span role="img" aria-label="calendar">📅</span> Agendar
        </a>
      </div>
    </div>
  );
};

export default ActionCard;
