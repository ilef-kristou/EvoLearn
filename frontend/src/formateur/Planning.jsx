import React, { useState, useEffect } from 'react';
import { FiCalendar, FiClock, FiMapPin, FiUsers, FiBook } from 'react-icons/fi';
import { motion } from 'framer-motion';
import FormateurSidebar from './FormateurSidebar';
import { useNavigate } from 'react-router-dom';
import Header from '../Components/Header';
import Footer from '../Components/Footer';

const API_BASE = "http://localhost:8000/api";
const JOURS_SEMAINE = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];

const Planning = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [plannings, setPlannings] = useState([]);
  const [formateurId, setFormateurId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('jwt');

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff)).toISOString().split('T')[0];
  };

  const fetchApi = async (url, options = {}) => {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erreur serveur');
      }

      return await response.json();
    } catch (err) {
      console.error('API Error:', err);
      throw err;
    }
  };

  useEffect(() => {
    if (!token) {
      setError('Utilisateur non authentifié. Veuillez vous connecter.');
      setLoading(false);
      navigate('/login');
      return;
    }

    const fetchUserAndPlanning = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch user to get formateur ID
        const userData = await fetchApi(`${API_BASE}/user`);
        if (userData.role !== 'formateur') {
          throw new Error('Accès refusé. Vous devez être formateur.');
        }
        setFormateurId(userData.id);

        // Fetch planning for the formateur
        const response = await fetchApi(`${API_BASE}/plannings/formateur/${userData.id}`);
        
        // Normaliser les données pour s'assurer que c'est toujours un tableau
        const normalizedPlannings = Array.isArray(response?.plannings) ? response.plannings : [];
        setPlannings(normalizedPlannings);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndPlanning();
  }, [token, navigate]);

  const getSeancesByJour = (jour) => {
    if (!Array.isArray(plannings)) return [];
    return plannings.filter(seance => seance?.jour === jour);
  };

  const handleWeekChange = (offset) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + offset * 7);
    setSelectedDate(current.toISOString().split('T')[0]);
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
              {loading && (
                <div style={{
                  textAlign: 'center',
                  padding: '2rem',
                  color: 'var(--dark-blue)'
                }}>
                  Chargement du planning...
                </div>
              )}

              {error && (
                <div style={{
                  background: '#ef4444',
                  color: 'white',
                  padding: '12px 16px',
                  borderRadius: 8,
                  margin: '16px 0'
                }}>
                  Erreur : {error}
                </div>
              )}

              {successMessage && (
                <div style={{
                  background: '#10b981',
                  color: 'white',
                  padding: '12px 16px',
                  borderRadius: 8,
                  margin: '16px 0'
                }}>
                  {successMessage}
                </div>
              )}

              {!loading && !error && (
                <>
                  <motion.div
                    style={{ 
                      background: 'var(--white)', 
                      borderRadius: 22, 
                      boxShadow: '0 8px 32px rgba(44,62,80,0.10)', 
                      padding: '2.5rem 2.2rem', 
                      marginBottom: 32 
                    }}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, type: 'spring' }}
                  >
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
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                      <motion.button
                        onClick={() => handleWeekChange(-1)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                          padding: '8px 16px',
                          borderRadius: 8,
                          border: 'none',
                          background: 'var(--dark-blue)',
                          color: 'var(--white)',
                          cursor: 'pointer'
                        }}
                      >
                        Semaine précédente
                      </motion.button>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        style={{
                          padding: '8px',
                          borderRadius: 8,
                          border: '1px solid var(--light-gray)'
                        }}
                      />
                      <motion.button
                        onClick={() => handleWeekChange(1)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                          padding: '8px 16px',
                          borderRadius: 8,
                          border: 'none',
                          background: 'var(--dark-blue)',
                          color: 'var(--white)',
                          cursor: 'pointer'
                        }}
                      >
                        Semaine suivante
                      </motion.button>
                    </div>
                  </motion.div>

                  <motion.div
                    style={{ 
                      background: 'var(--white)', 
                      borderRadius: 22, 
                      boxShadow: '0 8px 32px rgba(44,62,80,0.10)', 
                      padding: '2.5rem 2.2rem', 
                      marginBottom: 32 
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, type: 'spring' }}
                  >
                    <h2 style={{ 
                      color: 'var(--dark-blue)', 
                      fontWeight: 700, 
                      fontSize: '1.4rem', 
                      marginBottom: 24 
                    }}>
                      Planning de la semaine ({formatDate(getWeekStart(selectedDate))})
                    </h2>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {JOURS_SEMAINE.map((jour) => {
                        const seances = getSeancesByJour(jour);
                        return (
                          <motion.div
                            key={jour}
                            style={{ 
                              border: '1px solid var(--light-gray)', 
                              borderRadius: 12, 
                              overflow: 'hidden' 
                            }}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                          >
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
                                  <motion.div
                                    key={seance.id}
                                    style={{ 
                                      background: 'var(--light-gray)', 
                                      borderRadius: 8, 
                                      padding: '16px', 
                                      marginBottom: 12,
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center'
                                    }}
                                    whileHover={{ y: -3 }}
                                    transition={{ type: 'spring', stiffness: 300 }}
                                  >
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
                                          {seance.formation?.titre || 'Formation inconnue'}
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
                                          {seance.heure || 'Non spécifié'}
                                        </span>
                                        <span style={{ 
                                          color: 'var(--gold)', 
                                          fontSize: '0.9rem', 
                                          display: 'flex', 
                                          alignItems: 'center', 
                                          gap: 4 
                                        }}>
                                          <FiMapPin size={14} />
                                          {seance.salle || 'Non attribuée'}
                                        </span>
                                        {seance.formation?.participants && (
                                        <span style={{ 
                                          color: 'var(--light-blue)', 
                                          fontSize: '0.9rem', 
                                          display: 'flex', 
                                          alignItems: 'center', 
                                          gap: 4 
                                        }}>
                                          <FiUsers size={14} />
                                          {seance.formation.participants} participants
                                        </span>
                                        )}
                                      </div>
                                      <p style={{
                                        color: 'var(--dark-blue)',
                                        fontSize: '0.9rem',
                                        marginTop: 8
                                      }}>
                                        {seance.formation?.description || 'Aucune description'}
                                      </p>
                                    </div>
                                    <div style={{
                                      padding: '8px 12px',
                                      background: seance.statut === 'accepte' ? '#10b981' : 
                                                seance.statut === 'refuse' ? '#ef4444' : '#f59e0b',
                                      color: 'white',
                                      borderRadius: 6,
                                      fontSize: '0.8rem',
                                      fontWeight: 600
                                    }}>
                                      {seance.statut === 'accepte' ? 'Accepté' : 
                                       seance.statut === 'refuse' ? 'Refusé' : 'En attente'}
                                    </div>
                                  </motion.div>
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
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                </>
              )}
            </div>
          </main>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Planning;