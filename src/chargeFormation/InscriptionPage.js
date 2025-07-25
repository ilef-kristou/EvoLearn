import React, { useState } from 'react';
import { FiBook, FiUser, FiMail, FiPhone, FiAward } from 'react-icons/fi';
import './InscriptionPage.css';

const formationsDisponibles = [
  { id: 1, titre: "React Avancé" },
  { id: 2, titre: "UX/UI Design" },
  { id: 3, titre: "Data Science" }
];

const niveaux = [
  "Baccalauréat",
  "Licence",
  "Master",
  "Doctorat",
  "Autre"
];

const InscriptionPage = () => {
  const [formData, setFormData] = useState({
    formation: '',
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    niveau: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    setFormData({
      formation: '',
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      niveau: ''
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgb(248, 249, 250)',
      padding: '2rem 0'
    }}>
      <div style={{
        width: '100%',
        maxWidth: 800,
        background: 'white',
        borderRadius: 24,
        boxShadow: '0 8px 40px rgba(44,62,80,0.13)',
        padding: '2.8rem 2.2rem 2.2rem 2.2rem',
        position: 'relative',
        margin: '0 1rem',
        overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
          <div style={{ background: '#F1C40F', borderRadius: 12, padding: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiAward size={28} color="#fff" />
          </div>
          <h2 style={{ color: '#2C3E50', fontWeight: 800, fontSize: '2rem', margin: 0, letterSpacing: '-1px' }}>Inscription à une formation</h2>
        </div>
        <p style={{ color: '#3498db', fontWeight: 500, marginBottom: 28, fontSize: '1.08rem', textAlign: 'left', letterSpacing: '0.1px' }}>
          Remplissez le formulaire ci-dessous pour rejoindre l'une de nos formations professionnelles.
        </p>
        {isSubmitted ? (
          <div style={{ textAlign: 'center', color: '#10B981', fontWeight: 600, fontSize: '1.1rem', padding: '2rem 0' }}>
            🎉 Votre inscription a bien été envoyée !
          </div>
        ) : (
          <form onSubmit={handleSubmit} autoComplete="off">
            <div style={{ marginBottom: '1.3rem', position: 'relative' }}>
              <label style={{ color: '#2C3E50', fontWeight: 600, marginBottom: 6, display: 'block' }}>
                Formation *
              </label>
              <div style={{ position: 'relative' }}>
                <FiBook style={{ position: 'absolute', left: 12, top: 13, color: '#F1C40F', pointerEvents: 'none' }} />
                <select
                  name="formation"
                  value={formData.formation}
                  onChange={handleInputChange}
                  required
                  style={{ width: '100%', padding: '0.7rem 0.7rem 0.7rem 2.5rem', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: '1rem', background: '#f9fafb', outline: 'none', transition: 'border 0.2s' }}
                >
                  <option value="">Sélectionnez une formation</option>
                  {formationsDisponibles.map(f => (
                    <option key={f.id} value={f.titre}>{f.titre}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1.2rem', marginBottom: '1.3rem' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <label style={{ color: '#2C3E50', fontWeight: 600, marginBottom: 6, display: 'block' }}>
                  Nom *
                </label>
                <FiUser style={{ position: 'absolute', left: 12, top: 38, color: '#F1C40F', pointerEvents: 'none' }} />
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleInputChange}
                  required
                  style={{ width: '100%', padding: '0.7rem 0.7rem 0.7rem 2.5rem', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: '1rem', background: '#f9fafb', outline: 'none', transition: 'border 0.2s' }}
                />
              </div>
              <div style={{ flex: 1, position: 'relative' }}>
                <label style={{ color: '#2C3E50', fontWeight: 600, marginBottom: 6, display: 'block' }}>
                  Prénom *
                </label>
                <FiUser style={{ position: 'absolute', left: 12, top: 38, color: '#F1C40F', pointerEvents: 'none' }} />
                <input
                  type="text"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleInputChange}
                  required
                  style={{ width: '100%', padding: '0.7rem 0.7rem 0.7rem 2.5rem', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: '1rem', background: '#f9fafb', outline: 'none', transition: 'border 0.2s' }}
                />
              </div>
            </div>
            <div style={{ marginBottom: '1.3rem', position: 'relative' }}>
              <label style={{ color: '#2C3E50', fontWeight: 600, marginBottom: 6, display: 'block' }}>
                Email *
              </label>
              <FiMail style={{ position: 'absolute', left: 12, top: 38, color: '#F1C40F', pointerEvents: 'none' }} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '0.7rem 0.7rem 0.7rem 2.5rem', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: '1rem', background: '#f9fafb', outline: 'none', transition: 'border 0.2s' }}
              />
            </div>
            <div style={{ marginBottom: '1.3rem', position: 'relative' }}>
              <label style={{ color: '#2C3E50', fontWeight: 600, marginBottom: 6, display: 'block' }}>
                Téléphone *
              </label>
              <FiPhone style={{ position: 'absolute', left: 12, top: 38, color: '#F1C40F', pointerEvents: 'none' }} />
              <input
                type="tel"
                name="telephone"
                value={formData.telephone}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '0.7rem 0.7rem 0.7rem 2.5rem', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: '1rem', background: '#f9fafb', outline: 'none', transition: 'border 0.2s' }}
              />
            </div>
            <div style={{ marginBottom: '2rem', position: 'relative' }}>
              <label style={{ color: '#2C3E50', fontWeight: 600, marginBottom: 6, display: 'block' }}>
                Niveau d'étude *
              </label>
              <div style={{ position: 'relative' }}>
                <FiAward style={{ position: 'absolute', left: 12, top: 13, color: '#F1C40F', pointerEvents: 'none' }} />
                <select
                  name="niveau"
                  value={formData.niveau}
                  onChange={handleInputChange}
                  required
                  style={{ width: '100%', padding: '0.7rem 0.7rem 0.7rem 2.5rem', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: '1rem', background: '#f9fafb', outline: 'none', transition: 'border 0.2s' }}
                >
                  <option value="">Sélectionnez votre niveau</option>
                  {niveaux.map(niveau => (
                    <option key={niveau} value={niveau}>{niveau}</option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="submit"
              style={{ width: '100%', background: 'rgb(31, 41, 55)', color: 'white', border: 'none', borderRadius: 10, padding: '1rem', fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 2px 8px #2C3E5022', letterSpacing: '0.5px', transition: 'background 0.2s', marginTop: 8 }}
              onMouseOver={e => e.currentTarget.style.background = 'rgb(31, 41, 55)'}
              onMouseOut={e => e.currentTarget.style.background = 'rgb(31, 41, 55)'}
            >
              S'inscrire
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default InscriptionPage;