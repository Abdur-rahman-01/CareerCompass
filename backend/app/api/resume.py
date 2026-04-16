from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Dict, Set, Tuple
import re
from collections import Counter

from .. import schemas, models
from ..database import get_db

router = APIRouter()

SKILL_ALIASES: Dict[str, Set[str]] = {
    'react': {'react', 'react.js', 'reactjs', 'reactjs'},
    'angular': {'angular', 'angularjs', 'angular.js'},
    'vue': {'vue', 'vue.js', 'vuejs'},
    'node': {'node', 'node.js', 'nodejs'},
    'python': {'python', 'python3', 'py'},
    'javascript': {'javascript', 'js', 'ecmascript'},
    'typescript': {'typescript', 'ts'},
    'java': {'java', 'j2se', 'j2ee'},
    'csharp': {'c#', 'csharp', 'c sharp'},
    'cpp': {'c++', 'cpp', 'c plus plus'},
    'ml': {'machine learning', 'ml', 'machinelearning'},
    'dl': {'deep learning', 'dl', 'deeplearning', 'neural networks'},
    'ai': {'artificial intelligence', 'ai', 'ai/ml'},
    'aws': {'aws', 'amazon web services', 'amazon ws'},
    'gcp': {'gcp', 'google cloud', 'google cloud platform'},
    'azure': {'azure', 'microsoft azure'},
    'sql': {'sql', 'mysql', 'postgresql', 'postgres', 'sqlite', 'mssql'},
    'nosql': {'nosql', 'mongodb', 'cassandra', 'dynamodb', 'redis'},
    'docker': {'docker', 'docker-container', 'containerization'},
    'kubernetes': {'kubernetes', 'k8s', 'kubes'},
    'git': {'git', 'github', 'gitlab', 'version control'},
    'web': {'web development', 'web', 'full stack', 'fullstack'},
    'frontend': {'frontend', 'front-end', 'front end', 'ui'},
    'backend': {'backend', 'back-end', 'back end', 'server'},
    'devops': {'devops', 'ci/cd', 'cicd', 'sre'},
    'data': {'data science', 'data analysis', 'analytics'},
}

SKILL_CATEGORIES: Dict[str, float] = {
    'programming': 1.0,
    'framework': 1.2,
    'database': 0.9,
    'cloud': 1.3,
    'devops': 1.2,
    'ml_ai': 1.5,
    'soft_skills': 0.7,
    'tools': 0.8,
}

CATEGORY_WEIGHTS = {
    'programming': 0.8,
    'framework': 1.0,
    'database': 0.7,
    'cloud': 1.1,
    'devops': 1.0,
    'ml_ai': 1.4,
    'soft_skills': 0.5,
    'tools': 0.6,
}

def normalize_skill(skill: str) -> str:
    skill = skill.lower().strip()
    skill = re.sub(r'[._\-]', ' ', skill)
    skill = re.sub(r'\s+', ' ', skill)
    return skill

def get_skill_variants(skill: str) -> Set[str]:
    normalized = normalize_skill(skill)
    variants = {normalized}
    for canonical, aliases in SKILL_ALIASES.items():
        if normalized in aliases or normalized == canonical:
            variants.update(aliases)
            variants.add(canonical)
    return variants

def fuzzy_match(skill: str, against: Set[str]) -> Tuple[bool, float]:
    skill_normalized = normalize_skill(skill)
    variants = get_skill_variants(skill)
    
    for variant in variants:
        if variant in against:
            return True, 1.0
        if variant[:4] in against or any(variant.startswith(v[:4]) for v in against):
            return True, 0.8
    
    for a in against:
        if len(skill_normalized) >= 4 and len(a) >= 4:
            if skill_normalized[:4] == a[:4]:
                return True, 0.6
            if skill_normalized[:3] == a[:3]:
                return True, 0.5
    
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

def calculate_keyword_match(text1: str, text2: str) -> float:
    words1 = set(normalize_skill(w) for w in text1.split() if len(w) > 2)
    words2 = set(normalize_skill(w) for w in text2.split() if len(w) > 2)
    return jaccard_similarity(words1, words2)

def extract_skills(text: str) -> Set[str]:
    all_known_skills: Set[str] = set()
    for aliases in SKILL_ALIASES.values():
        all_known_skills.update(aliases)
    
    text_normalized = normalize_skill(text)
    found_skills: Set[str] = set()
    
    for skill in all_known_skills:
        if skill in text_normalized:
            for canonical, aliases in SKILL_ALIASES.items():
                if skill in aliases:
                    found_skills.add(canonical)
                    break
    
    return found_skills

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
    opp_skill_set = set(normalize_skill(s) for s in opp_required_skills.split(',') if s) if opp_required_skills else set()
    
    matched_skills: List[Tuple[str, float]] = []
    missing_skills: List[str] = []
    
    for opp_skill in opp_skill_set:
        matched = False
        best_score = 0.0
        
        for student_skill in student_skill_set:
            is_match, score = fuzzy_match(student_skill, get_skill_variants(opp_skill))
            if is_match and score > best_score:
                best_score = score
                matched = True
        
        if matched:
            matched_skills.append((opp_skill, best_score))
        else:
            missing_skills.append(opp_skill)
    
    skill_match_score = sum(score for _, score in matched_skills)
    
    if opp_skill_set:
        raw_skill_score = (len(matched_skills) / len(opp_skill_set)) * 100
        weighted_skill_score = (skill_match_score / len(opp_skill_set)) * 100 if matched_skills else 0
        final_skill_score = (raw_skill_score * 0.4) + (weighted_skill_score * 0.6)
    else:
        final_skill_score = 30.0
    
    jaccard = jaccard_similarity(student_skill_set, opp_skill_set) * 100
    dice = dice_coefficient(student_skill_set, opp_skill_set) * 100
    
    similarity_score = (jaccard * 0.5) + (dice * 0.5)
    
    keyword_score = 0.0
    if student_goals and opp_title:
        keyword_score += calculate_keyword_match(student_goals, opp_title) * 25
    if student_branch and opp_description:
        keyword_score += calculate_keyword_match(student_branch, opp_description) * 15
    
    goal_alignment = 0.0
    if student_goals:
        goal_keywords = normalize_skill(student_goals).split()
        title_desc = f"{opp_title} {opp_description}".lower()
        goal_matches = sum(1 for kw in goal_keywords if kw in title_desc and len(kw) > 3)
        goal_alignment = min(20, goal_matches * 5)
    
    cgpa_score = min(15, (student_cgpa / 10.0) * 15)
    
    final_score = (
        final_skill_score * 0.40 +
        similarity_score * 0.20 +
        keyword_score * 0.15 +
        goal_alignment * 0.10 +
        cgpa_score * 0.15
    )
    
    final_score = min(100.0, max(0.0, final_score))
    
    return {
        "skill_score": round(final_skill_score, 1),
        "jaccard": round(jaccard, 1),
        "dice": round(dice, 1),
        "keyword_match": round(keyword_score, 1),
        "goal_alignment": round(goal_alignment, 1),
        "cgpa_contribution": round(cgpa_score, 1),
        "matched_skills": [s for s, _ in matched_skills],
        "missing_skills": missing_skills,
        "final_score": round(final_score, 1)
    }

@router.post("/parse")
async def parse_resume(
    file: UploadFile = File(...),
    student_id: int = Form(...),
    db: AsyncSession = Depends(get_db)
):
    student_result = await db.execute(select(models.Student).where(models.Student.id == student_id))
    student = student_result.scalars().first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    filename = file.filename or ""
    if not (filename.endswith('.pdf') or filename.endswith('.docx')):
        raise HTTPException(status_code=400, detail="Unsupported file format")
    
    extracted_skills: List[str] = []
    extracted_name = student.full_name or ""
    extracted_email = student.email or ""
    
    if student.skills and isinstance(student.skills, str):
        skill_list = [s.strip() for s in student.skills.split(',')]
        extracted_skills.extend([s for s in skill_list if s])
    
    common_skills = [
        'python', 'javascript', 'typescript', 'java', 'c++', 'c#', 'golang', 'rust',
        'react', 'next.js', 'vue', 'angular', 'node.js', 'express', 'django', 'flask',
        'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'graphql', 'rest', 'api',
        'aws', 'gcp', 'azure', 'docker', 'kubernetes', 'jenkins', 'git', 'github',
        'machine learning', 'deep learning', 'data science', 'nlp', 'computer vision',
        'html', 'css', 'sass', 'tailwind', 'bootstrap', 'figma', 'ui/ux',
        'linux', 'bash', 'shell', 'ci/cd', 'devops', 'agile', 'scrum',
        'tensorflow', 'pytorch', 'pandas', 'numpy', 'scikit-learn', 'keras',
    ]
    
    profile_parts = [
        student.full_name or '',
        student.email or '',
        student.skills or '',
        student.goals or '',
        student.branch or ''
    ]
    profile_text = ' '.join(profile_parts)
    
    for skill in common_skills:
        normalized = normalize_skill(skill)
        if normalized in profile_text.lower() and skill not in [normalize_skill(s) for s in extracted_skills]:
            for canonical, aliases in SKILL_ALIASES.items():
                if normalized in aliases:
                    if canonical not in [normalize_skill(s) for s in extracted_skills]:
                        extracted_skills.append(canonical)
                    break
    
    opps_result = await db.execute(select(models.Opportunity))
    opportunities = opps_result.scalars().all()
    
    matches: List[dict] = []
    for opp in opportunities:
        match_result = calculate_advanced_match(
            student_skills=extracted_skills,
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
            "breakdown": {
                "skill_match": match_result["skill_score"],
                "jaccard_similarity": match_result["jaccard"],
                "dice_coefficient": match_result["dice"],
                "keyword_match": match_result["keyword_match"],
                "goal_alignment": match_result["goal_alignment"],
                "cgpa_contribution": match_result["cgpa_contribution"],
            },
            "matchedSkills": match_result["matched_skills"],
            "missingSkills": match_result["missing_skills"],
        })
    
    matches.sort(key=lambda x: x["matchScore"], reverse=True)
    
    return {
        "parsed": True,
        "name": extracted_name,
        "email": extracted_email,
        "skills": extracted_skills[:20],
        "experience": [f"Student at {student.branch}"],
        "education": [f"Year {student.year}, CGPA: {student.cgpa}"],
        "matches": matches[:10]
    }

@router.get("/skill-extract")
async def extract_skills_from_text(text: str):
    skills = extract_skills(text)
    return {"skills": list(skills)}