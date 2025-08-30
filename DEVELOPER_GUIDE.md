# FlowStack Developer Quick Reference

## Project Structure

```
FlowStack/
├── frontend/                    # React frontend application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── nodes/         # Workflow node components
│   │   │   ├── ComponentsPanel.jsx
│   │   │   ├── CreateStackModal.jsx
│   │   │   └── ChatModal.jsx
│   │   ├── pages/             # Page components
│   │   │   ├── DashboardPage.jsx
│   │   │   └── BuilderPage.jsx
│   │   ├── context/           # React contexts
│   │   ├── api/               # API client configuration
│   │   └── App.jsx           # Main application component
│   ├── package.json          # Frontend dependencies
│   └── vite.config.js        # Vite configuration
├── backend/                   # FastAPI backend application
│   ├── main.py               # FastAPI application entry point
│   ├── models.py             # SQLAlchemy database models
│   ├── schemas.py            # Pydantic data validation schemas
│   ├── crud.py               # Database CRUD operations
│   ├── database.py           # Database configuration
│   ├── orchestrator.py       # Workflow execution engine
│   ├── processing.py         # Document processing & embeddings
│   ├── llm_handler.py        # LLM API integration
│   ├── web_search.py         # Web search functionality
│   ├── validator.py          # Workflow validation logic
│   └── pyproject.toml        # Python dependencies
├── ARCHITECTURE.md           # High-level architecture documentation
├── LOW_LEVEL_DESIGN.md       # Detailed technical design
├── API_DOCUMENTATION.md      # Complete API reference
├── DEPLOYMENT_GUIDE.md       # Production deployment guide
└── README.md                 # Project overview and setup
```

## Key Components

### Frontend Architecture

#### Core Pages
- **DashboardPage**: Stack management and creation
- **BuilderPage**: Visual workflow builder interface

#### Node Components
- **UserQueryNode**: Entry point for user input
- **LlmEngineNode**: LLM processing configuration
- **KnowledgeBaseNode**: Document retrieval settings
- **OutputNode**: Result display

#### Shared Components
- **ComponentsPanel**: Draggable node palette
- **CreateStackModal**: Stack creation dialog
- **ChatModal**: Workflow testing interface

### Backend Services

#### Core Modules
- **main.py**: FastAPI app with CORS, routes, and middleware
- **orchestrator.py**: Workflow execution engine
- **processing.py**: Document processing pipeline
- **llm_handler.py**: Google Gemini API integration

#### Data Layer
- **models.py**: SQLAlchemy models (Stack, Document)
- **crud.py**: Database operations
- **schemas.py**: Pydantic validation schemas

## Data Flow

### Workflow Creation
```
User → DashboardPage → CreateStackModal → API → Database → UI Update
```

### Workflow Building
```
Drag Node → BuilderPage → ReactFlow → WorkflowContext → Node Update
```

### Document Processing
```
File Upload → Backend → PDF Processing → Text Extraction → 
Chunking → Embedding Generation → ChromaDB Storage
```

### Workflow Execution
```
Chat Query → BuilderPage → API → Orchestrator → Node Chain → 
External APIs → Result → UI Update
```

## Key APIs

### Stack Management
```bash
# Create stack
POST /stacks/
{
  "name": "My Workflow",
  "description": "Description"
}

# Update workflow
PUT /stacks/{id}/
{
  "workflow": {
    "nodes": [...],
    "edges": [...]
  }
}

# Execute workflow
POST /stacks/{id}/chat/
{
  "workflow": {...},
  "query": "User question"
}
```

### Document Processing
```bash
# Upload document
POST /stacks/{id}/upload-document/
Content-Type: multipart/form-data
- file: PDF file
- embedding_model: models/embedding-001
- api_key: Google API key
```

## Development Commands

### Frontend
```bash
cd frontend
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
```

### Backend
```bash
cd backend
uv sync              # Install dependencies
uv run uvicorn main:app --reload  # Start development server
uv run pytest       # Run tests
```

### Docker
```bash
docker-compose up -d     # Start all services
docker-compose down      # Stop all services
docker-compose logs -f   # View logs
```

## Environment Variables

### Backend (.env)
```bash
POSTGRES_URL=postgresql://user:pass@localhost:5432/flowstack
GOOGLE_API_KEY=your_google_api_key
SERPAPI_API_KEY=your_serpapi_key
ENVIRONMENT=development
DEBUG=true
LOG_LEVEL=INFO
```

### Frontend
```bash
VITE_API_URL=http://localhost:8000
```

## Database Schema

### Stacks Table
```sql
CREATE TABLE stacks (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    description TEXT,
    workflow JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Documents Table
```sql
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    filename VARCHAR NOT NULL,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR DEFAULT 'uploaded',
    stack_id INTEGER REFERENCES stacks(id),
    file_path VARCHAR
);
```

## Node Configuration Examples

### User Query Node
```javascript
{
  "id": "node_1",
  "type": "userQuery",
  "position": {"x": 100, "y": 100},
  "data": {
    "label": "User Query",
    "query": "Default query text"
  }
}
```

### LLM Engine Node
```javascript
{
  "id": "node_2",
  "type": "llmEngine",
  "position": {"x": 300, "y": 100},
  "data": {
    "label": "LLM Engine",
    "modelName": "gemini-2.5-flash",
    "temperature": 0.75,
    "apiKey": "your-api-key",
    "webSearchTool": "SerpAPI"
  }
}
```

### Knowledge Base Node
```javascript
{
  "id": "node_3",
  "type": "knowledgeBase",
  "position": {"x": 500, "y": 100},
  "data": {
    "label": "Knowledge Base",
    "embeddingModel": "models/embedding-001",
    "embeddingApiKey": "your-api-key"
  }
}
```

## Common Patterns

### Adding New Node Type

1. **Create Node Component** (frontend)
```javascript
// src/components/nodes/MyNewNode.jsx
const MyNewNode = ({ id, data, selected }) => {
  const { onUpdateNodeData } = useContext(WorkflowContext);
  // Component implementation
};
```

2. **Register Node Type** (frontend)
```javascript
// src/pages/BuilderPage.jsx
const nodeTypes = {
  userQuery: UserQueryNode,
  llmEngine: LlmEngineNode,
  knowledgeBase: KnowledgeBaseNode,
  output: OutputNode,
  myNewNode: MyNewNode  // Add new node type
};
```

3. **Add Execution Logic** (backend)
```python
# backend/orchestrator.py
def run_workflow(stack_id: int, workflow: dict, query: str):
    # ... existing code ...
    if node_type == 'myNewNode':
        # Add execution logic
        current_data = execute_my_new_node(current_data, node_data)
```

### Error Handling
```python
# Backend error handling pattern
try:
    result = some_operation()
    return {"success": True, "data": result}
except SpecificException as e:
    logger.error(f"Specific error: {e}")
    raise HTTPException(status_code=400, detail=str(e))
except Exception as e:
    logger.error(f"Unexpected error: {e}")
    raise HTTPException(status_code=500, detail="Internal server error")
```

### Frontend State Management
```javascript
// Using React Context for shared state
const WorkflowContext = createContext();

// Provider in BuilderPage
<WorkflowContext.Provider value={{ onUpdateNodeData }}>
  {/* Components */}
</WorkflowContext.Provider>

// Consumer in Node components
const { onUpdateNodeData } = useContext(WorkflowContext);
```

## Testing

### Backend Tests
```python
# test_api.py
def test_create_stack():
    response = client.post("/stacks/", json={
        "name": "Test Stack",
        "description": "Test description"
    })
    assert response.status_code == 200
    assert response.json()["name"] == "Test Stack"
```

### Frontend Tests
```javascript
// Component.test.jsx
import { render, screen } from '@testing-library/react';
import MyComponent from './MyComponent';

test('renders component correctly', () => {
  render(<MyComponent />);
  expect(screen.getByText('Expected Text')).toBeInTheDocument();
});
```

## Debugging

### Backend Debugging
```python
# Add logging for debugging
import logging
logger = logging.getLogger(__name__)

def my_function():
    logger.info("Function called")
    logger.debug(f"Variable value: {variable}")
```

### Frontend Debugging
```javascript
// Use React Developer Tools
// Add console.log for debugging
console.log('Node data:', data);
console.log('Workflow state:', nodes, edges);
```

## Performance Tips

### Backend Optimization
- Use database connection pooling
- Implement caching for frequently accessed data
- Use background tasks for long-running operations
- Optimize ChromaDB queries with proper indexing

### Frontend Optimization
- Memoize expensive calculations with useMemo
- Use useCallback for function references
- Implement virtual scrolling for large node lists
- Lazy load components and routes

## Security Checklist

- [ ] Store API keys in environment variables
- [ ] Validate all user inputs with Pydantic
- [ ] Implement proper CORS configuration
- [ ] Use HTTPS in production
- [ ] Sanitize file uploads
- [ ] Implement rate limiting
- [ ] Use secure headers (HSTS, CSP, etc.)

## Deployment Checklist

- [ ] Set up production database
- [ ] Configure environment variables
- [ ] Set up SSL/TLS certificates
- [ ] Configure monitoring and logging
- [ ] Set up backup procedures
- [ ] Test disaster recovery
- [ ] Configure auto-scaling
- [ ] Set up health checks

## Useful Commands

### Git
```bash
git status                    # Check working directory status
git add .                     # Stage all changes
git commit -m "message"       # Commit changes
git push origin branch-name   # Push to remote
```

### Database
```bash
psql -h localhost -U user -d flowstack  # Connect to database
\dt                                      # List tables
\d table_name                           # Describe table
```

### Logs
```bash
tail -f app.log                # Follow application logs
docker-compose logs -f backend # Follow container logs
```

This quick reference provides essential information for developers working on FlowStack. Keep it handy for daily development tasks!