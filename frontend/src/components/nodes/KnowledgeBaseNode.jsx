import React, { useContext, useEffect, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { WorkflowContext } from '../../context/WorkflowContext';
import apiClient from '../../api/axios';

const KnowledgeBaseNode = ({ id, data, selected }) => {
  const { onUpdateNodeData } = useContext(WorkflowContext);
  const [settings, setSettings] = useState(data);

  useEffect(() => { setSettings(data); }, [data]);

  const handleFieldChange = (field, value) => {
    const newSettings = { ...settings, [field]: value };
    setSettings(newSettings);
    onUpdateNodeData(id, { [field]: value });
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    const { stackId, embeddingModel, embeddingApiKey } = settings;
    const url = `/stacks/${stackId}/upload-document/?embedding_model=${embeddingModel}&api_key=${embeddingApiKey}`;
    apiClient.post(url, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then(() => {
        alert('File uploaded successfully!');
        handleFieldChange('fileName', file.name);
      })
      .catch(() => alert('File upload failed.'));
  };

  return (
    <div style={{...styles.node, ...(selected ? styles.selected : {})}}>
      <Handle type="target" position={Position.Left} style={styles.handle} />
      <div style={styles.header}>
        <strong>{data.label}</strong>
      </div>
      <p style={styles.description}>Searches info in uploaded files.</p>
      {data.fileName && <p style={styles.fileName}>{data.fileName}</p>}
      
      {selected && (
        <div style={styles.form}>
          <div style={styles.formRow}>
            <label style={styles.label}>Embedding Model</label>
            <select style={styles.input} value={settings.embeddingModel || 'models/embedding-001'} onChange={(e) => handleFieldChange('embeddingModel', e.target.value)}>
              <option value="models/embedding-001">google-embedding-001</option>
            </select>
          </div>
          <div style={styles.formRowColumn}>
            <label style={styles.label}>API Key</label>
            <input style={styles.input} type="password" value={settings.embeddingApiKey || ''} onChange={(e) => handleFieldChange('embeddingApiKey', e.target.value)} placeholder="********************" />
          </div>
          <div style={styles.formRowColumn}>
            <label style={styles.label}>Upload File</label>
            <input type="file" onChange={handleFileUpload} />
          </div>
        </div>
      )}
      <Handle type="source" position={Position.Right} style={styles.handle} />
    </div>
  );
};

const styles = {
    node: { border: '1px solid #E5E7EB', borderRadius: '8px', padding: '18px', backgroundColor: '#FFFFFF', minWidth: 220, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
    selected: { boxShadow: '0 0 0 2px #6366F1' },
    header: { fontWeight: '600', color: '#1F2937' },
    description: { fontSize: '12px', color: '#6B7280', margin: '4px 0' },
    fileName: { fontSize: '12px', color: '#6366F1', margin: '8px 0 0 0', fontWeight: '500', wordBreak: 'break-all' },
    form: { marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #F3F4F6' },
    formRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
    formRowColumn: { display: 'flex', flexDirection: 'column', marginBottom: '12px' },
    label: { fontWeight: '500', color: '#374151', fontSize: '14px', marginBottom: '4px' },
    input: { padding: '8px', borderRadius: '6px', border: '1px solid #D1D5DB', width: '100%' },
    handle: { width: 8, height: 8 }
};

export default KnowledgeBaseNode;