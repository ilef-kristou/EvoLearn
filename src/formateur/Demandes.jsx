import React, { useState } from 'react';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import FormateurSidebar from './FormateurSidebar';
import { FiMail, FiCheck, FiX, FiUser, FiBook, FiCalendar, FiClock, FiMapPin, FiMessageSquare } from 'react-icons/fi';

const Demandes = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [refuseReason, setRefuseReason] = useState('');

  const demandesData = [
    {
      id: 1,
      formation: 'React Avancé',
      chargeFormation: 'Marie Martin',
      dateDemande: '2024-06-15',
      dateDebut: '2024-07-01',
      dateFin: '2024-09-30',
      participants: 25,
      salle: 'A1',
      planning: [
        { jour: 'Lundi', heure: '09:00-12:00' },
        { jour: 'Mercredi', heure: '14:00-17:00' }
      ],
      statut: 'En attente',
      description: 'Formation React avancée pour une équipe de développeurs expérimentés'
    },
    {
      id: 2,
      formation: 'UX/UI Design',
      chargeFormation: 'Pierre Durand',
      dateDemande: '2024-06-14',
      dateDebut: '2024-07-15',
      dateFin: '2024-09-15',
      participants: 18,
      salle: 'B1',
      planning: [
        { jour: 'Mardi', heure: '14:00-17:00' },
        { jour: 'Jeudi', heure: '09:00-12:00' }
      ],
      statut: 'En attente',
      description: 'Formation design d\'interface pour des designers débutants'
    },
    {
      id: 3,
      formation: 'JavaScript ES6+',
      chargeFormation: 'Sophie Lambert',
      dateDemande: '2024-06-13',
      dateDebut: '2024-08-01',
      dateFin: '2024-10-30',
      participants: 32,
      salle: 'A2',
      planning: [
        { jour: 'Lundi', heure: '10:00-13:00' },
        { jour: 'Mercredi', heure: '09:00-12:00' }
      ],
      statut: 'Acceptée',
      description: 'Formation JavaScript moderne pour développeurs web'
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

  const handleAccept = (demande) => {
    setSelectedDemande(demande);
    setModalType('accept');
    setShowModal(true);
  };

  const handleRefuse = (demande) => {
    setSelectedDemande(demande);
    setModalType('refuse');
    setShowModal(true);
  };

  const handleModalSubmit = () => {
    if (modalType === 'refuse' && !refuseReason.trim()) {
      alert('Veuillez indiquer un motif de refus');
      return;
    }
    
    console.log(`${modalType === 'accept' ? 'Acceptation' : 'Refus'} de la demande ${selectedDemande.id}`, modalType === 'refuse' ? `Motif: ${refuseReason}` : '');
    
    setShowModal(false);
    setRefuseReason('');
    setSelectedDemande(null);
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
                    <FiMail />
                  </div>
                  <div>
                    <h1 style={{ 
                      color: 'var(--dark-blue)', 
                      fontWeight: 800, 
                      fontSize: '1.7rem', 
                      marginBottom: 4, 
                      letterSpacing: '-1px' 
                    }}>
                      Demandes de Formation
                    </h1>
                    <p style={{ 
                      color: 'var(--light-blue)', 
                      fontWeight: 500, 
                      fontSize: '1.01rem' 
                    }}>
                      Gérez les demandes des chargés de formation
                    </p>
                  </div>
                </div>
              </div>

              {/* Liste des demandes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {demandesData.map((demande) => (
                  <div key={demande.id} style={{ 
                    background: 'var(--white)', 
                    borderRadius: 22, 
                    boxShadow: '0 8px 32px rgba(44,62,80,0.10)', 
                    padding: '2.5rem 2.2rem' 
                  }}>
                    {/* En-tête demande */}
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
                        
                        {/* Infos rapides */}
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
                          <span style={{ 
                            color: 'var(--light-blue)', 
                            fontSize: '0.9rem', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 4 
                          }}>
                            <FiMapPin size={16} />
                            {demande.salle}
                          </span>
                        </div>
                      </div>
                      
                      {demande.statut === 'En attente' && (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button 
                            onClick={() => handleAccept(demande)}
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
                            onClick={() => handleRefuse(demande)}
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

                    {/* Détails de la demande */}
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
                            Du {formatDate(demande.dateDebut)} au {formatDate(demande.dateFin)}
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
                          Planning proposé
                        </h3>
                        <div style={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          gap: 8 
                        }}>
                          {demande.planning.map((seance, idx) => (
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
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Date de demande */}
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
                  </div>
                ))}
              </div>

              {/* Modal pour accepter/refuser */}
              {showModal && (
                <div style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1000
                }}>
                  <div style={{
                    background: 'var(--white)',
                    borderRadius: 16,
                    padding: '2rem',
                    maxWidth: 500,
                    width: '90%',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                  }}>
                    <h3 style={{ 
                      color: 'var(--dark-blue)', 
                      fontWeight: 700, 
                      fontSize: '1.3rem', 
                      marginBottom: 16 
                    }}>
                      {modalType === 'accept' ? 'Accepter la demande' : 'Refuser la demande'}
                    </h3>
                    
                    <p style={{ 
                      color: 'var(--dark-blue)', 
                      marginBottom: 16 
                    }}>
                      {modalType === 'accept' 
                        ? `Êtes-vous sûr de vouloir accepter la demande pour la formation "${selectedDemande?.formation}" ?`
                        : `Êtes-vous sûr de vouloir refuser la demande pour la formation "${selectedDemande?.formation}" ?`
                      }
                    </p>

                    {modalType === 'refuse' && (
                      <div style={{ marginBottom: 16 }}>
                        <label style={{ 
                          color: 'var(--dark-blue)', 
                          fontWeight: 600, 
                          display: 'block', 
                          marginBottom: 8 
                        }}>
                          Motif du refus *
                        </label>
                        <textarea
                          value={refuseReason}
                          onChange={(e) => setRefuseReason(e.target.value)}
                          placeholder="Indiquez le motif du refus..."
                          style={{
                            width: '100%',
                            minHeight: 100,
                            padding: '12px',
                            border: '1px solid var(--light-gray)',
                            borderRadius: 8,
                            fontSize: '0.9rem',
                            resize: 'vertical'
                          }}
                        />
                      </div>
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
                          padding: '10px 20px',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        Annuler
                      </button>
                      <button
                        onClick={handleModalSubmit}
                        style={{
                          background: modalType === 'accept' ? 'rgb(159, 225, 203)' : 'rgb(193 84 84)',
                          color: 'var(--white)',
                          border: 'none',
                          borderRadius: 8,
                          padding: '10px 20px',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        {modalType === 'accept' ? 'Accepter' : 'Refuser'}
                      </button>
                    </div>
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

export default Demandes;