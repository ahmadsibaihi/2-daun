import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Card from '../components/Card';
import Tag from '../components/Tag';
import { colors, spacing, radius, shadow } from '../theme';
import { Svg, Path, Line, Rect, Circle, Text as SvgText, Defs, ClipPath, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';

function Chip({ label, active, onPress, style }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.chip, active ? styles.chipActive : null, style]}>
      <Text style={[styles.chipText, active ? styles.chipTextActive : null]}>{label}</Text>
    </TouchableOpacity>
  );
}

function Chart({ data, yDomain, color = colors.accent, height = 240, padding = 20, labels = [], width: chartWidthProp = 320 }) {
  const width = chartWidthProp
  const innerW = width - padding * 2
  const innerH = height - padding * 2

  const { min: yMin, max: yMax, targetLow, targetHigh } = yDomain
  const xStep = innerW / (data.length - 1)
  const points = data.map((v, i) => {
    const x = padding + i * xStep
    const y = padding + innerH - ((v - yMin) / (yMax - yMin)) * innerH
    return { x, y, v }
  })

  // Smooth path (cubic bezier)
  const makeSmoothPath = (pts) => {
    if (!pts.length) return ''
    let d = `M ${pts[0].x} ${pts[0].y}`
    for (let i = 1; i < pts.length; i++) {
      const p0 = pts[i - 1]
      const p1 = pts[i]
      const cx = p0.x + (p1.x - p0.x) / 2
      const c1x = cx, c1y = p0.y
      const c2x = cx, c2y = p1.y
      d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p1.x} ${p1.y}`
    }
    return d
  }

  const pathD = makeSmoothPath(points)
  const areaD = `${pathD} L ${padding + innerW} ${padding + innerH} L ${padding} ${padding + innerH} Z`

  const gridCount = 4
  const gridGap = innerH / gridCount

  // fewer x labels to avoid crowding
  const step = Math.ceil(labels.length / 4)
  const labelIndices = labels.map((_, i) => i).filter((i) => i % step === 0)

  const [hoverIdx, setHoverIdx] = useState(null)
  const anim = useRef(new Animated.Value(0)).current
  const sweep = useRef(new Animated.Value(0)).current
  const fadePath = useRef(new Animated.Value(0)).current
  const AnimatedRect = Animated.createAnimatedComponent(Rect)
  const AnimatedCircle = Animated.createAnimatedComponent(Circle)
  const pulse = useRef(new Animated.Value(0)).current

  useEffect(() => {
    anim.setValue(0)
    fadePath.setValue(0)
    Animated.timing(anim, { toValue: 1, duration: 800, useNativeDriver: false }).start()
    Animated.timing(fadePath, { toValue: 1, duration: 400, useNativeDriver: true }).start()
  }, [pathD])

  useEffect(() => {
    sweep.setValue(0)
    Animated.loop(Animated.timing(sweep, { toValue: 1, duration: 2500, useNativeDriver: false })).start()
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1000, useNativeDriver: false }),
        Animated.timing(pulse, { toValue: 0, duration: 1000, useNativeDriver: false }),
      ])
    ).start()
  }, [])

  const clipW = anim.interpolate({ inputRange: [0, 1], outputRange: [0, innerW] })
  const sweepX = sweep.interpolate({ inputRange: [0, 1], outputRange: [padding, padding + innerW] })
  const pulsedR = pulse.interpolate({ inputRange: [0, 1], outputRange: [4, 8] })
  // Tambahkan definisi titik terakhir agar animasi pulse tidak error
  const last = points[points.length - 1]

  const handleMove = (e) => {
    const x = e.nativeEvent.locationX
    const localX = Math.max(padding, Math.min(padding + innerW, x))
    const idx = Math.round((localX - padding) / xStep)
    setHoverIdx(Math.max(0, Math.min(points.length - 1, idx)))
  }
  const handleRelease = () => setHoverIdx(null)

  const tooltip = hoverIdx !== null ? {
    x: points[hoverIdx].x,
    y: points[hoverIdx].y,
    v: points[hoverIdx].v,
    label: labels[hoverIdx]
  } : null

  const tooltipLeft = tooltip ? Math.min(Math.max(tooltip.x - 40, padding), padding + innerW - 80) : 0
  const tooltipTop = tooltip ? Math.max(tooltip.y - 34, padding) : 0

  return (
    <View style={{ width, height, position: 'relative' }}>
      <Animated.View style={{ opacity: fadePath }}>
        <Svg height={height} width={width}>
          {/* background */}
          <Rect x={0} y={0} width={width} height={height} rx={12} fill={colors.primary} />

          <Defs>
            <ClipPath id="clip">
              <AnimatedRect x={padding} y={padding} height={innerH} width={clipW} />
            </ClipPath>
            <ClipPath id="sweep">
              <AnimatedRect x={sweepX} y={padding} height={innerH} width={40} />
            </ClipPath>
            {/* gradients */}
            <SvgLinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#b7e4c7" stopOpacity={0.35} />
              <Stop offset="100%" stopColor="#b7e4c7" stopOpacity={0.1} />
            </SvgLinearGradient>
            <SvgLinearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0%" stopColor="#e6ffe6" />
              <Stop offset="100%" stopColor="#cfead9" />
            </SvgLinearGradient>
          </Defs>

          {/* grid horiz */}
          {[...Array(gridCount + 1)].map((_, idx) => (
            <Line key={`gh-${idx}`} x1={padding} x2={padding + innerW} y1={padding + idx * gridGap} y2={padding + idx * gridGap} stroke={'#ffffff2d'} strokeWidth={1} />
          ))}
          {/* grid vert */}
          {labelIndices.map((li, i) => (
            <Line key={`gv-${i}`} x1={padding + li * xStep} x2={padding + li * xStep} y1={padding} y2={padding + innerH} stroke={'#ffffff1f'} strokeWidth={1} />
          ))}

          {/* labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
            <SvgText key={`yl-${i}`} x={padding - 8} y={padding + innerH - t * innerH} fill={'#ffffffbb'} fontSize={10} textAnchor="end" alignmentBaseline="middle">
              {Math.round((yMin + t * (yMax - yMin)) * 100) / 100}
            </SvgText>
          ))}
          {labelIndices.map((li, i) => (
            <SvgText key={`xl-${i}`} x={padding + li * xStep} y={padding + innerH + 14} fill={'#ffffffbb'} fontSize={10} textAnchor="middle">
              {labels[li]}
            </SvgText>
          ))}

          {/* target band */}
          <Rect x={padding} width={innerW} y={padding + innerH - ((targetHigh - yMin) / (yMax - yMin)) * innerH} height={((targetHigh - targetLow) / (yMax - yMin)) * innerH} fill={'url(#areaGrad)'} />

          {/* area + line */}
          <Path d={areaD} fill={'url(#areaGrad)'} clipPath="url(#clip)" />
          <Path d={pathD} stroke={'url(#lineGrad)'} strokeWidth={2} fill="none" clipPath="url(#clip)" />

          {/* sweep glow overlay */}
          <Path d={pathD} stroke={'#ffffff'} strokeWidth={3} strokeOpacity={0.25} fill="none" clipPath="url(#sweep)" />

          {/* points */}
          {points.map((p, i) => (
            <Circle key={`p-${i}`} cx={p.x} cy={p.y} r={2.5} fill={'#fff'} clipPath="url(#clip)" />
          ))}

          {/* pulse at last point */}
          <AnimatedCircle cx={last.x} cy={last.y} r={pulsedR} fill={'#b7e4c744'} />
          <Circle cx={last.x} cy={last.y} r={3} fill={'#fff'} />

          {/* crosshair */}
          {hoverIdx !== null && (
            <>
              <Line x1={padding + hoverIdx * xStep} x2={padding + hoverIdx * xStep} y1={padding} y2={padding + innerH} stroke={'#ffffff55'} strokeWidth={1} />
              <Circle cx={points[hoverIdx].x} cy={points[hoverIdx].y} r={4} fill={'#fff'} />
            </>
          )}
        </Svg>
      </Animated.View>
      {/* touch layer */}
      <View
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
        onStartShouldSetResponder={() => true}
        onResponderMove={handleMove}
        onResponderRelease={handleRelease}
        onResponderTerminate={handleRelease}
      />
      {/* tooltip overlay */}
      {tooltip && (
        <View style={{ position: 'absolute', left: tooltipLeft, top: tooltipTop, backgroundColor: '#163a24', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 10 }}>
          <Text style={{ color: '#fff', fontFamily: 'Inter_700Bold', fontSize: 12 }}>{`${tooltip.v}`}</Text>
          {tooltip.label ? <Text style={{ color: '#cde7d8', fontFamily: 'Inter_500Medium', fontSize: 10 }}>{tooltip.label}</Text> : null}
        </View>
      )}
    </View>
  )
}

export default function HydroMonitorScreen({ navigation }) {
  const fade = useRef(new Animated.Value(0)).current;
  const [autoMode, setAutoMode] = useState(true);
  const [metric, setMetric] = useState('ec'); // ph | ec | temp
  const [timeRange, setTimeRange] = useState('week'); // hour | day | week
  const [chartW, setChartW] = useState(null)

  const makeData = () => {
    if (metric === 'ph') {
      const yDomain = { min: 5.5, max: 7.2, targetLow: 6.0, targetHigh: 6.5 };
      const src = timeRange === 'hour' ? [6.1, 6.2, 6.25, 6.3, 6.35, 6.3] : timeRange === 'day' ? [6.2, 6.1, 6.3, 6.35, 6.25, 6.4, 6.3, 6.2] : [6.1, 6.2, 6.35, 6.3, 6.25, 6.4, 6.28];
      const labels = timeRange === 'hour' ? ['-50m', '-40m', '-30m', '-20m', '-10m', 'Now'] : timeRange === 'day' ? ['06', '09', '12', '15', '18', '21', '00', '03'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      return { data: src, yDomain: { ...yDomain }, labels };
    }
    if (metric === 'ec') {
      const yDomain = { min: 1.2, max: 2.6, targetLow: 1.8, targetHigh: 2.2 };
      const src = timeRange === 'hour' ? [2.0, 2.05, 2.1, 2.15, 2.1, 2.08] : timeRange === 'day' ? [1.9, 2.0, 2.1, 2.2, 2.15, 2.1, 2.05, 2.0] : [1.85, 1.95, 2.05, 2.2, 2.15, 2.0, 1.95];
      const labels = timeRange === 'hour' ? ['-50m', '-40m', '-30m', '-20m', '-10m', 'Now'] : timeRange === 'day' ? ['06', '09', '12', '15', '18', '21', '00', '03'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      return { data: src, yDomain: { ...yDomain }, labels };
    }
    const yDomain = { min: 20, max: 32, targetLow: 24, targetHigh: 28 };
    const src = timeRange === 'hour' ? [26, 26.5, 27, 26.8, 27.2, 27] : timeRange === 'day' ? [25, 26, 27, 28, 27, 26, 25, 24.5] : [24, 25.5, 27, 28.5, 27.5, 26, 25];
    const labels = timeRange === 'hour' ? ['-50m', '-40m', '-30m', '-20m', '-10m', 'Now'] : timeRange === 'day' ? ['06', '09', '12', '15', '18', '21', '00', '03'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return { data: src, yDomain: { ...yDomain }, labels };
  };

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 450, useNativeDriver: true }).start();
  }, []);

  const { data, yDomain, labels } = makeData();

  return (
    <Animated.View style={[styles.container, { opacity: fade }]}> 
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={[colors.primary, colors.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.headerGrad}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={22} color={'#fff'} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Grafik Nutrisi</Text>
            <View style={{ width: 36 }} />
          </View>
        </LinearGradient>

        {/* Panel kontrol */}
        <Card>
          <View style={styles.controlRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="hardware-chip-outline" size={18} color={colors.primary} />
              <Text style={styles.controlTitle}>Mode Otomatis</Text>
            </View>
            <Switch value={autoMode} onValueChange={setAutoMode} thumbColor="#fff" trackColor={{ true: '#b7e4c7', false: '#ced4da' }} />
          </View>
          <View style={styles.tagsRow}>
            <Tag label="Target pH 6.0 - 6.5" color={colors.primary} />
            <Tag label="Target EC 1.8 - 2.2" color={colors.primary} style={{ marginLeft: 8 }} />
            <Tag label="Interval Cek 30 detik" color={colors.secondary} style={{ marginLeft: 8 }} />
          </View>
        </Card>

        {/* Filter metrik dan waktu */}
        <View style={[styles.filtersRow, { marginTop: spacing.md }]}> 
          <Chip label="pH" active={metric === 'ph'} onPress={() => setMetric('ph')} />
          <Chip label="EC" active={metric === 'ec'} onPress={() => setMetric('ec')} />
          <Chip label="Suhu" active={metric === 'temp'} onPress={() => setMetric('temp')} />
        </View>
        <View style={[styles.filtersRow, { marginTop: spacing.xs }]}> 
          <Chip label="1 Jam" active={timeRange === 'hour'} onPress={() => setTimeRange('hour')} />
          <Chip label="1 Hari" active={timeRange === 'day'} onPress={() => setTimeRange('day')} />
          <Chip label="1 Minggu" active={timeRange === 'week'} onPress={() => setTimeRange('week')} />
        </View>

        {/* Grafik nyata */}
        <Card style={{ marginTop: spacing.md, padding: 0 }}>
          <View style={{ padding: spacing.md, paddingBottom: spacing.sm, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name={metric === 'ph' ? 'water' : metric === 'ec' ? 'beaker' : 'thermometer'} size={18} color={colors.primary} />
              <Text style={[styles.chartTitle, { marginLeft: 8 }]}>{metric === 'ph' ? 'pH Level' : metric === 'ec' ? 'EC Nutrisi' : 'Suhu'}</Text>
            </View>
            <Text style={styles.chartRange}>{timeRange === 'hour' ? '1 Jam' : timeRange === 'day' ? '1 Hari' : '1 Minggu'}</Text>
          </View>
          <View onLayout={(e) => setChartW(e.nativeEvent.layout.width)} style={{ paddingHorizontal: spacing.md, paddingBottom: spacing.md }}>
            <Chart
              width={chartW || 320}
              data={data}
              yDomain={{ min: yDomain.min, max: yDomain.max, targetLow: yDomain.targetLow, targetHigh: yDomain.targetHigh }}
              labels={labels}
            />
          </View>
        </Card>
      </ScrollView>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg },
  headerGrad: { borderRadius: radius.xl, overflow: 'hidden', marginBottom: spacing.lg },
  header: { height: 56, paddingHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#ffffff22', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontFamily: 'Inter_700Bold', fontSize: 16 },

  controlRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  controlTitle: { color: colors.text, fontFamily: 'Inter_600SemiBold' },
  tagsRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },

  filtersRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  chip: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: radius.round, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, minWidth: 92, alignItems: 'center', justifyContent: 'center' },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textMuted, fontFamily: 'Inter_600SemiBold', textAlign: 'center' },
  chipTextActive: { color: '#fff' },

  chartHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  chartTitle: { color: colors.text, fontFamily: 'Inter_700Bold' },
  chartRange: { color: colors.textMuted, fontFamily: 'Inter_600SemiBold' },
  chartArea: { height: 180, borderRadius: radius.md, backgroundColor: colors.primary, position: 'relative', overflow: 'hidden', marginTop: spacing.sm },
  wave: { position: 'absolute', bottom: 18, width: 2, borderRadius: 2 },
  chartAxis: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
  axisLabel: { color: colors.textMuted, fontFamily: 'Inter_400Regular' },
});