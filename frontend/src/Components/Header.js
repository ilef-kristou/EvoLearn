import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./style.css";
import logo from "../assets/images/log.jpg";
import "../fonts.css";
import AuthPopup from "../AuthPopup"; // Assurez-vous d'avoir créé ce composant

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthPopup, setShowAuthPopup] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleAuthClick = (e) => {
    e.preventDefault();
    setShowAuthPopup(true);
    setIsMenuOpen(false); // Fermer le menu mobile si ouvert
  };

  return (
    <>
      <header className="header">
        <div className="header-container">
          <div className="header-logo">
            <img src={logo} alt="Logo FormaCab" className="logo-img" />
          </div>
          
          <button 
            className={`menu-toggle ${isMenuOpen ? 'active' : ''}`} 
            onClick={toggleMenu}
            aria-label="Menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          
          <nav className={`nav ${isMenuOpen ? "nav-open" : ""}`}>
            <ul>
              <li>
                <Link to="/" className="nav-link1" onClick={() => setIsMenuOpen(false)}>Accueil</Link>
              </li>
              <li>
                <Link to="/formations" className="nav-link1" onClick={() => setIsMenuOpen(false)}>Formations</Link>
              </li>
              <li>
                <a href="#login" className="nav-link1 contact-link" onClick={handleAuthClick}>
                  Se connecter
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {showAuthPopup && (
        <AuthPopup onClose={() => setShowAuthPopup(false)} />
      )}
    </>
  );
};

export default Header;