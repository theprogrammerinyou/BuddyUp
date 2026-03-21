// API base URL for the BuddyUp backend.
//
// Override for different environments by setting EXPO_PUBLIC_API_BASE_URL in a
// .env.local file (Expo automatically exposes variables prefixed with
// EXPO_PUBLIC_ to the JS bundle at build time):
//
//   EXPO_PUBLIC_API_BASE_URL=https://api.yourserver.com/api/v1
//
// The fallback below is only for local development. Never ship a build without
// setting this variable to your actual server URL.
export const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/api/v1';
