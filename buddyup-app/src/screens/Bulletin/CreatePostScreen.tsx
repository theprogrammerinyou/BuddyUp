import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { LinearGradient } from "react-native-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { postStore } from "@/stores/PostStore";
import { colors, spacing, radii, fontSizes } from "@/theme";
import { ACTIVITY_TYPES } from "@/types";

const EXPIRE_OPTIONS = [
  { label: "1 day", hours: 24 },
  { label: "3 days", hours: 72 },
  { label: "7 days", hours: 168 },
];

export default function CreatePostScreen({ navigation }: any) {
  const [content, setContent] = useState("");
  const [activityType, setActivityType] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [expiresHours, setExpiresHours] = useState(168);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) {
      Alert.alert("Error", "Post content is required");
      return;
    }
    setIsLoading(true);
    try {
      await postStore.createPost({
        content: content.trim(),
        activity_type: activityType || undefined,
        event_time: eventTime || undefined,
        expires_hours: expiresHours,
      });
      navigation.goBack();
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.error ?? "Failed to create post");
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
        <Text style={styles.title}>New Post</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.field}>
          <Text style={styles.label}>What are you looking for? *</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            value={content}
            onChangeText={setContent}
            placeholder="e.g. Looking for a gym buddy at 6am in Koramangala..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={4}
            maxLength={500}
          />
          <Text style={styles.charCount}>{content.length}/500</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Activity Type (optional)</Text>
          <View style={styles.chips}>
            {ACTIVITY_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.chip, activityType === type && styles.chipActive]}
                onPress={() => setActivityType(activityType === type ? "" : type)}
              >
                <Text style={[styles.chipText, activityType === type && styles.chipTextActive]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Event Time (optional)</Text>
          <TextInput
            style={styles.input}
            value={eventTime}
            onChangeText={setEventTime}
            placeholder="e.g. 2024-12-25T06:00:00Z"
            placeholderTextColor={colors.textMuted}
          />
          <Text style={styles.hint}>ISO 8601 format</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Expires In</Text>
          <View style={styles.expireRow}>
            {EXPIRE_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.hours}
                style={[styles.expireBtn, expiresHours === opt.hours && styles.expireBtnActive]}
                onPress={() => setExpiresHours(opt.hours)}
              >
                <Text style={[styles.expireBtnText, expiresHours === opt.hours && styles.expireBtnTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, isLoading && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.submitGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={styles.submitText}>{isLoading ? "Posting..." : "Post"}</Text>
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
  hint: { fontSize: 11, color: colors.textMuted },
  charCount: { fontSize: 11, color: colors.textMuted, textAlign: "right" },
  input: { backgroundColor: colors.bgInput, borderRadius: radii.md, paddingHorizontal: spacing.md, paddingVertical: 14, color: colors.text, fontSize: fontSizes.md, borderWidth: 1, borderColor: colors.border },
  multiline: { height: 120, textAlignVertical: "top", paddingTop: 12 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radii.full, backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: fontSizes.sm, color: colors.textSub, textTransform: "capitalize" },
  chipTextActive: { color: "#fff", fontWeight: "700" },
  expireRow: { flexDirection: "row", gap: 10 },
  expireBtn: { flex: 1, paddingVertical: 12, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, alignItems: "center", backgroundColor: colors.bgCard },
  expireBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  expireBtnText: { fontSize: fontSizes.sm, color: colors.textSub, fontWeight: "600" },
  expireBtnTextActive: { color: "#fff", fontWeight: "700" },
  submitBtn: { borderRadius: radii.lg, overflow: "hidden", marginTop: 8 },
  submitGrad: { paddingVertical: 18, alignItems: "center" },
  submitText: { color: "#fff", fontSize: fontSizes.md, fontWeight: "800" },
});
