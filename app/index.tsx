import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/context/AuthContext';

export default function HomeScreen() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to MiloKhelo</Text>
      <Text style={styles.subtitle}>Your Ultimate Sports Platform</Text>

      {isAuthenticated ? (
        <>
          <Text style={styles.welcomeText}>Hello, {user?.name}!</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/(main)/dashboard')}
          >
            <Text style={styles.buttonText}>Go to Dashboard</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={() => router.push('/(auth)/register')}
          >
            <Text style={[styles.buttonText, styles.buttonTextSecondary]}>Register</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#6200ee',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 40,
    color: '#666',
  },
  welcomeText: {
    fontSize: 20,
    marginBottom: 30,
    color: '#333',
  },
  button: {
    backgroundColor: '#6200ee',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 8,
    marginVertical: 10,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#6200ee',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonTextSecondary: {
    color: '#6200ee',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
});
