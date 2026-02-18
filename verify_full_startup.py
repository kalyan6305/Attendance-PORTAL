
import asyncio
import sys
import os
from dotenv import load_dotenv

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))
load_dotenv("backend/.env")

async def test_startup():
    print("Initializing FastAPI app...")
    try:
        from app.main import app
        print("FastAPI app initialized successfully.")
        
        # Manually trigger startup events
        print("Triggering startup events...")
        for handler in app.router.on_startup:
            if asyncio.iscoroutinefunction(handler):
                await handler()
            else:
                handler()
        print("Startup events completed successfully.")

    except Exception as e:
        print(f"\nFAILED to start app: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_startup())
