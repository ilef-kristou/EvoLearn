import React, { useState, useEffect } from 'react';
import { 
  FiPlus, FiEdit2, FiTrash2, FiX, FiUser, FiMail, FiAward, 
  FiChevronDown, FiSearch, FiChevronLeft, FiChevronRight, 
  FiCheckCircle, FiAlertCircle 
} from 'react-icons/fi';
import AdminSidebar from './AdminSidebar';
import './Formateurs.css';
import { motion } from 'framer-motion';

const Formateurs = () => {
  const [formateurs, setFormateurs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // États unifiés
  const [showPopup, setShowPopup] = useState(false);
  const [currentFormateur, setCurrentFormateur] = useState(null);
  const [newFormateur, setNewFormateur] = useState({
    nom: '',
    prenom: '',
    email: '',
    specialite: '',
    telephone: '',
    image: 'images/pdp.webp'
  });
  
  // Filtres et pagination
  const [filtreSpecialite, setFiltreSpecialite] = useState('Tous');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(4);
  
  // Messages
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchFormateurs = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/admin/formateurs');
        const data = await response.json();
        setFormateurs(data);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFormateurs();
  }, []);

  // Données filtrées
  const specialites = ['Tous', ...new Set(formateurs.map(f => f.specialite))];
  const formateursFiltres = formateurs.filter(formateur => {
    const matchesSpecialite = filtreSpecialite === 'Tous' || formateur.specialite === filtreSpecialite;
    const matchesSearch = searchTerm === '' || 
      Object.values(formateur).some(
        val => typeof val === 'string' && val.toLowerCase().includes(searchTerm.toLowerCase())
      );
    return matchesSpecialite && matchesSearch;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = formateursFiltres.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(formateursFiltres.length / itemsPerPage);

  // Handlers
  const handleAddClick = () => {
    setNewFormateur({
      nom: '',
      prenom: '',
      email: '',
      specialite: '',
      telephone: '',
      image: 'images/pdp.webp'
    });
    setCurrentFormateur(null);
    setShowPopup(true);
  };

  const handleEditClick = (formateur) => {
    setCurrentFormateur(formateur);
    setNewFormateur({ ...formateur });
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setCurrentFormateur(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewFormateur(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = currentFormateur
        ? `http://localhost:8000/api/admin/formateurs/${currentFormateur.id}`
        : 'http://localhost:8000/api/admin/formateurs';
      
      const method = currentFormateur ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFormateur)
      });

      if (!response.ok) throw new Error(await response.text());

      const result = await response.json();
      
      if (currentFormateur) {
        setFormateurs(prev => prev.map(f => f.id === currentFormateur.id ? result : f));
        setSuccessMessage('Formateur modifié avec succès !');
      } else {
        setFormateurs(prev => [...prev, result]);
        setSuccessMessage('Formateur créé avec succès !');
      }
      
      closePopup();
      setShowSuccessPopup(true);
    } catch (err) {
      console.error('Erreur:', err);
      setErrorMessage(err.message || 'Une erreur est survenue');
      setShowErrorPopup(true);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:8000/api/admin/formateurs/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Échec de la suppression');

      setFormateurs(prev => prev.filter(f => f.id !== id));
      setSuccessMessage('Formateur supprimé avec succès !');
      setShowSuccessPopup(true);
    } catch (err) {
      console.error('Erreur:', err);
      setErrorMessage(err.message || 'Échec de la suppression');
      setShowErrorPopup(true);
    }
  };

  const closeMessagePopup = () => {
    setShowSuccessPopup(false);
    setShowErrorPopup(false);
  };

  if (loading) {
    return (
      <div className="admin-container">
        <AdminSidebar />
        <main className="content-with-sidebar"></main>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <AdminSidebar />
      
      <main className="content-with-sidebar">
        <div className="formateurs-page">
          <div className="formateurs-header">
            <h1 className="page-title">Gestion des Formateurs</h1>
            <div className="header-controls">
              <div className="search-bar-container">
                <FiSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              
              <button className="add-button" onClick={handleAddClick}>
                <FiPlus className="icon" /> Nouveau Formateur
              </button>
            </div>
          </div>

          <div className="formateurs-table-container">
            <table className="elegant-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Image</th>
                  <th>Nom</th>
                  <th>Prénom</th>
                  <th>Email</th>
                  <th>Téléphone</th>
                  <th>Spécialité</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((formateur) => (
                  <tr key={`formateur-${formateur.id}`}>
                    <td>{formateur.id}</td>
                    <td>
                      <div className="user-info">
                        <img 
                          src={formateur.image || 'http://localhost:8000/images/pdp.webp'} 
                          alt={`${formateur.nom} ${formateur.prenom}`}
                          className="profile-image"
                          onError={(e) => {
                            e.target.src = 'http://localhost:8000/images/pdp.webp';
                          }}
                        />
                      </div>
                    </td>
                    <td>{formateur.nom}</td>
                    <td>{formateur.prenom}</td>
                    <td>{formateur.email}</td>
                    <td>{formateur.telephone}</td>
                    <td>
                      <span className="specialite-badge">{formateur.specialite}</span>
                    </td>
                    <td>
                      <div className="actions">
                        <button 
                          className="edit-button"
                          onClick={() => handleEditClick(formateur)}
                        >
                          <FiEdit2 />
                        </button>
                        <button 
                          className="delete-button"
                          onClick={() => handleDelete(formateur.id)}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {currentItems.length === 0 && (
                  <tr className="no-results">
                  <td colSpan="7">Aucun chargé de formation trouvé</td>
                </tr>
                )}
              </tbody>
            </table>

            {formateursFiltres.length > itemsPerPage && (
              <div className="pagination-container">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} 
                  disabled={currentPage === 1}
                  className="pagination-button"
                >
                  <FiChevronLeft /> Précédent
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                  <button
                    key={`page-${number}`}
                    onClick={() => setCurrentPage(number)}
                    className={`pagination-button ${currentPage === number ? 'active' : ''}`}
                  >
                    {number}
                  </button>
                ))}
                
                <button 
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} 
                  disabled={currentPage === totalPages}
                  className="pagination-button"
                >
                  Suivant <FiChevronRight />
                </button>
              </div>
            )}
          </div>

          {showPopup && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h2>{currentFormateur ? 'Modifier Formateur' : 'Ajouter Formateur'}</h2>
                  <button className="close-button" onClick={closePopup}>
                    <FiX />
                  </button>
                </div>
                
                <form onSubmit={handleSubmit}>
                  <div className="input-group">
                    <FiUser className="input-icon" />
                    <input
                      type="text"
                      name="nom"
                      placeholder="Nom"
                      value={newFormateur.nom}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="input-group">
                    <FiUser className="input-icon" />
                    <input
                      type="text"
                      name="prenom"
                      placeholder="Prénom"
                      value={newFormateur.prenom}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="input-group">
                    <FiMail className="input-icon" />
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={newFormateur.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="input-group">
                    <FiAward className="input-icon" />
                    <input
                      type="text"
                      name="specialite"
                      placeholder="Spécialité"
                      value={newFormateur.specialite}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="input-group">
                    <FiUser className="input-icon" />
                    <input
                      type="text"
                      name="telephone"
                      placeholder="Téléphone"
                      value={newFormateur.telephone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="modal-actions">
                    <button type="button" className="cancel-button" onClick={closePopup}>
                      Annuler
                    </button>
                    <button type="submit" className="submit-button">
                      {currentFormateur ? 'Mettre à jour' : 'Enregistrer'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {showSuccessPopup && (
            <div className="success-popup-overlay">
              <div className="success-popup">
                <div className="success-icon">
                  <FiCheckCircle size={60} color="#4CAF50" />
                </div>
                <h2>Succès !</h2>
                <p>{successMessage}</p>
                <button className="success-btn" onClick={closeMessagePopup}>
                  Continuer
                </button>
              </div>
            </div>
          )}

          {showErrorPopup && (
            <div className="error-popup-overlay">
              <div className="error-popup">
                <div className="error-icon">
                  <FiAlertCircle size={60} color="#F44336" />
                </div>
                <h2>Erreur !</h2>
                <p>{errorMessage}</p>
                <button className="error-btn" onClick={closeMessagePopup}>
                  Compris
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Formateurs;