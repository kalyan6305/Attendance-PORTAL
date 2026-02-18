from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: str
    role: str = "teacher" # Default to teacher, admin created manually or via seed

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: str
    username: str
    email: EmailStr
    full_name: str
    role: str
    disabled: bool
    
    model_config = ConfigDict(from_attributes=True) 
