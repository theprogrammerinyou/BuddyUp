import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { observer } from "mobx-react-lite";
import { premiumStore } from "@/stores/PremiumStore";
import { colors, spacing, radii, fontSizes } from "@/theme";

const FEATURES = [
  { label: "Super Connects", free: "5/day", premium: "Unlimited" },
  { label: "Ghost Mode", free: "✗", premium: "✓" },
  { label: "Travel Mode", free: "✗", premium: "✓" },
  { label: "Boost", free: "✗", premium: "✓" },
];

export default observer(function BuddyPassScreen({ navigation }: any) {
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = async (plan: "monthly" | "annual") => {
    setSubscribing(true);
    try {
      // TODO: Replace 'stub' provider and receipt with a real payment SDK (e.g. RevenueCat, Stripe) before production.
      await premiumStore.verifySubscription("stub", "stub_receipt", plan);
      Alert.alert(
        "🎉 BuddyPass Activated!",
        `You are now on the ${plan === "monthly" ? "Monthly" : "Annual"} plan. Enjoy all premium features!`,
        [{ text: "Let's Go!", onPress: () => navigation.goBack() }]
      );
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.error ?? "Subscription failed. Please try again.");
    } finally {
      setSubscribing(false);
    }
  };

  const sub = premiumStore.subscription;
  const isActive = premiumStore.isPremium;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#1A0533", "#2D1052", "#0F0F1A"]} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <View style={{ width: 40 }} />
        <Text style={styles.title}>⭐ BuddyPass</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.inner} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <LinearGradient
          colors={["#6A0572", "#C850C0", "#FFCC70"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroBadge}
        >
          <Text style={styles.heroEmoji}>⭐</Text>
          <Text style={styles.heroTitle}>BuddyPass</Text>
          <Text style={styles.heroSub}>Unlock the full BuddyUp experience</Text>
        </LinearGradient>

        {/* Already subscribed */}
        {isActive && sub ? (
          <View style={styles.activeCard}>
            <Ionicons name="checkmark-circle" size={28} color={colors.success} />
            <View style={{ flex: 1 }}>
              <Text style={styles.activeTitle}>Active Subscription</Text>
              <Text style={styles.activeSub}>
                Plan: {sub.plan} · Expires: {sub.expires_at ? new Date(sub.expires_at).toLocaleDateString() : "—"}
              </Text>
            </View>
          </View>
        ) : null}

        {/* Feature table */}
        <View style={styles.tableCard}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, styles.tableCellFeature]} />
            <Text style={[styles.tableCell, styles.tableHeadFree]}>Free</Text>
            <Text style={[styles.tableCell, styles.tableHeadPremium]}>⭐ BuddyPass</Text>
          </View>
          {FEATURES.map((row, i) => (
            <View key={row.label} style={[styles.tableRow, i % 2 === 0 && styles.tableRowAlt]}>
              <Text style={[styles.tableCell, styles.tableCellFeature, styles.tableCellLabel]}>
                {row.label}
              </Text>
              <Text style={[styles.tableCell, styles.tableCellFreeVal]}>{row.free}</Text>
              <Text style={[styles.tableCell, styles.tableCellPremiumVal]}>{row.premium}</Text>
            </View>
          ))}
        </View>

        {/* Subscribe buttons */}
        {!isActive && (
          <View style={styles.btnGroup}>
            <TouchableOpacity
              style={styles.monthlyBtn}
              onPress={() => handleSubscribe("monthly")}
              disabled={subscribing}
              activeOpacity={0.85}
            >
              {subscribing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.monthlyBtnTitle}>Subscribe Monthly</Text>
                  <Text style={styles.monthlyBtnPrice}>₹299 / month</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.annualBtn}
              onPress={() => handleSubscribe("annual")}
              disabled={subscribing}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={["#6A0572", "#C850C0"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.annualBtnGrad}
              >
                {subscribing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <View style={styles.saveBadge}>
                      <Text style={styles.saveBadgeText}>SAVE 30%</Text>
                    </View>
                    <Text style={styles.annualBtnTitle}>Subscribe Annually</Text>
                    <Text style={styles.annualBtnPrice}>₹2,499 / year</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.disclaimer}>
          Subscriptions are processed via stub (demo). Cancel any time.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  closeBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  title: { fontSize: fontSizes.lg, fontWeight: "900", color: colors.text },
  inner: { padding: spacing.lg, paddingBottom: 60, gap: 20 },
  heroBadge: {
    borderRadius: radii.xl,
    padding: spacing.xl,
    alignItems: "center",
    gap: 8,
  },
  heroEmoji: { fontSize: 48 },
  heroTitle: { fontSize: fontSizes.xl, fontWeight: "900", color: "#fff" },
  heroSub: { fontSize: fontSizes.sm, color: "rgba(255,255,255,0.85)", textAlign: "center" },
  activeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.success + "22",
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.success + "66",
  },
  activeTitle: { fontSize: fontSizes.md, fontWeight: "800", color: colors.text },
  activeSub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  tableCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  tableHeader: { flexDirection: "row", backgroundColor: colors.bgInput, paddingVertical: spacing.sm },
  tableRow: { flexDirection: "row", paddingVertical: 12 },
  tableRowAlt: { backgroundColor: colors.bgInput + "55" },
  tableCell: { flex: 1, textAlign: "center", paddingHorizontal: 4 },
  tableCellFeature: { flex: 1.5, textAlign: "left", paddingLeft: spacing.md },
  tableCellLabel: { fontSize: fontSizes.sm, color: colors.textSub, fontWeight: "600" },
  tableHeadFree: { fontSize: fontSizes.sm, color: colors.textMuted, fontWeight: "700" },
  tableHeadPremium: { fontSize: fontSizes.sm, color: "#C850C0", fontWeight: "800" },
  tableCellFreeVal: { fontSize: fontSizes.sm, color: colors.textMuted, fontWeight: "700" },
  tableCellPremiumVal: { fontSize: fontSizes.sm, color: colors.success, fontWeight: "800" },
  btnGroup: { gap: 12 },
  monthlyBtn: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    padding: spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  monthlyBtnTitle: { fontSize: fontSizes.md, fontWeight: "800", color: colors.text },
  monthlyBtnPrice: { fontSize: fontSizes.sm, color: colors.textSub },
  annualBtn: { borderRadius: radii.lg, overflow: "hidden" },
  annualBtnGrad: { padding: spacing.md, alignItems: "center", gap: 4 },
  saveBadge: {
    backgroundColor: colors.warning,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radii.full,
    marginBottom: 4,
  },
  saveBadgeText: { fontSize: 10, color: "#000", fontWeight: "900" },
  annualBtnTitle: { fontSize: fontSizes.md, fontWeight: "900", color: "#fff" },
  annualBtnPrice: { fontSize: fontSizes.sm, color: "rgba(255,255,255,0.85)" },
  disclaimer: { fontSize: 11, color: colors.textMuted, textAlign: "center" },
});
