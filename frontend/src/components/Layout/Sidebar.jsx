import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { UserContext } from '../Auth/UserContext';
import { FaMapMarkedAlt, FaCalendarAlt, FaFileMedical, FaPills, FaVideo, FaBell, FaUser, FaHome } from 'react-icons/fa';

const menuBase = [
  { label: 'Dashboard', icon: <FaHome />, href: '/' },
  { label: 'Mapa', icon: <FaMapMarkedAlt />, href: '/geolocalizacao' },
  { label: 'Consultas', icon: <FaCalendarAlt />, href: '/agendamento' },
  { label: 'Exames', icon: <FaFileMedical />, href: '/exames' },
  { label: 'Receitas', icon: <FaPills />, href: '/receitas' },
  { label: 'Salas/Videochamadas', icon: <FaVideo />, href: '/reunioes' },
  { label: 'Meu Perfil', icon: <FaUser />, href: '/perfil' },
];

function Sidebar() {
  const { userType } = useContext(UserContext);
  // Alarmes só para paciente
  const menu = userType === 'paciente'
    ? [...menuBase.slice(0, 6), { label: 'Alarmes', icon: <FaBell />, href: '/alarmes' }, menuBase[6]]
    : menuBase;

  return (
    <aside className="sidebar">
      <nav>
        {menu.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              `sidebar-link${isActive ? ' active' : ''}`
            }
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            {item.icon} {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
