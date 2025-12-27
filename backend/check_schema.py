import asyncio
import os
import asyncpg
from pathlib import Path
from dotenv import load_dotenv

# Load env variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

async def check_schema():
    database_url = os.environ.get('DATABASE_URL')
    try:
        conn = await asyncpg.connect(database_url)
        # Get columns for users table
        columns = await conn.fetch("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users'")
        for col in columns:
            print(f"{col['column_name']}: {col['data_type']}")
        await conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(check_schema())
