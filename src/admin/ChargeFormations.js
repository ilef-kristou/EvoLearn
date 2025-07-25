import React, { useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiUser, FiMail, FiAward, FiChevronDown, FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import AdminSidebar from './AdminSidebar';
import './ChargeFormations.css';

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
      telephone: '0601020304',
      image: getProfileImage(1)
    },
    { 
      id: 2, 
      nom: 'Marie', 
      prenom: 'Martin', 
      email: 'marie@example.com', 
      departement: 'Ressources Humaines',
      telephone: '0605060708',
      image: getProfileImage(2)
    },
    { 
      id: 3, 
      nom: 'Pierre', 
      prenom: 'Lambert', 
      email: 'pierre@example.com', 
      departement: 'Marketing',
      telephone: '0611223344',
      image: getProfileImage(3)
    },
    { 
      id: 4, 
      nom: 'Sophie', 
      prenom: 'Bernard', 
      email: 'sophie@example.com', 
      departement: 'Finance',
      telephone: '0677889900',
      image: getProfileImage(4)
    }
  ]);
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(4); // Nombre d'éléments par page
  
  const [showPopup, setShowPopup] = useState(false);
  const [newChargeFormation, setNewChargeFormation] = useState({
    nom: '',
    prenom: '',
    email: '',
    departement: '',
    telephone: '',
    image: ''
  });
  const [editingCharge, setEditingCharge] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const [filtreDepartement, setFiltreDepartement] = useState('Tous');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const departements = ['Tous', ...new Set(chargeFormations.map(f => f.departement))];

  // Filtrer les données
  const chargesFiltres = chargeFormations.filter(charge => {
    const matchesDepartement = filtreDepartement === 'Tous' || charge.departement === filtreDepartement;
    const matchesSearch = searchTerm === '' || 
      charge.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
      charge.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      charge.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      charge.departement.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDepartement && matchesSearch;
  });

  // Logique de pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = chargesFiltres.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(chargesFiltres.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const selectDepartement = (dept) => {
    setFiltreDepartement(dept);
    setIsDropdownOpen(false);
    setCurrentPage(1); // Réinitialiser à la première page quand on change le filtre
  };

  const handleAddClick = () => {
    setNewChargeFormation({
      nom: '',
      prenom: '',
      email: '',
      departement: '',
      telephone: '',
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
      telephone: charge.telephone,
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
      telephone: '',
      image: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewChargeFormation(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    if (isEditMode && editingCharge) {
      // Mode édition
      const updatedCharges = chargeFormations.map(charge => 
        charge.id === editingCharge.id ? { ...charge, ...newChargeFormation } : charge
      );
      setChargeFormations(updatedCharges);
    } else {
      // Mode ajout
      try {
        const res = await fetch('http://localhost:8000/api/admin/charges', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newChargeFormation)
        });
        if (res.ok) {
          const data = await res.json();
          setChargeFormations([...chargeFormations, data.user]);
          setSuccessMsg('Chargé créé et email envoyé !');
        } else {
          const data = await res.json();
          setErrorMsg(data.message || 'Erreur lors de la création du chargé');
        }
      } catch (err) {
        setErrorMsg('Erreur réseau ou serveur');
      }
    }
    setNewChargeFormation({ 
      nom: '', 
      prenom: '', 
      email: '', 
      departement: '',
      telephone: '',
      image: ''
    });
    setEditingCharge(null);
    setIsEditMode(false);
    closePopup();
  };

  const handleDelete = (id) => {
    setChargeFormations(chargeFormations.filter(f => f.id !== id));
    // Si on supprime le dernier élément de la page, revenir à la page précédente
    if (currentItems.length === 1 && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

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
                      <td>{charge.telephone}</td>
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
                          <button 
                            className="delete-button"
                            onClick={() => handleDelete(charge.id)}
                          >
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

            {/* Pagination */}
            {chargesFiltres.length > itemsPerPage && (
              <div className="pagination-container">
                <button 
                  onClick={() => paginate(currentPage - 1)} 
                  disabled={currentPage === 1}
                  className="pagination-button pagination-nav-button"
                >
                  <FiChevronLeft /> Précédent
                </button>

                {/* Premier bouton */}
                <button
                  onClick={() => paginate(1)}
                  className={`pagination-button ${currentPage === 1 ? 'active' : ''}`}
                >
                  1
                </button>

                {/* Points de suspension si nécessaire */}
                {currentPage > 3 && (
                  <span className="pagination-ellipsis">...</span>
                )}

                {/* Boutons autour de la page courante */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(num => num > 1 && num < totalPages && Math.abs(num - currentPage) <= 1)
                  .map(number => (
                    <button
                      key={number}
                      onClick={() => paginate(number)}
                      className={`pagination-button ${currentPage === number ? 'active' : ''}`}
                    >
                      {number}
                    </button>
                  ))}

                {/* Points de suspension si nécessaire */}
                {currentPage < totalPages - 2 && totalPages > 3 && (
                  <span className="pagination-ellipsis">...</span>
                )}

                {/* Dernier bouton */}
                {totalPages > 1 && (
                  <button
                    onClick={() => paginate(totalPages)}
                    className={`pagination-button ${currentPage === totalPages ? 'active' : ''}`}
                  >
                    {totalPages}
                  </button>
                )}

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
                    <FiUser className="input-icon1" />
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
                    <FiUser className="input-icon1" />
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
                    <FiMail className="input-icon1" />
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
                    <FiUser className="input-icon1" />
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
                    <FiAward className="input-icon1" />
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
          {successMsg && <div className="success-message">{successMsg}</div>}
          {errorMsg && <div className="error-message">{errorMsg}</div>}
        </div>
      </main>
    </div>
  );
};

export default ChargeFormations;