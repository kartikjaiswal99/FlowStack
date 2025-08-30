# FlowStack Architecture Overview

FlowStack is a visual workflow builder that enables users to create and execute AI-powered data processing pipelines through a drag-and-drop interface. The application combines document processing, vector search, and large language models to create intelligent workflows.

## System Architecture

### High-Level Overview

```
┌─────────────────┐    HTTP/REST    ┌──────────────────┐
│                 │ ◄─────────────► │                  │
│   Frontend      │                 │     Backend      │
│   (React +      │                 │   (FastAPI +     │
│   ReactFlow)    │                 │   PostgreSQL)    │
│                 │                 │                  │
└─────────────────┘                 └──────────────────┘
                                              │
                                              │
                                    ┌─────────▼──────────┐
                                    │                    │
                                    │   External APIs    │
                                    │   • Google Gemini  │
                                    │   • ChromaDB       │
                                    │   • SerpAPI        │
                                    │                    │
                                    └────────────────────┘
```

### Technology Stack

#### Frontend
- **React 19**: UI framework
- **ReactFlow**: Visual workflow editor
- **Vite**: Build tool and dev server
- **React Router**: Client-side routing
- **Axios**: HTTP client

#### Backend
- **FastAPI**: Web framework
- **SQLAlchemy**: ORM for database operations
- **PostgreSQL**: Primary database
- **ChromaDB**: Vector database for embeddings
- **Google Gemini**: LLM and embedding model
- **PyMuPDF**: PDF text extraction

## Core Components

### Frontend Architecture

#### 1. Pages
```
src/pages/
├── DashboardPage.jsx    # Stack management and overview
└── BuilderPage.jsx      # Visual workflow builder
```

**DashboardPage**
- Lists all user stacks
- Provides stack creation interface
- Navigation hub for workflow management

**BuilderPage**
- Visual workflow editor using ReactFlow
- Real-time workflow execution via chat interface
- Node configuration and connection management

#### 2. Components

```
src/components/
├── ComponentsPanel.jsx          # Draggable node library
├── ChatModal.jsx               # Workflow execution interface
├── CreateStackModal.jsx        # Stack creation dialog
└── nodes/
    ├── UserQueryNode.jsx       # Input node for user queries
    ├── LlmEngineNode.jsx      # AI text generation node
    ├── KnowledgeBaseNode.jsx  # Document search node
    └── OutputNode.jsx         # Result display node
```

**Node Types and Capabilities:**

1. **UserQueryNode**
   - Entry point for workflows
   - Accepts user input queries
   - Can have default query templates

2. **LlmEngineNode** 
   - Integrates with Google Gemini LLM
   - Configurable prompts, temperature, and model selection
   - Supports web search integration via SerpAPI
   - Processes context from knowledge base nodes

3. **KnowledgeBaseNode**
   - Document upload and processing
   - Vector similarity search using ChromaDB
   - Configurable embedding models
   - Provides context for LLM nodes

4. **OutputNode**
   - Displays final workflow results
   - Terminal node for workflow execution

#### 3. Context Management
```javascript
// WorkflowContext provides state management across nodes
const WorkflowContext = createContext({
  onUpdateNodeData: () => {},
});
```

### Backend Architecture

#### 1. API Layer (main.py)
Core FastAPI application providing REST endpoints:

```python
# Key endpoints:
POST   /stacks/                          # Create new stack
GET    /stacks/                          # List all stacks  
GET    /stacks/{stack_id}/               # Get specific stack
PUT    /stacks/{stack_id}/               # Update stack workflow
POST   /stacks/{stack_id}/upload-document/  # Upload documents
POST   /stacks/{stack_id}/chat/          # Execute workflow
```

#### 2. Workflow Orchestrator (orchestrator.py)
The orchestrator is the core execution engine that processes workflows:

```python
def run_workflow(stack_id: int, workflow: dict, query: str):
    # 1. Parse workflow nodes and edges
    # 2. Find starting UserQuery node
    # 3. Execute nodes sequentially following edges
    # 4. Pass data between connected nodes
    # 5. Return final result
```

**Execution Flow:**
1. Validates workflow structure
2. Identifies start node (UserQuery type)
3. Executes nodes in sequence based on connections
4. Handles data transformation between node types
5. Returns final output from terminal node

#### 3. Document Processing (processing.py)
Handles document ingestion and vector search:

```python
# Key functions:
process_and_embed_document()  # PDF → chunks → embeddings → ChromaDB
search_in_knowledge_base()    # Query → embedding → similarity search
```

**Document Processing Pipeline:**
1. **Text Extraction**: PyMuPDF extracts text from uploaded PDFs
2. **Chunking**: Text split into 1000-character segments
3. **Embedding Generation**: Google Gemini creates vector embeddings
4. **Storage**: ChromaDB stores embeddings with metadata
5. **Search**: Query embeddings enable similarity search

#### 4. LLM Integration (llm_handler.py)
Simple wrapper for Google Gemini API:

```python
def generate_response(prompt: str, api_key: str, model_name: str, temperature: float):
    # Configure Gemini client
    # Generate response with specified parameters
    # Handle errors gracefully
```

#### 5. Data Models

**Database Schema (models.py):**
```python
class Stack(Base):
    id = Column(Integer, primary_key=True)
    name = Column(String)
    description = Column(String)
    workflow = Column(JSON)  # Stores ReactFlow workflow data
    documents = relationship("Document")

class Document(Base):
    id = Column(Integer, primary_key=True)
    filename = Column(String)
    status = Column(String)  # uploaded, processing, processed
    stack_id = Column(Integer, ForeignKey("stacks.id"))
```

#### 6. Validation (validator.py)
Ensures workflow integrity:

```python
def validate_workflow(workflow: dict):
    # 1. Must have exactly one UserQuery start node
    # 2. Must have at least one Output end node  
    # 3. All nodes must be properly connected
    # 4. No orphaned or circular dependencies
```

## Data Flow

### 1. Workflow Creation Flow
```
User creates workflow in UI
         ↓
ReactFlow generates nodes/edges JSON
         ↓
Frontend sends workflow to backend
         ↓
Validator checks workflow structure
         ↓
PostgreSQL stores workflow configuration
```

### 2. Document Upload Flow
```
User uploads PDF in KnowledgeBase node
         ↓
Backend saves file and creates Document record
         ↓
Background task processes document:
  • Extract text with PyMuPDF
  • Split into chunks
  • Generate embeddings with Gemini
  • Store in ChromaDB collection
         ↓
Document status updated to "processed"
```

### 3. Workflow Execution Flow
```
User sends query via chat interface
         ↓
Frontend sends workflow + query to backend
         ↓
Orchestrator executes workflow:
         ↓
UserQuery node: Initialize with user input
         ↓
KnowledgeBase node: Search ChromaDB for relevant context
         ↓
LLM node: Generate response using context + query
         ↓
Output node: Return final result
         ↓
Frontend displays result in chat and output node
```

## Key Interactions

### Frontend ↔ Backend Communication
- **REST API**: All communication via HTTP/JSON
- **Real-time Updates**: Polling for document processing status
- **State Synchronization**: Workflow state persisted on every change

### Backend ↔ External Services
- **Google Gemini**: Text generation and embeddings
- **ChromaDB**: Vector storage and similarity search  
- **SerpAPI**: Web search capabilities (optional)

### Node-to-Node Data Flow
- **Typed Connections**: Each node type expects specific input format
- **Data Transformation**: Orchestrator handles format conversion between nodes
- **Context Passing**: Knowledge base results formatted for LLM consumption

## Security Considerations

### API Key Management
- User-provided API keys stored temporarily in workflow execution
- No persistent storage of sensitive credentials
- Keys configured per-node for granular control

### File Handling
- PDF uploads stored in isolated stack directories
- Background processing prevents blocking operations
- File access restricted to stack ownership

### Data Privacy
- Vector embeddings stored locally in ChromaDB
- No data shared with external services beyond API calls
- Stack isolation prevents cross-contamination

## Scalability Architecture

### Horizontal Scaling Considerations
- **Stateless Backend**: Each request independent
- **Database Connection Pooling**: SQLAlchemy manages connections
- **Background Tasks**: Document processing can be distributed
- **Vector Database**: ChromaDB can be clustered

### Performance Optimizations
- **Chunked Processing**: Large documents processed in segments
- **Embedding Caching**: ChromaDB provides efficient similarity search
- **Connection Reuse**: HTTP clients maintain persistent connections

## Development Workflow

### Local Development Setup
1. **Backend**: FastAPI with auto-reload
2. **Frontend**: Vite dev server with HMR
3. **Database**: Local PostgreSQL instance
4. **Vector DB**: Local ChromaDB persistence

### Build and Deployment
- **Frontend**: Vite builds optimized production bundle
- **Backend**: Python packaging with UV/pip
- **Database**: Migrations handled by SQLAlchemy
- **Environment**: Configuration via environment variables

This architecture provides a flexible, extensible platform for building AI-powered document processing workflows while maintaining clean separation of concerns and robust error handling.