import React, { useState, useRef, useEffect } from 'react';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import ParticipantSidebar from './ParticipantSidebar';
import { FiUser, FiMail, FiPhone, FiLock, FiEdit2, FiSave, FiBriefcase, FiCamera } from 'react-icons/fi';
import { FiCheckCircle, FiX, FiAlertCircle } from 'react-icons/fi';

const MonProfil = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    specialite: '',
    password: '',
    image: '' // remplace avatar par image
  });
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const fileInputRef = useRef(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // CHARGEMENT DES DONNÉES DU PARTICIPANT CONNECTÉ
  useEffect(() => {
    const token = localStorage.getItem('jwt');
    fetch('http://localhost:8000/api/participant/profile', {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    })
      .then(res => res.json())
      .then(data => {
        console.log('Données reçues du backend:', data);
        setForm({
          nom: data.nom || '',
          prenom: data.prenom || '',
          email: data.email || '',
          telephone: data.telephone || '',
          specialite: data.specialite || '',
          password: '',
          image: data.image || '' // remplace avatar par image
        });
      });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Mise à jour du state pour l'image (base64)
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, image: reader.result });
        setPreviewAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setEditMode(false);
    setShowSuccess(true); // Affiche le popup de succès immédiatement
    setShowError(false);
    setErrorMsg('');
    setTimeout(() => setShowSuccess(false), 3000);

    const token = localStorage.getItem('jwt');
    // Préparer les données à envoyer
    const dataToSend = {
      nom: form.nom,
      prenom: form.prenom,
      email: form.email,
      telephone: form.telephone,
      image: form.image // base64 ou URL
    };

    try {
      const response = await fetch('http://localhost:8000/api/participant/profile', {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      const data = await response.json();
      if (response.ok) {
        // Succès : on laisse le popup
        setForm({
          ...form,
          image: data.user.image
        });
        setPreviewAvatar(null);
      } else {
        setShowSuccess(false);
        setShowError(true);
        setErrorMsg(data.error || 'Erreur lors de la mise à jour du profil');
        setTimeout(() => setShowError(false), 3500);
      }
    } catch (error) {
      setShowSuccess(false);
      setShowError(true);
      setErrorMsg('Erreur réseau');
      setTimeout(() => setShowError(false), 3500);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--light)', display: 'flex', flexDirection: 'column' }}>

      {/* Popup de succès en haut de la page */}
      {showSuccess && (
        <div style={{
          position: 'fixed',
          top: 32,
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#fff',
          color: '#222',
          borderRadius: 12,
          boxShadow: '0 2px 16px rgba(44,62,80,0.10)',
          padding: '0.9rem 1.7rem 0.9rem 1.2rem',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          fontWeight: 500,
          fontSize: '1rem',
          minWidth: 340,
          maxWidth: 420,
        }}>
          <span style={{ display: 'flex', alignItems: 'center' }}>
            <FiCheckCircle size={22} color="#4CAF50" />
          </span>
          <span style={{color:'#222', flex:1}}>Profil mis à jour avec succès !</span>
          <button onClick={() => setShowSuccess(false)} style={{
            background: 'none',
            border: 'none',
            marginLeft: 8,
            cursor: 'pointer',
            color: '#aaa',
            fontSize: 20,
            borderRadius: 6,
            padding: 0,
            lineHeight: 1
          }}>
            <FiX />
          </button>
        </div>
      )}

      {/* Popup d'erreur en haut de la page */}
      {showError && (
        <div style={{
          position: 'fixed',
          top: 30,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'linear-gradient(90deg, #ff5858 0%, #f09819 100%)',
          color: '#fff',
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(44,62,80,0.18)',
          padding: '1.1rem 2.2rem 1.1rem 1.5rem',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          fontWeight: 700,
          fontSize: '1.13rem',
          minWidth: 340,
          animation: 'popIn 0.3s cubic-bezier(.68,-0.55,.27,1.55)'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', animation: 'shake 0.7s' }}>
            <FiAlertCircle size={32} color="#fff" />
          </span>
          <span>{errorMsg}</span>
          <button onClick={() => setShowError(false)} style={{
            background: 'rgba(255,255,255,0.18)',
            border: 'none',
            marginLeft: 'auto',
            cursor: 'pointer',
            color: '#fff',
            fontSize: 22,
            borderRadius: 8,
            padding: '2px 8px',
            transition: 'background 0.2s'
          }}>
            <FiX />
          </button>
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', marginLeft:'300px',justifyContent: 'center', padding: '2.5rem 0', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', width: '100%', maxWidth: '1400px', gap: 32 }}>
          <div style={{ minWidth: isSidebarCollapsed ? 70 : 220, transition: 'min-width 0.3s' }}>
            <ParticipantSidebar onToggle={setIsSidebarCollapsed} />
          </div>
          <main style={{ flex: 1, maxWidth: 700, width: '100%' }}>
            <div style={{ background: 'var(--white)', borderRadius: 22, boxShadow: '0 8px 32px rgba(44,62,80,0.10)', padding: '2.5rem 2.2rem', marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 22, marginBottom: 32 }}>
                <div 
                  style={{ 
                    position: 'relative',
                    background: 'var(--dark-blue)', 
                    color: 'white', 
                    borderRadius: '50%', 
                    width: 80, 
                    height: 80, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: 38, 
                    fontWeight: 700, 
                    boxShadow: '0 2px 8px rgba(44,62,80,0.10)',
                    overflow: 'hidden',
                    backgroundImage: previewAvatar ? 
                      `url(${previewAvatar})` : 
                      (form.image ? 
                        (form.image.startsWith('data:') ? 
                          `url(${form.image})` : 
                          `url(http://localhost:8000/storage/${form.image})`
                        ) : 
                        'none'
                      ),
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  {!previewAvatar && !form.image && <FiUser />}
                  {editMode && (
                    <div 
                      onClick={triggerFileInput}
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        background: 'rgba(0,0,0,0.5)',
                        width: '100%',
                        padding: '4px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <FiCamera color="white" size={16} />
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
                <div>
                  <h1 style={{ color: 'var(--dark-blue)', fontWeight: 800, fontSize: '1.7rem', marginBottom: 4, letterSpacing: '-1px' }}>Mon Profil</h1>
                  <p style={{ color: 'var(--light-blue)', fontWeight: 500, fontSize: '1.01rem' }}>Gérez vos informations personnelles</p>
                </div>
              </div>
              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
                  <div>
                    <label style={{ color: 'var(--dark-blue)', fontWeight: 600, marginBottom: 6, display: 'block' }}>Nom</label>
                    <input type="text" name="nom" value={form.nom} onChange={handleChange} disabled={!editMode} style={{ width: '100%', padding: '0.7rem', borderRadius: 10, border: '1px solid var(--light-gray)', fontSize: '1rem', background: editMode ? 'var(--light-gray)' : '#f9fafb', outline: 'none', transition: 'border 0.2s' }} />
                  </div>
                  <div>
                    <label style={{ color: 'var(--dark-blue)', fontWeight: 600, marginBottom: 6, display: 'block' }}>Prénom</label>
                    <input type="text" name="prenom" value={form.prenom} onChange={handleChange} disabled={!editMode} style={{ width: '100%', padding: '0.7rem', borderRadius: 10, border: '1px solid var(--light-gray)', fontSize: '1rem', background: editMode ? 'var(--light-gray)' : '#f9fafb', outline: 'none', transition: 'border 0.2s' }} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
                  <div>
                    <label style={{ color: 'var(--dark-blue)', fontWeight: 600, marginBottom: 6, display: 'block' }}>Email</label>
                    <input type="email" name="email" value={form.email} onChange={handleChange} disabled={!editMode} style={{ width: '100%', padding: '0.7rem', borderRadius: 10, border: '1px solid var(--light-gray)', fontSize: '1rem', background: editMode ? 'var(--light-gray)' : '#f9fafb', outline: 'none', transition: 'border 0.2s' }} />
                  </div>
                  <div>
                    <label style={{ color: 'var(--dark-blue)', fontWeight: 600, marginBottom: 6, display: 'block' }}>Téléphone</label>
                    <input type="tel" name="telephone" value={form.telephone} onChange={handleChange} disabled={!editMode} style={{ width: '100%', padding: '0.7rem', borderRadius: 10, border: '1px solid var(--light-gray)', fontSize: '1rem', background: editMode ? 'var(--light-gray)' : '#f9fafb', outline: 'none', transition: 'border 0.2s' }} />
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end', marginTop: 18 }}>
                  {!editMode ? (
                    <button type="button" onClick={() => setEditMode(true)} style={{ background: 'var(--dark-blue)', color: 'var(--white)', border: 'none', borderRadius: 8, padding: '0.8rem 1.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                      <FiEdit2 /> Modifier
                    </button>
                  ) : (
                    <>
                      <button type="button" onClick={() => {
                        setEditMode(false);
                        setPreviewAvatar(null);
                      }} style={{ background: 'var(--light-gray)', color: 'var(--dark-blue)', border: 'none', borderRadius: 8, padding: '0.8rem 1.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                        Annuler
                      </button>
                      <button type="submit" style={{ background: 'var(--gold)', color: 'var(--dark-blue)', border: 'none', borderRadius: 8, padding: '0.8rem 1.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                        <FiSave /> Enregistrer
                      </button>
                    </>
                  )}
                </div>
              </form>
            </div>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MonProfil;