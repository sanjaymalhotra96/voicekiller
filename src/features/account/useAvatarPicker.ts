import * as ImagePicker from 'expo-image-picker';
import { useUploadAvatar } from '@/features/account/hooks';

// Square crop from the photo library, then upload as the profile photo.
// The service downsizes it first (config.storage.avatar).
export function useAvatarPicker() {
  const upload = useUploadAvatar();

  const pick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      // Re-encoded after resizing, so skip a lossy pass here.
      quality: 1,
    });
    const asset = result.canceled ? null : result.assets[0];
    if (asset) {
      upload.mutate(asset.uri);
    }
  };

  return { pick, uploading: upload.isPending, error: upload.error };
}
