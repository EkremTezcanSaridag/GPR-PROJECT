import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Line } from 'react-native-svg';
import { useLanguage } from '../../context/LanguageContext';
import { useGpr } from '../../context/GprContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function MaterialScreen() {
  const { t, language } = useLanguage();
  const {
    theme,
    selectedMaterial,
    materialConfidence,
    freqSignature,
    refSignature,
    similarMaterials,
    materialExplanation,
    runMaterialAnalysis
  } = useGpr();

  const isLight = theme === 'light';
  const isDark = theme === 'dark';

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isLight ? '#F8FAFC' : isDark ? '#0F172A' : '#111827',
      paddingLeft: 75, // Shift content right to clear Left Sidebar
      flexDirection: 'row', // Split screen columns
    },
    // Left Column (Selection, Predictions, AI explanations) - 40% width
    leftColumn: {
      flex: 0.4,
      padding: 16,
      borderRightWidth: 1,
      borderRightColor: isLight ? '#E2E8F0' : '#374151',
    },
    // Right Column (Oscilloscopes & Charts) - 60% width
    rightColumn: {
      flex: 0.6,
      padding: 16,
    },
    panelCard: {
      backgroundColor: isLight ? '#FFFFFF' : isDark ? '#1E293B' : '#1C2537',
      borderRadius: 12,
      padding: 14,
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
    // Selector row
    selectorScroll: {
      marginBottom: 12,
    },
    materialBtn: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
      backgroundColor: isLight ? '#F1F5F9' : '#2D3748',
      marginRight: 6,
      borderWidth: 1,
      borderColor: isLight ? '#E2E8F0' : '#3A475C',
    },
    materialBtnActive: {
      backgroundColor: '#10B981',
      borderColor: '#10B981',
    },
    materialBtnText: {
      fontSize: 11,
      fontWeight: '600',
      color: isLight ? '#475569' : '#E2E8F0',
    },
    materialBtnTextActive: {
      color: '#FFFFFF',
    },
    // Prediction results
    predictRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: isLight ? '#ECFDF5' : '#064E3B',
      borderWidth: 1,
      borderColor: isLight ? '#A7F3D0' : '#047857',
      padding: 12,
      borderRadius: 10,
      marginBottom: 12,
    },
    predictInfo: {
      flex: 1,
    },
    predictLabel: {
      fontSize: 10,
      fontWeight: '600',
      color: isLight ? '#047857' : '#A7F3D0',
      textTransform: 'uppercase',
    },
    predictVal: {
      fontSize: 18,
      fontWeight: '850',
      color: isLight ? '#065F46' : '#FFFFFF',
      marginTop: 2,
    },
    confidenceGauge: {
      width: 58,
      height: 58,
      borderRadius: 29,
      borderWidth: 5,
      borderColor: isLight ? '#A7F3D0' : '#047857',
      alignItems: 'center',
      justifyContent: 'center',
    },
    confidenceVal: {
      fontSize: 13,
      fontWeight: '800',
      color: isLight ? '#065F46' : '#FFFFFF',
    },
    // Waveform and Similarity
    graphTitle: {
      fontSize: 11,
      fontWeight: '600',
      color: isLight ? '#64748B' : '#9CA3AF',
      marginBottom: 4,
    },
    graphContainer: {
      height: 90,
      backgroundColor: '#090D16',
      borderRadius: 8,
      overflow: 'hidden',
      padding: 4,
      marginBottom: 10,
    },
    // Similarity Rows
    simRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 4,
    },
    simName: {
      width: 72,
      fontSize: 11,
      fontWeight: '600',
      color: isLight ? '#475569' : '#E2E8F0',
    },
    simBarOuter: {
      flex: 1,
      height: 8,
      backgroundColor: isLight ? '#E2E8F0' : '#2D3748',
      borderRadius: 4,
      marginHorizontal: 6,
      overflow: 'hidden',
    },
    simBarInner: {
      height: '100%',
      backgroundColor: '#10B981',
      borderRadius: 4,
    },
    simVal: {
      width: 28,
      fontSize: 11,
      fontWeight: '700',
      color: isLight ? '#0F172A' : '#F9FAFB',
      textAlign: 'right',
    },
    // AI Explanation box
    aiBox: {
      backgroundColor: isLight ? '#F0FDFA' : '#112228',
      borderRadius: 10,
      padding: 10,
      borderWidth: 1,
      borderColor: isLight ? '#CCFBF1' : '#0D5F54',
    },
    aiHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    aiTitle: {
      fontSize: 12,
      fontWeight: '700',
      color: isLight ? '#0F766E' : '#2DD4BF',
      marginLeft: 6,
    },
    aiContent: {
      fontSize: 11,
      lineHeight: 16,
      color: isLight ? '#115E59' : '#99F6E4',
      fontStyle: 'italic',
    }
  });

  const materialsList = [
    { id: 'gold', name: t.gold },
    { id: 'silver', name: t.silver },
    { id: 'copper', name: t.copper },
    { id: 'iron', name: t.iron },
    { id: 'concrete', name: t.concrete },
    { id: 'water', name: t.water },
    { id: 'void', name: t.void },
    { id: 'tunnel', name: t.tunnel }
  ];

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

  const getActiveMaterialName = () => {
    const found = materialsList.find(m => m.id === selectedMaterial);
    return found ? found.name : t.unknownObj;
  };

  // Determine width of graphs in the right column
  const rightColumnGraphWidth = SCREEN_WIDTH * 0.6 - 68;

  return (
    <View style={styles.container}>
      {/* 1. LEFT COLUMN: Selector, Predict, Explanation */}
      <View style={styles.leftColumn}>
        
        {/* Horizontal Material Selector scroll row */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.selectorScroll}
        >
          {materialsList.map((m) => (
            <TouchableOpacity 
              key={m.id}
              style={[styles.materialBtn, selectedMaterial === m.id && styles.materialBtnActive]}
              onPress={() => runMaterialAnalysis(m.id)}
            >
              <Text style={[styles.materialBtnText, selectedMaterial === m.id && styles.materialBtnTextActive]}>{m.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Prediction Results Gauge */}
        <View style={styles.predictRow}>
          <View style={styles.predictInfo}>
            <Text style={styles.predictLabel}>{t.materialPrediction}</Text>
            <Text style={styles.predictVal}>{getActiveMaterialName()}</Text>
          </View>
          <View style={styles.confidenceGauge}>
            <Text style={styles.confidenceVal}>%{materialConfidence}</Text>
            <Text style={{ fontSize: 7, fontWeight: '700', color: isLight ? '#065F46' : '#A7F3D0', marginTop: -1 }}>CONF</Text>
          </View>
        </View>

        {/* AI Explanation in plain Turkish */}
        <View style={styles.aiBox}>
          <View style={styles.aiHeader}>
            <Ionicons name="sparkles" size={14} color={isLight ? '#0F766E' : '#2DD4BF'} />
            <Text style={styles.aiTitle}>{t.aiExplanation}</Text>
          </View>
          <Text style={styles.aiContent}>{materialExplanation}</Text>
        </View>

      </View>

      {/* 2. RIGHT COLUMN: Graphs, Similarities */}
      <ScrollView style={styles.rightColumn} showsVerticalScrollIndicator={false}>
        
        {/* Electromagnetic signatures graphs */}
        <View style={styles.panelCard}>
          <Text style={styles.panelTitle}>{language === 'tr' ? 'Elektromanyetik İmzalar' : 'Electromagnetic Signatures'}</Text>
          
          <Text style={styles.graphTitle}>{t.freqCurves}</Text>
          <View style={styles.graphContainer}>
            <Svg width="100%" height="100%">
              <Path 
                d={makeSvgPath(freqSignature, 70, rightColumnGraphWidth, 0.7)} 
                fill="none" 
                stroke="#10B981" 
                strokeWidth="1.5" 
              />
              <Line x1="0" y1="65" x2={rightColumnGraphWidth} y2="65" stroke="#1F2937" strokeWidth="1" strokeDasharray="2 2" />
            </Svg>
          </View>

          <Text style={styles.graphTitle}>{t.reflectionGraphs}</Text>
          <View style={styles.graphContainer}>
            <Svg width="100%" height="100%">
              <Path 
                d={makeSvgPath(refSignature, 70, rightColumnGraphWidth, 0.35)} 
                fill="none" 
                stroke="#3B82F6" 
                strokeWidth="1.5" 
              />
              <Line x1="0" y1="35" x2={rightColumnGraphWidth} y2="35" stroke="#1F2937" strokeWidth="1" strokeDasharray="2 2" />
            </Svg>
          </View>
        </View>

        {/* Similarities matching table */}
        <View style={[styles.panelCard, { marginBottom: 0 }]}>
          <Text style={styles.panelTitle}>{t.similarityCharts}</Text>
          {similarMaterials.map((sim, index) => (
            <View key={index} style={styles.simRow}>
              <Text style={styles.simName} numberOfLines={1}>{sim.name}</Text>
              <View style={styles.simBarOuter}>
                <View style={[styles.simBarInner, { width: `${sim.similarity}%` }]} />
              </View>
              <Text style={styles.simVal}>%{sim.similarity}</Text>
            </View>
          ))}
        </View>

      </ScrollView>
    </View>
  );
}
