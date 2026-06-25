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

  // Active section tab for the right column: 'telemetry' | 'signals' | '3d' | 'copilot'
  const [activeSideTab, setActiveSideTab] = useState<'telemetry' | 'signals' | '3d' | 'copilot'>('telemetry');
  const [angle, setAngle] = useState(30); // Rotate angle for 3D view
  const [layerVisibility, setLayerVisibility] = useState({ soil: true, bedrock: true, targets: true });

  const isLight = theme === 'light';
  const isDark = theme === 'dark';

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isLight ? '#F8FAFC' : isDark ? '#0F172A' : '#111827',
      paddingLeft: 75, // Shift content right to clear the Left Sidebar
      flexDirection: 'row', // Side-by-side split screen
    },
    // Left Main Panel (GPR Scope & Controls) - occupies 58% of screen
    mainViewport: {
      flex: 0.58,
      padding: 16,
      borderRightWidth: 1,
      borderRightColor: isLight ? '#E2E8F0' : '#374151',
    },
    // Right Side Panel (Detections, Oscilloscopes, 3D, Copilot) - occupies 42% of screen
    sideViewport: {
      flex: 0.42,
      backgroundColor: isLight ? '#FFFFFF' : isDark ? '#141E30' : '#172033',
      flexDirection: 'column',
    },
    // Top Control bar
    controlPanel: {
      backgroundColor: isLight ? '#FFFFFF' : isDark ? '#1E293B' : '#1C2537',
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isLight ? '#E2E8F0' : '#374151',
      marginBottom: 16,
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
      paddingVertical: 8,
      backgroundColor: isLight ? '#F1F5F9' : isDark ? '#0F172A' : '#161F30',
      borderRadius: 8,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: isLight ? '#E2E8F0' : '#374151',
    },
    telemetryText: {
      fontSize: 11,
      fontWeight: '700',
      color: isLight ? '#475569' : '#D1D5DB',
    },
    // Floating Smart Alert Bar
    alertBar: {
      backgroundColor: '#EF4444',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    alertText: {
      color: '#FFFFFF',
      fontWeight: '700',
      fontSize: 11,
    },
    alertClose: {
      padding: 2,
    },
    // Side view tabs selector
    sideTabsContainer: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: isLight ? '#E2E8F0' : '#374151',
      backgroundColor: isLight ? '#FFFFFF' : isDark ? '#1E293B' : '#1C2537',
    },
    sideTabItem: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    activeSideTabItem: {
      borderBottomColor: '#3B82F6',
    },
    sideTabText: {
      fontSize: 10,
      fontWeight: '700',
      color: isLight ? '#64748B' : '#9CA3AF',
      marginTop: 2,
    },
    activeSideTabText: {
      color: '#3B82F6',
    },
    sideScrollContent: {
      padding: 16,
    },
    // Panels
    panelCard: {
      backgroundColor: isLight ? '#FFFFFF' : isDark ? '#1E293B' : '#1C2537',
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: isLight ? '#E2E8F0' : '#374151',
      marginBottom: 16,
    },
    panelTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: isLight ? '#0F172A' : '#F9FAFB',
      marginBottom: 10,
      letterSpacing: 0.3,
    },
    // Target anomaly cards
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
      fontSize: 13,
      fontWeight: '700',
      color: '#3B82F6',
    },
    targetTime: {
      fontSize: 10,
      color: isLight ? '#64748B' : '#9CA3AF',
    },
    targetRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: 2,
    },
    targetLabel: {
      fontSize: 11,
      color: isLight ? '#64748B' : '#A0AEC0',
    },
    targetValue: {
      fontSize: 11,
      fontWeight: '600',
      color: isLight ? '#0F172A' : '#E2E8F0',
    },
    targetExplanation: {
      fontSize: 10.5,
      color: isLight ? '#475569' : '#CBD5E1',
      fontStyle: 'italic',
      marginTop: 6,
      backgroundColor: isLight ? '#F1F5F9' : '#1A2332',
      padding: 6,
      borderRadius: 4,
    },
    // Waves
    waveformTitle: {
      fontSize: 11,
      fontWeight: '600',
      color: isLight ? '#64748B' : '#A0AEC0',
      marginBottom: 4,
    },
    // 3D View Toggles
    control3D: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    control3DBtn: {
      backgroundColor: isLight ? '#F1F5F9' : '#2D3748',
      paddingHorizontal: 8,
      paddingVertical: 6,
      borderRadius: 6,
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      marginHorizontal: 3,
      borderWidth: 1,
      borderColor: isLight ? '#E2E8F0' : '#3A475C',
    },
    control3DBtnActive: {
      backgroundColor: '#3B82F6',
      borderColor: '#3B82F6',
    },
    control3DText: {
      fontSize: 10,
      fontWeight: '600',
      color: isLight ? '#475569' : '#E2E8F0',
    },
    control3DTextActive: {
      color: '#FFFFFF',
    },
    // Copilot
    copilotBox: {
      backgroundColor: '#EFF6FF',
      borderRadius: 12,
      padding: 14,
      borderWidth: 1,
      borderColor: '#BFDBFE',
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    copilotTitle: {
      fontSize: 12,
      fontWeight: '700',
      color: '#1E40AF',
    },
    copilotContent: {
      fontSize: 12,
      color: '#1E3A8A',
      marginTop: 4,
      lineHeight: 16,
    }
  });

  const getRadarColor = (value: number) => {
    if (value < 40) return '#080C14'; // Low density
    if (value < 100) return `rgb(${Math.floor(value * 0.4)}, ${Math.floor(value * 0.4)}, ${Math.floor(value * 0.6)})`; // Bedrock interface
    return `rgb(${Math.floor(value * 0.9)}, ${Math.floor(value * 0.5)}, ${Math.floor(value * 0.15)})`; // Anomaly (high reflection)
  };

  const getVerticalAScanPath = () => {
    if (!radargramData || radargramData.length === 0) return '';
    const lastColIndex = radargramData[0].length - 1;
    const traceData = radargramData.map(row => row[lastColIndex]);
    const height = 240; // Height of GPR Scope in landscape
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

  const formattedTime = (secs: number) => {
    const mm = Math.floor(secs / 60).toString().padStart(2, '0');
    const ss = (secs % 60).toString().padStart(2, '0');
    return `${mm}:${ss}`;
  };

  // Determine viewport width for SVGs on the right side panel
  const sideSvgWidth = SCREEN_WIDTH * 0.42 - 56;

  return (
    <View style={styles.container}>
      {/* 1. LEFT MAIN VIEWPORT (Scope Display & Controls) */}
      <View style={styles.mainViewport}>
        
        {/* Top Control Bar */}
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
              <Ionicons name="close" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* Big GPR Scope Viewport (Increased height for Landscape screen) */}
        <View style={[styles.panelCard, { flex: 1, marginBottom: 0, padding: 8 }]}>
          <View style={[styles.panelHeader, { marginBottom: 6 }]}>
            <Text style={styles.panelTitle}>{t.radargram}</Text>
            <Text style={styles.timerLabel}>{frequency} MHz | {antennaType}</Text>
          </View>

          {/* Split-Screen: Vertical A-Scan Wiggle Trace (Left) + B-Scan Radargram (Right) */}
          <View style={{ flexDirection: 'row', flex: 1, backgroundColor: '#05070A', borderRadius: 8, overflow: 'hidden' }}>
            
            {/* Vertical A-Scan Signal Area */}
            <View style={{ width: 60, height: '100%', backgroundColor: '#090D16', borderRightWidth: 1, borderRightColor: '#1F2937', paddingVertical: 2 }}>
              <Svg width="100%" height="100%">
                <Line x1="30" y1="0" x2="30" y2="240" stroke="#1F2937" strokeWidth="1" strokeDasharray="2 2" />
                <Path 
                  d={getVerticalAScanPath()} 
                  fill="none" 
                  stroke="#3B82F6" 
                  strokeWidth="2" 
                />
              </Svg>
            </View>

            {/* Radargram B-Scan Grid */}
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
                    <Circle cx="80%" cy="50%" r="6" fill="#EF4444" />
                    <Path d="M 60% 80% Q 80% 50% 100% 80%" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeDasharray="4 4" />
                  </Svg>
                </View>
              )}
            </View>

          </View>
        </View>

      </View>

      {/* 2. RIGHT SIDE PANEL VIEWPORT (Telemetry, Oscilloscopes, 3D, Copilot) */}
      <View style={styles.sideViewport}>
        
        {/* Navigation Tabs for Right Panel */}
        <View style={styles.sideTabsContainer}>
          <TouchableOpacity 
            style={[styles.sideTabItem, activeSideTab === 'telemetry' && styles.activeSideTabItem]}
            onPress={() => setActiveSideTab('telemetry')}
          >
            <Ionicons name="warning-outline" size={16} color={activeSideTab === 'telemetry' ? '#3B82F6' : '#9CA3AF'} />
            <Text style={[styles.sideTabText, activeSideTab === 'telemetry' && styles.activeSideTabText]}>{language === 'tr' ? 'Bulgular' : 'Detections'}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.sideTabItem, activeSideTab === 'signals' && styles.activeSideTabItem]}
            onPress={() => setActiveSideTab('signals')}
          >
            <Ionicons name="pulse" size={16} color={activeSideTab === 'signals' ? '#3B82F6' : '#9CA3AF'} />
            <Text style={[styles.sideTabText, activeSideTab === 'signals' && styles.activeSideTabText]}>{language === 'tr' ? 'Dalgalar' : 'Waves'}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.sideTabItem, activeSideTab === '3d' && styles.activeSideTabItem]}
            onPress={() => setActiveSideTab('3d')}
          >
            <Ionicons name="cube-outline" size={16} color={activeSideTab === '3d' ? '#3B82F6' : '#9CA3AF'} />
            <Text style={[styles.sideTabText, activeSideTab === '3d' && styles.activeSideTabText]}>3D</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.sideTabItem, activeSideTab === 'copilot' && styles.activeSideTabItem]}
            onPress={() => setActiveSideTab('copilot')}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={16} color={activeSideTab === 'copilot' ? '#3B82F6' : '#9CA3AF'} />
            <Text style={[styles.sideTabText, activeSideTab === 'copilot' && styles.activeSideTabText]}>Copilot</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.sideScrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Side Tab 1: AI Anomaly Detections & System Voltages */}
          {activeSideTab === 'telemetry' && (
            <>
              {/* Power Panel */}
              <View style={styles.panelCard}>
                <Text style={styles.panelTitle}>{t.powerPanel}</Text>
                <View style={styles.targetRow}>
                  <Text style={styles.targetLabel}>{t.batteryPercentage}</Text>
                  <Text style={[styles.targetValue, { color: '#22C55E' }]}>98% (11.8 V)</Text>
                </View>
                <View style={styles.targetRow}>
                  <Text style={styles.targetLabel}>{t.operatingTime}</Text>
                  <Text style={styles.targetValue}>5.5 hrs</Text>
                </View>
                <View style={styles.targetRow}>
                  <Text style={styles.targetLabel}>{t.currentConsumption}</Text>
                  <Text style={styles.targetValue}>420 mA</Text>
                </View>
                <View style={styles.targetRow}>
                  <Text style={styles.targetLabel}>{t.temperature}</Text>
                  <Text style={styles.targetValue}>34.2 °C</Text>
                </View>
              </View>

              {/* Detections List */}
              <Text style={[styles.panelTitle, { marginBottom: 8 }]}>{t.aiAlerts}</Text>
              {detectedAnomalies.length === 0 ? (
                <View style={[styles.panelCard, { alignItems: 'center', paddingVertical: 20 }]}>
                  <Ionicons name="shield-checkmark" size={24} color="#22C55E" />
                  <Text style={[styles.targetLabel, { marginTop: 6, fontSize: 11 }]}>
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
                    <Text style={styles.targetExplanation}>{t.whyClassified}: {item.explanation}</Text>
                  </View>
                ))
              )}
            </>
          )}

          {/* Side Tab 2: Oscilloscope Waveforms (Transmitter / Receiver Waveforms) */}
          {activeSideTab === 'signals' && (
            <>
              {/* Transmitter monitoring panel */}
              <View style={styles.panelCard}>
                <Text style={styles.panelTitle}>{t.transmitterPanel}</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text style={styles.timerLabel}>Pulse V: {pulseVoltage}V | active</Text>
                  <Text style={styles.timerLabel}>Gain: {gain} dB</Text>
                </View>
                
                <Text style={styles.waveformTitle}>{t.pulseWaveform}</Text>
                <View style={{ height: 80, backgroundColor: '#090D16', borderRadius: 8, overflow: 'hidden', padding: 4 }}>
                  <Svg width="100%" height="100%">
                    <Path 
                      d={makeSvgPath(txWaveform, 70, sideSvgWidth, 25)} 
                      fill="none" 
                      stroke="#3B82F6" 
                      strokeWidth="1.5" 
                    />
                    <Line x1="0" y1="35" x2={sideSvgWidth} y2="35" stroke="#1F2937" strokeWidth="1" strokeDasharray="2 2" />
                  </Svg>
                </View>

                {/* FFT Spectrum */}
                <Text style={[styles.waveformTitle, { marginTop: 10 }]}>{t.fftSpectrum}</Text>
                <View style={{ height: 60, backgroundColor: '#090D16', borderRadius: 8, overflow: 'hidden', flexDirection: 'row', alignItems: 'flex-end', padding: 4 }}>
                  {fftSpectrum.map((val, idx) => (
                    <View 
                      key={idx} 
                      style={{ 
                        flex: 1, 
                        backgroundColor: '#06B6D4', 
                        height: `${val}%`, 
                        marginHorizontal: 0.5,
                        borderRadius: 1 
                      }} 
                    />
                  ))}
                </View>
              </View>

              {/* Receiver signal analysis */}
              <View style={styles.panelCard}>
                <Text style={styles.panelTitle}>{t.receiverPanel}</Text>
                <Text style={styles.waveformTitle}>{t.liveSignalStream}</Text>
                <View style={{ height: 90, backgroundColor: '#090D16', borderRadius: 8, overflow: 'hidden', padding: 4 }}>
                  <Svg width="100%" height="100%">
                    <Path 
                      d={makeSvgPath(rxWaveform, 80, sideSvgWidth, 1.5)} 
                      fill="none" 
                      stroke="#10B981" 
                      strokeWidth="1.5" 
                    />
                    <Line x1="0" y1="40" x2={sideSvgWidth} y2="40" stroke="#1F2937" strokeWidth="1" strokeDasharray="2 2" />
                  </Svg>
                </View>
              </View>
            </>
          )}

          {/* Side Tab 3: 3D Subsurface Visualization */}
          {activeSideTab === '3d' && (
            <View style={styles.panelCard}>
              <Text style={styles.panelTitle}>{t.threeDSubsurface}</Text>
              
              <View style={styles.control3D}>
                <TouchableOpacity style={styles.control3DBtn} onPress={() => setAngle(prev => (prev - 15) % 360)}>
                  <Text style={styles.control3DText}>↩ {t.rotate}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.control3DBtn} onPress={() => setAngle(prev => (prev + 15) % 360)}>
                  <Text style={styles.control3DText}>↪ {t.rotate}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.control3DBtn, layerVisibility.soil && styles.control3DBtnActive]} 
                  onPress={() => setLayerVisibility(prev => ({ ...prev, soil: !prev.soil }))}
                >
                  <Text style={[styles.control3DText, layerVisibility.soil && styles.control3DTextActive]}>{t.soilLayers}</Text>
                </TouchableOpacity>
              </View>

              <View style={{ height: 200, backgroundColor: '#090D16', borderRadius: 8, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' }}>
                <Svg width="100%" height="100%">
                  <G transform={`rotate(${angle}, 130, 100)`}>
                    {layerVisibility.soil && (
                      <>
                        <Path d="M 40 60 L 200 60 L 160 90 L 0 90 Z" fill="#78350F" opacity="0.8" stroke="#F59E0B" strokeWidth="1" />
                        <Path d="M 40 90 L 200 90 L 160 120 L 0 120 Z" fill="#92400E" opacity="0.6" stroke="#D97706" strokeWidth="1" />
                        <Path d="M 40 120 L 200 120 L 160 150 L 0 150 Z" fill="#4B5563" opacity="0.7" stroke="#9CA3AF" strokeWidth="1" />
                      </>
                    )}

                    {layerVisibility.bedrock && (
                      <Path d="M 40 150 L 200 150 L 160 180 L 0 180 Z" fill="#1F2937" opacity="0.9" stroke="#4B5563" strokeWidth="1.5" />
                    )}

                    {layerVisibility.targets && detectedAnomalies.length > 0 && (
                      <G>
                        <Line x1="30" y1="105" x2="170" y2="105" stroke="#06B6D4" strokeWidth="5" strokeLinecap="round" opacity="0.8" />
                        <Circle cx="100" cy="135" r="10" fill="#3B82F6" opacity="0.8" />
                        <Circle cx="130" cy="80" r="12" fill="#EF4444" opacity="0.5" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="3 3" />
                      </G>
                    )}
                  </G>
                </Svg>
              </View>
            </View>
          )}

          {/* Side Tab 4: AI Copilot Assistant */}
          {activeSideTab === 'copilot' && (
            <View style={styles.panelCard}>
              <Text style={styles.panelTitle}>{t.aiCopilotTitle}</Text>
              <View style={styles.copilotBox}>
                <Ionicons name="chatbubble-ellipses" size={20} color="#3B82F6" style={{ marginRight: 8, marginTop: 1 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.copilotTitle}>GPR Copilot AI</Text>
                  <Text style={styles.copilotContent}>{copilotText || (language === 'tr' ? 'Sinyaller kararlı. Taramaya başlayın.' : 'Signals stable. Ready to scan.')}</Text>
                </View>
              </View>
            </View>
          )}

        </ScrollView>
      </View>
    </View>
  );
}
