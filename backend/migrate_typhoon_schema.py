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
        # Add new columns to typhoon_updates
        # Columns: date, time, latitude, longitude, gustiness
        
        queries = [
            "ALTER TABLE typhoon_updates ADD COLUMN IF NOT EXISTS date_str TEXT;",
            "ALTER TABLE typhoon_updates ADD COLUMN IF NOT EXISTS time_str TEXT;",
            "ALTER TABLE typhoon_updates ADD COLUMN IF NOT EXISTS latitude FLOAT;",
            "ALTER TABLE typhoon_updates ADD COLUMN IF NOT EXISTS longitude FLOAT;",
            "ALTER TABLE typhoon_updates ADD COLUMN IF NOT EXISTS gustiness TEXT;"
        ]
        
        for q in queries:
            print(f"Executing: {q}")
            await conn.execute(q)
            
        print("Migration complete.")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(migrate_db())
