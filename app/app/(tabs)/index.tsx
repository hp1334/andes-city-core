// app/(tabs)/index.tsx
// Pantalla principal — mapa Andes City con WebView híbrida
// Datos reales desde Supabase. Mapa vacío, limpio y en paz.
import React, { useRef, useState, useMemo, useCallback } from 'react';
import { StyleSheet, View, TouchableOpacity, Platform, Text, Animated, TextInput } from 'react-native';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { LocateFixed, MapPin as MapPinIcon, Clock, Search, Coffee, ShoppingBag, Utensils, CalendarDays, Bus, BellRing } from 'lucide-react-native';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

import { useLayers } from '../../hooks/useLayers';
import LayersMenu from '../../components/LayersMenu';
import LayerToast from '../../components/LayerToast';
import MapWebView, { MapWebViewHandle } from '../../components/MapWebView';
import FloatingBusDock from '../../components/FloatingBusDock';
import { supabase } from '../../lib/supabase';
import { BackHandler } from 'react-native';

type OverlayState = 'search' | 'bus' | 'news' | 'details' | null;

export default function HomeMapScreen() {
    const mapRef   = useRef<MapWebViewHandle>(null);
    const bottomSheetRef = useRef<BottomSheet>(null);
    const searchSheetRef = useRef<BottomSheet>(null);

    const [locating, setLocating] = useState(false);
    const [selectedRouteData, setSelectedRouteData] = useState<any | null>(null);
    const [busRoutes, setBusRoutes] = useState<any[]>([]);
    
    // UI State para Docks fluidos
    const [activeOverlay, setActiveOverlay] = useState<OverlayState>(null);
    const [selectedRoute, setSelectedRoute] = useState<string | null>(null);

    // Cache de ubicación para respuesta instantánea
    const userLocationRef = useRef<{lat: number, lng: number} | null>(null);

    // ── Animaciones de rebote ──
    const locateScale  = useRef(new Animated.Value(1)).current;
    const searchScale  = useRef(new Animated.Value(1)).current;
    const busScale     = useRef(new Animated.Value(1)).current;

    // ── Sistema de capas ──
    const { activeLayers, toggleLayer, toastVisible, hideToast } = useLayers();

    // ── Carga de rutas desde Supabase ──
    React.useEffect(() => {
        async function fetchRoutes() {
            try {
                const { data, error } = await supabase
                    .from('mobility_routes')
                    .select('*');
                if (error) {
                    console.warn('[Routes] Error Supabase:', error.message);
                    return;
                }
                setBusRoutes(data || []);
            } catch (err) {
                console.warn('[Routes] Error de conexión:', err);
            }
        }
        fetchRoutes();
    }, []);

    // ── Control Unificado de Pantallas Flotantes (Fluidez BUMP) ──
    const switchOverlay = useCallback((newOverlay: OverlayState) => {
        if (activeOverlay === newOverlay) {
            setActiveOverlay(null);
            if (newOverlay === 'search') searchSheetRef.current?.close();
            if (newOverlay === 'details') bottomSheetRef.current?.close();
        } else {
            if (activeOverlay === 'search') searchSheetRef.current?.close();
            if (activeOverlay === 'details') bottomSheetRef.current?.close();
            setActiveOverlay(newOverlay);
            if (newOverlay === 'search') searchSheetRef.current?.expand();
        }
    }, [activeOverlay]);

    // Hardware Back Android Nativo
    React.useEffect(() => {
        const backAction = () => {
            if (activeOverlay) { switchOverlay(activeOverlay); return true; }
            if (selectedRoute) { setSelectedRoute(null); return true; }
            return false;
        };
        const sub = BackHandler.addEventListener('hardwareBackPress', backAction);
        return () => sub.remove();
    }, [activeOverlay, selectedRoute, switchOverlay]);

    // ── Dibujar SOLO LA RUTA SELECCIONADA respetando Capa Movilidad ──
    React.useEffect(() => {
        if (!activeLayers.includes('movilidad') || !selectedRoute) {
            mapRef.current?.drawRoutes(null);
            return;
        }

        const routeObj = busRoutes.find(r => 
            String(r.id) === String(selectedRoute) || 
            String(r.id) === String(selectedRoute).replace('L0','').replace('L','')
        );
        if (routeObj && routeObj.path_coordinates) {
             const mappedPath = Array.isArray(routeObj.path_coordinates)
                 ? routeObj.path_coordinates.map((c: any) => {
                     if (c && typeof c === 'object' && 'latitude' in c) return [Number(c.latitude), Number(c.longitude)];
                     if (Array.isArray(c)) return [Number(c[0]), Number(c[1])];
                     return null;
                 }).filter(Boolean)
                 : [];

             if (mappedPath.length > 0) {
                 const singleRouteToDraw = [{
                     id: routeObj.id,
                     name: routeObj.name,
                     travel_time_min: routeObj.travel_time_min,
                     path: mappedPath,
                     color: routeObj.color || '#0ea5e9'
                 }];
                 mapRef.current?.drawRoutes(JSON.stringify(singleRouteToDraw));
             } else {
                 mapRef.current?.drawRoutes(null);
             }
        } else {
             mapRef.current?.drawRoutes(null);
        }
    }, [busRoutes, selectedRoute, activeLayers]);

    // ── Rastreo GPS en tiempo real para el Puntito Azul ──
    React.useEffect(() => {
        let locationSubscription: Location.LocationSubscription | null = null;
        const startTracking = async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;
            locationSubscription = await Location.watchPositionAsync(
                { accuracy: Location.Accuracy.Balanced, timeInterval: 5000, distanceInterval: 5 },
                (location) => {
                    const lat = location.coords.latitude;
                    const lng = location.coords.longitude;
                    userLocationRef.current = { lat, lng };
                    mapRef.current?.updateUserLocation(lat, lng);
                }
            );
        };
        startTracking();
        return () => { locationSubscription?.remove(); };
    }, []);

    // ── Ir a mi ubicación actual ──
    const handleLocatePress = () => {
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
        if (userLocationRef.current) {
            mapRef.current?.flyTo(userLocationRef.current.lat, userLocationRef.current.lng, 16);
            setTimeout(() => setLocating(false), 600);
            return;
        }
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') { setLocating(false); return; }
            let pos = await Location.getLastKnownPositionAsync();
            if (!pos) {
                pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
            }
            if (pos) {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                userLocationRef.current = { lat, lng };
                mapRef.current?.updateUserLocation(lat, lng);
                mapRef.current?.flyTo(lat, lng, 16);
            }
        } catch (e) {
            console.warn('Ubicación no disponible:', e);
        } finally {
            setTimeout(() => setLocating(false), 600);
        }
    };

    const handleMapReady = useCallback(() => {
        // El mapa inicia vacío de pines — paz visual.
    }, []);

    const handleRoutePress = (routeData: any) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedRouteData(routeData);
        bottomSheetRef.current?.expand();
    };

    return (
        <View style={styles.container}>

            {/* ── Mapa WebView a pantalla completa ── */}
            <MapWebView
                ref={mapRef}
                onRoutePress={handleRoutePress}
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

            {/* ── Botón Menú Buses (Solo si Capa Movilidad está activa) ── */}
            {activeLayers.includes('movilidad') && (
                <AnimatedTouchableOpacity
                    style={[styles.busBtn, { transform: [{ scale: busScale }] }, activeOverlay === 'bus' && styles.busBtnActive]}
                    activeOpacity={0.85}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        Animated.sequence([
                            Animated.timing(busScale, { toValue: 0.85, duration: 80, useNativeDriver: true }),
                            Animated.spring(busScale, { toValue: 1, friction: 4, useNativeDriver: true })
                        ]).start();
                        switchOverlay('bus');
                    }}
                >
                    <Bus size={20} color={activeOverlay === 'bus' ? '#FFFFFF' : '#0EA5E9'} strokeWidth={2.5} />
                </AnimatedTouchableOpacity>
            )}

            {/* ── Botón de Búsqueda (Izquierda abajo) ── */}
            <AnimatedTouchableOpacity
                style={[styles.searchBtn, { transform: [{ scale: searchScale }] }]}
                activeOpacity={0.85}
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    Animated.sequence([
                        Animated.timing(searchScale, { toValue: 0.85, duration: 80, useNativeDriver: true }),
                        Animated.spring(searchScale, { toValue: 1, friction: 4, useNativeDriver: true })
                    ]).start();
                    switchOverlay('search');
                }}
            >
                <Search size={22} color="#0F172A" strokeWidth={2.5} />
            </AnimatedTouchableOpacity>

            {/* ── Botón de Ubicación Actual (Derecha abajo) ── */}
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

            {/* ── Bottom Sheet para info de ruta tocada ── */}
            <BottomSheet
                ref={bottomSheetRef}
                index={-1}
                snapPoints={['30%', '45%']}
                enablePanDownToClose={true}
                backgroundStyle={styles.sheetBackground}
                handleIndicatorStyle={styles.sheetIndicator}
                onChange={(index) => {
                    if (index === -1) setSelectedRouteData(null);
                }}
            >
                <BottomSheetView style={styles.sheetContainer}>
                    {selectedRouteData ? (
                        <View style={styles.sheetContent}>
                            <View style={styles.sheetHeader}>
                                <View style={[styles.sheetIconWrapper, { backgroundColor: (selectedRouteData.color || '#0EA5E9') + '20' }]}>
                                    <Bus size={24} color={selectedRouteData.color || '#0EA5E9'} />
                                </View>
                                <View style={styles.sheetTexts}>
                                    <Text style={styles.sheetTitle}>Línea {selectedRouteData.name}</Text>
                                    <Text style={styles.sheetType}>Estado: Activo</Text>
                                </View>
                            </View>
                            <View style={styles.sheetStatsCard}>
                                <Clock size={16} color="#64748B" />
                                <Text style={styles.sheetStatText}>
                                    Tiempo de recorrido: {selectedRouteData.travel_time_min} min
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={[styles.closeRouteBtn, { marginTop: 16 }]}
                                onPress={() => bottomSheetRef.current?.close()}
                            >
                                <Text style={styles.closeRouteBtnText}>Cerrar</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <Text style={styles.sheetTitle}>Cargando...</Text>
                    )}
                </BottomSheetView>
            </BottomSheet>

            {/* ── Search Menu ── */}
            <BottomSheet
                ref={searchSheetRef}
                index={-1}
                snapPoints={['85%']}
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

            {/* ── Floating Bus Dock ("Tu Guía Bus") ── */}
            <FloatingBusDock
                isVisible={activeOverlay === 'bus' && activeLayers.includes('movilidad')}
                routes={busRoutes as any}
                selectedRoute={selectedRoute}
                onRouteSelect={(routeId) => {
                    const isNewSelection = selectedRoute !== routeId;
                    setSelectedRoute(isNewSelection ? routeId : null);
                    // Ocultar dock si selecciona para ver ruta limpia
                    if (isNewSelection) {
                        switchOverlay(null);
                    }
                }}
            />

        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1E293B' },
    locateBtn: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 160 : 140,
        right: 20,
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
    locateBtnActive: { backgroundColor: '#0EA5E9' },
    searchBtn: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 160 : 140,
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
    busBtnActive: {
        backgroundColor: '#0EA5E9',
        borderColor: '#0EA5E9',
    },
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
    sheetContent: { flex: 1 },
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
    sheetTexts: { flex: 1 },
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
    closeRouteBtn: {
        backgroundColor: '#F1F5F9',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    closeRouteBtnText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#64748B',
    },
    searchHeaderWrapper: {
        marginBottom: 24,
        marginTop: 8,
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
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
