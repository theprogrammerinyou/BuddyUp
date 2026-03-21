import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Theme } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getMessages, sendMessage, getProfile } from '../api/api';
import type { Message, User } from '../api/types';

export default function MessagesChatScreen({ navigation, route }: any) {
  const receiverId: number = route?.params?.receiverId ?? 1;
  const receiverName: string = route?.params?.receiverName ?? 'Unknown';
  const receiverAvatar: string = route?.params?.receiverAvatar ?? `https://i.pravatar.cc/150?u=${receiverId}`;

  const [messages, setMessages] = useState<Message[]>([]);
  const [profile, setProfile] = useState<User | null>(null);
  const [text, setText] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    Promise.all([getMessages(), getProfile()])
      .then(([msgs, prof]) => {
        // filter to this conversation
        const filtered = msgs.filter(
          m => (m.senderId === prof.id && m.receiverId === receiverId) ||
               (m.senderId === receiverId && m.receiverId === prof.id)
        );
        setMessages(filtered);
        setProfile(prof);
      })
      .catch(() => {});
  }, [receiverId]);

  const handleSend = async () => {
    const content = text.trim();
    if (!content || !profile) return;
    setText('');
    try {
      const msg = await sendMessage(receiverId, content);
      setMessages(prev => [...prev, msg]);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    } catch { /* silently ignore */ }
  };
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 8 }}>
            <MaterialIcons name="arrow-back" size={24} color={Theme.colors.primary} />
          </TouchableOpacity>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarBorder}>
              <Image source={{ uri: receiverAvatar }} style={styles.avatarImage} />
            </View>
            <View style={styles.onlineBadge} />
          </View>
          <View>
            <Text style={styles.headerName}>{receiverName}</Text>
            <Text style={styles.activeText}>ACTIVE NOW</Text>
          </View>
        </View>
        <TouchableOpacity>
          <MaterialIcons name="more-vert" size={24} color={Theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView ref={scrollRef} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Timestamp Divider */}
          <View style={styles.timestampContainer}>
            <View style={styles.timestampBadge}>
              <Text style={styles.timestampText}>TODAY</Text>
            </View>
          </View>

          {messages.map((msg) => {
            const isOwn = msg.senderId === profile?.id;
            const timeStr = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            if (isOwn) {
              return (
                <View key={msg.id} style={styles.messageRowRight}>
                  <LinearGradient colors={[Theme.colors.primary, Theme.colors.primaryContainer]} style={styles.bubbleRight}>
                    <Text style={styles.messageTextRight}>{msg.content}</Text>
                  </LinearGradient>
                  <View style={styles.timeRowRight}>
                    <Text style={styles.timeTextRight}>{timeStr}</Text>
                    <MaterialIcons name={msg.isRead ? 'check-circle' : 'check'} size={12} color={Theme.colors.secondary} />
                  </View>
                </View>
              );
            }
            return (
              <View key={msg.id} style={styles.messageRowLeft}>
                <View style={styles.bubbleLeft}>
                  <Text style={styles.messageText}>{msg.content}</Text>
                </View>
                <Text style={styles.timeTextLeft}>{timeStr}</Text>
              </View>
            );
          })}
        </ScrollView>

        {/* Input Bar */}
        <View style={styles.inputArea}>
          <TouchableOpacity style={styles.addBtn}>
            <MaterialIcons name="add-circle" size={24} color={Theme.colors.primary} />
          </TouchableOpacity>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Send a neon spark..."
              placeholderTextColor="rgba(193,160,203,0.4)"
              value={text}
              onChangeText={setText}
              onSubmitEditing={handleSend}
              returnKeyType="send"
            />
            <TouchableOpacity style={styles.emojiBtn}>
              <MaterialIcons name="mood" size={24} color={Theme.colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
            <MaterialIcons name="send" size={20} color={Theme.colors.onPrimaryContainer} style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.surface },

  /* Header */
  header: {
    position: 'absolute', top: 0, width: '100%', zIndex: 50,
    backgroundColor: 'rgba(26,4,37,0.8)',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, height: 100, paddingTop: 40,
    shadowColor: Theme.colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.1, shadowRadius: 20,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarContainer: { position: 'relative' },
  avatarBorder: {
    width: 48, height: 48, borderRadius: 24,
    borderWidth: 2, borderColor: Theme.colors.secondary, padding: 2,
  },
  avatarImage: { width: '100%', height: '100%', borderRadius: 20 },
  onlineBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 12, height: 12, backgroundColor: Theme.colors.secondary,
    borderRadius: 6, borderWidth: 2, borderColor: Theme.colors.surface,
  },
  headerName: {
    fontWeight: 'bold', fontSize: 20, letterSpacing: -0.5,
    color: Theme.colors.primary,
  },
  activeText: {
    fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase',
    letterSpacing: 1.5, color: Theme.colors.secondary, marginTop: 2,
  },

  /* Chat Body */
  scrollContent: { paddingTop: 120, paddingHorizontal: 24, paddingBottom: 160, gap: 32 },

  timestampContainer: { alignItems: 'center' },
  timestampBadge: {
    backgroundColor: Theme.colors.surfaceContainerHigh,
    borderRadius: 16, paddingHorizontal: 16, paddingVertical: 4,
  },
  timestampText: {
    fontSize: 10, fontWeight: 'bold',
    color: Theme.colors.onSurfaceVariant, letterSpacing: 1.5,
  },

  /* Incoming Message */
  messageRowLeft: { alignSelf: 'flex-start', maxWidth: '85%' },
  bubbleLeft: {
    backgroundColor: Theme.colors.surfaceContainerHigh,
    padding: 20,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    borderBottomRightRadius: 24, borderBottomLeftRadius: 4,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.15, shadowRadius: 20,
    borderWidth: 1, borderColor: 'rgba(89,62,99,0.15)',
  },
  messageText: { color: Theme.colors.text, fontSize: 16, lineHeight: 24 },
  timeTextLeft: {
    marginTop: 8, marginLeft: 4,
    fontSize: 10, color: Theme.colors.onSurfaceVariant, fontWeight: '500',
  },

  /* Outgoing Message */
  messageRowRight: { alignSelf: 'flex-end', maxWidth: '85%', alignItems: 'flex-end' },
  bubbleRight: {
    padding: 20,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    borderBottomRightRadius: 4, borderBottomLeftRadius: 24,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 30,
  },
  messageTextRight: {
    color: Theme.colors.onPrimaryContainer, fontSize: 16,
    lineHeight: 24, fontWeight: 'bold',
  },
  timeRowRight: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8, marginRight: 4 },
  timeTextRight: { fontSize: 10, color: Theme.colors.onSurfaceVariant, fontWeight: '500' },

  /* Linked Activity Card */
  contextCard: {
    backgroundColor: Theme.colors.surfaceContainer,
    borderRadius: 16, padding: 24,
    borderWidth: 1, borderColor: 'rgba(89,62,99,0.1)',
  },
  contextHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  contextLabel: {
    fontWeight: '900', fontSize: 12,
    color: Theme.colors.secondary, letterSpacing: 1.5, marginBottom: 4,
    textTransform: 'uppercase',
  },
  contextTitle: {
    fontWeight: '900', fontStyle: 'italic', fontSize: 20,
    color: Theme.colors.text, textTransform: 'uppercase', letterSpacing: 1.5,
  },
  contextSubtitle: { fontSize: 14, color: Theme.colors.onSurfaceVariant, marginTop: 4 },
  contextIconBg: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(223,142,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },

  /* Typing Indicator */
  typingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  typingDots: { flexDirection: 'row', gap: 4 },
  typingDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Theme.colors.secondary },
  typingText: {
    fontSize: 10, fontWeight: 'bold',
    color: Theme.colors.secondary, letterSpacing: 1.5,
  },

  /* Input Bar */
  inputArea: {
    position: 'absolute', bottom: 0, width: '100%',
    paddingHorizontal: 24, paddingBottom: 40, paddingTop: 16,
    backgroundColor: 'rgba(26,4,37,0.9)',
    borderTopWidth: 1, borderTopColor: 'rgba(89,62,99,0.15)',
    flexDirection: 'row', alignItems: 'center', gap: 16,
  },
  addBtn: {
    width: 48, height: 48,
    backgroundColor: Theme.colors.surfaceContainer,
    borderRadius: 24, alignItems: 'center', justifyContent: 'center',
  },
  inputWrapper: { flex: 1, position: 'relative', justifyContent: 'center' },
  textInput: {
    backgroundColor: Theme.colors.surfaceContainerLowest,
    height: 56, borderRadius: 28,
    paddingHorizontal: 24, color: Theme.colors.text,
    fontSize: 14, fontWeight: '500',
  },
  emojiBtn: { position: 'absolute', right: 16 },
  sendBtn: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Theme.colors.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 20,
  },
});
