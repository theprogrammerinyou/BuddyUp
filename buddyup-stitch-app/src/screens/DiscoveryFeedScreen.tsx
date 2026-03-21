import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput, ImageBackground, ActivityIndicator } from 'react-native';
import { Theme } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import BottomNavBar from '../components/BottomNavBar';
import { getActivities, getFriends, getProfile } from '../api/api';
import type { Activity, User } from '../api/types';

const CATEGORIES = ['All', 'Gym', 'Coding', 'Sports', 'Gaming'];

export default function DiscoveryFeedScreen({ navigation }: any) {
  const [friends, setFriends] = useState<User[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [profile, setProfile] = useState<User | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  const loadData = useCallback((category: string) => {
    setLoading(true);
    Promise.all([
      getActivities(category),
      getFriends(),
      getProfile(),
    ])
      .then(([acts, frds, prof]) => {
        setActivities(acts);
        setFriends(frds);
        setProfile(prof);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadData('All');
  }, [loadData]);

  const onCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    loadData(cat);
  };

  const featured = activities[0];
  const sideActivities = activities.slice(1, 3);
  const trendingGaming = activities.filter((a) => a.category === 'Gaming').slice(0, 4);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.navigate('UserProfile')} style={styles.avatarBorder}>
            <Image
              source={{ uri: profile?.avatarUrl ?? 'https://i.pravatar.cc/150?u=mainuser' }}
              style={styles.headerAvatar}
            />
          </TouchableOpacity>
          <Text style={styles.logoText}>NEON NOCTURNE</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('NotificationsCenter')}>
          <MaterialIcons name="notifications" size={24} color={Theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={24} color={Theme.colors.outline} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Find your partner in crime..."
            placeholderTextColor={Theme.colors.outline}
          />
        </View>

        {/* Category Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {CATEGORIES.map((cat, idx) => (
            <TouchableOpacity
              key={cat}
              style={[
                activeCategory === cat ? styles.categoryPillActive : styles.categoryPill,
                idx === 0 && { marginLeft: 24 },
              ]}
              onPress={() => onCategoryChange(cat)}
            >
              <Text style={activeCategory === cat ? styles.categoryPillTextActive : styles.categoryPillText}>{cat}</Text>
            </TouchableOpacity>
          ))}
          <View style={{ width: 24 }} />
        </ScrollView>

        {loading ? (
          <View style={{ alignItems: 'center', paddingVertical: 60 }}>
            <ActivityIndicator color={Theme.colors.primary} size="large" />
          </View>
        ) : (
        <View style={styles.feedGrid}>
          {/* Featured Hero Card — first activity */}
          {featured && (
          <TouchableOpacity
            style={styles.featuredCard}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('ActivityDetails', { activityId: featured.id })}
          >
            <ImageBackground
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAt05gbZPZ8LmALgMj4U3UVgUoTX0lulZHBJPKdo2-38uwv1tVgK5-Wo5T_hu5wIJPcgtP-ZZAjT3aQRhs3hKuOwjwjFOWVjLBdBJpPfJiwurkGNvWdQD8S0J76j5eQYgBEL-lWaz12-Isn5uVP89WOyHFglQqz5KYa7AF840PkCadzKBa4Q3L5c3ZEdAeox5_gAuF7dnuFlJ0epJL2gnlrxQhTUUB17WTFvkN4mLIjetOCNNFidrAeoJixiiOKygjVgYg_7ZXdOA' }}
              style={styles.featuredImageBg}
              imageStyle={{ opacity: 0.5 }}
            >
              <LinearGradient colors={['transparent', Theme.colors.surface]} style={styles.featuredGradient} />
              <View style={styles.liveBadge}>
                <Text style={styles.liveBadgeText}>Live Now</Text>
              </View>
              <View style={styles.featuredContent}>
                <View style={styles.userRow}>
                  <Image source={{ uri: featured.host?.avatarUrl ?? 'https://i.pravatar.cc/150?u=1' }} style={styles.smallAvatar} />
                  <Text style={styles.userNameText}>{featured.host?.name ?? 'Unknown'}  ·  {featured.location}</Text>
                </View>
                <Text style={styles.featuredTitle}>{featured.title.toUpperCase()}</Text>
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.joinBtn}
                    onPress={() => navigation.navigate('ActivityDetails', { activityId: featured.id })}
                  >
                    <Text style={styles.joinBtnText}>JOIN SESSION</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.sendBtn}>
                    <MaterialIcons name="send" size={24} color={Theme.colors.text} />
                  </TouchableOpacity>
                </View>
              </View>
            </ImageBackground>
          </TouchableOpacity>
          )}

          {/* Stacked Text Cards — next activities */}
          <View style={styles.sideGrid}>
            {sideActivities[0] && (
            <TouchableOpacity style={styles.sideCard} activeOpacity={0.9} onPress={() => navigation.navigate('ActivityDetails', { activityId: sideActivities[0].id })}>
              <View style={[styles.cardDecor, { backgroundColor: Theme.colors.primary }]} />
              <View>
                <View style={styles.topRow}>
                  <View style={styles.userRowSmall}>
                    <Image source={{ uri: sideActivities[0].host?.avatarUrl ?? 'https://i.pravatar.cc/150?u=2' }} style={styles.microAvatar} />
                    <Text style={styles.userNameMicro}>{sideActivities[0].host?.name ?? 'Someone'}  ·  {sideActivities[0].location}</Text>
                  </View>
                  <MaterialIcons name="terminal" size={20} color="rgba(223,142,255,0.4)" />
                </View>
                <Text style={styles.sideCardTitle}>{sideActivities[0].title.toUpperCase()}</Text>
                <Text style={styles.sideCardSubtitle} numberOfLines={2}>{sideActivities[0].description}</Text>
              </View>
              <TouchableOpacity style={styles.sideActionBtn}>
                <Text style={styles.sideActionText}>SAY HI</Text>
              </TouchableOpacity>
            </TouchableOpacity>
            )}

            {sideActivities[1] && (
            <TouchableOpacity style={styles.sideCard} activeOpacity={0.9} onPress={() => navigation.navigate('ActivityDetails', { activityId: sideActivities[1].id })}>
              <View style={[styles.cardDecor, { backgroundColor: Theme.colors.secondary, left: -40, bottom: -40, top: undefined, right: undefined }]} />
              <View>
                <View style={styles.topRow}>
                  <View style={styles.userRowSmall}>
                    <Image source={{ uri: sideActivities[1].host?.avatarUrl ?? 'https://i.pravatar.cc/150?u=3' }} style={styles.microAvatar} />
                    <Text style={styles.userNameMicro}>{sideActivities[1].host?.name ?? 'Someone'}  ·  {sideActivities[1].location}</Text>
                  </View>
                  <MaterialIcons name="sports-basketball" size={20} color="rgba(47,248,1,0.4)" />
                </View>
                <Text style={[styles.sideCardTitle, { color: Theme.colors.secondary }]}>{sideActivities[1].title.toUpperCase()}</Text>
                <Text style={styles.sideCardSubtitle} numberOfLines={2}>{sideActivities[1].description}</Text>
              </View>
              <TouchableOpacity style={styles.sideActionBtn}>
                <Text style={styles.sideActionText}>REQUEST SPOT</Text>
              </TouchableOpacity>
            </TouchableOpacity>
            )}
          </View>

          {/* Trending Gaming Section */}
          <View style={styles.trendingSection}>
            <View style={styles.trendingHeader}>
              <Text style={styles.trendingTitle}>TRENDING GAMING</Text>
              <View style={styles.pulseDot} />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trendingScroll}>
              {trendingGaming.map((act) => (
                <TouchableOpacity
                  key={act.id}
                  style={styles.trendingCard}
                  onPress={() => navigation.navigate('ActivityDetails', { activityId: act.id })}
                >
                  <Image source={{ uri: act.host?.avatarUrl ?? 'https://i.pravatar.cc/150?u=99' }} style={styles.trendingAvatar} />
                  <Text style={styles.trendingName} numberOfLines={1}>{act.host?.name ?? 'Host'}</Text>
                  <Text style={styles.trendingGame} numberOfLines={1}>{act.title}</Text>
                  <Text style={styles.trendingSlots}>{act.attendees?.length ?? 0} joined</Text>
                  <TouchableOpacity style={styles.trendingJoinBtn} onPress={() => navigation.navigate('ActivityDetails', { activityId: act.id })}>
                    <Text style={styles.trendingJoinText}>JOIN</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
        )}
      </ScrollView>

      {/* Contextual FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CreateActivityStep1')}>
        <MaterialIcons name="add" size={32} color={Theme.colors.onPrimary} />
      </TouchableOpacity>

      {/* Bottom Navigation */}
      <BottomNavBar activeTab="explore" navigation={navigation} />
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
    borderBottomWidth: 1, borderBottomColor: 'rgba(223,142,255,0.05)',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatarBorder: {
    width: 44, height: 44, borderRadius: 22,
    borderWidth: 2, borderColor: Theme.colors.secondary, padding: 2,
  },
  headerAvatar: { width: '100%', height: '100%', borderRadius: 20 },
  logoText: {
    fontWeight: '900', fontStyle: 'italic', fontSize: 20,
    color: Theme.colors.secondary, letterSpacing: 1,
    textTransform: 'uppercase',
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Theme.colors.surfaceContainerHighest,
    alignItems: 'center', justifyContent: 'center',
  },

  // Scroll
  scrollContent: { paddingTop: 120, paddingHorizontal: 24, paddingBottom: 120 },

  // Search
  searchContainer: { position: 'relative', marginBottom: 32 },
  searchIcon: { position: 'absolute', left: 20, top: 18, zIndex: 10 },
  searchInput: {
    backgroundColor: Theme.colors.surfaceContainerLowest,
    height: 60, borderRadius: 16, paddingLeft: 56, paddingRight: 24,
    fontSize: 16, color: Theme.colors.text,
  },

  // Category pills
  categoryScroll: { marginBottom: 32, marginHorizontal: -24 },
  categoryPillActive: {
    paddingHorizontal: 32, height: 44, borderRadius: 22,
    backgroundColor: Theme.colors.primary, justifyContent: 'center', marginRight: 12,
    shadowColor: Theme.colors.primary, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4, shadowRadius: 20,
  },
  categoryPillTextActive: { color: Theme.colors.onPrimary, fontWeight: 'bold' },
  categoryPill: {
    paddingHorizontal: 32, height: 44, borderRadius: 22,
    backgroundColor: Theme.colors.surfaceContainerHigh, justifyContent: 'center',
    marginRight: 12, borderWidth: 1, borderColor: 'rgba(89,62,99,0.15)',
  },
  categoryPillText: { color: Theme.colors.onSurfaceVariant, fontWeight: 'bold' },

  // Feed
  feedGrid: { gap: 24 },

  // Featured card
  featuredCard: {
    width: '100%', aspectRatio: 4 / 5, borderRadius: 20,
    overflow: 'hidden', backgroundColor: Theme.colors.surfaceContainer,
  },
  featuredImageBg: { width: '100%', height: '100%' },
  featuredGradient: { position: 'absolute', bottom: 0, width: '100%', height: '60%' },
  liveBadge: {
    position: 'absolute', top: 24, right: 24,
    backgroundColor: 'rgba(47,248,1,0.2)', borderWidth: 1,
    borderColor: 'rgba(47,248,1,0.3)', paddingHorizontal: 16,
    paddingVertical: 6, borderRadius: 16,
  },
  liveBadgeText: {
    color: Theme.colors.secondary, fontWeight: '900', fontSize: 12,
    textTransform: 'uppercase', letterSpacing: 1.5,
  },
  featuredContent: { position: 'absolute', bottom: 0, width: '100%', padding: 32 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  smallAvatar: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(223,142,255,0.5)',
  },
  userNameText: { color: Theme.colors.text, fontWeight: '600', fontSize: 14 },
  featuredTitle: {
    fontWeight: '900', fontSize: 36, lineHeight: 40,
    letterSpacing: -1, color: Theme.colors.text, marginBottom: 24,
    fontStyle: 'italic', textTransform: 'uppercase',
  },
  actionRow: { flexDirection: 'row', gap: 12 },
  joinBtn: {
    flex: 1, height: 56, backgroundColor: Theme.colors.secondary,
    borderRadius: 28, alignItems: 'center', justifyContent: 'center',
    shadowColor: Theme.colors.secondary, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3, shadowRadius: 30,
  },
  joinBtnText: { color: Theme.colors.onSecondary, fontWeight: '900', fontSize: 14 },
  sendBtn: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: 'rgba(57,22,72,0.4)', borderWidth: 1,
    borderColor: 'rgba(89,62,99,0.3)', alignItems: 'center', justifyContent: 'center',
  },

  // Side cards
  sideGrid: { flexDirection: 'column', gap: 24 },
  sideCard: {
    backgroundColor: Theme.colors.surfaceContainer, borderRadius: 16,
    padding: 24, minHeight: 250, justifyContent: 'space-between', overflow: 'hidden',
  },
  cardDecor: {
    position: 'absolute', top: -40, right: -40,
    width: 160, height: 160, borderRadius: 80, opacity: 0.1,
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  userRowSmall: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  microAvatar: { width: 32, height: 32, borderRadius: 16 },
  userNameMicro: {
    fontSize: 10, fontWeight: 'bold', color: Theme.colors.outline,
    textTransform: 'uppercase', letterSpacing: 1,
  },
  sideCardTitle: {
    fontWeight: '900', fontSize: 24, lineHeight: 28,
    color: Theme.colors.primary, marginBottom: 8,
    fontStyle: 'italic', textTransform: 'uppercase', letterSpacing: 1.5,
  },
  sideCardSubtitle: { fontSize: 14, color: Theme.colors.onSurfaceVariant, lineHeight: 20 },
  sideActionBtn: {
    width: '100%', height: 56, marginTop: 32, borderRadius: 28,
    backgroundColor: Theme.colors.surfaceContainerHighest, borderWidth: 1,
    borderColor: 'rgba(89,62,99,0.15)', alignItems: 'center', justifyContent: 'center',
  },
  sideActionText: { color: Theme.colors.text, fontWeight: '900', fontSize: 14 },

  // Trending
  trendingSection: { marginTop: 8 },
  trendingHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  trendingTitle: {
    fontWeight: '900', fontStyle: 'italic', fontSize: 20,
    color: Theme.colors.text, textTransform: 'uppercase', letterSpacing: 1.5,
  },
  pulseDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: Theme.colors.secondary,
    shadowColor: Theme.colors.secondary, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8, shadowRadius: 8,
  },
  trendingScroll: { gap: 16, paddingBottom: 8 },
  trendingCard: {
    width: 160, backgroundColor: Theme.colors.surfaceContainerHigh,
    borderRadius: 16, padding: 16, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(89,62,99,0.15)',
  },
  trendingAvatar: {
    width: 56, height: 56, borderRadius: 28, marginBottom: 12,
    borderWidth: 2, borderColor: Theme.colors.outlineVariant,
  },
  trendingName: {
    fontSize: 12, fontWeight: '900', color: Theme.colors.text,
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4,
  },
  trendingGame: { fontSize: 11, color: Theme.colors.onSurfaceVariant, marginBottom: 4, textAlign: 'center' },
  trendingSlots: {
    fontSize: 10, fontWeight: 'bold', color: Theme.colors.secondary,
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12,
  },
  trendingJoinBtn: {
    width: '100%', height: 36, borderRadius: 18,
    backgroundColor: 'rgba(47,248,1,0.15)', borderWidth: 1,
    borderColor: 'rgba(47,248,1,0.3)', alignItems: 'center', justifyContent: 'center',
  },
  trendingJoinText: {
    color: Theme.colors.secondary, fontWeight: '900', fontSize: 11,
    textTransform: 'uppercase', letterSpacing: 1.5,
  },

  // FAB
  fab: {
    position: 'absolute', bottom: 120, right: 24,
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: Theme.colors.primary, alignItems: 'center',
    justifyContent: 'center', zIndex: 40,
    shadowColor: Theme.colors.primary, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4, shadowRadius: 35,
  },
});
