// Every image the app uses is registered here, so screens never import
// asset paths directly. Replace a file on disk to update it everywhere.
//
// Folder convention (by feature):
//   icons/<group>/<name>.svg   UI glyphs, drawn in currentColor; registered
//                              in icons/index.ts and used via <Icon name>.
//   icons/auth, icons/brand    multi-colour brand artwork, used directly.
//   images/<feature>/<name>    illustrations for one feature.
//
// SVGs are imported as components: <icons.google width={24} height={24} />
import type { FC } from 'react';
import type { SvgProps } from 'react-native-svg';
import AppleIcon from '@/assets/icons/auth/apple.svg';
import GoogleIcon from '@/assets/icons/auth/google.svg';
import MailIcon from '@/assets/icons/auth/mail.svg';
import LogoMark from '@/assets/icons/brand/logo-mark.svg';
import DashboardTextToSpeech from '@/assets/images/dashboard/dashboard-text-to-speech.svg';
import InstructionsEmpty from '@/assets/images/instructions/instructions-empty.svg';
import LibraryEmpty from '@/assets/images/library/library-empty.svg';
import SettingsUsageClock from '@/assets/images/settings/settings-usage-clock.svg';
import WelcomeFlagSe from '@/assets/images/welcome/welcome-flag-se.svg';
import WelcomeFlagUs from '@/assets/images/welcome/welcome-flag-us.svg';
import WelcomeMan from '@/assets/images/welcome/welcome-man.svg';
import WelcomeMic from '@/assets/images/welcome/welcome-mic.svg';
import WelcomePumpkin from '@/assets/images/welcome/welcome-pumpkin.svg';
import WelcomeShocked from '@/assets/images/welcome/welcome-shocked.svg';
import WelcomeSkull from '@/assets/images/welcome/welcome-skull.svg';

export type SvgIcon = FC<SvgProps>;

export { glyphs } from '@/assets/icons';
export type { IconName } from '@/assets/icons';

// Brand artwork with its own colours (sign-in buttons, logo).
export const icons = {
  google: GoogleIcon,
  apple: AppleIcon,
  mail: MailIcon,
  // Single colour: tint with the `color` prop.
  logoMark: LogoMark,
} satisfies Record<string, SvgIcon>;

// SVG illustrations, grouped by the feature that shows them.
export const images = {
  welcomePumpkin: WelcomePumpkin,
  welcomeSkull: WelcomeSkull,
  welcomeFlagUs: WelcomeFlagUs,
  welcomeMic: WelcomeMic,
  welcomeMan: WelcomeMan,
  welcomeFlagSe: WelcomeFlagSe,
  welcomeShocked: WelcomeShocked,
  instructionsEmpty: InstructionsEmpty,
  // Library with no files.
  libraryEmpty: LibraryEmpty,
  // Dashboard Text to Speech card.
  dashboardTextToSpeech: DashboardTextToSpeech,
  // Usage badge on the Settings profile card.
  settingsUsageClock: SettingsUsageClock,
} satisfies Record<string, SvgIcon>;

export { fontAssets } from '@/assets/fonts';
