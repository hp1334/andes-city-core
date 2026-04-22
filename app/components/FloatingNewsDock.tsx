// components/FloatingNewsDock.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions, Platform, ScrollView } from 'react-native';
import { BellRing, AlertTriangle, Construction, Info } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface FloatingNewsDockProps {
    isVisible: boolean;
}

export default function FloatingNewsDock({ isVisible }: FloatingNewsDockProps) {
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

    if (!isVisible) {
        // En React Native, Animated.Value no puede compararse con 0 directamente.
        // Mejor gestionamos los 'pointerEvents' debajo para no bloquear la UI.
    }

    return (
        <Animated.View 
            style={[styles.container, { transform: [{ translateY }], opacity }]}
            pointerEvents={isVisible ? "auto" : "none"}
        >
            <View style={styles.header}>
                <View style={styles.titleWrapper}>
                    <BellRing size={20} color="#0EA5E9" />
                    <Text style={styles.title}>Avisos Ciudad</Text>
                </View>
                <Text style={styles.subtitle}>Información al instante de tráfico y ciudad</Text>
            </View>

            <ScrollView style={styles.scrollList} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                
                {/* ── NOTICIA OFICIAL VERIFICADA (GADM) ── */}
                <View style={[styles.newsCard, styles.verifiedCard]}>
                    <View style={[styles.iconBox, { backgroundColor: '#0284C7' }]}>
                        <Info size={18} color="#FFFFFF" />
                    </View>
                    <View style={styles.newsTextContainer}>
                        <View style={styles.verifiedHeader}>
                            <Text style={styles.newsTitle}>GADM Riobamba</Text>
                            {/* Blue check simulation */}
                            <View style={styles.verifiedBadge}>
                                <Text style={styles.verifiedTick}>✓</Text>
                            </View>
                        </View>
                        <Text style={styles.newsBody}>Cierre preventivo en sector La Panadería hoy desde las 18:00 por fiestas locales.</Text>
                    </View>
                </View>

                {/* Alerta Roja */}
                <View style={styles.newsCard}>
                    <View style={[styles.iconBox, { backgroundColor: '#FEE2E2' }]}>
                        <AlertTriangle size={18} color="#EF4444" />
                    </View>
                    <View style={styles.newsTextContainer}>
                        <Text style={styles.newsTitle}>Vía Cero Congestionada</Text>
                        <Text style={styles.newsBody}>Alta carga vehicular por accidente cerca del redondel. Evita transitar si es posible.</Text>
                    </View>
                </View>

                {/* Notificación Naranja */}
                <View style={styles.newsCard}>
                    <View style={[styles.iconBox, { backgroundColor: '#FEF3C7' }]}>
                        <Construction size={18} color="#F59E0B" />
                    </View>
                    <View style={styles.newsTextContainer}>
                        <Text style={styles.newsTitle}>Cierre por Mantenimiento</Text>
                        <Text style={styles.newsBody}>La Av. Daniel León Borja está siendo asfaltada. Usa rutas alternas.</Text>
                    </View>
                </View>

                {/* Notificación Informativa */}
                <View style={styles.newsCard}>
                    <View style={[styles.iconBox, { backgroundColor: '#E0F2FE' }]}>
                        <Info size={18} color="#0EA5E9" />
                    </View>
                    <View style={styles.newsTextContainer}>
                        <Text style={styles.newsTitle}>Nuevas Rutas Activas</Text>
                        <Text style={styles.newsBody}>Ahora puedes visualizar las Líneas 4 y 5 con proyecciones en vivo.</Text>
                    </View>
                </View>

            </ScrollView>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: '25%', 
        alignSelf: 'center',
        width: width - 32, 
        maxHeight: 380,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 24,
        paddingTop: 20,
        paddingBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 8,
        zIndex: 250, 
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
        gap: 8,
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
        maxHeight: 280,
    },
    scrollContent: {
        paddingHorizontal: 16,
        gap: 12, // espacio entre noticias
    },
    newsCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#F8FAFC',
        padding: 14,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    verifiedCard: {
        backgroundColor: '#F0F9FF',
        borderColor: '#BAE6FD',
    },
    verifiedHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    verifiedBadge: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#0EA5E9',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 1,
    },
    verifiedTick: {
        color: '#FFFFFF',
        fontSize: 9,
        fontWeight: '900',
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    newsTextContainer: {
        flex: 1,
    },
    newsTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 4,
    },
    newsBody: {
        fontSize: 13,
        color: '#64748B',
        lineHeight: 18,
    }
});
