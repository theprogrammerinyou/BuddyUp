import "react-native-gesture-handler";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet, View } from "react-native";
import * as Notifications from "expo-notifications";
import { MMKV } from "react-native-mmkv";
import { AppNavigator, navigationRef } from "@/navigators/AppNavigator";
import { authStore } from "@/stores/authStore";
import { registerForPushAndSync } from "@/services/notifications";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import OfflineBanner from "@/components/OfflineBanner";
import { ThemeContext, ThemeName, themes } from "@/theme";

const themeStorage = new MMKV();

function AppContent() {
  const { isOnline } = useNetworkStatus();
  const lastNotificationResponse = Notifications.useLastNotificationResponse();
  const [themeName, setThemeNameState] = useState<ThemeName>("dark");

  useEffect(() => {
    const saved = themeStorage.getString("theme") as ThemeName | undefined;
    if (saved && themes[saved]) setThemeNameState(saved);
  }, []);

  const setTheme = (name: ThemeName) => {
    themeStorage.set("theme", name);
    setThemeNameState(name);
  };

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
    <ThemeContext.Provider value={{ themeName, setTheme, colors: themes[themeName] }}>
      <View style={styles.root}>
        <OfflineBanner visible={!isOnline} />
        <AppNavigator />
      </View>
    </ThemeContext.Provider>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <AppContent />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
