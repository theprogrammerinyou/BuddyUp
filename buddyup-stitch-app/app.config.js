// app.config.js — extends app.json with dynamic env-var resolution.
// process.env is available here (Node.js), unlike plain app.json.
export default ({ config }) => ({
  ...config,
  expo: {
    ...config.expo,
    plugins: [
      [
        '@rnmapbox/maps',
        {
          // Must be a Mapbox SECRET token (starts with sk.)
          // Set RNMAPBOX_MAPS_DOWNLOAD_TOKEN in your shell before running:
          //   export RNMAPBOX_MAPS_DOWNLOAD_TOKEN=sk.eyJ1...
          // For EAS Build: add it as a build secret via `eas secret:create`
          RNMapboxMapsDownloadToken: process.env.RNMAPBOX_MAPS_DOWNLOAD_TOKEN ?? '',
        },
      ],
      'expo-secure-store',
      'expo-location',
    ],
  },
});
