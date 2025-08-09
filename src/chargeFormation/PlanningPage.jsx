import React, { useState, useEffect } from 'react';
import { FiCalendar, FiClock, FiMapPin, FiUser, FiEdit2, FiTrash2, FiPlus, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom'; // Added to access navigation state
import './PlanningPage.css';
import ChargeSidebar from './ChargeSidebar';

const API_BASE = "http://localhost:8000/api";
const JOURS_SEMAINE = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

const normalizeTime = (time) => {
  if (!time) return "09:00";
  if (typeof time !== 'string') return "09:00";
  
  const cleanedTime = time.split(':').slice(0, 2).join(':');
  
  if (/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(cleanedTime)) {
    return cleanedTime;
  }
  return "09:00";
};

const fetchApi = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type') || '';
      let errorText = `Erreur ${response.status}`;
      try {
        if (contentType.includes('application/json')) {
          const errJson = await response.json();
          errorText = errJson.message || JSON.stringify(errJson);
        } else {
          const txt = await response.text();
          if (txt) errorText = txt;
        }
      } catch (e) {}
      throw new Error(errorText);
    }

    if (response.status === 204) return null;

    const ct = response.headers.get('content-type') || '';
    try {
      if (ct.includes('application/json')) return await response.json();
      return await response.text();
    } catch (e) {
      return null;
    }
  } catch (err) {
    console.error("Network error:", err);
    throw new Error("Problème de connexion au serveur");
  }
};

const PlanningPage = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [formation, setFormation] = useState(null);
  const [sallesDisponibles, setSallesDisponibles] = useState([]);
  const [formateursDisponibles, setFormateursDisponibles] = useState([]);
  const [seance, setSeance] = useState(null);
  const [affectationStatut, setAffectationStatut] = useState('en_attente');
  const [causeRefus, setCauseRefus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [currentSeance, setCurrentSeance] = useState({
    formateur_id: "",
    formateur_nom: "",
    horaires: [],
    couleur: "#e6b801",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get formation from navigation state
  const location = useLocation();
  const { formation: formationFromState } = location.state || {};

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!formationFromState?.id) {
          throw new Error("Aucune formation sélectionnée");
        }

        const [formationData, sallesData, formateursData] = await Promise.all([
          fetchApi(`${API_BASE}/formations/${formationFromState.id}`),
          fetchApi(`${API_BASE}/salles`),
          fetchApi(`${API_BASE}/formateurs/available`)
        ]);

        setFormation(formationData);
        setSallesDisponibles(sallesData);
        setFormateursDisponibles(formateursData);

        const plannings = await fetchApi(`${API_BASE}/plannings?formation_id=${formationFromState.id}`);

        if (plannings && plannings.length > 0) {
          const planning = plannings[0];
          const jours = await fetchApi(`${API_BASE}/planning-jours/planning/${planning.id}`);

          setAffectationStatut(planning.statut || 'en_attente');
          setCauseRefus(planning.cause_refus || '');
          setSeance({
            ...planning,
            formateur_nom: formateursData.find(f => f.id === planning.formateur_id)?.nom || "Inconnu",
            horaires: jours,
          });
          setCurrentSeance({
            formateur_id: planning.formateur_id,
            formateur_nom: formateursData.find(f => f.id === planning.formateur_id)?.nom || "Inconnu",
            horaires: jours,
            couleur: planning.couleur || "#e6b801",
            id: planning.id
          });
        }
      } catch (err) {
        setError(err.message);
        console.error("Erreur de chargement:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [formationFromState]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const updateHoraire = (index, field, value) => {
    const newHoraires = [...currentSeance.horaires];
    const updatedHoraire = { ...newHoraires[index] };
    
    updatedHoraire[field] = field.includes('heure') ? normalizeTime(value) : value;
    
    newHoraires[index] = updatedHoraire;
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
          salle_id: sallesDisponibles.length > 0 ? sallesDisponibles[0].id : null
        }
      ]
    });
  };

  const removeHoraire = (index) => {
    const newHoraires = currentSeance.horaires.filter((_, i) => i !== index);
    setCurrentSeance({ ...currentSeance, horaires: newHoraires });
  };

  const ajouterSeance = () => {
    setCurrentSeance({
      formateur_id: "",
      formateur_nom: "",
      horaires: [{
        jour: "Lundi",
        heureDebut: "09:00",
        heureFin: "12:00",
        salle_id: sallesDisponibles.length > 0 ? sallesDisponibles[0].id : null
      }],
      couleur: `hsl(${Math.random() * 360}, 75%, 60%)`
    });
    setModalOpen(true);
  };

  const editerSeance = () => {
    if (seance) {
      setCurrentSeance({
        ...seance,
        horaires: seance.horaires.map(j => ({
          ...j,
          heureDebut: normalizeTime(j.heure_debut || j.heureDebut),
          heureFin: normalizeTime(j.heure_fin || j.heureFin)
        })),
      });
      setModalOpen(true);
    }
  };

  const supprimerSeance = async () => {
    if (!seance?.id) return;

    try {
      if (seance.horaires && seance.horaires.length) {
        await Promise.all(
          seance.horaires.map(jour =>
            fetchApi(`${API_BASE}/planning-jours/${jour.id}`, { method: 'DELETE' })
          )
        );
      }

      await fetchApi(`${API_BASE}/plannings/${seance.id}`, { method: 'DELETE' });

      setSeance(null);
      setAffectationStatut('en_attente');
      setCauseRefus('');
      setCurrentSeance({
        formateur_id: "",
        formateur_nom: "",
        horaires: [],
        couleur: "#e6b801",
      });
      setModalOpen(false);
    } catch (err) {
      setError(err.message);
      console.error("Erreur de suppression:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!currentSeance.formateur_id) {
      setError("Veuillez sélectionner un formateur");
      return;
    }

    if (currentSeance.horaires.length === 0) {
      setError("Veuillez ajouter au moins un horaire");
      return;
    }

    for (const horaire of currentSeance.horaires) {
      if (!horaire.jour || !horaire.heureDebut || !horaire.heureFin || horaire.heureDebut >= horaire.heureFin) {
        setError("Veuillez vérifier les horaires et jours");
        return;
      }
    }

    try {
      const planningData = {
        formation_id: formationFromState.id, // Use dynamic formation ID
        formateur_id: currentSeance.formateur_id,
        couleur: currentSeance.couleur,
        statut: 'en_attente',
        cause_refus: null
      };

      let planningId;
      if (currentSeance.id) {
        await fetchApi(`${API_BASE}/plannings/${currentSeance.id}`, {
          method: 'PUT',
          body: JSON.stringify(planningData)
        });
        planningId = currentSeance.id;
      } else {
        const newPlanning = await fetchApi(`${API_BASE}/plannings`, {
          method: 'POST',
          body: JSON.stringify(planningData)
        });
        planningId = newPlanning.id;
      }

      await Promise.all(
        currentSeance.horaires.map(horaire => {
          const jourData = {
            jour: horaire.jour,
            heure_debut: normalizeTime(horaire.heureDebut),
            heure_fin: normalizeTime(horaire.heureFin),
            salle_id: horaire.salle_id || sallesDisponibles[0]?.id
          };

          if (horaire.id) {
            return fetchApi(`${API_BASE}/planning-jours/${horaire.id}`, {
              method: 'PUT',
              body: JSON.stringify(jourData)
            });
          } else {
            return fetchApi(`${API_BASE}/planning-jours`, {
              method: 'POST',
              body: JSON.stringify({ 
                planning_id: planningId, 
                ...jourData 
              })
            });
          }
        })
      );

      const updatedPlanning = await fetchApi(`${API_BASE}/plannings?formation_id=${formationFromState.id}`);
      if (updatedPlanning && updatedPlanning.length > 0) {
        const planning = updatedPlanning[0];
        const jours = await fetchApi(`${API_BASE}/planning-jours/planning/${planning.id}`);
        
        setSeance({
          ...planning,
          formateur_nom: formateursDisponibles.find(f => f.id === planning.formateur_id)?.nom || "Inconnu",
          horaires: jours,
        });
        
        setAffectationStatut(planning.statut || 'en_attente');
        setCauseRefus(planning.cause_refus || '');
      }

      setModalOpen(false);
    } catch (err) {
      setError("Erreur lors de l'enregistrement : " + err.message);
    }
  };

  if (loading) {
    return (
      <div className={`planning-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <ChargeSidebar onToggle={setIsSidebarCollapsed} />
        <main className="main-content">
          <p>Chargement en cours...</p>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`planning-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <ChargeSidebar onToggle={setIsSidebarCollapsed} />
        <main className="main-content">
          <div className="error-message">
            <p>Erreur: {error}</p>
            <button onClick={() => window.location.reload()}>Réessayer</button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={`planning-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <ChargeSidebar onToggle={setIsSidebarCollapsed} />
      <main className="main-content">
        {formation && (
          <>
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
                    <img src={formation.image || '/default-image.jpg'} alt={formation.titre} className="formation-image" />
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
                          Du {formatDate(formation.date_debut)} au {formatDate(formation.date_fin)}
                        </span>
                      </motion.div>
                      {!seance && (
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

            {!seance || !seance.horaires.length ? (
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
                style={{
                  width: '100%',
                  maxWidth: '100%',
                  margin: '0 auto',
                  position: 'relative',
                  borderTop: `4px solid ${seance.couleur || '#e6b801'}`,
                  boxShadow: `0 4px 20px ${seance.couleur || '#e6b801'}20`
                }}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
              >
                <motion.button
                  className="edit-btn"
                  style={{
                    position: 'absolute',
                    top: 18,
                    right: 60, // Adjusted to make room for delete button
                    zIndex: 2,
                    background: 'white',
                    borderRadius: '50%',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                    padding: 10,
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  onClick={editerSeance}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FiEdit2 size={22} />
                </motion.button>
                <motion.button
                  className="delete-btn"
                  style={{
                    position: 'absolute',
                    top: 18,
                    right: 18,
                    zIndex: 2,
                    background: 'white',
                    borderRadius: '50%',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                    padding: 10,
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  onClick={supprimerSeance}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FiTrash2 size={22} color="#EF4444" />
                </motion.button>
                <div className="seance-content" style={{ paddingTop: 32 }}>
                  <div className="seance-meta">
                    <div className="meta-item">
                      <FiUser className="icon" />
                      <span>
                        {seance.formateur_nom}
                        <span className={`statut-badge ${affectationStatut}`}>
                          ({affectationStatut === 'en_attente' ? 'en attente' : affectationStatut === 'accepte' ? 'accepté' : 'refusé'})
                        </span>
                      </span>
                    </div>
                    {affectationStatut === 'refuse' && causeRefus && (
                      <div className="meta-item cause-refus">
                        <span>Cause du refus : <span style={{ color: '#EF4444', fontWeight: 600 }}>{causeRefus}</span></span>
                      </div>
                    )}
                    <div className="meta-item">
                      <FiCalendar className="icon" />
                      <span>Du {formatDate(formation.date_debut)} au {formatDate(formation.date_fin)}</span>
                    </div>
                  </div>
                  <div className="horaires-list" style={{
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'nowrap',
                    gap: '0.9rem',
                    alignItems: 'stretch',
                    overflowX: 'auto'
                  }}>
                    {seance.horaires.map((horaire, index) => (
                      <div
                        key={index}
                        className="jour-item"
                        style={{
                          background: '#f7f7f7',
                          borderRadius: 8,
                          padding: '0.7rem 1rem',
                          minWidth: 240,
                          flex: '0 0 140px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          justifyContent: 'center'
                        }}
                      >
                        <div className="jour-header" style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.8rem',
                          marginBottom: '0.5rem'
                        }}>
                          <FiClock className="icon" />
                          <span className="jour-name">{horaire.jour}</span>
                        </div>
                        <div className="jour-details" style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          fontSize: '0.9rem',
                          marginLeft: '1.8rem'
                        }}>
                          <span>{normalizeTime(horaire.heure_debut || horaire.heureDebut)} - {normalizeTime(horaire.heure_fin || horaire.heureFin)}</span>
                          <div className="salle-info" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}>
                            <FiMapPin className="icon" />
                            <span>{sallesDisponibles.find(s => s.id === (horaire.salle_id || 0))?.nom || 'Salle inconnue'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

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
                          value={currentSeance.formateur_id}
                          onChange={(e) => {
                            const selectedFormateur = formateursDisponibles.find(f => f.id == e.target.value);
                            setCurrentSeance({
                              ...currentSeance,
                              formateur_id: e.target.value,
                              formateur_nom: selectedFormateur?.nom || ""
                            });
                          }}
                          required
                        >
                          <option value="">Sélectionner un formateur</option>
                          {formateursDisponibles.map((formateur) => (
                            <option key={formateur.id} value={formateur.id}>
                              {formateur.nom}
                            </option>
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
                                  {JOURS_SEMAINE.map(jour => (
                                    <option key={jour} value={jour}>{jour}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="form-group">
                                <label>Heure de début</label>
                                <input
                                  type="time"
                                  value={normalizeTime(horaire.heureDebut)}
                                  onChange={(e) => updateHoraire(index, 'heureDebut', e.target.value)}
                                  required
                                  step="900"
                                />
                              </div>
                              <div className="form-group">
                                <label>Heure de fin</label>
                                <input
                                  type="time"
                                  value={normalizeTime(horaire.heureFin)}
                                  onChange={(e) => updateHoraire(index, 'heureFin', e.target.value)}
                                  required
                                  step="900"
                                />
                              </div>
                            </div>
                            <div className="form-group">
                              <label>Salle</label>
                              <select
                                value={horaire.salle_id || ''}
                                onChange={(e) => updateHoraire(index, 'salle_id', Number(e.target.value))}
                                required
                              >
                                <option value="">Sélectionner une salle</option>
                                {sallesDisponibles.map(salle => (
                                  <option key={salle.id} value={salle.id}>
                                    {salle.nom}
                                  </option>
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
                      {error && <div className="form-error">{error}</div>}
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
          </>
        )}
      </main>
    </div>
  );
};

export default PlanningPage;