// Expo config plugin: compile Kotlin inside the Gradle process.
// The shared Kotlin daemon crashes on Windows and leaves build files
// locked. Kept as a plugin so `expo prebuild` re-applies it every time.
const { withGradleProperties } = require('expo/config-plugins');

const KEY = 'kotlin.compiler.execution.strategy';

module.exports = function withKotlinInProcess(config) {
  return withGradleProperties(config, cfg => {
    cfg.modResults = cfg.modResults.filter(
      item => !(item.type === 'property' && item.key === KEY),
    );
    cfg.modResults.push({ type: 'property', key: KEY, value: 'in-process' });
    return cfg;
  });
};
