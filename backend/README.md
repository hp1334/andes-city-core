# 🏙️ Andes City - Backend Core

Este es el corazón del proyecto **Andes City**, encargado de conectar la base de datos de Supabase con la aplicación móvil (Frontend).

## 🚀 Tecnologías utilizadas
* **Python 3.12+**
* **FastAPI:** Para la creación de la API.
* **Uvicorn:** Servidor ASGI para ejecutar la aplicación.
* **Supabase Python SDK:** Para la conexión con la base de datos.
* **Pyngrok:** Para crear el túnel de comunicación desde la nube.

## 🔑 Configuración de Seguridad
Para ejecutar este proyecto en **Google Colab**, debes configurar tus llaves privadas en la sección de **Secrets** (icono de la llave 🔑):

1. `SUPABASE_URL`: La URL de tu proyecto en Supabase.
2. `SUPABASE_KEY`: Tu clave anónima o service_role.
3. `NGROK_TOKEN`: Tu Authtoken de [ngrok](https://dashboard.ngrok.com/).

## 🛠️ Endpoints Disponibles
Una vez encendido el servidor, puedes acceder a:

* **Clima Actual:** `GET /api/weather/current`
* **Estado de Rutas:** `GET /api/routes/status`
* **Prueba de Datos:** `GET /api/test/data`

## 👤 Responsable
* **Mela** - Backend Developer & Cloud Strategist
