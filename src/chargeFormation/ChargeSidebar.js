import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiX, FiMenu } from 'react-icons/fi';
import './ChargeSidebar.css';

const ChargeSidebar = ({ onToggle }) => {
  const [openSubMenu, setOpenSubMenu] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const menuItems = [
   
    {
      title: 'Gestion formations',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#F1C40F"/></svg>,
      path: '/charge/gestionFormations'
    },
    {
      title: "Demande d'inscription",
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" fill="#F1C40F"/></svg>,
      path: '/charge/demande'
    },
    {
      title: 'Planning des formations',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" fill="#F1C40F"/></svg>,
      path: '/charge/formations'
    },
    
    {
      title: 'Ressources',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" fill="#F1C40F"/></svg>,
      path: '/charge/ressources'
    },
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
        {!isCollapsed && <h2>Espace Chargé de formation</h2>}
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

      <div className="sidebar-footer">
        
      </div>
    </div>
  );
};

export default ChargeSidebar;