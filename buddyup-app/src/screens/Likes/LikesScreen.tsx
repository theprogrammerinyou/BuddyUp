import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "react-native-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { observer } from "mobx-react-lite";
import { api } from "@/services/api";
import { colors, spacing, radii, fontSizes, INTEREST_COLORS } from "@/theme";
import { User } from "@/stores/authStore";
import { chatStore } from "@/stores/chatStore";

type Tab = "liked_me" | "matches";

export default observer(function LikesScreen({ navigation }: any) {
  const [tab, setTab] = useState<Tab>("liked_me");
  const [likedMe, setLikedMe] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchLikedMe(), chatStore.fetchMatches()]);
      setLoading(false);
    };
    load();
  }, []);

  const fetchLikedMe = async () => {
    const { data } = await api.get("/likes/me");
    setLikedMe(data.users ?? []);
  };

  const list = tab === "liked_me" ? likedMe : chatStore.matches;

  const renderItem = ({ item }: { item: any }) => {
    const isMatch = tab === "matches";
    const user = isMatch ? item.other_user : item;
    const matchId = isMatch ? item.id : null;

    return (
      <TouchableOpacity
        style={styles.item}
        activeOpacity={0.85}
        onPress={() => {
          if (isMatch && matchId) {
            navigation.navigate("Messages", {
              screen: "Chat",
              params: { matchId, userName: user.display_name },
            });
          }
        }}
      >
        <View style={styles.avatarWrap}>
          <Image
            source={{ uri: user.avatar?.image_url ?? `https://ui-avatars.com/api/?name=${user.display_name}&background=6C63FF&color=fff` }}
            style={styles.avatar}
          />
          {isMatch && (
            <View style={styles.matchDot}>
              <Ionicons name="chatbubble" size={10} color="#fff" />
            </View>
          )}
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{user.display_name}</Text>
          <Text style={styles.sub} numberOfLines={1}>
            {user.avatar ? `${user.avatar.name} · ${user.avatar.franchise}` : ""}
          </Text>
          <View style={styles.chips}>
            {(user.interests ?? []).slice(0, 3).map((i: string) => (
              <View key={i} style={[styles.chip, { backgroundColor: INTEREST_COLORS[i] ?? colors.primary }]}>
                <Text style={styles.chipText}>{i}</Text>
              </View>
            ))}
          </View>
        </View>
        {isMatch && (
          <View style={styles.chatIcon}>
            <Ionicons name="chatbubbles" size={22} color={colors.primary} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#0F0F1A", "#1A1A2E"]} style={StyleSheet.absoluteFill} />
      <Text style={styles.title}>Connections</Text>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(["liked_me", "matches"] as Tab[]).map((t) => (
          <TouchableOpacity key={t} onPress={() => setTab(t)} style={[styles.tab, tab === t && styles.tabActive]}>
            <Ionicons
              name={t === "liked_me" ? "heart" : "people"}
              size={16}
              color={tab === t ? "#fff" : colors.textMuted}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.tabText, tab === t && { color: "#fff" }]}>
              {t === "liked_me" ? "Liked Me" : "Matches"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : list.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name={tab === "liked_me" ? "heart-outline" : "people-outline"} size={56} color={colors.textMuted} />
          <Text style={styles.emptyText}>
            {tab === "liked_me" ? "No likes yet — keep getting out there!" : "No matches yet — swipe more!"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={(item: any) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: spacing.md, gap: 12 }}
        />
      )}
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  title: { fontSize: fontSizes.xl, fontWeight: "900", color: colors.text, paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  tabs: { flexDirection: "row", marginHorizontal: spacing.lg, marginTop: 16, marginBottom: 8, gap: 8 },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: radii.md,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { color: colors.textMuted, fontWeight: "600", fontSize: fontSizes.sm },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarWrap: { position: "relative", marginRight: spacing.md },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.bgInput },
  matchDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.bgCard,
  },
  info: { flex: 1, gap: 4 },
  name: { fontSize: fontSizes.md, fontWeight: "800", color: colors.text },
  sub: { fontSize: 12, color: colors.textMuted },
  chips: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  chip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radii.full },
  chipText: { fontSize: 10, fontWeight: "700", color: "#fff" },
  chatIcon: { padding: 8 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, paddingHorizontal: spacing.xl },
  emptyText: { fontSize: fontSizes.sm, color: colors.textSub, textAlign: "center" },
});
