from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Dict, Set, Tuple
import re

from .. import schemas, models
from ..database import get_db
from ..services.resume_parser import extract_text_from_file, parse_resume_with_ai
from ..utils import normalize_skill, SKILL_ALIASES

router = APIRouter()

def get_skill_variants(skill: str) -> Set[str]:
    normalized = normalize_skill(skill)
    variants = {normalized}
    for canonical, aliases in SKILL_ALIASES.items():
        if normalized == canonical:
            variants.update(aliases)
    return variants

def fuzzy_match(skill: str, against: Set[str]) -> Tuple[bool, float]:
    skill_normalized = normalize_skill(skill)
    
    # Direct match on normalized skill or any of its variants
    if skill_normalized in against:
        return True, 1.0
    
    # Prefix matching for variants
    for a in against:
        if len(skill_normalized) >= 4 and len(a) >= 4:
            if skill_normalized[:4] == a[:4]:
                return True, 0.7
    
    return False, 0.0

def jaccard_similarity(set1: Set[str], set2: Set[str]) -> float:
    if not set1 or not set2:
        return 0.0
    intersection = len(set1 & set2)
    union = len(set1 | set2)
    return intersection / union if union > 0 else 0.0

def dice_coefficient(set1: Set[str], set2: Set[str]) -> float:
    if not set1 or not set2:
        return 0.0
    intersection = len(set1 & set2)
    return (2 * intersection) / (len(set1) + len(set2))

def calculate_advanced_match(
    student_skills: List[str],
    student_goals: str,
    student_branch: str,
    student_cgpa: float,
    opp_required_skills: str,
    opp_description: str,
    opp_title: str
) -> Dict:
    student_skill_set = set(normalize_skill(s) for s in student_skills if s)
    opp_required_skills_list = [s.strip() for s in opp_required_skills.split(',')] if opp_required_skills else []
    opp_skill_set = set(normalize_skill(s) for s in opp_required_skills_list if s)
    
    matched_skills: List[str] = []
    missing_skills: List[str] = []
    
    for opp_skill in opp_skill_set:
        best_score = 0.0
        opp_variants = get_skill_variants(opp_skill)
        
        is_matched = False
        for student_skill in student_skill_set:
            match, score = fuzzy_match(student_skill, opp_variants)
            if match:
                is_matched = True
                break
        
        if is_matched:
            matched_skills.append(opp_skill)
        else:
            missing_skills.append(opp_skill)
    
    # Calculate Score
    skill_score = (len(matched_skills) / len(opp_skill_set) * 100) if opp_skill_set else 30.0
    
    jaccard = jaccard_similarity(student_skill_set, opp_skill_set) * 100
    dice = dice_coefficient(student_skill_set, opp_skill_set) * 100
    similarity_score = (jaccard * 0.5) + (dice * 0.5)
    
    cgpa_score = min(15, (student_cgpa / 10.0) * 15)
    
    final_score = (
        skill_score * 0.60 +
        similarity_score * 0.20 +
        cgpa_score * 0.20
    )
    
    final_score = min(100.0, max(0.0, final_score))
    
    return {
        "final_score": round(final_score, 1),
        "skill_score": round(skill_score, 1),
        "jaccard": round(jaccard, 1),
        "dice": round(dice, 1),
        "cgpa_contribution": round(cgpa_score, 1),
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
    }

@router.post("/parse")
async def parse_resume(
    file: UploadFile = File(...),
    student_id: int = Form(...),
    db: AsyncSession = Depends(get_db)
):
    # 1. Verify Student
    student_result = await db.execute(select(models.Student).where(models.Student.id == student_id))
    student = student_result.scalars().first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # 2. Extract Text
    content = await file.read()
    raw_text = extract_text_from_file(content, file.filename)
    if not raw_text:
        raise HTTPException(status_code=400, detail="Failed to extract text from file")
    
    # 3. Parse with AI
    try:
        parsed_data = await parse_resume_with_ai(raw_text)
        if not parsed_data:
            raise HTTPException(status_code=503, detail="The AI brain is currently busy processing other clusters. Please try again in a few moments.")
        
        if "error" in parsed_data:
            # Handle specific known errors (like Quota Exceeded)
            if parsed_data["error"] == "QUOTA_EXCEEDED":
                raise HTTPException(status_code=429, detail=parsed_data.get("message", "AI Quota Exceeded"))
            raise HTTPException(status_code=503, detail=parsed_data.get("message", "AI Service Error"))
    except HTTPException:
        raise
    except Exception as e:
        print(f"Critical Parsing Failure: {e}")
        raise HTTPException(status_code=500, detail="A neural sync error occurred. Our agents are investigating.")

    # 4. Sync with Database (Consistancy Layer)
    if not student.full_name or student.full_name == "New Student":
        student.full_name = parsed_data.get("full_name", student.full_name)
    
    if parsed_data.get("branch") and (not student.branch or student.branch == "Not Specified"):
        student.branch = parsed_data.get("branch")
        
    if parsed_data.get("cgpa") and (not student.cgpa or student.cgpa == 0.0):
        try:
            student.cgpa = float(parsed_data.get("cgpa"))
        except: pass
        
    if parsed_data.get("year") and (not student.year or student.year == 1):
        try:
            student.year = int(parsed_data.get("year"))
        except: pass

    # Skills Merging & Normalization
    existing_skills = set(normalize_skill(s) for s in (student.skills or "").split(',') if s.strip())
    new_skills = set(normalize_skill(s) for s in parsed_data.get("skills", []) if s.strip())
    merged_skills = sorted(list(existing_skills | new_skills))
    student.skills = ", ".join(merged_skills)
    
    # Commit changes
    await db.commit()
    await db.refresh(student)

    # 5. Calculate Matches with updated profile
    opps_result = await db.execute(select(models.Opportunity))
    opportunities = opps_result.scalars().all()
    
    matches: List[dict] = []
    student_skill_list = [s.strip() for s in (student.skills or "").split(',') if s.strip()]
    
    for opp in opportunities:
        match_result = calculate_advanced_match(
            student_skills=student_skill_list,
            student_goals=student.goals or "",
            student_branch=student.branch or "",
            student_cgpa=student.cgpa or 0.0,
            opp_required_skills=opp.required_skills or "",
            opp_description=opp.description or "",
            opp_title=opp.title or ""
        )
        
        matches.append({
            "opportunity": {
                "id": opp.id,
                "title": opp.title or "",
                "company": opp.company or "",
                "type": opp.type or "",
                "description": opp.description or "",
                "required_skills": opp.required_skills or "",
                "url": opp.url or "",
            },
            "matchScore": match_result["final_score"],
            "matchedSkills": match_result["matched_skills"],
            "missingSkills": match_result["missing_skills"],
        })
    
    matches.sort(key=lambda x: x["matchScore"], reverse=True)
    
    return {
        "parsed": True,
        "name": student.full_name,
        "email": student.email,
        "skills": student_skill_list[:25],
        "experience": parsed_data.get("experience", []),
        "education": parsed_data.get("education", []),
        "matches": matches[:10]
    }