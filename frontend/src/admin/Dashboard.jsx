// Dashboard.jsx - Version avec icônes corrigées
import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import './Dashboard.css';
import AdminSidebar from './AdminSidebar';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [participants, setParticipants] = useState([]);
  const [formateurs, setFormateurs] = useState([]);
  const [formations, setFormations] = useState([]);
  const [stats, setStats] = useState({
    participants: 0,
    formateurs: 0,
    formations: 0,
    reservations: 0,
    demandes_en_attente: 0,
    formations_en_cours: 0
  });
  const [registrationData, setRegistrationData] = useState([]);
  const [formationStatusData, setFormationStatusData] = useState([]);
  const [demandeStatusData, setDemandeStatusData] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const COLORS = ['var(--dark-blue)', 'var(--gold)', 'red', '#f72585'];
  const DEMANDE_COLORS = ['var(--gold)', 'green', 'red'];

  // Définir l'URL de base de l'API
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  // Fonction pour faire les requêtes API
  const fetchApi = async (endpoint) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      
      // Vérifier le type de contenu
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Réponse non-JSON reçue:', text.substring(0, 200));
        throw new Error('Le serveur a renvoyé une réponse non-JSON. Vérifiez l\'URL de l\'API.');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur fetchApi:', error);
      throw error;
    }
  };

  // Chargement des données
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Test de connexion à l'API
        try {
          const healthCheck = await fetch(`${API_BASE_URL}/api/health`);
          if (!healthCheck.ok) {
            throw new Error(`API non accessible: ${healthCheck.status}`);
          }
        } catch (healthError) {
          throw new Error(`Impossible de se connecter à l'API à l'adresse: ${API_BASE_URL}. Vérifiez que le serveur Laravel est démarré (php artisan serve).`);
        }
        
        if (activeTab === 'dashboard') {
          const result = await fetchApi('/api/dashboard/all-data');
          
          if (result.success) {
            setStats(result.data.stats);
            setRegistrationData(result.data.registrationData);
            setFormationStatusData(result.data.formationStatusData);
            setDemandeStatusData(result.data.demandeStatusData || []);
            setRecentActivities(result.data.recentActivities);
            setUpcomingEvents(result.data.upcomingEvents);
          } else {
            setError(result.message || 'Erreur lors du chargement des données');
          }
        } else if (activeTab === 'participants') {
          const result = await fetchApi('/api/admin/participants');
          if (result.success) {
            setParticipants(result.data);
          }
        } else if (activeTab === 'formateurs') {
          const result = await fetchApi('/api/admin/formateurs');
          setFormateurs(result);
        } else if (activeTab === 'formations') {
          const result = await fetchApi('/api/admin/formations');
          setFormations(result);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab, API_BASE_URL]);

  // Fonction pour formater le statut
  const formatStatus = (status) => {
    const statusMap = {
      'planifie': 'Planifié',
      'en_preparation': 'En Préparation',
      'en_cours': 'En Cours',
      'termine': 'Terminé',
      'En attente': 'En attente',
      'Acceptée': 'Acceptée',
      'Refusée': 'Refusée'
    };
    return statusMap[status] || status;
  };

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Rendu conditionnel en fonction de l'onglet actif
  const renderContent = () => {
    if (loading) {
      return (
        <div className="loading">
          <i className="fas fa-spinner fa-spin"></i>
          Chargement des données...
        </div>
      );
    }

    if (error) {
      return (
        <div className="error-container">
          <div className="error-message">
            <i className="fas fa-exclamation-triangle"></i>
            <h3>Erreur de chargement</h3>
            <p>{error}</p>
            <div className="debug-info">
              <p>URL de l'API: {API_BASE_URL}</p>
              <p>Vérifiez que:</p>
              <ul>
                <li>Le serveur Laravel est démarré (php artisan serve)</li>
                <li>Le serveur écoute sur le port 8000</li>
                <li>L'URL de l'API est correcte</li>
              </ul>
            </div>
            <button 
              className="btn btn-primary" 
              onClick={() => window.location.reload()}
            >
              <i className="fas fa-sync-alt"></i> Réessayer
            </button>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'participants':
        return (
          <div className="content-section">
            <h2><i className="fas fa-users"></i> Gestion des Participants ({participants.length})</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Prénom</th>
                    <th>Email</th>
                    <th>Téléphone</th>
                    <th>Date d'inscription</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map(participant => (
                    <tr key={participant.id}>
                      <td>{participant.nom}</td>
                      <td>{participant.prenom}</td>
                      <td>{participant.email}</td>
                      <td>{participant.telephone}</td>
                      <td>{formatDate(participant.created_at)}</td>
                      <td>
                        <button className="btn btn-sm btn-primary">
                          <i className="fas fa-edit"></i> Modifier
                        </button>
                        <button className="btn btn-sm btn-danger">
                          <i className="fas fa-trash"></i> Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      
      case 'formateurs':
        return (
          <div className="content-section">
            <h2><i className="fas fa-chalkboard-teacher"></i> Gestion des Formateurs ({formateurs.length})</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Prénom</th>
                    <th>Email</th>
                    <th>Spécialité</th>
                    <th>Téléphone</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {formateurs.map(formateur => (
                    <tr key={formateur.id}>
                      <td>{formateur.nom}</td>
                      <td>{formateur.prenom}</td>
                      <td>{formateur.email}</td>
                      <td>{formateur.specialite}</td>
                      <td>{formateur.telephone}</td>
                      <td>
                        <button className="btn btn-sm btn-primary">
                          <i className="fas fa-edit"></i> Modifier
                        </button>
                        <button className="btn btn-sm btn-danger">
                          <i className="fas fa-trash"></i> Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      
      case 'formations':
        return (
          <div className="content-section">
            <h2><i className="fas fa-book"></i> Gestion des Formations ({formations.length})</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Titre</th>
                    <th>Description</th>
                    <th>Date début</th>
                    <th>Date fin</th>
                    <th>Places</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {formations.map(formation => (
                    <tr key={formation.id}>
                      <td>{formation.titre}</td>
                      <td>{formation.description}</td>
                      <td>{formatDate(formation.date_debut)}</td>
                      <td>{formatDate(formation.date_fin)}</td>
                      <td>{formation.places_reservees}/{formation.places_disponibles}</td>
                      <td>
                        <span className={`status status-${formation.statut}`}>
                          {formatStatus(formation.statut)}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-primary">
                          <i className="fas fa-edit"></i> Modifier
                        </button>
                        <button className="btn btn-sm btn-danger">
                          <i className="fas fa-trash"></i> Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      
      default:
        return (
          <>
            {/* Cartes de statistiques */}
            <div className="stats-cards">
              <div className="card stat-card">
                <div className="stat-icon" style={{backgroundColor: 'rgba(67, 97, 238, 0.2)', color: '#4361ee'}}>
                  <i className="fas fa-users"></i>
                </div>
                <div className="stat-content">
                  <h3>{stats.participants}</h3>
                  <p>Participants</p>
                </div>
              </div>
              
              <div className="card stat-card">
                <div className="stat-icon" style={{backgroundColor: 'rgba(247, 37, 133, 0.2)', color: '#f72585'}}>
                  <i className="fas fa-chalkboard-teacher"></i>
                </div>
                <div className="stat-content">
                  <h3>{stats.formateurs}</h3>
                  <p>Formateurs</p>
                </div>
              </div>
              
              <div className="card stat-card">
                <div className="stat-icon" style={{backgroundColor: 'rgba(96, 11, 101, 0.2)', color: '#4cc9f0'}}>
                  <i className="fas fa-book"></i>
                </div>
                <div className="stat-content">
                  <h3>{stats.formations}</h3>
                  <p>Formations</p>
                </div>
              </div>
              
              <div className="card stat-card">
                <div className="stat-icon" style={{backgroundColor: 'rgba(58, 12, 163, 0.2)', color: '#3a0ca3'}}>
                  <i className="fas fa-clipboard-list"></i>
                </div>
                <div className="stat-content">
                  <h3>{stats.demandes_en_attente}</h3>
                  <p>Demandes en attente</p>
                </div>
              </div>
            </div>

            {/* Graphiques */}
            <div className="charts-container">
              <div className="chart-card">
                <div className="chart-header">
                  <div className="chart-title">
                    <i className="fas fa-chart-bar"></i> Inscriptions par mois
                  </div>
                  <select>
                    <option>2023</option>
                    <option>2024</option>
                  </select>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={registrationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="inscriptions" fill="var(--gold)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="chart-card">
                <div className="chart-header">
                  <div className="chart-title">
                    <i className="fas fa-chart-pie"></i> Statut des formations
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={formationStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {formationStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Graphique pour les statuts des demandes */}
            <div className="charts-container">
              <div className="chart-card">
                <div className="chart-header">
                  <div className="chart-title">
                    <i className="fas fa-chart-pie"></i> Statut des demandes d'inscription
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={demandeStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {demandeStatusData.map((entry, index) => (
                        <Cell key={`cell-demand-${index}`} fill={DEMANDE_COLORS[index % DEMANDE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="chart-card">
                <div className="chart-header">
                  <div className="chart-title">
                    <i className="fas fa-list-alt"></i> Répartition des demandes
                  </div>
                </div>
                <div className="stats-summary">
                  {demandeStatusData.length > 0 ? (
                    <>
                      <p><i className="fas fa-clipboard-check"></i> Total des demandes: {demandeStatusData.reduce((acc, item) => acc + item.value, 0)}</p>
                      <div className="status-breakdown">
                        {demandeStatusData.map((item, index) => (
                          <div key={index} className="status-item">
                            <span 
                              className="color-indicator" 
                              style={{backgroundColor: DEMANDE_COLORS[index % DEMANDE_COLORS.length]}}
                            ></span>
                            <span className="status-name">
                              {item.name === 'En attente' && <i className="fas fa-clock"></i>}
                              {item.name === 'Acceptée' && <i className="fas fa-check-circle"></i>}
                              {item.name === 'Refusée' && <i className="fas fa-times-circle"></i>}
                              {item.name}:
                            </span>
                            <span className="status-count">{item.value}</span>
                            <span className="status-percentage">
                              ({((item.value / demandeStatusData.reduce((acc, i) => acc + i.value, 0)) * 100).toFixed(1)}%)
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p><i className="fas fa-info-circle"></i> Aucune donnée de demande disponible</p>
                  )}
                </div>
              </div>
            </div>

            {/* Activités récentes */}
            <div className="table-card">
              <div className="table-header">
                <div className="chart-title">
                  <i className="fas fa-history"></i> Activités récentes
                </div>
                <button className="btn btn-primary btn-sm">
                  <i className="fas fa-eye"></i> Voir tout
                </button>
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Utilisateur</th>
                      <th>Action</th>
                      <th>Date</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentActivities.map((activity, index) => (
                      <tr key={index}>
                        <td>
                          <i className="fas fa-user"></i> {activity.user}
                        </td>
                        <td>{activity.action}</td>
                        <td>
                          <i className="fas fa-calendar-alt"></i> {activity.date}
                        </td>
                        <td>
                          <span className={`status status-${activity.status.toLowerCase().replace(' ', '_')}`}>
                            {formatStatus(activity.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Événements à venir */}
            <div className="table-card">
              <div className="table-header">
                <div className="chart-title">
                  <i className="fas fa-calendar-day"></i> Événements à venir
                </div>
                <button className="btn btn-primary btn-sm">
                  <i className="fas fa-calendar"></i> Voir calendrier
                </button>
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Formation</th>
                      <th>Date début</th>
                      <th>Date fin</th>
                      <th>Places disponibles</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingEvents.map(event => (
                      <tr key={event.id}>
                        <td>
                          <i className="fas fa-graduation-cap"></i> {event.titre}
                        </td>
                        <td>
                          <i className="fas fa-play-circle"></i> {formatDate(event.date_debut)}
                        </td>
                        <td>
                          <i className="fas fa-stop-circle"></i> {formatDate(event.date_fin)}
                        </td>
                        <td>
                          <i className="fas fa-chair"></i> {event.places_disponibles}
                        </td>
                        <td>
                          <span className={`status status-${event.statut}`}>
                            {formatStatus(event.statut)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="dashboard-container">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="main-content">
        <div className="header">
          
         
        </div>

        {renderContent()}
      </div>
    </div>
  );
};

export default Dashboard;