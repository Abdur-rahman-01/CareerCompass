from fastapi import APIRouter

router = APIRouter()

@router.post("/login")
async def login():
    # Placeholder for actual login logic
    return {"message": "Login successful", "token": "fake-jwt-token"}

@router.post("/signup")
async def signup():
    # Placeholder for actual signup logic
    return {"message": "Signup successful", "token": "fake-jwt-token"}
