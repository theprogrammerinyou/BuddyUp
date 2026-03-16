import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "react-native-linear-gradient";
import { observer } from "mobx-react-lite";
import { Ionicons } from "@expo/vector-icons";
import { authStore } from "@/stores/authStore";
import { colors, spacing, radii, fontSizes } from "@/theme";

// Simple step 1: collect basic info, then go to Interests, then AvatarPicker
export default observer(function RegisterScreen({ navigation, route }: any) {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleNext = () => {
    if (!displayName || !email || !password) {
      return Alert.alert("Fill all required fields");
    }
    navigation.navigate("Interests", { display_name: displayName, email, password, bio });
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#0F0F1A", "#1A1A3E"]} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={styles.inner} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <Text style={styles.step}>Step 1 of 3</Text>
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.sub}>Tell us about yourself</Text>

        <View style={styles.form}>
          {[
            { label: "Display Name *", icon: "person-outline", value: displayName, onChangeText: setDisplayName, placeholder: "e.g. Arjun" },
            { label: "Email *", icon: "mail-outline", value: email, onChangeText: setEmail, placeholder: "you@example.com", keyboardType: "email-address", autoCapitalize: "none" },
            { label: "Bio", icon: "chatbubble-outline", value: bio, onChangeText: setBio, placeholder: "What are you into?" },
          ].map((field) => (
            <View key={field.label}>
              <Text style={styles.label}>{field.label}</Text>
              <View style={styles.inputWrap}>
                <Ionicons name={field.icon as any} size={18} color={colors.textMuted} style={{ marginRight: 10 }} />
                <TextInput
                  style={styles.input}
                  placeholder={field.placeholder}
                  placeholderTextColor={colors.textMuted}
                  value={field.value}
                  onChangeText={field.onChangeText}
                  keyboardType={(field as any).keyboardType}
                  autoCapitalize={(field as any).autoCapitalize ?? "sentences"}
                />
              </View>
            </View>
          ))}

          <View>
            <Text style={styles.label}>Password *</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} style={{ marginRight: 10 }} />
              <TextInput
                style={styles.input}
                placeholder="Min 6 characters"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                <Ionicons name={showPass ? "eye-off" : "eye"} size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.btn} onPress={handleNext}>
          <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.btnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={styles.btnText}>Next: Choose Interests →</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Login")} style={styles.switchRow}>
          <Text style={styles.switchText}>
            Have an account?{" "}
            <Text style={{ color: colors.primary, fontWeight: "700" }}>Log in</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  inner: { padding: spacing.lg, paddingBottom: 40 },
  back: { marginTop: 8, marginBottom: 24 },
  step: { fontSize: 12, color: colors.primary, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" },
  title: { fontSize: fontSizes.xxl, fontWeight: "900", color: colors.text, marginTop: 4, marginBottom: 6 },
  sub: { fontSize: fontSizes.md, color: colors.textSub, marginBottom: 32 },
  form: { gap: 20 },
  label: { fontSize: 13, color: colors.textSub, fontWeight: "600", marginBottom: 8 },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgInput,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    height: 56,
  },
  input: { flex: 1, color: colors.text, fontSize: fontSizes.md },
  btn: { borderRadius: radii.xl, overflow: "hidden", marginTop: 36 },
  btnGrad: { paddingVertical: 18, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "800", fontSize: fontSizes.md },
  switchRow: { alignItems: "center", marginTop: 24 },
  switchText: { color: colors.textSub, fontSize: fontSizes.sm },
});
