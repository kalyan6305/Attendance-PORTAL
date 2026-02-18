from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routers import auth, students, attendance

app = FastAPI(title="Attendance Management Portal")

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for simplicity in this demo, restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Attendance Management Portal API is running"}

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(students.router, prefix="/api/students", tags=["Students"])
app.include_router(attendance.router, prefix="/api/attendance", tags=["Attendance"])
