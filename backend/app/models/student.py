from pydantic import BaseModel, Field, BeforeValidator, ConfigDict
from typing import Optional, Annotated
from bson import ObjectId

# Represents an ObjectId field in the database.
# It will be represented as a `str` on the model so that it can be serialized to JSON.
PyObjectId = Annotated[str, BeforeValidator(str)]

class Student(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    s_no: int
    roll_number: str
    name: str
    branch: str
    year: int
    contact: Optional[str] = None

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )
