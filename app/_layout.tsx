import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useInitDatabase } from '../hooks/useDataBase';
import LoadingIndicator from '@/components/ui/LoadingIndicator';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';

// Empêcher l'écran de splash de se cacher automatiquement
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { isInitialized, isLoading, error } = useInitDatabase();
  
  // Vous pouvez utiliser des polices par défaut ou charger des polices personnalisées
  const [loaded] = useFonts({
    // Commenté pour éviter les erreurs de polices manquantes
    // 'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
    // 'Poppins-Medium': require('../assets/fonts/Poppins-Medium.ttf'),
    // 'Poppins-SemiBold': require('../assets/fonts/Poppins-SemiBold.ttf'),
    // 'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
  });

  useEffect(() => {
    if ((loaded || true) && isInitialized) { // true pour ignorer les polices pour l'instant
      SplashScreen.hideAsync();
    }
  }, [loaded, isInitialized]);

  if (isLoading) {
    return <LoadingIndicator fullScreen text="Initialisation de l'application..." />;
  }

  if (error) {
    return (
      <LoadingIndicator 
        fullScreen 
        text="Erreur lors de l'initialisation de la base de données" 
      />
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ 
        headerStyle: {
          backgroundColor: colorScheme === 'dark' ? '#111827' : '#ffffff',
        },
        headerTintColor: colorScheme === 'dark' ? '#ffffff' : '#111827',
        headerTitleStyle: {
          fontWeight: 'bold' // Au lieu de fontFamily: 'Poppins-SemiBold'
        },
        contentStyle: {
          backgroundColor: colorScheme === 'dark' ? '#1f2937' : '#f9fafb',
        }
      }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="anime/[id]" options={{ title: 'Détails de l\'anime' }} />
        <Stack.Screen name="anime/[id]/[episode]" options={{ title: 'Détails de l\'épisode' }} />
        <Stack.Screen name="collection/[id]" options={{ title: 'Détails de la collection' }} />
      </Stack>
    </ThemeProvider>
  );
}