import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>404 - Sayfa Bulunamadı</Text>
      <Link href="/" style={styles.link}>
        <Text style={styles.linkText}>Ana Sayfaya Dön</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  link: {
    marginTop: 8,
  },
  linkText: {
    color: '#007AFF',
    fontSize: 16,
  },
});
