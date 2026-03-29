# Arquitectura de Base de Datos - Andes City MVP
Manual de la base de datos. Este documento detalla la estructura y reglas de seguridad del ecosistema en Supabase.

# Tablas Principales

1. `users' (tabla 1): Perfiles públicos. Alimentada automáticamente por un Trigger desde `auth.users`. (Sin email ni teléfono por privacidad).
2. `weather_log` (tabla 2): Registro omnisciente del clima.
3. `mobility_routes` (tabla 3):** Estado de las vías de Riobamba.
4. `incidents` (tabla 4): Reportes ciudadanos (baches, tráfico). Relacionada con `users`.
5. **`ai_recommendations` (tabla 5):** Cerebro de la app. Relacionada con `users`, `mobility_routes` y `weather_log`.

# Reglas de Seguridad (RLS)
El frontend (Alfonso) usa la llave `anon/public`. El backend (Mela) usa la llave `service_role`.
* Los ciudadanos **pueden ver** el clima, las calles y los incidentes en el mapa.
* Los ciudadanos **solo pueden editar/borrar** sus propios incidentes.
* La IA tiene privacidad estricta: un ciudadano solo puede ver sus propias recomendaciones.

# Cómo ejecutar el esquema (Para nuevos devs)
1. Conectar a Supabase.
2. Ejecutar el contenido de `schema.sql` en el SQL Editor.
