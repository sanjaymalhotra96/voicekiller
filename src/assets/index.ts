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
import EmptyInstructions from '@/assets/images/instructions/empty-instructions.svg';
import OrbitFlagSE from '@/assets/images/welcome/orbit-flag-se.svg';
import OrbitFlagUS from '@/assets/images/welcome/orbit-flag-us.svg';
import OrbitMan from '@/assets/images/welcome/orbit-man.svg';
import OrbitMic from '@/assets/images/welcome/orbit-mic.svg';
import OrbitPumpkin from '@/assets/images/welcome/orbit-pumpkin.svg';
import OrbitShocked from '@/assets/images/welcome/orbit-shocked.svg';
import OrbitSkull from '@/assets/images/welcome/orbit-skull.svg';

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
  orbitPumpkin: OrbitPumpkin,
  orbitSkull: OrbitSkull,
  orbitFlagUS: OrbitFlagUS,
  orbitMic: OrbitMic,
  orbitMan: OrbitMan,
  orbitFlagSE: OrbitFlagSE,
  orbitShocked: OrbitShocked,
  emptyInstructions: EmptyInstructions,
} satisfies Record<string, SvgIcon>;

// Bitmap illustrations. Replace a file with the final artwork (same name,
// transparent PNG exported at 3x) and it updates everywhere:
//   library/empty-library.png  Library with no files      ~420x345
//   dashboard/hero-tts.png     Dashboard Text to Speech   ~360x336
export const illustrations = {
  emptyLibrary: require('@/assets/images/library/empty-library.png'),
  heroTts: require('@/assets/images/dashboard/hero-tts.png'),
};

export { fontAssets } from '@/assets/fonts';
