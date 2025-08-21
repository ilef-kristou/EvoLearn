import React, { useState, useEffect } from 'react';
import Header from '../Components/Header';
import FormateurSidebar from './FormateurSidebar';
import { FiBook, FiCalendar, FiUsers, FiClock, FiMapPin } from 'react-icons/fi';

const API_BASE = "http://localhost:8000/api";

const MesFormations = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [formateurId, setFormateurId] = useState(null);
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('jwt');

  // Function to calculate duration between two dates
  const calculateDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return 'Non spécifié';
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (isNaN(start) || isNaN(end) || end < start) return 'Non spécifié';

      const diffTime = end - start;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 13) {
        return `${diffDays} jour${diffDays > 1 ? 's' : ''}`;
      } else if (diffDays <= 27) {
        const weeks = Math.round(diffDays / 7);
        return `${weeks} semaine${weeks > 1 ? 's' : ''}`;
      } else {
        const months = Math.round(diffDays / 30);
        return `${months} mois`;
      }
    } catch {
      return 'Non spécifié';
    }
  };

  useEffect(() => {
    if (!token) {
      setError("Utilisateur non authentifié. Veuillez vous connecter.");
      setLoading(false);
      return;
    }

    const fetchFormateurProfile = async () => {
      try {
        const response = await fetch(`${API_BASE}/formateur/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Erreur ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        setFormateurId(data.id);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    const fetchFormations = async () => {
      if (!formateurId) return;

      try {
        setLoading(true);
        const response = await fetch(`${API_BASE}/plannings/formateur/${formateurId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Erreur ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log('API response /plannings/formateur:', data);

        // Normalize data: group by formation.id for accepted plannings
        const planningsData = Array.isArray(data.plannings) ? data.plannings : [];
        console.log('Plannings data:', planningsData);

        if (!Array.isArray(planningsData) || planningsData.length === 0) {
          console.log('No plannings found for formateur:', formateurId);
          setFormations([]);
          setLoading(false);
          return;
        }

        // Group sessions by formation.id
        const groupedFormations = planningsData
          .filter(session => session.statut === 'accepte' && session.formation?.id)
          .reduce((acc, session) => {
            const formationId = session.formation.id;
            if (!acc[formationId]) {
              const start = session.formation?.date_debut ? new Date(session.formation.date_debut) : null;
              const end = session.formation?.date_fin ? new Date(session.formation.date_fin) : null;
              const now = new Date();
              let progression = 0.0;
              if (start && end && !isNaN(start) && !isNaN(end) && end > start) {
                progression = now >= end ? 1.0 : now <= start ? 0.0 : (now - start) / (end - start);
              }

              acc[formationId] = {
                id: formationId,
                titre: session.formation?.titre || 'Formation inconnue',
                description: session.formation?.description || 'Aucune description',
                statut: 'Acceptée',
                participants: session.formation?.places_disponibles || 20,
                progression,
                dateDebut: session.formation?.date_debut,
                dateFin: session.formation?.date_fin,
                planning: [],
                niveau: session.formation?.niveau || 'Non spécifié',
                duree: calculateDuration(session.formation?.date_debut, session.formation?.date_fin),
              };
            }

            // Add session to the planning array
            acc[formationId].planning.push({
              jour: session.jour || 'Jour inconnu',
              heure: session.heure_debut && session.heure_fin
                ? `${session.heure_debut}-${session.heure_fin}`
                : 'Heure non spécifiée',
              salle: session.salle || 'Salle inconnue',
            });

            return acc;
          }, {});

        // Sort planning by day order (Lundi to Dimanche)
        const joursOrder = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
        const mappedFormations = Object.values(groupedFormations).map(formation => ({
          ...formation,
          planning: formation.planning.sort((a, b) => joursOrder.indexOf(a.jour) - joursOrder.indexOf(b.jour)),
        }));

        console.log('Mapped formations:', mappedFormations);
        setFormations(mappedFormations);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const loadData = async () => {
      await fetchFormateurProfile();
      if (formateurId) {
        await fetchFormations();
      }
    };

    loadData();
  }, [token, formateurId]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Date inconnue';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return 'Date inconnue';
    }
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

              {loading && (
                <div style={{ 
                  textAlign: 'center', 
                  color: 'var(--dark-blue)', 
                  fontSize: '1.2rem' 
                }}>
                  Chargement des formations...
                </div>
              )}

              {error && (
                <div style={{ 
                  background: '#ef4444', 
                  color: 'var(--white)', 
                  padding: '12px 16px', 
                  borderRadius: 8, 
                  marginBottom: 24 
                }}>
                  Erreur : {error}
                </div>
              )}

              {!loading && !error && formations.length === 0 && (
                <div style={{ 
                  textAlign: 'center', 
                  color: 'var(--light-blue)', 
                  fontSize: '1.2rem' 
                }}>
                  Aucune formation acceptée disponible
                </div>
              )}

              {!loading && !error && formations.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {formations.map((formation) => (
                    <div key={formation.id} style={{ 
                      background: 'var(--white)', 
                      borderRadius: 22, 
                      boxShadow: '0 8px 32px rgba(44,62,80,0.10)', 
                      padding: '2.5rem 2.2rem' 
                    }}>
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
                              background: '#10b981',
                              color: 'var(--dark-blue)',
                              padding: '4px 12px',
                              borderRadius: 20,
                              fontSize: '0.8rem',
                              fontWeight: 600
                            }}>
                              {formation.statut}
                            </span>
                          </div>
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
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '1fr 1fr', 
                        gap: 24 
                      }}>
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
                            {formation.planning.length > 0 ? (
                              formation.planning.map((seance, idx) => (
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
                              ))
                            ) : (
                              <div style={{ 
                                color: 'var(--light-blue)', 
                                fontSize: '0.9rem' 
                              }}>
                                Aucun planning défini
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
      
    </div>
  );
};

export default MesFormations;