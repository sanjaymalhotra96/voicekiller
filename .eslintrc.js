// Colours and sizes live in src/theme (palette.js, sizes.js, typography.js)
// and reach screens as Tailwind classes. These rules stop raw values from
// creeping back in; the theme itself is exempt.
const designTokenRules = [
  {
    selector: 'Literal[value=/^#[0-9A-Fa-f]{3,8}$/]',
    message:
      'Raw colour: use a palette colour (src/theme/palette.js) or a Tailwind class.',
  },
  {
    selector: 'Literal[value=/rgba?\\(/]',
    message:
      'Raw colour: use a palette colour, or alpha() from src/theme/palette.js.',
  },
  {
    selector: 'Literal[value=/-\\[\\d+(\\.\\d+)?(px|%)\\]/]',
    message:
      'Arbitrary Tailwind size: add a token to src/theme/sizes.js (or typography.js) and use its class.',
  },
  {
    selector: 'TemplateElement[value.raw=/-\\[\\d+(\\.\\d+)?(px|%)\\]/]',
    message:
      'Arbitrary Tailwind size: add a token to src/theme/sizes.js (or typography.js) and use its class.',
  },
];

module.exports = {
  root: true,
  extends: '@react-native',
  rules: {
    'no-restricted-syntax': ['error', ...designTokenRules],
  },
  overrides: [
    {
      // Where the tokens are defined.
      files: ['src/theme/**', 'tailwind.config.js'],
      rules: { 'no-restricted-syntax': 'off' },
    },
  ],
};
