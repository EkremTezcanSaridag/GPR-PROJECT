import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Line, Circle, G, Rect, Text as SvgText } from 'react-native-svg';
import { useIsFocused } from '@react-navigation/native';
import { useLanguage } from '../../context/LanguageContext';
import { useGpr } from '../../context/GprContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function MaterialScreen() {
  const { t, language } = useLanguage();
  const {
    theme,
    isScanning,
    selectedMaterial,
    materialConfidence,
    freqSignature,
    refSignature,
    similarMaterials,
    materialExplanation,
    runMaterialAnalysis,
    audioAlertConfig,
    setTargetAudioAlert,
    playAudioAlert,
    detectedAnomalies,
    isDemoMode,
    setIsDemoMode,
    radargramData
  } = useGpr();

  const isLight = theme === 'light';
  const isDark = theme === 'dark';

  const isFocused = useIsFocused();
  const prevAnomaliesCount = useRef(detectedAnomalies.length);

  // State to simulate real-time signal sweep fluctuations
  const [signalFlux, setSignalFlux] = useState(0);

  // Demo Mode States
  const [demoAntennaPos, setDemoAntennaPos] = useState(25); // percentage, 0 to 100
  const [demoWidth, setDemoWidth] = useState(300);

  useEffect(() => {
    const timer = setInterval(() => {
      // Simulate minor sensor fluctuations for active detector feel
      setSignalFlux(Math.sin(Date.now() / 250) * 2.5);
    }, 150);
    return () => clearInterval(timer);
  }, []);

  // Demo Mode calculations for all 8 targets
  let demoStrength = 0;
  let demoConfidence = 0;
  let demoDepth = 0;
  let demoDetectedType = 'soil';

  const targets = [
    { id: 'gold', center: 25, depth: 1.6, maxConf: 96 },
    { id: 'silver', center: 25, depth: 1.8, maxConf: 92 },
    { id: 'copper', center: 40, depth: 1.2, maxConf: 89 },
    { id: 'iron', center: 55, depth: 0.8, maxConf: 91 },
    { id: 'concrete', center: 68, depth: 1.4, maxConf: 84 },
    { id: 'water', center: 92, depth: 2.2, maxConf: 78 },
    { id: 'void', center: 80, depth: 2.8, maxConf: 84 },
    { id: 'tunnel', center: 80, depth: 3.2, maxConf: 81 },
  ];

  let closestTarget = null;
  let minDistance = 999;

  for (const t of targets) {
    const dist = Math.abs(demoAntennaPos - t.center);
    if (dist <= 8 && dist < minDistance) {
      closestTarget = t;
      minDistance = dist;
    }
  }

  // Prioritize active selected targets for shared peaks (25 and 80)
  const goldSilverCenterActive = Math.abs(demoAntennaPos - 25) <= 8;
  const voidTunnelCenterActive = Math.abs(demoAntennaPos - 80) <= 8;

  if (goldSilverCenterActive) {
    if (selectedMaterial === 'silver') {
      closestTarget = targets.find(t => t.id === 'silver') || null;
    } else {
      closestTarget = targets.find(t => t.id === 'gold') || null;
    }
  } else if (voidTunnelCenterActive) {
    if (selectedMaterial === 'tunnel') {
      closestTarget = targets.find(t => t.id === 'tunnel') || null;
    } else {
      closestTarget = targets.find(t => t.id === 'void') || null;
    }
  }

  if (closestTarget) {
    const dist = Math.abs(demoAntennaPos - closestTarget.center);
    const ratio = (8 - dist) / 8; // 0 to 1
    demoStrength = Math.round(ratio * closestTarget.maxConf + (Math.random() * 4 - 2));
    demoConfidence = Math.round(ratio * (closestTarget.maxConf - 10) + 10);
    demoDepth = closestTarget.depth;
    demoDetectedType = closestTarget.id;
  } else {
    demoStrength = Math.round(12 + Math.sin(demoAntennaPos / 5) * 4 + (Math.random() * 3 - 1.5));
    demoConfidence = 0;
    demoDepth = 0;
    demoDetectedType = 'soil';
  }

  demoStrength = Math.min(100, Math.max(0, demoStrength));
  demoConfidence = Math.min(100, Math.max(0, demoConfidence));

  // Find max value in last column of GPR radargram for real-time dial sync
  const lastColIndex = radargramData[0] ? radargramData[0].length - 1 : 0;
  const lastColValues = radargramData.map(row => row[lastColIndex] || 0);
  const maxVal = Math.max(...lastColValues);

  // Space out detected anomalies evenly for scanning, and track them
  // Assign a static position on the canvas for each of the detected anomalies.
  const liveAnomaliesWithPosition = detectedAnomalies.map((anom, idx) => {
    // Spaced out evenly from 15% to 85%
    const center = detectedAnomalies.length > 1
      ? 15 + (idx / (detectedAnomalies.length - 1)) * 70
      : 50;
    return {
      ...anom,
      center,
    };
  });

  // Calculate live targets details based on current antenna slider position
  let closestLiveTarget: any = null;
  let minLiveDistance = 999;
  
  if (!isDemoMode) {
    for (const t of liveAnomaliesWithPosition) {
      const dist = Math.abs(demoAntennaPos - t.center);
      if (dist <= 10 && dist < minLiveDistance) {
        closestLiveTarget = t;
        minLiveDistance = dist;
      }
    }
  }

  let calculatedLiveStrength = 0;
  let calculatedLiveConfidence = 0;
  let calculatedLiveDepth = 0;
  let calculatedLiveDetectedType = 'soil';

  if (closestLiveTarget) {
    const dist = Math.abs(demoAntennaPos - closestLiveTarget.center);
    const ratio = (10 - dist) / 10; // 0 to 1
    calculatedLiveStrength = Math.round(ratio * closestLiveTarget.confidence + (Math.random() * 4 - 2));
    calculatedLiveConfidence = Math.round(ratio * closestLiveTarget.confidence);
    calculatedLiveDepth = closestLiveTarget.depth;
    calculatedLiveDetectedType = closestLiveTarget.type;
  } else {
    // If not close to any target, return a low signal strength representing background ground soil response
    calculatedLiveStrength = Math.round(8 + Math.sin(demoAntennaPos / 4) * 3 + (Math.random() * 2 - 1));
    calculatedLiveConfidence = 0;
    calculatedLiveDepth = 0;
    calculatedLiveDetectedType = 'soil';
  }

  calculatedLiveStrength = Math.min(100, Math.max(0, calculatedLiveStrength));

  // Map GPR value (20 to 200+) to target strength percentage (0 to 100)
  const gprStrength = isScanning
    ? Math.min(100, Math.max(0, Math.round(((maxVal - 35) / 185) * 100)))
    : 0;

  const liveStrength = isScanning 
    ? Math.min(100, Math.max(0, Math.round(gprStrength + signalFlux * 0.5)))
    : calculatedLiveStrength;

  const liveConfidence = isScanning
    ? (liveStrength > 45 ? Math.min(98, Math.max(72, Math.round(60 + liveStrength * 0.38))) : 0)
    : calculatedLiveConfidence;

  // Sync active estimated target profile with GPR detection if signal is strong
  const activeMaterialId = (isScanning && liveStrength > 45 && detectedAnomalies.length > 0)
    ? detectedAnomalies[0].type
    : (closestLiveTarget ? closestLiveTarget.type : selectedMaterial);

  // Combine Demo Mode and Live GPR Mode
  const currentStrength = isDemoMode
    ? demoStrength
    : liveStrength;

  const currentConfidence = isDemoMode
    ? demoConfidence
    : liveConfidence;

  const currentDepth = isDemoMode
    ? demoDepth
    : (isScanning 
        ? (detectedAnomalies.length > 0 ? detectedAnomalies[0].depth : 0)
        : calculatedLiveDepth);

  const currentMaterialId = isDemoMode
    ? demoDetectedType
    : (isScanning ? activeMaterialId : calculatedLiveDetectedType);

  // Watch for GPR scanning detections to play sound warnings ONLY in active Detector Tab
  useEffect(() => {
    if (!isDemoMode && isScanning && isFocused && detectedAnomalies.length > prevAnomaliesCount.current) {
      const latest = detectedAnomalies[0];
      if (latest) {
        playAudioAlert(latest.type, latest.material);
      }
    }
    prevAnomaliesCount.current = detectedAnomalies.length;
  }, [detectedAnomalies, isScanning, isFocused, isDemoMode]);

  // Watch for Demo Mode target crossings to play sound alerts
  const prevDemoDetectedType = useRef('soil');
  useEffect(() => {
    if (isDemoMode && isFocused) {
      if (demoDetectedType !== 'soil' && demoDetectedType !== prevDemoDetectedType.current) {
        const matName = materialsList.find(m => m.id === demoDetectedType)?.name || demoDetectedType;
        playAudioAlert(demoDetectedType, matName);
      }
      prevDemoDetectedType.current = demoDetectedType;
    }
  }, [demoDetectedType, isDemoMode, isFocused]);

  // Watch for Live Mode target crossings to play sound alerts
  const prevLiveDetectedType = useRef('soil');
  useEffect(() => {
    if (!isDemoMode && isFocused) {
      if (calculatedLiveDetectedType !== 'soil' && calculatedLiveDetectedType !== prevLiveDetectedType.current) {
        const matName = closestLiveTarget ? closestLiveTarget.material : calculatedLiveDetectedType;
        playAudioAlert(calculatedLiveDetectedType, matName);
      }
      prevLiveDetectedType.current = calculatedLiveDetectedType;
    }
  }, [calculatedLiveDetectedType, isDemoMode, isFocused]);

  // Run signature analysis when target changes
  useEffect(() => {
    if (currentMaterialId && currentMaterialId !== 'soil') {
      runMaterialAnalysis(currentMaterialId);
    }
  }, [currentMaterialId]);

  const materialsList = [
    { id: 'gold', name: language === 'tr' ? 'Altın' : 'Gold' },
    { id: 'silver', name: language === 'tr' ? 'Gümüş' : 'Silver' },
    { id: 'copper', name: language === 'tr' ? 'Bakır' : 'Copper' },
    { id: 'iron', name: language === 'tr' ? 'Demir / Çelik' : 'Iron / Steel' },
    { id: 'concrete', name: language === 'tr' ? 'Beton Blok' : 'Concrete Block' },
    { id: 'water', name: language === 'tr' ? 'Su / Islak Zemin' : 'Water / Wet Ground' },
    { id: 'void', name: language === 'tr' ? 'Boşluk / Kavite' : 'Void / Cavity' },
    { id: 'tunnel', name: language === 'tr' ? 'Tünel Geçidi' : 'Tunnel Passage' }
  ];

  const getMaterialDetails = (matId: string) => {
    switch (matId) {
      case 'soil':
        return {
          title: language === 'tr' ? 'TEMİZ ZEMİN' : 'CLEAR SOIL',
          phrase: language === 'tr' ? 'Doğal toprak tabakası yansıması' : 'Natural soil layer reflections',
          color: '#64748B',
          glowColor: 'rgba(100, 116, 139, 0.15)'
        };
      case 'gold':
        return {
          title: language === 'tr' ? 'ALTIN BENZERİ HEDEF' : 'GOLD-LIKE TARGET',
          phrase: language === 'tr' ? 'Altın benzeri sinyal karakteristiği' : 'Gold-like electromagnetic signature characteristics',
          color: '#F59E0B',
          glowColor: 'rgba(245, 158, 11, 0.2)'
        };
      case 'silver':
        return {
          title: language === 'tr' ? 'GÜMÜŞ BENZERİ HEDEF' : 'SILVER-LIKE TARGET',
          phrase: language === 'tr' ? 'Gümüş benzeri sinyal karakteristiği' : 'Silver-like signature characteristics detected',
          color: '#CBD5E1',
          glowColor: 'rgba(203, 213, 225, 0.15)'
        };
      case 'copper':
        return {
          title: language === 'tr' ? 'BAKIR BENZERİ HEDEF' : 'COPPER-LIKE TARGET',
          phrase: language === 'tr' ? 'Bakır ile yüksek benzerlik gösteriyor' : 'High electromagnetic similarity to copper conduits',
          color: '#EA580C',
          glowColor: 'rgba(234, 88, 12, 0.2)'
        };
      case 'iron':
        return {
          title: language === 'tr' ? 'DEMİR BENZERİ HEDEF' : 'FERROUS TARGET',
          phrase: language === 'tr' ? 'Demir benzeri sinyal karakteristiği' : 'Ferrous/magnetic target signature patterns',
          color: '#CA8A04',
          glowColor: 'rgba(202, 138, 4, 0.2)'
        };
      case 'concrete':
        return {
          title: language === 'tr' ? 'BETON BLOK HEDEF' : 'CONCRETE BLOCK',
          phrase: language === 'tr' ? 'Beton kütle ile yüksek benzerlik' : 'Strong resemblance to reinforced concrete grids',
          color: '#6B7280',
          glowColor: 'rgba(107, 114, 128, 0.2)'
        };
      case 'water':
        return {
          title: language === 'tr' ? 'SU / ISLAK ZEMİN' : 'AQUEOUS / WET SOIL',
          phrase: language === 'tr' ? 'Su / ıslak zemin sinyal karakteristiği' : 'High dielectric attenuation indicating water presence',
          color: '#3B82F6',
          glowColor: 'rgba(59, 130, 246, 0.2)'
        };
      case 'void':
        return {
          title: language === 'tr' ? 'BOŞLUK / KAVİTE' : 'VOID / CAVITY',
          phrase: language === 'tr' ? 'Boşluk olasılığı yüksek' : 'High probability of air cavity reflection interface',
          color: '#EF4444',
          glowColor: 'rgba(239, 68, 68, 0.2)'
        };
      case 'tunnel':
        return {
          title: language === 'tr' ? 'TÜNEL GEOMETRİSİ' : 'TUNNEL STRUCTURE',
          phrase: language === 'tr' ? 'Zemin altında tünel benzeri yapı' : 'Geometric reflection echoes resembling hollow tunnels',
          color: '#8B5CF6',
          glowColor: 'rgba(139, 92, 246, 0.2)'
        };
      default:
        return {
          title: language === 'tr' ? 'BELİRSİZ HEDEF' : 'UNKNOWN TARGET',
          phrase: language === 'tr' ? 'Metalik hedef olasılığı yüksek' : 'High likelihood of metallic body target estimation',
          color: '#10B981',
          glowColor: 'rgba(16, 185, 129, 0.2)'
        };
    }
  };

  const getAnomalyColor = (type: string) => {
    switch (type) {
      case 'gold': return '#F59E0B';
      case 'silver': return '#CBD5E1';
      case 'copper': return '#EA580C';
      case 'iron': return '#CA8A04';
      case 'concrete': return '#6B7280';
      case 'water': return '#3B82F6';
      case 'void': return '#EF4444';
      case 'tunnel': return '#8B5CF6';
      default: return '#10B981';
    }
  };

  const matDetails = getMaterialDetails(currentMaterialId);

  const needleAngle = -120 + (currentStrength / 100) * 240;

  const handleGprTouch = (event: any) => {
    const { locationX } = event.nativeEvent;
    const newPos = Math.min(100, Math.max(0, (locationX / demoWidth) * 100));
    setDemoAntennaPos(newPos);
  };

  const handleMaterialTabPress = (materialId: string, materialName: string) => {
    if (isDemoMode) {
      if (materialId === 'gold') setDemoAntennaPos(25);
      else if (materialId === 'iron') setDemoAntennaPos(55);
      else if (materialId === 'void') setDemoAntennaPos(80);
      else if (materialId === 'silver') setDemoAntennaPos(25);
      else if (materialId === 'copper') setDemoAntennaPos(40);
      else if (materialId === 'concrete') setDemoAntennaPos(68);
      else if (materialId === 'water') setDemoAntennaPos(92);
      else if (materialId === 'tunnel') setDemoAntennaPos(80);
      runMaterialAnalysis(materialId);
    } else {
      // In live mode, if they press a material button, let's slide the antenna cart to that scanned target's position!
      const targetPos = liveAnomaliesWithPosition.find(a => a.type === materialId)?.center;
      if (targetPos !== undefined) {
        setDemoAntennaPos(targetPos);
      }
      runMaterialAnalysis(materialId);
    }
    // Always play audio alert immediately on manual press
    playAudioAlert(materialId, materialName);
  };

  const currentExplanation = currentMaterialId === 'soil'
    ? (language === 'tr' ? 'Elektromanyetik sinyaller homojen toprak yapısına işaret ediyor, herhangi bir metalik veya hacimsel anomali bulunmuyor.' : 'Electromagnetic responses show a homogeneous soil structure with no metallic or volumetric anomalies detected.')
    : materialExplanation;

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

  const graphWidth = SCREEN_WIDTH * 0.42 - 40;

  return (
    <View style={styles.container}>
      
      {/* LEFT COLUMN: Scrollable circular Metal Detector Gauge Dashboard */}
      <ScrollView 
        style={styles.leftColumn} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        
        {/* Detector Title HUD */}
        <View style={styles.detectorHeader}>
          <Ionicons name="scan-circle" size={16} color="#F59E0B" />
          <Text style={styles.detectorHeaderText}>{language === 'tr' ? 'GPR YAPAY ZEKA ANALİZİ' : 'GPR AI ANALYSIS'}</Text>
        </View>

        {/* Outer Pulsing Gauge Container (Optimized 180px height for Landscape screens) */}
        <View style={styles.gaugeContainer}>
          <Svg width="180" height="180" viewBox="0 0 180 180">
            {/* Outer dotted calibration dial */}
            <Circle cx="90" cy="90" r="84" fill="none" stroke="#1F2937" strokeWidth="1.5" strokeDasharray="3 4" />
            
            {/* Pulsing signal rings */}
            <Circle cx="90" cy="90" r="76" fill="none" stroke={matDetails.color} strokeWidth="1" opacity="0.3" />
            <Circle cx="90" cy="90" r={68 + signalFlux * 0.4} fill="none" stroke={matDetails.color} strokeWidth="2.5" opacity="0.6" />
            <Circle cx="90" cy="90" r={58 - signalFlux * 0.3} fill="none" stroke={matDetails.color} strokeWidth="1" opacity="0.4" />
            
            {/* Main gauge background */}
            <Circle cx="90" cy="90" r="52" fill="#0C101B" stroke="#374151" strokeWidth="2.5" />
            
            {/* Rotating gauge indicator needle */}
            <G transform={`translate(90, 90) rotate(${needleAngle})`}>
              <Path d="M -3 0 L -1 -44 L 0 -48 L 1 -44 L 3 0 Z" fill={matDetails.color} />
              <Circle cx="0" cy="-44" r="2.5" fill="#FFFFFF" />
            </G>
            <Circle cx="90" cy="90" r="7" fill="#0C101B" stroke={matDetails.color} strokeWidth="2.5" />
          </Svg>

          {/* Core HUD text inside circle layout (overlayed absolutely) */}
          <View style={styles.gaugeInnerContent}>
            <Text style={[styles.innerTitle, { color: matDetails.color }]} numberOfLines={2}>
              {isDemoMode && currentMaterialId === 'soil'
                ? (language === 'tr' ? 'TEMİZ ZEMİN' : 'CLEAR SOIL')
                : (isScanning && currentStrength <= 45
                  ? (language === 'tr' ? 'ZEMİN TARANIYOR' : 'SCANNING SOIL')
                  : matDetails.title)}
            </Text>
            <Text style={styles.innerConfidence}>%{currentConfidence}</Text>
            <Text style={styles.innerConfidenceLabel}>{language === 'tr' ? 'GÜVEN' : 'CONFIDENCE'}</Text>
          </View>
        </View>

        {/* Large readouts for distance interpretation */}
        <View style={styles.readoutCard}>
          <Text style={styles.readoutLabel}>{language === 'tr' ? 'YAPAY ZEKA TAHMİNİ' : 'AI TARGET ESTIMATION'}</Text>
          <Text style={[styles.readoutValue, { color: matDetails.color }]}>
            {isDemoMode && currentMaterialId === 'soil'
              ? (language === 'tr' ? '“Temiz Zemin İmzası”' : '“Clear Soil Signature”')
              : (isScanning && currentStrength <= 45
                ? (language === 'tr' ? '“Temiz Zemin İmzası”' : '“Clear Soil Signature”')
                : `“${matDetails.phrase}”`)}
          </Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCell}>
              <Text style={styles.statLabel}>{language === 'tr' ? 'SİNYAL GÜCÜ' : 'SIGNAL STRENGTH'}</Text>
              <Text style={[styles.statVal, { color: '#10B981' }]}>%{currentStrength}</Text>
            </View>
            <View style={styles.statCell}>
              <Text style={styles.statLabel}>{language === 'tr' ? 'HEDEF DERİNLİĞİ' : 'TARGET DEPTH'}</Text>
              <Text style={[styles.statVal, { color: '#3B82F6' }]}>
                {currentDepth > 0 ? `${currentDepth} m` : '---'}
              </Text>
            </View>
          </View>
        </View>

        {/* Swipe-friendly simulated targets for operator tests */}
        <View style={styles.selectionRowContainer}>
          <Text style={styles.selectionTitle}>{language === 'tr' ? 'TÜRLERE GÖRE SİNYAL SİMÜLASYONU' : 'SIGNAL SIMULATION BY TARGET'}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollList}>
            {materialsList.map((m) => (
              <TouchableOpacity 
                key={m.id}
                style={[styles.materialTab, currentMaterialId === m.id && { backgroundColor: matDetails.color }]}
                onPress={() => handleMaterialTabPress(m.id, m.name)}
              >
                <Text style={[styles.materialTabText, currentMaterialId === m.id && { color: '#090D16', fontWeight: '800' }]}>{m.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

      </ScrollView>

      {/* RIGHT COLUMN: Scrollable Frequency Spectrum and Similarities Table */}
      <ScrollView 
        style={styles.rightColumn} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        
        {/* GPR B-Scan Demo Profile (Interactive Sweep) */}
        <View style={styles.panelCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <Text style={styles.panelTitle}>📡 {language === 'tr' ? 'GPR B-SCAN DEMO PROFiLi' : 'GPR B-SCAN DEMO PROFILE'}</Text>
            <TouchableOpacity 
              style={[styles.modeBadge, { backgroundColor: isDemoMode ? '#D97706' : '#1E293B', borderColor: isDemoMode ? '#F59E0B' : '#4B5563', borderWidth: 1 }]}
              onPress={() => setIsDemoMode(!isDemoMode)}
            >
              <Text style={styles.modeBadgeText}>
                {isDemoMode 
                  ? (language === 'tr' ? 'DEMO AKTİF' : 'DEMO ACTIVE') 
                  : (language === 'tr' ? 'CANLI MOD' : 'LIVE SYNC')}
              </Text>
            </TouchableOpacity>
          </View>
          
          <Text style={{ color: '#9CA3AF', fontSize: 8.5, marginBottom: 8 }}>
            {language === 'tr' 
              ? 'Zemin profilinde parmağınızı kaydırarak anten hareketlerini simüle edin:'
              : 'Slide your finger on the soil profile to simulate GPR sweeps:'}
          </Text>

          {/* Interactive GPR Soil Cross Section Canvas */}
          <View 
            onLayout={(e) => setDemoWidth(e.nativeEvent.layout.width || 300)}
            onTouchStart={handleGprTouch}
            onTouchMove={handleGprTouch}
            style={styles.gprTouchContainer}
          >
            <Svg width="100%" height="110" style={{ backgroundColor: '#050811', borderRadius: 8 }}>
              {/* Soil Layers */}
              <Path d={`M 0 25 Q 75 22 150 28 T ${demoWidth} 24 L ${demoWidth} 110 L 0 110 Z`} fill="#1C160E" opacity="0.6" />
              <Path d={`M 0 55 Q 75 60 150 50 T ${demoWidth} 58 L ${demoWidth} 110 L 0 110 Z`} fill="#151219" opacity="0.8" />
              <Path d={`M 0 85 Q 75 80 150 90 T ${demoWidth} 82 L ${demoWidth} 110 L 0 110 Z`} fill="#0C0A0F" />

              {isDemoMode ? (
                <>
                  {/* Target 1: Gold/Silver at 25% */}
                  <Path 
                    d={`M ${(demoWidth * 0.25) - 25} 65 Q ${demoWidth * 0.25} 45 ${(demoWidth * 0.25) + 25} 65`} 
                    fill="none" 
                    stroke="#F59E0B" 
                    strokeWidth="1.2" 
                    strokeDasharray="2 2" 
                    opacity="0.6" 
                  />
                  <Circle cx={demoWidth * 0.25} cy="48" r="5" fill="#F59E0B" opacity="0.8" />
                  <SvgText x={demoWidth * 0.25} y="38" fill="#F59E0B" fontSize="7.5" fontWeight="800" textAnchor="middle">
                    {language === 'tr' ? 'ALTIN/GÜMÜŞ' : 'GOLD/SILVER'}
                  </SvgText>

                  {/* Target 2: Copper at 40% */}
                  <Path 
                    d={`M ${(demoWidth * 0.40) - 20} 55 Q ${demoWidth * 0.40} 38 ${(demoWidth * 0.40) + 20} 55`} 
                    fill="none" 
                    stroke="#EA580C" 
                    strokeWidth="1.2" 
                    strokeDasharray="2 2" 
                    opacity="0.6" 
                  />
                  <Circle cx={demoWidth * 0.40} cy="38" r="4.5" fill="#EA580C" opacity="0.8" />
                  <SvgText x={demoWidth * 0.40} y="28" fill="#EA580C" fontSize="7.5" fontWeight="800" textAnchor="middle">
                    {language === 'tr' ? 'BAKIR' : 'COPPER'}
                  </SvgText>

                  {/* Target 3: Iron at 55% */}
                  <Path 
                    d={`M ${(demoWidth * 0.55) - 20} 45 Q ${demoWidth * 0.55} 30 ${(demoWidth * 0.55) + 20} 45`} 
                    fill="none" 
                    stroke="#CA8A04" 
                    strokeWidth="1.2" 
                    strokeDasharray="2 2" 
                    opacity="0.6" 
                  />
                  <Circle cx={demoWidth * 0.55} cy="30" r="5" fill="#475569" opacity="0.85" stroke="#CA8A04" strokeWidth="1" />
                  <SvgText x={demoWidth * 0.55} y="20" fill="#CA8A04" fontSize="7.5" fontWeight="800" textAnchor="middle">
                    {language === 'tr' ? 'DEMİR' : 'IRON'}
                  </SvgText>

                  {/* Target 4: Concrete at 68% */}
                  <Path 
                    d={`M ${(demoWidth * 0.68) - 20} 75 Q ${demoWidth * 0.68} 60 ${(demoWidth * 0.68) + 20} 75`} 
                    fill="none" 
                    stroke="#9CA3AF" 
                    strokeWidth="1.2" 
                    strokeDasharray="2 2" 
                    opacity="0.5" 
                  />
                  <Circle cx={demoWidth * 0.68} cy="60" r="5.5" fill="#6B7280" opacity="0.8" />
                  <SvgText x={demoWidth * 0.68} y="50" fill="#9CA3AF" fontSize="7.5" fontWeight="800" textAnchor="middle">
                    {language === 'tr' ? 'BETON' : 'CONCRETE'}
                  </SvgText>

                  {/* Target 5: Void/Tunnel at 80% */}
                  <Path 
                    d={`M ${(demoWidth * 0.80) - 30} 85 Q ${demoWidth * 0.80} 68 ${(demoWidth * 0.80) + 30} 85`} 
                    fill="none" 
                    stroke="#EF4444" 
                    strokeWidth="1.2" 
                    strokeDasharray="2 2" 
                    opacity="0.6" 
                  />
                  <Circle cx={demoWidth * 0.80} cy="68" r="7" fill="#EF4444" opacity="0.35" stroke="#EF4444" strokeWidth="1" />
                  <SvgText x={demoWidth * 0.80} y="56" fill="#EF4444" fontSize="7.5" fontWeight="800" textAnchor="middle">
                    {language === 'tr' ? 'BOŞLUK/TÜNEL' : 'VOID/TUNNEL'}
                  </SvgText>

                  {/* Target 6: Water at 92% */}
                  <Path 
                    d={`M ${(demoWidth * 0.92) - 20} 90 Q ${demoWidth * 0.92} 72 ${(demoWidth * 0.92) + 20} 90`} 
                    fill="none" 
                    stroke="#3B82F6" 
                    strokeWidth="1.2" 
                    strokeDasharray="2 2" 
                    opacity="0.6" 
                  />
                  <Circle cx={demoWidth * 0.92} cy="72" r="5" fill="#3B82F6" opacity="0.8" />
                  <SvgText x={demoWidth * 0.92} y="62" fill="#3B82F6" fontSize="7.5" fontWeight="800" textAnchor="middle">
                    {language === 'tr' ? 'SU' : 'WATER'}
                  </SvgText>
                </>
              ) : (
                <>
                  {/* Live Scan Targets */}
                  {liveAnomaliesWithPosition.map((anom) => {
                    const xPos = demoWidth * (anom.center / 100);
                    // Map depth (0m to 4.2m) to Y coordinates (30 to 85)
                    const yPos = 35 + (anom.depth / 4.2) * 50;
                    const color = getAnomalyColor(anom.type);
                    
                    return (
                      <G key={anom.id}>
                        {/* Hyperbola curve */}
                        <Path 
                          d={`M ${xPos - 25} ${yPos + 18} Q ${xPos} ${yPos} ${xPos + 25} ${yPos + 18}`} 
                          fill="none" 
                          stroke={color} 
                          strokeWidth="1.2" 
                          strokeDasharray="2 2" 
                          opacity="0.7" 
                        />
                        <Circle cx={xPos} cy={yPos} r="5.5" fill={color} opacity="0.8" />
                        <SvgText x={xPos} y={yPos - 9} fill={color} fontSize="7.5" fontWeight="800" textAnchor="middle">
                          {anom.material.toUpperCase()}
                        </SvgText>
                      </G>
                    );
                  })}
                  
                  {/* If no anomalies, show standby text */}
                  {liveAnomaliesWithPosition.length === 0 && (
                    <SvgText x={demoWidth / 2} y="60" fill="#64748B" fontSize="9.5" fontWeight="800" textAnchor="middle">
                      {language === 'tr' ? 'HERHANGİ BİR ANOMALİ ALGINAMADI' : 'NO SUBTERRANEAN ANOMALIES DETECTED'}
                    </SvgText>
                  )}
                </>
              )}

              {/* GPR Antenna track line */}
              <Line x1="0" y1="12" x2={demoWidth} y2="12" stroke="#374151" strokeWidth="1.5" />
              
              {/* Vertical Laser scanning line under antenna */}
              <Line 
                x1={demoWidth * (demoAntennaPos / 100)} 
                y1="12" 
                x2={demoWidth * (demoAntennaPos / 100)} 
                y2="110" 
                stroke="#EF4444" 
                strokeWidth="1" 
                strokeDasharray="3 3" 
              />

              {/* Sliding GPR Antenna Cart Icon */}
              <G transform={`translate(${demoWidth * (demoAntennaPos / 100) - 10}, 2)`}>
                <Rect x="0" y="2" width="20" height="7" rx="1.5" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="1" />
                <Circle cx="4" cy="9" r="2.5" fill="#1E293B" />
                <Circle cx="16" cy="9" r="2.5" fill="#1E293B" />
                <Path d="M 10 2 L 10 -1 L 14 -1" stroke="#3B82F6" strokeWidth="1" fill="none" />
              </G>
            </Svg>
          </View>

          {/* Simple helper slider info under the canvas */}
          <View style={styles.sliderHelperContainer}>
            <Ionicons name="arrow-back-outline" size={12} color="#4B5563" />
            <Text style={styles.sliderHelperText}>
              {language === 'tr' 
                ? `Anten Konumu: %${Math.round(demoAntennaPos)}` 
                : `Antenna Pos: ${Math.round(demoAntennaPos)}%`}
            </Text>
            <Ionicons name="arrow-forward-outline" size={12} color="#4B5563" />
          </View>
        </View>

        {/* AI Signature Analysis Panel */}
        <View style={styles.panelCard}>
          <Text style={styles.panelTitle}>⚡ {language === 'tr' ? 'SPEKTRAL HEDEF ANALİZİ (FFT)' : 'SPECTRAL TARGET ANALYSIS (FFT)'}</Text>
          <Text style={styles.graphTitle}>{t.freqCurves}</Text>
          <View style={styles.graphContainer}>
            <Svg width="100%" height="100%">
              <Path 
                d={makeSvgPath(freqSignature, 55, graphWidth, 0.75)} 
                fill="none" 
                stroke="#06B6D4" 
                strokeWidth="2" 
              />
              <Line x1="0" y1="45" x2={graphWidth} y2="45" stroke="#1F2937" strokeWidth="1" strokeDasharray="3 3" />
            </Svg>
          </View>

          <Text style={styles.graphTitle}>{t.reflectionGraphs}</Text>
          <View style={styles.graphContainer}>
            <Svg width="100%" height="100%">
              <Path 
                d={makeSvgPath(refSignature, 55, graphWidth, 0.4)} 
                fill="none" 
                stroke="#8B5CF6" 
                strokeWidth="2" 
              />
              <Line x1="0" y1="30" x2={graphWidth} y2="30" stroke="#1F2937" strokeWidth="1" strokeDasharray="3 3" />
            </Svg>
          </View>
        </View>

        {/* Similarities matching table */}
        <View style={styles.panelCard}>
          <Text style={styles.panelTitle}>📊 {language === 'tr' ? 'BENZER MATERYAL KATSAYILARI' : 'MATERIAL CLASS SIMILARITIES'}</Text>
          {similarMaterials.map((sim, index) => (
            <View key={index} style={styles.simRow}>
              <Text style={styles.simName} numberOfLines={1}>{sim.name}</Text>
              <View style={styles.simBarOuter}>
                <View style={[styles.simBarInner, { width: `${sim.similarity}%`, backgroundColor: matDetails.color }]} />
              </View>
              <Text style={styles.simVal}>%{sim.similarity}</Text>
            </View>
          ))}
        </View>

        {/* Audio Alert Settings Card */}
        <View style={styles.panelCard}>
          <Text style={styles.panelTitle}>🔊 {language === 'tr' ? 'SESLİ UYARI SEÇENEKLERİ' : 'AUDIO ALERT SETTINGS'}</Text>
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
                <View style={styles.settingLeft}>
                  <Ionicons 
                    name={currentMode === 'mute' ? 'volume-mute' : 'volume-high'} 
                    size={14} 
                    color={currentMode === 'mute' ? '#64748B' : matDetails.color} 
                    style={styles.settingIcon} 
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.settingLabel} numberOfLines={1}>{target.label}</Text>
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
                      style={[styles.optionBtn, currentMode === type.code && styles.optionBtnActive]}
                      onPress={() => setTargetAudioAlert(target.id, type.code as any)}
                    >
                      <Text style={[styles.optionText, currentMode === type.code && styles.optionTextActive]}>
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            );
          })}
        </View>

        {/* Copilot AI explanation */}
        <View style={styles.explainBox}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Ionicons name="sparkles" size={12} color="#F59E0B" style={{ marginRight: 6 }} />
            <Text style={styles.explainTitle}>{language === 'tr' ? 'YAPAY ZEKA GPR ANALİZİ' : 'AI GPR REPORT'}</Text>
          </View>
          <Text style={styles.explainText}>{currentExplanation}</Text>
        </View>

      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070913',
    paddingLeft: 75, // Clear vertical sidebar
    flexDirection: 'row',
  },
  // Left Column (Circular Dial Gauge)
  leftColumn: {
    flex: 0.58,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderRightWidth: 1,
    borderRightColor: '#1F2937',
  },
  detectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
    paddingBottom: 6,
    marginBottom: 8,
  },
  detectorHeaderText: {
    color: '#9CA3AF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  gaugeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
    position: 'relative',
  },
  gaugeInnerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    height: 100,
  },
  innerTitle: {
    fontSize: 8.5,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 2,
    letterSpacing: 0.3,
  },
  innerConfidence: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    fontFamily: 'monospace',
    lineHeight: 28,
  },
  innerConfidenceLabel: {
    color: '#9CA3AF',
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 1,
  },
  // Large readout
  readoutCard: {
    backgroundColor: '#0D1220',
    borderWidth: 1,
    borderColor: '#1F2937',
    borderRadius: 10,
    padding: 8,
    alignItems: 'center',
    marginVertical: 8,
  },
  readoutLabel: {
    color: '#9CA3AF',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  readoutValue: {
    fontSize: 11.5,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  statsGrid: {
    flexDirection: 'row',
    width: '100%',
    gap: 6,
  },
  statCell: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 6,
    padding: 4,
    alignItems: 'center',
  },
  statLabel: {
    color: '#9CA3AF',
    fontSize: 7,
    fontWeight: '700',
  },
  statVal: {
    fontSize: 11,
    fontWeight: '900',
    marginTop: 1,
  },
  // Material selector row
  selectionRowContainer: {
    marginTop: 4,
  },
  selectionTitle: {
    color: '#9CA3AF',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  scrollList: {
    gap: 4,
  },
  materialTab: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  materialTabText: {
    color: '#D1D5DB',
    fontSize: 9,
    fontWeight: '700',
  },
  // Right Column (Oscilloscopes & match table)
  rightColumn: {
    flex: 0.42,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  panelCard: {
    backgroundColor: '#0D1220',
    borderWidth: 1,
    borderColor: '#1F2937',
    borderRadius: 10,
    padding: 8,
    marginBottom: 8,
  },
  panelTitle: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  graphTitle: {
    color: '#9CA3AF',
    fontSize: 7.5,
    fontWeight: '600',
    marginBottom: 2,
  },
  graphContainer: {
    height: 55,
    backgroundColor: '#05070A',
    borderRadius: 5,
    padding: 3,
    marginBottom: 6,
  },
  // Similarity Rows
  simRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2.5,
  },
  simName: {
    width: 70,
    fontSize: 8.5,
    fontWeight: '600',
    color: '#CBD5E1',
  },
  simBarOuter: {
    flex: 1,
    height: 5,
    backgroundColor: '#1E293B',
    borderRadius: 2.5,
    marginHorizontal: 4,
    overflow: 'hidden',
  },
  simBarInner: {
    height: '100%',
    borderRadius: 2.5,
  },
  simVal: {
    width: 24,
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'right',
  },
  // AI Explanation Rationale
  explainBox: {
    backgroundColor: '#0D2D22',
    borderWidth: 1,
    borderColor: '#064E3B',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  explainTitle: {
    color: '#10B981',
    fontSize: 8.5,
    fontWeight: '900',
  },
  explainText: {
    color: '#A7F3D0',
    fontSize: 9.5,
    lineHeight: 13,
    fontStyle: 'italic',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
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
    marginRight: 8,
  },
  settingLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#F9FAFB',
  },
  settingSubLabel: {
    fontSize: 8.5,
    color: '#9CA3AF',
    marginTop: 1,
  },
  optionGroup: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 4,
    padding: 2,
  },
  optionBtn: {
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderRadius: 3,
  },
  optionBtnActive: {
    backgroundColor: '#3B82F6',
  },
  optionText: {
    fontSize: 8.5,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  optionTextActive: {
    color: '#FFFFFF',
  },
  modeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  modeBadgeText: {
    color: '#FFFFFF',
    fontSize: 7.5,
    fontWeight: '800',
  },
  gprTouchContainer: {
    borderWidth: 1,
    borderColor: '#1F2937',
    borderRadius: 8,
    overflow: 'hidden',
    marginVertical: 4,
  },
  sliderHelperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 6,
  },
  sliderHelperText: {
    color: '#9CA3AF',
    fontSize: 8,
    fontWeight: '700',
  },
});
