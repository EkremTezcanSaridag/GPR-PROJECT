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
    antennaType,
    setAntennaType,
    resolution,
    setResolution
  } = useGpr();

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
    sectionTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: '#3B82F6',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: 10,
      marginTop: 8,
      paddingLeft: 4,
    },
    settingsGroup: {
      backgroundColor: isLight ? '#FFFFFF' : isDark ? '#1E293B' : '#1C2537',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isLight ? '#E2E8F0' : '#374151',
      paddingVertical: 4,
      marginBottom: 20,
      overflow: 'hidden',
    },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
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
      marginRight: 12,
    },
    settingLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: isLight ? '#0F172A' : '#F9FAFB',
    },
    settingSubLabel: {
      fontSize: 11,
      color: isLight ? '#64748B' : '#9CA3AF',
      marginTop: 2,
    },
    // Selector options
    optionGroup: {
      flexDirection: 'row',
      backgroundColor: isLight ? '#F1F5F9' : '#2D3748',
      borderRadius: 8,
      padding: 2,
    },
    optionBtn: {
      paddingHorizontal: 8,
      paddingVertical: 5,
      borderRadius: 6,
    },
    optionBtnActive: {
      backgroundColor: '#3B82F6',
    },
    optionText: {
      fontSize: 11,
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
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Section 1: Donanım ve Sinyal Parametreleri */}
        <Text style={styles.sectionTitle}>{language === 'tr' ? 'Donanım Ayarları' : 'Hardware Settings'}</Text>
        <View style={styles.settingsGroup}>
          
          {/* Anten Frekansı */}
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="wifi" size={18} color="#3B82F6" style={styles.settingIcon} />
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
                  <Text style={[styles.optionText, frequency === f && styles.optionBtnTextActive]}>{f}Mhz</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Puls Voltajı */}
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="flash" size={18} color="#3B82F6" style={styles.settingIcon} />
              <View>
                <Text style={styles.settingLabel}>{t.settingsPulse}</Text>
                <Text style={styles.settingSubLabel}>Sinyal gücü ve derinliği etkiler</Text>
              </View>
            </View>
            <View style={styles.optionGroup}>
              {[3.3, 5, 10].map((v) => (
                <TouchableOpacity 
                  key={v}
                  style={[styles.optionBtn, pulseVoltage === v && styles.optionBtnActive]}
                  onPress={() => setPulseVoltage(v)}
                >
                  <Text style={[styles.optionText, pulseVoltage === v && styles.optionBtnTextActive]}>{v}V</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Sinyal Kazancı (Gain) */}
          <View style={styles.settingRowLast}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name="trending-up" size={18} color="#3B82F6" style={styles.settingIcon} />
                <View>
                  <Text style={styles.settingLabel}>{t.settingsGain}</Text>
                  <Text style={styles.settingSubLabel}>Yansıma hassasiyeti kazancı</Text>
                </View>
              </View>
              <View style={styles.optionGroup}>
                {[30, 40, 50].map((g) => (
                  <TouchableOpacity 
                    key={g}
                    style={[styles.optionBtn, gain === g && styles.optionBtnActive]}
                    onPress={() => setGain(g)}
                  >
                    <Text style={[styles.optionText, gain === g && styles.optionBtnTextActive]}>{g}dB</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

        </View>

        {/* Section 2: Filtre ve Arayüz Ayarları */}
        <Text style={styles.sectionTitle}>{language === 'tr' ? 'Arayüz ve Filtreler' : 'Interface & Filters'}</Text>
        <View style={styles.settingsGroup}>
          
          {/* Gürültü Filtreleme */}
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="filter" size={18} color="#06B6D4" style={styles.settingIcon} />
              <View>
                <Text style={styles.settingLabel}>{t.settingsNoise}</Text>
                <Text style={styles.settingSubLabel}>Zemin gürültü filtresi derecesi</Text>
              </View>
            </View>
            <View style={styles.optionGroup}>
              {['none', 'low', 'medium', 'high'].map((n) => (
                <TouchableOpacity 
                  key={n}
                  style={[styles.optionBtn, noiseFilter === n && styles.optionBtnActive]}
                  onPress={() => setNoiseFilter(n)}
                >
                  <Text style={[styles.optionText, noiseFilter === n && styles.optionBtnTextActive]}>
                    {n.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Tarama Çözünürlüğü */}
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="grid-outline" size={18} color="#06B6D4" style={styles.settingIcon} />
              <View>
                <Text style={styles.settingLabel}>{t.settingsRes}</Text>
                <Text style={styles.settingSubLabel}>Tarama hassasiyeti yoğunluğu</Text>
              </View>
            </View>
            <View style={styles.optionGroup}>
              {['low', 'medium', 'high'].map((r) => (
                <TouchableOpacity 
                  key={r}
                  style={[styles.optionBtn, resolution === r && styles.optionBtnActive]}
                  onPress={() => setResolution(r)}
                >
                  <Text style={[styles.optionText, resolution === r && styles.optionBtnTextActive]}>
                    {r.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Dil Seçeneği */}
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="language" size={18} color="#06B6D4" style={styles.settingIcon} />
              <View>
                <Text style={styles.settingLabel}>{t.settingsLang}</Text>
                <Text style={styles.settingSubLabel}>Uygulama genel dili</Text>
              </View>
            </View>
            <View style={styles.optionGroup}>
              {languagesList.map((lang) => (
                <TouchableOpacity 
                  key={lang.code}
                  style={[styles.optionBtn, language === lang.code && styles.optionBtnActive]}
                  onPress={() => setLanguage(lang.code)}
                >
                  <Text style={[styles.optionText, language === lang.code && styles.optionBtnTextActive]}>
                    {lang.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Tema Seçeneği */}
          <View style={styles.settingRowLast}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name="color-palette" size={18} color="#06B6D4" style={styles.settingIcon} />
                <View>
                  <Text style={styles.settingLabel}>{t.settingsTheme}</Text>
                  <Text style={styles.settingSubLabel}>Renk paletini değiştirir</Text>
                </View>
              </View>
              <View style={styles.optionGroup}>
                {['light', 'dark', 'industrial'].map((th) => (
                  <TouchableOpacity 
                    key={th}
                    style={[styles.optionBtn, theme === th && styles.optionBtnActive]}
                    onPress={() => setTheme(th as 'light' | 'dark' | 'industrial')}
                  >
                    <Text style={[styles.optionText, theme === th && styles.optionBtnTextActive]}>
                      {th.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

        </View>

        {/* Section 3: GPS ve Sistem Ayarları */}
        <Text style={styles.sectionTitle}>{language === 'tr' ? 'Sistem ve Depolama' : 'System & Storage'}</Text>
        <View style={styles.settingsGroup}>
          
          {/* RTK Düzeltmesi (GPS) */}
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="locate-outline" size={18} color="#22C55E" style={styles.settingIcon} />
              <View>
                <Text style={styles.settingLabel}>RTK Düzeltmesi</Text>
                <Text style={styles.settingSubLabel}>GPS koordinat hassasiyeti</Text>
              </View>
            </View>
            <Switch value={true} trackColor={{ true: '#22C55E' }} />
          </View>

          {/* Otomatik Kaydet */}
          <View style={styles.settingRowLast}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name="save-outline" size={18} color="#22C55E" style={styles.settingIcon} />
                <View>
                  <Text style={styles.settingLabel}>Otomatik Kaydet</Text>
                  <Text style={styles.settingSubLabel}>Taramaları yerel hafızaya kaydeder</Text>
                </View>
              </View>
              <Switch value={true} trackColor={{ true: '#22C55E' }} />
            </View>
          </View>

        </View>

      </ScrollView>
    </View>
  );
}
