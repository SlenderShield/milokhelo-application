import { View, Text, StyleSheet } from 'react-native';

export default function TeamsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Teams Screen</Text>
      <Text style={styles.subtitle}>Browse and manage teams</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
  },
});
