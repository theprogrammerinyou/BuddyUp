import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "react-native-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radii, fontSizes, INTERESTS, INTEREST_COLORS } from "@/theme";

export default function InterestsScreen({ navigation, route }: any) {
  const prevData = route.params ?? {};
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (interest: string) => {
    setSelected((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleNext = () => {
    if (selected.length === 0) return;
    navigation.navigate("AvatarPicker", { ...prevData, interests: selected });
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#0F0F1A", "#1A1A3E"]} style={StyleSheet.absoluteFill} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.step}>Step 2 of 3</Text>
      </View>

      <ScrollView contentContainerStyle={styles.inner} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Your Interests</Text>
        <Text style={styles.sub}>
          Pick anything that excites you — we'll find buddies who share your vibe 🎯
        </Text>

        <View style={styles.grid}>
          {INTERESTS.map((interest) => {
            const isSelected = selected.includes(interest);
            const chipColor = INTEREST_COLORS[interest];
            return (
              <TouchableOpacity
                key={interest}
                onPress={() => toggle(interest)}
                style={[
                  styles.chip,
                  isSelected && { backgroundColor: chipColor, borderColor: chipColor },
                ]}
                activeOpacity={0.8}
              >
                <Text
                  style={[styles.chipText, isSelected && { color: "#fff" }]}
                >
                  {interest}
                </Text>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={16} color="#fff" style={{ marginLeft: 6 }} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.btn, selected.length === 0 && { opacity: 0.5 }]}
          onPress={handleNext}
          disabled={selected.length === 0}
        >
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            style={styles.btnGrad}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.btnText}>
              Next: Pick Your Avatar → ({selected.length} selected)
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  step: { fontSize: 12, color: colors.primary, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" },
  inner: { padding: spacing.lg, paddingBottom: 40 },
  title: { fontSize: fontSizes.xl, fontWeight: "900", color: colors.text, marginTop: 16, marginBottom: 8 },
  sub: { fontSize: fontSizes.sm, color: colors.textSub, lineHeight: 22, marginBottom: 32 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: radii.full,
    backgroundColor: colors.bgCard,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  chipText: { color: colors.textSub, fontWeight: "600", fontSize: fontSizes.sm },
  btn: { borderRadius: radii.xl, overflow: "hidden", marginTop: 40 },
  btnGrad: { paddingVertical: 18, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "800", fontSize: 14 },
});
