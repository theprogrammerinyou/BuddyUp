import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { colors, radii } from "@/theme";

export default function SkeletonListItem() {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, [shimmer]);

  const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] });

  return (
    <Animated.View style={[styles.item, { opacity }]}>
      <View style={styles.avatar} />
      <View style={styles.lines}>
        <View style={styles.nameLine} />
        <View style={styles.subLine} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.bgInput },
  lines: { flex: 1, gap: 10 },
  nameLine: { height: 16, width: "50%", borderRadius: radii.sm, backgroundColor: colors.bgInput },
  subLine: { height: 12, width: "75%", borderRadius: radii.sm, backgroundColor: colors.bgInput },
});
