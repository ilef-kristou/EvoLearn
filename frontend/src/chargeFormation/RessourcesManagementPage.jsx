import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FiCalendar, FiBox, FiLayers, FiAlertCircle, FiLoader, FiEdit, FiTrash2 } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ChargeSidebar from './ChargeSidebar';
import './RessourceManagement.css';

const createApiClient = (baseURL) => {
  const instance = axios.create({
    baseURL: baseURL || 'http://localhost:8000/api',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
    },
    timeout: 10000,
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error('API Error:', error.response?.data || error.message);
      return Promise.reject(error);
    }
  );

  return instance;
};

const api = createApiClient(process.env.REACT_APP_API_URL);

const RessourcesManagementPage = () => {
  const [state, setState] = useState({
    ressources: [],
    formations: [],
    plannings: [],
    reservations: [],
    searchTerm: '',
    loading: true,
    error: null,
  });

  const [modalState, setModalState] = useState({
    isOpen: false,
    isEditMode: false,
    selectedRessource: null,
    selectedFormationId: '',
    selectedSeances: [],
    seanceQuantities: {},
    seanceAvailability: {},
    errorMsg: '',
    isSidebarCollapsed: false,
    quantityErrors: {},
    loadingAvailability: false,
    editingReservation: null,
  });

  const availabilityCache = new Map();

  const colors = {
    primary: '#1a237e',
    primaryLight: '#534bae',
    primaryDark: '#000051',
    secondary: '#1976d2',
    danger: '#d32f2f',
    success: '#388e3c',
    warning: '#ffa000',
    text: '#2C3E50',
    lightText: '#f5f5f5',
    background: '#f8f9fa',
    cardBg: '#ffffff',
  };

  const normalizeTime = (time) => {
    if (!time || typeof time !== 'string') return '09:00';
    const cleanedTime = time.split(':').slice(0, 2).join(':');
    return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(cleanedTime) ? cleanedTime : '09:00';
  };

  const getSessionDate = (dateDebut, jour) => {
    const daysOfWeek = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const dayIndex = daysOfWeek.indexOf(jour);
    if (!dateDebut || dayIndex === -1 || isNaN(new Date(dateDebut).getTime())) {
      console.warn(`Invalid date_debut: ${dateDebut} or jour: ${jour}`);
      return null;
    }
    const startDate = new Date(dateDebut);
    const startDay = startDate.getDay();
    const diff = (dayIndex - startDay + 7) % 7;
    const sessionDate = new Date(startDate);
    sessionDate.setDate(startDate.getDate() + diff);
    const formattedDate = sessionDate.toISOString().split('T')[0];
    console.log(`Generated session date: ${formattedDate} for jour: ${jour}, date_debut: ${dateDebut}`);
    return formattedDate;
  };

  const fetchData = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const [ressourcesRes, formationsRes, planningsRes, reservationsRes] = await Promise.all([
        api.get('/ressources'),
        api.get('/formations'),
        api.get('/plannings'),
        api.get('/ressources/reservations'),
      ]);

      console.log('API Responses:', {
        ressources: ressourcesRes.data,
        formations: formationsRes.data,
        plannings: planningsRes.data,
        reservations: reservationsRes.data,
      });

      const enrichedPlannings = await Promise.all(
        planningsRes.data.map(async (p) => {
          try {
            const joursRes = await api.get(`/planning-jours/planning/${p.id}`);
            return {
              id: p.id,
              formation_id: p.formation_id,
              jours: joursRes.data.map((j) => {
                if (!j.id) console.warn(`Missing planning_jour_id for planning ${p.id}, jour: ${j.jour}`);
                return {
                  id: j.id,
                  jour: j.jour,
                  heureDebut: normalizeTime(j.heure_debut),
                  heureFin: normalizeTime(j.heure_fin),
                };
              }),
            };
          } catch (err) {
            console.warn(`Failed to fetch jours for planning ${p.id}:`, err);
            return { id: p.id, formation_id: p.formation_id, jours: [] };
          }
        })
      );

      const enrichedFormations = formationsRes.data.map((f) => {
        const seanceJours = enrichedPlannings
          .filter((p) => p.formation_id === f.id)
          .flatMap((p) => p.jours)
          .map((j) => {
            const date = getSessionDate(f.date_debut, j.jour);
            if (!date) console.warn(`Invalid session date for formation ${f.id}, jour: ${j.jour}`);
            return { ...j, date };
          });
        return {
          ...f,
          seance: { jours: seanceJours },
        };
      });

      console.log('Enriched formations:', enrichedFormations);

      setState({
        ressources: ressourcesRes.data,
        formations: enrichedFormations,
        plannings: enrichedPlannings,
        reservations: reservationsRes.data,
        loading: false,
        error: null,
        searchTerm: '',
      });
    } catch (error) {
      console.error('Fetch error:', error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.response?.data?.message || 'Erreur lors du chargement des données',
      }));
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const checkAvailability = useCallback(async () => {
    const { selectedRessource, selectedFormationId, isEditMode, editingReservation } = modalState;
    const formation = state.formations.find((f) => f.id === Number(selectedFormationId));

    console.log('checkAvailability called:', { selectedRessource, selectedFormationId, isEditMode, formation, editingReservation });

    if (!selectedRessource || !selectedFormationId || !formation?.seance?.jours?.length) {
      console.warn('Aborting availability check: missing resource or formation sessions');
      setModalState((prev) => ({
        ...prev,
        seanceAvailability: {},
        errorMsg: !formation?.seance?.jours?.length ? 'Aucune séance disponible pour cette formation.' : 'Ressource ou formation non sélectionnée.',
        loadingAvailability: false,
      }));
      return;
    }

    setModalState((prev) => ({ ...prev, loadingAvailability: true, errorMsg: '' }));

    try {
      const availability = {};
      await Promise.all(
        formation.seance.jours.map(async (s, i) => {
          if (!s.id || !s.date) {
            console.warn(`Invalid session: planning_jour_id: ${s.id}, date: ${s.date}, jour: ${s.jour}`);
            availability[i] = { available: 0, isAvailable: false };
            return;
          }

          const cacheKey = `${selectedRessource.id}_${s.id}`;
          if (availabilityCache.has(cacheKey)) {
            console.log(`Cache hit for ${cacheKey}:`, availabilityCache.get(cacheKey));
            availability[i] = availabilityCache.get(cacheKey);
            return;
          }

          try {
            console.log(`Checking availability for ressource_id: ${selectedRessource.id}, planning_jour_id: ${s.id}, date: ${s.date}`);
            const response = await api.get('/ressources/check-availability', {
              params: {
                ressource_id: selectedRessource.id,
                planning_jour_id: s.id,
              },
            });
            console.log(`Availability response for planning_jour_id ${s.id} (date: ${s.date}):`, response.data);
            let available = response.data.available || 0;
            const isAvailable = response.data.is_available || false;

            if (isEditMode && editingReservation && editingReservation.planning_jour_id === s.id) {
              available += editingReservation.quantite;
              console.log(`Adjusted availability for editing reservation: ${available} (added ${editingReservation.quantite})`);
            }

            availability[i] = {
              available,
              isAvailable: available > 0,
            };
            availabilityCache.set(cacheKey, availability[i]);
          } catch (err) {
            console.error(`Availability check failed for planning_jour_id ${s.id} (date: ${s.date}):`, err.response?.data || err.message);
            availability[i] = { available: 0, isAvailable: false };
            availabilityCache.set(cacheKey, availability[i]);
          }
        })
      );
      console.log('Availability result:', availability);
      setModalState((prev) => ({
        ...prev,
        seanceAvailability: availability,
        loadingAvailability: false,
        errorMsg: Object.values(availability).every((a) => !a.isAvailable)
          ? `Aucune ressource disponible pour les séances sélectionnées (${formation.seance.jours.map((s) => s.date || 'invalide').join(', ')}).`
          : '',
      }));
    } catch (error) {
      console.error('Availability check failed globally:', error);
      setModalState((prev) => ({
        ...prev,
        seanceAvailability: formation.seance.jours.reduce((acc, _, i) => ({
          ...acc,
          [i]: { available: 0, isAvailable: false },
        }), {}),
        loadingAvailability: false,
        errorMsg: 'Erreur lors de la vérification de la disponibilité: ' + (error.response?.data?.message || error.message),
      }));
    }
  }, [modalState.selectedRessource, modalState.selectedFormationId, modalState.isEditMode, modalState.editingReservation, state.formations]);

  useEffect(() => {
    console.log('Modal state updated:', modalState);
    if (modalState.selectedFormationId) {
      availabilityCache.clear();
      checkAvailability();
    }
  }, [checkAvailability, modalState.selectedFormationId, modalState.isEditMode]);

  const handleSearch = (e) => {
    setState((prev) => ({ ...prev, searchTerm: e.target.value }));
  };

  const openReservationModal = (ressource) => {
    setModalState({
      isOpen: true,
      isEditMode: false,
      selectedRessource: ressource,
      selectedFormationId: '',
      selectedSeances: [],
      seanceQuantities: {},
      seanceAvailability: {},
      errorMsg: '',
      isSidebarCollapsed: modalState.isSidebarCollapsed,
      quantityErrors: {},
      loadingAvailability: false,
      editingReservation: null,
    });
    availabilityCache.clear();
  };

  const openEditReservationModal = (ressource, reservation) => {
    console.log('Opening edit modal for reservation:', reservation, 'resource:', ressource);
    const formation = state.formations.find((f) => f.id === reservation.formationId);
    console.log('Found formation:', formation);
    const seanceDate = reservation.seances[0]?.date || getSessionDate(formation?.date_debut, reservation.seances[0]?.jour);
    const seanceIndex = formation?.seance?.jours.findIndex(
      (s) => s.id === reservation.planning_jour_id && s.date === seanceDate
    );
    console.log('Seance index:', seanceIndex, 'Seance date:', seanceDate, 'Formation seances:', formation?.seance?.jours);

    if (!formation || seanceIndex === -1) {
      console.error('Error: Formation or seance not found for reservation:', reservation);
      toast.error(`Formation ou séance introuvable pour la réservation (ID: ${reservation.id}).`);
      return;
    }

    setModalState((prev) => ({
      ...JSON.parse(JSON.stringify(prev)),
      isOpen: true,
      isEditMode: true,
      selectedRessource: ressource,
      selectedFormationId: reservation.formationId.toString(),
      selectedSeances: [seanceIndex],
      seanceQuantities: { [seanceIndex]: reservation.quantite },
      seanceAvailability: {},
      errorMsg: '',
      isSidebarCollapsed: prev.isSidebarCollapsed,
      quantityErrors: {},
      loadingAvailability: true,
      editingReservation: { ...reservation, seances: [{ ...reservation.seances[0], date: seanceDate }] },
    }));
    console.log('Modal state set to open in edit mode');
  };

  const handleDeleteReservation = async (reservationId) => {
    console.log('handleDeleteReservation called with ID:', reservationId);
    if (!reservationId) {
      console.error('Invalid reservation ID');
      toast.error('ID de réservation invalide.');
      return;
    }

    if (!window.confirm('Confirmer la suppression de la réservation ?')) {
      console.log('Deletion cancelled by user');
      return;
    }

    console.log('Deletion confirmed, sending DELETE request for ID:', reservationId);

    try {
      const response = await api.delete(`/ressources/reservations/${reservationId}`);
      console.log('Delete API response:', response.data);

      // Optimistically update state
      setState((prev) => {
        const newReservations = prev.reservations.filter((res) => res.id !== reservationId);
        console.log('Updated reservations:', newReservations);
        return { ...prev, reservations: newReservations };
      });

      toast.success('Réservation supprimée avec succès.');

      // Refresh data to ensure consistency
      try {
        await fetchData();
        console.log('Data refreshed after deletion');
      } catch (err) {
        console.error('Error refreshing data after deletion:', err);
        toast.warn('Réservation supprimée, mais échec du rafraîchissement des données.');
      }

      availabilityCache.clear();
      console.log('Availability cache cleared');
    } catch (error) {
      console.error('Delete reservation error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression de la réservation.');
    }
  };

  const closeReservationModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false, isEditMode: false, editingReservation: null }));
  };

  const handleFormationSelect = (e) => {
    const selectedId = e.target.value;
    setModalState((prev) => ({
      ...prev,
      selectedFormationId: selectedId,
      selectedSeances: [],
      seanceQuantities: {},
      errorMsg: '',
      quantityErrors: {},
      loadingAvailability: true,
    }));
  };

  const handleSeanceToggle = (index) => {
    if (modalState.isEditMode) return;
    setModalState((prev) => {
      const isSelected = prev.selectedSeances.includes(index);
      const newSeances = isSelected
        ? prev.selectedSeances.filter((i) => i !== index)
        : [...prev.selectedSeances, index];

      const newQuantities = { ...prev.seanceQuantities };
      const newQuantityErrors = { ...prev.quantityErrors };

      if (!isSelected) {
        newQuantities[index] = 1;
        delete newQuantityErrors[index];
      } else {
        delete newQuantities[index];
        delete newQuantityErrors[index];
      }

      return {
        ...prev,
        selectedSeances: newSeances,
        seanceQuantities: newQuantities,
        quantityErrors: newQuantityErrors,
        errorMsg: '',
      };
    });
  };

  const handleQuantityChange = (index, value, max) => {
    let quantity = parseInt(value, 10);
    if (isNaN(quantity)) quantity = 1;
    quantity = Math.max(1, quantity);

    const newQuantityErrors = { ...modalState.quantityErrors };

    if (max !== null && quantity > max) {
      newQuantityErrors[index] = `Quantité maximale disponible: ${max}`;
    } else {
      delete newQuantityErrors[index];
    }

    setModalState((prev) => ({
      ...prev,
      seanceQuantities: {
        ...prev.seanceQuantities,
        [index]: Math.min(quantity, max || quantity),
      },
      quantityErrors: newQuantityErrors,
      errorMsg: Object.keys(newQuantityErrors).length > 0
        ? 'Certaines quantités dépassent la disponibilité.'
        : '',
    }));
  };

  const handleReservationSubmit = async (e) => {
    e.preventDefault();
    const { isEditMode, selectedRessource, selectedFormationId, selectedSeances, seanceQuantities, editingReservation } = modalState;
    const formation = state.formations.find((f) => f.id === Number(selectedFormationId));

    if (!formation) {
      setModalState((prev) => ({ ...prev, errorMsg: 'Veuillez sélectionner une formation valide.' }));
      toast.error('Veuillez sélectionner une formation valide.');
      return;
    }

    if (selectedSeances.length === 0) {
      setModalState((prev) => ({ ...prev, errorMsg: 'Veuillez sélectionner au moins une séance.' }));
      toast.error('Veuillez sélectionner au moins une séance.');
      return;
    }

    const hasInvalidSeances = selectedSeances.some((i) => !formation.seance.jours[i].id || !formation.seance.jours[i].date);
    if (hasInvalidSeances) {
      setModalState((prev) => ({
        ...prev,
        errorMsg: 'Certaines séances n\'ont pas d\'identifiant ou de date valide. Vérifiez les plannings associés.',
      }));
      toast.error('Certaines séances sont invalides.');
      return;
    }

    const hasQuantityErrors = selectedSeances.some((i) => {
      const quantity = seanceQuantities[i] || 1;
      const available = modalState.seanceAvailability[i]?.available || 0;
      return available !== null && quantity > available;
    });

    if (hasQuantityErrors) {
      setModalState((prev) => ({
        ...prev,
        errorMsg: 'Certaines quantités dépassent la disponibilité. Veuillez les ajuster.',
      }));
      toast.error('Certaines quantités dépassent la disponibilité.');
      return;
    }

    try {
      if (isEditMode && editingReservation) {
        if (!window.confirm('Confirmer la modification de la réservation ?')) return;
        const session = formation.seance.jours[selectedSeances[0]];
        const quantity = seanceQuantities[selectedSeances[0]] || 1;
        const response = await api.put(`/ressources/reservations/${editingReservation.id}`, {
          ressource_id: selectedRessource.id,
          planning_jour_id: session.id,
          formation_id: formation.id,
          quantite: quantity,
        });

        setState((prev) => ({
          ...prev,
          reservations: prev.reservations.map((res) =>
            res.id === editingReservation.id
              ? {
                  ...res,
                  quantite: quantity,
                  formationTitre: formation.titre,
                  seances: [{
                    id: session.id,
                    jour: session.jour,
                    heureDebut: session.heureDebut,
                    heureFin: session.heureFin,
                    date: session.date,
                  }],
                }
              : res
          ),
        }));
        setModalState((prev) => ({
          ...prev,
          errorMsg: 'Réservation modifiée avec succès.',
          isOpen: false,
          isEditMode: false,
          editingReservation: null,
        }));
        toast.success('Réservation modifiée avec succès.');
      } else {
        const newReservations = await Promise.all(
          selectedSeances.map(async (i) => {
            const session = formation.seance.jours[i];
            const quantity = seanceQuantities[i] || 1;
            const response = await api.post('/ressources/reserver', {
              ressource_id: selectedRessource.id,
              planning_jour_id: session.id,
              formation_id: formation.id,
              quantite: quantity,
            });
            return {
              ...response.data,
              formationTitre: formation.titre,
              seances: [{
                id: session.id,
                jour: session.jour,
                heureDebut: session.heureDebut,
                heureFin: session.heureFin,
                date: session.date,
              }],
              quantite: quantity,
            };
          })
        );

        setState((prev) => ({
          ...prev,
          reservations: [...prev.reservations, ...newReservations],
        }));
        setModalState((prev) => ({
          ...prev,
          errorMsg: 'Réservation créée avec succès.',
          isOpen: false,
          isEditMode: false,
          editingReservation: null,
        }));
        toast.success('Réservation créée avec succès.');
      }

      await fetchData();
      availabilityCache.clear();
    } catch (error) {
      setModalState((prev) => ({
        ...prev,
        errorMsg: error.response?.data?.message || 'Erreur lors de la réservation.',
      }));
      toast.error(error.response?.data?.message || 'Erreur lors de la réservation.');
      console.error('Reservation submit error:', error.response?.data || error.message);
    }
  };

  const filteredRessources = state.ressources.filter((r) =>
    r.nom.toLowerCase().includes(state.searchTerm.toLowerCase())
  );

  const selectedFormation = state.formations.find((f) =>
    f.id === Number(modalState.selectedFormationId)
  );

  const hasQuantityErrors = Object.keys(modalState.quantityErrors).length > 0;

  if (state.loading) {
    return (
      <div className="loading-overlay" style={{ backgroundColor: colors.background, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loading-spinner" style={{ border: `4px solid ${colors.primary}`, borderTopColor: 'transparent', width: '40px', height: '40px', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="error-container" style={{ backgroundColor: colors.background, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <FiAlertCircle size={48} color={colors.danger} />
        <h2 style={{ color: colors.text, fontWeight: 600 }}>Erreur de chargement</h2>
        <p style={{ color: colors.text }}>{state.error}</p>
        <button
          onClick={fetchData}
          style={{
            backgroundColor: colors.primary,
            color: colors.lightText,
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            border: 'none',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className={`training-management-container ${modalState.isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <ToastContainer position="top-right" autoClose={3000} />
      <ChargeSidebar onToggle={(collapsed) => setModalState((prev) => ({ ...prev, isSidebarCollapsed: collapsed }))} />

      <motion.div
        className="main-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{ backgroundColor: colors.background }}
      >
        <motion.div
          className="page-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, type: 'spring', stiffness: 100 }}
          style={{ color: colors.lightText }}
        >
          <div className="header-content">
            <h1 className="elegant-title" style={{ fontWeight: 700, fontSize: '2rem', color: colors.text }}>Gestion des Ressources</h1>
            <p className="subtitle" style={{ color: colors.text, fontSize: '1rem' }}>
              Réservez, modifiez ou supprimez un nombre d'unités de chaque ressource pour vos sessions de formation
            </p>
          </div>
        </motion.div>

        <motion.div
          className="action-bar"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <motion.div
            className="search-container"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <input
              type="text"
              placeholder="Rechercher une ressource..."
              value={state.searchTerm}
              onChange={handleSearch}
              className="search-input"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: `1px solid ${colors.primary}`,
                backgroundColor: colors.cardBg,
                color: colors.text,
                fontSize: '1rem',
              }}
            />
          </motion.div>
        </motion.div>

        <motion.div
          className="ressources-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
            marginTop: '2rem',
            padding: '0 2rem',
          }}
          initial="hidden"
          animate="visible"
        >
          {filteredRessources.length > 0 ? (
            filteredRessources.map((ressource, idx) => {
              const reservationsR = state.reservations.filter((res) => res.ressourceId === ressource.id);
              return (
                <motion.div
                  key={ressource.id}
                  className="ressource-card"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  style={{
                    background: colors.cardBg,
                    borderRadius: 18,
                    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                    padding: '2rem 1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    position: 'relative',
                    minHeight: 260,
                    borderTop: `4px solid var(--gray-800)`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
                    <div style={{
                      background: '#e8eaf6',
                      borderRadius: 12,
                      padding: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <FiBox size={32} color="var(--gray-800)" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1.2rem', color: colors.text }}>{ressource.nom}</div>
                      <div style={{ color: colors.success, fontWeight: 600, fontSize: '1rem' }}>
                        Stock : {ressource.quantite}
                      </div>
                    </div>
                  </div>

                  <div style={{ width: '100%', marginBottom: 10 }}>
                    <div style={{ fontWeight: 600, color: colors.text, marginBottom: 6 }}>Réservations :</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {reservationsR.length === 0 && (
                        <span style={{ color: colors.primary, fontStyle: 'italic', fontSize: '0.98em' }}>
                          Aucune réservation
                        </span>
                      )}
                      {reservationsR.map((res, i) => (
                        <div
                          key={i}
                          style={{
                            background: '#f5f5f5',
                            borderRadius: 8,
                            padding: '0.5rem 0.8rem',
                            marginBottom: 2,
                            borderLeft: `4px solid #e6b801`,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <div>
                            <span style={{ fontWeight: 500, color: colors.primary }}>
                              <FiLayers style={{ marginRight: 4 }} />
                              {res.formationTitre} <span style={{ color: colors.primaryDark, fontWeight: 700 }}>x{res.quantite}</span>
                            </span>
                            <div style={{ fontSize: '0.95em', color: '#666', marginTop: 2, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                              {res.seances.map((s, j) => (
                                <span
                                  key={j}
                                  style={{
                                    background: '#e8eaf6',
                                    borderRadius: 6,
                                    padding: '2px 8px',
                                    marginRight: 4,
                                    marginBottom: 2,
                                    color: colors.primaryDark,
                                  }}
                                >
                                  {s.date || 'Date non définie'} {s.jour} {s.heureDebut}-{s.heureFin}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
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
                              onClick={() => {
                                console.log('Modifier button clicked for reservation:', res);
                                openEditReservationModal(ressource, res);
                              }}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <FiEdit size={22} color={colors.secondary} />
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
                              onClick={() => {
                                console.log('Supprimer button clicked for reservation:', res);
                                handleDeleteReservation(res.id);
                              }}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <FiTrash2 size={22} color={colors.danger} />
                            </motion.button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <motion.button
                    className="planning-btn"
                    onClick={() => openReservationModal(ressource)}
                    whileHover={{ scale: 1.05, backgroundColor: `var(--gray-800)` }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      marginTop: 'auto',
                      alignSelf: 'flex-end',
                      background: 'var(--gray-800)',
                      color: colors.lightText,
                      border: 'none',
                      borderRadius: 8,
                      padding: '0.7rem 1.5rem',
                      fontWeight: 600,
                      fontSize: '1rem',
                      boxShadow: `0 2px 8px ${colors.primary}22`,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <FiCalendar /> Réserver
                  </motion.button>
                </motion.div>
              );
            })
          ) : (
            <div style={{ color: '#888', fontStyle: 'italic', textAlign: 'center', gridColumn: '1/-1' }}>
              Aucune ressource trouvée
            </div>
          )}
        </motion.div>

        <AnimatePresence>
          {modalState.isOpen && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeReservationModal}
              transition={{ duration: 0.2 }}
              style={{ backgroundColor: 'rgba(0,0,0,0.5)', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }}
            >
              <motion.div
                className="modal-container"
                initial={{ scale: 0.9, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 50 }}
                onClick={(e) => e.stopPropagation()}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                layout
                style={{
                  background: colors.cardBg,
                  borderRadius: '12px',
                  maxWidth: '500px',
                  width: '90%',
                  margin: '0 auto',
                  overflow: 'hidden',
                }}
              >
                <div
                  className="modal-header"
                  style={{
                    padding: '1.5rem',
                    background: 'rgb(31, 41, 55)',
                    color: colors.lightText,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <motion.h2 layout="position" style={{ margin: 0 }}>
                    {modalState.isEditMode ? `Modifier Réservation pour ${modalState.selectedRessource?.nom}` : `Réserver ${modalState.selectedRessource?.nom}`}
                  </motion.h2>
                  <motion.button
                    className="close-btn"
                    onClick={closeReservationModal}
                    whileHover={{ scale: 1.2, rotate: 90, color: colors.danger }}
                    whileTap={{ scale: 0.9 }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: colors.lightText,
                      fontSize: '1.5rem',
                      cursor: 'pointer',
                    }}
                  >
                    ✕
                  </motion.button>
                </div>

                <form onSubmit={handleReservationSubmit} style={{ padding: '1.5rem' }}>
                  <motion.div
                    className="form-group"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{ marginBottom: '1rem' }}
                  >
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: colors.text }}>
                      Formation
                    </label>
                    <select
                      value={modalState.selectedFormationId}
                      onChange={handleFormationSelect}
                      className="elegant-select"
                      required
                      disabled={modalState.isEditMode}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        border: `1px solid ${colors.primary}`,
                        backgroundColor: modalState.isEditMode ? '#f0f0f0' : colors.cardBg,
                        color: colors.text,
                        fontSize: '1rem',
                        cursor: modalState.isEditMode ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <option value="">Sélectionner une formation</option>
                      {state.formations.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.titre} ({f.date_debut || 'Date non définie'})
                        </option>
                      ))}
                    </select>
                  </motion.div>

                  <>
                    {selectedFormation && selectedFormation.seance?.jours?.length > 0 ? (
                      <motion.div
                        className="form-group"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 }}
                        style={{ marginBottom: '1.5rem' }}
                      >
                        <label style={{ display: 'block', marginBottom: '0.7rem', fontWeight: 700, color: colors.primary, fontSize: '1.08rem', letterSpacing: '-0.5px' }}>
                          {modalState.isEditMode ? 'Séance réservée' : 'Réservation par séance'}
                        </label>
                        <ul style={{
                          margin: 0,
                          padding: 0,
                          listStyle: 'none',
                          background: '#f4f6fa',
                          borderRadius: '12px',
                          boxShadow: '0 2px 8px #1a237e11',
                          padding: '0.9rem 0.7rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 10,
                        }}>
                          {selectedFormation.seance.jours.map((s, i) => {
                            const available = modalState.seanceAvailability[i]?.available ?? null;
                            const isAvailable = modalState.seanceAvailability[i]?.isAvailable ?? false;
                            const checked = modalState.selectedSeances.includes(i);
                            const quantity = modalState.seanceQuantities[i] || 1;
                            const isDisabled = modalState.isEditMode ? !checked : (available === null || !isAvailable || available <= 0);
                            const hasError = modalState.quantityErrors[i];

                            return (
                              <li key={i} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 18,
                                background: checked ? '#e8eaf6' : 'transparent',
                                borderRadius: 8,
                                padding: '0.5rem 0.7rem',
                                boxShadow: checked ? '0 2px 8px #1a237e18' : 'none',
                                border: hasError ? `2px solid ${colors.danger}` : checked ? '2px solid #b3b8e0' : '2px solid transparent',
                                transition: 'all 0.18s',
                                position: 'relative',
                                opacity: isDisabled ? 0.6 : 1,
                              }}>
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => !isDisabled && handleSeanceToggle(i)}
                                  disabled={isDisabled}
                                  style={{
                                    marginRight: 8,
                                    accentColor: colors.primary,
                                    width: 20,
                                    height: 20,
                                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                                  }}
                                />
                                <span style={{ fontWeight: 600, color: colors.text, minWidth: 140 }}>
                                  {s.date || 'Date non définie'} {s.jour} <span style={{ fontWeight: 400, color: '#888' }}>{s.heureDebut}-{s.heureFin}</span>
                                </span>
                                <span style={{
                                  marginLeft: 0,
                                  fontWeight: 700,
                                  fontSize: '0.98em',
                                  borderRadius: 8,
                                  padding: '2px 10px',
                                  background: available === null ? '#fff3e0' : isAvailable ? '#e6fbe6' : '#ffeaea',
                                  color: available === null ? colors.warning : isAvailable ? colors.success : colors.danger,
                                  boxShadow: available === null ? '0 1px 4px #ffa00022' : isAvailable ? '0 1px 4px #388e3c11' : '0 1px 4px #d32f2f11',
                                  display: 'inline-block',
                                  minWidth: 80,
                                  textAlign: 'center',
                                  letterSpacing: '0.5px',
                                  border: available === null ? '1.5px solid #ffa000' : isAvailable ? '1.5px solid #388e3c' : '1.5px solid #ffd6d6',
                                }}>
                                  {available === null ? (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                      <FiLoader className="spin" style={{ animation: 'spin 1s linear infinite' }} />
                                      Chargement
                                    </span>
                                  ) : isAvailable ? `dispo : ${available}` : 'indisponible'}
                                </span>
                                <input
                                  type="number"
                                  min={1}
                                  max={available > 0 ? available : 1}
                                  value={quantity}
                                  onChange={(e) => handleQuantityChange(i, e.target.value, available)}
                                  disabled={!checked || isDisabled}
                                  style={{
                                    width: 70,
                                    marginLeft: 16,
                                    borderRadius: 7,
                                    border: hasError ? `2px solid ${colors.danger}` : checked ? '2px solid #b3b8e0' : `1.5px solid ${colors.primary}`,
                                    padding: '6px 10px',
                                    fontWeight: 600,
                                    fontSize: '1.01em',
                                    background: checked ? '#e8eaf6' : '#fff',
                                    color: colors.text,
                                    outline: checked ? '2px solid #b3b8e0' : 'none',
                                    boxShadow: checked ? '0 1px 4px #b3b8e022' : '0 1px 4px #1a237e11',
                                    transition: 'border 0.2s, outline 0.2s, background 0.2s',
                                    textAlign: 'center',
                                    cursor: (!checked || isDisabled) ? 'not-allowed' : 'text',
                                    opacity: (!checked || isDisabled) ? 0.7 : 1,
                                  }}
                                />
                                {hasError && (
                                  <span style={{
                                    position: 'absolute',
                                    bottom: -20,
                                    right: 0,
                                    color: colors.danger,
                                    fontSize: '0.75rem',
                                    fontWeight: 500,
                                  }}>
                                    {hasError} (Disponible: {available} pour {s.date} {s.jour})
                                  </span>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </motion.div>
                    ) : selectedFormation && (
                      <div style={{
                        color: colors.danger,
                        marginBottom: '1rem',
                        whiteSpace: 'pre-line',
                        fontWeight: 500,
                        padding: '0.75rem',
                        backgroundColor: '#ffebee',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}>
                        <FiAlertCircle /> Aucune séance disponible pour cette formation. Vérifiez les plannings associés.
                      </div>
                    )}
                    {modalState.errorMsg && (
                      <div style={{
                        color: modalState.errorMsg.includes('succès') ? colors.success : colors.danger,
                        marginBottom: '1rem',
                        whiteSpace: 'pre-line',
                        fontWeight: 500,
                        padding: '0.75rem',
                        backgroundColor: modalState.errorMsg.includes('succès') ? '#e8f5e9' : '#ffebee',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}>
                        <FiAlertCircle /> {modalState.errorMsg}
                      </div>
                    )}
                  </>

                  <div
                    className="form-actions"
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      gap: '1rem',
                      marginTop: '1.5rem',
                    }}
                  >
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={closeReservationModal}
                      style={{
                        padding: '0.75rem 1.5rem',
                        borderRadius: '8px',
                        border: `1px solid ${colors.primary}`,
                        background: 'transparent',
                        color: colors.primary,
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '1rem',
                      }}
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="submit-btn"
                      disabled={modalState.selectedSeances.length === 0 || hasQuantityErrors || modalState.loadingAvailability}
                      style={{
                        padding: '0.75rem 1.5rem',
                        borderRadius: '8px',
                        border: 'none',
                        background: (modalState.selectedSeances.length === 0 || hasQuantityErrors || modalState.loadingAvailability) ? '#ccc' : 'rgb(31, 41, 55)',
                        color: colors.lightText,
                        fontWeight: 600,
                        cursor: (modalState.selectedSeances.length === 0 || hasQuantityErrors || modalState.loadingAvailability) ? 'not-allowed' : 'pointer',
                        fontSize: '1rem',
                      }}
                    >
                      {modalState.loadingAvailability ? 'Chargement...' : modalState.isEditMode ? 'Modifier' : 'Réserver'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default RessourcesManagementPage;