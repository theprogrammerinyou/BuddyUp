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
import { API_BASE_URL, authStorage } from "@/services/api";

const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 1000;

export default observer(function ChatScreen({ route, navigation }: any) {
  const { matchId, userName } = route.params;
  const [text, setText] = useState("");
  const [wsStatus, setWsStatus] = useState<"connecting" | "connected" | "reconnecting" | "disconnected">("connecting");
  const flatRef = useRef<FlatList>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const retryCount = useRef(0);
  const retryTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    navigation.setOptions({ title: userName, headerShown: true });
    chatStore.fetchHistory(matchId);
    connect();
    return () => {
      if (retryTimeout.current) clearTimeout(retryTimeout.current);
      wsRef.current?.close();
    };
  }, [matchId]);

  const connect = () => {
    const token = authStorage.getToken();
    const wsBase = API_BASE_URL.replace(/^http/, "ws");
    const url = `${wsBase}/ws/chat/${matchId}?token=${token}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;
    setWsStatus(retryCount.current === 0 ? "connecting" : "reconnecting");

    ws.onopen = () => {
      retryCount.current = 0;
      setWsStatus("connected");
    };

    ws.onmessage = (event) => {
      try {
        const msg: Message = JSON.parse(event.data);
        chatStore.appendMessage(matchId, msg);
      } catch {}
    };

    ws.onerror = () => {
      setWsStatus("reconnecting");
    };

    ws.onclose = () => {
      setWsStatus("disconnected");
      scheduleReconnect();
    };
  };

  const scheduleReconnect = () => {
    if (retryCount.current >= MAX_RETRIES) {
      setWsStatus("disconnected");
      return;
    }
    const delay = Math.min(INITIAL_RETRY_DELAY * Math.pow(2, retryCount.current), 30000);
    retryCount.current += 1;
    retryTimeout.current = setTimeout(() => {
      connect();
    }, delay);
  };

  const messages: Message[] = chatStore.messages[matchId] ?? [];
  const myID = authStore.user?.id;

  const send = () => {
    if (!text.trim()) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ content: text.trim() }));
      setText("");
    }
  };

  const statusColor =
    wsStatus === "connected" ? colors.success :
    wsStatus === "connecting" || wsStatus === "reconnecting" ? colors.warning :
    colors.error;

  const statusLabel =
    wsStatus === "connected" ? null :
    wsStatus === "connecting" ? "Connecting..." :
    wsStatus === "reconnecting" ? `Reconnecting... (${retryCount.current}/${MAX_RETRIES})` :
    "Disconnected";

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#0F0F1A", "#1A1A2E"]} style={StyleSheet.absoluteFill} />
      {statusLabel && (
        <View style={[styles.statusBar, { backgroundColor: statusColor + "33", borderBottomColor: statusColor }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
        </View>
      )}
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
          onLayout={() => flatRef.current?.scrollToEnd({ animated: false })}
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
  statusBar: {
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    alignItems: "center",
  },
  statusText: { fontSize: fontSizes.xs, fontWeight: "700" },
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
