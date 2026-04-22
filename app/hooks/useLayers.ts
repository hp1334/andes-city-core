// hooks/useLayers.ts
// Estado global de capas del mapa — regla: máximo 2 activas simultáneamente
import { useState, useCallback, useRef } from 'react';

export type LayerName = 'ciudadano' | 'local' | 'movilidad';

export interface LayerConfig {
    name: LayerName;
    label: string;
    emoji: string;
    color: string;
}

export const LAYERS: LayerConfig[] = [
    { name: 'ciudadano', label: 'Ciudadano', emoji: '🔴', color: '#EF4444' },
    { name: 'local',     label: 'Local',     emoji: '🟡', color: '#F59E0B' },
    { name: 'movilidad', label: 'Movilidad', emoji: '🔵', color: '#0EA5E9' },
];

interface UseLayersReturn {
    activeLayers: LayerName[];
    toggleLayer: (layer: LayerName) => boolean; // true = activado, false = desactivado, null = rechazado
    isActive: (layer: LayerName) => boolean;
    toastVisible: boolean;
    hideToast: () => void;
}

export function useLayers(defaultLayers: LayerName[] = ['movilidad', 'local']): UseLayersReturn {
    // Por defecto: Movilidad y Local activas (prioridad del sistema)
    const [activeLayers, setActiveLayers] = useState<LayerName[]>(defaultLayers);
    const [toastVisible, setToastVisible] = useState(false);
    const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const showToast = useCallback(() => {
        setToastVisible(true);
        if (toastTimer.current) clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => {
            setToastVisible(false);
        }, 2000);
    }, []);

    const hideToast = useCallback(() => {
        setToastVisible(false);
        if (toastTimer.current) clearTimeout(toastTimer.current);
    }, []);

    const toggleLayer = useCallback((layer: LayerName): boolean => {
        let activated = false;
        setActiveLayers(prev => {
            if (prev.includes(layer)) {
                // Desactivar — siempre permitido
                activated = false;
                return prev.filter(l => l !== layer);
            } else {
                if (prev.length >= 2) {
                    // Regla: máx 2 capas — eliminamos la más antigua (primera)
                    // y mostramos el toast
                    showToast();
                    activated = true;
                    return [prev[1], layer]; // Elimina la primera, agrega la nueva
                }
                activated = true;
                return [...prev, layer];
            }
        });
        return activated;
    }, [showToast]);

    const isActive = useCallback((layer: LayerName) => {
        return activeLayers.includes(layer);
    }, [activeLayers]);

    return { activeLayers, toggleLayer, isActive, toastVisible, hideToast };
}
