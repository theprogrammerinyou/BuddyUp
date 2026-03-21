import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ImageBackground, ActivityIndicator } from 'react-native';
import { Theme } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import BottomNavBar from '../components/BottomNavBar';
import { getFriendSuggestions, getFriends, getProfile } from '../api/api';
import type { User } from '../api/types';

export default function MatchesListScreen({ navigation }: any) {
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getFriendSuggestions(), getFriends(), getProfile()])
      .then(([sugg, frds, prof]) => {
        setSuggestions(sugg as User[]);
        setFriends(frds as User[]);
        setProfile(prof as User);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getCompatibility = (user: User) =>
    user.interests?.[0]
      ? `BOTH INTO ${user.interests[0].name.toUpperCase()}`
      : user.bio?.slice(0, 50).toUpperCase() ?? 'NEON NOCTURNE VIBES';

  if (loading) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={Theme.colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('UserProfile')} style={styles.avatarBorder}>
          <Image
            source={{ uri: profile?.avatarUrl ?? 'https://i.pravatar.cc/150?u=44' }}
            style={styles.headerAvatar}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PULSE</Text>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('NotificationsCenter')}>
          <MaterialIcons name="notifications" size={24} color={Theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* NEW VIBES Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderLine}>
            <Text style={styles.sectionTitle}>NEW VIBES</Text>
            <View style={styles.liveBadge}>
              <Text style={styles.liveBadgeText}>LIVE</Text>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.vibesScroll}>
            {suggestions.slice(0, 5).map((user) => (
              <TouchableOpacity key={user.id} style={styles.vibeItem}>
                <LinearGradient colors={[Theme.colors.secondary, Theme.colors.primary]} style={styles.vibeRing}>
                  <Image source={{ uri: user.avatarUrl }} style={styles.vibeAvatar} />
                  {user.isOnline && <View style={styles.vibeOnlineDot} />}
                </LinearGradient>
                <Text style={styles.vibeName}>{user.name.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Find Friends */}
        <TouchableOpacity style={styles.findFriendsBtn} onPress={() => navigation.navigate('FriendsDiscovery')}>
          <MaterialIcons name="person-add" size={20} color={Theme.colors.onSecondary} />
          <Text style={styles.findFriendsBtnText}>FIND FRIENDS</Text>
        </TouchableOpacity>

        {/* ACTIVE CONNECTIONS Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { marginBottom: 24 }]}>ACTIVE CONNECTIONS</Text>

          <View style={styles.connectionsList}>
            {friends.map((user) => (
              <TouchableOpacity
                key={user.id}
                style={styles.cardContainer}
                activeOpacity={0.9}
                onPress={() => navigation.navigate('UserProfile')}
              >
                <ImageBackground
                  source={{ uri: user.avatarUrl }}
                  style={styles.cardBg}
                  imageStyle={styles.cardBgImage}
                >
                  <LinearGradient
                    colors={['transparent', 'rgba(26,4,37,0.8)', '#1a0425']}
                    style={styles.cardGradient}
                  >
                    <View style={styles.cardContent}>
                      <View style={styles.glassPanel}>
                        <View>
                          <Text style={styles.cardName}>{user.name.toUpperCase()}</Text>
                          <View style={styles.sharedInterestRow}>
                            <MaterialIcons name="bolt" size={16} color={Theme.colors.secondary} />
                            <Text style={styles.sharedInterestText}>{getCompatibility(user)}</Text>
                          </View>
                        </View>
                        <View style={styles.cardActions}>
                          <TouchableOpacity
                            style={styles.msgBtn}
                            onPress={() => navigation.navigate('MessagesChat', { userId: user.id, userName: user.name })}
                          >
                            <Text style={styles.msgBtnText}>MESSAGE</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.favBtn}>
                            <MaterialIcons name="favorite" size={24} color={Theme.colors.primary} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </LinearGradient>
                </ImageBackground>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavBar activeTab="activity" navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },

  // Header
  header: {
    position: 'absolute', top: 0, width: '100%', zIndex: 50,
    backgroundColor: 'rgba(26,4,37,0.8)',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, height: 100, paddingTop: 40,
    shadowColor: Theme.colors.primary, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1, shadowRadius: 20,
  },
  avatarBorder: {
    width: 44, height: 44, borderRadius: 22,
    borderWidth: 2, borderColor: Theme.colors.secondary, padding: 2,
  },
  headerAvatar: { width: '100%', height: '100%', borderRadius: 20 },
  headerTitle: {
    fontWeight: '900', fontSize: 28, color: Theme.colors.text,
    letterSpacing: -1, textTransform: 'uppercase',
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Theme.colors.surfaceContainerHighest,
    alignItems: 'center', justifyContent: 'center',
  },

  // Scroll
  scrollContent: { paddingTop: 120, paddingHorizontal: 24, paddingBottom: 120, gap: 48 },

  // Sections
  section: {},
  sectionHeaderLine: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: '900', fontSize: 24, letterSpacing: -0.5,
    color: Theme.colors.text, textTransform: 'uppercase',
    fontStyle: 'italic',
  },
  liveBadge: {
    backgroundColor: Theme.colors.secondary,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12,
  },
  liveBadgeText: {
    color: Theme.colors.onSecondary, fontSize: 10, fontWeight: 'bold',
    textTransform: 'uppercase', letterSpacing: 1.5,
  },

  // Vibes
  vibesScroll: { gap: 20, paddingHorizontal: 4, paddingBottom: 8 },
  vibeItem: { alignItems: 'center', gap: 12 },
  vibeRing: { width: 80, height: 80, borderRadius: 40, padding: 4 },
  vibeAvatar: {
    width: '100%', height: '100%', borderRadius: 36,
    borderWidth: 2, borderColor: Theme.colors.background,
  },
  vibeOnlineDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 20, height: 20, backgroundColor: Theme.colors.secondary,
    borderRadius: 10, borderWidth: 4, borderColor: Theme.colors.background,
  },
  vibeName: {
    fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase',
    letterSpacing: 1.5, color: Theme.colors.onSurfaceVariant,
  },

  // Find Friends
  findFriendsBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: Theme.colors.secondary, borderRadius: 9999,
    paddingVertical: 16, marginBottom: 8,
    shadowColor: Theme.colors.secondary, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3, shadowRadius: 20,
  },
  findFriendsBtnText: {
    color: Theme.colors.onSecondary, fontWeight: '900', fontSize: 14,
    textTransform: 'uppercase', letterSpacing: 2,
  },

  // Connections
  connectionsList: { gap: 24 },
  cardContainer: {
    width: '100%', aspectRatio: 4 / 5, borderRadius: 24,
    overflow: 'hidden', backgroundColor: Theme.colors.surfaceContainerHighest,
    shadowColor: '#000', shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5, shadowRadius: 30,
  },
  cardBg: { width: '100%', height: '100%' },
  cardBgImage: { width: '100%', height: '100%', borderRadius: 24 },
  cardGradient: { flex: 1, justifyContent: 'flex-end', padding: 32 },
  cardContent: { width: '100%' },
  glassPanel: {
    backgroundColor: 'rgba(41,12,54,0.4)', borderRadius: 16,
    padding: 24, borderWidth: 1, borderColor: 'rgba(89,62,99,0.15)', gap: 16,
  },
  cardName: {
    fontSize: 32, fontStyle: 'italic', fontWeight: '900',
    color: Theme.colors.text, textTransform: 'uppercase', letterSpacing: -1,
  },
  sharedInterestRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  sharedInterestText: {
    fontSize: 12, fontWeight: 'bold', color: Theme.colors.secondary,
    textTransform: 'uppercase', letterSpacing: 1.5,
  },
  cardActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  msgBtn: {
    flex: 1, backgroundColor: Theme.colors.primary, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center', paddingVertical: 16,
    shadowColor: Theme.colors.primary, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3, shadowRadius: 20,
  },
  msgBtnText: {
    color: Theme.colors.onPrimary, fontWeight: '900', fontSize: 12,
    textTransform: 'uppercase', letterSpacing: 2,
  },
  favBtn: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: 'rgba(57,22,72,0.6)', borderWidth: 1,
    borderColor: 'rgba(89,62,99,0.3)', alignItems: 'center', justifyContent: 'center',
  },
});
