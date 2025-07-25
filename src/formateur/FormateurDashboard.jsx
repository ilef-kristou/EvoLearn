import React, { useState } from 'react';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import FormateurSidebar from './FormateurSidebar';
import { FiBook, FiCalendar, FiUsers, FiAward, FiTrendingUp, FiClock, FiMapPin, FiUser } from 'react-icons/fi';

const FormateurDashboard = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const statsData = [
    { title: 'Formations actives', value: '4', icon: <FiBook />, color: 'var(--light-blue)' },
    { title: 'Participants total', value: '127', icon: <FiUsers />, color: 'var(--gold)' },
    { title: 'Heures enseignées', value: '156h', icon: <FiClock />, color: 'var(--light-blue)' },
    { title: 'Taux de satisfaction', value: '94%', icon: <FiAward />, color: 'var(--gold)' }
  ];

  const formationsActives = [
    {
      id: 1,
      titre: 'React Avancé',
      participants: 25,
      progression: 0.75,
      prochaineSeance: 'Lundi 09:00-12:00',
      salle: 'A1'
    },
    {
      id: 2,
      titre: 'UX/UI Design',
      participants: 18,
      progression: 0.45,
      prochaineSeance: 'Mercredi 14:00-17:00',
      salle: 'B1'
    },
    {
      id: 3,
      titre: 'JavaScript ES6+',
      participants: 32,
      progression: 0.90,
      prochaineSeance: 'Vendredi 10:00-13:00',
      salle: 'A2'
    }
  ];

  const prochainesSeances = [
    {
      formation: 'React Avancé',
      date: 'Lundi 17 Juin',
      heure: '09:00-12:00',
      salle: 'A1',
      participants: 25
    },
    {
      formation: 'UX/UI Design',
      date: 'Mercredi 19 Juin',
      heure: '14:00-17:00',
      salle: 'B1',
      participants: 18
    },
    {
      formation: 'JavaScript ES6+',
      date: 'Vendredi 21 Juin',
      heure: '10:00-13:00',
      salle: 'A2',
      participants: 32
    }
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(120deg, #f8fafc 0%, #e0e7ff 100%)', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '2.5rem 0', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', width: '100%', maxWidth: '1400px', gap: 32 }}>
          <div style={{ minWidth: isSidebarCollapsed ? 70 : 220, transition: 'min-width 0.3s' }}>
            <FormateurSidebar onToggle={setIsSidebarCollapsed} />
          </div>
          <main style={{ flex: 1, maxWidth: 900, width: '100%' }}>
            
            {/* Header Dashboard */}
            <div style={{ background: 'var(--white)', borderRadius: 22, boxShadow: '0 8px 32px rgba(44,62,80,0.10)', padding: '2.5rem 2.2rem', marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 22, marginBottom: 18 }}>
                <div style={{ background: 'var(--dark-blue)', color: 'var(--white)', borderRadius: 12, width: 54, height: 54, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, boxShadow: '0 2px 8px rgba(44,62,80,0.3)' }}>
                  <FiUser />
                </div>
                <div>
                  <h1 style={{ color: 'var(--dark-blue)', fontWeight: 800, fontSize: '1.7rem', marginBottom: 4, letterSpacing: '-1px' }}>Bonjour Jean Dupont</h1>
                  <p style={{ color: 'var(--light-blue)', fontWeight: 500, fontSize: '1.01rem' }}>Formateur React - Voici votre tableau de bord</p>
                </div>
              </div>
            </div>

            {/* Statistiques */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24, marginBottom: 32 }}>
              {statsData.map((stat, index) => (
                <div key={index} style={{ background: 'var(--white)', borderRadius: 16, padding: '1.5rem', boxShadow: '0 4px 20px rgba(44,62,80,0.08)', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ background: stat.color, color: 'var(--white)', borderRadius: 12, width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                    {stat.icon}
                  </div>
                  <div>
                    <div style={{ color: 'var(--dark-blue)', fontWeight: 700, fontSize: '1.5rem', marginBottom: 4 }}>{stat.value}</div>
                    <div style={{ color: 'var(--dark-blue)', fontSize: '0.9rem', opacity: 0.7 }}>{stat.title}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Formations Actives */}
            <div style={{ background: 'var(--white)', borderRadius: 22, boxShadow: '0 8px 32px rgba(44,62,80,0.10)', padding: '2.5rem 2.2rem', marginBottom: 32 }}>
              <h2 style={{ color: 'var(--dark-blue)', fontWeight: 700, fontSize: '1.4rem', marginBottom: 24 }}>Mes Formations Actives</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {formationsActives.map((formation) => (
                  <div key={formation.id} style={{ background: 'var(--light-gray)', borderRadius: 12, padding: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: 'var(--dark-blue)', fontSize: '1.1rem', marginBottom: 8 }}>{formation.titre}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
                        <span style={{ color: 'var(--light-blue)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <FiUsers size={16} />
                          {formation.participants} participants
                        </span>
                        <span style={{ color: 'var(--gold)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <FiMapPin size={16} />
                          {formation.salle}
                        </span>
                      </div>
                      <div style={{ background: 'var(--light-gray)', borderRadius: 8, height: 8, width: '100%', overflow: 'hidden' }}>
                        <div style={{ width: `${formation.progression * 100}%`, background: 'linear-gradient(90deg, var(--light-blue) 0%, var(--gold) 100%)', height: '100%', borderRadius: 8 }}></div>
                      </div>
                      <div style={{ color: 'var(--dark-blue)', fontSize: '0.8rem', marginTop: 4 }}>{Math.round(formation.progression * 100)}% complété</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: 'var(--light-blue)', fontWeight: 600, fontSize: '0.9rem' }}>Prochaine séance</div>
                      <div style={{ color: 'var(--dark-blue)', fontSize: '0.8rem' }}>{formation.prochaineSeance}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Prochaines Séances */}
            <div style={{ background: 'var(--white)', borderRadius: 22, boxShadow: '0 8px 32px rgba(44,62,80,0.10)', padding: '2.5rem 2.2rem' }}>
              <h2 style={{ color: 'var(--dark-blue)', fontWeight: 700, fontSize: '1.4rem', marginBottom: 24 }}>Prochaines Séances</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {prochainesSeances.map((seance, index) => (
                  <div key={index} style={{ background: 'var(--light-gray)', borderRadius: 12, padding: '1.2rem', display: 'flex', alignItems: 'center', gap: 16 }}>
                    <FiCalendar style={{ color: 'var(--light-blue)', fontSize: 20 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: 'var(--dark-blue)', fontSize: '1rem', marginBottom: 4 }}>{seance.formation}</div>
                      <div style={{ color: 'var(--dark-blue)', fontSize: '0.9rem' }}>{seance.date} • {seance.heure}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: 'var(--gold)', fontWeight: 600, fontSize: '0.9rem' }}>{seance.salle}</div>
                      <div style={{ color: 'var(--dark-blue)', fontSize: '0.8rem' }}>{seance.participants} participants</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FormateurDashboard; 