import { Platform } from 'react-native';

// FlatList `removeClippedSubviews` saves memory on Android, but on iOS it
// can leave a list blank or stuck while its data changes (switching
// Library chips). Use it on Android only.
export const clipOffscreenRows = Platform.OS === 'android';
