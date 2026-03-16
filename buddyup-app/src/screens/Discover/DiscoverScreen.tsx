import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  Image,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "react-native-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { observer } from "mobx-react-lite";
import { api } from "@/services/api";
import { discoverStore, DiscoverUser } from "@/stores/discoverStore";
import { colors, spacing, radii, fontSizes, INTEREST_COLORS } from "@/theme";

const { width, height } = Dimensions.get("window");

export default observer(function DiscoverScreen({ navigation }: any) {
  const [matchModal, setMatchModal] = useState(false);
  const [matchedUser, setMatchedUser] = useState<DiscoverUser | null>(null);
  const [matchedMatchId, setMatchedMatchId] = useState<string | null>(null);
  const translateX = new Animated.Value(0);

  useFocusEffect(
    React.useCallback(() => {
      discoverStore.fetchDiscover();
    }, [])
  );

  const user = discoverStore.currentUser;

  const handleLike = async () => {
    if (!user) return;
    try {
      const { data } = await api.post("/likes", { liked_id: user.id });
      if (data.is_match) {
        setMatchedUser(user);
        setMatchedMatchId(data.match_id ?? null);
        setMatchModal(true);
      }
    } catch (e) {
      Alert.alert("Error liking user");
    }
    discoverStore.swipeRight();
  };

  const handlePass = () => {
    discoverStore.swipeLeft();
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#0F0F1A", "#1A1A2E"]} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>BuddyUp</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("LocationFilter")}
          style={styles.filterBtn}
        >
          <Ionicons name="location" size={18} color={colors.primary} />
          <Text style={styles.filterText}>Filter</Text>
        </TouchableOpacity>
      </View>

      {discoverStore.isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.emptyText}>Finding buddies near you...</Text>
        </View>
      ) : !user ? (
        <View style={styles.center}>
          <Ionicons name="people-outline" size={64} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No more buddies!</Text>
          <Text style={styles.emptyText}>Check back soon or expand your location filter</Text>
          <TouchableOpacity style={styles.refreshBtn} onPress={() => discoverStore.fetchDiscover()}>
            <Text style={styles.refreshText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.cardArea}>
          <View style={styles.card}>
            {/* Avatar */}
            <Image
              source={{ uri: user.avatar?.image_url ?? "https://ui-avatars.com/api/?name=" + user.display_name }}
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

            <View style={styles.cardContent}>
              <Text style={styles.name}>{user.display_name}</Text>
              {user.bio ? <Text style={styles.bio} numberOfLines={2}>{user.bio}</Text> : null}
              {user.avatar && (
                <View style={styles.charBadge}>
                  <Ionicons name="star" size={12} color={colors.warning} />
                  <Text style={styles.charText}>{user.avatar.name} · {user.avatar.franchise}</Text>
                </View>
              )}
              {/* Interests */}
              <View style={styles.chips}>
                {user.interests.slice(0, 5).map((i) => (
                  <View key={i} style={[styles.chip, { backgroundColor: INTEREST_COLORS[i] ?? colors.primary }]}>
                    <Text style={styles.chipText}>{i}</Text>
                  </View>
                ))}
              </View>
              {user.common_interests > 0 && (
                <Text style={styles.common}>
                  🤝 {user.common_interests} shared interest{user.common_interests > 1 ? "s" : ""}
                </Text>
              )}
            </View>
          </View>

          {/* Action buttons */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.passBtn} onPress={handlePass} activeOpacity={0.85}>
              <Ionicons name="close" size={32} color={colors.error} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.likeBtn} onPress={handleLike} activeOpacity={0.85}>
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

      {/* Match Modal */}
      <Modal visible={matchModal} transparent animationType="fade">
        <View style={styles.modalBg}>
          <LinearGradient colors={[colors.primary + "CC", colors.secondary + "CC"]} style={styles.modalCard}>
            <Text style={styles.matchEmoji}>🎉</Text>
            <Text style={styles.matchTitle}>It's a Match!</Text>
            <Text style={styles.matchSub}>
              You and <Text style={{ fontWeight: "800" }}>{matchedUser?.display_name}</Text> both liked each other!
            </Text>
            <TouchableOpacity
              style={styles.chatBtn}
              onPress={() => {
                setMatchModal(false);
                if (matchedMatchId && matchedUser) {
                  navigation.navigate("Main", {
                    screen: "Messages",
                    params: { screen: "Chat", params: { matchId: matchedMatchId, userName: matchedUser.display_name } },
                  });
                } else {
                  navigation.navigate("Messages");
                }
              }}
            >
              <Text style={styles.chatBtnText}>Start Chatting</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setMatchModal(false)}>
              <Text style={styles.modalClose}>Keep swiping</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </Modal>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  logo: { fontSize: fontSizes.xl, fontWeight: "900", color: colors.text },
  filterBtn: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: colors.bgCard, paddingHorizontal: 12, paddingVertical: 8, borderRadius: radii.full, borderWidth: 1, borderColor: colors.border },
  filterText: { color: colors.text, fontWeight: "600", fontSize: 13 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  emptyTitle: { fontSize: fontSizes.lg, fontWeight: "800", color: colors.text },
  emptyText: { fontSize: fontSizes.sm, color: colors.textSub, textAlign: "center", paddingHorizontal: spacing.xl },
  refreshBtn: { backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: radii.full, marginTop: 8 },
  refreshText: { color: "#fff", fontWeight: "700" },
  cardArea: { flex: 1, paddingHorizontal: spacing.lg },
  card: {
    height: height * 0.65,
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
  cardContent: { position: "absolute", bottom: 0, left: 0, right: 0, padding: spacing.lg },
  name: { fontSize: fontSizes.xl, fontWeight: "900", color: "#fff", marginBottom: 4 },
  bio: { fontSize: fontSizes.sm, color: "rgba(255,255,255,0.8)", marginBottom: 8 },
  charBadge: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 10 },
  charText: { fontSize: 12, color: colors.warning, fontWeight: "600" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 8 },
  chip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: radii.full },
  chipText: { fontSize: 11, fontWeight: "700", color: "#fff" },
  common: { fontSize: 12, color: colors.accent, fontWeight: "700" },
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
  modalBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", alignItems: "center", justifyContent: "center" },
  modalCard: { margin: 24, borderRadius: radii.xl, padding: 40, alignItems: "center", width: width - 48 },
  matchEmoji: { fontSize: 64, marginBottom: 16 },
  matchTitle: { fontSize: fontSizes.xxl, fontWeight: "900", color: "#fff", marginBottom: 8 },
  matchSub: { fontSize: fontSizes.md, color: "rgba(255,255,255,0.9)", textAlign: "center", marginBottom: 32 },
  chatBtn: { backgroundColor: "rgba(255,255,255,0.25)", paddingVertical: 16, paddingHorizontal: 40, borderRadius: radii.full, marginBottom: 16 },
  chatBtnText: { color: "#fff", fontWeight: "800", fontSize: fontSizes.md },
  modalClose: { color: "rgba(255,255,255,0.7)", fontSize: fontSizes.sm },
});
