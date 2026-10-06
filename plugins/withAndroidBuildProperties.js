// Expo config plugin: Android gradle.properties the app depends on. Kept
// as a plugin so `expo prebuild` re-applies them every time.
const { withGradleProperties } = require('expo/config-plugins');

const PROPERTIES = {
  // Compile Kotlin inside the Gradle process. The shared Kotlin daemon
  // crashes on Windows and leaves build files locked.
  'kotlin.compiler.execution.strategy': 'in-process',
  // The dev-client network inspector reads each request body to show it
  // in DevTools. A file upload body can be read only once, so the
  // inspector used it up and uploads (voice samples, media) went out
  // empty. Debug builds only.
  EX_DEV_CLIENT_NETWORK_INSPECTOR: 'false',
  // Kotlin compiling in-process (above) needs more memory than the
  // default: release builds ran out of Metaspace at 512 MB.
  'org.gradle.jvmargs': '-Xmx4096m -XX:MaxMetaspaceSize=1536m',
};

module.exports = function withAndroidBuildProperties(config) {
  return withGradleProperties(config, cfg => {
    cfg.modResults = cfg.modResults.filter(
      item => !(item.type === 'property' && item.key in PROPERTIES),
    );
    for (const [key, value] of Object.entries(PROPERTIES)) {
      cfg.modResults.push({ type: 'property', key, value });
    }
    return cfg;
  });
};
