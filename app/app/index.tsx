// app/index.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { router } from 'expo-router';
import { theme } from '../constants/theme';
import { supabase } from '../lib/supabase';
import AuthInput from '../components/AuthInput';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Ingresa tu correo y contraseña.');
            return;
        }
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });

        if (error) Alert.alert('Acceso Denegado', 'Usuario no registrado o contraseña incorrecta.');
        else Alert.alert('¡Bienvenido!', 'Conexión exitosa a Andes City.');

        setLoading(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>Iniciar sesión</Text>
                    <Text style={styles.subtitle}>Bienvenido de vuelta a Andes City</Text>
                </View>

                <AuthInput
                    label="Correo electrónico"
                    placeholder="tucorreo@ejemplo.com"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <AuthInput
                    label="Contraseña"
                    placeholder="••••••••"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <TouchableOpacity style={styles.primaryButton} onPress={handleLogin} disabled={loading}>
                    <Text style={styles.primaryButtonText}>{loading ? 'Conectando...' : 'Entrar'}</Text>
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
    primaryButton: { backgroundColor: theme.colors.primary, height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
    primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
    switchButton: { marginTop: 24, alignItems: 'center' },
    switchButtonText: { color: theme.colors.textMuted, fontSize: 14 }
});