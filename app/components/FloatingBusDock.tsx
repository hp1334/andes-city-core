// components/FloatingBusDock.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Dimensions, Platform, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Route } from './RouteSelectorSheet'; // Reutilizamos el Type
import { BusFront, Sparkles } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface FloatingBusDockProps {
    isVisible: boolean;
    routes: any[];
    selectedRouteCode: string | null;
    onRouteSelect: (routeCode: string) => void;
}

export default function FloatingBusDock({ isVisible, routes, selectedRouteCode, onRouteSelect }: FloatingBusDockProps) {
    const translateY = useRef(new Animated.Value(200)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    const uniqueRoutes = React.useMemo(() => {
        const map = new Map();
        routes.forEach(r => {
            if (r.route_code && !map.has(r.route_code)) {
                map.set(r.route_code, r);
            }
        });
        return Array.from(map.values());
    }, [routes]);

    useEffect(() => {
        if (isVisible) {
            Animated.parallel([
                Animated.spring(translateY, {
                    toValue: 0,
                    friction: 8,
                    tension: 60,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 200,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                })
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: 200,
                    duration: 200,
                    easing: Easing.in(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: true,
                })
            ]).start();
        }
    }, [isVisible]);

    // Evitar montar clics si no es visible (optimización)
    if (!isVisible) {
        // Manejamos pointerEvents dinámicos para no bloquear interfaz
    }

    return (
        <Animated.View 
            style={[styles.container, { transform: [{ translateY }], opacity }]}
            pointerEvents={isVisible ? "auto" : "none"}
        >
            {/* Header / Título Marketing */}
            <View style={styles.header}>
                <View style={styles.titleWrapper}>
                    <Sparkles size={18} color="#F59E0B" />
                    <Text style={styles.title}>Tu Guía Bus</Text>
                </View>
                <Text style={styles.subtitle}>Toca una ruta para ver su recorrido en vivo</Text>
            </View>

            {/* Listado de Rutas Únicas (Agrupadas por route_code) */}
            <ScrollView style={styles.scrollList} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {uniqueRoutes.map(route => {
                    const isActive = route.route_code === selectedRouteCode;
                    return (
                        <TouchableOpacity
                            key={route.route_code}
                            activeOpacity={0.8}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                onRouteSelect(route.route_code);
                            }}
                            style={[
                                styles.card,
                                isActive ? styles.cardActive : styles.cardInactive,
                                isActive && { borderColor: route.color }
                            ]}
                        >
                            <View style={styles.cardInfo}>
                                <View style={[styles.dot, { backgroundColor: isActive ? route.color : '#CBD5E1' }]} />
                                <Text style={[styles.routeName, isActive && { color: '#0F172A', fontWeight: '700' }]} numberOfLines={1}>
                                    {route.route_code}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: '30%', // Centrado de la pantalla
        alignSelf: 'center',
        width: width - 32, // Margen general de 16px por lado
        maxHeight: 340, // Un poco más alto al estar en el centro
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 24,
        paddingTop: 20,
        paddingBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 8,
        zIndex: 250, // Superior a AuroraFAB
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    header: {
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    titleWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: '800',
        color: '#0F172A',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 13,
        color: '#64748B',
        fontWeight: '500',
    },
    scrollList: {
        maxHeight: 180, // Scrolling interno si hay muchas rutas
    },
    scrollContent: {
        paddingHorizontal: 16,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        justifyContent: 'center',
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 20, 
        borderWidth: 1.5,
        backgroundColor: '#FFFFFF',
        width: '47%', // Caben 2 por fila, da espacio para el texto "L04 Terminal"
        minWidth: 120,
    },
    cardInactive: {
        borderColor: '#E2E8F0',
        backgroundColor: '#F8FAFC',
    },
    cardActive: {
        borderColor: '#0EA5E9',
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 8,
        flex: 1,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    routeName: {
        fontSize: 12,
        fontWeight: '600',
        color: '#475569',
        flexShrink: 1, // Para que numberOfLines funcione si texto es super largo
    },
});
