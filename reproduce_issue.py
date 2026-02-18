
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv("backend/.env")

async def check_connection():
    url = os.getenv("MONGODB_URL")
    print(f"Testing connection to: {url}")
    if not url:
        print("MONGODB_URL not found in environment")
        return

    try:
        client = AsyncIOMotorClient(url, serverSelectionTimeoutMS=5000)
        await client.admin.command('ping')
        print("Successfully connected to MongoDB!")
    except Exception as e:
        print(f"Failed to connect to MongoDB: {e}")

if __name__ == "__main__":
    asyncio.run(check_connection())
