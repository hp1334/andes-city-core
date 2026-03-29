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