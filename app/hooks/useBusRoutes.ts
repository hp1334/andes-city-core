// hooks/useBusRoutes.ts
// Fuente única de verdad para las rutas de buses desde Supabase
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface BusRouteData {
  id: string;
  name: string;
  color: string;
  status: string;
  travel_time_min: number;
  path_coordinates: any;
}

export function useBusRoutes() {
    const [routes, setRoutes] = useState<BusRouteData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchRoutes() {
            try {
                const { data, error } = await supabase
                    .from('mobility_routes')
                    .select('*');

                if (error) {
                    console.warn('[useBusRoutes] Error Supabase:', error.message);
                    setRoutes([]);
                } else {
                    setRoutes(data || []);
                }
            } catch (err) {
                console.warn('[useBusRoutes] Error de conexión:', err);
                setRoutes([]);
            } finally {
                setIsLoading(false);
            }
        }

        fetchRoutes();
    }, []);

    return { routes, isLoading };
}
