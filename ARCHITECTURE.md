# FlowStack Architecture Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [High-Level Architecture](#high-level-architecture)
3. [Component Architecture](#component-architecture)
4. [Data Flow](#data-flow)
5. [Technology Stack](#technology-stack)

## System Overview

FlowStack is a visual workflow builder for GenAI (Generative AI) applications that enables users to create, configure, and execute AI-powered workflows through a drag-and-drop interface. The platform combines document processing, knowledge retrieval, LLM integration, and web search capabilities into customizable workflows.

### Key Features
- **Visual Workflow Builder**: Drag-and-drop interface for creating AI workflows
- **Document Processing**: PDF upload and processing with embedding generation
- **Knowledge Base Integration**: Vector-based document retrieval using ChromaDB
- **LLM Integration**: Support for Google Gemini models with configurable parameters
- **Web Search**: Integration with SerpAPI for real-time web search
- **Real-time Testing**: Chat interface for testing workflows during development
- **Workflow Orchestration**: Automated execution of complex AI workflows

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FlowStack System                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐    HTTP/REST API    ┌─────────────────┐    │
│  │                 │ ←──────────────────→ │                 │    │
│  │   Frontend      │                      │    Backend      │    │
│  │  (React SPA)    │                      │   (FastAPI)     │    │
│  │                 │                      │                 │    │
│  └─────────────────┘                      └─────────────────┘    │
│           │                                         │             │
│           │                                         │             │
│           │                              ┌─────────┴─────────┐    │
│           │                              │                   │    │
│           │                              ▼                   ▼    │
│           │                    ┌─────────────────┐ ┌─────────────────┐
│           │                    │   PostgreSQL    │ │    ChromaDB     │
│           │                    │   (Metadata)    │ │  (Embeddings)   │
│           │                    └─────────────────┘ └─────────────────┘
│           │                                                         │
│           │                              │                          │
│           │                              ▼                          │
│           │                    ┌─────────────────┐                  │
│           │                    │  External APIs  │                  │
│           │                    │                 │                  │
│           │                    │ • Google Gemini │                  │
│           │                    │ • SerpAPI       │                  │
│           │                    └─────────────────┘                  │
│           │                                                         │
│           │                              │                          │
│           │                              ▼                          │
│           │                    ┌─────────────────┐                  │
│           │                    │  File Storage   │                  │
│           │                    │  (Documents)    │                  │
│           │                    └─────────────────┘                  │
│                                                                     │
└─────────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Frontend Components (React + ReactFlow)

```
Frontend Architecture
├── App.jsx                          # Main application router
├── pages/
│   ├── DashboardPage.jsx           # Stack management interface
│   └── BuilderPage.jsx             # Visual workflow builder
├── components/
│   ├── ComponentsPanel.jsx         # Draggable node palette
│   ├── CreateStackModal.jsx        # Stack creation dialog
│   ├── ChatModal.jsx               # Workflow testing interface
│   └── nodes/                      # Workflow node components
│       ├── UserQueryNode.jsx       # Entry point node
│       ├── LlmEngineNode.jsx       # LLM processing node
│       ├── KnowledgeBaseNode.jsx   # Document retrieval node
│       └── OutputNode.jsx          # Result display node
├── context/
│   └── WorkflowContext.js          # Shared workflow state
└── api/
    └── axios.js                    # HTTP client configuration
```

### Backend Components (FastAPI + Python)

```
Backend Architecture
├── main.py                         # FastAPI application entry point
├── models.py                       # SQLAlchemy database models
├── schemas.py                      # Pydantic data validation schemas
├── crud.py                         # Database CRUD operations
├── database.py                     # Database configuration
├── orchestrator.py                 # Workflow execution engine
├── processing.py                   # Document processing & embeddings
├── llm_handler.py                  # LLM API integration
├── web_search.py                   # Web search functionality
└── validator.py                    # Workflow validation logic
```

## Data Flow

### 1. Stack Creation and Management
```
User → DashboardPage → API Request → Backend → Database → Response → UI Update
```

### 2. Workflow Building
```
User Action → BuilderPage → ReactFlow → Node Update → Context → State Management
```

### 3. Document Upload and Processing
```
File Upload → Backend Endpoint → File Storage → PDF Processing → 
Text Extraction → Chunking → Embedding Generation → ChromaDB Storage
```

### 4. Workflow Execution
```
Chat Query → BuilderPage → API Request → Orchestrator → 
Node Execution Chain → External APIs → Result → UI Update
```

### Detailed Workflow Execution Flow
1. **User Query Node**: Accepts user input
2. **Knowledge Base Node**: Retrieves relevant context from documents
3. **LLM Engine Node**: Processes query with context using Gemini API
4. **Web Search Node** (optional): Fetches real-time information
5. **Output Node**: Displays final results

## Technology Stack

### Frontend Technologies
- **React 19.1.1**: Component-based UI framework
- **ReactFlow 11.11.4**: Visual workflow builder library
- **React Router DOM 7.8.2**: Client-side routing
- **Axios 1.11.0**: HTTP client for API communication
- **Vite 7.1.2**: Build tool and development server
- **React Icons 5.5.0**: Icon components
- **React Markdown 10.1.0**: Markdown rendering

### Backend Technologies
- **FastAPI**: Modern Python web framework
- **SQLAlchemy**: ORM for database operations
- **PostgreSQL**: Primary database for metadata
- **ChromaDB**: Vector database for embeddings
- **Uvicorn**: ASGI server
- **Pydantic**: Data validation and serialization

### External Services
- **Google Gemini API**: Language model and embedding generation
- **SerpAPI**: Web search functionality
- **PyMuPDF**: PDF text extraction

### Development Tools
- **ESLint**: JavaScript linting
- **UV**: Python package management
- **Git**: Version control

## Security Considerations

### API Security
- CORS configuration for cross-origin requests
- API key management for external services
- Input validation using Pydantic schemas

### Data Security
- Environment variable configuration for sensitive data
- Secure file upload handling
- Database connection security

## Scalability Considerations

### Frontend Scalability
- Component-based architecture for maintainability
- Context-based state management
- Lazy loading and code splitting potential

### Backend Scalability
- Stateless API design
- Database connection pooling
- Asynchronous processing capabilities
- Microservice-ready architecture

## Deployment Architecture

### Development Environment
- Frontend: Vite development server (port 5173)
- Backend: Uvicorn development server (port 8000)
- Database: Local PostgreSQL instance
- Vector DB: Local ChromaDB persistent storage

### Production Considerations
- Frontend: Static file serving (CDN)
- Backend: Container-based deployment
- Database: Managed PostgreSQL service
- Vector DB: Distributed ChromaDB deployment
- Load balancing and auto-scaling