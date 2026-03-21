import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Theme } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { login, register } from '../api/api';

type Mode = 'start' | 'login' | 'register';

export default function OnboardingScreen({ navigation }: any) {
  const [mode, setMode] = useState<Mode>('start');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing fields', 'Please enter your email and password.');
      return;
    }
    if (mode === 'register' && !name.trim()) {
      Alert.alert('Missing fields', 'Please enter your name.');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email.trim(), password);
        navigation.reset({ index: 0, routes: [{ name: 'DiscoveryFeed' }] });
      } else {
        await register(name.trim(), email.trim(), password);
        navigation.reset({ index: 0, routes: [{ name: 'SelectInterests' }] });
      }
    } catch (err: any) {
      const msg = err?.message ?? 'Something went wrong';
      Alert.alert(mode === 'login' ? 'Login failed' : 'Registration failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <View style={styles.container}>
      {/* Ambient glow blobs */}
      <View style={styles.glowTopLeft} />
      <View style={styles.glowBottomRight} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerMenuBtn}>
          <MaterialIcons name="menu" size={24} color={Theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.logoText}>NEON PULSE</Text>
        <TouchableOpacity style={styles.headerHelpBtn}>
          <MaterialIcons name="help-outline" size={22} color={Theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          {/* Bolt logo circle */}
          <View style={styles.logoBg}>
            <LinearGradient
              colors={[Theme.colors.primary, '#d061ff']}
              style={styles.logoCircle}
            >
              <MaterialIcons name="bolt" size={52} color={Theme.colors.onPrimary} />
            </LinearGradient>
          </View>

          <Text style={styles.heroTitle}>PULSE</Text>
          <Text style={styles.heroSubtitle}>FIND YOUR VIBE</Text>

          {/* Editorial image grid */}
          <View style={styles.imageGrid}>
            <Image
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA64IrmLozQHqe6SXzN57AjW_y2JXhNyru7CGSqKIZYxiupR-8DxE26F-bhNwuDZfATogWMy0Buc5JAa4EvFdlBXrjnRXwJSulzMV2n6tKccie_8Aj7oa_olyBelSBbk0ZHr_s7qA131Gi_CLGAf5kjbIcmpR-xfaf27bUqW-5z82MVSD9mwsughihuFEHxxzZMp_U1MMyNFDRaVQlanjO_yiw-DvxSkG5YE4gLOhYTMQ_-flxCbkIxtBK_4_ONOgRkftVjHcpw-A' }}
              style={styles.imageLarge}
            />
            <View style={styles.imageSmallCol}>
              <Image
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCTfd2cw5q6A0GXMHH3VrR5VZ7SG9ONXLcwOmi-g_JX8J3dPMpHWTtJkgmexf58Scc_FJnfJd8aqehkQEBhY1JxmW8b6ZhfgwTc1ZcKopGiNIckpUskggRCTbrHg76bgiuzOs5NFm9Uo7CHLU25pBqCtG5ZzggAnkU878_HJrqUihNL8cziJB8-jVMDCcKx18zZVVp-rq0C6DIWVAXY0ruA-dH5Ruzv_nljQ' }}
                style={styles.imageSmall}
              />
              <LinearGradient
                colors={[Theme.colors.surfaceContainerHighest, 'rgba(223,142,255,0.2)']}
                style={styles.imagePlaceholder}
              >
                <MaterialIcons name="stars" size={36} color={Theme.colors.secondary} />
              </LinearGradient>
            </View>
          </View>
        </View>

        {/* Login Card */}
        <View style={styles.loginCard}>
          {mode === 'start' ? (
            <>
              <Text style={styles.loginCardTitle}>GET STARTED</Text>

              {/* Google */}
              <TouchableOpacity
                style={styles.googleBtn}
                activeOpacity={0.8}
                onPress={() => setMode('register')}
              >
                <MaterialIcons name="g-mobiledata" size={28} color="#4285F4" />
                <Text style={styles.googleText}>Continue with Google</Text>
              </TouchableOpacity>

              {/* Apple */}
              <TouchableOpacity
                style={styles.appleBtn}
                activeOpacity={0.8}
                onPress={() => setMode('register')}
              >
                <MaterialIcons name="apple" size={22} color={Theme.colors.text} />
                <Text style={styles.appleText}>Continue with Apple</Text>
              </TouchableOpacity>

              {/* OR divider */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Email signup */}
              <LinearGradient
                colors={[Theme.colors.primary, '#d061ff']}
                style={styles.emailBtnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <TouchableOpacity
                  style={styles.emailBtn}
                  activeOpacity={0.8}
                  onPress={() => setMode('register')}
                >
                  <MaterialIcons name="mail" size={22} color={Theme.colors.onPrimary} />
                  <Text style={styles.emailText}>EMAIL SIGNUP</Text>
                </TouchableOpacity>
              </LinearGradient>

              <TouchableOpacity onPress={() => setMode('login')} style={styles.signInRow}>
                <Text style={styles.signInText}>Already have an account? </Text>
                <Text style={styles.signInLink}>SIGN IN</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.loginCardTitle}>
                {mode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}
              </Text>

              {mode === 'register' && (
                <TextInput
                  style={styles.input}
                  placeholder="Your name"
                  placeholderTextColor={Theme.colors.outline}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              )}

              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={Theme.colors.outline}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={Theme.colors.outline}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <LinearGradient
                colors={[Theme.colors.primary, '#d061ff']}
                style={styles.emailBtnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <TouchableOpacity
                  style={styles.emailBtn}
                  activeOpacity={0.8}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  {loading
                    ? <ActivityIndicator color={Theme.colors.onPrimary} />
                    : <>
                        <MaterialIcons name={mode === 'login' ? 'login' : 'person-add'} size={22} color={Theme.colors.onPrimary} />
                        <Text style={styles.emailText}>
                          {mode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}
                        </Text>
                      </>
                  }
                </TouchableOpacity>
              </LinearGradient>

              <TouchableOpacity
                onPress={() => setMode(mode === 'login' ? 'register' : 'login')}
                style={styles.signInRow}
              >
                <Text style={styles.signInText}>
                  {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                </Text>
                <Text style={styles.signInLink}>
                  {mode === 'login' ? 'SIGN UP' : 'SIGN IN'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setMode('start')} style={styles.backRow}>
                <MaterialIcons name="arrow-back" size={16} color={Theme.colors.outline} />
                <Text style={styles.backText}>BACK</Text>
              </TouchableOpacity>
            </>
          )}

          <Text style={styles.termsText}>
            By joining, you agree to our{' '}
            <Text style={styles.termsLink}>Terms</Text>
            {' & '}
            <Text style={styles.termsLink}>Privacy Policy</Text>.
          </Text>
        </View>

        {/* Stats Bento */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>24/7</Text>
            <Text style={styles.statLabel}>LIVE EVENTS</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: Theme.colors.primary }]}>500k+</Text>
            <Text style={styles.statLabel}>TRIBE MEMBERS</Text>
          </View>
        </View>

        {/* Footer icons */}
        <View style={styles.footerRow}>
          <MaterialIcons name="music-note" size={24} color={Theme.colors.outlineVariant} />
          <MaterialIcons name="sports-esports" size={24} color={Theme.colors.outlineVariant} />
          <MaterialIcons name="local-bar" size={24} color={Theme.colors.outlineVariant} />
        </View>
        <Text style={styles.copyright}>© 2024 NEON PULSE DIGITAL</Text>
      </ScrollView>
    </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },

  /* Ambient glows */
  glowTopLeft: {
    position: 'absolute', top: -80, left: -80,
    width: 280, height: 280, borderRadius: 140,
    backgroundColor: 'rgba(223,142,255,0.12)',
  },
  glowBottomRight: {
    position: 'absolute', bottom: 300, right: -80,
    width: 260, height: 260, borderRadius: 130,
    backgroundColor: 'rgba(47,248,1,0.07)',
  },

  /* Header */
  header: {
    position: 'absolute', top: 0, width: '100%', zIndex: 50,
    backgroundColor: 'rgba(26,4,37,0.4)',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, height: 80, paddingTop: 30,
  },
  headerMenuBtn: {
    width: 40, height: 40, alignItems: 'center', justifyContent: 'center',
  },
  logoText: {
    fontWeight: '900', fontStyle: 'italic', fontSize: 22,
    color: Theme.colors.primary, letterSpacing: 3, textTransform: 'uppercase',
  },
  headerHelpBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Theme.colors.surfaceContainerHighest,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(89,62,99,0.15)',
  },

  scrollContent: { paddingTop: 80, paddingHorizontal: 24, paddingBottom: 60, gap: 28 },

  /* Hero */
  heroSection: { alignItems: 'center', paddingTop: 32, gap: 12 },
  logoBg: {
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4, shadowRadius: 40,
    marginBottom: 4,
  },
  logoCircle: {
    width: 96, height: 96, borderRadius: 48,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 4, borderColor: Theme.colors.background,
  },
  heroTitle: {
    fontWeight: '900', fontStyle: 'italic', fontSize: 72,
    letterSpacing: -2, color: Theme.colors.text, lineHeight: 76,
  },
  heroSubtitle: {
    fontWeight: '900', fontSize: 18, color: Theme.colors.secondary,
    textTransform: 'uppercase', letterSpacing: 6, marginBottom: 12,
  },
  imageGrid: { width: '100%', flexDirection: 'row', gap: 12, height: 256 },
  imageLarge: {
    flex: 7, borderRadius: 16,
    transform: [{ rotate: '-2deg' }],
    borderWidth: 1, borderColor: 'rgba(89,62,99,0.1)',
  },
  imageSmallCol: { flex: 5, gap: 12 },
  imageSmall: {
    flex: 1, borderRadius: 16,
    transform: [{ rotate: '3deg' }],
    borderWidth: 1, borderColor: 'rgba(89,62,99,0.1)',
  },
  imagePlaceholder: {
    flex: 1, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },

  /* Login card */
  loginCard: {
    backgroundColor: 'rgba(41,12,54,0.6)',
    borderRadius: 20, padding: 28,
    borderWidth: 1, borderColor: 'rgba(89,62,99,0.15)',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5, shadowRadius: 50,
  },
  loginCardTitle: {
    color: Theme.colors.outline, fontWeight: '900', fontSize: 11,
    textTransform: 'uppercase', letterSpacing: 4, textAlign: 'center',
    marginBottom: 4,
  },
  googleBtn: {
    backgroundColor: '#ffffff', height: 60, borderRadius: 9999,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
  },
  googleText: { color: '#000000', fontWeight: '800', fontSize: 16 },
  appleBtn: {
    backgroundColor: Theme.colors.surfaceContainerHighest,
    borderWidth: 1, borderColor: 'rgba(89,62,99,0.2)',
    height: 60, borderRadius: 9999,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
  },
  appleText: { color: Theme.colors.text, fontWeight: '800', fontSize: 16 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(89,62,99,0.2)' },
  dividerText: {
    color: Theme.colors.outline, fontWeight: '900',
    fontSize: 10, letterSpacing: 3, textTransform: 'uppercase',
  },
  emailBtnGradient: {
    borderRadius: 9999,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3, shadowRadius: 20,
  },
  emailBtn: {
    height: 60, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 12,
  },
  emailText: {
    color: Theme.colors.onPrimary, fontWeight: '900',
    fontSize: 16, letterSpacing: 2, textTransform: 'uppercase',
  },
  termsText: {
    textAlign: 'center', fontSize: 12,
    color: Theme.colors.outline, lineHeight: 20, paddingHorizontal: 8,
  },
  termsLink: { color: Theme.colors.primary, fontWeight: '700' },

  /* Stats */
  statsRow: { flexDirection: 'row', gap: 16 },
  statCard: {
    flex: 1, backgroundColor: Theme.colors.surfaceContainerLow,
    borderRadius: 16, padding: 24,
    borderWidth: 1, borderColor: 'rgba(89,62,99,0.08)',
  },
  statValue: {
    fontWeight: '900', fontStyle: 'italic', fontSize: 28,
    color: Theme.colors.secondary,
  },
  statLabel: {
    fontSize: 10, fontWeight: '900',
    color: Theme.colors.outline, textTransform: 'uppercase', letterSpacing: 2,
    marginTop: 4,
  },

  /* Footer */
  footerRow: { flexDirection: 'row', justifyContent: 'center', gap: 32 },
  copyright: {
    textAlign: 'center', fontSize: 10, fontWeight: '900', letterSpacing: 4,
    color: Theme.colors.outlineVariant, textTransform: 'uppercase', marginTop: -12,
  },
  signInRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 4 },
  signInText: { color: Theme.colors.outline, fontSize: 13 },
  signInLink: { color: Theme.colors.primary, fontWeight: '900', fontSize: 13, letterSpacing: 1 },
  backRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 4 },
  backText: { color: Theme.colors.outline, fontSize: 11, fontWeight: '900', letterSpacing: 2 },
  input: {
    backgroundColor: Theme.colors.surfaceContainerHighest,
    borderRadius: 14,
    height: 54,
    paddingHorizontal: 18,
    color: Theme.colors.text,
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(223,142,255,0.15)',
  },
});
