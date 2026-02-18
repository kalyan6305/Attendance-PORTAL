from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from typing import List, Optional
from app.database.connection import db
from app.api.deps import get_current_active_user, get_current_admin_user
from app.utils.excel_handler import parse_student_excel
from app.models.student import Student
from app.schemas.user import UserResponse

router = APIRouter()

@router.post("/upload", status_code=201)
async def upload_students(
    file: UploadFile = File(...),
    current_user: UserResponse = Depends(get_current_admin_user)
):
    if not file.filename.endswith(".xlsx") and not file.filename.endswith(".xls"):
        raise HTTPException(status_code=400, detail="Invalid file format. Please upload an Excel file.")
    
    content = await file.read()
    try:
        students_data = parse_student_excel(content)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    # Bulk insert or update
    # Ideally should handle duplicates. For now, we'll try to insert and catch errors or just insert.
    # A better approach is to upsert based on Roll Number.
    
    count = 0
    for student in students_data:
        # Check if exists
        existing = await db.students.find_one({"roll_number": student["roll_number"]})
        if not existing:
            await db.students.insert_one(student)
            count += 1
        else:
            # Update mechanism could go here
            pass
            
    return {"message": f"Successfully processed. {count} new students added."}

@router.get("/", response_model=List[Student])
async def get_students(
    branch: Optional[str] = None,
    year: Optional[int] = None,
    current_user: UserResponse = Depends(get_current_active_user)
):
    query = {}
    if branch:
        query["branch"] = branch
    if year:
        query["year"] = year
        
    students_cursor = db.students.find(query)
    students = await students_cursor.to_list(length=1000)
    return students
