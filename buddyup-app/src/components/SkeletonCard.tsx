import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { colors, radii } from "@/theme";

export default function SkeletonCard() {
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
    <Animated.View style={[styles.card, { opacity }]}>
      <View style={styles.imagePlaceholder} />
      <View style={styles.content}>
        <View style={styles.nameLine} />
        <View style={styles.bioLine} />
        <View style={styles.bioLineShort} />
        <View style={styles.chipsRow}>
          {[0, 1, 2].map((i) => <View key={i} style={styles.chip} />)}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 460,
    borderRadius: radii.xl,
    backgroundColor: colors.bgCard,
    overflow: "hidden",
  },
  imagePlaceholder: {
    width: "100%",
    height: "65%",
    backgroundColor: colors.bgInput,
  },
  content: { padding: 16, gap: 10 },
  nameLine: { height: 22, width: "55%", borderRadius: radii.sm, backgroundColor: colors.bgInput },
  bioLine: { height: 14, width: "90%", borderRadius: radii.sm, backgroundColor: colors.bgInput },
  bioLineShort: { height: 14, width: "70%", borderRadius: radii.sm, backgroundColor: colors.bgInput },
  chipsRow: { flexDirection: "row", gap: 8, marginTop: 4 },
  chip: { height: 28, width: 70, borderRadius: radii.full, backgroundColor: colors.bgInput },
});
