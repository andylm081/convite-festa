"""
FastAPI – Vercel Serverless Functions + PostgreSQL externo (Neon / Supabase)
Todas as rotas /api/* chegam aqui.
"""
import os, re, uuid, unicodedata, csv, io
from contextlib import contextmanager
from datetime import datetime, timedelta
from typing import Optional

import psycopg2
import psycopg2.extras
import requests as http_req
from fastapi import FastAPI, HTTPException, Depends, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel

# ──────────────────────────── CONFIG ────────────────────────────────────

SECRET_KEY   = os.environ.get("SECRET_KEY", "festa2026")
ALGORITHM    = "HS256"
TOKEN_EXP    = 60 * 24
BLOB_TOKEN   = os.environ.get("BLOB_READ_WRITE_TOKEN", "")
FRONTEND_URL = os.environ.get("FRONTEND_URL", "https://seu-app.vercel.app")

_db_url = (
    os.environ.get("POSTGRES_URL")
    or os.environ.get("DATABASE_URL")
    or os.environ.get("POSTGRES_URL_NON_POOLING")
    or ""
)
if _db_url.startswith("postgres://"):
    _db_url = "postgresql://" + _db_url[len("postgres://"):]
if _db_url and "sslmode=" not in _db_url:
    sep = "&" if "?" in _db_url else "?"
    _db_url = _db_url + sep + "sslmode=require"

DATABASE_URL = _db_url

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2  = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

app = FastAPI(title="Convite API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"],
)

# ──────────────────────────── DB (context manager — sempre fecha) ────────

@contextmanager
def db():
    """
    Conexão com Supabase/Neon com parsing manual da URL.
    Decodifica %5B, %5D e outros chars especiais na senha explicitamente
    (psycopg2 às vezes falha ao parsear URIs com password URL-encoded).
    Retry automático para quando o banco acorda da suspensão.
    """
    if not DATABASE_URL:
        raise HTTPException(500, "POSTGRES_URL não configurado no Vercel.")

    # Parse manual — garante decodificação correta da senha
    from urllib.parse import urlparse, unquote
    p = urlparse(DATABASE_URL)
    conn_kwargs = dict(
        host            = p.hostname,
        port            = p.port or 5432,
        user            = unquote(p.username or ""),
        password        = unquote(p.password or ""),
        dbname          = p.path.lstrip("/"),
        sslmode         = "require",
        connect_timeout = 10,
    )

    conn = None
    last_err = None
    for attempt in range(3):
        try:
            conn = psycopg2.connect(
                cursor_factory=psycopg2.extras.RealDictCursor,
                **conn_kwargs,
            )
            break
        except Exception as e:
            last_err = e
            if attempt < 2:
                import time
                time.sleep(2)

    if conn is None:
        raise HTTPException(503, f"Banco indisponível. Tente novamente. ({str(last_err)[:120]})")

    try:
        yield conn
        conn.commit()
    except HTTPException:
        conn.rollback()
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(500, f"Erro no banco: {str(e)[:200]}")
    finally:
        conn.close()

# ──────────────────────────── HELPERS ────────────────────────────────────

def to_dict(row) -> dict:
    if row is None:
        return None
    d = {}
    for k, v in dict(row).items():
        if isinstance(v, datetime):
            d[k] = v.isoformat()
        elif hasattr(v, "int") and type(v).__name__ == "UUID":
            d[k] = str(v)
        else:
            d[k] = v
    return d

def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    text = re.sub(r"[^a-z0-9\s-]", "", text.lower())
    return re.sub(r"[\s-]+", "-", text).strip("-")

def gen_slug(name: str) -> str:
    return f"{slugify(name)}-{uuid.uuid4().hex[:6]}"

def invite_link(slug: str) -> str:
    return f"{FRONTEND_URL}/convite/{slug}"

def verify_pw(plain, hashed): return pwd_ctx.verify(plain, hashed)

def make_token(email: str) -> str:
    exp = datetime.utcnow() + timedelta(minutes=TOKEN_EXP)
    return jwt.encode({"sub": email, "exp": exp}, SECRET_KEY, algorithm=ALGORITHM)

def get_admin(token: str = Depends(oauth2)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if not email:
            raise HTTPException(401, "Token inválido")
    except JWTError:
        raise HTTPException(401, "Token inválido ou expirado")
    with db() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT email FROM admin_users WHERE email = %s", (email,))
            row = cur.fetchone()
    if not row:
        raise HTTPException(401, "Admin não encontrado")
    return dict(row)

# ──────────────────────────── MODELS ─────────────────────────────────────

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
    cancellation_audio_url: Optional[str] = None
    theme_name: Optional[str] = None
    is_active: Optional[bool] = None

class GuestCreate(BaseModel):
    full_name: str
    nickname: Optional[str] = ""
    phone: Optional[str] = ""
    notes: Optional[str] = ""

class GuestUpdate(BaseModel):
    full_name: Optional[str] = None
    nickname: Optional[str] = None
    phone: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None

class RSVPRequest(BaseModel):
    slug: Optional[str] = None
    response_name: Optional[str] = None

# ──────────────────────────── AUTH ────────────────────────────────────────

@app.post("/api/auth/login")
def login(data: AdminLogin):
    with db() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT hashed_password FROM admin_users WHERE email = %s", (data.email,))
            row = cur.fetchone()
    if not row or not verify_pw(data.password, row["hashed_password"]):
        raise HTTPException(401, "Email ou senha incorretos")
    return {"access_token": make_token(data.email), "token_type": "bearer"}

@app.get("/api/auth/me")
def get_me(admin=Depends(get_admin)):
    return {"email": admin["email"]}

# ──────────────────────────── EVENT SETTINGS ──────────────────────────────

@app.get("/api/event-settings")
def get_settings():
    from fastapi.responses import JSONResponse
    with db() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM event_settings WHERE is_active = TRUE LIMIT 1")
            row = cur.fetchone()
    if not row:
        raise HTTPException(404, "Configurações não encontradas")
    return JSONResponse(
        content=to_dict(row),
        headers={"Cache-Control": "no-store, no-cache, must-revalidate, max-age=0"}
    )

@app.put("/api/event-settings")
def put_settings(data: EventSettings, _=Depends(get_admin)):
    fields = {k: v for k, v in data.dict().items() if v is not None}
    if not fields:
        return get_settings()
    fields["updated_at"] = datetime.utcnow()
    set_sql = ", ".join(f"{k} = %s" for k in fields)
    with db() as conn:
        with conn.cursor() as cur:
            cur.execute(f"UPDATE event_settings SET {set_sql} WHERE is_active = TRUE", list(fields.values()))
    return get_settings()

# ──────────────────────────── GUESTS ──────────────────────────────────────

@app.get("/api/guests/stats")
def guest_stats(_=Depends(get_admin)):
    with db() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT
                  COUNT(*) total,
                  COUNT(*) FILTER (WHERE status='confirmed') confirmed,
                  COUNT(*) FILTER (WHERE status='cancelled') cancelled,
                  COUNT(*) FILTER (WHERE status='pending') pending
                FROM guests
            """)
            row = dict(cur.fetchone())
    return row

@app.get("/api/guests/export")
def export_csv(_=Depends(get_admin)):
    with db() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM guests ORDER BY created_at DESC")
            rows = [to_dict(r) for r in cur.fetchall()]

    out = io.StringIO()
    w = csv.writer(out)
    w.writerow(["Nome","Apelido","Telefone","Status","Resposta","Data resposta","Origem","Link","Obs","Cadastro"])
    labels = {"pending":"Pendente","confirmed":"Confirmado","cancelled":"Cancelado"}
    def fmt(v): return str(v)[:16].replace("T"," ") if v else ""
    for g in rows:
        w.writerow([g.get("full_name",""), g.get("nickname",""), g.get("phone",""),
                    labels.get(g.get("status","pending"),"Pendente"), g.get("response_name",""),
                    fmt(g.get("responded_at","")), g.get("source",""), g.get("invite_link",""),
                    g.get("notes",""), fmt(g.get("created_at",""))])
    out.seek(0)
    return StreamingResponse(
        iter([("\ufeff" + out.getvalue()).encode("utf-8")]),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": "attachment; filename=convidados.csv"},
    )

@app.get("/api/guests")
def list_guests(search: Optional[str] = None, status_filter: Optional[str] = None,
                _=Depends(get_admin)):
    conds, vals = [], []
    if search:
        conds.append("(full_name ILIKE %s OR nickname ILIKE %s OR phone ILIKE %s)")
        vals += [f"%{search}%", f"%{search}%", f"%{search}%"]
    if status_filter in ("pending","confirmed","cancelled"):
        conds.append("status = %s")
        vals.append(status_filter)
    where = ("WHERE " + " AND ".join(conds)) if conds else ""
    with db() as conn:
        with conn.cursor() as cur:
            cur.execute(f"SELECT * FROM guests {where} ORDER BY created_at DESC", vals)
            return [to_dict(r) for r in cur.fetchall()]

@app.post("/api/guests", status_code=201)
def create_guest(data: GuestCreate, _=Depends(get_admin)):
    gid  = str(uuid.uuid4())
    slug = gen_slug(data.full_name)
    link = invite_link(slug)
    with db() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """INSERT INTO guests
                   (id, full_name, nickname, phone, notes, slug, invite_link, status, created_at, updated_at)
                   VALUES (%s,%s,%s,%s,%s,%s,%s,'pending',NOW(),NOW()) RETURNING *""",
                (gid, data.full_name, data.nickname or "", data.phone or "",
                 data.notes or "", slug, link),
            )
            return to_dict(cur.fetchone())

@app.get("/api/guests/{guest_id}")
def get_guest(guest_id: str, _=Depends(get_admin)):
    with db() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM guests WHERE id = %s", (guest_id,))
            row = cur.fetchone()
    if not row:
        raise HTTPException(404, "Convidado não encontrado")
    return to_dict(row)

@app.put("/api/guests/{guest_id}")
def update_guest(guest_id: str, data: GuestUpdate, _=Depends(get_admin)):
    fields = {k: v for k, v in data.dict().items() if v is not None}
    if not fields:
        return get_guest(guest_id)
    fields["updated_at"] = datetime.utcnow()
    set_sql = ", ".join(f"{k} = %s" for k in fields)
    with db() as conn:
        with conn.cursor() as cur:
            cur.execute(f"UPDATE guests SET {set_sql} WHERE id = %s RETURNING *",
                        list(fields.values()) + [guest_id])
            row = cur.fetchone()
    if not row:
        raise HTTPException(404, "Convidado não encontrado")
    return to_dict(row)

@app.delete("/api/guests/{guest_id}")
def delete_guest(guest_id: str, _=Depends(get_admin)):
    with db() as conn:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM guests WHERE id = %s", (guest_id,))
    return {"message": "Convidado removido"}

# ──────────────────────────── RSVP ────────────────────────────────────────

@app.get("/api/rsvp/guest/{slug}")
def rsvp_by_slug(slug: str):
    with db() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM guests WHERE slug = %s", (slug,))
            row = cur.fetchone()
    if not row:
        raise HTTPException(404, "Convidado não encontrado")
    return to_dict(row)

def _do_rsvp(data: RSVPRequest, action: str):
    with db() as conn:
        if data.slug:
            with conn.cursor() as cur:
                cur.execute("SELECT id, full_name FROM guests WHERE slug = %s", (data.slug,))
                guest = cur.fetchone()
            if not guest:
                raise HTTPException(404, "Convidado não encontrado")
            rname    = data.response_name or guest["full_name"]
            guest_id = str(guest["id"])
            source   = "unique_link"
            with conn.cursor() as cur:
                cur.execute(
                    "UPDATE guests SET status=%s, response_name=%s, responded_at=NOW(), updated_at=NOW() WHERE slug=%s",
                    (action, rname, data.slug),
                )
        else:
            if not data.response_name:
                raise HTTPException(400, "Nome é obrigatório para o link público")
            rname    = data.response_name
            source   = "public_link"
            guest_id = str(uuid.uuid4())
            with conn.cursor() as cur:
                cur.execute(
                    """INSERT INTO guests
                       (id, full_name, status, response_name, responded_at,
                        notes, source, invite_link, created_at, updated_at)
                       VALUES (%s,%s,%s,%s,NOW(),'Via link público',%s,'',NOW(),NOW())""",
                    (guest_id, rname, action, rname, source),
                )

        with conn.cursor() as cur:
            cur.execute(
                """INSERT INTO rsvp_logs
                   (id, guest_id, guest_name, action, response_name, source, created_at)
                   VALUES (%s,%s,%s,%s,%s,%s,NOW())""",
                (str(uuid.uuid4()), guest_id, rname, action, rname, source),
            )

        with conn.cursor() as cur:
            cur.execute("SELECT * FROM event_settings WHERE is_active=TRUE LIMIT 1")
            cfg = cur.fetchone()

    key  = "confirmation_success_text" if action == "confirmed" else "cancellation_success_text"
    dflt = ("Presença confirmada! Te esperamos!" if action == "confirmed"
            else "Resposta registrada. Obrigado por avisar.")
    msg  = (cfg.get(key) or dflt) if cfg else dflt
    return {"message": msg, "status": action}

@app.post("/api/rsvp/confirm")
def confirm(data: RSVPRequest): return _do_rsvp(data, "confirmed")

@app.post("/api/rsvp/cancel")
def cancel(data: RSVPRequest): return _do_rsvp(data, "cancelled")

@app.get("/api/rsvp-logs")
def rsvp_logs(_=Depends(get_admin)):
    with db() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM rsvp_logs ORDER BY created_at DESC LIMIT 500")
            return [to_dict(r) for r in cur.fetchall()]

# ──────────────────────────── AUDIO UPLOAD ────────────────────────────────

@app.post("/api/upload/audio")
def upload_audio(file: UploadFile, _=Depends(get_admin)):
    allowed = [".wav", ".mp3", ".ogg", ".m4a"]
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in allowed:
        raise HTTPException(400, f"Use: {', '.join(allowed)}")
    content = file.file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(400, "Arquivo muito grande. Limite: 10MB")
    if not BLOB_TOKEN:
        raise HTTPException(500, "Configure o Vercel Blob (BLOB_READ_WRITE_TOKEN)")
    mime  = {".mp3":"audio/mpeg",".wav":"audio/wav",".ogg":"audio/ogg",".m4a":"audio/mp4"}.get(ext,"audio/wav")
    fname = f"audio-{uuid.uuid4().hex[:8]}{ext}"
    resp  = http_req.put(
        f"https://blob.vercel-storage.com/{fname}",
        data=content,
        headers={"Authorization": f"Bearer {BLOB_TOKEN}", "Content-Type": mime},
        timeout=30,
    )
    if resp.status_code not in (200, 201):
        raise HTTPException(500, f"Erro Vercel Blob: {resp.text[:200]}")
    return {"url": resp.json().get("url",""), "message": "Áudio enviado com sucesso!"}

# ──────────────────────────── HEALTH ──────────────────────────────────────

@app.get("/api/health")
def health():
    try:
        with db() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT email, LEFT(hashed_password,10) as h FROM admin_users LIMIT 1")
                row = cur.fetchone()
        host = __import__('urllib.parse', fromlist=['urlparse']).urlparse(DATABASE_URL).hostname or "?"
        return {"status": "ok", "db": "connected", "host": host[:30], "admin": dict(row) if row else None}
    except Exception as e:
        return {"status": "error", "detail": str(e)[:200]}

# Vercel ASGI handler
handler = app
