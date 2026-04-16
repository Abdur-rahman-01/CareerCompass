from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    year = Column(Integer)
    branch = Column(String)
    cgpa = Column(Float)
    skills = Column(String) # Comma-separated list for simplicity
    goals = Column(Text)
    github_url = Column(String, nullable=True)
    linkedin_url = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Opportunity(Base):
    __tablename__ = "opportunities"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    company = Column(String, index=True)
    type = Column(String) # e.g., 'internship', 'hackathon'
    description = Column(Text)
    required_skills = Column(String)
    url = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Engagement(Base):
    __tablename__ = "engagements"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    opportunity_id = Column(Integer, ForeignKey("opportunities.id"))
    status = Column(String) # 'saved', 'applied', 'rejected', 'accepted'
    match_score = Column(Float, nullable=True)
    cover_letter_draft = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    student = relationship("Student")
    opportunity = relationship("Opportunity")
