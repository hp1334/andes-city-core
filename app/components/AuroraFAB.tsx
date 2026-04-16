// components/AuroraFAB.tsx
// Aurora IA — esfera azul pulsante en pestaña lateral derecha
// Discreta, calmada, sin invadir el mapa
import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, StyleSheet, Animated, Dimensions, View } from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AuroraFABProps {
    onPress?: () => void;
}

export default function AuroraFAB({ onPress }: AuroraFABProps) {
    // Anillo exterior: pulse suave e infinito (opacidad)
    const ringOpacity = useRef(new Animated.Value(0.2)).current;
    // Anillo exterior: escala sutil (respira)
    const ringScale   = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.parallel([
                    Animated.timing(ringOpacity, {
                        toValue: 0.55,
                        duration: 1800,
                        useNativeDriver: true,
                    }),
                    Animated.timing(ringScale, {
                        toValue: 1.18,
                        duration: 1800,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.parallel([
                    Animated.timing(ringOpacity, {
                        toValue: 0.2,
                        duration: 1800,
                        useNativeDriver: true,
                    }),
                    Animated.timing(ringScale, {
                        toValue: 1,
                        duration: 1800,
                        useNativeDriver: true,
                    }),
                ]),
            ])
        ).start();
    }, []);

    return (
        <TouchableOpacity
            style={styles.tab}
            activeOpacity={0.85}
            onPress={onPress}
        >
            {/* Anillo pulsante exterior — se expande y desvanece */}
            <Animated.View
                style={[
                    styles.pulseRing,
                    {
                        opacity: ringOpacity,
                        transform: [{ scale: ringScale }],
                    },
                ]}
            />

            {/* La esfera azul — núcleo sólido */}
            <View style={styles.sphere}>
                {/* Reflejo interno superior — ilusión de volumen */}
                <View style={styles.sphereHighlight} />
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    tab: {
        position: 'absolute',
        right: 12,
        top: SCREEN_HEIGHT * 0.44,
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 200,
    },

    // Anillo que respira alrededor de la esfera
    pulseRing: {
        position: 'absolute',
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 2,
        borderColor: '#0284C7',
        backgroundColor: 'transparent',
    },

    // Esfera sólida azul profundo
    sphere: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#0284C7',
        // Sombra que da sensación de profundidad
        shadowColor: '#0EA5E9',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.45,
        shadowRadius: 8,
        elevation: 10,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        overflow: 'hidden',
    },

    // Reflejo blanco semitransparente arriba a la izquierda
    sphereHighlight: {
        width: 14,
        height: 10,
        borderRadius: 7,
        backgroundColor: 'rgba(255, 255, 255, 0.35)',
        marginTop: 4,
        marginLeft: 4,
    },
});
