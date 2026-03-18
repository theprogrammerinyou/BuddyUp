import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { api } from "./api";

// Show notifications when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Device.isDevice) return null;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
    if (finalStatus !== "granted") return null;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  const tokenData = await Notifications.getExpoPushTokenAsync({
    projectId: undefined, // set in app.json / EAS if using EAS Build
  });
  const token = tokenData?.data ?? null;
  return token;
}

export async function syncPushTokenToBackend(token: string | null): Promise<void> {
  if (!token) return;
  try {
    await api.put("/auth/push-token", { token });
  } catch {
    // Non-fatal: user can still use app; token may sync later
  }
}

export async function registerForPushAndSync(): Promise<void> {
  const token = await registerForPushNotificationsAsync();
  await syncPushTokenToBackend(token);
}
