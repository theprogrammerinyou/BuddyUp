import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  FlatList,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import MapView, { Marker, Circle } from "react-native-maps";
import { LinearGradient } from "react-native-linear-gradient";
import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";
import { observer } from "mobx-react-lite";
import { discoverStore } from "@/stores/discoverStore";
import { colors, spacing, radii, fontSizes } from "@/theme";

const { height } = Dimensions.get("window");

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org/search";

interface SearchResult {
  lat: string;
  lon: string;
  display_name: string;
  type?: string;
}

export default observer(function LocationFilterScreen({ navigation }: any) {
  const [region, setRegion] = useState({
    latitude: discoverStore.filterLat ?? 28.6139,
    longitude: discoverStore.filterLng ?? 77.209,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5,
  });
  const [radius, setRadius] = useState(discoverStore.filterRadius);
  const [pinCoords, setPinCoords] = useState({
    latitude: discoverStore.filterLat ?? 28.6139,
    longitude: discoverStore.filterLng ?? 77.209,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mapRef = useRef<MapView>(null);

  const searchInRegion = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const { latitude, longitude, latitudeDelta, longitudeDelta } = region;
      const minLat = latitude - latitudeDelta / 2;
      const maxLat = latitude + latitudeDelta / 2;
      const minLon = longitude - longitudeDelta / 2;
      const maxLon = longitude + longitudeDelta / 2;
      const viewbox = `${minLon},${maxLat},${maxLon},${minLat}`;
      const params = new URLSearchParams({
        q: query.trim(),
        format: "json",
        limit: "8",
        viewbox,
        bounded: "1",
      });
      const res = await fetch(`${NOMINATIM_BASE}?${params}`, {
        headers: { "User-Agent": "BuddyUp/1.0 (location search)" },
      });
      const data: SearchResult[] = await res.json();
      setSearchResults(data ?? []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, [region]);

  const onSearchChange = (text: string) => {
    setSearchQuery(text);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (!text.trim()) {
      setSearchResults([]);
      return;
    }
    searchTimeoutRef.current = setTimeout(() => searchInRegion(text), 400);
  };

  const onSelectResult = (item: SearchResult) => {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    setPinCoords({ latitude: lat, longitude: lon });
    setRegion((r) => ({ ...r, latitude: lat, longitude: lon }));
    mapRef.current?.animateToRegion({
      latitude: lat,
      longitude: lon,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    }, 400);
    setSearchResults([]);
    setSearchQuery("");
    Keyboard.dismiss();
  };

  const handleMapPress = (e: any) => {
    const { coordinate } = e.nativeEvent;
    setPinCoords(coordinate);
  };

  const handleApply = () => {
    discoverStore.setFilter(pinCoords.latitude, pinCoords.longitude, radius);
    discoverStore.fetchDiscover();
    navigation.goBack();
  };

  const handleReset = () => {
    discoverStore.clearFilter();
    discoverStore.fetchDiscover();
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#0F0F1A", "#1A1A2E"]} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Location Filter</Text>
        <TouchableOpacity onPress={handleReset}>
          <Text style={styles.reset}>Reset</Text>
        </TouchableOpacity>
      </View>

      {/* Region-based location search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={20} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search location (within map region)"
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={onSearchChange}
          returnKeyType="search"
        />
        {searching && <ActivityIndicator size="small" color={colors.primary} style={styles.searchSpinner} />}
      </View>
      {searchResults.length > 0 && (
        <View style={styles.resultsList}>
          <FlatList
            data={searchResults}
            keyExtractor={(item) => `${item.lat}-${item.lon}-${item.display_name}`}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.resultRow} onPress={() => onSelectResult(item)} activeOpacity={0.7}>
                <Ionicons name="location" size={18} color={colors.primary} />
                <Text style={styles.resultText} numberOfLines={2}>{item.display_name}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      <Text style={styles.hint}>Tap on the map or search to pick a location</Text>

      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        onPress={handleMapPress}
        mapType="mutedStandard"
        userInterfaceStyle="dark"
        showsUserLocation
      >
        <Marker coordinate={pinCoords} pinColor={colors.primary} />
        <Circle
          center={pinCoords}
          radius={radius * 1000}
          strokeColor={colors.primary + "88"}
          fillColor={colors.primary + "22"}
          strokeWidth={2}
        />
      </MapView>

      {/* Radius control */}
      <View style={styles.panel}>
        <View style={styles.radiusRow}>
          <Ionicons name="locate" size={18} color={colors.primary} />
          <Text style={styles.radiusLabel}>Radius</Text>
          <Text style={styles.radiusValue}>{Math.round(radius)} km</Text>
        </View>
        <Slider
          style={{ width: "100%", height: 40 }}
          minimumValue={5}
          maximumValue={200}
          value={radius}
          onValueChange={setRadius}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.primary}
        />

        <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            style={styles.applyGrad}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.applyText}>Apply Filter</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  title: { fontSize: fontSizes.lg, fontWeight: "800", color: colors.text },
  reset: { color: colors.error, fontWeight: "700", fontSize: fontSizes.sm },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgCard,
    marginHorizontal: spacing.md,
    marginBottom: 8,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: fontSizes.md, color: colors.text },
  searchSpinner: { marginLeft: 8 },
  resultsList: {
    maxHeight: 160,
    backgroundColor: colors.bgCard,
    marginHorizontal: spacing.md,
    marginBottom: 8,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  resultRow: { flexDirection: "row", alignItems: "center", padding: 12, gap: 10 },
  resultText: { flex: 1, fontSize: fontSizes.sm, color: colors.text },
  hint: { fontSize: 12, color: colors.textSub, textAlign: "center", marginBottom: 8 },
  map: { flex: 1, marginHorizontal: spacing.md, borderRadius: radii.lg, overflow: "hidden" },
  panel: {
    backgroundColor: colors.bgCard,
    margin: spacing.md,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  radiusRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  radiusLabel: { flex: 1, color: colors.textSub, fontWeight: "600" },
  radiusValue: { color: colors.primary, fontWeight: "800", fontSize: fontSizes.md },
  applyBtn: { borderRadius: radii.xl, overflow: "hidden", marginTop: 16 },
  applyGrad: { paddingVertical: 16, alignItems: "center" },
  applyText: { color: "#fff", fontWeight: "800", fontSize: fontSizes.md },
});
