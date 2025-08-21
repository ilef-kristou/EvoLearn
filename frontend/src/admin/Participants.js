import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiUser, FiMail, FiPhone, FiSearch, FiChevronLeft, FiChevronRight, FiRefreshCw } from 'react-icons/fi';
import AdminSidebar from './AdminSidebar';
import './Participants.css';
import pdp from '../assets/images/pdp.webp';

const API_BASE = 'http://localhost:8000';

const Participants = () => {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(4);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [currentParticipant, setCurrentParticipant] = useState(null);
  const [newParticipant, setNewParticipant] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    image: null
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchParticipants = async (page = 1, search = '') => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page,
        perPage: itemsPerPage,
        search: search
      });

      console.log('Fetching participants from:', `${API_BASE}/api/admin/participants?${params}`);

      const response = await fetch(`${API_BASE}/api/admin/participants?${params}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error('Non-JSON response:', text.slice(0, 200));
          throw new Error(`Réponse inattendue du serveur (non JSON, statut ${response.status})`);
        }
        const errorData = await response.json();
        throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text.slice(0, 200));
        throw new Error(`Réponse inattendue du serveur (non JSON, statut ${response.status})`);
      }

      const data = await response.json();

      if (data.success) {
        setParticipants(data.data || []);
        setCurrentPage(data.pagination?.current_page || 1);
        setTotalPages(data.pagination?.last_page || 1);
        setTotalItems(data.pagination?.total || 0);
      } else {
        throw new Error(data.message || 'Erreur inconnue');
      }
    } catch (error) {
      console.error('Erreur récupération participants:', error);
      setError(error.message || 'Erreur lors de la récupération des participants');
      setParticipants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipants(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  const handleAddClick = () => {
    setNewParticipant({
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      image: null
    });
    setShowPopup(true);
    setShowEditPopup(false);
    setError(null);
  };

  const handleEditClick = (participant) => {
    setCurrentParticipant(participant);
    setNewParticipant({
      nom: participant.nom,
      prenom: participant.prenom,
      email: participant.email,
      telephone: participant.telephone,
      image: participant.image
    });
    setShowEditPopup(true);
    setShowPopup(false);
    setError(null);
  };

  const closePopup = () => {
    setShowPopup(false);
    setShowEditPopup(false);
    setNewParticipant({
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      image: null
    });
    setError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewParticipant(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewParticipant(prev => ({ ...prev, image: file }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      Object.keys(newParticipant).forEach(key => {
        if (newParticipant[key] !== null && newParticipant[key] !== undefined) {
          formData.append(key, newParticipant[key]);
        }
      });

      let url, method;
      if (showPopup) {
        url = `${API_BASE}/api/admin/participants`;
        method = 'POST';
      } else {
        url = `${API_BASE}/api/admin/participants/${currentParticipant.id}`;
        method = 'PUT';
      }

      console.log('Submitting to:', url, 'Method:', method);

      const response = await fetch(url, {
        method: method,
        body: formData,
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error('Non-JSON response:', text.slice(0, 200));
          throw new Error(`Réponse inattendue du serveur (non JSON, statut ${response.status})`);
        }
        const errorData = await response.json();
        throw new Error(errorData.message || `Erreur ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text.slice(0, 200));
        throw new Error(`Réponse inattendue du serveur (non JSON, statut ${response.status})`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || `Erreur ${response.status}`);
      }

      fetchParticipants(currentPage, searchTerm);
      closePopup();
    } catch (error) {
      console.error('Erreur soumission formulaire:', error);
      setError(error.message || 'Erreur lors de la soumission du formulaire');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce participant ?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/admin/participants/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      console.log('Delete response status:', response.status);
      console.log('Delete response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error('Non-JSON response:', text.slice(0, 200));
          throw new Error(`Réponse inattendue du serveur (non JSON, statut ${response.status})`);
        }
        const errorData = await response.json();
        throw new Error(errorData.message || `Erreur ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text.slice(0, 200));
        throw new Error(`Réponse inattendue du serveur (non JSON, statut ${response.status})`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || `Erreur ${response.status}`);
      }

      fetchParticipants(currentPage, searchTerm);
    } catch (error) {
      console.error('Erreur suppression:', error);
      setError(error.message || 'Erreur lors de la suppression');
    }
  };

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const refreshData = () => {
    fetchParticipants(currentPage, searchTerm);
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return pdp;
    if (imagePath instanceof File) return URL.createObjectURL(imagePath);
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_BASE}/storage/${imagePath}`;
  };

  return (
    <div className="admin-container">
      <AdminSidebar />
      
      <main className="content-with-sidebar">
        <div className="participants-page">
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
              
              <button className="refresh-button" onClick={refreshData} title="Actualiser">
                <FiRefreshCw />
              </button>
              
              <button className="add-button" onClick={handleAddClick}>
                <FiPlus /> Ajouter
              </button>
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
              <button onClick={() => setError(null)}>×</button>
            </div>
          )}

          <div className="participants-table-container">
            {loading ? null : (
              <>
                <table className="elegant-table">
                  <thead>
                    <tr>
                      <th>Photo</th>
                      <th>Nom</th>
                      <th>Prénom</th>
                      <th>Email</th>
                      <th>Téléphone</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants.length > 0 ? (
                      participants.map((participant) => (
                        <tr key={participant.id}>
                          <td>
                            <div className="user-info">
                              <img 
                                src={getImageUrl(participant.image)}
                                alt={`${participant.nom} ${participant.prenom}`}
                                className="profile-image"
                                onError={e => { e.target.src = pdp; }}
                              />
                            </div>
                          </td>
                          <td>{participant.nom}</td>
                          <td>{participant.prenom}</td>
                          <td>{participant.email}</td>
                          <td>{participant.telephone}</td>
                          <td>
                            <div className="actions">
                              <button 
                                className="edit-button"
                                onClick={() => handleEditClick(participant)}
                                title="Modifier"
                              >
                                <FiEdit2 />
                              </button>
                              <button 
                                className="delete-button"
                                onClick={() => handleDelete(participant.id)}
                                title="Supprimer"
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="no-results">
                        <td colSpan="6">
                          {searchTerm 
                            ? 'Aucun participant ne correspond à votre recherche' 
                            : 'Aucun participant trouvé'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {totalPages > 1 && (
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

                
              </>
            )}
          </div>

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
                    <FiUser className="input-icon" />
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
                    <FiUser className="input-icon" />
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
                    <FiMail className="input-icon" />
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
                    <FiPhone className="input-icon" />
                    <input
                      type="tel"
                      name="telephone"
                      placeholder="Téléphone"
                      value={newParticipant.telephone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="input-group image-upload">
                    <label>Photo de profil (optionnel)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    {newParticipant.image && (
                      <div className="image-preview">
                        <img 
                          src={getImageUrl(newParticipant.image)} 
                          alt="Aperçu" 
                        />
                      </div>
                    )}
                  </div>
                  
                  {error && <div className="form-error">{error}</div>}
                  
                  <div className="modal-actions">
                    <button 
                      type="button" 
                      className="cancel-button" 
                      onClick={closePopup}
                      disabled={isSubmitting}
                    >
                      Annuler
                    </button>
                    <button 
                      type="submit" 
                      className="submit-button"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Traitement...' : 'Enregistrer'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

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
                    <FiUser className="input-icon" />
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
                    <FiUser className="input-icon" />
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
                    <FiMail className="input-icon" />
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
                    <FiPhone className="input-icon" />
                    <input
                      type="tel"
                      name="telephone"
                      placeholder="Téléphone"
                      value={newParticipant.telephone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="input-group image-upload">
                    <label>Photo de profil</label>
                    <div className="current-image">
                      <img 
                        src={getImageUrl(newParticipant.image)} 
                        alt="Profil actuel" 
                      />
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    {newParticipant.image instanceof File && (
                      <div className="image-preview">
                        <span>Nouvel aperçu:</span>
                        <img 
                          src={URL.createObjectURL(newParticipant.image)} 
                          alt="Nouvel aperçu" 
                        />
                      </div>
                    )}
                  </div>
                  
                  {error && <div className="form-error">{error}</div>}
                  
                  <div className="modal-actions">
                    <button 
                      type="button" 
                      className="cancel-button" 
                      onClick={closePopup}
                      disabled={isSubmitting}
                    >
                      Annuler
                    </button>
                    <button 
                      type="submit" 
                      className="submit-button"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Mise à jour...' : 'Mettre à jour'}
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