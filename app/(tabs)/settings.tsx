import React, { useState } from 'react';
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
    setResolution,
    saveLocation,
    setSaveLocation,
    audioAlertConfig,
    setTargetAudioAlert
  } = useGpr();

  // Stateful toggles for better UI operation
  const [rtkEnabled, setRtkEnabled] = useState(true);
  const [autosaveEnabled, setAutosaveEnabled] = useState(true);

  const languagesList: { code: Language; label: string }[] = [
    { code: 'tr', label: 'TR' },
    { code: 'en', label: 'EN' },
    { code: 'de', label: 'DE' },
    { code: 'fr', label: 'FR' },
    { code: 'ru', label: 'RU' },
    { code: 'ar', label: 'AR' }
  ];

  const isLight = theme === 'light';
  const isDark = theme === 'dark';

  const colors = {
    bg: isLight ? '#F8FAFC' : isDark ? '#0F172A' : '#070913',
    panelBg: isLight ? '#FFFFFF' : isDark ? '#1E293B' : '#0D1220',
    border: isLight ? '#E2E8F0' : isDark ? '#334155' : '#1F2937',
    text: isLight ? '#0F172A' : '#F9FAFB',
    subText: isLight ? '#475569' : '#9CA3AF',
    accent: '#F59E0B',
    optionBg: isLight ? '#E2E8F0' : isDark ? '#2D3748' : '#1E293B',
    optionActiveBg: '#F59E0B',
    optionActiveText: '#090D16',
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bg,
      paddingLeft: 75, // Shift content right to clear Left Sidebar
      flexDirection: 'row', // Side-by-side columns
    },
    leftColumn: {
      flex: 0.5,
      paddingHorizontal: 16,
      paddingTop: 16,
      borderRightWidth: 1,
      borderRightColor: colors.border,
    },
    rightColumn: {
      flex: 0.5,
      paddingHorizontal: 16,
      paddingTop: 16,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 10,
      paddingLeft: 4,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingBottom: 6,
    },
    sectionTitle: {
      fontSize: 10.5,
      fontWeight: '800',
      color: colors.accent,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    settingsGroup: {
      backgroundColor: colors.panelBg,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 4,
      marginBottom: 16,
      overflow: 'hidden',
    },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
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
      fontSize: 12.5,
      fontWeight: '700',
      color: colors.text,
    },
    settingSubLabel: {
      fontSize: 9.5,
      color: colors.subText,
      marginTop: 2,
    },
    optionGroup: {
      flexDirection: 'row',
      backgroundColor: colors.optionBg,
      borderRadius: 6,
      padding: 2,
    },
    optionBtn: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      marginHorizontal: 1,
    },
    optionBtnActive: {
      backgroundColor: colors.optionActiveBg,
    },
    optionText: {
      fontSize: 9.5,
      fontWeight: '700',
      color: colors.subText,
    },
    optionTextActive: {
      color: colors.optionActiveText,
      fontWeight: '800',
    }
  });

  return (
    <View style={styles.container}>
      
      {/* 1. LEFT COLUMN: Hardware Parameters */}
      <ScrollView 
        style={styles.leftColumn} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <View style={styles.headerRow}>
          <Ionicons name="hardware-chip-outline" size={14} color={colors.accent} />
          <Text style={styles.sectionTitle}>{language === 'tr' ? 'Donanım Parametreleri' : 'Hardware Configuration'}</Text>
        </View>
        
        <View style={styles.settingsGroup}>
          {/* Frequency config */}
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="wifi" size={16} color={colors.accent} style={styles.settingIcon} />
              <View>
                <Text style={styles.settingLabel}>{t.settingsFreq}</Text>
                <Text style={styles.settingSubLabel}>{language === 'tr' ? 'Anten merkez frekansı' : 'Antenna center frequency'}</Text>
              </View>
            </View>
            <View style={styles.optionGroup}>
              {[250, 500, 1000].map((f) => (
                <TouchableOpacity 
                  key={f}
                  style={[styles.optionBtn, frequency === f && styles.optionBtnActive]}
                  onPress={() => setFrequency(f)}
                >
                  <Text style={[styles.optionText, frequency === f && styles.optionTextActive]}>{f} MHz</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Pulse voltage config */}
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="flash" size={16} color={colors.accent} style={styles.settingIcon} />
              <View>
                <Text style={styles.settingLabel}>{t.settingsPulse}</Text>
                <Text style={styles.settingSubLabel}>{language === 'tr' ? 'Anten çıkış gücü gerilimi' : 'Antenna output voltage'}</Text>
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
              <Ionicons name="trending-up" size={16} color={colors.accent} style={styles.settingIcon} />
              <View>
                <Text style={styles.settingLabel}>{t.settingsGain}</Text>
                <Text style={styles.settingSubLabel}>{language === 'tr' ? 'Alıcı sinyal kazanç çarpanı' : 'Receiver gain multiplier'}</Text>
              </View>
            </View>
            <View style={styles.optionGroup}>
              {[30, 40, 50].map((g) => (
                <TouchableOpacity 
                  key={g}
                  style={[styles.optionBtn, gain === g && styles.optionBtnActive]}
                  onPress={() => setGain(g)}
                >
                  <Text style={[styles.optionText, gain === g && styles.optionTextActive]}>{g} dB</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Audio Alert Settings */}
        <View style={[styles.headerRow, { marginTop: 16 }]}>
          <Ionicons name="volume-high-outline" size={14} color={colors.accent} />
          <Text style={styles.sectionTitle}>{language === 'tr' ? 'Sesli Uyarı Ayarları' : 'Audio Alert Settings'}</Text>
        </View>
        
        <View style={styles.settingsGroup}>
          {[
            { id: 'gold', label: language === 'tr' ? 'Altın Sinyali Uyarısı' : 'Gold Target Alert' },
            { id: 'silver', label: language === 'tr' ? 'Gümüş Sinyali Uyarısı' : 'Silver Target Alert' },
            { id: 'copper', label: language === 'tr' ? 'Bakır Sinyali Uyarısı' : 'Copper Target Alert' },
            { id: 'iron', label: language === 'tr' ? 'Demir Sinyali Uyarısı' : 'Ferrous Target Alert' },
            { id: 'concrete', label: language === 'tr' ? 'Beton Sinyali Uyarısı' : 'Concrete Target Alert' },
            { id: 'water', label: language === 'tr' ? 'Su Sinyali Uyarısı' : 'Aqueous Target Alert' },
            { id: 'void', label: language === 'tr' ? 'Boşluk Sinyali Uyarısı' : 'Void Target Alert' },
            { id: 'tunnel', label: language === 'tr' ? 'Tünel Sinyali Uyarısı' : 'Tunnel Target Alert' }
          ].map((target, idx) => {
            const isLast = idx === 7;
            const currentMode = audioAlertConfig[target.id] || 'beep';
            return (
              <View key={target.id} style={[styles.settingRow, isLast && styles.settingRowLast]}>
                <View style={[styles.settingLeft, { marginRight: 8 }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.settingLabel, { fontSize: 11.5 }]} numberOfLines={1}>{target.label}</Text>
                    <Text style={styles.settingSubLabel}>Mode: {currentMode.toUpperCase()}</Text>
                  </View>
                </View>
                <View style={styles.optionGroup}>
                  {[
                    { code: 'speech', label: language === 'tr' ? 'SES' : 'TALK' },
                    { code: 'beep', label: language === 'tr' ? 'BİP' : 'BEEP' },
                    { code: 'siren', label: language === 'tr' ? 'SİREN' : 'SIREN' },
                    { code: 'chime', label: language === 'tr' ? 'MELO' : 'CHM' },
                    { code: 'mute', label: language === 'tr' ? 'SESSİZ' : 'MUTE' }
                  ].map((type) => (
                    <TouchableOpacity 
                      key={type.code}
                      style={[
                        styles.optionBtn, 
                        { paddingHorizontal: 4, paddingVertical: 2 },
                        currentMode === type.code && styles.optionBtnActive
                      ]}
                      onPress={() => setTargetAudioAlert(target.id, type.code as any)}
                    >
                      <Text style={[
                        styles.optionText, 
                        { fontSize: 8.5, color: currentMode === type.code ? colors.optionActiveText : colors.subText },
                        currentMode === type.code && styles.optionTextActive
                      ]}>
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* 2. RIGHT COLUMN: Interface & System preferences */}
      <ScrollView 
        style={styles.rightColumn} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <View style={styles.headerRow}>
          <Ionicons name="options-outline" size={14} color={colors.accent} />
          <Text style={styles.sectionTitle}>{language === 'tr' ? 'Arayüz ve Sistem' : 'Interface & System Settings'}</Text>
        </View>
        
        <View style={styles.settingsGroup}>
          {/* Noise Filtering */}
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="filter" size={16} color="#06B6D4" style={styles.settingIcon} />
              <View>
                <Text style={styles.settingLabel}>{t.settingsNoise}</Text>
                <Text style={styles.settingSubLabel}>{language === 'tr' ? 'Gürültü filtre derecesi' : 'Noise filter levels'}</Text>
              </View>
            </View>
            <View style={styles.optionGroup}>
              {['none', 'low', 'medium', 'high'].map((n) => (
                <TouchableOpacity 
                  key={n}
                  style={[styles.optionBtn, noiseFilter === n && styles.optionBtnActive]}
                  onPress={() => setNoiseFilter(n)}
                >
                  <Text style={[styles.optionText, { color: noiseFilter === n ? colors.optionActiveText : colors.subText }, noiseFilter === n && styles.optionTextActive]}>
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
                <Text style={styles.settingSubLabel}>{language === 'tr' ? 'Sinyal yoğunluğu çözünürlüğü' : 'Signal density resolution'}</Text>
              </View>
            </View>
            <View style={styles.optionGroup}>
              {['low', 'medium', 'high'].map((r) => (
                <TouchableOpacity 
                  key={r}
                  style={[styles.optionBtn, resolution === r && styles.optionBtnActive]}
                  onPress={() => setResolution(r)}
                >
                  <Text style={[styles.optionText, { color: resolution === r ? colors.optionActiveText : colors.subText }, resolution === r && styles.optionTextActive]}>
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
                <Text style={styles.settingSubLabel}>{language === 'tr' ? 'Arayüz genel çalışma dili' : 'System translation language'}</Text>
              </View>
            </View>
            <View style={styles.optionGroup}>
              {languagesList.map((lang) => (
                <TouchableOpacity 
                  key={lang.code}
                  style={[styles.optionBtn, language === lang.code && styles.optionBtnActive]}
                  onPress={() => setLanguage(lang.code)}
                >
                  <Text style={[styles.optionText, { color: language === lang.code ? colors.optionActiveText : colors.subText }, language === lang.code && styles.optionTextActive]}>
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
                <Text style={styles.settingSubLabel}>{language === 'tr' ? 'Saha renk şemasını değiştirir' : 'Field layout color scheme'}</Text>
              </View>
            </View>
            <View style={styles.optionGroup}>
              {['light', 'dark', 'industrial'].map((th) => (
                <TouchableOpacity 
                  key={th}
                  style={[styles.optionBtn, theme === th && styles.optionBtnActive]}
                  onPress={() => setTheme(th as any)}
                >
                  <Text style={[styles.optionText, { color: theme === th ? colors.optionActiveText : colors.subText }, theme === th && styles.optionTextActive]}>
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
                <Text style={styles.settingLabel}>{language === 'tr' ? 'RTK Düzeltme Bağlantısı' : 'RTK Correction link'}</Text>
                <Text style={styles.settingSubLabel}>{language === 'tr' ? 'Yüksek hassasiyetli GPS kilidi' : 'High precision GPS positioning'}</Text>
              </View>
            </View>
            <Switch 
              value={rtkEnabled} 
              onValueChange={setRtkEnabled}
              trackColor={{ false: colors.optionBg, true: 'rgba(245, 158, 11, 0.4)' }}
              thumbColor={rtkEnabled ? colors.accent : colors.subText}
            />
          </View>

          {/* Autosave toggle */}
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="save-outline" size={16} color="#22C55E" style={styles.settingIcon} />
              <View>
                <Text style={styles.settingLabel}>{language === 'tr' ? 'Otomatik Veri Kaydet' : 'Autosave Data'}</Text>
                <Text style={styles.settingSubLabel}>{language === 'tr' ? 'Verileri otomatik hafızaya depolar' : 'Save logs automatically to storage'}</Text>
              </View>
            </View>
            <Switch 
              value={autosaveEnabled} 
              onValueChange={setAutosaveEnabled}
              trackColor={{ false: colors.optionBg, true: 'rgba(245, 158, 11, 0.4)' }}
              thumbColor={autosaveEnabled ? colors.accent : colors.subText}
            />
          </View>

          {/* Save Location Selector */}
          <View style={[styles.settingRow, styles.settingRowLast]}>
            <View style={styles.settingLeft}>
              <Ionicons name="folder-open-outline" size={16} color="#EF4444" style={styles.settingIcon} />
              <View>
                <Text style={styles.settingLabel}>{language === 'tr' ? 'Kayıt Yolu Konumu' : 'Logs Save Destination'}</Text>
                <Text style={styles.settingSubLabel}>{language === 'tr' ? 'GPR tarama dosyalarının kaydedileceği alan' : 'Select partition path for GPR scans'}</Text>
              </View>
            </View>
            <View style={styles.optionGroup}>
              {[
                { code: 'local', label: language === 'tr' ? 'BELLEK' : 'LOCAL' },
                { code: 'sd_card', label: language === 'tr' ? 'SD KART' : 'SD CARD' },
                { code: 'cloud', label: language === 'tr' ? 'BULUT' : 'CLOUD' },
                { code: 'documents', label: language === 'tr' ? 'BELGELER' : 'DOCS' }
              ].map((loc) => (
                <TouchableOpacity 
                  key={loc.code}
                  style={[styles.optionBtn, saveLocation === loc.code && styles.optionBtnActive]}
                  onPress={() => setSaveLocation(loc.code)}
                >
                  <Text style={[styles.optionText, { color: saveLocation === loc.code ? colors.optionActiveText : colors.subText }, saveLocation === loc.code && styles.optionTextActive]}>
                    {loc.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
      
    </View>
  );
}
