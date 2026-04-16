// app/(tabs)/_layout.tsx
// Layout maestro — usa Expo Router para la navegación, tab bar oculto
// FloatingNav y AuroraFAB se montan como overlays sobre el contenido
import React, { useState, useRef } from 'react';
import {
    View,
    StyleSheet,
    Animated,
    Dimensions,
    TouchableOpacity,
    Text,
    Platform,
} from 'react-native';
import { Tabs, router } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { User } from 'lucide-react-native';

import FloatingNav, { TabName } from '../../components/FloatingNav';
import AuroraFAB from '../../components/AuroraFAB';

// Removed SCREEN_HEIGHT used since unused

// ── Logo Andes City ──
function LogoText() {
    return (
        <View style={logoStyles.container}>
            <Svg width="28" height="28" viewBox="0 0 28 28">
                <Path d="M4 24 L12 8 L20 24 Z" fill="#0EA5E9" opacity={0.9} />
                <Path d="M14 24 L22 6 L28 24 Z" fill="#0F172A" opacity={0.85} />
                <Path d="M22 6 L18.5 13 L25.5 13 Z" fill="white" opacity={0.9} />
            </Svg>
            <View style={logoStyles.textContainer}>
                <Text style={logoStyles.primary}>Andes</Text>
                <Text style={logoStyles.secondary}>City</Text>
            </View>
        </View>
    );
}

const logoStyles = StyleSheet.create({
    container:     { flexDirection: 'row', alignItems: 'center', gap: 6 },
    textContainer: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
    primary:       { fontSize: 16, fontWeight: '800', color: '#0F172A', letterSpacing: -0.5 },
    secondary:     { fontSize: 14, fontWeight: '600', color: '#0EA5E9' },
});

// ── Layout Principal ──
export default function TabLayout() {
    // Tab activo — home por defecto
    const [activeTab, setActiveTab] = useState<TabName>('home');

    const handleTabPress = (tab: TabName) => {
        setActiveTab(tab);
        // Navegar a la ruta correcta
        if (tab === 'home') {
            router.push('/');
        } else {
            router.push(`/(tabs)/${tab}` as any);
        }
    };

    return (
        <View style={styles.root}>

            {/* ── Motor de tabs de Expo Router (tab bar nativo completamente oculto) ── */}
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarStyle: { display: 'none' }, // Ocultamos la barra nativa
                    animation: 'none',                 // Sin animación de transición entre tabs
                }}
            >
                <Tabs.Screen name="index"    options={{ title: 'Ciudad'   }} />
                <Tabs.Screen name="radar"    options={{ title: 'Radar'    }} />
                <Tabs.Screen name="discover" options={{ title: 'Spots'    }} />
                <Tabs.Screen name="profile"  options={{ title: 'Perfil'   }} />
            </Tabs>

            {/* ── ZONA A: Logo arriba izquierda ── */}
            <View style={styles.logoZone} pointerEvents="none">
                <View style={styles.logoPill}>
                    <LogoText />
                </View>
            </View>

            {/* ── ZONA B: Perfil arriba derecha ── */}
            <View style={styles.profileZone}>
                <TouchableOpacity
                    style={styles.profileButton}
                    onPress={() => handleTabPress('home')}
                    activeOpacity={0.8}
                >
                    <User size={22} color="#64748B" strokeWidth={1.8} />
                </TouchableOpacity>
            </View>

            {/* ── ZONA C: Aurora lateral derecha ── */}
            <AuroraFAB onPress={() => {}} />

            {/* ── ZONA D: Navegación flotante inferior ── */}
            <FloatingNav activeTab={activeTab} onTabPress={handleTabPress} />

        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    logoZone: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 56 : 40,
        left: 16,
        zIndex: 200,
        pointerEvents: 'none',
    },
    logoPill: {
        backgroundColor: 'rgba(255, 255, 255, 0.88)',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 8,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 6,
    },
    profileZone: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 56 : 40,
        right: 16,
        zIndex: 200,
    },
    profileButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 6,
    },
});
