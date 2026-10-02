// Font family names, shared by tailwind.config.js and the font loader.
// Android picks weights by family name (not `fontWeight`), so each weight
// is its own family. Tailwind classes: font-sans, font-sans-medium, ...
const fontFamily = {
  sans: 'PlusJakartaSans_400Regular',
  'sans-medium': 'PlusJakartaSans_500Medium',
  'sans-semibold': 'PlusJakartaSans_600SemiBold',
  'sans-bold': 'PlusJakartaSans_700Bold',
};

module.exports = { fontFamily };
