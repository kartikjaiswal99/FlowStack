# FlowStack Low-Level Design Documentation

## Table of Contents
1. [Database Schema](#database-schema)
2. [API Specifications](#api-specifications)
3. [Frontend Component Details](#frontend-component-details)
4. [Backend Service Details](#backend-service-details)
5. [Workflow Execution Engine](#workflow-execution-engine)
6. [Data Models and Schemas](#data-models-and-schemas)
7. [Integration Patterns](#integration-patterns)

## Database Schema

### PostgreSQL Schema

```sql
-- Stacks table: Stores workflow definitions
CREATE TABLE stacks (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    description TEXT,
    workflow JSONB,  -- Stores ReactFlow nodes and edges
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Documents table: Stores uploaded document metadata
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    filename VARCHAR NOT NULL,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR DEFAULT 'uploaded',  -- 'uploaded', 'processing', 'processed', 'error'
    stack_id INTEGER REFERENCES stacks(id) ON DELETE CASCADE,
    file_path VARCHAR,
    file_size BIGINT,
    content_type VARCHAR
);

-- Indexes for performance
CREATE INDEX idx_stacks_name ON stacks(name);
CREATE INDEX idx_documents_stack_id ON documents(stack_id);
CREATE INDEX idx_documents_status ON documents(status);
```

### ChromaDB Schema

```python
# Collection structure for each stack
collection_name = f"stack_{stack_id}"

# Document structure in ChromaDB
{
    "ids": ["doc{document_id}_chunk{chunk_index}"],
    "embeddings": [[float, float, ...]],  # Vector embeddings
    "documents": ["chunk_text"],          # Text chunks
    "metadatas": [{"document_id": int}]   # Metadata for each chunk
}
```

## API Specifications

### Core Endpoints

#### Stack Management

```yaml
# GET /stacks/
Description: Retrieve all stacks
Parameters:
  - skip: int (optional, default: 0)
  - limit: int (optional, default: 100)
Response: List[StackSchema]

# POST /stacks/
Description: Create a new stack
Body: StackCreateSchema
Response: StackSchema

# GET /stacks/{stack_id}/
Description: Retrieve specific stack
Parameters:
  - stack_id: int
Response: StackSchema

# PUT /stacks/{stack_id}/
Description: Update stack workflow
Parameters:
  - stack_id: int
Body: StackUpdateSchema
Response: StackSchema
```

#### Document Management

```yaml
# POST /stacks/{stack_id}/upload-document/
Description: Upload document for processing
Parameters:
  - stack_id: int
  - file: UploadFile
  - embedding_model: str (optional)
  - api_key: str (optional)
Response: DocumentSchema

# POST /stacks/{stack_id}/chat/
Description: Execute workflow with user query
Parameters:
  - stack_id: int
Body: ChatRequestSchema
Response: { "response": str }
```

### Request/Response Schemas

```python
# Pydantic schemas for API validation

class StackCreate(BaseModel):
    name: str
    description: Optional[str] = None

class StackUpdate(BaseModel):
    workflow: Dict[str, Any]

class Stack(BaseModel):
    id: int
    name: str
    description: Optional[str]
    documents: List[Document] = []
    workflow: Optional[Dict[str, Any]] = None

class DocumentBase(BaseModel):
    filename: str
    status: str

class Document(DocumentBase):
    id: int
    stack_id: int
    upload_date: datetime

class ChatRequest(BaseModel):
    workflow: dict
    query: str
```

## Frontend Component Details

### BuilderPage Component Architecture

```javascript
// Component structure and data flow
const BuilderPage = () => {
  // State management
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  
  // Node type mapping
  const nodeTypes = {
    userQuery: UserQueryNode,
    llmEngine: LlmEngineNode,
    knowledgeBase: KnowledgeBaseNode,
    output: OutputNode,
  };
  
  // Key functions
  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);
  const onDrop = useCallback((event) => { /* Handle drag-drop */ }, []);
  const handleBuildStack = () => { /* Save workflow */ };
  const handleSendMessage = (query) => { /* Execute workflow */ };
};
```

### Node Component Pattern

```javascript
// Generic node component structure
const NodeComponent = ({ id, data, selected }) => {
  const { onUpdateNodeData } = useContext(WorkflowContext);
  const [settings, setSettings] = useState(data);
  
  const handleFieldChange = (field, value) => {
    const newSettings = { ...settings, [field]: value };
    setSettings(newSettings);
    onUpdateNodeData(id, { [field]: value });
  };
  
  return (
    <div style={nodeStyles}>
      <div style={headerStyles}>{data.label}</div>
      {selected && <ConfigurationPanel />}
      <Handle type="source" position={Position.Right} />
      <Handle type="target" position={Position.Left} />
    </div>
  );
};
```

### Workflow Context Implementation

```javascript
// Shared state management for workflow data
export const WorkflowContext = createContext({
  onUpdateNodeData: () => {},
});

// Usage in BuilderPage
const onUpdateNodeData = useCallback((nodeId, newData) => {
  setNodes((nds) =>
    nds.map((node) =>
      node.id === nodeId
        ? { ...node, data: { ...node.data, ...newData } }
        : node
    )
  );
}, [setNodes]);
```

## Backend Service Details

### FastAPI Application Structure

```python
# main.py - Application setup
app = FastAPI(title="Intelligent Workflow Builder API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency injection
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### CRUD Operations

```python
# crud.py - Database operations
def create_stack(db: Session, stack: schemas.StackCreate):
    db_stack = models.Stack(**stack.dict())
    db.add(db_stack)
    db.commit()
    db.refresh(db_stack)
    return db_stack

def get_stack(db: Session, stack_id: int):
    return db.query(models.Stack).filter(models.Stack.id == stack_id).first()

def get_stacks(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Stack).offset(skip).limit(limit).all()

def update_stack(db: Session, stack_id: int, stack_update: schemas.StackUpdate):
    db.query(models.Stack).filter(models.Stack.id == stack_id).update(stack_update.dict())
    db.commit()
    return get_stack(db, stack_id)
```

### Document Processing Pipeline

```python
# processing.py - Document handling workflow
def process_and_embed_document(document_id: int, stack_id: int, file_path: str, 
                               embedding_model: str, api_key: str):
    # 1. Text extraction from PDF
    doc = fitz.open(file_path)
    full_text = ""
    for page in doc:
        full_text += page.get_text()
    
    # 2. Text chunking (1000 character chunks)
    chunks = [full_text[i:i + 1000] for i in range(0, len(full_text), 1000)]
    
    # 3. Generate embeddings using Gemini
    genai.configure(api_key=api_key)
    response = genai.embed_content(
        model=embedding_model,
        content=chunks,
        task_type="RETRIEVAL_DOCUMENT"
    )
    
    # 4. Store in ChromaDB
    collection_name = f"stack_{stack_id}"
    collection = chroma_client.get_or_create_collection(name=collection_name)
    
    ids = [f"doc{document_id}_chunk{i}" for i in range(len(chunks))]
    collection.add(
        embeddings=response['embedding'],
        documents=chunks,
        ids=ids,
        metadatas=[{"document_id": document_id} for _ in chunks]
    )
    
    # 5. Update document status
    update_document_status(document_id, "processed")
```

## Workflow Execution Engine

### Orchestrator Implementation

```python
# orchestrator.py - Workflow execution logic
def run_workflow(stack_id: int, workflow: dict, query: str):
    nodes = {node['id']: node for node in workflow['nodes']}
    edges = workflow['edges']
    
    # Find starting node (UserQuery node with no incoming edges)
    current_node_id = find_start_node(nodes, edges)
    current_data = query
    
    # Execute workflow node by node
    while current_node_id:
        current_node = nodes[current_node_id]
        node_type = current_node['type']
        node_data = current_node['data']
        
        # Execute node based on type
        if node_type == 'userQuery':
            current_data = query
            
        elif node_type == 'knowledgeBase':
            context = search_in_knowledge_base(
                stack_id, current_data, 
                node_data.get('embeddingModel'),
                node_data.get('embeddingApiKey')
            )
            current_data = {"query": current_data, "context": context}
            
        elif node_type == 'llmEngine':
            response = generate_llm_response(current_data, node_data)
            current_data = response
            
        elif node_type == 'output':
            break
            
        # Move to next node
        current_node_id = get_next_node(current_node_id, edges)
    
    return current_data
```

### Node Execution Strategies

```python
# LLM Engine Node execution
def execute_llm_node(current_data: dict, node_data: dict) -> str:
    # Extract configuration
    api_key = node_data.get('apiKey')
    model_name = node_data.get('modelName', 'gemini-2.5-flash')
    temperature = node_data.get('temperature', 0.75)
    
    # Prepare prompt
    query = current_data.get('query', '')
    context = current_data.get('context', '')
    
    # Optional web search
    web_context = ""
    if node_data.get('webSearchTool') == 'SerpAPI':
        web_context = web_search.perform_search(query)
    
    # Build final prompt
    prompt_template = """
    You are a helpful AI assistant. Answer the user's question using the provided context.
    
    PDF CONTEXT:
    {context}
    
    WEB SEARCH RESULTS:
    {web_context}
    
    USER QUERY:
    {query}
    """
    
    final_prompt = prompt_template.format(
        query=query, 
        context=context,
        web_context=web_context
    )
    
    # Generate response
    return llm_handler.generate_response(
        prompt=final_prompt,
        api_key=api_key,
        model_name=model_name,
        temperature=temperature
    )

# Knowledge Base Node execution
def execute_knowledge_base_node(query: str, stack_id: int, node_data: dict) -> str:
    embedding_model = node_data.get('embeddingModel', 'models/embedding-001')
    api_key = node_data.get('embeddingApiKey')
    
    return search_in_knowledge_base(
        stack_id=stack_id,
        query=query,
        embedding_model=embedding_model,
        api_key=api_key,
        top_k=3
    )
```

### Workflow Validation

```python
# validator.py - Workflow validation logic
def validate_workflow(workflow: dict) -> Tuple[bool, str]:
    nodes = workflow.get('nodes', [])
    edges = workflow.get('edges', [])
    
    if not nodes:
        return False, "Workflow cannot be empty."
    
    # Validate start node
    node_ids_with_inputs = {edge['target'] for edge in edges}
    start_nodes = [node for node in nodes if node['id'] not in node_ids_with_inputs]
    
    if len(start_nodes) != 1:
        return False, f"Workflow must have exactly one starting point. Found {len(start_nodes)}."
    
    if start_nodes[0]['type'] != 'userQuery':
        return False, "The starting node must be a 'User Query' node."
    
    # Validate end nodes
    end_nodes = [n for n in nodes if n['type'] == 'output' 
                 and not any(e['source'] == n['id'] for e in edges)]
    
    if not end_nodes:
        return False, "Workflow must have at least one Output node."
    
    return True, "Workflow is valid."
```

## Data Models and Schemas

### SQLAlchemy Models

```python
# models.py - Database models
class Stack(Base):
    __tablename__ = "stacks"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(String)
    workflow = Column(JSON, nullable=True)  # ReactFlow graph data
    
    # Relationships
    documents = relationship("Document", back_populates="owner")

class Document(Base):
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True, nullable=False)
    upload_date = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="uploaded")
    stack_id = Column(Integer, ForeignKey("stacks.id"))
    
    # Relationships
    owner = relationship("Stack", back_populates="documents")
```

### ReactFlow Data Structure

```javascript
// Workflow data structure in frontend
const workflowData = {
  nodes: [
    {
      id: 'node_1',
      type: 'userQuery',
      position: { x: 100, y: 100 },
      data: {
        label: 'User Query',
        query: 'Default query text'
      }
    },
    {
      id: 'node_2',
      type: 'llmEngine',
      position: { x: 300, y: 100 },
      data: {
        label: 'LLM Engine',
        modelName: 'gemini-2.5-flash',
        temperature: 0.75,
        apiKey: 'user-api-key'
      }
    }
  ],
  edges: [
    {
      id: 'edge_1',
      source: 'node_1',
      target: 'node_2',
      type: 'default'
    }
  ]
};
```

## Integration Patterns

### External API Integration

```python
# llm_handler.py - Google Gemini integration
def generate_response(prompt: str, api_key: str, model_name: str, temperature: float):
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(model_name)
        generation_config = genai.types.GenerationConfig(temperature=temperature)
        
        response = model.generate_content(prompt, generation_config=generation_config)
        return response.text
    except Exception as e:
        return f"Error: {str(e)}"

# web_search.py - SerpAPI integration
def perform_search(query: str, serpapi_key: str = None):
    params = {
        "q": query,
        "api_key": serpapi_key or os.getenv("SERPAPI_API_KEY"),
    }
    search = GoogleSearch(params)
    results = search.get_dict()
    
    snippets = []
    if "organic_results" in results:
        for result in results["organic_results"][:3]:
            if "snippet" in result:
                snippets.append(result["snippet"])
    
    return "\n".join(snippets)
```

### Error Handling Patterns

```python
# Centralized error handling
class WorkflowExecutionError(Exception):
    pass

class DocumentProcessingError(Exception):
    pass

# API error responses
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "type": "http_error"}
    )

@app.exception_handler(WorkflowExecutionError)
async def workflow_exception_handler(request: Request, exc: WorkflowExecutionError):
    return JSONResponse(
        status_code=400,
        content={"detail": str(exc), "type": "workflow_error"}
    )
```

### Background Processing

```python
# Asynchronous document processing
@app.post("/stacks/{stack_id}/upload-document/")
def upload_document_for_stack(
    stack_id: int,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    embedding_model: str = "models/embedding-001",
    api_key: str = None,
    db: Session = Depends(get_db)
):
    # Save file and create document record
    document = create_document_record(db, stack_id, file)
    
    # Process document in background
    background_tasks.add_task(
        process_and_embed_document,
        document.id,
        stack_id,
        file_path,
        embedding_model,
        api_key
    )
    
    return document
```

## Performance Considerations

### Database Optimization
- Indexing on frequently queried columns
- Connection pooling for concurrent requests
- Query optimization for large datasets

### Vector Search Optimization
- Efficient embedding storage in ChromaDB
- Optimized similarity search with proper indexing
- Chunking strategy for large documents

### Frontend Performance
- Component memoization for ReactFlow nodes
- Lazy loading of large workflows
- Optimistic updates for better UX

### Caching Strategy
- API response caching for static data
- Embedding cache for repeated queries
- Client-side caching for workflow definitions