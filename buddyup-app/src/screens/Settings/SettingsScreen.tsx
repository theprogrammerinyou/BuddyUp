import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
} from "react-native";
import { LinearGradient } from "react-native-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { observer } from "mobx-react-lite";
import { authStore } from "@/stores/authStore";
import { socialStore } from "@/stores/SocialStore";
import { premiumStore } from "@/stores/PremiumStore";
import { colors, spacing, radii, fontSizes } from "@/theme";
import { VIBE_TAGS } from "@/types";

export default observer(function SettingsScreen({ navigation }: any) {
  const [vibeTagModal, setVibeTagModal] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>(socialStore.vibeTags);

  useEffect(() => {
    premiumStore.fetchSubscription();
  }, []);

  const handleGhostMode = async (isDiscoverable: boolean) => {
    if (!premiumStore.isPremium) {
      navigation.navigate("BuddyPass");
      return;
    }
    try {
      await socialStore.setGhostMode(isDiscoverable);
    } catch {
      Alert.alert("Error", "Failed to update ghost mode");
    }
  };

  const handleTravelMode = async () => {
    if (!premiumStore.isPremium) {
      navigation.navigate("BuddyPass");
      return;
    }
    Alert.prompt(
      "Set Travel Location",
      "Enter latitude,longitude (e.g. 40.7128,-74.0060)",
      async (input) => {
        if (!input) return;
        const parts = input.split(",").map((s) => parseFloat(s.trim()));
        if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) {
          Alert.alert("Error", "Invalid format");
          return;
        }
        try {
          await socialStore.setTravelMode(parts[0], parts[1], 24);
        } catch {
          Alert.alert("Error", "Failed to set travel mode");
        }
      }
    );
  };

  const handleClearTravelMode = async () => {
    try {
      await socialStore.clearTravelMode();
    } catch {
      Alert.alert("Error", "Failed to clear travel mode");
    }
  };

  const toggleVibeTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : prev.length < 5 ? [...prev, tag] : prev
    );
  };

  const saveVibeTags = async () => {
    try {
      await socialStore.setVibeTags(selectedTags);
      setVibeTagModal(false);
    } catch {
      Alert.alert("Error", "Failed to save vibe tags");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#0F0F1A", "#1A1A2E"]} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Ghost Mode */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>
          <View style={styles.row}>
            <View style={styles.rowInfo}>
              <Ionicons name="eye-off-outline" size={22} color={colors.primary} />
              <View>
                <Text style={styles.rowLabel}>Ghost Mode</Text>
                <Text style={styles.rowSub}>Hide yourself from discovery</Text>
              </View>
            </View>
            {premiumStore.isPremium ? (
              <Switch
                value={!socialStore.isGhostMode}
                onValueChange={handleGhostMode}
                trackColor={{ true: colors.primary, false: colors.border }}
                thumbColor="#fff"
              />
            ) : (
              <TouchableOpacity
                style={styles.premiumGate}
                onPress={() => navigation.navigate("BuddyPass")}
              >
                <Ionicons name="lock-closed" size={14} color={colors.warning} />
                <Text style={styles.premiumGateText}>BuddyPass</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Travel Mode */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Travel</Text>
          <View style={styles.row}>
            <View style={styles.rowInfo}>
              <Ionicons name="airplane-outline" size={22} color={colors.accent} />
              <View>
                <Text style={styles.rowLabel}>Travel Mode</Text>
                <Text style={styles.rowSub}>
                  {socialStore.isTravelModeActive ? "🌍 Active" : "Discover people at a different location"}
                </Text>
              </View>
            </View>
            {premiumStore.isPremium ? (
              <View style={styles.travelBtns}>
                {socialStore.isTravelModeActive && (
                  <TouchableOpacity style={styles.clearBtn} onPress={handleClearTravelMode}>
                    <Text style={styles.clearBtnText}>Clear</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.setBtn} onPress={handleTravelMode}>
                  <Text style={styles.setBtnText}>Set</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.premiumGate}
                onPress={() => navigation.navigate("BuddyPass")}
              >
                <Ionicons name="lock-closed" size={14} color={colors.warning} />
                <Text style={styles.premiumGateText}>BuddyPass</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Vibe Tags */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vibe Tags</Text>
          <TouchableOpacity style={styles.row} onPress={() => setVibeTagModal(true)}>
            <View style={styles.rowInfo}>
              <Ionicons name="pricetag-outline" size={22} color={colors.warning} />
              <View style={{ flex: 1 }}>
                <Text style={styles.rowLabel}>Vibe Tags</Text>
                {socialStore.vibeTags.length > 0 ? (
                  <View style={styles.tagRow}>
                    {socialStore.vibeTags.map((tag) => (
                      <View key={tag} style={styles.tagChip}>
                        <Text style={styles.tagChipText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.rowSub}>Add up to 5 vibe tags</Text>
                )}
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Blocked Users */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Safety</Text>
          <TouchableOpacity style={styles.row} onPress={() => navigation.navigate("BlockedUsers")}>
            <View style={styles.rowInfo}>
              <Ionicons name="ban-outline" size={22} color={colors.error} />
              <Text style={styles.rowLabel}>Blocked Users</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Super Connects */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Super Connects</Text>
          <View style={styles.row}>
            <View style={styles.rowInfo}>
              <Ionicons name="flash-outline" size={22} color="#FFB347" />
              <View>
                <Text style={styles.rowLabel}>Daily Super Connects</Text>
                <Text style={styles.rowSub}>{5 - socialStore.dailySuperConnectsSent} remaining today</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Log Out */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() =>
            Alert.alert("Log out?", "", [
              { text: "Cancel", style: "cancel" },
              { text: "Log out", style: "destructive", onPress: () => authStore.logout() },
            ])
          }
        >
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Vibe Tags Modal */}
      <Modal visible={vibeTagModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Pick Vibe Tags (max 5)</Text>
            <FlatList
              data={[...VIBE_TAGS]}
              keyExtractor={(t) => t}
              numColumns={2}
              columnWrapperStyle={{ gap: 8, marginBottom: 8 }}
              renderItem={({ item: tag }) => {
                const selected = selectedTags.includes(tag);
                return (
                  <TouchableOpacity
                    style={[styles.vibeChip, selected && styles.vibeChipActive]}
                    onPress={() => toggleVibeTag(tag)}
                  >
                    <Text style={[styles.vibeChipText, selected && styles.vibeChipTextActive]}>{tag}</Text>
                  </TouchableOpacity>
                );
              }}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setVibeTagModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={saveVibeTags}>
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  title: { fontSize: fontSizes.xl, fontWeight: "900", color: colors.text },
  content: { paddingHorizontal: spacing.lg, paddingBottom: 60, gap: 8 },
  section: { backgroundColor: colors.bgCard, borderRadius: radii.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.border, gap: 4 },
  sectionTitle: { fontSize: fontSizes.sm - 1, fontWeight: "700", color: colors.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 },
  rowInfo: { flexDirection: "row", alignItems: "flex-start", gap: 12, flex: 1 },
  rowLabel: { fontSize: fontSizes.md, fontWeight: "700", color: colors.text },
  rowSub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  travelBtns: { flexDirection: "row", gap: 8 },
  clearBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: radii.md, borderWidth: 1, borderColor: colors.error },
  clearBtnText: { color: colors.error, fontSize: 12, fontWeight: "700" },
  setBtn: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: radii.md, backgroundColor: colors.accent },
  setBtnText: { color: "#000", fontSize: 12, fontWeight: "700" },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 4 },
  tagChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radii.full, backgroundColor: colors.primary + "33" },
  tagChipText: { fontSize: 11, color: colors.primary, fontWeight: "700" },
  logoutBtn: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.bgCard, borderRadius: radii.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.error + "55", marginTop: 8 },
  logoutText: { fontSize: fontSizes.md, fontWeight: "700", color: colors.error },
  premiumGate: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.warning + "22",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.warning + "55",
  },
  premiumGateText: { fontSize: 11, color: colors.warning, fontWeight: "800" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: colors.bgCard, borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl, padding: spacing.lg, gap: 14 },
  modalTitle: { fontSize: fontSizes.md, fontWeight: "800", color: colors.text },
  vibeChip: { flex: 1, paddingVertical: 12, borderRadius: radii.md, backgroundColor: colors.bgInput, alignItems: "center", borderWidth: 1, borderColor: colors.border },
  vibeChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  vibeChipText: { fontSize: fontSizes.sm, color: colors.textSub, fontWeight: "600" },
  vibeChipTextActive: { color: "#fff", fontWeight: "700" },
  modalActions: { flexDirection: "row", gap: 12 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: radii.lg, backgroundColor: colors.bgInput, alignItems: "center", borderWidth: 1, borderColor: colors.border },
  cancelBtnText: { color: colors.textMuted, fontWeight: "700" },
  saveBtn: { flex: 1, paddingVertical: 14, borderRadius: radii.lg, backgroundColor: colors.primary, alignItems: "center" },
  saveBtnText: { color: "#fff", fontWeight: "700" },
});
