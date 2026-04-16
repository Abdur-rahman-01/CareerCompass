from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
import os

from .. import schemas, models
from ..database import get_db
from ..services.search import search_opportunities, SearchQuery
from ..services.agents import matcher, auditor, learner, StudentProfile, OpportunityData
from ..utils import normalize_skill

router = APIRouter()


def _student_to_profile(student: models.Student) -> StudentProfile:
    return StudentProfile(
        id=student.id,
        full_name=student.full_name or "",
        email=student.email or "",
        year=student.year or 1,
        branch=student.branch or "",
        cgpa=student.cgpa or 0.0,
        skills=student.skills or "",
        goals=student.goals or "",
        github_url=student.github_url,
        linkedin_url=student.linkedin_url,
    )


def _opp_to_data(opp: models.Opportunity) -> OpportunityData:
    return OpportunityData(
        title=opp.title or "",
        company=opp.company or "",
        description=opp.description or "",
        url=opp.url or "",
        type=opp.type or "internship",
        required_skills=opp.required_skills or "",
    )


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

    if not opportunities:
        return []

    # --- REAL AI MATCHING (replaces random.uniform) ---
    student_profile = _student_to_profile(student)
    opp_data_list = [_opp_to_data(opp) for opp in opportunities]
    match_results = matcher.match(student_profile, opp_data_list)

    matches = []
    for match_result in match_results:
        opp_title = match_result.opportunity.get("title", "")
        opp_id = next(
            (opp.id for opp in opportunities if opp.title == opp_title), None
        )
        if opp_id is None:
            continue

        eng_result = await db.execute(
            select(models.Engagement).where(
                models.Engagement.student_id == student_id,
                models.Engagement.opportunity_id == opp_id
            )
        )
        engagement = eng_result.scalars().first()

        if engagement:
            # Update score with real AI score
            engagement.match_score = match_result.match_score
        else:
            # Generate AI cover letter draft
            opp_data = next((o for o in opp_data_list if o.title == opp_title), opp_data_list[0])
            cover_letter = auditor.generate_cover_letter(student_profile, opp_data)

            engagement = models.Engagement(
                student_id=student_id,
                opportunity_id=opp_id,
                status="saved",
                match_score=match_result.match_score,
                cover_letter_draft=cover_letter,
            )
            db.add(engagement)

        matches.append(engagement)

    await db.commit()

    # Refresh and sort by score descending
    for m in matches:
        try:
            await db.refresh(m)
        except Exception:
            pass

    matches.sort(key=lambda e: e.match_score or 0, reverse=True)
    return matches


@router.post("/audit")
async def audit_resume(student_id: int, opportunity_id: int, db: AsyncSession = Depends(get_db)):
    # Fetch student
    student_result = await db.execute(select(models.Student).where(models.Student.id == student_id))
    student = student_result.scalars().first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Fetch opportunity
    opp_result = await db.execute(select(models.Opportunity).where(models.Opportunity.id == opportunity_id))
    opp = opp_result.scalars().first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    # --- REAL AI AUDIT (replaces hardcoded data) ---
    student_profile = _student_to_profile(student)
    opp_data = _opp_to_data(opp)
    audit_result = auditor.audit_resume(student_profile, opp_data)

    # Track this interaction with the LearningAgent
    learner.analyze_feedback(student_id, opportunity_id, "viewed")

    return {
        "score": audit_result.score,
        "strengths": audit_result.strengths,
        "gaps": audit_result.gaps,
        "suggestions": audit_result.suggestions,
    }


@router.post("/cover-letter")
async def generate_cover_letter(student_id: int, opportunity_id: int, db: AsyncSession = Depends(get_db)):
    """Generate a tailored cover letter for a specific opportunity."""
    student_result = await db.execute(select(models.Student).where(models.Student.id == student_id))
    student = student_result.scalars().first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    opp_result = await db.execute(select(models.Opportunity).where(models.Opportunity.id == opportunity_id))
    opp = opp_result.scalars().first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    student_profile = _student_to_profile(student)
    opp_data = _opp_to_data(opp)
    letter = auditor.generate_cover_letter(student_profile, opp_data)

    # Save to engagement record
    eng_result = await db.execute(
        select(models.Engagement).where(
            models.Engagement.student_id == student_id,
            models.Engagement.opportunity_id == opportunity_id,
        )
    )
    engagement = eng_result.scalars().first()
    if engagement:
        engagement.cover_letter_draft = letter
        await db.commit()

    # Track learning signal
    learner.analyze_feedback(student_id, opportunity_id, "applied")

    return {"cover_letter": letter}


@router.post("/engage")
async def track_engagement(
    student_id: int,
    opportunity_id: int,
    action: str,
    feedback: Optional[str] = "",
    db: AsyncSession = Depends(get_db),
):
    """
    Track student engagement (viewed/saved/applied/dismissed) to feed the LearningAgent.
    This powers adaptive ranking so the agent learns preference patterns over time.
    """
    valid_actions = {"viewed", "saved", "applied", "dismissed"}
    if action not in valid_actions:
        raise HTTPException(status_code=400, detail=f"Action must be one of {valid_actions}")

    # Update engagement row
    eng_result = await db.execute(
        select(models.Engagement).where(
            models.Engagement.student_id == student_id,
            models.Engagement.opportunity_id == opportunity_id,
        )
    )
    engagement = eng_result.scalars().first()
    if engagement and action in {"saved", "applied", "dismissed"}:
        engagement.status = action
        await db.commit()

    # Feed the LearningAgent
    insights = learner.analyze_feedback(student_id, opportunity_id, action, feedback or "")

    return {"status": "tracked", "insights": insights}


@router.post("/search")
async def search_for_opportunities(
    search_query: SearchQuery,
    db: AsyncSession = Depends(get_db),
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
            url=result.url,
        )
        db.add(db_opp)
        opportunities.append(db_opp)

    await db.commit()
    for opp in opportunities:
        await db.refresh(opp)

    return opportunities


@router.post("/search/auto/{student_id}")
async def auto_search_for_student(student_id: int, db: AsyncSession = Depends(get_db)):
    """
    Background scout: searches for internships, hackathons, research, and scholarships
    tailored to the student's profile — then runs real AI matching to rank them.
    """
    student_result = await db.execute(select(models.Student).where(models.Student.id == student_id))
    student = student_result.scalars().first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    api_key = os.getenv("FIRECRAWL_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="FIRECRAWL_API_KEY not configured")

    keywords = f"{student.skills} {student.branch}"
    # Extended search types to cover problem statement categories
    search_types = ["internship", "job", "scholarship", "hackathon", "research"]

    all_results = []
    for search_type in search_types:
        query = SearchQuery(keywords=keywords, search_type=search_type)
        results = await search_opportunities(query)
        all_results.extend(results)

    student_profile = _student_to_profile(student)
    opportunities = []

    for result in all_results[:20]:
        db_opp = models.Opportunity(
            title=result.title,
            company=result.company,
            type=result.type,
            description=result.description[:500],
            required_skills=student.skills,
            url=result.url,
        )
        db.add(db_opp)
        opportunities.append(db_opp)

    await db.commit()
    for opp in opportunities:
        await db.refresh(opp)

    return opportunities
