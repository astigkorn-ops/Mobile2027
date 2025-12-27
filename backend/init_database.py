"""
Initialize PostgreSQL database schema for MDRRMO Pio Duran Emergency App
"""
import asyncio
import asyncpg
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
env_path = Path(__file__).parent / '.env'
load_dotenv(env_path)

DATABASE_URL = os.environ.get('DATABASE_URL')

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set")


async def init_database():
    """Create all required database tables"""
    print("🔄 Connecting to PostgreSQL database...")
    
    try:
        conn = await asyncpg.connect(DATABASE_URL)
        print("✅ Connected to database\n")
        
        print("🏗️  Creating database schema...")
        
        # Create users table
        await conn.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(255) PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                full_name VARCHAR(255) NOT NULL,
                phone VARCHAR(50),
                is_admin BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        print("   ✅ Created users table")
        
        # Create incidents table
        await conn.execute('''
            CREATE TABLE IF NOT EXISTS incidents (
                id VARCHAR(255) PRIMARY KEY,
                incident_type VARCHAR(100) NOT NULL,
                date VARCHAR(50),
                time VARCHAR(50),
                latitude FLOAT NOT NULL,
                longitude FLOAT NOT NULL,
                description TEXT NOT NULL,
                reporter_phone VARCHAR(50),
                images JSONB DEFAULT '[]',
                internal_notes TEXT DEFAULT '',
                status VARCHAR(50) DEFAULT 'new',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        print("   ✅ Created incidents table")
        
        # Create hotlines table
        await conn.execute('''
            CREATE TABLE IF NOT EXISTS hotlines (
                id VARCHAR(255) PRIMARY KEY,
                label VARCHAR(500) NOT NULL,
                number VARCHAR(100) NOT NULL,
                category VARCHAR(100) NOT NULL
            )
        ''')
        print("   ✅ Created hotlines table")
        
        # Create map_locations table
        await conn.execute('''
            CREATE TABLE IF NOT EXISTS map_locations (
                id INTEGER PRIMARY KEY,
                type VARCHAR(100) NOT NULL,
                name VARCHAR(500) NOT NULL,
                address TEXT NOT NULL,
                lat FLOAT NOT NULL,
                lng FLOAT NOT NULL,
                capacity VARCHAR(200),
                services TEXT,
                hotline VARCHAR(100)
            )
        ''')
        print("   ✅ Created map_locations table")
        
        # Create emergency_plans table
        await conn.execute('''
            CREATE TABLE IF NOT EXISTS emergency_plans (
                id VARCHAR(255) PRIMARY KEY,
                user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
                plan_data JSONB NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        print("   ✅ Created emergency_plans table")
        
        # Create checklists table
        await conn.execute('''
            CREATE TABLE IF NOT EXISTS checklists (
                id VARCHAR(255) PRIMARY KEY,
                user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
                checklist_data JSONB NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        print("   ✅ Created checklists table")
        
        # Create status_checks table
        await conn.execute('''
            CREATE TABLE IF NOT EXISTS status_checks (
                id VARCHAR(255) PRIMARY KEY,
                client_name VARCHAR(255) NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        print("   ✅ Created status_checks table")
        
        print("\n✅ Database schema initialized successfully!\n")
        
        # Check table count
        tables = await conn.fetch("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        """)
        
        print(f"📊 Total tables created: {len(tables)}")
        for table in tables:
            print(f"   - {table['table_name']}")
        
        await conn.close()
        print("\n✅ Database initialization complete!")
        
    except Exception as e:
        print(f"\n❌ Error initializing database: {e}")
        raise


if __name__ == "__main__":
    asyncio.run(init_database())
