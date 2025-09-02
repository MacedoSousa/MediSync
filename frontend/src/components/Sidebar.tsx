import { NavLink } from 'react-router-dom';
import { useDrawer } from '../context/DrawerContext';
import '../dashboard.css';

function Sidebar() {
  const drawer=useDrawer();
  return (
    <aside className="sidebar">
      <h2>MediSync</h2>
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Dashboard</NavLink>
        <NavLink to="/map" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Mapa</NavLink>
        <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0', margin: '1rem 0' }} />
        <a className="nav-link" onClick={drawer.open}>Meu Perfil</a>
      </nav>
    </aside>
  );
}

export default Sidebar;
