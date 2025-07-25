import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiX, FiMenu } from 'react-icons/fi';
import './AdminSidebar.css';

const AdminSidebar = () => {
  const [openSubMenu, setOpenSubMenu] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const menuItems = [
    {
      title: 'Dashboard',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" fill="#F1C40F"/>
        </svg>
      ),
      path: '/admin/dashboard'
    },
    {
      title: 'Gestion Utilisateurs',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#F1C40F"/>
        </svg>
      ),
      subItems: [
        { title: 'Formateurs', path: '/admin/formateurs' },
        { title: 'Chargés de Formation', path: '/admin/ChargeFormations' },
        { title: 'Participants', path: '/admin/participants' }
      ]
    }
  ];

  const toggleSubMenu = (title) => {
    if (!isCollapsed) {
      setOpenSubMenu(openSubMenu === title ? null : title);
    }
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!isCollapsed && <h2>Espace Admin</h2>}
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
              className={`${location.pathname.includes(item.path || '') ? 'active' : ''} ${
                openSubMenu === item.title ? 'submenu-open' : ''
              }`}
            >
              {item.path ? (
                <Link 
                  to={item.path} 
                  className="nav-link"
                  data-tooltip={isCollapsed ? item.title : null}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {!isCollapsed && <span className="nav-title">{item.title}</span>}
                </Link>
              ) : (
                <div 
                  className="nav-link"
                  onClick={() => toggleSubMenu(item.title)}
                  data-tooltip={isCollapsed ? item.title : null}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {!isCollapsed && (
                    <>
                      <span className="nav-title">{item.title}</span>
                      <span className="arrow-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M7 10l5 5 5-5z" fill="#F1C40F"/>
                        </svg>
                      </span>
                    </>
                  )}
                </div>
              )}

              {item.subItems && openSubMenu === item.title && !isCollapsed && (
                <ul className="submenu">
                  {item.subItems.map((subItem) => (
                    <li 
                      key={subItem.title}
                      className={location.pathname === subItem.path ? 'active' : ''}
                    >
                      <Link to={subItem.path} className="submenu-link">
                        {subItem.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
         
          
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;