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
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { eventStore } from "@/stores/EventStore";
import { colors, spacing, radii, fontSizes } from "@/theme";
import { ACTIVITY_TYPES } from "@/types";

export default function CreateEventScreen({ navigation }: any) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [activityType, setActivityType] = useState("");
  const [locationName, setLocationName] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [maxAttendees, setMaxAttendees] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) { Alert.alert("Error", "Title is required"); return; }
    if (!activityType) { Alert.alert("Error", "Please select an activity type"); return; }
    if (!startsAt.trim()) { Alert.alert("Error", "Start time is required"); return; }

    setIsLoading(true);
    try {
      await eventStore.createEvent({
        title: title.trim(),
        description: description || undefined,
        activity_type: activityType,
        location_name: locationName || undefined,
        latitude: lat ? parseFloat(lat) : undefined,
        longitude: lng ? parseFloat(lng) : undefined,
        starts_at: startsAt,
        ends_at: endsAt || undefined,
        max_attendees: maxAttendees ? parseInt(maxAttendees) : undefined,
        is_public: isPublic,
      });
      navigation.goBack();
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.error ?? "Failed to create event");
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
        <Text style={styles.title}>New Event</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.field}>
          <Text style={styles.label}>Title *</Text>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Event title" placeholderTextColor={colors.textMuted} maxLength={100} />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Description</Text>
          <TextInput style={[styles.input, styles.multiline]} value={description} onChangeText={setDescription} placeholder="Tell people what to expect..." placeholderTextColor={colors.textMuted} multiline numberOfLines={3} maxLength={500} />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Activity Type *</Text>
          <View style={styles.chips}>
            {ACTIVITY_TYPES.map((type) => (
              <TouchableOpacity key={type} style={[styles.chip, activityType === type && styles.chipActive]} onPress={() => setActivityType(type)}>
                <Text style={[styles.chipText, activityType === type && styles.chipTextActive]}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Location Name</Text>
          <TextInput style={styles.input} value={locationName} onChangeText={setLocationName} placeholder="e.g. Central Park" placeholderTextColor={colors.textMuted} />
        </View>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Latitude</Text>
            <TextInput style={styles.input} value={lat} onChangeText={setLat} placeholder="28.6139" placeholderTextColor={colors.textMuted} keyboardType="numeric" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Longitude</Text>
            <TextInput style={styles.input} value={lng} onChangeText={setLng} placeholder="77.2090" placeholderTextColor={colors.textMuted} keyboardType="numeric" />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Starts At * (ISO 8601)</Text>
          <TextInput style={styles.input} value={startsAt} onChangeText={setStartsAt} placeholder="2024-12-25T10:00:00Z" placeholderTextColor={colors.textMuted} />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Ends At (optional)</Text>
          <TextInput style={styles.input} value={endsAt} onChangeText={setEndsAt} placeholder="2024-12-25T12:00:00Z" placeholderTextColor={colors.textMuted} />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Max Attendees (optional)</Text>
          <TextInput style={styles.input} value={maxAttendees} onChangeText={setMaxAttendees} placeholder="Leave blank for unlimited" placeholderTextColor={colors.textMuted} keyboardType="number-pad" />
        </View>

        <View style={styles.toggleRow}>
          <View>
            <Text style={styles.label}>Public Event</Text>
            <Text style={styles.sublabel}>Anyone can see and RSVP</Text>
          </View>
          <Switch value={isPublic} onValueChange={setIsPublic} trackColor={{ true: colors.primary, false: colors.border }} thumbColor="#fff" />
        </View>

        <TouchableOpacity style={[styles.submitBtn, isLoading && { opacity: 0.6 }]} onPress={handleSubmit} disabled={isLoading}>
          <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.submitGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={styles.submitText}>{isLoading ? "Creating..." : "Create Event"}</Text>
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
  row: { flexDirection: "row", gap: 12 },
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
  toggleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: colors.bgCard, borderRadius: radii.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  submitBtn: { borderRadius: radii.lg, overflow: "hidden", marginTop: 8 },
  submitGrad: { paddingVertical: 18, alignItems: "center" },
  submitText: { color: "#fff", fontSize: fontSizes.md, fontWeight: "800" },
});
