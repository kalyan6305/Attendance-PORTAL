from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from app.core.security import create_access_token, get_password_hash, verify_password
from app.database.connection import db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse
from app.schemas.token import Token
from app.core.config import settings
from app.api.deps import get_current_admin_user

router = APIRouter()

@router.post("/login", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await db.users.find_one({"username": form_data.username})
    if not user or not verify_password(form_data.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"], "role": user["role"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "role": user["role"], "user_name": user["full_name"]}

@router.post("/register", response_model=UserResponse)
async def create_user(user_in: UserCreate, current_user: User = Depends(get_current_admin_user)):
    user = await db.users.find_one({"username": user_in.username})
    if user:
        raise HTTPException(
            status_code=400,
            detail="Username already registered",
        )
    
    hashed_password = get_password_hash(user_in.password)
    user_dict = user_in.dict()
    user_dict["password_hash"] = hashed_password
    del user_dict["password"]
    
    new_user = await db.users.insert_one(user_dict)
    created_user = await db.users.find_one({"_id": new_user.inserted_id})
    return User(**created_user)

@router.on_event("startup")
async def create_initial_admin():
    # Check if admin exists, if not create one
    admin = await db.users.find_one({"role": "admin"})
    if not admin:
        hashed_password = get_password_hash("admin123")
        admin_user = {
            "username": "admin",
            "email": "admin@example.com",
            "full_name": "System Admin",
            "password_hash": hashed_password,
            "role": "admin",
            "disabled": False
        }
        await db.users.insert_one(admin_user)
        print("Admin user created: admin / admin123")
