import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  ScrollView, Animated, ActivityIndicator,
} from 'react-native';
import { Theme } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import BottomNavBar from '../components/BottomNavBar';
import * as Location from 'expo-location';
import { getActivities, getProfile } from '../api/api';
import type { Activity, User } from '../api/types';

// Mapbox requires a native build — not available in Expo Go.
let Mapbox: typeof import('@rnmapbox/maps').default | null = null;
try {
  Mapbox = require('@rnmapbox/maps').default;
  Mapbox!.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? '');
} catch {
  // Running in Expo Go or native modules not linked — map will show a placeholder.
}

// Category → icon name mapping
const CATEGORY_ICONS: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  Gym: 'fitness-center',
  Coding: 'code',
  Art: 'palette',
  Outdoors: 'terrain',
  Tennis: 'sports-tennis',
  default: 'place',
};

export default function MapViewScreen({ navigation }: any) {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;
  const cameraRef = useRef<Mapbox.Camera>(null);

  const [activities, setActivities] = useState<Activity[]>([]);
  const [profile, setProfile] = useState<User | null>(null);
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, [pulseAnim]);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setUserCoords([loc.coords.longitude, loc.coords.latitude]);
      }
    })();
    getProfile().then(setProfile).catch(() => {});
    getActivities()
      .then(setActivities)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const centerOnUser = useCallback(() => {
    if (userCoords && cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: userCoords,
        zoomLevel: 14,
        animationDuration: 800,
      });
    }
  }, [userCoords]);

  // Build GeoJSON FeatureCollection for activity pins
  const geojson: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: activities.map((a, i) => ({
      type: 'Feature',
      id: String(a.id),
      geometry: {
        type: 'Point',
        // Offset demo coords since activities don't have real coords yet
        coordinates: userCoords
          ? [userCoords[0] + (i - 1) * 0.004, userCoords[1] + (i % 2 === 0 ? 0.003 : -0.002)]
          : [0, 0],
      },
      properties: { title: a.title, category: a.category, activityId: a.id },
    })),
  };

  return (
    <View style={styles.container}>
      {/* Mapbox map fills the screen — or placeholder when native unavailable */}
      {Mapbox ? (
        <Mapbox.MapView
          style={styles.map}
          styleURL="mapbox://styles/mapbox/dark-v11"
          logoEnabled={false}
          attributionEnabled={false}
          compassEnabled={false}
        >
          <Mapbox.Camera
            ref={cameraRef}
            zoomLevel={13}
            centerCoordinate={userCoords ?? [77.209, 28.6139]}
            animationMode="flyTo"
            animationDuration={1000}
          />

          {/* User location puck */}
          <Mapbox.LocationPuck
            puckBearing="heading"
            puckBearingEnabled
            pulsing={{ isEnabled: true, color: Theme.colors.secondary, radius: 50 }}
          />

          {/* Activity pins as a ShapeSource */}
          {activities.length > 0 && (
            <Mapbox.ShapeSource
              id="activities"
              shape={geojson}
              onPress={(e) => {
                const feature = e.features[0];
                const actId = feature?.properties?.activityId as number | undefined;
                if (actId) {
                  const found = activities.find((a) => a.id === actId);
                  if (found) setSelectedActivity(found);
                }
              }}
            >
              <Mapbox.CircleLayer
                id="activityCircles"
                style={{
                  circleRadius: 22,
                  circleColor: Theme.colors.primary,
                  circleOpacity: 0.9,
                  circleShadowColor: Theme.colors.primary,
                }}
              />
              <Mapbox.SymbolLayer
                id="activityLabels"
                style={{
                  textField: ['get', 'title'],
                  textSize: 10,
                  textColor: '#fff',
                  textOffset: [0, 2.5],
                  textAnchor: 'top',
                  textMaxWidth: 8,
                }}
              />
            </Mapbox.ShapeSource>
          )}
        </Mapbox.MapView>
      ) : (
        <View style={styles.mapPlaceholder}>
          <MaterialIcons name="map" size={64} color="rgba(223,142,255,0.2)" />
          <Text style={styles.mapPlaceholderText}>MAP REQUIRES{`\n`}NATIVE BUILD</Text>
          <Text style={styles.mapPlaceholderSub}>Run with{' '}
            <Text style={{ color: Theme.colors.primary }}>expo run:ios</Text>
            {' '}or{' '}
            <Text style={{ color: Theme.colors.primary }}>expo run:android</Text>
          </Text>
        </View>
      )}

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color={Theme.colors.primary} />
        </View>
      )}

      {/* Dark gradient at bottom so cards are readable */}
      <LinearGradient
        colors={['transparent', 'rgba(26,4,37,0.7)', '#1a0425']}
        style={styles.bottomGradient}
        pointerEvents="none"
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('UserProfile')} style={styles.avatarBorder}>
          <Image
            source={{ uri: profile?.avatarUrl ?? 'https://i.pravatar.cc/150?u=mainuser' }}
            style={styles.headerAvatar}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>NEON</Text>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('NotificationsCenter')}>
          <MaterialIcons name="notifications" size={24} color={Theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Search Bar Overlay */}
      <View style={styles.searchOverlay}>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={22} color={Theme.colors.outline} />
          <Text style={styles.searchPlaceholder}>Find activities nearby...</Text>
          <MaterialIcons name="mic" size={22} color={Theme.colors.outline} />
        </View>
      </View>

      {/* FAB Stack */}
      <View style={styles.fabContainer}>
        <TouchableOpacity style={styles.locationFab} onPress={centerOnUser}>
          <MaterialIcons name="my-location" size={24} color={Theme.colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.addFab} onPress={() => navigation.navigate('CreateActivityStep1')}>
          <MaterialIcons name="add" size={32} color={Theme.colors.onPrimary} />
        </TouchableOpacity>
      </View>

      {/* Bottom Card Carousel — shows selected activity or all */}
      <View style={styles.carouselContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carouselScroll}>
          {(selectedActivity ? [selectedActivity] : activities).map((a) => (
            <TouchableOpacity
              key={a.id}
              style={styles.mapCard}
              activeOpacity={0.9}
              onPress={() => navigation.navigate('ActivityDetails', { activityId: a.id })}
            >
              <View style={styles.cardIconThumb}>
                <MaterialIcons
                  name={CATEGORY_ICONS[a.category] ?? CATEGORY_ICONS.default}
                  size={32}
                  color={Theme.colors.primary}
                />
              </View>
              <View style={styles.cardInfo}>
                <View style={styles.cardTitleRow}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{a.title}</Text>
                  <View style={styles.liveBadgeSmall}>
                    <Text style={styles.liveBadgeSmallText}>LIVE</Text>
                  </View>
                </View>
                <Text style={styles.cardDistance} numberOfLines={1}>{a.location}</Text>
                <TouchableOpacity
                  style={styles.cardJoinBtn}
                  onPress={() => navigation.navigate('ActivityDetails', { activityId: a.id })}
                >
                  <Text style={styles.cardJoinBtnText}>JOIN SESSION</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Bottom Navigation */}
      <BottomNavBar activeTab="explore" navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.surfaceContainerLowest },

  // Map
  map: { flex: 1 },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: Theme.colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  mapPlaceholderText: {
    color: 'rgba(223,142,255,0.4)',
    fontWeight: '900',
    fontSize: 18,
    letterSpacing: 3,
    textAlign: 'center',
  },
  mapPlaceholderSub: {
    color: Theme.colors.outline,
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 20,
  },
  loadingOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(26,4,37,0.5)',
  },
  bottomGradient: {
    position: 'absolute', left: 0, right: 0, bottom: 0, height: 340,
  },

  // Header
  header: {
    position: 'absolute', top: 0, width: '100%', zIndex: 50,
    backgroundColor: 'rgba(26,4,37,0.8)',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, height: 100, paddingTop: 40,
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

  // Search overlay
  searchOverlay: {
    position: 'absolute', top: 110, left: 24, right: 24, zIndex: 40,
  },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(41,12,54,0.6)', borderRadius: 9999,
    paddingHorizontal: 20, height: 52, gap: 12,
    borderWidth: 1, borderColor: 'rgba(223,142,255,0.2)',
  },
  searchPlaceholder: { flex: 1, fontSize: 14, color: Theme.colors.outline },

  // Card icon thumb (replaces image thumbnail)
  cardIconThumb: {
    width: 80, height: 80, borderRadius: 12,
    backgroundColor: 'rgba(223,142,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },

  // FABs
  fabContainer: { position: 'absolute', right: 24, bottom: 280, gap: 16, zIndex: 40 },
  locationFab: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: 'rgba(49,17,63,0.8)', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(223,142,255,0.1)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3, shadowRadius: 10,
  },
  addFab: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Theme.colors.primary, alignItems: 'center', justifyContent: 'center',
    shadowColor: Theme.colors.primary, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4, shadowRadius: 25,
  },

  // Carousel
  carouselContainer: { position: 'absolute', bottom: 120, width: '100%', zIndex: 30 },
  carouselScroll: { paddingHorizontal: 24, gap: 16 },
  mapCard: {
    width: 280, backgroundColor: 'rgba(41,12,54,0.6)',
    borderRadius: 16, padding: 16, flexDirection: 'row', gap: 16,
    borderWidth: 1, borderColor: 'rgba(89,62,99,0.1)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5, shadowRadius: 20,
  },
  cardInfo: { flex: 1, justifyContent: 'center' },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { fontWeight: 'bold', fontSize: 16, color: Theme.colors.text },
  liveBadgeSmall: {
    backgroundColor: Theme.colors.secondary, paddingHorizontal: 8,
    paddingVertical: 2, borderRadius: 8,
  },
  liveBadgeSmallText: {
    color: Theme.colors.onSecondary, fontSize: 9, fontWeight: '900',
    textTransform: 'uppercase', letterSpacing: 1,
  },
  cardDistance: {
    color: Theme.colors.onSurfaceVariant, fontSize: 11, fontWeight: '500',
    marginTop: 4, marginBottom: 8,
  },
  cardJoinBtn: {
    height: 32, borderRadius: 16,
    backgroundColor: Theme.colors.primary, alignItems: 'center', justifyContent: 'center',
    shadowColor: Theme.colors.primary, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3, shadowRadius: 12,
  },
  cardJoinBtnText: {
    color: Theme.colors.onPrimary, fontWeight: '900', fontSize: 11,
    textTransform: 'uppercase', letterSpacing: 1,
  },
});
