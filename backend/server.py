import os
import uuid
import hashlib
from datetime import datetime, timedelta
from typing import Optional, List
from fastapi import FastAPI, HTTPException, Depends, status, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from motor.motor_asyncio import AsyncIOMotorClient
from jose import JWTError, jwt
from passlib.context import CryptContext
from dotenv import load_dotenv
import re
import unicodedata

load_dotenv()

app = FastAPI(title="Convite Copa API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DB
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "test_database")
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# Auth config
SECRET_KEY = os.environ.get("SECRET_KEY", "convite-copa-secret-key-2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24h

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# --- MODELS ---

class Token(BaseModel):
    access_token: str
    token_type: str

class AdminLogin(BaseModel):
    email: str
    password: str

class EventSettings(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    honoree_1_name: Optional[str] = None
    honoree_1_age: Optional[int] = None
    honoree_2_name: Optional[str] = None
    honoree_2_age: Optional[int] = None
    event_date: Optional[str] = None
    start_time_text: Optional[str] = None
    match_text: Optional[str] = None
    drinks_text: Optional[str] = None
    dress_code_text: Optional[str] = None
    party_items_text: Optional[str] = None
    address_text: Optional[str] = None
    maps_url: Optional[str] = None
    confirmation_success_text: Optional[str] = None
    cancellation_success_text: Optional[str] = None
    open_audio_url: Optional[str] = None
    celebration_audio_url: Optional[str] = None
    theme_name: Optional[str] = None
    cancellation_audio_url: Optional[str] = None

class GuestCreate(BaseModel):
    full_name: str
    nickname: Optional[str] = None
    phone: Optional[str] = None
    notes: Optional[str] = None

class GuestUpdate(BaseModel):
    full_name: Optional[str] = None
    nickname: Optional[str] = None
    phone: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None

class RSVPConfirm(BaseModel):
    slug: Optional[str] = None
    response_name: Optional[str] = None  # for public link

class RSVPCancel(BaseModel):
    slug: Optional[str] = None
    response_name: Optional[str] = None  # for public link

# --- HELPERS ---

def serialize_doc(doc):
    if doc is None:
        return None
    result = {}
    for k, v in doc.items():
        if k == "_id":
            result["id"] = str(v)
        elif isinstance(v, datetime):
            result[k] = v.isoformat()
        else:
            result[k] = v
    return result

def slugify(text: str) -> str:
    text = unicodedata.normalize('NFKD', text)
    text = text.encode('ascii', 'ignore').decode('ascii')
    text = text.lower()
    text = re.sub(r'[^a-z0-9\s-]', '', text)
    text = re.sub(r'[\s-]+', '-', text).strip('-')
    return text

def generate_slug(name: str) -> str:
    base = slugify(name)
    suffix = uuid.uuid4().hex[:6]
    return f"{base}-{suffix}"

def get_invite_link(slug: str) -> str:
    frontend_url = os.environ.get("FRONTEND_URL", "https://rsvp-brasil.preview.emergentagent.com")
    return f"{frontend_url}/convite/{slug}"

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_admin(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    admin = await db.admin_users.find_one({"email": email})
    if admin is None:
        raise credentials_exception
    return admin

# --- STARTUP: SEED ---

@app.on_event("startup")
async def startup_event():
    # Seed admin
    existing_admin = await db.admin_users.find_one({"email": "admin@festa.com"})
    if not existing_admin:
        await db.admin_users.insert_one({
            "email": "admin@festa.com",
            "hashed_password": get_password_hash("festa2026"),
            "created_at": datetime.utcnow()
        })
        print("Admin seeded: admin@festa.com / festa2024")

    # Seed event settings
    existing_settings = await db.event_settings.find_one({"is_active": True})
    if not existing_settings:
        await db.event_settings.insert_one({
            "title": "Você foi convocado!",
            "subtitle": "Comemoração do aniversário de Anderson 24 anos e Arthur 23 anos",
            "honoree_1_name": "Anderson",
            "honoree_1_age": 24,
            "honoree_2_name": "Arthur",
            "honoree_2_age": 23,
            "event_date": "13/06/2026",
            "start_time_text": "a partir das 15h",
            "match_text": "Transmissão do jogo Brasil x Marrocos às 19h",
            "drinks_text": "Cada convidado é responsável por levar sua própria bebida",
            "dress_code_text": "Camisa da seleção ou camisa amarela, verde ou azul",
            "party_items_text": "Leve corneta, vuvuzela, bandeira e adereços de torcida",
            "address_text": "Rua da Linha, 30 — 51150-630",
            "maps_url": "https://www.google.com/maps/search/?api=1&query=Rua%20da%20Linha%2C%2030%2C%2051150-630",
            "confirmation_success_text": "Presença confirmada! Te esperamos para torcer com a gente!",
            "cancellation_success_text": "Resposta registrada. Obrigado por avisar.",
            "open_audio_url": "/sounds/envelope-open.wav",
            "celebration_audio_url": "/sounds/celebration.wav",
            "cancellation_audio_url": "/sounds/cancellation.wav",
            "theme_name": "copa",
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        })
        print("Event settings seeded")

# --- AUTH ---

@app.post("/api/auth/login", response_model=Token)
async def login(form_data: AdminLogin):
    admin = await db.admin_users.find_one({"email": form_data.email})
    if not admin or not verify_password(form_data.password, admin["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos"
        )
    token = create_access_token({"sub": admin["email"]})
    return {"access_token": token, "token_type": "bearer"}

@app.get("/api/auth/me")
async def get_me(current_admin=Depends(get_current_admin)):
    return {"email": current_admin["email"]}

# --- EVENT SETTINGS ---

@app.get("/api/event-settings")
async def get_event_settings():
    settings = await db.event_settings.find_one({"is_active": True})
    if not settings:
        raise HTTPException(status_code=404, detail="Event settings not found")
    return serialize_doc(settings)

@app.put("/api/event-settings")
async def update_event_settings(data: EventSettings, _=Depends(get_current_admin)):
    settings = await db.event_settings.find_one({"is_active": True})
    if not settings:
        raise HTTPException(status_code=404, detail="Event settings not found")
    
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    await db.event_settings.update_one(
        {"is_active": True},
        {"$set": update_data}
    )
    updated = await db.event_settings.find_one({"is_active": True})
    return serialize_doc(updated)

# --- GUESTS ---

@app.get("/api/guests")
async def list_guests(
    search: Optional[str] = None,
    status_filter: Optional[str] = None,
    _=Depends(get_current_admin)
):
    query = {}
    if search:
        query["$or"] = [
            {"full_name": {"$regex": search, "$options": "i"}},
            {"nickname": {"$regex": search, "$options": "i"}},
            {"phone": {"$regex": search, "$options": "i"}}
        ]
    if status_filter and status_filter in ["pending", "confirmed", "cancelled"]:
        query["status"] = status_filter
    
    guests = await db.guests.find(query).sort("created_at", -1).to_list(1000)
    return [serialize_doc(g) for g in guests]

@app.post("/api/guests", status_code=201)
async def create_guest(data: GuestCreate, _=Depends(get_current_admin)):
    slug = generate_slug(data.full_name)
    invite_link = get_invite_link(slug)
    
    guest = {
        "full_name": data.full_name,
        "nickname": data.nickname or "",
        "phone": data.phone or "",
        "notes": data.notes or "",
        "slug": slug,
        "invite_link": invite_link,
        "status": "pending",
        "response_name": None,
        "responded_at": None,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    result = await db.guests.insert_one(guest)
    created = await db.guests.find_one({"_id": result.inserted_id})
    return serialize_doc(created)

@app.get("/api/guests/stats")
async def get_guest_stats(_=Depends(get_current_admin)):
    total = await db.guests.count_documents({})
    confirmed = await db.guests.count_documents({"status": "confirmed"})
    cancelled = await db.guests.count_documents({"status": "cancelled"})
    pending = await db.guests.count_documents({"status": "pending"})
    return {
        "total": total,
        "confirmed": confirmed,
        "cancelled": cancelled,
        "pending": pending
    }

@app.get("/api/guests/{guest_id}")
async def get_guest(guest_id: str, _=Depends(get_current_admin)):
    from bson import ObjectId
    try:
        oid = ObjectId(guest_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid guest ID")
    guest = await db.guests.find_one({"_id": oid})
    if not guest:
        raise HTTPException(status_code=404, detail="Guest not found")
    return serialize_doc(guest)

@app.put("/api/guests/{guest_id}")
async def update_guest(guest_id: str, data: GuestUpdate, _=Depends(get_current_admin)):
    from bson import ObjectId
    try:
        oid = ObjectId(guest_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid guest ID")
    
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    result = await db.guests.update_one({"_id": oid}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Guest not found")
    updated = await db.guests.find_one({"_id": oid})
    return serialize_doc(updated)

@app.delete("/api/guests/{guest_id}")
async def delete_guest(guest_id: str, _=Depends(get_current_admin)):
    from bson import ObjectId
    try:
        oid = ObjectId(guest_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid guest ID")
    result = await db.guests.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Guest not found")
    return {"message": "Guest deleted successfully"}

# --- RSVP (PUBLIC) ---

@app.get("/api/rsvp/guest/{slug}")
async def get_guest_by_slug(slug: str):
    guest = await db.guests.find_one({"slug": slug})
    if not guest:
        raise HTTPException(status_code=404, detail="Convidado não encontrado")
    return serialize_doc(guest)

@app.post("/api/rsvp/confirm")
async def confirm_rsvp(data: RSVPConfirm):
    if data.slug:
        guest = await db.guests.find_one({"slug": data.slug})
        if not guest:
            raise HTTPException(status_code=404, detail="Convidado não encontrado")
        
        response_name = data.response_name or guest["full_name"]
        await db.guests.update_one(
            {"slug": data.slug},
            {"$set": {
                "status": "confirmed",
                "response_name": response_name,
                "responded_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }}
        )
        source = "unique_link"
    else:
        if not data.response_name:
            raise HTTPException(status_code=400, detail="Nome é obrigatório para o link público")
        response_name = data.response_name
        source = "public_link"
        # Create a guest record for public link respondents so they appear in the admin list
        new_guest = {
            "full_name": response_name,
            "nickname": "",
            "phone": "",
            "notes": "Via link público",
            "slug": None,
            "invite_link": "",
            "status": "confirmed",
            "response_name": response_name,
            "responded_at": datetime.utcnow(),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "source": "public_link"
        }
        result = await db.guests.insert_one(new_guest)
        guest = new_guest
        guest["_id"] = result.inserted_id
    
    # Log
    from bson import ObjectId
    await db.rsvp_logs.insert_one({
        "guest_id": str(guest["_id"]) if data.slug or (not data.slug and guest.get("_id")) else None,
        "guest_name": response_name,
        "action": "confirmed",
        "response_name": response_name,
        "source": source,
        "created_at": datetime.utcnow()
    })
    
    settings = await db.event_settings.find_one({"is_active": True})
    msg = settings.get("confirmation_success_text", "Presença confirmada! Te esperamos para torcer com a gente!") if settings else "Presença confirmada!"
    return {"message": msg, "status": "confirmed"}

@app.post("/api/rsvp/cancel")
async def cancel_rsvp(data: RSVPCancel):
    if data.slug:
        guest = await db.guests.find_one({"slug": data.slug})
        if not guest:
            raise HTTPException(status_code=404, detail="Convidado não encontrado")
        
        response_name = data.response_name or guest["full_name"]
        await db.guests.update_one(
            {"slug": data.slug},
            {"$set": {
                "status": "cancelled",
                "response_name": response_name,
                "responded_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }}
        )
        source = "unique_link"
    else:
        if not data.response_name:
            raise HTTPException(status_code=400, detail="Nome é obrigatório para o link público")
        response_name = data.response_name
        source = "public_link"
        # Create a guest record for public link cancellations too
        new_guest = {
            "full_name": response_name,
            "nickname": "",
            "phone": "",
            "notes": "Via link público",
            "slug": None,
            "invite_link": "",
            "status": "cancelled",
            "response_name": response_name,
            "responded_at": datetime.utcnow(),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "source": "public_link"
        }
        result = await db.guests.insert_one(new_guest)
        guest = new_guest
        guest["_id"] = result.inserted_id
    
    await db.rsvp_logs.insert_one({
        "guest_id": str(guest["_id"]) if guest.get("_id") else None,
        "guest_name": response_name,
        "action": "cancelled",
        "response_name": response_name,
        "source": source,
        "created_at": datetime.utcnow()
    })
    
    settings = await db.event_settings.find_one({"is_active": True})
    msg = settings.get("cancellation_success_text", "Resposta registrada. Obrigado por avisar.") if settings else "Resposta registrada."
    return {"message": msg, "status": "cancelled"}

# --- RSVP LOGS ---

@app.get("/api/rsvp-logs")
async def get_rsvp_logs(_=Depends(get_current_admin)):
    logs = await db.rsvp_logs.find().sort("created_at", -1).to_list(500)
    return [serialize_doc(l) for l in logs]

@app.get("/api/guests/export")
async def export_guests_csv(_=Depends(get_current_admin)):
    from fastapi.responses import StreamingResponse
    import csv, io
    guests = await db.guests.find().sort("created_at", -1).to_list(10000)
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Nome", "Apelido", "Telefone", "Status",
        "Resposta", "Data da resposta", "Origem", "Link do convite", "Observações", "Cadastrado em"
    ])
    status_labels = {"pending": "Pendente", "confirmed": "Confirmado", "cancelled": "Cancelado"}
    for g in guests:
        responded_at = ""
        if g.get("responded_at"):
            dt = g["responded_at"]
            if isinstance(dt, datetime):
                responded_at = dt.strftime("%d/%m/%Y %H:%M")
            else:
                responded_at = str(dt)[:16]
        created_at = ""
        if g.get("created_at"):
            dt = g["created_at"]
            if isinstance(dt, datetime):
                created_at = dt.strftime("%d/%m/%Y %H:%M")
            else:
                created_at = str(dt)[:16]
        writer.writerow([
            g.get("full_name", ""),
            g.get("nickname", ""),
            g.get("phone", ""),
            status_labels.get(g.get("status", "pending"), "Pendente"),
            g.get("response_name", ""),
            responded_at,
            "",
            g.get("invite_link", ""),
            g.get("notes", ""),
            created_at,
        ])
    output.seek(0)
    bom = "\ufeff"  # UTF-8 BOM for Excel compatibility
    content = bom + output.getvalue()
    return StreamingResponse(
        iter([content.encode("utf-8")]),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": "attachment; filename=convidados.csv"}
    )


@app.get("/api/health")
async def health():
    return {"status": "ok"}

# --- AUDIO UPLOAD ---

@app.post("/api/upload/audio")
async def upload_audio(
    file: UploadFile,
    _=Depends(get_current_admin)
):
    import os, uuid
    # Validate file type
    allowed_types = ["audio/wav", "audio/mpeg", "audio/mp3", "audio/ogg", "audio/x-wav", "audio/x-mpeg"]
    allowed_exts = [".wav", ".mp3", ".ogg", ".m4a"]
    
    filename = file.filename or "audio"
    ext = os.path.splitext(filename)[1].lower()
    if ext not in allowed_exts:
        raise HTTPException(status_code=400, detail=f"Formato não suportado. Use: {', '.join(allowed_exts)}")
    
    # Generate unique filename
    safe_name = f"custom_{uuid.uuid4().hex[:8]}{ext}"
    save_path = f"/app/frontend/public/sounds/{safe_name}"
    
    # Save file
    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(status_code=400, detail="Arquivo muito grande. Limite: 10MB")
    
    with open(save_path, "wb") as f:
        f.write(contents)
    
    public_url = f"/sounds/{safe_name}"
    return {"url": public_url, "filename": safe_name, "message": "Áudio enviado com sucesso!"}
