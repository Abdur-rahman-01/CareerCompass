import os
import json
from typing import List, Dict, Optional
from pydantic import BaseModel
from crewai import Agent, Task, Crew, Process
from langchain_openai import ChatOpenAI


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


def get_llm():
    api_key = os.environ.get("GEMINI_API_KEY", "")
    if not api_key or api_key == "AIzaSyDemo":
        return None

    try:
        os.environ["OPENAI_API_KEY"] = api_key
        llm = ChatOpenAI(model="gemini/gemini-2.0-flash", api_key=api_key)
        return llm
    except Exception as e:
        print(f"LLM Init Error: {e}")
        return None


llm = None
try:
    llm = get_llm()
except:
    pass


ScoutAgent = Agent(
    role="Opportunity Scout",
    goal="Discover relevant opportunities across multiple platforms before deadlines",
    backstory="An autonomous data collector specialized in navigating fragmented web sources, prioritizing freshness, diversity, and completeness of opportunity data.",
    tools=[],
    llm=llm,
    verbose=True,
)

AnalyzerAgent = Agent(
    role="Opportunity Analyzer",
    goal="Transform unstructured opportunity data into structured, machine-readable insights",
    backstory="An NLP specialist trained to extract structured meaning from noisy, inconsistent listings, identifying key attributes like skills, eligibility, deadlines, and expectations.",
    tools=[],
    llm=llm,
    verbose=True,
)

MatchingAgent = Agent(
    role="Matching Agent",
    goal="Evaluate and rank opportunities based on alignment with student profiles",
    backstory="A decision-making agent that compares user profiles with opportunity requirements using semantic similarity and constraint-based filtering.",
    tools=[],
    llm=llm,
    verbose=True,
)

AuditAgent = Agent(
    role="Application Audit Agent",
    goal="Evaluate user readiness for a selected opportunity and generate tailored application materials",
    backstory="A career advisor agent that analyzes resume-job fit, identifies gaps, and generates optimized cover letters and outreach messages.",
    tools=[],
    llm=llm,
    verbose=True,
)

LearningAgent = Agent(
    role="Learning Agent",
    goal="Continuously improve recommendations based on user behavior and feedback",
    backstory="An adaptive agent that learns from user interactions, refining its matching criteria based on application outcomes and preferences.",
    tools=[],
    llm=llm,
    verbose=True,
)


class OpportunitySearchTask:
    @staticmethod
    def create(keywords: str, search_type: str = "internship") -> Task:
        return Task(
            description=f"Search and discover current {search_type} opportunities for: {keywords}. Find at least 5 relevant opportunities with complete details including title, company, description, url, type, required_skills, and location.",
            expected_output="JSON array of opportunities",
            agent=ScoutAgent,
            async_execution=False,
        )


class OpportunityAnalysisTask:
    @staticmethod
    def create(raw_text: str) -> Task:
        return Task(
            description=f"Parse this opportunity listing and extract structured data: {raw_text}",
            expected_output="JSON with title, company, type, required_skills, eligibility, deadline, location, experience_level, stipend, duration",
            agent=AnalyzerAgent,
            async_execution=False,
        )


class MatchTask:
    @staticmethod
    def create(student_context: str, opportunity: str) -> Task:
        return Task(
            description=f"Evaluate how well this student matches this opportunity.\n\nStudent:\n{student_context}\n\nOpportunity:\n{opportunity}",
            expected_output="JSON with match_score (0-100), matched_skills, missing_skills, reasoning, recommendation",
            agent=MatchingAgent,
            async_execution=False,
        )


class AuditTask:
    @staticmethod
    def create(student_context: str, opportunity: str) -> Task:
        return Task(
            description=f"Evaluate this student's resume fit for the opportunity.\n\nStudent:\n{student_context}\n\nOpportunity:\n{opportunity}",
            expected_output="JSON with score (0-100), strengths, gaps, suggestions",
            agent=AuditAgent,
            async_execution=False,
        )


class CoverLetterTask:
    @staticmethod
    def create(student_info: str, opportunity: str) -> Task:
        return Task(
            description=f"Write a tailored cover letter.\n\nStudent:\n{student_info}\n\nOpportunity:\n{opportunity}",
            expected_output="Professional cover letter in 3-4 paragraphs",
            agent=AuditAgent,
            async_execution=False,
        )


class FeedbackTask:
    @staticmethod
    def create(
        student_id: int, opportunity_id: int, action: str, feedback: str = ""
    ) -> Task:
        return Task(
            description=f"Analyze user action to improve future recommendations. Student ID: {student_id}, Opportunity ID: {opportunity_id}, Action: {action}, Feedback: {feedback}",
            expected_output="JSON with insights, updated_weights, recommendations",
            agent=LearningAgent,
            async_execution=False,
        )


class OpportunityCrew:
    def __init__(self):
        if not llm:
            print("Warning: No LLM configured. CrewAI agents will use fallback mode.")

    def search_opportunities(
        self, keywords: str, search_type: str = "internship"
    ) -> List[OpportunityData]:
        task = OpportunitySearchTask.create(keywords, search_type)
        crew = Crew(
            agents=[ScoutAgent], tasks=[task], process=Process.sequential, verbose=True
        )

        try:
            result = crew.kickoff()
            return self._parse_search_results(str(result))
        except Exception as e:
            print(f"Crew execution error: {e}")
            return self._fallback_opportunities(keywords, search_type)

    def _parse_search_results(self, result: str) -> List[OpportunityData]:
        try:
            data = json.loads(result)
            if isinstance(data, list):
                return [OpportunityData(**item) for item in data]
        except:
            pass
        return self._fallback_opportunities("", "internship")

    def _fallback_opportunities(
        self, keywords: str, search_type: str
    ) -> List[OpportunityData]:
        return [
            OpportunityData(
                title=f"{search_type.title()} at Tech Corp",
                company="Tech Corp",
                description=f"Excellent {search_type} opportunity. Great mentorship available.",
                url="https://example.com/apply",
                type=search_type,
                required_skills=keywords,
                location="Remote/Hybrid",
            ),
            OpportunityData(
                title=f"Junior {search_type.title()} at StartupXYZ",
                company="StartupXYZ",
                description="Fast-growing startup looking for ambitious students.",
                url="https://startupxyz.com/careers",
                type=search_type,
                required_skills=keywords,
                location="Bangalore, India",
            ),
            OpportunityData(
                title=f"{search_type.title()} Program 2026",
                company="Global Tech Inc",
                description="Industry-leading program with competitive stipend.",
                url="https://globaltech.com/internships",
                type=search_type,
                required_skills=keywords,
                location="Multiple Locations",
            ),
        ]

    def match(
        self, student: StudentProfile, opportunities: List[OpportunityData]
    ) -> List[MatchResult]:
        student_context = f"Name: {student.full_name}, Branch: {student.branch}, Year: {student.year}, CGPA: {student.cgpa}, Skills: {student.skills}, Goals: {student.goals}"

        results = []
        for opp in opportunities:
            opportunity = f"Title: {opp.title}, Company: {opp.company}, Description: {opp.description}, Required Skills: {opp.required_skills}"
            task = MatchTask.create(student_context, opportunity)
            crew = Crew(
                agents=[MatchingAgent],
                tasks=[task],
                process=Process.sequential,
                verbose=True,
            )

            try:
                result = crew.kickoff()
                match_data = self._parse_match_result(str(result))
                results.append(
                    MatchResult(
                        opportunity=opp.model_dump(),
                        match_score=match_data.get("match_score", 50),
                        matched_skills=match_data.get("matched_skills", []),
                        missing_skills=match_data.get("missing_skills", []),
                        reasoning=match_data.get(
                            "reasoning", "Based on skill alignment"
                        ),
                    )
                )
            except Exception as e:
                results.append(self._fallback_match(student, opp))

        results.sort(key=lambda x: x.match_score, reverse=True)
        return results

    def _parse_match_result(self, result: str) -> Dict:
        try:
            return json.loads(result)
        except:
            return {
                "match_score": 50,
                "matched_skills": [],
                "missing_skills": [],
                "reasoning": "Fallback matching",
            }

    def _fallback_match(
        self, student: StudentProfile, opp: OpportunityData
    ) -> MatchResult:
        student_skills = set(s.strip().lower() for s in student.skills.split(",") if s)
        opp_skills = set(s.strip().lower() for s in opp.required_skills.split(",") if s)

        matched = student_skills & opp_skills
        missing = opp_skills - student_skills

        score = (len(matched) / len(opp_skills)) * 100 if opp_skills else 50
        score = min(100, score + (student.cgpa / 10) * 10)

        return MatchResult(
            opportunity=opp.model_dump(),
            match_score=round(score, 1),
            matched_skills=list(matched),
            missing_skills=list(missing),
            reasoning=f"Matched {len(matched)} of {len(opp_skills)} required skills with CGPA bonus",
        )

    def audit(
        self, student: StudentProfile, opportunity: OpportunityData
    ) -> AuditResult:
        student_context = f"Name: {student.full_name}, Branch: {student.branch}, Year: {student.year}, CGPA: {student.cgpa}, Skills: {student.skills}, Goals: {student.goals}"
        opp_context = f"Title: {opportunity.title}, Company: {opportunity.company}, Description: {opportunity.description}, Required Skills: {opportunity.required_skills}"

        task = AuditTask.create(student_context, opp_context)
        crew = Crew(
            agents=[AuditAgent], tasks=[task], process=Process.sequential, verbose=True
        )

        try:
            result = crew.kickoff()
            return self._parse_audit_result(str(result))
        except Exception as e:
            return self._fallback_audit(student, opportunity)

    def _parse_audit_result(self, result: str) -> AuditResult:
        try:
            data = json.loads(result)
            return AuditResult(
                score=int(data.get("score", 75)),
                strengths=data.get("strengths", ["Strong technical foundation"]),
                gaps=data.get("gaps", ["Limited industry experience"]),
                suggestions=data.get("suggestions", "Focus on practical projects"),
            )
        except:
            return AuditResult(
                score=75,
                strengths=["Strong technical foundation"],
                gaps=["Limited industry experience"],
                suggestions="Focus on practical projects",
            )

    def _fallback_audit(
        self, student: StudentProfile, opp: OpportunityData
    ) -> AuditResult:
        student_skills = set(s.strip().lower() for s in student.skills.split(",") if s)
        opp_skills = set(s.strip().lower() for s in opp.required_skills.split(",") if s)

        matched = student_skills & opp_skills
        score = int((len(matched) / max(len(opp_skills), 1)) * 100)

        strengths = [f"Strong CGPA: {student.cgpa}"]
        if matched:
            strengths.append(f"Relevant skills: {', '.join(list(matched)[:3])}")

        gaps = []
        if missing := opp_skills - student_skills:
            gaps.append(f"Missing skills: {', '.join(list(missing)[:3])}")

        return AuditResult(
            score=min(100, score + 20),
            strengths=strengths,
            gaps=gaps if gaps else ["No major gaps identified"],
            suggestions="Focus on projects that demonstrate the missing skills",
        )

    def generate_cover_letter(
        self, student: StudentProfile, opportunity: OpportunityData
    ) -> str:
        student_info = f"{student.full_name}, {student.branch} student, CGPA {student.cgpa}, skills: {student.skills}"
        opp_info = (
            f"{opportunity.title} at {opportunity.company}: {opportunity.description}"
        )

        task = CoverLetterTask.create(student_info, opp_info)
        crew = Crew(
            agents=[AuditAgent], tasks=[task], process=Process.sequential, verbose=True
        )

        try:
            result = crew.kickoff()
            return str(result)
        except Exception as e:
            return self._fallback_cover_letter(student, opportunity)

    def _fallback_cover_letter(
        self, student: StudentProfile, opp: OpportunityData
    ) -> str:
        return f"""Dear Hiring Manager,

I am writing to express my interest in the {opp.title} position at {opp.company}. As a {student.branch} student with a CGPA of {student.cgpa}, I have developed strong technical skills in {student.skills}.

I am particularly excited about this opportunity because {opp.description[:100]}... My academic projects and coursework have prepared me well for this role.

I would welcome the opportunity to discuss how my skills and enthusiasm can contribute to your team.

Sincerely,
{student.full_name}"""

    def analyze_feedback(
        self, student_id: int, opportunity_id: int, action: str, feedback: str = ""
    ) -> Dict:
        task = FeedbackTask.create(student_id, opportunity_id, action, feedback)
        crew = Crew(
            agents=[LearningAgent],
            tasks=[task],
            process=Process.sequential,
            verbose=True,
        )

        try:
            result = crew.kickoff()
            return self._parse_feedback_result(str(result))
        except Exception as e:
            return self._fallback_feedback(student_id, opportunity_id, action)

    def _parse_feedback_result(self, result: str) -> Dict:
        try:
            return json.loads(result)
        except:
            return self._fallback_feedback(0, 0, "viewed")

    def _fallback_feedback(
        self, student_id: int, opportunity_id: int, action: str
    ) -> Dict:
        action_weights = {
            "viewed": {"skill_match": 0.3, "cgpa": 0.2, "location": 0.2},
            "saved": {"skill_match": 0.5, "cgpa": 0.15, "location": 0.15},
            "applied": {"skill_match": 0.6, "cgpa": 0.1, "location": 0.1},
            "dismissed": {"skill_match": 0.2, "cgpa": 0.3, "location": 0.3},
        }

        return {
            "insights": [f"User performed action: {action}"],
            "updated_weights": action_weights.get(action, action_weights["viewed"]),
            "recommendations": ["Continue learning from user patterns"],
        }


crew_instance = OpportunityCrew()
