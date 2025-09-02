import { useEffect, useState } from 'react';
import '../dashboard.css';

type Props = {
  onSelect: (pos: [number, number], label: string) => void;
  onClose: () => void;
};

type Suggestion = {
  display_name: string;
  lat: string;
  lon: string;
};

export default function LocationPanel({ onSelect, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      if (query.length < 3) {
        setResults([]);
        return;
      }
      setLoading(true);
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`)
        .then((r) => r.json())
        .then((d) => setResults(d.slice(0, 5)))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 400);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <aside className="location-panel">
      <button className="close-btn" onClick={onClose}>×</button>
      <h3>Definir localização</h3>
      <input
        type="text"
        placeholder="Digite endereço ou lugar"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ width: '100%', padding: '6px', marginBottom: '0.5rem' }}
      />
      {loading && <p>Buscando...</p>}
      <ul className="loc-results">
        {results.map((s) => (
          <li
            key={s.display_name}
            onClick={() => onSelect([parseFloat(s.lat), parseFloat(s.lon)], s.display_name)}
          >
            {s.display_name}
          </li>
        ))}
      </ul>
    </aside>
  );
}
