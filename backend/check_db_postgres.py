import asyncio
import os
import asyncpg
from pathlib import Path
from dotenv import load_dotenv

# Load env variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

async def check_db():
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        print("Error: DATABASE_URL not found in environment variables")
        return

    print(f"Attempting to connect to PostgreSQL...")
    try:
        conn = await asyncpg.connect(database_url)
        print("Database connection successful!")
        
        # Simple query to verify
        version = await conn.fetchval('SELECT version()')
        print(f"PostgreSQL Version: {version}")
        
        await conn.close()
    except Exception as e:
        print(f"Database connection failed: {e}")

if __name__ == "__main__":
    asyncio.run(check_db())
