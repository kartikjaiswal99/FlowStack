# FlowStack

FlowStack is a visual workflow builder for GenAI (Generative AI) applications that enables users to create, configure, and execute AI-powered workflows through an intuitive drag-and-drop interface.

![FlowStack Architecture](https://img.shields.io/badge/Architecture-Microservices-blue)
![Frontend](https://img.shields.io/badge/Frontend-React%2019-61dafb)
![Backend](https://img.shields.io/badge/Backend-FastAPI-009688)
![Database](https://img.shields.io/badge/Database-PostgreSQL-336791)
![Vector DB](https://img.shields.io/badge/Vector%20DB-ChromaDB-ff6b6b)

## 🚀 Features

- **Visual Workflow Builder**: Drag-and-drop interface for creating AI workflows using ReactFlow
- **Document Processing**: Upload and process PDF documents with automatic text extraction and embedding generation
- **Knowledge Base Integration**: Vector-based document retrieval using ChromaDB for contextual AI responses
- **LLM Integration**: Support for Google Gemini models with configurable parameters (temperature, model selection)
- **Web Search**: Real-time web search integration using SerpAPI
- **Real-time Testing**: Built-in chat interface for testing workflows during development
- **Workflow Orchestration**: Automated execution of complex AI workflows with multiple processing steps

## 🏗️ Architecture

FlowStack follows a modern microservices architecture with clear separation of concerns:

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
└─────────────────────────────────────────────────────────────────┘
```

## 🛠️ Technology Stack

### Frontend
- **React 19.1.1** - Modern component-based UI framework
- **ReactFlow 11.11.4** - Visual workflow builder library
- **React Router DOM 7.8.2** - Client-side routing
- **Axios 1.11.0** - HTTP client for API communication
- **Vite 7.1.2** - Fast build tool and development server

### Backend
- **FastAPI** - Modern Python web framework with automatic API documentation
- **SQLAlchemy** - Object-relational mapping (ORM) for database operations
- **PostgreSQL** - Primary database for metadata and workflow storage
- **ChromaDB** - Vector database for document embeddings and similarity search
- **Uvicorn** - ASGI server for high-performance async operations

### External Services
- **Google Gemini API** - Language model and embedding generation
- **SerpAPI** - Real-time web search functionality
- **PyMuPDF** - PDF text extraction and processing

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **Python** (v3.8 or higher)
- **PostgreSQL** (v13 or higher)
- **UV** (Python package manager)
- **Git**

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/kartikjaiswal99/FlowStack.git
cd FlowStack
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
uv sync

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start the backend server
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```bash
# Database
POSTGRES_URL=postgresql://username:password@localhost:5432/flowstack

# External APIs
GOOGLE_API_KEY=your_google_api_key
SERPAPI_API_KEY=your_serpapi_key

# Application Settings
ENVIRONMENT=development
DEBUG=true
LOG_LEVEL=INFO
```

### Database Setup

1. Create a PostgreSQL database:
```sql
CREATE DATABASE flowstack;
CREATE USER flowstack_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE flowstack TO flowstack_user;
```

2. The application will automatically create the required tables on startup.

## 🎯 Usage

### Creating a Workflow

1. **Create a New Stack**: Start by creating a new workflow stack from the dashboard
2. **Design Your Workflow**: Use the visual builder to drag and drop nodes:
   - **User Query Node**: Entry point for user input
   - **Knowledge Base Node**: Retrieves relevant context from uploaded documents
   - **LLM Engine Node**: Processes queries using AI models
   - **Output Node**: Displays the final results
3. **Connect Nodes**: Draw connections between nodes to define the workflow flow
4. **Configure Nodes**: Select nodes to configure their parameters (API keys, model settings, etc.)
5. **Upload Documents**: Add PDF documents to the knowledge base
6. **Test the Workflow**: Use the built-in chat interface to test your workflow

### Node Types

#### User Query Node
- **Purpose**: Entry point for user queries
- **Configuration**: Default query text (optional)

#### Knowledge Base Node
- **Purpose**: Retrieves relevant context from uploaded documents
- **Configuration**: 
  - Embedding model selection
  - Google API key for embeddings

#### LLM Engine Node
- **Purpose**: Processes queries using language models
- **Configuration**:
  - Model selection (Gemini variants)
  - Temperature setting (0.0 - 1.0)
  - Google API key
  - Web search tool selection

#### Output Node
- **Purpose**: Displays final workflow results
- **Configuration**: None required

## 📖 Documentation

Comprehensive documentation is available in the following files:

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - High-level system architecture and component overview
- **[LOW_LEVEL_DESIGN.md](./LOW_LEVEL_DESIGN.md)** - Detailed technical implementation and design patterns
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Complete API reference with examples
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Production deployment and infrastructure setup

## 🐳 Docker Deployment

For containerized deployment, use the provided Docker Compose configuration:

```bash
# Set up environment variables
echo "POSTGRES_PASSWORD=secure_password" > .env
echo "GOOGLE_API_KEY=your_api_key" >> .env
echo "SERPAPI_API_KEY=your_serpapi_key" >> .env

# Deploy with Docker Compose
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f backend
```

## 🔒 Security

- **API Key Management**: Store API keys securely in environment variables
- **CORS Configuration**: Properly configured for cross-origin requests
- **Input Validation**: Comprehensive validation using Pydantic schemas
- **File Upload Security**: Secure handling of PDF uploads with size limits

## 🧪 Testing

### Backend Testing
```bash
cd backend
uv run pytest
```

### Frontend Testing
```bash
cd frontend
npm run test
```

### API Testing
The backend provides interactive API documentation at `http://localhost:8000/docs` where you can test all endpoints.

## 📊 Monitoring

### Health Checks
- Backend health check: `GET http://localhost:8000/health`
- Database connectivity monitoring
- ChromaDB status monitoring

### Logging
- Structured JSON logging
- Request/response logging
- Error tracking and alerting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and conventions
- Write comprehensive tests for new features
- Update documentation for any API changes
- Ensure all tests pass before submitting PRs

## 📝 API Reference

### Core Endpoints

- `GET /stacks/` - List all workflow stacks
- `POST /stacks/` - Create a new stack
- `GET /stacks/{id}/` - Get specific stack details
- `PUT /stacks/{id}/` - Update stack workflow
- `POST /stacks/{id}/upload-document/` - Upload document for processing
- `POST /stacks/{id}/chat/` - Execute workflow with user query

For complete API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify PostgreSQL is running
   - Check connection string in `.env`
   - Ensure database exists and user has permissions

2. **ChromaDB Permission Error**
   - Check write permissions in the `chroma_db` directory
   - Verify disk space availability

3. **API Key Errors**
   - Verify Google API key is valid and has required permissions
   - Check SerpAPI key is active and has remaining credits

4. **Frontend Build Issues**
   - Clear `node_modules` and reinstall dependencies
   - Check Node.js version compatibility

### Logs Location

- **Backend logs**: Console output or configured log files
- **Frontend logs**: Browser developer console
- **Database logs**: PostgreSQL log directory

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **ReactFlow** - For the excellent visual workflow builder library
- **FastAPI** - For the modern Python web framework
- **Google Gemini** - For powerful language model capabilities
- **ChromaDB** - For efficient vector storage and retrieval

## 📞 Support

For support, questions, or contributions:

- **Issues**: [GitHub Issues](https://github.com/kartikjaiswal99/FlowStack/issues)
- **Discussions**: [GitHub Discussions](https://github.com/kartikjaiswal99/FlowStack/discussions)
- **Email**: [Your contact email]

## 🗺️ Roadmap

### Upcoming Features

- [ ] **Multi-user Support** - User authentication and workspace isolation
- [ ] **Advanced Node Types** - Custom Python code execution, API call nodes
- [ ] **Workflow Templates** - Pre-built templates for common use cases
- [ ] **Real-time Collaboration** - Multiple users editing workflows simultaneously
- [ ] **Advanced Analytics** - Workflow performance metrics and optimization
- [ ] **Integration Hub** - Pre-built integrations with popular tools and services
- [ ] **Mobile App** - Mobile interface for workflow monitoring and execution

### Version History

- **v1.0.0** - Initial release with core workflow building capabilities
- **v0.9.0** - Beta release with document processing and LLM integration
- **v0.8.0** - Alpha release with basic workflow execution

---

**Built with ❤️ by the FlowStack Team**