import React, { useState } from 'react';
import { FiCalendar, FiBox, FiLayers, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import ChargeSidebar from './ChargeSidebar';
import './TrainingManagementPage.css';

const mockRessources = [
  { id: 1, nom: 'Vidéo-projecteur A', quantite: 5 },
  { id: 2, nom: 'Tablette Samsung', quantite: 10 },
  { id: 3, nom: 'Ordinateur HP', quantite: 8 },
  { id: 4, nom: 'Imprimante Couleur', quantite: 2 },
  { id: 5, nom: 'Micro Sans Fil', quantite: 6 },
];

const mockFormations = [
  {
    id: 1,
    titre: 'React Avancé',
    seance: {
      jours: [
        { jour: 'Lundi', heureDebut: '09:00', heureFin: '12:00' },
        { jour: 'Mercredi', heureDebut: '14:00', heureFin: '17:00' },
        { jour: 'Vendredi', heureDebut: '10:00', heureFin: '13:00' },
      ],
    },
  },
  {
    id: 2,
    titre: 'UX/UI Design',
    seance: {
      jours: [
        { jour: 'Mardi', heureDebut: '10:00', heureFin: '12:00' },
        { jour: 'Jeudi', heureDebut: '15:00', heureFin: '18:00' },
      ],
    },
  },
  {
    id: 3,
    titre: 'Data Science',
    seance: {
      jours: [
        { jour: 'Lundi', heureDebut: '09:00', heureFin: '12:00' },
        { jour: 'Jeudi', heureDebut: '14:00', heureFin: '17:00' },
      ],
    },
  },
];

const RessourcesManagementPage = () => {
  const [reservations, setReservations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [reservationModal, setReservationModal] = useState(false);
  const [selectedRessource, setSelectedRessource] = useState(null);
  const [selectedFormationId, setSelectedFormationId] = useState('');
  const [reservationData, setReservationData] = useState({ quantite: 1 });
  const [errorMsg, setErrorMsg] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedSeances, setSelectedSeances] = useState([]);
  const [seanceQuantities, setSeanceQuantities] = useState({});

  // Couleurs personnalisées (bleu marine)
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
    cardBg: '#ffffff'
  };

  const filteredRessources = mockRessources.filter(r =>
    r.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedFormation = mockFormations.find(f => f.id === Number(selectedFormationId));

  function getReservedForSlot(ressourceId, jour, heureDebut, heureFin, excludeFormationId = null) {
    let total = 0;
    reservations.forEach(res => {
      if (res.ressourceId === ressourceId) {
        res.seances.forEach(s => {
          if (
            s.jour === jour &&
            ((heureDebut < s.heureFin && heureFin > s.heureDebut)) &&
            (excludeFormationId == null || res.formationId !== excludeFormationId)
          ) {
            total += res.quantite;
          }
        });
      }
    });
    return total;
  }

  function getMaxReservable(ressource, formation) {
    if (!formation || !formation.seance) return ressource.quantite;
    
    let minDispo = ressource.quantite;
    for (const s of formation.seance.jours) {
      const reserved = getReservedForSlot(ressource.id, s.jour, s.heureDebut, s.heureFin);
      minDispo = Math.min(minDispo, ressource.quantite - reserved);
    }
    
    return minDispo > 0 ? minDispo : 0;
  }

  const openReservationModal = (ressource) => {
    setSelectedRessource(ressource);
    setSelectedFormationId('');
    setReservationData({ quantite: 1 });
    setSelectedSeances([]);
    setSeanceQuantities({});
    setErrorMsg('');
    setReservationModal(true);
  };

  const handleSeanceCheckbox = (index) => {
    setSelectedSeances(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
    setSeanceQuantities(prev => {
      const copy = { ...prev };
      if (!selectedSeances.includes(index)) {
        // Ajout : valeur par défaut 1
        copy[index] = 1;
      } else {
        // Suppression
        delete copy[index];
      }
      return copy;
    });
  };
  const handleSeanceQuantityChange = (index, value, max) => {
    let v = parseInt(value, 10);
    if (isNaN(v) || v < 1) v = 1;
    setSeanceQuantities(prev => ({ ...prev, [index]: v }));
  };

  const handleReservation = (e) => {
    e.preventDefault();
    if (!selectedFormation) {
      setErrorMsg('Veuillez sélectionner une formation.');
      return;
    }
    if (!selectedSeances.length) {
      setErrorMsg('Veuillez sélectionner au moins une séance.');
      return;
    }
    // Vérification de la disponibilité pour chaque séance cochée
    let hasConflict = false;
    let conflictIndex = null;
    for (const i of selectedSeances) {
      const s = selectedFormation.seance.jours[i];
      const reserved = getReservedForSlot(selectedRessource.id, s.jour, s.heureDebut, s.heureFin);
      const quantiteDemandee = parseInt(seanceQuantities[i], 10) || 1;
      if (quantiteDemandee > (selectedRessource.quantite - reserved)) {
        hasConflict = true;
        conflictIndex = i;
        break;
      }
      if (reserved + quantiteDemandee > selectedRessource.quantite) {
        hasConflict = true;
        conflictIndex = i;
        break;
      }
    }
    if (hasConflict) {
      setErrorMsg(`Quantité demandée trop élevée pour la séance ${conflictIndex !== null ? selectedFormation.seance.jours[conflictIndex].jour : ''}. Maximum possible : ${selectedRessource ? selectedRessource.quantite - getReservedForSlot(selectedRessource.id, selectedFormation.seance.jours[conflictIndex].jour, selectedFormation.seance.jours[conflictIndex].heureDebut, selectedFormation.seance.jours[conflictIndex].heureFin) : 0}`);
      return;
    }
    // Ajout de la réservation pour les séances sélectionnées
    setReservations([
      ...reservations,
      ...selectedSeances.map(i => ({
        ressourceId: selectedRessource.id,
        formationId: selectedFormation.id,
        formationTitre: selectedFormation.titre,
        seances: [selectedFormation.seance.jours[i]],
        quantite: parseInt(seanceQuantities[i], 10) || 1
      }))
    ]);
    setReservationModal(false);
  };

  function getConflitsForRessource(ressource) {
    let conflits = [];
    for (const f of mockFormations) {
      if (!f.seance) continue;
      for (const s of f.seance.jours) {
        const reserved = getReservedForSlot(ressource.id, s.jour, s.heureDebut, s.heureFin);
        if (reserved > ressource.quantite) {
          conflits.push({ 
            formation: f.titre, 
            ...s, 
            reserved, 
            reste: ressource.quantite - reserved 
          });
        }
      }
    }
    return conflits;
  }

  return (
    <div className={`training-management-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <ChargeSidebar onToggle={setIsSidebarCollapsed} />
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
            <h1 className="elegant-title">Gestion des Ressources</h1>
            <p className="subtitle">Réservez un nombre d'unités de chaque ressource pour vos sessions de formation</p>
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
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              className="search-input" 
              style={{  }}
            />
          </motion.div>
        </motion.div>

        {/* Grille de cards ressources */}
        <motion.div 
          className="ressources-grid" 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
            gap: '2rem', 
            marginTop: '2rem',
            padding: '0 2rem'
          }} 
          initial="hidden" 
          animate="visible"
        >
          {filteredRessources.length > 0 ? filteredRessources.map((r, idx) => {
            const reservationsR = reservations.filter(res => res.ressourceId === r.id);
            const conflits = getConflitsForRessource(r);
            const maxReservable = selectedFormation ? getMaxReservable(r, selectedFormation) : r.quantite;
            
            return (
              <motion.div 
                key={r.id} 
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
                  borderTop: `4px solid var(--gray-800)`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
                  <div style={{ 
                    background: '#e8eaf6', 
                    borderRadius: 12, 
                    padding: 12, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    <FiBox size={32} color="var(--gray-800)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.2rem', color: colors.text }}>{r.nom}</div>
                    <div style={{ color: colors.success, fontWeight: 600, fontSize: '1rem' }}>
                      Stock : {r.quantite}
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
                          display: 'flex', 
                          flexDirection: 'column', 
                          marginBottom: 2, 
                          borderLeft: `4px solid #e6b801`
                        }}
                      >
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
                                color: colors.primaryDark
                              }}
                            >
                              {s.jour} {s.heureDebut}-{s.heureFin}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              

                <motion.button 
                  className="planning-btn" 
                  onClick={() => openReservationModal(r)} 
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
                    gap: 8 
                  }}
                >
                  <FiCalendar /> Réserver
                </motion.button>
              </motion.div>
            );
          }) : (
            <div style={{ color: '#888', fontStyle: 'italic', textAlign: 'center', gridColumn: '1/-1' }}>
              Aucune ressource trouvée
            </div>
          )}
        </motion.div>

        {/* Modal réservation */}
        <AnimatePresence>
          {reservationModal && (
            <motion.div 
              className="modal-overlay" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setReservationModal(false)} 
              transition={{ duration: 0.2 }}
              style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            >
              <motion.div 
                className="modal-container" 
                initial={{ scale: 0.9, opacity: 0, y: 50 }} 
                animate={{ scale: 1, opacity: 1, y: 0 }} 
                exit={{ scale: 0.9, opacity: 0, y: 50 }} 
                onClick={e => e.stopPropagation()} 
                transition={{ type: 'spring', damping: 20, stiffness: 300 }} 
                layout
                style={{ 
                  background: colors.cardBg,
                  borderRadius: '12px',
                  maxWidth: '500px',
                  width: '90%',
                  margin: '0 auto',
                  overflow: 'hidden'
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
                    alignItems: 'center'
                  }}
                >
                  <motion.h2 layout="position" style={{ margin: 0 }}>
                    Réserver la ressource
                  </motion.h2>
                  <motion.button 
                    className="close-btn" 
                    onClick={() => setReservationModal(false)} 
                    whileHover={{ scale: 1.2, rotate: 90, color: colors.danger }} 
                    whileTap={{ scale: 0.9 }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: colors.lightText,
                      fontSize: '1.5rem',
                      cursor: 'pointer'
                    }}
                  >
                    ✕
                  </motion.button>
                </div>

                <form onSubmit={handleReservation} style={{ padding: '1.5rem' }}>
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
                      name="formation" 
                      value={selectedFormationId} 
                      onChange={e => { 
                        setSelectedFormationId(e.target.value); 
                        setErrorMsg(''); 
                      }} 
                      className="elegant-select" 
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        border: `1px solid ${colors.primary}`,
                        backgroundColor: colors.cardBg,
                        color: colors.text,
                        fontSize: '1rem'
                      }}
                    >
                      <option value="">Sélectionner une formation</option>
                      {mockFormations.filter(f => f.seance).map(f => (
                        <option key={f.id} value={f.id}>{f.titre}</option>
                      ))}
                    </select>
                  </motion.div>

                  {selectedFormation && selectedFormation.seance && (
                    <motion.div 
                      className="form-group" 
                      initial={{ opacity: 0, x: -10 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      transition={{ delay: 0.15 }}
                      style={{ marginBottom: '1.5rem' }}
                    >
                      <label style={{ display: 'block', marginBottom: '0.7rem', fontWeight: 700, color: colors.primary, fontSize: '1.08rem', letterSpacing: '-0.5px' }}>
                        Réservation par séance
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
                        gap: 10
                      }}>
                        {selectedFormation.seance.jours.map((s, i) => {
                          const reserved = selectedRessource ? getReservedForSlot(selectedRessource.id, s.jour, s.heureDebut, s.heureFin) : 0;
                          const dispo = selectedRessource ? (selectedRessource.quantite - reserved) : 0;
                          const checked = selectedSeances.includes(i);
                          return (
                            <li key={i} style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 18,
                              background: checked ? '#e8eaf6' : 'transparent',
                              borderRadius: 8,
                              padding: '0.5rem 0.7rem',
                              boxShadow: checked ? '0 2px 8px #1a237e18' : 'none',
                              border: checked ? '2px solid #b3b8e0' : '2px solid transparent',
                              transition: 'all 0.18s',
                              position: 'relative',
                              opacity: dispo > 0 ? 1 : 0.6
                            }}>
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => handleSeanceCheckbox(i)}
                                disabled={dispo <= 0}
                                style={{ marginRight: 8, accentColor: colors.primary, width: 20, height: 20, cursor: dispo > 0 ? 'pointer' : 'not-allowed' }}
                              />
                              <span style={{ fontWeight: 600, color: colors.text, minWidth: 120 }}>{s.jour} <span style={{ fontWeight: 400, color: '#888' }}>{s.heureDebut}-{s.heureFin}</span></span>
                              <span style={{
                                marginLeft: 0,
                                fontWeight: 700,
                                fontSize: '0.98em',
                                borderRadius: 8,
                                padding: '2px 10px',
                                background: dispo > 0 ? '#e6fbe6' : '#ffeaea', // vert pâle si dispo
                                color: dispo > 0 ? colors.success : colors.danger,
                                boxShadow: dispo > 0 ? '0 1px 4px #388e3c11' : '0 1px 4px #d32f2f11',
                                display: 'inline-block',
                                minWidth: 80,
                                textAlign: 'center',
                                letterSpacing: '0.5px',
                                border: dispo > 0 ? '1.5px solid #388e3c' : '1.5px solid #ffd6d6'
                              }}>
                                {dispo > 0 ? `dispo : ${dispo}` : 'indisponible'}
                              </span>
                              <input
                                type="number"
                                min={1}
                                max={dispo > 0 ? dispo : 1}
                                value={seanceQuantities[i] || 1}
                                onChange={e => handleSeanceQuantityChange(i, e.target.value, dispo)}
                                disabled={!checked || dispo <= 0}
                                style={{
                                  width: 70,
                                  marginLeft: 16,
                                  borderRadius: 7,
                                  border: checked ? '2px solid #b3b8e0' : `1.5px solid ${colors.primary}`,
                                  padding: '6px 10px',
                                  fontWeight: 600,
                                  fontSize: '1.01em',
                                  background: checked ? '#e8eaf6' : '#fff',
                                  color: colors.text,
                                  outline: checked ? '2px solid #b3b8e0' : 'none',
                                  boxShadow: checked ? '0 1px 4px #b3b8e022' : '0 1px 4px #1a237e11',
                                  transition: 'border 0.2s, outline 0.2s, background 0.2s',
                                  textAlign: 'center',
                                  cursor: checked && dispo > 0 ? 'text' : 'not-allowed',
                                  opacity: checked && dispo > 0 ? 1 : 0.7
                                }}
                              />
                          </li>
                          );
                        })}
                      </ul>
                    </motion.div>
                  )}

                  {errorMsg && (
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
                      gap: '0.5rem'
                    }}>
                      <FiAlertCircle /> {errorMsg}
                    </div>
                  )}

                  <div 
                    className="form-actions" 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'flex-end', 
                      gap: '1rem',
                      marginTop: '1.5rem'
                    }}
                  >
                    <button 
                      type="button" 
                      className="cancel-btn" 
                      onClick={() => setReservationModal(false)}
                      style={{
                        padding: '0.75rem 1.5rem',
                        borderRadius: '8px',
                        border: `1px solid ${colors.primary}`,
                        background: 'transparent',
                        color: colors.primary,
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '1rem'
                      }}
                    >
                      Annuler
                    </button>
                    <button 
                      type="submit" 
                      className="submit-btn"
                      style={{
                        padding: '0.75rem 1.5rem',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'rgb(31, 41, 55)',
                        color: colors.lightText,
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '1rem'
                      }}
                    >
                      Réserver
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