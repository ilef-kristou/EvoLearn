import React, { useState } from 'react';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import FormateurSidebar from './FormateurSidebar';
import { FiBook, FiCalendar, FiUsers, FiClock, FiMapPin, FiUser, FiEdit2, FiEye } from 'react-icons/fi';

const MesFormations = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const formationsData = [
    {
      id: 1,
      titre: 'React Avancé',
      description: 'Maîtrisez les hooks, context API et les performances React. Formation complète pour devenir expert React.',
      statut: 'En cours',
      participants: 25,
      progression: 0.75,
      dateDebut: '2024-06-01',
      dateFin: '2024-08-30',
      planning: [
        { jour: 'Lundi', heure: '09:00-12:00', salle: 'A1' },
        { jour: 'Mercredi', heure: '14:00-17:00', salle: 'B1' },
        { jour: 'Vendredi', heure: '10:00-13:00', salle: 'A2' }
      ],
      niveau: 'Avancé',
      duree: '3 mois'
    },
    {
      id: 2,
      titre: 'UX/UI Design',
      description: 'Apprenez les principes du design d\'interface et créez des expériences utilisateur exceptionnelles.',
      statut: 'En cours',
      participants: 18,
      progression: 0.45,
      dateDebut: '2024-06-15',
      dateFin: '2024-08-15',
      planning: [
        { jour: 'Mardi', heure: '14:00-17:00', salle: 'B1' },
        { jour: 'Jeudi', heure: '09:00-12:00', salle: 'A1' }
      ],
      niveau: 'Intermédiaire',
      duree: '2 mois'
    },
    {
      id: 3,
      titre: 'JavaScript ES6+',
      description: 'Découvrez les nouvelles fonctionnalités de JavaScript et les bonnes pratiques modernes.',
      statut: 'Terminée',
      participants: 32,
      progression: 1.0,
      dateDebut: '2024-03-01',
      dateFin: '2024-05-30',
      planning: [
        { jour: 'Lundi', heure: '10:00-13:00', salle: 'A2' },
        { jour: 'Mercredi', heure: '09:00-12:00', salle: 'A1' }
      ],
      niveau: 'Débutant',
      duree: '3 mois'
    }
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      width: '100%', 
      background: 'var(--light)', 
      display: 'flex', 
      flexDirection: 'column' 
    }}>
      <Header />
      
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        justifyContent: 'center', 
        padding: '2.5rem 0', 
        boxSizing: 'border-box',
        width: '100%'
      }}>
        <div style={{ 
          display: 'flex', 
          width: '100%', 
          maxWidth: '1400px', 
          gap: 32,
          padding: '0 20px'
        }}>
          <div style={{ 
            minWidth: isSidebarCollapsed ? 70 : 220, 
            transition: 'min-width 0.3s' 
          }}>
            <FormateurSidebar onToggle={setIsSidebarCollapsed} />
          </div>
          
          <main style={{ 
            flex: 1, 
            display: 'flex', 
            justifyContent: 'center',
            width: '100%' 
          }}>
            <div style={{ 
              width: '100%', 
              maxWidth: '900px'
            }}>
              {/* Header */}
              <div style={{ 
                background: 'var(--white)', 
                borderRadius: 22, 
                boxShadow: '0 8px 32px rgba(44,62,80,0.10)', 
                padding: '2.5rem 2.2rem', 
                marginBottom: 32 
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 22, 
                  marginBottom: 18 
                }}>
                  <div style={{ 
                    background: 'var(--dark-blue)', 
                    color: 'var(--white)', 
                    borderRadius: 12, 
                    width: 54, 
                    height: 54, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: 28, 
                    fontWeight: 700, 
                    boxShadow: '0 2px 8px rgba(44,62,80,0.3)' 
                  }}>
                    <FiBook />
                  </div>
                  <div>
                    <h1 style={{ 
                      color: 'var(--dark-blue)', 
                      fontWeight: 800, 
                      fontSize: '1.7rem', 
                      marginBottom: 4, 
                      letterSpacing: '-1px' 
                    }}>
                      Mes Formations
                    </h1>
                    <p style={{ 
                      color: 'var(--light-blue)', 
                      fontWeight: 500, 
                      fontSize: '1.01rem' 
                    }}>
                      Gérez vos formations et suivez leur progression
                    </p>
                  </div>
                </div>
              </div>

              {/* Liste des formations */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {formationsData.map((formation) => (
                  <div key={formation.id} style={{ 
                    background: 'var(--white)', 
                    borderRadius: 22, 
                    boxShadow: '0 8px 32px rgba(44,62,80,0.10)', 
                    padding: '2.5rem 2.2rem' 
                  }}>
                    {/* En-tête formation */}
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start', 
                      marginBottom: 20 
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 12, 
                          marginBottom: 8 
                        }}>
                          <h2 style={{ 
                            color: 'var(--dark-blue)', 
                            fontWeight: 700, 
                            fontSize: '1.4rem', 
                            margin: 0 
                          }}>
                            {formation.titre}
                          </h2>
                          <span style={{ 
                            background: formation.statut === 'En cours' ? 'var(--gold)' : formation.statut === 'Terminée' ? 'var(--light-blue)' : '#10b981',
                            color: 'var(--dark-blue)',
                            padding: '4px 12px',
                            borderRadius: 20,
                            fontSize: '0.8rem',
                            fontWeight: 600
                          }}>
                            {formation.statut}
                          </span>
                        </div>
                        
                        {/* Infos rapides */}
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 20, 
                          marginBottom: 16 
                        }}>
                          <span style={{ 
                            color: 'var(--light-blue)', 
                            fontSize: '0.9rem', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 4 
                          }}>
                            <FiUsers size={16} />
                            {formation.participants} participants
                          </span>
                          <span style={{ 
                            color: 'var(--gold)', 
                            fontSize: '0.9rem', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 4 
                          }}>
                            <FiClock size={16} />
                            {formation.duree}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Progression */}
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        marginBottom: 8 
                      }}>
                        <span style={{ 
                          color: 'var(--dark-blue)', 
                          fontWeight: 600 
                        }}>
                          Progression
                        </span>
                        <span style={{ 
                          color: 'var(--light-blue)', 
                          fontWeight: 600 
                        }}>
                          {Math.round(formation.progression * 100)}%
                        </span>
                      </div>
                      <div style={{ 
                        background: 'var(--light-gray)', 
                        borderRadius: 8, 
                        height: 12, 
                        width: '100%', 
                        overflow: 'hidden' 
                      }}>
                        <div style={{ 
                          width: `${formation.progression * 100}%`, 
                          background: 'linear-gradient(90deg, var(--light-blue) 0%, var(--gold) 100%)', 
                          height: '100%', 
                          borderRadius: 8,
                          transition: 'width 0.4s'
                        }}></div>
                      </div>
                    </div>

                    {/* Période et Planning */}
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 1fr', 
                      gap: 24 
                    }}>
                      {/* Période */}
                      <div>
                        <h3 style={{ 
                          color: 'var(--dark-blue)', 
                          fontWeight: 600, 
                          marginBottom: 12 
                        }}>
                          Période de formation
                        </h3>
                        <div style={{ 
                          background: 'var(--light-gray)', 
                          borderRadius: 10, 
                          padding: '1rem', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 8 
                        }}>
                          <FiCalendar style={{ 
                            color: 'var(--light-blue)', 
                            fontSize: 18 
                          }} />
                          <span style={{ 
                            color: 'var(--dark-blue)', 
                            fontWeight: 500 
                          }}>
                            Du {formatDate(formation.dateDebut)} au {formatDate(formation.dateFin)}
                          </span>
                        </div>
                      </div>

                      {/* Planning */}
                      <div>
                        <h3 style={{ 
                          color: 'var(--dark-blue)', 
                          fontWeight: 600, 
                          marginBottom: 12 
                        }}>
                          Planning hebdomadaire
                        </h3>
                        <div style={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          gap: 8 
                        }}>
                          {formation.planning.map((seance, idx) => (
                            <div key={idx} style={{ 
                              background: 'var(--light-gray)', 
                              borderRadius: 8, 
                              padding: '0.8rem', 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 12 
                            }}>
                              <FiCalendar style={{ 
                                color: 'var(--light-blue)', 
                                fontSize: 16 
                              }} />
                              <span style={{ 
                                color: 'var(--dark-blue)', 
                                fontWeight: 500, 
                                minWidth: 70 
                              }}>
                                {seance.jour}
                              </span>
                              <FiClock style={{ 
                                color: 'var(--gold)', 
                                fontSize: 16 
                              }} />
                              <span style={{ 
                                color: 'var(--dark-blue)', 
                                minWidth: 80 
                              }}>
                                {seance.heure}
                              </span>
                              <FiMapPin style={{ 
                                color: 'var(--light-blue)', 
                                fontSize: 16 
                              }} />
                              <span style={{ 
                                color: 'var(--dark-blue)' 
                              }}>
                                {seance.salle}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default MesFormations;