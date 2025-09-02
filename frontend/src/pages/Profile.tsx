import '../dashboard.css';
import Sidebar from '../components/Sidebar';
import { FaHeartbeat, FaPills, FaNotesMedical } from 'react-icons/fa';

const mockUser = {
  avatar: 'https://i.pravatar.cc/150?img=68',
  name: 'João da Silva',
  email: 'joao@email.com',
  phone: '(11) 99999-8888',
  birth: '21/03/1990',
  address: 'Rua das Flores, 123 – São Paulo/SP',
};

function Profile() {
  return (
    <div className="dashboard">
      <Sidebar />
      <div className="dashboard-main">
        <section className="hero-banner">
          <div>
            <h1>Meu Perfil</h1>
            <p>Informações do usuário logado</p>
          </div>
        </section>

        <div className="profile-content">
          {/* Left user card */}
          <div className="profile-left">
            <div className="profile-card">
              <img src={mockUser.avatar} alt={mockUser.name} className="profile-avatar" />
              <h2>{mockUser.name}</h2>
              <p className="profile-field"><strong>E-mail:</strong> {mockUser.email}</p>
              <p className="profile-field"><strong>Telefone:</strong> {mockUser.phone}</p>
              <p className="profile-field"><strong>Nascimento:</strong> {mockUser.birth}</p>
              <p className="profile-field"><strong>Endereço:</strong> {mockUser.address}</p>
              <button className="btn primary" style={{ marginTop: '1rem', width: '100%' }}>Editar Perfil</button>
            </div>
          </div>

          {/* Right utilities */}
          <div className="profile-right">
            {/* Health status */}
            <div className="utility-card">
              <h3><FaHeartbeat /> &nbsp;Saúde Geral</h3>
              <p className="utility-item"><span>Status:</span> Boa</p>
              <p className="utility-item"><span>Última avaliação:</span> 10/Jan/2025</p>
              <p className="utility-item"><span>IMC:</span> 23.4</p>
            </div>

            {/* Active prescriptions */}
            <div className="utility-card">
              <h3><FaPills /> &nbsp;Receitas Ativas</h3>
              <p className="utility-item"><span>Amoxicilina 500mg</span> até 21/Jan</p>
              <p className="utility-item"><span>Atorvastatina 20mg</span> uso contínuo</p>
            </div>

            {/* Next appointments */}
            <div className="utility-card">
              <h3><FaNotesMedical /> &nbsp;Próximas Consultas</h3>
              <p className="utility-item"><span>20/Jan</span> — Exame de sangue</p>
              <p className="utility-item"><span>05/Fev</span> — Consulta cardiologia</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
