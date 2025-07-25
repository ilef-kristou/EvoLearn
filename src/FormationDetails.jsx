import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiBook, FiCalendar, FiArrowLeft, FiX } from 'react-icons/fi';
import Header from './Components/Header';
import Footer from './Components/Footer';

const formations = [
  {
    id: 1,
    titre: "React Avancé",
    description: "Maîtrisez les hooks, context API et les performances React. Cette formation avancée vous permettra de concevoir des applications performantes, maintenables et modernes avec React. Vous apprendrez à gérer l'état, optimiser le rendu, utiliser les hooks personnalisés, et bien plus encore.Maîtrisez les hooks, context API et les performances React. Cette formation avancée vous permettra de concevoir des applications performantes, maintenables et modernes avec React. Vous apprendrez à gérer l'état, optimiser le rendu, utiliser les hooks personnalisés, et bien plus encore.Maîtrisez les hooks, context API et les performances React. Cette formation avancée vous permettra de concevoir des applications performantes, maintenables et modernes avec React. Vous apprendrez à gérer l'état, optimiser le rendu, utiliser les hooks personnalisés, et bien plus encore.",
    duree: "6 semaines",
    categorie: "Développement Web",
    couleur: "#2C3E50",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
  },
  {
    id: 2,
    titre: "UX/UI Design",
    description: "Apprenez à créer des interfaces utilisateur intuitives. Cette formation vous initiera aux principes fondamentaux de l'expérience utilisateur et du design d'interface, avec des ateliers pratiques et des études de cas réels.",
    duree: "8 semaines",
    categorie: "Design",
    couleur: "#2C3E50",
    image: "https://images.unsplash.com/photo-1541462608143-67571c6738dd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
  },
  {
    id: 3,
    titre: "Data Science",
    description: "Introduction au machine learning et à l'analyse de données. Découvrez les bases de la data science, la manipulation de données, la visualisation, et les premiers algorithmes de machine learning.",
    duree: "10 semaines",
    categorie: "Data",
    couleur: "#2C3E50",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
  },
  {
    id: 4,
    titre: "React Avancé",
    description: "Maîtrisez les hooks, context API et les performances React. Cette formation avancée vous permettra de concevoir des applications performantes, maintenables et modernes avec React. Vous apprendrez à gérer l'état, optimiser le rendu, utiliser les hooks personnalisés, et bien plus encore.",
    duree: "6 semaines",
    categorie: "Développement Web",
    couleur: "#2C3E50",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
  },
  {
    id: 5,
    titre: "UX/UI Design",
    description: "Apprenez à créer des interfaces utilisateur intuitives. Cette formation vous initiera aux principes fondamentaux de l'expérience utilisateur et du design d'interface, avec des ateliers pratiques et des études de cas réels.",
    duree: "8 semaines",
    categorie: "Design",
    couleur: "#2C3E50",
    image: "https://images.unsplash.com/photo-1541462608143-67571c6738dd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
  },
  {
    id: 6,
    titre: "Data Science",
    description: "Introduction au machine learning et à l'analyse de données. Découvrez les bases de la data science, la manipulation de données, la visualisation, et les premiers algorithmes de machine learning.",
    duree: "10 semaines",
    categorie: "Data",
    couleur: "#2C3E50",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
  }
];

const FormationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const formation = formations.find(f => f.id === Number(id));
  const [showInscriptionForm, setShowInscriptionForm] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    niveau: '',
    formation: formation?.titre || ''
  });

  if (!formation) return <div style={{ color: '#2C3E50', textAlign: 'center', marginTop: 80 }}>Formation introuvable.</div>;

  // Dates fictives si non présentes dans l'objet formation
  const dateDebut = formation.dateDebut || '2024-06-01';
  const dateFin = formation.dateFin || '2024-07-15';
  const niveauRequis = formation.niveauRequis || 'Baccalauréat';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Formulaire soumis:', formData);
    // Ici tu peux ajouter la logique pour envoyer les données
    alert('Inscription soumise avec succès !');
    setShowInscriptionForm(false);
    setFormData({
      nom: '',
      prenom: '',
      email: '',
      niveau: '',
      formation: formation.titre
    });
  };

  const niveaux = [
    "Baccalauréat",
    "Licence",
    "Master",
    "Doctorat",
    "Autre"
  ];

  return (
    <>
 
      <div style={{ minHeight: '100vh', background: '#fff', padding: '0 0 4rem 0' }}>
        <div style={{
          position: 'relative',
          width: '100vw',
          maxWidth: '100%',
          height: '440px',
          overflow: 'hidden',
          margin: 0,
        }}>
          <img src={formation.image} alt={formation.titre} style={{
            width: '100vw',
            maxWidth: '100%',
            height: '440px',
            objectFit: 'cover',
            display: 'block',
            borderRadius: 0,
            margin: 0,
            boxShadow: 'none',
            background: 'none',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 1,
            filter: 'brightness(0.39)',
          }} />
          <div style={{
            position: 'absolute',
            top: 150,
            left: 100,
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            zIndex: 2,
            padding: '48px 0 0 60px',
          }}>
            <div>
              <span style={{
                background: '#2C3E50',
                color: '#fff',
                borderRadius: 14,
                fontSize: 18,
                fontWeight: 700,
                padding: '8px 26px',
                display: 'inline-block',
                letterSpacing: '0.5px',
                marginBottom: 18,
              }}>{formation.categorie}</span>
              <h1 style={{
                color: '#fff',
                fontWeight: 900,
                fontSize: '2.8rem',
                margin: '22px 0 0 0',
                letterSpacing: '-2px',
                textShadow: '0 4px 24px #0007',
                lineHeight: 1.1,
                maxWidth: 600,
              }}>{formation.titre}</h1>
            </div>
          </div>
        </div>
        <div style={{ maxWidth: 900, margin: '0 auto', background: 'none', borderRadius: 0, boxShadow: 'none', overflow: 'visible', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', gap: '2.5rem', padding: '2.5rem 1.5rem 0 1.5rem' }}>
          <div style={{ color: '#374151',marginLeft:'-140px' ,marginRight:'-170px' ,fontSize: '1.25rem', marginBottom: 12, opacity: 0.97, lineHeight: 1.7 }}>{formation.description}</div>
          <div style={{ display: 'flex',marginLeft:'-140px', alignItems: 'center', gap: 32, marginBottom: 12, flexWrap: 'wrap' }}>
            <span style={{ color: '#2C3E50', fontWeight: 600, fontSize: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
              <FiCalendar style={{ color: '#F1C40F' }} /> {formation.duree}
            </span>
            <span style={{ color: '#2C3E50', fontWeight: 600, fontSize: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
              <FiBook style={{ color: '#F1C40F' }} /> {formation.categorie}
            </span>
            <span style={{ color: '#2C3E50', fontWeight: 600, fontSize: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
              <FiCalendar style={{ color: '#F1C40F' }} /> {`Du ${dateDebut} au ${dateFin}`}
            </span>
            <span style={{ color: '#2C3E50', fontWeight: 600, fontSize: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#F1C40F">
                <path d="M12 3L1 9l11 6 9-4.91V17h2V9M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
              </svg> Niveau requis: {niveauRequis}
            </span>
          </div>
          {!showInscriptionForm && (
            <button 
              onClick={() => setShowInscriptionForm(!showInscriptionForm)}
              style={{ background: '#2C3E50', marginLeft:'-150px',color: '#fff', border: 'none', height:'57px',width:'130px',borderRadius: 12, padding: '0 1.1rem', fontWeight: 700, fontSize: '1.2rem', boxShadow: '0 2px 8px #2C3E5022', cursor: 'pointer', marginTop: 10, letterSpacing: '0.5px', transition: 'background 0.2s' }} 
              onMouseOver={e => e.currentTarget.style.background = '#1a2533'} 
              onMouseOut={e => e.currentTarget.style.background = '#2C3E50'}
            >
              S'inscrire
            </button>
          )}

          {/* Formulaire d'inscription intégré dans la page */}
          {showInscriptionForm && (
            <div style={{
              width: '100%',
              maxWidth: 900,
              marginTop: '2rem',
              padding: '2rem',
              background: '#f8f9fa',
              borderRadius: 16,
              border: '1px solid #e9ecef',
              marginLeft: '-10px',
              animation: 'slideDown 0.3s ease-out',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ color: '#2C3E50', fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>
                  Inscription à la formation
                </h3>
                <button
                  onClick={() => setShowInscriptionForm(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.2rem',
                    cursor: 'pointer',
                    color: '#666',
                    padding: '0.5rem',
                  }}
                >
                  <FiX />
                </button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#2C3E50', fontWeight: 600 }}>
                    Formation sélectionnée
                  </label>
                  <input
                    type="text"
                    value={formData.formation}
                    disabled
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: 8,
                      backgroundColor: '#f9f9f9',
                      color: '#666',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#2C3E50', fontWeight: 600 }}>
                      Nom *
                    </label>
                    <input
                      type="text"
                      name="nom"
                      value={formData.nom}
                      onChange={handleInputChange}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #ddd',
                        borderRadius: 8,
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#2C3E50', fontWeight: 600 }}>
                      Prénom *
                    </label>
                    <input
                      type="text"
                      name="prenom"
                      value={formData.prenom}
                      onChange={handleInputChange}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #ddd',
                        borderRadius: 8,
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#2C3E50', fontWeight: 600 }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: 8,
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#2C3E50', fontWeight: 600 }}>
                    Niveau d'étude *
                  </label>
                  <select
                    name="niveau"
                    value={formData.niveau}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: 8,
                    }}
                  >
                    <option value="">Sélectionnez votre niveau</option>
                    {niveaux.map(niveau => (
                      <option key={niveau} value={niveau}>{niveau}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setShowInscriptionForm(false)}
                    style={{
                      padding: '0.75rem 1.5rem',
                      border: '1px solid #ddd',
                      borderRadius: 8,
                      background: 'white',
                      color: '#666',
                      cursor: 'pointer',
                    }}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '0.75rem 1.5rem',
                      border: 'none',
                      borderRadius: 8,
                      background: '#2C3E50',
                      color: 'white',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    S'inscrire
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <Footer />
    </>
  );
};

export default FormationDetails; 