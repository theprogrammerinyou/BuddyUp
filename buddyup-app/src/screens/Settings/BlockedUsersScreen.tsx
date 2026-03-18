import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { observer } from "mobx-react-lite";
import { socialStore } from "@/stores/SocialStore";
import { colors, spacing, radii, fontSizes } from "@/theme";
import EmptyState from "@/components/EmptyState";

export default observer(function BlockedUsersScreen({ navigation }: any) {
  useEffect(() => {
    socialStore.fetchBlockedUsers();
  }, []);

  const handleUnblock = (id: string, name: string) => {
    Alert.alert(`Unblock ${name}?`, "They will be able to see your profile again.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Unblock",
        onPress: async () => {
          try {
            await socialStore.unblockUser(id);
          } catch {
            Alert.alert("Error", "Failed to unblock user");
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#0F0F1A", "#1A1A2E"]} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Blocked Users</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={socialStore.blockedUsers}
        keyExtractor={(u) => u.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="🔓"
            title="No blocked users"
            subtitle="Users you block will appear here"
          />
        }
        renderItem={({ item: user }) => (
          <View style={styles.card}>
            <Image
              source={{ uri: `https://ui-avatars.com/api/?name=${user.display_name}&size=48&background=6C63FF&color=fff` }}
              style={styles.avatar}
            />
            <Text style={styles.name} numberOfLines={1}>{user.display_name}</Text>
            <TouchableOpacity
              style={styles.unblockBtn}
              onPress={() => handleUnblock(user.id, user.display_name)}
            >
              <Text style={styles.unblockText}>Unblock</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  backBtn: { padding: 4 },
  title: { fontSize: fontSizes.md, fontWeight: "800", color: colors.text },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 60, gap: 10 },
  card: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: colors.bgCard, borderRadius: radii.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.bgInput },
  name: { flex: 1, fontSize: fontSizes.md, fontWeight: "700", color: colors.text },
  unblockBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: radii.full, borderWidth: 1, borderColor: colors.primary },
  unblockText: { color: colors.primary, fontSize: 13, fontWeight: "700" },
});
