
import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

try:
    print("Testing passlib and bcrypt compatibility...")
    from passlib.context import CryptContext
    
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    hashed = pwd_context.hash("admin123")
    print(f"Hashing successful: {hashed}")
    
    verified = pwd_context.verify("admin123", hashed)
    print(f"Verification successful: {verified}")

    print("\nPasslib and Bcrypt are working correctly!")

except Exception as e:
    print(f"\nFAILED: {e}")
    import traceback
    traceback.print_exc()
