// app/register.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { theme } from '../constants/theme';
import { supabase } from '../lib/supabase';
import AuthInput from '../components/AuthInput';

export default function RegisterScreen() {
    const [loading, setLoading] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleRegister = async () => {
        if (!email || !password || !username || !firstName) {
            Alert.alert('Error', 'Llena los campos obligatorios.');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Las contraseñas no coinciden.');
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.signUp({
            email: email.trim(),
            password: password,
            options: {
                data: { username: username.trim(), first_name: firstName, last_name: lastName, phone: phone }
            }
        });

        if (error) {
            Alert.alert('Error al registrar', error.message);
        } else {
            Alert.alert('¡Cuenta Creada!', 'Registro exitoso. Ahora puedes iniciar sesión.');
            router.back(); // Regresa a la pantalla de Login
        }
        setLoading(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>

                <View style={styles.header}>
                    <Text style={styles.title}>Crear cuenta</Text>
                    <Text style={styles.subtitle}>Únete a la movilidad inteligente</Text>
                </View>

                <View style={styles.row}>
                    <View style={{ flex: 1, marginRight: 8 }}><AuthInput label="Nombre" placeholder="Juan" value={firstName} onChangeText={setFirstName} /></View>
                    <View style={{ flex: 1 }}><AuthInput label="Apellido" placeholder="Pérez" value={lastName} onChangeText={setLastName} /></View>
                </View>

                <AuthInput label="Usuario" placeholder="@juanp" value={username} onChangeText={setUsername} autoCapitalize="none" />
                <AuthInput label="Correo" placeholder="correo@ejemplo.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
                <AuthInput label="Teléfono" placeholder="099 000 0000" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
                <AuthInput label="Contraseña" placeholder="Mín. 6 caracteres" value={password} onChangeText={setPassword} secureTextEntry />
                <AuthInput label="Confirmar" placeholder="Repite contraseña" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />

                <TouchableOpacity style={styles.primaryButton} onPress={handleRegister} disabled={loading}>
                    <Text style={styles.primaryButtonText}>{loading ? 'Procesando...' : 'Crear mi cuenta'}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.switchButton} onPress={() => router.back()}>
                    <Text style={styles.switchButtonText}>¿Ya tienes cuenta? Inicia sesión</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    scrollContainer: { flexGrow: 1, padding: 24, justifyContent: 'center' },
    header: { alignItems: 'center', marginBottom: 32, marginTop: 20 },
    title: { fontSize: 24, fontWeight: 'bold', color: theme.colors.dark },
    subtitle: { fontSize: 14, color: theme.colors.textMuted, marginTop: 4 },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    primaryButton: { backgroundColor: theme.colors.primary, height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
    primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
    switchButton: { marginTop: 24, alignItems: 'center', marginBottom: 40 },
    switchButtonText: { color: theme.colors.textMuted, fontSize: 14 }
});