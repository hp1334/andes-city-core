// app/(tabs)/index.tsx
// Pantalla principal — mapa Andes City con WebView híbrida
import React, { useRef, useState, useMemo, useCallback } from 'react';
import { StyleSheet, View, TouchableOpacity, Platform, Text, Animated, TextInput, ScrollView } from 'react-native';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { LocateFixed, MapPin as MapPinIcon, Clock, Search, Coffee, ShoppingBag, Utensils, CalendarDays, Bus } from 'lucide-react-native';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

import { useLayers } from '../../hooks/useLayers';
import LayersMenu from '../../components/LayersMenu';
import LayerToast from '../../components/LayerToast';
import RouteSelectorSheet, { Route } from '../../components/RouteSelectorSheet';
import MapWebView, { MapWebViewHandle } from '../../components/MapWebView';
import { ALL_PINS, MapPin } from '../../data/mockPins';

// Mocks de líneas de bus para Andes City
const BUS_ROUTES: Route[] = [
  { id: 'L04', name: 'Línea 4 — Terminal ↔ Norte', color: '#1eb0f0', activeBuses: 2 },
  { id: 'L05', name: 'Línea 5 — Centro ↔ Sur', color: '#8B5CF6', activeBuses: 1 },
];

export default function HomeMapScreen() {
    const mapRef   = useRef<MapWebViewHandle>(null);
    const bottomSheetRef = useRef<BottomSheet>(null);
    const searchSheetRef = useRef<BottomSheet>(null);
    const routeSheetRef = useRef<BottomSheet>(null); // Ref de Rutas

    const [locating, setLocating] = useState(false);
    const [selectedPin, setSelectedPin] = useState<MapPin | null>(null);
    const [selectedRoute, setSelectedRoute] = useState<string | null>(null); // BUMP UI Route

    // ── Animaciones de rebote ──
    const locateScale = useRef(new Animated.Value(1)).current;
    const searchScale = useRef(new Animated.Value(1)).current;
    const busScale = useRef(new Animated.Value(1)).current;

    // ── Rastreo GPS en tiempo real para el Puntito Azul ──
    React.useEffect(() => {
        let locationSubscription: Location.LocationSubscription | null = null;
        
        const startTracking = async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;

            locationSubscription = await Location.watchPositionAsync(
                { accuracy: Location.Accuracy.Balanced, timeInterval: 5000, distanceInterval: 5 },
                (location) => {
                    mapRef.current?.updateUserLocation(location.coords.latitude, location.coords.longitude);
                }
            );
        };
        startTracking();
        return () => { locationSubscription?.remove(); };
    }, []);

    // ── Sistema de capas ──
    const { activeLayers, toggleLayer, toastVisible, hideToast } = useLayers();

    // Sincronizar Selección de Rutas con el Mapa (Leaflet JS Inject)
    React.useEffect(() => {
        mapRef.current?.setRouteSelection(selectedRoute);
    }, [selectedRoute]);

    // ── Pines filtrados (Capas + Ruta Activa Independiente) ──
    // Los buses se filtran en JS mediante atenuación por defecto, PERO si la capa
    // Movilidad no está activa y abriste el menú bus, inyectamos los buses directamente
    const visiblePins = useMemo(() => {
        let basePins = ALL_PINS.filter(pin => activeLayers.includes(pin.layer));
        
        if (selectedRoute) {
            const lineNum = Number(selectedRoute.replace('L0', '').replace('L', ''));
            const rutaPins = ALL_PINS.filter(p => p.type === 'bus' && p.payload?.line === lineNum);
            
            // Añadir pines de la ruta si no estaban ya por la capa "movilidad"
            rutaPins.forEach(p => {
                if (!basePins.find(bp => bp.id === p.id)) {
                    basePins.push(p);
                }
            });
        }
        return basePins;
    }, [activeLayers, selectedRoute]);

    // ── Actualizar pines cuando cambian las capas ──
    const handleMapReady = useCallback(() => {
        mapRef.current?.setPins(visiblePins);
    }, [visiblePins]);

    // ── Ir a mi ubicación actual (con Feedback instantáneo) ──
    const handleLocatePress = () => {
        // Interacción táctil inmediata y animación de rebote
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Animated.sequence([
            Animated.timing(locateScale, { toValue: 0.8, duration: 80, useNativeDriver: true }),
            Animated.spring(locateScale, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true })
        ]).start();
        
        goToMyLocation();
    };

    const goToMyLocation = async () => {
        if (locating) return;
        setLocating(true);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') { setLocating(false); return; }
            const pos = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });
            mapRef.current?.flyTo(pos.coords.latitude, pos.coords.longitude, 16);
        } catch (e) {
            console.warn('Ubicación no disponible:', e);
        } finally {
            setLocating(false);
        }
    };

    // ── Pin tocado → PASO 4: Bottom Sheet ──
    const handlePinPress = (pinId: string) => {
        const pin = ALL_PINS.find(p => p.id === pinId);
        if (pin) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setSelectedPin(pin);
            bottomSheetRef.current?.expand(); // Abre la hoja
            mapRef.current?.flyTo(pin.lat - 0.001, pin.lng, 16); // Centra sutilmente más abajo del centro
        }
    };

    return (
        <View style={styles.container}>

            {/* ── Mapa WebView a pantalla completa ── */}
            <MapWebView
                ref={mapRef}
                pins={visiblePins}
                onPinPress={handlePinPress}
                onMapReady={handleMapReady}
            />

            {/* ── Toast de límite de capas ── */}
            <LayerToast visible={toastVisible} onHide={hideToast} />

            {/* ── Menú de capas ── */}
            <LayersMenu
                activeLayers={activeLayers}
                onToggle={toggleLayer}
                topOffset={Platform.OS === 'ios' ? 112 : 96}
            />

            {/* ── Botón Menú Buses (Independiente) ── */}
            <AnimatedTouchableOpacity
                style={[styles.busBtn, { transform: [{ scale: busScale }] }]}
                activeOpacity={0.85}
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    Animated.sequence([
                        Animated.timing(busScale, { toValue: 0.85, duration: 80, useNativeDriver: true }),
                        Animated.spring(busScale, { toValue: 1, friction: 4, useNativeDriver: true })
                    ]).start();
                    routeSheetRef.current?.expand();
                }}
            >
                <Bus size={20} color="#0EA5E9" strokeWidth={2.5} />
            </AnimatedTouchableOpacity>

            {/* ── Botón de Búsqueda (Izquierda) ── */}
            <AnimatedTouchableOpacity
                style={[styles.searchBtn, { transform: [{ scale: searchScale }] }]}
                activeOpacity={0.85}
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    Animated.sequence([
                        Animated.timing(searchScale, { toValue: 0.85, duration: 80, useNativeDriver: true }),
                        Animated.spring(searchScale, { toValue: 1, friction: 4, useNativeDriver: true })
                    ]).start();
                    searchSheetRef.current?.expand(); // Abre el menú de búsqueda
                }}
            >
                <Search size={22} color="#0F172A" strokeWidth={2.5} />
            </AnimatedTouchableOpacity>

            {/* ── Botón de Ubicación Actual (Derecha) ── */}
            <AnimatedTouchableOpacity
                style={[styles.locateBtn, locating && styles.locateBtnActive, { transform: [{ scale: locateScale }] }]}
                onPress={handleLocatePress}
                activeOpacity={0.85}
            >
                <LocateFixed
                    size={22}
                    color={locating ? '#FFFFFF' : '#0EA5E9'}
                    strokeWidth={2.5}
                />
            </AnimatedTouchableOpacity>

            {/* ── Bottom Sheet (Dashboard Flotante BUMP) ── */}
            <BottomSheet
                ref={bottomSheetRef}
                index={-1} /* Oculto por defecto */
                snapPoints={['30%', '45%']}
                enablePanDownToClose={true}
                backgroundStyle={styles.sheetBackground}
                handleIndicatorStyle={styles.sheetIndicator}
                onChange={(index) => {
                    if (index === -1) setSelectedPin(null);
                }}
            >
                <BottomSheetView style={styles.sheetContainer}>
                    {selectedPin ? (
                        <View style={styles.sheetContent}>
                            <View style={styles.sheetHeader}>
                                <View style={styles.sheetIconWrapper}>
                                    <MapPinIcon size={24} color="#0EA5E9" />
                                </View>
                                <View style={styles.sheetTexts}>
                                    <Text style={styles.sheetTitle}>{selectedPin.title}</Text>
                                    <Text style={styles.sheetType}>Categoria: {selectedPin.type}</Text>
                                </View>
                            </View>
                            
                            {/* Layout Ficticio de Datos BUMP */}
                            <View style={styles.sheetStatsCard}>
                                <Clock size={16} color="#64748B" />
                                <Text style={styles.sheetStatText}>Actualizado hace 2 min</Text>
                            </View>
                        </View>
                    ) : (
                        <Text style={styles.sheetTitle}>Cargando...</Text>
                    )}
                </BottomSheetView>
            </BottomSheet>

            {/* ── Search Menu (Bottom Sheet de Búsqueda) ── */}
            <BottomSheet
                ref={searchSheetRef}
                index={-1}
                snapPoints={['50%', '85%']}
                enablePanDownToClose={true}
                backgroundStyle={styles.sheetBackground}
                handleIndicatorStyle={styles.sheetIndicator}
                keyboardBehavior="interactive"
            >
                <BottomSheetView style={styles.sheetContainer}>
                    <View style={styles.searchHeaderWrapper}>
                        <View style={styles.searchInputContainer}>
                            <Search size={22} color="#64748B" />
                            <TextInput 
                                placeholder="Buscar lugares, restaurantes..." 
                                placeholderTextColor="#94A3B8"
                                style={styles.searchInput}
                                autoCapitalize="none"
                            />
                        </View>
                    </View>

                    <Text style={styles.searchSectionTitle}>Categorías Destacadas</Text>
                    <View style={styles.searchCategories}>
                        <TouchableOpacity style={styles.categoryBadge}>
                            <View style={[styles.categoryIconBg, { backgroundColor: '#FEF3C7' }]}>
                                <Utensils size={20} color="#D97706" />
                            </View>
                            <Text style={styles.categoryText}>Comida</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.categoryBadge}>
                            <View style={[styles.categoryIconBg, { backgroundColor: '#EDE9FE' }]}>
                                <Coffee size={20} color="#7C3AED" />
                            </View>
                            <Text style={styles.categoryText}>Cafés</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.categoryBadge}>
                            <View style={[styles.categoryIconBg, { backgroundColor: '#D1FAE5' }]}>
                                <ShoppingBag size={20} color="#059669" />
                            </View>
                            <Text style={styles.categoryText}>Tiendas</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.categoryBadge}>
                            <View style={[styles.categoryIconBg, { backgroundColor: '#DBEAFE' }]}>
                                <CalendarDays size={20} color="#2563EB" />
                            </View>
                            <Text style={styles.categoryText}>Eventos</Text>
                        </TouchableOpacity>
                    </View>
                </BottomSheetView>
            </BottomSheet>

            {/* ── Route Selector (Bottom Sheet de Movilidad Avanzada) ── */}
            <RouteSelectorSheet
                sheetRef={routeSheetRef}
                routes={BUS_ROUTES}
                selectedRoute={selectedRoute}
                onRouteSelect={(routeId) => setSelectedRoute(prev => prev === routeId ? null : routeId)}
                onDismiss={() => {
                    // El usuario pidió colapsar SIN deseleccionar la ruta.
                    // React Native colapsa visualmente porque el sheet tiene snapPoint 72px base, pero mantenemos el estado.
                }}
            />

        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1E293B' }, // Fondo gris oscuro pre-WebView
    locateBtn: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 160 : 140, // Subido alejándose de los spots
        right: 20,
        width: 52, // Más grande para mejor touch
        height: 52,
        borderRadius: 26,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
        zIndex: 50,
    },
    locateBtnActive: { backgroundColor: '#0EA5E9' },
    
    searchBtn: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 160 : 140, // Alineado con locateBtn
        left: 20,
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
        zIndex: 50,
    },
    
    /* ── Botón Flotante de Autobuses (Izquierda, abajo de capas) ── */
    busBtn: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 164 : 148,
        left: 16,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
        zIndex: 50,
        borderWidth: 1.5,
        borderColor: 'rgba(14, 165, 233, 0.1)',
    },

    /* ── Estilos Premium del Bottom Sheet ── */
    sheetBackground: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
    },
    sheetIndicator: {
        width: 40,
        backgroundColor: '#E2E8F0',
    },
    sheetContainer: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 8,
    },
    sheetContent: {
        flex: 1,
    },
    sheetHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    sheetIconWrapper: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#F0F9FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    sheetTexts: {
        flex: 1,
    },
    sheetTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: 4,
    },
    sheetType: {
        fontSize: 14,
        fontWeight: '500',
        color: '#64748B',
        textTransform: 'capitalize',
    },
    sheetStatsCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        padding: 12,
        borderRadius: 12,
    },
    sheetStatText: {
        fontSize: 14,
        color: '#64748B',
        marginLeft: 8,
        fontWeight: '500',
    },
    
    /* ── Estilos del Panel de Búsqueda ── */
    searchHeaderWrapper: {
        marginBottom: 24,
        marginTop: 8,
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9', // Gris claro BUMP
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 54,
    },
    searchInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        fontWeight: '500',
        color: '#0F172A',
    },
    searchSectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: 16,
    },
    searchCategories: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
    },
    categoryBadge: {
        alignItems: 'center',
        width: '23%',
        marginBottom: 16,
    },
    categoryIconBg: {
        width: 60,
        height: 60,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    categoryText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#475569',
    }
});
