# FlowStack: No-Code AI Workflow Builder

FlowStack is a full-stack web application that provides a no-code visual interface for building, configuring, and interacting with intelligent AI-powered workflows. Users can drag and drop components, connect them to define a logical flow, and chat with their creations to get answers from documents, the web, or generative AI models.

---

## Features

* **Visual Workflow Editor**: A drag-and-drop canvas powered by React Flow to design complex data pipelines.
* **Component-Based System**: Build workflows using modular components:

  * **User Query**: The entry point for user input.
  * **Knowledge Base**: Upload PDFs for Retrieval-Augmented Generation (RAG).
  * **LLM Engine**: The core AI brain, configurable with different models, prompts, and settings.
  * **Output**: Displays the final generated result.
* **RAG with PDF Uploads**: The Knowledge Base node automatically extracts text, generates embeddings, and stores them in a vector database (ChromaDB) for context-aware answers.
* **Web Search Integration**: The LLM Engine can be configured to use SerpAPI for real-time web search to answer questions about recent events.
* **Persistent Workflows**: Save your visual workflows to a PostgreSQL database and have them load automatically.
* **Real-Time Chat Interface**: Interact with your built workflows through a clean and responsive chat modal.

---

## Tech Stack

| Category           | Technology                                        |
| ------------------ | ------------------------------------------------- |
| **Frontend**       | React.js, Vite, React Flow, Axios                 |
| **Backend**        | FastAPI (Python), Uvicorn                         |
| **Database**       | PostgreSQL (for metadata), ChromaDB (for vectors) |
| **AI Services**    | Google Gemini (for LLM & Embeddings)              |
| **Web Search**     | SerpAPI                                           |
| **PDF Processing** | PyMuPDF                                           |

---

## Quick Start

Follow these instructions to set up and run the project on your local machine.



### 1. Backend Setup

First, set up and run the FastAPI server.

**1.1 Navigate to the Backend Directory:**

```bash
cd backend
```
**1.2 Create and Activate a Virtual Environment:**

* On macOS/Linux:

```bash
python3 -m venv venv
source venv/bin/activate
```

* On Windows:

```bash
python -m venv venv
.\venv\Scripts\activate
```

**1.3 Install Python Dependencies:**

```bash
uv pip install pyproject.toml
```


**1.4 Configure Environment Variables:**

Create a new file named `.env` inside the backend directory.

```bash
# backend/.env

# Replace with your PostgreSQL connection string
SQLALCHEMY_DATABASE_URL="postgresql://user:password@localhost/workflow_db"

# Replace with your API keys
GOOGLE_API_KEY="your-google-api-key"
SERPAPI_API_KEY="your-serpapi-api-key"
```

**1.5 Start the Backend Server:**

```bash
uvicorn main:app --reload
```

The backend server should now be running at [http://127.0.0.1:8000](http://127.0.0.1:8000).
It will automatically create the necessary database tables on the first run.

---

### 2. Frontend Setup

Next, set up and run the React client.

**2.1 Navigate to the Frontend Directory:**

```bash
cd frontend
```

**2.2 Install Node.js Dependencies:**

```bash
npm install
```

**2.3 Start the Frontend Development Server:**

```bash
npm run dev
```

The frontend application should now be running and accessible at [http://localhost:5173](http://localhost:5173).


---

## Frontend Visuals

The FlowStack frontend is designed for **clarity and usability** with four main areas:


### 1. Dashboard

* Displays all saved stacks as cards.
* Includes a **“+ New Stack”** button for quickly creating a new workflow.
* Each stack card shows its name, description, and quick actions (edit, delete, open).

<p align="center">
  <img src="backend/screenshot/2.png/" alt="Dashboard Screenshot" width="700"/>
</p>

---

### 2. Workflow Builder Canvas

* A drag-and-drop canvas (powered by **React Flow**).
* Left sidebar lists available components (**User Query, Knowledge Base, LLM Engine, Output**).
* Users drag nodes from the sidebar onto the canvas.
* Nodes have handles to connect them with edges, defining data flow visually.

<p align="center">
  <img src="backend/screenshot/5.png" alt="Workflow Builder Screenshot" width="700"/>
</p>

---

### 3. Node Configuration

* Clicking a node opens its **configuration form** inside the node itself.
* Example configurations:
  * **Knowledge Base Node** → Upload PDFs.
  * **LLM Engine Node** → Set API key, model, prompt, temperature, web search options.
* Clean UI with dropdowns, sliders, and text fields for parameters.
<p align="center">
  <img src="./backend/screenshot/3.png" alt="Node Configuration Screenshot" width="700"/>
</p>


---

### 4. Chat Interface

* Accessible via a **“Chat with Stack”** button.
* Opens a chat modal on the right or bottom.
* Users can interact with their workflow in real time, asking questions and receiving answers generated by the configured pipeline.

<p align="center">
  <img src="./backend/screenshot/4.png" alt="Node Configuration Screenshot" width="700"/>
</p>