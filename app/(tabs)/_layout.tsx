import { Tabs } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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
          border: '#334155',
        };
      case 'light':
        return {
          bg: '#FFFFFF',
          active: '#3B82F6',
          inactive: '#64748B',
          border: '#E2E8F0',
        };
      case 'industrial':
      default:
        return {
          bg: '#111827',
          active: '#3B82F6',
          inactive: '#9CA3AF',
          border: '#374151',
        };
    }
  };

  const colors = getThemeColors();

  // Custom Left Sidebar component
  const CustomSideBar = ({ state, descriptors, navigation }: any) => {
    return (
      <View style={[styles.sidebar, { backgroundColor: colors.bg, borderRightColor: colors.border }]}>
        {/* Top Logo */}
        <View style={styles.logoBox}>
          <Ionicons name="scan-circle" size={32} color="#06B6D4" />
          <Text style={styles.logoText}>GPR</Text>
        </View>

        {/* Tab Items */}
        <View style={styles.tabItemsContainer}>
          {state.routes.map((route: any, index: number) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            // Custom Icon selector
            const getIcon = (routeName: string, color: string) => {
              switch (routeName) {
                case 'index':
                  return <Ionicons name="home" size={20} color={color} />;
                case 'scan':
                  return <Ionicons name="pulse" size={20} color={color} />;
                case 'material':
                  return <Ionicons name="flask" size={20} color={color} />;
                case 'logs':
                  return <Ionicons name="folder-open" size={20} color={color} />;
                case 'settings':
                  return <Ionicons name="settings" size={20} color={color} />;
                default:
                  return <Ionicons name="ellipse" size={20} color={color} />;
              }
            };

            const getLabel = (routeName: string) => {
              switch (routeName) {
                case 'index':
                  return language === 'tr' ? 'Ana Sayfa' : language === 'de' ? 'Start' : language === 'fr' ? 'Accueil' : language === 'ru' ? 'Главная' : language === 'ar' ? 'الرئيسية' : 'Home';
                case 'scan':
                  return language === 'tr' ? 'Canlı Tarama' : language === 'de' ? 'Live-Scan' : language === 'fr' ? 'Scan' : language === 'ru' ? 'Сканирование' : language === 'ar' ? 'مسح' : 'Live Scan';
                case 'material':
                  return language === 'tr' ? 'Madde' : language === 'de' ? 'Material' : language === 'fr' ? 'Matière' : language === 'ru' ? 'Анализ' : language === 'ar' ? 'تحليل' : 'Analysis';
                case 'logs':
                  return language === 'tr' ? 'Kayıtlar' : language === 'de' ? 'Protokoll' : language === 'fr' ? 'Registres' : language === 'ru' ? 'Журнал' : language === 'ar' ? 'السجلات' : 'Logs';
                case 'settings':
                  return language === 'tr' ? 'Ayarlar' : language === 'de' ? 'Optionen' : language === 'fr' ? 'Ajustements' : language === 'ru' ? 'Настройки' : language === 'ar' ? 'إعدادات' : 'Settings';
                default:
                  return '';
              }
            };

            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                style={[
                  styles.tabItem,
                  isFocused && { backgroundColor: theme === 'light' ? '#EFF6FF' : '#1E293B' }
                ]}
              >
                {/* Active Indicator Bar on the left */}
                {isFocused && <View style={[styles.activeIndicator, { backgroundColor: colors.active }]} />}
                
                {getIcon(route.name, isFocused ? colors.active : colors.inactive)}
                <Text 
                  style={[
                    styles.tabLabel, 
                    { color: isFocused ? colors.active : colors.inactive }
                  ]}
                  numberOfLines={1}
                >
                  {getLabel(route.name)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Bottom Status */}
        <View style={styles.bottomStatus}>
          <Ionicons name="battery-charging" size={16} color="#22C55E" />
        </View>
      </View>
    );
  };

  return (
    <Tabs
      tabBar={(props) => <CustomSideBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="scan" />
      <Tabs.Screen name="material" />
      <Tabs.Screen name="logs" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 75,
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRightWidth: 1,
    zIndex: 1000,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  logoBox: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#06B6D4',
    letterSpacing: 1,
    marginTop: 2,
  },
  tabItemsContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
  },
  tabItem: {
    width: '100%',
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3.5,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
  tabLabel: {
    fontSize: 8,
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'center',
  },
  bottomStatus: {
    alignItems: 'center',
    marginTop: 20,
  }
});
