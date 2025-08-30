import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  MiniMap,
  Controls,
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Link, useParams } from 'react-router-dom';

import ComponentsPanel from '../components/ComponentsPanel';
import UserQueryNode from '../components/nodes/UserQueryNode';
import LlmEngineNode from '../components/nodes/LlmEngineNode';
import KnowledgeBaseNode from '../components/nodes/KnowledgeBaseNode';
import OutputNode from '../components/nodes/OutputNode';
import ChatModal from '../components/ChatModal';
import apiClient from '../api/axios';
import { WorkflowContext } from '../context/WorkflowContext';

const nodeTypes = {
  userQuery: UserQueryNode,
  llmEngine: LlmEngineNode,
  knowledgeBase: KnowledgeBaseNode,
  output: OutputNode,
};

const getUniqueId = (type = 'dnd-node') => `${type}_${+new Date()}`;

const BuilderPage = () => {
  const { id: stackId } = useParams();
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [initialChatMessage, setInitialChatMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    apiClient.get(`/stacks/${stackId}/`)
      .then(response => {
        const savedWorkflow = response.data.workflow;
        if (savedWorkflow && savedWorkflow.nodes && savedWorkflow.nodes.length > 0) {
          setNodes(savedWorkflow.nodes);
          setEdges(savedWorkflow.edges || []);
        }
      })
      .catch(error => console.error("Error fetching saved stack:", error));
  }, [stackId, setNodes, setEdges]);

  const handleBuildStack = () => {
    const workflowData = { nodes, edges };
    apiClient.put(`/stacks/${stackId}/`, { workflow: workflowData })
      .then(response => {
        alert('Stack built successfully!');
      })
      .catch(error => {
        console.error('Error building stack:', error);
        alert('Failed to build stack.');
      });
  };

  const handleSendMessage = (query) => {
    const workflow = { nodes, edges };
    setConversation(prev => [...prev, { sender: 'user', text: query }]);
    setIsLoading(true);
    apiClient.post(`/stacks/${stackId}/chat/`, { workflow, query })
      .then(response => {
        const aiResponse = response.data.response;
        setConversation(prev => [...prev, { sender: 'ai', text: aiResponse }]);
        const outputNodeId = nodes.find(node => node.type === 'output')?.id;
        if (outputNodeId) {
          onUpdateNodeData(outputNodeId, { outputText: aiResponse });
        }
      })
      .catch(error => {
        console.error("Error sending message:", error);
        setConversation(prev => [...prev, { sender: 'ai', text: "Sorry, an error occurred." }]);
      })
      .finally(() => {
        setIsLoading(false); 
      });
  };

  const handleOpenChat = () => {
    const userQueryNode = nodes.find(node => node.type === 'userQuery');
    const defaultQuery = userQueryNode?.data?.query || '';
    setInitialChatMessage(defaultQuery);
    setIsChatOpen(true);
  };

  const onUpdateNodeData = useCallback((nodeId, newData) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data: { ...node.data, ...newData } };
        }
        return node;
      })
    );
  }, [setNodes]);

  const onConnect = useCallback(
    (params) => {
      if (params.source === params.target) {
        return;
      }
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges]
  );

  
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/reactflow');
    if (typeof type === 'undefined' || !type) return;

    const position = reactFlowInstance.screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    const defaultData = {
      label: `${type.charAt(0).toUpperCase() + type.slice(1)} Node`,
      stackId: stackId,
    };

    if (type === 'llmEngine') {
      // defaultData.prompt = `You are a helpful assistant. Answer the user's query based on your knowledge. If context from a document is provided below, use it to inform your answer. If the context is not relevant to the query, ignore it and answer directly.\n\nCONTEXT:\n{context}\n\nUSER QUERY:\n{query}`;
      defaultData.prompt = `You are a helpful assistant. Your task is to provide a direct answer to the user's query.

Use the following tools and context to construct your answer.

If context from a PDF document is provided, prioritize it.

If context from a web search is provided, use it for recent information or if the PDF context is insufficient.

If no context is provided, or the context is not relevant, answer using your general knowledge.

Do not explain your own reasoning. Provide only the direct answer.

PDF CONTEXT:
{context}

WEB SEARCH RESULTS:
{web_context}

USER QUERY:
{query}`;
      defaultData.temperature = 0.75;
      defaultData.modelName = 'gemini-2.5-flash';
    }

    const newNode = {
      id: getUniqueId(),
      type,
      position,
      data: defaultData,
    };
    setNodes((nds) => nds.concat(newNode));
  }, [reactFlowInstance, setNodes, stackId]);

  return (
    <>
      <header style={styles.header}>
        {/* This title is now a clickable link to the dashboard */}
        <Link to="/" style={styles.headerLink}>
          <h1 style={styles.headerTitle}>GenAI Stack</h1>
        </Link>
      </header>

      <WorkflowContext.Provider value={{ onUpdateNodeData }}>
        <div style={styles.builderLayout}>
          <ReactFlowProvider>
            <ComponentsPanel />
            <main style={styles.workspace} ref={reactFlowWrapper}>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onInit={setReactFlowInstance}
                onDrop={onDrop}
                onDragOver={onDragOver}
                nodeTypes={nodeTypes}
                fitView
              >
                <Controls />
                <MiniMap />
                <Background variant="dots" gap={12} size={1} />
              </ReactFlow>
            </main>
          </ReactFlowProvider>

          <div style={styles.bottomBar}>
            <button onClick={handleBuildStack} style={styles.buildButton}>
              Build Stack
            </button>
            <button onClick={handleOpenChat} style={styles.chatButton}>
              Chat with AI
            </button>
          </div>

          <ChatModal
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            onSendMessage={handleSendMessage}
            conversation={conversation}
            initialMessage={initialChatMessage}
            isLoading={isLoading} 
          />
        </div>
      </WorkflowContext.Provider>
    </>
  );
};

const styles = {
  header: {
    padding: '16px 32px',
    backgroundColor: '#FFFFFF',
    borderBottom: '1px solid #E5E7EB',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLink: { color: 'inherit', textDecoration: 'none' },
  headerTitle: { fontSize: '1.25rem', fontWeight: '600', margin: 0, color: '#1F2937' },
  builderLayout: { 
    display: 'flex', 
    height: 'calc(100vh - 65px)',
    width: '100vw' ,
    backgroundColor: '#F9FAFB'
  },
  workspace: { flex: 1, height: '100%' },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: '250px',
    right: 0,
    padding: '12px 24px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderTop: '1px solid #E5E7EB',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px'
  },
  buildButton: {
    padding: '10px 20px',
    backgroundColor: '#10B981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500'
  },
  chatButton: {
    padding: '10px 20px',
    backgroundColor: '#6366F1',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500'
  }
};


export default BuilderPage;