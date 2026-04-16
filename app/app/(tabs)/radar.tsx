import { View, Text, StyleSheet } from 'react-native';

export default function RadarScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>2. RADAR (FEED CIUDADANO)</Text>
            <Text>Aquí vendrán las tarjetas animadas y los incidentes en el PASO 3</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
    text: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' }
});
