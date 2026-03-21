import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Theme } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import BottomNavBar from '../components/BottomNavBar';

function CustomToggle({ value, onToggle }: { value: boolean; onToggle: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.toggleTrack, value ? styles.toggleTrackOn : styles.toggleTrackOff]}
      onPress={onToggle}
      activeOpacity={0.8}
    >
      <View
        style={[
          styles.toggleThumb,
          value ? styles.toggleThumbOn : styles.toggleThumbOff,
        ]}
      />
    </TouchableOpacity>
  );
}

export default function SettingsScreen({ navigation }: any) {
  const [neonMode, setNeonMode] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(false);
  const [ghostLocation, setGhostLocation] = useState(true);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.headerAvatarBorder}>
            <Image
              source={{ uri: 'https://i.pravatar.cc/300?u=alex-profile' }}
              style={styles.headerAvatar}
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.logoText}>NEON</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <MaterialIcons name="notifications" size={24} color={Theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Title Area */}
        <View style={styles.titleArea}>
          <Text style={styles.titleLabel}>CONTROL CENTER</Text>
          <View style={styles.titleRow}>
            <Text style={styles.titleHeading}>SETTINGS</Text>
            <View style={styles.titleUnderline} />
          </View>
        </View>

        {/* ACCOUNT Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACCOUNT</Text>
          <View style={styles.sectionCards}>
            {/* Personal Information */}
            <TouchableOpacity
              style={styles.settingsCard}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <View style={styles.cardLeft}>
                <View style={[styles.cardIconBg, { backgroundColor: 'rgba(223,142,255,0.1)' }]}>
                  <MaterialIcons name="person" size={22} color={Theme.colors.primary} />
                </View>
                <View>
                  <Text style={styles.cardTitle}>Personal Information</Text>
                  <Text style={styles.cardSubtitle}>Name, Email, Phone</Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={Theme.colors.outlineVariant} />
            </TouchableOpacity>

            {/* Login & Security */}
            <TouchableOpacity style={styles.settingsCard} activeOpacity={0.8}>
              <View style={styles.cardLeft}>
                <View style={[styles.cardIconBg, { backgroundColor: 'rgba(223,142,255,0.1)' }]}>
                  <MaterialIcons name="lock" size={22} color={Theme.colors.primary} />
                </View>
                <View>
                  <Text style={styles.cardTitle}>Login & Security</Text>
                  <Text style={styles.cardSubtitle}>Password and 2FA</Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={Theme.colors.outlineVariant} />
            </TouchableOpacity>
          </View>
        </View>

        {/* PREFERENCES Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PREFERENCES</Text>
          <View style={styles.sectionCards}>
            {/* Neon Mode */}
            <View style={styles.settingsCard}>
              <View style={styles.cardLeft}>
                <View style={[styles.cardIconBg, { backgroundColor: 'rgba(47,248,1,0.1)' }]}>
                  <MaterialIcons name="flashlight-on" size={22} color={Theme.colors.secondary} />
                </View>
                <Text style={styles.cardTitle}>Neon Mode (Always On)</Text>
              </View>
              <CustomToggle value={neonMode} onToggle={() => setNeonMode(!neonMode)} />
            </View>

            {/* Push Alerts */}
            <View style={styles.settingsCard}>
              <View style={styles.cardLeft}>
                <View style={[styles.cardIconBg, { backgroundColor: 'rgba(47,248,1,0.1)' }]}>
                  <MaterialIcons name="notifications" size={22} color={Theme.colors.secondary} />
                </View>
                <Text style={styles.cardTitle}>Push Alerts</Text>
              </View>
              <CustomToggle value={pushAlerts} onToggle={() => setPushAlerts(!pushAlerts)} />
            </View>

            {/* Ghost Location */}
            <View style={styles.settingsCard}>
              <View style={styles.cardLeft}>
                <View style={[styles.cardIconBg, { backgroundColor: 'rgba(47,248,1,0.1)' }]}>
                  <MaterialIcons name="location-off" size={22} color={Theme.colors.secondary} />
                </View>
                <Text style={styles.cardTitle}>Ghost Location</Text>
              </View>
              <CustomToggle value={ghostLocation} onToggle={() => setGhostLocation(!ghostLocation)} />
            </View>
          </View>
        </View>

        {/* SUPPORT Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SUPPORT</Text>
          <View style={styles.sectionCards}>
            {/* Help Center */}
            <TouchableOpacity style={styles.settingsCard} activeOpacity={0.8}>
              <View style={styles.cardLeft}>
                <View style={[styles.cardIconBg, { backgroundColor: 'rgba(89,62,99,0.2)' }]}>
                  <MaterialIcons name="help" size={22} color={Theme.colors.outlineVariant} />
                </View>
                <Text style={styles.cardTitle}>Help Center</Text>
              </View>
              <MaterialIcons name="open-in-new" size={20} color={Theme.colors.outlineVariant} />
            </TouchableOpacity>

            {/* Privacy Policy */}
            <TouchableOpacity style={styles.settingsCard} activeOpacity={0.8}>
              <View style={styles.cardLeft}>
                <View style={[styles.cardIconBg, { backgroundColor: 'rgba(89,62,99,0.2)' }]}>
                  <MaterialIcons name="policy" size={22} color={Theme.colors.outlineVariant} />
                </View>
                <Text style={styles.cardTitle}>Privacy Policy</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={Theme.colors.outlineVariant} />
            </TouchableOpacity>

            {/* Report a Bug */}
            <TouchableOpacity style={styles.settingsCard} activeOpacity={0.8}>
              <View style={styles.cardLeft}>
                <View style={[styles.cardIconBg, { backgroundColor: 'rgba(89,62,99,0.2)' }]}>
                  <MaterialIcons name="bug-report" size={22} color={Theme.colors.outlineVariant} />
                </View>
                <Text style={styles.cardTitle}>Report a Bug</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={Theme.colors.outlineVariant} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Log Out Button */}
        <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.8}>
          <MaterialIcons name="logout" size={20} color={Theme.colors.error} />
          <Text style={styles.logoutText}>LOG OUT</Text>
        </TouchableOpacity>

        {/* Version */}
        <Text style={styles.versionText}>VERSION 2.4.0 (NEON-PRO)</Text>
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

  // Title Area
  titleArea: {
    marginBottom: 32,
  },
  titleLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Theme.colors.secondary,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 4,
  },
  titleRow: {
    position: 'relative',
  },
  titleHeading: {
    fontWeight: '900',
    fontStyle: 'italic',
    fontSize: 40,
    color: Theme.colors.text,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  titleUnderline: {
    position: 'absolute',
    bottom: 2,
    left: 0,
    width: 120,
    height: 4,
    backgroundColor: Theme.colors.primary,
    borderRadius: 2,
  },

  // Sections
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Theme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionCards: {
    gap: 8,
  },

  // Settings Card
  settingsCard: {
    backgroundColor: Theme.colors.surfaceContainer,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(89,62,99,0.15)',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  cardIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontWeight: '600',
    color: Theme.colors.text,
    fontSize: 16,
  },
  cardSubtitle: {
    fontSize: 13,
    color: Theme.colors.textMuted,
    marginTop: 2,
  },

  // Toggle
  toggleTrack: {
    width: 52,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleTrackOn: {
    backgroundColor: Theme.colors.secondary,
  },
  toggleTrackOff: {
    backgroundColor: Theme.colors.surfaceContainerHigh,
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  toggleThumbOn: {
    alignSelf: 'flex-end',
  },
  toggleThumbOff: {
    alignSelf: 'flex-start',
  },

  // Logout
  logoutBtn: {
    width: '100%',
    height: 56,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: Theme.colors.error,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 8,
  },
  logoutText: {
    fontWeight: 'bold',
    color: Theme.colors.error,
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontSize: 15,
  },

  // Version
  versionText: {
    textAlign: 'center',
    marginTop: 28,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 4,
    color: 'rgba(193,160,203,0.4)',
    fontWeight: 'bold',
  },
});
