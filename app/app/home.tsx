// app/home.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';
import { theme } from '../constants/theme';

export default function HomeScreen() {

    const handleLogout = async () => {
        // Cerramos la sesión en la base de datos
        await supabase.auth.signOut();
        // Lo devolvemos a la pantalla de Login (borrando historial de navegación)
        router.replace('/' as any);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>🌆</Text>
                </View>
                <Text style={styles.title}>¡Bienvenido a Andes City!</Text>
                <Text style={styles.subtitle}>Has iniciado sesión correctamente.</Text>

                <View style={styles.card}>
                    <Text style={styles.cardText}>El Dashboard con el mapa y el clima omnisciente se construirá aquí 🚧</Text>
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Cerrar sesión</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
    avatarPlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
    avatarText: { fontSize: 40 },
    title: { fontSize: 28, fontWeight: 'bold', color: theme.colors.dark, textAlign: 'center' },
    subtitle: { fontSize: 16, color: theme.colors.textMuted, marginTop: 8, textAlign: 'center' },
    card: { backgroundColor: '#F8FAFC', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border, marginTop: 32, marginBottom: 32, width: '100%' },
    cardText: { fontSize: 14, color: theme.colors.dark, textAlign: 'center', fontStyle: 'italic' },
    logoutButton: { backgroundColor: '#EF4444', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 8, marginTop: 20 },
    logoutText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }
});