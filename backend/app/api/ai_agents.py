from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
import json

from .. import schemas, models
from ..database import get_db
from ..services.agents import (
    ScoutAgent, AnalyzerAgent, MatchingAgent, AuditAgent, LearningAgent,
    StudentProfile, OpportunityData
)

router = APIRouter()

scout = ScoutAgent()
analyzer = AnalyzerAgent()
matcher = MatchingAgent()
auditor = AuditAgent()
learner = LearningAgent()

@router.post("/ai-search")
async def ai_search_opportunities(
    student_id: int,
    keywords: str = "",
    search_type: str = "internship",
    db: AsyncSession = Depends(get_db)
):
    student_result = await db.execute(select(models.Student).where(models.Student.id == student_id))
    student = student_result.scalars().first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    search_keywords = keywords or f"{student.skills} {student.branch} {student.goals}"
    
    opportunities = scout.search_opportunities(search_keywords, search_type)
    
    analyzed_opportunities = []
    for opp in opportunities:
        analysis = analyzer.analyze_opportunity(f"{opp.title} at {opp.company}: {opp.description}")
        analyzed_opportunities.append({
            **opp.model_dump(),
            "analysis": analysis
        })
    
    return {
        "student": student.full_name,
        "search_params": {"keywords": search_keywords, "type": search_type},
        "opportunities": analyzed_opportunities,
        "count": len(analyzed_opportunities)
    }

@router.post("/ai-match")
async def ai_match_opportunities(
    student_id: int,
    db: AsyncSession = Depends(get_db)
):
    student_result = await db.execute(select(models.Student).where(models.Student.id == student_id))
    student = student_result.scalars().first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    opps_result = await db.execute(select(models.Opportunity))
    opportunities = opps_result.scalars().all()
    
    if not opportunities:
        return {
            "matches": [],
            "message": "No opportunities in database. Use /ai-search to discover new opportunities."
        }
    
    student_profile = StudentProfile(
        id=student.id,
        full_name=student.full_name or "",
        email=student.email or "",
        year=student.year or 1,
        branch=student.branch or "",
        cgpa=float(student.cgpa or 0),
        skills=student.skills or "",
        goals=student.goals or "",
        github_url=student.github_url,
        linkedin_url=student.linkedin_url
    )
    
    opp_data_list = []
    for opp in opportunities:
        opp_data_list.append(OpportunityData(
            title=opp.title or "",
            company=opp.company or "",
            description=opp.description or "",
            url=opp.url or "",
            type=opp.type or "",
            required_skills=opp.required_skills or ""
        ))
    
    match_results = matcher.match(student_profile, opp_data_list)
    
    for i, result in enumerate(match_results):
        if opportunities[i].id:
            result.opportunity["id"] = opportunities[i].id
    
    return {
        "student": student.full_name,
        "matches": [
            {
                "opportunity": r.opportunity,
                "match_score": r.match_score,
                "matched_skills": r.matched_skills,
                "missing_skills": r.missing_skills,
                "reasoning": r.reasoning
            }
            for r in match_results
        ]
    }

@router.post("/ai-audit")
async def ai_audit_resume(
    student_id: int,
    opportunity_id: int,
    db: AsyncSession = Depends(get_db)
):
    student_result = await db.execute(select(models.Student).where(models.Student.id == student_id))
    student = student_result.scalars().first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    opp_result = await db.execute(select(models.Opportunity).where(models.Opportunity.id == opportunity_id))
    opportunity = opp_result.scalars().first()
    if not opportunity:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    
    student_profile = StudentProfile(
        id=student.id,
        full_name=student.full_name or "",
        email=student.email or "",
        year=student.year or 1,
        branch=student.branch or "",
        cgpa=float(student.cgpa or 0),
        skills=student.skills or "",
        goals=student.goals or "",
        github_url=student.github_url,
        linkedin_url=student.linkedin_url
    )
    
    opp_data = OpportunityData(
        title=opportunity.title or "",
        company=opportunity.company or "",
        description=opportunity.description or "",
        url=opportunity.url or "",
        type=opportunity.type or "",
        required_skills=opportunity.required_skills or ""
    )
    
    audit_result = auditor.audit_resume(student_profile, opp_data)
    
    learner.analyze_feedback(student_id, opportunity_id, "audited")
    
    return {
        "student": student.full_name,
        "opportunity": {
            "title": opportunity.title,
            "company": opportunity.company
        },
        "audit": audit_result.model_dump()
    }

@router.post("/ai-cover-letter")
async def ai_generate_cover_letter(
    student_id: int,
    opportunity_id: int,
    db: AsyncSession = Depends(get_db)
):
    student_result = await db.execute(select(models.Student).where(models.Student.id == student_id))
    student = student_result.scalars().first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    opp_result = await db.execute(select(models.Opportunity).where(models.Opportunity.id == opportunity_id))
    opportunity = opp_result.scalars().first()
    if not opportunity:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    
    student_profile = StudentProfile(
        id=student.id,
        full_name=student.full_name or "",
        email=student.email or "",
        year=student.year or 1,
        branch=student.branch or "",
        cgpa=float(student.cgpa or 0),
        skills=student.skills or "",
        goals=student.goals or "",
        github_url=student.github_url,
        linkedin_url=student.linkedin_url
    )
    
    opp_data = OpportunityData(
        title=opportunity.title or "",
        company=opportunity.company or "",
        description=opportunity.description or "",
        url=opportunity.url or "",
        type=opportunity.type or "",
        required_skills=opportunity.required_skills or ""
    )
    
    cover_letter = auditor.generate_cover_letter(student_profile, opp_data)
    
    learner.analyze_feedback(student_id, opportunity_id, "generated_cover_letter")
    
    return {
        "student": student.full_name,
        "opportunity": {
            "title": opportunity.title,
            "company": opportunity.company
        },
        "cover_letter": cover_letter
    }

@router.post("/ai-feedback")
async def ai_process_feedback(
    student_id: int,
    opportunity_id: int,
    action: str,
    feedback: str = "",
    db: AsyncSession = Depends(get_db)
):
    result = learner.analyze_feedback(student_id, opportunity_id, action, feedback)
    
    return {
        "feedback_result": result,
        "message": "Feedback processed successfully"
    }

@router.get("/agents-status")
async def get_agents_status():
    return {
        "agents": {
            "scout": "Active - Discovers opportunities via LLM",
            "analyzer": "Active - Standardizes opportunity data",
            "matcher": "Active - Ranks opportunities by fit",
            "auditor": "Active - Evaluates resume-job fit",
            "learner": "Active - Improves from user behavior"
        },
        "model": "gemini/gemini-2.0-flash",
        "status": "Ready"
    }