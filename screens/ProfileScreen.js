import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, Image, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import PrimaryButton from '../components/PrimaryButton';
import Card from '../components/Card';
import Tag from '../components/Tag';
import { colors, spacing, radius, shadow } from '../theme';

export default function ProfileScreen({ navigation }) {
  const fade = useRef(new Animated.Value(0)).current;
  const [name, setName] = useState('Andika');
  const [email, setEmail] = useState('andika@example.com');
  const [location, setLocation] = useState('Bogor, Indonesia');
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(name);
  const [editEmail, setEditEmail] = useState(email);
  const [editLocation, setEditLocation] = useState(location);

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 450, useNativeDriver: true }).start();
  }, []);

  const startEdit = () => {
    setEditName(name);
    setEditEmail(email);
    setEditLocation(location);
    setEditing(true);
  };

  const saveEdit = () => {
    setName(editName.trim() || name);
    setEmail(editEmail.trim() || email);
    setLocation(editLocation.trim() || location);
    setEditing(false);
  };

  const cancelEdit = () => {
    setEditing(false);
  };

  return (
    <Animated.View style={[styles.container, { opacity: fade }]}> 
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header gradient dengan avatar */}
        <LinearGradient colors={[colors.primary, colors.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.headerGrad}>
          <View style={styles.headerInner}>
            <Image source={require('../assets/andika.jpg')} style={styles.avatar} />
            <View style={{ alignItems: 'center', marginTop: spacing.sm }}>
              <Text style={styles.name}>{name}</Text>
              <Text style={styles.role}>Greenhouse Owner</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Detail akun */}
        <Card style={{ marginTop: spacing.sm }}>
          <Text style={styles.sectionTitle}>Akun</Text>

          {editing ? (
            <>
              <Text style={styles.label}>Nama</Text>
              <TextInput
                value={editName}
                onChangeText={setEditName}
                style={styles.input}
                placeholder="Masukkan nama"
                placeholderTextColor={colors.textMuted}
              />

              <Text style={styles.label}>Email</Text>
              <TextInput
                value={editEmail}
                onChangeText={setEditEmail}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="Masukkan email"
                placeholderTextColor={colors.textMuted}
              />

              <Text style={styles.label}>Lokasi</Text>
              <TextInput
                value={editLocation}
                onChangeText={setEditLocation}
                style={styles.input}
                placeholder="Masukkan lokasi"
                placeholderTextColor={colors.textMuted}
              />
            </>
          ) : (
            <>
              <View style={styles.row}> 
                <Text style={styles.label}>Nama</Text>
                <Text style={styles.value}>{name}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.row}> 
                <Text style={styles.label}>Email</Text>
                <Text style={styles.value}>{email}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.row}> 
                <Text style={styles.label}>Lokasi</Text>
                <Text style={styles.value}>{location}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.row}> 
                <Text style={styles.label}>Greenhouse</Text>
                <Tag label="Greenhouse A" />
              </View>
            </>
          )}
        </Card>

        {/* Tombol aksi */}
        <View style={styles.actions}>
          {editing ? (
            <>
              <PrimaryButton title="Batal" onPress={cancelEdit} variant="outline" style={[styles.btnOutline, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]} textStyle={{ color: colors.primary, fontFamily: 'Inter_600SemiBold' }} />
              <PrimaryButton title="Simpan" onPress={saveEdit} style={styles.btnPrimary} />
            </>
          ) : (
            <>
              <PrimaryButton title="Edit Profil" onPress={startEdit} variant="outline" style={[styles.btnOutline, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]} textStyle={{ color: colors.primary, fontFamily: 'Inter_600SemiBold' }} />
              <PrimaryButton title="Keluar" onPress={() => navigation.navigate('Login')} style={styles.btnPrimary} />
            </>
          )}
        </View>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg },
  headerGrad: { borderRadius: radius.xl, overflow: 'hidden' },
  headerInner: { paddingHorizontal: spacing.lg, paddingVertical: spacing.lg, alignItems: 'center' },
  avatar: { width: 84, height: 84, borderRadius: 42, borderWidth: 2, borderColor: '#ffffff88', ...shadow.soft },
  name: { color: '#fff', fontFamily: 'Inter_700Bold', fontSize: 18 },
  role: { color: '#e6ffe6', fontFamily: 'Inter_400Regular', marginTop: 2 },

  sectionTitle: { fontSize: 16, color: colors.text, marginBottom: spacing.sm, fontFamily: 'Inter_600SemiBold' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  label: { color: colors.textMuted, fontFamily: 'Inter_400Regular' },
  value: { color: colors.text, fontFamily: 'Inter_600SemiBold' },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 6 },

  input: { backgroundColor: '#fff', borderRadius: radius.md, height: 42, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border, marginTop: 6, marginBottom: spacing.sm, fontFamily: 'Inter_400Regular', color: colors.text },

  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  btnOutline: { flex: 1 },
  btnPrimary: { flex: 1 },
});