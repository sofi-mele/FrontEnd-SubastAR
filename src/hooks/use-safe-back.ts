import { useNavigation } from '@react-navigation/native';
import { useRouter, type Href } from 'expo-router';

export function useSafeBack(fallback: Href = '/' as Href) {
  const navigation = useNavigation();
  const router = useRouter();

  return () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    router.replace(fallback as Href);
  };
}

