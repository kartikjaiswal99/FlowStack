import React, { useContext, useEffect, useState } from 'react';

import { Handle, Position } from 'reactflow';

import { WorkflowContext } from '../../context/WorkflowContext';



const LlmEngineNode = ({ id, data, selected }) => {

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

      <Handle type="target" position={Position.Left} style={styles.handle} />

      <div style={styles.header}>

        <strong>{data.label}</strong>

      </div>

      <p style={styles.description}>Runs a query with an LLM.</p>

      

      {selected && (

        <div style={styles.form}>

          <div style={styles.formRow}>

            <label style={styles.label}>Model</label>

            <select style={styles.inputShort} value={settings.modelName || 'gemini-2.5-flash'} onChange={(e) => handleFieldChange('modelName', e.target.value)}>

              <option value="gemini-2.5-flash">gemini 2.5 flash</option>

            </select>

          </div>

          <div style={styles.formRowColumn}>

            <label style={styles.label}>API Key</label>

            <input style={styles.input} type="password" value={settings.apiKey || ''} onChange={(e) => handleFieldChange('apiKey', e.target.value)} placeholder="********************" />

          </div>

          <div style={styles.formRowColumn}>

            <label style={styles.label}>Prompt</label>

            <textarea

              rows="5"

              value={settings.prompt || ''}

              onChange={(e) => handleFieldChange('prompt', e.target.value)}

              style={styles.textarea}

            />

          </div>

          <div style={styles.formRowColumn}>

            <label style={styles.label}>Temperature: {settings.temperature || 0.75}</label>

            <input

                type="range"

                min="0" max="1" step="0.01"

                value={settings.temperature || 0.75}

                onChange={(e) => handleFieldChange('temperature', parseFloat(e.target.value))}

            />

          </div>

        <div style={styles.formRow}>
            <label style={styles.label}>WebSearch Tool</label>
            <select style={styles.inputShort} value={settings.webSearchTool || 'None'} onChange={(e) => handleFieldChange('webSearchTool', e.target.value)}>
              <option value="None">None</option>
              <option value="SerpAPI">SerpAPI</option>
            </select>
          </div>
          
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

    description: { fontSize: '12px', color: '#6B7280', margin: '4px 0' },

    form: { marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #F3F4F6' },

    formRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },

    formRowColumn: { display: 'flex', flexDirection: 'column', marginBottom: '12px' },

    label: { fontWeight: '500', color: '#374151', fontSize: '14px', marginBottom: '4px' },

    input: { padding: '8px', borderRadius: '6px', border: '1px solid #D1D5DB' },

    inputShort: { padding: '8px', borderRadius: '6px', border: '1px solid #D1D5DB', width: '120px' },

    textarea: { width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #D1D5DB' },

    handle: { width: 8, height: 8 }

};



export default LlmEngineNode;