import React, { useContext, useEffect, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { WorkflowContext } from '../../context/WorkflowContext';

const UserQueryNode = ({ id, data, selected }) => {
  const { onUpdateNodeData } = useContext(WorkflowContext);
  const [settings, setSettings] = useState(data);

  useEffect(() => { setSettings(data); }, [data]);

  const handleFieldChange = (field, value) => {
    const newSettings = { ...settings, [field]: value };
    setSettings(newSettings);
    onUpdateNodeData(id, { [field]: value });
  };

  return (
    <div style={{...styles.node, ...(selected ? styles.selected : {})}}>
      <div style={styles.header}>
        <strong>{data.label}</strong>
      </div>
      <p style={styles.description}>Entry point for user queries.</p>
      
      {selected && (
        <div style={styles.form}>
          <label style={styles.label}>Default Query</label>
          <textarea
            rows="3"
            value={settings.query || ''}
            onChange={(e) => handleFieldChange('query', e.target.value)}
            placeholder="Write your default query..."
            style={styles.textarea}
          />
        </div>
      )}
      <Handle type="source" position={Position.Right} style={styles.handle} />
    </div>
  );
};

const styles = {
    node: { border: '1px solid #E5E7EB', borderRadius: '8px', padding: '16px', backgroundColor: '#FFFFFF', minWidth: 220, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
    selected: { boxShadow: '0 0 0 2px #6366F1' },
    header: { fontWeight: '600', color: '#1F2937' },
    description: { fontSize: '12px', color: '#6B7280', margin: '4px 0 0 0' },
    form: { marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #F3F4F6' },
    label: { display: 'block', fontWeight: '500', color: '#374151', fontSize: '14px', marginBottom: '4px' },
    textarea: { width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #D1D5DB' },
    handle: { width: 8, height: 8 }
};

export default UserQueryNode;