# Setup Andes City

## Requisitos
- Node 18+
- Python 3.11+
- Expo CLI
- Cuenta Supabase

## Frontend
cd app
npm install
cp .env.example .env
# Llenar variables en .env
npx expo start

## Backend
cd backend
python -m venv venv
source venv/bin/activate  # Mac/Linux
venv\Scripts\activate     # Windows
pip install -r requirements.txt
cp .env.example .env
# Llenar variables en .env
uvicorn main:app --reload

## Base de datos
Ir a Supabase dashboard
Ejecutar /database/schema.sql
Copiar URL y keys al .env
