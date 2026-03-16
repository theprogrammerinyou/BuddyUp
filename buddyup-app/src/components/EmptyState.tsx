import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, fontSizes, radii, spacing } from "@/theme";

interface EmptyStateProps {
  icon: string;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon, title, subtitle, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {actionLabel && onAction && (
        <TouchableOpacity style={styles.btn} onPress={onAction} activeOpacity={0.85}>
          <Text style={styles.btnText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    gap: 12,
  },
  icon: { fontSize: 56 },
  title: { fontSize: fontSizes.lg, fontWeight: "800", color: colors.text, textAlign: "center" },
  subtitle: { fontSize: fontSizes.sm, color: colors.textSub, textAlign: "center", lineHeight: 20 },
  btn: {
    marginTop: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: radii.full,
  },
  btnText: { color: "#fff", fontWeight: "700", fontSize: fontSizes.sm },
});
