import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Rect, G, Line, Circle, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useLanguage } from '../../context/LanguageContext';
import { useGpr, Anomaly } from '../../context/GprContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SCOPE_HEIGHT = 200;

export default function ScanScreen() {
  const router = useRouter();
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
    antennaType,
    copilotText,
    playBeepSound
  } = useGpr();

  // Local 60fps scrolling animation distance
  const [animationDistance, setAnimationDistance] = useState(0);

  useEffect(() => {
    let animId: number;
    let lastTime = Date.now();
    
    const updateScroll = () => {
      if (isScanning && !isPaused) {
        const now = Date.now();
        const delta = (now - lastTime) / 1000;
        lastTime = now;
        setAnimationDistance(prev => prev + delta * 0.18);
      }
      animId = requestAnimationFrame(updateScroll);
    };

    if (isScanning && !isPaused) {
      lastTime = Date.now();
      animId = requestAnimationFrame(updateScroll);
    }
    
    return () => cancelAnimationFrame(animId);
  }, [isScanning, isPaused]);

  const [instantMute, setInstantMute] = useState(false);
  const [showAiBScan, setShowAiBScan] = useState(false);
  const [showInstantDetector, setShowInstantDetector] = useState(false);
  const [showPip, setShowPip] = useState(true);
  const lastAnomaliesCount = useRef(0);

  useEffect(() => {
    if (detectedAnomalies.length > lastAnomaliesCount.current) {
      setShowPip(true);
    }
    lastAnomaliesCount.current = detectedAnomalies.length;
  }, [detectedAnomalies.length]);

  useEffect(() => {
    if (isScanning) {
      setAnimationDistance(0);
    }
  }, [isScanning]);

  const windowEnd = animationDistance;
  const windowStart = Math.max(0, windowEnd - 6);
  const range = windowEnd - windowStart;

  const mockGprTargets = [
    { name: language === 'tr' ? 'Altın Kütle' : 'Gold Target', type: 'gold', distance: 1.8, depthPercent: 0.48, color: '#F59E0B' },
    { name: language === 'tr' ? 'Altyapı Kablosu' : 'Utility Cable', type: 'cable', distance: 3.5, depthPercent: 0.28, color: '#10B981' },
    { name: language === 'tr' ? 'Metal Boru' : 'Metallic Pipe', type: 'metal', distance: 5.4, depthPercent: 0.38, color: '#3B82F6' },
    { name: language === 'tr' ? 'Boşluk / Tünel' : 'Cavity / Tunnel', type: 'void', distance: 7.6, depthPercent: 0.72, color: '#EF4444' },
    { name: language === 'tr' ? 'Arkeolojik Sandık' : 'Ancient Chest', type: 'gold', distance: 9.8, depthPercent: 0.54, color: '#F59E0B' },
    { name: language === 'tr' ? 'Çelik Izgara' : 'Steel Rebar', type: 'metal', distance: 12.0, depthPercent: 0.22, color: '#3B82F6' },
    { name: language === 'tr' ? 'Su Sızıntısı' : 'Water Pocket', type: 'water', distance: 14.2, depthPercent: 0.65, color: '#06B6D4' },
    { name: language === 'tr' ? 'Kaya Tabakası' : 'Bedrock Fragment', type: 'rock', distance: 16.5, depthPercent: 0.80, color: '#6B7280' },
    { name: language === 'tr' ? 'Altyapı Borusu' : 'Conduit Pipe', type: 'pipe', distance: 18.8, depthPercent: 0.40, color: '#10B981' },
  ];

  // Instant Metal Detector Logic
  const antennaX = windowEnd % 20; // wraps around 20 meters cycle
  let activeInstantTarget: any = null;
  let instantProximity = 0;
  let instantStrength = 0;

  if (isScanning && !isPaused) {
    for (const target of mockGprTargets) {
      const dist = Math.abs(antennaX - target.distance);
      if (dist < 0.6) {
        activeInstantTarget = target;
        instantProximity = (0.6 - dist) / 0.6; // 0 to 1
        const isMetallic = ['gold', 'metal', 'pipe', 'cable'].includes(target.type);
        instantStrength = Math.round(instantProximity * (isMetallic ? 98 : 45));
      }
    }
  }

  // Geiger-counter style audio feedback for the instant metal detector
  useEffect(() => {
    if (!isScanning || isPaused || instantMute || instantStrength < 15 || !showInstantDetector) return;

    // Beep interval speed: higher strength = faster beeps
    let intervalTime = 800;
    if (instantStrength > 75) {
      intervalTime = 150;
    } else if (instantStrength > 45) {
      intervalTime = 350;
    } else if (instantStrength > 25) {
      intervalTime = 550;
    }

    const playBeep = () => {
      playBeepSound();
    };

    // Play immediate beep when approaching
    playBeep();

    const beepTimer = setInterval(playBeep, intervalTime);
    return () => clearInterval(beepTimer);
  }, [isScanning, isPaused, instantMute, instantStrength]);

  const visibleTargets = [];
  const cycleLength = 20;
  for (let cycle = -1; cycle <= 2; cycle++) {
    const cycleOffset = (Math.floor(windowStart / cycleLength) + cycle) * cycleLength;
    if (cycleOffset < 0) continue;
    
    for (const t of mockGprTargets) {
      const actualDistance = t.distance + cycleOffset;
      if (actualDistance >= windowStart - 1 && actualDistance <= windowEnd + 1) {
        visibleTargets.push({
          ...t,
          actualDistance
        });
      }
    }
  }

  // High-fidelity multi-frequency wavy geological soil layer generator
  const getRealisticSoilPath = (baseY: number, freq: number, amp: number, width: number, startX: number) => {
    const points = [];
    const steps = 40;
    const rangeSpan = range > 0 ? range : 6;
    for (let i = 0; i <= steps; i++) {
      const x = startX + (i / steps) * width;
      const dist = windowStart + (i / steps) * rangeSpan;
      
      // Real ground stratification has overlapping micro-undulations and noise
      const wave = Math.sin(dist * freq) * amp 
                 + Math.cos(dist * freq * 2.2) * (amp * 0.4) 
                 + Math.sin(dist * freq * 4.7) * (amp * 0.15)
                 + Math.sin(dist * 18) * 0.8;
                 
      const y = baseY + wave;
      points.push(`${i === 0 ? 'M' : 'L'} ${x} ${y}`);
    }
    return points.join(' ');
  };

  const getSoilLayerPathLeft = (baseY: number, freq: number, amp: number) => {
    const p = getRealisticSoilPath(baseY, freq, amp, 220, 0);
    return `${p} L 220 160 L 0 160 Z`;
  };

  const getSoilLinePathLeft = (baseY: number, freq: number, amp: number) => {
    return getRealisticSoilPath(baseY, freq, amp, 220, 0);
  };

  const getSoilLayerPathRight = (baseY: number, freq: number, amp: number) => {
    const p = getRealisticSoilPath(baseY, freq, amp, 220, 230);
    return `${p} L 450 160 L 230 160 Z`;
  };

  const getSoilLinePathRight = (baseY: number, freq: number, amp: number) => {
    return getRealisticSoilPath(baseY, freq, amp, 220, 230);
  };

  const getSoilLinePathFull = (baseY: number, freq: number, amp: number) => {
    return getRealisticSoilPath(baseY, freq, amp, 450, 0);
  };

  const getSoilLayerPathFull = (baseY: number, freq: number, amp: number) => {
    const p = getRealisticSoilPath(baseY, freq, amp, 450, 0);
    return `${p} L 450 160 L 0 160 Z`;
  };

  // Coupling noise band path generator
  const getCouplingBandPath = (baseY: number, width: number, startX: number) => {
    const points = [];
    const steps = 40;
    const rangeSpan = range > 0 ? range : 6;
    for (let i = 0; i <= steps; i++) {
      const x = startX + (i / steps) * width;
      const dist = windowStart + (i / steps) * rangeSpan;
      const noise = Math.sin(dist * 22) * 0.4 + Math.cos(dist * 47) * 0.2;
      const y = baseY + noise;
      points.push(`${i === 0 ? 'M' : 'L'} ${x} ${y}`);
    }
    return points.join(' ');
  };

  // Deterministic clutter reflector points generator
  const getClutterReflectors = (startDist: number, endDist: number) => {
    const reflectors = [];
    const startInt = Math.floor(startDist);
    const endInt = Math.ceil(endDist);
    for (let d = startInt; d <= endInt; d++) {
      const hash1 = Math.abs(Math.sin(d * 12.9898) * 43758.5453) % 1;
      const hash2 = Math.abs(Math.sin(d * 78.233) * 43758.5453) % 1;
      const hash3 = Math.abs(Math.sin(d * 45.1482) * 43758.5453) % 1;
      reflectors.push({
        distance: d + hash1 * 0.9,
        depthPercent: 0.15 + hash2 * 0.75,
        size: 0.35 + hash3 * 0.4,
        intensity: 0.14 + hash1 * 0.22
      });

      const hash4 = Math.abs(Math.sin((d + 0.5) * 12.9898) * 43758.5453) % 1;
      const hash5 = Math.abs(Math.sin((d + 0.5) * 78.233) * 43758.5453) % 1;
      reflectors.push({
        distance: d + 0.5 + hash4 * 0.9,
        depthPercent: 0.15 + hash5 * 0.75,
        size: 0.25 + hash4 * 0.35,
        intensity: 0.12 + hash5 * 0.18
      });
    }
    return reflectors;
  };

  // Clutter hyperbola curve path generator
  const getClutterHyperbolaPath = (xCenter: number, yCenter: number, size: number) => {
    const points = [];
    const width = 14 * size;
    const steps = 12;
    for (let i = 0; i <= steps; i++) {
      const dx = ((i / steps) - 0.5) * 2 * width;
      const dy = Math.sqrt(9 + dx * dx) - 3;
      const x = xCenter + dx;
      const y = yCenter + dy * 2.0 * size;
      points.push(`${i === 0 ? 'M' : 'L'} ${x} ${y}`);
    }
    return points.join(' ');
  };

  // Target hyperbola curve path generator
  const getRealisticHyperbolaPath = (xCenter: number, yCenter: number, phaseOffset: number) => {
    const points = [];
    const steps = 24;
    const width = 35;
    for (let i = 0; i <= steps; i++) {
      const dx = ((i / steps) - 0.5) * 2 * width;
      const dy = Math.sqrt(100 + dx * dx) - 10;
      const x = xCenter + dx;
      const y = yCenter + dy * 1.5 + phaseOffset;
      points.push(`${i === 0 ? 'M' : 'L'} ${x} ${y}`);
    }
    return points.join(' ');
  };

  // RFI vertical streak line generator
  const getVerticalStreaks = (startDist: number, endDist: number, startX: number, width: number) => {
    const streaks = [];
    const startInt = Math.floor(startDist * 2);
    const endInt = Math.ceil(endDist * 2);
    const rangeSpan = range > 0 ? range : 6;
    for (let d = startInt; d <= endInt; d++) {
      const hash = Math.abs(Math.sin(d * 93.4729) * 12345.6789) % 1;
      if (hash > 0.84) {
        const dist = d * 0.5 + hash * 0.3;
        if (dist >= startDist && dist <= endDist) {
          const pct = (dist - startDist) / rangeSpan;
          const x = startX + pct * width;
          streaks.push({ x, opacity: 0.04 + (hash % 0.08) });
        }
      }
    }
    return streaks;
  };

  // DJI-style drawer state: 'none' | 'radargram' | 'transmitter' | 'receiver' | 'power' | 'fft' | 'three_d' | 'ai'
  const [activeDrawer, setActiveDrawer] = useState<'none' | 'radargram' | 'transmitter' | 'receiver' | 'power' | 'fft' | 'three_d' | 'ai'>('none');
  
  // Custom GPR visual markers and saved points
  const [markers, setMarkers] = useState<number[]>([]);
  const [savedPoints, setSavedPoints] = useState<{ id: string; distance: number; depth: number }[]>([]);
  
  // Local state toggles for sub-overlays inside Radargram HUD
  const [showAScan, setShowAScan] = useState(false);
  const [liveScopeHeight, setLiveScopeHeight] = useState(300); // Dynamic height measured by onLayout
  const [customColormap, setCustomColormap] = useState<'classic' | 'thermal' | 'emerald'>('classic');

  // Animation for the right-side drawer
  const drawerSlideAnim = useRef(new Animated.Value(350)).current;

  useEffect(() => {
    if (activeDrawer !== 'none') {
      Animated.timing(drawerSlideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(drawerSlideAnim, {
        toValue: 350,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [activeDrawer]);

  // Reset local overlays and states when a scan starts
  useEffect(() => {
    if (isScanning) {
      setMarkers([]);
      setSavedPoints([]);
      setShowAScan(false); // Hide A-Scan trace by default for clean Radargram view
      setActiveDrawer('none');
      setShowAiBScan(false);
      setShowInstantDetector(false);
      setShowPip(true);
    }
  }, [isScanning]);

  const addMarker = () => {
    const currentDistance = isScanning ? scanTime * 0.15 : 2.4;
    setMarkers(prev => [...prev, currentDistance]);
  };

  const savePoint = () => {
    const currentDistance = isScanning ? scanTime * 0.15 : 2.4;
    const newPoint = {
      id: `P-${Date.now().toString().slice(-4)}`,
      distance: currentDistance,
      depth: penetrationDepth
    };
    setSavedPoints(prev => [...prev, newPoint]);
  };

  const getRadarColor = (value: number) => {
    if (customColormap === 'thermal') {
      if (value < 40) return '#03001C';
      if (value < 100) return `rgb(${Math.floor(value * 1.5)}, 0, ${Math.floor(value * 0.6)})`;
      return `rgb(255, ${Math.floor(value * 0.9)}, 0)`;
    }
    if (customColormap === 'emerald') {
      if (value < 40) return '#022C22';
      if (value < 100) return `rgb(5, ${Math.floor(value * 0.8)}, ${Math.floor(value * 0.5)})`;
      return `rgb(52, 211, 153)`;
    }
    // Classic GPR Theme (copper-iron style)
    if (value < 40) return '#090D16';
    if (value < 100) return `rgb(${Math.floor(value * 0.5)}, ${Math.floor(value * 0.5)}, ${Math.floor(value * 0.7)})`;
    return `rgb(${Math.floor(value * 1.0)}, ${Math.floor(value * 0.6)}, ${Math.floor(value * 0.2)})`;
  };

  const getVerticalAScanPath = () => {
    if (!radargramData || radargramData.length === 0) return '';
    const lastColIndex = radargramData[0].length - 1;
    const traceData = radargramData.map(row => row[lastColIndex]);
    const height = liveScopeHeight - 20;
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

  // Render the sliding drawers content based on active selection
  const renderDrawerContent = () => {
    const textStyle = { color: '#E2E8F0', fontSize: 11, marginVertical: 3 };
    const labelStyle = { color: '#9CA3AF', fontSize: 10, fontWeight: '700' as const };
    const containerGraphWidth = SCREEN_WIDTH * 0.32 - 32;

    switch (activeDrawer) {
      case 'radargram':
        return (
          <ScrollView>
            <Text style={styles.drawerSectionTitle}>{language === 'tr' ? 'Radargram Ayarları' : 'Radargram Config'}</Text>
            <Text style={labelStyle}>{language === 'tr' ? 'ANTEN / FREKANS' : 'ANTENNA / FREQ'}</Text>
            <Text style={textStyle}>{antennaType} | {frequency} MHz</Text>
            
            <Text style={[labelStyle, { marginTop: 12 }]}>{language === 'tr' ? 'RENK ŞABLONU' : 'COLORMAP'}</Text>
            <View style={{ flexDirection: 'row', marginTop: 6, gap: 6 }}>
              {(['classic', 'thermal', 'emerald'] as const).map((map) => (
                <TouchableOpacity 
                  key={map} 
                  style={[styles.drawerBtn, customColormap === map && styles.drawerBtnActive]} 
                  onPress={() => setCustomColormap(map)}
                >
                  <Text style={[styles.drawerBtnText, customColormap === map && styles.drawerBtnTextActive]}>{map.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[labelStyle, { marginTop: 16 }]}>{language === 'tr' ? 'GÖRÜNÜM OVERLAYLERİ' : 'VIEW OVERLAYS'}</Text>
            <TouchableOpacity 
              style={[styles.drawerBtn, { marginTop: 6, backgroundColor: showAScan ? '#2563EB' : '#1E293B' }]} 
              onPress={() => setShowAScan(p => !p)}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '700', textAlign: 'center' }}>
                {language === 'tr' ? `A-Scan Wiggle Grafiği: ${showAScan ? 'AÇIK' : 'KAPALI'}` : `A-Scan Wiggle: ${showAScan ? 'ON' : 'OFF'}`}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        );
      case 'transmitter':
        return (
          <ScrollView>
            <Text style={styles.drawerSectionTitle}>{language === 'tr' ? 'Verici Sinyal Analizi' : 'Transmitter Signal'}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={textStyle}>Pulse V: 10V</Text>
              <Text style={textStyle}>PRR: 100 kHz</Text>
            </View>
            <Text style={labelStyle}>{language === 'tr' ? 'PULSE DALGA FORMU' : 'PULSE WAVEFORM'}</Text>
            <View style={{ height: 100, backgroundColor: '#090D16', borderRadius: 8, overflow: 'hidden', padding: 4, marginVertical: 8 }}>
              <Svg width="100%" height="100%">
                <Path 
                  d={makeSvgPath(txWaveform, 90, containerGraphWidth, 25)} 
                  fill="none" 
                  stroke="#3B82F6" 
                  strokeWidth="1.5" 
                />
                <Line x1="0" y1="45" x2={containerGraphWidth} y2="45" stroke="#1F2937" strokeWidth="1" strokeDasharray="2 2" />
              </Svg>
            </View>
            <Text style={{ color: '#9CA3AF', fontSize: 10, fontStyle: 'italic' }}>
              {language === 'tr' ? 'Antenden yayılan gerçek zamanlı pulse gerilimi genliği ve faz dağılımı.' : 'Real-time pulse voltage amplitude and phase distribution emitted from bowtie antenna.'}
            </Text>
          </ScrollView>
        );
      case 'receiver':
        return (
          <ScrollView>
            <Text style={styles.drawerSectionTitle}>{language === 'tr' ? 'Alıcı Sinyal Analizi' : 'Receiver Signal'}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={textStyle}>Gain: 40 dB</Text>
              <Text style={textStyle}>Filter: Bandpass</Text>
            </View>
            <Text style={labelStyle}>{language === 'tr' ? 'CANLI RX SİNYAL AKIŞI' : 'LIVE RX WAVEFORM'}</Text>
            <View style={{ height: 100, backgroundColor: '#090D16', borderRadius: 8, overflow: 'hidden', padding: 4, marginVertical: 8 }}>
              <Svg width="100%" height="100%">
                <Path 
                  d={makeSvgPath(rxWaveform, 90, containerGraphWidth, 1.5)} 
                  fill="none" 
                  stroke="#10B981" 
                  strokeWidth="1.5" 
                />
                <Line x1="0" y1="45" x2={containerGraphWidth} y2="45" stroke="#1F2937" strokeWidth="1" strokeDasharray="2 2" />
              </Svg>
            </View>
            <Text style={{ color: '#9CA3AF', fontSize: 10, fontStyle: 'italic' }}>
              {language === 'tr' ? 'Zeminden yansıyan canlı elektromanyetik dalga genliği.' : 'Live electromagnetic wave amplitude reflected back from subterranean layers.'}
            </Text>
          </ScrollView>
        );
      case 'power':
        return (
          <ScrollView>
            <Text style={styles.drawerSectionTitle}>{language === 'tr' ? 'Güç & Sıcaklık Sistemi' : 'Power & Thermal Status'}</Text>
            <View style={styles.drawerRow}>
              <Text style={labelStyle}>{language === 'tr' ? 'Ana Pil Gerilimi:' : 'Main Battery V:'}</Text>
              <Text style={textStyle}>11.8 V (98%)</Text>
            </View>
            <View style={styles.drawerRow}>
              <Text style={labelStyle}>{language === 'tr' ? 'Güç Tüketimi:' : 'Current Draw:'}</Text>
              <Text style={textStyle}>420 mA</Text>
            </View>
            <View style={styles.drawerRow}>
              <Text style={labelStyle}>{language === 'tr' ? 'Sistem Sıcaklığı:' : 'System Temp:'}</Text>
              <Text style={textStyle}>34.2 °C</Text>
            </View>
            <View style={styles.drawerRow}>
              <Text style={labelStyle}>{language === 'tr' ? 'Verici Güç Devresi:' : 'TX Rail Boost:'}</Text>
              <Text style={[textStyle, { color: '#22C55E' }]}>READY (33.1 V)</Text>
            </View>
            <View style={styles.drawerRow}>
              <Text style={labelStyle}>{language === 'tr' ? 'Alıcı Regülatörü:' : 'RX Regulator Rail:'}</Text>
              <Text style={[textStyle, { color: '#22C55E' }]}>OK (5.0 V)</Text>
            </View>
          </ScrollView>
        );
      case 'fft':
        return (
          <ScrollView>
            <Text style={styles.drawerSectionTitle}>{language === 'tr' ? 'FFT Spektrum Analizi' : 'FFT Spectrum'}</Text>
            <Text style={[labelStyle, { marginBottom: 8 }]}>{language === 'tr' ? 'FREKANS YANITI SPEKTRUMU (Hz)' : 'FREQUENCY RESPONSE SPECTRUM (Hz)'}</Text>
            <View style={{ height: 120, backgroundColor: '#090D16', borderRadius: 8, overflow: 'hidden', flexDirection: 'row', alignItems: 'flex-end', padding: 6, marginVertical: 8 }}>
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
            <Text style={{ color: '#9CA3AF', fontSize: 10, fontStyle: 'italic' }}>
              {language === 'tr' ? 'Zemindeki elektromanyetik sönümlenmenin spektral yoğunluk grafiği.' : 'Spectral density distribution showing electromagnetic attenuation characteristics.'}
            </Text>
          </ScrollView>
        );
      case 'three_d':
        return (
          <ScrollView>
            <Text style={styles.drawerSectionTitle}>{language === 'tr' ? '3D Zemin Altı Modeli' : '3D Subsurface Map'}</Text>
            <View style={{ height: 130, backgroundColor: '#090D16', borderRadius: 8, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', marginVertical: 8 }}>
              <Svg width="100%" height="100%">
                <G transform="rotate(30, 80, 60)">
                  <Path d="M 20 40 L 140 40 L 110 65 L 0 65 Z" fill="#78350F" opacity="0.8" stroke="#F59E0B" strokeWidth="1" />
                  <Path d="M 20 65 L 140 65 L 110 90 L 0 90 Z" fill="#92400E" opacity="0.6" stroke="#D97706" strokeWidth="1" />
                  {detectedAnomalies.length > 0 && (
                    <Circle cx="70" cy="55" r="8" fill="#3B82F6" opacity="0.8" />
                  )}
                </G>
              </Svg>
            </View>
            <Text style={{ color: '#9CA3AF', fontSize: 10, fontStyle: 'italic' }}>
              {language === 'tr' ? 'GPR tarama izlerinin üç boyutlu derinlik katmanı rekonstrüksiyonu.' : 'Three-dimensional depth layer grid reconstruction of GPR survey traces.'}
            </Text>
          </ScrollView>
        );
      case 'ai':
        return (
          <ScrollView>
            <Text style={styles.drawerSectionTitle}>{language === 'tr' ? 'Yapay Zeka Bulguları' : 'AI Detections'}</Text>
            <Text style={labelStyle}>{language === 'tr' ? 'KAYDEDİLEN NOKTALAR' : 'SAVED POINTS'}</Text>
            {savedPoints.length === 0 ? (
              <Text style={{ color: '#9CA3AF', fontSize: 10, fontStyle: 'italic', marginVertical: 6 }}>
                {language === 'tr' ? 'Nokta kaydedilmedi' : 'No points saved yet'}
              </Text>
            ) : (
              savedPoints.map((pt, idx) => (
                <View key={pt.id} style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#1F2937', paddingVertical: 4 }}>
                  <Text style={{ color: '#E2E8F0', fontSize: 10 }}>#{idx+1} {pt.id}</Text>
                  <Text style={{ color: '#CBD5E1', fontSize: 10 }}>{pt.distance.toFixed(1)} m | {pt.depth.toFixed(1)} m</Text>
                </View>
              ))
            )}

            <Text style={[labelStyle, { marginTop: 14 }]}>{language === 'tr' ? 'TESPİT GEÇMİŞİ' : 'DETECTION LOG'}</Text>
            {detectedAnomalies.length === 0 ? (
              <Text style={{ color: '#9CA3AF', fontSize: 10, fontStyle: 'italic', marginVertical: 6 }}>
                {language === 'tr' ? 'Anomali tespit edilmedi' : 'No anomalies detected yet'}
              </Text>
            ) : (
              detectedAnomalies.map((anom) => (
                <View key={anom.id} style={{ borderBottomWidth: 1, borderBottomColor: '#1F2937', paddingVertical: 6 }}>
                  <Text style={{ color: '#EF4444', fontSize: 11, fontWeight: '700' }}>⚠️ {anom.material}</Text>
                  <Text style={{ color: '#9CA3AF', fontSize: 10 }}>{language === 'tr' ? 'Derinlik:' : 'Depth:'} {anom.depth} m | {language === 'tr' ? 'Güven:' : 'Confidence:'} %{anom.confidence}</Text>
                  <Text style={{ color: '#94A3B8', fontSize: 9.5 }} numberOfLines={1}>{anom.explanation}</Text>
                </View>
              ))
            )}
          </ScrollView>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      
      {/* 1. DJI-STYLE TOP STATUS BAR */}
      <View style={styles.djiStatusBar}>
        <View style={styles.statusLeft}>
          <View style={styles.statusBadge}>
            <Ionicons name="location" size={12} color="#10B981" />
            <Text style={[styles.statusText, { color: '#10B981', fontWeight: '800' }]}>GPS: FIX (18 Sats)</Text>
          </View>
          <View style={styles.statusBadge}>
            <Ionicons name="wifi" size={12} color="#10B981" />
            <Text style={styles.statusText}>5.8G CONNECTED</Text>
          </View>
        </View>
        
        <View style={styles.statusCenter}>
          {isScanning ? (
            <View style={styles.recBadge}>
              <View style={styles.recDot} />
              <Text style={styles.recText}>{language === 'tr' ? 'KAYIT GPR' : 'REC GPR'}</Text>
            </View>
          ) : (
            <Text style={styles.recTextIdle}>{language === 'tr' ? 'HAZIR TARA' : 'STANDBY'}</Text>
          )}
        </View>

        <View style={styles.statusRight}>
          <View style={styles.statusBadge}>
            <Ionicons name="battery-charging" size={12} color="#10B981" />
            <Text style={styles.statusText}>98% (11.8 V)</Text>
          </View>
          <View style={styles.statusBadge}>
            <Ionicons name="time-outline" size={12} color="#FFFFFF" />
            <Text style={styles.statusText}>{formattedTime(scanTime)}</Text>
          </View>
        </View>
      </View>

      {/* 2. MAIN HUD OPERATION AREA */}
      <View style={{ flex: 1, flexDirection: 'row', width: '100%' }}>
        
        {/* Left main content containing the Radargram HUD (shrinks when drawer is active) */}
        <View style={{ flex: activeDrawer === 'none' ? 1 : 0.68, height: '100%', position: 'relative' }}>
          
          {/* Real-time Radargram occupying 85-90% of screen */}
          <View 
            onLayout={(e) => {
              const { height } = e.nativeEvent.layout;
              if (height > 0) {
                setLiveScopeHeight(height);
              }
            }}
            style={styles.gprViewport}
          >
            
            {/* Split Screen A-Scan trace (only shown if configured) */}
            {showAScan && (
              <View style={styles.aScanPane}>
                <View style={{ height: 20 }} />
                <View style={{ flex: 1, paddingVertical: 2 }}>
                  <Svg width="100%" height="100%">
                    <Line x1="30" y1="0" x2="30" y2={liveScopeHeight - 20} stroke="#374151" strokeWidth="1" strokeDasharray="3 3" />
                    <Path 
                      d={getVerticalAScanPath()} 
                      fill="none" 
                      stroke="#EF4444" 
                      strokeWidth="2" 
                    />
                  </Svg>
                </View>
              </View>
            )}

            {/* Depth scale ruler */}
            <View style={styles.depthScalePane}>
              <View style={{ height: 20 }} />
              <View style={{ flex: 1, paddingVertical: 4 }}>
                <Svg width="100%" height="100%">
                  {Array.from({ length: 5 }).map((_, idx) => {
                    const gridHeight = liveScopeHeight - 20;
                    const yVal = (idx / 4) * (gridHeight - 12) + 6;
                    const depthVal = (idx / 4) * penetrationDepth;
                    return (
                      <G key={idx}>
                        <Line x1="0" y1={yVal} x2="5" y2={yVal} stroke="#9CA3AF" strokeWidth="1" />
                        <SvgText 
                          x="9" 
                          y={yVal} 
                          fill="#9CA3AF" 
                          fontSize="8" 
                          fontWeight="800" 
                          alignmentBaseline="middle"
                        >
                          {`${depthVal.toFixed(1)}m`}
                        </SvgText>
                      </G>
                    );
                  })}
                </Svg>
              </View>
            </View>

            {/* B-Scan Grid View */}
            <View style={{ flex: 1, flexDirection: 'column', height: '100%' }}>
              
              {/* Horizontal Distance Ruler at the top */}
              <View style={styles.horizontalDistancePane}>
                <Svg width="100%" height="100%">
                  {Array.from({ length: 6 }).map((_, idx) => {
                    const xPercent = (idx / 5) * 100;
                    const totalDistance = isScanning ? Math.max(5.0, scanTime * 0.15) : 5.0;
                    const startDist = isScanning ? Math.max(0, scanTime * 0.15 - 5.0) : 0;
                    const distanceVal = startDist + (idx / 5) * (totalDistance - startDist);
                    return (
                      <G key={idx}>
                        <Line x1={`${xPercent}%`} y1="12" x2={`${xPercent}%`} y2="20" stroke="#9CA3AF" strokeWidth="1" />
                        <SvgText 
                          x={`${xPercent}%`} 
                          y="6" 
                          fill="#9CA3AF" 
                          fontSize="8" 
                          fontWeight="800" 
                          textAnchor="middle"
                        >
                          {`${distanceVal.toFixed(1)}m`}
                        </SvgText>
                      </G>
                    );
                  })}

                  {/* Render the Flag Markers placed by user */}
                  {markers.map((markerDist, mIdx) => {
                    const totalDistance = isScanning ? Math.max(5.0, scanTime * 0.15) : 5.0;
                    const startDist = isScanning ? Math.max(0, scanTime * 0.15 - 5.0) : 0;
                    if (markerDist >= startDist && markerDist <= totalDistance) {
                      const range = totalDistance - startDist;
                      const xPercent = ((markerDist - startDist) / range) * 100;
                      return (
                        <G key={`marker-${mIdx}`}>
                          <Line 
                            x1={`${xPercent}%`} 
                            y1="0" 
                            x2={`${xPercent}%`} 
                            y2={liveScopeHeight} 
                            stroke="#EF4444" 
                            strokeWidth="1.5" 
                            strokeDasharray="4 4" 
                          />
                          <Circle cx={`${xPercent}%`} cy="10" r="4" fill="#EF4444" />
                        </G>
                      );
                    }
                    return null;
                  })}
                </Svg>
              </View>

              {/* Scrolling Radargram cells */}
              <View style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                <Svg width="100%" height="100%" viewBox="0 0 450 160">
                  {isScanning && (() => {
                    let cPrimary = '#D97706'; // copper
                    let cSecondary = '#F59E0B'; // light copper
                    let cDark = '#1E293B';
                    let cBg = '#090D16';
                    
                    if (customColormap === 'thermal') {
                      cPrimary = '#EF4444'; // red
                      cSecondary = '#F59E0B'; // yellow
                      cDark = '#1E3A8A'; // dark blue
                      cBg = '#03001C';
                    } else if (customColormap === 'emerald') {
                      cPrimary = '#10B981'; // emerald
                      cSecondary = '#34D399'; // light emerald
                      cDark = '#064E3B'; // dark green
                      cBg = '#022C22';
                    }

                    return (
                      <G>
                        {/* Define gradients */}
                        <Defs>
                          <LinearGradient id="rawRadargramGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <Stop offset="0%" stopColor={cBg} stopOpacity={1} />
                            <Stop offset="25%" stopColor={cBg} stopOpacity={0.9} />
                            <Stop offset="50%" stopColor={cDark} stopOpacity={0.6} />
                            <Stop offset="85%" stopColor={cBg} stopOpacity={0.9} />
                            <Stop offset="100%" stopColor="#02040a" stopOpacity={1} />
                          </LinearGradient>
                        </Defs>

                        {showAiBScan ? (
                          <>
                            {/* --- LEFT PANE: AI INTERPRETATION --- */}
                            <G>
                              {/* Grid background (left half) */}
                              {Array.from({ length: 5 }).map((_, idx) => (
                                <Line 
                                  key={`grid-x-left-${idx}`} 
                                  x1={(idx / 4) * 220} 
                                  y1="0" 
                                  x2={(idx / 4) * 220} 
                                  y2="160" 
                                  stroke="#1F2937" 
                                  strokeWidth="0.5" 
                                  strokeDasharray="2 4" 
                                />
                              ))}
                              {Array.from({ length: 5 }).map((_, idx) => (
                                <Line 
                                  key={`grid-y-left-${idx}`} 
                                  x1="0" 
                                  y1={(idx / 4) * 160} 
                                  x2="220" 
                                  y2={(idx / 4) * 160} 
                                  stroke="#1F2937" 
                                  strokeWidth="0.5" 
                                  strokeDasharray="2 4" 
                                />
                              ))}

                              {/* Soil Layers Left */}
                              <Path d={getSoilLayerPathLeft(35, 1.2, 5)} fill="#1C140F" opacity="0.45" />
                              <Path d={getSoilLayerPathLeft(70, 0.9, 7)} fill="#120F16" opacity="0.65" />
                              <Path d={getSoilLayerPathLeft(110, 0.6, 9)} fill="#07060A" opacity="0.9" />

                              {/* Boundary lines Left */}
                              <Path d={getSoilLinePathLeft(35, 1.2, 5)} fill="none" stroke="#523B2A" strokeWidth="1.2" strokeDasharray="3 4" opacity="0.6" />
                              <Path d={getSoilLinePathLeft(70, 0.9, 7)} fill="none" stroke="#3D2D4F" strokeWidth="1.2" strokeDasharray="4 3" opacity="0.5" />
                              <Path d={getSoilLinePathLeft(110, 0.6, 9)} fill="none" stroke="#2D3748" strokeWidth="1.0" opacity="0.4" />

                              {/* Ground coupling band Left */}
                              <Line x1="0" y1="12" x2="220" y2="12" stroke="#8B5CF6" strokeWidth="2" opacity="0.4" />

                              {/* AI Targets Left */}
                              {visibleTargets.map((target, idx) => {
                                const rangeSpan = range > 0 ? range : 6;
                                const pct = (target.actualDistance - windowStart) / rangeSpan;
                                const xPos = pct * 220;
                                if (xPos < 0 || xPos > 220) return null;
                                const yPos = target.depthPercent * 110 + 25;
                                
                                const hyperClean = `M ${xPos - 35} ${yPos + 26} Q ${xPos} ${yPos - 2} ${xPos + 35} ${yPos + 26}`;

                                return (
                                  <G key={`target-left-${idx}`}>
                                    <Path d={hyperClean} fill="none" stroke="#D97706" strokeWidth="2.0" opacity="0.85" />
                                    <Circle cx={xPos} cy={yPos} r="2.5" fill={target.color} />
                                    <Circle cx={xPos} cy={yPos} r={6} fill="none" stroke={target.color} strokeWidth="0.8" opacity="0.7" />
                                    <SvgText 
                                      x={xPos} 
                                      y={yPos - 8} 
                                      fill={target.color} 
                                      fontSize="7" 
                                      fontWeight="800" 
                                      textAnchor="middle"
                                    >
                                      {target.name.toUpperCase()}
                                    </SvgText>
                                  </G>
                                );
                              })}
                            </G>

                            {/* --- MIDDLE DIVIDER --- */}
                            <Line x1="225" y1="0" x2="225" y2="160" stroke="#374151" strokeWidth="1.5" strokeDasharray="3 3" />

                            {/* --- RIGHT PANE: RAW GPR FEEDS (SPLIT SCREEN MODE) --- */}
                            <G>
                              <Rect x="230" y="0" width="220" height="160" fill="url(#rawRadargramGrad)" />

                              {/* Grid lines (Right half) */}
                              {Array.from({ length: 5 }).map((_, idx) => (
                                <Line 
                                  key={`grid-x-right-${idx}`} 
                                  x1={230 + (idx / 4) * 220} 
                                  y1="0" 
                                  x2={230 + (idx / 4) * 220} 
                                  y2="160" 
                                  stroke="#1F2937" 
                                  strokeWidth="0.3" 
                                  strokeDasharray="1 5" 
                                />
                              ))}

                              {/* 1. Geological Stratification Layers with Noise & Wave Interference */}
                              <Path d={getSoilLinePathRight(35, 1.2, 5)} fill="none" stroke={cDark} strokeWidth="1.6" opacity="0.4" />
                              <Path d={getSoilLinePathRight(70, 0.9, 7)} fill="none" stroke={cPrimary} strokeWidth="1.0" opacity="0.25" />
                              <Path d={getSoilLinePathRight(110, 0.6, 9)} fill="none" stroke={cDark} strokeWidth="1.4" opacity="0.3" />

                              {/* 2. Subsurface Pebbles / Clutter Noise (Deterministic small hyperbolas) */}
                              {getClutterReflectors(windowStart, windowEnd).map((clutter, idx) => {
                                const rangeSpan = range > 0 ? range : 6;
                                const pct = (clutter.distance - windowStart) / rangeSpan;
                                const xPosRight = 230 + pct * 220;
                                if (xPosRight < 230 || xPosRight > 450) return null;
                                const yPos = clutter.depthPercent * 110 + 25;
                                return (
                                  <Path 
                                    key={`clutter-right-${idx}`}
                                    d={getClutterHyperbolaPath(xPosRight, yPos, clutter.size)}
                                    fill="none"
                                    stroke={cSecondary}
                                    strokeWidth="0.7"
                                    opacity={clutter.intensity}
                                  />
                                );
                              })}

                              {/* 3. Antenna Direct Coupling / Ringing bands (highly nested) */}
                              <Path d={getCouplingBandPath(10, 220, 230)} fill="none" stroke={cPrimary} strokeWidth="2.5" opacity="0.75" />
                              <Path d={getCouplingBandPath(13, 220, 230)} fill="none" stroke={cBg} strokeWidth="1.8" opacity="0.9" />
                              <Path d={getCouplingBandPath(16, 220, 230)} fill="none" stroke={cSecondary} strokeWidth="2.0" opacity="0.55" />
                              <Path d={getCouplingBandPath(19, 220, 230)} fill="none" stroke={cDark} strokeWidth="1.2" opacity="0.4" />
                              <Path d={getCouplingBandPath(22, 220, 230)} fill="none" stroke={cSecondary} strokeWidth="0.8" opacity="0.2" />

                              {/* 4. RFI / Electromagnetic Striping Noise */}
                              {getVerticalStreaks(windowStart, windowEnd, 230, 220).map((streak, idx) => (
                                <Line 
                                  key={`streak-right-${idx}`}
                                  x1={streak.x}
                                  y1="0"
                                  x2={streak.x}
                                  y2="160"
                                  stroke={cSecondary}
                                  strokeWidth="1.5"
                                  opacity={streak.opacity}
                                />
                              ))}

                              {/* 5. High-fidelity multi-phase Target Hyperbolic Arcs */}
                              {visibleTargets.map((target, idx) => {
                                const rangeSpan = range > 0 ? range : 6;
                                const pct = (target.actualDistance - windowStart) / rangeSpan;
                                const xPosRight = 230 + pct * 220;
                                if (xPosRight < 230 || xPosRight > 450) return null;
                                const yPos = target.depthPercent * 110 + 25;
                                
                                return (
                                  <G key={`target-right-${idx}`}>
                                    {/* Alternating wave phases */}
                                    <Path d={getRealisticHyperbolaPath(xPosRight, yPos, -4)} fill="none" stroke={cDark} strokeWidth="1.2" opacity="0.45" />
                                    <Path d={getRealisticHyperbolaPath(xPosRight, yPos, -1)} fill="none" stroke={cSecondary} strokeWidth="2.4" opacity="0.85" />
                                    <Path d={getRealisticHyperbolaPath(xPosRight, yPos, 2)} fill="none" stroke={cBg} strokeWidth="1.6" opacity="0.95" />
                                    <Path d={getRealisticHyperbolaPath(xPosRight, yPos, 5)} fill="none" stroke={cPrimary} strokeWidth="2.0" opacity="0.75" />
                                    <Path d={getRealisticHyperbolaPath(xPosRight, yPos, 8)} fill="none" stroke={cDark} strokeWidth="1.0" opacity="0.4" />
                                  </G>
                                );
                              })}
                            </G>
                          </>
                        ) : (
                          /* --- FULL SCREEN MODE: RAW GPR FEEDS ONLY --- */
                          <G>
                            <Rect x="0" y="0" width="450" height="160" fill="url(#rawRadargramGrad)" />

                            {/* Grid lines (Full screen, 9 grid lines) */}
                            {Array.from({ length: 9 }).map((_, idx) => (
                              <Line 
                                key={`grid-x-full-${idx}`} 
                                x1={(idx / 8) * 450} 
                                y1="0" 
                                x2={(idx / 8) * 450} 
                                y2="160" 
                                stroke="#1F2937" 
                                strokeWidth="0.3" 
                                strokeDasharray="1 5" 
                              />
                            ))}

                            {/* 1. Geological Stratification Layers with Noise & Wave Interference */}
                            <Path d={getSoilLinePathFull(35, 1.2, 5)} fill="none" stroke={cDark} strokeWidth="1.6" opacity="0.4" />
                            <Path d={getSoilLinePathFull(70, 0.9, 7)} fill="none" stroke={cPrimary} strokeWidth="1.0" opacity="0.25" />
                            <Path d={getSoilLinePathFull(110, 0.6, 9)} fill="none" stroke={cDark} strokeWidth="1.4" opacity="0.3" />

                            {/* 2. Subsurface Pebbles / Clutter Noise (Deterministic small hyperbolas) */}
                            {getClutterReflectors(windowStart, windowEnd).map((clutter, idx) => {
                              const rangeSpan = range > 0 ? range : 6;
                              const pct = (clutter.distance - windowStart) / rangeSpan;
                              const xPosFull = pct * 450;
                              if (xPosFull < 0 || xPosFull > 450) return null;
                              const yPos = clutter.depthPercent * 110 + 25;
                              return (
                                <Path 
                                  key={`clutter-full-${idx}`}
                                  d={getClutterHyperbolaPath(xPosFull, yPos, clutter.size)}
                                  fill="none"
                                  stroke={cSecondary}
                                  strokeWidth="0.7"
                                  opacity={clutter.intensity}
                                />
                              );
                            })}

                            {/* 3. Antenna Direct Coupling / Ringing bands (highly nested) */}
                            <Path d={getCouplingBandPath(10, 450, 0)} fill="none" stroke={cPrimary} strokeWidth="2.5" opacity="0.75" />
                            <Path d={getCouplingBandPath(13, 450, 0)} fill="none" stroke={cBg} strokeWidth="1.8" opacity="0.9" />
                            <Path d={getCouplingBandPath(16, 450, 0)} fill="none" stroke={cSecondary} strokeWidth="2.0" opacity="0.55" />
                            <Path d={getCouplingBandPath(19, 450, 0)} fill="none" stroke={cDark} strokeWidth="1.2" opacity="0.4" />
                            <Path d={getCouplingBandPath(22, 450, 0)} fill="none" stroke={cSecondary} strokeWidth="0.8" opacity="0.2" />

                            {/* 4. RFI / Electromagnetic Striping Noise */}
                            {getVerticalStreaks(windowStart, windowEnd, 0, 450).map((streak, idx) => (
                              <Line 
                                key={`streak-full-${idx}`}
                                x1={streak.x}
                                y1="0"
                                x2={streak.x}
                                y2="160"
                                stroke={cSecondary}
                                strokeWidth="1.5"
                                opacity={streak.opacity}
                              />
                            ))}

                            {/* 5. High-fidelity multi-phase Target Hyperbolic Arcs */}
                            {visibleTargets.map((target, idx) => {
                              const rangeSpan = range > 0 ? range : 6;
                              const pct = (target.actualDistance - windowStart) / rangeSpan;
                              const xPosFull = pct * 450;
                              if (xPosFull < 0 || xPosFull > 450) return null;
                              const yPos = target.depthPercent * 110 + 25;
                              
                              return (
                                <G key={`target-full-${idx}`}>
                                  {/* Alternating wave phases */}
                                  <Path d={getRealisticHyperbolaPath(xPosFull, yPos, -4)} fill="none" stroke={cDark} strokeWidth="1.2" opacity="0.45" />
                                  <Path d={getRealisticHyperbolaPath(xPosFull, yPos, -1)} fill="none" stroke={cSecondary} strokeWidth="2.4" opacity="0.85" />
                                  <Path d={getRealisticHyperbolaPath(xPosFull, yPos, 2)} fill="none" stroke={cBg} strokeWidth="1.6" opacity="0.95" />
                                  <Path d={getRealisticHyperbolaPath(xPosFull, yPos, 5)} fill="none" stroke={cPrimary} strokeWidth="2.0" opacity="0.75" />
                                  <Path d={getRealisticHyperbolaPath(xPosFull, yPos, 8)} fill="none" stroke={cDark} strokeWidth="1.0" opacity="0.4" />
                                </G>
                              );
                            })}
                          </G>
                        )}
                      </G>
                    );
                  })()}

                  {!isScanning && (
                    <G>
                      {/* Standby Grid */}
                      {Array.from({ length: 9 }).map((_, idx) => (
                        <Line 
                          key={`grid-x-${idx}`} 
                          x1={(idx / 8) * 450} 
                          y1="0" 
                          x2={(idx / 8) * 450} 
                          y2="160" 
                          stroke="#1F2937" 
                          strokeWidth="0.5" 
                          strokeDasharray="2 3" 
                        />
                      ))}
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Line 
                          key={`grid-y-${idx}`} 
                          x1="0" 
                          y1={(idx / 4) * 160} 
                          x2="450" 
                          y2={(idx / 4) * 160} 
                          stroke="#1F2937" 
                          strokeWidth="0.5" 
                          strokeDasharray="2 3" 
                        />
                      ))}
                      
                      <Rect x="0" y="0" width="450" height="160" fill="rgba(7, 9, 19, 0.82)" />
                      
                      <SvgText 
                        x="225" 
                        y="72" 
                        fill="#F59E0B" 
                        fontSize="12" 
                        fontWeight="800" 
                        textAnchor="middle"
                      >
                        {language === 'tr' ? 'GPR TARAYICI STANDBY' : 'GPR SCANNER STANDBY'}
                      </SvgText>
                      <SvgText 
                        x="225" 
                        y="95" 
                        fill="#9CA3AF" 
                        fontSize="8.5" 
                        fontWeight="600" 
                        textAnchor="middle"
                      >
                        {language === 'tr' ? 'TARAMAYI BAŞLATMAK İÇİN ALTTAKİ BUTONLARI KULLANIN' : 'USE THE ACTIONS BAR BELOW TO START LIVE SCANNING'}
                      </SvgText>
                      
                      {/* Standby scanning cursor sweep */}
                      <Line x1="150" y1="0" x2="150" y2="160" stroke="rgba(245, 158, 11, 0.3)" strokeWidth="1.5" />
                    </G>
                  )}
                </Svg>

                {/* Floating Titles */}
                {isScanning && (
                  <>
                    {showAiBScan ? (
                      <>
                        {/* Left Pane Title (AI) with Close Button */}
                        <View style={styles.floatingTitleLeft}>
                          <Text style={styles.floatingTitleTextLeft}>AI ANALİZİ / B-SCAN</Text>
                          <TouchableOpacity 
                            onPress={() => setShowAiBScan(false)}
                            style={styles.floatingCloseBtn}
                          >
                            <Ionicons name="close" size={10} color="#EF4444" />
                          </TouchableOpacity>
                        </View>
                        
                        {/* Right Pane Title (Ham) in Split Mode */}
                        <View style={[styles.floatingTitleRight, { left: '52%' }]}>
                          <Text style={styles.floatingTitleTextRight}>HAM GPR SİNYALİ</Text>
                        </View>
                      </>
                    ) : (
                      /* Right Pane Title (Ham) in Full Screen Mode */
                      <View style={[styles.floatingTitleRight, { left: 6 }]}>
                        <Text style={styles.floatingTitleTextRight}>HAM GPR SİNYALİ</Text>
                      </View>
                    )}
                  </>
                )}

                {/* Floating HUD controls for opening closed panes */}
                {isScanning && (
                  <View style={styles.floatingHudControls}>
                    {!showAiBScan && (
                      <TouchableOpacity 
                        style={styles.hudToggleBtn} 
                        onPress={() => setShowAiBScan(true)}
                      >
                        <Ionicons name="analytics" size={12} color="#10B981" />
                        <Text style={styles.hudToggleBtnText}>
                          {language === 'tr' ? 'AI ANALİZİ EKLE' : 'ADD AI ANALYZER'}
                        </Text>
                      </TouchableOpacity>
                    )}
                    {!showInstantDetector && (
                      <TouchableOpacity 
                        style={[styles.hudToggleBtn, { borderColor: '#F59E0B' }]} 
                        onPress={() => setShowInstantDetector(true)}
                      >
                        <Ionicons name="pulse" size={12} color="#F59E0B" />
                        <Text style={[styles.hudToggleBtnText, { color: '#F59E0B' }]}>
                          {language === 'tr' ? 'DEDEKTÖRÜ AÇ' : 'OPEN DETECTOR'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* 3. INSTANT METAL DETECTOR HUD CARD */}
          {isScanning && showInstantDetector && (
            <View style={styles.instantDetectorCard}>
              <View style={styles.instantHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <View style={[styles.ledIndicator, { backgroundColor: instantStrength > 15 ? '#EF4444' : '#10B981' }]} />
                  <Text style={styles.instantTitle}>{language === 'tr' ? 'ANLIK DEDEKTÖR' : 'LIVE DETECTOR'}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <TouchableOpacity onPress={() => setInstantMute(m => !m)} style={styles.instantMuteBtn}>
                    <Ionicons name={instantMute ? 'volume-mute' : 'volume-high'} size={12} color={instantMute ? '#64748B' : '#F59E0B'} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setShowInstantDetector(false)} style={[styles.instantMuteBtn, { backgroundColor: 'rgba(239, 68, 68, 0.25)', borderColor: '#EF4444', borderWidth: 0.5 }]}>
                    <Ionicons name="close" size={12} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Progress LED bar */}
              <View style={styles.ledBarContainer}>
                {Array.from({ length: 10 }).map((_, idx) => {
                  const active = instantStrength >= (idx + 1) * 10;
                  let ledColor = '#1F2937';
                  if (active) {
                    if (idx < 5) ledColor = '#10B981'; // Green
                    else if (idx < 8) ledColor = '#F59E0B'; // Yellow
                    else ledColor = '#EF4444'; // Red
                  }
                  return (
                    <View 
                      key={idx} 
                      style={[styles.ledSegment, { backgroundColor: ledColor }]} 
                    />
                  );
                })}
              </View>

              {/* Numerical stats and estimated target info */}
              <View style={styles.instantStatsRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.instantLabel}>{language === 'tr' ? 'SİNYAL SEVİYESİ' : 'SIGNAL LEVEL'}</Text>
                  <Text style={[styles.instantVal, { color: instantStrength > 45 ? '#EF4444' : '#10B981' }]}>
                    %{instantStrength}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end', flex: 1.2 }}>
                  <Text style={styles.instantLabel}>{language === 'tr' ? 'HEDEF SINIFI' : 'TARGET CLASS'}</Text>
                  <Text style={[styles.instantVal, { color: activeInstantTarget ? activeInstantTarget.color : '#64748B', fontSize: 10 }]} numberOfLines={1}>
                    {activeInstantTarget ? activeInstantTarget.name.toUpperCase() : (language === 'tr' ? 'YOK' : 'NONE')}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* 4. PICTURE-IN-PICTURE (PiP) AI DETECTION CARDS */}
          {isScanning && showPip && detectedAnomalies.length > 0 && (
            <View style={styles.pipContainer}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, borderBottomWidth: 1, borderBottomColor: '#1F2937', paddingBottom: 4 }}>
                <Text style={[styles.pipHeaderTitle, { marginBottom: 0, borderBottomWidth: 0, paddingBottom: 0 }]}>
                  🤖 {language === 'tr' ? 'HEDEF TESPİT EDİLDİ' : 'TARGET DETECTED'}
                </Text>
                <TouchableOpacity onPress={() => setShowPip(false)} style={{ padding: 2, backgroundColor: 'rgba(239, 68, 68, 0.25)', borderRadius: 4, borderWidth: 0.5, borderColor: '#EF4444' }}>
                  <Ionicons name="close" size={10} color="#EF4444" />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 160 }}>
                {detectedAnomalies.slice(0, 3).map((item) => (
                  <View key={item.id} style={styles.pipCard}>
                    <View style={styles.pipCardRow}>
                      <Text style={styles.pipLabel}>{language === 'tr' ? 'Tür:' : 'Type:'}</Text>
                      <Text style={[styles.pipVal, { color: '#F59E0B' }]}>{item.material}</Text>
                    </View>
                    <View style={styles.pipCardRow}>
                      <Text style={styles.pipLabel}>{language === 'tr' ? 'Güven:' : 'Confidence:'}</Text>
                      <Text style={styles.pipVal}>%{item.confidence}</Text>
                    </View>
                    <View style={styles.pipCardRow}>
                      <Text style={styles.pipLabel}>{language === 'tr' ? 'Derinlik:' : 'Depth:'}</Text>
                      <Text style={styles.pipVal}>{item.depth} m</Text>
                    </View>
                    <View style={styles.pipCardRow}>
                      <Text style={styles.pipLabel}>{language === 'tr' ? 'Boyut:' : 'Size:'}</Text>
                      <Text style={styles.pipVal}>{item.dimensions}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* 4. SMART HUD ALERT OVERLAY (Floating Top Center) */}
          {alerts.length > 0 && (
            <View style={styles.hudAlertBox}>
              <Ionicons name="warning" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.hudAlertText}>{alerts[0]}</Text>
              <TouchableOpacity onPress={clearAlerts} style={{ marginLeft: 8 }}>
                <Ionicons name="close-circle" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}

          {/* 5. DJI STYLE BOTTOM CENTER ACTION BAR */}
          <View style={styles.bottomActionBar}>
            {!isScanning ? (
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#10B981' }]} onPress={startScanning}>
                <Ionicons name="play" size={18} color="#FFFFFF" />
                <Text style={styles.actionBtnText}>{language === 'tr' ? 'Başlat' : 'Start'}</Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#F59E0B' }]} onPress={pauseScanning}>
                  <Ionicons name={isPaused ? 'play' : 'pause'} size={16} color="#FFFFFF" />
                  <Text style={styles.actionBtnText}>{isPaused ? (language === 'tr' ? 'Devam' : 'Resume') : (language === 'tr' ? 'Duraklat' : 'Pause')}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionBtn, { backgroundColor: '#EF4444' }]} 
                  onPress={() => {
                    stopScanning();
                    setTimeout(() => {
                      router.push('/material');
                    }, 500);
                  }}
                >
                  <Ionicons name="stop" size={16} color="#FFFFFF" />
                  <Text style={styles.actionBtnText}>{language === 'tr' ? 'Durdur' : 'Stop'}</Text>
                </TouchableOpacity>
              </>
            )}
            
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#2563EB' }]} onPress={addMarker}>
              <Ionicons name="flag" size={16} color="#FFFFFF" />
              <Text style={styles.actionBtnText}>{language === 'tr' ? 'İşaret Ekle' : 'Add Marker'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#7C3AED' }]} onPress={savePoint}>
              <Ionicons name="save" size={16} color="#FFFFFF" />
              <Text style={styles.actionBtnText}>{language === 'tr' ? 'Nokta Kaydet' : 'Save Point'}</Text>
            </TouchableOpacity>
          </View>

        </View>

        {/* 6. COLLAPSIBLE RIGHT-SIDE ANALYSIS BUTTON PANEL */}
        <View style={styles.rightOverlayMenu}>
          {(['radargram', 'transmitter', 'receiver', 'power', 'fft', 'three_d', 'ai'] as const).map((panel) => {
            const getIcon = () => {
              switch (panel) {
                case 'radargram': return 'grid-outline';
                case 'transmitter': return 'pulse-outline';
                case 'receiver': return 'analytics-outline';
                case 'power': return 'battery-charging-outline';
                case 'fft': return 'stats-chart-outline';
                case 'three_d': return 'cube-outline';
                case 'ai': return 'hardware-chip-outline';
              }
            };
            const getLabel = () => {
              switch (panel) {
                case 'radargram': return language === 'tr' ? 'Radargram' : 'Radargram';
                case 'transmitter': return language === 'tr' ? 'Verici' : 'TX Wave';
                case 'receiver': return language === 'tr' ? 'Alıcı' : 'RX Wave';
                case 'power': return language === 'tr' ? 'Güç Sistemi' : 'Power Rail';
                case 'fft': return language === 'tr' ? 'FFT Analiz' : 'FFT Plot';
                case 'three_d': return language === 'tr' ? '3D Harita' : '3D Map';
                case 'ai': return language === 'tr' ? 'AI Bulguları' : 'AI Detections';
              }
            };

            const isSelected = activeDrawer === panel;
            return (
              <TouchableOpacity 
                key={panel} 
                style={[styles.floatingMenuBtn, isSelected && styles.floatingMenuBtnActive]} 
                onPress={() => setActiveDrawer(isSelected ? 'none' : panel)}
              >
                <Ionicons name={getIcon()} size={14} color="#FFFFFF" />
                <Text style={styles.floatingMenuText} numberOfLines={1}>{getLabel()}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

      </View>

      {/* 7. SLIDE-OUT PANEL DRAWER OVERLAY */}
      {activeDrawer !== 'none' && (
        <Animated.View style={[styles.drawerOverlay, { transform: [{ translateX: drawerSlideAnim }] }]}>
          <View style={styles.drawerHeader}>
            <Text style={styles.drawerTitle}>
              {activeDrawer === 'radargram' && (language === 'tr' ? '📊 RADARGRAM' : '📊 RADARGRAM')}
              {activeDrawer === 'transmitter' && (language === 'tr' ? '⚡ VERİCİ' : '⚡ TRANSMITTER')}
              {activeDrawer === 'receiver' && (language === 'tr' ? '📈 ALICI' : '📈 RECEIVER')}
              {activeDrawer === 'power' && (language === 'tr' ? '🔋 GÜÇ SİSTEMİ' : '🔋 POWER TRAIN')}
              {activeDrawer === 'fft' && (language === 'tr' ? '📉 FFT ANALİZİ' : '📉 FFT SPECTRUM')}
              {activeDrawer === 'three_d' && (language === 'tr' ? '📦 3D ZEMİN' : '📦 3D MAP')}
              {activeDrawer === 'ai' && (language === 'tr' ? '🤖 YAPAY ZEKA' : '🤖 AI RESULTS')}
            </Text>
            <TouchableOpacity onPress={() => setActiveDrawer('none')} style={styles.drawerCloseBtn}>
              <Ionicons name="close" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <View style={styles.drawerContentBody}>
            {renderDrawerContent()}
          </View>
        </Animated.View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070913',
    paddingLeft: 75, // Avoid Left Sidebar
    flexDirection: 'column',
    position: 'relative',
  },
  // DJI Top Status Bar
  djiStatusBar: {
    height: 34,
    backgroundColor: '#090D16',
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusCenter: {
    alignItems: 'center',
  },
  statusRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 14,
    gap: 4,
  },
  statusText: {
    color: '#D1D5DB',
    fontSize: 10,
    fontWeight: '600',
  },
  recBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#991B1B',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  recDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  recText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  recTextIdle: {
    color: '#9CA3AF',
    fontSize: 9,
    fontWeight: '700',
  },
  // Radargram HUD area
  gprViewport: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#05070A',
    margin: 8,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  aScanPane: {
    width: 60,
    height: '100%',
    backgroundColor: '#080C14',
    borderRightWidth: 1,
    borderRightColor: '#1F2937',
  },
  depthScalePane: {
    width: 35,
    height: '100%',
    backgroundColor: '#080C14',
    borderRightWidth: 1,
    borderRightColor: '#1F2937',
  },
  horizontalDistancePane: {
    height: 20,
    width: '100%',
    backgroundColor: '#080C14',
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
    paddingHorizontal: 2,
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
  },
  // Floating Action bar bottom center
  bottomActionBar: {
    position: 'absolute',
    bottom: 16,
    left: 20,
    right: 20,
    alignSelf: 'center',
    backgroundColor: 'rgba(9, 13, 22, 0.9)',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    zIndex: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '700',
  },
  // Collapsible panel menus right overlay
  rightOverlayMenu: {
    width: 68,
    backgroundColor: '#090D16',
    borderLeftWidth: 1,
    borderLeftColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  floatingMenuBtn: {
    width: 58,
    height: 46,
    backgroundColor: '#1E293B',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  floatingMenuBtnActive: {
    backgroundColor: '#D97706',
    borderColor: '#F59E0B',
  },
  floatingMenuText: {
    color: '#D1D5DB',
    fontSize: 8,
    fontWeight: '700',
    marginTop: 2,
    textAlign: 'center',
  },
  // Slide-out Drawer overlay
  drawerOverlay: {
    position: 'absolute',
    right: 68,
    top: 34,
    bottom: 0,
    width: SCREEN_WIDTH * 0.32,
    backgroundColor: '#0D111A',
    borderLeftWidth: 1,
    borderLeftColor: '#1F2937',
    zIndex: 15,
    padding: 12,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
    paddingBottom: 8,
    marginBottom: 10,
  },
  drawerTitle: {
    color: '#F9FAFB',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  drawerCloseBtn: {
    padding: 2,
  },
  drawerContentBody: {
    flex: 1,
  },
  drawerSectionTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 10,
    borderLeftWidth: 2,
    borderLeftColor: '#D97706',
    paddingLeft: 6,
  },
  drawerBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
    backgroundColor: '#1E293B',
    flex: 1,
  },
  drawerBtnActive: {
    backgroundColor: '#D97706',
  },
  drawerBtnText: {
    color: '#D1D5DB',
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
  },
  drawerBtnTextActive: {
    color: '#FFFFFF',
  },
  drawerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
    paddingVertical: 5,
  },
  // Floating PiP target cards on left
  pipContainer: {
    position: 'absolute',
    left: 20,
    top: 50,
    width: 170,
    backgroundColor: 'rgba(9, 13, 22, 0.92)',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 8,
    padding: 8,
    zIndex: 10,
  },
  pipHeaderTitle: {
    color: '#EF4444',
    fontSize: 9,
    fontWeight: '900',
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
    paddingBottom: 2,
  },
  pipCard: {
    backgroundColor: '#1E293B',
    borderRadius: 6,
    padding: 5,
    marginBottom: 6,
    borderWidth: 0.5,
    borderColor: '#4B5563',
  },
  pipCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 1,
  },
  pipLabel: {
    color: '#9CA3AF',
    fontSize: 8.5,
  },
  pipVal: {
    color: '#F9FAFB',
    fontSize: 8.5,
    fontWeight: '700',
  },
  // Floating HUD alerts
  hudAlertBox: {
    position: 'absolute',
    top: 48,
    alignSelf: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.95)',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 15,
  },
  hudAlertText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  // Instant Metal Detector styles
  instantDetectorCard: {
    position: 'absolute',
    left: 20,
    bottom: 65,
    width: 170,
    backgroundColor: 'rgba(9, 13, 22, 0.92)',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    borderRadius: 8,
    padding: 8,
    zIndex: 120,
  },
  instantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
    paddingBottom: 4,
  },
  ledIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  instantTitle: {
    color: '#F9FAFB',
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  instantMuteBtn: {
    padding: 2,
    backgroundColor: '#1E293B',
    borderRadius: 3,
  },
  ledBarContainer: {
    flexDirection: 'row',
    height: 12,
    gap: 3,
    marginVertical: 4,
  },
  ledSegment: {
    flex: 1,
    borderRadius: 1.5,
  },
  instantStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  instantLabel: {
    color: '#9CA3AF',
    fontSize: 7.5,
    fontWeight: '700',
  },
  instantVal: {
    fontSize: 11,
    fontWeight: '900',
    marginTop: 1,
  },
  floatingHudControls: {
    position: 'absolute',
    top: 6,
    right: 8,
    flexDirection: 'row',
    gap: 6,
    zIndex: 50,
  },
  hudToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(9, 13, 22, 0.85)',
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
    gap: 4,
  },
  hudToggleBtnText: {
    color: '#10B981',
    fontSize: 8,
    fontWeight: '800',
  },
  floatingTitleLeft: {
    position: 'absolute',
    top: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
    borderWidth: 0.5,
    borderColor: '#10B981',
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
    gap: 4,
    zIndex: 60,
  },
  floatingTitleTextLeft: {
    color: '#10B981',
    fontSize: 8,
    fontWeight: '900',
  },
  floatingCloseBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 0.5,
    borderColor: '#EF4444',
    borderRadius: 3,
    padding: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingTitleRight: {
    position: 'absolute',
    top: 6,
    backgroundColor: 'rgba(156, 163, 175, 0.25)',
    borderWidth: 0.5,
    borderColor: '#9CA3AF',
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
    zIndex: 60,
  },
  floatingTitleTextRight: {
    color: '#9CA3AF',
    fontSize: 8,
    fontWeight: '900',
  },
});
