import React, { useState, useEffect } from 'react';
import { 
  FiUser, FiBook, FiMail, FiPhone, FiMapPin, FiAward, 
  FiCalendar, FiCheck, FiX, FiSearch, FiFilter, 
  FiChevronDown
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import './DemandesInscriptionPage.css';
import ChargeSidebar from './ChargeSidebar';

const DemandesInscriptionPage = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tous');
  const [formationFilter, setFormationFilter] = useState('Toutes');
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(null);
  const [demandes, setDemandes] = useState([]);
  const [formations, setFormations] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8000/api/participant/demandes')
      .then(res => res.json())
      .then(data => setDemandes(data));
      
    fetch('http://localhost:8000/api/formations')
      .then(res => res.json())
      .then(data => setFormations(data.map(f => ({ 
        id: f.id, 
        nom: f.titre, 
        titre: f.titre, 
        description: f.description, 
        date_debut: f.date_debut, 
        date_fin: f.date_fin, 
        places_disponibles: f.places_disponibles,
        places_reservees: f.places_reservees,
        niveau_requis: f.niveau_requis, 
        couleur: f.couleur 
      }))));
  }, []);

  const filteredDemandes = demandes.filter(demande => {
    const matchesSearch = `${demande.utilisateur.prenom} ${demande.utilisateur.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (demande.formation && demande.formation.titre.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'Tous' || demande.statut === statusFilter;
    const matchesFormation = formationFilter === 'Toutes' || (demande.formation && demande.formation.titre === formationFilter);
    
    return matchesSearch && matchesStatus && matchesFormation;
  });

  const openModal = (demande) => {
    setSelectedDemande(demande);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const accepterDemande = async (id) => {
    await fetch(`http://localhost:8000/api/participant/demandes/${id}/statut`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ statut: 'Acceptée' })
    });
    
    // Rafraîchir les données
    const [demandesRes, formationsRes] = await Promise.all([
      fetch('http://localhost:8000/api/participant/demandes'),
      fetch('http://localhost:8000/api/formations')
    ]);
    
    const [demandesData, formationsData] = await Promise.all([
      demandesRes.json(),
      formationsRes.json()
    ]);
    
    setDemandes(demandesData);
    setFormations(formationsData.map(f => ({ 
      id: f.id, 
      nom: f.titre, 
      titre: f.titre, 
      description: f.description, 
      date_debut: f.date_debut, 
      date_fin: f.date_fin, 
      places_disponibles: f.places_disponibles,
      places_reservees: f.places_reservees,
      niveau_requis: f.niveau_requis, 
      couleur: f.couleur 
    })));

    if (isModalOpen && selectedDemande?.id === id) {
      setIsModalOpen(false);
    }
  };

  const refuserDemande = async (id) => {
    await fetch(`http://localhost:8000/api/participant/demandes/${id}/statut`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ statut: 'Refusée' })
    });
    
    const updatedDemandes = await fetch('http://localhost:8000/api/participant/demandes')
      .then(res => res.json());
    setDemandes(updatedDemandes);

    if (isModalOpen && selectedDemande?.id === id) {
      setIsModalOpen(false);
    }
  };

  function getFormationColor(formationName) {
    const formation = formations.find(f => f.nom === formationName);
    return formation ? formation.couleur : "#6366F1";
  }

  function getPlacesDisponibles(formationId) {
    const formation = formations.find(f => f.id === formationId);
    if (!formation) return { dispo: 0, total: 0 };
    return {
      dispo: formation.places_disponibles - formation.places_reservees,
      total: formation.places_disponibles
    };
  }

  return (
    <div className={`charge-formations-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <ChargeSidebar onToggle={setIsSidebarCollapsed} />
    
      <motion.div 
        className="demandes-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.header 
          className="animated-header"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          <div className="header-content">
            <motion.h1 
              className="title"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Gestion des demandes
            </motion.h1>
            <motion.p
              className="subtitle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Tableau de bord <span className="pulse">interactif</span> des candidatures
            </motion.p>
          </div>
          <div className="header-wave"></div>
        </motion.header>

        <motion.section 
          className="filters-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <motion.div 
            className="search-container"
            whileHover={{ scale: 1.02 }}
          >
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Rechercher un candidat ou formation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <motion.div 
              className="search-underline"
              animate={{ 
                width: searchTerm ? '100%' : '0%',
                backgroundColor: getFormationColor(
                  searchTerm ? formations.find(f => f.titre.toLowerCase().includes(searchTerm.toLowerCase()))?.nom : null
                ) || '#6366F1'
              }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>

          <div className="filters-group">
            <motion.div 
              className="filter-wrapper"
              whileHover={{ y: -3 }}
            >
              <FiFilter className="filter-icon" />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="Tous">Tous les statuts</option>
                <option value="En attente">En attente</option>
                <option value="Acceptée">Acceptée</option>
                <option value="Refusée">Refusée</option>
              </select>
              <FiChevronDown className="chevron-icon" />
            </motion.div>

            <motion.div 
              className="filter-wrapper"
              whileHover={{ y: -3 }}
            >
              <FiBook className="filter-icon" />
              <select
                value={formationFilter}
                onChange={(e) => setFormationFilter(e.target.value)}
                className="filter-select"
              >
                <option value="Toutes">Toutes les formations</option>
                {formations.map(formation => (
                  <option key={formation.id} value={formation.titre}>{formation.titre}</option>
                ))}
              </select>
              <FiChevronDown className="chevron-icon" />
            </motion.div>
          </div>
        </motion.section>

        <motion.section
          className="table-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <motion.div 
            className="table-header"
            whileHover={{ x: 5 }}
          >
            <h2>Dernières demandes</h2>
          </motion.div>
          
          {filteredDemandes.length > 0 ? (
            <div className="table-scroll">
              <table className="demandes-table">
                <thead>
                  <motion.tr 
                    initial={{ y: -20 }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <th>Candidat</th>
                    <th>Formation</th>
                    <th>Téléphone</th>
                    <th>Niveau d'étude</th>
                    <th>Date</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </motion.tr>
                </thead>
                <tbody>
                  {filteredDemandes.map((demande, index) => {
                    const formationColor = getFormationColor(demande.formation ? demande.formation.titre : '');
                    const places = getPlacesDisponibles(demande.formation?.id);
                    
                    return (
                      <motion.tr 
                        key={demande.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ 
                          scale: 1.01,
                          boxShadow: "0 5px 15px rgba(0,0,0,0.1)"
                        }}
                        onHoverStart={() => setIsHovered(demande.id)}
                        onHoverEnd={() => setIsHovered(null)}
                        className={`demande-row ${demande.statut.toLowerCase().replace('é', 'e')}`}
                      >
                        <td>
                          <div className="user-card">
                            <motion.div
                              className="user-avatar"
                              style={{ background: formations.find(f => f.titre === demande.formation?.titre)?.degrade }}
                              animate={{
                                rotate: isHovered === demande.id ? 360 : 0,
                                scale: isHovered === demande.id ? 1.1 : 1
                              }}
                              transition={{ duration: 0.5 }}
                            >
                              {demande.utilisateur.prenom.charAt(0)}{demande.utilisateur.nom.charAt(0)}
                            </motion.div>
                            <div className="user-info">
                              <strong>{demande.utilisateur.prenom} {demande.utilisateur.nom}</strong>
                              <span className="user-email">{demande.utilisateur.email}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <motion.div
                            className="formation-tag"
                            style={{ 
                              background: `#daf0ff`,
                              borderColor: formationColor,
                              color: '#3498db'
                            }}
                            whileHover={{ 
                              y: -3,
                              boxShadow: `0 4px 8px ${formationColor}40`
                            }}
                          >
                            {demande.formation ? demande.formation.titre : ''}
                          </motion.div>
                        </td>
                        <td>{demande.utilisateur.telephone}</td>
                        <td>{demande.utilisateur.niveauEtude}</td>
                        <td>
                          <motion.div 
                            className="date-cell"
                            whileHover={{ scale: 1.05 }}
                          >
                            <FiCalendar />
                            {new Date(demande.dateDemande).toLocaleDateString('fr-FR')}
                          </motion.div>
                        </td>
                        <td>
                          <motion.div
                            className={`status-badge ${demande.statut.toLowerCase().replace('é', 'e')}`}
                            whileHover={{ 
                              scale: 1.05,
                              y: -3
                            }}
                          >
                            {demande.statut}
                          </motion.div>
                        </td>
                        <td>
                          <div className="action-buttons">
                            {demande.statut === "En attente" && (
                              <>
                                <motion.button
                                  className="action-btn accept"
                                  onClick={() => accepterDemande(demande.id)}
                                  whileHover={{ 
                                    scale: 1.1,
                                    backgroundColor: '#2c3e50'
                                  }}
                                  whileTap={{ scale: 0.9 }}
                                  disabled={places.dispo <= 0}
                                >
                                  Accepter <FiCheck />
                                </motion.button>
                                <motion.button
                                  className="action-btn reject"
                                  onClick={() => refuserDemande(demande.id)}
                                  whileHover={{ 
                                    scale: 1.1,
                                    backgroundColor: 'rgba(243, 159, 154, 0.2)'
                                  }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  Refuser <FiX />
                                </motion.button>
                              </>
                            )}
                            <motion.button
                              className="action-btn details"
                              onClick={() => openModal(demande)}
                              whileHover={{ 
                                scale: 1.1,
                                backgroundColor: 'rgba(99, 102, 241, 0.2)'
                              }}
                              whileTap={{ scale: 0.9 }}
                            >
                              Détails
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <motion.div 
              className="no-results"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring" }}
            >
              <img src="/images/empty-state.svg" alt="Aucun résultat" />
              <h3>Aucune demande trouvée</h3>
              <p>Essayez de modifier vos critères de recherche</p>
              <motion.button
                className="reset-btn"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('Tous');
                  setFormationFilter('Toutes');
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Réinitialiser les filtres
              </motion.button>
            </motion.div>
          )}
        </motion.section>

        <AnimatePresence>
          {isModalOpen && selectedDemande && (
            <motion.div 
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
            >
              <motion.div 
                className="modal-container"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                style={{
                  borderTop: `4px solid ${getFormationColor(selectedDemande.formation ? selectedDemande.formation.titre : '')}`
                }}
              >
                <motion.button
                  className="modal-close"
                  onClick={closeModal}
                  whileHover={{ 
                    rotate: 90,
                    backgroundColor: '#EF4444',
                    color: 'white'
                  }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FiX />
                </motion.button>
                
                <motion.div 
                  className="modal-header"
                  initial={{ y: -20 }}
                  animate={{ y: 0 }}
                >
                  <h2>
                    <span className="user-name">{selectedDemande.utilisateur.prenom} {selectedDemande.utilisateur.nom}</span>
                  </h2>
                  <motion.div
                    className={`status-badge ${selectedDemande.statut.toLowerCase().replace('é', 'e')}`}
                    whileHover={{ y: -3 }}
                  >
                    {selectedDemande.statut}
                  </motion.div>
                </motion.div>

                <div className="user-details-section">
                  <h3>
                    <motion.span 
                      className="section-title"
                      whileHover={{ x: 5 }}
                    >
                      Informations personnelles
                    </motion.span>
                  </h3>
                  <div className="detail-grid">
                    {[
                      { icon: <FiUser />, label: "Nom complet", value: `${selectedDemande.utilisateur.prenom} ${selectedDemande.utilisateur.nom}` },
                      { icon: <FiMail />, label: "Email", value: selectedDemande.utilisateur.email },
                      { icon: <FiPhone />, label: "Téléphone", value: selectedDemande.utilisateur.telephone },
                      { icon: <FiAward />, label: "Niveau d'étude", value: selectedDemande.utilisateur.niveauEtude },
                    ].map((item, index) => (
                      <motion.div 
                        key={index}
                        className="detail-item"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        whileHover={{ y: -3 }}
                      >
                        <div className="detail-icon">{item.icon}</div>
                        <div>
                          <label>{item.label}</label>
                          <p>{item.value}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="demande-details-section">
                  <h3>
                    <motion.span 
                      className="section-title"
                      whileHover={{ x: 5 }}
                    >
                      Détails de la demande
                    </motion.span>
                  </h3>
                  <div className="demande-meta">
                    <motion.div 
                      className="meta-item"
                      whileHover={{ y: -3 }}
                    >
                      <label>Date de demande</label>
                      <p>{new Date(selectedDemande.dateDemande).toLocaleDateString('fr-FR')}</p>
                    </motion.div>
                    <motion.div 
                      className="meta-item"
                      whileHover={{ y: -3 }}
                    >
                      <label>Formation souhaitée</label>
                      <p className="formation-name">{selectedDemande.formation ? selectedDemande.formation.titre : ''}</p>
                    </motion.div>
                  </div>
                </div>
              
                <motion.div 
                  className="modal-footer"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  {selectedDemande.statut === "En attente" && (
                    <>
                      <motion.button
                        className="modal-btn accept"
                        onClick={() => {
                          accepterDemande(selectedDemande.id);
                          closeModal();
                        }}
                        whileHover={{ 
                          scale: 1.05,
                          boxShadow: "0 5px 15px rgba(16, 185, 129, 0.4)"
                        }}
                        whileTap={{ scale: 0.95 }}
                        disabled={selectedDemande.formation && 
                          selectedDemande.formation.places_reservees >= selectedDemande.formation.places_disponibles}
                      >
                        <FiCheck /> Accepter
                      </motion.button>
                      <motion.button
                        className="modal-btn reject"
                        onClick={() => {
                          refuserDemande(selectedDemande.id);
                          closeModal();
                        }}
                        whileHover={{ 
                          scale: 1.05,
                          boxShadow: "0 5px 15px rgba(239, 68, 68, 0.4)"
                        }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FiX /> Refuser
                      </motion.button>
                    </>
                  )}
                  <motion.button
                    className="modal-btn close"
                    onClick={closeModal}
                    whileHover={{ 
                      scale: 1.05,
                      backgroundColor: 'var(--light-gray)'
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Fermer
                  </motion.button>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default DemandesInscriptionPage;