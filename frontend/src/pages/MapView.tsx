import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import Sidebar from '../components/Sidebar';
import '../dashboard.css';

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
  { position: [-23.55, -46.64], name: 'Hospital Central', type: 'hospital' },
  { position: [-23.552, -46.642], name: 'Clínica MedVida', type: 'hospital' },
  { position: [-23.548, -46.638], name: 'Farmácia Popular', type: 'pharmacy' },
  { position: [-23.556, -46.646], name: 'Drogaria Saúde', type: 'pharmacy' },
];

function MapView() {
  const [position, setPosition] = useState<[number, number] | null>(null);

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
          <MapContainer center={position} zoom={15} style={{ height: '100vh', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position}>
              <Popup>Você está aqui</Popup>
            </Marker>
            {mockPlaces.map((p) => (
              <Marker
                key={p.name}
                position={p.position}
                icon={p.type === 'hospital' ? hospitalIcon : pharmacyIcon}
              >
                <Popup>{p.name}</Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>
    </div>
  );
}

export default MapView;
