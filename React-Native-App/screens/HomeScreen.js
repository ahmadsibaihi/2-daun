import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Card from '../components/Card';
import Tag from '../components/Tag';
import { colors, spacing, radius, shadow } from '../theme';

export default function HomeScreen({ navigation }) {
  const [autoMonitor, setAutoMonitor] = useState(true);
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 450, useNativeDriver: true }).start();
  }, []);

  const today = new Date();
  const dateStr = today.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <Animated.View style={[styles.container, { opacity: fade }]}> 
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greet}>Halo 👋</Text>
            <Text style={styles.date}>{dateStr}</Text>
          </View>
          <Tag label="Greenhouse A" />
        </View>

        <LinearGradient colors={[colors.primary, colors.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.healthCard}>
          <View style={styles.healthRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.healthTitle}>Kesehatan Tanaman</Text>
              <Text style={styles.healthSub}>Pemantauan otomatis aktif</Text>
            </View>
            <Switch value={autoMonitor} onValueChange={setAutoMonitor} thumbColor="#fff" trackColor={{ true: '#b7e4c7', false: '#ced4da' }} />
          </View>
          <View style={styles.healthBottom}>
            <TouchableOpacity onPress={() => navigation.navigate('PlantHealthDetail')} style={styles.moreBtn}>
              <Text style={styles.moreText}>Kesehatan Tanaman ›</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('HydroMonitor')} style={[styles.moreBtn, { marginLeft: 12 }]}>
              <Text style={styles.moreText}>Grafik Nutrisi ›</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <Text style={styles.sectionTitle}>Kondisi Tanaman</Text>
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <View style={styles.statTop}>
              <Ionicons name="water" size={20} color={colors.primary} />
              <Text style={styles.statLabel}>Kelembaban</Text>
            </View>
            <Text style={styles.statValue}>68%</Text>
          </Card>
          <Card style={styles.statCard}>
            <View style={styles.statTop}>
              <Ionicons name="thermometer" size={20} color={colors.primary} />
              <Text style={styles.statLabel}>Suhu</Text>
            </View>
            <Text style={styles.statValue}>26°C</Text>
          </Card>
          <Card style={styles.statCard}>
            <View style={styles.statTop}>
              <Ionicons name="sunny" size={20} color={colors.primary} />
              <Text style={styles.statLabel}>Cahaya</Text>
            </View>
            <Text style={styles.statValue}>78%</Text>
          </Card>
          <Card style={styles.statCard}>
            <View style={styles.statTop}>
              <Ionicons name="leaf" size={20} color={colors.primary} />
              <Text style={styles.statLabel}>Nutrisi</Text>
            </View>
            <Text style={styles.statValue}>Baik</Text>
          </Card>
        </View>

        <Text style={styles.sectionTitle}>Report Minggu Ini</Text>
        <Card style={{ marginTop: spacing.sm }}>
          <View style={styles.reportRow}>
            <Text style={styles.reportLabel}>Penyiraman</Text>
            <Text style={styles.reportValue}>5x</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.reportRow}>
            <Text style={styles.reportLabel}>Pemupukan</Text>
            <Text style={styles.reportValue}>2x</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.reportRow}>
            <Text style={styles.reportLabel}>Panen</Text>
            <Text style={styles.reportValue}>1x</Text>
          </View>
        </Card>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  greet: { fontSize: 20, color: colors.text, fontFamily: 'Inter_700Bold' },
  date: { fontSize: 14, color: colors.textMuted, marginTop: 4, fontFamily: 'Inter_400Regular' },

  healthCard: { borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.lg, ...shadow.card },
  healthRow: { flexDirection: 'row', alignItems: 'center' },
  healthTitle: { color: '#fff', fontSize: 18, fontFamily: 'Inter_700Bold' },
  healthSub: { color: '#e6ffe6', marginTop: 4, fontFamily: 'Inter_400Regular' },
  healthBottom: { marginTop: spacing.md, flexDirection: 'row', justifyContent: 'flex-end' },
  moreBtn: { backgroundColor: '#ffffff22', paddingVertical: 8, paddingHorizontal: 12, borderRadius: radius.round },
  moreText: { color: '#fff', fontFamily: 'Inter_600SemiBold' },

  sectionTitle: { fontSize: 16, color: colors.text, marginBottom: spacing.sm, fontFamily: 'Inter_600SemiBold' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  statCard: { width: '48%' },
  statTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statLabel: { marginLeft: 8, color: colors.textMuted, fontFamily: 'Inter_600SemiBold' },
  statValue: { marginTop: spacing.sm, fontSize: 18, color: colors.text, fontFamily: 'Inter_700Bold' },

  reportRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  reportLabel: { color: colors.textMuted, fontFamily: 'Inter_400Regular' },
  reportValue: { color: colors.text, fontFamily: 'Inter_600SemiBold' },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 6 },
});