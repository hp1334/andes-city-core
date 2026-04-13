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
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("Las variables de entorno SUPABASE_URL y SUPABASE_KEY son requeridas.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Configurar FastAPI
app = FastAPI(
    title="Andes City MVP Backend",
    description="Backend refactorizado para el MVP de Andes City",
    version="1.0.0"
)

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
