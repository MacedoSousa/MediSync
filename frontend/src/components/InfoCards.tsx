import '../infoCards.css';

const news = [
  { icon: '🩺', title: 'Nova vacina aprovada', text: 'Anvisa aprova nova vacina contra gripe para 2025.' },
  { icon: '😴', title: 'Estudo sobre sono', text: 'Dormir 7-8h reduz risco cardíaco em 25%.' },
];

export default function InfoCards() {
  return (
    <div className="info-cards">
      <h3 style={{ gridColumn: '1/-1', margin: '0 0 0.5rem 0', fontSize: '1.15rem', color: '#1976d2' }}>
        Notícias
      </h3>
      {news.map((n) => (
        <div key={n.title} className="info-card">
          <h4>
            {n.icon} {n.title}
          </h4>
          <p>{n.text}</p>
        </div>
      ))}
      <div className="info-card contact" style={{ gridColumn: '1/-1' }}>
        <h4>📞 Fale Conosco</h4>
        <p>Email: suporte@medisync.com</p>
        <p>WhatsApp: (11) 4000-1234</p>
      </div>
    </div>
  );
}
