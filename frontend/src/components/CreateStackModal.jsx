import React, { useState } from 'react';

const CreateStackModal = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit({ name, description });
    setName('');
    setDescription('');
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <div style={styles.header}>
          <h2 style={styles.title}>Create New Stack</h2>
          <button onClick={onClose} style={styles.closeButton}>×</button>
        </div>
        <div style={styles.form}>
          <label htmlFor="stack-name" style={styles.label}>Name</label>
          <input
            id="stack-name"
            type="text"
            placeholder="My Awesome Stack"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={styles.input}
          />
          <label htmlFor="stack-description" style={styles.label}>Description</label>
          <textarea
            id="stack-description"
            placeholder="A short description of what this stack does."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={styles.textarea}
          />
        </div>
        <div style={styles.footer}>
          <button onClick={onClose} style={styles.cancelButton}>Cancel</button>
          <button onClick={handleSubmit} style={styles.createButton}>Create</button>
        </div>
      </div>
    </div>
  );
};

const styles = {
    modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { width: '500px', backgroundColor: 'white', borderRadius: '12px', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' },
    header: { padding: '16px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    title: { margin: 0, color: '#1F2937', fontSize: '1.25rem' },
    closeButton: { background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#9CA3AF' },
    form: { padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' },
    label: { fontWeight: '500', color: '#374151', fontSize: '14px' },
    input: { padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB' },
    textarea: { padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB', minHeight: '80px', fontFamily: 'inherit' },
    footer: { padding: '16px 24px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'flex-end', gap: '12px' },
    cancelButton: { padding: '10px 20px', borderRadius: '8px', border: '1px solid #D1D5DB', backgroundColor: '#fff', cursor: 'pointer', fontWeight: '500' },
    createButton: { padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#6366F1', color: 'white', cursor: 'pointer', fontWeight: '500' }
};

export default CreateStackModal;