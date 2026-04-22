# Andes City — Contexto del Proyecto

## Qué es
Red Social Urbana para Riobamba, Ecuador.
App móvil (React Native + Expo) que conecta 
ciudadanos con su ciudad mediante mapa interactivo,
feed de incidencias, hub de negocios y gamificación.

## Stack
- Frontend: React Native + Expo (TypeScript)
- Backend: FastAPI + Python (Render)
- Base de datos: Supabase (PostgreSQL)
- IA: Claude API (Anthropic)
- Mapas: React Native Maps (CARTO Light)
- Auth: Supabase Auth

## Estructura del repo
/app          → Frontend Expo
/backend      → FastAPI Python
/database     → Schema SQL y migraciones
/docs         → Documentación del proyecto

## Reglas del proyecto
1. NO modificar /app/home.tsx ni /app/register.tsx
   El auth ya funciona — no se toca.
2. NO hardcodear claves — todo en .env
3. Cada componente en su propio archivo
4. Código comentado en español
5. Esperar confirmación entre pasos grandes

## Módulos del frontend
- index.tsx    → Home: mapa interactivo a pantalla completa
- radar.tsx    → Feed de incidencias ciudadanas
- discover.tsx → Hub de negocios y turismo
- profile.tsx  → Gamificación y perfil del usuario

## Componentes globales
- FloatingNav.tsx   → 3 botones flotantes sobre el mapa
- AuroraFAB.tsx     → Asistente IA lateral derecho
- MapPin.tsx        → Pines personalizados del mapa
- BottomSheet.tsx   → Sheet base reutilizable
- SpotSheet.tsx     → Sheet de detalle de pin

## Sistema de pines del mapa
- Spots Premium: dorado #F59E0B, siempre visibles
- Spots Básicos: blanco con borde ámbar, zoom >= 15
- Alertas Oficiales: blanco con borde rojo, validadas
- Rutas de bus: trazos azul translúcido
- Radar usuario: círculo azul con halo pulsante

## Capas del mapa (máximo 2 activas)
1. Movilidad  → tráfico y rutas
2. Local      → negocios y eventos
3. Ciudadano  → alertas validadas únicamente
4. Clima      → overlays por zona

## Prioridad de pines automáticos
1. Movilidad activa
2. Spots Premium (clientes que pagan)
3. Clima con alerta real
4. Alertas ciudadanas validadas

## Variables de entorno necesarias
Ver /app/.env.example y /backend/.env.example

## Estado actual
FASE 1 — UI base en curso
  ✓ Navegación flotante (3 botones)
  ✓ Aurora FAB lateral
  ✓ Mapa base con pines mock
  ✓ Sistema de capas
  ○ Bottom sheets (en progreso)
  ○ Radar feed
  ○ Discover hub
  ○ Perfil y gamificación

## Próximos pasos
FASE 2 → Radar, Discover, Perfil con datos mock
FASE 3 → Conectar Supabase Pro
FASE 4 → Backend vivo en Render
FASE 5 → APK firmado + lanzamiento Riobamba
