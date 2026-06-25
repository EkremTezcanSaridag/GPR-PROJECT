import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage, Language } from '../../context/LanguageContext';
import { useGpr } from '../../context/GprContext';

export default function SettingsScreen() {
  const { t, language, setLanguage } = useLanguage();
  const {
    theme,
    setTheme,
    frequency,
    setFrequency,
    pulseVoltage,
    setPulseVoltage,
    gain,
    setGain,
    noiseFilter,
    setNoiseFilter,
    resolution,
    setResolution
  } = useGpr();

  const isLight = theme === 'light';
  const isDark = theme === 'dark';

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isLight ? '#F8FAFC' : isDark ? '#0F172A' : '#111827',
      paddingLeft: 75, // Shift content right to clear Left Sidebar
      flexDirection: 'row', // Side-by-side columns
    },
    // Left Column (Hardware settings) - 50% width
    leftColumn: {
      flex: 0.5,
      padding: 16,
      borderRightWidth: 1,
      borderRightColor: isLight ? '#E2E8F0' : '#374151',
    },
    // Right Column (Interface & System) - 50% width
    rightColumn: {
      flex: 0.5,
      padding: 16,
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: '700',
      color: '#3B82F6',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: 10,
      paddingLeft: 4,
    },
    settingsGroup: {
      backgroundColor: isLight ? '#FFFFFF' : isDark ? '#1E293B' : '#1C2537',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isLight ? '#E2E8F0' : '#374151',
      paddingVertical: 4,
      marginBottom: 16,
      overflow: 'hidden',
    },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: isLight ? '#F1F5F9' : '#2D3748',
    },
    settingRowLast: {
      borderBottomWidth: 0,
    },
    settingLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    settingIcon: {
      marginRight: 10,
    },
    settingLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: isLight ? '#0F172A' : '#F9FAFB',
    },
    settingSubLabel: {
      fontSize: 10,
      color: isLight ? '#64748B' : '#9CA3AF',
      marginTop: 1,
    },
    // Selector options
    optionGroup: {
      flexDirection: 'row',
      backgroundColor: isLight ? '#F1F5F9' : '#2D3748',
      borderRadius: 6,
      padding: 2,
    },
    optionBtn: {
      paddingHorizontal: 6,
      paddingVertical: 4,
      borderRadius: 4,
    },
    optionBtnActive: {
      backgroundColor: '#3B82F6',
    },
    optionText: {
      fontSize: 10.5,
      fontWeight: '600',
      color: isLight ? '#64748B' : '#9CA3AF',
    },
    optionTextActive: {
      color: '#FFFFFF',
    }
  });

  const languagesList: { code: Language; label: string }[] = [
    { code: 'tr', label: 'TR' },
    { code: 'en', label: 'EN' },
    { code: 'de', label: 'DE' },
    { code: 'fr', label: 'FR' },
    { code: 'ru', label: 'RU' },
    { code: 'ar', label: 'AR' }
  ];

  return (
    <View style={styles.container}>
      
      {/* 1. LEFT COLUMN: Hardware Parameters */}
      <View style={styles.leftColumn}>
        <Text style={styles.sectionTitle}>{language === 'tr' ? 'Donanım Parametreleri' : 'Hardware Configuration'}</Text>
        
        <View style={styles.settingsGroup}>
          {/* Frequency config */}
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="wifi" size={16} color="#3B82F6" style={styles.settingIcon} />
              <View>
                <Text style={styles.settingLabel}>{t.settingsFreq}</Text>
                <Text style={styles.settingSubLabel}>Frekans aralığını değiştirir</Text>
              </View>
            </View>
            <View style={styles.optionGroup}>
              {[250, 500, 1000].map((f) => (
                <TouchableOpacity 
                  key={f}
                  style={[styles.optionBtn, frequency === f && styles.optionBtnActive]}
                  onPress={() => setFrequency(f)}
                >
                  <Text style={[styles.optionText, frequency === f && styles.optionTextActive]}>{f}Mhz</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Pulse voltage config */}
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="flash" size={16} color="#3B82F6" style={styles.settingIcon} />
              <View>
                <Text style={styles.settingLabel}>{t.settingsPulse}</Text>
                <Text style={styles.settingSubLabel}>Sinyal gücü ve derinlik</Text>
              </View>
            </View>
            <View style={styles.optionGroup}>
              {[3.3, 5, 10].map((v) => (
                <TouchableOpacity 
                  key={v}
                  style={[styles.optionBtn, pulseVoltage === v && styles.optionBtnActive]}
                  onPress={() => setPulseVoltage(v)}
                >
                  <Text style={[styles.optionText, pulseVoltage === v && styles.optionTextActive]}>{v}V</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Gain control config */}
          <View style={[styles.settingRow, styles.settingRowLast]}>
            <View style={styles.settingLeft}>
              <Ionicons name="trending-up" size={16} color="#3B82F6" style={styles.settingIcon} />
              <View>
                <Text style={styles.settingLabel}>{t.settingsGain}</Text>
                <Text style={styles.settingSubLabel}>Alıcı sinyal kazanç çarpanı</Text>
              </View>
            </View>
            <View style={styles.optionGroup}>
              {[30, 40, 50].map((g) => (
                <TouchableOpacity 
                  key={g}
                  style={[styles.optionBtn, gain === g && styles.optionBtnActive]}
                  onPress={() => setGain(g)}
                >
                  <Text style={[styles.optionText, gain === g && styles.optionTextActive]}>{g}dB</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* 2. RIGHT COLUMN: Interface & System preferences */}
      <View style={styles.rightColumn}>
        <Text style={styles.sectionTitle}>{language === 'tr' ? 'Arayüz ve Sistem' : 'Interface & System Settings'}</Text>
        
        <View style={styles.settingsGroup}>
          {/* Noise Filtering */}
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="filter" size={16} color="#06B6D4" style={styles.settingIcon} />
              <View>
                <Text style={styles.settingLabel}>{t.settingsNoise}</Text>
                <Text style={styles.settingSubLabel}>Gürültü filtre derecesi</Text>
              </View>
            </View>
            <View style={styles.optionGroup}>
              {['none', 'low', 'medium', 'high'].map((n) => (
                <TouchableOpacity 
                  key={n}
                  style={[styles.optionBtn, noiseFilter === n && styles.optionBtnActive]}
                  onPress={() => setNoiseFilter(n)}
                >
                  <Text style={[styles.optionText, noiseFilter === n && styles.optionTextActive]}>
                    {n.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Resolution */}
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="grid-outline" size={16} color="#06B6D4" style={styles.settingIcon} />
              <View>
                <Text style={styles.settingLabel}>{t.settingsRes}</Text>
                <Text style={styles.settingSubLabel}>Sinyal yoğunluğu çözünürlüğü</Text>
              </View>
            </View>
            <View style={styles.optionGroup}>
              {['low', 'medium', 'high'].map((r) => (
                <TouchableOpacity 
                  key={r}
                  style={[styles.optionBtn, resolution === r && styles.optionBtnActive]}
                  onPress={() => setResolution(r)}
                >
                  <Text style={[styles.optionText, resolution === r && styles.optionTextActive]}>
                    {r.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Language Selection */}
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="language" size={16} color="#06B6D4" style={styles.settingIcon} />
              <View>
                <Text style={styles.settingLabel}>{t.settingsLang}</Text>
                <Text style={styles.settingSubLabel}>Arayüz genel çalışma dili</Text>
              </View>
            </View>
            <View style={styles.optionGroup}>
              {languagesList.map((lang) => (
                <TouchableOpacity 
                  key={lang.code}
                  style={[styles.optionBtn, language === lang.code && styles.optionBtnActive]}
                  onPress={() => setLanguage(lang.code)}
                >
                  <Text style={[styles.optionText, language === lang.code && styles.optionTextActive]}>
                    {lang.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Theme Selection */}
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="color-palette" size={16} color="#06B6D4" style={styles.settingIcon} />
              <View>
                <Text style={styles.settingLabel}>{t.settingsTheme}</Text>
                <Text style={styles.settingSubLabel}>Saha renk şemasını değiştirir</Text>
              </View>
            </View>
            <View style={styles.optionGroup}>
              {['light', 'dark', 'industrial'].map((th) => (
                <TouchableOpacity 
                  key={th}
                  style={[styles.optionBtn, theme === th && styles.optionBtnActive]}
                  onPress={() => setTheme(th as 'light' | 'dark' | 'industrial')}
                >
                  <Text style={[styles.optionText, theme === th && styles.optionTextActive]}>
                    {th.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* RTK GPS toggle */}
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="locate-outline" size={16} color="#22C55E" style={styles.settingIcon} />
              <View>
                <Text style={styles.settingLabel}>RTK Düzeltme Bağlantısı</Text>
                <Text style={styles.settingSubLabel}>Yüksek hassasiyetli GPS kilidi</Text>
              </View>
            </View>
            <Switch value={true} trackColor={{ true: '#22C55E' }} />
          </View>

          {/* Autosave toggle */}
          <View style={[styles.settingRow, styles.settingRowLast]}>
            <View style={styles.settingLeft}>
              <Ionicons name="save-outline" size={16} color="#22C55E" style={styles.settingIcon} />
              <View>
                <Text style={styles.settingLabel}>Otomatik Veri Kaydet</Text>
                <Text style={styles.settingSubLabel}>Verileri otomatik hafızaya depolar</Text>
              </View>
            </View>
            <Switch value={true} trackColor={{ true: '#22C55E' }} />
          </View>
        </View>

      </View>
      
    </View>
  );
}
