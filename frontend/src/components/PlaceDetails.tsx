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
  const imgUrl = `https://source.unsplash.com/400x200/?${place.type}`;
  const originStr = `${origin[0]},${origin[1]}`;
  const destStr = `${lat},${lng}`;
  const gmaps = `https://www.google.com/maps/dir/?api=1&origin=${originStr}&destination=${destStr}`;
  const waze = `https://waze.com/ul?ll=${destStr}&navigate=yes`;
  return (
    <aside className="place-details">
      <button className="close-btn" onClick={onClose}>×</button>
      <img src={imgUrl} className="header-img" />
      <div className="content">
        <h3>{place.name}</h3>
        {place.phone && <p><strong>Telefone:</strong> {place.phone}</p>}
        {place.whatsapp && <p><strong>WhatsApp:</strong> {place.whatsapp}</p>}
        {place.website && <p><a href={place.website} target="_blank" rel="noreferrer">Site</a></p>}
        <div className="routes">
          <a href={gmaps} target="_blank" rel="noreferrer">Abrir no Google Maps</a>
          <a href={waze} target="_blank" rel="noreferrer">Abrir no Waze</a>
        </div>
      </div>
    </aside>
  );
}
