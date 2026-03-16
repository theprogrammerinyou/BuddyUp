import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { LinearGradient } from "react-native-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, fontSizes, radii } from "@/theme";

export default function WelcomeScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#0F0F1A", "#1A1A3E", "#0F0F1A"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Hero icon */}
      <View style={styles.iconWrap}>
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          style={styles.iconGrad}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="people" size={64} color="#fff" />
        </LinearGradient>
      </View>

      <Text style={styles.title}>BuddyUp</Text>
      <Text style={styles.tagline}>
        Find your people.{"\n"}Gym. Code. Travel. Play.
      </Text>

      {/* Feature row */}
      <View style={styles.features}>
        {[
          { icon: "location-outline", label: "Nearby Buddies" },
          { icon: "heart-outline", label: "Interest Match" },
          { icon: "chatbubbles-outline", label: "Safe Chat" },
        ].map((f) => (
          <View key={f.label} style={styles.featureItem}>
            <Ionicons name={f.icon as any} size={22} color={colors.primary} />
            <Text style={styles.featureLabel}>{f.label}</Text>
          </View>
        ))}
      </View>

      {/* CTA */}
      <View style={styles.cta}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate("Register")}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            style={styles.btnGrad}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.primaryBtnText}>Get Started</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => navigation.navigate("Login")}
          activeOpacity={0.85}
        >
          <Text style={styles.secondaryBtnText}>
            Already have an account?{" "}
            <Text style={{ color: colors.primary }}>Log in</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, alignItems: "center" },
  iconWrap: { marginTop: 80, marginBottom: 24 },
  iconGrad: {
    width: 130,
    height: 130,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary,
    shadowOpacity: 0.6,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  title: {
    fontSize: 42,
    fontWeight: "900",
    color: colors.text,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: fontSizes.lg,
    color: colors.textSub,
    textAlign: "center",
    marginTop: 12,
    lineHeight: 28,
  },
  features: {
    flexDirection: "row",
    marginTop: 48,
    gap: 24,
  },
  featureItem: {
    alignItems: "center",
    gap: 6,
  },
  featureLabel: {
    fontSize: 11,
    color: colors.textSub,
    fontWeight: "600",
  },
  cta: {
    position: "absolute",
    bottom: 40,
    left: spacing.lg,
    right: spacing.lg,
    gap: 16,
  },
  primaryBtn: {
    borderRadius: radii.xl,
    overflow: "hidden",
  },
  btnGrad: {
    paddingVertical: 18,
    alignItems: "center",
  },
  primaryBtnText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: fontSizes.md,
    letterSpacing: 0.5,
  },
  secondaryBtn: {
    alignItems: "center",
    paddingVertical: 8,
  },
  secondaryBtnText: {
    color: colors.textSub,
    fontSize: fontSizes.sm,
  },
});
