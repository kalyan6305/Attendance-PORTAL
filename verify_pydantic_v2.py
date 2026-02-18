
import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

try:
    print("Importing app.models.user...")
    from app.models.user import User
    print("User model imported successfully.")

    print("Importing app.models.student...")
    from app.models.student import Student
    print("Student model imported successfully.")

    print("Importing app.models.attendance...")
    from app.models.attendance import Attendance
    print("Attendance model imported successfully.")
    
    print("Importing app.schemas.user...")
    from app.schemas.user import UserResponse
    print("UserResponse schema imported successfully.")

    print("Importing app.core.config...")
    from app.core.config import settings
    print("Settings imported successfully.")

    print("\nAll Pydantic models imported successfully!")

except Exception as e:
    print(f"\nFAILED to import models: {e}")
    import traceback
    traceback.print_exc()
