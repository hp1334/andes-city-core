// components/AuthInput.tsx
import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps, ViewStyle, StyleProp } from 'react-native';
import { theme } from '../constants/theme';

interface AuthInputProps extends TextInputProps {
    label: string;
    prefix?: string;
    mandatory?: boolean;
    wrapperStyle?: StyleProp<ViewStyle>; // <-- ¡Aquí está la magia para que TypeScript no moleste!
}

export default function AuthInput({ label, prefix, mandatory, wrapperStyle, ...props }: AuthInputProps) {
    return (
        <View style={[styles.container, wrapperStyle]}>
            {/* Solo renderizamos la fila del label si el label tiene texto */}
            {label !== "" && (
                <View style={styles.labelRow}>
                    <Text style={styles.label}>{label}</Text>
                    {mandatory && <Text style={styles.mandatoryStar}>*</Text>}
                </View>
            )}

            <View style={styles.inputWrapper}>
                {prefix && (
                    <View style={styles.prefixWrapper}>
                        <Text style={styles.prefixText}>{prefix}</Text>
                    </View>
                )}
                <TextInput
                    style={[styles.input, prefix ? styles.inputWithPrefix : null]}
                    placeholderTextColor={theme.colors.textMuted}
                    {...props}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginBottom: 16 },
    labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    label: { fontSize: 13, color: theme.colors.dark, fontWeight: '500' },
    mandatoryStar: { color: '#EF4444', marginLeft: 4, fontSize: 13 },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', height: 50, backgroundColor: '#F8FAFC', borderRadius: 8, borderColor: theme.colors.border, borderWidth: 1, overflow: 'hidden' },
    input: { flex: 1, paddingHorizontal: 16, color: theme.colors.dark, fontSize: 15, height: '100%' },
    inputWithPrefix: { paddingLeft: 8 },
    prefixWrapper: { paddingLeft: 16, justifyContent: 'center', alignItems: 'center', height: '100%' },
    prefixText: { fontSize: 15, color: theme.colors.textMuted, fontWeight: '600', top: 1 }
});