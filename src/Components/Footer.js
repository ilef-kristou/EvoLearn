import React from "react";
import "./style.css";
import logo from "../assets/images/log.jpg";
import facebook from "../assets/images/facebook.png";
import linkedin from "../assets/images/linkedin.png";
import instagram from "../assets/images/instagram.png";
import whatsapp from "../assets/images/whatsapp.png";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-logo">
          <img src={logo} alt="Logo FormaCab" className="logo-img" />
        </div>

        <div className="footer-contact">
          <h2 className="contact-title">
            Contactez <span className="highlight">FormaCab</span>
          </h2>
          <p className="contact-description">
            Notre équipe pédagogique est à votre disposition pour répondre à toutes vos questions
            et vous guider dans le choix de votre formation.
          </p>
          
          <div className="contact-info">
            <div className="contact-item">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#F1C40F">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
              <span>contact@formacab.com</span>
            </div>
            
            <div className="contact-item">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#F1C40F">
                <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
              </svg>
              <span>(+216) 58 330 734</span>
            </div>
          </div>
        </div>

        <div className="footer-social">
          <h3 className="social-title">Suivez-nous</h3>
          <div className="social-icons">
            <a href="https://web.whatsapp.com" className="social-icon">
              <img src={whatsapp} alt="WhatsApp" />
            </a>
            <a href="https://www.linkedin.com" className="social-icon">
              <img src={linkedin} alt="LinkedIn" />
            </a>
            <a href="https://www.instagram.com" className="social-icon">
              <img src={instagram} alt="Instagram" />
            </a>
            <a href="https://www.facebook.com" className="social-icon">
              <img src={facebook} alt="Facebook" />
            </a>
          </div>
        </div>
      </div>

      <div className="footer-copyright">
        <p>© {new Date().getFullYear()} FormaCab. Tous droits réservés.</p>
      </div>
    </footer>
  );
};

export default Footer;