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
  Alert,
} from "react-native";
import { LinearGradient } from "react-native-linear-gradient";
import { observer } from "mobx-react-lite";
import { authStore } from "@/stores/authStore";
import { colors, spacing, radii, fontSizes } from "@/theme";
import { Ionicons } from "@expo/vector-icons";

export default observer(function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert("Please fill all fields");
    try {
      await authStore.login(email.trim().toLowerCase(), password);
    } catch {
      Alert.alert("Login Failed", authStore.error ?? "Check credentials");
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
          <View style={styles.inputWrap}>
            <Ionicons name="mail-outline" size={20} color={colors.textMuted} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputWrap}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
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
  icon: { marginRight: 12 },
  input: { flex: 1, color: colors.text, fontSize: fontSizes.md },
  btn: { borderRadius: radii.xl, overflow: "hidden", marginTop: 32 },
  btnGrad: { paddingVertical: 18, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "800", fontSize: fontSizes.md },
  switchRow: { alignItems: "center", marginTop: 24 },
  switchText: { color: colors.textSub, fontSize: fontSizes.sm },
});
