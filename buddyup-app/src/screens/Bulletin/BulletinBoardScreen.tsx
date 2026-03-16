import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Modal,
  Alert,
  Image,
} from "react-native";
import { LinearGradient } from "react-native-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { observer } from "mobx-react-lite";
import { postStore } from "@/stores/PostStore";
import { colors, spacing, radii, fontSizes } from "@/theme";
import { ACTIVITY_TYPES, Post } from "@/types";
import { timeAgo } from "@/utils/time";

const ACTIVITY_COLORS: Record<string, string> = {
  gym: "#FF4B4B", coding: "#00F2FE", hiking: "#00D2FF", gaming: "#BD34FE",
  sports: "#00D2FF", music: "#FF9A9E", travel: "#FFB347", food: "#F8CA24",
  arts: "#FF3366", fitness: "#00E676",
};

export default observer(function BulletinBoardScreen({ navigation }: any) {
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [respondModal, setRespondModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [responseText, setResponseText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    postStore.fetchPosts(selectedActivity ?? undefined);
  }, [selectedActivity]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await postStore.fetchPosts(selectedActivity ?? undefined).catch(() => {});
    setRefreshing(false);
  };

  const handleRespond = async () => {
    if (!selectedPost || !responseText.trim()) return;
    setSending(true);
    try {
      await postStore.respondToPost(selectedPost.id, responseText.trim());
      setRespondModal(false);
      setResponseText("");
      Alert.alert("Sent!", "Your response was sent.");
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.error ?? "Failed to send");
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#0F0F1A", "#1A1A2E"]} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <Text style={styles.title}>Bulletin Board</Text>
        <TouchableOpacity style={styles.createBtn} onPress={() => navigation.navigate("CreatePost")}>
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
        data={postStore.posts}
        keyExtractor={(p) => p.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>No posts yet</Text>
            <Text style={styles.emptySub}>Post what you're looking for!</Text>
          </View>
        }
        renderItem={({ item: post }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Image
                source={{ uri: `https://ui-avatars.com/api/?name=${post.author?.display_name ?? "?"}&size=40&background=6C63FF&color=fff` }}
                style={styles.avatar}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.authorName}>{post.author?.display_name ?? "Unknown"}</Text>
                <Text style={styles.timeText}>{timeAgo(post.created_at)}</Text>
              </View>
              {post.activity_type ? (
                <View style={[styles.activityBadge, { backgroundColor: ACTIVITY_COLORS[post.activity_type] ?? colors.primary }]}>
                  <Text style={styles.activityText}>{post.activity_type}</Text>
                </View>
              ) : null}
            </View>

            <Text style={styles.content}>{post.content}</Text>

            {post.event_time ? (
              <View style={styles.eventRow}>
                <Ionicons name="calendar" size={14} color={colors.accent} />
                <Text style={styles.eventText}>{new Date(post.event_time).toLocaleString()}</Text>
              </View>
            ) : null}

            <View style={styles.cardFooter}>
              <View style={styles.responseCount}>
                <Ionicons name="chatbubble-outline" size={14} color={colors.textMuted} />
                <Text style={styles.responseCountText}>{post.response_count ?? 0} responses</Text>
              </View>
              <TouchableOpacity
                style={styles.respondBtn}
                onPress={() => { setSelectedPost(post); setRespondModal(true); }}
              >
                <Text style={styles.respondBtnText}>Respond</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Respond Modal */}
      <Modal visible={respondModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Respond to Post</Text>
            {selectedPost && <Text style={styles.modalPostContent} numberOfLines={3}>{selectedPost.content}</Text>}
            <TextInput
              style={styles.modalInput}
              value={responseText}
              onChangeText={setResponseText}
              placeholder="Write your response..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={3}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => { setRespondModal(false); setResponseText(""); }}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sendBtn, sending && { opacity: 0.6 }]}
                onPress={handleRespond}
                disabled={sending}
              >
                <Text style={styles.sendText}>{sending ? "Sending..." : "Send"}</Text>
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
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  title: { fontSize: fontSizes.xl, fontWeight: "900", color: colors.text },
  createBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  filterRow: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md, gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radii.full, backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border },
  chipText: { color: colors.textSub, fontSize: fontSizes.sm, fontWeight: "600", textTransform: "capitalize" },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 100, gap: 12 },
  card: { backgroundColor: colors.bgCard, borderRadius: radii.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.border, gap: 10 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.bgInput },
  authorName: { fontSize: fontSizes.sm, fontWeight: "700", color: colors.text },
  timeText: { fontSize: 11, color: colors.textMuted, marginTop: 1 },
  activityBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radii.full },
  activityText: { color: "#fff", fontSize: 11, fontWeight: "700", textTransform: "capitalize" },
  content: { fontSize: fontSizes.md, color: colors.text, lineHeight: 22 },
  eventRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  eventText: { fontSize: fontSizes.sm, color: colors.accent },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 },
  responseCount: { flexDirection: "row", alignItems: "center", gap: 4 },
  responseCountText: { fontSize: 12, color: colors.textMuted },
  respondBtn: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: radii.full, backgroundColor: colors.primary },
  respondBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  empty: { alignItems: "center", paddingTop: 60, gap: 8 },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: fontSizes.md, fontWeight: "700", color: colors.text },
  emptySub: { fontSize: fontSizes.sm, color: colors.textMuted },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: colors.bgCard, borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl, padding: spacing.lg, gap: 14 },
  modalTitle: { fontSize: fontSizes.md, fontWeight: "800", color: colors.text },
  modalPostContent: { fontSize: fontSizes.sm, color: colors.textSub, fontStyle: "italic" },
  modalInput: { backgroundColor: colors.bgInput, borderRadius: radii.md, padding: spacing.md, color: colors.text, fontSize: fontSizes.md, height: 90, textAlignVertical: "top", borderWidth: 1, borderColor: colors.border },
  modalActions: { flexDirection: "row", gap: 12 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: radii.lg, backgroundColor: colors.bgInput, alignItems: "center", borderWidth: 1, borderColor: colors.border },
  cancelText: { color: colors.textMuted, fontWeight: "700" },
  sendBtn: { flex: 1, paddingVertical: 14, borderRadius: radii.lg, backgroundColor: colors.primary, alignItems: "center" },
  sendText: { color: "#fff", fontWeight: "700" },
});
