import "react-native-gesture-handler";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet } from "react-native";
import * as Notifications from "expo-notifications";
import { AppNavigator, navigationRef } from "@/navigators/AppNavigator";
import { authStore } from "@/stores/authStore";
import { registerForPushAndSync } from "@/services/notifications";

export default function App() {
  const lastNotificationResponse = Notifications.useLastNotificationResponse();

  useEffect(() => {
    if (authStore.isAuthenticated) {
      registerForPushAndSync();
    }
  }, [authStore.isAuthenticated]);

  useEffect(() => {
    if (!lastNotificationResponse) return;
    const data = lastNotificationResponse.notification.request.content.data as Record<string, string> | undefined;
    const matchId = data?.matchId;
    const userName = data?.userName ?? "Buddy";
    if (lastNotificationResponse.actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER && matchId) {
      navigationRef.current?.navigate("Main", {
        screen: "Messages",
        params: { screen: "Chat", params: { matchId, userName } },
      });
    }
  }, [lastNotificationResponse]);

  return (
    <GestureHandlerRootView style={styles.root}>
      <AppNavigator />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
