// Expo config plugin: sign Android release builds with the upload key in
// credentials/ (git-ignored; see credentials/upload.properties). Without
// that file, release builds keep the debug key, so other machines still
// build. Kept as a plugin so `expo prebuild` re-applies it every time.
const { withAppBuildGradle } = require('expo/config-plugins');

const MARKER = '// voicekiller: release signing';
const LINT_MARKER = '// voicekiller: release lint';
const ENV_MARKER = '// voicekiller: env input';

// Rebuild the JS bundle when .env changes (EXPO_PUBLIC_* values are built
// into it).
const ENV_BLOCK = "\n// voicekiller: env input\n// EXPO_PUBLIC_* values from .env are built into the JS bundle, but Gradle\n// does not know that: without this, a changed .env reuses the old bundle.\ntasks.matching { it.name.startsWith(\"createBundle\") && it.name.endsWith(\"JsAndAssets\") }.configureEach {\n    def envFile = rootProject.file(\"../.env\")\n    if (envFile.exists()) {\n        inputs.file(envFile)\n    }\n}\n";

// Release builds skip the lint pass: it adds minutes, needs a lot of
// memory, and only reports warnings (run `gradlew lint` to see them).
const LINT_CONFIG = `
    ${LINT_MARKER}
    lint {
        checkReleaseBuilds false
        abortOnError false
    }`;

const RELEASE_CONFIG = `
        ${MARKER}
        release {
            def props = new Properties()
            def propsFile = rootProject.file('../credentials/upload.properties')
            if (propsFile.exists()) {
                propsFile.withInputStream { props.load(it) }
                storeFile rootProject.file("../credentials/\${props['storeFile']}")
                storePassword props['storePassword']
                keyAlias props['keyAlias']
                keyPassword props['keyPassword']
            }
        }`;

module.exports = function withReleaseSigning(config) {
  return withAppBuildGradle(config, cfg => {
    let gradle = cfg.modResults.contents;
    if (!gradle.includes(ENV_MARKER)) {
      gradle += ENV_BLOCK;
    }
    if (!gradle.includes(LINT_MARKER)) {
      // Inside android { }, just before buildTypes { }.
      gradle = gradle.replace(/(\n\s*buildTypes\s*\{)/, `${LINT_CONFIG}$1`);
    }
    if (gradle.includes(MARKER)) {
      cfg.modResults.contents = gradle;
      return cfg;
    }
    // Add the release signing config after the debug one.
    gradle = gradle.replace(
      /(signingConfigs\s*\{\s*debug\s*\{[^}]*\})/,
      `$1${RELEASE_CONFIG}`,
    );
    // Release builds use it when the key file is present.
    gradle = gradle.replace(
      /(release\s*\{[^{}]*?)signingConfig signingConfigs\.debug/,
      "$1signingConfig rootProject.file('../credentials/upload.properties').exists() ? signingConfigs.release : signingConfigs.debug",
    );
    cfg.modResults.contents = gradle;
    return cfg;
  });
};
