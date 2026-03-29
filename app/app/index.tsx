// app/index.tsx
import React, { useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { theme } from '../constants/theme';

export default function LoginScreen() {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');

    const handleMockLogin = () => {
        if (!phone || !password) {
            Alert.alert('Error', 'Por favor ingresa tu celular y contraseña.');
            return;
        }
        // Simulamos un login exitoso. Más adelante conectaremos esto a lib/supabase.ts
        Alert.alert('Éxito', 'Login simulado correcto. Redirigiendo...');
        // router.replace('/(tabs)/home'); // Descomentaremos esto cuando exista el home
    };

    return (
        <View style={styles.container}>
            {/* Mitad Superior Oscura */}
            <View style={styles.topHalf}>
                <SafeAreaView style={styles.safeArea}>
                    <Text style={styles.logoText}>ANDES CITY</Text>
                    <Text style={styles.tagline}>Tu ciudad, en tiempo real</Text>
                </SafeAreaView>
            </View>

            {/* Mitad Inferior Clara con el Formulario flotante */}
            <View style={styles.bottomHalf}>
                <View style={styles.formCard}>
                    <TextInput
                        style={styles.input}
                        placeholder="Celular"
                        placeholderTextColor={theme.colors.textMuted}
                        keyboardType="phone-pad"
                        value={phone}
                        onChangeText={setPhone}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Contraseña"
                        placeholderTextColor={theme.colors.textMuted}
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />

                    <TouchableOpacity style={styles.primaryButton} onPress={handleMockLogin}>
                        <Text style={styles.primaryButtonText}>Iniciar sesión</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.secondaryButton}>
                        <Text style={styles.secondaryButtonText}>Crear cuenta</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    topHalf: {
        flex: 0.4, // Ocupa el 40% superior
        backgroundColor: theme.colors.dark,
        justifyContent: 'center',
        alignItems: 'center',
    },
    safeArea: {
        alignItems: 'center',
    },
    logoText: {
        color: '#FFFFFF',
        fontSize: 32,
        fontWeight: theme.typography.weights.medium as any,
        letterSpacing: 2,
    },
    tagline: {
        color: theme.colors.textMuted,
        fontSize: 13,
        marginTop: 8,
    },
    bottomHalf: {
        flex: 0.6,
        backgroundColor: theme.colors.background,
        alignItems: 'center',
        paddingTop: 40, // Espacio para que la tarjeta "suba" visualmente si quisiéramos
    },
    formCard: {
        backgroundColor: '#FFFFFF',
        width: '85%',
        borderRadius: theme.layout.borderRadius,
        padding: 24,
        borderColor: theme.colors.border,
        borderWidth: 1,
        // Sombra sutil
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        marginTop: -60, // Hace que la tarjeta flote sobre la división oscuro/claro
    },
    input: {
        height: 50,
        backgroundColor: theme.colors.background,
        borderRadius: theme.layout.borderRadius,
        paddingHorizontal: 16,
        marginBottom: 16,
        fontSize: 16,
        color: theme.colors.dark,
        borderColor: theme.colors.border,
        borderWidth: 1,
    },
    primaryButton: {
        backgroundColor: theme.colors.primary,
        height: 48,
        borderRadius: theme.layout.buttonRadius,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: theme.typography.weights.medium as any,
    },
    secondaryButton: {
        height: 48,
        borderRadius: theme.layout.buttonRadius,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
        borderColor: theme.colors.primary,
        borderWidth: 1,
    },
    secondaryButtonText: {
        color: theme.colors.primary,
        fontSize: 16,
        fontWeight: theme.typography.weights.medium as any,
    }
});