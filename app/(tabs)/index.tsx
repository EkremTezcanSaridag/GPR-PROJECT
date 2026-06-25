import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useLanguage } from '../../context/LanguageContext';
import { useGpr, DiagnosticItem } from '../../context/GprContext';

export default function HomeScreen() {
  const { t, language } = useLanguage();
  const { 
    theme, 
    diagnosticsStatus, 
    diagnosticItems, 
    runDiagnostics
  } = useGpr();
  const router = useRouter();

  // App startup states
  const [showSplash, setShowSplash] = useState(true);

  // Animations refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0.9)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Trigger animations
  useEffect(() => {
    // Fade in Splash content
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Pulse logo animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.9,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Rotate Radar Sweep
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Progress bar loader
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 3500,
      useNativeDriver: false,
    }).start(() => {
      setShowSplash(false);
      runDiagnostics();
    });
  }, []);

  const isLight = theme === 'light';
  const isDark = theme === 'dark';

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isLight ? '#F8FAFC' : isDark ? '#0F172A' : '#111827',
      paddingLeft: showSplash ? 0 : 75, // Pad content to the right of the sidebar
    },
    // Splash Screen Layout (Optimized for Landscape)
    splashContainer: {
      flex: 1,
      backgroundColor: '#090D16',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
    },
    splashRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      maxWidth: 720,
    },
    splashLogoContainer: {
      marginRight: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    splashTextContainer: {
      alignItems: 'flex-start',
    },
    splashTitle: {
      fontSize: 32,
      fontWeight: '900',
      color: '#FFFFFF',
      letterSpacing: 2,
    },
    splashSubtitle: {
      fontSize: 12,
      fontWeight: '700',
      color: '#06B6D4',
      letterSpacing: 4,
      marginTop: 6,
      textTransform: 'uppercase',
    },
    splashLabel: {
      fontSize: 10,
      fontWeight: '600',
      color: '#9CA3AF',
      letterSpacing: 2,
      marginTop: 20,
    },
    progressBarOuter: {
      width: 240,
      height: 4,
      backgroundColor: '#1F2937',
      borderRadius: 2,
      marginTop: 10,
      overflow: 'hidden',
    },
    progressBarInner: {
      height: '100%',
      backgroundColor: '#3B82F6',
    },
    // Diagnostics Layout (Landscape columns side-by-side)
    diagContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
    },
    diagCard: {
      width: '95%',
      height: '95%',
      backgroundColor: isLight ? '#FFFFFF' : isDark ? '#1E293B' : '#1C2537',
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: isLight ? '#E2E8F0' : '#374151',
      flexDirection: 'row',
    },
    diagHeaderSide: {
      flex: 0.4,
      justifyContent: 'center',
      alignItems: 'center',
      borderRightWidth: 1,
      borderRightColor: isLight ? '#F1F5F9' : '#2D3748',
      paddingRight: 16,
    },
    diagTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: isLight ? '#0F172A' : '#F9FAFB',
      marginTop: 8,
      textAlign: 'center',
    },
    diagSub: {
      fontSize: 11,
      color: isLight ? '#64748B' : '#9CA3AF',
      marginTop: 4,
      textAlign: 'center',
      lineHeight: 14,
    },
    diagListSide: {
      flex: 0.6,
      paddingLeft: 16,
    },
    diagItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justify('space-between' as any),
      paddingVertical: 7,
      borderBottomWidth: 1,
      borderBottomColor: isLight ? '#F1F5F9' : '#2D3748',
    },
    diagItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    diagItemText: {
      fontSize: 13,
      fontWeight: '500',
      color: isLight ? '#334155' : '#E5E7EB',
      marginLeft: 8,
    },
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 6,
    },
    badgeText: {
      fontSize: 10,
      fontWeight: '600',
    },
    // Home Dashboard Layout (Landscape Grid)
    scrollContent: {
      padding: 16,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    mainTitleText: {
      fontSize: 22,
      fontWeight: '800',
      color: isLight ? '#0F172A' : '#F9FAFB',
    },
    telemetryRow: {
      flexDirection: 'row',
      backgroundColor: isLight ? '#FFFFFF' : isDark ? '#1E293B' : '#1C2537',
      padding: 12,
      borderRadius: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: isLight ? '#E2E8F0' : '#374151',
    },
    telemetryItem: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    telemetryTextContainer: {
      marginLeft: 8,
    },
    telemetryVal: {
      fontSize: 14,
      fontWeight: '700',
      color: isLight ? '#0F172A' : '#F9FAFB',
    },
    telemetryLabel: {
      fontSize: 9,
      color: isLight ? '#64748B' : '#9CA3AF',
    },
    telemetryDivider: {
      width: 1,
      backgroundColor: isLight ? '#E2E8F0' : '#374151',
      marginHorizontal: 8,
    },
    cardsGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    navCard: {
      flex: 1,
      backgroundColor: isLight ? '#FFFFFF' : isDark ? '#1E293B' : '#1C2537',
      borderRadius: 14,
      padding: 16,
      marginHorizontal: 6,
      borderWidth: 1,
      borderColor: isLight ? '#E2E8F0' : '#374151',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 140,
    },
    navIconContainer: {
      width: 44,
      height: 44,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 10,
    },
    navTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: isLight ? '#0F172A' : '#F9FAFB',
      textAlign: 'center',
    },
    navDesc: {
      fontSize: 11,
      color: isLight ? '#64748B' : '#9CA3AF',
      textAlign: 'center',
      marginTop: 4,
      lineHeight: 14,
    },
    retestBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isLight ? '#F1F5F9' : '#2D3748',
      paddingVertical: 10,
      borderRadius: 8,
      marginHorizontal: 6,
      borderWidth: 1,
      borderColor: isLight ? '#E2E8F0' : '#4A5568',
      marginBottom: 16,
    },
    retestBtnText: {
      fontSize: 13,
      fontWeight: '600',
      color: isLight ? '#475569' : '#E2E8F0',
      marginLeft: 6,
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return { bg: '#DCFCE7', text: '#15803D', label: t.statusReady };
      case 'warning':
        return { bg: '#FEF3C7', text: '#B45309', label: t.statusWarning };
      case 'fault':
        return { bg: '#FEE2E2', text: '#B91C1C', label: t.statusFault };
      case 'checking':
      default:
        return { bg: '#E2E8F0', text: '#475569', label: t.diagnosticsCheck };
    }
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const widthPercent = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  // 1. Render Splash Screen
  if (showSplash) {
    return (
      <View style={styles.splashContainer}>
        <Animated.View style={[styles.splashRow, { opacity: fadeAnim }]}>
          <View style={styles.splashLogoContainer}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Svg width="120" height="120" viewBox="0 0 100 100">
                <Circle cx="50" cy="50" r="40" stroke="#1F2937" strokeWidth="1" fill="none" />
                <Circle cx="50" cy="50" r="30" stroke="#1F2937" strokeWidth="1" fill="none" />
                <Circle cx="50" cy="50" r="20" stroke="#1F2937" strokeWidth="1" fill="none" />
                
                <Line x1="10" y1="50" x2="90" y2="50" stroke="#1F2937" strokeWidth="1" />
                <Line x1="50" y1="10" x2="50" y2="90" stroke="#1F2937" strokeWidth="1" />

                <Animated.View style={{ transform: [{ rotate: spin }], originX: '50px', originY: '50px' } as any}>
                  <Line x1="50" y1="50" x2="50" y2="10" stroke="#06B6D4" strokeWidth="2.5" strokeLinecap="round" />
                  <Circle cx="50" cy="20" r="3" fill="#22C55E" />
                </Animated.View>
                
                <Circle cx="50" cy="50" r="4" fill="#3B82F6" />
              </Svg>
            </Animated.View>
          </View>

          <View style={styles.splashTextContainer}>
            <Text style={styles.splashTitle}>ANTIGRAVITY</Text>
            <Text style={styles.splashSubtitle}>AI GPR SUITE</Text>
            <Text style={styles.splashLabel}>INITIALIZING SUBTERRANEAN SCANNER...</Text>
            <View style={styles.progressBarOuter}>
              <Animated.View style={[styles.progressBarInner, { width: widthPercent }]} />
            </View>
          </View>
        </Animated.View>
      </View>
    );
  }

  // 2. Render Diagnostic Self-Test Screen
  if (diagnosticsStatus === 'running' || diagnosticsStatus === 'idle') {
    return (
      <View style={styles.container}>
        <View style={styles.diagContainer}>
          <View style={styles.diagCard}>
            <View style={styles.diagHeaderSide}>
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text style={styles.diagTitle}>{t.diagnosticsTitle}</Text>
              <Text style={styles.diagSub}>{t.diagnosticsSub}</Text>
            </View>

            <ScrollView style={styles.diagListSide} showsVerticalScrollIndicator={false}>
              {diagnosticItems.map((item) => {
                const statusColor = getStatusColor(item.status);
                return (
                  <View key={item.id} style={styles.diagItem}>
                    <View style={styles.diagItemLeft}>
                      <Ionicons 
                        name={item.status === 'checking' ? 'sync' : item.status === 'ready' ? 'checkmark-circle' : 'alert-circle'} 
                        size={16} 
                        color={item.status === 'ready' ? '#22C55E' : item.status === 'warning' ? '#F59E0B' : item.status === 'fault' ? '#EF4444' : '#3B82F6'} 
                      />
                      <Text style={styles.diagItemText}>{t[item.nameKey]}</Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: statusColor.bg }]}>
                      <Text style={[styles.badgeText, { color: statusColor.text }]}>{statusColor.label}</Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </View>
    );
  }

  // 3. Render Main Home Dashboard (Optimized for Landscape Layout)
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Title bar */}
        <View style={styles.headerRow}>
          <Text style={styles.mainTitleText}>{t.title}</Text>
          <Text style={[styles.telemetryLabel, { fontSize: 12, fontWeight: '700' }]}>{t.subtitle}</Text>
        </View>

        {/* Telemetry horizontal bar */}
        <View style={styles.telemetryRow}>
          <View style={styles.telemetryItem}>
            <Ionicons name="battery-charging" size={16} color="#22C55E" />
            <View style={styles.telemetryTextContainer}>
              <Text style={styles.telemetryVal}>98%</Text>
              <Text style={styles.telemetryLabel}>11.8 V | Active</Text>
            </View>
          </View>
          <View style={styles.telemetryDivider} />
          <View style={styles.telemetryItem}>
            <Ionicons name="pin" size={16} color="#F59E0B" />
            <View style={styles.telemetryTextContainer}>
              <Text style={styles.telemetryVal}>GPS RTK Lock</Text>
              <Text style={styles.telemetryLabel}>39.92° N, 32.85° E</Text>
            </View>
          </View>
          <View style={styles.telemetryDivider} />
          <View style={styles.telemetryItem}>
            <Ionicons name="thermometer" size={16} color="#06B6D4" />
            <View style={styles.telemetryTextContainer}>
              <Text style={styles.telemetryVal}>34.2 °C</Text>
              <Text style={styles.telemetryLabel}>System Temp</Text>
            </View>
          </View>
        </View>

        {/* Navigation Grid (Horizontal row of 3 cards in landscape) */}
        <View style={styles.cardsGrid}>
          {/* Card 1: Live scan */}
          <TouchableOpacity style={styles.navCard} onPress={() => router.push('/scan')}>
            <View style={[styles.navIconContainer, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="pulse" size={24} color="#3B82F6" />
            </View>
            <Text style={styles.navTitle}>{t.card1Title}</Text>
            <Text style={styles.navDesc} numberOfLines={2}>{t.card1Desc}</Text>
          </TouchableOpacity>

          {/* Card 2: Material analysis */}
          <TouchableOpacity style={styles.navCard} onPress={() => router.push('/material')}>
            <View style={[styles.navIconContainer, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="flask" size={24} color="#10B981" />
            </View>
            <Text style={styles.navTitle}>{t.card2Title}</Text>
            <Text style={styles.navDesc} numberOfLines={2}>{t.card2Desc}</Text>
          </TouchableOpacity>

          {/* Card 3: Saved logs */}
          <TouchableOpacity style={styles.navCard} onPress={() => router.push('/logs')}>
            <View style={[styles.navIconContainer, { backgroundColor: '#FDF4FF' }]}>
              <Ionicons name="folder-open" size={24} color="#D946EF" />
            </View>
            <Text style={styles.navTitle}>{t.card3Title}</Text>
            <Text style={styles.navDesc} numberOfLines={2}>{t.card3Desc}</Text>
          </TouchableOpacity>
        </View>

        {/* Re-run diagnostics self-test */}
        <TouchableOpacity style={styles.retestBtn} onPress={runDiagnostics}>
          <Ionicons name="refresh" size={16} color={isLight ? '#475569' : '#E2E8F0'} />
          <Text style={styles.retestBtnText}>{t.runDiagnostics}</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}
