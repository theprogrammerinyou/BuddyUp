// notificationService.ts — push notification registration and handling
// Re-exports from notifications.ts for backwards compatibility and adds
// foreground/background handling utilities.
export {
  registerForPushNotificationsAsync,
  syncPushTokenToBackend,
  registerForPushAndSync,
} from "./notifications";
