"""
FastAPI backend para Vercel Serverless Functions + Vercel Postgres
Rota: /api/* -> este arquivo
"""
import os
import re
import uuid
import unicodedata
from datetime import datetime, timedelta
from typing import Optional

import psycopg2
import psycopg2.extras
import requests as http_requests
from fastapi import FastAPI, HTTPException, Depends, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel

# ─────────────────────────────── CONFIG ───────────────────────────────

SECRET_KEY = os.environ.get("SECRET_KEY", "convite-copa-secret-2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24
DATABASE_URL = os.environ.get("POSTGRES_URL") or os.environ.get("POSTGRES_URL_NON_POOLING")
BLOB_TOKEN = os.environ.get("BLOB_READ_WRITE_TOKEN", "")
FRONTEND_URL = os.environ.get("FRONTEND_URL", "https://seu-app.vercel.app")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

app = FastAPI(title="Convite Copa API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────── DB ───────────────────────────────────

def get_conn():
    """Cria conexão PostgreSQL. Vercel Postgres fornece POSTGRES_URL."""
    if not DATABASE_URL:
        raise HTTPException(status_code=500, detail="DATABASE_URL não configurado.")
    conn = psycopg2.connect(DATABASE_URL, cursor_factory=psycopg2.extras.RealDictCursor)
    conn.autocommit = False
    return conn

def row_to_dict(row):
    if row is None:
        return None
    d = dict(row)
    for k, v in d.items():
        if isinstance(v, datetime):
            d[k] = v.isoformat()
    return d

# ─────────────────────────────── MODELS ───────────────────────────────

class AdminLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

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
    cancellation_audio_url: Optional[str] = None
    theme_name: Optional[str] = None
    is_active: Optional[bool] = None

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

class RSVPRequest(BaseModel):
    slug: Optional[str] = None
    response_name: Optional[str] = None

# ─────────────────────────────── HELPERS ──────────────────────────────

def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    text = re.sub(r"[^a-z0-9\s-]", "", text.lower())
    return re.sub(r"[\s-]+", "-", text).strip("-")

def generate_slug(name: str) -> str:
    return f"{slugify(name)}-{uuid.uuid4().hex[:6]}"

def get_invite_link(slug: str) -> str:
    return f"{FRONTEND_URL}/convite/{slug}"

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def create_token(email: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode({"sub": email, "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)

def get_current_admin(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if not email:
            raise HTTPException(status_code=401, detail="Token inválido")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM admin_users WHERE email = %s", (email,))
            admin = cur.fetchone()
        if not admin:
            raise HTTPException(status_code=401, detail="Admin não encontrado")
        return dict(admin)
    finally:
        conn.close()

# ─────────────────────────────── AUTH ─────────────────────────────────

@app.post("/api/auth/login", response_model=Token)
def login(data: AdminLogin):
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM admin_users WHERE email = %s", (data.email,))
            admin = cur.fetchone()
        if not admin or not verify_password(data.password, admin["hashed_password"]):
            raise HTTPException(status_code=401, detail="Email ou senha incorretos")
        return {"access_token": create_token(data.email), "token_type": "bearer"}
    finally:
        conn.close()

@app.get("/api/auth/me")
def get_me(current=Depends(get_current_admin)):
    return {"email": current["email"]}

# ─────────────────────────────── EVENT SETTINGS ───────────────────────

@app.get("/api/event-settings")
def get_event_settings():
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM event_settings WHERE is_active = TRUE LIMIT 1")
            row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Configurações não encontradas")
        return row_to_dict(row)
    finally:
        conn.close()

@app.put("/api/event-settings")
def update_event_settings(data: EventSettings, _=Depends(get_current_admin)):
    fields = {k: v for k, v in data.dict().items() if v is not None}
    if not fields:
        return get_event_settings()
    fields["updated_at"] = datetime.utcnow()
    set_clause = ", ".join(f"{k} = %s" for k in fields)
    values = list(fields.values())
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                f"UPDATE event_settings SET {set_clause} WHERE is_active = TRUE",
                values
            )
            conn.commit()
            cur.execute("SELECT * FROM event_settings WHERE is_active = TRUE LIMIT 1")
            return row_to_dict(cur.fetchone())
    finally:
        conn.close()

# ─────────────────────────────── GUESTS ───────────────────────────────

@app.get("/api/guests/stats")
def get_stats(_=Depends(get_current_admin)):
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) as total FROM guests")
            total = cur.fetchone()["total"]
            cur.execute("SELECT COUNT(*) as n FROM guests WHERE status = 'confirmed'")
            confirmed = cur.fetchone()["n"]
            cur.execute("SELECT COUNT(*) as n FROM guests WHERE status = 'cancelled'")
            cancelled = cur.fetchone()["n"]
            cur.execute("SELECT COUNT(*) as n FROM guests WHERE status = 'pending'")
            pending = cur.fetchone()["n"]
        return {"total": total, "confirmed": confirmed, "cancelled": cancelled, "pending": pending}
    finally:
        conn.close()

@app.get("/api/guests/export")
def export_guests(_=Depends(get_current_admin)):
    import csv, io
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM guests ORDER BY created_at DESC")
            guests = [dict(r) for r in cur.fetchall()]
    finally:
        conn.close()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Nome", "Apelido", "Telefone", "Status", "Resposta",
                     "Data da resposta", "Origem", "Link do convite", "Observações", "Cadastrado em"])
    labels = {"pending": "Pendente", "confirmed": "Confirmado", "cancelled": "Cancelado"}
    for g in guests:
        def fmt(dt): return dt.strftime("%d/%m/%Y %H:%M") if isinstance(dt, datetime) else (str(dt)[:16] if dt else "")
        writer.writerow([g.get("full_name", ""), g.get("nickname", ""), g.get("phone", ""),
                         labels.get(g.get("status", "pending"), "Pendente"), g.get("response_name", ""),
                         fmt(g.get("responded_at")), g.get("source", ""), g.get("invite_link", ""),
                         g.get("notes", ""), fmt(g.get("created_at"))])
    output.seek(0)
    content = "\ufeff" + output.getvalue()
    return StreamingResponse(iter([content.encode("utf-8")]),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": "attachment; filename=convidados.csv"})

@app.get("/api/guests")
def list_guests(search: Optional[str] = None, status_filter: Optional[str] = None,
                _=Depends(get_current_admin)):
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            conditions, values = [], []
            if search:
                conditions.append("(full_name ILIKE %s OR nickname ILIKE %s OR phone ILIKE %s)")
                values += [f"%{search}%", f"%{search}%", f"%{search}%"]
            if status_filter in ("pending", "confirmed", "cancelled"):
                conditions.append("status = %s")
                values.append(status_filter)
            where = "WHERE " + " AND ".join(conditions) if conditions else ""
            cur.execute(f"SELECT * FROM guests {where} ORDER BY created_at DESC", values)
            return [row_to_dict(r) for r in cur.fetchall()]
    finally:
        conn.close()

@app.post("/api/guests", status_code=201)
def create_guest(data: GuestCreate, _=Depends(get_current_admin)):
    slug = generate_slug(data.full_name)
    link = get_invite_link(slug)
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """INSERT INTO guests (id, full_name, nickname, phone, notes, slug, invite_link,
                   status, created_at, updated_at)
                   VALUES (%s,%s,%s,%s,%s,%s,%s,'pending',NOW(),NOW()) RETURNING *""",
                (str(uuid.uuid4()), data.full_name, data.nickname or "", data.phone or "",
                 data.notes or "", slug, link)
            )
            guest = row_to_dict(cur.fetchone())
            conn.commit()
        return guest
    finally:
        conn.close()

@app.get("/api/guests/{guest_id}")
def get_guest(guest_id: str, _=Depends(get_current_admin)):
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM guests WHERE id = %s", (guest_id,))
            row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Convidado não encontrado")
        return row_to_dict(row)
    finally:
        conn.close()

@app.put("/api/guests/{guest_id}")
def update_guest(guest_id: str, data: GuestUpdate, _=Depends(get_current_admin)):
    fields = {k: v for k, v in data.dict().items() if v is not None}
    if not fields:
        return get_guest(guest_id, None)
    fields["updated_at"] = datetime.utcnow()
    set_clause = ", ".join(f"{k} = %s" for k in fields)
    values = list(fields.values()) + [guest_id]
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(f"UPDATE guests SET {set_clause} WHERE id = %s RETURNING *", values)
            row = cur.fetchone()
            conn.commit()
        if not row:
            raise HTTPException(status_code=404, detail="Convidado não encontrado")
        return row_to_dict(row)
    finally:
        conn.close()

@app.delete("/api/guests/{guest_id}")
def delete_guest(guest_id: str, _=Depends(get_current_admin)):
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM guests WHERE id = %s", (guest_id,))
            conn.commit()
        return {"message": "Convidado removido"}
    finally:
        conn.close()

# ─────────────────────────────── RSVP ─────────────────────────────────

@app.get("/api/rsvp/guest/{slug}")
def get_guest_by_slug(slug: str):
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM guests WHERE slug = %s", (slug,))
            row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Convidado não encontrado")
        return row_to_dict(row)
    finally:
        conn.close()

def _do_rsvp(data: RSVPRequest, action: str):
    conn = get_conn()
    try:
        if data.slug:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM guests WHERE slug = %s", (data.slug,))
                guest = cur.fetchone()
            if not guest:
                raise HTTPException(status_code=404, detail="Convidado não encontrado")
            response_name = data.response_name or guest["full_name"]
            guest_id = str(guest["id"])
            source = "unique_link"
            with conn.cursor() as cur:
                cur.execute(
                    "UPDATE guests SET status=%s, response_name=%s, responded_at=NOW(), updated_at=NOW() WHERE slug=%s",
                    (action, response_name, data.slug)
                )
        else:
            if not data.response_name:
                raise HTTPException(status_code=400, detail="Nome é obrigatório para o link público")
            response_name = data.response_name
            source = "public_link"
            new_id = str(uuid.uuid4())
            guest_id = new_id
            with conn.cursor() as cur:
                cur.execute(
                    """INSERT INTO guests (id, full_name, status, response_name, responded_at,
                       notes, source, invite_link, created_at, updated_at)
                       VALUES (%s,%s,%s,%s,NOW(),'Via link público',%s,'',NOW(),NOW())""",
                    (new_id, response_name, action, response_name, source)
                )

        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO rsvp_logs (id, guest_id, guest_name, action, response_name, source, created_at) VALUES (%s,%s,%s,%s,%s,%s,NOW())",
                (str(uuid.uuid4()), guest_id, response_name, action, response_name, source)
            )
        conn.commit()

        with conn.cursor() as cur:
            cur.execute("SELECT * FROM event_settings WHERE is_active=TRUE LIMIT 1")
            settings = cur.fetchone()

        key = "confirmation_success_text" if action == "confirmed" else "cancellation_success_text"
        default = "Presença confirmada! Te esperamos!" if action == "confirmed" else "Resposta registrada. Obrigado por avisar."
        msg = settings[key] if settings and settings.get(key) else default
        return {"message": msg, "status": action}
    finally:
        conn.close()

@app.post("/api/rsvp/confirm")
def confirm_rsvp(data: RSVPRequest):
    return _do_rsvp(data, "confirmed")

@app.post("/api/rsvp/cancel")
def cancel_rsvp(data: RSVPRequest):
    return _do_rsvp(data, "cancelled")

@app.get("/api/rsvp-logs")
def get_rsvp_logs(_=Depends(get_current_admin)):
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM rsvp_logs ORDER BY created_at DESC LIMIT 500")
            return [row_to_dict(r) for r in cur.fetchall()]
    finally:
        conn.close()

# ─────────────────────────────── AUDIO UPLOAD (Vercel Blob) ───────────

@app.post("/api/upload/audio")
def upload_audio(file: UploadFile, _=Depends(get_current_admin)):
    allowed_exts = [".wav", ".mp3", ".ogg", ".m4a"]
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in allowed_exts:
        raise HTTPException(status_code=400, detail=f"Formato não suportado. Use: {', '.join(allowed_exts)}")

    contents = file.file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Arquivo muito grande. Limite: 10MB")

    # Upload via Vercel Blob REST API
    if not BLOB_TOKEN:
        raise HTTPException(status_code=500, detail="BLOB_READ_WRITE_TOKEN não configurado no Vercel")

    safe_name = f"audio/custom_{uuid.uuid4().hex[:8]}{ext}"
    content_type_map = {".mp3": "audio/mpeg", ".wav": "audio/wav", ".ogg": "audio/ogg", ".m4a": "audio/mp4"}
    content_type = content_type_map.get(ext, "audio/wav")

    resp = http_requests.put(
        f"https://blob.vercel-storage.com/{safe_name}",
        data=contents,
        headers={
            "Authorization": f"Bearer {BLOB_TOKEN}",
            "Content-Type": content_type,
            "x-content-type": content_type,
        },
        timeout=30,
    )
    if resp.status_code not in (200, 201):
        raise HTTPException(status_code=500, detail=f"Erro no upload: {resp.text}")

    public_url = resp.json().get("url", "")
    return {"url": public_url, "filename": safe_name, "message": "Áudio enviado com sucesso!"}

@app.get("/api/health")
def health():
    return {"status": "ok"}
