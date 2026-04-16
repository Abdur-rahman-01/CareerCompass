from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
import random
import os

from .. import schemas, models
from ..database import get_db
from ..services.search import search_opportunities, SearchQuery

router = APIRouter()

@router.get("/", response_model=List[schemas.Opportunity])
async def list_opportunities(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Opportunity))
    return result.scalars().all()

@router.get("/match/{student_id}", response_model=List[schemas.Engagement])
async def get_matches(student_id: int, db: AsyncSession = Depends(get_db)):
    student_result = await db.execute(select(models.Student).where(models.Student.id == student_id))
    student = student_result.scalars().first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    opps_result = await db.execute(select(models.Opportunity))
    opportunities = opps_result.scalars().all()

    matches = []
    for opp in opportunities:
        score = random.uniform(60, 98)
        
        eng_result = await db.execute(
            select(models.Engagement).where(
                models.Engagement.student_id == student_id,
                models.Engagement.opportunity_id == opp.id
            )
        )
        engagement = eng_result.scalars().first()
        
        if not engagement:
            engagement = models.Engagement(
                student_id=student_id,
                opportunity_id=opp.id,
                status="saved",
                match_score=score,
                cover_letter_draft=f"Hi {opp.company} team, I'm {student.full_name} and I'm excited about the {opp.title} role..."
            )
            db.add(engagement)
        
        matches.append(engagement)

    await db.commit()
    return matches

@router.post("/audit")
async def audit_resume(student_id: int, opportunity_id: int, db: AsyncSession = Depends(get_db)):
    return {
        "score": 85,
        "strengths": ["Strong Python skills", "Relevant hackathon experience"],
        "gaps": ["Missing cloud deployment knowledge", "No specific Mention of SQL"],
        "suggestions": "Include your AWS certification and more details about your database projects."
    }

@router.post("/search")
async def search_for_opportunities(
    search_query: SearchQuery,
    db: AsyncSession = Depends(get_db)
):
    api_key = os.getenv("FIRECRAWL_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="FIRECRAWL_API_KEY not configured")
    
    results = await search_opportunities(search_query)
    
    opportunities = []
    for result in results:
        db_opp = models.Opportunity(
            title=result.title,
            company=result.company,
            type=result.type,
            description=result.description[:500],
            required_skills="",
            url=result.url
        )
        db.add(db_opp)
        opportunities.append(db_opp)
    
    await db.commit()
    
    for opp in opportunities:
        await db.refresh(opp)
    
    return opportunities

@router.post("/search/auto/{student_id}")
async def auto_search_for_student(student_id: int, db: AsyncSession = Depends(get_db)):
    student_result = await db.execute(select(models.Student).where(models.Student.id == student_id))
    student = student_result.scalars().first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    api_key = os.getenv("FIRECRAWL_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="FIRECRAWL_API_KEY not configured")
    
    keywords = f"{student.skills} {student.branch}"
    search_types = ["internship", "job", "scholarship"]
    
    all_results = []
    for search_type in search_types:
        query = SearchQuery(keywords=keywords, search_type=search_type)
        results = await search_opportunities(query)
        all_results.extend(results)
    
    opportunities = []
    for result in all_results[:15]:
        db_opp = models.Opportunity(
            title=result.title,
            company=result.company,
            type=result.type,
            description=result.description[:500],
            required_skills=student.skills,
            url=result.url
        )
        db.add(db_opp)
        opportunities.append(db_opp)
    
    await db.commit()
    
    for opp in opportunities:
        await db.refresh(opp)
    
    return opportunities
