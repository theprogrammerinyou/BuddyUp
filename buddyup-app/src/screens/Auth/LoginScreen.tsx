import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { observer } from "mobx-react-lite";
import { authStore } from "@/stores/authStore";
import { colors, spacing, radii, fontSizes } from "@/theme";
import { Ionicons } from "@expo/vector-icons";

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default observer(function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [apiError, setApiError] = useState("");

  const validate = () => {
    let valid = true;
    setEmailError("");
    setPasswordError("");
    setApiError("");
    if (!email.trim()) {
      setEmailError("Email is required");
      valid = false;
    } else if (!validateEmail(email.trim())) {
      setEmailError("Please enter a valid email");
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

  const handleLogin = async () => {
    if (!validate()) return;
    setApiError("");
    try {
      await authStore.login(email.trim().toLowerCase(), password);
    } catch {
      setApiError(authStore.error ?? "Login failed. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#0F0F1A", "#1A1A3E"]} style={StyleSheet.absoluteFill} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.inner}>

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.sub}>Sign in to find your people</Text>

        <View style={styles.form}>
          <View>
            <View style={[styles.inputWrap, !!emailError && styles.inputError]}>
              <Ionicons name="mail-outline" size={20} color={colors.textMuted} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={colors.textMuted}
                value={email}
                onChangeText={(v) => { setEmail(v); setEmailError(""); }}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            {!!emailError && <Text style={styles.fieldError}>{emailError}</Text>}
          </View>

          <View>
            <View style={[styles.inputWrap, !!passwordError && styles.inputError]}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
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

        {!!apiError && (
          <View style={styles.apiErrorBox}>
            <Text style={styles.apiErrorText}>{apiError}</Text>
          </View>
        )}

        <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={authStore.isLoading}>
          <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.btnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            {authStore.isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Sign In</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Register")} style={styles.switchRow}>
          <Text style={styles.switchText}>
            Don't have an account?{" "}
            <Text style={{ color: colors.primary, fontWeight: "700" }}>Sign up</Text>
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  inner: { flex: 1, padding: spacing.lg },
  back: { marginTop: 8, marginBottom: 40 },
  title: { fontSize: fontSizes.xxl, fontWeight: "900", color: colors.text, marginBottom: 8 },
  sub: { fontSize: fontSizes.md, color: colors.textSub, marginBottom: 40 },
  form: { gap: 16 },
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
  icon: { marginRight: 12 },
  input: { flex: 1, color: colors.text, fontSize: fontSizes.md },
  fieldError: { color: colors.error, fontSize: fontSizes.xs, marginTop: 6, marginLeft: 4 },
  apiErrorBox: {
    backgroundColor: colors.error + "22",
    borderWidth: 1,
    borderColor: colors.error + "55",
    borderRadius: radii.md,
    padding: spacing.md,
    marginTop: 16,
  },
  apiErrorText: { color: colors.error, fontSize: fontSizes.sm, textAlign: "center" },
  btn: { borderRadius: radii.xl, overflow: "hidden", marginTop: 32 },
  btnGrad: { paddingVertical: 18, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "800", fontSize: fontSizes.md },
  switchRow: { alignItems: "center", marginTop: 24 },
  switchText: { color: colors.textSub, fontSize: fontSizes.sm },
});
