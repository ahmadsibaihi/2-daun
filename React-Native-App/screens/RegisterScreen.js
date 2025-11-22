import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Card from '../components/Card';
import PrimaryButton from '../components/PrimaryButton';
import { colors, spacing, radius } from '../theme';

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ name: '', email: '', password: '' });
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 450, useNativeDriver: true }).start();
  }, []);

  const isEmailValid = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const handleRegister = () => {
    const nextErrors = { name: '', email: '', password: '' };
    if (!name || name.trim().length < 2) {
      nextErrors.name = 'Nama minimal 2 karakter.';
    }
    if (!email || !isEmailValid(email)) {
      nextErrors.email = 'Email tidak valid.';
    }
    if (!password || password.length < 6) {
      nextErrors.password = 'Password minimal 6 karakter.';
    }
    setErrors(nextErrors);
    const hasError = nextErrors.name || nextErrors.email || nextErrors.password;
    if (!hasError) {
      navigation.navigate('Login');
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: fade }]}> 
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[colors.primary, colors.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.headerGrad}>
          <View style={styles.headerRow}>
            <View style={styles.brandRow}>
              <Ionicons name="person-add" size={20} color={'#fff'} />
              <Text style={styles.brand}>Buat Akun</Text>
            </View>
            <Text style={styles.welcome}>Mulai Bertani 🌱</Text>
          </View>
        </LinearGradient>

        <Card>
          <Text style={styles.formTitle}>Registrasi</Text>

          <Text style={styles.label}>Username</Text>
          <TextInput
            placeholder="Your username"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            placeholder="Enter email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            placeholderTextColor={colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            placeholder="Enter password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            placeholderTextColor={colors.textMuted}
          />

          <PrimaryButton title="Buat Akun" onPress={handleRegister} style={{ marginTop: spacing.sm }} />
          <Text style={styles.bottomText}>Sudah punya akun?</Text>
          <PrimaryButton title="Masuk" onPress={() => navigation.navigate('Login')} style={{ marginTop: spacing.xs, backgroundColor: colors.secondary }} />
        </Card>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg },
  headerGrad: { borderRadius: radius.xl, overflow: 'hidden', marginBottom: spacing.lg },
  headerRow: { paddingHorizontal: spacing.lg, paddingVertical: spacing.lg, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brand: { color: '#fff', fontFamily: 'Inter_700Bold', fontSize: 18 },
  welcome: { color: '#fff', fontFamily: 'Inter_600SemiBold' },

  formTitle: { fontFamily: 'Inter_700Bold', color: colors.text, marginBottom: spacing.sm },
  label: { color: colors.textMuted, marginTop: spacing.sm, fontFamily: 'Inter_600SemiBold' },
  input: { backgroundColor: '#fff', borderRadius: radius.md, height: 42, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border, marginTop: 6, fontFamily: 'Inter_400Regular', color: colors.text },
  bottomText: { textAlign: 'center', color: colors.textMuted, marginTop: spacing.sm, fontFamily: 'Inter_400Regular' },
});