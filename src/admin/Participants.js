import React, { useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiUser, FiMail, FiPhone, FiMapPin, FiBook, FiSearch, FiChevronLeft, FiChevronRight, FiChevronDown } from 'react-icons/fi';
import AdminSidebar from './AdminSidebar';
import './Participants.css';
import pdp from '../assets/images/pdp.webp';

const Participants = () => {
  // Données initiales des participants
  const [participants, setParticipants] = useState([
    { 
      id: 1, 
      nom: 'Dupont', 
      prenom: 'Jean', 
      email: 'jean.dupont@example.com', 
      telephone: '0612345678',
      adresse: '12 Rue de la République, Paris',
      niveauEtude: 'Licence',
      formation:'React',
      image: pdp
    },
    { 
      id: 2, 
      nom: 'Martin', 
      prenom: 'Sophie', 
      email: 'sophie.martin@example.com', 
      telephone: '0698765432',
      adresse: '24 Avenue des Champs-Élysées, Paris',
      niveauEtude: 'Master',
      formation:'Angular',
      image: pdp
    },
    { 
      id: 3, 
      nom: 'Bernard', 
      prenom: 'Pierre', 
      email: 'pierre.bernard@example.com', 
      telephone: '0687654321',
      adresse: '5 Rue du Commerce, Lyon',
      niveauEtude: 'Doctorat',
      formation:'Business Intelligence',
      image: pdp
    },
    { 
      id: 4, 
      nom: 'Petit', 
      prenom: 'Marie', 
      email: 'marie.petit@example.com', 
      telephone: '0678945612',
      adresse: '8 Boulevard Voltaire, Marseille',
      niveauEtude: 'Baccalauréat',
      image: pdp
    },
    { 
      id: 5, 
      nom: 'Leroy', 
      prenom: 'Thomas', 
      email: 'thomas.leroy@example.com', 
      telephone: '0632145698',
      adresse: '15 Rue de la Paix, Lille',
      niveauEtude: 'Master',
      image: pdp
    },
    { 
      id: 6, 
      nom: 'Moreau', 
      prenom: 'Julie', 
      email: 'julie.moreau@example.com', 
      telephone: '0698745632',
      adresse: '3 Avenue Foch, Bordeaux',
      niveauEtude: 'Licence',
      image: pdp
    }
  ]);

  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(4); // Nombre d'éléments par page

  // États pour les popups
  const [showPopup, setShowPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [currentParticipant, setCurrentParticipant] = useState(null);
  const [newParticipant, setNewParticipant] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: '',
    niveauEtude: '',
    formation:'',
    image: pdp
  });

  // États pour les filtres et recherche
  const [filtreNiveauEtude, setFiltreNiveauEtude] = useState('Tous');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Options pour les niveaux d'étude
  const niveauxEtude = ['Tous', 'Baccalauréat', 'Licence', 'Master', 'Doctorat'];

  // Filtrer les participants
  const participantsFiltres = participants.filter(participant => {
    const matchesNiveauEtude = filtreNiveauEtude === 'Tous' || participant.niveauEtude === filtreNiveauEtude;
    const matchesSearch = searchTerm === '' || 
      participant.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
      participant.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.telephone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.adresse.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.niveauEtude.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.formation.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesNiveauEtude && matchesSearch;
  });

  // Logique de pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = participantsFiltres.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(participantsFiltres.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Gestion des filtres
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const selectNiveauEtude = (niveau) => {
    setFiltreNiveauEtude(niveau);
    setIsDropdownOpen(false);
    setCurrentPage(1); // Réinitialiser à la première page
  };

  // Gestion des formulaires
  const handleAddClick = () => {
    setNewParticipant({
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      adresse: '',
      niveauEtude: '',
      formation:'',
      image: pdp
    });
    setShowPopup(true);
    setShowEditPopup(false);
  };

  const handleEditClick = (participant) => {
    setCurrentParticipant(participant);
    setNewParticipant({
      nom: participant.nom,
      prenom: participant.prenom,
      email: participant.email,
      telephone: participant.telephone,
      adresse: participant.adresse,
      niveauEtude: participant.niveauEtude,
      formation:participant.formation,
      image: participant.image || pdp
    });
    setShowEditPopup(true);
    setShowPopup(false);
  };

  const closePopup = () => {
    setShowPopup(false);
    setShowEditPopup(false);
    setNewParticipant({
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      adresse: '',
      niveauEtude: '',
      formation:'',
      image: pdp
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewParticipant(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (showPopup) {
      // Ajout d'un nouveau participant
      const newId = participants.length > 0 ? Math.max(...participants.map(p => p.id)) + 1 : 1;
      setParticipants([
        ...participants,
        {
          id: newId,
          ...newParticipant,
          image: newParticipant.image || pdp // si jamais image est vide/null, on met pdp
        }
      ]);
    } else if (showEditPopup) {
      // Modification d'un participant existant
      setParticipants(participants.map(p => 
        p.id === currentParticipant.id ? { ...p, ...newParticipant } : p
      ));
    }
    closePopup();
  };

  const handleDelete = (id) => {
    setParticipants(participants.filter(p => p.id !== id));
    // Si on supprime le dernier élément de la page, revenir à la page précédente
    if (currentItems.length === 1 && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="admin-container">
      <AdminSidebar />
      
      <main className="content-with-sidebar">
        <div className="participants-page">
          {/* Nouvelle structure pour le header */}
          <div className="participants-header">
            <h1 className="page-title">Gestion des Participants</h1>
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
              
              <div className="custom-filtre-container">
                <div 
                  className="filtre-select"
                  onClick={toggleDropdown}
                >
                  <span>{filtreNiveauEtude}</span>
                  <FiChevronDown className={`chevron-icon ${isDropdownOpen ? 'open' : ''}`} />
                </div>
                
                {isDropdownOpen && (
                  <div className="filtre-dropdown">
                    {niveauxEtude.map((niveau) => (
                      <div
                        key={niveau}
                        className={`dropdown-item ${filtreNiveauEtude === niveau ? 'selected' : ''}`}
                        onClick={() => selectNiveauEtude(niveau)}
                      >
                        {niveau}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              
            </div>
          </div>

          <div className="participants-table-container">
            <table className="elegant-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Prénom</th>
                  <th>Email</th>
                  <th>Téléphone</th>
                  <th>Adresse</th>
                  <th>Niveau d'étude</th>
                  <th>Formation</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((participant) => (
                    <tr key={participant.id}>
                      <td>{participant.nom}</td>
                      <td>{participant.prenom}</td>
                      <td>{participant.email}</td>
                      <td>{participant.telephone}</td>
                      <td>{participant.adresse}</td>
                      <td>
                        <span className="niveau-etude-badge">{participant.niveauEtude}</span>
                      </td>
                      <td>{participant.formation}</td>
                      <td>
                        <div className="actions">
                          <button 
                            className="edit-button"
                            onClick={() => handleEditClick(participant)}
                          >
                            <FiEdit2 />
                          </button>
                          <button 
                            className="delete-button"
                            onClick={() => handleDelete(participant.id)}
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="no-results">
                    <td colSpan="7">Aucun participant trouvé</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {participantsFiltres.length > itemsPerPage && (
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
                  <h2>Ajouter un Participant</h2>
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
                      value={newParticipant.nom}
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
                      value={newParticipant.prenom}
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
                      value={newParticipant.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="input-group">
                    <FiPhone className="input-icon1" />
                    <input
                      type="tel"
                      name="telephone"
                      placeholder="Téléphone"
                      value={newParticipant.telephone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="input-group">
                    <FiMapPin className="input-icon1" />
                    <input
                      type="text"
                      name="adresse"
                      placeholder="Adresse"
                      value={newParticipant.adresse}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="input-group">
                    <FiBook className="input-icon1" />
                    <select
                      name="niveauEtude"
                      value={newParticipant.niveauEtude}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Niveau d'étude</option>
                      {niveauxEtude.filter(n => n !== 'Tous').map((niveau) => (
                        <option key={niveau} value={niveau}>{niveau}</option>
                      ))}
                    </select>
                  </div>

                  <div className="input-group">
                    <FiMapPin className="input-icon1" />
                    <input
                      type="text"
                      name="formation"
                      placeholder="Formation"
                      value={newParticipant.formation}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="input-group" style={{flexDirection: 'column', alignItems: 'flex-start'}}>
                    <label>Photo de profil</label>
                    <img src={newParticipant.image} alt="Profil" style={{width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', marginBottom: 8}} />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = ev => {
                            setNewParticipant(prev => ({ ...prev, image: ev.target.result }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
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
                  <h2>Modifier le Participant</h2>
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
                      value={newParticipant.nom}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  {/* Affichage et modification de l'image de profil */}
                  <div className="input-group" style={{flexDirection: 'column', alignItems: 'flex-start'}}>
                    <label>Photo de profil</label>
                    <img src={newParticipant.image} alt="Profil" style={{width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', marginBottom: 8}} />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = ev => {
                            setNewParticipant(prev => ({ ...prev, image: ev.target.result }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </div>
                  
                  <div className="input-group">
                    <FiUser className="input-icon1" />
                    <input
                      type="text"
                      name="prenom"
                      placeholder="Prénom"
                      value={newParticipant.prenom}
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
                      value={newParticipant.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="input-group">
                    <FiPhone className="input-icon1" />
                    <input
                      type="tel"
                      name="telephone"
                      placeholder="Téléphone"
                      value={newParticipant.telephone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="input-group">
                    <FiMapPin className="input-icon1" />
                    <input
                      type="text"
                      name="adresse"
                      placeholder="Adresse"
                      value={newParticipant.adresse}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="input-group">
                    <FiBook className="input-icon1" />
                    <select
                      name="niveauEtude"
                      value={newParticipant.niveauEtude}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Niveau d'étude</option>
                      {niveauxEtude.filter(n => n !== 'Tous').map((niveau) => (
                        <option key={niveau} value={niveau}>{niveau}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="modal-actions">
                    <button type="button" className="cancel-button" onClick={closePopup}>
                      Annuler
                    </button>
                    <button type="submit" className="submit-button">
                      Mettre à jour
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

export default Participants;