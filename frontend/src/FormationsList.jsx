import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBook, FiCalendar } from 'react-icons/fi';
import Header from './Components/Header';
import Footer from './Components/Footer';

const API_BASE = "http://localhost:8000/api";

// API service with auth
const fetchApi = async (url, options = {}) => {
  const token = localStorage.getItem('jwt');
  
  if (!token && !url.includes('/auth')) {
    throw new Error('Authentication token missing');
  }

  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...(options.headers || {})
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    if (response.status === 401) {
      localStorage.removeItem('jwt');
      window.location.href = '/login';
      return;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Helper function to calculate duration in weeks
const calculateDuration = (dateDebut, dateFin) => {
  if (!dateDebut || !dateFin) return "Inconnue";
  const start = new Date(dateDebut);
  const end = new Date(dateFin);
  const diffTime = Math.abs(end - start);
  const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
  return `${diffWeeks} semaine${diffWeeks > 1 ? 's' : ''}`;
};

const FormationsList = () => {
  const navigate = useNavigate();
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadFormations = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await fetchApi(`${API_BASE}/formations`);
        
        // Map API data to match expected format
        const formattedFormations = data.map(formation => ({
          id: formation.id,
          titre: formation.titre,
          description: formation.description,
          duree: calculateDuration(formation.date_debut, formation.date_fin),
          categorie: formation.categorie || 'Général', // Default if categorie is missing
          couleur: formation.couleur || '#2C3E50', // Default if couleur is missing
          image: formation.image || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
        }));

        setFormations(formattedFormations);
      } catch (err) {
        setError(err.message);
        console.error("Erreur de chargement des formations:", err);
      } finally {
        setLoading(false);
      }
    };

    loadFormations();
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f4f7fb', padding: '3rem 0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <p style={{ color: '#2C3E50', fontSize: '1.2rem' }}>Chargement en cours...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: '#f4f7fb', padding: '3rem 0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#EF4444', fontSize: '1.2rem' }}>Erreur: {error}</p>
          <button
            onClick={() => navigate('/')}
            style={{ background: '#2C3E50', color: '#fff', padding: '0.5rem 1rem', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '1rem' }}
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
  
      <div style={{ minHeight: '100vh', background: '#f4f7fb', padding: '3rem 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1rem' }}>
          <h1 style={{ color: '#2C3E50', fontWeight: 800, fontSize: '2.5rem', marginBottom: 32, textAlign: 'center', letterSpacing: '-1px' }}>
            Toutes nos formations
          </h1>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
            {formations.map(formation => (
              <div
                key={formation.id}
                onClick={() => navigate(`/formation/${formation.id}`)}
                style={{
                  background: '#fff',
                  borderRadius: 22,
                  boxShadow: '0 6px 32px rgba(44,62,80,0.13)',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.18s cubic-bezier(.4,2,.6,1), box-shadow 0.18s',
                  border: `2px solid ${formation.couleur}`
                }}
                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-7px) scale(1.025)'}
                onMouseOut={e => e.currentTarget.style.transform = 'none'}
              >
                <div style={{ height: 180, background: formation.couleur, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <img src={formation.image} alt={formation.titre} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.92)' }} />
                </div>
                <div style={{ padding: '1.5rem 1.2rem 1.2rem 1.2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <span style={{ background: formation.couleur, color: '#fff', borderRadius: 12, fontSize: 13, fontWeight: 600, padding: '3px 14px', alignSelf: 'flex-start', marginBottom: 10 }}>{formation.categorie}</span>
                  <h2 style={{ color: '#2C3E50', fontWeight: 700, fontSize: '1.3rem', margin: 0, marginBottom: 8 }}>{formation.titre}</h2>
                  <p style={{ color: '#374151', fontSize: '1.05rem', margin: 0, marginBottom: 18, opacity: 0.92 }}>{formation.description}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 'auto' }}>
                    <span style={{ color: '#2C3E50', fontWeight: 600, fontSize: 15, display: 'flex', alignItems: 'center', gap: 5 }}><FiCalendar /> {formation.duree}</span>
                    <span style={{ color: '#2C3E50', fontWeight: 600, fontSize: 15, display: 'flex', alignItems: 'center', gap: 5 }}><FiBook /> Détails</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default FormationsList;