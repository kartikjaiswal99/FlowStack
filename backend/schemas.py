from pydantic import BaseModel
from typing import List, Optional, Dict, Any 
import datetime

class DocumentBase(BaseModel):
    filename: str
    status: str

class DocumentCreate(DocumentBase):
    pass

class Document(DocumentBase):
    id: int
    stack_id: int
    upload_date: datetime.datetime

    class Config:
        from_attributes = True

class StackBase(BaseModel):
    name: str
    description: Optional[str] = None

class StackCreate(StackBase):
    pass


class StackUpdate(BaseModel):
    workflow: Dict[str, Any]

class Stack(StackBase):
    id: int
    documents: List[Document] = []
    workflow: Optional[Dict[str, Any]] = None 

    class Config:
        from_attributes = True


class ChatRequest(BaseModel):
    workflow: dict
    query: str