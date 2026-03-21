import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
import { Theme } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import BottomNavBar from '../components/BottomNavBar';
import { getLeaderboard, getProfile } from '../api/api';
import type { User } from '../api/types';

const CATEGORIES = ['All', 'Gym', 'Coding'];

export default function ActivityLeaderboardScreen({ navigation }: any) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [leaderboard, setLeaderboard] = useState<User[]>([]);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getLeaderboard(), getProfile()])
      .then(([lb, prof]) => { setLeaderboard(lb); setProfile(prof); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);
  const myRank = profile ? leaderboard.findIndex(u => u.id === profile.id) + 1 : 0;
  const fmtPts = (pts: number) => pts?.toLocaleString() ?? '0';

  return (
    <View style={styles.container}>
      {/* Header: Avatar left, NEON centered, bell right */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('UserProfile')} style={styles.avatarBorder}>
          <Image
            source={{ uri: profile?.avatarUrl ?? 'https://i.pravatar.cc/150?u=mainuser' }}
            style={styles.headerAvatar}
          />
        </TouchableOpacity>
        <Text style={styles.logoText}>NEON</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <MaterialIcons name="notifications" size={24} color={Theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.titleWhite}>LEADER</Text>
          <Text style={styles.titleGreen}>BOARD</Text>
        </View>

        {/* Category pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsRow}>
          {CATEGORIES.map((cat) => {
            const isActive = cat === activeCategory;
            return (
              <TouchableOpacity
                key={cat}
                style={isActive ? styles.pillActive : styles.pillInactive}
                onPress={() => setActiveCategory(cat)}
              >
                <Text style={isActive ? styles.pillActiveText : styles.pillInactiveText}>{cat}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {loading ? (
          <View style={{ alignItems: 'center', paddingVertical: 60 }}>
            <ActivityIndicator color={Theme.colors.primary} size="large" />
          </View>
        ) : (
        <>
        {/* Top 3 Podium */}
        <View style={styles.podiumSection}>
          {/* 2nd Place */}
          <View style={styles.podiumItem}>
            <View style={styles.avatarWrapMedium}>
              <LinearGradient colors={[Theme.colors.primary, Theme.colors.primaryContainer]} style={styles.avatarRingMedium}>
                <Image source={{ uri: top3[1]?.avatarUrl ?? `https://i.pravatar.cc/150?u=${top3[1]?.id ?? 2}` }} style={styles.avatarImgMedium} />
              </LinearGradient>
              <View style={styles.rankBadgePurple}>
                <Text style={styles.rankBadgeText}>2</Text>
              </View>
            </View>
            <Text style={styles.podiumName}>{top3[1]?.name ?? '—'}</Text>
            <Text style={styles.podiumPtsSmall}>{fmtPts(top3[1]?.points)} PT</Text>
          </View>

          {/* 1st Place */}
          <View style={[styles.podiumItem, { marginTop: -32 }]}>
            <View style={styles.avatarWrapLarge}>
              <LinearGradient colors={[Theme.colors.secondary, Theme.colors.primary]} style={styles.avatarRingLarge}>
                <View style={styles.avatarInnerLarge}>
                  <Image source={{ uri: top3[0]?.avatarUrl ?? `https://i.pravatar.cc/150?u=${top3[0]?.id ?? 1}` }} style={styles.avatarImgLarge} />
                </View>
              </LinearGradient>
              <MaterialIcons name="workspace-premium" size={32} color={Theme.colors.tertiaryDim} style={styles.crownIcon} />
            </View>
            <Text style={styles.podiumNameLarge}>{top3[0]?.name ?? '—'}</Text>
            <Text style={styles.podiumPtsLarge}>{fmtPts(top3[0]?.points)} PT</Text>
          </View>

          {/* 3rd Place */}
          <View style={styles.podiumItem}>
            <View style={styles.avatarWrapMedium}>
              <LinearGradient colors={[Theme.colors.primary, Theme.colors.primaryContainer]} style={styles.avatarRingMedium}>
                <Image source={{ uri: top3[2]?.avatarUrl ?? `https://i.pravatar.cc/150?u=${top3[2]?.id ?? 3}` }} style={styles.avatarImgMedium} />
              </LinearGradient>
              <View style={styles.rankBadgePurple}>
                <Text style={styles.rankBadgeText}>3</Text>
              </View>
            </View>
            <Text style={styles.podiumName}>{top3[2]?.name ?? '—'}</Text>
            <Text style={styles.podiumPtsSmall}>{fmtPts(top3[2]?.points)} PT</Text>
          </View>
        </View>

        {/* Global Rankings heading + your rank */}
        <View style={styles.globalHeader}>
          <Text style={styles.globalHeading}>GLOBAL RANKINGS</Text>
          {myRank > 0 && (
            <View style={styles.yourRankBadge}>
              <Text style={styles.yourRankText}>Your Rank: #{myRank}</Text>
            </View>
          )}
        </View>

        {/* Leaderboard list */}
        <View style={styles.listSection}>
          {rest.map((user, idx) => (
            <View key={user.id} style={styles.listItem}>
              <Text style={styles.listRank}>#{String(idx + 4).padStart(2, '0')}</Text>
              <View style={styles.listAvatarWrap}>
                <Image source={{ uri: user.avatarUrl ?? `https://i.pravatar.cc/150?u=${user.id}` }} style={styles.listAvatarImage} />
              </View>
              <View style={styles.listInfo}>
                <Text style={styles.listName}>{user.name}</Text>
                <Text style={styles.listSubtitle}>{user.interests?.[0]?.name ?? 'Member'}</Text>
              </View>
              <Text style={styles.listPts}>{fmtPts(user.points)}</Text>
            </View>
          ))}
        </View>
        </>
        )}
      </ScrollView>

      <BottomNavBar activeTab="activity" navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  header: {
    position: 'absolute', top: 0, width: '100%', zIndex: 50,
    backgroundColor: 'rgba(26,4,37,0.8)',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, height: 100, paddingTop: 40,
    borderBottomWidth: 1, borderBottomColor: 'rgba(223,142,255,0.05)',
  },
  avatarBorder: {
    width: 44, height: 44, borderRadius: 22, borderWidth: 2,
    borderColor: Theme.colors.secondary, padding: 2,
  },
  headerAvatar: { width: '100%', height: '100%', borderRadius: 20 },
  logoText: {
    fontWeight: '900', fontStyle: 'italic', fontSize: 22,
    color: Theme.colors.primary, letterSpacing: 2, textTransform: 'uppercase',
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Theme.colors.surfaceContainerHighest,
    alignItems: 'center', justifyContent: 'center',
  },

  scrollContent: { paddingTop: 120, paddingHorizontal: 24, paddingBottom: 120 },

  titleSection: { flexDirection: 'row', gap: 12, alignItems: 'baseline', marginBottom: 24 },
  titleWhite: {
    fontWeight: '900', fontStyle: 'italic', fontSize: 38,
    color: Theme.colors.text, letterSpacing: -1, textTransform: 'uppercase',
  },
  titleGreen: {
    fontWeight: '900', fontStyle: 'italic', fontSize: 38,
    color: Theme.colors.secondary, letterSpacing: -1, textTransform: 'uppercase',
  },

  pillsRow: { gap: 10, marginBottom: 32 },
  pillActive: {
    backgroundColor: Theme.colors.primary, paddingHorizontal: 24, paddingVertical: 10,
    borderRadius: 24,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 20,
  },
  pillActiveText: { color: Theme.colors.onPrimary, fontWeight: 'bold', fontSize: 14 },
  pillInactive: {
    backgroundColor: Theme.colors.surfaceContainerHigh, paddingHorizontal: 24,
    paddingVertical: 10, borderRadius: 24, borderWidth: 1,
    borderColor: 'rgba(89,62,99,0.15)',
  },
  pillInactiveText: { color: Theme.colors.onSurfaceVariant, fontWeight: 'bold', fontSize: 14 },

  podiumSection: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end',
    gap: 16, paddingTop: 40, marginBottom: 48,
  },
  podiumItem: { alignItems: 'center', flex: 1 },

  avatarWrapMedium: { position: 'relative', marginBottom: 12 },
  avatarRingMedium: { padding: 3, borderRadius: 34 },
  avatarImgMedium: {
    width: 64, height: 64, borderRadius: 32,
    borderWidth: 2, borderColor: Theme.colors.background,
  },
  rankBadgePurple: {
    position: 'absolute', bottom: -6, right: -2,
    backgroundColor: Theme.colors.surfaceContainerHighest,
    borderWidth: 1, borderColor: 'rgba(223,142,255,0.3)',
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8,
  },
  rankBadgeText: { color: Theme.colors.primary, fontWeight: '900', fontSize: 12 },
  podiumName: { fontWeight: 'bold', fontSize: 13, color: Theme.colors.text, marginBottom: 2 },
  podiumPtsSmall: {
    color: Theme.colors.secondary, fontWeight: '800', fontSize: 11,
    letterSpacing: 1,
  },

  avatarWrapLarge: { position: 'relative', marginBottom: 16 },
  avatarRingLarge: {
    padding: 4, borderRadius: 52,
    shadowColor: Theme.colors.secondary,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 30,
  },
  avatarInnerLarge: {
    width: 96, height: 96, borderRadius: 48,
    borderWidth: 4, borderColor: Theme.colors.surface, overflow: 'hidden',
  },
  avatarImgLarge: { width: '100%', height: '100%' },
  crownIcon: {
    position: 'absolute', top: -16, alignSelf: 'center',
    shadowColor: Theme.colors.tertiaryDim,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 10,
  },
  podiumNameLarge: {
    fontWeight: '900', fontSize: 16, color: Theme.colors.text,
    letterSpacing: -0.5, marginBottom: 2,
  },
  podiumPtsLarge: {
    color: Theme.colors.secondary, fontWeight: '900', fontSize: 14,
    letterSpacing: 1,
    textShadowColor: 'rgba(47,248,1,0.5)', textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },

  globalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 20,
  },
  globalHeading: {
    fontWeight: '900', fontStyle: 'italic', fontSize: 14,
    color: Theme.colors.text, textTransform: 'uppercase', letterSpacing: 2,
  },
  yourRankBadge: {
    backgroundColor: 'rgba(223,142,255,0.15)', paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 12, borderWidth: 1, borderColor: 'rgba(223,142,255,0.2)',
  },
  yourRankText: {
    color: Theme.colors.primary, fontSize: 12, fontWeight: '800', letterSpacing: 0.5,
  },

  listSection: { gap: 12 },
  listItem: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Theme.colors.surfaceContainer, padding: 16,
    borderRadius: 16, borderWidth: 1, borderColor: 'rgba(89,62,99,0.05)',
  },
  listRank: {
    width: 36, fontWeight: '900', fontSize: 16, color: Theme.colors.primary,
  },
  listAvatarWrap: {
    width: 44, height: 44, borderRadius: 22, borderWidth: 2,
    borderColor: Theme.colors.surfaceVariant, overflow: 'hidden',
  },
  listAvatarImage: { width: '100%', height: '100%' },
  listInfo: { flex: 1 },
  listName: { fontWeight: 'bold', color: Theme.colors.text, fontSize: 14, marginBottom: 2 },
  listSubtitle: {
    fontSize: 11, color: Theme.colors.onSurfaceVariant, fontWeight: '600',
    letterSpacing: 0.5,
  },
  listPts: {
    fontWeight: '900', fontSize: 15, color: Theme.colors.secondary,
    letterSpacing: 0.5,
  },
});
