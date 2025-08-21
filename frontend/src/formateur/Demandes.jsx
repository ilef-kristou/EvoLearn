import React, { useState, useEffect } from 'react';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import FormateurSidebar from './FormateurSidebar';
import { FiMail, FiCheck, FiX, FiBook, FiCalendar, FiClock, FiMapPin, FiMessageSquare } from 'react-icons/fi';

const API_BASE = "http://localhost:8000/api";

const Demandes = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [refuseReason, setRefuseReason] = useState('');
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const [formateurId, setFormateurId] = useState(null);

  const token = localStorage.getItem('jwt');

  const fetchApi = async (url, options = {}) => {
    if (!token && !url.includes('/auth')) {
      throw new Error('Authentication token missing');
    }

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, { ...options, headers });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }
      return response.status === 204 ? null : await response.json();
    } catch (err) {
      console.error('API call failed:', { url, error: err.message, response: await fetch(url, { ...options, headers }).then(res => res.text()).catch(() => 'No response') });
      throw err;
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
        const data = await fetchApi(`${API_BASE}/formateur/profile`);
        console.log('Formateur profile:', data);
        setFormateurId(data.id);
      } catch (err) {
        setError(`Erreur lors de la récupération du profil: ${err.message}`);
        setLoading(false);
      }
    };

    const fetchDemandes = async () => {
      if (!formateurId) return;
    
      try {
        setLoading(true);
        const response = await fetchApi(`${API_BASE}/plannings/formateur/${formateurId}`);
        console.log('API response /plannings/formateur:', response);
    
        const planningsData = Array.isArray(response?.plannings) ? response.plannings : [];
        console.log('Plannings data:', planningsData);
    
        if (planningsData.length === 0) {
          console.log('No plannings found for formateur:', formateurId);
          setDemandes([]);
          setLoading(false);
          return;
        }
    
        // Group jours by planning_id
        const groupedPlannings = planningsData.reduce((acc, jour) => {
          const planningId = jour.planning_id;
          if (!acc[planningId]) {
            acc[planningId] = {
              id: planningId,
              formation: jour.formation?.titre || 'Formation inconnue',
              chargeFormation: 'Chargé inconnu',
              dateDemande: jour.created_at || new Date().toISOString(),
              dateDebut: jour.formation?.date_debut,
              dateFin: jour.formation?.date_fin,
              participants: jour.formation?.places_disponibles || 20,
              salle: jour.salle || 'Salle inconnue',
              planning: [],
              statut: jour.statut === 'en_attente' ? 'En attente' : 
                      jour.statut === 'accepte' ? 'Acceptée' : 'Refusée',
              description: jour.formation?.description || 'Aucune description',
              cause_refus: jour.cause_refus,
            };
          }
          acc[planningId].planning.push({
            jour: jour.jour || 'Jour inconnu',
            heure: jour.heure_debut && jour.heure_fin
              ? `${jour.heure_debut}-${jour.heure_fin}`
              : 'Heure non spécifiée',
          });
          return acc;
        }, {});
    
        const mappedDemandes = Object.values(groupedPlannings).filter(demande => demande !== null);
        console.log('Mapped demandes:', mappedDemandes);
        setDemandes(mappedDemandes);
      } catch (err) {
        setError(`Erreur lors de la récupération des demandes: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    const loadData = async () => {
      await fetchFormateurProfile();
      if (formateurId) {
        await fetchDemandes();
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

  const handleAccept = async (demande) => {
    try {
      await fetchApi(`${API_BASE}/plannings/${demande.id}/accept`, { method: 'POST' });
      setDemandes(prev =>
        prev.map(d =>
          d.id === demande.id ? { ...d, statut: 'Acceptée', cause_refus: null } : d
        )
      );
      setConfirmation(`Demande pour "${demande.formation}" acceptée avec succès`);
      setTimeout(() => setConfirmation(null), 3000);
      setShowModal(false);
    } catch (err) {
      setError(`Erreur lors de l'acceptation: ${err.message}`);
    }
  };

  const handleRefuse = async (demande) => {
    if (!refuseReason.trim()) {
      setError('Veuillez indiquer un motif de refus');
      return;
    }

    try {
      await fetchApi(`${API_BASE}/plannings/${demande.id}/refuse`, {
        method: 'POST',
        body: JSON.stringify({ cause_refus: refuseReason }),
      });
      setDemandes(prev =>
        prev.map(d =>
          d.id === demande.id ? { ...d, statut: 'Refusée', cause_refus: refuseReason } : d
        )
      );
      setConfirmation(`Demande pour "${demande.formation}" refusée`);
      setTimeout(() => setConfirmation(null), 3000);
      setShowModal(false);
      setRefuseReason('');
    } catch (err) {
      setError(`Erreur lors du refus: ${err.message}`);
    }
  };

  const getStatutColor = (statut) => {
    switch (statut) {
      case 'En attente': return 'var(--gold)';
      case 'Acceptée': return '#10b981';
      case 'Refusée': return '#ef4444';
      default: return 'var(--light-blue)';
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
              {confirmation && (
                <div style={{ 
                  background: '#10b981', 
                  color: 'var(--white)', 
                  padding: '12px 16px', 
                  borderRadius: 8, 
                  marginBottom: 24,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <FiCheck size={16} />
                  {confirmation}
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

              {showModal && selectedDemande && (
                <div style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(44,62,80,0.5)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 1000
                }}>
                  <div style={{
                    background: 'var(--white)',
                    borderRadius: 12,
                    padding: '1.5rem',
                    maxWidth: '500px',
                    width: '100%',
                    boxShadow: '0 8px 32px rgba(44,62,80,0.2)'
                  }}>
                    <h3 style={{
                      color: 'var(--dark-blue)',
                      fontWeight: 600,
                      marginBottom: '1rem'
                    }}>
                      {modalType === 'accept' ? 'Confirmer l\'acceptation' : 'Confirmer le refus'}
                    </h3>
                    <p style={{
                      color: 'var(--dark-blue)',
                      marginBottom: '1rem'
                    }}>
                      {modalType === 'accept'
                        ? `Voulez-vous accepter la demande pour "${selectedDemande.formation}" ?`
                        : `Veuillez indiquer le motif du refus pour "${selectedDemande.formation}".`}
                    </p>
                    {modalType === 'refuse' && (
                      <textarea
                        value={refuseReason}
                        onChange={(e) => setRefuseReason(e.target.value)}
                        placeholder="Motif du refus"
                        style={{
                          width: '100%',
                          padding: '0.7rem',
                          borderRadius: 10,
                          border: '1px solid var(--light-gray)',
                          fontSize: '1rem',
                          background: 'var(--light-gray)',
                          outline: 'none',
                          marginBottom: '1rem',
                          resize: 'vertical'
                        }}
                      />
                    )}
                    <div style={{
                      display: 'flex',
                      gap: 12,
                      justifyContent: 'flex-end'
                    }}>
                      <button
                        onClick={() => {
                          setShowModal(false);
                          setRefuseReason('');
                          setSelectedDemande(null);
                        }}
                        style={{
                          background: 'var(--light-gray)',
                          color: 'var(--dark-blue)',
                          border: 'none',
                          borderRadius: 8,
                          padding: '0.8rem 1.5rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Annuler
                      </button>
                      <button
                        onClick={() => modalType === 'accept' 
                          ? handleAccept(selectedDemande) 
                          : handleRefuse(selectedDemande)
                        }
                        style={{
                          background: modalType === 'accept' ? 'rgb(159 225 203)' : 'rgb(193 84 84)',
                          color: modalType === 'accept' ? '#146e50' : 'var(--white)',
                          border: 'none',
                          borderRadius: 8,
                          padding: '0.8rem 1.5rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        {modalType === 'accept' ? 'Confirmer' : 'Refuser'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {loading && (
                <div style={{ 
                  textAlign: 'center', 
                  color: 'var(--dark-blue)', 
                  fontSize: '1.2rem' 
                }}>
                  Chargement des demandes...
                </div>
              )}

              {!loading && !error && demandes.length === 0 && (
                <div style={{ 
                  textAlign: 'center', 
                  color: 'var(--light-blue)', 
                  fontSize: '1.2rem' 
                }}>
                  Aucune demande disponible
                </div>
              )}

              {!loading && !error && demandes.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {demandes.map((demande) => (
                    <div key={demande.id} style={{ 
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
                              {demande.formation}
                            </h2>
                            <span style={{ 
                              background: getStatutColor(demande.statut),
                              color: 'var(--dark-blue)',
                              padding: '4px 12px',
                              borderRadius: 20,
                              fontSize: '0.8rem',
                              fontWeight: 600
                            }}>
                              {demande.statut}
                            </span>
                          </div>
                          
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 20, 
                            marginBottom: 16 
                          }}>
                            <span style={{ 
                              color: 'var(--gold)', 
                              fontSize: '0.9rem', 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 4 
                            }}>
                              <FiBook size={16} />
                              {demande.participants} participants
                            </span>
                          </div>
                          {demande.statut === 'Refusée' && demande.cause_refus && (
                            <div style={{ 
                              color: '#ef4444', 
                              fontSize: '0.9rem', 
                              marginBottom: 16 
                            }}>
                              Motif du refus : {demande.cause_refus}
                            </div>
                          )}
                        </div>
                        
                        {demande.statut === 'En attente' && (
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button 
                              onClick={() => {
                                setSelectedDemande(demande);
                                setModalType('accept');
                                setShowModal(true);
                              }}
                              style={{ 
                                background: 'rgb(159 225 203)', 
                                color: '#146e50', 
                                border: 'none', 
                                borderRadius: 8, 
                                padding: '8px 16px', 
                                cursor: 'pointer', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 4,
                                fontWeight: 600
                              }}
                            >
                              <FiCheck size={16} />
                              Accepter
                            </button>
                            <button 
                              onClick={() => {
                                setSelectedDemande(demande);
                                setModalType('refuse');
                                setShowModal(true);
                              }}
                              style={{ 
                                background: 'rgb(193 84 84)', 
                                color: 'var(--white)', 
                                border: 'none', 
                                borderRadius: 8, 
                                padding: '8px 16px', 
                                cursor: 'pointer', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 4,
                                fontWeight: 600
                              }}
                            >
                              <FiX size={16} />
                              Refuser
                            </button>
                          </div>
                        )}
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
                              Du {formatDate(demande.dateDebut)} au {formatDate(demande.dateFin)}
                            </span>
                          </div>
                        </div>

                        <div>
                          <h3 style={{ 
                            color: 'var(--dark-blue)', 
                            fontWeight: 600, 
                            marginBottom: 12 
                          }}>
                            Planning proposé
                          </h3>
                          <div style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: 8 
                          }}>
                            {demande.planning.length > 0 ? (
                              demande.planning.map((seance, idx) => (
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
                                    color: 'var(--dark-blue)', 
                                    fontWeight: 500 
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

                      <div style={{ 
                        marginTop: 16, 
                        padding: '12px 16px', 
                        background: 'var(--light-gray)', 
                        borderRadius: 8, 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 8 
                      }}>
                        <FiMessageSquare style={{ 
                          color: 'var(--light-blue)', 
                          fontSize: 16 
                        }} />
                        <span style={{ 
                          color: 'var(--dark-blue)', 
                          fontSize: '0.9rem' 
                        }}>
                          Demande reçue le {formatDate(demande.dateDemande)}
                        </span>
                      </div>

                      <div style={{ 
                        marginTop: 16, 
                        padding: '16px', 
                        background: 'var(--white)', 
                        border: '1px solid var(--light-gray)', 
                        borderRadius: 10,
                        minHeight: '100px', 
                        overflowY: 'auto'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          marginBottom: 12
                        }}>
                          <FiMessageSquare style={{ 
                            color: 'var(--light-blue)', 
                            fontSize: 18 
                          }} />
                          <h3 style={{ 
                            color: 'var(--dark-blue)', 
                            fontWeight: 600, 
                            fontSize: '1.1rem',
                            margin: 0 
                          }}>
                            Description
                          </h3>
                        </div>
                        <p style={{ 
                          color: 'var(--dark-blue)', 
                          fontSize: '1rem', 
                          lineHeight: 1.5,
                          margin: 0 
                        }}>
                          {demande.description}
                        </p>
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

export default Demandes;