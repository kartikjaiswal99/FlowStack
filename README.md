# FlowStack

FlowStack is a visual workflow builder for creating AI-powered document processing pipelines. Build sophisticated workflows by connecting drag-and-drop components that handle document upload, vector search, LLM processing, and output generation.

## Features

- **Visual Workflow Builder**: Drag-and-drop interface using ReactFlow
- **Document Processing**: Upload PDFs and create searchable knowledge bases  
- **AI Integration**: Powered by Google Gemini for text generation and embeddings
- **Vector Search**: ChromaDB for semantic document search
- **Real-time Execution**: Test workflows through integrated chat interface
- **Web Search**: Optional SerpAPI integration for real-time information

## Architecture

FlowStack consists of a React frontend and FastAPI backend:

- **Frontend**: React + ReactFlow for visual workflow editing
- **Backend**: FastAPI + PostgreSQL + ChromaDB
- **AI Services**: Google Gemini API for LLM and embeddings
- **Optional**: SerpAPI for web search capabilities

For detailed architecture information, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- PostgreSQL
- Google Gemini API key

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
pip install -r requirements.txt
# or using uv:
uv sync
```

3. Set up environment variables:
```bash
export GOOGLE_API_KEY="your-gemini-api-key"
export DATABASE_URL="postgresql://username:password@localhost/flowstack"
```

4. Start the backend server:
```bash
uvicorn main:app --reload --port 8000
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## Workflow Components

### Node Types

1. **User Query**: Entry point for user input
   - Configure default queries
   - Starting point for all workflows

2. **Knowledge Base**: Document search and context retrieval
   - Upload PDF documents
   - Vector similarity search
   - Configurable embedding models

3. **LLM Engine**: AI text generation
   - Google Gemini integration
   - Custom prompt templates
   - Temperature and model selection
   - Optional web search integration

4. **Output**: Display final results
   - Terminal node for workflows
   - Real-time result updates

### Creating Workflows

1. **Create a Stack**: Start from the dashboard
2. **Add Nodes**: Drag components from the panel to the canvas
3. **Configure Nodes**: Click nodes to edit their settings
4. **Connect Nodes**: Draw connections between node handles
5. **Test Workflow**: Use the chat interface to execute your workflow

## Development

### Project Structure

```
flowstack/
├── backend/                 # FastAPI backend
│   ├── main.py             # API endpoints
│   ├── orchestrator.py     # Workflow execution engine
│   ├── processing.py       # Document processing
│   ├── llm_handler.py      # Gemini integration
│   ├── models.py           # Database models
│   └── ...
├── frontend/               # React frontend
│   ├── src/
│   │   ├── pages/          # Main application pages
│   │   ├── components/     # Reusable components
│   │   └── components/nodes/ # Workflow node components
│   └── ...
└── docs/                   # Documentation
```

### API Endpoints

- `GET /stacks/` - List all stacks
- `POST /stacks/` - Create new stack
- `GET /stacks/{id}/` - Get stack details
- `PUT /stacks/{id}/` - Update stack workflow
- `POST /stacks/{id}/upload-document/` - Upload document
- `POST /stacks/{id}/chat/` - Execute workflow

### Database Schema

- **Stacks**: Store workflow configurations and metadata
- **Documents**: Track uploaded files and processing status
- **ChromaDB**: Vector embeddings for semantic search

## Configuration

### Environment Variables

#### Backend
- `GOOGLE_API_KEY`: Required for Gemini API access
- `DATABASE_URL`: PostgreSQL connection string
- `SERPAPI_KEY`: Optional for web search functionality

#### Frontend
- API base URL is configured in `src/api/axios.js`

### Database Setup

1. Create PostgreSQL database
2. Update `DATABASE_URL` environment variable
3. Database tables are created automatically on startup

## Deployment

### Backend Deployment
```bash
# Install dependencies
pip install -r requirements.txt

# Run with production server
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Frontend Deployment
```bash
# Build for production
npm run build

# Serve static files with your preferred web server
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is open source. Please check the license file for details.

## Support

For questions or issues:
- Check the [Architecture Documentation](./ARCHITECTURE.md)
- Review [Component Diagrams](./COMPONENT_DIAGRAMS.md)
- Open an issue on GitHub

## Roadmap

- [ ] Additional LLM provider support
- [ ] More document formats (Word, TXT, etc.)
- [ ] Workflow templates and sharing
- [ ] Advanced node types
- [ ] Workflow scheduling and automation
- [ ] Enhanced error handling and debugging
- [ ] Performance optimization and scaling