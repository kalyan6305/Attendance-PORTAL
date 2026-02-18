from pydantic import BaseModel, Field, EmailStr, BeforeValidator, ConfigDict
from typing import Optional, Annotated
from bson import ObjectId

# Represents an ObjectId field in the database.
# It will be represented as a `str` on the model so that it can be serialized to JSON.
PyObjectId = Annotated[str, BeforeValidator(str)]

class User(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    username: str
    email: EmailStr
    full_name: str
    password_hash: str
    role: str  # "admin" or "teacher"
    disabled: Optional[bool] = False

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )
