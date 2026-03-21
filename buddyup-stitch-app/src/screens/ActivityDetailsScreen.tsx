import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ImageBackground, ActivityIndicator } from 'react-native';
import { Theme } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import BottomNavBar from '../components/BottomNavBar';
import { getActivity, joinActivity, getProfile } from '../api/api';
import type { Activity, User } from '../api/types';

export default function ActivityDetailsScreen({ navigation, route }: any) {
  const activityId: number | undefined = route?.params?.activityId;
  const [activity, setActivity] = useState<Activity | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      activityId ? getActivity(activityId) : Promise.resolve(null),
      getProfile(),
    ])
      .then(([act, prof]) => { setActivity(act); setProfile(prof); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activityId]);

  const handleJoin = async () => {
    if (!activity) return;
    try {
      await joinActivity(activity.id);
      setJoined(true);
    } catch { setJoined(true); }
  };

  const titleWords = (activity?.title ?? 'Activity Details').split(' ');
  const firstHalf = titleWords.slice(0, Math.ceil(titleWords.length / 2)).join(' ');
  const secondHalf = titleWords.slice(Math.ceil(titleWords.length / 2)).join(' ');
  const attendees = activity?.attendees ?? [];
  const extraCount = Math.max(0, attendees.length - 5);

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
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('NotificationsCenter')}>
          <MaterialIcons name="notifications" size={24} color={Theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={Theme.colors.primary} size="large" />
        </View>
      ) : (
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero section */}
        <View style={styles.heroSection}>
          <ImageBackground
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBL2rkrXaFZbXXkx3j2AHbWPBs-F-T95tYwm6VGmVHQZ5FJwEOsELbB85MN7f8rJ-GGm_xVJ5q2tEvPM9pMuGIzEiOQCJgqRkYsGpI6jjQV7M9VCkNq1PbKqfvqqW9v4b-jXQ' }}
            style={styles.heroBg}
            imageStyle={{ opacity: 0.5 }}
          >
            <LinearGradient
              colors={['rgba(26,4,37,0.3)', 'transparent', Theme.colors.background]}
              style={styles.heroGradient}
            />
          </ImageBackground>
        </View>

        {/* Live Session Badge */}
        <View style={styles.badgeRow}>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveBadgeText}>LIVE SESSION</Text>
          </View>
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.titleWhite}>{firstHalf.toUpperCase()}</Text>
          {secondHalf ? <Text style={styles.titleGreen}>{secondHalf.toUpperCase()}</Text> : null}
        </View>

        {/* Location & Time */}
        <View style={styles.metaSection}>
          <View style={styles.metaRow}>
            <MaterialIcons name="location-on" size={20} color={Theme.colors.primary} />
            <Text style={styles.metaText}>{activity?.location ?? 'Location TBD'}</Text>
          </View>
          <View style={styles.metaRow}>
            <MaterialIcons name="schedule" size={20} color={Theme.colors.primary} />
            <Text style={styles.metaText}>{activity?.startTime ? new Date(activity.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Time TBD'}</Text>
          </View>
        </View>

        {/* The Vibe description */}
        <View style={styles.vibeSection}>
          <Text style={styles.vibeSectionTitle}>THE VIBE</Text>
          <Text style={styles.vibeDescription}>
            {activity?.description ?? 'Join this session and connect with others who share your interests.'}
          </Text>
        </View>

        {/* Joined Crew */}
        <View style={styles.crewSection}>
          <View style={styles.crewHeader}>
            <Text style={styles.crewSectionTitle}>JOINED CREW</Text>
            <Text style={styles.crewCount}>{attendees.length} MEMBERS ACTIVE</Text>
          </View>
          <View style={styles.crewContent}>
            <View style={styles.avatarStack}>
              {attendees.slice(0, 5).map((member, index) => (
                <Image
                  key={member.id}
                  source={{ uri: member.avatarUrl ?? `https://i.pravatar.cc/150?u=${member.id}` }}
                  style={[styles.crewAvatar, index > 0 && { marginLeft: -14 }]}
                />
              ))}
              {extraCount > 0 && (
                <View style={[styles.crewAvatarMore, { marginLeft: -14 }]}>
                  <Text style={styles.crewMoreText}>+{extraCount}</Text>
                </View>
              )}
            </View>
            <TouchableOpacity>
              <Text style={styles.viewAllLink}>View All</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* CTA Card */}
        <View style={styles.ctaCard}>
          <Text style={styles.ctaText}>
            Ready to join? <Text style={{ color: Theme.colors.secondary, fontWeight: '900' }}>{activity?.host?.name ?? 'Someone'} is hosting</Text>...
          </Text>
          <TouchableOpacity
            style={[styles.joinBtn, joined && styles.joinBtnJoined]}
            onPress={handleJoin}
          >
            <MaterialIcons
              name={joined ? 'check' : 'bolt'}
              size={24}
              color={joined ? Theme.colors.secondary : Theme.colors.onSecondary}
            />
            <Text style={[styles.joinBtnText, joined && styles.joinBtnTextJoined]}>
              {joined ? 'JOINED' : 'JOIN SESSION'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Leaderboard Button */}
        <TouchableOpacity style={styles.leaderboardBtn} onPress={() => navigation.navigate('ActivityLeaderboard')}>
          <MaterialIcons name="leaderboard" size={20} color={Theme.colors.onPrimary} />
          <Text style={styles.leaderboardBtnText}>VIEW LEADERBOARD</Text>
        </TouchableOpacity>

        {/* Small map preview */}
        <TouchableOpacity style={styles.mapSection} activeOpacity={0.9} onPress={() => navigation.navigate('MapView')}>
          <ImageBackground
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAMwGWJDZkmOeCMJ06t-u1d-cRevJ4ARBcO3q5Mw03fbkc3JE9GAHaFBgn0qGhbWgsgC3lsF1qHuRYZw2bWoWrTh01iuxmhKnXL4IMebITAS8ZXzC8x_pLTXZGaefpQEBNWkXEZe2MjrIKVi5T05YMMohOweDgKbpYZP3W0A5jyWHtZGTQK8eGKvhEjpUBGowmxnq-3zFHSfTkU6HocIhb98o9QpOxZiK3YBhxilkfd-2ler9foHBvErtI66CTMyD1FqnYwNwfU-w' }}
            style={styles.mapImage}
            imageStyle={{ borderRadius: 16, opacity: 0.4 }}
          >
            <View style={styles.mapOverlay}>
              <MaterialIcons name="location-on" size={36} color={Theme.colors.secondary} style={styles.mapPinGlow} />
              <View style={styles.openMapsBtn}>
                <Text style={styles.openMapsText}>OPEN IN MAPS</Text>
              </View>
            </View>
          </ImageBackground>
        </TouchableOpacity>
      </ScrollView>
      )}

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

  scrollContent: { paddingBottom: 120 },

  heroSection: { height: 280, width: '100%' },
  heroBg: { flex: 1, width: '100%' },
  heroGradient: { flex: 1 },

  badgeRow: { paddingHorizontal: 24, marginTop: -20, marginBottom: 16 },
  liveBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start',
    backgroundColor: 'rgba(47,248,1,0.15)', borderWidth: 1, borderColor: 'rgba(47,248,1,0.3)',
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
  },
  liveDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: Theme.colors.secondary,
    shadowColor: Theme.colors.secondary,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 6,
  },
  liveBadgeText: {
    color: Theme.colors.secondary, fontSize: 11, fontWeight: '900',
    letterSpacing: 2, textTransform: 'uppercase',
  },

  titleSection: { paddingHorizontal: 24, marginBottom: 20 },
  titleWhite: {
    fontWeight: '900', fontStyle: 'italic', fontSize: 44,
    color: Theme.colors.text, letterSpacing: -1, textTransform: 'uppercase', lineHeight: 50,
  },
  titleGreen: {
    fontWeight: '900', fontStyle: 'italic', fontSize: 44,
    color: Theme.colors.secondary, letterSpacing: -1, textTransform: 'uppercase', lineHeight: 50,
  },

  metaSection: { paddingHorizontal: 24, gap: 12, marginBottom: 32 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  metaText: { color: Theme.colors.onSurfaceVariant, fontSize: 15, fontWeight: '600' },

  vibeSection: { paddingHorizontal: 24, marginBottom: 32 },
  vibeSectionTitle: {
    fontWeight: '900', fontStyle: 'italic', fontSize: 14,
    color: Theme.colors.text, textTransform: 'uppercase',
    letterSpacing: 2, marginBottom: 12,
  },
  vibeDescription: {
    color: Theme.colors.onSurfaceVariant, fontSize: 15, lineHeight: 24,
  },

  crewSection: { paddingHorizontal: 24, marginBottom: 32 },
  crewHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 16,
  },
  crewSectionTitle: {
    fontWeight: '900', fontStyle: 'italic', fontSize: 14,
    color: Theme.colors.text, textTransform: 'uppercase', letterSpacing: 2,
  },
  crewCount: {
    fontSize: 11, fontWeight: '700', color: Theme.colors.secondary,
    letterSpacing: 1, textTransform: 'uppercase',
  },
  crewContent: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  avatarStack: { flexDirection: 'row', alignItems: 'center' },
  crewAvatar: {
    width: 44, height: 44, borderRadius: 22, borderWidth: 2,
    borderColor: Theme.colors.background,
  },
  crewAvatarMore: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Theme.colors.surfaceContainerHigh,
    borderWidth: 2, borderColor: Theme.colors.background,
    alignItems: 'center', justifyContent: 'center',
  },
  crewMoreText: {
    color: Theme.colors.primary, fontSize: 13, fontWeight: '900',
  },
  viewAllLink: {
    color: Theme.colors.primary, fontSize: 14, fontWeight: '700',
    textDecorationLine: 'underline',
  },

  ctaCard: {
    marginHorizontal: 24, marginBottom: 32, padding: 24,
    backgroundColor: 'rgba(41,12,54,0.4)', borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(89,62,99,0.15)',
  },
  ctaText: {
    color: Theme.colors.onSurfaceVariant, fontSize: 15, lineHeight: 22,
    marginBottom: 20,
  },
  joinBtn: {
    width: '100%', backgroundColor: Theme.colors.secondary,
    paddingVertical: 20, borderRadius: 9999, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 10,
    shadowColor: Theme.colors.secondary,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 30,
  },
  joinBtnJoined: {
    backgroundColor: 'transparent', borderWidth: 2, borderColor: Theme.colors.secondary,
    shadowOpacity: 0.2,
  },
  joinBtnText: {
    fontWeight: '900', fontStyle: 'italic', color: Theme.colors.onSecondary,
    fontSize: 16, letterSpacing: 1, textTransform: 'uppercase',
  },
  joinBtnTextJoined: { color: Theme.colors.secondary },

  leaderboardBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    marginHorizontal: 24, marginBottom: 32, paddingVertical: 18,
    backgroundColor: Theme.colors.primary, borderRadius: 9999,
    shadowColor: Theme.colors.primary, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3, shadowRadius: 20,
  },
  leaderboardBtnText: {
    color: Theme.colors.onPrimary, fontWeight: '900', fontSize: 14,
    textTransform: 'uppercase', letterSpacing: 2,
  },

  mapSection: {
    marginHorizontal: 24, height: 160, borderRadius: 16, overflow: 'hidden',
    marginBottom: 24,
  },
  mapImage: { flex: 1, width: '100%' },
  mapOverlay: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(26,4,37,0.3)',
  },
  mapPinGlow: {
    shadowColor: Theme.colors.secondary,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 15,
    marginBottom: 8,
  },
  openMapsBtn: {
    backgroundColor: 'rgba(41,12,54,0.6)', paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 12, borderWidth: 1, borderColor: 'rgba(89,62,99,0.15)',
  },
  openMapsText: {
    color: Theme.colors.text, fontSize: 11, fontWeight: '900',
    letterSpacing: 2, textTransform: 'uppercase',
  },
});
