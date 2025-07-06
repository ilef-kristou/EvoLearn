import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import "./App.css";
import Header from "./Components/Header";
import Footer from "./Components/Footer";
import "./fonts.css";
import Slider from "./Components/slider/slider";
import Statistics from "./Components/colibrisEnChiffres/Statistics";
import planning from "./assets/images/11.png";
import cours from "./assets/images/12.png";
import equipe from "./assets/images/log.jpg";
import formation1 from "./assets/images/11.png";
import formation2 from "./assets/images/12.png";
import formation3 from "./assets/images/13.png";
import AdminSidebar from "./admin/AdminSidebar";
import Formateurs from "./admin/Formateurs"
import ChargeFormations from "./admin/ChargeFormations";

function App() {
  const navigate = useNavigate();
  const handleClick = () => navigate('/formations');

  const featuredFormations = [
    {
      id: 1,
      title: "Formation Digital Marketing",
      description: "Maîtrisez les outils du marketing digital et boostez votre carrière.",
      duration: "3 mois",
      image: formation1,
      category: "DIGITAL"
    },
    {
      id: 2,
      title: "Gestion de Projet",
      description: "Devenez chef de projet certifié avec notre formation intensive.",
      duration: "2 mois",
      image: formation2,
      category: "MANAGEMENT"
    },
    {
      id: 3,
      title: "Anglais Professionnel",
      description: "Améliorez votre anglais des affaires avec nos formateurs natifs.",
      duration: "6 semaines",
      image: formation3,
      category: "LANGUES"
    }
  ];

  return (
    <div className="App">
      <Header />
      <Routes>
      <Route path="/admin/formateurs" element={<Formateurs />} />
      <Route path="/admin/ChargeFormations" element={<ChargeFormations />} />
      <Route path="/admin" element={<AdminSidebar />}>  </Route>
        <Route path="/" element={
          <>
            <div className="sectionOne">
              <Slider />
              <h2 className="title">
                Bienvenue chez <span className="highlight">FormaCab</span>, votre centre de formation professionnelle.
              </h2>
              <button className="cta-button" onClick={handleClick}>
                VOIR NOS FORMATIONS
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            <div className="about-section">
              <div className="about-content">
                <div className="about-text">
                  <h2>Qui sommes-nous ?</h2>
                  <p>
                    <strong>FormaCab</strong> est un centre de formation professionnelle créé en 2010, spécialisé dans les métiers du numérique, de la gestion et des langues.
                  </p>
                  <ul className="about-features">
                    <li>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#F1C40F">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                      </svg>
                      Plus de 10 ans d'expérience
                    </li>
                    <li>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#F1C40F">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                      </svg>
                      Des formateurs experts
                    </li>
                    <li>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#F1C40F">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                      </svg>
                      Des locaux modernes
                    </li>
                    <li>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#F1C40F">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                      </svg>
                      Un accompagnement personnalisé
                    </li>
                  </ul>
                </div>
                <div className="about-image">
                  <img src={equipe} alt="Équipe FormaCab" />
                </div>
              </div>
            </div>

            <div className="sectionTwo">
              <Statistics />
            </div>

            <section className="featured-courses">
              <div className="section-header">
                <h2>Nos Formations Phares</h2>
                <p className="subtitle">Découvrez nos programmes les plus demandés</p>
              </div>
              
              <div className="courses-grid">
                {featuredFormations.map(formation => (
                  <article key={formation.id} className="course-card">
                    <div className="card-badge">{formation.category}</div>
                    <div className="card-image">
                      <img src={formation.image} alt={formation.title} />
                    </div>
                    <div className="card-body">
                      <h3>{formation.title}</h3>
                      <p>{formation.description}</p>
                      <div className="card-footer">
                        <span className="duration">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="#F1C40F">
                            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#2C3E50" strokeWidth="2"/>
                            <path d="M12 6V12L16 14" stroke="#2C3E50" strokeWidth="2"/>
                          </svg>
                          {formation.duration}
                        </span>
                        <button 
                          className="card-button"
                          onClick={() => navigate(`/formation/${formation.id}`)}
                        >
                          Détails
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <button className="view-all" onClick={handleClick}>
                Voir toutes nos formations
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="#3498DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </section>
          </>
        } />
        
      </Routes>

      <Footer />
    </div>
  );
}

export default App;