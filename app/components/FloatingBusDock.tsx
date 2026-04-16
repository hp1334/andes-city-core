// components/FloatingBusDock.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Dimensions, Platform, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Route } from './RouteSelectorSheet'; // Reutilizamos el Type
import { BusFront, Sparkles } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface FloatingBusDockProps {
    isVisible: boolean;
    routes: Route[];
    selectedRoute: string | null;
    onRouteSelect: (routeId: string) => void;
}

export default function FloatingBusDock({ isVisible, routes, selectedRoute, onRouteSelect }: FloatingBusDockProps) {
    const translateY = useRef(new Animated.Value(200)).current;
    const opacity = useRef(new Animated.Value(0)).current;

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
    if (!isVisible && opacity === 0) return null;

    return (
        <Animated.View style={[styles.container, { transform: [{ translateY }], opacity }]}>
            {/* Header / Título Marketing */}
            <View style={styles.header}>
                <View style={styles.titleWrapper}>
                    <Sparkles size={18} color="#F59E0B" />
                    <Text style={styles.title}>Tu Guía Bus</Text>
                </View>
                <Text style={styles.subtitle}>Toca una ruta para ver su recorrido en vivo</Text>
            </View>

            {/* Listado de Rutas */}
            <ScrollView style={styles.scrollList} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {routes.map(route => {
                    const isActive = route.id === selectedRoute;
                    return (
                        <TouchableOpacity
                            key={route.id}
                            activeOpacity={0.8}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                onRouteSelect(route.id);
                            }}
                            style={[
                                styles.card,
                                isActive ? styles.cardActive : styles.cardInactive,
                                isActive && { borderColor: route.color }
                            ]}
                        >
                            {/* Color Dot + Info */}
                            <View style={styles.cardInfo}>
                                <View style={[styles.dot, { backgroundColor: isActive ? route.color : '#CBD5E1' }]} />
                                <Text style={[styles.routeName, isActive && { color: '#0F172A', fontWeight: '700' }]}>
                                    {route.name}
                                </Text>
                            </View>

                            {/* Badge de Buses si aplica, o Status */}
                            <View style={[styles.statusBadge, isActive && { backgroundColor: `${route.color}15` }]}>
                                <BusFront size={14} color={isActive ? route.color : '#94A3B8'} />
                                <Text style={[styles.statusText, isActive && { color: route.color }]}>
                                    {route.activeBuses} unds.
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
        bottom: Platform.OS === 'ios' ? 120 : 100,
        alignSelf: 'center',
        width: width - 32, // Margen general de 16px por lado
        maxHeight: 280,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 24,
        paddingTop: 20,
        paddingBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 8,
        zIndex: 60, // Superior a otros menús inferiores
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
        gap: 8,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 16,
        borderWidth: 1.5,
        backgroundColor: '#FFFFFF',
    },
    cardInactive: {
        borderColor: '#E2E8F0',
        backgroundColor: '#F8FAFC',
    },
    cardActive: {
        // Color por defecto si falla el prop dinamico
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
        gap: 10,
        flex: 1,
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    routeName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
        flexShrink: 1,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#94A3B8',
    }
});
