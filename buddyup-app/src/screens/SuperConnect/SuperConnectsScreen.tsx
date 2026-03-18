import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { observer } from "mobx-react-lite";
import { socialStore } from "@/stores/SocialStore";
import { colors, spacing, radii, fontSizes } from "@/theme";
import EmptyState from "@/components/EmptyState";

export default observer(function SuperConnectsScreen() {
  useEffect(() => {
    socialStore.fetchSuperConnects();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#0F0F1A", "#1A1A2E"]} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <Text style={styles.title}>⚡ Super Connects</Text>
        <Text style={styles.subtitle}>People who super-connected with you</Text>
      </View>

      <FlatList
        data={socialStore.superConnectsReceived}
        keyExtractor={(sc) => sc.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="⚡"
            title="No super connects yet"
            subtitle="When someone sends you a super connect, it'll appear here"
          />
        }
        renderItem={({ item: sc }) => (
          <View style={styles.card}>
            <View style={styles.badgeWrap}>
              <Image
                source={{
                  uri:
                    sc.sender?.avatar?.image_url ??
                    `https://ui-avatars.com/api/?name=${sc.sender?.display_name ?? "?"}&size=52&background=6C63FF&color=fff`,
                }}
                style={styles.avatar}
              />
              <View style={styles.badge}>
                <Text style={styles.badgeText}>⚡</Text>
              </View>
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{sc.sender?.display_name ?? "Unknown"}</Text>
              {sc.message ? (
                <Text style={styles.message} numberOfLines={2}>{sc.message}</Text>
              ) : (
                <Text style={styles.noMessage}>Sent you a super connect!</Text>
              )}
              <Text style={styles.time}>
                {new Date(sc.created_at).toLocaleDateString()}
              </Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.md },
  title: { fontSize: fontSizes.xl, fontWeight: "900", color: colors.text },
  subtitle: { fontSize: fontSizes.sm, color: colors.textMuted, marginTop: 4 },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 60, gap: 12 },
  card: { flexDirection: "row", alignItems: "flex-start", gap: 14, backgroundColor: colors.bgCard, borderRadius: radii.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  badgeWrap: { position: "relative", width: 52, height: 52 },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  badge: { position: "absolute", bottom: -2, right: -2, width: 20, height: 20, borderRadius: 10, backgroundColor: "#FFB347", alignItems: "center", justifyContent: "center" },
  badgeText: { fontSize: 10 },
  info: { flex: 1, gap: 4 },
  name: { fontSize: fontSizes.md, fontWeight: "800", color: colors.text },
  message: { fontSize: fontSizes.sm, color: colors.textSub, lineHeight: 20 },
  noMessage: { fontSize: fontSizes.sm, color: colors.textMuted, fontStyle: "italic" },
  time: { fontSize: 11, color: colors.textMuted },
});
