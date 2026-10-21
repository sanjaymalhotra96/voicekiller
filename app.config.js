// Sensitive EAS variables are passed to the app through Expo config.
// These values are embedded in the app and remain readable there.
const metaAppId = '1751764839271755';
const trackingPermission =
  'Allow Voice Killer to measure which ads lead to signups and free trials.';

module.exports = ({ config }) => ({
  ...config,
  plugins: [
    ...(config.plugins ?? []),
    [
      'react-native-fbsdk-next',
      {
        appID: metaAppId,
        clientToken: process.env.META_CLIENT_TOKEN,
        displayName: 'Voice Killer',
        scheme: `fb${metaAppId}`,
        advertiserIDCollectionEnabled: false,
        autoLogAppEventsEnabled: false,
        isAutoInitEnabled: false,
        iosUserTrackingPermission: trackingPermission,
      },
    ],
    ['expo-tracking-transparency', { userTrackingPermission: trackingPermission }],
  ],
  extra: {
    ...config.extra,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    REVENUECAT_ANDROID_KEY: process.env.REVENUECAT_ANDROID_KEY,
    REVENUECAT_IOS_KEY: process.env.REVENUECAT_IOS_KEY,
    ONBOARDING_ACTING_KEY: process.env.ONBOARDING_ACTING_KEY,
    ONBOARDING_CLONE_KEY: process.env.ONBOARDING_CLONE_KEY,
    META_CLIENT_TOKEN: process.env.META_CLIENT_TOKEN,
    META_APP_ID: metaAppId,
  },
});
