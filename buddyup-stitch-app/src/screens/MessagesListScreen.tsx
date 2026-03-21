import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
import { Theme } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import BottomNavBar from '../components/BottomNavBar';
import { getConversations, getProfile } from '../api/api';
import type { Conversation, User } from '../api/types';

export default function MessagesListScreen({ navigation }: any) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getConversations(), getProfile()])
      .then(([convos, prof]) => { setConversations(convos); setProfile(prof); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getOtherUser = (convo: Conversation) =>
    convo.user1Id === profile?.id ? convo.user2 : convo.user1;

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    if (diffMs < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diffMs < 172800000) return 'Yesterday';
    return d.toLocaleDateString([], { weekday: 'short' });
  };
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('UserProfile')}>
          <View style={styles.headerAvatarBorder}>
            <Image source={{ uri: profile?.avatarUrl ?? 'https://i.pravatar.cc/150?u=44' }} style={styles.headerAvatarImage} />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity onPress={() => navigation.navigate('NotificationsCenter')}>
          <MaterialIcons name="notifications-none" size={28} color={Theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Quick Contacts Row — first 5 conversation partners */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickContactsRow}>
          {conversations.slice(0, 5).map((convo) => {
            const other = getOtherUser(convo);
            if (!other) return null;
            return (
              <TouchableOpacity key={convo.id} style={styles.quickContactItem} onPress={() => navigation.navigate('MessagesChat', { receiverId: other.id, receiverName: other.name, receiverAvatar: other.avatarUrl })}>
                <View style={styles.quickAvatarWrap}>
                  <View style={[styles.quickAvatarRing, other.isOnline && styles.quickAvatarRingOnline]}>
                    <Image source={{ uri: other.avatarUrl ?? `https://i.pravatar.cc/150?u=${other.id}` }} style={styles.quickAvatarImage} />
                  </View>
                  {other.isOnline && <View style={styles.quickOnlineDot} />}
                </View>
                <Text style={styles.quickContactName}>{other.name?.split(' ')[0]}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Conversation List */}
        {loading ? (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <ActivityIndicator color={Theme.colors.primary} />
          </View>
        ) : (
        <View style={styles.conversationList}>
          {conversations.map((convo) => {
            const other = getOtherUser(convo);
            if (!other) return null;
            return (
              <TouchableOpacity
                key={convo.id}
                style={styles.convoCard}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('MessagesChat', { receiverId: other.id, receiverName: other.name, receiverAvatar: other.avatarUrl })}
              >
                <View style={styles.convoAvatarWrap}>
                  <Image source={{ uri: other.avatarUrl ?? `https://i.pravatar.cc/150?u=${other.id}` }} style={styles.convoAvatar} />
                  {other.isOnline && <View style={styles.convoOnlineDot} />}
                </View>
                <View style={styles.convoTextWrap}>
                  <View style={styles.convoTopRow}>
                    <Text style={styles.convoName}>{other.name}</Text>
                    <Text style={styles.convoTime}>{formatTime(convo.updatedAt)}</Text>
                  </View>
                  <View style={styles.convoBottomRow}>
                    <Text style={styles.convoPreview} numberOfLines={1}>{convo.lastMessage || 'Start a conversation'}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
        )}
      </ScrollView>

      {/* Bottom Nav */}
      <BottomNavBar activeTab="messages" navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  header: {
    position: 'absolute', top: 0, width: '100%', zIndex: 50,
    backgroundColor: 'rgba(26,4,37,0.8)',
    height: 100, paddingTop: 40,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24,
    shadowColor: Theme.colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.1, shadowRadius: 20,
  },
  headerAvatarBorder: {
    width: 44, height: 44, borderRadius: 22,
    borderWidth: 2, borderColor: Theme.colors.secondary,
    padding: 2,
  },
  headerAvatarImage: { width: '100%', height: '100%', borderRadius: 20 },
  headerTitle: {
    fontWeight: '900', fontSize: 20, color: '#ffffff',
    letterSpacing: 0.5,
  },

  scrollContent: { paddingTop: 120, paddingBottom: 120 },

  /* Quick Contacts */
  quickContactsRow: { gap: 20, paddingHorizontal: 24, paddingBottom: 24 },
  quickContactItem: { alignItems: 'center', gap: 8 },
  quickAvatarWrap: { position: 'relative' },
  quickAvatarRing: {
    width: 64, height: 64, borderRadius: 32,
    borderWidth: 2, borderColor: Theme.colors.outlineVariant,
    padding: 2,
  },
  quickAvatarRingOnline: {
    borderColor: Theme.colors.secondary,
    shadowColor: Theme.colors.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  quickAvatarImage: { width: '100%', height: '100%', borderRadius: 28 },
  quickOnlineDot: {
    position: 'absolute', bottom: 2, right: 2,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: Theme.colors.secondary,
    borderWidth: 2, borderColor: Theme.colors.background,
  },
  quickContactName: {
    fontSize: 11, fontWeight: 'bold',
    textTransform: 'uppercase', letterSpacing: 1,
    color: Theme.colors.onSurfaceVariant,
  },

  /* Conversation List */
  conversationList: { paddingHorizontal: 24, gap: 4 },
  convoCard: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    paddingVertical: 16, paddingHorizontal: 16,
    borderRadius: 16,
  },
  convoCardActive: {
    backgroundColor: Theme.colors.surfaceContainerHigh,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
  },
  convoAvatarWrap: { position: 'relative' },
  convoAvatar: {
    width: 48, height: 48, borderRadius: 24,
    borderWidth: 1, borderColor: 'rgba(89,62,99,0.3)',
  },
  convoOnlineDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: Theme.colors.secondary,
    borderWidth: 2, borderColor: Theme.colors.background,
  },
  convoTextWrap: { flex: 1 },
  convoTopRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 4,
  },
  convoName: { fontWeight: 'bold', fontSize: 16, color: Theme.colors.text },
  convoTime: {
    fontSize: 11, fontWeight: '600',
    color: Theme.colors.onSurfaceVariant,
  },
  convoBottomRow: { flexDirection: 'row', alignItems: 'center' },
  convoPreview: {
    flex: 1, fontSize: 14,
    color: Theme.colors.onSurfaceVariant,
  },
  unreadDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: Theme.colors.secondary,
    marginLeft: 8,
    shadowColor: Theme.colors.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
  },
});
