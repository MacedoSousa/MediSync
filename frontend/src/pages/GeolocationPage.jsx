import React, { useEffect, useRef, useState } from 'react';

function GeolocationPage() {
  const mapRef = useRef(null);
  const [estabelecimentos, setEstabelecimentos] = useState([]);
  const [userPos, setUserPos] = useState(null);
  const [geoError, setGeoError] = useState('');

  useEffect(() => {
    let map;
    let marker;
    let markers = [];
    const defaultPos = { lat: -23.08874, lng: -47.21316 }; // Indaiatuba-SP
    const leafletScript = document.createElement('script');
    leafletScript.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    leafletScript.async = true;
    leafletScript.onload = () => {
      if (window.L) {
        const icons = {
          hospital: window.L.divIcon({
            className: '',
            html: `<svg width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="15" fill="#ef4444" stroke="#fff" stroke-width="2"/><text x="16" y="22" text-anchor="middle" font-size="18" fill="#fff" font-family="Arial">H</text></svg>`
          }),
          clinica: window.L.divIcon({
            className: '',
            html: `<svg width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="15" fill="#2563eb" stroke="#fff" stroke-width="2"/><text x="16" y="22" text-anchor="middle" font-size="18" fill="#fff" font-family="Arial">C</text></svg>`
          }),
          farmacia: window.L.divIcon({
            className: '',
            html: `<svg width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="15" fill="#22c55e" stroke="#fff" stroke-width="2"/><text x="16" y="22" text-anchor="middle" font-size="18" fill="#fff" font-family="Arial">F</text></svg>`
          }),
          user: window.L.divIcon({
            className: '',
            html: `<svg width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="15" fill="#facc15" stroke="#fff" stroke-width="2"/><text x="16" y="22" text-anchor="middle" font-size="18" fill="#fff" font-family="Arial">U</text></svg>`
          }),
        };
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              setUserPos({ lat: latitude, lng: longitude });
              // Evita "Map container is already initialized" em ambientes StrictMode/dev
              if (mapRef.current._leaflet_id) {
                mapRef.current._leaflet_id = null;
              }
              map = window.L.map(mapRef.current).setView([latitude, longitude], 15);
              window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution:
                  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
              }).addTo(map);
              marker = window.L.marker([latitude, longitude], { icon: icons.user }).addTo(map)
                .bindPopup('Você está aqui!').openPopup();
              // Enviar localização em texto puro
              fetch('/api/estabelecimentos.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lat: latitude, lng: longitude }),
              })
                .then(res => res.json())
                .then(data => {
                  console.log('Resposta estabelecimentos:', data);
                  if (!Array.isArray(data)) {
                    setGeoError(data.error || 'Erro ao buscar estabelecimentos.');
                    return;
                  }
                  setEstabelecimentos(data);
                  markers = data.map(est =>
                    window.L.marker([est.lat, est.lng], { icon: icons[est.tipo] || icons.hospital })
                      .addTo(map)
                      .bindPopup(`<b>${est.nome}</b><br/>${est.tipo.charAt(0).toUpperCase() + est.tipo.slice(1)}`)
                  );
                })
                .catch(err => {
                  setGeoError('Erro de conexão com o backend.');
                });
            },
            (err) => {
              const secureCtx = window.isSecureContext || window.location.hostname === 'localhost';
              setGeoError(
                secureCtx
                  ? 'Usando localização padrão (Indaiatuba-SP). Você pode permitir o acesso à localização para resultados mais precisos.'
                  : 'Navegador exige HTTPS ou localhost para acessar geolocalização. Usando localização padrão (Indaiatuba-SP).'
              );

              if (mapRef.current._leaflet_id) {
                mapRef.current._leaflet_id = null;
              }
              map = window.L.map(mapRef.current).setView([defaultPos.lat, defaultPos.lng], 14);
              window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution:
                  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
              }).addTo(map);

              // Busca estabelecimentos em Indaiatuba
              fetch('/api/estabelecimentos.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lat: defaultPos.lat, lng: defaultPos.lng }),
              })
                .then(res => res.json())
                .then(data => {
                  if (!Array.isArray(data)) return;
                  markers = data.map(est =>
                    window.L.marker([est.lat, est.lng], { icon: icons[est.tipo] || icons.hospital })
                      .addTo(map)
                      .bindPopup(`<b>${est.nome}</b><br/>${est.tipo.charAt(0).toUpperCase() + est.tipo.slice(1)}`)
                  );
                })
                .catch(() => {});
            }
          );
        }
      }
    };
    document.body.appendChild(leafletScript);
    const leafletCSS = document.createElement('link');
    leafletCSS.rel = 'stylesheet';
    leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(leafletCSS);
    return () => {
      if (map) map.remove();
      document.body.removeChild(leafletScript);
      document.head.removeChild(leafletCSS);
    };
  }, []);

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <h1>Geolocalização</h1>
      <div
        ref={mapRef}
        style={{ height: '400px', width: '100%', borderRadius: '12px', margin: '16px 0', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
      ></div>
      {geoError && <div style={{ color: 'red', margin: '12px 0' }}>{geoError}</div>}
      <p style={{ fontSize: '12px', color: '#888' }}>
        Mapa por <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors, sob <a href="https://opendatacommons.org/licenses/odbl/1-0/" target="_blank" rel="noopener noreferrer">ODbL</a>.
      </p>
    </div>
  );
}

export default GeolocationPage;
