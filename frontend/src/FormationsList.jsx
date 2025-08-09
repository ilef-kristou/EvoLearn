// FormationsList.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBook, FiCalendar } from 'react-icons/fi';
import Header from './Components/Header';
import Footer from './Components/Footer';

// Mock des formations (à centraliser plus tard)
const formations = [
  {
    id: 1,
    titre: "React Avancé",
    description: "Maîtrisez les hooks, context API et les performances React.",
    duree: "6 semaines",
    categorie: "Développement Web",
    couleur: "#2C3E50",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
  },
  {
    id: 2,
    titre: "UX/UI Design",
    description: "Apprenez à créer des interfaces utilisateur intuitives.",
    duree: "8 semaines",
    categorie: "Design",
    couleur: "#2C3E50",
    image: "https://images.unsplash.com/photo-1541462608143-67571c6738dd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
  },
  {
    id: 3,
    titre: "Data Science",
    description: "Introduction au machine learning et à l'analyse de données.",
    duree: "10 semaines",
    categorie: "Data",
    couleur: "#2C3E50",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
  },
  {
    id: 4,
    titre: "React Avancé",
    description: "Maîtrisez les hooks, context API et les performances React.",
    duree: "6 semaines",
    categorie: "Développement Web",
    couleur: "#2C3E50",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
  },
  {
    id: 5,
    titre: "UX/UI Design",
    description: "Apprenez à créer des interfaces utilisateur intuitives.",
    duree: "8 semaines",
    categorie: "Design",
    couleur: "#2C3E50",
    image: "https://images.unsplash.com/photo-1541462608143-67571c6738dd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
  },
  {
    id: 6,
    titre: "Data Science",
    description: "Introduction au machine learning et à l'analyse de données.",
    duree: "10 semaines",
    categorie: "Data",
    couleur: "#2C3E50",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
  }
];

const FormationsList = () => {
  const navigate = useNavigate();
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
                  border: '2px solid #2C3E50',
                }}
                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-7px) scale(1.025)'}
                onMouseOut={e => e.currentTarget.style.transform = 'none'}
              >
                <div style={{ height: 180, background: '#2C3E50', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <img src={formation.image} alt={formation.titre} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.92)' }} />
                </div>
                <div style={{ padding: '1.5rem 1.2rem 1.2rem 1.2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <span style={{ background: '#2C3E50', color: '#fff', borderRadius: 12, fontSize: 13, fontWeight: 600, padding: '3px 14px', alignSelf: 'flex-start', marginBottom: 10 }}>{formation.categorie}</span>
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
  
    </>
  );
};

export default FormationsList;
