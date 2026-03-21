import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ImageBackground } from 'react-native';
import { Theme } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import BottomNavBar from '../components/BottomNavBar';

const ACTIVITIES = [
  {
    id: 'gym',
    label: 'GYM',
    icon: 'fitness-center' as keyof typeof MaterialIcons.glyphMap,
    subtitle: 'Iron, sweat, and pure adrenaline.',
    hasImage: true,
    imageUri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBbVm8FQFcHTwBgR-w8eGd_rrXguATOgZb0xbmN8u8qzHm-d-uLUKqmevmfzK0C-u-4mAv0Zg-U3OuDbhqp4xxmI_1b1JdNJVKFBx0OAq7U3eXz_tqJkI9PnP2qqT7BgpuWkQ',
  },
  {
    id: 'coding',
    label: 'CODING',
    icon: 'code' as keyof typeof MaterialIcons.glyphMap,
    subtitle: 'Deep Focus',
    hasImage: false,
  },
  {
    id: 'tennis',
    label: 'TENNIS',
    icon: 'sports-tennis' as keyof typeof MaterialIcons.glyphMap,
    subtitle: 'Social Sport',
    hasImage: false,
  },
  {
    id: 'gaming',
    label: 'GAMING',
    icon: 'sports-esports' as keyof typeof MaterialIcons.glyphMap,
    subtitle: 'Late night raids and competitive play.',
    hasImage: false,
  },
  {
    id: 'yoga',
    label: 'YOGA',
    icon: 'self-improvement' as keyof typeof MaterialIcons.glyphMap,
    subtitle: 'Mindful',
    hasImage: false,
  },
];

const TRENDING = [
  { id: '1', title: 'Night HIIT', spots: '4 spots left', full: false },
  { id: '2', title: 'VALOR', spots: 'FULL', full: true },
];

export default function CreateActivityStep1Screen({ navigation }: any) {
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);

  const toggleActivity = (id: string) => {
    setSelectedActivity(prev => (prev === id ? null : id));
  };

  return (
    <View style={styles.container}>
      {/* Header: Avatar left, PULSE centered, gear right */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('UserProfile')} style={styles.avatarBorder}>
          <Image
            source={{ uri: 'https://i.pravatar.cc/150?u=mainuser' }}
            style={styles.headerAvatar}
          />
        </TouchableOpacity>
        <Text style={styles.logoText}>PULSE</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <MaterialIcons name="settings" size={24} color={Theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Step label */}
        <Text style={styles.stepLabel}>STEP 01</Text>

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.titleWhite}>CHOOSE YOUR</Text>
          <Text style={styles.titleGreen}>VIBE</Text>
        </View>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          What's the energy today? Pick a category to find your next session.
        </Text>

        {/* Activity Grid - 2 columns */}
        <View style={styles.gridContainer}>
          {/* Row 1: GYM (large) + CODING */}
          <View style={styles.gridRow}>
            {/* GYM - large card with ImageBackground */}
            <TouchableOpacity
              style={[
                styles.cardLarge,
                selectedActivity === 'gym' && styles.cardSelected,
              ]}
              activeOpacity={0.8}
              onPress={() => toggleActivity('gym')}
            >
              <ImageBackground
                source={{ uri: ACTIVITIES[0].imageUri }}
                style={styles.cardImageBg}
                imageStyle={{ borderRadius: 16, opacity: 0.4 }}
              >
                <LinearGradient
                  colors={['transparent', 'rgba(26,4,37,0.9)']}
                  style={styles.cardGradient}
                >
                  <MaterialIcons name="fitness-center" size={28} color={Theme.colors.secondary} />
                  <Text style={styles.cardLargeTitle}>GYM</Text>
                  <Text style={styles.cardLargeSubtitle}>Iron, sweat, and pure adrenaline.</Text>
                </LinearGradient>
              </ImageBackground>
              {selectedActivity === 'gym' && (
                <View style={styles.checkBadge}>
                  <MaterialIcons name="check" size={16} color={Theme.colors.onPrimary} />
                </View>
              )}
            </TouchableOpacity>

            {/* CODING */}
            <TouchableOpacity
              style={[
                styles.cardSmall,
                selectedActivity === 'coding' && styles.cardSelected,
              ]}
              activeOpacity={0.8}
              onPress={() => toggleActivity('coding')}
            >
              <MaterialIcons name="code" size={28} color={Theme.colors.onSurfaceVariant} />
              <Text style={styles.cardTitle}>CODING</Text>
              <Text style={styles.cardSubtitle}>Deep Focus</Text>
              {selectedActivity === 'coding' && (
                <View style={styles.checkBadge}>
                  <MaterialIcons name="check" size={16} color={Theme.colors.onPrimary} />
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Row 2: TENNIS + GAMING */}
          <View style={styles.gridRow}>
            <TouchableOpacity
              style={[
                styles.cardSmall,
                selectedActivity === 'tennis' && styles.cardSelected,
              ]}
              activeOpacity={0.8}
              onPress={() => toggleActivity('tennis')}
            >
              <MaterialIcons name="sports-tennis" size={28} color={Theme.colors.onSurfaceVariant} />
              <Text style={styles.cardTitle}>TENNIS</Text>
              <Text style={styles.cardSubtitle}>Social Sport</Text>
              {selectedActivity === 'tennis' && (
                <View style={styles.checkBadge}>
                  <MaterialIcons name="check" size={16} color={Theme.colors.onPrimary} />
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.cardSmall,
                selectedActivity === 'gaming' && styles.cardSelected,
              ]}
              activeOpacity={0.8}
              onPress={() => toggleActivity('gaming')}
            >
              <MaterialIcons name="sports-esports" size={28} color={Theme.colors.onSurfaceVariant} />
              <Text style={styles.cardTitle}>GAMING</Text>
              <Text style={styles.cardSubtitle}>Late night raids and competitive play.</Text>
              {selectedActivity === 'gaming' && (
                <View style={styles.checkBadge}>
                  <MaterialIcons name="check" size={16} color={Theme.colors.onPrimary} />
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Row 3: YOGA + VIEW ALL */}
          <View style={styles.gridRow}>
            <TouchableOpacity
              style={[
                styles.cardSmall,
                selectedActivity === 'yoga' && styles.cardSelected,
              ]}
              activeOpacity={0.8}
              onPress={() => toggleActivity('yoga')}
            >
              <MaterialIcons name="self-improvement" size={28} color={Theme.colors.onSurfaceVariant} />
              <Text style={styles.cardTitle}>YOGA</Text>
              <Text style={styles.cardSubtitle}>Mindful</Text>
              {selectedActivity === 'yoga' && (
                <View style={styles.checkBadge}>
                  <MaterialIcons name="check" size={16} color={Theme.colors.onPrimary} />
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.cardDashed} activeOpacity={0.7}>
              <MaterialIcons name="add" size={32} color={Theme.colors.outline} />
              <Text style={styles.viewAllText}>+ VIEW ALL</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Trending Near You */}
        <View style={styles.trendingSection}>
          <Text style={styles.sectionHeading}>TRENDING NEAR YOU</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trendingScroll}>
            {TRENDING.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.trendingCard, item.full && styles.trendingCardDisabled]}
                activeOpacity={item.full ? 1 : 0.8}
                disabled={item.full}
              >
                <Text style={styles.trendingTitle}>{item.title}</Text>
                <Text style={[styles.trendingSpots, item.full && styles.trendingSpotsDisabled]}>
                  {item.spots}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Green floating arrow button bottom-right */}
      {selectedActivity && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('CreateActivityStep2', { category: selectedActivity })}
        >
          <MaterialIcons name="arrow-forward" size={28} color={Theme.colors.onSecondary} />
        </TouchableOpacity>
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

  scrollContent: { paddingTop: 120, paddingHorizontal: 24, paddingBottom: 120 },

  stepLabel: {
    color: Theme.colors.secondary, fontSize: 12, fontWeight: '900',
    letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12,
  },

  titleSection: { marginBottom: 12 },
  titleWhite: {
    fontWeight: '900', fontStyle: 'italic', fontSize: 42,
    color: Theme.colors.text, letterSpacing: -1, textTransform: 'uppercase',
    lineHeight: 48,
  },
  titleGreen: {
    fontWeight: '900', fontStyle: 'italic', fontSize: 42,
    color: Theme.colors.secondary, letterSpacing: -1, textTransform: 'uppercase',
    lineHeight: 48,
  },

  subtitle: {
    color: Theme.colors.onSurfaceVariant, fontSize: 16, lineHeight: 24,
    marginBottom: 32,
  },

  gridContainer: { gap: 16, marginBottom: 40 },
  gridRow: { flexDirection: 'row', gap: 16 },

  cardLarge: {
    flex: 1, height: 200, borderRadius: 16, overflow: 'hidden',
    backgroundColor: Theme.colors.surfaceContainer,
    position: 'relative',
  },
  cardImageBg: { flex: 1, width: '100%', height: '100%' },
  cardGradient: {
    flex: 1, justifyContent: 'flex-end', padding: 16, gap: 4,
  },
  cardLargeTitle: {
    fontWeight: '900', fontSize: 20, color: Theme.colors.text,
    textTransform: 'uppercase', letterSpacing: 1,
  },
  cardLargeSubtitle: {
    fontSize: 11, color: Theme.colors.onSurfaceVariant, lineHeight: 16,
  },

  cardSmall: {
    flex: 1, height: 150, backgroundColor: Theme.colors.surfaceContainer,
    borderRadius: 16, padding: 16, justifyContent: 'center', gap: 8,
    position: 'relative',
  },
  cardTitle: {
    fontWeight: '900', fontSize: 16, color: Theme.colors.text,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  cardSubtitle: {
    fontSize: 11, color: Theme.colors.onSurfaceVariant, letterSpacing: 0.5,
  },

  cardSelected: {
    borderWidth: 2, borderColor: Theme.colors.primary,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4, shadowRadius: 25,
  },
  checkBadge: {
    position: 'absolute', top: 12, right: 12,
    backgroundColor: Theme.colors.primary, borderRadius: 12, padding: 4,
  },

  cardDashed: {
    flex: 1, height: 150, borderRadius: 16, borderWidth: 2,
    borderColor: Theme.colors.outlineVariant, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  viewAllText: {
    color: Theme.colors.outline, fontSize: 12, fontWeight: '900',
    letterSpacing: 1, textTransform: 'uppercase',
  },

  trendingSection: { marginBottom: 24 },
  sectionHeading: {
    fontWeight: '900', fontStyle: 'italic', fontSize: 14,
    color: Theme.colors.text, textTransform: 'uppercase',
    letterSpacing: 2, marginBottom: 16,
  },
  trendingScroll: { gap: 12 },
  trendingCard: {
    backgroundColor: Theme.colors.surfaceContainerHigh,
    borderRadius: 16, paddingHorizontal: 24, paddingVertical: 16,
    borderWidth: 1, borderColor: 'rgba(89,62,99,0.15)',
    minWidth: 160,
  },
  trendingCardDisabled: { opacity: 0.4 },
  trendingTitle: {
    fontWeight: '900', fontSize: 16, color: Theme.colors.text,
    marginBottom: 4,
  },
  trendingSpots: {
    fontSize: 12, fontWeight: '700', color: Theme.colors.secondary,
    letterSpacing: 1, textTransform: 'uppercase',
  },
  trendingSpotsDisabled: { color: Theme.colors.error },

  fab: {
    position: 'absolute', bottom: 120, right: 24,
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: Theme.colors.secondary,
    alignItems: 'center', justifyContent: 'center', zIndex: 40,
    shadowColor: Theme.colors.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5, shadowRadius: 35,
  },
});
