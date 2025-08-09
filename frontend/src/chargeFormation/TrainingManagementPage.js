import React, { useState, useEffect } from 'react';
import {
  FiSearch,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiImage,
  FiFilter,
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './TrainingManagementPage.css';
import ChargeSidebar from './ChargeSidebar';

const TrainingManagementPage = () => {
  const [trainings, setTrainings] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTraining, setEditingTraining] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    availableSpots: 20,
    reservedSpots: 0,
    status: 'planifie',
    imageUrl: '',
    niveauRequis: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const itemsPerPage = 5;
  const niveaux = ['BTS', 'Bac', 'Licence', 'Master', 'Doctorat'];
  const statusOptions = [
    { label: 'Planifié', value: 'planifie' },
    { label: 'En Préparation', value: 'en_preparation' },
    { label: 'En Cours', value: 'en_cours' },
    { label: 'Terminé', value: 'termine' },
  ];

  const navigate = useNavigate();

  useEffect(() => {
    fetchTrainings();
  }, []);

  const fetchTrainings = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/formations', {
        headers: { 'Accept': 'application/json' },
      });
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      const data = await res.json();
      setTrainings(
        data.map((f) => ({
          id: f.id,
          title: f.titre,
          description: f.description,
          startDate: f.date_debut.split(' ')[0],
          endDate: f.date_fin.split(' ')[0],
          availableSpots: f.places_disponibles,
          reservedSpots: f.places_reservees || 0,
          status: statusOptions.find((opt) => opt.value === f.statut)?.label || f.statut
            .replace('_', ' ')
            .replace(/(^\w|\s\w)/g, (c) => c.toUpperCase()),
          imageUrl: f.image || '',
          niveauRequis: f.niveau_requis || '',
        }))
      );
    } catch (error) {
      console.error('Error fetching trainings:', error);
      setErrorMessage('Erreur lors du chargement des formations.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'availableSpots' || name === 'reservedSpots' ? parseInt(value) || 0 : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData((prev) => ({ ...prev, imageUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateReservedSpots = (available, reserved) => {
    return Math.min(reserved, available);
  };

  const handleAddTraining = () => {
    setEditingTraining(null);
    setImagePreview(null);
    setFormData({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      availableSpots: 20,
      reservedSpots: 0,
      status: 'planifie',
      imageUrl: '',
      niveauRequis: '',
    });
    setShowModal(true);
    setErrorMessage(null);
  };

  const handleEditTraining = (training) => {
    setEditingTraining(training);
    setImagePreview(training.imageUrl || null);
    setFormData({
      title: training.title,
      description: training.description,
      startDate: training.startDate,
      endDate: training.endDate,
      availableSpots: training.availableSpots,
      reservedSpots: training.reservedSpots,
      status: statusOptions.find((opt) => opt.label === training.status)?.value || training.status
        .toLowerCase()
        .replace(' ', '_'),
      imageUrl: training.imageUrl || '',
      niveauRequis: training.niveauRequis || '',
    });
    setShowModal(true);
    setErrorMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    // Client-side validation
    const today = new Date().toISOString().split('T')[0];
    if (!formData.title) {
      setErrorMessage('Le titre est requis.');
      return;
    }
    if (!formData.description) {
      setErrorMessage('La description est requise.');
      return;
    }
    if (!formData.startDate) {
      setErrorMessage('La date de début est requise.');
      return;
    }
    if (formData.startDate < today) {
      setErrorMessage('La date de début doit être aujourd\'hui ou ultérieure.');
      return;
    }
    if (!formData.endDate) {
      setErrorMessage('La date de fin est requise.');
      return;
    }
    if (formData.endDate <= formData.startDate) {
      setErrorMessage('La date de fin doit être postérieure à la date de début.');
      return;
    }
    if (formData.availableSpots < 1) {
      setErrorMessage('Le nombre de places disponibles doit être supérieur à 0.');
      return;
    }
    if (formData.reservedSpots < 0 || formData.reservedSpots > formData.availableSpots) {
      setErrorMessage('Le nombre de places réservées doit être compris entre 0 et le nombre de places disponibles.');
      return;
    }
    if (!formData.status || !statusOptions.some((opt) => opt.value === formData.status)) {
      setErrorMessage('Le statut sélectionné est invalide.');
      return;
    }
    if (!formData.niveauRequis) {
      setErrorMessage('Le niveau requis est requis.');
      return;
    }

    const validatedData = {
      ...formData,
      reservedSpots: validateReservedSpots(formData.availableSpots, formData.reservedSpots),
    };

    const payload = {
      titre: validatedData.title,
      description: validatedData.description,
      date_debut: validatedData.startDate,
      date_fin: validatedData.endDate,
      places_disponibles: validatedData.availableSpots,
      places_reservees: validatedData.reservedSpots,
      statut: validatedData.status,
      image: validatedData.imageUrl || null,
      niveau_requis: validatedData.niveauRequis || null,
    };

    console.log('Payload being sent:', payload);

    try {
      if (editingTraining) {
        // Update: PUT request
        const res = await fetch(`http://localhost:8000/api/formations/${editingTraining.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errorData = await res.json();
          if (res.status === 422) {
            const errors = errorData.errors || {};
            const errorMessages = Object.values(errors).flat().join(', ');
            throw new Error(`Erreur de validation: ${errorMessages}`);
          }
          throw new Error(errorData.message || `HTTP error! Status: ${res.status}`);
        }

        const updatedFormation = await res.json();
        setTrainings(
          trainings.map((t) =>
            t.id === editingTraining.id
              ? {
                  id: updatedFormation.data.id,
                  title: updatedFormation.data.titre,
                  description: updatedFormation.data.description,
                  startDate: updatedFormation.data.date_debut.split(' ')[0],
                  endDate: updatedFormation.data.date_fin.split(' ')[0],
                  availableSpots: updatedFormation.data.places_disponibles,
                  reservedSpots: updatedFormation.data.places_reservees || 0,
                  status: statusOptions.find((opt) => opt.value === updatedFormation.data.statut)?.label ||
                    updatedFormation.data.statut
                      .replace('_', ' ')
                      .replace(/(^\w|\s\w)/g, (c) => c.toUpperCase()),
                  imageUrl: updatedFormation.data.image || '',
                  niveauRequis: updatedFormation.data.niveau_requis || '',
                }
              : t
          )
        );
      } else {
        // Create: POST request
        const res = await fetch('http://localhost:8000/api/formations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errorData = await res.json();
          if (res.status === 422) {
            const errors = errorData.errors || {};
            const errorMessages = Object.values(errors).flat().join(', ');
            throw new Error(`Erreur de validation: ${errorMessages}`);
          }
          throw new Error(errorData.message || `HTTP error! Status: ${res.status}`);
        }

        const newFormation = await res.json();
        setTrainings([
          ...trainings,
          {
            id: newFormation.data.id,
            title: newFormation.data.titre,
            description: newFormation.data.description,
            startDate: newFormation.data.date_debut.split(' ')[0],
            endDate: newFormation.data.date_fin.split(' ')[0],
            availableSpots: newFormation.data.places_disponibles,
            reservedSpots: newFormation.data.places_reservees || 0,
            status: statusOptions.find((opt) => opt.value === newFormation.data.statut)?.label ||
              newFormation.data.statut
                .replace('_', ' ')
                .replace(/(^\w|\s\w)/g, (c) => c.toUpperCase()),
            imageUrl: newFormation.data.image || '',
            niveauRequis: newFormation.data.niveau_requis || '',
          },
        ]);
      }
      setShowModal(false);
      setImagePreview(null);
    } catch (error) {
      console.error('Error saving training:', error);
      setErrorMessage(error.message || 'Erreur lors de la sauvegarde de la formation.');
    }
  };

  const handleDeleteTraining = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette formation ?')) return;

    try {
      const res = await fetch(`http://localhost:8000/api/formations/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `HTTP error! Status: ${res.status}`);
      }

      setTrainings(trainings.filter((t) => t.id !== id));
    } catch (error) {
      console.error('Error deleting training:', error);
      setErrorMessage('Erreur lors de la suppression de la formation.');
    }
  };

  const openPlanningPage = (formation) => {
    navigate('/charge/planning', { state: { formation } });
  };

  const filteredTrainings = trainings.filter((training) => {
    const matchesSearch =
      training.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      training.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || training.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredTrainings.length / itemsPerPage);
  const paginatedTrainings = filteredTrainings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const calculatePercentage = (reserved, available) => {
    return available > 0 ? Math.round((reserved / available) * 100) : 0;
  };

  // Animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  const cardVariants = {
    hover: {
      y: -5,
      boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <div className={`training-management-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <ChargeSidebar onToggle={setIsSidebarCollapsed} />

      <motion.div
        className="main-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {errorMessage && (
          <motion.div
            className="error-message"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {errorMessage}
          </motion.div>
        )}

        <motion.div
          className="page-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, type: 'spring', stiffness: 100 }}
        >
          <div className="header-content">
            <h1 className="elegant-title">Gestion des Formations</h1>
            <p className="subtitle">Organisez et planifiez vos sessions de formation</p>
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
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Rechercher une formation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </motion.div>

          <motion.div
            className="filter-container"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FiFilter className="filter-icon" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">Tous les statuts</option>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.label}>
                  {option.label}
                </option>
              ))}
            </select>
          </motion.div>

          <motion.button
            className="add-button"
            onClick={handleAddTraining}
            whileHover={{
              scale: 1.05,
              boxShadow: '0 5px 15px rgba(99, 102, 241, 0.4)',
            }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
            >
              <FiPlus />
            </motion.span>
            <span>Nouvelle formation</span>
          </motion.button>
        </motion.div>

        <motion.div
          className="table-container"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.table className="trainings-table">
            <thead>
              <motion.tr
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <th>Image</th>
                <th>Titre</th>
                <th>Description</th>
                <th>Dates</th>
                <th>Places</th>
                <th>Statut</th>
                <th>Niveau requis</th>
                <th>Actions</th>
              </motion.tr>
            </thead>
            <tbody>
              {paginatedTrainings.length > 0 ? (
                paginatedTrainings.map((training, index) => (
                  <motion.tr
                    key={training.id}
                    variants={itemVariants}
                    whileHover={{ backgroundColor: 'rgba(99, 102, 241, 0.05)' }}
                    custom={index}
                    layout
                  >
                    <td className="image-cell">
                      {training.imageUrl ? (
                        <motion.div
                          className="image-wrapper"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <motion.img
                            src={training.imageUrl}
                            alt={training.title}
                            className="training-image"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                          />
                        </motion.div>
                      ) : (
                        <motion.div
                          className="image-placeholder"
                          whileHover={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
                        >
                          <FiImage size={24} />
                        </motion.div>
                      )}
                    </td>
                    <td>
                      <motion.div whileHover={{ color: 'var(--primary-color)' }}>
                        {training.title}
                      </motion.div>
                    </td>
                    <td className="description-cell">
                      <motion.div whileHover={{ color: 'var(--primary-color)' }}>
                        {training.description}
                      </motion.div>
                    </td>
                    <td>
                      <motion.div whileHover={{ scale: 1.02 }}>
                        {training.startDate} au {training.endDate}
                      </motion.div>
                    </td>
                    <td>
                      <motion.div className="spots-container" variants={cardVariants} whileHover="hover">
                        <div className="spots-progress">
                          <motion.div
                            className="progress-bar"
                            initial={{ width: 0 }}
                            animate={{
                              width: `${calculatePercentage(training.reservedSpots, training.availableSpots)}%`,
                              transition: { duration: 0.8, type: 'spring' },
                            }}
                          />
                        </div>
                        <div className="spots-info">
                          {training.reservedSpots} / {training.availableSpots}
                        </div>
                      </motion.div>
                    </td>
                    <td>
                      <motion.span
                        className={`status-badge ${training.status.replace(' ', '-')}`}
                        whileHover={{
                          scale: 1.05,
                          boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                        }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {training.status}
                      </motion.span>
                    </td>
                    <td>{training.niveauRequis}</td>
                    <td className="actions-cell">
                      <motion.button
                        className="edit-btn"
                        onClick={() => handleEditTraining(training)}
                        whileHover={{
                          scale: 1.2,
                          backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <FiEdit2 />
                      </motion.button>
                      <motion.button
                        className="planning-btn"
                        onClick={() => openPlanningPage(training)}
                        whileHover={{
                          scale: 1.2,
                          backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <FiCalendar />
                      </motion.button>
                      <motion.button
                        className="delete-btn"
                        onClick={() => handleDeleteTraining(training.id)}
                        whileHover={{
                          scale: 1.2,
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <FiTrash2 />
                      </motion.button>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <motion.tr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <td colSpan="8" className="no-results">
                    Aucune formation trouvée
                  </td>
                </motion.tr>
              )}
            </tbody>
          </motion.table>
        </motion.div>

        {totalPages > 1 && (
          <motion.div
            className="pagination"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <motion.button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              whileHover={{ scale: 1.1, backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
              whileTap={{ scale: 0.9 }}
            >
              <FiChevronLeft />
            </motion.button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <motion.button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={currentPage === page ? 'active' : ''}
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
                whileTap={{ scale: 0.9 }}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500 }}
              >
                {page}
              </motion.button>
            ))}

            <motion.button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              whileHover={{ scale: 1.1, backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
              whileTap={{ scale: 0.9 }}
            >
              <FiChevronRight />
            </motion.button>
          </motion.div>
        )}

        <AnimatePresence>
          {showModal && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                className="modal-container"
                initial={{ scale: 0.9, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 50 }}
                onClick={(e) => e.stopPropagation()}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                layout
              >
                <div className="modal-header">
                  <motion.h2 layout="position">
                    {editingTraining ? 'Modifier' : 'Ajouter'} une formation
                  </motion.h2>
                  <motion.button
                    className="close-btn"
                    onClick={() => setShowModal(false)}
                    whileHover={{
                      scale: 1.2,
                      rotate: 90,
                      color: 'var(--danger-color)',
                    }}
                    whileTap={{ scale: 0.9 }}
                  >
                    ✕
                  </motion.button>
                </div>

                <form onSubmit={handleSubmit}>
                  {errorMessage && (
                    <motion.div
                      className="error-message"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {errorMessage}
                    </motion.div>
                  )}

                  <motion.div
                    className="form-group"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <label>Titre</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="elegant-input"
                    />
                  </motion.div>

                  <motion.div
                    className="form-group"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    <label>Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      className="elegant-textarea"
                    />
                  </motion.div>

                  <motion.div
                    className="form-row"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="form-group">
                      <label>Date de début</label>
                      <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        required
                        min={new Date().toISOString().split('T')[0]}
                        className="elegant-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Date de fin</label>
                      <input
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleInputChange}
                        required
                        min={formData.startDate || new Date().toISOString().split('T')[0]}
                        className="elegant-input"
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    className="form-row"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.25 }}
                  >
                    <div className="form-group">
                      <label>Places disponibles</label>
                      <input
                        type="number"
                        name="availableSpots"
                        value={formData.availableSpots}
                        onChange={handleInputChange}
                        min="1"
                        required
                        className="elegant-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Places réservées</label>
                      <input
                        type="number"
                        name="reservedSpots"
                        value={formData.reservedSpots}
                        onChange={handleInputChange}
                        min="0"
                        max={formData.availableSpots}
                        required
                        className="elegant-input"
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    className="form-group"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label>Statut</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="elegant-select"
                      required
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </motion.div>

                  <motion.div
                    className="form-group"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.22 }}
                  >
                    <label>Niveau requis</label>
                    <select
                      name="niveauRequis"
                      value={formData.niveauRequis}
                      onChange={handleInputChange}
                      className="elegant-select"
                      required
                    >
                      <option value="">Sélectionnez un niveau</option>
                      {niveaux.map((niveau) => (
                        <option key={niveau} value={niveau}>
                          {niveau}
                        </option>
                      ))}
                    </select>
                  </motion.div>

                  <motion.div
                    className="form-group"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 }}
                  >
                    <label>Image</label>
                    <div className="image-upload-container">
                      <label className="image-upload-label">
                        <input
                          type="file"
                          className="image-upload-input"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                        {imagePreview ? (
                          <motion.div
                            className="image-preview"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <img src={imagePreview} alt="Preview" className="preview-image" />
                            <motion.button
                              type="button"
                              className="remove-image-btn"
                              onClick={() => {
                                setImagePreview(null);
                                setFormData((prev) => ({ ...prev, imageUrl: '' }));
                              }}
                              whileHover={{ scale: 1.1, rotate: 90 }}
                            >
                              ✕
                            </motion.button>
                          </motion.div>
                        ) : (
                          <motion.div
                            className="upload-placeholder"
                            whileHover={{
                              borderColor: 'var(--primary-color)',
                              backgroundColor: 'rgba(99, 102, 241, 0.05)',
                            }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <FiImage size={24} />
                            <p>Cliquez pour télécharger une image</p>
                          </motion.div>
                        )}
                      </label>
                    </div>
                  </motion.div>

                  <motion.div
                    className="form-actions"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <motion.button
                      type="button"
                      className="cancel-btn"
                      onClick={() => setShowModal(false)}
                      whileHover={{
                        scale: 1.05,
                        backgroundColor: 'var(--gray-200)',
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Annuler
                    </motion.button>
                    <motion.button
                      type="submit"
                      className="submit-btn"
                      whileHover={{
                        scale: 1.05,
                        backgroundColor: '#e6b801',
                        boxShadow: '0 5px 15px rgba(99, 102, 241, 0.4)',
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {editingTraining ? 'Mettre à jour' : 'Créer'}
                    </motion.button>
                  </motion.div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default TrainingManagementPage;