import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLanguage } from '../../context/LanguageContext';
import { useGpr, DiagnosticItem } from '../../context/GprContext';

export default function HomeScreen() {
  const { t, language } = useLanguage();
  const { 
    theme, 
    diagnosticsStatus, 
    diagnosticItems, 
    runDiagnostics, 
    logs, 
    detectedAnomalies 
  } = useGpr();
  const router = useRouter();

  // Dynamic colors based on theme
  const isLight = theme === 'light';
  const isDark = theme === 'dark';
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isLight ? '#F8FAFC' : isDark ? '#0F172A' : '#111827',
    },
    scrollContent: {
      padding: 16,
    },
    // Diagnostics Layout
    diagContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
      backgroundColor: isLight ? '#F8FAFC' : isDark ? '#0F172A' : '#0B0F19',
    },
    diagCard: {
      width: '100%',
      maxWidth: 480,
      backgroundColor: isLight ? '#FFFFFF' : isDark ? '#1E293B' : '#1C2537',
      borderRadius: 16,
      padding: 24,
      borderWidth: 1,
      borderColor: isLight ? '#E2E8F0' : '#374151',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 5,
    },
    diagHeader: {
      alignItems: 'center',
      marginBottom: 20,
    },
    diagTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: isLight ? '#0F172A' : '#F9FAFB',
      marginTop: 8,
      textAlign: 'center',
    },
    diagSub: {
      fontSize: 13,
      color: isLight ? '#64748B' : '#9CA3AF',
      marginTop: 4,
      textAlign: 'center',
    },
    diagList: {
      marginVertical: 8,
    },
    diagItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: isLight ? '#F1F5F9' : '#2D3748',
    },
    diagItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    diagItemText: {
      fontSize: 14,
      fontWeight: '500',
      color: isLight ? '#334155' : '#E5E7EB',
      marginLeft: 10,
    },
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
    },
    badgeText: {
      fontSize: 11,
      fontWeight: '600',
    },
    // Dashboard Layout
    telemetryBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: isLight ? '#FFFFFF' : isDark ? '#1E293B' : '#1C2537',
      padding: 14,
      borderRadius: 12,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: isLight ? '#E2E8F0' : '#374151',
    },
    telemetryItem: {
      alignItems: 'center',
      flex: 1,
    },
    telemetryDivider: {
      width: 1,
      height: '100%',
      backgroundColor: isLight ? '#E2E8F0' : '#374151',
    },
    telemetryVal: {
      fontSize: 15,
      fontWeight: '700',
      color: isLight ? '#0F172A' : '#F9FAFB',
      marginTop: 2,
    },
    telemetryLabel: {
      fontSize: 11,
      color: isLight ? '#64748B' : '#9CA3AF',
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: isLight ? '#0F172A' : '#F9FAFB',
      marginBottom: 12,
      letterSpacing: 0.5,
    },
    // Navigation Cards
    navCard: {
      backgroundColor: isLight ? '#FFFFFF' : isDark ? '#1E293B' : '#1C2537',
      borderRadius: 14,
      padding: 18,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: isLight ? '#E2E8F0' : '#374151',
      flexDirection: 'row',
      alignItems: 'center',
    },
    navIconContainer: {
      width: 52,
      height: 52,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    navInfo: {
      flex: 1,
    },
    navTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: isLight ? '#0F172A' : '#F9FAFB',
      letterSpacing: 0.3,
    },
    navDesc: {
      fontSize: 12,
      color: isLight ? '#64748B' : '#9CA3AF',
      marginTop: 4,
      lineHeight: 16,
    },
    navChevron: {
      marginLeft: 8,
    },
    // Re-test button
    retestBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isLight ? '#F1F5F9' : '#2D3748',
      paddingVertical: 12,
      borderRadius: 10,
      marginTop: 8,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: isLight ? '#E2E8F0' : '#4A5568',
    },
    retestBtnText: {
      fontSize: 14,
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

  // Render Diagnostic Self-Test Screen
  if (diagnosticsStatus === 'running' || diagnosticsStatus === 'idle') {
    return (
      <View style={styles.diagContainer}>
        <View style={styles.diagCard}>
          <View style={styles.diagHeader}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.diagTitle}>{t.diagnosticsTitle}</Text>
            <Text style={styles.diagSub}>{t.diagnosticsSub}</Text>
          </View>

          <ScrollView style={styles.diagList} showsVerticalScrollIndicator={false}>
            {diagnosticItems.map((item) => {
              const statusColor = getStatusColor(item.status);
              return (
                <View key={item.id} style={styles.diagItem}>
                  <View style={styles.diagItemLeft}>
                    <Ionicons 
                      name={item.status === 'checking' ? 'sync' : item.status === 'ready' ? 'checkmark-circle' : 'alert-circle'} 
                      size={18} 
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
    );
  }

  // Render Main Home Dashboard Screen
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Telemetry Bar */}
        <View style={styles.telemetryBar}>
          <View style={styles.telemetryItem}>
            <Ionicons name="battery-charging" size={18} color="#22C55E" />
            <Text style={styles.telemetryVal}>98%</Text>
            <Text style={styles.telemetryLabel}>11.8 V</Text>
          </View>
          <View style={styles.telemetryDivider} />
          <View style={styles.telemetryItem}>
            <Ionicons name="pin" size={18} color="#F59E0B" />
            <Text style={styles.telemetryVal}>GPS 3D</Text>
            <Text style={styles.telemetryLabel}>Ankara, TR</Text>
          </View>
          <View style={styles.telemetryDivider} />
          <View style={styles.telemetryItem}>
            <Ionicons name="thermometer-outline" size={18} color="#06B6D4" />
            <Text style={styles.telemetryVal}>34.2 °C</Text>
            <Text style={styles.telemetryLabel}>Sys Temp</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          {language === 'tr' ? 'Donanım ve Kontrol Modülleri' : language === 'de' ? 'Module' : language === 'fr' ? 'Modules' : language === 'ru' ? 'Модули' : language === 'ar' ? 'الوحدات' : 'Control Modules'}
        </Text>

        {/* Card 1: CANLI TARAMA */}
        <TouchableOpacity style={styles.navCard} onPress={() => router.push('/scan')}>
          <View style={[styles.navIconContainer, { backgroundColor: '#EFF6FF' }]}>
            <Ionicons name="pulse" size={28} color="#3B82F6" />
          </View>
          <View style={styles.navInfo}>
            <Text style={styles.navTitle}>{t.card1Title}</Text>
            <Text style={styles.navDesc}>{t.card1Desc}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={isLight ? '#94A3B8' : '#475569'} style={styles.navChevron} />
        </TouchableOpacity>

        {/* Card 2: MADDE ANALİZİ */}
        <TouchableOpacity style={styles.navCard} onPress={() => router.push('/material')}>
          <View style={[styles.navIconContainer, { backgroundColor: '#ECFDF5' }]}>
            <Ionicons name="flask" size={28} color="#10B981" />
          </View>
          <View style={styles.navInfo}>
            <Text style={styles.navTitle}>{t.card2Title}</Text>
            <Text style={styles.navDesc}>{t.card2Desc}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={isLight ? '#94A3B8' : '#475569'} style={styles.navChevron} />
        </TouchableOpacity>

        {/* Card 3: KAYITLAR VE KONUMLAR */}
        <TouchableOpacity style={styles.navCard} onPress={() => router.push('/logs')}>
          <View style={[styles.navIconContainer, { backgroundColor: '#FDF4FF' }]}>
            <Ionicons name="folder-open" size={28} color="#D946EF" />
          </View>
          <View style={styles.navInfo}>
            <Text style={styles.navTitle}>{t.card3Title}</Text>
            <Text style={styles.navDesc}>{t.card3Desc}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={isLight ? '#94A3B8' : '#475569'} style={styles.navChevron} />
        </TouchableOpacity>

        {/* Diagnostics Re-run Button */}
        <TouchableOpacity style={styles.retestBtn} onPress={runDiagnostics}>
          <Ionicons name="refresh-outline" size={18} color={isLight ? '#475569' : '#E2E8F0'} />
          <Text style={styles.retestBtnText}>{t.runDiagnostics}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
