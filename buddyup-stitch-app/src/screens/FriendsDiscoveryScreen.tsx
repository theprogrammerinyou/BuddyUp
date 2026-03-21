import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { Theme } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import BottomNavBar from '../components/BottomNavBar';
import { getFriendSuggestions, sendFriendRequest, getFriendRequests, respondFriendRequest, getProfile } from '../api/api';
import type { User, FriendRequest } from '../api/types';

export default function FriendsDiscoveryScreen({ navigation }: any) {
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [profile, setProfile] = useState<User | null>(null);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<Set<number>>(new Set());
  const [respondedRequests, setRespondedRequests] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getFriendSuggestions(), getProfile(), getFriendRequests()])
      .then(([sug, prof, reqs]) => {
        setSuggestions(sug);
        setProfile(prof);
        setPendingRequests(reqs);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSendRequest = async (userId: number) => {
    try {
      await sendFriendRequest(userId);
      setSentRequests((prev) => new Set(prev).add(userId));
    } catch (e) {
      // Already sent or other error
    }
  };

  const handleRespondRequest = async (requestId: number, accept: boolean) => {
    try {
      await respondFriendRequest(requestId, accept ? 'accepted' : 'rejected');
      setRespondedRequests((prev) => new Set(prev).add(requestId));
    } catch (e) {}
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('UserProfile')}>
          <LinearGradient colors={[Theme.colors.secondary, Theme.colors.primary]} style={styles.avatarRing}>
            <Image
              source={{ uri: profile?.avatarUrl ?? 'https://i.pravatar.cc/150?u=mainuser' }}
              style={styles.headerAvatar}
            />
          </LinearGradient>
        </TouchableOpacity>
        <Text style={styles.logoText}>PULSE</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <MaterialIcons name="settings" size={24} color={Theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Search bar */}
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={22} color={Theme.colors.outline} />
          <TextInput
            style={styles.searchInput}
            placeholder="Find your tribe..."
            placeholderTextColor={Theme.colors.outline}
          />
          <TouchableOpacity>
            <MaterialIcons name="tune" size={22} color={Theme.colors.outline} />
          </TouchableOpacity>
        </View>

        {/* Vibe Matches Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeading}>VIBE MATCHES</Text>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveBadgeText}>LIVE NOW</Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator color={Theme.colors.primary} style={{ marginVertical: 24 }} />
        ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.vibeScroll}>
          {suggestions.map((person, i) => (
            <TouchableOpacity key={person.id} style={styles.vibeCard} activeOpacity={0.85}>
              <View style={styles.vibeCardInner}>
                <Image source={{ uri: person.avatarUrl ?? `https://i.pravatar.cc/300?u=${person.id}` }} style={styles.vibePhoto} />
                <LinearGradient
                  colors={['transparent', 'rgba(26,4,37,0.95)']}
                  style={styles.vibePhotoGradient}
                />
                {person.isOnline && (
                  <View style={styles.onlineDotAbsolute}>
                    <View style={styles.onlineDot} />
                  </View>
                )}
                <View style={styles.vibeCardContent}>
                  <Text style={styles.vibeName}>{person.name}</Text>
                  <View style={styles.tagsRow}>
                    {(person.interests ?? []).slice(0, 2).map((interest) => (
                      <View key={interest.id} style={styles.tagPill}>
                        <Text style={styles.tagText}>{interest.name}</Text>
                      </View>
                    ))}
                  </View>
                  <TouchableOpacity
                    style={[styles.connectBtn, sentRequests.has(person.id) && styles.connectBtnSent]}
                    onPress={() => handleSendRequest(person.id)}
                    disabled={sentRequests.has(person.id)}
                  >
                    <MaterialIcons
                      name={sentRequests.has(person.id) ? 'check' : 'person-add'}
                      size={18}
                      color={sentRequests.has(person.id) ? Theme.colors.outline : Theme.colors.secondary}
                    />
                    <Text style={[styles.connectBtnText, sentRequests.has(person.id) && { color: Theme.colors.outline }]}>
                      {sentRequests.has(person.id) ? 'SENT' : 'CONNECT'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
        )}

        {/* Sync Your Circle CTA */}
        <View style={styles.syncCard}>
          <View style={styles.syncIconWrap}>
            <MaterialIcons name="contacts" size={28} color={Theme.colors.primary} />
          </View>
          <Text style={styles.syncTitle}>Sync Your Circle</Text>
          <Text style={styles.syncDesc}>
            Connect your contacts to find friends already pulsing on the platform.
          </Text>
          <TouchableOpacity style={styles.syncBtn}>
            <Text style={styles.syncBtnText}>Connect Contacts</Text>
          </TouchableOpacity>
        </View>

        {/* Pending Friend Requests */}
        {pendingRequests.filter((r) => !respondedRequests.has(r.id)).map((request) => (
          <View key={request.id} style={styles.friendRequestCard}>
            <View style={styles.friendRequestHeader}>
              <View style={styles.friendRequestAvatarWrap}>
                <Image
                  source={{ uri: request.user?.avatarUrl ?? `https://i.pravatar.cc/150?u=${request.userId}` }}
                  style={styles.friendRequestAvatar}
                />
                <View style={styles.friendRequestDot} />
              </View>
              <View style={styles.friendRequestInfo}>
                <Text style={styles.friendRequestName}>{request.user?.name ?? 'Someone'}</Text>
                <Text style={styles.friendRequestLabel}>SENT YOU A FRIEND REQUEST</Text>
              </View>
            </View>
            <View style={styles.friendRequestActions}>
              <TouchableOpacity
                style={styles.acceptBtn}
                onPress={() => handleRespondRequest(request.id, true)}
              >
                <Text style={styles.acceptBtnText}>ACCEPT</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.ignoreBtn}
                onPress={() => handleRespondRequest(request.id, false)}
              >
                <Text style={styles.ignoreBtnText}>IGNORE</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* People You May Know */}
        <View style={styles.peopleSection}>
          <Text style={styles.peopleSectionHeading}>PEOPLE YOU MAY KNOW</Text>
          {suggestions.slice(3).map((person) => (
            <View key={person.id} style={styles.personRow}>
              <Image source={{ uri: person.avatarUrl ?? `https://i.pravatar.cc/150?u=${person.id}` }} style={styles.personAvatar} />
              <View style={styles.personInfo}>
                <Text style={styles.personName}>{person.name}</Text>
                <Text style={styles.personMutuals}>{(person.interests ?? []).map((i) => i.name).join(', ') || 'Suggested for you'}</Text>
              </View>
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => handleSendRequest(person.id)}
              >
                <MaterialIcons
                  name={sentRequests.has(person.id) ? 'check' : 'person-add'}
                  size={22}
                  color={sentRequests.has(person.id) ? Theme.colors.outline : Theme.colors.secondary}
                />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      <BottomNavBar activeTab="explore" navigation={navigation} />
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
  avatarRing: { padding: 2, borderRadius: 24 },
  headerAvatar: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: 2, borderColor: Theme.colors.background,
  },
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

  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(41,12,54,0.4)', borderRadius: 9999,
    borderWidth: 1, borderColor: 'rgba(89,62,99,0.15)',
    paddingHorizontal: 20, height: 52, gap: 12, marginBottom: 32,
  },
  searchInput: {
    flex: 1, color: Theme.colors.text, fontSize: 15,
  },

  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionHeading: {
    fontWeight: '900', fontStyle: 'italic', fontSize: 14,
    color: Theme.colors.text, textTransform: 'uppercase', letterSpacing: 2,
  },
  liveBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(47,248,1,0.12)', borderWidth: 1,
    borderColor: 'rgba(47,248,1,0.25)', paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 16,
  },
  liveDot: {
    width: 6, height: 6, borderRadius: 3, backgroundColor: Theme.colors.secondary,
    shadowColor: Theme.colors.secondary,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 4,
  },
  liveBadgeText: {
    color: Theme.colors.secondary, fontSize: 10, fontWeight: '900',
    letterSpacing: 1.5, textTransform: 'uppercase',
  },

  vibeScroll: { gap: 14, paddingBottom: 8, marginBottom: 32 },
  vibeCard: {
    width: 200, height: 280, borderRadius: 16, overflow: 'hidden',
    position: 'relative',
  },
  vibeCardBorder: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 16,
  },
  vibeCardInner: {
    position: 'absolute', top: 2, left: 2, right: 2, bottom: 2,
    borderRadius: 14, overflow: 'hidden',
    backgroundColor: Theme.colors.surfaceContainer,
  },
  vibePhoto: { width: '100%', height: '100%', position: 'absolute' },
  vibePhotoGradient: {
    position: 'absolute', bottom: 0, width: '100%', height: '60%',
  },
  onlineDotAbsolute: {
    position: 'absolute', top: 14, right: 14,
  },
  onlineDot: {
    width: 10, height: 10, borderRadius: 5, backgroundColor: Theme.colors.secondary,
    shadowColor: Theme.colors.secondary,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 6,
  },
  vibeCardContent: {
    position: 'absolute', bottom: 0, width: '100%', padding: 16,
  },
  vibeName: {
    fontWeight: '900', fontSize: 18, color: Theme.colors.text, marginBottom: 8,
  },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tagPill: {
    backgroundColor: 'rgba(47,248,1,0.15)', borderWidth: 1,
    borderColor: 'rgba(47,248,1,0.25)', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    color: Theme.colors.secondary, fontSize: 11, fontWeight: '700',
    letterSpacing: 0.5,
  },

  syncCard: {
    backgroundColor: Theme.colors.surfaceContainer, borderRadius: 20, padding: 24,
    borderWidth: 1, borderColor: 'rgba(89,62,99,0.15)', marginBottom: 24,
    alignItems: 'center',
  },
  syncIconWrap: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: 'rgba(223,142,255,0.1)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  syncTitle: {
    fontWeight: '900', fontSize: 18, color: Theme.colors.text,
    marginBottom: 8,
  },
  syncDesc: {
    color: Theme.colors.onSurfaceVariant, fontSize: 14, lineHeight: 22,
    textAlign: 'center', marginBottom: 20,
  },
  syncBtn: {
    backgroundColor: Theme.colors.primary, paddingHorizontal: 32, paddingVertical: 14,
    borderRadius: 9999,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 20,
  },
  syncBtnText: {
    color: Theme.colors.onPrimary, fontWeight: '800', fontSize: 14,
  },

  friendRequestCard: {
    backgroundColor: Theme.colors.surfaceContainerHigh, borderRadius: 20,
    padding: 20, marginBottom: 32,
    borderWidth: 1, borderColor: 'rgba(47,248,1,0.2)',
    shadowColor: Theme.colors.secondary,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.15, shadowRadius: 20,
  },
  friendRequestHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 18,
  },
  friendRequestAvatarWrap: { position: 'relative' },
  friendRequestAvatar: {
    width: 52, height: 52, borderRadius: 26, borderWidth: 2,
    borderColor: Theme.colors.outlineVariant,
  },
  friendRequestDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 14, height: 14, borderRadius: 7, backgroundColor: Theme.colors.secondary,
    borderWidth: 2, borderColor: Theme.colors.surfaceContainerHigh,
  },
  friendRequestInfo: { flex: 1 },
  friendRequestName: {
    fontWeight: '900', fontSize: 16, color: Theme.colors.text, marginBottom: 2,
  },
  friendRequestLabel: {
    fontSize: 11, fontWeight: '700', color: Theme.colors.onSurfaceVariant,
    letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 2,
  },
  friendRequestTime: {
    fontSize: 10, fontWeight: '700', color: Theme.colors.outline,
    letterSpacing: 1, textTransform: 'uppercase',
  },
  friendRequestActions: { flexDirection: 'row', gap: 12 },
  acceptBtn: {
    flex: 1, backgroundColor: Theme.colors.secondary, paddingVertical: 14,
    borderRadius: 9999, alignItems: 'center',
    shadowColor: Theme.colors.secondary,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 15,
  },
  acceptBtnText: {
    color: Theme.colors.onSecondary, fontWeight: '900', fontSize: 13,
    letterSpacing: 1,
  },
  ignoreBtn: {
    flex: 1, borderWidth: 2, borderColor: Theme.colors.outlineVariant,
    paddingVertical: 14, borderRadius: 9999, alignItems: 'center',
  },
  ignoreBtnText: {
    color: Theme.colors.onSurfaceVariant, fontWeight: '900', fontSize: 13,
    letterSpacing: 1,
  },

  peopleSection: { marginBottom: 24 },
  peopleSectionHeading: {
    fontWeight: '900', fontStyle: 'italic', fontSize: 14,
    color: Theme.colors.text, textTransform: 'uppercase',
    letterSpacing: 2, marginBottom: 16,
  },
  personRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Theme.colors.surfaceContainer, padding: 16,
    borderRadius: 16, borderWidth: 1, borderColor: 'rgba(89,62,99,0.05)',
    marginBottom: 10,
  },
  personAvatar: {
    width: 48, height: 48, borderRadius: 24, borderWidth: 2,
    borderColor: Theme.colors.surfaceVariant,
  },
  personInfo: { flex: 1 },
  personName: { fontWeight: 'bold', fontSize: 15, color: Theme.colors.text, marginBottom: 2 },
  personMutuals: {
    fontSize: 12, color: Theme.colors.onSurfaceVariant, fontWeight: '600',
  },
  addBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(47,248,1,0.1)', alignItems: 'center', justifyContent: 'center',
  },
  connectBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: Theme.colors.secondary,
    borderRadius: 9999, paddingHorizontal: 12, paddingVertical: 6, marginTop: 8,
  },
  connectBtnSent: {
    borderColor: Theme.colors.outline,
  },
  connectBtnText: {
    color: Theme.colors.secondary, fontWeight: '900', fontSize: 11, letterSpacing: 1,
  },
});
