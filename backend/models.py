from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.orm import relationship
import datetime

from database import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True)
    upload_date = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String, default="uploaded")
    stack_id = Column(Integer, ForeignKey("stacks.id"))

    owner = relationship("Stack", back_populates="documents")

class Stack(Base):
    __tablename__ = "stacks"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)

    workflow = Column(JSON, nullable=True) 

    documents = relationship("Document", back_populates="owner")
