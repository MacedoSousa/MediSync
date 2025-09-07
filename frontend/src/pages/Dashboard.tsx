import '../dashboard.css';
import Sidebar from '../components/Sidebar';
import ProfileDrawer from '../components/ProfileDrawer';
import { useState } from 'react';

function Dashboard() {
  const mockUser={ name:'Gisele', email:'karyna@shops.com.br', phone:'(21)3215-8788', cell:'(21)98664-8888', avatar:'https://i.pravatar.cc/150?img=5'};
  // state
  const [profileOpen,setProfileOpen]=useState(false);
  // sidebar link for profile triggers setProfileOpen true (already link). Instead handle nav click? skip.
  // Add drawer in return
  {profileOpen && <ProfileDrawer user={mockUser} onClose={()=>setProfileOpen(false)} /> }

  return (
    <div className="dashboard">
      <Sidebar />

      {/* Main panel */}
      <div className="dashboard-main">
        {/* Hero banner */}
        <section className="hero-banner">
          <div>
            <h1>Bem-vindo ao MediSync</h1>
            <p>Gerencie sua saúde de forma inteligente e organizada</p>
          </div>
          <div className="hero-actions">
            <button className="btn primary">Agendar Consulta</button>
            <button className="btn secondary">Encontrar Farmácia</button>
          </div>
        </section>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <span>Consultas</span>
            <h2>8</h2>
            <span>Este mês</span>
          </div>
          <div className="stat-card">
            <span>Receitas Ativas</span>
            <h2>3</h2>
            <span>Em tratamento</span>
          </div>
          <div className="stat-card">
            <span>Exames</span>
            <h2>12</h2>
            <span>Realizados</span>
          </div>
          <div className="stat-card">
            <span>Saúde Geral</span>
            <h2>Boa</h2>
            <span>Última avaliação</span>
          </div>
        </div>

        {/* Recent activities */}
        <h3 className="section-title">Atividades Recentes</h3>
        <div className="activities-grid">
          <div className="activity-card">
            <h4>Receita Antibiótico <span className="status-badge badge-pendente">pendente</span></h4>
            <small>Dr. Maria Silva — 15 Jan 2025</small>
            <p>Amoxicilina 500mg - Tomar 1 comprimido de 8/8h por 7 dias</p>
          </div>
          <div className="activity-card">
            <h4>Exame de Sangue <span className="status-badge badge-agendado">agendado</span></h4>
            <small>Dr. João Santos — 20 Jan 2025</small>
            <p>Hemograma completo e glicemia</p>
          </div>
          <div className="activity-card">
            <h4>Consulta Cardiologia <span className="status-badge badge-concluido">concluído</span></h4>
            <small>Dr. Ana Costa — 10 Jan 2025</small>
            <p>Consulta de rotina - pressão arterial normal</p>
          </div>
        </div>

        {/* Quick actions */}
        <h3 className="section-title">Ações Rápidas</h3>
        <div className="quick-actions">
          <div className="quick-card">Nova Receita</div>
          <div className="quick-card">Agendar Exame</div>
          <div className="quick-card">Localizar Farmácia</div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
