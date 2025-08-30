from sqlalchemy.orm import Session
import models, schemas

def create_stack(db: Session, stack: schemas.StackCreate):
    db_stack = models.Stack(name=stack.name, description=stack.description)
    db.add(db_stack)
    db.commit()
    db.refresh(db_stack)
    return db_stack

def get_stacks(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Stack).offset(skip).limit(limit).all()

def get_stack(db: Session, stack_id: int):
    return db.query(models.Stack).filter(models.Stack.id == stack_id).first()


def create_document_for_stack(db: Session, document: schemas.DocumentCreate, stack_id: int):
    db_document = models.Document(**document.model_dump(), stack_id=stack_id)
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    return db_document

def update_stack_workflow(db: Session, stack_id: int, workflow: dict):
    db_stack = db.query(models.Stack).filter(models.Stack.id == stack_id).first()
    if db_stack:
        db_stack.workflow = workflow
        db.commit()
        db.refresh(db_stack)
    return db_stack
