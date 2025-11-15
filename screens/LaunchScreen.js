import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import PrimaryButton from '../components/PrimaryButton';
import { colors, spacing } from '../theme';

export default function LaunchScreen({ navigation }) {
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fade }]}> 
      {/* Header gambar dengan overlay */}
      <View style={styles.imageWrap}>
        <ImageBackground
          source={require('../assets/launch.jpg')}
          style={styles.image}
        >
          <LinearGradient
            colors={["rgba(0,0,0,0)", "rgba(9,57,35,0.35)"]}
            style={styles.imageOverlay}
          />
        </ImageBackground>
      </View>

      {/* Panel bawah dengan gradient dan CTA */}
      <LinearGradient colors={[colors.primary, colors.primaryDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.panel, styles.panelOverlap]}>
        <Text style={styles.title}>{'Bangun Greenhouse\nuntuk Membantu\nBumi'}</Text>

        <PrimaryButton
          title="Continue"
          onPress={() => navigation.navigate('Login')}
          variant="outline"
          style={[styles.ctaButton, { backgroundColor: colors.surface, borderWidth: 0 }]}
          textStyle={{ color: colors.primary, fontFamily: 'Inter_700Bold', fontSize: 18 }}
        />
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  imageWrap: {
    position: 'relative',
    width: '100%',
    height: 380,
    backgroundColor: colors.surface,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 150,
  },
  panel: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    backgroundColor: colors.primary,
    alignItems: 'center',
    gap: spacing.lg,
  },
  panelOverlap: {
    marginTop: -24,
  },
  title: {
    color: colors.surface,
    fontSize: 30,
    lineHeight: 38,
    letterSpacing: 0.2,
    fontFamily: 'Inter_800ExtraBold',
    textAlign: 'center',
  },
  ctaButton: {
    alignSelf: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl * 1.6,
    borderRadius: 20,
  },
});