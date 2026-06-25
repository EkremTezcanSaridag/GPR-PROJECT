import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Animated, Easing, Dimensions, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useLanguage } from '../../context/LanguageContext';
import { useGpr } from '../../context/GprContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
  const [hasApprovedDiagnostics, setHasApprovedDiagnostics] = useState(false);

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
          toValue: 1.05,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.95,
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
      duration: 2500,
      useNativeDriver: false,
    }).start(() => {
      setShowSplash(false);
      runDiagnostics();
    });
  }, []);

  useEffect(() => {
    if (diagnosticsStatus === 'completed' && !hasApprovedDiagnostics) {
      Alert.alert(
        language === 'tr' ? 'Teşhis Tamamlandı' : 'Diagnostics Completed',
        language === 'tr' ? 'Donanım testi başarıyla tamamlandı. Cihaz çalışmaya hazır.' : 'Hardware diagnostics completed successfully. Unit ready for operation.',
        [
          {
            text: language === 'tr' ? 'Onayla ve Devam Et' : 'Approve & Continue',
            onPress: () => setHasApprovedDiagnostics(true)
          }
        ],
        { cancelable: false }
      );
    }
  }, [diagnosticsStatus, hasApprovedDiagnostics, language]);

  const isLight = theme === 'light';
  const isDark = theme === 'dark';

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
                <Circle cx="50" cy="50" r="40" stroke="#1F2937" strokeWidth="1.5" fill="none" />
                <Circle cx="50" cy="50" r="30" stroke="#1F2937" strokeWidth="1" fill="none" />
                <Circle cx="50" cy="50" r="20" stroke="#1F2937" strokeWidth="1" fill="none" />
                
                <Line x1="10" y1="50" x2="90" y2="50" stroke="#1F2937" strokeWidth="1" />
                <Line x1="50" y1="10" x2="50" y2="90" stroke="#1F2937" strokeWidth="1" />

                <Animated.View style={{ transform: [{ rotate: spin }], originX: '50px', originY: '50px' } as any}>
                  <Line x1="50" y1="50" x2="50" y2="10" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
                  <Circle cx="50" cy="20" r="3" fill="#10B981" />
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
  if (diagnosticsStatus === 'running' || diagnosticsStatus === 'idle' || (diagnosticsStatus === 'completed' && !hasApprovedDiagnostics)) {
    const isCompleted = diagnosticsStatus === 'completed';
    return (
      <View style={styles.container}>
        <View style={styles.diagContainer}>
          <View style={styles.diagCard}>
            <View style={styles.diagHeaderSide}>
              {isCompleted ? (
                <Ionicons name="checkmark-done-circle" size={48} color="#10B981" style={{ marginBottom: 12 }} />
              ) : (
                <ActivityIndicator size="large" color="#F59E0B" style={{ marginBottom: 12 }} />
              )}
              <Text style={styles.diagTitle}>
                {isCompleted 
                  ? (language === 'tr' ? 'Teşhis Tamamlandı' : 'Diagnostics Completed')
                  : t.diagnosticsTitle}
              </Text>
              <Text style={styles.diagSub}>
                {isCompleted 
                  ? (language === 'tr' ? 'Tüm donanım ve yazılım modülleri başarıyla test edildi. Cihaz çalışmaya hazır.' : 'All hardware and software modules tested successfully. Unit ready for operation.')
                  : t.diagnosticsSub}
              </Text>
              {isCompleted && (
                <TouchableOpacity 
                  style={styles.diagApproveBtn}
                  onPress={() => setHasApprovedDiagnostics(true)}
                >
                  <Text style={styles.diagApproveBtnText}>
                    {language === 'tr' ? 'ONAYLA VE DEVAM ET' : 'APPROVE & CONTINUE'}
                  </Text>
                  <Ionicons name="chevron-forward" size={14} color="#090D16" />
                </TouchableOpacity>
              )}
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
                        color={item.status === 'ready' ? '#10B981' : item.status === 'warning' ? '#F59E0B' : item.status === 'fault' ? '#EF4444' : '#3B82F6'} 
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

  // 3. Render Redesigned DJI-Inspired Home Dashboard (Split Screen Landscape Layout)
  return (
    <View style={styles.container}>
      
      {/* LEFT COLUMN: Sonar Sweep Visualizer & Telemetry HUD */}
      <View style={styles.leftPane}>
        <Text style={styles.leftPaneTitle}>ANTIGRAVITY GPR</Text>
        <Text style={styles.leftPaneSubtitle}>FLIGHT & FIELD CONTROLLER</Text>

        {/* Sonar sweep animation panel */}
        <View style={styles.sonarContainer}>
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Svg width="140" height="140" viewBox="0 0 100 100">
              <Circle cx="50" cy="50" r="46" fill="none" stroke="#1F2937" strokeWidth="1" />
              <Circle cx="50" cy="50" r="32" fill="none" stroke="#1F2937" strokeWidth="1" />
              <Circle cx="50" cy="50" r="18" fill="none" stroke="#1F2937" strokeWidth="1" />
              
              <Line x1="4" y1="50" x2="96" y2="50" stroke="#1F2937" strokeWidth="0.8" />
              <Line x1="50" y1="4" x2="50" y2="96" stroke="#1F2937" strokeWidth="0.8" />

              {/* Sweeping Sonar Line */}
              <Line x1="50" y1="50" x2="50" y2="4" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round" opacity="0.85" />
              <Circle cx="50" cy="20" r="2.5" fill="#10B981" />
              
              {/* Mock static detected target dots */}
              <Circle cx="75" cy="35" r="2" fill="#EF4444" opacity="0.7" />
              <Circle cx="30" cy="65" r="1.5" fill="#3B82F6" opacity="0.5" />
            </Svg>
          </Animated.View>
        </View>

        {/* Telemetry Stats Readout */}
        <View style={styles.telemetryHUD}>
          <View style={styles.hudRow}>
            <Ionicons name="location" size={12} color="#10B981" />
            <Text style={styles.hudValText}>GPS: FIX (18 Sats)</Text>
          </View>
          <View style={styles.hudRow}>
            <Ionicons name="battery-charging" size={12} color="#10B981" />
            <Text style={styles.hudValText}>BATT: 98% (11.8 V)</Text>
          </View>
          <View style={styles.hudRow}>
            <Ionicons name="thermometer" size={12} color="#06B6D4" />
            <Text style={styles.hudValText}>TEMP: 34.2 °C</Text>
          </View>
          <View style={styles.hudRow}>
            <Ionicons name="checkmark-done-circle" size={12} color="#10B981" />
            <Text style={styles.hudValText}>SYSTEM: OPERATIONAL</Text>
          </View>
        </View>
      </View>

      {/* RIGHT COLUMN: Touch-friendly vertical Menu Tiles */}
      <View style={styles.rightPane}>
        <Text style={styles.rightPaneTitle}>{language === 'tr' ? 'HIZLI İŞLEMLER' : 'QUICK OPERATIONS'}</Text>
        
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.menuList}>
          
          {/* Tile 1: Live scan HUD */}
          <TouchableOpacity style={styles.menuTile} onPress={() => router.push('/scan')}>
            <View style={[styles.tileIconBg, { backgroundColor: 'rgba(59, 130, 246, 0.15)', borderColor: '#3B82F6' }]}>
              <Ionicons name="pulse" size={20} color="#3B82F6" />
            </View>
            <View style={styles.tileContent}>
              <Text style={styles.tileLabel}>{language === 'tr' ? 'CANLI TARAMA (HUD)' : 'LIVE SCAN HUD'}</Text>
              <Text style={styles.tileSubLabel}>{language === 'tr' ? 'B-Scan radargram haritalama kontrol ekranı' : 'Real-time GPR B-Scan mapping control HUD'}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#4B5563" />
          </TouchableOpacity>

          {/* Tile 2: Metal Detector sweep */}
          <TouchableOpacity style={styles.menuTile} onPress={() => router.push('/material')}>
            <View style={[styles.tileIconBg, { backgroundColor: 'rgba(245, 158, 11, 0.15)', borderColor: '#F59E0B' }]}>
              <Ionicons name="radio" size={20} color="#F59E0B" />
            </View>
            <View style={styles.tileContent}>
              <Text style={styles.tileLabel}>{language === 'tr' ? 'DETEKTÖR MODU' : 'DETECTOR MODE'}</Text>
              <Text style={styles.tileSubLabel}>{language === 'tr' ? 'AI destekli hedef bulucu ve madde eşleyici' : 'AI target identification & dial sweep detector'}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#4B5563" />
          </TouchableOpacity>

          {/* Tile 3: Logs files list */}
          <TouchableOpacity style={styles.menuTile} onPress={() => router.push('/logs')}>
            <View style={[styles.tileIconBg, { backgroundColor: 'rgba(168, 85, 247, 0.15)', borderColor: '#A855F7' }]}>
              <Ionicons name="folder-open" size={20} color="#A855F7" />
            </View>
            <View style={styles.tileContent}>
              <Text style={styles.tileLabel}>{language === 'tr' ? 'ZEMİN KAYITLARI' : 'SURVEY LOGS'}</Text>
              <Text style={styles.tileSubLabel}>{language === 'tr' ? 'Önceki tarama geçmişini ve anomali raporlarını inceleyin' : 'Review past GPR sweeps and download telemetry files'}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#4B5563" />
          </TouchableOpacity>

          {/* Tile 4: Self-test trigger */}
          <TouchableOpacity 
            style={styles.menuTile} 
            onPress={() => {
              setHasApprovedDiagnostics(false);
              runDiagnostics();
            }}
          >
            <View style={[styles.tileIconBg, { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: '#10B981' }]}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            </View>
            <View style={styles.tileContent}>
              <Text style={styles.tileLabel}>{language === 'tr' ? 'DONANIM TESTİ' : 'HARDWARE DIAGNOSTICS'}</Text>
              <Text style={styles.tileSubLabel}>{language === 'tr' ? 'Tüm modülleri tekrar test edin ve kalibre edin' : 'Re-run GPR self-test checks and calibration'}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#4B5563" />
          </TouchableOpacity>

        </ScrollView>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070913',
    paddingLeft: 75, // Clear Left Sidebar
    flexDirection: 'row',
  },
  // Splash Screen Layout (Landscape)
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
    color: '#F59E0B',
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
    backgroundColor: '#F59E0B',
  },
  // Diagnostics Self-Test Screen
  diagContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  diagCard: {
    width: '95%',
    height: '95%',
    backgroundColor: '#0D1220',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1F2937',
    flexDirection: 'row',
  },
  diagHeaderSide: {
    flex: 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#1F2937',
    paddingRight: 16,
  },
  diagTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F9FAFB',
    marginTop: 8,
    textAlign: 'center',
  },
  diagSub: {
    fontSize: 11,
    color: '#9CA3AF',
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
    justifyContent: 'space-between',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  diagItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  diagItemText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#E5E7EB',
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
  // Home Dashboard Left Pane
  leftPane: {
    flex: 0.42,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#1F2937',
    backgroundColor: '#0A0E1A',
  },
  leftPaneTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2,
  },
  leftPaneSubtitle: {
    color: '#F59E0B',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 3,
    marginTop: 4,
  },
  sonarContainer: {
    marginVertical: 20,
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  telemetryHUD: {
    backgroundColor: '#0D1220',
    borderWidth: 1,
    borderColor: '#1F2937',
    borderRadius: 10,
    padding: 10,
    width: '90%',
    gap: 4,
  },
  hudRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hudValText: {
    color: '#CBD5E1',
    fontSize: 9.5,
    fontWeight: '700',
  },
  // Home Dashboard Right Pane
  rightPane: {
    flex: 0.58,
    padding: 20,
    justifyContent: 'center',
  },
  rightPaneTitle: {
    color: '#9CA3AF',
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  menuList: {
    gap: 10,
  },
  menuTile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D1220',
    borderWidth: 1,
    borderColor: '#1F2937',
    borderRadius: 12,
    padding: 10,
  },
  tileIconBg: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tileContent: {
    flex: 1,
  },
  tileLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  tileSubLabel: {
    color: '#9CA3AF',
    fontSize: 9.5,
    marginTop: 2,
  },
  diagApproveBtn: {
    backgroundColor: '#F59E0B',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#D97706',
  },
  diagApproveBtnText: {
    color: '#090D16',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
