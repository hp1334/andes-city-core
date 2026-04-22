// components/MapWebView.tsx
// Mapa Andes City — Leaflet.js + CARTO Light tiles dentro de WebView
// Sin API key. Sin costo. Control total sobre estilo y pines.
// Arquitectura: mapa en WebView, UI de Andes City encima en React Native puro.
import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

// ── Tipos de control expuestos al padre ──────────────────────────
export interface MapWebViewHandle {
    flyTo: (lat: number, lng: number, zoom?: number) => void;
    setPins: (pins: any[]) => void;
    drawRoutes: (routesStr: string | null) => void;
    updateUserLocation: (lat: number, lng: number) => void;
}

interface MapWebViewProps {
    pins?: any[];
    onPinPress?: (pinId: string) => void;
    onRoutePress?: (routeData: any) => void;
    onMapReady?: () => void;
}

// ── Configuración visual por tipo de pin ─────────────────────────
const PIN_CONFIG_JS = {
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
};

// ── HTML del mapa ─────────────────────────────────────────────────
function buildMapHTML(): string {
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
    filter: sepia(12%) hue-rotate(190deg) saturate(130%) brightness(1.03) contrast(1.05);
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
    background: #3B82F6;
    border-radius: 50%;
    border: 3px solid #FFFFFF;
    box-shadow: 0 0 10px rgba(59, 130, 246, 0.4);
    position: relative;
    z-index: 1000 !important;
  }
  .user-dot::after {
    content: '';
    position: absolute;
    top: -12px; left: -12px; right: -12px; bottom: -12px;
    background: rgba(59, 130, 246, 0.35);
    border-radius: 50%;
    animation: pulse-user 2.5s ease-out infinite;
  }
  @keyframes pulse-user {
    0%   { transform: scale(0.4); opacity: 1; }
    100% { transform: scale(2.2); opacity: 0; }
  }
</style>
</head>
<body>
<div id="map"></div>
<script>
var RIOBAMBA = [-1.6635, -78.6547];
var PIN_CONFIG = ${JSON.stringify(PIN_CONFIG_JS)};
var userMarker = null;
var trailLayer = null;

var map = L.map('map', {
  center: RIOBAMBA,
  zoom: 14,
  zoomControl: false,
  attributionControl: false,
  tap: false,
});

// CARTO Light — limpio, minimalista, estilo Zenly
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  subdomains: 'abcd',
  maxZoom: 20,
}).addTo(map);

// Capa de polilíneas de rutas
trailLayer = L.layerGroup().addTo(map);

function renderPins(pins) {
  map.eachLayer(function(layer) {
    if (layer instanceof L.Marker && layer !== userMarker) map.removeLayer(layer);
  });
  pins.forEach(function(pin, i) {
    var cfg = PIN_CONFIG[pin.type] || PIN_CONFIG['bache'];
    var size = cfg.size || 44;
    var iconSize = Math.round(size * 0.42);
    var border = cfg.borderWidth > 0 ? 'border:' + cfg.borderWidth + 'px solid ' + cfg.borderColor + ';' : '';
    var anchorColor = cfg.bg === '#FFFFFF' ? (cfg.borderColor !== 'transparent' ? cfg.borderColor : '#FFFFFF') : cfg.bg;

    var html = '<div class="ac-pin drop-in" style="animation-delay:' + (i * 40) + 'ms">'
      + '<div class="ac-bubble" style="width:' + size + 'px;height:' + size + 'px;background:' + cfg.bg + ';' + border + '">'
      + '<span style="font-size:' + iconSize + 'px;">📍</span>'
      + '</div>'
      + '<div class="ac-anchor" style="border-top:8px solid ' + anchorColor + ';"></div>'
      + '</div>';

    var icon = L.divIcon({ html: html, iconSize: [size, size + 12], iconAnchor: [size / 2, size + 12], className: '' });
    var marker = L.marker([pin.lat, pin.lng], { icon: icon }).addTo(map);
    marker.on('click', function() {
      window.ReactNativeWebView && window.ReactNativeWebView.postMessage(
        JSON.stringify({ type: 'pinTap', pinId: pin.id, pinType: pin.type, title: pin.title })
      );
    });
  });
}

// ── Funciones controlables desde React Native ──
window.flyTo = function(lat, lng, zoom) {
  map.flyTo([lat, lng], zoom || 16, { animate: true, duration: 0.6, easeLinearity: 0.1 });
};

window.setPins = function(pins) {
  renderPins(pins);
};

window.drawRoutes = function(routesStr) {
  trailLayer.clearLayers();
  if (!routesStr) return;
  try {
    var routesList = JSON.parse(routesStr);
    routesList.forEach(function(route) {
      if (route.path && route.path.length > 0) {
        var line = L.polyline(route.path, {
          color: route.color || '#0EA5E9',
          weight: 4,
          opacity: 0.9,
          smoothFactor: 1.5,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(trailLayer);

        line.on('click', function() {
          map.fitBounds(line.getBounds(), { padding: [50, 50], maxZoom: 15 });
          window.ReactNativeWebView && window.ReactNativeWebView.postMessage(
            JSON.stringify({ type: 'routeTap', route: route })
          );
        });
      }
    });
  } catch(e) {
    console.error('Error parseando rutas', e);
  }
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
    ({ pins = [], onPinPress, onRoutePress, onMapReady }, ref) => {
        const webviewRef = useRef<WebView>(null);
        const html = buildMapHTML();

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
            drawRoutes: (routesStr) => {
                const safe = routesStr ? routesStr.replace(/\\/g, '\\\\').replace(/'/g, "\\'") : null;
                webviewRef.current?.injectJavaScript(
                    `window.drawRoutes(${safe ? "'" + safe + "'" : 'null'}); true;`
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
                if (msg.type === 'routeTap') onRoutePress?.(msg.route);
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
