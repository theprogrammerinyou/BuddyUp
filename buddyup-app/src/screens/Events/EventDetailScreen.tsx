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
import { eventStore } from "@/stores/EventStore";
import { authStore } from "@/stores/authStore";
import { apiService } from "@/services/api";
import { colors, spacing, radii, fontSizes } from "@/theme";
import { Event, EventRSVP } from "@/types";

const RSVP_STATUSES = ["going", "maybe", "not_going"] as const;

export default observer(function EventDetailScreen({ route, navigation }: any) {
  const { eventId } = route.params;
  const [event, setEvent] = useState<Event | null>(null);
  const [rsvps, setRsvps] = useState<EventRSVP[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  const loadEvent = async () => {
    try {
      const [eventRes, rsvpRes] = await Promise.all([
        apiService.getEvent(eventId),
        apiService.getEventRSVPs(eventId),
      ]);
      setEvent(eventRes.data.event);
      setRsvps(rsvpRes.data.rsvps ?? []);
    } catch {
      Alert.alert("Error", "Could not load event");
    } finally {
      setLoading(false);
    }
  };

  const handleRSVP = async (status: string) => {
    if (!event) return;
    try {
      await eventStore.rsvpEvent(event.id, status);
      setEvent({ ...event, user_rsvp: status });
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.error ?? "Failed to RSVP");
    }
  };

  if (!event) return null;

  const attendees = rsvps.filter((r) => r.status === "going");
  const displayedAttendees = attendees.slice(0, 8);
  const extraCount = Math.max(attendees.length - 8, 0);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#0F0F1A", "#1A1A2E"]} style={StyleSheet.absoluteFill} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.activityBadge}>
            <Text style={styles.activityText}>{event.activity_type}</Text>
          </View>

          <Text style={styles.eventTitle}>{event.title}</Text>
          {event.description ? <Text style={styles.desc}>{event.description}</Text> : null}

          {/* Organizer */}
          {event.organizer && (
            <View style={styles.organizerRow}>
              <Image
                source={{ uri: `https://ui-avatars.com/api/?name=${event.organizer.display_name}&size=36&background=6C63FF&color=fff` }}
                style={styles.organizerAvatar}
              />
              <View>
                <Text style={styles.organizerLabel}>Organized by</Text>
                <Text style={styles.organizerName}>{event.organizer.display_name}</Text>
              </View>
            </View>
          )}

          {/* Date/Time */}
          <View style={styles.infoCard}>
            <Ionicons name="calendar" size={20} color={colors.accent} />
            <View>
              <Text style={styles.infoLabel}>Date & Time</Text>
              <Text style={styles.infoValue}>{new Date(event.starts_at).toLocaleString()}</Text>
              {event.ends_at && (
                <Text style={styles.infoSub}>Ends: {new Date(event.ends_at).toLocaleString()}</Text>
              )}
            </View>
          </View>

          {/* Location */}
          {event.location_name ? (
            <View style={styles.infoCard}>
              <Ionicons name="location" size={20} color={colors.primary} />
              <View>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoValue}>{event.location_name}</Text>
              </View>
            </View>
          ) : null}

          {/* Attendees */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{event.rsvp_count ?? 0} Attending</Text>
            <View style={styles.attendeesRow}>
              {displayedAttendees.map((r) => (
                <Image
                  key={r.user_id}
                  source={{ uri: `https://ui-avatars.com/api/?name=${r.user?.display_name ?? "?"}&size=40&background=6C63FF&color=fff` }}
                  style={styles.attendeeAvatar}
                />
              ))}
              {extraCount > 0 && (
                <View style={[styles.attendeeAvatar, styles.extraBadge]}>
                  <Text style={styles.extraText}>+{extraCount}</Text>
                </View>
              )}
            </View>
          </View>

          {/* RSVP buttons */}
          <View style={styles.rsvpSection}>
            <Text style={styles.sectionTitle}>Your RSVP</Text>
            <View style={styles.rsvpRow}>
              {RSVP_STATUSES.map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[styles.rsvpBtn, event.user_rsvp === status && styles.rsvpBtnActive]}
                  onPress={() => handleRSVP(status)}
                >
                  <Text style={[styles.rsvpBtnText, event.user_rsvp === status && styles.rsvpBtnTextActive]}>
                    {status === "not_going" ? "Not Going" : status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  backBtn: { padding: 4 },
  content: { padding: spacing.lg, gap: 16 },
  activityBadge: { alignSelf: "flex-start", paddingHorizontal: 14, paddingVertical: 6, borderRadius: radii.full, backgroundColor: colors.primary },
  activityText: { color: "#fff", fontSize: 12, fontWeight: "700", textTransform: "capitalize" },
  eventTitle: { fontSize: fontSizes.xl, fontWeight: "900", color: colors.text },
  desc: { fontSize: fontSizes.md, color: colors.textSub, lineHeight: 22 },
  organizerRow: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.bgCard, borderRadius: radii.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  organizerAvatar: { width: 36, height: 36, borderRadius: 18 },
  organizerLabel: { fontSize: 11, color: colors.textMuted },
  organizerName: { fontSize: fontSizes.sm, fontWeight: "700", color: colors.text },
  infoCard: { flexDirection: "row", alignItems: "flex-start", gap: 14, backgroundColor: colors.bgCard, borderRadius: radii.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  infoLabel: { fontSize: 11, color: colors.textMuted, marginBottom: 2 },
  infoValue: { fontSize: fontSizes.sm, fontWeight: "700", color: colors.text },
  infoSub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  section: { gap: 10 },
  sectionTitle: { fontSize: fontSizes.sm, fontWeight: "700", color: colors.textSub, textTransform: "uppercase", letterSpacing: 1 },
  attendeesRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  attendeeAvatar: { width: 40, height: 40, borderRadius: 20 },
  extraBadge: { backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  extraText: { fontSize: 11, fontWeight: "700", color: colors.textMuted },
  rsvpSection: { gap: 10 },
  rsvpRow: { flexDirection: "row", gap: 8 },
  rsvpBtn: { flex: 1, paddingVertical: 12, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, alignItems: "center", backgroundColor: colors.bgCard },
  rsvpBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  rsvpBtnText: { fontSize: 13, color: colors.textMuted, fontWeight: "600" },
  rsvpBtnTextActive: { color: "#fff", fontWeight: "700" },
});
