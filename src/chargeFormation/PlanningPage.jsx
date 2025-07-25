import React, { useState } from 'react';
import { FiCalendar, FiClock, FiMapPin, FiUser, FiEdit2, FiTrash2, FiPlus, FiX, FiRepeat } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import './PlanningPage.css';
import ChargeSidebar from './ChargeSidebar';

const PlanningPage = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const formation = {
    titre: "Formation React Avancé",
    description: "Maîtrisez les concepts avancés de React et des hooks modernes",
    duree: "6 semaines",
    couleur: "#6366F1",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
  };

  const joursSemaine = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  const sallesDisponibles = ["Salle A1", "Salle A2", "Salle B1", "Salle B2", "Amphi Principal"];
  const formateurs = ["Jean Dupont", "Marie Martin", "Sophie Lambert"];
  const repetitions = ["Hebdomadaire", "Bi-hebdomadaire"];

  const [seance, setSeance] = useState({
    horaires: [
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
      }
    ],
    formateur: "Jean Dupont",
    couleur: "#e6b801"
  });
  const [hasSeance, setHasSeance] = useState(true);
  const [affectationStatut, setAffectationStatut] = useState('refusé'); // 'en attente', 'accepté', 'refusé'
  const [causeRefus, setCauseRefus] = useState('blalallalallalallalalal');

  const [modalOpen, setModalOpen] = useState(false);
  const [currentSeance, setCurrentSeance] = useState({
    horaires: [],
    formateur: "",
    couleur: "#e6b801"
  });

  const ajouterSeance = () => {
    setCurrentSeance({
      horaires: [],
      formateur: "",
      couleur: `hsl(${Math.random() * 360}, 75%, 60%)`
    });
    setModalOpen(true);
  };

  const editerSeance = () => {
    setCurrentSeance(seance);
    setModalOpen(true);
  };

  const supprimerSeance = () => {
    setSeance({ horaires: [], formateur: "", couleur: "#e6b801" });
    setHasSeance(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSeance(currentSeance);
    setHasSeance(true);
    setModalOpen(false);
  };

  const updateHoraire = (index, field, value) => {
    const newHoraires = [...currentSeance.horaires];
    newHoraires[index] = { ...newHoraires[index], [field]: value };
    setCurrentSeance({ ...currentSeance, horaires: newHoraires });
  };

  const addHoraire = () => {
    setCurrentSeance({
      ...currentSeance,
      horaires: [
        ...currentSeance.horaires,
        { 
          jour: "Lundi", 
          heureDebut: "09:00", 
          heureFin: "12:00", 
          salle: "Salle A1"
        }
      ]
    });
  };

  const removeHoraire = (index) => {
    const newHoraires = currentSeance.horaires.filter((_, i) => i !== index);
    setCurrentSeance({ ...currentSeance, horaires: newHoraires });
  };

  const showDateFinField = (recurrence) => {
    return recurrence !== "Ponctuel";
  };

  return (
    <div className={`planning-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <ChargeSidebar onToggle={setIsSidebarCollapsed} />
      <main className="main-content">
        <motion.header 
          className="planning-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, type: "spring" }}
        >
          <div className="header-background" style={{ backgroundImage: `linear-gradient(to right, #2c3e50, #5483b3)` }} />
          <div className="header-content">
            <div className="formation-identity">
              <motion.div 
                className="formation-image-container"
                whileHover={{ rotate: 2, scale: 1.03 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <img src={formation.image} alt={formation.titre} className="formation-image" />
              </motion.div>
              <div className="formation-info">
                <motion.h1 
                  initial={{ x: -10 }}
                  animate={{ x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {formation.titre}
                </motion.h1>
                <motion.p 
                  className="formation-description"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {formation.description}
                </motion.p>
                <div className="header-top-row">
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
                  {!hasSeance && (
                    <motion.button
                      className="add-button"
                      onClick={ajouterSeance}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      whileHover={{ 
                        scale: 1.05,
                        boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FiPlus /> Ajouter une séance
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.header>
        <div style={{width: '100%'}}>
          {!hasSeance || !seance.horaires.length ? (
            <motion.div 
              className="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <p>Aucune séance programmée</p>
              <motion.button
                className="add-button"
                onClick={ajouterSeance}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiPlus /> Ajouter une séance
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              className="seance-card"
              style={{ width: '100%', maxWidth: '100%', margin: '0 auto', position: 'relative', borderTop: `4px solid ${seance.couleur}`, boxShadow: `0 4px 20px ${seance.couleur}20` }}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
            >
              <motion.button
                className="edit-btn"
                style={{position: 'absolute', top: 18, right: 18, zIndex: 2, background: 'white', borderRadius: '50%', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', padding: 10, border: 'none', cursor: 'pointer'}}
                onClick={editerSeance}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FiEdit2 size={22} />
              </motion.button>
              <div className="seance-content" style={{paddingTop: 32}}>
                <div className="seance-meta">
                  <div className="meta-item">
                    <FiUser className="icon" />
                    <span>
                      {seance.formateur} <span className={`statut-badge ${affectationStatut}`}>({affectationStatut === 'en attente' ? 'en attente' : affectationStatut === 'accepté' ? 'accepté' : 'refusé'})</span>
                    </span>
                  </div>
                  {affectationStatut === 'refusé' && causeRefus && (
                    <div className="meta-item cause-refus">
                      <span>Cause du refus : <span style={{ color: '#EF4444', fontWeight: 600 }}>{causeRefus}</span></span>
                    </div>
                  )}
                  <div className="meta-item">
                    <FiCalendar className="icon" />
                    <span>Du 01/10/2023 au 30/12/2023</span>
                  </div>
                </div>
                <div className="horaires-list" style={{display: 'flex', flexDirection:'row',flexWrap: 'nowrap', gap: '0.9rem', alignItems: 'stretch', overflowX: 'auto'}}>
                  {seance.horaires.map((horaire, index) => (
                    <div key={index} className="jour-item" style={{background: '#f7f7f7', borderRadius: 8, padding: '0.7rem 1rem', minWidth: 240, flex: '0 0 140px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center'}}>
                      <div className="jour-header" style={{display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem'}}>
                        <FiClock className="icon" />
                        <span className="jour-name">{horaire.jour}</span>
                      </div>
                      <div className="jour-details" style={{display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.9rem', marginLeft: '1.8rem'}}>
                        <span>{horaire.heureDebut} - {horaire.heureFin}</span>
                        <div className="salle-info" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                          <FiMapPin className="icon" />
                          <span>{horaire.salle}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <AnimatePresence>
          {modalOpen && (
            <motion.div 
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
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
                  <h2>{currentSeance.id ? "Modifier la séance" : "Nouvelle séance"}</h2>
                  <motion.button
                    className="close-btn"
                    onClick={() => setModalOpen(false)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <FiX />
                  </motion.button>
                </div>
                
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Formateur</label>
                    <select
                      value={currentSeance.formateur}
                      onChange={(e) => setCurrentSeance({...currentSeance, formateur: e.target.value})}
                      required
                    >
                      <option value="">Sélectionner un formateur</option>
                      {formateurs.map((formateur, index) => (
                        <option key={index} value={formateur}>{formateur}</option>
                      ))}
                    </select>
                  </div>
                  <div className="horaires-section">
                    <label>Jours et horaires</label>
                    {currentSeance.horaires.map((horaire, index) => (
                      <div key={index} className="horaire-form">
                        <div className="form-row">
                          <div className="form-group">
                            <label>Jour</label>
                            <select
                              value={horaire.jour}
                              onChange={(e) => updateHoraire(index, 'jour', e.target.value)}
                              required
                            >
                              {joursSemaine.map((jour, i) => (
                                <option key={i} value={jour}>{jour}</option>
                              ))}
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Heure de début</label>
                            <input
                              type="time"
                              value={horaire.heureDebut}
                              onChange={(e) => updateHoraire(index, 'heureDebut', e.target.value)}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Heure de fin</label>
                            <input
                              type="time"
                              value={horaire.heureFin}
                              onChange={(e) => updateHoraire(index, 'heureFin', e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        <div className="form-group">
                          <label>Salle</label>
                          <select
                            value={horaire.salle}
                            onChange={(e) => updateHoraire(index, 'salle', e.target.value)}
                            required
                          >
                            {sallesDisponibles.map((salle, i) => (
                              <option key={i} value={salle}>{salle}</option>
                            ))}
                          </select>
                        </div>
                        {currentSeance.horaires.length > 1 && (
                          <button 
                            type="button" 
                            className="remove-horaire"
                            onClick={() => removeHoraire(index)}
                          >
                            Supprimer ce jour
                          </button>
                        )}
                      </div>
                    ))}
                    <button 
                      type="button" 
                      className="add-horaire"
                      onClick={addHoraire}
                    >
                      + Ajouter un jour
                    </button>
                  </div>
                  <div className="form-actions">
                    <button 
                      type="button" 
                      className="cancel-btn"
                      onClick={() => setModalOpen(false)}
                    >
                      Annuler
                    </button>
                    <button 
                      type="submit" 
                      className="submit-btn"
                    >
                      Enregistrer
                    </button>
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

export default PlanningPage;