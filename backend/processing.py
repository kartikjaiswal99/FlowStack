import os
from dotenv import load_dotenv
import fitz  
import google.generativeai as genai  
import chromadb
from database import SessionLocal
import models

load_dotenv()


# genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

chroma_client = chromadb.PersistentClient(path="chroma_db")

def process_and_embed_document(document_id: int, stack_id: int, file_path: str, embedding_model: str, api_key: str):
    print(f"Starting processing for document_id: {document_id} using Gemini")
    
    if not embedding_model or embedding_model == "undefined":
        embedding_model = "models/embedding-001"
    print(f"Using embedding model: {embedding_model}")  

    if api_key:
        genai.configure(api_key=api_key)

    #1. Extract Text from PDF
    try:
        doc = fitz.open(file_path)
        full_text = ""
        for page in doc:
            full_text += page.get_text()
        print(f"Extracted {len(full_text)} characters from PDF.")
    except Exception as e:
        print(f"Error extracting text: {e}")
        return

    # 2. Chunk Text 
    chunks = [full_text[i:i + 1000] for i in range(0, len(full_text), 1000)]
    print(f"Split text into {len(chunks)} chunks.")

    # 3. Generate Embeddings with Gemini and Store in ChromaDB 
    try:
        collection_name = f"stack_{stack_id}"
        collection = chroma_client.get_or_create_collection(name=collection_name)

        # The model name for Gemini embeddings
        # model = 'models/embedding-001'
        
        # Call the Gemini API to get embeddings
        response = genai.embed_content(
            model=embedding_model,
            content=chunks,
            task_type="RETRIEVAL_DOCUMENT" 
        )

        # Extract the embeddings from the response
        embeddings = response['embedding']
        
        # Store in ChromaDB 
        ids = [f"doc{document_id}_chunk{i}" for i in range(len(chunks))]
        collection.add(
            embeddings=embeddings,
            documents=chunks,
            ids=ids,
            metadatas=[{"document_id": document_id} for _ in chunks]
        )
        print("Successfully stored Gemini embeddings in ChromaDB.")
    except Exception as e:
        print(f"Error generating Gemini embeddings or storing in ChromaDB: {e}")
        return

    # 4. Update Document Status in PostgreSQL
    db = SessionLocal()
    try:
        
        db.query(models.Document).filter(models.Document.id == document_id).update({"status": "processed"})
        db.commit()
        print(f"Updated document_id {document_id} status to 'processed'.")
    finally:
        db.close()


def search_in_knowledge_base(stack_id: int, query: str, embedding_model: str, api_key: str, top_k: int = 3):
    try:
        # Configure the client with the specific key for this request
        if not embedding_model or embedding_model == "undefined":
            embedding_model = "models/embedding-001"
            
        print(f"Using embedding model for search: {embedding_model}") 
        
        if api_key:
            genai.configure(api_key=api_key)
            
        collection_name = f"stack_{stack_id}"
        collection = chroma_client.get_collection(name=collection_name)
        
        # 1. Generate an embedding for the user's query using the SAME model
        query_embedding_response = genai.embed_content(
            model=embedding_model,
            content=query,
            task_type="RETRIEVAL_QUERY" 
        )
        query_embedding = query_embedding_response['embedding']

        # 2. Search using the generated embedding, not the raw text
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k
        )
        
        context = "\n".join(results['documents'][0])
        print(f"Found context from ChromaDB: {context[:200]}...")
        return context
    except Exception as e:
        print(f"Error searching in knowledge base for stack {stack_id}: {e}")
        return ""
