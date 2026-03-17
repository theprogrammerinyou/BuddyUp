import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { LinearGradient } from "react-native-linear-gradient";
import { observer } from "mobx-react-lite";
import { Ionicons } from "@expo/vector-icons";
import { authStore } from "@/stores/authStore";
import { socialStore } from "@/stores/SocialStore";
import { xpStore } from "@/stores/XPStore";
import { premiumStore } from "@/stores/PremiumStore";
import { api } from "@/services/api";
import { colors, spacing, radii, fontSizes, INTEREST_COLORS } from "@/theme";

export default observer(function ProfileScreen({ navigation }: any) {
  const user = authStore.user;
  const [badges, setBadges] = useState<any[]>([]);
  const [boostSecondsLeft, setBoostSecondsLeft] = useState(0);

  useEffect(() => {
    if (!user) return;
    xpStore.fetchXP();
    premiumStore.fetchBoostStatus();
    premiumStore.fetchSubscription();
    api.get(`/users/${user.id}/badges`)
      .then(({ data }) => setBadges(Array.isArray(data) ? data : data.badges ?? []))
      .catch(() => {});
  }, [user?.id]);

  // Boost countdown
  useEffect(() => {
    const boost = premiumStore.boost;
    if (!boost?.expires_at) {
      setBoostSecondsLeft(0);
      return;
    }
    const updateCountdown = () => {
      const diff = Math.max(0, Math.floor((new Date(boost.expires_at).getTime() - Date.now()) / 1000));
      setBoostSecondsLeft(diff);
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [premiumStore.boost]);

  if (!user) return null;

  const handleSettings = () => {
    navigation.navigate("Settings");
  };

  const handleBoost = async () => {
    if (!premiumStore.isPremium) {
      navigation.navigate("BuddyPass");
      return;
    }
    try {
      await premiumStore.activateBoost();
      Alert.alert("⚡ Boosted!", "Your profile is now boosted for 30 minutes!");
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.error ?? "Failed to activate boost");
    }
  };

  const xpProgress = xpStore.totalXP > 0 ? xpStore.totalXP % 100 : 0;
  const boostActive = boostSecondsLeft > 0;
  const boostMinsLeft = Math.ceil(boostSecondsLeft / 60);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#0F0F1A", "#1A1A2E"]} style={StyleSheet.absoluteFill} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.inner}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => navigation.navigate("Notifications")}>
              <Ionicons name="notifications-outline" size={24} color={colors.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSettings}>
              <Ionicons name="settings-outline" size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Travel Mode Banner */}
        {socialStore.isTravelModeActive && (
          <View style={styles.travelBanner}>
            <Text style={styles.travelBannerText}>🌍 Travel Mode Active</Text>
          </View>
        )}

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrap}>
            <Image
              source={{
                uri: user.avatar?.image_url ??
                  `https://ui-avatars.com/api/?name=${user.display_name}&background=6C63FF&color=fff&size=200`,
              }}
              style={styles.avatar}
            />
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              style={styles.avatarRing}
            />
          </View>
          <Text style={styles.name}>{user.display_name}</Text>
          {user.avatar && (
            <View style={styles.charBadge}>
              <Ionicons name="star" size={14} color={colors.warning} />
              <Text style={styles.charText}>
                {user.avatar.name} · {user.avatar.franchise}
              </Text>
            </View>
          )}
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{5 - socialStore.dailySuperConnectsSent}</Text>
            <Text style={styles.statLabel}>⚡ Today</Text>
          </View>
        </View>

        {/* XP Bar & Level */}
        <View style={styles.card}>
          <View style={styles.xpHeaderRow}>
            <Text style={styles.sectionTitle}>Level {xpStore.level}</Text>
            <Text style={styles.xpTotalText}>{xpStore.totalXP.toLocaleString()} XP</Text>
          </View>
          <View style={styles.progressTrack}>
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: `${xpProgress}%` }]}
            />
          </View>
          <View style={styles.progressLabelRow}>
            <Text style={styles.progressLabel}>Progress to Level {xpStore.level + 1}</Text>
            <Text style={styles.progressPct}>{xpProgress}%</Text>
          </View>
        </View>

        {/* Boost Button */}
        <TouchableOpacity
          style={[styles.boostBtn, boostActive && styles.boostBtnActive]}
          onPress={handleBoost}
          activeOpacity={0.85}
        >
          <Ionicons name="flash" size={18} color={boostActive ? colors.warning : "#fff"} />
          <Text style={[styles.boostBtnText, boostActive && styles.boostBtnTextActive]}>
            {boostActive ? `Boosted — ${boostMinsLeft} min left` : "⚡ Boost Me"}
          </Text>
        </TouchableOpacity>

        {/* Bio */}
        {user.bio ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>About me</Text>
            <Text style={styles.bio}>{user.bio}</Text>
          </View>
        ) : null}

        {/* Interests */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Interests</Text>
          <View style={styles.chips}>
            {(user.interests ?? []).map((i) => (
              <View
                key={i}
                style={[styles.chip, { backgroundColor: INTEREST_COLORS[i] ?? colors.primary }]}
              >
                <Text style={styles.chipText}>{i}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Badges */}
        {badges.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Badges</Text>
            <View style={styles.chips}>
              {badges.map((badge: any) => (
                <View key={badge.id ?? badge.slug} style={styles.badgeChip}>
                  <Text style={styles.badgeEmoji}>{badge.emoji ?? "🏅"}</Text>
                  <Text style={styles.badgeName}>{badge.name ?? badge.slug}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Vibe Tags */}
        {(user as any).vibe_tags?.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Vibe Tags</Text>
            <View style={styles.chips}>
              {((user as any).vibe_tags as string[]).map((tag) => (
                <View key={tag} style={styles.vibeChip}>
                  <Text style={styles.vibeChipText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Phase 3/4 action row */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate("Leaderboard")}
            activeOpacity={0.85}
          >
            <Text style={styles.actionIcon}>🏆</Text>
            <Text style={styles.actionLabel}>Leaderboard</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate("Challenges")}
            activeOpacity={0.85}
          >
            <Text style={styles.actionIcon}>⚡</Text>
            <Text style={styles.actionLabel}>Challenges</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate("Analytics")}
            activeOpacity={0.85}
          >
            <Text style={styles.actionIcon}>📊</Text>
            <Text style={styles.actionLabel}>Analytics</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate("TravelMap")}
            activeOpacity={0.85}
          >
            <Text style={styles.actionIcon}>🗺️</Text>
            <Text style={styles.actionLabel}>Travel Map</Text>
          </TouchableOpacity>
        </View>

        {/* Location filter shortcut */}
        <TouchableOpacity
          style={styles.locationCard}
          onPress={() => navigation.navigate("LocationFilter")}
          activeOpacity={0.85}
        >
          <Ionicons name="map" size={22} color={colors.primary} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.locationTitle}>Location Filter</Text>
            <Text style={styles.locationSub}>Change the area you discover buddies in</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  inner: { padding: spacing.lg, paddingBottom: 40, gap: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 16 },
  title: { fontSize: fontSizes.xl, fontWeight: "900", color: colors.text },
  travelBanner: { backgroundColor: colors.accent + "33", borderRadius: radii.lg, padding: spacing.md, alignItems: "center", borderWidth: 1, borderColor: colors.accent + "66" },
  travelBannerText: { color: colors.accent, fontWeight: "700", fontSize: fontSizes.sm },
  avatarSection: { alignItems: "center", gap: 12 },
  avatarWrap: { position: "relative", width: 120, height: 120 },
  avatarRing: {
    position: "absolute",
    top: -3,
    bottom: -3,
    left: -3,
    right: -3,
    borderRadius: 64,
    zIndex: -1,
  },
  avatar: { width: 120, height: 120, borderRadius: 60, backgroundColor: colors.bgInput },
  name: { fontSize: fontSizes.xl, fontWeight: "900", color: colors.text },
  charBadge: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.bgCard, paddingHorizontal: 14, paddingVertical: 6, borderRadius: radii.full },
  charText: { fontSize: 13, color: colors.warning, fontWeight: "700" },
  statsRow: { flexDirection: "row", justifyContent: "center", gap: 32 },
  stat: { alignItems: "center", gap: 2 },
  statValue: { fontSize: fontSizes.lg, fontWeight: "900", color: colors.text },
  statLabel: { fontSize: 11, color: colors.textMuted },
  card: { backgroundColor: colors.bgCard, borderRadius: radii.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.border, gap: 12 },
  sectionTitle: { fontSize: fontSizes.sm, fontWeight: "700", color: colors.textSub, textTransform: "uppercase", letterSpacing: 1 },
  bio: { fontSize: fontSizes.md, color: colors.text, lineHeight: 24 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radii.full },
  chipText: { color: "#fff", fontWeight: "700", fontSize: fontSizes.sm },
  vibeChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radii.full, backgroundColor: colors.primary + "33", borderWidth: 1, borderColor: colors.primary + "66" },
  vibeChipText: { color: colors.primary, fontSize: fontSizes.sm, fontWeight: "700" },
  locationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  locationTitle: { fontSize: fontSizes.md, fontWeight: "700", color: colors.text },
  locationSub: { fontSize: 12, color: colors.textSub, marginTop: 2 },
  // XP & Boost
  xpHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  xpTotalText: { fontSize: fontSizes.sm, color: colors.warning, fontWeight: "800" },
  progressTrack: { height: 10, backgroundColor: colors.border, borderRadius: radii.full, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: radii.full, minWidth: 4 },
  progressLabelRow: { flexDirection: "row", justifyContent: "space-between" },
  progressLabel: { fontSize: 11, color: colors.textMuted },
  progressPct: { fontSize: 11, color: colors.primary, fontWeight: "700" },
  boostBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
  },
  boostBtnActive: { backgroundColor: colors.warning + "33", borderWidth: 1, borderColor: colors.warning },
  boostBtnText: { fontSize: fontSizes.md, fontWeight: "800", color: "#fff" },
  boostBtnTextActive: { color: colors.warning },
  // Badges
  badgeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.warning + "22",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.warning + "55",
  },
  badgeEmoji: { fontSize: 16 },
  badgeName: { fontSize: fontSizes.sm, color: colors.warning, fontWeight: "700" },
  // Action row
  actionRow: { flexDirection: "row", gap: 10 },
  actionBtn: {
    flex: 1,
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionIcon: { fontSize: 22 },
  actionLabel: { fontSize: 10, color: colors.textSub, fontWeight: "700", textAlign: "center" },
});
