import React from 'react';
import { Handle, Position } from 'reactflow';




const OutputNode = ({ data, selected }) => {
  return (
    <div style={{...styles.node, ...(selected ? styles.selected : {})}}>
      <Handle type="target" position={Position.Left} style={styles.handle} />
      
      <div style={styles.header}>
        <strong>{data.label}</strong>
      </div>
      <p style={styles.description}>Displays the final output.</p>
      <div style={styles.outputContainer}>
        {data.outputText ? data.outputText : <span style={{color: '#9CA3AF'}}>Output will appear here...</span>}
      </div>
    </div>
  );
};

const styles = {
    node: { border: '1px solid #E5E7EB', borderRadius: '8px', padding: '16px', backgroundColor: '#FFFFFF', minWidth: 220, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
    selected: { boxShadow: '0 0 0 2px #6366F1' },
    header: { fontWeight: '600', color: '#1F2937' },
    description: { fontSize: '12px', color: '#6B7280', margin: '4px 0 0 0' },
    outputContainer: {
        marginTop: '12px',
        padding: '8px',
        backgroundColor: '#F9FAFB',
        border: '1px solid #F3F4F6',
        borderRadius: '6px',
        fontSize: '12px',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        maxHeight: '150px',
        overflowY: 'auto'
    },
    handle: { width: 8, height: 8 }
};

export default OutputNode;