// app/index.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router'; // Importamos el router para la redirección
import { theme } from '../constants/theme';
import { supabase } from '../lib/supabase';
import AuthInput from '../components/AuthInput';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // ESTADO PARA EL ERROR EN TEXTO ROJO
    const [errorMsg, setErrorMsg] = useState('');

    const handleLogin = async () => {
        // 1. Limpiamos errores previos al intentar loguear
        setErrorMsg('');

        // 2. Validación de credenciales detectadas (Campos vacíos)
        if (!email || !password) {
            setErrorMsg('Por favor, ingresa tu correo y contraseña.');
            return;
        }

        setLoading(true);

        // 3. Llamada a la lógica de inicio de sesión con Supabase
        const { error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password
        });

        if (error) {
            // 4. Si Supabase devuelve error (Usuario no encontrado o clave mal), mostramos texto rojo
            setErrorMsg('Usuario no encontrado o credenciales incorrectas.');
        } else {
            // 5. ¡Éxito! Redirigimos al Dashboard del nuevo sistema de Tabs
            router.replace('/(tabs)' as any);
        }

        setLoading(false);
    };

    // Función para limpiar el error al escribir en los inputs
    const onTextChange = (setter: (text: string) => void, text: string) => {
        setter(text);
        if (errorMsg) setErrorMsg('');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>Iniciar sesión</Text>
                    <Text style={styles.subtitle}>Bienvenido de vuelta a Andes City</Text>
                </View>

                {/* Quitados los placeholders de ejemplo, ahora son limpios */}
                <AuthInput
                    label="Correo electrónico"
                    placeholder="tucorreo@ejemplo.com"
                    value={email}
                    onChangeText={(text) => onTextChange(setEmail, text)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <AuthInput
                    label="Contraseña"
                    placeholder="••••••••"
                    value={password}
                    onChangeText={(text) => onTextChange(setPassword, text)}
                    secureTextEntry
                />

                {/* AQUÍ APARECE EL TEXTO ROJO SI HAY ERROR */}
                {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

                <TouchableOpacity style={styles.primaryButton} onPress={handleLogin} disabled={loading}>
                    <Text style={styles.primaryButtonText}>
                        {loading ? 'Conectando...' : 'Entrar'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.switchButton} onPress={() => router.push('/register' as any)}>
                    <Text style={styles.switchButtonText}>¿No tienes cuenta? Regístrate aquí</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center' },
    content: { padding: 24 },
    header: { alignItems: 'center', marginBottom: 32 },
    title: { fontSize: 24, fontWeight: 'bold', color: theme.colors.dark },
    subtitle: { fontSize: 14, color: theme.colors.textMuted, marginTop: 4 },

    // ESTILO PARA EL TEXTO ROJO (Profesional y centrado)
    errorText: { color: '#EF4444', fontSize: 13, marginTop: -8, marginBottom: 12, textAlign: 'center', fontWeight: '500' },

    primaryButton: { backgroundColor: theme.colors.primary, height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
    primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
    switchButton: { marginTop: 24, alignItems: 'center' },
    switchButtonText: { color: theme.colors.textMuted, fontSize: 14 }
});