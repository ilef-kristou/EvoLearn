import React, { useState, useEffect } from 'react';
import { FiCalendar, FiClock, FiMapPin, FiPlus,FiUser, FiEdit2, FiTrash2, FiSearch, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import './PlanningFormations.css';
import ChargeSidebar from './ChargeSidebar';
import { useNavigate } from 'react-router-dom';

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

const PlanningFormations = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [formations, setFormations] = useState([]);
  const [formateurs, setFormateurs] = useState([]);
  const [sallesDisponibles, setSallesDisponibles] = useState([]);
  const [plannings, setPlannings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFormation, setSelectedFormation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSeance, setCurrentSeance] = useState({
    dateDebut: '',
    dateFin: '',
    jours: [],
    formateur: '',
    planningId: null,
  });
  const [expandedFormation, setExpandedFormation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem('jwt');

  const calculateDuree = (dateDebut, dateFin) => {
    if (!dateDebut || !dateFin) return 'Non spécifié';
    
    const start = new Date(dateDebut);
    const end = new Date(dateFin);
    
    if (isNaN(start) || isNaN(end) || end < start) return 'Dates invalides';
    
    const diffTime = end - start;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      const weeks = Math.ceil(diffDays / 7);
      return `${weeks} semaine${weeks > 1 ? 's' : ''}`;
    } else {
      const months = Math.round(diffDays / 30);
      return `${months} mois`;
    }
  };

  const fetchApi = async (url, options = {}) => {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          ...(options.headers || {}),
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('jwt');
          navigate('/login');
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        }
        if (response.status === 403) {
          throw new Error('Accès refusé. Vous devez être administrateur ou chargé.');
        }
        const contentType = response.headers.get('content-type') || '';
        let errorText = `Erreur ${response.status}`;
        try {
          if (contentType.includes('application/json')) {
            const errJson = await response.json();
            errorText = errJson.message || JSON.stringify(errJson);
          } else {
            errorText = await response.text();
          }
        } catch (e) {
          errorText = 'Erreur inconnue';
        }
        throw new Error(errorText);
      }

      return await response.json();
    } catch (err) {
      console.error(`Erreur lors de la requête ${url}:`, err);
      throw err;
    }
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

  const isSalleOccupied = (salleId, jour, heureDebut, heureFin, excludePlanningJourId = null, formationStartDate, formationEndDate) => {
    const start = timeToMinutes(heureDebut);
    const end = timeToMinutes(heureFin);
    
    return plannings.some(p => {
      return p.jours.some(pj => {
        if (pj.salle_id !== salleId || pj.jour !== jour) return false;
        if (excludePlanningJourId && pj.id === excludePlanningJourId) return false;
        
        const pjStart = timeToMinutes(pj.heureDebut);
        const pjEnd = timeToMinutes(pj.heureFin);
        
        const isTimeOverlap = (
          (start >= pjStart && start < pjEnd) ||
          (end > pjStart && end <= pjEnd) ||
          (start <= pjStart && end >= pjEnd)
        );

        if (!isTimeOverlap) return false;

        if (!p.dateDebut || !p.dateFin) {
          console.warn(`Formation data missing for planning ${p.id}`);
          return false;
        }

        return doDateRangesOverlap(
          formationStartDate,
          formationEndDate,
          p.dateDebut,
          p.dateFin
        );
      });
    });
  };

  useEffect(() => {
    if (!token) {
      setError('Utilisateur non authentifié. Veuillez vous connecter.');
      setLoading(false);
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [formationsData, formateursData, sallesData, planningsData] = await Promise.all([
          fetchApi(`${API_BASE}/formations`),
          fetchApi(`${API_BASE}/formateurs/available`),
          fetchApi(`${API_BASE}/salles`),
          fetchApi(`${API_BASE}/plannings`),
        ]);

        setFormations(formationsData.map(f => ({
          id: f.id,
          titre: f.titre,
          description: f.description,
          duree: calculateDuree(f.date_debut, f.date_fin),
          image: f.image || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
          bgImage: f.bgImage || 'linear-gradient(to right, #2c3e50, #5483b3)',
          date_debut: f.date_debut,
          date_fin: f.date_fin,
        })));

        setFormateurs(formateursData.map(f => ({
          id: f.id,
          name: `${f.prenom} ${f.nom}`
        })));
        setSallesDisponibles(sallesData.map(s => ({ id: s.id, nom: s.nom })));

        const enrichedPlannings = await Promise.all(
          planningsData.map(async (p) => {
            const jours = await fetchApi(`${API_BASE}/planning-jours/planning/${p.id}`);
            return {
              id: p.id,
              formation_id: p.formation_id,
              formateur_id: p.formateur_id,
              formateur: p.formateur ? `${p.formateur.prenom} ${p.formateur.nom}` : 'Non assigné',
              statut: p.statut, // Added to include status
              jours: jours.map(j => ({
                id: j.id,
                jour: j.jour,
                heureDebut: normalizeTime(j.heure_debut),
                heureFin: normalizeTime(j.heure_fin),
                salle: j.salle?.nom || 'Non assignée',
                salle_id: j.salle_id,
              })),
              dateDebut: p.formation?.date_debut || '',
              dateFin: p.formation?.date_fin || '',
            };
          })
        );

        setPlannings(enrichedPlannings);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, token]);

  const toggleFormation = (id) => {
    setExpandedFormation(expandedFormation === id ? null : id);
  };

  const openAddSeanceModal = (formation) => {
    const validDays = getValidDays(formation.date_debut, formation.date_fin);
    setSelectedFormation(formation);
    setCurrentSeance({
      dateDebut: formation.date_debut || '',
      dateFin: formation.date_fin || '',
      jours: validDays.length > 0 ? [{
        jour: validDays[0],
        heureDebut: "09:00",
        heureFin: "12:00",
        salle: '',
        salle_id: null,
      }] : [],
      formateur: '',
      planningId: null,
    });
    setIsModalOpen(true);
  };

  const openEditSeanceModal = (formation) => {
    const validDays = getValidDays(formation.date_debut, formation.date_fin);
    const planning = plannings.find(p => p.formation_id === formation.id);
    setSelectedFormation(formation);
    setCurrentSeance({
      dateDebut: planning?.dateDebut || formation.date_debut || '',
      dateFin: planning?.dateFin || formation.date_fin || '',
      jours: planning?.jours.filter(j => validDays.includes(j.jour)) || [],
      formateur: planning?.formateur || '',
      planningId: planning?.id || null,
    });
    setIsModalOpen(true);
  };

  const handleSeanceSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!selectedFormation) {
        throw new Error('Aucune formation sélectionnée');
      }

      const validDays = getValidDays(selectedFormation.date_debut, selectedFormation.date_fin);
      if (validDays.length === 0) {
        throw new Error('Aucun jour valide pour cette formation');
      }

      const formateurData = formateurs.find(f => f.name === currentSeance.formateur);
      const formateurId = formateurData?.id;

      if (!formateurId) {
        throw new Error('Formateur invalide');
      }

      if (currentSeance.jours.length === 0) {
        throw new Error('Veuillez ajouter au moins un jour');
      }

      if (!currentSeance.dateDebut || !currentSeance.dateFin) {
        throw new Error('Veuillez spécifier les dates de début et de fin');
      }

      // Validate that currentSeance dates are within selectedFormation dates
      const formationStart = new Date(selectedFormation.date_debut).getTime();
      const formationEnd = new Date(selectedFormation.date_fin).getTime();
      const seanceStart = new Date(currentSeance.dateDebut).getTime();
      const seanceEnd = new Date(currentSeance.dateFin).getTime();

      if (isNaN(formationStart) || isNaN(formationEnd)) {
        throw new Error('Dates de la formation invalides');
      }
      if (seanceStart < formationStart || seanceEnd > formationEnd) {
        throw new Error('Les dates sélectionnées doivent être dans la plage de la formation (' + 
          new Date(selectedFormation.date_debut).toLocaleDateString('fr-FR') + ' - ' + 
          new Date(selectedFormation.date_fin).toLocaleDateString('fr-FR') + ')');
      }
      if (seanceStart > seanceEnd) {
        throw new Error('La date de début doit être avant la date de fin');
      }

      for (const jour of currentSeance.jours) {
        if (!jour.jour || !validDays.includes(jour.jour)) {
          throw new Error(`Le jour ${jour.jour} n'est pas valide pour cette formation`);
        }
        if (!jour.heureDebut || !jour.heureFin || jour.heureDebut >= jour.heureFin) {
          throw new Error('Veuillez vérifier les horaires et jours');
        }
        const salle = sallesDisponibles.find(s => s.nom === jour.salle);
        if (!salle) {
          throw new Error(`Salle ${jour.salle} non trouvée`);
        }
        if (isSalleOccupied(
          salle.id,
          jour.jour,
          jour.heureDebut,
          jour.heureFin,
          jour.id,
          currentSeance.dateDebut,
          currentSeance.dateFin
        )) {
          throw new Error(`La salle ${jour.salle} est déjà réservée pour ${jour.jour} de ${jour.heureDebut} à ${jour.heureFin}`);
        }
      }

      const planningData = {
        formation_id: selectedFormation.id,
        formateur_id: formateurId,
        statut: 'en_attente',
      };

      let planningId = currentSeance.planningId;

      if (planningId) {
        await fetchApi(`${API_BASE}/plannings/${planningId}`, {
          method: 'PUT',
          body: JSON.stringify(planningData),
        });

        const existingJours = plannings.find(p => p.id === planningId)?.jours || [];
        for (const jour of existingJours) {
          await fetchApi(`${API_BASE}/planning-jours/${jour.id}`, {
            method: 'DELETE',
          });
        }
      } else {
        const planningResponse = await fetchApi(`${API_BASE}/plannings`, {
          method: 'POST',
          body: JSON.stringify(planningData),
        });
        planningId = planningResponse.id;
      }

      for (const jour of currentSeance.jours) {
        const salle = sallesDisponibles.find(s => s.nom === jour.salle);
        await fetchApi(`${API_BASE}/planning-jours`, {
          method: 'POST',
          body: JSON.stringify({
            planning_id: planningId,
            jour: jour.jour,
            heure_debut: normalizeTime(jour.heureDebut),
            heure_fin: normalizeTime(jour.heureFin),
            salle_id: salle.id,
          }),
        });
      }

      const planningsData = await fetchApi(`${API_BASE}/plannings`);
      const enrichedPlannings = await Promise.all(
        planningsData.map(async (p) => {
          const jours = await fetchApi(`${API_BASE}/planning-jours/planning/${p.id}`);
          return {
            id: p.id,
            formation_id: p.formation_id,
            formateur_id: p.formateur_id,
            formateur: p.formateur ? `${p.formateur.prenom} ${p.formateur.nom}` : 'Non assigné',
            statut: p.statut, // Added to include status
            jours: jours.map(j => ({
              id: j.id,
              jour: j.jour,
              heureDebut: normalizeTime(j.heure_debut),
              heureFin: normalizeTime(j.heure_fin),
              salle: j.salle?.nom || 'Non assignée',
              salle_id: j.salle_id,
            })),
            dateDebut: p.formation?.date_debut || '',
            dateFin: p.formation?.date_fin || '',
          };
        })
      );

      setPlannings(enrichedPlannings);
      setSuccessMessage('Séance enregistrée avec succès');
      setTimeout(() => setSuccessMessage(null), 3000);
      setIsModalOpen(false);
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'enregistrement de la séance. Vérifiez la disponibilité des salles.');
    }
  };

  const deleteSeance = async (formationId) => {
    try {
      const planning = plannings.find(p => p.formation_id === formationId);
      if (planning) {
        for (const jour of planning.jours) {
          await fetchApi(`${API_BASE}/planning-jours/${jour.id}`, {
            method: 'DELETE',
          });
        }
        await fetchApi(`${API_BASE}/plannings/${planning.id}`, {
          method: 'DELETE',
        });

        setPlannings(plannings.filter(p => p.id !== planning.id));
        setSuccessMessage('Séance supprimée avec succès');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleJourSelection = (jour) => {
    const validDays = getValidDays(selectedFormation?.date_debut, selectedFormation?.date_fin);
    if (!validDays.includes(jour)) {
      console.warn(`Jour ${jour} is not valid for this formation`);
      return;
    }
    setCurrentSeance(prev => {
      const isSelected = prev.jours.some(j => j.jour === jour);
      const jours = isSelected
        ? prev.jours.filter(j => j.jour !== jour)
        : [...prev.jours, {
            jour,
            heureDebut: '09:00',
            heureFin: '12:00',
            salle: '',
            salle_id: null,
          }];
      return { ...prev, jours };
    });
  };

  const removeJourConfig = (jour) => {
    setCurrentSeance(prev => ({
      ...prev,
      jours: prev.jours.filter(j => j.jour !== jour),
    }));
  };

  const updateJourConfig = (jour, field, value) => {
    setCurrentSeance(prev => ({
      ...prev,
      jours: prev.jours.map(j =>
        j.jour === jour ? { ...j, [field]: field.includes('heure') ? normalizeTime(value) : value, ...(field === 'salle' ? { salle_id: sallesDisponibles.find(s => s.nom === value)?.id } : {}) } : j
      ),
    }));
  };

  const filteredFormations = formations.filter(formation =>
    formation.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    formation.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const validDays = selectedFormation ? getValidDays(selectedFormation.date_debut, selectedFormation.date_fin) : JOURS_SEMAINE;

  return (
    <div className={`charge-formations-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <ChargeSidebar onToggle={setIsSidebarCollapsed} />
      
      <main className="main-content">
        {loading && (
          <div className="loading">Chargement des formations...</div>
        )}

        {error && (
          <div className="error-message" style={{
            background: '#ef4444',
            color: 'white',
            padding: '12px 16px',
            borderRadius: 8,
            margin: '16px 0',
          }}>
            Erreur : {error}
          </div>
        )}

        {successMessage && (
          <div className="success-message" style={{
            background: '#10b981',
            color: 'white',
            padding: '12px 16px',
            borderRadius: 8,
            margin: '16px 0',
          }}>
            {successMessage}
          </div>
        )}

        {!loading && !error && (
          <>
            <motion.div
              className="page-header"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, type: 'spring' }}
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
                filteredFormations.map(formation => {
                  const planning = plannings.find(p => p.formation_id === formation.id);
                  return (
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
                            transition={{ type: 'spring', stiffness: 300 }}
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
                                {planning ? (
                                  <>
                                    <motion.button
                                      className="edit-btn"
                                      style={{
                                        background: 'white',
                                        borderRadius: '50%',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                                        padding: 10,
                                        border: 'none',
                                        cursor: 'pointer'
                                      }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openEditSeanceModal(formation);
                                      }}
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                    >
                                      <FiEdit2 size={22} />
                                    </motion.button>
                                    <motion.button
                                      className="delete-btn"
                                      style={{
                                        background: 'white',
                                        borderRadius: '50%',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                                        padding: 10,
                                        border: 'none',
                                        cursor: 'pointer'
                                      }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteSeance(formation.id);
                                      }}
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                    >
                                      <FiTrash2 size={22} color="#EF4444" />
                                    </motion.button>
                                  </>
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
                            {planning ? (
                              <div className="sessions-list">
                                <motion.div
                                  className="session-card"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ duration: 0.3 }}
                                  whileHover={{ y: -3 }}
                                  style={{
                                    borderTop: '4px solid #6366F1',
                                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
                                  }}
                                >
                                  <div className="session-content" style={{ paddingTop: 32 }}>
                                    <div className="session-meta">
                                      <div className="session-jours-horizontal" style={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        flexWrap: 'nowrap',
                                        gap: '0.9rem',
                                        alignItems: 'stretch',
                                        overflowX: 'auto'
                                      }}>
                                        {planning.jours && planning.jours.length > 0 ? (
                                          planning.jours.map((jourObj, index) => (
                                            <div
                                              key={jourObj.id || index}
                                              className="jour-item-horizontal"
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
                                                <span className="jour-name">{jourObj.jour}</span>
                                              </div>
                                              <div className="jour-details" style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '1rem',
                                                fontSize: '0.9rem',
                                                marginLeft: '1.8rem'
                                              }}>
                                                <span>{normalizeTime(jourObj.heureDebut)} - {normalizeTime(jourObj.heureFin)}</span>
                                                <div className="salle-info" style={{
                                                  display: 'flex',
                                                  alignItems: 'center',
                                                  gap: '0.5rem'
                                                }}>
                                                  <FiMapPin className="icon" />
                                                  <span>{jourObj.salle || 'Non assignée'}</span>
                                                </div>
                                              </div>
                                            </div>
                                          ))
                                        ) : (
                                          <div className="no-jours">Aucun jour programmé</div>
                                        )}
                                      </div>
                                      <div className="meta-item">
                                        <FiCalendar className="icon" />
                                        <span>
                                          {planning.dateDebut && planning.dateFin 
                                            ? `${planning.dateDebut} - ${planning.dateFin}`
                                            : 'Dates non spécifiées'}
                                        </span>
                                      </div>
                                      <div className="meta-item">
                                        <FiUser className="icon" />
                                        <span>
                                          {planning.formateur || 'Non assigné'}
                                          <span className={`statut-badge ${planning.statut}`}>
                                            ({planning.statut === 'en_attente' ? 'en attente' : planning.statut === 'accepte' ? 'accepté' : 'refusé'})
                                          </span>
                                        </span>
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
                  );
                })
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
                      <h2>{selectedFormation && currentSeance.planningId ? 'Modifier la séance' : 'Ajouter une séance'}</h2>
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
                            min={selectedFormation?.date_debut || ''}
                            max={selectedFormation?.date_fin || ''}
                            onChange={(e) => setCurrentSeance({ ...currentSeance, dateDebut: e.target.value })}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Date de fin</label>
                          <input
                            type="date"
                            value={currentSeance.dateFin}
                            min={selectedFormation?.date_debut || ''}
                            max={selectedFormation?.date_fin || ''}
                            onChange={(e) => setCurrentSeance({ ...currentSeance, dateFin: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="form-group">
                        <label>Jours de la semaine</label>
                        <div className="jours-selection">
                          {validDays.length > 0 ? (
                            validDays.map(jour => (
                              <button
                                key={jour}
                                type="button"
                                className={`jour-btn ${currentSeance.jours.some(j => j.jour === jour) ? 'selected' : ''}`}
                                onClick={() => toggleJourSelection(jour)}
                              >
                                {jour}
                              </button>
                            ))
                          ) : (
                            <div className="no-jours">Aucun jour disponible</div>
                          )}
                        </div>
                      </div>

                      {currentSeance.jours.map((jourObj, index) => (
                        <div key={index} className="jour-configuration" style={{ position: 'relative', paddingTop: '1.5rem' }}>
                          <span style={{ position: 'absolute', top: '0.5rem', right: '0.5rem' }}>
                            <button
                              type="button"
                              style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '1.3rem', cursor: 'pointer' }}
                              title={`Supprimer ${jourObj.jour}`}
                              onClick={() => removeJourConfig(jourObj.jour)}
                            >
                              <FiTrash2 />
                            </button>
                          </span>
                          <div style={{ fontWeight: 500, marginBottom: '0.5rem' }}>{jourObj.jour}</div>
                          
                          <div className="form-row">
                            <div className="form-group">
                              <label>Heure de début</label>
                              <input
                                type="time"
                                value={normalizeTime(jourObj.heureDebut)}
                                onChange={(e) => updateJourConfig(jourObj.jour, 'heureDebut', e.target.value)}
                                step="900"
                              />
                            </div>
                            <div className="form-group">
                              <label>Heure de fin</label>
                              <input
                                type="time"
                                value={normalizeTime(jourObj.heureFin)}
                                onChange={(e) => updateJourConfig(jourObj.jour, 'heureFin', e.target.value)}
                                step="900"
                              />
                            </div>
                          </div>
                          
                          <div className="form-row">
                            <div className="form-group">
                              <label>Salle</label>
                              <select
                                value={jourObj.salle || ''}
                                onChange={(e) => updateJourConfig(jourObj.jour, 'salle', e.target.value)}
                                required
                              >
                                <option value="">Sélectionner une salle</option>
                                {sallesDisponibles.map(salle => (
                                  <option
                                    key={salle.id}
                                    value={salle.nom}
                                    disabled={isSalleOccupied(
                                      salle.id,
                                      jourObj.jour,
                                      jourObj.heureDebut,
                                      jourObj.heureFin,
                                      jourObj.id,
                                      currentSeance.dateDebut,
                                      currentSeance.dateFin
                                    )}
                                  >
                                    {salle.nom}
                                  </option>
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
                          onChange={(e) => setCurrentSeance({ ...currentSeance, formateur: e.target.value })}
                          required
                        >
                          <option value="">Sélectionner un formateur</option>
                          {formateurs.map(formateur => (
                            <option key={formateur.id} value={formateur.name}>{formateur.name}</option>
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
                          disabled={validDays.length === 0}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {selectedFormation && currentSeance.planningId ? 'Modifier' : 'Ajouter'}
                        </motion.button>
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

export default PlanningFormations;