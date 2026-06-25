import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';
import { useGpr } from '../../context/GprContext';

export default function TabLayout() {
  const { t, language } = useLanguage();
  const { theme } = useGpr();

  // Define colors based on theme
  const getThemeColors = () => {
    switch (theme) {
      case 'dark':
        return {
          bg: '#1E293B',
          active: '#60A5FA',
          inactive: '#64748B',
          headerBg: '#0F172A',
          headerText: '#F8FAFC',
        };
      case 'light':
        return {
          bg: '#FFFFFF',
          active: '#3B82F6',
          inactive: '#64748B',
          headerBg: '#F8FAFC',
          headerText: '#0F172A',
        };
      case 'industrial':
      default:
        return {
          bg: '#111827',
          active: '#3B82F6',
          inactive: '#9CA3AF',
          headerBg: '#1F2937',
          headerText: '#F3F4F6',
        };
    }
  };

  const colors = getThemeColors();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.active,
        tabBarInactiveTintColor: colors.inactive,
        tabBarStyle: {
          backgroundColor: colors.bg,
          borderTopWidth: 1,
          borderTopColor: theme === 'light' ? '#E2E8F0' : '#374151',
          paddingBottom: 6,
          paddingTop: 6,
          height: 60,
        },
        headerStyle: {
          backgroundColor: colors.headerBg,
          borderBottomWidth: 1,
          borderBottomColor: theme === 'light' ? '#E2E8F0' : '#374151',
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: colors.headerText,
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
          letterSpacing: 0.5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t.statusReady,
          tabBarLabel: language === 'tr' ? 'Ana Sayfa' : language === 'de' ? 'Startseite' : language === 'fr' ? 'Accueil' : language === 'ru' ? 'Главная' : language === 'ar' ? 'الرئيسية' : 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: t.card1Title,
          tabBarLabel: language === 'tr' ? 'Canlı Tarama' : language === 'de' ? 'Live-Scan' : language === 'fr' ? 'Scan Direct' : language === 'ru' ? 'Сканирование' : language === 'ar' ? 'مسح مباشر' : 'Live Scan',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="pulse-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="material"
        options={{
          title: t.card2Title,
          tabBarLabel: language === 'tr' ? 'Madde Analizi' : language === 'de' ? 'Materialanalyse' : language === 'fr' ? 'Analyse' : language === 'ru' ? 'Анализ' : language === 'ar' ? 'تحليل المواد' : 'Analysis',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="flask-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="logs"
        options={{
          title: t.card3Title,
          tabBarLabel: language === 'tr' ? 'Kayıtlar' : language === 'de' ? 'Protokolle' : language === 'fr' ? 'Registres' : language === 'ru' ? 'Журнал' : language === 'ar' ? 'السجلات' : 'Logs',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="folder-open-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t.settingsTitle,
          tabBarLabel: language === 'tr' ? 'Ayarlar' : language === 'de' ? 'Einstellungen' : language === 'fr' ? 'Paramètres' : language === 'ru' ? 'Настройки' : language === 'ar' ? 'الإعدادات' : 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
