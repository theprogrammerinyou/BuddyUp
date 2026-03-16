import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, fontSizes } from "@/theme";

interface OfflineBannerProps {
  visible: boolean;
}

export default function OfflineBanner({ visible }: OfflineBannerProps) {
  if (!visible) return null;
  return (
    <View style={styles.banner}>
      <Text style={styles.text}>⚠️  No internet connection</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.error,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  text: { color: "#fff", fontSize: fontSizes.sm, fontWeight: "700" },
});
