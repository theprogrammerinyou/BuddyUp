import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { observer } from "mobx-react-lite";
import MapView, { Marker } from "react-native-maps";
import { authStore } from "@/stores/authStore";
import { api } from "@/services/api";
import { colors, spacing, radii, fontSizes } from "@/theme";

interface VisitedCity {
  id: string;
  city_name: string;
  country_code?: string;
}

export default observer(function TravelMapScreen({ navigation }: any) {
  const [cities, setCities] = useState<VisitedCity[]>([]);
  const [cityInput, setCityInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  const userId = authStore.user?.id;

  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const { data } = await api.get(`/users/${userId}/visited-cities`);
        setCities(Array.isArray(data) ? data : data.cities ?? []);
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    })();
  }, [userId]);

  const handleAddCity = async () => {
    const trimmed = cityInput.trim();
    if (!trimmed) return;
    setIsAdding(true);
    try {
      const { data } = await api.post("/me/visited-cities", { city_name: trimmed });
      // Use server-provided ID; fall back to timestamp string if absent (should not happen in production)
      const newCity: VisitedCity = data.city ?? {
        id: typeof data.id === "string" ? data.id : `local_${Date.now()}`,
        city_name: trimmed,
      };
      setCities((prev) => [...prev, newCity]);
      setCityInput("");
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.error ?? "Failed to add city");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#0F0F1A", "#1A1A2E"]} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>🗺️ Travel Map</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Add city input */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Enter city name..."
          placeholderTextColor={colors.textMuted}
          value={cityInput}
          onChangeText={setCityInput}
          onSubmitEditing={handleAddCity}
          returnKeyType="done"
        />
        <TouchableOpacity
          style={[styles.addBtn, (!cityInput.trim() || isAdding) && styles.addBtnDisabled]}
          onPress={handleAddCity}
          disabled={!cityInput.trim() || isAdding}
          activeOpacity={0.8}
        >
          {isAdding ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.addBtnText}>Add City</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          style={StyleSheet.absoluteFillObject}
          initialRegion={{ latitude: 20, longitude: 0, latitudeDelta: 100, longitudeDelta: 100 }}
          mapType="standard"
          userInterfaceStyle="dark"
        >
          {/* We show markers only if we have lat/lng; otherwise just the list below */}
        </MapView>
        <View style={styles.mapOverlay} pointerEvents="none">
          <Text style={styles.mapNote}>📍 Cities listed below</Text>
        </View>
      </View>

      {/* Cities list fallback */}
      <View style={styles.listSection}>
        <Text style={styles.listHeader}>
          Visited Cities {cities.length > 0 ? `(${cities.length})` : ""}
        </Text>
        {isLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.md }} />
        ) : (
          <FlatList
            data={cities}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.cityList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No cities yet. Add one above!</Text>
            }
            renderItem={({ item }) => (
              <View style={styles.cityRow}>
                <Text style={styles.cityPin}>📍</Text>
                <Text style={styles.cityName}>{item.city_name}</Text>
                {item.country_code ? (
                  <Text style={styles.countryCode}>{item.country_code.toUpperCase()}</Text>
                ) : null}
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  title: { fontSize: fontSizes.lg, fontWeight: "900", color: colors.text },
  inputRow: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: colors.bgCard,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    color: colors.text,
    fontSize: fontSizes.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 80,
  },
  addBtnDisabled: { opacity: 0.5 },
  addBtnText: { color: "#fff", fontWeight: "700", fontSize: fontSizes.sm },
  mapContainer: { height: 200, marginHorizontal: spacing.lg, borderRadius: radii.lg, overflow: "hidden", position: "relative" },
  mapOverlay: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.full,
  },
  mapNote: { fontSize: 11, color: "#fff", fontWeight: "600" },
  listSection: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  listHeader: {
    fontSize: fontSizes.sm,
    fontWeight: "700",
    color: colors.textSub,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  cityList: { gap: 8, paddingBottom: 60 },
  cityRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgCard,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  cityPin: { fontSize: 18 },
  cityName: { flex: 1, fontSize: fontSizes.md, fontWeight: "700", color: colors.text },
  countryCode: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "600",
    backgroundColor: colors.bgInput,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.full,
  },
  emptyText: { fontSize: fontSizes.sm, color: colors.textMuted, textAlign: "center", paddingTop: spacing.lg },
});
