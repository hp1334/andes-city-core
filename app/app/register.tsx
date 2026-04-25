import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Modal, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { theme } from '../constants/theme';
import { supabase } from '../lib/supabase';
import AuthInput from '../components/AuthInput';

const COUNTRIES = [
    { id: 'EC', name: 'Ecuador', code: '+593', flag: '🇪🇨', length: 9 },
    { id: 'CO', name: 'Colombia', code: '+57', flag: '🇨🇴', length: 10 },
    { id: 'PE', name: 'Perú', code: '+51', flag: '🇵🇪', length: 9 },
];

export default function RegisterScreen() {
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
    const [formattedPhone, setFormattedPhone] = useState('');
    const [rawPhone, setRawPhone] = useState('');
    const [isCountryModalVisible, setIsCountryModalVisible] = useState(false);

    const [usernameError, setUsernameError] = useState('');
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);

    // NUEVO: Estado para el error de correo en tiempo real
    const [emailError, setEmailError] = useState('');

    const handlePhoneChange = (text: string) => {
        let cleaned = text.replace(/\D/g, '');
        if (cleaned.startsWith('0')) cleaned = cleaned.substring(1);
        cleaned = cleaned.substring(0, selectedCountry.length);
        setRawPhone(cleaned);

        let formatted = cleaned.match(/.{1,3}/g)?.join(' ') || cleaned;
        setFormattedPhone(formatted);
        clearMainError();
    };

    // ==========================================
    // LÓGICA: FILTRO INTELIGENTE DE CORREO
    // ==========================================
    const handleEmailChange = (text: string) => {
        setEmail(text);
        clearMainError();

        if (text.trim() === '') {
            setEmailError('');
            return;
        }

        // 1. Validar formato estricto (que tenga @ y .)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(text)) {
            setEmailError('Formato de correo inválido');
            return;
        }

        // 2. Detector de errores de tipeo comunes
        const parts = text.split('@');
        if (parts.length === 2) {
            const domain = parts[1].toLowerCase();
            const commonTypos: { [key: string]: string } = {
                'gamil.com': 'gmail.com',
                'gmai.com': 'gmail.com',
                'gimal.com': 'gmail.com',
                'hotmial.com': 'hotmail.com',
                'homail.com': 'hotmail.com',
                'outlok.com': 'outlook.com',
                'yahho.com': 'yahoo.com'
            };

            if (commonTypos[domain]) {
                setEmailError(`¿Quisiste decir @${commonTypos[domain]}?`);
                return;
            }
        }

        // Si todo está bien, borramos el error
        setEmailError('');
    };

    useEffect(() => {
        if (!username.trim()) { setUsernameError(''); return; }
        setIsCheckingUsername(true);
        setUsernameError('');
        const delayDebounceFn = setTimeout(async () => {
            const { data } = await supabase.from('users').select('username').eq('username', username.trim()).single();
            if (data) setUsernameError('Este usuario ya está en uso.');
            setIsCheckingUsername(false);
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [username]);

    const handleRegister = async () => {
        setErrorMsg('');
        setSuccessMsg('');

        if (!firstName.trim() || !lastName.trim() || !username.trim() || !email.trim() || !rawPhone || !password) {
            setErrorMsg('Por favor llena todos los campos obligatorios.');
            return;
        }

        if (emailError) {
            setErrorMsg('Por favor corrige el error en tu correo electrónico.');
            return;
        }

        if (rawPhone.length !== selectedCountry.length) {
            setErrorMsg(`El teléfono para ${selectedCountry.name} debe tener ${selectedCountry.length} dígitos (sin el 0).`);
            return;
        }

        if (password.length < 6) {
            setErrorMsg('La contraseña requiere al menos 6 caracteres.');
            return;
        }

        if (password !== confirmPassword) {
            setErrorMsg('Las contraseñas no coinciden.');
            return;
        }

        if (usernameError) {
            setErrorMsg('Elige un nombre de usuario diferente.');
            return;
        }

        setLoading(true);

        const fullPhoneNumber = `${selectedCountry.code}${rawPhone}`;

        const { error } = await supabase.auth.signUp({
            email: email.trim(),
            password: password,
            options: {
                data: {
                    username: username.trim(),
                    first_name: firstName.trim(),
                    last_name: lastName.trim(),
                    phone: fullPhoneNumber
                }
            }
        });

        if (error) {
            setErrorMsg('Hubo un error al registrar la cuenta: ' + error.message);
        } else {
            setSuccessMsg('¡Cuenta creada con éxito!');
            setTimeout(() => router.back(), 1500);
        }
        setLoading(false);
    };

    const clearMainError = () => { if (errorMsg) setErrorMsg(''); if (successMsg) setSuccessMsg(''); };

    const renderCountryItem = ({ item }: { item: typeof COUNTRIES[0] }) => (
        <TouchableOpacity
            style={styles.countryModalItem}
            onPress={() => {
                setSelectedCountry(item);
                setFormattedPhone('');
                setRawPhone('');
                setIsCountryModalVisible(false);
            }}
        >
            <Text style={styles.countryModalFlag}>{item.flag}</Text>
            <Text style={styles.countryModalCode}>{item.code}</Text>
            <Text style={styles.countryModalName}>{item.name}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>

                <View style={styles.header}>
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>
                            {firstName ? firstName.substring(0, 1).toUpperCase() : lastName ? lastName.substring(0, 1).toUpperCase() : 'N'}
                        </Text>
                    </View>
                    <Text style={styles.title}>Crear cuenta</Text>
                    <Text style={styles.subtitle}>Únete a la movilidad inteligente de Andes City</Text>
                </View>

                <View style={styles.row}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                        <AuthInput label="Nombre" placeholder="Juan" value={firstName} onChangeText={(t) => { setFirstName(t); clearMainError(); }} mandatory />
                    </View>
                    <View style={{ flex: 1 }}>
                        <AuthInput label="Apellido" placeholder="Pérez" value={lastName} onChangeText={(t) => { setLastName(t); clearMainError(); }} mandatory />
                    </View>
                </View>

                <View style={{ position: 'relative' }}>
                    <AuthInput
                        label="Nombre de usuario"
                        placeholder="juanperez"
                        value={username}
                        prefix="@"
                        onChangeText={(t) => { setUsername(t); clearMainError(); }}
                        autoCapitalize="none"
                        mandatory
                    />
                    {isCheckingUsername && <ActivityIndicator size="small" color={theme.colors.primary} style={styles.inputIcon} />}
                    {usernameError ? <Text style={styles.fieldErrorText}>{usernameError}</Text> : null}
                </View>

                {/* INPUT DE CORREO INTELIGENTE */}
                <View style={{ position: 'relative' }}>
                    <AuthInput
                        label="Correo electrónico"
                        placeholder="correo@ejemplo.com"
                        value={email}
                        onChangeText={handleEmailChange}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        mandatory
                    />
                    {emailError ? <Text style={styles.fieldErrorText}>{emailError}</Text> : null}
                </View>

                <View style={styles.phoneSection}>
                    <View style={styles.labelRow}>
                        <Text style={styles.label}>Celular</Text>
                        <Text style={styles.mandatoryStar}>*</Text>
                    </View>

                    <View style={styles.phoneInputRow}>
                        <TouchableOpacity style={styles.countrySelector} onPress={() => setIsCountryModalVisible(true)}>
                            <Text style={styles.countryFlag}>{selectedCountry.flag}</Text>
                            <Text style={styles.countryCode}>{selectedCountry.code}</Text>
                            <Text style={styles.dropdownIcon}>▼</Text>
                        </TouchableOpacity>

                        <AuthInput
                            label=""
                            placeholder="99 123 4567"
                            value={formattedPhone}
                            onChangeText={handlePhoneChange}
                            keyboardType="phone-pad"
                            wrapperStyle={styles.phoneInputBody}
                            maxLength={selectedCountry.length + 3}
                        />
                    </View>
                    <Text style={styles.helpText}>Ingresa el número sin el &apos;0&apos; inicial.</Text>
                </View>

                <AuthInput label="Contraseña" placeholder="••••••••" value={password} onChangeText={(t) => { setPassword(t); clearMainError(); }} secureTextEntry mandatory />
                <AuthInput label="Confirmar contraseña" placeholder="••••••••" value={confirmPassword} onChangeText={(t) => { setConfirmPassword(t); clearMainError(); }} secureTextEntry mandatory />

                {errorMsg ? <View style={styles.errorBox}><Text style={styles.mainErrorText}>{errorMsg}</Text></View> : null}
                {successMsg ? <Text style={styles.successText}>{successMsg}</Text> : null}

                <TouchableOpacity style={[styles.primaryButton, (loading || isCheckingUsername) && styles.primaryButtonDisabled]} onPress={handleRegister} disabled={loading || isCheckingUsername}>
                    {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryButtonText}>Crear mi cuenta</Text>}
                </TouchableOpacity>

                <TouchableOpacity style={styles.switchButton} onPress={() => router.back()} disabled={loading}>
                    <Text style={styles.switchButtonText}>¿Ya tienes cuenta? Inicia sesión</Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />

            </ScrollView>

            <Modal visible={isCountryModalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Selecciona tu país</Text>
                            <TouchableOpacity onPress={() => setIsCountryModalVisible(false)} style={styles.closeButton}>
                                <Text style={styles.closeButtonText}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={COUNTRIES}
                            keyExtractor={(item) => item.id}
                            renderItem={renderCountryItem}
                            contentContainerStyle={styles.modalList}
                        />
                    </View>
                </View>
            </Modal>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    scrollContainer: { flexGrow: 1, padding: 24 },
    header: { alignItems: 'center', marginBottom: 32, marginTop: 10 },
    avatarPlaceholder: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center', marginBottom: 16, borderColor: theme.colors.border, borderWidth: 1 },
    avatarText: { fontSize: 28, color: theme.colors.primary, fontWeight: 'bold' },
    title: { fontSize: 26, fontWeight: 'bold', color: theme.colors.dark },
    subtitle: { fontSize: 14, color: theme.colors.textMuted, marginTop: 6, textAlign: 'center', paddingHorizontal: 10 },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    label: { fontSize: 13, color: theme.colors.dark, fontWeight: '500' },
    mandatoryStar: { color: '#EF4444', marginLeft: 4, fontSize: 13 },
    inputIcon: { position: 'absolute', right: 12, top: 40 },
    fieldErrorText: { color: '#EF4444', fontSize: 12, marginTop: -12, marginBottom: 12, marginLeft: 4 },
    phoneSection: { marginBottom: 16 },
    phoneInputRow: { flexDirection: 'row', alignItems: 'center' },
    countrySelector: { flexDirection: 'row', alignItems: 'center', height: 50, backgroundColor: '#F1F5F9', borderRadius: 8, borderColor: theme.colors.border, borderWidth: 1, paddingHorizontal: 12, marginRight: 8 },
    countryFlag: { fontSize: 20 },
    countryCode: { fontSize: 15, color: theme.colors.dark, fontWeight: '600', marginLeft: 6 },
    dropdownIcon: { fontSize: 10, color: theme.colors.textMuted, marginLeft: 6 },
    phoneInputBody: { flex: 1, marginBottom: 0 },
    helpText: { fontSize: 12, color: theme.colors.textMuted, marginTop: 4, marginLeft: 4 },
    errorBox: { backgroundColor: '#FEE2E2', padding: 12, borderRadius: 8, marginBottom: 16 },
    mainErrorText: { color: '#B91C1C', fontSize: 13, textAlign: 'center', fontWeight: '500' },
    successText: { color: '#10B981', fontSize: 14, marginBottom: 16, textAlign: 'center', fontWeight: 'bold' },
    primaryButton: { backgroundColor: theme.colors.primary, height: 55, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 10, shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 2 },
    primaryButtonDisabled: { opacity: 0.6 },
    primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
    switchButton: { marginTop: 24, alignItems: 'center' },
    switchButtonText: { color: theme.colors.textMuted, fontSize: 14 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, height: '50%', padding: 20 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.dark },
    closeButton: { padding: 4 },
    closeButtonText: { fontSize: 18, color: theme.colors.textMuted },
    modalList: { paddingBottom: 20 },
    countryModalItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    countryModalFlag: { fontSize: 24 },
    countryModalCode: { fontSize: 16, color: theme.colors.dark, fontWeight: '600', marginLeft: 12, width: 60 },
    countryModalName: { fontSize: 16, color: theme.colors.dark, flex: 1 },
});