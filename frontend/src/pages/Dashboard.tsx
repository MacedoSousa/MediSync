import '../dashboard.css';

function Dashboard() {
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>MediSync Dashboard</h1>
      </header>
      <main className="dashboard-content">
        <div className="card">
          <h2>Próximas consultas</h2>
          <p>Em breve...</p>
        </div>
        <div className="card">
          <h2>Alertas de medicação</h2>
          <p>Em breve...</p>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
