
import asyncio
from database import get_pool, records_to_list

async def migrate():
    print("Starting migration...")
    pool = await get_pool()
    async with pool.acquire() as conn:
        # Create typhoon_updates table
        print("Creating typhoon_updates table...")
        await conn.execute('''
            CREATE TABLE IF NOT EXISTS typhoon_updates (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                local_name TEXT,
                position TEXT,
                max_wind_speed TEXT,
                movement TEXT,
                intensity TEXT,
                pressure TEXT,
                last_update TIMESTAMPTZ DEFAULT NOW(),
                satellite_image_url TEXT,
                forecast JSONB,
                warnings JSONB,
                signal_level INTEGER,
                created_at TIMESTAMPTZ DEFAULT NOW()
            )
        ''')
        
        # Check if empty, if so seed with initial data
        count = await conn.fetchval("SELECT COUNT(*) FROM typhoon_updates")
        if count == 0:
            print("Seeding initial typhoon data...")
            import json
            from datetime import datetime, timezone
            
            initial_data = {
                "name": "Typhoon CARINA",
                "local_name": "Gaemi",
                "position": "15.2°N, 120.5°E",
                "max_wind_speed": "185 km/h",
                "movement": "West at 15 km/h",
                "intensity": "Severe Tropical Storm",
                "pressure": "960 hPa",
                "satellite_image_url": "https://src.meteopilipinas.gov.ph/repo/mtsat-colored/24hour/latest-him-colored.gif",
                "forecast": json.dumps([
                    {"time": "24h", "position": "16.0°N, 119.0°E", "intensity": "Typhoon"},
                    {"time": "48h", "position": "17.5°N, 117.5°E", "intensity": "Typhoon"},
                    {"time": "72h", "position": "19.0°N, 116.0°E", "intensity": "Severe Tropical Storm"}
                ]),
                "warnings": json.dumps([
                    "Signal No. 2 raised over Albay",
                    "Heavy rainfall expected in Bicol Region",
                    "Storm surge warning for coastal areas"
                ]),
                "signal_level": 2
            }
            
            await conn.execute('''
                INSERT INTO typhoon_updates 
                (name, local_name, position, max_wind_speed, movement, intensity, pressure, satellite_image_url, forecast, warnings, signal_level)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            ''', 
                initial_data["name"], initial_data["local_name"], initial_data["position"], 
                initial_data["max_wind_speed"], initial_data["movement"], initial_data["intensity"], 
                initial_data["pressure"], initial_data["satellite_image_url"], 
                initial_data["forecast"], initial_data["warnings"], initial_data["signal_level"]
            )
            print("Seeded initial typhoon data.")
            
    print("Migration complete.")

if __name__ == "__main__":
    asyncio.run(migrate())
