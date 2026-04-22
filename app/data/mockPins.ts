// data/mockPins.ts
// Coordenadas reales de Riobamba — sin polylines de movilidad hasta Fase 3
import { LayerName } from '../hooks/useLayers';

export type PinType =
    | 'bache' | 'cierre_via' | 'basura' | 'inseguridad' | 'luminaria'
    | 'emprendimiento' | 'premium' | 'evento' | 'gadm'
    | 'trafico_alto' | 'trafico_moderado' | 'bus' | 'ciclovia'
    | 'lluvia' | 'clima_general';

export interface MapPin {
    id: string;
    type: PinType;
    layer: LayerName;
    lat: number;
    lng: number;
    title: string;
    description: string;
    timestamp: Date;
    urgent?: boolean;
    premium?: boolean;
    payload?: Record<string, any>;
    ghostTrail?: [number, number][]; // Coordenadas proyectadas de la estela brillante
}

// ── CAPA 1: CIUDADANO 🔴 ──────────────────────────────────────────
export const CIUDADANO_PINS: MapPin[] = [
    {
        id: 'c1',
        type: 'bache',
        layer: 'ciudadano',
        lat: -1.6629, lng: -78.6548,      // Av. Unidad Nacional
        title: 'Bache — Av. Unidad Nacional',
        description: 'Bache profundo, 2 carriles afectados. Reportado hace 45 min.',
        timestamp: new Date(Date.now() - 1000 * 60 * 45),
        payload: { confirmations: 7, photos: 3, age_minutes: 45 },
    },
    {
        id: 'c2',
        type: 'inseguridad',
        layer: 'ciudadano',
        lat: -1.6590, lng: -78.6570,      // La Condamine
        title: 'Zona insegura — La Condamine',
        description: 'Reporte de asalto. Evitar horas nocturnas.',
        timestamp: new Date(Date.now() - 1000 * 60 * 20),
        urgent: true,
        payload: { confirmations: 14, severity: 'alta' },
    },
    {
        id: 'c3',
        type: 'cierre_via',
        layer: 'ciudadano',
        lat: -1.6701, lng: -78.6467,      // Av. 9 de Octubre
        title: 'Cierre de vía — Av. 9 de Octubre',
        description: 'Trabajos de alcantarillado. Carril derecho cerrado.',
        timestamp: new Date(Date.now() - 1000 * 60 * 90),
        payload: { confirmations: 5, estimated_duration: '3 días' },
    },
    {
        id: 'c4',
        type: 'basura',
        layer: 'ciudadano',
        lat: -1.6688, lng: -78.6523,      // Mercado Oriental
        title: 'Acumulación de basura',
        description: 'No ha pasado el recolector en 3 días. Sector Mercado Oriental.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
        payload: { confirmations: 4 },
    },
];

// ── CAPA 2: LOCAL 🟡 ──────────────────────────────────────────────
export const LOCAL_PINS: MapPin[] = [
    {
        id: 'l1',
        type: 'premium',
        layer: 'local',
        lat: -1.6641, lng: -78.6532,      // Centro
        title: 'Café Chimborazo',
        description: '☕ El mejor café de altura. Oferta: 2x1 en lattes hasta las 14:00.',
        timestamp: new Date(),
        premium: true,
        payload: { offer: '2x1 lattes', distance: 120, category: 'café', rating: 4.9 },
    },
    {
        id: 'l2',
        type: 'emprendimiento',
        layer: 'local',
        lat: -1.6678, lng: -78.6489,      // La Merced
        title: 'Artesanías La Merced',
        description: 'Tejidos y artesanía andina local. Precios directos del productor.',
        timestamp: new Date(),
        payload: { category: 'tienda', rating: 4.5 },
    },
    {
        id: 'l3',
        type: 'evento',
        layer: 'local',
        lat: -1.6655, lng: -78.6512,      // Plaza Roja
        title: 'Festival en Plaza Roja',
        description: 'Feria cultural y gastronómica. Entrada libre. Hoy 14:00–20:00.',
        timestamp: new Date(),
        payload: { start: '14:00', end: '20:00', free: true },
    },
    {
        id: 'l4',
        type: 'gadm',
        layer: 'local',
        lat: -1.6698, lng: -78.6478,      // Terminal
        title: 'Aviso Municipal — GADM',
        description: 'Corte de agua programado mañana 08:00–14:00. Zona Terminal.',
        timestamp: new Date(),
        payload: { official: true, duration: '6 horas' },
    },
];

// ── CAPA 3: MOVILIDAD 🔵 — solo pines, sin polylines hasta Fase 3 ──
export const MOVILIDAD_PINS: MapPin[] = [
    {
        id: 'm1',
        type: 'trafico_alto',
        layer: 'movilidad',
        lat: -1.6635, lng: -78.6543,
        title: 'Tráfico alto — Av. Daniel León Borja',
        description: 'Congestionamiento alto. Tiempo de espera: +15 min.',
        timestamp: new Date(),
        urgent: true,
        payload: { level: 'alto', delay_min: 15 },
    },
    // Buses Línea 4
    {
        id: 'm2_l4_1',
        type: 'bus',
        layer: 'movilidad',
        lat: -1.6698, lng: -78.6478, // Terminal
        title: 'Línea 4 — Unidad 12',
        description: 'En movimiento. Próxima parada: Centro.',
        timestamp: new Date(),
        payload: { line: 4 },
        ghostTrail: [
            // Av. Daniel León Borja -> Centro
            [-1.6710, -78.6450], [-1.6700, -78.6465], [-1.6685, -78.6480], 
            [-1.6670, -78.6495], [-1.6655, -78.6508], [-1.6635, -78.6525],
            [-1.6620, -78.6540], [-1.6608, -78.6550], [-1.6595, -78.6530],
            [-1.6580, -78.6510], [-1.6570, -78.6495] // Llegada zona universitaria
        ]
    },
    // Buses Línea 5
    {
        id: 'm2_l5_1',
        type: 'bus',
        layer: 'movilidad',
        lat: -1.6600, lng: -78.6450,
        title: 'Línea 5 — Unidad 03',
        description: 'En movimiento.',
        timestamp: new Date(),
        payload: { line: 5 },
        ghostTrail: [
            // 10 de Agosto (Ortogonal, eje Norte - Sur)
            [-1.6580, -78.6580], [-1.6595, -78.6585], [-1.6610, -78.6590],
            [-1.6630, -78.6595], [-1.6650, -78.6600], [-1.6675, -78.6605],
            [-1.6695, -78.6610], [-1.6715, -78.6615], [-1.6730, -78.6620]
        ]
    },
    {
        id: 'm3',
        type: 'ciclovia',
        layer: 'movilidad',
        lat: -1.6712, lng: -78.6501,
        title: 'Bici Usuario',
        description: 'Flujo en ciclovía activa.',
        timestamp: new Date(),
        payload: { distance_km: 4.2 },
    },
];

// ── CAPA 4: CLIMA 🟣 ──────────────────────────────────────────────
export const CLIMA_PINS: MapPin[] = [
    {
        id: 'w1',
        type: 'lluvia',
        layer: 'clima',
        lat: -1.6598, lng: -78.6534,      // Zona Norte
        title: 'Lluvia moderada — Zona Norte',
        description: 'Precipitaciones hasta las 16:00. Temperatura: 12°C.',
        timestamp: new Date(),
        payload: { intensity: 'moderada', temp: 12, ends: '16:00', humidity: 82 },
    },
    {
        id: 'w2',
        type: 'clima_general',
        layer: 'clima',
        lat: -1.6635, lng: -78.6547,      // Centro Riobamba
        title: 'Riobamba ahora — 14°C',
        description: 'Parcialmente nublado. Sensación térmica 10°C. Sin alertas.',
        timestamp: new Date(),
        payload: { temp: 14, feels_like: 10, humidity: 78, condition: 'parcialmente nublado' },
    },
];

// Todos los pines unificados
export const ALL_PINS: MapPin[] = [
    ...CIUDADANO_PINS,
    ...LOCAL_PINS,
    ...MOVILIDAD_PINS,
    ...CLIMA_PINS,
];
