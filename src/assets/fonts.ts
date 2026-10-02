import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { fontFamily } from '@/theme/fonts';

// Font files keyed by the family names in theme/fonts.js.
export const fontAssets = {
  [fontFamily.sans]: PlusJakartaSans_400Regular,
  [fontFamily['sans-medium']]: PlusJakartaSans_500Medium,
  [fontFamily['sans-semibold']]: PlusJakartaSans_600SemiBold,
  [fontFamily['sans-bold']]: PlusJakartaSans_700Bold,
};
