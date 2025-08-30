# FlowStack API Documentation

## Overview
FlowStack provides a RESTful API for managing AI workflows, document processing, and workflow execution. The API is built with FastAPI and provides comprehensive endpoints for creating, configuring, and executing GenAI workflows.

## Base URL
- **Development**: `http://localhost:8000`
- **Production**: `https://your-domain.com/api`

## Authentication
Currently, the API uses API key-based authentication for external services (Google Gemini, SerpAPI). No authentication is required for the main API endpoints in the current implementation.

## Core Endpoints

### Stack Management

#### GET /stacks/
Retrieve all workflow stacks.

**Parameters:**
- `skip` (query, optional): Number of records to skip (default: 0)
- `limit` (query, optional): Maximum number of records to return (default: 100)

**Response:**
```json
[
  {
    "id": 1,
    "name": "Customer Support Bot",
    "description": "AI workflow for customer support automation",
    "documents": [
      {
        "id": 1,
        "filename": "support_docs.pdf",
        "status": "processed",
        "stack_id": 1,
        "upload_date": "2024-01-01T10:00:00Z"
      }
    ],
    "workflow": {
      "nodes": [...],
      "edges": [...]
    }
  }
]
```

#### POST /stacks/
Create a new workflow stack.

**Request Body:**
```json
{
  "name": "My AI Workflow",
  "description": "Description of the workflow"
}
```

**Response:**
```json
{
  "id": 1,
  "name": "My AI Workflow",
  "description": "Description of the workflow",
  "documents": [],
  "workflow": null
}
```

#### GET /stacks/{stack_id}/
Retrieve a specific workflow stack.

**Parameters:**
- `stack_id` (path): Stack ID

**Response:**
```json
{
  "id": 1,
  "name": "Customer Support Bot",
  "description": "AI workflow for customer support automation",
  "documents": [...],
  "workflow": {
    "nodes": [
      {
        "id": "node_1",
        "type": "userQuery",
        "position": {"x": 100, "y": 100},
        "data": {
          "label": "User Query",
          "query": "How can I help you?"
        }
      },
      {
        "id": "node_2",
        "type": "knowledgeBase",
        "position": {"x": 300, "y": 100},
        "data": {
          "label": "Knowledge Base",
          "embeddingModel": "models/embedding-001"
        }
      },
      {
        "id": "node_3",
        "type": "llmEngine",
        "position": {"x": 500, "y": 100},
        "data": {
          "label": "LLM Engine",
          "modelName": "gemini-2.5-flash",
          "temperature": 0.75
        }
      },
      {
        "id": "node_4",
        "type": "output",
        "position": {"x": 700, "y": 100},
        "data": {
          "label": "Output"
        }
      }
    ],
    "edges": [
      {
        "id": "edge_1",
        "source": "node_1",
        "target": "node_2"
      },
      {
        "id": "edge_2",
        "source": "node_2",
        "target": "node_3"
      },
      {
        "id": "edge_3",
        "source": "node_3",
        "target": "node_4"
      }
    ]
  }
}
```

#### PUT /stacks/{stack_id}/
Update a workflow stack's configuration.

**Parameters:**
- `stack_id` (path): Stack ID

**Request Body:**
```json
{
  "workflow": {
    "nodes": [...],
    "edges": [...]
  }
}
```

**Response:**
```json
{
  "id": 1,
  "name": "Customer Support Bot",
  "description": "AI workflow for customer support automation",
  "documents": [...],
  "workflow": {...}
}
```

### Document Management

#### POST /stacks/{stack_id}/upload-document/
Upload and process a document for a specific stack.

**Parameters:**
- `stack_id` (path): Stack ID
- `file` (form-data): PDF file to upload
- `embedding_model` (form-data, optional): Embedding model to use (default: "models/embedding-001")
- `api_key` (form-data, optional): Google API key for embeddings

**Request:**
```bash
curl -X POST \
  http://localhost:8000/stacks/1/upload-document/ \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@document.pdf' \
  -F 'embedding_model=models/embedding-001' \
  -F 'api_key=your-google-api-key'
```

**Response:**
```json
{
  "id": 1,
  "filename": "document.pdf",
  "status": "uploaded",
  "stack_id": 1,
  "upload_date": "2024-01-01T10:00:00Z"
}
```

**Processing Status:**
- `uploaded`: File uploaded, processing not started
- `processing`: Document is being processed
- `processed`: Document processed and embeddings generated
- `error`: Error occurred during processing

### Workflow Execution

#### POST /stacks/{stack_id}/chat/
Execute a workflow with a user query.

**Parameters:**
- `stack_id` (path): Stack ID

**Request Body:**
```json
{
  "workflow": {
    "nodes": [...],
    "edges": [...]
  },
  "query": "What is the return policy?"
}
```

**Response:**
```json
{
  "response": "Based on our policy documents, you can return items within 30 days of purchase with original receipt and packaging. Refunds are processed within 5-7 business days."
}
```

### System Status

#### GET /
Health check endpoint.

**Response:**
```json
{
  "status": "API is running"
}
```

## Node Types and Configurations

### User Query Node
Entry point for user input.

**Configuration:**
```json
{
  "type": "userQuery",
  "data": {
    "label": "User Query",
    "query": "Default query text (optional)"
  }
}
```

### Knowledge Base Node
Retrieves relevant context from uploaded documents.

**Configuration:**
```json
{
  "type": "knowledgeBase",
  "data": {
    "label": "Knowledge Base",
    "embeddingModel": "models/embedding-001",
    "embeddingApiKey": "your-google-api-key"
  }
}
```

### LLM Engine Node
Processes queries using language models.

**Configuration:**
```json
{
  "type": "llmEngine",
  "data": {
    "label": "LLM Engine",
    "modelName": "gemini-2.5-flash",
    "temperature": 0.75,
    "apiKey": "your-google-api-key",
    "webSearchTool": "SerpAPI",
    "serpApiKey": "your-serpapi-key"
  }
}
```

**Supported Models:**
- `gemini-2.5-flash` (default)
- `gemini-1.5-pro`
- `gemini-1.0-pro`

**Temperature Range:** 0.0 - 1.0

### Output Node
Displays final results.

**Configuration:**
```json
{
  "type": "output",
  "data": {
    "label": "Output",
    "outputText": "Generated response"
  }
}
```

## Error Responses

### Standard Error Format
```json
{
  "detail": "Error message",
  "type": "error_type"
}
```

### Common Error Codes

#### 400 Bad Request
```json
{
  "detail": "Workflow validation failed: Missing start node",
  "type": "validation_error"
}
```

#### 404 Not Found
```json
{
  "detail": "Stack not found",
  "type": "not_found_error"
}
```

#### 422 Unprocessable Entity
```json
{
  "detail": [
    {
      "loc": ["body", "name"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ],
  "type": "validation_error"
}
```

#### 500 Internal Server Error
```json
{
  "detail": "Internal server error occurred",
  "type": "internal_error"
}
```

## Rate Limiting
Currently no rate limiting is implemented. Consider implementing rate limiting for production use.

## CORS Configuration
The API is configured to allow cross-origin requests from:
- `http://localhost:5173` (Vite development server)
- `http://localhost`
- `http://127.0.0.1:5173`

## Data Models

### Stack Schema
```python
class Stack(BaseModel):
    id: int
    name: str
    description: Optional[str]
    documents: List[Document] = []
    workflow: Optional[Dict[str, Any]] = None
    
    class Config:
        from_attributes = True

class StackCreate(BaseModel):
    name: str
    description: Optional[str] = None

class StackUpdate(BaseModel):
    workflow: Dict[str, Any]
```

### Document Schema
```python
class Document(BaseModel):
    id: int
    filename: str
    status: str
    stack_id: int
    upload_date: datetime
    
    class Config:
        from_attributes = True

class DocumentCreate(BaseModel):
    filename: str
    status: str = "uploaded"
```

### Chat Schema
```python
class ChatRequest(BaseModel):
    workflow: dict
    query: str
```

## Usage Examples

### Creating a Complete Workflow

1. **Create a new stack:**
```bash
curl -X POST http://localhost:8000/stacks/ \
  -H "Content-Type: application/json" \
  -d '{"name": "Customer Support", "description": "AI-powered customer support"}'
```

2. **Upload documents:**
```bash
curl -X POST http://localhost:8000/stacks/1/upload-document/ \
  -F 'file=@support_docs.pdf' \
  -F 'api_key=your-google-api-key'
```

3. **Update workflow:**
```bash
curl -X PUT http://localhost:8000/stacks/1/ \
  -H "Content-Type: application/json" \
  -d '{"workflow": {"nodes": [...], "edges": [...]}}'
```

4. **Execute workflow:**
```bash
curl -X POST http://localhost:8000/stacks/1/chat/ \
  -H "Content-Type: application/json" \
  -d '{
    "workflow": {"nodes": [...], "edges": [...]},
    "query": "What is your return policy?"
  }'
```

### Workflow Validation Rules

1. **Must have exactly one start node** of type `userQuery`
2. **Start node cannot have incoming connections**
3. **Must have at least one output node**
4. **All nodes must be connected** (no isolated nodes)
5. **Valid node types:** `userQuery`, `knowledgeBase`, `llmEngine`, `output`

### Best Practices

1. **API Keys:** Store API keys securely and pass them in requests rather than hardcoding
2. **File Size:** Limit PDF uploads to reasonable sizes (e.g., < 10MB)
3. **Error Handling:** Always check response status and handle errors appropriately
4. **Workflow Testing:** Use the chat endpoint to test workflows before deploying
5. **Document Processing:** Monitor document status before using in workflows

## SDK Examples

### JavaScript/TypeScript
```javascript
class FlowStackClient {
  constructor(baseURL = 'http://localhost:8000') {
    this.baseURL = baseURL;
  }
  
  async createStack(data) {
    const response = await fetch(`${this.baseURL}/stacks/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }
  
  async uploadDocument(stackId, file, apiKey) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', apiKey);
    
    const response = await fetch(`${this.baseURL}/stacks/${stackId}/upload-document/`, {
      method: 'POST',
      body: formData
    });
    return response.json();
  }
  
  async executeWorkflow(stackId, workflow, query) {
    const response = await fetch(`${this.baseURL}/stacks/${stackId}/chat/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workflow, query })
    });
    return response.json();
  }
}
```

### Python
```python
import requests
from typing import Dict, Any

class FlowStackClient:
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
    
    def create_stack(self, name: str, description: str = None) -> Dict[str, Any]:
        response = requests.post(
            f"{self.base_url}/stacks/",
            json={"name": name, "description": description}
        )
        return response.json()
    
    def upload_document(self, stack_id: int, file_path: str, api_key: str) -> Dict[str, Any]:
        with open(file_path, 'rb') as f:
            files = {'file': f}
            data = {'api_key': api_key}
            response = requests.post(
                f"{self.base_url}/stacks/{stack_id}/upload-document/",
                files=files,
                data=data
            )
        return response.json()
    
    def execute_workflow(self, stack_id: int, workflow: dict, query: str) -> Dict[str, Any]:
        response = requests.post(
            f"{self.base_url}/stacks/{stack_id}/chat/",
            json={"workflow": workflow, "query": query}
        )
        return response.json()
```