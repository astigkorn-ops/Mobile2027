from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
import asyncio
from pathlib import Path

# Load env variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

async def check_db():
    try:
        mongo_url = os.environ.get('MONGO_URL')
        if not mongo_url:
            print("Error: MONGO_URL not found in environment variables")
            return

        print(f"Attempting to connect to MongoDB...")
        # create client
        client = AsyncIOMotorClient(mongo_url, serverSelectionTimeoutMS=5000)
        
        # Check connection
        # The ismaster command is cheap and does not require auth.
        await client.admin.command('ismaster')
        print("Database connection successful!")
        
        # Also check if we can access the specific database
        db_name = os.environ.get('DB_NAME')
        if db_name:
             print(f"Using database: {db_name}")
        
    except Exception as e:
        print(f"Database connection failed: {e}")

if __name__ == "__main__":
    asyncio.run(check_db())
