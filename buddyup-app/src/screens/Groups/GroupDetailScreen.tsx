import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { LinearGradient } from "react-native-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { observer } from "mobx-react-lite";
import { apiService } from "@/services/api";
import { groupStore } from "@/stores/GroupStore";
import { authStore } from "@/stores/authStore";
import { colors, spacing, radii, fontSizes } from "@/theme";
import { Group } from "@/types";

export default observer(function GroupDetailScreen({ route, navigation }: any) {
  const { groupId } = route.params;
  const [group, setGroup] = useState<Group | null>(groupStore.selectedGroup);
  const [members, setMembers] = useState<any[]>([]);

  useEffect(() => {
    loadGroup();
  }, [groupId]);

  const loadGroup = async () => {
    try {
      const [groupData, memberData] = await Promise.all([
          apiService.getGroup(groupId).then((r) => r.data.group),
          groupStore.fetchGroupMembers(groupId),
        ]);
      setGroup(groupData);
      setMembers(memberData);
    } catch (e) {
      Alert.alert("Error", "Could not load group");
    }
  };

  const handleJoinLeave = async () => {
    if (!group) return;
    try {
      if (group.is_member) {
        await groupStore.leaveGroup(group.id);
        setGroup({ ...group, is_member: false, member_count: Math.max((group.member_count ?? 1) - 1, 0) });
      } else {
        await groupStore.joinGroup(group.id);
        setGroup({ ...group, is_member: true, member_count: (group.member_count ?? 0) + 1 });
      }
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.error ?? "Something went wrong");
    }
  };

  if (!group) return null;
  const isCreator = authStore.user?.id === group.creator_id;
  const displayedMembers = members.slice(0, 8);
  const extraCount = Math.max(members.length - 8, 0);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#0F0F1A", "#1A1A2E"]} style={StyleSheet.absoluteFill} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          {isCreator && (
            <TouchableOpacity
              onPress={() => navigation.navigate("CreateGroup", { groupId: group.id, editMode: true, group })}
            >
              <Ionicons name="create-outline" size={24} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Group info */}
        <View style={styles.groupInfo}>
          <View style={styles.activityBadge}>
            <Text style={styles.activityText}>{group.activity_type}</Text>
          </View>
          <Text style={styles.groupName}>{group.name}</Text>
          {group.description ? (
            <Text style={styles.groupDesc}>{group.description}</Text>
          ) : null}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Ionicons name="people" size={16} color={colors.accent} />
              <Text style={styles.statText}>{group.member_count ?? 0} members</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name={group.is_public ? "globe" : "lock-closed"} size={16} color={colors.textMuted} />
              <Text style={styles.statText}>{group.is_public ? "Public" : "Private"}</Text>
            </View>
          </View>
        </View>

        {/* Members */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Members</Text>
          <View style={styles.membersRow}>
            {displayedMembers.map((m) => (
              <View key={m.id} style={styles.memberAvatar}>
                <Image
                  source={{ uri: `https://ui-avatars.com/api/?name=${m.display_name}&size=48&background=6C63FF&color=fff` }}
                  style={styles.avatarImg}
                />
              </View>
            ))}
            {extraCount > 0 && (
              <View style={[styles.memberAvatar, styles.extraBadge]}>
                <Text style={styles.extraText}>+{extraCount}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Join/Leave button */}
        {!isCreator && (
          <TouchableOpacity
            style={[styles.actionBtn, group.is_member && styles.leaveBtn]}
            onPress={handleJoinLeave}
          >
            <Text style={styles.actionBtnText}>{group.is_member ? "Leave Group" : "Join Group"}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  backBtn: { padding: 4 },
  groupInfo: { padding: spacing.lg, gap: 10 },
  activityBadge: { alignSelf: "flex-start", paddingHorizontal: 14, paddingVertical: 6, borderRadius: radii.full, backgroundColor: colors.primary },
  activityText: { color: "#fff", fontSize: 12, fontWeight: "700", textTransform: "capitalize" },
  groupName: { fontSize: fontSizes.xl, fontWeight: "900", color: colors.text },
  groupDesc: { fontSize: fontSizes.md, color: colors.textSub, lineHeight: 22 },
  statsRow: { flexDirection: "row", gap: 20, marginTop: 4 },
  stat: { flexDirection: "row", alignItems: "center", gap: 6 },
  statText: { fontSize: fontSizes.sm, color: colors.textMuted },
  section: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  sectionTitle: { fontSize: fontSizes.sm, fontWeight: "700", color: colors.textSub, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 },
  membersRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  memberAvatar: { width: 48, height: 48, borderRadius: 24, overflow: "hidden" },
  avatarImg: { width: 48, height: 48 },
  extraBadge: { backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  extraText: { fontSize: 12, fontWeight: "700", color: colors.textMuted },
  actionBtn: { marginHorizontal: spacing.lg, marginBottom: spacing.xl, paddingVertical: 16, borderRadius: radii.lg, backgroundColor: colors.primary, alignItems: "center" },
  leaveBtn: { backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.error },
  actionBtnText: { color: "#fff", fontSize: fontSizes.md, fontWeight: "800" },
});
