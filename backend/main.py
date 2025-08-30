from fastapi import FastAPI, Depends, UploadFile, File, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
import processing
import os
import shutil
import orchestrator
from fastapi.middleware.cors import CORSMiddleware
import models, schemas, crud, validator
from database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)



app = FastAPI(title="Intelligent Workflow Builder API")

origins = [
    "http://localhost:5173", # The origin of your React app
    "http://localhost",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"], 
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"status": "API is running"}

@app.post("/stacks/", response_model=schemas.Stack)
def create_stack(stack: schemas.StackCreate, db: Session = Depends(get_db)):
    return crud.create_stack(db=db, stack=stack)

@app.get("/stacks/", response_model=List[schemas.Stack])
def read_stacks(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    stacks = crud.get_stacks(db, skip=skip, limit=limit)
    return stacks


@app.post("/stacks/{stack_id}/upload-document/", response_model=schemas.Document)
def upload_document_for_stack(
    stack_id: int,
    background_tasks: BackgroundTasks, 
    db: Session = Depends(get_db),
    file: UploadFile = File(...),
    embedding_model: str = "models/embedding-001", 
    api_key: str = None
):
    upload_dir = f"uploaded_files/stack_{stack_id}"
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    document_data = schemas.DocumentCreate(filename=file.filename, status="processing") 
    db_document = crud.create_document_for_stack(db=db, document=document_data, stack_id=stack_id)

    # Add the processing task to the background
    background_tasks.add_task(
        processing.process_and_embed_document, 
        db_document.id, 
        stack_id, 
        file_path,
        embedding_model,
        api_key
    )

    return db_document

@app.post("/stacks/{stack_id}/chat/")
def chat_with_stack(stack_id: int, request: schemas.ChatRequest):
    final_response = orchestrator.run_workflow(
        stack_id=stack_id,
        workflow=request.workflow,
        query=request.query
    )
    return {"response": final_response}



@app.put("/stacks/{stack_id}/", response_model=schemas.Stack)
def update_stack(stack_id: int, stack_update: schemas.StackUpdate, db: Session = Depends(get_db)):
    is_valid, message = validator.validate_workflow(stack_update.workflow)
    if not is_valid:
        raise HTTPException(status_code=400, detail=message) 

    db_stack = crud.update_stack_workflow(db=db, stack_id=stack_id, workflow=stack_update.workflow)
    if db_stack is None:
        raise HTTPException(status_code=404, detail="Stack not found")
    return db_stack


@app.get("/stacks/{stack_id}/", response_model=schemas.Stack)
def read_stack(stack_id: int, db: Session = Depends(get_db)):
    db_stack = crud.get_stack(db=db, stack_id=stack_id)
    if db_stack is None:
        raise HTTPException(status_code=404, detail="Stack not found")
    return db_stack
