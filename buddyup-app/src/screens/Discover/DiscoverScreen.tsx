import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
  Alert,
  Platform,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { observer } from "mobx-react-lite";
import Swiper from "react-native-deck-swiper";
import { api } from "@/services/api";
import { discoverStore, DiscoverUser } from "@/stores/discoverStore";
import { socialStore } from "@/stores/SocialStore";
import { premiumStore } from "@/stores/PremiumStore";
import { colors, spacing, radii, fontSizes, INTEREST_COLORS } from "@/theme";
import { ACTIVITY_TYPES } from "@/types";
import SkeletonCard from "@/components/SkeletonCard";
import EmptyState from "@/components/EmptyState";
import MatchModal from "./MatchModal";

const { height } = Dimensions.get("window");

export default observer(function DiscoverScreen({ navigation }: any) {
  const [matchModal, setMatchModal] = useState(false);
  const [matchedUser, setMatchedUser] = useState<DiscoverUser | null>(null);
  const [matchedMatchId, setMatchedMatchId] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const swiperRef = useRef<Swiper<DiscoverUser>>(null);

  useFocusEffect(
    React.useCallback(() => {
      discoverStore.fetchDiscover(selectedActivity ?? undefined);
    }, [selectedActivity])
  );

  const handleLike = async (user: DiscoverUser) => {
    try {
      const { data } = await api.post("/likes", { liked_id: user.id });
      if (data.is_match) {
        setMatchedUser(user);
        setMatchedMatchId(data.match_id ?? null);
        setMatchModal(true);
      }
    } catch {
      // ignore — swiped card is already gone
    }
    discoverStore.swipeRight();
  };

  const handlePass = async (user: DiscoverUser) => {
    try {
      await api.post("/passes", { passed_id: user.id });
    } catch {
      // ignore
    }
    discoverStore.swipeLeft();
  };

  const handleSuperConnect = async (userId: string) => {
    try {
      await socialStore.sendSuperConnect(userId);
      Alert.alert("⚡ Super Connect Sent!", "They'll be notified.");
    } catch (e: any) {
      if (e?.response?.status === 429) {
        Alert.alert("Limit Reached", "You've used all 5 super connects for today. Come back tomorrow!");
      } else {
        Alert.alert("Error", e?.response?.data?.error ?? "Failed to super connect");
      }
    }
  };

  const handleBlock = async (user: DiscoverUser) => {
    try {
      await api.post(`/users/${user.id}/block`);
      discoverStore.swipeLeft();
    } catch {
      Alert.alert("Error", "Failed to block user");
    }
  };

  const handleReport = (user: DiscoverUser) => {
    if (Platform.OS === "ios") {
      Alert.prompt(
        `Report ${user.display_name}`,
        "Describe why you are reporting this user",
        async (reason) => {
          if (!reason) return;
          try {
            await api.post(`/users/${user.id}/report`, { reason });
            Alert.alert("Reported", "Thank you for your report.");
            discoverStore.swipeLeft();
          } catch {
            Alert.alert("Error", "Failed to report user");
          }
        }
      );
    } else {
      Alert.alert(
        `Report ${user.display_name}`,
        "Report this user for inappropriate behavior?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Report",
            style: "destructive",
            onPress: async () => {
              try {
                await api.post(`/users/${user.id}/report`, { reason: "Inappropriate behavior" });
                Alert.alert("Reported", "Thank you for your report.");
                discoverStore.swipeLeft();
              } catch {
                Alert.alert("Error", "Failed to report user");
              }
            },
          },
        ]
      );
    }
  };

  const handleOverflow = (user: DiscoverUser) => {
    Alert.alert(user.display_name, "What would you like to do?", [
      { text: "🚫 Block", style: "destructive", onPress: () => handleBlock(user) },
      { text: "⚠️ Report", onPress: () => handleReport(user) },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const users = discoverStore.users.slice(discoverStore.currentIndex);

  const superConnectsLeft = Math.max(0, 5 - socialStore.dailySuperConnectsSent);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#0F0F1A", "#1A1A2E"]} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>BuddyUp</Text>
        <View style={styles.headerRight}>
          {superConnectsLeft === 0 && (
            <TouchableOpacity
              style={styles.buyMoreBtn}
              onPress={() => navigation.navigate("BuddyPass")}
            >
              <Text style={styles.buyMoreText}>Buy more ⚡</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => navigation.navigate("LocationFilter")}
            style={styles.filterBtn}
          >
            <Ionicons name="location" size={18} color={colors.primary} />
            <Text style={styles.filterText}>Filter</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Activity filter chips */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={["All", ...ACTIVITY_TYPES]}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.activityFilterRow}
        renderItem={({ item }) => {
          const active = item === "All" ? !selectedActivity : selectedActivity === item;
          return (
            <TouchableOpacity
              style={[styles.activityChip, active && { backgroundColor: colors.primary }]}
              onPress={() => setSelectedActivity(item === "All" ? null : item)}
            >
              <Text style={[styles.activityChipText, active && { color: "#fff" }]}>{item}</Text>
            </TouchableOpacity>
          );
        }}
      />

      {discoverStore.isLoading ? (
        <View style={styles.cardArea}>
          <SkeletonCard />
        </View>
      ) : users.length === 0 ? (
        <EmptyState
          icon="👀"
          title="No one nearby"
          subtitle="Try expanding your search radius or check back later"
          actionLabel="Expand Radius"
          onAction={() => {
            discoverStore.setFilter(
              discoverStore.filterLat ?? 28.6139,
              discoverStore.filterLng ?? 77.209,
              Math.min((discoverStore.filterRadius ?? 50) + 50, 500)
            );
            discoverStore.fetchDiscover();
          }}
        />
      ) : (
        <View style={styles.cardArea}>
          <Swiper
            ref={swiperRef}
            cards={users}
            keyExtractor={(u) => u.id}
            renderCard={(user) => <UserCard user={user} onSuperConnect={handleSuperConnect} remaining={superConnectsLeft} onOverflow={handleOverflow} />}
            onSwipedRight={(i) => handleLike(users[i])}
            onSwipedLeft={(i) => handlePass(users[i])}
            backgroundColor="transparent"
            stackSize={3}
            stackSeparation={12}
            animateOverlayLabelsOpacity
            overlayLabels={{
              left: {
                title: "NOPE",
                style: {
                  label: { backgroundColor: colors.error, color: "#fff", fontSize: 24, fontWeight: "900", borderRadius: radii.md, padding: 10 },
                  wrapper: { flexDirection: "column", alignItems: "flex-end", justifyContent: "flex-start", marginTop: 30, marginLeft: -30 },
                },
              },
              right: {
                title: "LIKE",
                style: {
                  label: { backgroundColor: colors.success, color: "#fff", fontSize: 24, fontWeight: "900", borderRadius: radii.md, padding: 10 },
                  wrapper: { flexDirection: "column", alignItems: "flex-start", justifyContent: "flex-start", marginTop: 30, marginLeft: 30 },
                },
              },
            }}
            cardVerticalMargin={8}
            cardHorizontalMargin={0}
          />

          {/* Action buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.passBtn}
              onPress={() => swiperRef.current?.swipeLeft()}
              activeOpacity={0.85}
            >
              <Ionicons name="close" size={32} color={colors.error} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.likeBtn}
              onPress={() => swiperRef.current?.swipeRight()}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[colors.primary, colors.secondary]}
                style={styles.likeBtnGrad}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="heart" size={32} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <MatchModal
        visible={matchModal}
        matchedUser={matchedUser}
        matchId={matchedMatchId}
        onSendMessage={(mId, userName) => {
          setMatchModal(false);
          navigation.navigate("Main", {
            screen: "Messages",
            params: { screen: "Chat", params: { matchId: mId, userName } },
          });
        }}
        onKeepSwiping={() => setMatchModal(false)}
      />
    </SafeAreaView>
  );
});

function UserCard({ user, onSuperConnect, remaining, onOverflow }: { user: DiscoverUser; onSuperConnect: (id: string) => void; remaining?: number; onOverflow: (user: DiscoverUser) => void }) {
  const compatScore = user.common_interests > 0
    ? Math.min(Math.round((user.common_interests / Math.max(user.interests.length, 1)) * 100), 99)
    : null;

  return (
    <View style={styles.card}>
      <Image
        source={{ uri: user.avatar?.image_url ?? `https://ui-avatars.com/api/?name=${user.display_name}` }}
        style={styles.avatarImage}
        resizeMode="cover"
      />
      <LinearGradient
        colors={["transparent", "rgba(15,15,26,0.95)"]}
        style={styles.cardOverlay}
      />
      {/* Distance badge */}
      <View style={styles.distanceBadge}>
        <Ionicons name="location" size={12} color={colors.accent} />
        <Text style={styles.distanceText}>{user.distance_km.toFixed(1)} km</Text>
      </View>
      {/* Compatibility badge */}
      {compatScore != null && (
        <View style={styles.compatBadge}>
          <Text style={styles.compatText}>{compatScore}% match</Text>
        </View>
      )}
      {/* Overflow menu button */}
      <TouchableOpacity style={styles.overflowBtn} onPress={() => onOverflow(user)}>
        <Text style={styles.overflowIcon}>⋮</Text>
      </TouchableOpacity>
      {/* Super Connect button */}
      <TouchableOpacity style={styles.superConnectBtn} onPress={() => onSuperConnect(user.id)}>
        <Text style={styles.superConnectIcon}>⚡</Text>
        {remaining !== undefined && (
          <Text style={styles.superConnectCount}>{remaining}</Text>
        )}
      </TouchableOpacity>

      <View style={styles.cardContent}>
        <Text style={styles.name}>{user.display_name}</Text>
        {user.bio ? <Text style={styles.bio} numberOfLines={2}>{user.bio}</Text> : null}
        {user.avatar && (
          <View style={styles.charBadge}>
            <Ionicons name="star" size={12} color={colors.warning} />
            <Text style={styles.charText}>{user.avatar.name} · {user.avatar.franchise}</Text>
          </View>
        )}
        <View style={styles.chips}>
          {user.interests.slice(0, 5).map((i) => (
            <View key={i} style={[styles.chip, { backgroundColor: INTEREST_COLORS[i] ?? colors.primary }]}>
              <Text style={styles.chipText}>{i}</Text>
            </View>
          ))}
        </View>
        {/* Vibe tags */}
        {(user as any).vibe_tags?.length > 0 && (
          <View style={styles.vibeTags}>
            {((user as any).vibe_tags as string[]).slice(0, 3).map((tag) => (
              <View key={tag} style={styles.vibeTag}>
                <Text style={styles.vibeTagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
        {user.common_interests > 0 && (
          <Text style={styles.common}>
            🤝 {user.common_interests} shared interest{user.common_interests > 1 ? "s" : ""}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  logo: { fontSize: fontSizes.xl, fontWeight: "900", color: colors.text },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  buyMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.warning + "33",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.warning + "66",
  },
  buyMoreText: { color: colors.warning, fontSize: 12, fontWeight: "800" },
  filterBtn: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: colors.bgCard, paddingHorizontal: 12, paddingVertical: 8, borderRadius: radii.full, borderWidth: 1, borderColor: colors.border },
  filterText: { color: colors.text, fontWeight: "600", fontSize: 13 },
  cardArea: { flex: 1, paddingHorizontal: spacing.lg },
  card: {
    height: height * 0.62,
    borderRadius: radii.xl,
    overflow: "hidden",
    backgroundColor: colors.bgCard,
    position: "relative",
  },
  avatarImage: { width: "100%", height: "100%", position: "absolute" },
  cardOverlay: { position: "absolute", bottom: 0, left: 0, right: 0, height: "55%" },
  distanceBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.full,
  },
  distanceText: { color: colors.accent, fontWeight: "700", fontSize: 12 },
  compatBadge: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: colors.success + "CC",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.full,
  },
  compatText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  overflowBtn: {
    position: "absolute",
    top: 52,
    left: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  overflowIcon: { color: "#fff", fontSize: 18, fontWeight: "900", lineHeight: 22 },
  cardContent: { position: "absolute", bottom: 0, left: 0, right: 0, padding: spacing.lg },
  name: { fontSize: fontSizes.xl, fontWeight: "900", color: "#fff", marginBottom: 4 },
  bio: { fontSize: fontSizes.sm, color: "rgba(255,255,255,0.8)", marginBottom: 8 },
  charBadge: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 10 },
  charText: { fontSize: 12, color: colors.warning, fontWeight: "600" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 8 },
  chip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: radii.full },
  chipText: { fontSize: 11, fontWeight: "700", color: "#fff" },
  common: { fontSize: 12, color: colors.accent, fontWeight: "700" },
  superConnectBtn: {
    position: "absolute",
    top: 52,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,179,71,0.85)",
    alignItems: "center",
    justifyContent: "center",
  },
  superConnectIcon: { fontSize: 18 },
  superConnectCount: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.error,
    fontSize: 9,
    color: "#fff",
    fontWeight: "900",
    textAlign: "center",
    lineHeight: 16,
  },
  vibeTags: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginBottom: 6 },
  vibeTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radii.full, backgroundColor: "rgba(255,255,255,0.15)", borderWidth: 1, borderColor: "rgba(255,255,255,0.25)" },
  vibeTagText: { fontSize: 10, color: "rgba(255,255,255,0.9)", fontWeight: "600" },
  activityFilterRow: { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm, gap: 8 },
  activityChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radii.full, backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border },
  activityChipText: { color: colors.textSub, fontSize: 11, fontWeight: "600", textTransform: "capitalize" },
  actions: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 40,
    paddingVertical: spacing.xl,
  },
  passBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.bgCard,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.error + "55",
    shadowColor: colors.error,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  likeBtn: { width: 80, height: 80, borderRadius: 40, overflow: "hidden", elevation: 12 },
  likeBtnGrad: { flex: 1, alignItems: "center", justifyContent: "center" },
});
