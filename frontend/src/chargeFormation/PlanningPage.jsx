import React, { useState, useEffect } from 'react';
import { FiCalendar, FiClock, FiMapPin, FiUser, FiEdit2, FiTrash2, FiPlus, FiX, FiSend } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import './PlanningPage.css';
import ChargeSidebar from './ChargeSidebar';

const API_BASE = "http://localhost:8000/api";
const JOURS_SEMAINE = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

// Helper functions
const normalizeTime = (time) => {
  if (!time) return "09:00";
  if (typeof time !== 'string') return "09:00";
  
  const cleanedTime = time.split(':').slice(0, 2).join(':');
  
  if (/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(cleanedTime)) {
    return cleanedTime;
  }
  return "09:00";
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
};

const timeToMinutes = (timeStr) => {
  const [hours, minutes] = normalizeTime(timeStr).split(':').map(Number);
  return hours * 60 + minutes;
};

const doDateRangesOverlap = (start1, end1, start2, end2) => {
  if (!start1 || !end1 || !start2 || !end2) return false;
  const d1Start = new Date(start1).getTime();
  const d1End = new Date(end1).getTime();
  const d2Start = new Date(start2).getTime();
  const d2End = new Date(end2).getTime();
  if (isNaN(d1Start) || isNaN(d1End) || isNaN(d2Start) || isNaN(d2End)) return false;
  return d1Start <= d2End && d2Start <= d1End;
};

// New function to get valid days within formation date range
const getValidDays = (dateDebut, dateFin) => {
  if (!dateDebut || !dateFin) return JOURS_SEMAINE;
  
  const startDate = new Date(dateDebut);
  const endDate = new Date(dateFin);
  
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate > endDate) {
    console.warn('Invalid date range:', { dateDebut, dateFin });
    return JOURS_SEMAINE;
  }

  const validDays = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const dayIndex = currentDate.getDay();
    const dayName = JOURS_SEMAINE[dayIndex === 0 ? 6 : dayIndex - 1]; // Adjust Sunday (0) to last
    if (!validDays.includes(dayName)) {
      validDays.push(dayName);
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  console.log('Valid days for formation:', validDays);
  return validDays;
};

// API service with auth
const fetchApi = async (url, options = {}) => {
  const token = localStorage.getItem('jwt');
  
  if (!token && !url.includes('/auth')) {
    throw new Error('Authentication token missing');
  }

  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...(options.headers || {})
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    if (response.status === 401) {
      localStorage.removeItem('jwt');
      window.location.href = '/login';
      return;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    if (response.status === 204) return null;
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

const PlanningPage = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [formation, setFormation] = useState(null);
  const [sallesDisponibles, setSallesDisponibles] = useState([]);
  const [formateursDisponibles, setFormateursDisponibles] = useState([]);
  const [plannings, setPlannings] = useState([]);
  const [allPlanningJours, setAllPlanningJours] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentSeance, setCurrentSeance] = useState({
    id: null,
    formateur_id: "",
    formateur_nom: "",
    formateur_prenom: "",
    horaires: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmation, setConfirmation] = useState(null);

  const { formationId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('jwt');
    if (!token) {
      navigate('/login');
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!formationId) {
          throw new Error("Aucun ID de formation fourni dans l'URL");
        }

        const [formationData, planningsData, salles, formateurs, planningJours] = await Promise.all([
          fetchApi(`${API_BASE}/formations/${formationId}`),
          fetchApi(`${API_BASE}/plannings/formation/${formationId}`),
          fetchApi(`${API_BASE}/salles`),
          fetchApi(`${API_BASE}/formateurs/available`),
          fetchApi(`${API_BASE}/planning-jours`)
        ]);

        const enrichedPlannings = await Promise.all(
          planningsData.map(async (planning) => {
            const jours = await fetchApi(`${API_BASE}/planning-jours/planning/${planning.id}`);
            return {
              ...planning,
              formateur_nom: formateurs.find(f => f.id === planning.formateur_id)?.nom || "Inconnu",
              formateur_prenom: formateurs.find(f => f.id === planning.formateur_id)?.prenom || "Inconnu",
              horaires: jours.map(j => ({
                ...j,
                heureDebut: normalizeTime(j.heure_debut),
                heureFin: normalizeTime(j.heure_fin),
                salle_id: j.salle_id
              }))
            };
          })
        );

        const enrichedPlanningJours = await Promise.all(
          planningJours.map(async (pj) => {
            const planning = await fetchApi(`${API_BASE}/plannings/${pj.planning_id}`);
            const formation = await fetchApi(`${API_BASE}/formations/${planning.formation_id}`);
            return {
              ...pj,
              formation: {
                id: formation.id,
                date_debut: formation.date_debut,
                date_fin: formation.date_fin
              }
            };
          })
        );

        setFormation(formationData);
        setSallesDisponibles(salles);
        setFormateursDisponibles(formateurs);
        setPlannings(enrichedPlannings);
        setAllPlanningJours(enrichedPlanningJours);
      } catch (err) {
        setError(err.message);
        console.error("Erreur de chargement:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [formationId, navigate]);

  const isSalleOccupied = (salleId, jour, heureDebut, heureFin, excludePlanningJourId = null) => {
    const start = timeToMinutes(heureDebut);
    const end = timeToMinutes(heureFin);
    
    return allPlanningJours.some(pj => {
      if (pj.salle_id !== salleId || pj.jour !== jour) return false;
      if (excludePlanningJourId && pj.id === excludePlanningJourId) return false;
      
      const pjStart = timeToMinutes(pj.heure_debut);
      const pjEnd = timeToMinutes(pj.heure_fin);
      
      const isTimeOverlap = (
        (start >= pjStart && start < pjEnd) ||
        (end > pjStart && end <= pjEnd) ||
        (start <= pjStart && end >= pjEnd)
      );

      if (!isTimeOverlap) return false;

      const planningFormation = pj.formation;
      if (!planningFormation || !planningFormation.date_debut || !planningFormation.date_fin) {
        console.warn(`Formation data missing for planning_jour ${pj.id}`);
        return false;
      }

      return doDateRangesOverlap(
        formation.date_debut,
        formation.date_fin,
        planningFormation.date_debut,
        planningFormation.date_fin
      );
    });
  };

  const updateHoraire = (index, field, value) => {
    const newHoraires = [...currentSeance.horaires];
    const updatedHoraire = { ...newHoraires[index] };
    
    updatedHoraire[field] = field.includes('heure') ? normalizeTime(value) : value;
    
    // Ensure the selected day is valid within formation date range
    if (field === 'jour') {
      const validDays = getValidDays(formation?.date_debut, formation?.date_fin);
      if (!validDays.includes(value)) {
        updatedHoraire.jour = validDays[0] || JOURS_SEMAINE[0];
      }
    }
    
    newHoraires[index] = updatedHoraire;
    setCurrentSeance({ ...currentSeance, horaires: newHoraires });
  };

  const addHoraire = () => {
    const validDays = getValidDays(formation?.date_debut, formation?.date_fin);
    setCurrentSeance({
      ...currentSeance,
      horaires: [
        ...currentSeance.horaires,
        {
          jour: validDays[0] || JOURS_SEMAINE[0],
          heureDebut: "09:00",
          heureFin: "12:00",
          salle_id: null
        }
      ]
    });
  };

  const removeHoraire = (index) => {
    const newHoraires = currentSeance.horaires.filter((_, i) => i !== index);
    setCurrentSeance({ ...currentSeance, horaires: newHoraires });
  };

  const ajouterSeance = () => {
    const validDays = getValidDays(formation?.date_debut, formation?.date_fin);
    setCurrentSeance({
      id: null,
      formateur_id: "",
      formateur_nom: "",
      formateur_prenom: "",
      horaires: [{
        jour: validDays[0] || JOURS_SEMAINE[0],
        heureDebut: "09:00",
        heureFin: "12:00",
        salle_id: null
      }]
    });
    setModalOpen(true);
  };

  const editerSeance = (planning) => {
    const validDays = getValidDays(formation?.date_debut, formation?.date_fin);
    setCurrentSeance({
      ...planning,
      horaires: planning.horaires.map(j => {
        const normalizedJour = validDays.includes(j.jour) ? j.jour : validDays[0] || JOURS_SEMAINE[0];
        return {
          ...j,
          jour: normalizedJour,
          heureDebut: normalizeTime(j.heure_debut || j.heureDebut),
          heureFin: normalizeTime(j.heure_fin || j.heureFin),
          id: j.id
        };
      })
    });
    setModalOpen(true);
  };

  const supprimerSeance = async (planningId) => {
    try {
      const planning = plannings.find(p => p.id === planningId);
      if (planning.horaires && planning.horaires.length) {
        await Promise.all(
          planning.horaires.map(jour =>
            fetchApi(`${API_BASE}/planning-jours/${jour.id}`, { method: 'DELETE' })
          )
        );
      }

      await fetchApi(`${API_BASE}/plannings/${planningId}`, { method: 'DELETE' });

      setPlannings(plannings.filter(p => p.id !== planningId));
      setAllPlanningJours(allPlanningJours.filter(pj => pj.planning_id !== planningId));
      setConfirmation({ type: 'success', message: 'Séance supprimée avec succès' });
      setTimeout(() => setConfirmation(null), 3000);
    } catch (err) {
      setError(err.message);
      console.error("Erreur de suppression:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setConfirmation(null);

    if (!currentSeance.formateur_id) {
      setError("Veuillez sélectionner un formateur");
      return;
    }

    if (currentSeance.horaires.length === 0) {
      setError("Veuillez ajouter au moins un horaire");
      return;
    }

    const validDays = getValidDays(formation?.date_debut, formation?.date_fin);
    for (const horaire of currentSeance.horaires) {
      if (!horaire.jour || !validDays.includes(horaire.jour)) {
        setError(`Le jour ${horaire.jour} n'est pas valide pour cette formation`);
        return;
      }
      if (!horaire.heureDebut || !horaire.heureFin || horaire.heureDebut >= horaire.heureFin) {
        setError("Veuillez vérifier les horaires et jours");
        return;
      }
      if (!horaire.salle_id) {
        setError("Veuillez sélectionner une salle pour chaque jour");
        return;
      }
      if (isSalleOccupied(
        horaire.salle_id,
        horaire.jour,
        horaire.heureDebut,
        horaire.heureFin,
        horaire.id
      )) {
        setError(`La salle ${sallesDisponibles.find(s => s.id === horaire.salle_id)?.nom} est déjà réservée pour ${horaire.jour} de ${horaire.heureDebut} à ${horaire.heureFin}`);
        return;
      }
    }

    try {
      const planningData = {
        formation_id: formationId,
        formateur_id: currentSeance.formateur_id,
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

        const existingJours = await fetchApi(`${API_BASE}/planning-jours/planning/${planningId}`);
        await Promise.all(
          existingJours.map(jour =>
            fetchApi(`${API_BASE}/planning-jours/${jour.id}`, { method: 'DELETE' })
          )
        );
      } else {
        const newPlanning = await fetchApi(`${API_BASE}/plannings`, {
          method: 'POST',
          body: JSON.stringify(planningData)
        });
        planningId = newPlanning.id;
      }

      await Promise.all(
        currentSeance.horaires.map(async (horaire) => {
          const jourData = {
            jour: horaire.jour,
            heure_debut: normalizeTime(horaire.heureDebut),
            heure_fin: normalizeTime(horaire.heureFin),
            salle_id: horaire.salle_id,
            planning_id: planningId
          };

          return await fetchApi(`${API_BASE}/planning-jours`, {
            method: 'POST',
            body: JSON.stringify(jourData)
          });
        })
      );

      const updatedPlannings = await fetchApi(`${API_BASE}/plannings/formation/${formationId}`);
      const enrichedPlannings = await Promise.all(
        updatedPlannings.map(async (planning) => {
          const jours = await fetchApi(`${API_BASE}/planning-jours/planning/${planning.id}`);
          return {
            ...planning,
            formateur_nom: formateursDisponibles.find(f => f.id === planning.formateur_id)?.nom || "Inconnu",
            formateur_prenom: formateursDisponibles.find(f => f.id === planning.formateur_id)?.prenom || "Inconnu",
            horaires: jours.map(j => ({
              ...j,
              heureDebut: normalizeTime(j.heure_debut),
              heureFin: normalizeTime(j.heure_fin),
              salle_id: j.salle_id
            }))
          };
        })
      );

      const updatedPlanningJours = await Promise.all(
        (await fetchApi(`${API_BASE}/planning-jours`)).map(async (pj) => {
          const planning = await fetchApi(`${API_BASE}/plannings/${pj.planning_id}`);
          const formation = await fetchApi(`${API_BASE}/formations/${planning.formation_id}`);
          return {
            ...pj,
            formation: {
              id: formation.id,
              date_debut: formation.date_debut,
              date_fin: formation.date_fin
            }
          };
        })
      );

      setPlannings(enrichedPlannings);
      setAllPlanningJours(updatedPlanningJours);
      setModalOpen(false);
      setConfirmation({ type: 'success', message: `Demande envoyée au formateur ${currentSeance.formateur_nom} pour validation` });
      setTimeout(() => setConfirmation(null), 3000);
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
            <button onClick={() => navigate('/charge')}>Retour à la liste des formations</button>
          </div>
        </main>
      </div>
    );
  }

  const validDays = getValidDays(formation?.date_debut, formation?.date_fin);

  return (
    <div className={`planning-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <ChargeSidebar onToggle={setIsSidebarCollapsed} />
      <main className="main-content">
        {confirmation && (
          <motion.div
            className={`confirmation ${confirmation.type}`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <FiSend className="confirmation-icon" />
            {confirmation.message}
          </motion.div>
        )}
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
                    </div>
                  </div>
                </div>
              </div>
            </motion.header>

            {plannings.length === 0 ? (
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
              <div className="plannings-list">
                {plannings.map((planning) => (
                  <motion.div
                    key={planning.id}
                    className="seance-card"
                    style={{
                      borderTop: '4px solid #e6b801',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      position: 'relative',
                    }}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        display: 'flex',
                        gap: '0.5rem',
                      }}
                    >
                      <motion.button
                        className="edit-btn"
                        style={{
                          background: 'white',
                          borderRadius: '50%',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                          padding: 10,
                          border: 'none',
                          cursor: 'pointer',
                        }}
                        onClick={() => editerSeance(planning)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <FiEdit2 size={22} color="#1976d2" title="Modifier la séance" />
                      </motion.button>
                      <motion.button
                        className="delete-btn"
                        style={{
                          background: 'white',
                          borderRadius: '50%',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                          padding: 10,
                          border: 'none',
                          cursor: 'pointer',
                        }}
                        onClick={() => supprimerSeance(planning.id)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <FiTrash2 size={22} color="#EF4444" title="Supprimer la séance" />
                      </motion.button>
                    </div>
                    <div className="seance-content" style={{ paddingRight: '3rem' }}>
                      <div className="seance-meta">
                        <div className="meta-item">
                          <FiUser className="icon" />
                          <span>
                            {planning.formateur_nom} {planning.formateur_prenom}
                            <span className={`statut-badge ${planning.statut}`}>
                              ({planning.statut === 'en_attente' ? 'en attente' : planning.statut === 'accepte' ? 'accepté' : 'refusé'})
                            </span>
                          </span>
                        </div>
                        {planning.statut === 'refuse' && planning.cause_refus && (
                          <div className="meta-item cause-refus">
                            <span>Cause du refus : <span style={{ color: '#EF4444', fontWeight: 600 }}>{planning.cause_refus}</span></span>
                          </div>
                        )}
                        <div className="meta-item">
                          <FiCalendar className="icon" />
                          <span>Du {formatDate(formation.date_debut)} au {formatDate(formation.date_fin)}</span>
                        </div>
                      </div>
                      <div className="horaires-list">
                        {planning.horaires.map((horaire, index) => (
                          <div key={index} className="jour-item">
                            <div className="jour-header">
                              <FiClock className="icon" />
                              <span className="jour-name">{horaire.jour}</span>
                            </div>
                            <div className="jour-details">
                              <span>{normalizeTime(horaire.heure_debut || horaire.heureDebut)} - {normalizeTime(horaire.heure_fin || horaire.heureFin)}</span>
                              <div className="salle-info">
                                <FiMapPin className="icon" />
                                <span>
                                  {sallesDisponibles.find(s => s.id === (horaire.salle_id || 0)) 
                                    ? `${sallesDisponibles.find(s => s.id === (horaire.salle_id || 0)).nom} (${sallesDisponibles.find(s => s.id === (horaire.salle_id || 0)).capacite || 0})` 
                                    : 'Salle inconnue'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
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
                              formateur_nom: selectedFormateur?.nom || "",
                              formateur_prenom: selectedFormateur?.prenom || ""
                            });
                          }}
                          required
                        >
                          <option value="">Sélectionner un formateur</option>
                          {formateursDisponibles.map((formateur) => (
                            <option key={formateur.id} value={formateur.id}>
                              {formateur.nom} {formateur.prenom}
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
                                  {validDays.length > 0 ? (
                                    validDays.map(jour => (
                                      <option key={jour} value={jour}>{jour}</option>
                                    ))
                                  ) : (
                                    <option value="" disabled>Aucun jour disponible</option>
                                  )}
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
                                  <option
                                    key={salle.id}
                                    value={salle.id}
                                    disabled={isSalleOccupied(
                                      salle.id,
                                      horaire.jour,
                                      horaire.heureDebut,
                                      horaire.heureFin,
                                      horaire.id
                                    )}
                                  >
                                    {salle.nom} (capacité {salle.capacite || 0})
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
                          disabled={validDays.length === 0}
                        >
                          Enregistrer et envoyer la demande
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