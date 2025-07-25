import React, { useState } from 'react';
import { 
  FiUser, FiBook, FiMail, FiPhone, FiMapPin, FiAward, 
  FiCalendar, FiCheck, FiX, FiSearch, FiFilter, 
  FiChevronDown, FiClock, FiDownload
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

  const formations = [
    { id: 1, nom: "React Avancé"},
    { id: 2, nom: "UX/UI Design" },
    { id: 3, nom: "Data Science" }
  ];

  const demandes = [
    {
      id: 1,
      utilisateur: {
        nom: "Dupont",
        prenom: "Jean",
        email: "jean.dupont@example.com",
        telephone: "+33 6 12 34 56 78",
        adresse: "12 Rue de la République, 75001 Paris",
        niveauEtude: "Master en Informatique",
        cv: "CV_Jean_Dupont.pdf"
      },
      formation: "React Avancé",
      dateDemande: "2023-11-15",
      statut: "En attente",
      motivation: "Je souhaite approfondir mes connaissances en React pour mon poste de développeur front-end. Après 3 ans d'expérience avec Angular, je veux maîtriser React pour élargir mes opportunités professionnelles."
    },
    {
      id: 2,
      utilisateur: {
        nom: "Martin",
        prenom: "Sophie",
        email: "sophie.martin@example.com",
        telephone: "+33 6 98 76 54 32",
        adresse: "24 Avenue des Champs-Élysées, 75008 Paris",
        niveauEtude: "Licence en Design",
        cv: "CV_Sophie_Martin.pdf"
      },
      formation: "UX/UI Design",
      dateDemande: "2023-11-10",
      statut: "Acceptée",
      motivation: "En tant que designer graphique, je souhaite me spécialiser en UX/UI pour créer des expériences utilisateur mémorables. Cette formation complétera parfaitement mes compétences actuelles."
    },
    {
      id: 3,
      utilisateur: {
        nom: "Bernard",
        prenom: "Luc",
        email: "luc.bernard@example.com",
        telephone: "+33 6 45 67 89 01",
        adresse: "5 Rue de Rivoli, 75004 Paris",
        niveauEtude: "Doctorat en Mathématiques",
        cv: "CV_Luc_Bernard.pdf"
      },
      formation: "Data Science",
      dateDemande: "2023-11-05",
      statut: "Refusée",
      motivation: "Mon background en mathématiques appliquées me donne une base solide pour me lancer dans la data science. Je souhaite acquérir des compétences pratiques en machine learning et analyse de données."
    }
  ];

  const filteredDemandes = demandes.filter(demande => {
    const matchesSearch = `${demande.utilisateur.prenom} ${demande.utilisateur.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         demande.formation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'Tous' || demande.statut === statusFilter;
    const matchesFormation = formationFilter === 'Toutes' || demande.formation === formationFilter;
    
    return matchesSearch && matchesStatus && matchesFormation;
  });

  const openModal = (demande) => {
    setSelectedDemande(demande);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const accepterDemande = (id) => {
    console.log(`Demande ${id} acceptée`);
    // Mettre à jour via API
  };

  const refuserDemande = (id) => {
    console.log(`Demande ${id} refusée`);
    // Mettre à jour via API
  };

  return (
    <div className={`charge-formations-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <ChargeSidebar onToggle={setIsSidebarCollapsed} />
    
    <motion.div 
      className="demandes-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header Animé */}
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

      {/* Section Filtres */}
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
              backgroundColor: getFormationColor(searchTerm ? formations[0].nom : null) || '#6366F1'
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
                <option key={formation.id} value={formation.nom}>{formation.nom}</option>
              ))}
            </select>
            <FiChevronDown className="chevron-icon" />
          </motion.div>
        </div>
      </motion.section>

      {/* Tableau des Demandes */}
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
                  <th>Date</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </motion.tr>
              </thead>
              <tbody>
                {filteredDemandes.map((demande, index) => {
                  const formationColor = getFormationColor(demande.formation);
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
                            style={{ background: formations.find(f => f.nom === demande.formation)?.degrade }}
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
                          {demande.formation}
                        </motion.div>
                      </td>
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
                              
                              
                            </>
                          )}
                          <motion.button
                            className="action-btn accept"
                            
                            whileHover={{ 
                              scale: 1.1,
                              backgroundColor: '#2c3e50'
                            }}
                            whileTap={{ scale: 0.9 }}
                          >
                            Accepter
                            <FiX />
                          </motion.button>
                          <motion.button
                            className="action-btn reject"
                            
                            whileHover={{ 
                              scale: 1.1,
                              backgroundColor: 'rgba(243, 159, 154, 0.2)'
                            }}
                            whileTap={{ scale: 0.9 }}
                          >
                            Refuser
                            <FiX />
                          </motion.button>
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

      {/* Modal de Détails */}
      <AnimatePresence>
        {isModalOpen && (
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
                borderTop: `4px solid ${getFormationColor(selectedDemande?.formation)}`
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
                  
                  <span className="user-name">{selectedDemande?.utilisateur.prenom} {selectedDemande?.utilisateur.nom}</span>
                </h2>
                <motion.div
                  className={`status-badge ${selectedDemande?.statut.toLowerCase().replace('é', 'e')}`}
                  whileHover={{ y: -3 }}
                >
                  {selectedDemande?.statut}
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
                      { icon: <FiUser />, label: "Nom complet", value: `${selectedDemande?.utilisateur.prenom} ${selectedDemande?.utilisateur.nom}` },
                      { icon: <FiMail />, label: "Email", value: selectedDemande?.utilisateur.email },
                      { icon: <FiPhone />, label: "Téléphone", value: selectedDemande?.utilisateur.telephone },
                      { icon: <FiMapPin />, label: "Adresse", value: selectedDemande?.utilisateur.adresse },
                      { icon: <FiAward />, label: "Niveau d'étude", value: selectedDemande?.utilisateur.niveauEtude },
                      
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
                      <p>{new Date(selectedDemande?.dateDemande).toLocaleDateString('fr-FR')}</p>
                    </motion.div>
                    <motion.div 
                      className="meta-item"
                      whileHover={{ y: -3 }}
                    >
                      <label>Formation souhaitée</label>
                      <p className="formation-name">{selectedDemande?.formation}</p>
                    </motion.div>
                  </div>
                  
                </div>
              

              <motion.div 
                className="modal-footer"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                {selectedDemande?.statut === "En attente" && (
                  <>
                    <motion.button
                      className="modal-btn accept"
                      onClick={() => accepterDemande(selectedDemande.id)}
                      whileHover={{ 
                        scale: 1.05,
                        boxShadow: "0 5px 15px rgba(16, 185, 129, 0.4)"
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FiCheck /> Accepter
                    </motion.button>
                    <motion.button
                      className="modal-btn reject"
                      onClick={() => refuserDemande(selectedDemande.id)}
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

  function getFormationColor(formationName) {
    const formation = formations.find(f => f.nom === formationName);
    return formation ? formation.couleur : "#6366F1";
  }
};

export default DemandesInscriptionPage;