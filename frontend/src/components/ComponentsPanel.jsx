import React from 'react';

const DraggableNode = ({ nodeType, label }) => {
  const onDragStart = (event) => {
    // We store the node type in the drag event's dataTransfer object
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div style={styles.node} draggable onDragStart={onDragStart}>
      {label}
    </div>
  );
};

const ComponentsPanel = () => {
  return (
    <aside style={styles.panel}>
      <h2>Components</h2>
      <p style={{fontSize: '12px', color: '#777'}}>Drag these to the canvas:</p>
      <DraggableNode nodeType="userQuery" label="User Query" />
      <DraggableNode nodeType="llmEngine" label="LLM Engine" />
      <DraggableNode nodeType="knowledgeBase" label="Knowledge Base" />
      <DraggableNode nodeType="output" label="Output" />
    </aside>
  );
};

// Basic styling
const styles = {
  panel: { width: '250px', padding: '10px', borderRight: '1px solid #ccc', backgroundColor: '#f7f7f7' },
  node: {
    border: '1px solid #000',
    padding: '10px',
    marginBottom: '10px',
    borderRadius: '5px',
    backgroundColor: '#fff',
    cursor: 'grab'
  }
};

export default ComponentsPanel;