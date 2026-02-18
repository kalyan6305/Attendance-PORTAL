from pydantic import BaseModel, Field, BeforeValidator, ConfigDict
from typing import Optional, Annotated
from bson import ObjectId
from datetime import datetime

# Represents an ObjectId field in the database.
# It will be represented as a `str` on the model so that it can be serialized to JSON.
PyObjectId = Annotated[str, BeforeValidator(str)]

class Attendance(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    date: datetime
    branch: str
    year: int
    student_roll_number: str
    status: str # "Present" or "Absent"
    marked_by: str # User ID of the teacher

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )
