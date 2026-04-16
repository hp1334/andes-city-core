// components/MapWebView.tsx
// Mapa Andes City — Leaflet.js + CARTO Light tiles dentro de WebView
// Sin API key. Sin costo. Control total sobre estilo y pines.
// Arquitectura: mapa en WebView, UI de Andes City encima en React Native puro.
import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { MapPin } from '../data/mockPins';

// ── Tipos de control expuestos al padre ──────────────────────────
export interface MapWebViewHandle {
    flyTo: (lat: number, lng: number, zoom?: number) => void;
    setPins: (pins: MapPin[]) => void;
    setRouteSelection: (routeId: string | null) => void;
    updateUserLocation: (lat: number, lng: number) => void;
}

interface MapWebViewProps {
    pins: MapPin[];
    onPinPress?: (pinId: string) => void;
    onMapReady?: () => void;
}

// ── SVG paths para los iconos (Lucide-equivalentes) ───────────────
const SVG_ICONS: Record<string, string> = {
    // AlertCircle — bache
    bache: `<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>`,
    // ShieldAlert — inseguridad
    inseguridad: `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>`,
    // TriangleAlert — cierre_via
    cierre_via: `<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>`,
    // Trash2 — basura
    basura: `<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>`,
    // Zap — luminaria
    luminaria: `<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>`,
    // ShoppingBag — emprendimiento
    emprendimiento: `<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>`,
    // Star — premium
    premium: `<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>`,
    // CalendarDays — evento
    evento: `<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>`,
    // Building2 — gadm
    gadm: `<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v8h4"/><path d="M18 9h2a2 2 0 0 1 2 2v11h-4"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>`,
    // Car — trafico
    trafico_alto: `<path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-3"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>`,
    trafico_moderado: `<path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-3"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>`,
    // Bus
    bus: `<path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/><circle cx="7" cy="18" r="2"/><path d="M9 18h5"/><circle cx="16" cy="18" r="2"/>`,
    // Bike
    ciclovia: `<circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/>`,
    // CloudRain — lluvia
    lluvia: `<line x1="16" y1="13" x2="16" y2="21"/><line x1="8" y1="13" x2="8" y2="21"/><line x1="12" y1="15" x2="12" y2="23"/><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"/>`,
    // Cloud — clima_general
    clima_general: `<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>`,
};

// ── Configuración visual por tipo de pin ─────────────────────────
interface PinConfig {
    size: number;
    bg: string;
    iconColor: string;
    borderColor: string;
    borderWidth: number;
    pulse: string; // 'none' | 'red' | 'gold' | 'bounce'
}

const PIN_CONFIG: Record<string, PinConfig> = {
    bache:            { size: 44, bg: '#FFFFFF', iconColor: '#EF4444', borderColor: '#EF4444', borderWidth: 1.5, pulse: 'none' },
    inseguridad:      { size: 48, bg: '#EF4444', iconColor: '#FFFFFF', borderColor: 'transparent', borderWidth: 0, pulse: 'red' },
    cierre_via:       { size: 48, bg: '#EA580C', iconColor: '#FFFFFF', borderColor: 'transparent', borderWidth: 0, pulse: 'none' },
    basura:           { size: 44, bg: '#FFFFFF', iconColor: '#EF4444', borderColor: 'transparent', borderWidth: 0, pulse: 'none' },
    luminaria:        { size: 44, bg: '#FFFFFF', iconColor: '#F59E0B', borderColor: 'transparent', borderWidth: 0, pulse: 'none' },
    emprendimiento:   { size: 48, bg: '#FFFFFF', iconColor: '#F59E0B', borderColor: '#F59E0B', borderWidth: 1.5, pulse: 'none' },
    premium:          { size: 54, bg: '#FFFFFF', iconColor: '#F59E0B', borderColor: '#F59E0B', borderWidth: 2,   pulse: 'gold' },
    evento:           { size: 48, bg: '#FFFFFF', iconColor: '#F59E0B', borderColor: 'transparent', borderWidth: 0, pulse: 'bounce' },
    gadm:             { size: 48, bg: '#1E40AF', iconColor: '#FFFFFF', borderColor: 'transparent', borderWidth: 0, pulse: 'none' },
    trafico_alto:     { size: 48, bg: '#FFFFFF', iconColor: '#EF4444', borderColor: '#EF4444', borderWidth: 2,   pulse: 'red' },
    trafico_moderado: { size: 48, bg: '#FFFFFF', iconColor: '#F59E0B', borderColor: '#F59E0B', borderWidth: 2,   pulse: 'none' },
    bus:              { size: 48, bg: '#FFFFFF', iconColor: '#0EA5E9', borderColor: 'transparent', borderWidth: 0, pulse: 'none' },
    ciclovia:         { size: 44, bg: '#FFFFFF', iconColor: '#22C55E', borderColor: 'transparent', borderWidth: 0, pulse: 'none' },
    lluvia:           { size: 48, bg: '#8B5CF6', iconColor: '#FFFFFF', borderColor: 'transparent', borderWidth: 0, pulse: 'none' },
    clima_general:    { size: 48, bg: '#7C3AED', iconColor: '#FFFFFF', borderColor: 'transparent', borderWidth: 0, pulse: 'none' },
};

// ── HTML del mapa ─────────────────────────────────────────────────
function buildMapHTML(pins: MapPin[]): string {
    const pinsJson = JSON.stringify(
        pins.map(p => ({
            id: p.id,
            lat: p.lat,
            lng: p.lng,
            type: p.type,
            title: p.title,
            layer: p.layer,
            urgent: p.urgent ?? false,
        }))
    );

    return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { width: 100vw; height: 100vh; overflow: hidden; background: #F8FAFC; }
  #map { width: 100%; height: 100%; }
  .leaflet-control-zoom { display: none !important; }
  .leaflet-control-attribution { display: none !important; }

  /* ── Estética del Mapa (Filtros CARTO -> BUMP) ── */
  .leaflet-tile-pane {
    filter: sepia(12%) hue-rotate(190deg) saturate(130%) brightness(1.03) contrast(1.05); /* Tono frío, limpio y juvenil */
  }

  /* ── Pines Andes City ── */
  .ac-pin { display: flex; flex-direction: column; align-items: center; cursor: pointer; }
  .ac-bubble {
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 3px 12px rgba(15,23,42,0.18);
    position: relative;
    transition: transform 0.15s ease;
  }
  .ac-bubble:active { transform: scale(0.9); }
  .ac-bubble svg { display: block; }
  .ac-anchor {
    width: 0; height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    margin-top: -1px;
  }

  /* Pulso rojo — urgente */
  @keyframes pulse-red {
    0%   { box-shadow: 0 3px 12px rgba(15,23,42,0.18), 0 0 0 0 rgba(239,68,68,0.45); }
    70%  { box-shadow: 0 3px 12px rgba(15,23,42,0.18), 0 0 0 18px rgba(239,68,68,0); }
    100% { box-shadow: 0 3px 12px rgba(15,23,42,0.18), 0 0 0 0 rgba(239,68,68,0); }
  }
  .pulse-red { animation: pulse-red 2s ease-out infinite; }

  /* Destello dorado — premium */
  @keyframes pulse-gold {
    0%,100% { transform: scale(1); }
    50%      { transform: scale(1.12); }
  }
  .pulse-gold { animation: pulse-gold 3.6s ease-in-out infinite; }

  /* Rebote — eventos */
  @keyframes bounce {
    0%,100% { transform: translateY(0); }
    50%      { transform: translateY(-5px); }
  }
  .bounce { animation: bounce 1.4s ease-in-out infinite; }

  /* Entrada — caída con rebote */
  @keyframes drop-in {
    0%   { opacity: 0; transform: translateY(-16px) scale(0.7); }
    70%  { transform: translateY(3px) scale(1.05); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
  }
  .drop-in { animation: drop-in 0.45s cubic-bezier(0.34,1.56,0.64,1) both; }

  /* ── Puntito Azul (GPS Usuario) ── */
  .user-dot {
    width: 18px; height: 18px;
    background: #3B82F6; /* Azul brillante */
    border-radius: 50%;
    border: 3px solid #FFFFFF;
    box-shadow: 0 0 10px rgba(59, 130, 246, 0.4);
    position: relative;
    z-index: 1000 !important; /* Siempre arriba */
  }
  .user-dot::after {
    content: '';
    position: absolute;
    top: -12px; left: -12px; right: -12px; bottom: -12px;
    background: rgba(59, 130, 246, 0.35); /* Halo azul */
    border-radius: 50%;
    animation: pulse-user 2.5s ease-out infinite;
  }
  @keyframes pulse-user {
    0%   { transform: scale(0.4); opacity: 1; }
    100% { transform: scale(2.2); opacity: 0; }
  }

  /* ── Estilos de transición para Buses (RouteSelectorSheet) ── */
  .ac-pin.bus-marker {
    transition: opacity 0.3s ease;
  }
  .ac-pin.bus-marker.bus-dimmed {
    opacity: 0.3;
  }
  .ac-pin.bus-marker.bus-active {
    opacity: 1;
  }

  /* ── Ghost Trail Animado (La estela de luz) ── */
  .ghost-trail-animated {
    stroke-dasharray: 12 18;
    animation: dash-flow 1.5s linear infinite;
    opacity: 0.7;
  }
  @keyframes dash-flow {
    to { stroke-dashoffset: -30; }
  }
</style>
</head>
<body>
<div id="map"></div>
<script>
var RIOBAMBA = [-1.6635, -78.6547];
var PIN_CONFIG = ${JSON.stringify(PIN_CONFIG)};
var SVG_ICONS = ${JSON.stringify(SVG_ICONS)};
var PINS = ${pinsJson};
var userMarker = null;

// Gestores de estado del mapa para UI de movilidad
var busMarkers = {}; // pinId -> LeafletMarker
var trailLayer = L.layerGroup(); // Grupo para las polylíneas de Ghost Trails

var map = L.map('map', {
  center: RIOBAMBA,
  zoom: 14,
  zoomControl: false,
  attributionControl: false,
});

// CARTO Light — limpio, minimalista, estilo Zenly
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  subdomains: 'abcd',
  maxZoom: 20,
}).addTo(map);

// Agregar capa de trails al mapa para que siempre se renderice
trailLayer.addTo(map);

function makePinHTML(pin, delay) {
  var cfg = PIN_CONFIG[pin.type] || PIN_CONFIG['bache'];
  var svgPath = SVG_ICONS[pin.type] || SVG_ICONS['bache'];
  var size = cfg.size;
  var iconSize = Math.round(size * 0.42);
  var pulseClass = pin.urgent ? 'pulse-red' : (cfg.pulse !== 'none' ? 'pulse-' + cfg.pulse : '');
  var border = cfg.borderWidth > 0
    ? 'border: ' + cfg.borderWidth + 'px solid ' + cfg.borderColor + ';'
    : '';
  var anchorColor = cfg.bg === '#FFFFFF' ? (cfg.borderColor !== 'transparent' ? cfg.borderColor : '#FFFFFF') : cfg.bg;
  var baseClass = pin.type === 'bus' ? 'ac-pin drop-in bus-marker bus-dimmed' : 'ac-pin drop-in';

  return '<div id="pin-' + pin.id + '" class="' + baseClass + '" style="animation-delay:' + delay + 'ms">'
    + '<div class="ac-bubble ' + pulseClass + '" style="'
    + 'width:' + size + 'px; height:' + size + 'px;'
    + 'background:' + cfg.bg + ';' + border + '">'
    + '<svg xmlns="http://www.w3.org/2000/svg" width="' + iconSize + '" height="' + iconSize + '"'
    + ' viewBox="0 0 24 24" fill="none" stroke="' + cfg.iconColor + '"'
    + ' stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
    + '<' + 'g>' + svgPath + '</' + 'g>'
    + '</svg></div>'
    + '<div class="ac-anchor" style="border-top: 8px solid ' + anchorColor + ';"></div>'
    + '</div>';
}

function renderPins(pins) {
  busMarkers = {};
  pins.forEach(function(pin, i) {
    var html = makePinHTML(pin, i * 40); // 40ms stagger más rápido
    var icon = L.divIcon({
      html: html,
      iconSize: [pin.type === 'premium' ? 54 : 48, 60],
      iconAnchor: [(PIN_CONFIG[pin.type] || {size:48}).size / 2, 60],
      className: '',
    });
    var marker = L.marker([pin.lat, pin.lng], { icon: icon }).addTo(map);
    
    // Si es bus, lo indexamos para control DOM rápido
    if (pin.type === 'bus') {
      busMarkers[pin.id] = { marker: marker, data: pin };
    }

    marker.on('click', function() {
      window.ReactNativeWebView && window.ReactNativeWebView.postMessage(
        JSON.stringify({ type: 'pinTap', pinId: pin.id, pinType: pin.type, title: pin.title })
      );
    });
  });
}

// Funciones controlables desde React Native
window.flyTo = function(lat, lng, zoom) {
  map.flyTo([lat, lng], zoom || 15, { duration: 1.2 });
};
window.setPins = function(pins) {
  trailLayer.clearLayers();
  map.eachLayer(function(layer) {
    // Limpiamos todo MENOS el mapa base y el marcador especial del usuario
    if (layer instanceof L.Marker && layer !== userMarker) map.removeLayer(layer);
  });
  renderPins(pins);
};

window.setRouteSelection = function(routeId) {
  trailLayer.clearLayers();
  
  Object.keys(busMarkers).forEach(function(id) {
    var item = busMarkers[id];
    var div = item.marker.getElement().querySelector('.ac-pin');
    if (!div) return;

    if (!routeId) {
      // Modo Overview: todos los buses a 30% (dimmed)
      div.classList.add('bus-dimmed');
      div.classList.remove('bus-active');
    } else {
      // Filtrar
      var isTarget = String(item.data.payload.line) === String(routeId.replace('L', '').replace('0', '')); // "L04" -> "4"
      if (isTarget) {
        div.classList.add('bus-active');
        div.classList.remove('bus-dimmed');
        // Dibujar el Ghost Trail proyectado del JSON de mock
        if (item.data.ghostTrail && item.data.ghostTrail.length > 0) {
          L.polyline(item.data.ghostTrail, {
            color: '#0EA5E9',
            weight: 3.5,
            className: 'ghost-trail-animated'
          }).addTo(trailLayer);
        }
      } else {
        div.classList.add('bus-dimmed');
        div.classList.remove('bus-active');
        // Opcionalmente podemos forzar opacity 0, dependiente de la UX. 
        // Según lo discutido: "los demás hacen fade-out". dimmed los envía a 30%. Si se quiere 0, se cambia en CSS.
        div.style.opacity = '0'; // Forzar ocultamiento, o dejar en 0.2
      }
    }
  });
};

window.updateUserLocation = function(lat, lng) {
  if (!userMarker) {
    var icon = L.divIcon({
      html: '<div class="user-dot"></div>',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      className: ''
    });
    userMarker = L.marker([lat, lng], { icon: icon, zIndexOffset: 1000 }).addTo(map);
  } else {
    userMarker.setLatLng([lat, lng]);
  }
};

// Render inicial
renderPins(PINS);

// Notificar que el mapa está listo
map.whenReady(function() {
  window.ReactNativeWebView && window.ReactNativeWebView.postMessage(
    JSON.stringify({ type: 'ready' })
  );
});
</script>
</body>
</html>`;
}

// ── Componente principal ──────────────────────────────────────────
const MapWebView = forwardRef<MapWebViewHandle, MapWebViewProps>(
    ({ pins, onPinPress, onMapReady }, ref) => {
        const webviewRef = useRef<WebView>(null);
        const html = buildMapHTML(pins);

        useImperativeHandle(ref, () => ({
            flyTo: (lat, lng, zoom = 15) => {
                webviewRef.current?.injectJavaScript(
                    `window.flyTo(${lat}, ${lng}, ${zoom}); true;`
                );
            },
            setPins: (newPins) => {
                webviewRef.current?.injectJavaScript(
                    `window.setPins(${JSON.stringify(newPins)}); true;`
                );
            },
            setRouteSelection: (routeId) => {
                webviewRef.current?.injectJavaScript(
                    `window.setRouteSelection(${routeId ? '"' + routeId + '"' : 'null'}); true;`
                );
            },
            updateUserLocation: (lat, lng) => {
                webviewRef.current?.injectJavaScript(
                    `window.updateUserLocation(${lat}, ${lng}); true;`
                );
            },
        }));

        const handleMessage = (event: { nativeEvent: { data: string } }) => {
            try {
                const msg = JSON.parse(event.nativeEvent.data);
                if (msg.type === 'ready') onMapReady?.();
                if (msg.type === 'pinTap') onPinPress?.(msg.pinId);
            } catch { /* ignorar mensajes no-JSON */ }
        };

        return (
            <View style={StyleSheet.absoluteFill}>
                <WebView
                    ref={webviewRef}
                    source={{ html }}
                    style={styles.webview}
                    originWhitelist={['*']}
                    javaScriptEnabled
                    domStorageEnabled
                    onMessage={handleMessage}
                    scrollEnabled={false}
                    bounces={false}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    overScrollMode="never"
                    androidLayerType="hardware"
                />
            </View>
        );
    }
);

MapWebView.displayName = 'MapWebView';
export default MapWebView;

const styles = StyleSheet.create({
    webview: { flex: 1, backgroundColor: '#F8FAFC' },
});
