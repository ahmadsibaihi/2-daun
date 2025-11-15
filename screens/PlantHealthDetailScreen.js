import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Card from '../components/Card';
import { colors, spacing, radius } from '../theme';

function Item({ icon, title, value, right }) {
  return (
    <Card style={{ marginTop: spacing.sm }}>
      <View style={styles.itemRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
          {icon}
          <View style={{ flex: 1 }}>
            <Text style={styles.itemTitle}>{title}</Text>
            <View style={styles.progressBg}><View style={[styles.progressBar, { width: right }]} /></View>
          </View>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.itemRight}>{value}</Text>
        </View>
      </View>
    </Card>
  );
}

export default function PlantHealthDetailScreen({ navigation }) {
  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 450, useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fade }]}> 
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[colors.primary, colors.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.headerGrad}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={22} color={'#fff'} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Detail Kesehatan Tanaman</Text>
            <View style={{ width: 36 }} />
          </View>
        </LinearGradient>

        <Item icon={<Ionicons name="leaf" color={colors.primary} size={22} />} title="Status Kesehatan Umum" value="Sehat 92%" right="92%" />
        <Item icon={<Ionicons name="trending-up" color={colors.primary} size={22} />} title="Tinggi Tanaman" value="11,875 mm" right="70%" />
        <Item icon={<Ionicons name="analytics" color={colors.primary} size={22} />} title="Pertumbuhan Daun" value="08 April" right="60%" />
        <Item icon={<Ionicons name="color-filter" color={colors.primary} size={22} />} title="Deteksi Warna Daun" value="7 j 31 m" right="80%" />
        <Item icon={<Ionicons name="sunny" color={colors.primary} size={22} />} title="Paparan Cahaya" value="68 KLux" right="50%" />
        <Item icon={<Ionicons name="beaker" color={colors.primary} size={22} />} title="Nutrisi AB-Mix" value="850 ppm" right="40%" />
        <Item icon={<Ionicons name="water" color={colors.primary} size={22} />} title="Level pH" value="6.2 pH" right="65%" />
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg },
  headerGrad: { borderRadius: radius.xl, overflow: 'hidden', marginBottom: spacing.lg },
  header: { height: 56, paddingHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#ffffff22', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontFamily: 'Inter_700Bold', fontSize: 16 },

  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemTitle: { fontFamily: 'Inter_600SemiBold', color: colors.text },
  progressBg: { height: 6, backgroundColor: '#e5e7eb', borderRadius: 3, marginTop: 6 },
  progressBar: { height: 6, backgroundColor: colors.primary, borderRadius: 3 },
  itemRight: { color: colors.textMuted, fontFamily: 'Inter_600SemiBold' },
});