import React, { useState } from 'react';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import ParticipantSidebar from './ParticipantSidebar';
import { FiBook, FiCalendar, FiCheckCircle, FiClock, FiMapPin, FiUser, FiCalendar as FiCalendarIcon } from 'react-icons/fi';

const formationMock = {
  titre: 'React Avancé',
  description: "Maîtrisez les hooks, context API et les performances React. Cette formation avancée vous permettra de concevoir des applications performantes, maintenables et modernes avec React.",
  statut: 'En attente', // ou 'Acceptée', 'Terminée'
  dateDebut: '2024-06-17',
  dateFin: '2024-06-28',
  planning: [
    { jour: 'Lundi', heure: '09:00-12:00', salle: 'A1', formateur: 'Jean Dupont' },
    { jour: 'Mercredi', heure: '14:00-17:00', salle: 'B1', formateur: 'Jean Dupont' },
    { jour: 'Vendredi', heure: '10:00-13:00', salle: 'A2', formateur: 'Jean Dupont' },
  ],
  progression: 0.35 // 35%
};

const MesFormations = () => {
  const [statut, setStatut] = useState('Acceptée');
  const [progression, setProgression] = useState(formationMock.progression);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Pour test : bouton pour simuler l'acceptation
  const handleAccepter = () => {
    setStatut('Acceptée');
    setProgression(0.35);
  };

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div style={{ minHeight: '100vh',width:'100%', background: 'var(--light)', display: 'flex', flexDirection: 'column' }}>

      <div style={{ flex: 1, marginLeft:'200px',marginRight:'200px',display: 'flex', justifyContent: 'center', padding: '2.5rem 0', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', width: '100%', maxWidth: '1400px', gap: 32 }}>
          <div style={{ minWidth: isSidebarCollapsed ? 70 : 220, transition: 'min-width 0.3s' }}>
            <ParticipantSidebar onToggle={setIsSidebarCollapsed} />
          </div>
          <main style={{ flex: 1, maxWidth: 900, width: '100%' }}>
            <div style={{ background: 'var(--white)', borderRadius: 22, boxShadow: '0 8px 32px rgba(44,62,80,0.10)', padding: '2.5rem 2.2rem', marginBottom: 32 }}>
              <h2 style={{ color: 'var(--dark-blue)', fontWeight: 800, fontSize: '1.7rem', marginBottom: 18, letterSpacing: '-1px' }}>Ma Formation</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 22, marginBottom: 18 }}>
                <div style={{ background: 'var(--dark-blue)', color: 'var(--white)', borderRadius: 12, width: 54, height: 54, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, boxShadow: '0 2px 8px rgba(44,62,80,0.3)' }}>
                  <FiBook />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: 'var(--dark-blue)', fontSize: '1.15rem', marginBottom: 2 }}>{formationMock.titre}</div>
                  <div style={{ color: 'var(--light-blue)', fontWeight: 500, fontSize: '1.01rem', marginBottom: 2 }}>
                    <FiCheckCircle style={{ color: 'var(--gold)', marginRight: 6 }} />
                    Acceptée
                  </div>
                </div>
              </div>
              <div style={{ color: 'var(--dark-blue)', fontSize: '1.08rem', marginBottom: 18, opacity: 0.97, lineHeight: 1.7 }}>{formationMock.description}</div>

              {/* Dates de la formation */}
              {statut === 'Acceptée' && (
                <div style={{ marginBottom: 28 }}>
                  <div style={{ fontWeight: 600, color: 'var(--light-blue)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FiCalendarIcon style={{ color: 'var(--light-blue)', fontSize: 20 }} />
                    Période de formation
                  </div>
                  <div style={{ background: 'var(--light-gray)', borderRadius: 10, padding: '1rem 1.2rem', display: 'flex', alignItems: 'center', gap: 18 }}>
                    <span style={{ fontWeight: 600, color: 'var(--dark-blue)' }}>Du {formatDate(formationMock.dateDebut)} au {formatDate(formationMock.dateFin)}</span>
                  </div>
                </div>
              )}

              {/* Progression */}
              {statut === 'Acceptée' && (
                <div style={{ marginBottom: 28 }}>
                  <div style={{ fontWeight: 600, color: 'var(--light-blue)', marginBottom: 8 }}>Avancement de la formation</div>
                  <div style={{ background: 'var(--light-gray)', borderRadius: 8, height: 18, width: '100%', overflow: 'hidden', marginBottom: 6 }}>
                    <div style={{ width: `${progression * 100}%`, background: 'linear-gradient(90deg, var(--light-blue) 0%, var(--gold) 100%)', height: '100%', borderRadius: 8, transition: 'width 0.4s' }}></div>
                  </div>
                  <div style={{ color: 'var(--dark-blue)', fontWeight: 600, fontSize: '1.01rem' }}>{Math.round(progression * 100)}% complété</div>
                </div>
              )}

              {/* Planning */}
              {statut === 'Acceptée' && (
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontWeight: 600, color: 'var(--light-blue)', marginBottom: 10 }}>Planning hebdomadaire</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {formationMock.planning.map((seance, idx) => (
                      <div key={idx} style={{ background: 'var(--light-gray)', borderRadius: 10, padding: '1rem 1.2rem', display: 'flex', alignItems: 'center', gap: 18 }}>
                        <FiCalendar style={{ color: 'var(--light-blue)', fontSize: 20 }} />
                        <span style={{ fontWeight: 600, color: 'var(--dark-blue)', minWidth: 80 }}>{seance.jour}</span>
                        <FiClock style={{ color: 'var(--gold)', fontSize: 18 }} />
                        <span style={{ color: 'var(--dark-blue)', minWidth: 90 }}>{seance.heure}</span>
                        <FiMapPin style={{ color: 'var(--light-blue)', fontSize: 18 }} />
                        <span style={{ color: 'var(--dark-blue)', minWidth: 70 }}>{seance.salle}</span>
                        <FiUser style={{ color: 'var(--light-blue)', fontSize: 18 }} />
                        <span style={{ color: 'var(--light-blue)', fontWeight: 600 }}>{seance.formateur}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MesFormations; 