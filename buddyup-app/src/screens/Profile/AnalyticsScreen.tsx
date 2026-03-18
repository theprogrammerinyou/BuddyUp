import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { observer } from "mobx-react-lite";
import { authStore } from "@/stores/authStore";
import { xpStore } from "@/stores/XPStore";
import { colors, spacing, radii, fontSizes } from "@/theme";

export default observer(function AnalyticsScreen({ navigation }: any) {
  const user = authStore.user;

  useEffect(() => {
    xpStore.fetchXP();
  }, []);

  // Derive top 3 activities from user interests as a proxy for "most compatible"
  const topActivities: string[] = (user?.interests ?? []).slice(0, 3);

  const xpProgress = xpStore.totalXP % 100;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#0F0F1A", "#1A1A2E"]} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>📊 Analytics</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.inner} showsVerticalScrollIndicator={false}>
        {/* XP Summary */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>XP & Level</Text>
          <View style={styles.statGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{xpStore.totalXP.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Total XP</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{xpStore.level}</Text>
              <Text style={styles.statLabel}>Level</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{xpStore.recentEvents.length}</Text>
              <Text style={styles.statLabel}>Recent Events</Text>
            </View>
          </View>
          {/* XP Progress Bar */}
          <View style={styles.progressSection}>
            <View style={styles.progressLabelRow}>
              <Text style={styles.progressLabel}>Progress to Level {xpStore.level + 1}</Text>
              <Text style={styles.progressPct}>{xpProgress}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <LinearGradient
                colors={[colors.primary, colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${xpProgress}%` }]}
              />
            </View>
          </View>
        </View>

        {/* Activity Stats */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Activity</Text>
          <View style={styles.statGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>—</Text>
              <Text style={styles.statLabel}>Total Matches</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>—</Text>
              <Text style={styles.statLabel}>Messages Sent</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{xpStore.challenges.filter((c) => c.completed).length}</Text>
              <Text style={styles.statLabel}>Challenges Done</Text>
            </View>
          </View>
        </View>

        {/* Most Compatible Activities */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Most Compatible Activity</Text>
          {topActivities.length > 0 ? (
            <View style={styles.activityList}>
              {topActivities.map((activity, index) => (
                <View key={activity} style={styles.activityRow}>
                  <View style={styles.activityRank}>
                    <Text style={styles.activityRankText}>#{index + 1}</Text>
                  </View>
                  <Text style={styles.activityName}>{activity}</Text>
                  <View style={styles.compatBar}>
                    <LinearGradient
                      colors={[colors.primary, colors.secondary]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[
                        styles.compatBarFill,
                        { width: `${90 - index * 20}%` },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noDataText}>
              Add interests to your profile to see compatibility insights.
            </Text>
          )}
        </View>

        {/* Recent XP Events */}
        {xpStore.recentEvents.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Recent XP Events</Text>
            {xpStore.recentEvents.slice(0, 5).map((event: any, i: number) => (
              <View key={i} style={styles.eventRow}>
                <Text style={styles.eventDescription}>
                  {event.description ?? event.event_type ?? "XP Event"}
                </Text>
                <Text style={styles.eventXP}>+{event.xp_amount ?? event.amount ?? 0} XP</Text>
              </View>
            ))}
          </View>
        )}
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
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  title: { fontSize: fontSizes.lg, fontWeight: "900", color: colors.text },
  inner: { padding: spacing.lg, paddingBottom: 60, gap: 16 },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 14,
  },
  sectionTitle: {
    fontSize: fontSizes.sm,
    fontWeight: "700",
    color: colors.textSub,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  statGrid: { flexDirection: "row", gap: 10 },
  statCard: {
    flex: 1,
    backgroundColor: colors.bgInput,
    borderRadius: radii.md,
    padding: spacing.sm,
    alignItems: "center",
    gap: 4,
  },
  statValue: { fontSize: fontSizes.lg, fontWeight: "900", color: colors.text },
  statLabel: { fontSize: 10, color: colors.textMuted, textAlign: "center" },
  progressSection: { gap: 6 },
  progressLabelRow: { flexDirection: "row", justifyContent: "space-between" },
  progressLabel: { fontSize: 12, color: colors.textSub },
  progressPct: { fontSize: 12, color: colors.primary, fontWeight: "700" },
  progressTrack: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: radii.full,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: radii.full, minWidth: 4 },
  activityList: { gap: 12 },
  activityRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  activityRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary + "33",
    alignItems: "center",
    justifyContent: "center",
  },
  activityRankText: { fontSize: 11, color: colors.primary, fontWeight: "800" },
  activityName: { width: 80, fontSize: fontSizes.sm, color: colors.text, fontWeight: "700" },
  compatBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.border,
    borderRadius: radii.full,
    overflow: "hidden",
  },
  compatBarFill: { height: "100%", borderRadius: radii.full },
  noDataText: { fontSize: fontSizes.sm, color: colors.textMuted },
  eventRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  eventDescription: { fontSize: fontSizes.sm, color: colors.textSub, flex: 1 },
  eventXP: { fontSize: fontSizes.sm, color: colors.warning, fontWeight: "800" },
});
