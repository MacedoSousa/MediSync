import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import Sidebar from '../components/Sidebar';
import PlaceDetails, { Place } from '../components/PlaceDetails';
import '../dashboard.css';
import LocationPanel from '../components/LocationPanel';

const hospitalIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/2967/2967377.png',
  iconSize: [32, 32],
});
const pharmacyIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3050/3050525.png',
  iconSize: [32, 32],
});

type Place = {
  position: [number, number];
  name: string;
  type: 'hospital' | 'pharmacy';
};

const mockPlaces: Place[] = [
  { position: [-23.55, -46.64], name: 'Hospital Central', type: 'hospital', phone: '(11) 3000-1111', whatsapp: '(11) 98888-0001', website: 'https://hospitalcentral.com' },
  { position: [-23.552, -46.642], name: 'Clínica MedVida', type: 'clinic', phone: '(11) 4000-2222', whatsapp: '(11) 97777-0002' },
  { position: [-23.548, -46.638], name: 'Farmácia Popular', type: 'pharmacy', phone: '(11) 5000-3333', whatsapp: '(11) 96666-0003' },
  { position: [-23.556, -46.646], name: 'Drogaria Saúde', type: 'pharmacy', phone: '(11) 5111-4444', whatsapp: '(11) 95555-0004' },
];

function MapView() {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [selected, setSelected] = useState<Place | null>(null);
  const [locPanel, setLocPanel] = useState(false);

  const handleMapClick = (e: L.LeafletMouseEvent) => {
    if (position) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
    }
  };

  const geocodeAddress = async () => {
    if (!position) return;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(position.join(','))}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data[0]) {
        setPosition([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
      } else {
        alert('Endereço não encontrado');
      }
    } catch (e) {
      alert('Erro ao buscar endereço');
    }
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
      },
      () => {
        // fallback para SP
        setPosition([-23.55, -46.64]);
      },
    );
  }, []);

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="dashboard-main">
        {position && (
          <MapContainer center={position} zoom={15} style={{ height: '100vh', width: '100%' }} whenCreated={(map)=>map.on('click', handleMapClick)}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position} eventHandlers={{ click: () => setLocPanel(true) }}>
              <Popup>Você está aqui<br/><button onClick={() => setLocPanel(true)}>Alterar localização</button></Popup>
            </Marker>
            {mockPlaces.map((p) => (
              <Marker
                key={p.name}
                position={p.position}
                icon={p.type === 'hospital' ? hospitalIcon : pharmacyIcon}
                eventHandlers={{ click: () => setSelected(p) }}
              />
            ))}
          </MapContainer>
        )}
        {locPanel && (
          <LocationPanel
            onSelect={(p)=>{setPosition(p);setLocPanel(false);}}
            onClose={()=>setLocPanel(false)}
          />
        )}
        {selected && position && (
          <PlaceDetails place={selected} origin={position} onClose={() => setSelected(null)} />
        )}
      </div>
    </div>
  );
}

export default MapView;
