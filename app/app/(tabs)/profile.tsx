import { View, Text, StyleSheet } from 'react-native';

export default function ProfileScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>4. PERFIL (EGO Y GAMIFICACIÓN)</Text>
            <Text>Aquí vendrán los badges y estadísticas nivel ciudadano en el PASO 5</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
    text: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' }
});
