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
import { eventStore } from "@/stores/EventStore";
import { colors, spacing, radii, fontSizes } from "@/theme";
import { ACTIVITY_TYPES, Event } from "@/types";

const ACTIVITY_COLORS: Record<string, string> = {
  gym: "#FF4B4B", coding: "#00F2FE", hiking: "#00D2FF", gaming: "#BD34FE",
  sports: "#00D2FF", music: "#FF9A9E", travel: "#FFB347", food: "#F8CA24",
  arts: "#FF3366", fitness: "#00E676",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default observer(function EventsScreen({ navigation }: any) {
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    eventStore.fetchEvents(selectedActivity ?? undefined);
  }, [selectedActivity]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await eventStore.fetchEvents(selectedActivity ?? undefined).catch(() => {});
    setRefreshing(false);
  };

  const handleRSVP = async (event: Event, status: "going" | "maybe") => {
    try {
      await eventStore.rsvpEvent(event.id, status);
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.error ?? "Failed to RSVP");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#0F0F1A", "#1A1A2E"]} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <Text style={styles.title}>Upcoming Events</Text>
        <TouchableOpacity style={styles.createBtn} onPress={() => navigation.navigate("CreateEvent")}>
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

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
        data={eventStore.events}
        keyExtractor={(e) => e.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyText}>No events yet</Text>
            <Text style={styles.emptySub}>Create an event to get started!</Text>
          </View>
        }
        renderItem={({ item: event }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("EventDetail", { eventId: event.id })}
            activeOpacity={0.85}
          >
            <View style={styles.cardTop}>
              <View style={[styles.activityBadge, { backgroundColor: ACTIVITY_COLORS[event.activity_type] ?? colors.primary }]}>
                <Text style={styles.activityText}>{event.activity_type}</Text>
              </View>
              {event.is_public ? null : (
                <Ionicons name="lock-closed" size={14} color={colors.textMuted} />
              )}
            </View>
            <Text style={styles.eventTitle} numberOfLines={2}>{event.title}</Text>

            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={14} color={colors.accent} />
              <Text style={styles.infoText}>{formatDate(event.starts_at)}</Text>
            </View>

            {event.location_name ? (
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={14} color={colors.textMuted} />
                <Text style={styles.infoText}>{event.location_name}</Text>
              </View>
            ) : null}

            <View style={styles.cardBottom}>
              <View style={styles.rsvpCount}>
                <Ionicons name="people" size={14} color={colors.textMuted} />
                <Text style={styles.rsvpCountText}>{event.rsvp_count ?? 0} going</Text>
              </View>
              <View style={styles.rsvpBtns}>
                <TouchableOpacity
                  style={[styles.rsvpBtn, event.user_rsvp === "going" && styles.rsvpBtnActive]}
                  onPress={() => handleRSVP(event, "going")}
                >
                  <Text style={[styles.rsvpBtnText, event.user_rsvp === "going" && styles.rsvpBtnTextActive]}>Going</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.rsvpBtn, event.user_rsvp === "maybe" && styles.rsvpBtnActive]}
                  onPress={() => handleRSVP(event, "maybe")}
                >
                  <Text style={[styles.rsvpBtnText, event.user_rsvp === "maybe" && styles.rsvpBtnTextActive]}>Maybe</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )}
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
  card: { backgroundColor: colors.bgCard, borderRadius: radii.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.border, gap: 8 },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  activityBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radii.full },
  activityText: { color: "#fff", fontSize: 11, fontWeight: "700", textTransform: "capitalize" },
  eventTitle: { fontSize: fontSizes.md, fontWeight: "800", color: colors.text },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  infoText: { fontSize: fontSizes.sm, color: colors.textMuted },
  cardBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 },
  rsvpCount: { flexDirection: "row", alignItems: "center", gap: 4 },
  rsvpCountText: { fontSize: 12, color: colors.textMuted },
  rsvpBtns: { flexDirection: "row", gap: 8 },
  rsvpBtn: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: radii.full, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bgInput },
  rsvpBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  rsvpBtnText: { fontSize: 12, color: colors.textMuted, fontWeight: "600" },
  rsvpBtnTextActive: { color: "#fff", fontWeight: "700" },
  empty: { alignItems: "center", paddingTop: 60, gap: 8 },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: fontSizes.md, fontWeight: "700", color: colors.text },
  emptySub: { fontSize: fontSizes.sm, color: colors.textMuted },
});
