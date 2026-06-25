import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Circle, G, Line } from 'react-native-svg';
import { useLanguage } from '../../context/LanguageContext';
import { useGpr, ScanLog } from '../../context/GprContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function LogsScreen() {
  const { t, language } = useLanguage();
  const { theme, logs, exportReport } = useGpr();

  // Active view tab for the right column: 'map' | 'timeline'
  const [activeSideView, setActiveSideView] = useState<'map' | 'timeline'>('map');
  const [filterMaterial, setFilterMaterial] = useState<string>('');
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv' | 'png' | null>(null);

  // Local state for export location selection modal
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [pendingLogId, setPendingLogId] = useState<string | null>(null);
  const [pendingFormat, setPendingFormat] = useState<'pdf' | 'csv' | 'png' | null>(null);

  const isLight = theme === 'light';
  const isDark = theme === 'dark';

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isLight ? '#F8FAFC' : isDark ? '#0F172A' : '#111827',
      paddingLeft: 75, // Shift content right to clear Left Sidebar
      flexDirection: 'row', // Split screen columns
    },
    // Left Column (Logs list and filters) - 40% width
    leftColumn: {
      flex: 0.42,
      padding: 16,
      borderRightWidth: 1,
      borderRightColor: isLight ? '#E2E8F0' : '#374151',
    },
    // Right Column (Map, Timeline) - 58% width
    rightColumn: {
      flex: 0.58,
      padding: 16,
    },
    filterBar: {
      backgroundColor: isLight ? '#FFFFFF' : isDark ? '#1E293B' : '#1C2537',
      padding: 8,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: isLight ? '#E2E8F0' : '#374151',
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    searchInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isLight ? '#F1F5F9' : '#2D3748',
      borderRadius: 6,
      paddingHorizontal: 8,
      flex: 1,
      height: 32,
    },
    searchInput: {
      fontSize: 12,
      color: isLight ? '#0F172A' : '#F9FAFB',
      marginLeft: 4,
      flex: 1,
    },
    // Log items
    logCard: {
      backgroundColor: isLight ? '#FFFFFF' : isDark ? '#1E293B' : '#1C2537',
      borderRadius: 12,
      padding: 14,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: isLight ? '#E2E8F0' : '#374151',
    },
    logHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: isLight ? '#F1F5F9' : '#2D3748',
      paddingBottom: 6,
      marginBottom: 8,
    },
    logId: {
      fontSize: 13,
      fontWeight: '800',
      color: isLight ? '#0F172A' : '#F9FAFB',
    },
    logDate: {
      fontSize: 11,
      color: isLight ? '#64748B' : '#9CA3AF',
    },
    logRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: 2,
    },
    logLabel: {
      fontSize: 11,
      color: isLight ? '#64748B' : '#9CA3AF',
    },
    logValue: {
      fontSize: 11,
      fontWeight: '600',
      color: isLight ? '#0F172A' : '#E5E7EB',
      textAlign: 'right',
    },
    anomBadge: {
      backgroundColor: '#EFF6FF',
      borderRadius: 4,
      paddingHorizontal: 4,
      paddingVertical: 1,
      marginHorizontal: 1,
      borderWidth: 0.5,
      borderColor: '#BFDBFE',
    },
    anomBadgeText: {
      fontSize: 9,
      fontWeight: '600',
      color: '#1E40AF',
    },
    exportRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 8,
      borderTopWidth: 1,
      borderTopColor: isLight ? '#F1F5F9' : '#2D3748',
      paddingTop: 8,
    },
    exportBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 6,
      paddingVertical: 4,
      borderRadius: 5,
      backgroundColor: isLight ? '#F1F5F9' : '#2D3748',
      marginLeft: 6,
    },
    exportBtnText: {
      fontSize: 9,
      fontWeight: '700',
      color: isLight ? '#475569' : '#E2E8F0',
      marginLeft: 2,
    },
    // Toggle sub views
    viewToggleGroup: {
      flexDirection: 'row',
      backgroundColor: isLight ? '#FFFFFF' : isDark ? '#1E293B' : '#1C2537',
      borderRadius: 8,
      padding: 3,
      borderWidth: 1,
      borderColor: isLight ? '#E2E8F0' : '#374151',
      marginBottom: 16,
    },
    viewToggleBtn: {
      flex: 1,
      paddingVertical: 8,
      alignItems: 'center',
      borderRadius: 6,
    },
    viewToggleBtnActive: {
      backgroundColor: '#3B82F6',
    },
    viewToggleText: {
      fontSize: 11,
      fontWeight: '600',
      color: isLight ? '#64748B' : '#9CA3AF',
    },
    viewToggleTextActive: {
      color: '#FFFFFF',
    },
    // Visualizations on the right column
    rightPanelCard: {
      backgroundColor: isLight ? '#FFFFFF' : isDark ? '#1E293B' : '#1C2537',
      borderRadius: 14,
      padding: 12,
      borderWidth: 1,
      borderColor: isLight ? '#E2E8F0' : '#374151',
      flex: 1,
    },
    // Map View
    mapContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    // Timeline Card
    timelineCard: {
      flexDirection: 'row',
      marginBottom: 10,
    },
    timelineLineContainer: {
      width: 20,
      alignItems: 'center',
    },
    timelineDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: '#3B82F6',
      marginTop: 6,
    },
    timelineLine: {
      flex: 1,
      width: 2,
      backgroundColor: isLight ? '#E2E8F0' : '#374151',
    },
    // Export Indicator Modal
    exportingContainer: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    exportingBox: {
      width: 220,
      backgroundColor: isLight ? '#FFFFFF' : '#1E293B',
      borderRadius: 12,
      padding: 20,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: isLight ? '#E2E8F0' : '#374151',
    },
    exportingText: {
      fontSize: 13,
      fontWeight: '600',
      color: isLight ? '#0F172A' : '#F9FAFB',
      marginTop: 10,
    }
  });

  const handleExportClick = (format: 'pdf' | 'csv' | 'png', logId: string) => {
    setPendingLogId(logId);
    setPendingFormat(format);
    setShowLocationPicker(true);
  };

  const handleExportExecute = async (locCode: 'local' | 'sd_card' | 'cloud' | 'documents') => {
    setShowLocationPicker(false);
    if (!pendingFormat || !pendingLogId) return;

    const format = pendingFormat;
    const logId = pendingLogId;

    setExportingId(logId);
    setExportFormat(format);
    try {
      const filename = await exportReport(format, logId);
      
      const locLabel = 
        locCode === 'sd_card' ? (language === 'tr' ? 'SD Kart Bölümü' : 'SD Card Partition') :
        locCode === 'cloud' ? (language === 'tr' ? 'Bulut Depolama Sunucusu' : 'Cloud Remote Server') :
        locCode === 'documents' ? (language === 'tr' ? 'Belgeler Dizini' : 'Documents Directory') :
        (language === 'tr' ? 'Dahili Bellek Klasörü' : 'Internal memory folder');

      const locPrefix = 
        locCode === 'sd_card' ? 'SD_CARD/GPR-Logs/' :
        locCode === 'cloud' ? 'CLOUD/Uploads/' :
        locCode === 'documents' ? 'Documents/' :
        'InternalStorage/GPR-Logs/';

      Alert.alert(
        language === 'tr' ? 'Rapor Kaydedildi' : 'Report Exported',
        language === 'tr' 
          ? `Dosya başarıyla oluşturuldu ve ${locLabel} üzerine depolandı:\n\n${locPrefix}${filename}`
          : `File successfully generated and stored on ${locLabel}:\n\n${locPrefix}${filename}`
      );
    } catch (e) {
      console.log(e);
    } finally {
      setExportingId(null);
      setExportFormat(null);
      setPendingFormat(null);
      setPendingLogId(null);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (!filterMaterial) return true;
    return log.anomalies.some(anom => 
      anom.toLowerCase().includes(filterMaterial.toLowerCase())
    );
  });

  // Calculate SVG dimensions dynamically for the right map viewport
  const mapSvgWidth = SCREEN_WIDTH * 0.58 - 56;

  return (
    <View style={styles.container}>
      {/* Export Loader Overlay */}
      {exportingId !== null && (
        <View style={styles.exportingContainer}>
          <View style={styles.exportingBox}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.exportingText}>
              {language === 'tr' 
                ? `${exportFormat?.toUpperCase()} Raporu Oluşturuluyor...` 
                : `Generating ${exportFormat?.toUpperCase()} Report...`}
            </Text>
          </View>
        </View>
      )}

      {/* Save Destination Selection Overlay Modal */}
      {showLocationPicker && (
        <View style={styles.exportingContainer}>
          <View style={[styles.exportingBox, { width: 320, padding: 16 }]}>
            <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '800', marginBottom: 12, textAlign: 'center' }}>
              {language === 'tr' ? 'KAYIT DİZİNİ SEÇİNİZ' : 'SELECT SAVE DESTINATION'}
            </Text>
            
            <View style={{ gap: 8, width: '100%', marginBottom: 12 }}>
              {[
                { code: 'local' as const, label: language === 'tr' ? 'Dahili Depolama Belleği' : 'Internal Storage Volume', desc: 'InternalStorage/GPR-Logs/' },
                { code: 'sd_card' as const, label: language === 'tr' ? 'Harici Micro-SD Kart' : 'External Micro-SD Card', desc: 'SD_CARD/GPR-Logs/' },
                { code: 'cloud' as const, label: language === 'tr' ? 'Uzak Bulut Sunucusu' : 'Remote Cloud Server', desc: 'CLOUD/Uploads/' },
                { code: 'documents' as const, label: language === 'tr' ? 'Sistem Belgeler Klasörü' : 'System Documents Folder', desc: 'Documents/' }
              ].map((dest) => (
                <TouchableOpacity 
                  key={dest.code} 
                  style={{ backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#374151', borderRadius: 8, padding: 8 }}
                  onPress={() => handleExportExecute(dest.code)}
                >
                  <Text style={{ color: '#F59E0B', fontSize: 10.5, fontWeight: '700' }}>{dest.label}</Text>
                  <Text style={{ color: '#9CA3AF', fontSize: 8.5, marginTop: 2 }}>{dest.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              style={{ paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#EF4444', borderRadius: 6, width: '100%', alignItems: 'center' }} 
              onPress={() => setShowLocationPicker(false)}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '700' }}>{language === 'tr' ? 'İptal' : 'Cancel'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 1. LEFT COLUMN: Logs scroll list */}
      <View style={styles.leftColumn}>
        <View style={styles.filterBar}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={14} color={isLight ? '#64748B' : '#9CA3AF'} />
            <TextInput
              placeholder={language === 'tr' ? 'Malzeme aratın...' : 'Search material...'}
              placeholderTextColor={isLight ? '#94A3B8' : '#64748B'}
              style={styles.searchInput}
              value={filterMaterial}
              onChangeText={setFilterMaterial}
            />
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {filteredLogs.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 32 }}>
              <Ionicons name="folder-open-outline" size={32} color={isLight ? '#94A3B8' : '#475569'} />
              <Text style={[styles.logLabel, { marginTop: 8 }]}>
                {language === 'tr' ? 'Kayıt bulunamadı.' : 'No records found.'}
              </Text>
            </View>
          ) : (
            filteredLogs.map(log => (
              <View key={log.id} style={styles.logCard}>
                <View style={styles.logHeader}>
                  <Text style={styles.logId}>{log.id}</Text>
                  <Text style={styles.logDate}>{log.date} {log.time}</Text>
                </View>

                <View style={styles.logRow}>
                  <Text style={styles.logLabel}>{t.gpsLoc}</Text>
                  <Text style={styles.logValue}>{log.gps}</Text>
                </View>
                <View style={styles.logRow}>
                  <Text style={styles.logLabel}>{t.operator}</Text>
                  <Text style={styles.logValue}>{log.operator}</Text>
                </View>
                <View style={styles.logRow}>
                  <Text style={styles.logLabel}>{t.duration}</Text>
                  <Text style={styles.logValue}>{log.duration} s</Text>
                </View>
                <View style={styles.logRow}>
                  <Text style={styles.logLabel}>{t.results}</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: 120 }}>
                    {log.anomalies.map((anom, idx) => (
                      <View key={idx} style={styles.anomBadge}>
                        <Text style={styles.anomBadgeText}>{anom}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Export Buttons */}
                <View style={styles.exportRow}>
                  <TouchableOpacity style={styles.exportBtn} onPress={() => handleExportClick('pdf', log.id)}>
                    <Ionicons name="document-text" size={10} color={isLight ? '#475569' : '#E2E8F0'} />
                    <Text style={styles.exportBtnText}>PDF</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.exportBtn} onPress={() => handleExportClick('csv', log.id)}>
                    <Ionicons name="grid" size={10} color={isLight ? '#475569' : '#E2E8F0'} />
                    <Text style={styles.exportBtnText}>CSV</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.exportBtn} onPress={() => handleExportClick('png', log.id)}>
                    <Ionicons name="image" size={10} color={isLight ? '#475569' : '#E2E8F0'} />
                    <Text style={styles.exportBtnText}>PNG</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>

      {/* 2. RIGHT COLUMN: Visualizations (Map and Timeline) */}
      <View style={styles.rightColumn}>
        
        {/* Toggle Right Sub-View (Map or Timeline) */}
        <View style={styles.viewToggleGroup}>
          <TouchableOpacity 
            style={[styles.viewToggleBtn, activeSideView === 'map' && styles.viewToggleBtnActive]}
            onPress={() => setActiveSideView('map')}
          >
            <Text style={[styles.viewToggleText, activeSideView === 'map' && styles.viewToggleTextActive]}>
              {language === 'tr' ? 'Harita Kapsama Raporu' : 'GPS Coverage Map'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.viewToggleBtn, activeSideView === 'timeline' && styles.viewToggleBtnActive]}
            onPress={() => setActiveSideView('timeline')}
          >
            <Text style={[styles.viewToggleText, activeSideView === 'timeline' && styles.viewToggleTextActive]}>
              {language === 'tr' ? 'Zaman Akışı' : 'Timeline View'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Dynamic Display Panels */}
        <View style={styles.rightPanelCard}>
          {activeSideView === 'map' ? (
            <View style={styles.mapContainer}>
              <Text style={[styles.logId, { alignSelf: 'flex-start', marginBottom: 4 }]}>{t.scanCoverageMap}</Text>
              
              {/* GPS RTK Coverage Grid overlay */}
              <Svg width="100%" height="90%">
                {/* Coordinates grids */}
                <Line x1="0" y1="40" x2={mapSvgWidth} y2="40" stroke={isLight ? '#E2E8F0' : '#1F2937'} strokeWidth="1" />
                <Line x1="0" y1="85" x2={mapSvgWidth} y2="85" stroke={isLight ? '#E2E8F0' : '#1F2937'} strokeWidth="1" />
                <Line x1="0" y1="130" x2={mapSvgWidth} y2="130" stroke={isLight ? '#E2E8F0' : '#1F2937'} strokeWidth="1" />
                <Line x1="0" y1="175" x2={mapSvgWidth} y2="175" stroke={isLight ? '#E2E8F0' : '#1F2937'} strokeWidth="1" />
                <Line x1="0" y1="220" x2={mapSvgWidth} y2="220" stroke={isLight ? '#E2E8F0' : '#1F2937'} strokeWidth="1" />
                
                {/* Vertical Lines */}
                <Line x1="50" y1="0" x2="50" y2="250" stroke={isLight ? '#E2E8F0' : '#1F2937'} strokeWidth="1" />
                <Line x1="100" y1="0" x2="100" y2="250" stroke={isLight ? '#E2E8F0' : '#1F2937'} strokeWidth="1" />
                <Line x1="150" y1="0" x2="150" y2="250" stroke={isLight ? '#E2E8F0' : '#1F2937'} strokeWidth="1" />
                <Line x1="200" y1="0" x2="200" y2="250" stroke={isLight ? '#E2E8F0' : '#1F2937'} strokeWidth="1" />
                <Line x1="250" y1="0" x2="250" y2="250" stroke={isLight ? '#E2E8F0' : '#1F2937'} strokeWidth="1" />
                <Line x1="300" y1="0" x2="300" y2="250" stroke={isLight ? '#E2E8F0' : '#1F2937'} strokeWidth="1" />

                {/* Scan paths */}
                <Path 
                  d="M 50 180 L 120 150 L 220 190 L 280 130 L 240 80 L 150 60 L 80 100" 
                  fill="none" 
                  stroke="#3B82F6" 
                  strokeWidth="3.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />

                {/* Cover Heatmap overlay */}
                <Path 
                  d="M 90 140 L 250 170 L 290 110 L 220 60 L 70 90 Z" 
                  fill="#22C55E" 
                  opacity="0.15" 
                  stroke="#22C55E" 
                  strokeWidth="1" 
                  strokeDasharray="4 4" 
                />

                {/* Waypoints */}
                <G>
                  <Circle cx="120" cy="150" r="8" fill="#EF4444" opacity="0.35" />
                  <Circle cx="120" cy="150" r="3" fill="#EF4444" />
                  
                  <Circle cx="240" cy="80" r="8" fill="#3B82F6" opacity="0.35" />
                  <Circle cx="240" cy="80" r="3" fill="#3B82F6" />

                  <Circle cx="80" cy="100" r="8" fill="#F59E0B" opacity="0.35" />
                  <Circle cx="80" cy="100" r="3" fill="#F59E0B" />
                </G>
              </Svg>

              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, alignSelf: 'flex-end' }}>
                <Ionicons name="pin" size={12} color="#EF4444" />
                <Text style={[styles.logLabel, { fontSize: 9, fontWeight: '700', marginLeft: 2 }]}>
                  RTK GPS: FIXED (PASS PATH STABILITY LOCK)
                </Text>
              </View>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.logId, { marginBottom: 12 }]}>{language === 'tr' ? 'Kronolojik Kayıt Akışı' : 'Timeline Scan Stream'}</Text>
              {filteredLogs.map((log, index) => (
                <View key={log.id} style={styles.timelineCard}>
                  <View style={styles.timelineLineContainer}>
                    <View style={styles.timelineDot} />
                    {index < filteredLogs.length - 1 && <View style={styles.timelineLine} />}
                  </View>
                  <View style={[styles.logCard, { flex: 1, marginBottom: 0, paddingVertical: 10 }]}>
                    <View style={styles.logHeader}>
                      <Text style={styles.logId}>{log.date}</Text>
                      <Text style={styles.logDate}>{log.time}</Text>
                    </View>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#3B82F6', marginBottom: 4 }}>
                      {log.id} | Operatör: {log.operator}
                    </Text>
                    <Text style={[styles.logLabel, { fontSize: 10.5 }]}>
                      {t.results}: {log.anomalies.join(', ')} (Max Derinlik: {log.maxDepth.toFixed(1)} m)
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

      </View>
    </View>
  );
}
