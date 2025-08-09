import React, { useState } from 'react';
import { FiCalendar, FiClock, FiUser, FiMapPin, FiPlus, FiEdit2, FiTrash2, FiChevronDown, FiChevronUp, FiSearch, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import './PlanningFormations.css';
import ChargeSidebar from './ChargeSidebar';

const PlanningFormations = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const joursSemaine = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  const sallesDisponibles = ["Salle A1", "Salle A2", "Salle B1", "Salle B2", "Salle C1"];
  const repetitions = ["Hebdomadaire", "Bi-hebdomadaire"];

  const [formations, setFormations] = useState([
    {
      id: 1,
      titre: "Formation React Avancé",
      description: "Maîtrise des concepts avancés de React",
      duree: "3 mois",
      image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      couleur: "#6366F1",
      bgImage: "linear-gradient(to right, #2c3e50, #5483b3)",
      seance: {
        dateDebut: "2023-10-01",
        dateFin: "2023-12-30",
        jours: [
          { 
            jour: "Lundi", 
            heureDebut: "09:00", 
            heureFin: "12:00",
            salle: "Salle A1"
          },
          { 
            jour: "Mercredi", 
            heureDebut: "14:00", 
            heureFin: "17:00",
            salle: "Salle B1"
          },
          { 
            jour: "Vendredi", 
            heureDebut: "10:00", 
            heureFin: "13:00",
            salle: "Salle A2"
          }
        ],
        formateur: "Jean Dupont",
        couleur: "#8B5CF6"
      }
    },
    {
      id: 2,
      titre: "Formation UX/UI Design",
      description: "Apprendre les principes du design d'interface",
      duree: "2 mois",
      image: "https://images.unsplash.com/photo-1541462608143-67571c6738dd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      couleur: "#EC4899",
      bgImage: "linear-gradient(to right, #2c3e50, #5483b3)",
      seance: null
    }
  ]);

  const [selectedFormation, setSelectedFormation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSeance, setCurrentSeance] = useState({
    dateDebut: "",
    dateFin: "",
    jours: [],
    formateur: "",
    couleur: `hsl(${Math.random() * 360}, 75%, 60%)`
  });

  const [expandedFormation, setExpandedFormation] = useState(null);
  const [formateurs] = useState(["Jean Dupont", "Marie Martin", "Pierre Durand", "Sophie Lambert"]);
  const [searchTerm, setSearchTerm] = useState("");

  const toggleFormation = (id) => {
    setExpandedFormation(expandedFormation === id ? null : id);
  };

  const openAddSeanceModal = (formation) => {
    setSelectedFormation(formation);
    setCurrentSeance({
      dateDebut: "",
      dateFin: "",
      jours: [],
      formateur: "",
      couleur: `hsl(${Math.random() * 360}, 75%, 60%)`
    });
    setIsModalOpen(true);
  };

  const openEditSeanceModal = (formation) => {
    setSelectedFormation(formation);
    setCurrentSeance({ ...formation.seance });
    setIsModalOpen(true);
  };

  const handleSeanceSubmit = (e) => {
    e.preventDefault();
    const updatedFormations = formations.map(formation => {
      if (formation.id !== selectedFormation.id) return formation;
      return { ...formation, seance: { ...currentSeance } };
    });
    setFormations(updatedFormations);
    setIsModalOpen(false);
  };

  const deleteSeance = (formationId) => {
    setFormations(formations.map(formation =>
      formation.id !== formationId ? formation : { ...formation, seance: null }
    ));
  };

  const toggleJourSelection = (jour) => {
    setCurrentSeance(prev => {
      const isSelected = prev.jours.some(j => j.jour === jour);
      const jours = isSelected
        ? prev.jours.filter(j => j.jour !== jour)
        : [...prev.jours, { 
            jour, 
            heureDebut: "09:00", 
            heureFin: "12:00",
            salle: sallesDisponibles[0]
          }];
      return { ...prev, jours };
    });
  };

  const removeJourConfig = (jour) => {
    setCurrentSeance(prev => ({
      ...prev,
      jours: prev.jours.filter(j => j.jour !== jour)
    }));
  };

  const updateJourConfig = (jour, field, value) => {
    setCurrentSeance(prev => ({
      ...prev,
      jours: prev.jours.map(j => 
        j.jour === jour ? { ...j, [field]: value } : j
      )
    }));
  };

  const filteredFormations = formations.filter(formation =>
    formation.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    formation.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`charge-formations-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <ChargeSidebar onToggle={setIsSidebarCollapsed} />
      
      <main className="main-content">
        <motion.div 
          className="page-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, type: "spring" }}
        >
          <div className="header-content">
            <div className="header-text">
              <h1>Planning des Formations</h1>
              <p className="header-description">Gérez les séances de vos formations</p>
            </div>
            
            <div className="header-actions">
              <div className="search-control">
                <FiSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Rechercher une formation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </motion.div>

        <div className="formations-list">
          {filteredFormations.length > 0 ? (
            filteredFormations.map(formation => (
              <motion.div
                key={formation.id}
                className="formation-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div 
                  className="formation-header" 
                  style={{ backgroundImage: formation.bgImage }}
                >
                  <div className="header-overlay" />
                  <div className="formation-identity" onClick={() => toggleFormation(formation.id)}>
                    <motion.div 
                      className="formation-image-container"
                      whileHover={{ rotate: 2, scale: 1.03 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <img src={formation.image} alt={formation.titre} className="formation-image" />
                    </motion.div>
                    
                    <div className="formation-info">
                      <motion.h2 
                        initial={{ x: -10 }}
                        animate={{ x: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        {formation.titre}
                      </motion.h2>
                      
                      <motion.p 
                        className="formation-description"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        {formation.description}
                      </motion.p>
                      
                      <motion.div 
                        className="formation-meta"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <span className="duration-badge">
                          <FiCalendar className="meta-icon" />
                          {formation.duree}
                        </span>
                      </motion.div>
                    </div>
                  </div>
                  
                  <div className="formation-actions">
                    {expandedFormation === formation.id ? <FiChevronUp /> : <FiChevronDown />}
                  </div>
                </div>
                
                <AnimatePresence>
                  {expandedFormation === formation.id && (
                    <motion.div
                      className="sessions-container"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="sessions-header">
                        <div className="sessions-title">
                          <h3>Séances programmées</h3>
                        </div>
                        <div className="sessions-actions">
                          {formation.seance ? (
                            <motion.button
                              className="edit-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditSeanceModal(formation);
                              }}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <FiEdit2 />
                            </motion.button>
                          ) : (
                            <motion.button
                              className="add-session-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                openAddSeanceModal(formation);
                              }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <FiPlus /> Ajouter une séance
                            </motion.button>
                          )}
                        </div>
                      </div>
                      {formation.seance ? (
                        <div className="sessions-list">
                          <motion.div
                            className="session-card"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            whileHover={{ y: -3 }}
                            style={{ 
                              borderLeft: `4px solid #e6b801`,
                              boxShadow: `0 4px 12px ${formation.seance.couleur}20`
                            }}
                          >
                            <div className="session-content">
                              <div className="session-meta">
                                <div className="session-jours-horizontal">
                                  {formation.seance.jours.map((jourObj, index) => (
                                    <div key={index} className="jour-item-horizontal">
                                      <div className="jour-header">
                                        <FiClock className="icon" />
                                        <span className="jour-name">{jourObj.jour}</span>
                                      </div>
                                      <div className="jour-details">
                                        <span>{jourObj.heureDebut} - {jourObj.heureFin}</span>
                                        <div className="salle-info">
                                          <FiMapPin className="icon" />
                                          <span>{jourObj.salle}</span>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <div className="meta-item">
                                  <FiUser className="icon" />
                                  <span>{formation.seance.formateur}</span>
                                </div>
                                <div className="meta-item">
                                  <FiCalendar className="icon" />
                                  <span>{formation.seance.dateDebut} - {formation.seance.dateFin}</span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        </div>
                      ) : (
                        <div className="no-sessions">
                          <p>Aucune séance programmée</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          ) : (
            <div className="no-formations">
              <p>Aucune formation trouvée</p>
            </div>
          )}
        </div>

        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
            >
              <motion.div
                className="modal-content"
                initial={{ scale: 0.9, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 50 }}
                onClick={(e) => e.stopPropagation()}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              >
                <div className="modal-header">
                  <h2>{selectedFormation && selectedFormation.seance ? "Modifier la séance" : "Ajouter une séance"}</h2>
                  <motion.button
                    className="close-btn"
                    onClick={() => setIsModalOpen(false)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <FiX />
                  </motion.button>
                </div>
                
                <form onSubmit={handleSeanceSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Date de début</label>
                      <input
                        type="date"
                        value={currentSeance.dateDebut}
                        onChange={(e) => setCurrentSeance({...currentSeance, dateDebut: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Date de fin</label>
                      <input
                        type="date"
                        value={currentSeance.dateFin}
                        onChange={(e) => setCurrentSeance({...currentSeance, dateFin: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Jours de la semaine</label>
                    <div className="jours-selection">
                      {joursSemaine.map(jour => (
                        <button
                          key={jour}
                          type="button"
                          className={`jour-btn ${currentSeance.jours.some(j => j.jour === jour) ? 'selected' : ''}`}
                          onClick={() => toggleJourSelection(jour)}
                        >
                          {jour}
                        </button>
                      ))}
                    </div>
                  </div>

                  {currentSeance.jours.map((jourObj, index) => (
                    <div key={index} className="jour-configuration" style={{position: 'relative', paddingTop: '1.5rem'}}>
                      <span style={{position: 'absolute', top: '0.5rem', right: '0.5rem'}}>
                        <button type="button" style={{background: 'none', border: 'none', color: '#EF4444', fontSize: '1.3rem', cursor: 'pointer'}} title={`Supprimer ${jourObj.jour}`} onClick={() => removeJourConfig(jourObj.jour)}>
                          <FiTrash2 />
                        </button>
                      </span>
                      <div style={{fontWeight: 500, marginBottom: '0.5rem'}}>{jourObj.jour}</div>
                      
                      <div className="form-row">
                        <div className="form-group">
                          <label>Heure de début</label>
                          <input
                            type="time"
                            value={jourObj.heureDebut}
                            onChange={(e) => updateJourConfig(jourObj.jour, 'heureDebut', e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label>Heure de fin</label>
                          <input
                            type="time"
                            value={jourObj.heureFin}
                            onChange={(e) => updateJourConfig(jourObj.jour, 'heureFin', e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="form-row">
                        <div className="form-group">
                          <label>Salle</label>
                          <select
                            value={jourObj.salle}
                            onChange={(e) => updateJourConfig(jourObj.jour, 'salle', e.target.value)}
                            required
                          >
                            {sallesDisponibles.map(salle => (
                              <option key={salle} value={salle}>{salle}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="form-group">
                    <label>Formateur</label>
                    <select
                      value={currentSeance.formateur}
                      onChange={(e) => setCurrentSeance({...currentSeance, formateur: e.target.value})}
                      required
                    >
                      <option value="">Sélectionner un formateur</option>
                      {formateurs.map(formateur => (
                        <option key={formateur} value={formateur}>{formateur}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-actions">
                    <motion.button
                      type="button"
                      className="cancel-btn"
                      onClick={() => setIsModalOpen(false)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Annuler
                    </motion.button>
                    <motion.button
                      type="submit"
                      className="submit-btn"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {selectedFormation && selectedFormation.seance ? "Modifier" : "Ajouter"}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default PlanningFormations;