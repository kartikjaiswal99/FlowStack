import React, { useState, useEffect } from 'react';
import apiClient from '../api/axios';

const ConfigurationPanel = ({ selectedNode, onUpdateNodeData }) => {
  // Use a single state object to hold all form field values
  const [settings, setSettings] = useState({});

  // When a new node is selected, update the local state to match its data
  useEffect(() => {
    if (selectedNode) {
      // Set default values if they don't exist
      const defaults = {
        prompt: `You are a helpful assistant. Answer the user's query based on your knowledge. If context from a document is provided below, use it to inform your answer. If the context is not relevant to the query, ignore it and answer directly.\n\nCONTEXT:\n{context}\n\nUSER QUERY:\n{query}`,
        modelName: 'gemini-2.5-flash',
        embeddingModel: 'models/embedding-001',
        temperature: 0.75
      };
      setSettings({ ...defaults, ...selectedNode.data });
    }else {
      setSettings({});
    }
  }, [selectedNode]);

  // Generic handler to update a field in the node's data
  const handleFieldChange = (field, value) => {
    const newSettings = { ...settings, [field]: value };
    setSettings(newSettings);
    onUpdateNodeData(selectedNode.id, { [field]: value });
  };
  
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file || !selectedNode) return;

    const formData = new FormData();
    formData.append('file', file);
    
    const stackId = selectedNode.data.stackId;
    const embeddingModel = settings.embeddingModel;
    const apiKey = settings.embeddingApiKey;

    const url = `/stacks/${stackId}/upload-document/?embedding_model=${embeddingModel}&api_key=${apiKey}`;

    
    apiClient.post(url, formData, { // <-- Use the new URL
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then(response => {
      alert('File uploaded successfully!');
      handleFieldChange('fileName', file.name);
    })
    .catch(error => {
        console.error('Error uploading file:', error)
        alert('File upload failed.');
    });
  };

  const renderSettings = () => {
    if (!selectedNode || !selectedNode.type) {
      return <p>Select a node to configure.</p>;
    }


    switch (selectedNode.type) {
      case 'userQuery':
        return (
          <div>
            <h3>User Query</h3>
            <label>Query</label>
            <textarea
              rows="4"
              value={settings.query || ''}
              onChange={(e) => handleFieldChange('query', e.target.value)}
              placeholder="Write your query here"
              style={{ width: '100%' }}
            />
          </div>
        );

      case 'knowledgeBase':
        return (
          <div>
            <h3>Knowledge Base</h3>
            <label>Embedding Model</label>
            <select value={settings.embeddingModel} onChange={(e) => handleFieldChange('embeddingModel', e.target.value)}>
              <option value="models/embedding-001">google-embedding-001</option>
              {/* Add other models as needed */}
            </select>

            <label>API Key</label>
            <input type="password" value={settings.embeddingApiKey || ''} onChange={(e) => handleFieldChange('embeddingApiKey', e.target.value)} placeholder="********************" />

            <label style={{display: 'block', marginTop: '10px'}}>File for Knowledge Base</label>
            <input type="file" onChange={handleFileUpload} />
            {settings.fileName && <p style={{color: 'green', fontSize: '12px'}}>Uploaded: {settings.fileName}</p>}
          </div>
        );

      case 'llmEngine':
        return (
          <div>
            <h3>LLM Engine</h3>
            <label>Model</label>
            <select value={settings.modelName} onChange={(e) => handleFieldChange('modelName', e.target.value)}>
              <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
            </select>

            <label>API Key</label>
            <input type="password" value={settings.apiKey || ''} onChange={(e) => handleFieldChange('apiKey', e.target.value)} placeholder="********************" />

            <label>Prompt</label>
            <textarea
              rows="8"
              value={settings.prompt}
              onChange={(e) => handleFieldChange('prompt', e.target.value)}
              style={{ width: '100%' }}
            />

            <label>Temperature: {settings.temperature}</label>
            <input
                type="range"
                min="0" max="1" step="0.01"
                value={settings.temperature}
                onChange={(e) => handleFieldChange('temperature', parseFloat(e.target.value))}
            />
          </div>
        );
      
      case 'output':
          return (
              <div>
                  <h3>Output</h3>
                  <p>This node will display the final text result after the workflow is run.</p>
              </div>
          );

      default:
        return <p>No configuration for this node type.</p>;
    }
  };

  return (
    <aside style={styles.panel}>
      <h2>Configuration</h2>
      <hr />
      {renderSettings()}
    </aside>
  );
};

const styles = {
  panel: { width: '300px', padding: '10px', borderLeft: '1px solid #ccc', backgroundColor: '#f7f7f7' },
};

export default ConfigurationPanel;