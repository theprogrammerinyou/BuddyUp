import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput, ImageBackground, Alert, ActivityIndicator } from 'react-native';
import { Theme } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import BottomNavBar from '../components/BottomNavBar';
import { createActivity } from '../api/api';

export default function CreateActivityStep2Screen({ navigation, route }: any) {
  const category: string = route?.params?.category ?? 'General';
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handlePost = async () => {
    if (!title.trim()) {
      Alert.alert('Missing Info', 'Please enter an activity title.');
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    try {
      await createActivity({
        title: title.trim(),
        description: description.trim(),
        category,
        location: location.trim() || 'TBD',
      });
      navigation.navigate('DiscoveryFeed');
    } catch (e) {
      Alert.alert('Error', 'Could not create activity. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header: Avatar with "1" badge left, PULSE centered, gear right */}
      <View style={styles.header}>
        <View style={styles.avatarWrap}>
          <TouchableOpacity onPress={() => navigation.navigate('UserProfile')} style={styles.avatarBorder}>
            <Image
              source={{ uri: 'https://i.pravatar.cc/150?u=mainuser' }}
              style={styles.headerAvatar}
            />
          </TouchableOpacity>
          <View style={styles.avatarBadge}>
            <Text style={styles.avatarBadgeText}>1</Text>
          </View>
        </View>
        <Text style={styles.logoText}>PULSE</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <MaterialIcons name="settings" size={24} color={Theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Progress bar: 3 segments */}
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View style={[styles.progressSegment, styles.progressDone]} />
            <View style={[styles.progressSegment, styles.progressCurrent]} />
            <View style={[styles.progressSegment, styles.progressPending]} />
          </View>
          <Text style={styles.stepText}>STEP 2 OF 3</Text>
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.titleWhite}>Set the</Text>
          <Text style={styles.titleGreen}>Vibe</Text>
        </View>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Give your activity a name and tell people what it's all about. Make it count.
        </Text>

        {/* Form fields */}
        <View style={styles.formContainer}>
          {/* Activity Title */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>ACTIVITY TITLE</Text>
            <TextInput
              style={styles.glassInput}
              placeholder="e.g., Midnight Rooftop Vinyl S..."
              placeholderTextColor="rgba(193,160,203,0.5)"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* The Energy */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>THE ENERGY</Text>
            <TextInput
              style={[styles.glassInput, styles.multilineInput]}
              placeholder="Tell them why they shouldn't miss it..."
              placeholderTextColor="rgba(193,160,203,0.5)"
              multiline
              value={description}
              onChangeText={setDescription}
            />
          </View>

          {/* When */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>WHEN</Text>
            <View style={styles.timeRow}>
              <Text style={styles.timeDisplay}>22:00</Text>
              <TouchableOpacity style={styles.editTimeBtn}>
                <MaterialIcons name="edit" size={20} color={Theme.colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Map preview */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>LOCATION</Text>
            <TextInput
              style={[styles.glassInput, { marginBottom: 12 }]}
              placeholder="e.g., The Grid Fitness, Neon District"
              placeholderTextColor="rgba(193,160,203,0.5)"
              value={location}
              onChangeText={setLocation}
            />
            <View style={styles.mapPreviewWrap}>
              <ImageBackground
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAW0cAI298kDMdev2l2CQO8f-4kFvaITqUTrK_8oF6DlVl3yxlqJytkI_3oHJzgwTwupWrccUxuhxnFLf6LvfuonrprpndroompURP4gZlkNNwyoz3eFZKHzwKAd2FHYyeXVMlOY4gKAKay_4u0OnYr3vKMgq5fTcYaMv1M2wDWJbZFVfHJdGMrzDJl0wOVjQ3uByF5_dqc6Uq-muq3lD7GlJ01XlUhyHejzUUhGJQlL55vaGptnBngSE8_ZZLpNwxlnE0LPZIFYw' }}
                style={styles.mapImage}
                imageStyle={{ borderRadius: 16, opacity: 0.4 }}
              >
                <LinearGradient
                  colors={['rgba(26,4,37,0.7)', 'transparent', 'rgba(26,4,37,0.7)']}
                  style={styles.mapOverlay}
                >
                  <View style={styles.mapPinContainer}>
                    <MaterialIcons name="location-on" size={36} color={Theme.colors.secondary} style={styles.mapPinShadow} />
                  </View>
                  <View style={styles.mapLabelWrap}>
                    <Text style={styles.mapLabel}>BERLIN MITTE</Text>
                  </View>
                </LinearGradient>
              </ImageBackground>
            </View>
          </View>
        </View>

        {/* Post Activity Button */}
        <TouchableOpacity style={styles.postBtn} onPress={handlePost} disabled={submitting}>
          {submitting ? (
            <ActivityIndicator size="small" color={Theme.colors.onSecondary} />
          ) : (
            <MaterialIcons name="bolt" size={24} color={Theme.colors.onSecondary} />
          )}
          <Text style={styles.postBtnText}>{submitting ? 'POSTING...' : 'POST ACTIVITY'}</Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomNavBar activeTab="activity" navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  header: {
    position: 'absolute', top: 0, width: '100%', zIndex: 50,
    backgroundColor: 'rgba(26,4,37,0.8)',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, height: 100, paddingTop: 40,
    borderBottomWidth: 1, borderBottomColor: 'rgba(223,142,255,0.05)',
  },
  avatarWrap: { position: 'relative' },
  avatarBorder: {
    width: 44, height: 44, borderRadius: 22, borderWidth: 2,
    borderColor: Theme.colors.secondary, padding: 2,
  },
  headerAvatar: { width: '100%', height: '100%', borderRadius: 20 },
  avatarBadge: {
    position: 'absolute', top: -4, right: -4,
    backgroundColor: Theme.colors.secondary, width: 20, height: 20,
    borderRadius: 10, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Theme.colors.background,
  },
  avatarBadgeText: {
    color: Theme.colors.onSecondary, fontSize: 10, fontWeight: '900',
  },
  logoText: {
    fontWeight: '900', fontStyle: 'italic', fontSize: 22,
    color: Theme.colors.primary, letterSpacing: 2, textTransform: 'uppercase',
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Theme.colors.surfaceContainerHighest,
    alignItems: 'center', justifyContent: 'center',
  },

  scrollContent: { paddingTop: 120, paddingHorizontal: 24, paddingBottom: 120 },

  progressSection: { marginBottom: 32 },
  progressBar: { flexDirection: 'row', gap: 6, marginBottom: 8 },
  progressSegment: { flex: 1, height: 4, borderRadius: 2 },
  progressDone: {
    backgroundColor: Theme.colors.secondary,
    shadowColor: Theme.colors.secondary,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 10,
  },
  progressCurrent: {
    backgroundColor: Theme.colors.primary,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 8,
  },
  progressPending: { backgroundColor: Theme.colors.surfaceContainerHigh },
  stepText: {
    color: Theme.colors.onSurfaceVariant, fontSize: 10, fontWeight: 'bold',
    letterSpacing: 2, textTransform: 'uppercase',
  },

  titleSection: { marginBottom: 12 },
  titleWhite: {
    fontWeight: '900', fontStyle: 'italic', fontSize: 40,
    color: Theme.colors.text, letterSpacing: -1, lineHeight: 46,
  },
  titleGreen: {
    fontWeight: '900', fontStyle: 'italic', fontSize: 40,
    color: Theme.colors.secondary, letterSpacing: -1, lineHeight: 46,
  },

  subtitle: {
    color: Theme.colors.onSurfaceVariant, fontSize: 16, lineHeight: 24,
    marginBottom: 32,
  },

  formContainer: { gap: 28, marginBottom: 40 },
  inputGroup: { gap: 12 },
  inputLabel: {
    color: 'rgba(223,142,255,0.7)', fontSize: 10, fontWeight: 'bold',
    letterSpacing: 2, textTransform: 'uppercase',
  },
  glassInput: {
    backgroundColor: Theme.colors.surfaceContainerLowest, borderRadius: 16,
    paddingHorizontal: 20, paddingVertical: 16, color: Theme.colors.text,
    fontSize: 16,
  },
  multilineInput: { height: 120, textAlignVertical: 'top' },

  timeRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Theme.colors.surfaceContainerLowest, borderRadius: 16,
    paddingHorizontal: 20, paddingVertical: 16,
  },
  timeDisplay: {
    fontWeight: '900', fontSize: 32, color: Theme.colors.text, letterSpacing: 2,
  },
  editTimeBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(223,142,255,0.15)', alignItems: 'center', justifyContent: 'center',
  },

  mapPreviewWrap: {
    height: 180, borderRadius: 16, overflow: 'hidden',
  },
  mapImage: { flex: 1, width: '100%', height: '100%' },
  mapOverlay: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
  },
  mapPinContainer: { marginBottom: 8 },
  mapPinShadow: {
    shadowColor: Theme.colors.secondary,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 15,
  },
  mapLabelWrap: {
    backgroundColor: 'rgba(41,12,54,0.6)', paddingHorizontal: 16, paddingVertical: 6,
    borderRadius: 12, borderWidth: 1, borderColor: 'rgba(89,62,99,0.15)',
  },
  mapLabel: {
    color: Theme.colors.text, fontSize: 12, fontWeight: '900',
    letterSpacing: 2, textTransform: 'uppercase',
  },

  postBtn: {
    width: '100%', backgroundColor: Theme.colors.secondary,
    paddingVertical: 22, borderRadius: 9999, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 12,
    shadowColor: Theme.colors.secondary,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 30,
  },
  postBtnText: {
    fontWeight: '900', fontStyle: 'italic', color: Theme.colors.onSecondary,
    fontSize: 18, letterSpacing: 1, textTransform: 'uppercase',
  },
});
