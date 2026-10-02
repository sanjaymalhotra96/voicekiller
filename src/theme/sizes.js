// Size tokens shared by tailwind.config.js and components.
// Tailwind: h-control, h-button, h-button-sm, size-otp, size-checkbox,
// size-icon-btn, size-tile, size-avatar, h-indicator, h-hero,
// border-orbit.

const control = {
  control: '60px', // text fields, auth buttons
  'field-sm': '48px', // compact fields (search)
  button: '56px', // primary buttons
  otp: '56px', // OTP digit boxes
  checkbox: '18px',
  radio: '22px',
  'icon-btn': '36px', // square header buttons
  'icon-btn-sm': '28px', // round close buttons
  'button-sm': '40px', // compact buttons (Create Speech)
  tile: '40px', // tinted icon squares on tool cards
  avatar: '48px',
  'avatar-lg': '120px', // profile screen
  'avatar-badge': '40px', // camera button on the large avatar
  indicator: '3px', // active tab bar line
  hero: '112px', // dashboard hero card
  chip: '34px', // filter chips
  play: '40px', // round play/pause button
  track: '3px', // progress bar track
  'play-lg': '52px', // gradient play button (voice / instruction rows)
  'tool-chip': '36px', // editor toolbar chips (Marcus, Add Pause)
  segment: '44px', // segmented control (Library / My Instructions)
  option: '56px', // option cards (MP3 / WAV)
  ruler: '40px', // speed ruler ticks area
  'stop-dot': '12px', // delivery mode stop
  'stop-active': '26px', // selected delivery mode stop
  'count-badge': '18px', // red count bubble on the filter button
  textarea: '200px', // multi-line inputs in light screens
};

const borderWidth = {
  orbit: '1.5px', // hero orbit rings
};

// Icon glyph sizes in dp: <Icon size={iconSize.md} />
const iconSize = {
  xxs: 10,
  xs: 14,
  sm: 16,
  md: 20,
  lg: 26,
  xl: 36,
  xxl: 40,
};

// Layout values used from code (not Tailwind classes).
const layout = {
  // Extra touch area around small tappables.
  hitSlop: 8,
  // Auth bottom sheets, as a fraction of the screen height.
  sheetHeight: 0.86,
  // Gap kept above any bottom sheet, and padding under its content.
  sheetTopGap: 24,
  sheetBottomPadding: 24,
  headerLogo: 56,
  heroArt: { width: 120, height: 112 },
  emptyArt: { width: 140, height: 120 },
  // Dialogs never stretch past this on tablets.
  dialogMaxWidth: 340,
  // Tall pickers (Select Voice), as a fraction of the screen height.
  pickerSheetHeight: 0.9,
  // Stroke of the playback ring around an active play button.
  ringStroke: 3,
};

module.exports = { control, borderWidth, iconSize, layout };
