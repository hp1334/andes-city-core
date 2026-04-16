// components/FloatingNav.tsx
// 3 círculos flotantes — Home protagonista (más grande)
// Animaciones SOLO de transform y opacity (native driver limpio, sin conflictos)
// Colores cambian con condicional directo — no necesitan animación
import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Platform } from 'react-native';
import { Zap, Map, Compass } from 'lucide-react-native';

export type TabName = 'radar' | 'home' | 'discover';

interface FloatingNavProps {
    activeTab: TabName;
    onTabPress: (tab: TabName) => void;
}

const TABS: {
    name: TabName;
    icon: React.ElementType;
    label: string;
    activeColor: string;
    size: number;
}[] = [
    { name: 'radar',    icon: Zap,     label: 'Radar',  activeColor: '#EF4444', size: 62 },
    { name: 'home',     icon: Map,     label: 'Ciudad', activeColor: '#0EA5E9', size: 76 },
    { name: 'discover', icon: Compass, label: 'Spots',  activeColor: '#F59E0B', size: 62 },
];

function NavCircle({
    icon: Icon,
    label,
    activeColor,
    isActive,
    size,
    onPress,
}: {
    icon: React.ElementType;
    label: string;
    activeColor: string;
    isActive: boolean;
    size: number;
    onPress: () => void;
}) {
    // Solo animamos transform y opacity — ambos 100% compatibles con native driver
    const scale       = useRef(new Animated.Value(isActive ? 1.1 : 1)).current;
    const textOpacity = useRef(new Animated.Value(isActive ? 1 : 0)).current;

    useEffect(() => {
        // Scale: spring con rebote físico
        Animated.spring(scale, {
            toValue: isActive ? 1.1 : 0.95,
            tension: 55,
            friction: 7,
            useNativeDriver: true,
        }).start();

        // Label fade: suave
        Animated.timing(textOpacity, {
            toValue: isActive ? 1 : 0,
            duration: 200,
            useNativeDriver: true,
        }).start();
    }, [isActive]);

    const handlePress = () => {
        // Micro-rebote táctil: comprime y vuelve
        Animated.sequence([
            Animated.spring(scale, {
                toValue: 0.82,
                tension: 120,
                friction: 6,
                useNativeDriver: true,
            }),
            Animated.spring(scale, {
                toValue: isActive ? 1.1 : 0.95,
                tension: 55,
                friction: 7,
                useNativeDriver: true,
            }),
        ]).start();
        onPress();
    };

    // Colores condicionales directos — sin animar (el scale ya da el feedback visual)
    const iconSize = isActive ? size * 0.30 : size * 0.36;

    return (
        <TouchableOpacity onPress={handlePress} activeOpacity={1}>
            <Animated.View
                style={[
                    styles.circle,
                    {
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        // Color de fondo: condicional directo, no animado
                        backgroundColor: isActive
                            ? activeColor
                            : 'rgba(255, 255, 255, 0.92)',
                        // Sombra: condicional directa
                        shadowColor:   isActive ? activeColor : '#0F172A',
                        shadowOpacity: isActive ? 0.35 : 0.10,
                        transform: [{ scale }],  // ← única propiedad animada aquí
                    },
                ]}
            >
                <Icon
                    size={iconSize}
                    color={isActive ? '#FFFFFF' : '#94A3B8'}
                    strokeWidth={isActive ? 2.5 : 2}
                />

                {/* Label que aparece/desaparece con fade (native driver opacity) */}
                <Animated.Text
                    style={[styles.label, { opacity: textOpacity }]}
                    numberOfLines={1}
                >
                    {label}
                </Animated.Text>
            </Animated.View>
        </TouchableOpacity>
    );
}

export default function FloatingNav({ activeTab, onTabPress }: FloatingNavProps) {
    return (
        <View style={styles.container} pointerEvents="box-none">
            <View style={styles.row} pointerEvents="box-none">
                {TABS.map((tab) => (
                    <NavCircle
                        key={tab.name}
                        icon={tab.icon}
                        label={tab.label}
                        activeColor={tab.activeColor}
                        isActive={activeTab === tab.name}
                        size={tab.size}
                        onPress={() => onTabPress(tab.name)}
                    />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 90 : 80,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 100,
        pointerEvents: 'box-none',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 18,
        pointerEvents: 'box-none',
    },
    circle: {
        justifyContent: 'center',
        alignItems: 'center',
        shadowOffset: { width: 0, height: 6 },
        shadowRadius: 16,
        elevation: 10,
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.85)',
    },
    label: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
        marginTop: 3,
        textAlign: 'center',
    },
});
