# 🏛️ Arquitectura y Flujo de Trabajo - Andes City Core

Este documento analiza el estado actual del ecosistema de desarrollo de **Andes City**, documenta la infraestructura existente y establece reglas de flujo de trabajo para garantizar que el equipo (Dennys, Mela y Alfonso) logre intervenir en cualquier parte del código de forma segura y consistente.

---

## 🏗️ 1. Mapeo de la Arquitectura Actual
Actualmente, el proyecto se divide en tres bloques principales que interactúan entre sí:

### A. Frontend (Directorio `/app`)
- **Stack**: React Native con Expo (Expo Router `app/`), TypeScript y ESLint activo.
- **Responsable**: Alfonso.
- **Estado**: Se ha inicializado la estructura de enrutamiento moderno (Expo Router). Ya cuenta con pantallas base como `index.tsx` (posiblemente la entrada de Login) y `register.tsx`. Se nota un enfoque inicial basado en componentes como `AuthInput.tsx`.
- **Conectividad DB**: Tiene el SDK de Supabase configurado en `lib/supabase.ts` para interacciones directas con la base de datos central.

### B. Backend y Servicios (Directorio `/backend`)
- **Stack**: Python, FastAPI, Uvicorn, corriendo localmente/nube (a través de un Notebook `backend_main.ipynb`) y expuesto con **ngrok**.
- **Responsable**: Dennys (Infraestructura) y Mela (Semillas de Datos / Integración).
- **Estado**: El backend está vivo. Expone endpoints de prueba (`/api/weather/current` y `/api/routes/status`) que conectan a la perfección con Supabase para recuperar la información de **clima** y **movilidad**. Mela ha logrado visualizar datos semilla en la consola y confirmar que todo enlaza correctamente.

### C. Base de Datos Centralizada (Directorio `/database`)
- **Stack**: PostgreSQL gestionado mediante Supabase.
- **Estado**: El esquema en `schema.sql` establece toda la lógica de Smart City: tablas principales (`users`, `weather_log`, `mobility_routes`, `incidents`, `ai_recommendations`) fuertemente resguardadas mediante **Row Level Security (RLS)** y **Triggers** de autenticación.

---

## 🔒 2. Lógica de Datos y Relaciones

El esquema de la DB en `schema.sql` revela que tienen una arquitectura altamente descentralizada y segura:
- **Triggers**: La tabla `users` se alimenta en cascada con el trigger `on_auth_user_created`, lo que significa que **Alfonso**, desde el Login en el Frontend, *no necesita insertar manualmente usuarios en la DB*; Supabase Auth y Postgres lo hacen solos.
- **Seguridad (RLS)**: Las Políticas limitan las lecturas/escrituras. Por ejemplo, los ciudadanos (Frontend) solo pueden visualizar el Clima y Rutas (ideal para los módulos asíncronos en ngrok de Mela y Dennys que son los que *escriben*). Sin embargo, los usuarios **sí** escriben/actualizan incidentes (`incidents`).

---

## 🛡️ 3. Estandarización del Flujo de Trabajo (Prevención de Conflictos)

Para que tú (Infraestructura/VS Code) y Mela (Datos/Cursor) puedan intervenir cuando Alfonso delegue tareas del Frontend o Backend, sugerimos las siguientes normativas de código y Git:

> [!IMPORTANT]
> **Aislamiento de Lógica (Separation of Concerns):** Alfonso está construyendo la interfaz. Para no romper su código React, la regla de oro debe ser la **Abstracción de Datos**.

### Regla 1: Uso Estricto de "hooks" u "orquestadores"
Cuando Alfonso trabaje en sus interfaces, **no debe poner consultas de Supabase (`supabase.table(...)`) directamente en sus componentes UI** (vistas de Expo).
- Todo acceso a datos o consumo de los endpoints FastAPI (ngrok) de Dennys deben ir en el directorio `app/hooks/` (ej. `useWeather.ts`, `useAuth.ts`) o `app/lib/`.
- **¿Por qué?** Si tú o Mela cambian la estructura de la base de datos o de los endpoints de Python, solo tocan el archivo `/hooks/` y el archivo de Python, dejando la UI de Alfonso intacta. La UI solo "reacciona" a los hooks.

### Regla 2: Fuentes de Verdad para Datos (API vs Cliente Directo)
El equipo debe definir explícitamente qué datos consume el Frontend de los endpoints de Ngrok de Dennys/Mela y qué datos se traen directo por Supabase SDK.
- **Ejemplo Sugerido:** Auth e Insertar Incidentes -> Uso directo del cliente Supabase (`lib/supabase.ts`) en el frontend (Por el RLS).
- **Ejemplo Sugerido:** Consultar Clima, Modelos de IA `ai_recommendations` y Rutas de Movilidad -> El Frontend le pide a FastAPI (ngrok), y el Backend pide a Supabase. De esta forma Dennys puede conectar lógicas extra de IA detrás.

### Regla 3: Ramificaciones (Branching Git) y Pull Requests
Como Mela empuja los conectores de Backend y Alfonso está en el Login:
- Alfonso debe trabajar en la rama `feat/frontend-login`. Mela en `feat/backend-data`.
- **Nadie empuja directo a `main`.**
- Cuando Alfonso delegue una mejora en el estilo o en un fetch al backend, tú crearás una rama hija (ej. `fix/frontend-login-fetch`) y realizarás el Pull Request.

### Regla 4: Estandarización de Interfaz
Al realizar cualquier ajuste visual a petición de Alfonso, usen los estilos base construidos en Expo. Mantenerse al margen del TailwindCSS o estilos locales si Alfonso está usando Stylesheets o viceversa. No crear componentes monolíticos: si hay un "botón" nuevo a implementar, crear el archivo en `app/components/` (como él hizo con `AuthInput.tsx`).

---

## 🚀 Siguientes pasos con el soporte de tu Asistente
Estoy completamente sincronizado con el espacio de trabajo. Cuando Mela integre su código final, o cuando Alfonso te entregue el Frontend:
1. **Pídeme revisar** los `pull requests` locales antes del merge.
2. Si Alfonso pide **enlazar el proceso de Backend al Frontend**, te proporcionaré el hook de React (`useWeather`, `useRoutes`) que apuntará directamente a los túneles ngrok que orquestas.
3. Si la IP/túnel de ngrok cambia constantemente por la terminal de Colab/Jupyter, sugeriré crear un `.env` en la raíz de `app/` para que la app se recargue independientemente.
