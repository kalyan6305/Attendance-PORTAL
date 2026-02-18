from pydantic import BaseModel
from typing import List
from datetime import datetime

class AttendanceMark(BaseModel):
    student_roll_number: str
    status: str # "Present" or "Absent"
    branch: str = "" # Added for granular tracking
    year: int = 0    # Added for granular tracking

class AttendanceRequest(BaseModel):
    date: datetime
    branch: str = "" # kept for backward compat/logging
    year: int = 0    # kept for backward compat/logging
    attendance_data: List[AttendanceMark]

class AttendanceResponse(BaseModel):
    message: str
    date: datetime
    marked_count: int
