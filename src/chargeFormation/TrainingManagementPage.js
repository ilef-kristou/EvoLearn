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
  FiFilter
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
    status: 'Planifié',
    imageUrl: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const itemsPerPage = 5;

  const navigate = useNavigate();

  useEffect(() => {
    // Animation de chargement simulée
    const loadingAnimation = async () => {
      await new Promise(resolve => setTimeout(resolve, 800));
      const mockTrainings = [
        {
          id: 1,
          title: 'React Avancé',
          description: 'Maîtrise des concepts avancés de React',
          startDate: '2023-10-15',
          endDate: '2023-10-20',
          availableSpots: 20,
          reservedSpots: 12,
          status: 'Planifié',
          imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
          sessions: []
        },
        {
          id: 2,
          title: 'Node.js Fondamentaux',
          description: 'Introduction à Node.js et Express',
          startDate: '2023-11-05',
          endDate: '2023-11-10',
          availableSpots: 15,
          reservedSpots: 10,
          status: 'En Préparation',
          imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
          sessions: []
        }
      ];
      setTrainings(mockTrainings);
    };
    
    loadingAnimation();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'availableSpots' || name === 'reservedSpots' ? parseInt(value) : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData(prev => ({ ...prev, imageUrl: reader.result }));
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
      status: 'Planifié',
      imageUrl: ''
    });
    setShowModal(true);
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
      status: training.status,
      imageUrl: training.imageUrl || ''
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validatedData = {
      ...formData,
      reservedSpots: validateReservedSpots(formData.availableSpots, formData.reservedSpots)
    };

    if (editingTraining) {
      setTrainings(trainings.map(t => t.id === editingTraining.id ? { ...t, ...validatedData } : t));
    } else {
      const newId = trainings.length > 0 ? Math.max(...trainings.map(t => t.id)) + 1 : 1;
      setTrainings([...trainings, { id: newId, ...validatedData, sessions: [] }]);
    }
    setShowModal(false);
    setImagePreview(null);
  };

  const handleDeleteTraining = (id) => {
    setTrainings(trainings.filter(t => t.id !== id));
  };

  const openPlanningPage = (formation) => {
    navigate('/charge/planning', { state: { formation } });
  };

  const filteredTrainings = trainings.filter(training => {
    const matchesSearch = training.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const cardVariants = {
    hover: {
      y: -5,
      boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
      transition: {
        duration: 0.3
      }
    }
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
        <motion.div 
          className="page-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
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
              <option value="Planifié">Planifié</option>
              <option value="En Préparation">En Préparation</option>
              <option value="En Cours">En Cours</option>
              <option value="Terminé">Terminé</option>
            </select>
          </motion.div>

          <motion.button
            className="add-button"
            onClick={handleAddTraining}
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 5px 15px rgba(99, 102, 241, 0.4)"
            }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
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
                      <motion.div
                        whileHover={{ color: 'var(--primary-color)' }}
                      >
                        {training.title}
                      </motion.div>
                    </td>
                    <td className="description-cell">
                      <motion.div
                        whileHover={{ color: 'var(--primary-color)' }}
                      >
                        {training.description}
                      </motion.div>
                    </td>
                    <td>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                      >
                        {training.startDate} au {training.endDate}
                      </motion.div>
                    </td>
                    <td>
                      <motion.div 
                        className="spots-container"
                        variants={cardVariants}
                        whileHover="hover"
                      >
                        <div className="spots-progress">
                          <motion.div
                            className="progress-bar"
                            initial={{ width: 0 }}
                            animate={{ 
                              width: `${calculatePercentage(training.reservedSpots, training.availableSpots)}%`,
                              transition: { duration: 0.8, type: 'spring' }
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
                          boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
                        }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {training.status}
                      </motion.span>
                    </td>
                    <td className="actions-cell">
                      <motion.button
                        className="edit-btn"
                        onClick={() => handleEditTraining(training)}
                        whileHover={{ 
                          scale: 1.2,
                          backgroundColor: 'rgba(99, 102, 241, 0.1)'
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
                          backgroundColor: 'rgba(245, 158, 11, 0.1)'
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
                          backgroundColor: 'rgba(239, 68, 68, 0.1)'
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
                  <td colSpan="7" className="no-results">
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
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              whileHover={{ scale: 1.1, backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
              whileTap={{ scale: 0.9 }}
            >
              <FiChevronLeft />
            </motion.button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
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
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
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
                      color: 'var(--danger-color)'
                    }}
                    whileTap={{ scale: 0.9 }}
                  >
                    ✕
                  </motion.button>
                </div>
                
                  <form onSubmit={handleSubmit}>
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
                      >
                        <option value="Planifié">Planifié</option>
                        <option value="En Préparation">En Préparation</option>
                        <option value="En Cours">En Cours</option>
                        <option value="Terminé">Terminé</option>
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
                                  setFormData(prev => ({ ...prev, imageUrl: '' }));
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
                                backgroundColor: 'rgba(99, 102, 241, 0.05)'
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
                          backgroundColor: 'var(--gray-200)'
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
                          boxShadow: "0 5px 15px rgba(99, 102, 241, 0.4)"
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