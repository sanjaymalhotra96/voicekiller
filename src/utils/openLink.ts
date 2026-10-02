import { Linking } from 'react-native';
import { log } from '@/lib/logger';

// Opens a URL (web page, mailto:, audio file) in the system handler.
// Never throws: a device with no handler for the link is not a crash.
export function openLink(url: string) {
  Linking.openURL(url).catch(error => log('links', `cannot open ${url}`, error));
}
