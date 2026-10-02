// Every UI glyph, one SVG per file under src/assets/icons/<group>/.
// Generated layout: <group>/<kebab-name>.svg -> camelCase key (tabs and
// tools are prefixed: tabHome, toolVoiceClone). Draw new icons on a 24px
// grid in currentColor so <Icon color> can tint them, then add them here.
import type { FC } from 'react';
import type { SvgProps } from 'react-native-svg';
import NavigationArrowRight from '@/assets/icons/navigation/arrow-right.svg';
import NavigationCaretDown from '@/assets/icons/navigation/caret-down.svg';
import NavigationChevronDown from '@/assets/icons/navigation/chevron-down.svg';
import NavigationChevronLeft from '@/assets/icons/navigation/chevron-left.svg';
import NavigationChevronRight from '@/assets/icons/navigation/chevron-right.svg';
import NavigationChevronUp from '@/assets/icons/navigation/chevron-up.svg';
import NavigationClose from '@/assets/icons/navigation/close.svg';
import NavigationMoreVertical from '@/assets/icons/navigation/more-vertical.svg';
import ActionsAdd from '@/assets/icons/actions/add.svg';
import ActionsCamera from '@/assets/icons/actions/camera.svg';
import ActionsCheck from '@/assets/icons/actions/check.svg';
import ActionsCopy from '@/assets/icons/actions/copy.svg';
import ActionsDownload from '@/assets/icons/actions/download.svg';
import ActionsEdit from '@/assets/icons/actions/edit.svg';
import ActionsEyeOff from '@/assets/icons/actions/eye-off.svg';
import ActionsEye from '@/assets/icons/actions/eye.svg';
import ActionsFilter from '@/assets/icons/actions/filter.svg';
import ActionsRefresh from '@/assets/icons/actions/refresh.svg';
import ActionsSearch from '@/assets/icons/actions/search.svg';
import ActionsSettings from '@/assets/icons/actions/settings.svg';
import ActionsShare from '@/assets/icons/actions/share.svg';
import ActionsSparkles from '@/assets/icons/actions/sparkles.svg';
import ActionsTrash from '@/assets/icons/actions/trash.svg';
import ActionsUpload from '@/assets/icons/actions/upload.svg';
import ActionsWand from '@/assets/icons/actions/wand.svg';
import StatusAlert from '@/assets/icons/status/alert.svg';
import StatusCheckCircle from '@/assets/icons/status/check-circle.svg';
import StatusClock from '@/assets/icons/status/clock.svg';
import StatusCloudOff from '@/assets/icons/status/cloud-off.svg';
import StatusHeartFilled from '@/assets/icons/status/heart-filled.svg';
import StatusHeart from '@/assets/icons/status/heart.svg';
import StatusHelp from '@/assets/icons/status/help.svg';
import StatusInfo from '@/assets/icons/status/info.svg';
import StatusWifiOff from '@/assets/icons/status/wifi-off.svg';
import AccountAward from '@/assets/icons/account/award.svg';
import AccountGem from '@/assets/icons/account/gem.svg';
import AccountKey from '@/assets/icons/account/key.svg';
import AccountLock from '@/assets/icons/account/lock.svg';
import AccountMail from '@/assets/icons/account/mail.svg';
import AccountShieldCheck from '@/assets/icons/account/shield-check.svg';
import AccountShield from '@/assets/icons/account/shield.svg';
import AccountUser from '@/assets/icons/account/user.svg';
import FilesClipboard from '@/assets/icons/files/clipboard.svg';
import FilesFileAudio from '@/assets/icons/files/file-audio.svg';
import FilesFileText from '@/assets/icons/files/file-text.svg';
import FilesFiles from '@/assets/icons/files/files.svg';
import FilesFolderOpen from '@/assets/icons/files/folder-open.svg';
import FilesLanguages from '@/assets/icons/files/languages.svg';
import MediaAudioLines from '@/assets/icons/media/audio-lines.svg';
import MediaMicSparkle from '@/assets/icons/media/mic-sparkle.svg';
import MediaMic from '@/assets/icons/media/mic.svg';
import MediaPause from '@/assets/icons/media/pause.svg';
import MediaPlay from '@/assets/icons/media/play.svg';
import MediaStop from '@/assets/icons/media/stop.svg';
import MediaVoice from '@/assets/icons/media/voice.svg';
import MediaVolume from '@/assets/icons/media/volume.svg';
import MediaWaveform from '@/assets/icons/media/waveform.svg';
import SpeechEmotion from '@/assets/icons/speech/emotion.svg';
import TabsHome from '@/assets/icons/tabs/home.svg';
import TabsLibrary from '@/assets/icons/tabs/library.svg';
import TabsSettings from '@/assets/icons/tabs/settings.svg';
import ToolsAudioClean from '@/assets/icons/tools/audio-clean.svg';
import ToolsSpeechEditor from '@/assets/icons/tools/speech-editor.svg';
import ToolsSpeechToText from '@/assets/icons/tools/speech-to-text.svg';
import ToolsTextToSpeech from '@/assets/icons/tools/text-to-speech.svg';
import ToolsVoiceChanger from '@/assets/icons/tools/voice-changer.svg';
import ToolsVoiceClone from '@/assets/icons/tools/voice-clone.svg';
import ToolsVoiceDesign from '@/assets/icons/tools/voice-design.svg';

export const glyphs = {
  // navigation/
  arrowRight: NavigationArrowRight,
  caretDown: NavigationCaretDown,
  chevronDown: NavigationChevronDown,
  chevronLeft: NavigationChevronLeft,
  chevronRight: NavigationChevronRight,
  chevronUp: NavigationChevronUp,
  close: NavigationClose,
  moreVertical: NavigationMoreVertical,
  // actions/
  add: ActionsAdd,
  camera: ActionsCamera,
  check: ActionsCheck,
  copy: ActionsCopy,
  download: ActionsDownload,
  edit: ActionsEdit,
  eyeOff: ActionsEyeOff,
  eye: ActionsEye,
  filter: ActionsFilter,
  refresh: ActionsRefresh,
  search: ActionsSearch,
  settings: ActionsSettings,
  share: ActionsShare,
  sparkles: ActionsSparkles,
  trash: ActionsTrash,
  upload: ActionsUpload,
  wand: ActionsWand,
  // status/
  alert: StatusAlert,
  checkCircle: StatusCheckCircle,
  clock: StatusClock,
  cloudOff: StatusCloudOff,
  heartFilled: StatusHeartFilled,
  heart: StatusHeart,
  help: StatusHelp,
  info: StatusInfo,
  wifiOff: StatusWifiOff,
  // account/
  award: AccountAward,
  gem: AccountGem,
  key: AccountKey,
  lock: AccountLock,
  mail: AccountMail,
  shieldCheck: AccountShieldCheck,
  shield: AccountShield,
  user: AccountUser,
  // files/
  clipboard: FilesClipboard,
  fileAudio: FilesFileAudio,
  fileText: FilesFileText,
  files: FilesFiles,
  folderOpen: FilesFolderOpen,
  languages: FilesLanguages,
  // media/
  audioLines: MediaAudioLines,
  micSparkle: MediaMicSparkle,
  mic: MediaMic,
  pause: MediaPause,
  play: MediaPlay,
  stop: MediaStop,
  voice: MediaVoice,
  volume: MediaVolume,
  waveform: MediaWaveform,
  // speech/
  emotion: SpeechEmotion,
  // tabs/
  tabHome: TabsHome,
  tabLibrary: TabsLibrary,
  tabSettings: TabsSettings,
  // tools/
  toolAudioClean: ToolsAudioClean,
  toolSpeechEditor: ToolsSpeechEditor,
  toolSpeechToText: ToolsSpeechToText,
  toolTextToSpeech: ToolsTextToSpeech,
  toolVoiceChanger: ToolsVoiceChanger,
  toolVoiceClone: ToolsVoiceClone,
  toolVoiceDesign: ToolsVoiceDesign,
} satisfies Record<string, FC<SvgProps>>;

export type IconName = keyof typeof glyphs;
