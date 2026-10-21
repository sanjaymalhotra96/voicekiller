const { AndroidConfig, withAndroidColorsNight } = require('expo/config-plugins');

// Preserve the launcher icon's dark background when Android is regenerated.
module.exports = function withIconAppearance(config) {
  return withAndroidColorsNight(config, cfg => {
    cfg.modResults = AndroidConfig.Colors.assignColorValue(cfg.modResults, {
      name: 'iconBackground',
      value: '#000000',
    });
    return cfg;
  });
};
