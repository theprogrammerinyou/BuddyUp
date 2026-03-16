import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "react-native-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { observer } from "mobx-react-lite";
import { api } from "@/services/api";
import { colors, spacing, radii, fontSizes } from "@/theme";
import { User } from "@/stores/authStore";
import { Match } from "@/stores/chatStore";
import SkeletonListItem from "@/components/SkeletonListItem";
import EmptyState from "@/components/EmptyState";
import { timeAgo } from "@/utils/time";

type LikeUser = User & { created_at?: string };

export default observer(function NotificationsScreen({ navigation }: any) {
  const [likedMe, setLikedMe] = useState<LikeUser[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [likesRes, matchesRes] = await Promise.all([
          api.get("/likes/me"),
          api.get("/matches"),
        ]);
        setLikedMe(likesRes.data.users ?? []);
        setMatches(matchesRes.data.matches ?? []);
      } catch {
        // silently fail — show empty state
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const hasNotifications = likedMe.length > 0 || matches.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#0F0F1A", "#1A1A2E"]} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>🔔 Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.skeletonWrap}>
          {[0, 1, 2, 3, 4].map((i) => (
            <SkeletonListItem key={i} />
          ))}
        </View>
      ) : !hasNotifications ? (
        <EmptyState
          icon="🔔"
          title="No notifications yet"
          subtitle="When someone likes you or you match, you'll see it here!"
          actionLabel="Start Swiping"
          onAction={() => navigation.navigate("Discover")}
        />
      ) : (
        <FlatList
          data={[]}
          keyExtractor={() => ""}
          renderItem={null}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <>
              {/* Who Liked You */}
              {likedMe.length > 0 && (
                <View>
                  <Text style={styles.sectionHeader}>Who Liked You</Text>
                  {likedMe.map((user) => (
                    <View key={user.id} style={styles.item}>
                      <Image
                        source={{
                          uri:
                            user.avatar?.image_url ??
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              user.display_name
                            )}&background=FF3366&color=fff`,
                        }}
                        style={styles.avatar}
                      />
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemName}>{user.display_name}</Text>
                        <Text style={styles.itemSub}>
                          <Text style={styles.heartIcon}>❤️ </Text>liked you
                          {user.created_at ? (
                            <Text style={styles.timeText}>  ·  {timeAgo(user.created_at)}</Text>
                          ) : null}
                        </Text>
                      </View>
                      <View style={styles.likeBadge}>
                        <Ionicons name="heart" size={16} color={colors.primary} />
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Recent Matches */}
              {matches.length > 0 && (
                <View style={likedMe.length > 0 ? styles.sectionGap : undefined}>
                  <Text style={styles.sectionHeader}>Recent Matches</Text>
                  {matches.map((match) => (
                    <TouchableOpacity
                      key={match.id}
                      style={styles.item}
                      activeOpacity={0.85}
                      onPress={() =>
                        navigation.navigate("Messages", {
                          screen: "Chat",
                          params: {
                            matchId: match.id,
                            userName: match.other_user.display_name,
                          },
                        })
                      }
                    >
                      <Image
                        source={{
                          uri:
                            match.other_user.avatar?.image_url ??
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              match.other_user.display_name
                            )}&background=6C63FF&color=fff`,
                        }}
                        style={styles.avatar}
                      />
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemName}>{match.other_user.display_name}</Text>
                        <Text style={styles.itemSub}>
                          <Text style={styles.matchIcon}>🎉 </Text>You matched!
                          {match.created_at ? (
                            <Text style={styles.timeText}>  ·  {timeAgo(match.created_at)}</Text>
                          ) : null}
                        </Text>
                      </View>
                      <Ionicons name="chatbubbles" size={20} color={colors.primary} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </>
          }
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
  backBtn: { width: 40 },
  title: { fontSize: fontSizes.lg, fontWeight: "900", color: colors.text },
  skeletonWrap: { padding: spacing.md, gap: 12 },
  listContent: { padding: spacing.md, paddingBottom: 40 },
  sectionHeader: {
    fontSize: fontSizes.sm - 1,
    fontWeight: "700",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 4,
  },
  sectionGap: { marginTop: 20 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
    gap: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.bgInput,
  },
  itemInfo: { flex: 1, gap: 2 },
  itemName: { fontSize: fontSizes.md, fontWeight: "800", color: colors.text },
  itemSub: { fontSize: 13, color: colors.textSub },
  heartIcon: { fontSize: 12 },
  matchIcon: { fontSize: 12 },
  timeText: { color: colors.textMuted, fontSize: 12 },
  likeBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary + "22",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.primary + "55",
  },
});
