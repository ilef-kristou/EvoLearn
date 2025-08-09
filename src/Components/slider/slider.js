import React, { useEffect, useState } from "react";
import "./slider.css";
import Slide1 from "../../assets/images/5.jpg";
import Slide2 from "../../assets/images/1.jpg";
import Slide3 from "../../assets/images/4.jpg";
import "../../fonts.css";
import { useNavigate } from "react-router-dom";
import AuthPopup from '../../AuthPopup';

const Slider = () => {
  const navigate = useNavigate(); 
  const [showAuthPopup, setShowAuthPopup] = useState(false);

  const handleClick = () => {
    const token = localStorage.getItem('jwt');
    // Vérification plus robuste de la connexion
    if (token && token !== 'null' && token !== 'undefined' && token.length > 10) {
      // Utilisateur connecté, rediriger vers le formulaire d'inscription à une formation
      navigate('/inscription/formation');
    } else {
      // Utilisateur non connecté, afficher le popup d'inscription/connexion
      setShowAuthPopup(true);
    }
  };

  useEffect(() => {
    let counter = 1;
    const interval = setInterval(() => {
      document.getElementById("radio" + counter).checked = true;
      counter++;
      if (counter > 3) {
        counter = 1;
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="slider">
        <div className="slides">
          <input type="radio" name="radio-btn" id="radio1" defaultChecked />
          <input type="radio" name="radio-btn" id="radio2" />
          <input type="radio" name="radio-btn" id="radio3" />
   
          <div className="slide first">
            <img src={Slide1} alt="Formation en entreprise" />
          </div>
          <div className="slide">
            <img src={Slide2} alt="Salle de formation" />
          </div>
          <div className="slide">
            <img src={Slide3} alt="Équipe pédagogique" />
          </div>
          <div className="navigation-auto">
            <div className="auto-btn1"></div>
            <div className="auto-btn2"></div>
            <div className="auto-btn3"></div>
          </div>
        </div>

        <div className="fixed-content">
          <h2>
            Développez vos compétences,{" "}
            <span className="highlight">transformez votre avenir</span>
          </h2>
          <button className="cta-button" onClick={handleClick}>
            S'inscrire maintenant
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="navigation-manual">
          <label htmlFor="radio1" className="manual-btn"></label>
          <label htmlFor="radio2" className="manual-btn"></label>
          <label htmlFor="radio3" className="manual-btn"></label>
        </div>
      </div>

      {/* Popup rendu en dehors de la structure du slider */}
      {showAuthPopup && (
        <AuthPopup onClose={() => setShowAuthPopup(false)} redirectToInscription={true} />
      )}
    </>
  );
};

export default Slider;