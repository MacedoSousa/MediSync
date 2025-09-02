import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import Sidebar from '../components/Sidebar';
import PlaceDetails, { Place as PlaceType } from '../components/PlaceDetails';import '../dashboard.css';
import LocationPanel from '../components/LocationPanel';

// Color marker icons (leaflet-color-markers)
const markerBase = 'https://unpkg.com/leaflet-color-markers@1.1.1/img';
const colorIcon = (color: string) =>
  new L.Icon({
    iconUrl: `${markerBase}/marker-icon-${color}.png`,
    shadowUrl: `${markerBase}/marker-shadow.png`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

const icons: Record<string, L.Icon> = {
  hospital: colorIcon('red'),
  clinic: colorIcon('green'),
  pharmacy: colorIcon('blue'),
  doctors: colorIcon('orange'),
  dentist: colorIcon('violet'),
};

const BACKEND_URL = 'http://localhost:8000/api/places.php';

function MapView() {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [selected, setSelected] = useState<PlaceType | null>(null);
  const [places, setPlaces] = useState<PlaceType[]>([]);
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

  // get geolocation
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setPosition([pos.coords.latitude, pos.coords.longitude]),
      () => setPosition([-23.55, -46.64]),
    );
  }, []);

  // fetch places whenever position changes
  useEffect(() => {
    if (!position) return;
    const [lat, lng] = position;
    fetch(`${BACKEND_URL}?lat=${lat}&lng=${lng}&radius=10000`)
      .then((r) => r.json())
      .then((data) => {
        const mapped = data.map((p: any) => ({
          ...p,
          position: [p.lat, p.lng] as [number, number],
        }));
        setPlaces(mapped);
      })
      .catch((err) => console.error('Erro carregando locais', err));
  }, [position]);

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="dashboard-main">
        {position && (
          <MapContainer
            center={position}
            zoom={15}
            style={{ height: '100vh', width: '100%' }}
            eventHandlers={{ click: handleMapClick }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position} eventHandlers={{ click: () => setLocPanel(true) }}>
              <Popup>Você está aqui<br/><button onClick={() => setLocPanel(true)}>Alterar localização</button></Popup>
            </Marker>
            {places.map((p: any) => (
              <Marker
                key={p.name}
                position={p.position as [number, number]}
                icon={icons[p.type] || icons.hospital}
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
