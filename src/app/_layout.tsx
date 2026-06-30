import {
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_700Bold,
  Roboto_900Black,
  useFonts,
} from '@expo-google-fonts/roboto';
import * as NativeSplashScreen from 'expo-splash-screen';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AppProvider } from '@/providers/app-provider';
import { PersistentNav } from '@/components/persistent-nav';

NativeSplashScreen.setOptions({ duration: 700, fade: true });

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_700Bold,
    Roboto_900Black,
  });

  // Renderizamos cuando las fuentes cargaron O si fallaron (p. ej. en web): así la app
  // nunca queda en blanco; en ese caso se usa la fuente del sistema como fallback.
  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />
        <PersistentNav />
      </AppProvider>
    </GestureHandlerRootView>
  );
}
