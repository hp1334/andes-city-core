// app/_layout.tsx
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler'; // Obligatorio para reanimated y bottom sheets

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Stack
                screenOptions={{
                    headerShown: false, // Ocultamos el header por defecto para control total del diseño
                    contentStyle: { backgroundColor: '#F8FAFC' } // Fondo base de la app
                }}
            >
                <Stack.Screen name="index" />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
        </GestureHandlerRootView>
    );
}