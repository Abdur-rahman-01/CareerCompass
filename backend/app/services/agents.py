import os
from typing import List, Dict, Optional, Any
from pydantic import BaseModel

class OpportunityData(BaseModel):
    title: str
    company: str
    description: str
    url: str
    type: str
    required_skills: str = ""
    location: Optional[str] = None

class StudentProfile(BaseModel):
    id: int
    full_name: str
    email: str
    year: int
    branch: str
    cgpa: float
    skills: str
    goals: str
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None

class AuditResult(BaseModel):
    score: int
    strengths: List[str]
    gaps: List[str]
    suggestions: str

class MatchResult(BaseModel):
    opportunity: Dict
    match_score: float
    matched_skills: List[str]
    missing_skills: List[str]
    reasoning: str

def get_llm_response(messages: List[Dict]) -> str:
    try:
        api_key = os.environ.get("GEMINI_API_KEY", "")
        if not api_key or api_key == "AIzaSyDemo":
            return None
        
        from litellm import completion
        response = completion(
            model="gemini/gemini-2.0-flash",
            messages=messages,
            api_key=api_key
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"LLM Error: {e}")
        return None

class ScoutAgent:
    role = "Opportunity Scout"
    goal = "Continuously discover relevant opportunities across multiple platforms before deadlines"
    backstory = "An autonomous data collector specialized in navigating fragmented web sources, prioritizing freshness, diversity, and completeness of opportunity data."

    def search_opportunities(self, keywords: str, search_type: str = "internship") -> List[OpportunityData]:
        prompt = f"""As an Opportunity Scout, search and discover current {search_type} opportunities for: {keywords}

For each opportunity found, extract:
- Title
- Company name
- Description
- URL/link
- Type (internship/job/hackathon/scholarship)
- Required skills (if mentioned)
- Location (if mentioned)

Return as JSON array only:
[
  {{"title": "...", "company": "...", "description": "...", "url": "...", "type": "...", "required_skills": "...", "location": "..."}}
]

Focus on real, current opportunities with complete information."""

        result = get_llm_response([{"role": "user", "content": prompt}])
        
        if not result:
            return self._fallback_opportunities(keywords, search_type)
        
        opportunities = []
        try:
            import json
            data = json.loads(result) if result else []
            for item in data:
                opportunities.append(OpportunityData(**item))
        except:
            return self._fallback_opportunities(keywords, search_type)
        
        return opportunities

    def _fallback_opportunities(self, keywords: str, search_type: str) -> List[OpportunityData]:
        return [
            OpportunityData(
                title=f"{search_type.title()} Position at Tech Corp",
                company="Tech Corp",
                description=f"Excellent {search_type} opportunity for {keywords} students. Great learning opportunity with mentorship.",
                url="https://example.com/apply",
                type=search_type,
                required_skills=keywords,
                location="Remote/Hybrid"
            ),
            OpportunityData(
                title=f"Junior {search_type.title()} at StartupXYZ",
                company="StartupXYZ",
                description=f"Fast-growing startup looking for {keywords} enthusiasts. Great exposure to real-world projects.",
                url="https://startupxyz.com/careers",
                type=search_type,
                required_skills=keywords,
                location="Bangalore, India"
            ),
            OpportunityData(
                title=f"{search_type.title()} Program 2026",
                company="Global Tech Inc",
                description=f"Industry-leading {search_type} program for talented {keywords} students. Competitive stipend.",
                url="https://globaltech.com/internships",
                type=search_type,
                required_skills=keywords,
                location="Multiple Locations"
            )
        ]

class AnalyzerAgent:
    role = "Opportunity Analyzer"
    goal = "Transform unstructured opportunity data into structured, machine-readable insights"
    backstory = "An NLP specialist trained to extract structured meaning from noisy, inconsistent listings, identifying key attributes like skills, eligibility, deadlines, and expectations."

    def analyze_opportunity(self, raw_text: str) -> Dict[str, Any]:
        prompt = f"""As an Opportunity Analyzer, parse this listing and extract structured data:

{raw_text}

Extract and return as JSON only:
{{
  "title": "...",
  "company": "...",
  "type": "internship|job|hackathon|scholarship",
  "required_skills": ["skill1", "skill2"],
  "eligibility": "...",
  "deadline": "...",
  "location": "...",
  "experience_level": "fresher|junior|mid|senior",
  "stipend": "...",
  "duration": "..."
}}

If any field is missing, use null."""

        result = get_llm_response([{"role": "user", "content": prompt}])
        
        if not result:
            return self._fallback_analysis(raw_text)
        
        try:
            import json
            return json.loads(result) if result else {}
        except:
            return self._fallback_analysis(raw_text)

    def _fallback_analysis(self, raw_text: str) -> Dict[str, Any]:
        return {
            "type": "internship",
            "required_skills": [],
            "eligibility": "Open to all",
            "location": "Not specified"
        }

class MatchingAgent:
    role = "Matching Agent"
    goal = "Evaluate and rank opportunities based on alignment with student profiles"
    backstory = "A decision-making agent that compares user profiles with opportunity requirements using semantic similarity and constraint-based filtering."

    def match(self, student: StudentProfile, opportunities: List[OpportunityData]) -> List[MatchResult]:
        student_context = f"""
        Student: {student.full_name}
        Branch: {student.branch}
        Year: {student.year}
        CGPA: {student.cgpa}
        Skills: {student.skills}
        Career Goals: {student.goals}
        """

        results = []
        
        for opp in opportunities:
            prompt = f"""As a Matching Agent, evaluate how well this student matches this opportunity.

{student_context}

Opportunity:
- Title: {opp.title}
- Company: {opp.company}
- Description: {opp.description}
- Required Skills: {opp.required_skills}
- Type: {opp.type}

Analyze and return as JSON only:
{{
  "match_score": 0-100,
  "matched_skills": ["skill1", "skill2"],
  "missing_skills": ["skill3"],
  "reasoning": "2-3 sentence explanation",
  "recommendation": "highly_recommended|recommended|not_recommended"
}}"""

            result = get_llm_response([{"role": "user", "content": prompt}])
            
            if not result:
                match_result = self._fallback_match(student, opp)
            else:
                try:
                    import json
                    match_data = json.loads(result) if result else {}
                    match_result = MatchResult(
                        opportunity=opp.model_dump(),
                        match_score=float(match_data.get("match_score", 50)),
                        matched_skills=match_data.get("matched_skills", []),
                        missing_skills=match_data.get("missing_skills", []),
                        reasoning=match_data.get("reasoning", "Based on skill alignment")
                    )
                except:
                    match_result = self._fallback_match(student, opp)

            results.append(match_result)

        results.sort(key=lambda x: x.match_score, reverse=True)
        return results

    def _fallback_match(self, student: StudentProfile, opp: OpportunityData) -> MatchResult:
        student_skills = set(s.strip().lower() for s in student.skills.split(',') if s)
        opp_skills = set(s.strip().lower() for s in opp.required_skills.split(',') if s)
        
        matched = student_skills & opp_skills
        missing = opp_skills - student_skills
        
        if opp_skills:
            score = (len(matched) / len(opp_skills)) * 100
        else:
            score = 50
        
        cgpa_bonus = (student.cgpa / 10) * 10
        score = min(100, score + cgpa_bonus)
        
        return MatchResult(
            opportunity=opp.model_dump(),
            match_score=round(score, 1),
            matched_skills=list(matched),
            missing_skills=list(missing),
            reasoning=f"Matched {len(matched)} of {len(opp_skills)} required skills with CGPA bonus"
        )

class AuditAgent:
    role = "Application Audit Agent"
    goal = "Evaluate user readiness for a selected opportunity and generate tailored application materials"
    backstory = "A career advisor agent that analyzes resume-job fit, identifies gaps, and generates optimized cover letters and outreach messages."

    def audit_resume(self, student: StudentProfile, opportunity: OpportunityData) -> AuditResult:
        prompt = f"""As an Application Audit Agent, evaluate this student's resume fit for the opportunity.

Student Profile:
- Name: {student.full_name}
- Branch: {student.branch}
- Year: {student.year}
- CGPA: {student.cgpa}
- Skills: {student.skills}
- Goals: {student.goals}
- GitHub: {student.github_url or 'Not provided'}
- LinkedIn: {student.linkedin_url or 'Not provided'}

Opportunity:
- Title: {opportunity.title}
- Company: {opportunity.company}
- Description: {opportunity.description}
- Required Skills: {opportunity.required_skills}

Analyze and return as JSON only:
{{
  "score": 0-100,
  "strengths": ["strength1", "strength2"],
  "gaps": ["gap1", "gap2"],
  "suggestions": "detailed improvement suggestions"
}}"""

        result = get_llm_response([{"role": "user", "content": prompt}])
        
        if not result:
            return self._fallback_audit(student, opportunity)
        
        try:
            import json
            audit_data = json.loads(result) if result else {}
            return AuditResult(
                score=int(audit_data.get("score", 75)),
                strengths=audit_data.get("strengths", ["Strong technical foundation"]),
                gaps=audit_data.get("gaps", ["Limited industry experience"]),
                suggestions=audit_data.get("suggestions", "Focus on practical projects")
            )
        except:
            return self._fallback_audit(student, opportunity)

    def _fallback_audit(self, student: StudentProfile, opportunity: OpportunityData) -> AuditResult:
        student_skills = set(s.strip().lower() for s in student.skills.split(',') if s)
        opp_skills = set(s.strip().lower() for s in opportunity.required_skills.split(',') if s)
        
        matched = student_skills & opp_skills
        score = int((len(matched) / max(len(opp_skills), 1)) * 100)
        
        strengths = ["Strong CGPA: " + str(student.cgpa)]
        if matched:
            strengths.append(f"Relevant skills: {', '.join(list(matched)[:3]))}")
        
        gaps = []
        if missing := opp_skills - student_skills:
            gaps.append(f"Missing skills: {', '.join(list(missing)[:3]))}")
        
        return AuditResult(
            score=min(100, score + 20),
            strengths=strengths,
            gaps=gaps if gaps else ["No major gaps identified"],
            suggestions="Focus on projects that demonstrate the missing skills"
        )

    def generate_cover_letter(self, student: StudentProfile, opportunity: OpportunityData) -> str:
        prompt = f"""As an Application Audit Agent, write a tailored cover letter for this application.

Student: {student.full_name}, {student.branch} student, CGPA {student.cgpa}, skills: {student.skills}
Company: {opportunity.company}
Position: {opportunity.title}
Role Description: {opportunity.description}

Write a professional, concise cover letter highlighting relevant skills and enthusiasm.
Keep it to 3-4 paragraphs, max 300 words."""

        result = get_llm_response([{"role": "user", "content": prompt}])
        
        if not result:
            return self._fallback_cover_letter(student, opportunity)
        
        return result

    def _fallback_cover_letter(self, student: StudentProfile, opportunity: OpportunityData) -> str:
        return f"""Dear Hiring Manager,

I am writing to express my interest in the {opportunity.title} position at {opportunity.company}. As a {student.branch} student with a CGPA of {student.cgpa}, I have developed strong technical skills in {student.skills}.

I am particularly excited about this opportunity because {opportunity.description[:100]}... My academic projects and coursework have prepared me well for this role.

I would welcome the opportunity to discuss how my skills and enthusiasm can contribute to your team.

Sincerely,
{student.full_name}"""

class LearningAgent:
    role = "Learning Agent"
    goal = "Continuously improve recommendations based on user behavior and feedback"
    backstory = "An adaptive agent that learns from user interactions, refining its matching criteria based on application outcomes and preferences."

    def analyze_feedback(self, student_id: int, opportunity_id: int, action: str, feedback: str = "") -> Dict:
        prompt = f"""As a Learning Agent, analyze this user action to improve future recommendations.

Student ID: {student_id}
Opportunity ID: {opportunity_id}
Action: {action} (viewed/applied/saved/dismissed)
Feedback: {feedback}

Analyze patterns and return insights as JSON only:
{{
  "insights": ["insight1", "insight2"],
  "updated_weights": {{"skill_match": 0.4, "cgpa": 0.15}},
  "recommendations": ["recommendation1"]
}}"""

        result = get_llm_response([{"role": "user", "content": prompt}])
        
        if not result:
            return self._fallback_learning(student_id, opportunity_id, action)
        
        try:
            import json
            return json.loads(result) if result else {}
        except:
            return self._fallback_learning(student_id, opportunity_id, action)

    def _fallback_learning(self, student_id: int, opportunity_id: int, action: str) -> Dict:
        action_weights = {
            "viewed": {"skill_match": 0.3, "cgpa": 0.2, "location": 0.2},
            "saved": {"skill_match": 0.5, "cgpa": 0.15, "location": 0.15},
            "applied": {"skill_match": 0.6, "cgpa": 0.1, "location": 0.1},
            "dismissed": {"skill_match": 0.2, "cgpa": 0.3, "location": 0.3}
        }
        
        return {
            "insights": [f"User performed action: {action}"],
            "updated_weights": action_weights.get(action, action_weights["viewed"]),
            "recommendations": ["Continue learning from user patterns"]
        }

scout = ScoutAgent()
analyzer = AnalyzerAgent()
matcher = MatchingAgent()
auditor = AuditAgent()
learner = LearningAgent()