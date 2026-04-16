from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from .. import schemas, models
from ..database import get_db

router = APIRouter()

@router.get("/{student_id}", response_model=schemas.Student)
async def get_profile(student_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Student).where(models.Student.id == student_id))
    student = result.scalars().first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

@router.post("/", response_model=schemas.Student)
async def create_profile(student: schemas.StudentCreate, db: AsyncSession = Depends(get_db)):
    db_student = models.Student(**student.dict())
    db.add(db_student)
    await db.commit()
    await db.refresh(db_student)
    return db_student

@router.put("/{student_id}", response_model=schemas.Student)
async def update_profile(student_id: int, student: schemas.StudentUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Student).where(models.Student.id == student_id))
    db_student = result.scalars().first()
    if not db_student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    for key, value in student.dict(exclude_unset=True).items():
        setattr(db_student, key, value)
    
    await db.commit()
    await db.refresh(db_student)
    return db_student
