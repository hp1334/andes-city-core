-- Tabla 1: usuarios/users 
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username VARCHAR(20),
  verified BOOLEAN DEFAULT false,
  role VARCHAR(10) DEFAULT 'citizen', 
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Caja 2: clima_omniciente 
CREATE TABLE public.weather_log (
  id SERIAL PRIMARY KEY,
  temp_c DECIMAL(5,2) NOT NULL,
  condition VARCHAR(50) NOT NULL, 
  alert_level VARCHAR(20) NOT NULL, 
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla 3: rutas-movilidad 
CREATE TABLE public.mobility_routes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'clear',
  affected_by_weather BOOLEAN DEFAULT false, 
  travel_time_min INT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tablas dependientes / Tabla 4 incidentes 
CREATE TABLE public.incidents (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE, 
  type VARCHAR(50) NOT NULL,
  description TEXT,
  location_lat DECIMAL(10, 8) NOT NULL,
  location_lng DECIMAL(11, 8) NOT NULL,
  status VARCHAR(20) DEFAULT 'activate',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Caja 5: ai_recommendations (El cerebro de la app)
CREATE TABLE public.ai_recommendations (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.users(id),
  route_id INT REFERENCES public.mobility_routes(id),
  weather_id INT REFERENCES public.weather_log(id),
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- TU TRIGGER DE SEGURIDAD PARA EL LOGIN
-- ==========================================
-- Este trigger está conectado a tu tabla "public.users" 
-- e insertará únicamente el "id" y el "username".

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, username)
  VALUES (
    new.id, 
    -- Si el frontend no envía username, pone 'Ciudadano' por defecto
    COALESCE(new.raw_user_meta_data->>'username', 'Ciudadano') 
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();





  --NIVEL DE SEGUIRDAD APLICADA PARA TABLAS 
  -- 1. ENCENDER LOS GUARDIAS DE SEGURIDAD EN TODAS LAS TABLAS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mobility_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;

-- 2. POLÍTICAS PARA LA CAJA 1 (users)
-- Todos pueden ver los perfiles públicos
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.users FOR SELECT USING (true);
-- Solo el dueño puede editar su propio perfil
CREATE POLICY "Users can update own profile" 
ON public.users FOR UPDATE USING (auth.uid() = id);

-- 3. POLÍTICAS PARA LA CAJA 2 (weather_log)
-- Todos pueden leer el clima (Solo el backend de Mela puede escribir)
CREATE POLICY "Weather is viewable by everyone" 
ON public.weather_log FOR SELECT USING (true);

-- 4. POLÍTICAS PARA LA CAJA 3 (mobility_routes)
-- Todos pueden leer las rutas (Solo el backend de Mela puede escribir)
CREATE POLICY "Routes are viewable by everyone" 
ON public.mobility_routes FOR SELECT USING (true);

-- 5. POLÍTICAS PARA LA CAJA 4 (incidents)
-- Todos pueden ver los incidentes en el mapa
CREATE POLICY "Incidents are viewable by everyone" 
ON public.incidents FOR SELECT USING (true);
-- Un usuario solo puede crear incidentes a su nombre
CREATE POLICY "Users can insert own incidents" 
ON public.incidents FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Un usuario solo puede editar o borrar sus propios incidentes
CREATE POLICY "Users can update own incidents" 
ON public.incidents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own incidents" 
ON public.incidents FOR DELETE USING (auth.uid() = user_id);

-- 6. POLÍTICAS PARA LA CAJA 5 (ai_recommendations)
-- Privacidad total: Solo ves los consejos que la IA te dio a ti
CREATE POLICY "Users view only own recommendations" 
ON public.ai_recommendations FOR SELECT USING (auth.uid() = user_id);