import type { IconName } from '@/components';

// Settings menu, as data. Add/reorder rows here; SettingsScreen maps each
// `action` to what it does.
export type SettingsAction =
  | 'personalInfo'
  | 'changePassword'
  | 'subscription'
  | 'share'
  | 'contact'
  | 'privacy';

type SettingsSection = {
  id: 'general' | 'others';
  items: { action: SettingsAction; icon: IconName }[];
};

export const settingsMenu: SettingsSection[] = [
  {
    id: 'general',
    items: [
      { action: 'personalInfo', icon: 'user' },
      { action: 'changePassword', icon: 'key' },
      { action: 'subscription', icon: 'award' },
    ],
  },
  {
    id: 'others',
    items: [
      { action: 'share', icon: 'share' },
      { action: 'contact', icon: 'mail' },
      { action: 'privacy', icon: 'shieldCheck' },
    ],
  },
];
