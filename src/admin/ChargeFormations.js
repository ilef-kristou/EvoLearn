import React, { useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiUser, FiMail, FiAward, FiChevronDown, FiSearch } from 'react-icons/fi';
import AdminSidebar from './AdminSidebar';
import './ChargeFormations.css';

// Fonction pour générer des images de profil aléatoires
const getProfileImage = (id) => {
  const gender = id % 2 === 0 ? 'women' : 'men';
  return `https://randomuser.me/api/portraits/${gender}/${id % 100}.jpg`;
};

const ChargeFormations = () => {
  const [chargeFormations, setChargeFormations] = useState([
    { 
      id: 1, 
      nom: 'Jean', 
      prenom: 'Dupont', 
      email: 'jean@example.com', 
      departement: 'Informatique',
      image: getProfileImage(1)
    },
    { 
      id: 2, 
      nom: 'Marie', 
      prenom: 'Martin', 
      email: 'marie@example.com', 
      departement: 'Ressources Humaines',
      image: getProfileImage(2)
    },
    { 
      id: 3, 
      nom: 'Pierre', 
      prenom: 'Lambert', 
      email: 'pierre@example.com', 
      departement: 'Marketing',
      image: getProfileImage(3)
    },
    { 
      id: 4, 
      nom: 'Sophie', 
      prenom: 'Bernard', 
      email: 'sophie@example.com', 
      departement: 'Finance',
      image: getProfileImage(4)
    }
  ]);
  
  const [showPopup, setShowPopup] = useState(false);
  const [newChargeFormation, setNewChargeFormation] = useState({
    nom: '',
    prenom: '',
    email: '',
    departement: '',
    image: ''
  });
  const [editingCharge, setEditingCharge] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const [filtreDepartement, setFiltreDepartement] = useState('Tous');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const departements = ['Tous', ...new Set(chargeFormations.map(f => f.departement))];

  const chargesFiltres = chargeFormations.filter(charge => {
    const matchesDepartement = filtreDepartement === 'Tous' || charge.departement === filtreDepartement;
    const matchesSearch = searchTerm === '' || 
      charge.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
      charge.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      charge.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      charge.departement.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDepartement && matchesSearch;
  });

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const selectDepartement = (dept) => {
    setFiltreDepartement(dept);
    setIsDropdownOpen(false);
  };

  const handleAddClick = () => {
    setNewChargeFormation({
      nom: '',
      prenom: '',
      email: '',
      departement: '',
      image: getProfileImage(chargeFormations.length + 1)
    });
    setIsEditMode(false);
    setShowPopup(true);
  };

  const handleEditClick = (charge) => {
    setEditingCharge(charge);
    setNewChargeFormation({
      nom: charge.nom,
      prenom: charge.prenom,
      email: charge.email,
      departement: charge.departement,
      image: charge.image
    });
    setIsEditMode(true);
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setEditingCharge(null);
    setIsEditMode(false);
    setNewChargeFormation({ 
      nom: '', 
      prenom: '', 
      email: '', 
      departement: '',
      image: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewChargeFormation(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isEditMode && editingCharge) {
      // Mode édition
      const updatedCharges = chargeFormations.map(charge => 
        charge.id === editingCharge.id ? { ...charge, ...newChargeFormation } : charge
      );
      setChargeFormations(updatedCharges);
    } else {
      // Mode ajout
      const newId = chargeFormations.length > 0 ? Math.max(...chargeFormations.map(f => f.id)) + 1 : 1;
      setChargeFormations([...chargeFormations, {
        id: newId,
        ...newChargeFormation
      }]);
    }
    
    setNewChargeFormation({ 
      nom: '', 
      prenom: '', 
      email: '', 
      departement: '',
      image: ''
    });
    setEditingCharge(null);
    setIsEditMode(false);
    closePopup();
  };

  return (
    <div className="admin-container">
      <AdminSidebar />
      
      <main className="content-with-sidebar">
        <div className="charge-formations-page">
          <div className="charge-formations-header">
            <div className="header-actions">
              <h1 className="page-title">Liste des Chargés de Formations</h1>
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
                  <th>Département</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {chargesFiltres.length > 0 ? (
                  chargesFiltres.map((charge) => (
                    <tr key={charge.id}>
                      <td>{charge.id}</td>
                      <td>
                        <div className="user-info">
                          <img 
                            src={charge.image} 
                            alt={`${charge.nom} ${charge.prenom}`}
                            className="profile-image"
                            onError={(e) => {
                              e.target.src = 'https://randomuser.me/api/portraits/lego/1.jpg';
                            }}
                          />
                          {charge.nom}
                        </div>
                      </td>
                      <td>{charge.prenom}</td>
                      <td>{charge.email}</td>
                      <td>
                        <span className="departement-badge">{charge.departement}</span>
                      </td>
                      <td>
                        <div className="actions">
                          <button 
                            className="edit-button" 
                            onClick={() => handleEditClick(charge)}
                          >
                            <FiEdit2 />
                          </button>
                          <button className="delete-button">
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="no-results">
                    <td colSpan="6">Aucun chargé de formation trouvé</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {showPopup && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h2>{isEditMode ? 'Modifier un Chargé de Formation' : 'Ajouter un Chargé de Formation'}</h2>
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
                      placeholder="Adresse email"
                      value={newChargeFormation.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="input-group">
                    <FiAward className="input-icon" />
                    <div className="custom-select">
                      <select
                        name="departement"
                        value={newChargeFormation.departement}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Sélectionnez un département</option>
                        {departements.filter(d => d !== 'Tous').map((dept) => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                      <FiChevronDown className="select-chevron" />
                    </div>
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
        </div>
      </main>
    </div>
  );
};

export default ChargeFormations;