import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { observer } from "mobx-react-lite";
import { groupStore } from "@/stores/GroupStore";
import { colors, spacing, radii, fontSizes } from "@/theme";
import { ACTIVITY_TYPES } from "@/types";
import { Group } from "@/types";

const ACTIVITY_COLORS: Record<string, string> = {
  gym: "#FF4B4B",
  coding: "#00F2FE",
  hiking: "#00D2FF",
  gaming: "#BD34FE",
  sports: "#00D2FF",
  music: "#FF9A9E",
  travel: "#FFB347",
  food: "#F8CA24",
  arts: "#FF3366",
  fitness: "#00E676",
};

export default observer(function GroupsListScreen({ navigation }: any) {
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    groupStore.fetchGroups(selectedActivity ?? undefined);
  }, [selectedActivity]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await groupStore.fetchGroups(selectedActivity ?? undefined);
    } finally {
      setRefreshing(false);
    }
  };

  const handleJoin = async (group: Group) => {
    try {
      if (group.is_member) {
        await groupStore.leaveGroup(group.id);
      } else {
        await groupStore.joinGroup(group.id);
      }
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.error ?? "Something went wrong");
    }
  };

  // Sort sponsored groups to the top
  const sortedGroups = [...groupStore.groups].sort((a, b) => {
    const aSponsored = (a as any).is_sponsored || (a as any).sponsor_name ? 1 : 0;
    const bSponsored = (b as any).is_sponsored || (b as any).sponsor_name ? 1 : 0;
    return bSponsored - aSponsored;
  });

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#0F0F1A", "#1A1A2E"]} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <Text style={styles.title}>Groups</Text>
        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => navigation.navigate("CreateGroup")}
        >
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Activity filter chips */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={["All", ...ACTIVITY_TYPES]}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.filterRow}
        renderItem={({ item }) => {
          const active = item === "All" ? !selectedActivity : selectedActivity === item;
          return (
            <TouchableOpacity
              style={[styles.chip, active && { backgroundColor: colors.primary }]}
              onPress={() => setSelectedActivity(item === "All" ? null : item)}
            >
              <Text style={[styles.chipText, active && { color: "#fff" }]}>{item}</Text>
            </TouchableOpacity>
          );
        }}
      />

      <FlatList
        data={sortedGroups}
        keyExtractor={(g) => g.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyText}>No groups yet</Text>
            <Text style={styles.emptySub}>Create one and invite your buddies!</Text>
          </View>
        }
        renderItem={({ item: group }) => {
          const isSponsored = (group as any).is_sponsored || !!(group as any).sponsor_name;
          return (
            <TouchableOpacity
              style={[styles.card, isSponsored && styles.cardSponsored]}
              onPress={() => {
                groupStore.setSelectedGroup(group);
                navigation.navigate("GroupDetail", { groupId: group.id });
              }}
              activeOpacity={0.85}
            >
              <View style={styles.cardTop}>
                <View style={[styles.activityBadge, { backgroundColor: ACTIVITY_COLORS[group.activity_type] ?? colors.primary }]}>
                  <Text style={styles.activityText}>{group.activity_type}</Text>
                </View>
                <View style={styles.cardTopRight}>
                  {isSponsored && (
                    <View style={styles.sponsoredBadge}>
                      <Text style={styles.sponsoredText}>
                        {(group as any).sponsor_name ? `✦ ${(group as any).sponsor_name}` : "✦ Sponsored"}
                      </Text>
                    </View>
                  )}
                  {group.is_public ? null : (
                    <Ionicons name="lock-closed" size={14} color={colors.textMuted} />
                  )}
                </View>
              </View>
              <Text style={styles.groupName} numberOfLines={1}>{group.name}</Text>
              {group.description ? (
                <Text style={styles.groupDesc} numberOfLines={2}>{group.description}</Text>
              ) : null}
              <View style={styles.cardBottom}>
                <View style={styles.memberRow}>
                  <Ionicons name="people" size={14} color={colors.textMuted} />
                  <Text style={styles.memberText}>{group.member_count ?? 0} / {group.max_members}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.joinBtn, group.is_member && styles.joinedBtn]}
                  onPress={() => handleJoin(group)}
                >
                  <Text style={[styles.joinText, group.is_member && styles.joinedText]}>
                    {group.is_member ? "Joined" : "Join"}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  title: { fontSize: fontSizes.xl, fontWeight: "900", color: colors.text },
  createBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  filterRow: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md, gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radii.full, backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border, alignSelf: "flex-start" },
  chipText: { color: colors.textSub, fontSize: fontSizes.sm, fontWeight: "600", textTransform: "capitalize" },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 100, gap: 12 },
  card: { backgroundColor: colors.bgCard, borderRadius: radii.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  cardSponsored: { borderColor: colors.warning, backgroundColor: colors.warning + "0D" },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  cardTopRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  sponsoredBadge: {
    backgroundColor: colors.warning,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.full,
  },
  sponsoredText: { color: "#000", fontSize: 10, fontWeight: "900" },
  activityBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radii.full },
  activityText: { color: "#fff", fontSize: 11, fontWeight: "700", textTransform: "capitalize" },
  groupName: { fontSize: fontSizes.md, fontWeight: "800", color: colors.text, marginBottom: 4 },
  groupDesc: { fontSize: fontSizes.sm, color: colors.textSub, marginBottom: 12 },
  cardBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  memberRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  memberText: { fontSize: 12, color: colors.textMuted },
  joinBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: radii.full, backgroundColor: colors.primary },
  joinedBtn: { backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.primary },
  joinText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  joinedText: { color: colors.primary },
  empty: { alignItems: "center", paddingTop: 60, gap: 8 },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: fontSizes.md, fontWeight: "700", color: colors.text },
  emptySub: { fontSize: fontSizes.sm, color: colors.textMuted },
});
