import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Rect, G, Line, Circle } from 'react-native-svg';
import { useLanguage } from '../../context/LanguageContext';
import { useGpr, Anomaly } from '../../context/GprContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ScanScreen() {
  const { t, language } = useLanguage();
  const {
    theme,
    isScanning,
    isPaused,
    startScanning,
    stopScanning,
    pauseScanning,
    scanTime,
    signalStrength,
    signalQuality,
    penetrationDepth,
    radargramData,
    txWaveform,
    fftSpectrum,
    rxWaveform,
    detectedAnomalies,
    alerts,
    clearAlerts,
    frequency,
    pulseVoltage,
    gain,
    antennaType,
    copilotText
  } = useGpr();

  // Active section tab: 'radar' | 'signals' | '3d' | 'copilot'
  const [activeSubTab, setActiveSubTab] = useState<'radar' | 'signals' | '3d' | 'copilot'>('radar');
  const [angle, setAngle] = useState(30); // Rotate angle for 3D view
  const [layerVisibility, setLayerVisibility] = useState({ soil: true, bedrock: true, targets: true });

  const isLight = theme === 'light';
  const isDark = theme === 'dark';

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isLight ? '#F8FAFC' : isDark ? '#0F172A' : '#111827',
    },
    // Top Panel & Telemetry
    controlPanel: {
      backgroundColor: isLight ? '#FFFFFF' : isDark ? '#1E293B' : '#1C2537',
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: isLight ? '#E2E8F0' : '#374151',
    },
    controlRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    btnGroup: {
      flexDirection: 'row',
    },
    ctrlBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      marginRight: 8,
    },
    startBtn: {
      backgroundColor: '#22C55E',
    },
    pauseBtn: {
      backgroundColor: '#F59E0B',
    },
    stopBtn: {
      backgroundColor: '#EF4444',
    },
    ctrlBtnText: {
      color: '#FFFFFF',
      fontWeight: '600',
      fontSize: 12,
      marginLeft: 4,
    },
    timerContainer: {
      alignItems: 'flex-end',
    },
    timerVal: {
      fontSize: 16,
      fontWeight: '700',
      fontFamily: 'monospace',
      color: isLight ? '#0F172A' : '#F9FAFB',
    },
    timerLabel: {
      fontSize: 9,
      color: isLight ? '#64748B' : '#9CA3AF',
    },
    // Quick Telemetry Strip
    telemetryStrip: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: isLight ? '#F1F5F9' : isDark ? '#0F172A' : '#161F30',
      borderBottomWidth: 1,
      borderBottomColor: isLight ? '#E2E8F0' : '#374151',
    },
    telemetryText: {
      fontSize: 11,
      fontWeight: '600',
      color: isLight ? '#475569' : '#D1D5DB',
    },
    // Floating Smart Alert Bar
    alertBar: {
      backgroundColor: '#EF4444',
      paddingVertical: 8,
      paddingHorizontal: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    alertText: {
      color: '#FFFFFF',
      fontWeight: '700',
      fontSize: 12,
    },
    alertClose: {
      padding: 2,
    },
    // Navigation Tabs for Sub-Panels
    tabsContainer: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: isLight ? '#E2E8F0' : '#374151',
      backgroundColor: isLight ? '#FFFFFF' : isDark ? '#1E293B' : '#1C2537',
    },
    tabItem: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    activeTabItem: {
      borderBottomColor: '#3B82F6',
    },
    tabText: {
      fontSize: 12,
      fontWeight: '600',
      color: isLight ? '#64748B' : '#9CA3AF',
      marginTop: 2,
    },
    activeTabText: {
      color: '#3B82F6',
    },
    // Radargram Panel
    radarContainer: {
      padding: 12,
    },
    panelCard: {
      backgroundColor: isLight ? '#FFFFFF' : isDark ? '#1E293B' : '#1C2537',
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: isLight ? '#E2E8F0' : '#374151',
      marginBottom: 16,
    },
    panelHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    panelTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: isLight ? '#0F172A' : '#F9FAFB',
      letterSpacing: 0.3,
    },
    radarGrid: {
      flexDirection: 'row',
      height: 180,
      width: '100%',
      backgroundColor: '#05070A',
      borderRadius: 8,
      overflow: 'hidden',
      position: 'relative',
    },
    radarColumn: {
      flex: 1,
      flexDirection: 'column',
    },
    radarCell: {
      flex: 1,
    },
    hyperbolaOverlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
    },
    // Target List Cards
    targetCard: {
      backgroundColor: isLight ? '#F8FAFC' : isDark ? '#2D3748' : '#222C3F',
      borderRadius: 10,
      padding: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: isLight ? '#E2E8F0' : '#3D4B64',
    },
    targetHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: isLight ? '#E2E8F0' : '#3D4B64',
      paddingBottom: 6,
      marginBottom: 8,
    },
    targetType: {
      fontSize: 14,
      fontWeight: '700',
      color: '#3B82F6',
    },
    targetTime: {
      fontSize: 11,
      color: isLight ? '#64748B' : '#9CA3AF',
    },
    targetRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: 3,
    },
    targetLabel: {
      fontSize: 12,
      color: isLight ? '#64748B' : '#A0AEC0',
    },
    targetValue: {
      fontSize: 12,
      fontWeight: '600',
      color: isLight ? '#0F172A' : '#E2E8F0',
    },
    targetExplanation: {
      fontSize: 11,
      color: isLight ? '#475569' : '#CBD5E1',
      fontStyle: 'italic',
      marginTop: 6,
      backgroundColor: isLight ? '#F1F5F9' : '#1A2332',
      padding: 6,
      borderRadius: 4,
    },
    // Waveform plot views
    waveformTitle: {
      fontSize: 12,
      fontWeight: '600',
      color: isLight ? '#64748B' : '#A0AEC0',
      marginBottom: 6,
    },
    // 3D View Toggles
    control3D: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: 12,
    },
    control3DBtn: {
      backgroundColor: isLight ? '#F1F5F9' : '#2D3748',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 6,
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      marginHorizontal: 4,
      borderWidth: 1,
      borderColor: isLight ? '#E2E8F0' : '#3A475C',
    },
    control3DBtnActive: {
      backgroundColor: '#3B82F6',
      borderColor: '#3B82F6',
    },
    control3DText: {
      fontSize: 11,
      fontWeight: '600',
      color: isLight ? '#475569' : '#E2E8F0',
    },
    control3DTextActive: {
      color: '#FFFFFF',
    },
    // Copilot Layout
    copilotBox: {
      backgroundColor: '#EFF6FF',
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: '#BFDBFE',
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    copilotTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: '#1E40AF',
    },
    copilotContent: {
      fontSize: 13,
      color: '#1E3A8A',
      marginTop: 4,
      lineHeight: 18,
    }
  });

  // Calculate Radargram color based on density value (0 - 255)
  const getRadarColor = (value: number) => {
    // Return copper-like/orange or greyscale styling for industrial look
    if (value < 40) return '#080C14'; // Low density
    if (value < 100) return `rgb(${Math.floor(value * 0.4)}, ${Math.floor(value * 0.4)}, ${Math.floor(value * 0.6)})`; // Bedrock interface
    return `rgb(${Math.floor(value * 0.9)}, ${Math.floor(value * 0.5)}, ${Math.floor(value * 0.15)})`; // Anomaly (high reflection)
  };

  // Convert array data to SVG Line Path
  const makeSvgPath = (data: number[], height: number, width: number, scale: number = 1) => {
    if (data.length === 0) return '';
    const step = width / (data.length - 1);
    const midY = height / 2;
    return data.map((val, i) => {
      const x = i * step;
      const y = midY - (val * scale);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  const getVerticalAScanPath = () => {
    if (!radargramData || radargramData.length === 0) return '';
    const lastColIndex = radargramData[0].length - 1;
    const traceData = radargramData.map(row => row[lastColIndex]);
    const height = 180;
    const width = 60;
    const centerX = width / 2;
    const stepY = height / (traceData.length - 1);

    return traceData.map((val, i) => {
      const offset = (val - 60) * 0.45;
      const x = centerX + Math.min(centerX - 4, Math.max(-centerX + 4, offset));
      const y = i * stepY;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };


  const formattedTime = (secs: number) => {
    const mm = Math.floor(secs / 60).toString().padStart(2, '0');
    const ss = (secs % 60).toString().padStart(2, '0');
    return `${mm}:${ss}`;
  };

  return (
    <View style={styles.container}>
      {/* Top Controls panel */}
      <View style={styles.controlPanel}>
        <View style={styles.controlRow}>
          <View style={styles.btnGroup}>
            {!isScanning ? (
              <TouchableOpacity style={[styles.ctrlBtn, styles.startBtn]} onPress={startScanning}>
                <Ionicons name="play" size={14} color="#FFFFFF" />
                <Text style={styles.ctrlBtnText}>{t.startScan}</Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity style={[styles.ctrlBtn, styles.pauseBtn]} onPress={pauseScanning}>
                  <Ionicons name={isPaused ? 'play' : 'pause'} size={14} color="#FFFFFF" />
                  <Text style={styles.ctrlBtnText}>{isPaused ? t.startScan : t.pauseScan}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.ctrlBtn, styles.stopBtn]} onPress={stopScanning}>
                  <Ionicons name="stop" size={14} color="#FFFFFF" />
                  <Text style={styles.ctrlBtnText}>{t.stopScan}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
          <View style={styles.timerContainer}>
            <Text style={styles.timerVal}>{formattedTime(scanTime)}</Text>
            <Text style={styles.timerLabel}>{t.scanProgress}</Text>
          </View>
        </View>
      </View>

      {/* Quick Telemetry Strip */}
      <View style={styles.telemetryStrip}>
        <Text style={styles.telemetryText}>{t.signalStrength}: {Math.round(signalStrength)}%</Text>
        <Text style={styles.telemetryText}>{t.signalQuality}: {Math.round(signalQuality)}%</Text>
        <Text style={styles.telemetryText}>{t.penetrationDepth}: {penetrationDepth.toFixed(1)} m</Text>
      </View>

      {/* Floating Smart Alert Panel */}
      {alerts.length > 0 && (
        <View style={styles.alertBar}>
          <Text style={styles.alertText}>🚨 {alerts[0]}</Text>
          <TouchableOpacity onPress={clearAlerts} style={styles.alertClose}>
            <Ionicons name="close" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}

      {/* Navigation Sub-Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tabItem, activeSubTab === 'radar' && styles.activeTabItem]}
          onPress={() => setActiveSubTab('radar')}
        >
          <Ionicons name="images-outline" size={18} color={activeSubTab === 'radar' ? '#3B82F6' : '#9CA3AF'} />
          <Text style={[styles.tabText, activeSubTab === 'radar' && styles.activeTabText]}>{language === 'tr' ? 'Radargram' : 'Radargram'}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabItem, activeSubTab === 'signals' && styles.activeTabItem]}
          onPress={() => setActiveSubTab('signals')}
        >
          <Ionicons name="pulse" size={18} color={activeSubTab === 'signals' ? '#3B82F6' : '#9CA3AF'} />
          <Text style={[styles.tabText, activeSubTab === 'signals' && styles.activeTabText]}>{language === 'tr' ? 'Sinyaller' : 'Signals'}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabItem, activeSubTab === '3d' && styles.activeTabItem]}
          onPress={() => setActiveSubTab('3d')}
        >
          <Ionicons name="cube-outline" size={18} color={activeSubTab === '3d' ? '#3B82F6' : '#9CA3AF'} />
          <Text style={[styles.tabText, activeSubTab === '3d' && styles.activeTabText]}>{language === 'tr' ? '3D Görünüm' : '3D View'}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabItem, activeSubTab === 'copilot' && styles.activeTabItem]}
          onPress={() => setActiveSubTab('copilot')}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={18} color={activeSubTab === 'copilot' ? '#3B82F6' : '#9CA3AF'} />
          <Text style={[styles.tabText, activeSubTab === 'copilot' && styles.activeTabText]}>{language === 'tr' ? 'Yardımcı' : 'Copilot'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.radarContainer} showsVerticalScrollIndicator={false}>
        {/* Tab 1: Radargram and targets */}
        {activeSubTab === 'radar' && (
          <>
            <View style={styles.panelCard}>
              <View style={styles.panelHeader}>
                <Text style={styles.panelTitle}>{t.radargram}</Text>
                <Text style={styles.timerLabel}>{frequency} MHz | {antennaType}</Text>
              </View>

              {/* Split-Screen: Vertical A-Scan Signal Area + Radargram Grid */}
              <View style={{ flexDirection: 'row', height: 180, width: '100%', backgroundColor: '#05070A', borderRadius: 8, overflow: 'hidden' }}>
                
                {/* Vertical A-Scan (Wiggle Trace Signal Area) */}
                <View style={{ width: 60, height: '100%', backgroundColor: '#090D16', borderRightWidth: 1, borderRightColor: '#1F2937', paddingVertical: 2 }}>
                  <Svg width="100%" height="100%">
                    <Line x1="30" y1="0" x2="30" y2="180" stroke="#1F2937" strokeWidth="1" strokeDasharray="2 2" />
                    <Path 
                      d={getVerticalAScanPath()} 
                      fill="none" 
                      stroke="#3B82F6" 
                      strokeWidth="2" 
                    />
                  </Svg>
                </View>

                {/* Radargram Grid (B-Scan) */}
                <View style={{ flex: 1, flexDirection: 'row', height: '100%', position: 'relative' }}>
                  {radargramData[0].map((_, colIndex) => (
                    <View key={colIndex} style={styles.radarColumn}>
                      {radargramData.map((row, rowIndex) => (
                        <View 
                          key={rowIndex} 
                          style={[
                            styles.radarCell, 
                            { backgroundColor: getRadarColor(row[colIndex]) }
                          ]} 
                        />
                      ))}
                    </View>
                  ))}

                  {/* Hyperbolic reflection visual markers when target is detected */}
                  {detectedAnomalies.length > 0 && isScanning && (
                    <View style={styles.hyperbolaOverlay} pointerEvents="none">
                      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
                        <Circle cx="80%" cy="50%" r="5" fill="#EF4444" />
                        <Path d="M 60% 80% Q 80% 50% 100% 80%" fill="none" stroke="#EF4444" strokeWidth="2" strokeDasharray="4 4" />
                      </Svg>
                    </View>
                  )}
                </View>
              </View>

            </View>

            {/* Target alerts & list */}
            <Text style={[styles.panelTitle, { marginBottom: 10, paddingLeft: 4 }]}>{t.aiAlerts}</Text>
            {detectedAnomalies.length === 0 ? (
              <View style={[styles.panelCard, { alignItems: 'center', paddingVertical: 24 }]}>
                <Ionicons name="shield-checkmark" size={32} color="#22C55E" />
                <Text style={[styles.targetLabel, { marginTop: 8 }]}>
                  {language === 'tr' ? 'Şu ana kadar anomali tespit edilmedi' : 'No anomalies detected yet'}
                </Text>
              </View>
            ) : (
              detectedAnomalies.map((item) => (
                <View key={item.id} style={styles.targetCard}>
                  <View style={styles.targetHeader}>
                    <Text style={styles.targetType}>⚠️ {item.material}</Text>
                    <Text style={styles.targetTime}>{item.time}</Text>
                  </View>
                  <View style={styles.targetRow}>
                    <Text style={styles.targetLabel}>{t.confidenceScore}</Text>
                    <Text style={styles.targetValue}>%{item.confidence}</Text>
                  </View>
                  <View style={styles.targetRow}>
                    <Text style={styles.targetLabel}>{t.estimatedDepth}</Text>
                    <Text style={styles.targetValue}>{item.depth} m</Text>
                  </View>
                  <View style={styles.targetRow}>
                    <Text style={styles.targetLabel}>{t.estimatedDim}</Text>
                    <Text style={styles.targetValue}>{item.dimensions}</Text>
                  </View>
                  <View style={styles.targetRow}>
                    <Text style={styles.targetLabel}>{t.signalQuality}</Text>
                    <Text style={styles.targetValue}>%{item.quality}</Text>
                  </View>
                  <Text style={styles.targetExplanation}>{t.whyClassified}: {item.explanation}</Text>
                </View>
              ))
            )}
          </>
        )}

        {/* Tab 2: Waveforms (Transmitter & Receiver Oscilloscopes) */}
        {activeSubTab === 'signals' && (
          <>
            {/* Transmitter monitoring panel */}
            <View style={styles.panelCard}>
              <Text style={styles.panelTitle}>{t.transmitterPanel}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 6 }}>
                <Text style={styles.timerLabel}>Pulse V: {pulseVoltage}V | active</Text>
                <Text style={styles.timerLabel}>Freq: {frequency}MHz</Text>
              </View>
              
              <Text style={styles.waveformTitle}>{t.pulseWaveform}</Text>
              <View style={{ height: 100, backgroundColor: '#090D16', borderRadius: 8, overflow: 'hidden', padding: 4 }}>
                <Svg width="100%" height="100%">
                  <Path 
                    d={makeSvgPath(txWaveform, 90, SCREEN_WIDTH - 56, 35)} 
                    fill="none" 
                    stroke="#3B82F6" 
                    strokeWidth="2" 
                  />
                  <Line x1="0" y1="45" x2={SCREEN_WIDTH - 56} y2="45" stroke="#1F2937" strokeWidth="1" strokeDasharray="2 2" />
                </Svg>
              </View>

              {/* FFT Spectrum */}
              <Text style={[styles.waveformTitle, { marginTop: 12 }]}>{t.fftSpectrum}</Text>
              <View style={{ height: 80, backgroundColor: '#090D16', borderRadius: 8, overflow: 'hidden', flexDirection: 'row', alignItems: 'flex-end', padding: 6 }}>
                {fftSpectrum.map((val, idx) => (
                  <View 
                    key={idx} 
                    style={{ 
                      flex: 1, 
                      backgroundColor: '#06B6D4', 
                      height: `${val}%`, 
                      marginHorizontal: 1,
                      borderRadius: 1 
                    }} 
                  />
                ))}
              </View>
            </View>

            {/* Receiver analysis panel */}
            <View style={styles.panelCard}>
              <Text style={styles.panelTitle}>{t.receiverPanel}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 6 }}>
                <Text style={styles.timerLabel}>Gain: {gain} dB</Text>
                <Text style={styles.timerLabel}>Att: 12 dB/m</Text>
              </View>

              <Text style={styles.waveformTitle}>{t.liveSignalStream}</Text>
              <View style={{ height: 120, backgroundColor: '#090D16', borderRadius: 8, overflow: 'hidden', padding: 4 }}>
                <Svg width="100%" height="100%">
                  <Path 
                    d={makeSvgPath(rxWaveform, 110, SCREEN_WIDTH - 56, 2)} 
                    fill="none" 
                    stroke="#10B981" 
                    strokeWidth="2" 
                  />
                  <Line x1="0" y1="55" x2={SCREEN_WIDTH - 56} y2="55" stroke="#1F2937" strokeWidth="1" strokeDasharray="2 2" />
                </Svg>
              </View>
            </View>
          </>
        )}

        {/* Tab 3: 3D Subsurface Visualization */}
        {activeSubTab === '3d' && (
          <View style={styles.panelCard}>
            <Text style={styles.panelTitle}>{t.threeDSubsurface}</Text>
            
            {/* Control buttons */}
            <View style={styles.control3D}>
              <TouchableOpacity 
                style={styles.control3DBtn} 
                onPress={() => setAngle(prev => (prev - 15) % 360)}
              >
                <Text style={styles.control3DText}>↩ {t.rotate}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.control3DBtn} 
                onPress={() => setAngle(prev => (prev + 15) % 360)}
              >
                <Text style={styles.control3DText}>↪ {t.rotate}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.control3DBtn, layerVisibility.soil && styles.control3DBtnActive]} 
                onPress={() => setLayerVisibility(prev => ({ ...prev, soil: !prev.soil }))}
              >
                <Text style={[styles.control3DText, layerVisibility.soil && styles.control3DTextActive]}>{t.soilLayers}</Text>
              </TouchableOpacity>
            </View>

            {/* Isometric SVG Representation of Subsurface Layers */}
            <View style={{ height: 260, backgroundColor: '#090D16', borderRadius: 8, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' }}>
              <Svg width="100%" height="100%">
                <G transform={`rotate(${angle}, 150, 130)`}>
                  {/* Soil layers */}
                  {layerVisibility.soil && (
                    <>
                      {/* Topsoil */}
                      <Path d="M 50 80 L 250 80 L 200 120 L 00 120 Z" fill="#78350F" opacity="0.8" stroke="#F59E0B" strokeWidth="1" />
                      {/* Subsoil */}
                      <Path d="M 50 120 L 250 120 L 200 160 L 00 160 Z" fill="#92400E" opacity="0.6" stroke="#D97706" strokeWidth="1" />
                      {/* Clay/Rock Layer */}
                      <Path d="M 50 160 L 250 160 L 200 200 L 00 200 Z" fill="#4B5563" opacity="0.7" stroke="#9CA3AF" strokeWidth="1" />
                    </>
                  )}

                  {/* Bedrock */}
                  {layerVisibility.bedrock && (
                    <Path d="M 50 200 L 250 200 L 200 240 L 00 240 Z" fill="#1F2937" opacity="0.9" stroke="#4B5563" strokeWidth="1.5" />
                  )}

                  {/* Target highlights */}
                  {layerVisibility.targets && detectedAnomalies.length > 0 && (
                    <G>
                      {/* Pipe */}
                      <Line x1="40" y1="140" x2="210" y2="140" stroke="#06B6D4" strokeWidth="6" strokeLinecap="round" opacity="0.8" />
                      {/* Metal sphere */}
                      <Circle cx="120" cy="180" r="14" fill="#3B82F6" opacity="0.8" />
                      {/* Void (Empty) */}
                      <Circle cx="160" cy="110" r="18" fill="#EF4444" opacity="0.5" stroke="#EF4444" strokeWidth="2" strokeDasharray="3 3" />
                    </G>
                  )}
                </G>
              </Svg>
            </View>
          </View>
        )}

        {/* Tab 4: AI Copilot assistant */}
        {activeSubTab === 'copilot' && (
          <View style={styles.panelCard}>
            <Text style={[styles.panelTitle, { marginBottom: 12 }]}>{t.aiCopilotTitle}</Text>
            <View style={styles.copilotBox}>
              <Ionicons name="chatbubble-ellipses" size={24} color="#3B82F6" style={{ marginRight: 12, marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.copilotTitle}>GPR Copilot AI</Text>
                <Text style={styles.copilotContent}>
                  {copilotText || (language === 'tr' ? 'Donanım hazır. Başlat düğmesine basarak canlı taramayı başlatın.' : 'Hardware ready. Tap Start to begin ground penetration scans.')}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
