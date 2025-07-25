import React from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import "./App.css";
import Header from "./Components/Header";
import Footer from "./Components/Footer";
import "./fonts.css";
import Slider from "./Components/slider/slider";
import Statistics from "./Components/EvoLearnEnChiffres/Statistics";
import planning from "./assets/images/11.png";
import cours from "./assets/images/12.png";
import equipe from "./assets/images/log.jpg";
import formation1 from "./assets/images/123.webp";
import formation2 from "./assets/images/1234.webp";
import formation3 from "./assets/images/1235.webp";
import AdminSidebar from "./admin/AdminSidebar";
import Formateurs from "./admin/Formateurs";
import ChargeFormations from "./admin/ChargeFormations";
import Participants from "./admin/Participants";
import ChargeSidebar from "./chargeFormation/ChargeSidebar";
import TrainingManagementPage from "./chargeFormation/TrainingManagementPage";
import PlanningPage from "./chargeFormation/PlanningPage";
import PlanningFormations from "./chargeFormation/PlanningFormations";
import InscriptionPage from "./chargeFormation/InscriptionPage";
import DemandesInscriptionPage from "./chargeFormation/DemandesInscriptionPage";
import RessourcesManagementPage from "./chargeFormation/RessourcesManagementPage";
import FormationsList from "./FormationsList.jsx";
import FormationDetails from "./FormationDetails.jsx";

import ParticipantSidebar from "./participant/ParticipantSidebar.js";
import MesFormations from './participant/MesFormations';
import FormateurSidebar from "./formateur/FormateurSidebar.js";
import FormateurDashboard from "./formateur/FormateurDashboard.jsx";
import FormateurMesFormations from "./formateur/MesFormations.jsx";
import FormateurPlanning from "./formateur/Planning.jsx";
import FormateurDemandes from "./formateur/Demandes.jsx";
import FormateurMonProfil from "./formateur/MonProfil.jsx";
import ParticipantMonProfil from "./participant/MonProfil.jsx";

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isChargeRoute = location.pathname.startsWith('/charge');
  const isFormateurRoute = location.pathname.startsWith('/formateur');

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
      {!isAdminRoute && !isChargeRoute && !isFormateurRoute && (
        <>
          <Header />
      <Routes>
        <Route path="/" element={
          <>
               <div className="sectionOne">
              <Slider />
              <h2 className="title">
                Bienvenue chez <span className="highlight">EvoLearn</span>, votre centre de formation professionnelle.
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
                    <strong>EvoLearn</strong> est un centre de formation professionnelle créé en 2010, spécialisé dans les métiers du numérique, de la gestion et des langues.
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
       
                <Footer />
          </>
        } />
            <Route path="/formations" element={<FormationsList />} />
            <Route path="/formation/:id" element={<FormationDetails />} />
            <Route path="/inscription/formation" element={<InscriptionPage />} />
            <Route path="/participant/espace" element={<ParticipantSidebar />} />
            <Route path="/participant/mes-formations" element={<MesFormations />} />
            <Route path="/participant/mon-profil" element={<ParticipantMonProfil />} />
          </Routes>
        </>
      )}

      {isAdminRoute && (
        <Routes>
          <Route path="/admin/formateurs" element={<Formateurs />} />
          <Route path="/admin/ChargeFormations" element={<ChargeFormations />} />
          <Route path="/admin/participants" element={<Participants />} />
          <Route path="/admin" element={<AdminSidebar />} />
        </Routes>
      )}

      {isChargeRoute && (
        <Routes>
          <Route path="/charge" element={<ChargeSidebar />} />
          <Route path="/charge/dashboard" element={<TrainingManagementPage />} />
          <Route path="/charge/gestionFormations" element={<TrainingManagementPage />} />
          <Route path="/charge/demande" element={<DemandesInscriptionPage />} />
          <Route path="/charge/formations" element={<PlanningFormations />} />
          <Route path="/charge/planning" element={<PlanningPage />} />
          <Route path="/charge/ressources" element={<RessourcesManagementPage />} />
      </Routes>
      )}

      {isFormateurRoute && (
        <Routes>
          <Route path="/formateur/dashboard" element={<FormateurDashboard />} />
          <Route path="/formateur/mes-formations" element={<FormateurMesFormations />} />
          <Route path="/formateur/planning" element={<FormateurPlanning />} />
          <Route path="/formateur/demandes" element={<FormateurDemandes />} />
          <Route path="/formateur/mon-profil" element={<FormateurMonProfil />} />
          <Route path="/formateur/ressources" element={<FormateurDashboard />} />
          <Route path="/formateur/certifications" element={<FormateurDashboard />} />
          <Route path="/formateur/parametres" element={<FormateurDashboard />} />
        </Routes>
      )}
    </div>
  );
}

export default App;