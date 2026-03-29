import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { theme } from '../constants/theme';

interface AuthInputProps extends TextInputProps {
    label: string;
}

export default function AuthInput({ label, ...props }: AuthInputProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                style={styles.input}
                placeholderTextColor={theme.colors.textMuted}
                {...props}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginBottom: 16 },
    label: { fontSize: 13, color: theme.colors.dark, marginBottom: 8, fontWeight: '500' },
    input: {
        height: 50, backgroundColor: '#F8FAFC', borderRadius: 8,
        paddingHorizontal: 16, borderColor: theme.colors.border,
        borderWidth: 1, color: theme.colors.dark
    },
});