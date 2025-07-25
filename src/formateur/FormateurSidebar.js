import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiX, FiMenu, FiUser, FiBook, FiCalendar, FiFileText, FiAward, FiSettings, FiLogOut, FiMail } from 'react-icons/fi';
import './FormateurSidebar.css';

const FormateurSidebar = ({ onToggle }) => {
  const [openSubMenu, setOpenSubMenu] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const menuItems = [
    {
        title: 'Mon Profil',
        icon: <FiBook size={20} />,
        path: '/formateur/mon-profil'
      },
    {
      title: 'Mes Formations',
      icon: <FiBook size={20} />,
      path: '/formateur/mes-formations'
    },
    {
      title: 'Planning',
      icon: <FiCalendar size={20} />,
      path: '/formateur/planning'
    },
    {
      title: 'Demandes',
      icon: <FiMail size={20} />,
      path: '/formateur/demandes'
    },
    
    {
      title: 'Déconnexion',
      icon: <FiLogOut size={20} />,
      path: '/'
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
        {!isCollapsed && <h2>Espace Formateur</h2>}
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

export default FormateurSidebar;