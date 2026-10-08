import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { Icon } from '@/components/ui/Icon';
import { iconSize, useColors } from '@/theme';
import { cn } from '@/utils';

const sizes = {
  md: { box: 'size-avatar rounded-xl', text: 'title' },
  lg: { box: 'size-avatar-lg rounded-2xl', text: 'display' },
} as const;

const FILL = { width: '100%', height: '100%' } as const;

type Props = {
  name: string;
  // Photo URL; without one the first letter of `name` is shown.
  uri?: string | null;
  size?: keyof typeof sizes;
  // Small label under the avatar, e.g. the plan ("STUDIO").
  badge?: string;
  // Shows a camera button; called when tapped.
  onEdit?: () => void;
  editLabel?: string;
  uploading?: boolean;
  className?: string;
};

export function Avatar({
  name,
  uri,
  size = 'md',
  badge,
  onEdit,
  editLabel,
  uploading = false,
  className,
}: Props) {
  const colors = useColors();
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  const s = sizes[size];
  // Broken or unreachable photo URLs fall back to the initial.
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [uri]);
  const showPhoto = !!uri && !failed;

  return (
    <View className={cn('items-center', className)}>
      <View
        className={cn(
          'items-center justify-center overflow-hidden border border-tone-purple-line bg-tone-purple-tile',
          s.box,
        )}
      >
        {showPhoto ? (
          // expo-image: memory + disk cache, decoded at the view size.
          <Image
            source={uri}
            contentFit="cover"
            transition={150}
            onError={() => setFailed(true)}
            accessibilityIgnoresInvertColors
            style={FILL}
          />
        ) : (
          <AppText variant={s.text} className="text-tone-purple opacity-50">
            {initial}
          </AppText>
        )}
        {uploading ? (
          <View className="absolute inset-0 items-center justify-center bg-surface/60">
            <ActivityIndicator color={colors.primary.DEFAULT} />
          </View>
        ) : null}
      </View>
      {onEdit ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={editLabel}
          onPress={onEdit}
          disabled={uploading}
          className="absolute -bottom-2 -right-2 size-avatar-badge items-center justify-center rounded-full bg-primary active:bg-primary-dark"
        >
          <Icon name="camera" size={iconSize.md} color={colors.contrast} />
        </Pressable>
      ) : null}
      {badge ? (
        <View className="-mt-2 rounded-full bg-primary px-1.5">
          <AppText variant="micro">{badge}</AppText>
        </View>
      ) : null}
    </View>
  );
}
