import React, { useState } from 'react';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import FormateurSidebar from './FormateurSidebar';
import { FiCalendar, FiClock, FiMapPin, FiUsers, FiBook, FiUser } from 'react-icons/fi';

const Planning = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedDate, setSelectedDate] = useState('2024-06-17');

  const planningData = [
    {
      id: 1,
      formation: 'React Avancé',
      date: '2024-06-17',
      jour: 'Lundi',
      heure: '09:00-12:00',
      salle: 'A1',
      participants: 25,
      statut: 'À venir',
      description: 'Hooks avancés et Context API'
    },
    {
      id: 2,
      formation: 'UX/UI Design',
      date: '2024-06-18',
      jour: 'Mardi',
      heure: '14:00-17:00',
      salle: 'B1',
      participants: 18,
      statut: 'À venir',
      description: 'Principes de design et wireframing'
    },
    {
      id: 3,
      formation: 'React Avancé',
      date: '2024-06-19',
      jour: 'Mercredi',
      heure: '14:00-17:00',
      salle: 'B1',
      participants: 25,
      statut: 'À venir',
      description: 'Performance et optimisation'
    },
    {
      id: 4,
      formation: 'UX/UI Design',
      date: '2024-06-20',
      jour: 'Jeudi',
      heure: '09:00-12:00',
      salle: 'A1',
      participants: 18,
      statut: 'À venir',
      description: 'Prototypage et tests utilisateur'
    },
    {
      id: 5,
      formation: 'React Avancé',
      date: '2024-06-21',
      jour: 'Vendredi',
      heure: '10:00-13:00',
      salle: 'A2',
      participants: 25,
      statut: 'À venir',
      description: 'Tests et déploiement'
    }
  ];

  const joursSemaine = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getSeancesByJour = (jour) => {
    return planningData.filter(seance => seance.jour === jour);
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
                    <FiCalendar />
                  </div>
                  <div>
                    <h1 style={{ 
                      color: 'var(--dark-blue)', 
                      fontWeight: 800, 
                      fontSize: '1.7rem', 
                      marginBottom: 4, 
                      letterSpacing: '-1px' 
                    }}>
                      Mon Planning
                    </h1>
                    <p style={{ 
                      color: 'var(--light-blue)', 
                      fontWeight: 500, 
                      fontSize: '1.01rem' 
                    }}>
                      Consultez votre planning de formations
                    </p>
                  </div>
                </div>
              </div>

              {/* Planning hebdomadaire */}
              <div style={{ 
                background: 'var(--white)', 
                borderRadius: 22, 
                boxShadow: '0 8px 32px rgba(44,62,80,0.10)', 
                padding: '2.5rem 2.2rem', 
                marginBottom: 32 
              }}>
                <h2 style={{ 
                  color: 'var(--dark-blue)', 
                  fontWeight: 700, 
                  fontSize: '1.4rem', 
                  marginBottom: 24 
                }}>
                  Planning de la semaine
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {joursSemaine.slice(0, 5).map((jour) => {
                    const seances = getSeancesByJour(jour);
                    return (
                      <div key={jour} style={{ 
                        border: '1px solid var(--light-gray)', 
                        borderRadius: 12, 
                        overflow: 'hidden' 
                      }}>
                        <div style={{ 
                          background: 'var(--dark-blue)', 
                          color: 'var(--white)', 
                          padding: '12px 20px',
                          fontWeight: 600,
                          fontSize: '1.1rem'
                        }}>
                          {jour}
                        </div>
                        
                        {seances.length > 0 ? (
                          <div style={{ padding: '16px 20px' }}>
                            {seances.map((seance) => (
                              <div key={seance.id} style={{ 
                                background: 'var(--light-gray)', 
                                borderRadius: 8, 
                                padding: '16px', 
                                marginBottom: 12,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}>
                                <div style={{ flex: 1 }}>
                                  <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 12, 
                                    marginBottom: 8 
                                  }}>
                                    <FiBook style={{ 
                                      color: 'var(--light-blue)', 
                                      fontSize: 18 
                                    }} />
                                    <h3 style={{ 
                                      color: 'var(--dark-blue)', 
                                      fontWeight: 600, 
                                      fontSize: '1.1rem', 
                                      margin: 0 
                                    }}>
                                      {seance.formation}
                                    </h3>
                                  </div>
                                  
                                  <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 16 
                                  }}>
                                    <span style={{ 
                                      color: 'var(--light-blue)', 
                                      fontSize: '0.9rem', 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      gap: 4 
                                    }}>
                                      <FiClock size={14} />
                                      {seance.heure}
                                    </span>
                                    <span style={{ 
                                      color: 'var(--gold)', 
                                      fontSize: '0.9rem', 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      gap: 4 
                                    }}>
                                      <FiMapPin size={14} />
                                      {seance.salle}
                                    </span>
                                    <span style={{ 
                                      color: 'var(--light-blue)', 
                                      fontSize: '0.9rem', 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      gap: 4 
                                    }}>
                                      <FiUsers size={14} />
                                      {seance.participants} participants
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ 
                            padding: '20px', 
                            textAlign: 'center', 
                            color: 'var(--dark-blue)', 
                            opacity: 0.6,
                            fontStyle: 'italic'
                          }}>
                            Aucune séance prévue
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Planning;