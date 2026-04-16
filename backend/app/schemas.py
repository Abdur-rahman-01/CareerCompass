from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class StudentBase(BaseModel):
    full_name: str
    email: str
    year: int
    branch: str
    cgpa: float
    skills: str
    goals: str
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None

class StudentCreate(StudentBase):
    pass

class StudentUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    year: Optional[int] = None
    branch: Optional[str] = None
    cgpa: Optional[float] = None
    skills: Optional[str] = None
    goals: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None

class Student(StudentBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class OpportunityBase(BaseModel):
    title: str
    company: str
    type: str # e.g. internship, hackathon
    description: str
    required_skills: str
    url: str

class OpportunityCreate(OpportunityBase):
    pass

class Opportunity(OpportunityBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class EngagementBase(BaseModel):
    student_id: int
    opportunity_id: int
    status: str # saved, applied, rejected, accepted
    match_score: Optional[float] = None
    cover_letter_draft: Optional[str] = None

class EngagementCreate(EngagementBase):
    pass

class Engagement(EngagementBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
