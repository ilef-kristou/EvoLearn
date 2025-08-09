import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiX, FiMenu } from 'react-icons/fi';
import './ParticipantSidebar.css';

const ParticipantSidebar = ({ onToggle }) => {
  const [openSubMenu, setOpenSubMenu] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const menuItems = [
    {
      title: 'Mon Profil',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" fill="#F1C40F"/></svg>,
      path: '/participant/mon-profil'
    },
    
    {
      title: 'Mes Formations',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" fill="#F1C40F"/></svg>,
      path: '/participant/mes-formations'
    },
    {
        title: 'Déconnexion',
        icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" fill="#F1C40F"/></svg>,
        path: '/charge/ressources'
      }
  ];

  const toggleSubMenu = (title) => {
    if (!isCollapsed) {
      setOpenSubMenu(openSubMenu === title ? null : title);
    }
  };

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    if (onToggle) onToggle(newState);
  };

  return (
    <div className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!isCollapsed && <h2>Espace Participant</h2>}
        <button 
          className="toggle-btn"
          onClick={toggleSidebar}
          aria-label={isCollapsed ? 'Ouvrir le menu' : 'Fermer le menu'}
        >
          {isCollapsed ? <FiMenu size={20} /> : <FiX size={20} />}
        </button>
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item) => (
            <li 
              key={item.title}
              className={`${location.pathname === item.path ? 'active' : ''} ${
                openSubMenu === item.title ? 'submenu-open' : ''
              }`}
            >
              <Link 
                to={item.path} 
                className="nav-link"
                data-tooltip={isCollapsed ? item.title : null}
              >
                <span className="nav-icon">{item.icon}</span>
                {!isCollapsed && <span className="nav-title">{item.title}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      
    </div>
  );
};

export default ParticipantSidebar;