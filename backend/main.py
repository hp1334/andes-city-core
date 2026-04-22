import os
from fastapi import FastAPI
from supabase import create_client, Client
from dotenv import load_dotenv

# Cargar variables de entorno asegurando la ruta correcta
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(BASE_DIR, '.env')
load_dotenv(env_path)

# Inicializar Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("Las variables de entorno SUPABASE_URL y SUPABASE_SERVICE_KEY son requeridas.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

# Configurar FastAPI
app = FastAPI(
    title="Andes City MVP Backend",
    description="Backend refactorizado para el MVP de Andes City",
    version="1.0.0"
)

# ── 1. CONFIGURACIÓN CORS SEGURA ──
# Obtenemos los orígenes del .env, o usamos default local
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "http://localhost:8081")
origins = [origin.strip() for origin in allowed_origins_env.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, # NUNCA usar ["*"] en producción
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# ── 2. PREPARACIÓN PARA RATE LIMITING Y AUTH ──
# TODO: Implementar SlowAPI para rate limiting (ej. 100 req/min).
# TODO: Implementar dependencia `verify_supabase_token` para endpoints privados.

@app.get("/")
def read_root():
    return {
        "status": "Mela al mando",
        "proyecto": "Andes City",
        "mensaje": "¡Backend funcionando con FastAPI y Supabase!"
    }

@app.get("/clima")
def get_clima():
    try:
        response = supabase.table("weather_log").select("*").order("recorded_at", desc=True).limit(1).execute()
        return response.data[0] if response.data else {"error": "Sin datos de clima"}
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/routes/status")
def get_routes():
    try:
        response = supabase.table("mobility_routes").select("name, status, travel_time_min").execute()
        return {"routes": response.data} if response.data else {"error": "Sin rutas"}
    except Exception as e:
         return {"error": str(e)}
