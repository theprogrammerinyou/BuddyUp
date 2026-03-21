import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
import { Theme } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import BottomNavBar from '../components/BottomNavBar';
import { getMyTickets, getProfile } from '../api/api';
import type { EventTicket, User } from '../api/types';

export default function EventAccessQRScreen({ navigation }: any) {
  const [ticket, setTicket] = useState<EventTicket | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMyTickets(), getProfile()])
      .then(([tickets, prof]) => {
        setTicket(tickets[0] ?? null);
        setProfile(prof);
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
        <View style={styles.avatarWrap}>
          <TouchableOpacity onPress={() => navigation.navigate('UserProfile')} style={styles.avatarBorder}>
            <Image
              source={{ uri: profile?.avatarUrl ?? 'https://i.pravatar.cc/150?u=mainuser' }}
              style={styles.headerAvatar}
            />
          </TouchableOpacity>
          <View style={styles.avatarOnlineDot} />
        </View>
        <Text style={styles.logoText}>PULSE</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <MaterialIcons name="settings" size={24} color={Theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Active Entry Badge */}
        <View style={styles.entryBadge}>
          <MaterialIcons name="bolt" size={16} color={Theme.colors.secondary} />
          <Text style={styles.entryBadgeText}>ACTIVE ENTRY</Text>
        </View>

        {/* Title */}
        <Text style={styles.eventTitle}>{ticket?.event?.title ?? 'Code & Coffee.'}</Text>

        {/* Date */}
        <Text style={styles.eventDate}>
          {ticket?.event ? new Date(ticket.event.startTime).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Tomorrow, 09:00 AM, Neon District Hub.'}
        </Text>

        {/* QR Code Card */}
        <View style={styles.qrCard}>
          <View style={styles.qrGlowBorder}>
            <View style={styles.qrInner}>
              <MaterialIcons name="qr-code-2" size={200} color={Theme.colors.surfaceContainerHighest} />
            </View>
          </View>
          <Text style={styles.qrLabel}>Event Natural</Text>
        </View>

        {/* Event ID */}
        <Text style={styles.eventId}>ID: {ticket?.ticketId ?? 'PLS-882-X90'}</Text>

        {/* Two action buttons side by side */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.outlinedBtn}>
            <MaterialIcons name="calendar-today" size={20} color={Theme.colors.primary} />
            <Text style={styles.outlinedBtnText}>Add to Calendar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.greenBtn}>
            <MaterialIcons name="share" size={20} color={Theme.colors.onSecondary} />
            <Text style={styles.greenBtnText}>Share Access</Text>
          </TouchableOpacity>
        </View>

        {/* Venue Details Section */}
        <View style={styles.venueSection}>
          <Text style={styles.venueHeading}>VENUE DETAILS</Text>

          <View style={styles.venueCard}>
            <View style={styles.venueRow}>
              <MaterialIcons name="location-on" size={22} color={Theme.colors.primary} />
              <Text style={styles.venueText}>{ticket?.event?.location ?? '404 Cyber Lane, Sector 7, Entrance B, 3rd Floor'}</Text>
            </View>
            <View style={styles.venueDivider} />
            <View style={styles.venueRow}>
              <MaterialIcons name="people" size={22} color={Theme.colors.secondary} />
              <Text style={styles.venueText}>{ticket?.event ? `${ticket.event.attendees?.length ?? 0} Friends attending` : '12 Friends attending'}</Text>
            </View>
          </View>
        </View>
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
  avatarWrap: { position: 'relative' },
  avatarBorder: {
    width: 44, height: 44, borderRadius: 22, borderWidth: 2,
    borderColor: Theme.colors.secondary, padding: 2,
  },
  headerAvatar: { width: '100%', height: '100%', borderRadius: 20 },
  avatarOnlineDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 12, height: 12, borderRadius: 6, backgroundColor: Theme.colors.secondary,
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

  entryBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start',
    backgroundColor: 'rgba(47,248,1,0.12)', borderWidth: 1,
    borderColor: 'rgba(47,248,1,0.25)', paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, marginBottom: 20,
  },
  entryBadgeText: {
    color: Theme.colors.secondary, fontSize: 11, fontWeight: '900',
    letterSpacing: 2, textTransform: 'uppercase',
  },

  eventTitle: {
    fontWeight: '900', fontSize: 36, color: Theme.colors.text,
    letterSpacing: -1, marginBottom: 8,
    textShadowColor: 'rgba(223,142,255,0.3)', textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },

  eventDate: {
    color: Theme.colors.onSurfaceVariant, fontSize: 15, fontWeight: '600',
    marginBottom: 32,
  },

  qrCard: {
    alignItems: 'center', marginBottom: 16,
    backgroundColor: 'rgba(41,12,54,0.4)', borderRadius: 24, padding: 24,
    borderWidth: 1, borderColor: 'rgba(223,142,255,0.2)',
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 30,
  },
  qrGlowBorder: {
    padding: 3, borderRadius: 20,
    borderWidth: 2, borderColor: 'rgba(223,142,255,0.3)',
    marginBottom: 16,
  },
  qrInner: {
    backgroundColor: '#ffffff', borderRadius: 16, padding: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  qrLabel: {
    color: Theme.colors.onSurfaceVariant, fontSize: 14, fontWeight: '700',
    letterSpacing: 0.5,
  },

  eventId: {
    color: Theme.colors.outline, fontSize: 13, fontWeight: '600',
    textAlign: 'center', letterSpacing: 1, marginBottom: 32,
  },

  actionRow: {
    flexDirection: 'row', gap: 12, marginBottom: 40,
  },
  outlinedBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 16, borderRadius: 9999,
    borderWidth: 2, borderColor: Theme.colors.primary,
  },
  outlinedBtnText: {
    color: Theme.colors.primary, fontWeight: '800', fontSize: 13,
  },
  greenBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 16, borderRadius: 9999,
    backgroundColor: Theme.colors.secondary,
    shadowColor: Theme.colors.secondary,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 20,
  },
  greenBtnText: {
    color: Theme.colors.onSecondary, fontWeight: '800', fontSize: 13,
  },

  venueSection: { marginBottom: 24 },
  venueHeading: {
    fontWeight: '900', fontStyle: 'italic', fontSize: 14,
    color: Theme.colors.text, textTransform: 'uppercase',
    letterSpacing: 2, marginBottom: 16,
  },
  venueCard: {
    backgroundColor: 'rgba(41,12,54,0.4)', borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: 'rgba(89,62,99,0.15)',
  },
  venueRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 4,
  },
  venueText: {
    flex: 1, color: Theme.colors.onSurfaceVariant, fontSize: 14,
    fontWeight: '600', lineHeight: 22,
  },
  venueDivider: {
    height: 1, backgroundColor: 'rgba(89,62,99,0.15)', marginVertical: 14,
  },
});
