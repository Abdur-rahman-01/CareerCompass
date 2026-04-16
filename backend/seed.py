import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import AsyncSessionLocal, engine, Base
from app.models import Opportunity, Student

async def seed_data():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    async with AsyncSessionLocal() as db:
        opportunities = [
            Opportunity(
                title="Frontend Developer Intern",
                company="TechCorp Solutions",
                type="internship",
                description="We are looking for a Next.js enthusiast to help us build modern web applications.",
                required_skills="React, Next.js, Tailwind CSS",
                url="https://techcorp.example/intern"
            ),
            Opportunity(
                title="AI Research Assistant",
                company="Future Labs",
                type="research",
                description="Assist in training and fine-tuning large language models for educational purposes.",
                required_skills="Python, PyTorch, LLMs",
                url="https://futurelabs.example/research"
            ),
            Opportunity(
                title="Global Hackathon 2026",
                company="GDG Hub",
                type="hackathon",
                description="Build a sustainable solution for the planet in 48 hours.",
                required_skills="Teamwork, Problem Solving, Prototyping",
                url="https://gdghub.example/hack"
            ),
            Opportunity(
                title="Cloud Security Scholar",
                company="SecureWay Foundation",
                type="scholarship",
                description="Scholarship for students pursuing a major in cybersecurity.",
                required_skills="Good Academic Record, Cybersecurity interest",
                url="https://secureway.example/scholars"
            ),
        ]
        
        db.add_all(opportunities)
        
        # Add a sample student
        student = Student(
            id=1,
            full_name="Alex Johnson",
            email="alex.j@example.com",
            year=3,
            branch="Computer Science",
            cgpa=3.8,
            skills="React, Next.js, Python, TypeScript",
            goals="I want to work as a Fullstack Developer at a top-tier tech company."
        )
        db.add(student)
        
        await db.commit()
        print("Seed data inserted successfully.")

if __name__ == "__main__":
    asyncio.run(seed_data())
