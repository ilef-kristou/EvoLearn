import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import ParticipantSidebar from './ParticipantSidebar';
import { FiBook, FiCalendar, FiCheckCircle } from 'react-icons/fi';

const API_BASE = "http://localhost:8000/api";

const MesFormations = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('jwt');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setError("Utilisateur non authentifié. Veuillez vous connecter.");
      setLoading(false);
      navigate('/login');
      return;
    }

    const fetchFormations = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE}/demandes-inscription`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('jwt');
            navigate('/login');
            throw new Error('Session expirée. Veuillez vous reconnecter.');
          }
          if (response.status === 403) {
            throw new Error('Accès refusé. Vous devez être participant.');
          }
          const errorText = await response.text();
          throw new Error(`Erreur ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log('API Response (Demandes):', data);

        // Handle different response formats
        let demandes = Array.isArray(data) ? data : data.demandes || [];
        if (!Array.isArray(demandes)) {
          throw new Error('La réponse API n\'est pas un tableau de demandes');
        }

        const mappedFormations = demandes
          .filter((demande) => ['Acceptée', 'En attente'].includes(demande.statut))
          .map((demande) => {
            const start = new Date(demande.formation?.date_debut);
            const end = new Date(demande.formation?.date_fin);
            const now = new Date();
            const progression = demande.statut === 'Acceptée' && !isNaN(start) && !isNaN(end) && end > start
              ? now >= end ? 1.0 : now <= start ? 0.0 : (now - start) / (end - start)
              : 0.0;

            return {
              id: demande.formation?.id || demande.id,
              titre: demande.formation?.titre || 'Formation inconnue',
              description: demande.formation?.description || 'Aucune description',
              statut: demande.statut,
              dateDebut: demande.formation?.date_debut,
              dateFin: demande.formation?.date_fin,
              progression,
            };
          });

        setFormations(mappedFormations);
      } catch (err) {
        setError(err.message);
        console.error('Erreur lors du chargement des formations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFormations();
  }, [token, navigate]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Date inconnue';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div style={{ minHeight: '100vh', width: '100%', background: 'var(--light)', display: 'flex', flexDirection: 'column' }}>
    
      
      <div style={{ flex: 1, marginLeft: '200px', marginRight: '200px', display: 'flex', justifyContent: 'center', padding: '2.5rem 0', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', width: '100%', maxWidth: '1400px', gap: 32 }}>
          <div style={{ minWidth: isSidebarCollapsed ? 70 : 220, transition: 'min-width 0.3s' }}>
            <ParticipantSidebar onToggle={setIsSidebarCollapsed} />
          </div>
          <main style={{ flex: 1, maxWidth: 900, width: '100%' }}>
            {loading && (
              <div style={{ textAlign: 'center', color: 'var(--dark-blue)', fontSize: '1.2rem' }}>
                Chargement des formations...
              </div>
            )}
            {error && (
              <div style={{ background: '#ef4444', color: 'var(--white)', padding: '12px 16px', borderRadius: 8, marginBottom: 24 }}>
                Erreur : {error}
              </div>
            )}
            {!loading && !error && formations.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--light-blue)', fontSize: '1.2rem' }}>
                Aucune formation disponible
              </div>
            )}
            {!loading && !error && formations.length > 0 && formations.map((formation) => (
              <div key={formation.id} style={{ background: 'var(--white)', borderRadius: 22, boxShadow: '0 8px 32px rgba(44,62,80,0.10)', padding: '2.5rem 2.2rem', marginBottom: 32 }}>
                <h2 style={{ color: 'var(--dark-blue)', fontWeight: 800, fontSize: '1.7rem', marginBottom: 18, letterSpacing: '-1px' }}>Ma Formation</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 22, marginBottom: 18 }}>
                  <div style={{ background: 'var(--dark-blue)', color: 'var(--white)', borderRadius: 12, width: 54, height: 54, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, boxShadow: '0 2px 8px rgba(44,62,80,0.3)' }}>
                    <FiBook />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: 'var(--dark-blue)', fontSize: '1.15rem', marginBottom: 2 }}>{formation.titre}</div>
                    <div style={{ color: 'var(--light-blue)', fontWeight: 500, fontSize: '1.01rem', marginBottom: 2 }}>
                      <FiCheckCircle style={{ color: formation.statut === 'Acceptée' ? '#10b981' : '#f59e0b', marginRight: 6 }} />
                      {formation.statut}
                    </div>
                  </div>
                </div>
                <div style={{ color: 'var(--dark-blue)', fontSize: '1.08rem', marginBottom: 18, opacity: 0.97, lineHeight: 1.7 }}>{formation.description}</div>
                <div style={{ marginBottom: 28 }}>
                  <div style={{ fontWeight: 600, color: 'var(--light-blue)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FiCalendar style={{ color: 'var(--light-blue)', fontSize: 20 }} />
                    Période de formation
                  </div>
                  <div style={{ background: 'var(--light-gray)', borderRadius: 10, padding: '1rem 1.2rem', display: 'flex', alignItems: 'center', gap: 18 }}>
                    <span style={{ fontWeight: 600, color: 'var(--dark-blue)' }}>Du {formatDate(formation.dateDebut)} au {formatDate(formation.dateFin)}</span>
                  </div>
                </div>
                {formation.statut === 'Acceptée' && (
                  <div style={{ marginBottom: 28 }}>
                    <div style={{ fontWeight: 600, color: 'var(--light-blue)', marginBottom: 8 }}>Avancement de la formation</div>
                    <div style={{ background: 'var(--light-gray)', borderRadius: 8, height: 18, width: '100%', overflow: 'hidden', marginBottom: 6 }}>
                      <div style={{ width: `${formation.progression * 100}%`, background: 'linear-gradient(90deg, var(--light-blue) 0%, var(--gold) 100%)', height: '100%', borderRadius: 8, transition: 'width 0.4s' }}></div>
                    </div>
                    <div style={{ color: 'var(--dark-blue)', fontWeight: 600, fontSize: '1.01rem' }}>{Math.round(formation.progression * 100)}% complété</div>
                  </div>
                )}
              </div>
            ))}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MesFormations;