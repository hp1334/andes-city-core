// constants/mapStyle.ts
// Estilo Andes City — Pastel limpio con calles visibles
// Sin POIs de Google, sin tránsito, sin edificios genéricos
const MAP_STYLE = [

    // ── Eliminar POIs completamente ──
    { featureType: 'poi',                  elementType: 'all',              stylers: [{ visibility: 'off' }] },
    { featureType: 'poi.business',         elementType: 'all',              stylers: [{ visibility: 'off' }] },
    { featureType: 'poi.attraction',       elementType: 'all',              stylers: [{ visibility: 'off' }] },
    { featureType: 'poi.government',       elementType: 'all',              stylers: [{ visibility: 'off' }] },
    { featureType: 'poi.medical',          elementType: 'all',              stylers: [{ visibility: 'off' }] },
    { featureType: 'poi.place_of_worship', elementType: 'all',              stylers: [{ visibility: 'off' }] },
    { featureType: 'poi.school',           elementType: 'all',              stylers: [{ visibility: 'off' }] },
    { featureType: 'poi.sports_complex',   elementType: 'all',              stylers: [{ visibility: 'off' }] },

    // Parques: color suave sin íconos
    { featureType: 'poi.park',             elementType: 'labels',           stylers: [{ visibility: 'off' }] },
    { featureType: 'poi.park',             elementType: 'geometry',         stylers: [{ color: '#C8E6C9' }] },

    // ── Tránsito oculto ──
    { featureType: 'transit',              elementType: 'all',              stylers: [{ visibility: 'off' }] },

    // ── Fondo base — azul gris suave ──
    { featureType: 'landscape',            elementType: 'geometry',         stylers: [{ color: '#EEF2F7' }] },
    { featureType: 'landscape.natural',    elementType: 'geometry',         stylers: [{ color: '#E8EFF5' }] },

    // ── Agua — azul pastel ──
    { featureType: 'water',                elementType: 'geometry',         stylers: [{ color: '#B3D4E8' }] },
    { featureType: 'water',                elementType: 'labels.text',      stylers: [{ visibility: 'off' }] },

    // ── Calles locales — visibles pero discretas ──
    { featureType: 'road.local',           elementType: 'geometry.fill',    stylers: [{ color: '#FFFFFF' }] },
    { featureType: 'road.local',           elementType: 'geometry.stroke',  stylers: [{ color: '#CBD5E1' }] },
    { featureType: 'road.local',           elementType: 'labels',           stylers: [{ visibility: 'off' }] },

    // ── Calles secundarias ──
    { featureType: 'road.secondary',       elementType: 'geometry.fill',    stylers: [{ color: '#FFFFFF' }] },
    { featureType: 'road.secondary',       elementType: 'geometry.stroke',  stylers: [{ color: '#B8C8D8' }] },
    { featureType: 'road.secondary',       elementType: 'labels.text.fill', stylers: [{ color: '#8AAABB' }] },
    { featureType: 'road.secondary',       elementType: 'labels.text.stroke', stylers: [{ color: '#EEF2F7' }] },

    // ── Avenidas principales — azul pastel claro ──
    { featureType: 'road.arterial',        elementType: 'geometry.fill',    stylers: [{ color: '#FFFFFF' }] },
    { featureType: 'road.arterial',        elementType: 'geometry.stroke',  stylers: [{ color: '#94B8D4' }] },
    { featureType: 'road.arterial',        elementType: 'labels.text.fill', stylers: [{ color: '#5A90B0' }] },
    { featureType: 'road.arterial',        elementType: 'labels.text.stroke', stylers: [{ color: '#EEF2F7' }] },

    // ── Autopistas ──
    { featureType: 'road.highway',         elementType: 'geometry.fill',    stylers: [{ color: '#D0E8F5' }] },
    { featureType: 'road.highway',         elementType: 'geometry.stroke',  stylers: [{ color: '#7AADD0' }] },
    { featureType: 'road.highway',         elementType: 'labels.text.fill', stylers: [{ color: '#4A80A0' }] },
    { featureType: 'road.highway',         elementType: 'labels.text.stroke', stylers: [{ color: '#EEF2F7' }] },

    // ── Edificios — casi invisibles ──
    { featureType: 'building',             elementType: 'geometry',         stylers: [{ color: '#E2E8F0' }] },

    // ── Nombres de lugares — discretos ──
    { featureType: 'administrative.neighborhood', elementType: 'labels.text.fill',   stylers: [{ color: '#8AAABB' }] },
    { featureType: 'administrative.neighborhood', elementType: 'labels.text.stroke', stylers: [{ color: '#EEF2F7' }] },
    { featureType: 'administrative.locality',     elementType: 'labels.text.fill',   stylers: [{ color: '#5A8090' }] },
    { featureType: 'administrative.locality',     elementType: 'labels.text.stroke', stylers: [{ color: '#EEF2F7' }] },
    { featureType: 'administrative.country',      elementType: 'labels',             stylers: [{ visibility: 'off' }] },
];

export default MAP_STYLE;
