import { View, Text, StyleSheet } from 'react-native';

export default function DiscoverScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>3. DESCUBRE (HUB NEGOCIOS)</Text>
            <Text>Aquí vendrán las tarjetas comerciales con Geofencing en el PASO 4</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
    text: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' }
});
