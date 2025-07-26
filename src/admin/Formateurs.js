import React, { useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiUser, FiMail, FiAward, FiChevronDown, FiSearch, FiChevronLeft, FiChevronRight, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import AdminSidebar from './AdminSidebar';
import './Formateurs.css';
import { motion, AnimatePresence } from 'framer-motion';

const Formateurs = () => {
  const [formateurs, setFormateurs] = useState([
    { 
      id: 1, 
      nom: 'Jean', 
      prenom: 'Dupont', 
      email: 'jean@example.com', 
      specialite: 'React JS',
      telephone: '0601020304',
      image: 'images/pdp.webp'
    },
    { 
      id: 2, 
      nom: 'Marie', 
      prenom: 'Martin', 
      email: 'marie@example.com', 
      specialite: 'Node.js',
      telephone: '0605060708',
      image: 'images/pdp.webp'
    },
    { 
      id: 3, 
      nom: 'Pierre', 
      prenom: 'Lambert', 
      email: 'pierre@example.com', 
      specialite: 'UX Design',
      telephone: '0611223344',
      image: 'images/pdp.webp'
    },
    { 
      id: 4, 
      nom: 'Sophie', 
      prenom: 'Bernard', 
      email: 'sophie@example.com', 
      specialite: 'React JS',
      telephone: '0677889900',
      image: 'images/pdp.webp'
    }
  ]);
  
  const [showPopup, setShowPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [currentFormateur, setCurrentFormateur] = useState(null);
  const [newFormateur, setNewFormateur] = useState({
    nom: '',
    prenom: '',
    email: '',
    specialite: '',
    telephone: '',
    image: 'images/pdp.webp'
  });
  
  const [filtreSpecialite, setFiltreSpecialite] = useState('Tous');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(4);
  
  // États pour les popups de succès et d'erreur
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const specialites = ['Tous', ...new Set(formateurs.map(f => f.specialite))];

  const formateursFiltres = formateurs.filter(formateur => {
    const matchesSpecialite = filtreSpecialite === 'Tous' || formateur.specialite === filtreSpecialite;
    const matchesSearch = searchTerm === '' || 
      formateur.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
      formateur.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formateur.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formateur.specialite.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSpecialite && matchesSearch;
  });

  // Logique de pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = formateursFiltres.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(formateursFiltres.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const selectSpecialite = (spec) => {
    setFiltreSpecialite(spec);
    setIsDropdownOpen(false);
    setCurrentPage(1);
  };

  const handleAddClick = () => {
    setNewFormateur({
      nom: '',
      prenom: '',
      email: '',
      specialite: '',
      telephone: '',
      image: 'images/pdp.webp'
    });
    setShowPopup(true);
    setShowEditPopup(false);
  };

  const handleEditClick = (formateur) => {
    setCurrentFormateur(formateur);
    setNewFormateur({
      nom: formateur.nom,
      prenom: formateur.prenom,
      email: formateur.email,
      specialite: formateur.specialite,
      telephone: formateur.telephone,
      image: formateur.image
    });
    setShowEditPopup(true);
    setShowPopup(false);
  };

  const closePopup = () => {
    setShowPopup(false);
    setShowEditPopup(false);
    setNewFormateur({
      nom: '',
      prenom: '',
      email: '',
      specialite: '',
      telephone: '',
      image: 'images/pdp.webp'
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewFormateur(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (showPopup) {
      try {
        const res = await fetch('http://localhost:8000/api/admin/formateurs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newFormateur)
        });
        
        if (res.ok) {
          const data = await res.json();
          setFormateurs([...formateurs, data.user]);
          setSuccessMessage('Formateur créé avec succès ! Un email a été envoyé avec les identifiants.');
          setShowSuccessPopup(true);
        } else {
          const data = await res.json();
          setErrorMessage(data.message || 'Erreur lors de la création du formateur');
          setShowErrorPopup(true);
        }
      } catch (err) {
        setErrorMessage('Erreur réseau ou serveur. Vérifiez votre connexion.');
        setShowErrorPopup(true);
      }
    } else if (showEditPopup) {
      try {
        // Simulation de la modification (à adapter selon votre API)
        setFormateurs(formateurs.map(f =>
          f.id === currentFormateur.id ? { ...f, ...newFormateur } : f
        ));
        setSuccessMessage('Formateur modifié avec succès !');
        setShowSuccessPopup(true);
      } catch (err) {
        setErrorMessage('Erreur lors de la modification du formateur');
        setShowErrorPopup(true);
      }
    }
    closePopup();
  };

  const handleDelete = (id) => {
    setFormateurs(formateurs.filter(f => f.id !== id));
    if (currentItems.length === 1 && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
    setSuccessMessage('Formateur supprimé avec succès !');
    setShowSuccessPopup(true);
  };

  const closeSuccessPopup = () => {
    setShowSuccessPopup(false);
    setSuccessMessage('');
  };

  const closeErrorPopup = () => {
    setShowErrorPopup(false);
    setErrorMessage('');
  };

  return (
    <div className="admin-container">
      <AdminSidebar />
      
      <main className="content-with-sidebar">
        <div className="formateurs-page">
          {/* Nouvelle structure pour le header */}
          <div className="formateurs-header">
            <h1 className="page-title">Gestion des Formateurs</h1>
            <div className="header-controls">
              <div className="search-bar-wrapper">
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
              </div>
              
              <div className="custom-filtre-container">
                <div 
                  className="filtre-select"
                  onClick={toggleDropdown}
                >
                  <span>{filtreSpecialite}</span>
                  <FiChevronDown className={`chevron-icon ${isDropdownOpen ? 'open' : ''}`} />
                </div>
                
                {isDropdownOpen && (
                  <div className="filtre-dropdown">
                    {specialites.map((spec) => (
                      <div
                        key={spec}
                        className={`dropdown-item ${filtreSpecialite === spec ? 'selected' : ''}`}
                        onClick={() => selectSpecialite(spec)}
                      >
                        {spec}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <button className="add-button" onClick={handleAddClick}>
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                >
                  <FiPlus />
                </motion.span> Nouveau Formateur
              </button>
            </div>
          </div>

          <div className="formateurs-table-container">
            <table className="elegant-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nom</th>
                  <th>Prénom</th>
                  <th>Email</th>
                  <th>Téléphone</th>
                  <th>Spécialité</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((formateur) => (
                    <tr key={formateur.id}>
                      <td>{formateur.id}</td>
                      <td>
                        <div className="user-info">
                          <img 
                            src={formateur.image ? 
                              (formateur.image.startsWith('http') ? 
                                formateur.image : 
                                `http://localhost:8000/storage/${formateur.image}`
                              ) : 
                              'http://localhost:8000/storage/images/pdp.webp'
                            }
                            alt={`${formateur.nom} ${formateur.prenom}`}
                            className="profile-image"
                            onError={(e) => {
                              e.target.src = 'images/pdp.webp';
                            }}
                          />
                          {formateur.nom}
                        </div>
                      </td>
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
                  ))
                ) : (
                  <tr className="no-results">
                    <td colSpan="7">Aucun formateur trouvé</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {formateursFiltres.length > itemsPerPage && (
              <div className="pagination-container">
                <button 
                  onClick={() => paginate(currentPage - 1)} 
                  disabled={currentPage === 1}
                  className="pagination-button pagination-nav-button"
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
                  className="pagination-button pagination-nav-button"
                >
                  Suivant <FiChevronRight />
                </button>
              </div>
            )}
          </div>

          {/* Popup d'ajout */}
          {showPopup && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h2>Ajouter un Formateur</h2>
                  <button className="square-close-button" onClick={closePopup}>
                    <FiX size={18} />
                  </button>
                </div>
                
                <form onSubmit={handleSubmit}>
                  <div className="input-group">
                    <FiUser className="input-icon2" />
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
                    <FiUser className="input-icon2" />
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
                    <FiMail className="input-icon2" />
                    <input
                      type="email"
                      name="email"
                      placeholder="Adresse email"
                      value={newFormateur.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="input-group">
                    <FiAward className="input-icon2" />
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
                    <FiUser className="input-icon2" />
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
                      Enregistrer
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Popup de modification */}
          {showEditPopup && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h2>Modifier le Formateur</h2>
                  <button className="square-close-button" onClick={closePopup}>
                    <FiX size={18} />
                  </button>
                </div>
                
                <form onSubmit={handleSubmit}>
                  <div className="input-group">
                    <FiUser className="input-icon2" />
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
                    <FiUser className="input-icon2" />
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
                    <FiMail className="input-icon2" />
                    <input
                      type="email"
                      name="email"
                      placeholder="Adresse email"
                      value={newFormateur.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="input-group">
                    <FiAward className="input-icon2" />
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
                    <FiUser className="input-icon2" />
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
                      Enregistrer
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

export default Formateurs;