# FlowStack Development Guide

This guide provides detailed information for developers working on FlowStack, including setup, architecture patterns, and contribution guidelines.

## Development Environment Setup

### System Requirements

- **Python**: 3.8 or higher
- **Node.js**: 16 or higher  
- **PostgreSQL**: 12 or higher
- **Git**: For version control

### Local Development Setup

#### 1. Clone and Setup Repository
```bash
git clone https://github.com/kartikjaiswal99/FlowStack.git
cd FlowStack
```

#### 2. Backend Development Setup

```bash
cd backend

# Using UV (recommended)
uv sync

# Or using pip
pip install -e .

# Create .env file
cat > .env << EOF
GOOGLE_API_KEY=your_gemini_api_key_here
DATABASE_URL=postgresql://username:password@localhost:5432/flowstack
SERPAPI_KEY=your_serpapi_key_here  # Optional
EOF

# Start development server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### 3. Frontend Development Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

#### 4. Database Setup

```bash
# Create PostgreSQL database
createdb flowstack

# Tables are created automatically when the backend starts
```

### Development Workflow

#### Code Style and Linting

**Frontend:**
```bash
cd frontend
npm run lint          # Run ESLint
npm run lint:fix       # Auto-fix linting issues
```

**Backend:**
```bash
cd backend
# Python linting can be added as needed
```

#### Testing

Currently, the project doesn't have comprehensive test coverage. Consider adding:

**Frontend Testing:**
```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest

# Add test scripts to package.json
```

**Backend Testing:**
```bash
# Install testing dependencies
pip install pytest pytest-asyncio httpx

# Create test files following pytest conventions
```

## Architecture Patterns

### Frontend Patterns

#### Component Structure
```javascript
// Standard component pattern
const MyComponent = ({ prop1, prop2 }) => {
  const [state, setState] = useState(initialValue);
  
  useEffect(() => {
    // Side effects
  }, [dependencies]);

  const handleEvent = () => {
    // Event handlers
  };

  return (
    <div style={styles.container}>
      {/* JSX content */}
    </div>
  );
};

const styles = {
  container: { /* styles */ }
};

export default MyComponent;
```

#### Node Component Pattern
```javascript
// All workflow nodes follow this pattern
const CustomNode = ({ id, data, selected }) => {
  const { onUpdateNodeData } = useContext(WorkflowContext);
  const [settings, setSettings] = useState(data);

  useEffect(() => { 
    setSettings(data); 
  }, [data]);

  const handleFieldChange = (field, value) => {
    const newSettings = { ...settings, [field]: value };
    setSettings(newSettings);
    onUpdateNodeData(id, { [field]: value });
  };

  return (
    <div style={{...styles.node, ...(selected ? styles.selected : {})}}>
      <Handle type="target" position={Position.Left} />
      {/* Node content */}
      <Handle type="source" position={Position.Right} />
    </div>
  );
};
```

#### State Management
- Use React Context for cross-component state (WorkflowContext)
- useState for local component state
- Props for parent-child communication
- Avoid global state libraries unless complexity increases

### Backend Patterns

#### API Endpoint Pattern
```python
@app.post("/endpoint/", response_model=schemas.ResponseModel)
def create_resource(
    resource: schemas.CreateModel,
    db: Session = Depends(get_db)
):
    try:
        # Business logic
        result = crud.create_resource(db=db, resource=resource)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
```

#### Error Handling
```python
# Consistent error handling across endpoints
try:
    # Business logic
    pass
except ValidationError as e:
    raise HTTPException(status_code=422, detail=str(e))
except NotFoundError as e:
    raise HTTPException(status_code=404, detail=str(e))
except Exception as e:
    logger.error(f"Unexpected error: {e}")
    raise HTTPException(status_code=500, detail="Internal server error")
```

#### Database Operations
```python
# CRUD operations pattern
def create_resource(db: Session, resource: schemas.ResourceCreate):
    db_resource = models.Resource(**resource.dict())
    db.add(db_resource)
    db.commit()
    db.refresh(db_resource)
    return db_resource

def get_resource(db: Session, resource_id: int):
    return db.query(models.Resource).filter(
        models.Resource.id == resource_id
    ).first()
```

## Adding New Features

### Adding a New Node Type

#### 1. Create Node Component (Frontend)
```javascript
// frontend/src/components/nodes/NewNode.jsx
import React, { useContext, useEffect, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { WorkflowContext } from '../../context/WorkflowContext';

const NewNode = ({ id, data, selected }) => {
  // Follow existing node patterns
  // Add custom configuration UI
  // Handle data updates
};

export default NewNode;
```

#### 2. Register Node Type
```javascript
// frontend/src/pages/BuilderPage.jsx
import NewNode from '../components/nodes/NewNode';

const nodeTypes = {
  userQuery: UserQueryNode,
  llmEngine: LlmEngineNode,
  knowledgeBase: KnowledgeBaseNode,
  output: OutputNode,
  newNode: NewNode,  // Add here
};
```

#### 3. Add to Components Panel
```javascript
// frontend/src/components/ComponentsPanel.jsx
<DraggableNode nodeType="newNode" label="New Node" />
```

#### 4. Implement Backend Handler
```python
# backend/orchestrator.py
def run_workflow(stack_id: int, workflow: dict, query: str):
    # ... existing code ...
    
    elif node_type == 'newNode':
        # Implement node logic
        result = process_new_node(current_data, node_data)
        current_data = result
```

#### 5. Update Validation
```python
# backend/validator.py
# Add validation rules for new node type if needed
```

### Adding New API Endpoints

#### 1. Define Schema
```python
# backend/schemas.py
class NewResourceCreate(BaseModel):
    field1: str
    field2: Optional[int] = None

class NewResource(NewResourceCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
```

#### 2. Create Database Model
```python
# backend/models.py
class NewResource(Base):
    __tablename__ = "new_resources"
    
    id = Column(Integer, primary_key=True, index=True)
    field1 = Column(String, index=True)
    field2 = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
```

#### 3. Implement CRUD Operations
```python
# backend/crud.py
def create_new_resource(db: Session, resource: schemas.NewResourceCreate):
    db_resource = models.NewResource(**resource.dict())
    db.add(db_resource)
    db.commit()
    db.refresh(db_resource)
    return db_resource
```

#### 4. Add API Endpoint
```python
# backend/main.py
@app.post("/new-resources/", response_model=schemas.NewResource)
def create_new_resource(
    resource: schemas.NewResourceCreate,
    db: Session = Depends(get_db)
):
    return crud.create_new_resource(db=db, resource=resource)
```

#### 5. Frontend Integration
```javascript
// frontend/src/api/newResourceApi.js
export const createNewResource = (data) => {
  return apiClient.post('/new-resources/', data);
};
```

## Performance Considerations

### Frontend Performance
- Use React.memo for expensive components
- Implement proper key props for lists
- Lazy load components when appropriate
- Optimize ReactFlow performance for large workflows

### Backend Performance
- Use database indexing for frequently queried fields
- Implement connection pooling for external APIs
- Use background tasks for heavy operations
- Cache frequently accessed data

### Database Optimization
- Add indexes on foreign keys and search fields
- Use query optimization for complex joins
- Monitor slow queries and optimize
- Consider read replicas for scaling

## Debugging and Troubleshooting

### Common Issues

#### Frontend Issues
```javascript
// Debug ReactFlow issues
console.log('Nodes:', nodes);
console.log('Edges:', edges);

// Debug API calls
apiClient.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data);
    return Promise.reject(error);
  }
);
```

#### Backend Issues
```python
# Add logging
import logging
logging.basicConfig(level=logging.DEBUG)

# Debug workflow execution
print(f"Executing node: {node_type} with data: {node_data}")
print(f"Current data: {current_data}")
```

#### Database Issues
```python
# Debug SQL queries
from sqlalchemy import event
from sqlalchemy.engine import Engine

@event.listens_for(Engine, "before_cursor_execute")
def receive_before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    print("Query:", statement)
    print("Parameters:", parameters)
```

### Development Tools

- **Browser DevTools**: React DevTools, Network tab
- **Database Tools**: pgAdmin, DBeaver
- **API Testing**: Postman, curl
- **Code Quality**: ESLint, Prettier, Black

## Contributing Guidelines

### Git Workflow
1. Create feature branch from main
2. Make focused, atomic commits
3. Write descriptive commit messages
4. Open pull request with clear description
5. Address review feedback
6. Squash merge when approved

### Code Review Checklist
- [ ] Code follows established patterns
- [ ] No console.log or print statements in production code
- [ ] Error handling is appropriate
- [ ] Documentation is updated if needed
- [ ] Tests are added/updated (when test framework exists)
- [ ] Performance impact is considered

### Documentation
- Update README.md for user-facing changes
- Update ARCHITECTURE.md for architectural changes
- Add inline comments for complex logic
- Update API documentation for new endpoints

This development guide should help you get started with FlowStack development and maintain consistency across the codebase.