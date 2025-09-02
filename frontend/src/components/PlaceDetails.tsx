import '../dashboard.css';

export type Place = {
  position: [number, number];
  name: string;
  type: 'hospital' | 'pharmacy' | 'clinic';
  phone: string;
  whatsapp: string;
  website?: string;
};

type Props = {
  place: Place;
  origin: [number, number];
  onClose: () => void;
};

export default function PlaceDetails({ place, origin, onClose }: Props) {
  const [lat, lng] = place.position;
  const originStr = `${origin[0]},${origin[1]}`;
  const destStr = `${lat},${lng}`;
  const gmaps = `https://www.google.com/maps/dir/?api=1&origin=${originStr}&destination=${destStr}`;
  const waze = `https://waze.com/ul?ll=${destStr}&navigate=yes`;
  return (
    <aside className="place-details">
      <button className="close-btn" onClick={onClose}>×</button>
      <h3>{place.name}</h3>
      <p><strong>Telefone:</strong> {place.phone}</p>
      <p><strong>WhatsApp:</strong> {place.whatsapp}</p>
      {place.website && (
        <p><a href={place.website} target="_blank" rel="noreferrer">Site</a></p>
      )}
      <div className="routes">
        <a href={gmaps} target="_blank" rel="noreferrer">Abrir no Google Maps</a>
        <a href={waze} target="_blank" rel="noreferrer">Abrir no Waze</a>
      </div>
    </aside>
  );
}
