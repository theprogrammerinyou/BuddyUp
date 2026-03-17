import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { LinearGradient } from "react-native-linear-gradient";
import { observer } from "mobx-react-lite";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radii, fontSizes } from "@/theme";

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Simple step 1: collect basic info, then go to Interests, then AvatarPicker
export default observer(function RegisterScreen({ navigation, route }: any) {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const validate = () => {
    let valid = true;
    setNameError("");
    setEmailError("");
    setPasswordError("");

    if (!displayName.trim()) {
      setNameError("Display name is required");
      valid = false;
    } else if (displayName.trim().length < 2) {
      setNameError("Display name must be at least 2 characters");
      valid = false;
    }
    if (!email.trim()) {
      setEmailError("Email is required");
      valid = false;
    } else if (!validateEmail(email.trim())) {
      setEmailError("Please enter a valid email address");
      valid = false;
    }
    if (!password) {
      setPasswordError("Password is required");
      valid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      valid = false;
    }
    return valid;
  };

  const handleNext = () => {
    if (!validate()) return;
    navigation.navigate("Interests", { display_name: displayName.trim(), email: email.trim().toLowerCase(), password, bio: bio.trim() });
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
          {/* Display Name */}
          <View>
            <Text style={styles.label}>Display Name *</Text>
            <View style={[styles.inputWrap, !!nameError && styles.inputError]}>
              <Ionicons name="person-outline" size={18} color={colors.textMuted} style={{ marginRight: 10 }} />
              <TextInput
                style={styles.input}
                placeholder="e.g. Arjun"
                placeholderTextColor={colors.textMuted}
                value={displayName}
                onChangeText={(v) => { setDisplayName(v); setNameError(""); }}
                autoCapitalize="words"
              />
            </View>
            {!!nameError && <Text style={styles.fieldError}>{nameError}</Text>}
          </View>

          {/* Email */}
          <View>
            <Text style={styles.label}>Email *</Text>
            <View style={[styles.inputWrap, !!emailError && styles.inputError]}>
              <Ionicons name="mail-outline" size={18} color={colors.textMuted} style={{ marginRight: 10 }} />
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={colors.textMuted}
                value={email}
                onChangeText={(v) => { setEmail(v); setEmailError(""); }}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            {!!emailError && <Text style={styles.fieldError}>{emailError}</Text>}
          </View>

          {/* Bio */}
          <View>
            <Text style={styles.label}>Bio</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="chatbubble-outline" size={18} color={colors.textMuted} style={{ marginRight: 10 }} />
              <TextInput
                style={styles.input}
                placeholder="What are you into?"
                placeholderTextColor={colors.textMuted}
                value={bio}
                onChangeText={setBio}
              />
            </View>
          </View>

          {/* Password */}
          <View>
            <Text style={styles.label}>Password *</Text>
            <View style={[styles.inputWrap, !!passwordError && styles.inputError]}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} style={{ marginRight: 10 }} />
              <TextInput
                style={styles.input}
                placeholder="Min 6 characters"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={(v) => { setPassword(v); setPasswordError(""); }}
                secureTextEntry={!showPass}
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                <Ionicons name={showPass ? "eye-off" : "eye"} size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            {!!passwordError && <Text style={styles.fieldError}>{passwordError}</Text>}
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
  inputError: { borderColor: colors.error },
  input: { flex: 1, color: colors.text, fontSize: fontSizes.md },
  fieldError: { color: colors.error, fontSize: fontSizes.xs, marginTop: 6, marginLeft: 4 },
  btn: { borderRadius: radii.xl, overflow: "hidden", marginTop: 36 },
  btnGrad: { paddingVertical: 18, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "800", fontSize: fontSizes.md },
  switchRow: { alignItems: "center", marginTop: 24 },
  switchText: { color: colors.textSub, fontSize: fontSizes.sm },
});
