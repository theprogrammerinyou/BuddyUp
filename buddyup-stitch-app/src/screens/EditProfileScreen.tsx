import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Theme } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getProfile, updateProfile, getInterests, updateUserInterests } from '../api/api';
import type { User, Interest } from '../api/types';

export default function EditProfileScreen({ navigation }: any) {
  const [profile, setProfile] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [allInterests, setAllInterests] = useState<Interest[]>([]);
  const [selectedPassions, setSelectedPassions] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([getProfile(), getInterests()])
      .then(([prof, interests]) => {
        setProfile(prof);
        setDisplayName(prof.name ?? '');
        setBio(prof.bio ?? '');
        setAllInterests(interests);
        setSelectedPassions((prof.interests ?? []).map((i) => i.id));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const togglePassion = (id: number) => {
    setSelectedPassions((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await Promise.all([
        updateProfile({ name: displayName, bio }),
        updateUserInterests(selectedPassions),
      ]);
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Could not save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={Theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveHeaderBtn}>{saving ? '...' : 'Save'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Photo Area */}
        <View style={styles.photoSection}>
          <View style={styles.photoWrapper}>
            <LinearGradient
              colors={[Theme.colors.secondary, Theme.colors.primary]}
              style={styles.photoGradientRing}
            >
              <View style={styles.photoInner}>
                <Image
                  source={{ uri: 'https://i.pravatar.cc/300?u=alex-profile' }}
                  style={styles.photoImage}
                />
              </View>
            </LinearGradient>
            {/* Camera badge */}
            <TouchableOpacity style={styles.cameraBtn}>
              <MaterialIcons name="photo-camera" size={20} color={Theme.colors.onPrimary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.handleText}>@neon_drifter</Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formsSection}>
          {/* Display Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>DISPLAY NAME</Text>
            <View style={styles.inputField}>
              <TextInput
                style={styles.textInput}
                value={displayName}
                onChangeText={setDisplayName}
                placeholderTextColor="rgba(193,160,203,0.3)"
              />
            </View>
          </View>

          {/* Bio */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>BIO</Text>
            <View style={[styles.inputField, { height: 120, alignItems: 'flex-start' }]}>
              <TextInput
                style={[styles.textInput, { height: '100%', textAlignVertical: 'top' }]}
                multiline
                numberOfLines={4}
                value={bio}
                onChangeText={setBio}
                placeholder="Tell people about yourself..."
                placeholderTextColor="rgba(193,160,203,0.3)"
              />
            </View>
          </View>

          {/* Location */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>LOCATION</Text>
            <View style={[styles.inputField, { flexDirection: 'row', alignItems: 'center', gap: 12 }]}>
              <MaterialIcons name="location-on" size={24} color={Theme.colors.secondary} />
              <TextInput
                style={styles.textInput}
                defaultValue="Neo Tokyo, JP"
                placeholderTextColor="rgba(193,160,203,0.3)"
              />
            </View>
          </View>
        </View>

        {/* Passions Section */}
        <View style={styles.passionsSection}>
          <View style={styles.passionsHeader}>
            <Text style={styles.sectionLabel}>PASSIONS</Text>
            <View style={styles.selectedBadge}>
              <Text style={styles.selectedBadgeText}>
                {selectedPassions.length}/5 SELECTED
              </Text>
            </View>
          </View>

          <View style={styles.passionGrid}>
            {allInterests.map((interest) => {
              const isActive = selectedPassions.includes(interest.id);
              return (
                <TouchableOpacity
                  key={interest.id}
                  style={[
                    styles.passionCard,
                    isActive && styles.passionCardActivePrimary,
                    !isActive && styles.passionCardInactive,
                  ]}
                  onPress={() => togglePassion(interest.id)}
                  activeOpacity={0.8}
                >
                  <MaterialIcons
                    name="bolt"
                    size={36}
                    color={isActive ? Theme.colors.onPrimary : Theme.colors.outlineVariant}
                  />
                  <Text
                    style={[
                      styles.passionCardLabel,
                      { color: isActive ? Theme.colors.onPrimary : 'rgba(249,220,255,0.4)' },
                    ]}
                  >
                    {interest.name}
                  </Text>
                </TouchableOpacity>
              );
            })}

            {/* Add More Card */}
            <TouchableOpacity style={styles.addMoreCard}>
              <MaterialIcons name="add" size={36} color={Theme.colors.outlineVariant} />
              <Text style={styles.addMoreText}>+ ADD MORE</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Connected Accounts Section */}
        <View style={styles.socialSection}>
          <Text style={styles.sectionLabel}>CONNECTED ACCOUNTS</Text>
          <View style={styles.socialList}>
            {/* Instagram */}
            <View style={styles.socialCard}>
              <View style={styles.socialLeft}>
                <LinearGradient
                  colors={['#f09433', '#dc2743', '#bc1888']}
                  style={styles.socialIconBg}
                >
                  <MaterialIcons name="photo-camera" size={20} color="#fff" />
                </LinearGradient>
                <View>
                  <Text style={styles.socialName}>Instagram</Text>
                  <Text style={styles.socialHandle}>@alex_lights</Text>
                </View>
              </View>
              <View style={styles.socialRight}>
                <Text style={styles.linkedText}>LINKED</Text>
                <TouchableOpacity>
                  <Text style={styles.unlinkText}>UNLINK</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* TikTok */}
            <View style={styles.socialCard}>
              <View style={styles.socialLeft}>
                <View style={styles.tiktokIconBg}>
                  <MaterialIcons name="music-note" size={20} color={Theme.colors.primary} />
                </View>
                <View>
                  <Text style={styles.socialName}>TikTok</Text>
                  <Text style={styles.socialHandle}>Not connected</Text>
                </View>
              </View>
              <TouchableOpacity>
                <Text style={styles.connectText}>CONNECT</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Save Changes Button */}
        <TouchableOpacity style={styles.saveBtn} activeOpacity={0.8} onPress={handleSave}>
          <Text style={styles.saveBtnText}>{saving ? 'SAVING...' : 'SAVE CHANGES'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    position: 'absolute',
    top: 0,
    width: '100%',
    zIndex: 50,
    backgroundColor: 'rgba(26,4,37,0.8)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    height: 100,
    paddingTop: 40,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  saveHeaderBtn: {
    fontWeight: 'bold',
    fontSize: 18,
    color: Theme.colors.secondary,
  },
  scrollContent: {
    paddingTop: 120,
    paddingBottom: 120,
    paddingHorizontal: 24,
  },

  // Profile Photo
  photoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  photoWrapper: {
    position: 'relative',
  },
  photoGradientRing: {
    width: 168,
    height: 168,
    borderRadius: 84,
    padding: 4,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  photoInner: {
    width: '100%',
    height: '100%',
    borderRadius: 80,
    overflow: 'hidden',
    backgroundColor: Theme.colors.surfaceContainer,
  },
  photoImage: {
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: Theme.colors.primary,
    padding: 12,
    borderRadius: 24,
    borderWidth: 4,
    borderColor: Theme.colors.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  handleText: {
    color: Theme.colors.primary,
    fontSize: 15,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginTop: 16,
  },

  // Form Fields
  formsSection: {
    marginBottom: 40,
    gap: 24,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Theme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginLeft: 16,
  },
  inputField: {
    backgroundColor: Theme.colors.surfaceContainerLow,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(89,62,99,0.1)',
  },
  textInput: {
    color: Theme.colors.text,
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },

  // Passions
  passionsSection: {
    marginBottom: 40,
  },
  passionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Theme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  selectedBadge: {
    borderWidth: 1,
    borderColor: Theme.colors.secondary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  selectedBadgeText: {
    color: Theme.colors.secondary,
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  passionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  passionCard: {
    width: '47%',
    aspectRatio: 1,
    borderRadius: 16,
    padding: 24,
    justifyContent: 'space-between',
  },
  passionCardActivePrimary: {
    backgroundColor: Theme.colors.primary,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  passionCardActiveBorder: {
    backgroundColor: Theme.colors.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: 'rgba(223,142,255,0.2)',
  },
  passionCardInactive: {
    backgroundColor: Theme.colors.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: 'rgba(89,62,99,0.1)',
  },
  passionCardLabel: {
    fontWeight: '900',
    fontStyle: 'italic',
    fontSize: 18,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  addMoreCard: {
    width: '47%',
    aspectRatio: 1,
    borderRadius: 16,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Theme.colors.outlineVariant,
    gap: 8,
  },
  addMoreText: {
    fontSize: 12,
    fontWeight: '700',
    color: Theme.colors.outlineVariant,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },

  // Connected Accounts
  socialSection: {
    marginBottom: 40,
  },
  socialList: {
    gap: 12,
    marginTop: 16,
  },
  socialCard: {
    backgroundColor: 'rgba(41,12,54,0.4)',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(89,62,99,0.1)',
  },
  socialLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  socialIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tiktokIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialName: {
    fontWeight: 'bold',
    color: Theme.colors.text,
    fontSize: 16,
  },
  socialHandle: {
    fontSize: 12,
    color: 'rgba(193,160,203,0.6)',
    marginTop: 2,
  },
  socialRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  linkedText: {
    color: Theme.colors.secondary,
    fontWeight: 'bold',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  unlinkText: {
    color: Theme.colors.error,
    fontWeight: 'bold',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  connectText: {
    color: Theme.colors.primary,
    fontWeight: 'bold',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },

  // Save Button
  saveBtn: {
    width: '100%',
    height: 56,
    backgroundColor: Theme.colors.secondary,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Theme.colors.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  saveBtnText: {
    color: Theme.colors.onSecondary,
    fontWeight: '900',
    fontSize: 16,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
});
