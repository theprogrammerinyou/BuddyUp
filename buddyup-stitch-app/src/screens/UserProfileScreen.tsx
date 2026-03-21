import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Modal, Pressable, ActivityIndicator } from 'react-native';
import { Theme } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import BottomNavBar from '../components/BottomNavBar';
import { getProfile, getLeaderboard } from '../api/api';
import type { User } from '../api/types';

const VIBE_OPTIONS = [
  { id: 'open', label: 'OPEN TO CONNECT', icon: 'people' as const },
  { id: 'squad', label: 'SQUAD GOALS', icon: 'groups' as const },
  { id: 'mission', label: 'ON A MISSION', icon: 'rocket-launch' as const },
  { id: 'vibing', label: 'JUST VIBING', icon: 'waves' as const },
  { id: 'solo', label: 'SOLO MODE', icon: 'headphones' as const },
];

export default function UserProfileScreen({ navigation }: any) {
  const [currentVibe, setCurrentVibe] = useState(VIBE_OPTIONS[0]);
  const [vibeModalVisible, setVibeModalVisible] = useState(false);
  const [profile, setProfile] = useState<User | null>(null);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProfile(), getLeaderboard()])
      .then(([prof, leaders]) => {
        setProfile(prof);
        const idx = leaders.findIndex((u) => u.id === prof.id);
        setMyRank(idx >= 0 ? idx + 1 : null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.headerAvatarBorder}>
            <Image
              source={{ uri: profile?.avatarUrl ?? 'https://i.pravatar.cc/300?u=alex-profile' }}
              style={styles.headerAvatar}
            />
          </TouchableOpacity>
          <Text style={styles.logoText}>NEON NOCTURNE</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Settings')}>
          <MaterialIcons name="settings" size={24} color={Theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Large Profile Photo */}
        <View style={styles.photoSection}>
          <View style={styles.photoWrapper}>
            <LinearGradient
              colors={[Theme.colors.secondary, Theme.colors.primary]}
              style={styles.photoGradientRing}
            >
              <View style={styles.photoInner}>
                <Image
                  source={{ uri: profile?.avatarUrl ?? 'https://i.pravatar.cc/300?u=alex-profile' }}
                  style={styles.photoImage}
                />
              </View>
            </LinearGradient>
            {/* LIVE badge */}
            <View style={styles.liveBadge}>
              <Text style={styles.liveBadgeText}>LIVE</Text>
            </View>
          </View>
        </View>

        {/* Name */}
        <Text style={styles.nameText}>{profile?.name?.toUpperCase() ?? 'YOUR PROFILE'}</Text>

        {/* Bio */}
        <Text style={styles.bioText}>
          {profile?.bio ?? 'Night owl. Code enthusiast. Always looking for a 5 AM gym partner.'}
        </Text>

        {/* Vibe Section */}
        <TouchableOpacity style={styles.vibeRow} onPress={() => setVibeModalVisible(true)}>
          <MaterialIcons name={currentVibe.icon} size={18} color={Theme.colors.secondary} />
          <Text style={styles.vibeLabel}>{currentVibe.label}</Text>
          <MaterialIcons name="edit" size={14} color={Theme.colors.primary} style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>

        {/* Vibe Modal */}
        <Modal
          visible={vibeModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setVibeModalVisible(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setVibeModalVisible(false)}>
            <Pressable style={styles.modalSheet} onPress={() => {}}>
              <Text style={styles.modalTitle}>SET YOUR VIBE</Text>
              <Text style={styles.modalSubtitle}>Let people know what you're feeling right now</Text>
              <View style={styles.vibeOptionsList}>
                {VIBE_OPTIONS.map((option) => {
                  const isSelected = currentVibe.id === option.id;
                  return (
                    <TouchableOpacity
                      key={option.id}
                      style={[styles.vibeOptionItem, isSelected && styles.vibeOptionItemActive]}
                      onPress={() => { setCurrentVibe(option); setVibeModalVisible(false); }}
                    >
                      <MaterialIcons
                        name={option.icon}
                        size={22}
                        color={isSelected ? Theme.colors.onSecondary : Theme.colors.primary}
                      />
                      <Text style={[styles.vibeOptionText, isSelected && styles.vibeOptionTextActive]}>
                        {option.label}
                      </Text>
                      {isSelected && (
                        <MaterialIcons name="check" size={18} color={Theme.colors.onSecondary} style={{ marginLeft: 'auto' }} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Pressable>
          </Pressable>
        </Modal>

        {/* Action Row */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.editProfileBtn}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Text style={styles.editProfileBtnText}>EDIT PROFILE</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareBtn}>
            <MaterialIcons name="share" size={24} color={Theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {/* View Leaderboard Button */}
        <TouchableOpacity
          style={styles.leaderboardBtn}
          onPress={() => navigation.navigate('ActivityLeaderboard')}
        >
          <MaterialIcons name="leaderboard" size={20} color={Theme.colors.secondary} />
          <Text style={styles.leaderboardBtnText}>
            {myRank ? `RANK #${myRank} · ` : ''}VIEW LEADERBOARD
          </Text>
        </TouchableOpacity>

        {/* Passions Section */}
        {(profile?.interests?.length ?? 0) > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PASSIONS</Text>
          <View style={styles.passionsRow}>
            {profile!.interests!.map((interest) => (
              <View key={interest.id} style={styles.passionCard}>
                <MaterialIcons name="bolt" size={32} color={Theme.colors.primary} />
                <Text style={styles.passionLabel}>{interest.name.toUpperCase()}</Text>
              </View>
            ))}
          </View>
        </View>
        )}

        {/* Recent Sessions — navigate to discovery */}
        <TouchableOpacity
          style={styles.leaderboardBtn}
          onPress={() => navigation.navigate('DiscoveryFeed')}
        >
          <MaterialIcons name="explore" size={20} color={Theme.colors.primary} />
          <Text style={[styles.leaderboardBtnText, { color: Theme.colors.primary }]}>BROWSE ACTIVITIES</Text>
        </TouchableOpacity>

      </ScrollView>

      <BottomNavBar activeTab="profile" navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    position: 'absolute',
    top: 0,
    width: '100%',
    zIndex: 50,
    backgroundColor: 'rgba(26,4,37,0.8)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    height: 100,
    paddingTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(223,142,255,0.05)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerAvatarBorder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: Theme.colors.secondary,
    padding: 2,
  },
  headerAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  logoText: {
    fontWeight: '900',
    fontStyle: 'italic',
    fontSize: 20,
    color: Theme.colors.primary,
    letterSpacing: 1,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingTop: 120,
    paddingBottom: 120,
    paddingHorizontal: 24,
  },

  // Profile Photo
  photoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  photoWrapper: {
    position: 'relative',
    alignItems: 'center',
  },
  photoGradientRing: {
    width: 200,
    height: 200,
    borderRadius: 16,
    padding: 4,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
  },
  photoInner: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: Theme.colors.surfaceContainer,
  },
  photoImage: {
    width: 192,
    height: 192,
    borderRadius: 14,
  },

  // LIVE badge
  liveBadge: {
    position: 'absolute',
    bottom: -12,
    backgroundColor: 'rgba(47,248,1,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(47,248,1,0.3)',
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 16,
  },
  liveBadgeText: {
    color: Theme.colors.secondary,
    fontWeight: '900',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },

  // Name
  nameText: {
    fontWeight: '900',
    fontStyle: 'italic',
    fontSize: 42,
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: -1,
    textAlign: 'center',
    marginTop: 16,
  },

  // Bio
  bioText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: Theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 8,
    marginBottom: 24,
    paddingHorizontal: 8,
  },

  // Action Row
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 40,
  },
  editProfileBtn: {
    flex: 1,
    height: 52,
    backgroundColor: Theme.colors.primary,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  editProfileBtnText: {
    color: Theme.colors.onPrimary,
    fontWeight: '900',
    fontSize: 15,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  shareBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(57,22,72,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(89,62,99,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  leaderboardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 52,
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: Theme.colors.secondary,
    marginBottom: 24,
    shadowColor: Theme.colors.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  leaderboardBtnText: {
    color: Theme.colors.secondary,
    fontWeight: '900',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },

  // Sections
  section: {
    marginBottom: 36,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Theme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 16,
  },
  sectionLabelGreen: {
    fontSize: 12,
    fontWeight: '700',
    color: Theme.colors.secondary,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: Theme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },

  // Passions
  passionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  passionCard: {
    flex: 1,
    backgroundColor: Theme.colors.surfaceContainer,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(89,62,99,0.15)',
  },
  passionLabel: {
    fontWeight: '900',
    fontStyle: 'italic',
    fontSize: 13,
    color: Theme.colors.text,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },

  // Recent Sessions
  sessionsList: {
    gap: 2,
    borderRadius: 16,
    overflow: 'hidden',
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(41,12,54,0.4)',
    padding: 16,
  },
  sessionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  sessionIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(223,142,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionTitle: {
    fontWeight: '700',
    fontSize: 16,
    color: Theme.colors.text,
  },
  sessionSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 2,
  },

  // Vibe Row
  vibeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(47,248,1,0.08)',
    borderRadius: 32,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(47,248,1,0.2)',
  },
  vibeLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: Theme.colors.secondary,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },

  // Vibe Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Theme.colors.surfaceContainer,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 32,
    paddingBottom: 48,
    gap: 8,
  },
  modalTitle: {
    fontWeight: '900',
    fontStyle: 'italic',
    fontSize: 24,
    color: Theme.colors.text,
    textTransform: 'uppercase',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: Theme.colors.textMuted,
    marginBottom: 16,
  },
  vibeOptionsList: { gap: 10 },
  vibeOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(41,12,54,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(89,62,99,0.15)',
  },
  vibeOptionItemActive: {
    backgroundColor: Theme.colors.secondary,
    borderColor: Theme.colors.secondary,
  },
  vibeOptionText: {
    fontSize: 13,
    fontWeight: '900',
    color: Theme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  vibeOptionTextActive: {
    color: Theme.colors.onSecondary,
  },
});
