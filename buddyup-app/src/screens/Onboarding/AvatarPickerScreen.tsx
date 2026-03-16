import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LinearGradient } from "react-native-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { observer } from "mobx-react-lite";
import { api } from "@/services/api";
import { authStore, Character } from "@/stores/authStore";
import { colors, spacing, radii, fontSizes } from "@/theme";
import * as Location from "expo-location";

const TYPES = ["anime", "movie", "book"] as const;

export default observer(function AvatarPickerScreen({ navigation, route }: any) {
  const prevData = route.params ?? {};
  const [characters, setCharacters] = useState<Character[]>([]);
  const [filtered, setFiltered] = useState<Character[]>([]);
  const [activeType, setActiveType] = useState<string>("anime");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/characters").then(({ data }) => {
      setCharacters(data.characters ?? []);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      characters.filter(
        (c) =>
          c.type === activeType &&
          (c.name.toLowerCase().includes(q) ||
            c.franchise.toLowerCase().includes(q))
      )
    );
  }, [characters, activeType, search]);

  const handleFinish = async () => {
    if (!selected) return Alert.alert("Please pick an avatar");
    // Get location (optional)
    let lat: number | undefined;
    let lng: number | undefined;
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({});
        lat = loc.coords.latitude;
        lng = loc.coords.longitude;
      }
    } catch {}

    await authStore.register({
      ...prevData,
      avatar_character_id: selected.id,
      latitude: lat,
      longitude: lng,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#0F0F1A", "#1A1A3E"]} style={StyleSheet.absoluteFill} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.step}>Step 3 of 3</Text>
      </View>

      <Text style={styles.title}>Pick Your Avatar</Text>
      <Text style={styles.sub}>You'll be known by this character's likeness 🎭</Text>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.search}
          placeholder="Search characters..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Type tabs */}
      <View style={styles.tabs}>
        {TYPES.map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setActiveType(t)}
            style={[styles.tab, activeType === t && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeType === t && styles.tabTextActive]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(c) => String(c.id)}
          numColumns={3}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => {
            const isSelected = selected?.id === item.id;
            return (
              <TouchableOpacity
                style={[styles.card, isSelected && styles.cardSelected]}
                onPress={() => setSelected(item)}
                activeOpacity={0.8}
              >
                <Image source={{ uri: item.image_url }} style={styles.avatar} />
                {isSelected && (
                  <View style={styles.check}>
                    <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                  </View>
                )}
                <Text style={styles.charName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.franchise} numberOfLines={1}>{item.franchise}</Text>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* Sticky footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.btn, !selected && { opacity: 0.5 }]}
          onPress={handleFinish}
          disabled={!selected || authStore.isLoading}
        >
          <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.btnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            {authStore.isLoading ? <ActivityIndicator color="#fff" /> : (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={styles.btnText}>Create Account</Text>
                <Ionicons name="person-add" size={18} color="#fff" style={{ marginLeft: 8 }} />
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  step: { fontSize: 12, color: colors.primary, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" },
  title: { fontSize: fontSizes.xl, fontWeight: "900", color: colors.text, paddingHorizontal: spacing.lg, marginTop: 16, marginBottom: 4 },
  sub: { fontSize: fontSizes.sm, color: colors.textSub, paddingHorizontal: spacing.lg, marginBottom: 16 },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgInput,
    marginHorizontal: spacing.lg,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  search: { flex: 1, color: colors.text, fontSize: fontSizes.sm },
  tabs: { flexDirection: "row", marginHorizontal: spacing.lg, marginBottom: 16, gap: 8 },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: radii.md,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { color: colors.textSub, fontWeight: "600", fontSize: fontSizes.sm },
  tabTextActive: { color: "#fff" },
  grid: { paddingHorizontal: spacing.md, paddingBottom: 100 },
  card: {
    flex: 1,
    margin: 6,
    alignItems: "center",
    backgroundColor: colors.bgCard,
    borderRadius: radii.md,
    padding: 8,
    borderWidth: 2,
    borderColor: "transparent",
  },
  cardSelected: { borderColor: colors.primary },
  avatar: { width: 80, height: 80, borderRadius: 12, backgroundColor: colors.bgInput },
  check: { position: "absolute", top: 4, right: 4 },
  charName: { color: colors.text, fontWeight: "700", fontSize: 11, marginTop: 8, textAlign: "center" },
  franchise: { color: colors.textMuted, fontSize: 10, textAlign: "center", marginTop: 2 },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, padding: spacing.lg, backgroundColor: colors.bg },
  btn: { borderRadius: radii.xl, overflow: "hidden" },
  btnGrad: { paddingVertical: 18, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "800", fontSize: fontSizes.md },
});
