// components/LayerToast.tsx
// Toast discreto que aparece 2 segundos cuando el usuario intenta activar una 3ra capa
import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, Platform } from 'react-native';

interface LayerToastProps {
    visible: boolean;
    onHide: () => void;
}

export default function LayerToast({ visible, onHide }: LayerToastProps) {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(-10)).current;

    useEffect(() => {
        if (visible) {
            // Entra suavemente desde arriba
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.spring(translateY, {
                    toValue: 0,
                    tension: 80,
                    friction: 10,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            // Sale hacia arriba
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(translateY, {
                    toValue: -10,
                    duration: 150,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <Animated.View
            style={[
                styles.toast,
                {
                    opacity,
                    transform: [{ translateY }],
                },
            ]}
            pointerEvents="none"
        >
            <Text style={styles.text}>Solo 2 capas activas a la vez</Text>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    toast: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 110 : 90,
        alignSelf: 'center',
        backgroundColor: 'rgba(15, 23, 42, 0.82)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        zIndex: 999,
        // Sombra sutil
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 8,
    },
    text: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '500',
        letterSpacing: 0.2,
    },
});
