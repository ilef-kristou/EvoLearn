import React, { useState, useEffect } from 'react';
import { 
  FiPlus, FiEdit2, FiTrash2, FiX, FiUser, FiMail, FiAward, 
  FiChevronDown, FiSearch, FiChevronLeft, FiChevronRight, 
  FiCheckCircle, FiAlertCircle 
} from 'react-icons/fi';
import AdminSidebar from './AdminSidebar';
import './ChargeFormations.css';

const ChargeFormations = () => {
  const [chargeFormations, setChargeFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // États pour les popups
  const [showPopup, setShowPopup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // États pour le formulaire
  const [newChargeFormation, setNewChargeFormation] = useState({
    nom: '',
    prenom: '',
    email: '',
    departement: '',
    telephone: ''
  });
  const [editingCharge, setEditingCharge] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // États pour les filtres et pagination
  const [filtreDepartement, setFiltreDepartement] = useState('Tous');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(4);

  useEffect(() => {
    const fetchChargeFormations = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/admin/charges');
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
        const data = await response.json();
        setChargeFormations(data);
      } catch (err) {
        console.error('Erreur:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchChargeFormations();
  }, []);

  // Fonctions pour gérer les popups
  const closePopup = () => {
    setShowPopup(false);
    setEditingCharge(null);
    setIsEditMode(false);
  };

  const closeSuccessPopup = () => {
    setShowSuccessPopup(false);
    setSuccessMessage('');
  };

  const closeErrorPopup = () => {
    setShowErrorPopup(false);
    setErrorMessage('');
  };

  // Filtrage et pagination
  const departements = ['Tous', ...new Set(chargeFormations.map(c => c.departement).filter(Boolean))];

  const chargesFiltres = chargeFormations.filter(charge => {
    const matchesDepartement = filtreDepartement === 'Tous' || charge.departement === filtreDepartement;
    const matchesSearch = searchTerm === '' || 
      Object.values(charge).some(
        val => typeof val === 'string' && val.toLowerCase().includes(searchTerm.toLowerCase())
      );
    return matchesDepartement && matchesSearch;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = chargesFiltres.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(chargesFiltres.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Gestion des actions
  const handleAddClick = () => {
    setNewChargeFormation({
      nom: '',
      prenom: '',
      email: '',
      departement: '',
      telephone: ''
    });
    setIsEditMode(false);
    setShowPopup(true);
  };

  const handleEditClick = (charge) => {
    setEditingCharge(charge);
    setNewChargeFormation({ ...charge });
    setIsEditMode(true);
    setShowPopup(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewChargeFormation(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = isEditMode 
        ? `http://localhost:8000/api/admin/charges/${editingCharge.id}`
        : 'http://localhost:8000/api/admin/charges';
      
      const method = isEditMode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newChargeFormation)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la requête');
      }

      const result = await response.json();
      
      if (isEditMode) {
        setChargeFormations(prev => prev.map(c => c.id === editingCharge.id ? result : c));
        setSuccessMessage('Chargé de formation modifié avec succès !');
      } else {
        setChargeFormations(prev => [...prev, result]);
        setSuccessMessage('Chargé de formation créé avec succès !');
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
      const response = await fetch(`http://localhost:8000/api/admin/charges/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Échec de la suppression');

      setChargeFormations(prev => prev.filter(c => c.id !== id));
      if (currentItems.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }
      setSuccessMessage('Chargé de formation supprimé avec succès !');
      setShowSuccessPopup(true);
    } catch (err) {
      console.error('Erreur:', err);
      setErrorMessage(err.message || 'Échec de la suppression');
      setShowErrorPopup(true);
    }
  };

  if (loading) return (
    <div className="admin-container">
      <AdminSidebar />
      <main className="content-with-sidebar"></main>
    </div>
  );

  if (error) return (
    <div className="admin-container">
      <AdminSidebar />
      <main className="content-with-sidebar">
        <div className="error-message">
          <FiAlertCircle size={24} />
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Réessayer</button>
        </div>
      </main>
    </div>
  );

  return (
    <div className="admin-container">
      <AdminSidebar />
      
      <main className="content-with-sidebar">
        <div className="charge-formations-page">
          <div className="charge-formations-header">
            <h1 className="page-title">Liste des Chargés de Formations</h1>
            <div className="search-and-button-container">
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
                <FiPlus className="icon" /> Nouveau Chargé
              </button>
            </div>
          </div>

          <div className="charge-formations-table-container">
            <table className="elegant-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nom</th>
                  <th>Prénom</th>
                  <th>Email</th>
                  <th>Téléphone</th>
                  <th>Département</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((charge) => (
                    <tr key={charge.id}>
                      <td>{charge.id}</td>
                      <td>{charge.nom}</td>
                      <td>{charge.prenom}</td>
                      <td>{charge.email}</td>
                      <td>{charge.telephone}</td>
                      <td>
                        <span className="departement-badge">{charge.departement}</span>
                      </td>
                      <td>
                        <div className="actions">
                          <button className="edit-button" onClick={() => handleEditClick(charge)}>
                            <FiEdit2 />
                          </button>
                          <button className="delete-button" onClick={() => handleDelete(charge.id)}>
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="no-results">
                    <td colSpan="7">Aucun chargé de formation trouvé</td>
                  </tr>
                )}
              </tbody>
            </table>

            {chargesFiltres.length > itemsPerPage && (
              <div className="pagination-container">
                <button 
                  onClick={() => paginate(currentPage - 1)} 
                  disabled={currentPage === 1}
                  className="pagination-button"
                >
                  <FiChevronLeft /> Précédent
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={`pagination-button ${currentPage === number ? 'active' : ''}`}
                  >
                    {number}
                  </button>
                ))}
                
                <button 
                  onClick={() => paginate(currentPage + 1)} 
                  disabled={currentPage === totalPages}
                  className="pagination-button"
                >
                  Suivant <FiChevronRight />
                </button>
              </div>
            )}
          </div>

          {/* Popup de formulaire */}
          {showPopup && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h2>{isEditMode ? 'Modifier un Chargé' : 'Ajouter un Chargé'}</h2>
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
                      value={newChargeFormation.nom}
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
                      value={newChargeFormation.prenom}
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
                      value={newChargeFormation.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="input-group">
                    <FiAward className="input-icon" />
                    <input
                      type="text"
                      name="telephone"
                      placeholder="Téléphone"
                      value={newChargeFormation.telephone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="input-group">
                    <FiAward className="input-icon" />
                    <select
                      name="departement"
                      value={newChargeFormation.departement}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Sélectionnez un département</option>
                      {['informatique', 'rh', 'marketing'].map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="modal-actions">
                    <button type="button" className="cancel-button" onClick={closePopup}>
                      Annuler
                    </button>
                    <button type="submit" className="submit-button">
                      {isEditMode ? 'Mettre à jour' : 'Enregistrer'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Popup de succès */}
          {showSuccessPopup && (
            <div className="success-popup-overlay">
              <div className="success-popup">
                <div className="success-icon">
                  <FiCheckCircle size={60} color="#4CAF50" />
                </div>
                <h2>Succès !</h2>
                <p>{successMessage}</p>
                <button className="success-btn" onClick={closeSuccessPopup}>
                  Continuer
                </button>
              </div>
            </div>
          )}

          {/* Popup d'erreur */}
          {showErrorPopup && (
            <div className="error-popup-overlay">
              <div className="error-popup">
                <div className="error-icon">
                  <FiAlertCircle size={60} color="#F44336" />
                </div>
                <h2>Erreur !</h2>
                <p>{errorMessage}</p>
                <button className="error-btn" onClick={closeErrorPopup}>
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

export default ChargeFormations;