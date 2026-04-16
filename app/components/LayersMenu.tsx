// components/LayersMenu.tsx
// Botón de capas + menú desplegable con 4 toggles
// Posición: debajo del logo Andes City, izquierda
import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Platform,
    TouchableWithoutFeedback,
} from 'react-native';
import { Layers } from 'lucide-react-native';
import { LayerName, LayerConfig, LAYERS } from '../hooks/useLayers';

interface LayersMenuProps {
    activeLayers: LayerName[];
    onToggle: (layer: LayerName) => void;
    // Posición top del botón (se calcula desde el padre según plataforma)
    topOffset?: number;
}

// Toggle individual de capa
function LayerToggle({
    layer,
    isActive,
    onToggle,
}: {
    layer: LayerConfig;
    isActive: boolean;
    onToggle: () => void;
}) {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePress = () => {
        Animated.sequence([
            Animated.spring(scaleAnim, { toValue: 0.92, tension: 120, friction: 6, useNativeDriver: true }),
            Animated.spring(scaleAnim, { toValue: 1, tension: 80, friction: 8, useNativeDriver: true }),
        ]).start();
        onToggle();
    };

    return (
        <TouchableOpacity onPress={handlePress} activeOpacity={1}>
            <Animated.View
                style={[
                    styles.toggleRow,
                    isActive && { backgroundColor: `${layer.color}12` },
                    { transform: [{ scale: scaleAnim }] },
                ]}
            >
                {/* Indicador de color de capa */}
                <View style={[styles.colorDot, { backgroundColor: layer.color }]} />

                {/* Nombre de la capa */}
                <Text style={[styles.layerLabel, isActive && { color: layer.color, fontWeight: '700' }]}>
                    {layer.label}
                </Text>

                {/* Switch visual */}
                <View style={[styles.switchTrack, isActive && { backgroundColor: layer.color }]}>
                    <View style={[styles.switchThumb, isActive && styles.switchThumbActive]} />
                </View>
            </Animated.View>
        </TouchableOpacity>
    );
}

export default function LayersMenu({ activeLayers, onToggle, topOffset }: LayersMenuProps) {
    const [menuOpen, setMenuOpen] = useState(false);

    // Animación del menú: slide-down desde el botón
    const menuHeight = useRef(new Animated.Value(0)).current;
    const menuOpacity = useRef(new Animated.Value(0)).current;

    const toggleMenu = () => {
        if (menuOpen) {
            // Cerrar
            Animated.parallel([
                Animated.timing(menuHeight, { toValue: 0, duration: 220, useNativeDriver: false }),
                Animated.timing(menuOpacity, { toValue: 0, duration: 180, useNativeDriver: false }),
            ]).start(() => setMenuOpen(false));
        } else {
            setMenuOpen(true);
            Animated.parallel([
                Animated.spring(menuHeight, { toValue: 216, tension: 70, friction: 12, useNativeDriver: false }),
                Animated.timing(menuOpacity, { toValue: 1, duration: 200, useNativeDriver: false }),
            ]).start();
        }
    };

    const closeMenu = () => {
        if (menuOpen) toggleMenu();
    };

    // Offset dinámico basado en plataforma
    const top = topOffset ?? (Platform.OS === 'ios' ? 108 : 92);

    return (
        <>
            {/* Capa invisible para cerrar el menú al tocar fuera */}
            {menuOpen && (
                <TouchableWithoutFeedback onPress={closeMenu}>
                    <View style={StyleSheet.absoluteFill} />
                </TouchableWithoutFeedback>
            )}

            <View style={[styles.container, { top }]} pointerEvents="box-none">

                {/* ── Botón de capas ── */}
                <TouchableOpacity
                    style={[styles.layerBtn, menuOpen && styles.layerBtnActive]}
                    onPress={toggleMenu}
                    activeOpacity={0.85}
                >
                    <Layers
                        size={18}
                        color={menuOpen ? '#0EA5E9' : '#64748B'}
                        strokeWidth={2}
                    />
                    {/* Badge con número de capas activas */}
                    {activeLayers.length > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{activeLayers.length}</Text>
                        </View>
                    )}
                </TouchableOpacity>

                {/* ── Menú desplegable ── */}
                {menuOpen && (
                    <Animated.View
                        style={[
                            styles.menu,
                            {
                                height: menuHeight,
                                opacity: menuOpacity,
                            },
                        ]}
                    >
                        <Text style={styles.menuTitle}>Capas del mapa</Text>
                        {LAYERS.map((layer) => (
                            <LayerToggle
                                key={layer.name}
                                layer={layer}
                                isActive={activeLayers.includes(layer.name)}
                                onToggle={() => onToggle(layer.name)}
                            />
                        ))}
                    </Animated.View>
                )}
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 16,
        zIndex: 300,
    },
    // ── Botón principal circular ──
    layerBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
    },
    layerBtnActive: {
        backgroundColor: 'rgba(14, 165, 233, 0.08)',
        borderWidth: 1.5,
        borderColor: 'rgba(14, 165, 233, 0.4)',
    },
    badge: {
        position: 'absolute',
        top: -4,
        right: -4,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#0EA5E9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: '#FFF',
        fontSize: 9,
        fontWeight: '700',
    },
    // ── Menú desplegable ──
    menu: {
        marginTop: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.96)',
        borderRadius: 16,
        paddingVertical: 8,
        paddingHorizontal: 4,
        overflow: 'hidden',
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
        minWidth: 190,
    },
    menuTitle: {
        fontSize: 11,
        fontWeight: '600',
        color: '#94A3B8',
        letterSpacing: 0.8,
        textTransform: 'uppercase',
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    // ── Toggle de cada capa ──
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 12,
        marginHorizontal: 4,
        gap: 10,
    },
    colorDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    layerLabel: {
        flex: 1,
        fontSize: 14,
        color: '#475569',
        fontWeight: '500',
    },
    // Switch visual (sin librería externa)
    switchTrack: {
        width: 36,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#E2E8F0',
        justifyContent: 'center',
        paddingHorizontal: 2,
    },
    switchThumb: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 2,
        elevation: 2,
        // Posición izquierda (inactivo)
        alignSelf: 'flex-start',
    },
    switchThumbActive: {
        // Posición derecha (activo)
        alignSelf: 'flex-end',
    },
});
