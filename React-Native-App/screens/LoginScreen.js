import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Card from '../components/Card';
import PrimaryButton from '../components/PrimaryButton';
import { colors, spacing, radius } from '../theme';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 450, useNativeDriver: true }).start();
  }, []);

  const isEmailValid = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const handleLogin = () => {
    const nextErrors = { email: '', password: '' };
    if (!email || !isEmailValid(email)) {
      nextErrors.email = 'Email tidak valid.';
    }
    if (!password || password.length < 6) {
      nextErrors.password = 'Password minimal 6 karakter.';
    }
    setErrors(nextErrors);
    const hasError = nextErrors.email || nextErrors.password;
    if (!hasError) {
      navigation.navigate('MainTabs');
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: fade }]}> 
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[colors.primary, colors.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.headerGrad}>
          <View style={styles.headerRow}>
            <View style={styles.brandRow}>
              <Ionicons name="leaf" size={22} color={'#fff'} />
              <Text style={styles.brand}>Dua Daun</Text>
            </View>
            <Text style={styles.welcome}>Welcome ✨</Text>
          </View>
        </LinearGradient>

        <Card>
          <Text style={styles.formTitle}>Masuk</Text>

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
          {errors.email ? (
            <Text style={{ color: colors.danger, fontFamily: 'Inter_500Medium', marginTop: 4 }}>{errors.email}</Text>
          ) : null}

          <Text style={styles.label}>Password</Text>
          <TextInput
            placeholder="Enter password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            placeholderTextColor={colors.textMuted}
          />
          {errors.password ? (
            <Text style={{ color: colors.danger, fontFamily: 'Inter_500Medium', marginTop: 4 }}>{errors.password}</Text>
          ) : null}

          <PrimaryButton title="Masuk" onPress={handleLogin} style={{ marginTop: spacing.md }} />
          <Text style={styles.bottomText}>Belum punya akun?</Text>
          <PrimaryButton title="Buat Akun" onPress={() => navigation.navigate('Register')} style={{ marginTop: spacing.xs, backgroundColor: colors.secondary }} />
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