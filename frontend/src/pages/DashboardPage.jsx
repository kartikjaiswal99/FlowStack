import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/axios';
import CreateStackModal from '../components/CreateStackModal';

const DashboardPage = () => {
  const [stacks, setStacks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    apiClient.get('/stacks/')
      .then(response => setStacks(response.data))
      .catch(error => console.error('Error fetching stacks:', error));
  }, []);

  const handleCreateStack = (stackData) => {
    apiClient.post('/stacks/', stackData)
      .then(response => {
        navigate(`/stack/${response.data.id}`);
      })
      .catch(error => console.error('Error creating stack:', error));
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>GenAI Stack</h1>
      </header>
      <main style={styles.mainContent}>
        <div style={styles.subHeader}>
          <h2 style={styles.subHeaderTitle}>My Stacks</h2>
          <button style={styles.newStackButton} onClick={() => setIsModalOpen(true)}>+ New Stack</button>
        </div>
        <div style={styles.stacksContainer}>
          {stacks.map(stack => (
            <div key={stack.id} style={styles.stackCard}>
              <h3 style={styles.cardTitle}>{stack.name}</h3>
              <p style={styles.description}>{stack.description}</p>
              <Link to={`/stack/${stack.id}`} style={styles.editLink}>Edit Stack →</Link>
            </div>
          ))}
        </div>
      </main>
      <CreateStackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateStack}
      />
    </div>
  );
};

const styles = {
    page: { backgroundColor: '#F9FAFB', minHeight: '100vh', fontFamily: 'sans-serif' },
    header: { padding: '16px 32px', backgroundColor: '#FFFFFF', borderBottom: '1px solid #E5E7EB' },
    headerTitle: { fontSize: '1.25rem', fontWeight: '600', margin: 0, color: '#1F2937' },
    mainContent: { padding: '32px' },
    subHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
    subHeaderTitle: { margin: 0, fontSize: '1.5rem', color: '#1F2937' },
    newStackButton: { padding: '10px 15px', backgroundColor: '#6366F1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },

    stacksContainer: {
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr)', 
        gap: '24px'
    },
    stackCard: {
        border: '1px solid #E5E7EB',
        borderRadius: '12px',
        padding: '24px',
        backgroundColor: '#FFFFFF',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column'
    },

    cardTitle: { margin: '0 0 8px 0', color: '#1F2937' },
    description: { color: '#6B7280', flexGrow: 1, marginBottom: '16px', fontSize: '14px' },
    editLink: { textDecoration: 'none', color: '#6366F1', fontWeight: '600', alignSelf: 'flex-end', fontSize: '14px' }
};


export default DashboardPage;