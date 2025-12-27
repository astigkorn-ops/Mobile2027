import asyncio
import os
import json
import logging
from datetime import datetime, timezone
import asyncpg
from dotenv import load_dotenv

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv('/app/backend/.env')

DATABASE_URL = os.environ.get('DATABASE_URL')

async def update_typhoon_data():
    if not DATABASE_URL:
        logger.error("DATABASE_URL is not set")
        return

    logger.info(f"Connecting to database...")
    try:
        conn = await asyncpg.connect(DATABASE_URL)
        
        # Data from the image
        data = {
            "name": "Super Typhoon Uwan",
            "local_name": "Uwan",
            "position": "135 km Northwest of Virac, Catanduanes (14.7°N, 123.7°E)",
            "max_wind_speed": "185 km/h (Gustiness up to 230 km/h)",
            "movement": "West Northwestward at 30 km/h",
            "intensity": "Super Typhoon",
            "pressure": "935 hPa",
            "signal_level": 3,
            "satellite_image_url": "https://customer-assets.emergentagent.com/job_offline-reporter/artifacts/mgsluhri_tr.jpg", # Using the uploaded image as placeholder
            "forecast": [
                {
                    "time": "+12H",
                    "position": "15.5N, 120.5E",
                    "intensity": "Super Typhoon"
                },
                {
                    "time": "+24H", 
                    "position": "16.5N, 117.5E",
                    "intensity": "Typhoon"
                }
            ],
            "warnings": [
                "Typhoon Signal No. 3 raised in Catanduanes and nearby areas.",
                "Heavy rainfall and strong winds expected.",
                "Residents in coastal and low-lying areas are advised to evacuate.", 
                "Sea travel is risky for all types of seacrafts."
            ]
        }

        # Insert new record
        await conn.execute('''
            INSERT INTO typhoon_updates 
            (name, local_name, position, max_wind_speed, movement, intensity, pressure, satellite_image_url, forecast, warnings, signal_level, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
        ''', 
            data['name'], 
            data['local_name'], 
            data['position'], 
            data['max_wind_speed'], 
            data['movement'], 
            data['intensity'], 
            data['pressure'], 
            data['satellite_image_url'], 
            json.dumps(data['forecast']), 
            json.dumps(data['warnings']), 
            data['signal_level']
        )
        
        logger.info("Successfully updated typhoon data")
        
        await conn.close()
        
    except Exception as e:
        logger.error(f"Failed to update database: {e}")

if __name__ == "__main__":
    asyncio.run(update_typhoon_data())
