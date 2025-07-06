import React, { useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiUser, FiMail, FiAward, FiChevronDown, FiSearch } from 'react-icons/fi';
import AdminSidebar from './AdminSidebar';
import './Formateurs.css';

// Fonction pour générer des images de profil aléatoires
const getProfileImage = (id) => {
  const gender = id % 2 === 0 ? 'women' : 'men';
  return `https://randomuser.me/api/portraits/${gender}/${id % 100}.jpg`;
};

const Formateurs = () => {
  const [formateurs, setFormateurs] = useState([
    { 
      id: 1, 
      nom: 'Jean', 
      prenom: 'Dupont', 
      email: 'jean@example.com', 
      specialite: 'React JS',
      image: getProfileImage(1)
    },
    { 
      id: 2, 
      nom: 'Marie', 
      prenom: 'Martin', 
      email: 'marie@example.com', 
      specialite: 'Node.js',
      image: getProfileImage(2)
    },
    { 
      id: 3, 
      nom: 'Pierre', 
      prenom: 'Lambert', 
      email: 'pierre@example.com', 
      specialite: 'UX Design',
      image: getProfileImage(3)
    },
    { 
      id: 4, 
      nom: 'Sophie', 
      prenom: 'Bernard', 
      email: 'sophie@example.com', 
      specialite: 'React JS',
      image: getProfileImage(4)
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
    image: ''
  });
  
  const [filtreSpecialite, setFiltreSpecialite] = useState('Tous');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
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

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const selectSpecialite = (spec) => {
    setFiltreSpecialite(spec);
    setIsDropdownOpen(false);
  };

  const handleAddClick = () => {
    setNewFormateur({
      nom: '',
      prenom: '',
      email: '',
      specialite: '',
      image: getProfileImage(formateurs.length + 1)
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
      image: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewFormateur(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (showPopup) {
      // Ajout d'un nouveau formateur
      const newId = formateurs.length > 0 ? Math.max(...formateurs.map(f => f.id)) + 1 : 1;
      setFormateurs([...formateurs, {
        id: newId,
        ...newFormateur
      }]);
    } else if (showEditPopup) {
      // Modification d'un formateur existant
      setFormateurs(formateurs.map(f => 
        f.id === currentFormateur.id ? { ...f, ...newFormateur } : f
      ));
    }
    
    setNewFormateur({ 
      nom: '', 
      prenom: '', 
      email: '', 
      specialite: '',
      image: ''
    });
    closePopup();
  };

  const handleDelete = (id) => {
    setFormateurs(formateurs.filter(f => f.id !== id));
  };

  return (
    <div className="admin-container">
      <AdminSidebar />
      
      <main className="content-with-sidebar">
        <div className="formateurs-page">
          <div className="formateurs-header">
            <h1 className="page-title">Liste des Formateurs</h1>
            <div className="header-actions">
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
                <FiPlus className="icon" /> Nouveau Formateur
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
                  <th>Spécialité</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {formateursFiltres.length > 0 ? (
                  formateursFiltres.map((formateur) => (
                    <tr key={formateur.id}>
                      <td>{formateur.id}</td>
                      <td>
                        <div className="user-info">
                          <img 
                            src={formateur.image} 
                            alt={`${formateur.nom} ${formateur.prenom}`}
                            className="profile-image"
                            onError={(e) => {
                              e.target.src = 'https://randomuser.me/api/portraits/lego/1.jpg';
                            }}
                          />
                          {formateur.nom}
                        </div>
                      </td>
                      <td>{formateur.prenom}</td>
                      <td>{formateur.email}</td>
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
                    <td colSpan="6">Aucun formateur trouvé</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Popup d'ajout */}
          {showPopup && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h2>Ajouter un Formateur</h2>
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
                      placeholder="Adresse email"
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
                      placeholder="Adresse email"
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
        </div>
      </main>
    </div>
  );
};

export default Formateurs;