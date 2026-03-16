import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";
import { LinearGradient } from "react-native-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { groupStore } from "@/stores/GroupStore";
import { colors, spacing, radii, fontSizes } from "@/theme";
import { ACTIVITY_TYPES } from "@/types";

export default function CreateGroupScreen({ navigation }: any) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [activityType, setActivityType] = useState("");
  const [maxMembers, setMaxMembers] = useState(50);
  const [isPublic, setIsPublic] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Group name is required");
      return;
    }
    if (!activityType) {
      Alert.alert("Error", "Please select an activity type");
      return;
    }
    setIsLoading(true);
    try {
      await groupStore.createGroup({ name, description, activity_type: activityType, max_members: maxMembers, is_public: isPublic });
      navigation.goBack();
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.error ?? "Failed to create group");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#0F0F1A", "#1A1A2E"]} style={StyleSheet.absoluteFill} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>New Group</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.field}>
          <Text style={styles.label}>Group Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Morning Runners Club"
            placeholderTextColor={colors.textMuted}
            maxLength={60}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            value={description}
            onChangeText={setDescription}
            placeholder="What's this group about?"
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={3}
            maxLength={300}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Activity Type *</Text>
          <View style={styles.chips}>
            {ACTIVITY_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.chip, activityType === type && styles.chipActive]}
                onPress={() => setActivityType(type)}
              >
                <Text style={[styles.chipText, activityType === type && styles.chipTextActive]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Max Members: {maxMembers}</Text>
          <View style={styles.sliderRow}>
            <TouchableOpacity onPress={() => setMaxMembers(Math.max(2, maxMembers - 5))} style={styles.sliderBtn}>
              <Ionicons name="remove" size={20} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.sliderTrack}>
              <View style={[styles.sliderFill, { width: `${((maxMembers - 2) / 98) * 100}%` }]} />
            </View>
            <TouchableOpacity onPress={() => setMaxMembers(Math.min(100, maxMembers + 5))} style={styles.sliderBtn}>
              <Ionicons name="add" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.toggleRow}>
          <View>
            <Text style={styles.label}>Public Group</Text>
            <Text style={styles.sublabel}>Anyone can find and join</Text>
          </View>
          <Switch
            value={isPublic}
            onValueChange={setIsPublic}
            trackColor={{ true: colors.primary, false: colors.border }}
            thumbColor="#fff"
          />
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, isLoading && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.submitGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={styles.submitText}>{isLoading ? "Creating..." : "Create Group"}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  title: { fontSize: fontSizes.md, fontWeight: "800", color: colors.text },
  content: { padding: spacing.lg, gap: 20, paddingBottom: 60 },
  field: { gap: 8 },
  label: { fontSize: fontSizes.sm, fontWeight: "700", color: colors.textSub, textTransform: "uppercase", letterSpacing: 0.5 },
  sublabel: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  input: { backgroundColor: colors.bgInput, borderRadius: radii.md, paddingHorizontal: spacing.md, paddingVertical: 14, color: colors.text, fontSize: fontSizes.md, borderWidth: 1, borderColor: colors.border },
  multiline: { height: 90, textAlignVertical: "top", paddingTop: 12 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radii.full, backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: fontSizes.sm, color: colors.textSub, textTransform: "capitalize" },
  chipTextActive: { color: "#fff", fontWeight: "700" },
  sliderRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  sliderBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  sliderTrack: { flex: 1, height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: "hidden" },
  sliderFill: { height: "100%", backgroundColor: colors.primary, borderRadius: 3 },
  toggleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: colors.bgCard, borderRadius: radii.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  submitBtn: { borderRadius: radii.lg, overflow: "hidden", marginTop: 8 },
  submitGrad: { paddingVertical: 18, alignItems: "center" },
  submitText: { color: "#fff", fontSize: fontSizes.md, fontWeight: "800" },
});
