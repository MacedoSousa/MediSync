import React, { useEffect, useRef, useState } from 'react';
import ActionCard from '../components/Map/ActionCard';
import { isCoordString, parseCoordString } from '../utils/coords';

function GeolocationPage() {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const userMarkerRef = useRef(null);
  const watchIdRef = useRef(null);
  const savedMainPadding = useRef(null);
  const bestAccuracyRef = useRef(Infinity);
  const sentEstRef = useRef(false);
  const cacheKey = 'est_cache_v1';
  const [selectedEst, setSelectedEst] = useState(null);
  const [estabelecimentos, setEstabelecimentos] = useState([]);
  const [userPos, setUserPos] = useState(null);
  const [geoError, setGeoError] = useState('');
  const [originInput, setOriginInput] = useState('');
  const [customOrigin,setCustomOrigin]=useState(false);

  useEffect(() => {
    let map;
    let marker;
    let markers = [];
    const defaultPos = { lat: -23.08874, lng: -47.21316 }; // Indaiatuba-SP
    const leafletScript = document.createElement('script');
    leafletScript.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    leafletScript.async = true;
    leafletScript.onload = () => {
      // Se mapa já existe, evita recriar (problemas de arrastar/zoom)
      if (mapInstance.current) return;
      if (window.L) {
        const icons = {
          hospital: window.L.divIcon({
            className: 'emoji-marker',
            html: '🏥',
            iconSize: [28, 28],
            iconAnchor: [14, 28],
          }),
          clinica: window.L.divIcon({
            className: 'emoji-marker',
            html: '🩺',
            iconSize: [28, 28],
            iconAnchor: [14, 28],
          }),
          farmacia: window.L.divIcon({
            className: 'emoji-marker',
            html: '💊',
            iconSize: [28, 28],
            iconAnchor: [14, 28],
          }),
          doctor: window.L.divIcon({
            className: 'emoji-marker',
            html: '🩺',
            iconSize: [28, 28],
            iconAnchor: [14, 28],
          }),
          dentista: window.L.divIcon({
            className: 'emoji-marker',
            html: '🦷',
            iconSize: [28, 28],
            iconAnchor: [14, 28],
          }),
          laboratorio: window.L.divIcon({
            className: 'emoji-marker',
            html: '🧪',
            iconSize: [28, 28],
            iconAnchor: [14, 28],
          }),
          user: window.L.divIcon({
            className: 'emoji-marker',
            html: '📍',
            iconSize: [28, 28],
            iconAnchor: [14, 28],
          }),
        };
        const moveUser = (lat,lng,desc)=>{
          setUserPos({lat,lng});
          if(userMarkerRef.current){userMarkerRef.current.setLatLng([lat,lng]);}
          map.setView([lat,lng]);
          setOriginInput(desc||`${lat},${lng}`);
          setCustomOrigin(true);
          if(watchIdRef.current!==null && navigator.geolocation){
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current=null;
          }
          // limpa marcadores antigos e busca novos
          if(markers.length){markers.forEach(mk=>mk.remove()); markers=[];}
          fetchAndDraw(lat,lng);
        };
        const drawMarkers = (dataArr) => {
          if (!map) return;
          markers = dataArr.map(est => {
            const m = window.L.marker([est.lat, est.lng], { icon: icons[est.tipo] || icons.hospital })
              .addTo(map);
            m.on('click', () => setSelectedEst(est));
            m.bindTooltip(createTooltipHTML(est), { direction: 'top' });
            return m;
          });
        };
        const fetchAndDraw = (lat,lng)=>{
          const backendRadius = 2000;
          fetch('/api/estabelecimentos.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lat, lng, radius: backendRadius }),
          })
          .then(r=>r.json())
          .then(data=>{ if(Array.isArray(data)){ drawMarkers(data);} })
          .catch(()=>{});
        };
        const createPopupHTML = (est) => {
          const agendarLink = `/agendamento?nome=${encodeURIComponent(est.nome)}&lat=${est.lat}&lng=${est.lng}&tipo=${est.tipo}`;
          const gmapsLink   = `https://www.google.com/maps/dir/?api=1&destination=${est.lat},${est.lng}`;
          const wazeLink    = `https://waze.com/ul?ll=${est.lat},${est.lng}&navigate=yes`;
          return `
          <div style="min-width:180px">
            <strong>${est.nome}</strong><br/>
            ${est.tipo.charAt(0).toUpperCase() + est.tipo.slice(1)}<br/><br/>
            <a href="${agendarLink}" style="display:inline-block;margin:4px 0;padding:6px 10px;background:#2563eb;color:#fff;border-radius:6px;text-decoration:none;">Agendar</a><br/>
            <a href="${gmapsLink}" target="_blank" rel="noopener noreferrer">Google&nbsp;Maps</a> |
            <a href="${wazeLink}" target="_blank" rel="noopener noreferrer">Waze</a>
          </div>`;
        };
        const createTooltipHTML = (est) => {
          return `<div style=\"font-size:12px;max-width:220px;\"><strong>${est.nome.split(',')[0]}</strong><br/><span style='color:#9ca3af'>${est.tipo.charAt(0).toUpperCase()+est.tipo.slice(1)}</span></div>`;
        };
        if (navigator.geolocation) {
          let startTs = Date.now();
          watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
              const { latitude, longitude, accuracy } = position.coords;
              if (accuracy < bestAccuracyRef.current) {
                bestAccuracyRef.current = accuracy;
              }

              const newPos = { lat: latitude, lng: longitude };
              setUserPos(newPos);
              // Cria ou move marcador do usuário
              if (!mapInstance.current) {
                // Evita "Map container is already initialized"
                if (mapRef.current && mapRef.current._leaflet_id) {
                  mapRef.current._leaflet_id = null;
                }
                mapInstance.current = window.L.map(mapRef.current).setView([latitude, longitude], 15);
                map = mapInstance.current;
                window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                  attribution:
                    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                }).addTo(map);
                userMarkerRef.current = window.L.marker([latitude, longitude], { icon: icons.user }).addTo(map)
                  .bindPopup('Você está aqui!');
                userMarkerRef.current.on('click', async ()=>{
                  const val = prompt('Digite endereço ou latitude,longitude:');
                  if(!val) return;
                  if (isCoordString(val)) {
                    const { lat, lng } = parseCoordString(val);
                    moveUser(lat, lng, val);
                  }else{
                    try{
                      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&limit=1`);
                      const js = await res.json();
                      if(js[0]){moveUser(parseFloat(js[0].lat),parseFloat(js[0].lon),val);}else{alert('Endereço não encontrado');}
                    }catch{alert('Erro ao buscar endereço');}
                  }
                });
              } else {
                if (userMarkerRef.current) {
                  userMarkerRef.current.setLatLng([latitude, longitude]);
                } else {
                  userMarkerRef.current = window.L.marker([latitude, longitude], { icon: icons.user }).addTo(map);
                  userMarkerRef.current.on('click', async ()=>{
                    const val = prompt('Digite endereço ou latitude,longitude:');
                    if(!val) return;
                    if (isCoordString(val)) {
                      const { lat, lng } = parseCoordString(val);
                      moveUser(lat, lng, val);
                    }else{
                      try{
                        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&limit=1`);
                        const js = await res.json();
                        if(js[0]){moveUser(parseFloat(js[0].lat),parseFloat(js[0].lon),val);}else{alert('Endereço não encontrado');}
                      }catch{alert('Erro ao buscar endereço');}
                    }
                  });
                }
              }

              const shouldFetch = (() => {
                if (sentEstRef.current) return false;
                const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');
                if (cached && Date.now() - cached.ts < 5 * 60 * 1000) {
                  const dist2 = (latitude - cached.lat) ** 2 + (longitude - cached.lng) ** 2;
                  if (dist2 < 0.0004) { // aprox < ~700m
                    setEstabelecimentos(cached.data);
                    drawMarkers(cached.data);
                    sentEstRef.current = true;
                    return false;
                  }
                }
                return accuracy <= 80 || Date.now() - startTs > 5000;
              })();
              if (shouldFetch) {
                sentEstRef.current = true;
                // Buscar estabelecimentos com raio proporcional à precisão (mín 1000m)
                const backendRadius = Math.max(1000, Math.ceil(accuracy * 10));
                fetch('/api/estabelecimentos.php', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ lat: latitude, lng: longitude, radius: backendRadius }),
                })
                  .then(res => res.json())
                  .then(data => {
                    if (!Array.isArray(data)) {
                      setGeoError(data.error || 'Erro ao buscar estabelecimentos.');
                      return;
                    }
                    setEstabelecimentos(data);
                    drawMarkers(data);
                    // cache result
                    localStorage.setItem(cacheKey, JSON.stringify({ lat: latitude, lng: longitude, ts: Date.now(), data }));
                  })
                  .catch(() => setGeoError('Erro de conexão com o backend.'));
              }
            },
            (err) => {
              const secureCtx = window.isSecureContext || window.location.hostname === 'localhost';
              setGeoError(
                secureCtx
                  ? 'Usando localização padrão (Indaiatuba-SP). Você pode permitir o acesso à localização para resultados mais precisos.'
                  : 'Navegador exige HTTPS ou localhost para acessar geolocalização. Usando localização padrão (Indaiatuba-SP).'
              );
              // Código anterior para fallback...
            },
            { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
          );
        }
      }
    };
    document.body.appendChild(leafletScript);
    const leafletCSS = document.createElement('link');
    leafletCSS.rel = 'stylesheet';
    leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(leafletCSS);
    // Zera padding do contêiner main para ocupar toda a largura
    const mainEl = mapRef.current?.closest('main');
    if (mainEl) {
      savedMainPadding.current = mainEl.style.padding;
      mainEl.style.padding = '0';
    }
    return () => {
      // Remove todos os marcadores
      if (markers && markers.length) {
        markers.forEach((mk) => mk.remove());
        markers = [];
      }
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
      if (watchIdRef.current !== null && navigator.geolocation && navigator.geolocation.clearWatch) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      // Mantemos script/CSS carregados se outros componentes precisarem
      if (savedMainPadding.current !== null && mainEl) {
        mainEl.style.padding = savedMainPadding.current;
      }
      document.body.removeChild(leafletScript);
      document.head.removeChild(leafletCSS);
    };
  }, []);

  return (
    <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
      <div
        ref={mapRef}
        style={{ height: '100%', width: '100%' }}
      ></div>
      {geoError && <div style={{ position: 'absolute', top: 12, left: 12, background: '#dc2626', color: '#fff', padding: '8px 12px', borderRadius: '8px', zIndex: 1000 }}>{geoError}</div>}
      {selectedEst && (
        <ActionCard
          est={selectedEst}
          userPos={userPos}
          originInput={originInput}
          setOriginInput={setOriginInput}
          onClose={() => setSelectedEst(null)}
        />
      )}
    </div>
  );
}

export default GeolocationPage;
