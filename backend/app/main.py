from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import profile, opportunities, auth, resume, ai_agents
from app.database import engine, Base
import asyncio

app = FastAPI(title="DevArena API")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(profile.router, prefix="/api/profile", tags=["profile"])
app.include_router(opportunities.router, prefix="/api/opportunities", tags=["opportunities"])
app.include_router(resume.router, prefix="/api/resume", tags=["resume"])
app.include_router(ai_agents.router, prefix="/api/ai", tags=["AI Agents"])

@app.on_event("startup")
async def startup():
    # Create tables if they don't exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Database tables created.")

@app.get("/")
async def root():
    return {"message": "Welcome to DevArena API"}
