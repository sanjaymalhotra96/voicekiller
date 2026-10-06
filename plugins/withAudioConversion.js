// Expo config plugin: use the "audio" FFmpegKit build for
// react-native-video-trim. The default "min" build has no mp3 encoder
// (libmp3lame); lib/audioConvert.ts turns videos into mp3. Kept as a
// plugin so `expo prebuild` re-applies it every time.
const { withPodfile, withProjectBuildGradle } = require('expo/config-plugins');

const PACKAGE = 'audio';
const MARKER = '// voicekiller: ffmpeg package';

function withAndroidPackage(config) {
  return withProjectBuildGradle(config, cfg => {
    let gradle = cfg.modResults.contents;
    if (!gradle.includes(MARKER)) {
      // The library reads rootProject.ext first; its own
      // gradle.properties would override a root gradle.properties value.
      gradle = gradle.replace(
        /buildscript\s*\{/,
        `buildscript {\n  ${MARKER}\n  ext {\n    VideoTrim_ffmpeg_package = '${PACKAGE}'\n  }`,
      );
      cfg.modResults.contents = gradle;
    }
    return cfg;
  });
}

function withIosPackage(config) {
  return withPodfile(config, cfg => {
    const line = `ENV['FFMPEGKIT_PACKAGE'] = '${PACKAGE}' # voicekiller: ffmpeg package`;
    if (!cfg.modResults.contents.includes(line)) {
      cfg.modResults.contents = `${line}\n${cfg.modResults.contents}`;
    }
    return cfg;
  });
}

module.exports = function withAudioConversion(config) {
  return withIosPackage(withAndroidPackage(config));
};
