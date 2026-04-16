import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Hook genérico base para lectura de tablas
export function useSupabaseQuery(tableName: string) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: result, error: e } = await supabase.from(tableName).select('*');
        if (e) throw new Error(e.message);
        setData(result || []);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [tableName]);

  return { data, loading, error };
}
