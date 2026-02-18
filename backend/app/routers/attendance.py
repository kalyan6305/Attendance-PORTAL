from fastapi import APIRouter, Depends, HTTPException, Response
from typing import List, Optional
from datetime import datetime, date
from app.api.deps import get_current_active_user, get_current_admin_user
from app.models.attendance import Attendance
from app.models.student import Student
from app.schemas.attendance import AttendanceRequest, AttendanceResponse
from app.schemas.user import UserResponse
from app.database.connection import db
import pandas as pd
from io import BytesIO

router = APIRouter()

from pymongo import UpdateOne

@router.post("/mark", response_model=AttendanceResponse)
async def mark_attendance(
    attendance_in: AttendanceRequest,
    current_user: UserResponse = Depends(get_current_active_user)
):
    # Use bulk_write with upsert to handle multiple submissions for same day
    bulk_ops = []
    timestamp = datetime.utcnow()
    
    for item in attendance_in.attendance_data:
        # Filter by student and date (assuming date is exact match provided by frontend)
        # Ideally we should use date only (without time) logic but for simplicity we rely on frontend sending consistent ISO date
        filter_query = {
            "student_roll_number": item.student_roll_number,
            "date": attendance_in.date
        }
        
        # Determine branch/year from item first, fallback to top-level
        # Logic: If item.branch is present, use it. Else use attendance_in.branch.
        # This allows mixed batches to submit correct data.
        
        record_branch = item.branch if item.branch else attendance_in.branch
        record_year = item.year if item.year > 0 else attendance_in.year

        update_doc = {
            "$set": {
                "branch": record_branch,
                "year": record_year,
                "status": item.status,
                "marked_by": str(current_user.id),
                "updated_at": timestamp
            },
            "$setOnInsert": {
                "created_at": timestamp
            }
        }
        
        bulk_ops.append(UpdateOne(filter_query, update_doc, upsert=True))
        
    if bulk_ops:
        await db.attendance.bulk_write(bulk_ops)
        
    return {
        "message": "Attendance marked successfully",
        "date": attendance_in.date,
        "marked_count": len(bulk_ops)
    }

@router.get("/", response_model=List[Attendance])
async def get_attendance(
    date: Optional[datetime] = None,
    branch: Optional[str] = None,
    year: Optional[int] = None,
    current_user: UserResponse = Depends(get_current_active_user)
):
    query = {}
    if date:
        # Match the date exactly as we store what frontend sends
        query["date"] = date
        
    if branch:
        query["branch"] = branch
    if year:
        query["year"] = year
        
    # Find attendance records
    attendance_cursor = db.attendance.find(query)
    # attendance_list = await attendance_cursor.to_list(length=2000) # Increased limit
    
    # We might need to handle huge data if all branches + year selected. 
    # But usually it's per day per class. Even 'All' branches is manageable (~500 students?)
    attendance_list = await attendance_cursor.to_list(length=5000)
    
    return attendance_list

@router.get("/export")
async def export_attendance(
    date: Optional[datetime] = None, # Added date filter
    branch: Optional[str] = None,
    year: Optional[int] = None,
    current_user: UserResponse = Depends(get_current_active_user) 
):
    query = {}
    if date:
         query["date"] = date # Match exact date stored
         
    if branch:
        query["branch"] = branch
    if year:
        query["year"] = year
        
    attendance_cursor = db.attendance.find(query)
    data = await attendance_cursor.to_list(length=5000)
    
    if not data:
        raise HTTPException(status_code=404, detail="No attendance data found for export")
        
    # Convert to DataFrame
    df = pd.DataFrame(data)
    
    # Select relevant columns
    if "_id" in df.columns:
        del df["_id"]
        
    # Generate Excel
    output = BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Attendance')
    
    output.seek(0)
    
    headers = {
        'Content-Disposition': 'attachment; filename="attendance_report.xlsx"'
    }
    return Response(content=output.getvalue(), headers=headers, media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')

@router.get("/analytics")
async def get_analytics(
    date: Optional[datetime] = None,
    branch: Optional[str] = None,
    year: Optional[int] = None,
    current_user: UserResponse = Depends(get_current_active_user) # Changed to active user
):
    # Total students filtering
    student_query = {}
    if branch:
        student_query["branch"] = branch
    if year:
        student_query["year"] = year
        
    total_students = await db.students.count_documents(student_query)
    
    # Attendance filtering
    attendance_match = {}
    if date:
        attendance_match["date"] = date
    if branch:
        attendance_match["branch"] = branch
    if year:
        attendance_match["year"] = year
        
    pipeline = [
        {"$match": attendance_match},
        {"$group": {"_id": "$status", "count": {"$sum": 1}}}
    ]
    attendance_stats = await db.attendance.aggregate(pipeline).to_list(length=None)
    
    stats = {item["_id"]: item["count"] for item in attendance_stats}
    
    return {
        "total_students": total_students,
        "present_count": stats.get("Present", 0),
        "absent_count": stats.get("Absent", 0)
    }
