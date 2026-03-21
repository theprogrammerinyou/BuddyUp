import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Theme } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import BottomNavBar from '../components/BottomNavBar';
import { getNotifications, markNotificationsRead, getProfile } from '../api/api';
import type { Notification, User } from '../api/types';

const relTime = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  if (diff < 60000) return 'JUST NOW';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}M AGO`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}H AGO`;
  return `${Math.floor(diff / 86400000)}D AGO`;
};

export default function NotificationsCenterScreen({ navigation }: any) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [profile, setProfile] = useState<User | null>(null);

  useEffect(() => {
    Promise.all([getNotifications(), getProfile()])
      .then(([notifs, prof]) => { setNotifications(notifs); setProfile(prof); })
      .catch(() => {});
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await markNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch { /* ignore */ }
  };

  const matchNotifs = notifications.filter(n => n.type === 'match');
  const activityNotifs = notifications.filter(n => n.type === 'activity');
  const messageNotifs = notifications.filter(n => n.type === 'message');
  const unreadCount = notifications.filter(n => !n.isRead).length;
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('UserProfile')}>
          <LinearGradient
            colors={[Theme.colors.secondary, Theme.colors.primary, Theme.colors.secondary]}
            style={styles.storyRing}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Image source={{ uri: profile?.avatarUrl ?? 'https://i.pravatar.cc/150?u=44' }} style={styles.headerAvatar} />
          </LinearGradient>
        </TouchableOpacity>
        <Text style={styles.logoText}>NEON</Text>
        <TouchableOpacity>
          <MaterialIcons name="notifications" size={28} color={Theme.colors.secondary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Title Area */}
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.subtitle}>YOUR PULSE</Text>
            <Text style={styles.title}>Notifications</Text>
          </View>
          <TouchableOpacity style={styles.markReadBtn} onPress={handleMarkAllRead}>
            <Text style={styles.markReadText}>MARK ALL AS READ</Text>
          </TouchableOpacity>
        </View>

        {/* Section: New Matches */}
        {matchNotifs.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="favorite" size={24} color={Theme.colors.secondary} />
            <Text style={styles.sectionTitle}>NEW MATCHES</Text>
            <TouchableOpacity style={styles.viewAllBtn} onPress={() => navigation.navigate('MatchesList')}>
              <Text style={styles.viewAllText}>SEE ALL</Text>
            </TouchableOpacity>
          </View>

          {matchNotifs.map((notif, i) => (
            <TouchableOpacity
              key={notif.id}
              style={!notif.isRead ? styles.notifCardActive : styles.notifCard}
              onPress={() => navigation.navigate('MatchesList')}
            >
              {!notif.isRead && <View style={styles.activeIndicator} />}
              <View style={styles.avatarWrap}>
                <View style={styles.matchAvatarRing}>
                  <Image source={{ uri: `https://i.pravatar.cc/150?u=notif_match_${notif.id}` }} style={styles.notifAvatar} />
                </View>
                <View style={styles.matchIconBadge}>
                  <MaterialIcons name="bolt" size={10} color={Theme.colors.onSecondary} />
                </View>
              </View>
              <View style={styles.notifTextWrap}>
                <View style={styles.notifTopRow}>
                  <Text style={styles.notifTitle}>{notif.title}</Text>
                  <Text style={styles.timeText}>{relTime(notif.createdAt)}</Text>
                </View>
                <Text style={styles.notifBody}>{notif.body}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        )}

        {/* Section: Activity */}
        {activityNotifs.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="bolt" size={24} color={Theme.colors.secondary} />
            <Text style={styles.sectionTitle}>ACTIVITY</Text>
          </View>

          {activityNotifs.map((notif) => (
            <TouchableOpacity key={notif.id} style={styles.notifCardBlur} onPress={() => navigation.navigate('DiscoveryFeed')}>
              <View style={styles.iconBox}>
                <MaterialIcons name="flash-on" size={28} color={Theme.colors.secondary} />
              </View>
              <View style={styles.notifTextWrap}>
                <View style={styles.notifTopRow}>
                  <Text style={styles.notifTitle}>{notif.title}</Text>
                  <Text style={styles.timeText}>{relTime(notif.createdAt)}</Text>
                </View>
                <Text style={styles.notifBody}>{notif.body}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        )}

        {/* Section: Messages */}
        {messageNotifs.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="chat-bubble" size={24} color={Theme.colors.primary} />
            <Text style={styles.sectionTitle}>MESSAGES</Text>
            {unreadCount > 0 && (
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>{unreadCount} NEW</Text>
              </View>
            )}
          </View>

          {messageNotifs.map((notif) => (
            <TouchableOpacity
              key={notif.id}
              style={!notif.isRead ? styles.notifCardActive : styles.notifCard}
              onPress={() => navigation.navigate('MessagesList')}
            >
              {!notif.isRead && <View style={[styles.activeIndicator, { backgroundColor: Theme.colors.primary, shadowColor: Theme.colors.primary }]} />}
              <View style={styles.avatarWrap}>
                <Image source={{ uri: `https://i.pravatar.cc/150?u=notif_msg_${notif.id}` }} style={styles.notifAvatar} />
              </View>
              <View style={styles.notifTextWrap}>
                <View style={styles.notifTopRow}>
                  <Text style={styles.notifTitle}>{notif.title}</Text>
                  <Text style={styles.timeText}>{relTime(notif.createdAt)}</Text>
                </View>
                <Text style={[styles.notifBody, { fontWeight: '600' }]} numberOfLines={1}>{notif.body}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        )}

        {notifications.length === 0 && (
          <View style={{ alignItems: 'center', paddingVertical: 60 }}>
            <MaterialIcons name="notifications-none" size={48} color={Theme.colors.outline} />
            <Text style={{ color: Theme.colors.outline, marginTop: 12, fontWeight: '600' }}>No notifications yet</Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Nav */}
      <BottomNavBar activeTab="profile" navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },

  /* Header */
  header: {
    position: 'absolute', top: 0, width: '100%', zIndex: 50,
    backgroundColor: 'rgba(26,4,37,0.8)',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, height: 100, paddingTop: 40,
    shadowColor: Theme.colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.1, shadowRadius: 20,
  },
  storyRing: { width: 44, height: 44, borderRadius: 22, padding: 2 },
  headerAvatar: {
    width: '100%', height: '100%', borderRadius: 20,
    borderWidth: 2, borderColor: Theme.colors.background,
  },
  logoText: {
    fontWeight: '900', fontStyle: 'italic', fontSize: 28,
    letterSpacing: -1, color: Theme.colors.secondary,
  },

  /* Scroll Content */
  scrollContent: { paddingTop: 120, paddingHorizontal: 24, paddingBottom: 120, gap: 40 },

  /* Title Area */
  titleRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-end', marginBottom: 16,
  },
  subtitle: {
    color: Theme.colors.secondary, fontWeight: 'bold', fontSize: 12,
    textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4,
  },
  title: {
    fontWeight: '900', fontSize: 36, color: Theme.colors.text,
  },
  markReadBtn: {
    borderBottomWidth: 1, borderBottomColor: 'rgba(223,142,255,0.3)', paddingBottom: 4,
  },
  markReadText: {
    color: Theme.colors.primary, fontWeight: 'bold', fontSize: 10,
    textTransform: 'uppercase', letterSpacing: 2,
  },

  /* Section */
  section: { gap: 16 },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8,
  },
  viewAllBtn: {
    marginLeft: 'auto',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(47,248,1,0.4)',
    paddingBottom: 2,
  },
  viewAllText: {
    color: Theme.colors.secondary,
    fontWeight: '900',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  sectionTitle: {
    fontWeight: '900', fontStyle: 'italic', fontSize: 20,
    textTransform: 'uppercase', letterSpacing: 1.5, color: Theme.colors.text,
  },

  /* Notification Cards */
  notifCardActive: {
    backgroundColor: Theme.colors.surfaceContainer,
    borderRadius: 16, padding: 20,
    flexDirection: 'row', gap: 16, overflow: 'hidden',
  },
  activeIndicator: {
    position: 'absolute', left: 0, top: 0, bottom: 0, width: 4,
    backgroundColor: Theme.colors.secondary,
    shadowColor: Theme.colors.secondary,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 10,
  },
  notifCard: {
    backgroundColor: Theme.colors.surfaceContainer,
    borderRadius: 16, padding: 20,
    flexDirection: 'row', gap: 16,
  },
  notifCardBlur: {
    backgroundColor: 'rgba(41,12,54,0.6)',
    borderRadius: 16, padding: 20,
    flexDirection: 'row', gap: 16,
    borderWidth: 1, borderColor: 'rgba(89,62,99,0.1)',
  },

  /* Avatars */
  avatarWrap: { position: 'relative' },
  matchAvatarRing: {
    width: 60, height: 60, borderRadius: 30,
    borderWidth: 2, borderColor: Theme.colors.secondary, padding: 2,
  },
  notifAvatar: {
    width: 56, height: 56, borderRadius: 28,
    borderWidth: 2, borderColor: 'rgba(89,62,99,0.3)',
  },
  matchIconBadge: {
    position: 'absolute', bottom: -4, right: -4,
    backgroundColor: Theme.colors.secondary,
    width: 20, height: 20, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  iconBox: {
    width: 56, height: 56, borderRadius: 16,
    backgroundColor: Theme.colors.surfaceContainerHighest,
    alignItems: 'center', justifyContent: 'center',
  },

  /* Notification Text */
  notifTextWrap: { flex: 1 },
  notifTopRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 4,
  },
  notifTitle: { fontWeight: 'bold', fontSize: 16, color: Theme.colors.text },
  timeText: {
    fontSize: 10, fontWeight: 'bold',
    color: Theme.colors.onSurfaceVariant, textTransform: 'uppercase',
  },
  notifBody: { fontSize: 14, color: Theme.colors.onSurfaceVariant, lineHeight: 22 },

  /* New Badge */
  newBadge: {
    backgroundColor: Theme.colors.secondary, borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 2,
  },
  newBadgeText: {
    color: Theme.colors.onSecondary, fontSize: 10,
    fontWeight: 'bold', letterSpacing: 1, textTransform: 'uppercase',
  },

  /* Horizontal Match Cards */
  matchCardsRow: { gap: 16, paddingVertical: 8 },
  matchCard: {
    width: 160, height: 220, borderRadius: 20, overflow: 'hidden',
    backgroundColor: Theme.colors.surfaceContainerHighest,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4, shadowRadius: 20,
  },
  matchCardImage: {
    width: '100%', height: '100%', position: 'absolute',
  },
  matchCardGradient: {
    flex: 1, justifyContent: 'flex-end', padding: 16,
  },
  matchCardContent: {},
  matchCardName: {
    fontWeight: '900', fontStyle: 'italic', fontSize: 20,
    color: Theme.colors.text, textTransform: 'uppercase', letterSpacing: 1.5,
  },
  matchCardTagline: {
    fontSize: 12, fontWeight: 'bold',
    color: Theme.colors.secondary, textTransform: 'uppercase',
    letterSpacing: 1.5, marginTop: 2,
  },
});
