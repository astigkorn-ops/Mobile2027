import asyncio
import os
from dotenv import load_dotenv
import asyncpg

load_dotenv('/app/backend/.env')
DATABASE_URL = os.environ.get('DATABASE_URL')

async def migrate_db():
    print(f"Connecting to {DATABASE_URL}")
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        # Add reporter_name column to incidents table
        query = "ALTER TABLE incidents ADD COLUMN IF NOT EXISTS reporter_name TEXT;"
        
        print(f"Executing: {query}")
        await conn.execute(query)
            
        print("Migration complete.")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(migrate_db())
