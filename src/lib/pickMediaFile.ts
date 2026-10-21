import { getDocumentAsync } from 'expo-document-picker';
import { File } from 'expo-file-system';
import {
  launchImageLibraryAsync,
  requestMediaLibraryPermissionsAsync,
  UIImagePickerPreferredAssetRepresentationMode,
} from 'expo-image-picker';
import { Platform } from 'react-native';
import type { AudioSample, FileRules, MediaSource } from '@/domain';
import { AppError } from '@/lib/errors';

// Both native pickers return a local file for the existing audio conversion flow.
export async function pickMediaFile(
  source: MediaSource,
  rules: FileRules,
): Promise<AudioSample | null> {
  if (source === 'files') {
    const result = await getDocumentAsync({
      type: [...rules.mimeTypes],
      copyToCacheDirectory: true,
    });
    const asset = result.canceled ? null : result.assets[0];
    return asset
      ? {
          uri: asset.uri,
          name: asset.name,
          mimeType: asset.mimeType ?? null,
          size: asset.size ?? null,
        }
      : null;
  }

  // iOS needs permission to return an original, uncompressed video.
  if (Platform.OS === 'ios') {
    const permission = await requestMediaLibraryPermissionsAsync();
    if (!permission.granted) throw new AppError('photoLibraryPermission');
  }
  const result = await launchImageLibraryAsync({
    mediaTypes: ['videos'],
    allowsEditing: false,
    preferredAssetRepresentationMode: UIImagePickerPreferredAssetRepresentationMode.Current,
    shouldDownloadFromNetwork: true,
  });
  const asset = result.canceled ? null : result.assets[0];
  return asset
    ? {
        uri: asset.uri,
        name: asset.fileName || new File(asset.uri).name,
        mimeType: asset.mimeType ?? null,
        size: asset.fileSize ?? null,
      }
    : null;
}
