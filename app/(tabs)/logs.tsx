import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';
import { useLanguage } from '../../context/LanguageContext';
import { useGpr, ScanLog } from '../../context/GprContext';

export default function LogsScreen() {
  const { t, language } = useLanguage();
  const { theme, logs, exportReport } = useGpr();

  // Active view tab: 'list' | 'timeline' | 'map'
  const [activeView, setActiveView] = useState<'list' | 'timeline' | 'map'>('list');
  const [filterMaterial, setFilterMaterial] = useState<string>('');
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv' | 'png' | null>(null);

  const isLight = theme === 'light';
  const isDark = theme === 'dark';

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isLight ? '#F8FAFC' : isDark ? '#0F172A' : '#111827',
    },
    filterBar: {
      backgroundColor: isLight ? '#FFFFFF' : isDark ? '#1E293B' : '#1C2537',
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: isLight ? '#E2E8F0' : '#374151',
      flexDirection: 'row',
      alignItems: 'center',
    },
    searchInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isLight ? '#F1F5F9' : '#2D3748',
      borderRadius: 8,
      paddingHorizontal: 10,
      flex: 1,
      marginRight: 10,
      height: 38,
    },
    searchInput: {
      fontSize: 13,
      color: isLight ? '#0F172A' : '#F9FAFB',
      marginLeft: 6,
      flex: 1,
    },
    // View selectors
    viewToggleGroup: {
      flexDirection: 'row',
      backgroundColor: isLight ? '#F1F5F9' : '#2D3748',
      borderRadius: 8,
      padding: 3,
    },
    viewToggleBtn: {
      paddingHorizontal: 10,
      paddingVertical: 6,
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
    // Scroll content
    scrollContent: {
      padding: 16,
    },
    // Log items
    logCard: {
      backgroundColor: isLight ? '#FFFFFF' : isDark ? '#1E293B' : '#1C2537',
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: isLight ? '#E2E8F0' : '#374151',
    },
    logHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: isLight ? '#F1F5F9' : '#2D3748',
      paddingBottom: 8,
      marginBottom: 10,
    },
    logId: {
      fontSize: 14,
      fontWeight: '800',
      color: isLight ? '#0F172A' : '#F9FAFB',
    },
    logDate: {
      fontSize: 12,
      color: isLight ? '#64748B' : '#9CA3AF',
    },
    logRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: 4,
    },
    logLabel: {
      fontSize: 12,
      color: isLight ? '#64748B' : '#9CA3AF',
    },
    logValue: {
      fontSize: 12,
      fontWeight: '600',
      color: isLight ? '#0F172A' : '#E5E7EB',
      textAlign: 'right',
    },
    anomBadge: {
      backgroundColor: '#EFF6FF',
      borderRadius: 4,
      paddingHorizontal: 6,
      paddingVertical: 2,
      marginHorizontal: 2,
      borderWidth: 0.5,
      borderColor: '#BFDBFE',
    },
    anomBadgeText: {
      fontSize: 10,
      fontWeight: '600',
      color: '#1E40AF',
    },
    exportRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 12,
      borderTopWidth: 1,
      borderTopColor: isLight ? '#F1F5F9' : '#2D3748',
      paddingTop: 10,
    },
    exportBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 5,
      borderRadius: 6,
      backgroundColor: isLight ? '#F1F5F9' : '#2D3748',
      marginLeft: 8,
    },
    exportBtnText: {
      fontSize: 10,
      fontWeight: '700',
      color: isLight ? '#475569' : '#E2E8F0',
      marginLeft: 4,
    },
    // Timeline Card
    timelineCard: {
      flexDirection: 'row',
      marginBottom: 16,
    },
    timelineLineContainer: {
      width: 24,
      alignItems: 'center',
    },
    timelineDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: '#3B82F6',
      marginTop: 6,
    },
    timelineLine: {
      flex: 1,
      width: 2,
      backgroundColor: isLight ? '#E2E8F0' : '#374151',
    },
    // Map Card
    mapCard: {
      backgroundColor: isLight ? '#FFFFFF' : isDark ? '#1E293B' : '#1C2537',
      borderRadius: 14,
      padding: 12,
      borderWidth: 1,
      borderColor: isLight ? '#E2E8F0' : '#374151',
      height: 380,
      justifyContent: 'center',
      alignItems: 'center',
    },
    // Export Indicator Modal
    exportingContainer: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 100,
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

  const handleExport = async (format: 'pdf' | 'csv' | 'png', logId: string) => {
    setExportingId(logId);
    setExportFormat(format);
    try {
      const filename = await exportReport(format, logId);
      Alert.alert(
        language === 'tr' ? 'Başarılı' : 'Success',
        language === 'tr' 
          ? `Rapor başarıyla oluşturuldu ve cihazınıza kaydedildi:\n\n${filename}`
          : `Report successfully generated and saved to device:\n\n${filename}`
      );
    } catch (e) {
      console.log(e);
    } finally {
      setExportingId(null);
      setExportFormat(null);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (!filterMaterial) return true;
    return log.anomalies.some(anom => 
      anom.toLowerCase().includes(filterMaterial.toLowerCase())
    );
  });

  return (
    <View style={styles.container}>
      {/* Top Filter and view options row */}
      <View style={styles.filterBar}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={16} color={isLight ? '#64748B' : '#9CA3AF'} />
          <TextInput
            placeholder={language === 'tr' ? 'Malzeme aratın...' : 'Search material...'}
            placeholderTextColor={isLight ? '#94A3B8' : '#64748B'}
            style={styles.searchInput}
            value={filterMaterial}
            onChangeText={setFilterMaterial}
          />
        </View>

        <View style={styles.viewToggleGroup}>
          <TouchableOpacity 
            style={[styles.viewToggleBtn, activeView === 'list' && styles.viewToggleBtnActive]}
            onPress={() => setActiveView('list')}
          >
            <Text style={[styles.viewToggleText, activeView === 'list' && styles.viewToggleTextActive]}>
              {language === 'tr' ? 'Liste' : 'List'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.viewToggleBtn, activeView === 'timeline' && styles.viewToggleBtnActive]}
            onPress={() => setActiveView('timeline')}
          >
            <Text style={[styles.viewToggleText, activeView === 'timeline' && styles.viewToggleTextActive]}>
              Timeline
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.viewToggleBtn, activeView === 'map' && styles.viewToggleBtnActive]}
            onPress={() => setActiveView('map')}
          >
            <Text style={[styles.viewToggleText, activeView === 'map' && styles.viewToggleTextActive]}>
              {language === 'tr' ? 'Harita' : 'Map'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

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

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* View 1: List View */}
        {activeView === 'list' && (
          filteredLogs.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 48 }}>
              <Ionicons name="folder-open-outline" size={48} color={isLight ? '#94A3B8' : '#475569'} />
              <Text style={[styles.logLabel, { marginTop: 12 }]}>
                {language === 'tr' ? 'Aranan kriterlere uygun kayıt bulunamadı.' : 'No records found matching filters.'}
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
                  <Text style={styles.logLabel}>{t.estimatedDepth}</Text>
                  <Text style={styles.logValue}>{log.maxDepth.toFixed(1)} m</Text>
                </View>
                <View style={styles.logRow}>
                  <Text style={styles.logLabel}>{t.results}</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: 180 }}>
                    {log.anomalies.map((anom, idx) => (
                      <View key={idx} style={styles.anomBadge}>
                        <Text style={styles.anomBadgeText}>{anom}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Export Buttons */}
                <View style={styles.exportRow}>
                  <TouchableOpacity style={styles.exportBtn} onPress={() => handleExport('pdf', log.id)}>
                    <Ionicons name="document-text" size={12} color={isLight ? '#475569' : '#E2E8F0'} />
                    <Text style={styles.exportBtnText}>PDF</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.exportBtn} onPress={() => handleExport('csv', log.id)}>
                    <Ionicons name="grid" size={12} color={isLight ? '#475569' : '#E2E8F0'} />
                    <Text style={styles.exportBtnText}>CSV</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.exportBtn} onPress={() => handleExport('png', log.id)}>
                    <Ionicons name="image" size={12} color={isLight ? '#475569' : '#E2E8F0'} />
                    <Text style={styles.exportBtnText}>PNG</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )
        )}

        {/* View 2: Timeline View */}
        {activeView === 'timeline' && (
          filteredLogs.map((log, index) => (
            <View key={log.id} style={styles.timelineCard}>
              <View style={styles.timelineLineContainer}>
                <View style={styles.timelineDot} />
                {index < filteredLogs.length - 1 && <View style={styles.timelineLine} />}
              </View>
              <View style={[styles.logCard, { flex: 1, marginBottom: 0 }]}>
                <View style={styles.logHeader}>
                  <Text style={styles.logId}>{log.date}</Text>
                  <Text style={styles.logDate}>{log.time}</Text>
                </View>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#3B82F6', marginBottom: 6 }}>{log.id} | {log.operator}</Text>
                <Text style={[styles.logLabel, { fontSize: 11 }]}>{t.results}: {log.anomalies.join(', ')}</Text>
              </View>
            </View>
          ))
        )}

        {/* View 3: Map View (Visual Mock GPR grid path map overlay) */}
        {activeView === 'map' && (
          <View style={styles.mapCard}>
            <Text style={[styles.panelTitle, { position: 'absolute', top: 12, left: 12 }]}>{t.scanCoverageMap}</Text>
            
            {/* SVG Draw Map Grid and Route lines */}
            <Svg width="100%" height="320" style={{ marginTop: 24 }}>
              {/* Background Grid */}
              <Path d="M 0 40 L 400 40 M 0 80 L 400 80 M 0 120 L 400 120 M 0 160 L 400 160 M 0 200 L 400 200 M 0 240 L 400 240 M 0 280 L 400 280" stroke={theme === 'light' ? '#E2E8F0' : '#1F2937'} strokeWidth="1" />
              <Path d="M 40 0 L 40 320 M 80 0 L 80 320 M 120 0 L 120 320 M 160 0 L 160 320 M 200 0 L 200 320 M 240 0 L 240 320 M 280 0 L 280 320 M 320 0 L 320 320 M 360 0 L 360 320" stroke={theme === 'light' ? '#E2E8F0' : '#1F2937'} strokeWidth="1" />
              
              {/* Scan paths */}
              <Path 
                d="M 50 250 L 150 220 L 250 260 L 320 180 L 280 100 L 180 80 L 100 140" 
                fill="none" 
                stroke="#3B82F6" 
                strokeWidth="4" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />

              {/* Scan Area Cover Heatmap Overlay polygon */}
              <Path 
                d="M 120 200 L 280 240 L 330 150 L 250 80 L 90 120 Z" 
                fill="#22C55E" 
                opacity="0.15" 
                stroke="#22C55E" 
                strokeWidth="1.5" 
                strokeDasharray="4 4" 
              />

              {/* Waypoint circle markers representing detections */}
              <G>
                {/* Gold waypoint */}
                <Circle cx="150" cy="220" r="10" fill="#EF4444" opacity="0.3" />
                <Circle cx="150" cy="220" r="4" fill="#EF4444" />
                
                {/* Pipe waypoint */}
                <Circle cx="280" cy="100" r="10" fill="#3B82F6" opacity="0.3" />
                <Circle cx="280" cy="100" r="4" fill="#3B82F6" />

                {/* Cavity waypoint */}
                <Circle cx="100" cy="140" r="10" fill="#F59E0B" opacity="0.3" />
                <Circle cx="100" cy="140" r="4" fill="#F59E0B" />
              </G>
            </Svg>

            <View style={{ position: 'absolute', bottom: 12, right: 12, flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="pin" size={14} color="#EF4444" />
              <Text style={[styles.timerLabel, { marginLeft: 4, fontWeight: '700' }]}>GPS LOCK: 3D POS (RTK ACTIVE)</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
