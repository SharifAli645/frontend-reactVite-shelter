import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('');
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const initials = user ? getInitials(user.name) : 'SB';
  const displayName = user ? user.name : 'Usuario';

  return (
    <div className="app-container">
      <nav className="sidebar glass-card">
        <div className="logo">🐾 ShelterManager</div>
        <ul className="nav-links">
          <li><NavLink to="/dashboard">Dashboard</NavLink></li>
          <li><NavLink to="/animals">Animales</NavLink></li>
          <li><NavLink to="/adoptions">Adopciones</NavLink></li>
          <li><NavLink to="/settings">Configuración</NavLink></li>
        </ul>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar-sm">{initials}</div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{displayName}</span>
              {user?.role && <span className="sidebar-user-role">{user.role}</span>}
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Cerrar sesión">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </nav>
      <main className="main-content">
        <header className="top-bar">
          <h1>Bienvenido de nuevo, {user?.name ?? 'Usuario'}</h1>
          <div className="user-profile">{initials}</div>
        </header>
        <section className="content-area">
          {children}
        </section>
      </main>
    </div>
  );
};

export default Layout;
