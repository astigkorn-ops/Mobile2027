from fastapi import FastAPI, APIRouter, HTTPException, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import json
from auth_utils import get_password_hash, verify_password, create_access_token
from auth_middleware import get_current_user, get_current_user_optional
from database import get_pool, record_to_dict, records_to_list, close_pool


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Helper function to convert timezone-aware datetime to naive for PostgreSQL
def to_naive_datetime(dt):
    """Convert timezone-aware datetime to naive datetime for PostgreSQL"""
    if isinstance(dt, datetime) and dt.tzinfo:
        return dt.replace(tzinfo=None)
    return dt

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Incident Report Models
class IncidentImage(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: Optional[float] = None  # browser-side id (Date.now()+random)
    data: str  # base64 data URL
    name: Optional[str] = None
    size: Optional[int] = None


class IncidentLocation(BaseModel):
    latitude: float
    longitude: float


class IncidentReport(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    incident_type: str
    date: str
    time: str
    latitude: float
    longitude: float
    description: str
    reporter_phone: Optional[str] = None
    reporter_name: Optional[str] = None
    images: List[IncidentImage] = []
    internal_notes: str = ""
    status: str = "new"  # new / in-progress / resolved
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class IncidentReportCreate(BaseModel):
    # Accept both the existing API contract and the current frontend payload
    id: Optional[str] = None
    incident_type: Optional[str] = None
    incidentType: Optional[str] = None

    date: Optional[str] = None
    time: Optional[str] = None

    latitude: Optional[float] = None
    longitude: Optional[float] = None

    location: Optional[IncidentLocation] = None

    description: str
    images: List[IncidentImage] = []

    # optional extras
    reporter_phone: Optional[str] = None
    phone: Optional[str] = None
    reporter_name: Optional[str] = None
    sender_name: Optional[str] = None # alias
    timestamp: Optional[str] = None

# Hotline Model
class Hotline(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    label: str
    number: str
    category: str

# Typhoon Data Model
class TyphoonData(BaseModel):
    name: str
    localName: str
    date: Optional[str] = None
    time: Optional[str] = None
    intensity: str
    signal_level: Optional[int] = None
    position: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    movement: str
    maxWindSpeed: str
    gustiness: Optional[str] = None
    pressure: str
    satelliteImageUrl: Optional[str] = None
    forecast: List[dict]
    warnings: List[str]
    lastUpdate: str

class TyphoonUpdateCreate(BaseModel):
    name: str
    localName: str
    date: Optional[str] = None
    time: Optional[str] = None
    intensity: str
    signal_level: Optional[int] = None
    position: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    movement: str
    maxWindSpeed: str
    gustiness: Optional[str] = None
    pressure: str
    satelliteImageUrl: Optional[str] = None
    forecast: List[dict] = []
    warnings: List[str] = []


# Map Location Model
class MapLocation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: int
    type: str
    name: str
    address: str
    lat: float
    lng: float
    capacity: Optional[str] = None
    services: Optional[str] = None
    hotline: Optional[str] = None

# User Authentication Models
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    full_name: str
    phone: Optional[str] = None
    is_admin: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# Admin Models
class AdminBootstrapRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = None


class IncidentUpdateRequest(BaseModel):
    status: Optional[str] = None
    internal_notes: Optional[str] = None


class HotlineCreate(BaseModel):
    label: str
    number: str
    category: str

# Location Management Models
class LocationCreate(BaseModel):
    type: str  # evacuation, hospital, police, fire, government
    name: str
    address: str
    lat: float
    lng: float
    capacity: Optional[str] = None
    services: Optional[str] = None
    hotline: Optional[str] = None

class LocationUpdate(BaseModel):
    type: Optional[str] = None
    name: Optional[str] = None
    address: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    capacity: Optional[str] = None
    services: Optional[str] = None
    hotline: Optional[str] = None

class UserInDB(User):
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: User

# Emergency Plan Models
class EmergencyPlanSave(BaseModel):
    plan_data: dict

class EmergencyPlanResponse(BaseModel):
    id: str
    user_id: str
    plan_data: dict
    updated_at: datetime

# Checklist Models
class ChecklistSave(BaseModel):
    checklist_data: List[dict]

class ChecklistResponse(BaseModel):
    id: str
    user_id: str
    checklist_data: List[dict]
    updated_at: datetime

# Incident Validation Models
class IncidentValidationCreate(BaseModel):
    validation_type: str = "confirm"  # confirm, resolved, false_report

class IncidentValidationResponse(BaseModel):
    id: str
    incident_id: str
    user_id: str
    validation_type: str
    created_at: datetime

class IncidentValidationStats(BaseModel):
    incident_id: str
    total_confirmations: int
    total_validations: int
    user_validated: bool = False


# Root endpoint
@api_router.get("/")
async def root():
    return {"message": "MDRRMO Pio Duran Emergency App API"}


# ============ AUTHENTICATION ENDPOINTS ============

@api_router.post("/auth/register", response_model=Token)
async def register(user_data: UserRegister):
    """Register a new user"""
    pool = await get_pool()
    
    async with pool.acquire() as conn:
        # Check if user already exists
        existing_user = await conn.fetchrow("SELECT id FROM users WHERE email = $1", user_data.email)
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Hash password
        hashed_password = get_password_hash(user_data.password)
        
        # Create user
        user_id = str(uuid.uuid4())
        created_at = datetime.now(timezone.utc)
        
        await conn.execute('''
            INSERT INTO users (id, email, password, full_name, phone, is_admin, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        ''', user_id, user_data.email, hashed_password, user_data.full_name, 
           user_data.phone, False, to_naive_datetime(created_at))
        
        # Create access token
        access_token = create_access_token(data={"sub": user_id})
        
        # Return user without password
        user_response = User(
            id=user_id,
            email=user_data.email,
            full_name=user_data.full_name,
            phone=user_data.phone,
            is_admin=False,
            created_at=created_at
        )
        
        return Token(access_token=access_token, user=user_response)


@api_router.post("/auth/login", response_model=Token)
async def login(credentials: UserLogin):
    """Login user"""
    pool = await get_pool()
    
    async with pool.acquire() as conn:
        # Find user
        user = await conn.fetchrow(
            "SELECT * FROM users WHERE email = $1", 
            credentials.email
        )
        
        if not user:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Verify password
        if not verify_password(credentials.password, user["password"]):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Create access token
        access_token = create_access_token(data={"sub": user["id"]})
        
        # Return user without password
        user_dict = dict(user)
        user_dict.pop("password", None)
        user_response = User(**user_dict)
        
        return Token(access_token=access_token, user=user_response)


@api_router.get("/auth/me", response_model=User)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user information"""
    return User(**current_user)



@api_router.post("/auth/logout")
async def logout_user(current_user: dict = Depends(get_current_user)):
    """Logout user (server-side token revocation stub).

    This app uses stateless JWTs; without a token blacklist store, we can't truly invalidate
    a token immediately. This endpoint exists to satisfy client logout flow and can be
    extended later (e.g., store revoked jti in DB/Redis).
    """
    return {"ok": True}




# ============ ADMIN ENDPOINTS ============

@api_router.post("/admin/bootstrap", response_model=Token)
async def admin_bootstrap(payload: AdminBootstrapRequest):
    """Create the very first admin user.

    Security: only allowed when there is no admin user yet.
    """
    pool = await get_pool()
    
    async with pool.acquire() as conn:
        existing_admin = await conn.fetchrow("SELECT id FROM users WHERE is_admin = TRUE")
        if existing_admin:
            raise HTTPException(status_code=403, detail="Admin already bootstrapped")

        existing_user = await conn.fetchrow("SELECT id FROM users WHERE email = $1", payload.email)
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")

        hashed_password = get_password_hash(payload.password)
        user_id = str(uuid.uuid4())
        created_at = datetime.now(timezone.utc)

        await conn.execute('''
            INSERT INTO users (id, email, password, full_name, phone, is_admin, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        ''', user_id, payload.email, hashed_password, payload.full_name,
           payload.phone, True, to_naive_datetime(created_at))

        access_token = create_access_token(data={"sub": user_id})
        user_response = User(
            id=user_id,
            email=payload.email,
            full_name=payload.full_name,
            phone=payload.phone,
            is_admin=True,
            created_at=created_at
        )
        return Token(access_token=access_token, user=user_response)


@api_router.get("/admin/incidents")
async def admin_list_incidents(
    status: Optional[str] = None,
    q: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
):
    _require_admin(current_user)
    
    pool = await get_pool()
    async with pool.acquire() as conn:
        query = "SELECT * FROM incidents"
        params = []
        conditions = []
        
        if status:
            conditions.append(f"status = ${len(params) + 1}")
            params.append(status)
        
        if q:
            conditions.append(f"(incident_type ILIKE ${len(params) + 1} OR description ILIKE ${len(params) + 1} OR reporter_phone ILIKE ${len(params) + 1})")
            params.append(f"%{q}%")
        
        if conditions:
            query += " WHERE " + " AND ".join(conditions)
        
        query += " ORDER BY created_at DESC LIMIT 500"
        
        incidents = await conn.fetch(query, *params)
        return {"incidents": records_to_list(incidents)}


@api_router.get("/admin/incidents/{incident_id}")
async def admin_get_incident(
    incident_id: str,
    current_user: dict = Depends(get_current_user),
):
    _require_admin(current_user)
    pool = await get_pool()
    
    async with pool.acquire() as conn:
        incident = await conn.fetchrow("SELECT * FROM incidents WHERE id = $1", incident_id)
        if not incident:
            raise HTTPException(status_code=404, detail="Incident not found")
        return {"incident": record_to_dict(incident)}


@api_router.patch("/admin/incidents/{incident_id}")
async def admin_update_incident(
    incident_id: str,
    payload: IncidentUpdateRequest,
    current_user: dict = Depends(get_current_user),
):
    _require_admin(current_user)
    pool = await get_pool()
    
    update_fields = []
    params = []
    param_idx = 1
    
    if payload.status is not None:
        if payload.status not in {"new", "in-progress", "resolved"}:
            raise HTTPException(status_code=400, detail="Invalid status")
        update_fields.append(f"status = ${param_idx}")
        params.append(payload.status)
        param_idx += 1

    if payload.internal_notes is not None:
        update_fields.append(f"internal_notes = ${param_idx}")
        params.append(payload.internal_notes)
        param_idx += 1

    if not update_fields:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    params.append(incident_id)
    query = f"UPDATE incidents SET {', '.join(update_fields)} WHERE id = ${param_idx} RETURNING *"
    
    async with pool.acquire() as conn:
        incident = await conn.fetchrow(query, *params)
        if not incident:
            raise HTTPException(status_code=404, detail="Incident not found")
        return {"incident": record_to_dict(incident)}


@api_router.delete("/admin/incidents/{incident_id}")
async def admin_delete_incident(
    incident_id: str,
    current_user: dict = Depends(get_current_user),
):
    _require_admin(current_user)
    pool = await get_pool()
    
    async with pool.acquire() as conn:
        result = await conn.execute("DELETE FROM incidents WHERE id = $1", incident_id)
        if result == "DELETE 0":
            raise HTTPException(status_code=404, detail="Incident not found")
        return {"ok": True}


@api_router.get("/admin/hotlines")
async def admin_list_hotlines(current_user: dict = Depends(get_current_user)):
    _require_admin(current_user)
    await _ensure_hotlines_seeded()
    
    pool = await get_pool()
    async with pool.acquire() as conn:
        hotlines = await conn.fetch("SELECT * FROM hotlines")
        return {"hotlines": records_to_list(hotlines)}


@api_router.post("/admin/hotlines")
async def admin_create_hotline(
    payload: HotlineCreate,
    current_user: dict = Depends(get_current_user),
):
    _require_admin(current_user)
    pool = await get_pool()
    
    hotline_id = str(uuid.uuid4())
    
    async with pool.acquire() as conn:
        await conn.execute('''
            INSERT INTO hotlines (id, label, number, category)
            VALUES ($1, $2, $3, $4)
        ''', hotline_id, payload.label, payload.number, payload.category)
        
        hotline = await conn.fetchrow("SELECT * FROM hotlines WHERE id = $1", hotline_id)
        return {"hotline": record_to_dict(hotline)}


@api_router.put("/admin/hotlines/{hotline_id}")
async def admin_update_hotline(
    hotline_id: str,
    payload: HotlineCreate,
    current_user: dict = Depends(get_current_user),
):
    _require_admin(current_user)
    pool = await get_pool()
    
    async with pool.acquire() as conn:
        result = await conn.execute('''
            UPDATE hotlines SET label = $1, number = $2, category = $3 WHERE id = $4
        ''', payload.label, payload.number, payload.category, hotline_id)
        
        if result == "UPDATE 0":
            raise HTTPException(status_code=404, detail="Hotline not found")
        
        hotline = await conn.fetchrow("SELECT * FROM hotlines WHERE id = $1", hotline_id)
        return {"hotline": record_to_dict(hotline)}


@api_router.delete("/admin/hotlines/{hotline_id}")
async def admin_delete_hotline(
    hotline_id: str,
    current_user: dict = Depends(get_current_user),
):
    _require_admin(current_user)
    pool = await get_pool()
    
    async with pool.acquire() as conn:
        result = await conn.execute("DELETE FROM hotlines WHERE id = $1", hotline_id)
        if result == "DELETE 0":
            raise HTTPException(status_code=404, detail="Hotline not found")
        return {"ok": True}


# ============ ADMIN LOCATION ENDPOINTS ============

@api_router.get("/admin/locations")
async def admin_list_locations(
    location_type: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
):
    """Get all facility locations (admin only)"""
    _require_admin(current_user)
    await _ensure_locations_seeded()
    
    pool = await get_pool()
    async with pool.acquire() as conn:
        if location_type:
            locations = await conn.fetch(
                "SELECT * FROM map_locations WHERE type = $1 ORDER BY id",
                location_type
            )
        else:
            locations = await conn.fetch("SELECT * FROM map_locations ORDER BY id")
        
        return {"locations": records_to_list(locations)}


@api_router.post("/admin/locations")
async def admin_create_location(
    payload: LocationCreate,
    current_user: dict = Depends(get_current_user),
):
    """Create a new facility location (admin only)"""
    _require_admin(current_user)
    
    # Validate location type
    valid_types = ["evacuation", "hospital", "police", "fire", "government"]
    if payload.type not in valid_types:
        raise HTTPException(status_code=400, detail=f"Invalid location type. Must be one of: {', '.join(valid_types)}")
    
    pool = await get_pool()
    async with pool.acquire() as conn:
        # Get the next ID
        last_id = await conn.fetchval("SELECT MAX(id) FROM map_locations")
        next_id = (last_id + 1) if last_id else 1
        
        await conn.execute('''
            INSERT INTO map_locations (id, type, name, address, lat, lng, capacity, services, hotline)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ''', next_id, payload.type, payload.name, payload.address, payload.lat, payload.lng,
           payload.capacity, payload.services, payload.hotline)
        
        location = await conn.fetchrow("SELECT * FROM map_locations WHERE id = $1", next_id)
        return {"location": record_to_dict(location)}


@api_router.put("/admin/locations/{location_id}")
async def admin_update_location(
    location_id: int,
    payload: LocationUpdate,
    current_user: dict = Depends(get_current_user),
):
    """Update an existing facility location (admin only)"""
    _require_admin(current_user)
    
    pool = await get_pool()
    update_fields = []
    params = []
    param_idx = 1
    
    if payload.type is not None:
        valid_types = ["evacuation", "hospital", "police", "fire", "government"]
        if payload.type not in valid_types:
            raise HTTPException(status_code=400, detail="Invalid location type")
        update_fields.append(f"type = ${param_idx}")
        params.append(payload.type)
        param_idx += 1
    
    if payload.name is not None:
        update_fields.append(f"name = ${param_idx}")
        params.append(payload.name)
        param_idx += 1
    
    if payload.address is not None:
        update_fields.append(f"address = ${param_idx}")
        params.append(payload.address)
        param_idx += 1
    
    if payload.lat is not None:
        update_fields.append(f"lat = ${param_idx}")
        params.append(payload.lat)
        param_idx += 1
    
    if payload.lng is not None:
        update_fields.append(f"lng = ${param_idx}")
        params.append(payload.lng)
        param_idx += 1
    
    if payload.capacity is not None:
        update_fields.append(f"capacity = ${param_idx}")
        params.append(payload.capacity)
        param_idx += 1
    
    if payload.services is not None:
        update_fields.append(f"services = ${param_idx}")
        params.append(payload.services)
        param_idx += 1
    
    if payload.hotline is not None:
        update_fields.append(f"hotline = ${param_idx}")
        params.append(payload.hotline)
        param_idx += 1
    
    if not update_fields:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    params.append(location_id)
    query = f"UPDATE map_locations SET {', '.join(update_fields)} WHERE id = ${param_idx} RETURNING *"
    
    async with pool.acquire() as conn:
        location = await conn.fetchrow(query, *params)
        if not location:
            raise HTTPException(status_code=404, detail="Location not found")
        return {"location": record_to_dict(location)}


@api_router.delete("/admin/locations/{location_id}")
async def admin_delete_location(
    location_id: int,
    current_user: dict = Depends(get_current_user),
):
    """Delete a facility location (admin only)"""
    _require_admin(current_user)
    pool = await get_pool()
    
    async with pool.acquire() as conn:
        result = await conn.execute("DELETE FROM map_locations WHERE id = $1", location_id)
        if result == "DELETE 0":
            raise HTTPException(status_code=404, detail="Location not found")
        return {"ok": True}


# ============ ADMIN HELPERS ============

def _require_admin(current_user: dict):
    if not current_user or not current_user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")


async def _ensure_hotlines_seeded():
    """Seed DB hotlines from the existing default list if none exist yet."""
    pool = await get_pool()
    
    async with pool.acquire() as conn:
        count = await conn.fetchval("SELECT COUNT(*) FROM hotlines")
        if count > 0:
            return

        default_hotlines = [
            {"id": str(uuid.uuid4()), "label": "MDRRMO Municipal Disaster Risk Reduction Management Office", "number": "0917-772-5016", "category": "emergency"},
            {"id": str(uuid.uuid4()), "label": "MDRRMO Municipal Disaster Risk Reduction Management Office", "number": "0966-395-6804", "category": "emergency"},
            {"id": str(uuid.uuid4()), "label": "PSO Public Safety Officer", "number": "0946-743-2735", "category": "police"},
            {"id": str(uuid.uuid4()), "label": "Mayor's Office", "number": "0961-690-2026", "category": "local"},
            {"id": str(uuid.uuid4()), "label": "Mayor's Office", "number": "0995-072-9306", "category": "local"},
            {"id": str(uuid.uuid4()), "label": "MSWDO Municipal Social Welfare and Development Office", "number": "0910-122-8971", "category": "social"},
            {"id": str(uuid.uuid4()), "label": "MSWDO Municipal Social Welfare and Development Office", "number": "0919-950-9515", "category": "social"},
            {"id": str(uuid.uuid4()), "label": "BFP Bureau of Fire Protection - Pio Duran Fire Station", "number": "0949-889-7134", "category": "fire"},
            {"id": str(uuid.uuid4()), "label": "BFP Bureau of Fire Protection - Pio Duran Fire Station", "number": "0931-929-3408", "category": "fire"},
            {"id": str(uuid.uuid4()), "label": "PNP Philippine National Police - Pio Duran MPS", "number": "0998-598-5946", "category": "police"},
            {"id": str(uuid.uuid4()), "label": "MARITIME POLICE", "number": "0917-500-2325", "category": "police"},
            {"id": str(uuid.uuid4()), "label": "BJMP Bureau of Jail Management and Penology", "number": "0936-572-9067", "category": "police"},
            {"id": str(uuid.uuid4()), "label": "PCG Philippine Coast Guard - Pio Duran Sub Station", "number": "0970-667-5457", "category": "emergency"},
            {"id": str(uuid.uuid4()), "label": "RHU Rural Health Unit Pio Duran", "number": "0927-943-4663", "category": "medical"},
            {"id": str(uuid.uuid4()), "label": "RHU Rural Health Unit Pio Duran", "number": "0907-640-7701", "category": "medical"},
            {"id": str(uuid.uuid4()), "label": "PDMDH Pio Duran Memorial District Hospital", "number": "0985-317-1769", "category": "medical"},
        ]

        for hotline in default_hotlines:
            await conn.execute('''
                INSERT INTO hotlines (id, label, number, category)
                VALUES ($1, $2, $3, $4)
            ''', hotline['id'], hotline['label'], hotline['number'], hotline['category'])


async def _ensure_locations_seeded():
    """Seed DB map_locations from the existing default list if none exist yet."""
    pool = await get_pool()
    
    async with pool.acquire() as conn:
        count = await conn.fetchval("SELECT COUNT(*) FROM map_locations")
        if count > 0:
            return

        default_locations = [
            # Evacuation Centers
            {"id": 1, "type": "evacuation", "name": "Pio Duran Central School", "address": "Poblacion, Pio Duran", "lat": 13.0547, "lng": 123.5214, "capacity": "500 persons"},
            {"id": 2, "type": "evacuation", "name": "Pio Duran National High School", "address": "Barangay Salvacion", "lat": 13.0612, "lng": 123.5289, "capacity": "800 persons"},
            {"id": 3, "type": "evacuation", "name": "Barangay Hall - Rawis", "address": "Barangay Rawis", "lat": 13.0489, "lng": 123.5156, "capacity": "200 persons"},
            {"id": 4, "type": "evacuation", "name": "Covered Court - Malidong", "address": "Barangay Malidong", "lat": 13.0678, "lng": 123.5345, "capacity": "350 persons"},
            
            # Hospitals
            {"id": 5, "type": "hospital", "name": "Pio Duran Medicare Hospital", "address": "Poblacion, Pio Duran", "lat": 13.0534, "lng": 123.5198, "services": "24/7 Emergency"},
            {"id": 6, "type": "hospital", "name": "Barangay Health Center", "address": "Barangay Centro", "lat": 13.0567, "lng": 123.5234, "services": "Primary Care"},
            {"id": 7, "type": "hospital", "name": "Albay Provincial Hospital", "address": "Legazpi City (Nearest)", "lat": 13.1391, "lng": 123.7437, "services": "Full Hospital Services"},
            
            # Police Stations
            {"id": 8, "type": "police", "name": "Pio Duran Municipal Police Station", "address": "Poblacion, Pio Duran", "lat": 13.0551, "lng": 123.5208, "hotline": "166"},
            {"id": 9, "type": "police", "name": "Police Outpost - Rawis", "address": "Barangay Rawis", "lat": 13.0495, "lng": 123.5148, "hotline": "166"},
            
            # Government Facilities
            {"id": 10, "type": "government", "name": "Pio Duran Municipal Hall", "address": "Poblacion, Pio Duran", "lat": 13.0545, "lng": 123.5210, "services": "Municipal Services"},
            {"id": 11, "type": "government", "name": "MDRRMO Office", "address": "Poblacion, Pio Duran", "lat": 13.0543, "lng": 123.5206, "services": "Disaster Response"},
            {"id": 12, "type": "government", "name": "Bureau of Fire Protection", "address": "Poblacion, Pio Duran", "lat": 13.0549, "lng": 123.5215, "services": "Fire Emergency"},
        ]

        for location in default_locations:
            await conn.execute('''
                INSERT INTO map_locations (id, type, name, address, lat, lng, capacity, services, hotline)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ''', location['id'], location['type'], location['name'], location['address'],
               location['lat'], location['lng'], location.get('capacity'), 
               location.get('services'), location.get('hotline'))


async def _normalize_incident_create_payload(payload: IncidentReportCreate) -> dict:
    """Map current frontend payload to canonical incident schema."""
    incident_type = payload.incident_type or payload.incidentType

    lat = payload.latitude
    lng = payload.longitude
    if payload.location:
        lat = payload.location.latitude
        lng = payload.location.longitude

    # date/time may be missing in older offline queue payloads
    date_val = payload.date
    time_val = payload.time

    if (not date_val or not time_val) and payload.timestamp:
        try:
            dt = datetime.fromisoformat(payload.timestamp.replace('Z', '+00:00'))
            if not date_val:
                date_val = dt.date().isoformat()
            if not time_val:
                time_val = dt.time().strftime('%H:%M')
        except Exception:
            pass

    if not incident_type:
        raise HTTPException(status_code=422, detail="incident_type is required")
    if lat is None or lng is None:
        raise HTTPException(status_code=422, detail="location (latitude/longitude) is required")

    reporter_phone = payload.reporter_phone or payload.phone
    reporter_name = payload.reporter_name or payload.sender_name

    return {
        "id": payload.id or str(uuid.uuid4()),
        "incident_type": incident_type,
        "date": date_val or datetime.now(timezone.utc).date().isoformat(),
        "time": time_val or datetime.now(timezone.utc).time().strftime('%H:%M'),
        "latitude": float(lat),
        "longitude": float(lng),
        "description": payload.description,
        "images": json.dumps([img.model_dump() for img in (payload.images or [])]),
        "reporter_phone": reporter_phone,
        "reporter_name": reporter_name,
        "internal_notes": "",
        "status": "new",
        "created_at": datetime.now(timezone.utc),
    }



# ============ USER-SPECIFIC DATA ENDPOINTS ============

@api_router.post("/user/emergency-plan")
async def save_emergency_plan(
    plan: EmergencyPlanSave,
    current_user: dict = Depends(get_current_user)
):
    """Save or update user's emergency plan"""
    pool = await get_pool()
    
    async with pool.acquire() as conn:
        # Check if plan already exists
        existing_plan = await conn.fetchrow(
            "SELECT id FROM emergency_plans WHERE user_id = $1",
            current_user["id"]
        )
        
        plan_id = existing_plan["id"] if existing_plan else str(uuid.uuid4())
        updated_at = datetime.now(timezone.utc)
        
        if existing_plan:
            await conn.execute('''
                UPDATE emergency_plans SET plan_data = $1, updated_at = $2
                WHERE user_id = $3
            ''', json.dumps(plan.plan_data), to_naive_datetime(updated_at), current_user["id"])
        else:
            await conn.execute('''
                INSERT INTO emergency_plans (id, user_id, plan_data, updated_at)
                VALUES ($1, $2, $3, $4)
            ''', plan_id, current_user["id"], json.dumps(plan.plan_data), to_naive_datetime(updated_at))
        
        return {
            "message": "Emergency plan saved successfully",
            "plan": {
                "id": plan_id,
                "user_id": current_user["id"],
                "plan_data": plan.plan_data,
                "updated_at": updated_at.isoformat()
            }
        }


@api_router.get("/user/emergency-plan")
async def get_emergency_plan(
    current_user: dict = Depends(get_current_user)
):
    """Get user's emergency plan"""
    pool = await get_pool()
    
    async with pool.acquire() as conn:
        plan = await conn.fetchrow(
            "SELECT * FROM emergency_plans WHERE user_id = $1",
            current_user["id"]
        )
        
        if not plan:
            return {"plan": None}
        
        plan_dict = dict(plan)
        # Parse JSON fields
        if isinstance(plan_dict.get('plan_data'), str):
            plan_dict['plan_data'] = json.loads(plan_dict['plan_data'])
        
        return {"plan": plan_dict}


@api_router.post("/user/checklist")
async def save_checklist(
    checklist: ChecklistSave,
    current_user: dict = Depends(get_current_user)
):
    """Save or update user's checklist progress"""
    pool = await get_pool()
    
    async with pool.acquire() as conn:
        # Check if checklist already exists
        existing_checklist = await conn.fetchrow(
            "SELECT id FROM checklists WHERE user_id = $1",
            current_user["id"]
        )
        
        checklist_id = existing_checklist["id"] if existing_checklist else str(uuid.uuid4())
        updated_at = datetime.now(timezone.utc)
        
        if existing_checklist:
            await conn.execute('''
                UPDATE checklists SET checklist_data = $1, updated_at = $2
                WHERE user_id = $3
            ''', json.dumps(checklist.checklist_data), to_naive_datetime(updated_at), current_user["id"])
        else:
            await conn.execute('''
                INSERT INTO checklists (id, user_id, checklist_data, updated_at)
                VALUES ($1, $2, $3, $4)
            ''', checklist_id, current_user["id"], json.dumps(checklist.checklist_data), to_naive_datetime(updated_at))
        
        return {
            "message": "Checklist saved successfully",
            "checklist": {
                "id": checklist_id,
                "user_id": current_user["id"],
                "checklist_data": checklist.checklist_data,
                "updated_at": updated_at.isoformat()
            }
        }


@api_router.get("/user/checklist")
async def get_user_checklist(
    current_user: dict = Depends(get_current_user)
):
    """Get user's checklist progress"""
    pool = await get_pool()
    
    async with pool.acquire() as conn:
        checklist = await conn.fetchrow(
            "SELECT * FROM checklists WHERE user_id = $1",
            current_user["id"]
        )
        
        if not checklist:
            return {"checklist": None}
        
        checklist_dict = dict(checklist)
        # Parse JSON fields
        if isinstance(checklist_dict.get('checklist_data'), str):
            checklist_dict['checklist_data'] = json.loads(checklist_dict['checklist_data'])
        
        return {"checklist": checklist_dict}


# ============ EXISTING ENDPOINTS ============

# Status endpoints
@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    pool = await get_pool()
    
    status_obj = StatusCheck(client_name=input.client_name)
    # Convert timezone-aware datetime to timezone-naive for PostgreSQL
    timestamp = status_obj.timestamp.replace(tzinfo=None) if status_obj.timestamp.tzinfo else status_obj.timestamp
    
    async with pool.acquire() as conn:
        await conn.execute('''
            INSERT INTO status_checks (id, client_name, timestamp)
            VALUES ($1, $2, $3)
        ''', status_obj.id, status_obj.client_name, timestamp)
    
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    pool = await get_pool()
    
    async with pool.acquire() as conn:
        status_checks = await conn.fetch("SELECT * FROM status_checks ORDER BY timestamp DESC LIMIT 1000")
    
    return [StatusCheck(**dict(check)) for check in status_checks]


# Hotlines endpoint
@api_router.get("/hotlines")
async def get_hotlines():
    """Get all emergency hotline numbers (from DB, with first-run seeding)."""
    await _ensure_hotlines_seeded()
    
    pool = await get_pool()
    async with pool.acquire() as conn:
        hotlines = await conn.fetch("SELECT * FROM hotlines")
    
    return {"hotlines": records_to_list(hotlines)}


# Incident Report endpoints
@api_router.post("/incidents", response_model=IncidentReport)
async def create_incident_report(input: IncidentReportCreate):
    """Submit a new incident report."""
    doc = await _normalize_incident_create_payload(input)
    
    # Convert timezone-aware datetime to timezone-naive for PostgreSQL
    created_at = doc['created_at'].replace(tzinfo=None) if isinstance(doc['created_at'], datetime) and doc['created_at'].tzinfo else doc['created_at']
    
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute('''
            INSERT INTO incidents (id, incident_type, date, time, latitude, longitude, 
                                  description, reporter_phone, reporter_name, images, internal_notes, status, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ''', doc['id'], doc['incident_type'], doc['date'], doc['time'],
           doc['latitude'], doc['longitude'], doc['description'], doc['reporter_phone'], doc['reporter_name'],
           doc['images'], doc['internal_notes'], doc['status'], created_at)
        
        incident = await conn.fetchrow("SELECT * FROM incidents WHERE id = $1", doc['id'])
    
    incident_dict = dict(incident)
    # Parse JSON images field
    if isinstance(incident_dict.get('images'), str):
        incident_dict['images'] = json.loads(incident_dict['images'])
    
    return IncidentReport(**incident_dict)

@api_router.get("/incidents")
async def get_incidents():
    """Get all incident reports"""
    pool = await get_pool()
    
    async with pool.acquire() as conn:
        incidents = await conn.fetch("SELECT * FROM incidents ORDER BY created_at DESC LIMIT 100")
    
    incidents_list = []
    for incident in incidents:
        incident_dict = dict(incident)
        # Parse JSON images field
        if isinstance(incident_dict.get('images'), str):
            incident_dict['images'] = json.loads(incident_dict['images'])
        incidents_list.append(incident_dict)
    
    return {"incidents": incidents_list}


# ============ INCIDENT VALIDATION ENDPOINTS ============

@api_router.post("/incidents/{incident_id}/validate")
async def validate_incident(
    incident_id: str,
    payload: IncidentValidationCreate,
    current_user: dict = Depends(get_current_user)
):
    """Validate/confirm an incident report (requires authentication)"""
    pool = await get_pool()
    
    async with pool.acquire() as conn:
        # Create table if not exists
        await conn.execute('''
            CREATE TABLE IF NOT EXISTS incident_validations (
                id VARCHAR(255) PRIMARY KEY,
                incident_id VARCHAR(255) NOT NULL,
                user_id VARCHAR(255) NOT NULL,
                validation_type VARCHAR(50) DEFAULT 'confirm',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(incident_id, user_id)
            )
        ''')
        
        # Check if incident exists
        incident = await conn.fetchrow("SELECT id FROM incidents WHERE id = $1", incident_id)
        if not incident:
            raise HTTPException(status_code=404, detail="Incident not found")
        
        # Check if user already validated this incident
        existing = await conn.fetchrow(
            "SELECT id FROM incident_validations WHERE incident_id = $1 AND user_id = $2",
            incident_id, current_user["id"]
        )
        
        if existing:
            # Update existing validation
            await conn.execute(
                "UPDATE incident_validations SET validation_type = $1 WHERE incident_id = $2 AND user_id = $3",
                payload.validation_type, incident_id, current_user["id"]
            )
            return {"message": "Validation updated successfully"}
        else:
            # Create new validation
            validation_id = str(uuid.uuid4())
            created_at = datetime.now(timezone.utc)
            
            await conn.execute('''
                INSERT INTO incident_validations (id, incident_id, user_id, validation_type, created_at)
                VALUES ($1, $2, $3, $4, $5)
            ''', validation_id, incident_id, current_user["id"], payload.validation_type, to_naive_datetime(created_at))
            
            return {"message": "Incident validated successfully"}


@api_router.get("/incidents/{incident_id}/validations")
async def get_incident_validations(
    incident_id: str,
    current_user: dict = Depends(get_current_user_optional)
):
    """Get validation statistics for an incident"""
    pool = await get_pool()
    
    async with pool.acquire() as conn:
        # Create table if not exists
        await conn.execute('''
            CREATE TABLE IF NOT EXISTS incident_validations (
                id VARCHAR(255) PRIMARY KEY,
                incident_id VARCHAR(255) NOT NULL,
                user_id VARCHAR(255) NOT NULL,
                validation_type VARCHAR(50) DEFAULT 'confirm',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(incident_id, user_id)
            )
        ''')
        
        # Get validation counts
        validations = await conn.fetch(
            "SELECT validation_type, COUNT(*) as count FROM incident_validations WHERE incident_id = $1 GROUP BY validation_type",
            incident_id
        )
        
        # Check if current user has validated
        user_validated = False
        user_validation_type = None
        if current_user:
            user_validation = await conn.fetchrow(
                "SELECT validation_type FROM incident_validations WHERE incident_id = $1 AND user_id = $2",
                incident_id, current_user["id"]
            )
            if user_validation:
                user_validated = True
                user_validation_type = user_validation["validation_type"]
        
        # Format response
        validation_stats = {}
        total_validations = 0
        for v in validations:
            validation_stats[v["validation_type"]] = v["count"]
            total_validations += v["count"]
        
        return {
            "incident_id": incident_id,
            "total_validations": total_validations,
            "confirmations": validation_stats.get("confirm", 0),
            "validation_breakdown": validation_stats,
            "user_validated": user_validated,
            "user_validation_type": user_validation_type
        }


@api_router.delete("/incidents/{incident_id}/validate")
async def remove_validation(
    incident_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Remove user's validation from an incident"""
    pool = await get_pool()
    
    async with pool.acquire() as conn:
        result = await conn.execute(
            "DELETE FROM incident_validations WHERE incident_id = $1 AND user_id = $2",
            incident_id, current_user["id"]
        )
        
        if result == "DELETE 0":
            raise HTTPException(status_code=404, detail="Validation not found")
        
        return {"message": "Validation removed successfully"}


# Typhoon Dashboard endpoint
@api_router.get("/typhoon/current")
async def get_current_typhoon():
    """Get current typhoon monitoring data"""
    pool = await get_pool()
    
    async with pool.acquire() as conn:
        # Get the latest update
        row = await conn.fetchrow("SELECT * FROM typhoon_updates ORDER BY created_at DESC LIMIT 1")
        
        if not row:
             # Fallback if DB is empty for some reason, though we seeded it
            return {
                "name": "No Active Typhoon",
                "localName": "-",
                "date": None,
                "time": None,
                "intensity": "None",
                "signal_level": 0,
                "position": "-",
                "latitude": 0.0,
                "longitude": 0.0,
                "movement": "-",
                "maxWindSpeed": "-",
                "gustiness": "-",
                "pressure": "-",
                "satelliteImageUrl": "",
                "forecast": [],
                "warnings": [],
                "lastUpdate": datetime.now(timezone.utc).isoformat()
            }
        
        data = dict(row)
        
        # Parse JSON fields
        forecast = json.loads(data['forecast']) if isinstance(data['forecast'], str) else data['forecast']
        warnings = json.loads(data['warnings']) if isinstance(data['warnings'], str) else data['warnings']
        
        # Format for frontend
        return {
            "name": data['name'],
            "localName": data['local_name'],
            "date": data.get('date_str'),
            "time": data.get('time_str'),
            "intensity": data['intensity'],
            "signal_level": data['signal_level'],
            "position": data['position'],
            "latitude": data.get('latitude'),
            "longitude": data.get('longitude'),
            "movement": data['movement'],
            "maxWindSpeed": data['max_wind_speed'],
            "gustiness": data.get('gustiness'),
            "pressure": data['pressure'],
            "satelliteImageUrl": data['satellite_image_url'],
            "forecast": forecast,
            "warnings": warnings,
            "lastUpdate": data['last_update'].strftime("%b %d, %Y, %I:%M %p") if data['last_update'] else ""
        }

@api_router.post("/admin/typhoon")
async def admin_update_typhoon(
    payload: TyphoonUpdateCreate,
    current_user: dict = Depends(get_current_user),
):
    """Update typhoon status (admin only)"""
    _require_admin(current_user)
    pool = await get_pool()
    
    async with pool.acquire() as conn:
        await conn.execute('''
            INSERT INTO typhoon_updates 
            (name, local_name, date_str, time_str, intensity, signal_level, 
             position, latitude, longitude, movement, max_wind_speed, gustiness, pressure, 
             satellite_image_url, forecast, warnings, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW())
        ''', 
            payload.name, payload.localName, payload.date, payload.time, payload.intensity, payload.signal_level,
            payload.position, payload.latitude, payload.longitude, payload.movement, payload.maxWindSpeed, payload.gustiness, payload.pressure,
            payload.satelliteImageUrl, json.dumps(payload.forecast), json.dumps(payload.warnings)
        )
        
        return {"message": "Typhoon update published successfully"}


@api_router.get("/typhoon/history")
async def get_typhoon_history(
    limit: int = 50,
    months: Optional[int] = 12
):
    """Get historical typhoon data"""
    pool = await get_pool()
    
    async with pool.acquire() as conn:
        # Create typhoon_updates table if it doesn't exist
        await conn.execute('''
            CREATE TABLE IF NOT EXISTS typhoon_updates (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                local_name TEXT NOT NULL,
                date_str TEXT,
                time_str TEXT,
                intensity TEXT NOT NULL,
                signal_level INTEGER DEFAULT 0,
                position TEXT NOT NULL,
                latitude FLOAT,
                longitude FLOAT,
                movement TEXT NOT NULL,
                max_wind_speed TEXT NOT NULL,
                gustiness TEXT,
                pressure TEXT NOT NULL,
                satellite_image_url TEXT,
                forecast JSONB DEFAULT '[]',
                warnings JSONB DEFAULT '[]',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Get historical data
        if months:
            cutoff_date = datetime.now(timezone.utc) - timedelta(days=months * 30)
            typhoons = await conn.fetch(
                "SELECT * FROM typhoon_updates WHERE created_at >= $1 ORDER BY created_at DESC LIMIT $2",
                to_naive_datetime(cutoff_date), limit
            )
        else:
            typhoons = await conn.fetch(
                "SELECT * FROM typhoon_updates ORDER BY created_at DESC LIMIT $1",
                limit
            )
        
        result = []
        for typhoon in typhoons:
            data = dict(typhoon)
            # Parse JSON fields
            if isinstance(data.get('forecast'), str):
                data['forecast'] = json.loads(data['forecast'])
            if isinstance(data.get('warnings'), str):
                data['warnings'] = json.loads(data['warnings'])
            result.append(data)
        
        return {"typhoons": result, "count": len(result)}


@api_router.get("/typhoon/analytics")
async def get_typhoon_analytics(months: int = 12):
    """Get typhoon analytics and statistics"""
    pool = await get_pool()
    
    async with pool.acquire() as conn:
        cutoff_date = datetime.now(timezone.utc) - timedelta(days=months * 30)
        
        # Get all typhoons in timeframe
        typhoons = await conn.fetch(
            "SELECT * FROM typhoon_updates WHERE created_at >= $1 ORDER BY created_at DESC",
            to_naive_datetime(cutoff_date)
        )
        
        # Calculate statistics
        total_count = len(typhoons)
        
        # Group by month
        monthly_counts = {}
        intensity_counts = {}
        signal_level_counts = {0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
        
        for typhoon in typhoons:
            # Monthly count
            month_key = typhoon['created_at'].strftime('%Y-%m') if typhoon['created_at'] else 'Unknown'
            monthly_counts[month_key] = monthly_counts.get(month_key, 0) + 1
            
            # Intensity count
            intensity = typhoon['intensity'] or 'Unknown'
            intensity_counts[intensity] = intensity_counts.get(intensity, 0) + 1
            
            # Signal level count
            signal = typhoon['signal_level'] or 0
            if signal in signal_level_counts:
                signal_level_counts[signal] += 1
        
        return {
            "period_months": months,
            "total_typhoons": total_count,
            "monthly_distribution": [
                {"month": k, "count": v} for k, v in sorted(monthly_counts.items())
            ],
            "intensity_distribution": [
                {"intensity": k, "count": v} for k, v in intensity_counts.items()
            ],
            "signal_level_distribution": [
                {"signal_level": k, "count": v} for k, v in signal_level_counts.items() if v > 0
            ],
            "average_per_month": round(total_count / max(months, 1), 2) if total_count > 0 else 0
        }



# Map Locations endpoint
@api_router.get("/map/locations")
async def get_map_locations(location_type: Optional[str] = None):
    """Get all facility locations for the map (from DB, with first-run seeding)"""
    await _ensure_locations_seeded()
    
    pool = await get_pool()
    async with pool.acquire() as conn:
        if location_type:
            locations = await conn.fetch(
                "SELECT * FROM map_locations WHERE type = $1 ORDER BY id",
                location_type
            )
        else:
            locations = await conn.fetch("SELECT * FROM map_locations ORDER BY id")
    
    return {"locations": records_to_list(locations)}



# Go Bag Checklist endpoint
@api_router.get("/checklist")
async def get_checklist():
    """Get default Go Bag checklist items"""
    checklist = [
        {"id": 1, "category": "Documents", "item": "Valid IDs (Photocopy)", "essential": True},
        {"id": 2, "category": "Documents", "item": "Insurance documents", "essential": True},
        {"id": 3, "category": "Documents", "item": "Emergency contact list", "essential": True},
        {"id": 4, "category": "Documents", "item": "Medical records/prescriptions", "essential": True},
        {"id": 5, "category": "Water & Food", "item": "Drinking water (3 liters/person)", "essential": True},
        {"id": 6, "category": "Water & Food", "item": "Canned goods (3-day supply)", "essential": True},
        {"id": 7, "category": "Water & Food", "item": "Ready-to-eat food", "essential": True},
        {"id": 8, "category": "Water & Food", "item": "Can opener", "essential": False},
        {"id": 9, "category": "First Aid", "item": "First aid kit", "essential": True},
        {"id": 10, "category": "First Aid", "item": "Prescription medications", "essential": True},
        {"id": 11, "category": "First Aid", "item": "Pain relievers", "essential": False},
        {"id": 12, "category": "First Aid", "item": "Bandages and antiseptic", "essential": False},
        {"id": 13, "category": "Tools & Safety", "item": "Flashlight with extra batteries", "essential": True},
        {"id": 14, "category": "Tools & Safety", "item": "Battery-powered radio", "essential": True},
        {"id": 15, "category": "Tools & Safety", "item": "Whistle (for signaling)", "essential": True},
        {"id": 16, "category": "Tools & Safety", "item": "Multi-tool or knife", "essential": False},
        {"id": 17, "category": "Clothing", "item": "Change of clothes", "essential": True},
        {"id": 18, "category": "Clothing", "item": "Rain gear/poncho", "essential": True},
        {"id": 19, "category": "Clothing", "item": "Sturdy shoes", "essential": True},
        {"id": 20, "category": "Clothing", "item": "Blanket or sleeping bag", "essential": False},
        {"id": 21, "category": "Communication", "item": "Fully charged power bank", "essential": True},
        {"id": 22, "category": "Communication", "item": "Phone charger", "essential": True},
        {"id": 23, "category": "Communication", "item": "Emergency cash (small bills)", "essential": True},
        {"id": 24, "category": "Hygiene", "item": "Toothbrush and toothpaste", "essential": False},
        {"id": 25, "category": "Hygiene", "item": "Soap and hand sanitizer", "essential": True},
        {"id": 26, "category": "Hygiene", "item": "Toilet paper", "essential": False},
        {"id": 27, "category": "Hygiene", "item": "Face masks", "essential": True},
    ]
    return {"checklist": checklist}


# Support Resources endpoint
@api_router.get("/resources")
async def get_resources():
    """Get support resources and information"""
    resources = {
        "government_agencies": [
            {"name": "NDRRMC", "description": "National Disaster Risk Reduction and Management Council", "link": "https://ndrrmc.gov.ph"},
            {"name": "PAGASA", "description": "Philippine weather forecasts and warnings", "link": "https://bagong.pagasa.dost.gov.ph"},
            {"name": "PHIVOLCS", "description": "Volcanic and seismic monitoring", "link": "https://phivolcs.dost.gov.ph"},
            {"name": "OCD Region V", "description": "Office of Civil Defense Bicol Region", "link": "https://ocd.gov.ph"},
        ],
        "emergency_assistance": [
            {"name": "Philippine Red Cross", "description": "Disaster relief and blood services", "phone": "143"},
            {"name": "DSWD Hotline", "description": "Social welfare assistance", "phone": "8931-8101"},
            {"name": "DOH Health Emergency", "description": "24/7 health assistance", "phone": "1555"},
        ],
        "local_resources": [
            {"name": "MDRRMO Pio Duran", "description": "Municipal Disaster Risk Reduction", "address": "Municipal Hall, Poblacion"},
            {"name": "Pio Duran Municipal Hall", "description": "Local government services", "address": "Poblacion, Pio Duran, Albay"},
        ]
    }
    return resources


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_db_client():
    """Initialize database connection pool"""
    await get_pool()
    logger.info("Database connection pool initialized")

@app.on_event("shutdown")
async def shutdown_db_client():
    """Close database connection pool"""
    await close_pool()
    logger.info("Database connection pool closed")
