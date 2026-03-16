import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "react-native-linear-gradient";
import { observer } from "mobx-react-lite";
import { Ionicons } from "@expo/vector-icons";
import { chatStore, Message } from "@/stores/chatStore";
import { authStore } from "@/stores/authStore";
import { colors, spacing, radii, fontSizes } from "@/theme";

export default observer(function ChatScreen({ route, navigation }: any) {
  const { matchId, userName } = route.params;
  const [text, setText] = useState("");
  const flatRef = useRef<FlatList>(null);

  useEffect(() => {
    navigation.setOptions({ title: userName, headerShown: true });
    chatStore.fetchHistory(matchId);
    chatStore.connectWS(matchId);
    return () => chatStore.disconnectWS();
  }, [matchId]);

  const messages: Message[] = chatStore.messages[matchId] ?? [];
  const myID = authStore.user?.id;

  const send = () => {
    if (!text.trim()) return;
    chatStore.sendMessage(text.trim());
    setText("");
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#0F0F1A", "#1A1A2E"]} style={StyleSheet.absoluteFill} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={flatRef}
          data={messages}
          keyExtractor={(m) => m.id}
          onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: true })}
          contentContainerStyle={{ padding: spacing.md, gap: 10 }}
          renderItem={({ item }) => {
            const isMe = item.sender_id === myID;
            return (
              <View style={[styles.bubble, isMe ? styles.myBubble : styles.theirBubble]}>
                {isMe ? (
                  <LinearGradient
                    colors={[colors.primary, colors.secondary]}
                    style={styles.bubbleGrad}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.myText}>{item.content}</Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.theirContent}>
                    <Text style={styles.theirText}>{item.content}</Text>
                  </View>
                )}
                <Text style={[styles.time, isMe ? styles.timeRight : styles.timeLeft]}>
                  {new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </Text>
              </View>
            );
          }}
        />

        {/* Input */}
        <View style={styles.inputArea}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Type a message..."
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={500}
            onSubmitEditing={send}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !text.trim() && { opacity: 0.5 }]}
            onPress={send}
            disabled={!text.trim()}
          >
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              style={styles.sendGrad}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="send" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  bubble: { maxWidth: "78%" },
  myBubble: { alignSelf: "flex-end" },
  theirBubble: { alignSelf: "flex-start" },
  bubbleGrad: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20, borderBottomRightRadius: 4 },
  theirContent: { backgroundColor: colors.bgCard, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: colors.border },
  myText: { color: "#fff", fontSize: fontSizes.sm, lineHeight: 20 },
  theirText: { color: colors.text, fontSize: fontSizes.sm, lineHeight: 20 },
  time: { fontSize: 10, color: colors.textMuted, marginTop: 4 },
  timeRight: { textAlign: "right" },
  timeLeft: { textAlign: "left" },
  inputArea: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: spacing.md,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bgCard,
  },
  input: {
    flex: 1,
    backgroundColor: colors.bgInput,
    borderRadius: radii.lg,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: colors.text,
    fontSize: fontSizes.sm,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendBtn: { width: 46, height: 46, borderRadius: 23, overflow: "hidden" },
  sendGrad: { flex: 1, alignItems: "center", justifyContent: "center" },
});
