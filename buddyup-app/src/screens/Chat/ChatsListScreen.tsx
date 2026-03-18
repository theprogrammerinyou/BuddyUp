import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { observer } from "mobx-react-lite";
import { Ionicons } from "@expo/vector-icons";
import { chatStore, Match } from "@/stores/chatStore";
import { api } from "@/services/api";
import { colors, spacing, radii, fontSizes } from "@/theme";
import EmptyState from "@/components/EmptyState";
import SkeletonListItem from "@/components/SkeletonListItem";

export default observer(function ChatsListScreen({ navigation }: any) {
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        await api.post("/me/ensure-seed-matches");
      } catch {
        // ignore
      }
      await chatStore.fetchMatches();
      setLoading(false);
    })();
  }, []);

  const renderItem = ({ item }: { item: Match }) => (
    <TouchableOpacity
      style={styles.item}
      activeOpacity={0.85}
      onPress={() =>
        navigation.navigate("Chat", {
          matchId: item.id,
          userName: item.other_user.display_name,
        })
      }
    >
      <Image
        source={{
          uri: item.other_user.avatar?.image_url ??
            `https://ui-avatars.com/api/?name=${item.other_user.display_name}&background=6C63FF&color=fff`,
        }}
        style={styles.avatar}
      />
      <View style={styles.info}>
        <Text style={styles.name}>{item.other_user.display_name}</Text>
        {item.other_user.avatar && (
          <Text style={styles.charText}>
            {item.other_user.avatar.name} · {item.other_user.avatar.franchise}
          </Text>
        )}
        <Text style={styles.sub}>Tap to start chatting 💬</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#0F0F1A", "#1A1A2E"]} style={StyleSheet.absoluteFill} />
      {loading ? (
        <View style={{ padding: spacing.md, gap: 10 }}>
          {[0, 1, 2, 3].map((i) => <SkeletonListItem key={i} />)}
        </View>
      ) : chatStore.matches.length === 0 ? (
        <EmptyState
          icon="💬"
          title="No conversations yet"
          subtitle="Match with someone to start chatting!"
          actionLabel="Find Buddies"
          onAction={() => navigation.navigate("Discover")}
        />
      ) : (
        <FlatList
          data={chatStore.matches}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: spacing.md, gap: 10 }}
        />
      )}
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.bgInput },
  info: { flex: 1 },
  name: { fontSize: fontSizes.md, fontWeight: "800", color: colors.text },
  charText: { fontSize: 11, color: colors.warning, fontWeight: "600", marginTop: 2 },
  sub: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
});
