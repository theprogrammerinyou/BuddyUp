import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "react-native-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { observer } from "mobx-react-lite";
import { authStore } from "@/stores/authStore";
import { api } from "@/services/api";
import { colors, spacing, radii, fontSizes } from "@/theme";

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  display_name: string;
  level: number;
  total_xp: number;
  avatar_url?: string;
}

export default observer(function LeaderboardScreen({ navigation }: any) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/leaderboard", { params: { limit: 20 } });
        setEntries(Array.isArray(data) ? data : data.leaderboard ?? []);
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const currentUserId = authStore.user?.id;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#0F0F1A", "#1A1A2E"]} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>🏆 Leaderboard</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <View style={styles.loadingWrap}>
          {Array.from({ length: 6 }).map((_, i) => (
            <View key={i} style={styles.skeletonRow}>
              <View style={styles.skeletonRank} />
              <View style={styles.skeletonAvatar} />
              <View style={styles.skeletonInfo}>
                <View style={styles.skeletonName} />
                <View style={styles.skeletonSub} />
              </View>
              <View style={styles.skeletonXP} />
            </View>
          ))}
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.user_id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🏆</Text>
              <Text style={styles.emptyText}>No leaderboard data yet</Text>
            </View>
          }
          renderItem={({ item }) => {
            const isMe = item.user_id === currentUserId;
            return (
              <View style={[styles.row, isMe && styles.rowHighlight]}>
                <Text style={[styles.rank, item.rank <= 3 && styles.rankTop]}>
                  {item.rank === 1 ? "🥇" : item.rank === 2 ? "🥈" : item.rank === 3 ? "🥉" : `#${item.rank}`}
                </Text>
                <Image
                  source={{
                    uri:
                      item.avatar_url ??
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(item.display_name)}&background=6C63FF&color=fff&size=80`,
                  }}
                  style={styles.avatar}
                />
                <View style={styles.info}>
                  <Text style={styles.name} numberOfLines={1}>
                    {item.display_name}
                    {isMe ? " (You)" : ""}
                  </Text>
                  <View style={styles.levelBadge}>
                    <Text style={styles.levelText}>Lv {item.level}</Text>
                  </View>
                </View>
                <View style={styles.xpWrap}>
                  <Text style={styles.xpValue}>{item.total_xp.toLocaleString()}</Text>
                  <Text style={styles.xpLabel}>XP</Text>
                </View>
              </View>
            );
          }}
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
  list: { paddingHorizontal: spacing.lg, paddingBottom: 100, gap: 10 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  rowHighlight: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + "22",
  },
  rank: { width: 32, fontSize: fontSizes.md, fontWeight: "900", color: colors.textSub, textAlign: "center" },
  rankTop: { fontSize: 22 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.bgInput },
  info: { flex: 1, gap: 4 },
  name: { fontSize: fontSizes.sm, fontWeight: "800", color: colors.text },
  levelBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.primary + "33",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  levelText: { fontSize: 10, color: colors.primary, fontWeight: "700" },
  xpWrap: { alignItems: "flex-end" },
  xpValue: { fontSize: fontSizes.md, fontWeight: "900", color: colors.warning },
  xpLabel: { fontSize: 10, color: colors.textMuted, fontWeight: "600" },
  loadingWrap: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: 10 },
  skeletonRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: 12,
  },
  skeletonRank: { width: 32, height: 20, borderRadius: radii.sm, backgroundColor: colors.border },
  skeletonAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.border },
  skeletonInfo: { flex: 1, gap: 6 },
  skeletonName: { height: 14, width: "60%", borderRadius: radii.sm, backgroundColor: colors.border },
  skeletonSub: { height: 10, width: "35%", borderRadius: radii.sm, backgroundColor: colors.border },
  skeletonXP: { width: 44, height: 20, borderRadius: radii.sm, backgroundColor: colors.border },
  empty: { alignItems: "center", paddingTop: 60, gap: 8 },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: fontSizes.md, fontWeight: "700", color: colors.text },
});
