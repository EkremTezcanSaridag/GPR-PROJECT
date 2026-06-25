import React, { createContext, useState, useEffect, useContext } from 'react';
import { Platform } from 'react-native';
import { useLanguage, Language } from './LanguageContext';

// Conditionally import native-only modules
let Speech: any = null;
let Audio: any = null;
try {
  Speech = require('expo-speech');
} catch (e) {
  console.log('expo-speech not available');
}
try {
  Audio = require('expo-av').Audio;
} catch (e) {
  console.log('expo-av not available');
}

// Web Audio API fallback for beep sounds
const playWebBeep = (frequency = 800, duration = 150) => {
  if (typeof window === 'undefined' || !window.AudioContext && !(window as any).webkitAudioContext) return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioCtx();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    gainNode.gain.value = 0.3;
    oscillator.start();
    oscillator.stop(ctx.currentTime + duration / 1000);
  } catch (e) {
    console.log('Web Audio beep failed:', e);
  }
};

const webSpeak = (text: string, lang: string) => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  try {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.log('Web Speech failed:', e);
  }
};

export interface Anomaly {
  id: string;
  type: string; // e.g. 'gold', 'pipe', 'void'
  confidence: number;
  depth: number; // meters
  dimensions: string; // e.g. "45x30x20 cm"
  material: string;
  quality: number;
  time: string;
  explanation: string;
  reflectionCoeff: number;
  dielectric: number;
  similarity: number;
  freqResponse: string;
}

export interface DiagnosticItem {
  id: string;
  nameKey: 'batterySystem' | 'pulse10v' | 'pulse33v' | 'regulator33to5' | 'boostConverter' | 'transmitterSystem' | 'receiverSystem' | 'gpsConnection' | 'aiEngine' | 'storageSystem';
  status: 'ready' | 'warning' | 'fault' | 'checking';
}

export interface ScanLog {
  id: string;
  gps: string;
  date: string;
  time: string;
  operator: string;
  duration: number; // seconds
  anomalies: string[];
  maxDepth: number;
  avgConfidence: number;
}

interface GprContextType {
  // Diagnostics
  isDiagnosticsDone: boolean;
  diagnosticsStatus: 'idle' | 'running' | 'completed';
  diagnosticItems: DiagnosticItem[];
  runDiagnostics: () => void;

  // Scanning State
  isScanning: boolean;
  isPaused: boolean;
  startScanning: () => void;
  stopScanning: () => void;
  pauseScanning: () => void;
  scanTime: number;
  signalStrength: number;
  signalQuality: number;
  penetrationDepth: number;
  radargramData: number[][]; // Grid representation for GPR scrolling image
  txWaveform: number[];
  fftSpectrum: number[];
  rxWaveform: number[];
  detectedAnomalies: Anomaly[];
  alerts: string[];
  clearAlerts: () => void;

  // Material Analysis State
  selectedMaterial: string;
  materialConfidence: number;
  freqSignature: number[];
  refSignature: number[];
  similarMaterials: { name: string; similarity: number }[];
  materialExplanation: string;
  runMaterialAnalysis: (material: string) => void;

  // Logs & History
  logs: ScanLog[];
  addLog: (log: ScanLog) => void;
  exportReport: (format: 'pdf' | 'csv' | 'png', logId?: string) => Promise<string>;

  // Settings
  frequency: number; // MHz
  pulseVoltage: number; // V
  gain: number; // dB
  noiseFilter: string; // 'none' | 'low' | 'medium' | 'high'
  antennaType: string;
  resolution: string; // 'low' | 'medium' | 'high'
  theme: 'light' | 'dark' | 'industrial';
  saveLocation: string; // 'local' | 'sd_card' | 'cloud' | 'documents'
  setFrequency: (f: number) => void;
  setPulseVoltage: (v: number) => void;
  setGain: (g: number) => void;
  setNoiseFilter: (f: string) => void;
  setAntennaType: (t: string) => void;
  setResolution: (r: string) => void;
  setTheme: (t: 'light' | 'dark' | 'industrial') => void;
  setSaveLocation: (loc: string) => void;
  audioAlertConfig: Record<string, 'speech' | 'beep' | 'siren' | 'chime' | 'mute'>;
  setTargetAudioAlert: (targetId: string, alertType: 'speech' | 'beep' | 'siren' | 'chime' | 'mute') => void;
  playAudioAlert: (type: string, materialName: string) => void;
  playBeepSound: () => void;
  isDemoMode: boolean;
  setIsDemoMode: (val: boolean) => void;

  // Copilot Assistant
  copilotText: string;
  askCopilot: (question: string) => string;
}

const GprContext = createContext<GprContextType | undefined>(undefined);

export const GprProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t, language } = useLanguage();

  // Settings
  const [frequency, setFrequency] = useState(500); // 500 MHz
  const [pulseVoltage, setPulseVoltage] = useState(10); // 10V
  const [gain, setGain] = useState(40); // 40 dB
  const [noiseFilter, setNoiseFilter] = useState('medium');
  const [antennaType, setAntennaType] = useState('Shielded Bowtie 500MHz');
  const [resolution, setResolution] = useState('high');
  const [theme, setTheme] = useState<'light' | 'dark' | 'industrial'>('industrial');
  const [saveLocation, setSaveLocation] = useState<string>('local');
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [audioAlertConfig, setAudioAlertConfig] = useState<Record<string, 'speech' | 'beep' | 'siren' | 'chime' | 'mute'>>({
    gold: 'speech',
    silver: 'speech',
    copper: 'beep',
    iron: 'beep',
    concrete: 'chime',
    water: 'chime',
    void: 'siren',
    tunnel: 'siren',
  });

  const setTargetAudioAlert = (targetId: string, alertType: 'speech' | 'beep' | 'siren' | 'chime' | 'mute') => {
    setAudioAlertConfig(prev => ({
      ...prev,
      [targetId]: alertType
    }));
  };

  // Diagnostics
  const [diagnosticsStatus, setDiagnosticsStatus] = useState<'idle' | 'running' | 'completed'>('idle');
  const [isDiagnosticsDone, setIsDiagnosticsDone] = useState(false);
  const [diagnosticItems, setDiagnosticItems] = useState<DiagnosticItem[]>([
    { id: '1', nameKey: 'batterySystem', status: 'checking' },
    { id: '2', nameKey: 'pulse10v', status: 'checking' },
    { id: '3', nameKey: 'pulse33v', status: 'checking' },
    { id: '4', nameKey: 'regulator33to5', status: 'checking' },
    { id: '5', nameKey: 'boostConverter', status: 'checking' },
    { id: '6', nameKey: 'transmitterSystem', status: 'checking' },
    { id: '7', nameKey: 'receiverSystem', status: 'checking' },
    { id: '8', nameKey: 'gpsConnection', status: 'checking' },
    { id: '9', nameKey: 'aiEngine', status: 'checking' },
    { id: '10', nameKey: 'storageSystem', status: 'checking' },
  ]);

  // Live scanning states
  const [isScanning, setIsScanning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [scanTime, setScanTime] = useState(0);
  const [signalStrength, setSignalStrength] = useState(94);
  const [signalQuality, setSignalQuality] = useState(98);
  const [penetrationDepth, setPenetrationDepth] = useState(4.2);
  const [detectedAnomalies, setDetectedAnomalies] = useState<Anomaly[]>([]);
  const [alerts, setAlerts] = useState<string[]>([]);

  // Raw wave arrays
  const [txWaveform, setTxWaveform] = useState<number[]>([]);
  const [fftSpectrum, setFftSpectrum] = useState<number[]>([]);
  const [rxWaveform, setRxWaveform] = useState<number[]>([]);

  // Radargram data (25 rows by 50 columns representing depths and scan path ticks)
  const [radargramData, setRadargramData] = useState<number[][]>(() => 
    Array(25).fill(0).map(() => Array(50).fill(10 + Math.random() * 20))
  );

  // Material Analysis States
  const [selectedMaterial, setSelectedMaterial] = useState<string>('gold');
  const [materialConfidence, setMaterialConfidence] = useState<number>(94);
  const [freqSignature, setFreqSignature] = useState<number[]>([]);
  const [refSignature, setRefSignature] = useState<number[]>([]);
  const [similarMaterials, setSimilarMaterials] = useState<{ name: string; similarity: number }[]>([]);
  const [materialExplanation, setMaterialExplanation] = useState<string>('');

  // Copilot text
  const [copilotText, setCopilotText] = useState<string>('');

  // Scan Logs History
  const [logs, setLogs] = useState<ScanLog[]>([
    {
      id: 'LOG-001',
      gps: '39.9208° N, 32.8541° E',
      date: '2026-06-24',
      time: '14:23',
      operator: 'Ahmet Yılmaz',
      duration: 120,
      anomalies: ['Kablo / Altyapı', 'Beton Kütle'],
      maxDepth: 2.8,
      avgConfidence: 89,
    },
    {
      id: 'LOG-002',
      gps: '41.0082° N, 28.9784° E',
      date: '2026-06-25',
      time: '09:15',
      operator: 'Mehmet Kaya',
      duration: 310,
      anomalies: ['Boşluk / Kavite', 'Metal Nesne'],
      maxDepth: 5.4,
      avgConfidence: 91,
    },
  ]);

  const addLog = (log: ScanLog) => {
    setLogs(prev => {
      const updated = [log, ...prev];
      return updated.slice(0, 10); // Keep at most 10 logs
    });
  };

  // Run Startup self-tests
  const runDiagnostics = () => {
    setIsDiagnosticsDone(false);
    setDiagnosticsStatus('running');
    setDiagnosticItems(prev => prev.map(item => ({ ...item, status: 'checking' })));

    let currentCheck = 0;
    const interval = setInterval(() => {
      setDiagnosticItems(prev => {
        const next = [...prev];
        if (currentCheck < next.length) {
          // Give one minor warning to make it look realistic and industrial
          const isWarning = next[currentCheck].nameKey === 'gpsConnection';
          next[currentCheck].status = isWarning ? 'warning' : 'ready';
          currentCheck++;
        }
        return next;
      });

      if (currentCheck >= 10) {
        clearInterval(interval);
        setDiagnosticsStatus('completed');
        setIsDiagnosticsDone(true);
      }
    }, 400);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  // Generate initial static waveforms
  useEffect(() => {
    // TX waveform
    const tx = Array.from({ length: 40 }, (_, i) => {
      const x = (i - 20) / 4;
      return Math.exp(-x * x) * Math.cos(2 * Math.PI * x);
    });
    setTxWaveform(tx);

    // FFT Spectrum
    const fft = Array.from({ length: 30 }, (_, i) => {
      const center = 15;
      const dist = Math.abs(i - center);
      return Math.max(5, 90 * Math.exp(-dist * dist / 30) + Math.random() * 5);
    });
    setFftSpectrum(fft);

    // RX Waveform
    const rx = Array.from({ length: 80 }, (_, i) => {
      const x = i / 10;
      return 20 * Math.sin(x * 3) * Math.exp(-x / 4) + (Math.random() * 4 - 2);
    });
    setRxWaveform(rx);
  }, []);

  // Update live-scanning simulation values
  useEffect(() => {
    let timer: any;
    if (isScanning && !isPaused) {
      timer = setInterval(() => {
        setScanTime(prev => prev + 1);

        // Perturb signal strength and quality slightly
        setSignalStrength(prev => Math.min(100, Math.max(85, prev + (Math.random() * 4 - 2))));
        setSignalQuality(prev => Math.min(100, Math.max(90, prev + (Math.random() * 2 - 1))));

        // Dynamic Waveforms
        setRxWaveform(prev => prev.map((val, i) => {
          // Add some dynamic noise or shifting reflection waves
          const noise = Math.sin(scanTime + i / 5) * 2;
          const original = 20 * Math.sin(i / 10 * 3) * Math.exp(-i / 40);
          return original + noise + (Math.random() * 2 - 1);
        }));

        // Dynamic FFT Spectrum
        setFftSpectrum(prev => prev.map((val, i) => {
          const shift = Math.sin(scanTime / 5) * 2;
          const center = 15 + shift;
          const dist = Math.abs(i - center);
          return Math.max(5, 90 * Math.exp(-dist * dist / 30) + Math.random() * 4);
        }));

        // Shift Radargram Data Left
        setRadargramData(prev => {
          return prev.map((row, rowIndex) => {
            const nextRow = [...row];
            nextRow.shift();

            // Calculate value based on some synthetic layered structures
            // Layer 1: Soil (shallow), Layer 2: Bedrock (deeper), Layer 3: Noise
            let baseValue = 15;
            if (rowIndex > 5 && rowIndex < 10) baseValue = 45; // Soil interface
            if (rowIndex > 15 && rowIndex < 18) baseValue = 75; // Rock layer
            
            // Add a sliding hyperbola pattern to simulate passing over an object
            const currentPosition = (scanTime * 2) % 60;
            const targetX = 35; // Object at position 35
            const dx = Math.abs(currentPosition - targetX);
            const targetY = 12; // Object at row 12 depth
            const dy = Math.abs(rowIndex - targetY);

            // GPR Hyperbola reflection formula: y^2 = d^2 + x^2
            const distance = Math.sqrt(dx * dx + dy * dy * 4);
            let reflection = 0;
            if (distance < 6) {
              reflection = (6 - distance) * 45 * Math.sin(distance * Math.PI);
            }

            const newVal = baseValue + reflection + (Math.random() * 15 - 7.5);
            nextRow.push(Math.max(0, Math.min(255, newVal)));
            return nextRow;
          });
        });

        // Chance of object detection trigger (every ~20 seconds or based on specific ticks)
        if (scanTime > 0 && scanTime % 15 === 0) {
          triggerMockDetection();
        }
      }, 500);
    }
    return () => clearInterval(timer);
  }, [isScanning, isPaused, scanTime]);

  const playSoundHelper = async (source: any) => {
    if (Platform.OS === 'web') {
      playWebBeep();
      return;
    }
    try {
      if (!Audio) return;
      const { sound } = await Audio.Sound.createAsync(
        source,
        { shouldPlay: true }
      );
      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (e) {
      console.log("Audio play failed: ", e);
    }
  };

  const playBeepSound = () => {
    playSoundHelper(require('../assets/beep.ogg'));
  };

  const playSirenSound = () => {
    playSoundHelper(require('../assets/siren.ogg'));
  };

  const playChimeSound = () => {
    playSoundHelper(require('../assets/chime.ogg'));
  };

  const playAudioAlert = (type: string, materialName: string) => {
    const alertType = audioAlertConfig[type] || 'beep';
    if (alertType === 'mute') return;

    if (alertType === 'speech') {
      const speakText = language === 'tr' 
        ? `Dikkat: Zemin altında ${materialName} yansıma karakteristiği algılandı.`
        : `Warning: Subsurface ${materialName} reflection signature detected.`;
      if (Platform.OS === 'web') {
        webSpeak(speakText, language === 'tr' ? 'tr-TR' : 'en-US');
      } else if (Speech) {
        Speech.speak(speakText, { language: language === 'tr' ? 'tr-TR' : 'en-US' });
      }
    } else {
      if (alertType === 'beep') {
        playBeepSound();
      } else if (alertType === 'siren') {
        playSirenSound();
      } else if (alertType === 'chime') {
        playChimeSound();
      }
    }
  };

  const triggerMockDetection = () => {
    const mockObjects = [
      {
        type: 'gold',
        material: t.gold,
        depth: 1.8,
        dimensions: '35x35x15 cm',
        confidence: 87,
        coeff: 0.72,
        dielectric: 6.8,
        similarity: 92,
        freq: '240 - 280 MHz',
        why: language === 'tr' 
          ? 'Kural dışı yüksek elektrik iletkenliği ve keskin yansıma faz kayması altın metalik kütlesi ile örtüşüyor.' 
          : 'Highly anomalous electrical conductivity and sharp phase shift of the reflection signature align with a gold metallic body.'
      },
      {
        type: 'pipe',
        material: t.pipe,
        depth: 0.9,
        dimensions: 'Diameter: 12 cm, Length: >5 m',
        confidence: 94,
        coeff: -0.45,
        dielectric: 4.2,
        similarity: 96,
        freq: '380 - 450 MHz',
        why: language === 'tr'
          ? 'Sürekli lineer hiperbolik yansıma paterni, yeraltı şebeke borusu veya kablo kanalı özelliklerini sergiliyor.'
          : 'Continuous linear hyperbolic reflections exhibit classical signatures of subterranean utility conduits or metallic pipes.'
      },
      {
        type: 'void',
        material: t.void,
        depth: 3.2,
        dimensions: '1.2x2.1x1.5 m',
        confidence: 81,
        coeff: 0.95,
        dielectric: 1.0,
        similarity: 88,
        freq: '120 - 180 MHz',
        why: language === 'tr'
          ? 'Yüksek genlikli yansıma katsayısı (1.0 dielektrik tahmini), ortamın kaya/toprak katmanından tamamen boş hava ceplerine geçişini doğrular.'
          : 'Extremely high reflection amplitude (dielectric constant ~1.0) indicates a complete transition from soil to air pocket (cavity).'
      },
      {
        type: 'metal',
        material: t.metal,
        depth: 2.1,
        dimensions: '80x20x15 cm',
        confidence: 89,
        coeff: 0.82,
        dielectric: 8.5,
        similarity: 90,
        freq: '200 - 320 MHz',
        why: language === 'tr'
          ? 'Güçlü elektromanyetik geri yansıma katsayısı ve tepe gerilimi anomalisi, yüksek yoğunluklu metalik bir cisim olduğunu gösteriyor.'
          : 'Strong electromagnetic backscatter amplitude and peak voltage anomaly correspond to a high-density metallic object.'
      }
    ];

    const chosen = mockObjects[Math.floor(Math.random() * mockObjects.length)];
    const newAnomaly: Anomaly = {
      id: `ANOM-${Date.now().toString().slice(-4)}`,
      type: chosen.type,
      material: chosen.material,
      confidence: chosen.confidence,
      depth: chosen.depth,
      dimensions: chosen.dimensions,
      quality: Math.floor(85 + Math.random() * 14),
      time: new Date().toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      explanation: chosen.why,
      reflectionCoeff: chosen.coeff,
      dielectric: chosen.dielectric,
      similarity: chosen.similarity,
      freqResponse: chosen.freq
    };

    setDetectedAnomalies(prev => [newAnomaly, ...prev]);

    // Add smart alerts
    const alertMsg = language === 'tr' 
      ? `Yeni Anomali Tespit Edildi: ${chosen.material} (${newAnomaly.depth} m)`
      : `New Anomaly Detected: ${chosen.material} (${newAnomaly.depth} m)`;
    
    setAlerts(prev => [alertMsg, ...prev]);

    // AI Copilot Text update
    const copilotMsg = language === 'tr'
      ? `${newAnomaly.depth} metre derinlikte yüksek olasılıkla ${chosen.material} hedefi tespit edildi. Sinyal kalitesi %${newAnomaly.quality}, güven seviyesi %${newAnomaly.confidence}.`
      : `A ${chosen.material} target was detected at an estimated depth of ${newAnomaly.depth}m. Signal quality is ${newAnomaly.quality}%, confidence score is ${newAnomaly.confidence}%.`;
    setCopilotText(copilotMsg);
  };

  const startScanning = () => {
    setIsScanning(true);
    setIsPaused(false);
    // Clear previous scan run data
    setDetectedAnomalies([]);
    setScanTime(0);
    setAlerts([]);
    const startMsg = language === 'tr' ? 'Tarama başlatıldı. Sinyaller gönderiliyor...' : 'Scan started. Emitting pulses...';
    setCopilotText(startMsg);
  };

  const stopScanning = () => {
    if (isScanning) {
      // Add current scan to log
      const anomaliesSummary = detectedAnomalies.map(a => a.material);
      const avgConf = detectedAnomalies.length > 0 
        ? Math.round(detectedAnomalies.reduce((sum, a) => sum + a.confidence, 0) / detectedAnomalies.length)
        : 0;
      const maxDep = detectedAnomalies.length > 0
        ? Math.max(...detectedAnomalies.map(a => a.depth))
        : 0;

      const newLog: ScanLog = {
        id: `LOG-${Date.now().toString().slice(-3)}`,
        gps: '39.9250° N, 32.8590° E',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'tr-TR', { hour: '2-digit', minute: '2-digit' }),
        operator: 'Field Operator Y',
        duration: scanTime,
        anomalies: anomaliesSummary.length > 0 ? anomaliesSummary : [language === 'tr' ? 'Temiz Zemin' : 'Clear Soil'],
        maxDepth: maxDep > 0 ? maxDep : 4.0,
        avgConfidence: avgConf > 0 ? avgConf : 95
      };

      addLog(newLog);

      // Voice readout of detected anomalies just like in the demo
      if (detectedAnomalies.length > 0) {
        const count = detectedAnomalies.length;
        let speakText = '';
        if (language === 'tr') {
          speakText = `Tarama tamamlandı. Yapay zeka analizi ile toplam ${count} adet zemin altı anomali tespit edildi. `;
          detectedAnomalies.forEach((anom, idx) => {
            speakText += `${idx + 1} nci sırada, ${anom.depth} metre derinlikte ${anom.material}. `;
          });
        } else {
          speakText = `Scan complete. Detected ${count} subsurface anomalies with AI analysis. `;
          detectedAnomalies.forEach((anom, idx) => {
            speakText += `Number ${idx + 1}, ${anom.material} at ${anom.depth} meters deep. `;
          });
        }
        
        setTimeout(() => {
          if (Platform.OS === 'web') {
            webSpeak(speakText, language === 'tr' ? 'tr-TR' : 'en-US');
          } else if (Speech) {
            Speech.speak(speakText, { language: language === 'tr' ? 'tr-TR' : 'en-US' });
          }
        }, 800);
      } else {
        const speakText = language === 'tr'
          ? 'Tarama tamamlandı. Herhangi bir zemin altı anomali tespit edilemedi.'
          : 'Scan complete. No subsurface anomalies detected.';
        setTimeout(() => {
          if (Platform.OS === 'web') {
            webSpeak(speakText, language === 'tr' ? 'tr-TR' : 'en-US');
          } else if (Speech) {
            Speech.speak(speakText, { language: language === 'tr' ? 'tr-TR' : 'en-US' });
          }
        }, 800);
      }
    }
    setIsScanning(false);
    setIsPaused(false);
    setIsDemoMode(false); // Switch to live/scanned data view automatically
    const stopMsg = language === 'tr' ? 'Tarama durduruldu. Veriler kaydedildi.' : 'Scan stopped. Data saved.';
    setCopilotText(stopMsg);
  };

  const pauseScanning = () => {
    setIsPaused(prev => !prev);
    const msg = isPaused 
      ? (language === 'tr' ? 'Tarama devam ettiriliyor...' : 'Resuming scan...')
      : (language === 'tr' ? 'Tarama duraklatıldı.' : 'Scan paused.');
    setCopilotText(msg);
  };

  const clearAlerts = () => {
    setAlerts([]);
  };

  // Material Analysis Predictor mock responses
  const runMaterialAnalysis = (material: string) => {
    setSelectedMaterial(material);
    
    // Build custom graph response mock lines
    const sign = Array.from({ length: 40 }, (_, i) => {
      const phaseShift = material === 'gold' ? 0 : material === 'void' ? Math.PI : Math.PI / 2;
      return 80 * Math.sin(i / 5 + phaseShift) * Math.exp(-i / 20) + (Math.random() * 5 - 2.5);
    });
    setRefSignature(sign);

    const freq = Array.from({ length: 30 }, (_, i) => {
      const center = material === 'gold' ? 8 : material === 'void' ? 22 : 15;
      const val = 100 * Math.exp(-Math.pow(i - center, 2) / 40);
      return Math.max(5, val + (Math.random() * 5));
    });
    setFreqSignature(freq);

    // Confidence
    const conf = Math.floor(75 + Math.random() * 23);
    setMaterialConfidence(conf);

    // Similar list
    const simList = [
      { name: t.metal, similarity: material === 'gold' ? 92 : material === 'iron' ? 95 : 12 },
      { name: t.rock, similarity: material === 'concrete' ? 78 : material === 'water' ? 25 : 8 },
      { name: t.void, similarity: material === 'tunnel' ? 89 : material === 'emptyVoid' ? 98 : 4 }
    ].filter(i => i.similarity > 5).sort((a,b) => b.similarity - a.similarity);
    setSimilarMaterials(simList);

    // AI explanations
    const explainMap: Record<string, string> = {
      gold: language === 'tr' 
        ? "Yüksek dielektrik geçirgenlik ve faz değişimi, hedefin saf metalik altın veya benzeri yüksek iletkenlikte bir kıymetli metal olduğunu işaret etmektedir."
        : "High dielectric permittivity and phase reversal indicate the target is highly conductive metallic gold or a similar high-quality precious metal.",
      silver: language === 'tr'
        ? "Metal yansıma imzası yüksek seviyededir. Faz açısı ve yorulma katsayısı, gümüş alaşımının tipik elektromagnetik tepkisini simgelemektedir."
        : "Metallic reflection signature is extremely high. The phase angle and attenuation index match the typical electromagnetic response of silver alloys.",
      copper: language === 'tr'
        ? "Sinyal yansıması çok güçlüdür. Elektriksel direnç seviyesinin düşük olması bakır boru veya alaşım katmanına işaret eder."
        : "Reflection coefficient is exceptionally high. Low electrical resistivity matches the profile of copper conduits or copper-bearing formations.",
      iron: language === 'tr'
        ? "Bozulmuş manyetik alan ve yansıma genliği demir hedefini doğrular. Paslanma etkisi nedeniyle sinyalde hafif saçılmalar mevcuttur."
        : "Distorted magnetic field and reflection amplitude suggest ferrous iron target. Slight signal scatter is present due to oxidation (rust) effects.",
      concrete: language === 'tr'
        ? "Yüksek yoğunluklu beton kütle yansıması. Yapısal kiriş veya beton boru özellikleri tespit edilmiştir."
        : "High-density concrete mass reflection detected. Matches the structure of structural rebar grids or reinforcement concrete pipes.",
      water: language === 'tr'
        ? "Çok yüksek dielektrik sabiti (~80), GPR sinyalinin bu katmanda neredeyse tamamen yutulmasına sebep olur. Islak çamur veya yeraltı su sızıntısı."
        : "Extremely high dielectric constant (~80) causes severe signal attenuation, typical of wet clay layers or localized groundwater pockets.",
      void: language === 'tr'
        ? "Faz terslenmesi ve dielektrik sabiti (~1.0). Toprak veya kaya içerisinde yer alan ve içi hava dolu olan doğal veya yapay boşluk."
        : "Phase reversal and dielectric constant (~1.0). Natural cavern or artificial underground void filled with air.",
      tunnel: language === 'tr'
        ? "Geniş tünel geometrisi. Tavan ve taban duvarlarından gelen çift yansıma, düzenli tünel yapısını işaret eder."
        : "Wide tunnel geometry. Dual hyperbolic reflection from ceiling and floor structures indicates a hollow underground tunnel structure."
    };

    setMaterialExplanation(explainMap[material] || (language === 'tr' ? "Analiz başarılı. Hedefin elektromagnetik tepkisi seçilen sınıfa uyuyor." : "Analysis successful. The electromagnetic response matches the selected category."));
  };

  useEffect(() => {
    runMaterialAnalysis('gold');
  }, [language]);

  // Export report
  const exportReport = (format: 'pdf' | 'csv' | 'png', logId?: string): Promise<string> => {
    return new Promise(resolve => {
      setTimeout(() => {
        const id = logId || `REPORT-${Date.now().toString().slice(-4)}`;
        resolve(`${id}.${format}`);
      }, 1500);
    });
  };

  // Copilot questions
  const askCopilot = (question: string): string => {
    const qLower = question.toLowerCase();
    if (qLower.includes('derinlik') || qLower.includes('depth')) {
      return language === 'tr' 
        ? "Bu sistem 500 MHz antenle maksimum 4.5 - 5.0 metre derinliğe nüfuz edebilir. Daha derin taramalar için frekansı düşürmenizi (örn. 250 MHz) öneririm."
        : "This GPR system using the 500 MHz antenna penetrates up to 4.5 - 5.0 meters deep. For deeper scans, consider lowering the frequency (e.g., to 250 MHz).";
    }
    if (qLower.includes('metal') || qLower.includes('altın') || qLower.includes('gold')) {
      return language === 'tr'
        ? "Metalik hedefler, radargram üzerinde çok net ve parlak hiperbolik yansımalar üretirler. Elektromanyetik yansıma katsayıları yüksektir ve faz kayması pozitiftir."
        : "Metallic targets produce highly visible, bright hyperbolic reflections on the radargram. They exhibit a high reflection coefficient and positive phase shift.";
    }
    if (qLower.includes('hata') || qLower.includes('error') || qLower.includes('parazit') || qLower.includes('noise')) {
      return language === 'tr'
        ? "Zemin parazitini önlemek için Ayarlar sekmesinden 'Gürültü Filtreleme' ayarını 'Yüksek' (High) yapabilir ve 'Kazanç Kontrolü'nü (Gain) 35 dB civarına düşürebilirsiniz."
        : "To prevent ground clutter, try setting 'Noise Filtering' to 'High' in Settings, and lower the 'Gain Control' to around 35 dB.";
    }

    return language === 'tr'
      ? "AntiGravity GPR asistanı olarak hazırım. Tarama sinyalleri dengeli görünüyor, yüzey paraziti düşük. Taramaya başlayabilir ve yeraltını analiz edebilirsiniz."
      : "I am ready as your AntiGravity GPR assistant. Scan signals are stable, surface noise is low. You can start scanning and perform subsurface analysis.";
  };

  return (
    <GprContext.Provider
      value={{
        isDiagnosticsDone,
        diagnosticsStatus,
        diagnosticItems,
        runDiagnostics,
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
        selectedMaterial,
        materialConfidence,
        freqSignature,
        refSignature,
        similarMaterials,
        materialExplanation,
        runMaterialAnalysis,
        logs,
        addLog,
        exportReport,
        frequency,
        pulseVoltage,
        gain,
        noiseFilter,
        antennaType,
        resolution,
        theme,
        saveLocation,
        setFrequency,
        setPulseVoltage,
        setGain,
        setNoiseFilter,
        setAntennaType,
        setResolution,
        setTheme,
        setSaveLocation,
        audioAlertConfig,
        setTargetAudioAlert,
        playAudioAlert,
        playBeepSound,
        isDemoMode,
        setIsDemoMode,
        copilotText,
        askCopilot
      }}
    >
      {children}
    </GprContext.Provider>
  );
};

export const useGpr = () => {
  const context = useContext(GprContext);
  if (!context) {
    throw new Error('useGpr must be used within GprProvider');
  }
  return context;
};
