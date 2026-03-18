import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, fontSizes, radii, spacing } from "@/theme";
import { DiscoverUser } from "@/stores/discoverStore";

interface MatchModalProps {
  visible: boolean;
  matchedUser: DiscoverUser | null;
  matchId: string | null;
  onSendMessage: (matchId: string, userName: string) => void;
  onKeepSwiping: () => void;
}

const { width } = Dimensions.get("window");

export default function MatchModal({
  visible,
  matchedUser,
  matchId,
  onSendMessage,
  onKeepSwiping,
}: MatchModalProps) {
  const scale = useRef(new Animated.Value(0.5)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 60, friction: 7 }),
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    } else {
      scale.setValue(0.5);
      opacity.setValue(0);
    }
  }, [visible, scale, opacity]);

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.backdrop}>
        <Animated.View style={[styles.card, { opacity, transform: [{ scale }] }]}>
          <LinearGradient
            colors={[colors.primary + "EE", colors.secondary + "EE"]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <Text style={styles.emoji}>🎉</Text>
          <Text style={styles.title}>It's a Match!</Text>

          {matchedUser && (
            <>
              <View style={styles.avatarRow}>
                {matchedUser.avatar?.image_url ? (
                  <Image
                    source={{ uri: matchedUser.avatar.image_url }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={[styles.avatar, styles.avatarFallback]}>
                    <Text style={styles.avatarInitial}>
                      {matchedUser.display_name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.subtitle}>
                You and{" "}
                <Text style={{ fontWeight: "900" }}>{matchedUser.display_name}</Text>{" "}
                both liked each other!
              </Text>
            </>
          )}

          <TouchableOpacity
            style={styles.chatBtn}
            activeOpacity={0.85}
            onPress={() => {
              if (matchId && matchedUser) {
                onSendMessage(matchId, matchedUser.display_name);
              }
            }}
          >
            <Text style={styles.chatBtnText}>💬 Send a Message</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onKeepSwiping} style={styles.skipBtn}>
            <Text style={styles.skipText}>Keep Swiping</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: width - 48,
    borderRadius: radii.xl,
    padding: spacing.xl,
    alignItems: "center",
    overflow: "hidden",
  },
  emoji: { fontSize: 64, marginBottom: 8 },
  title: { fontSize: fontSizes.xxl, fontWeight: "900", color: "#fff", marginBottom: 16 },
  avatarRow: { flexDirection: "row", justifyContent: "center", marginBottom: 16 },
  avatar: { width: 90, height: 90, borderRadius: 45, borderWidth: 3, borderColor: "#fff" },
  avatarFallback: { backgroundColor: colors.bgCard, alignItems: "center", justifyContent: "center" },
  avatarInitial: { fontSize: 36, fontWeight: "900", color: colors.primary },
  subtitle: { fontSize: fontSizes.sm, color: "rgba(255,255,255,0.9)", textAlign: "center", marginBottom: 32, lineHeight: 22 },
  chatBtn: {
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: radii.full,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },
  chatBtnText: { color: "#fff", fontWeight: "800", fontSize: fontSizes.md },
  skipBtn: { padding: 8 },
  skipText: { color: "rgba(255,255,255,0.7)", fontSize: fontSizes.sm },
});
