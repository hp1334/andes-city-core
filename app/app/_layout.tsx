// app/_layout.tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false, // Ocultamos el header por defecto para control total del diseño
                contentStyle: { backgroundColor: '#F8FAFC' } // Fondo base de la app
            }}
        >
            <Stack.Screen name="index" />
            {/* Aquí agregaremos las pantallas del dashboard más adelante */}
        </Stack>
    );
}