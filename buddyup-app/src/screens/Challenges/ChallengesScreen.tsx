import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "react-native-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { observer } from "mobx-react-lite";
import { xpStore } from "@/stores/XPStore";
import { colors, spacing, radii, fontSizes } from "@/theme";

function formatDeadline(dateStr: string | undefined) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default observer(function ChallengesScreen({ navigation }: any) {
  useEffect(() => {
    xpStore.fetchChallenges();
  }, []);

  const handleComplete = async (challenge: any) => {
    if (challenge.completed) return;
    try {
      const data = await xpStore.completeChallenge(challenge.id);
      const xpAwarded = data?.xp_awarded ?? challenge.xp_reward ?? 0;
      Alert.alert(
        "✅ Challenge Completed!",
        `You earned ${xpAwarded} XP!`,
        [{ text: "Awesome!" }]
      );
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.error ?? "Failed to complete challenge");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#0F0F1A", "#1A1A2E"]} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>⚡ Challenges</Text>
        <View style={{ width: 40 }} />
      </View>

      {xpStore.isLoading && xpStore.challenges.length === 0 ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={xpStore.challenges}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>⚡</Text>
              <Text style={styles.emptyText}>No challenges available</Text>
              <Text style={styles.emptySub}>Check back soon!</Text>
            </View>
          }
          renderItem={({ item: challenge }) => (
            <View style={[styles.card, challenge.completed && styles.cardCompleted]}>
              <View style={styles.cardTop}>
                <View style={styles.cardInfo}>
                  <Text style={styles.challengeTitle} numberOfLines={2}>
                    {challenge.title}
                  </Text>
                  {challenge.description ? (
                    <Text style={styles.challengeDesc} numberOfLines={3}>
                      {challenge.description}
                    </Text>
                  ) : null}
                </View>
                {challenge.completed && (
                  <View style={styles.doneCircle}>
                    <Ionicons name="checkmark" size={20} color="#fff" />
                  </View>
                )}
              </View>

              <View style={styles.cardBottom}>
                <View style={styles.metaRow}>
                  <View style={styles.xpBadge}>
                    <Text style={styles.xpText}>+{challenge.xp_reward ?? 0} XP</Text>
                  </View>
                  {challenge.ends_at ? (
                    <View style={styles.deadlineRow}>
                      <Ionicons name="time-outline" size={13} color={colors.textMuted} />
                      <Text style={styles.deadlineText}>{formatDeadline(challenge.ends_at)}</Text>
                    </View>
                  ) : null}
                </View>

                <TouchableOpacity
                  style={[styles.completeBtn, challenge.completed && styles.completeBtnDone]}
                  onPress={() => handleComplete(challenge)}
                  disabled={challenge.completed}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.completeBtnText, challenge.completed && styles.completeBtnTextDone]}>
                    {challenge.completed ? "Completed ✓" : "Complete ✓"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
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
  loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 100, gap: 12 },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  cardCompleted: { borderColor: colors.success + "66", backgroundColor: colors.success + "11" },
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  cardInfo: { flex: 1, gap: 4 },
  challengeTitle: { fontSize: fontSizes.md, fontWeight: "800", color: colors.text },
  challengeDesc: { fontSize: fontSizes.sm, color: colors.textSub, lineHeight: 20 },
  doneCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.success,
    alignItems: "center",
    justifyContent: "center",
  },
  cardBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  xpBadge: {
    backgroundColor: colors.warning + "33",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.full,
  },
  xpText: { fontSize: 12, color: colors.warning, fontWeight: "800" },
  deadlineRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  deadlineText: { fontSize: 11, color: colors.textMuted },
  completeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
  },
  completeBtnDone: { backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.success + "66" },
  completeBtnText: { fontSize: 13, color: "#fff", fontWeight: "700" },
  completeBtnTextDone: { color: colors.success },
  empty: { alignItems: "center", paddingTop: 60, gap: 8 },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: fontSizes.md, fontWeight: "700", color: colors.text },
  emptySub: { fontSize: fontSizes.sm, color: colors.textMuted },
});
