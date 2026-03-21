import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getInterests, updateUserInterests } from '../api/api';
import type { Interest } from '../api/types';

export default function SelectInterestsScreen({ navigation }: any) {
  const { width } = useWindowDimensions();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [interestsData, setInterestsData] = useState<(Interest & { icon: any; colSpan: number; image: string })[]>([]);
  const [loadingInterests, setLoadingInterests] = useState(true);

  useEffect(() => {
    getInterests()
      .then((data) => {
        // Map API interests to the card format, cycling through icons/images
        const ICONS: any[] = ['fitness-center', 'code', 'sports-esports', 'music-note', 'terrain', 'palette', 'bolt', 'camera-alt', 'directions-run', 'restaurant'];
        const IMAGES = [
          'https://lh3.googleusercontent.com/aida-public/AB6AXuClrzH41MnIAmi8OVo-0R9FqkVx18Sg0zvMYmeuZp33oNODvttbx7uL2brLjcd_gPZEwQKZixB9UVdoovY8pD5V_tjPaSuJvdy_O9xTk3NNs4Ky6j5iVMQju41k_nZyWDqkq2DFuku1uMgTWdwSpjGDFEiybzleDN5u5sZ_MNhwehR6OnxIPptzMiulhXmvLvLIUm9MgPMsowKAVYTOoGEDaRTZFQ5woteiqk7i2sxktRz-AZYgG_3k3FndvnsrDRaRbbU76061PQ',
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDj174ONyOW6LYwzirutj1j2kFY_luhveJtcQwN-lxIFJ4NOfVhqc7Di9cHHVfF9UcNt1jxBzA5gxLb1VPnA138XLMu5RV-a7LaRV7oLNmhrn7T6HbCd4c6fI3zsHvT7UW-JAUVBGE81izycP67OptziATJXwJ2tJdC6bg8aQT9gBWbg7PL6jtGTIyuE1tPO2KR9fLuIWZ6OPUVv68T-IWnTBDeM73sePQDDkQLvvoKMfrwVhICPS4O77Psi-hIHIeBPWronkDfSg',
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDbG5KKy8DNZ1HVQedh9pM6J0ntoXnYLZlzNP7wiL7CA3WgwIZY6wCLIfdoEbEBOYKBycoPRa_87xHaYxdB5umum_6Rja8WxvEJWDoWWqUsWtX-Y2U2c1gJGrrm4YCMcRYdWVtE83Zjev6tD1z1kqu9d6j_eFJ_uHaHFHEKqCpAhdKy_oZj8smwPtIWwFbYulCkbVXo01C901p5PPlX5QrN5DCYmlRxTm82rq0uDPGzjqamyTSXMyRju0SckULJUwaE_qwRLYbV6g',
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDriZSJ6ngirZkNOjBLjan1B-hq7_MjFpvDLW7udkWq4iUWL7Or7F6H_aWKaz5JSZdueKkv0cP99Y-FK-vj9s4YNFzU5-C0qLovepMwFP9sGs0oqXDHeEoQV9RDUxXeXVQOhQsiv01Ra5bNzjm2tRiwDBb8ZQCzKyStFfARHFd3UcYYKHqRfP9Qkje9L5_W23R3mO4nDqHL7pAYRnM-C_3RC06uKP1lRv_FTcunwpDHnWxU87yY3tdNIuPKAkfOpX-_n2Jc77WpMQ',
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDOi5JAlBeTcetNPPmLCgVecoYiHYqJhoriKH2Rez12OSoUtOrCS-x7_Ng3S3MAAJD3rwIbG4vf34tyiEyu4iOc4dOp_6eujF5J82dnMzGyi4xrhp9ZtalE497hi6aBE2zt1Ol8fWoFn2jWzoKal1LqsfSWQ5_e2MKVtV06OpnNLnl8BYfDWGZ7N5N2N6mIf6fZQAYi-NgedTtcBQINJz7eBxGceN32cR2YEHmocctQsa5ZeMDfzXQlY4nhNbo9AVrcYwkatHFBFg',
        ];
        setInterestsData(
          data.map((item, idx) => ({
            ...item,
            id: String(item.id),
            title: item.name,
            icon: ICONS[idx % ICONS.length],
            colSpan: 1,
            image: IMAGES[idx % IMAGES.length],
          }))
        );
      })
      .catch(console.error)
      .finally(() => setLoadingInterests(false));
  }, []);

  const toggleInterest = (id: string) => {
    if (selectedInterests.includes(id)) {
      setSelectedInterests(selectedInterests.filter((item) => item !== id));
    } else {
      setSelectedInterests([...selectedInterests, id]);
    }
  };

  const handleContinue = async () => {
    try {
      await updateUserInterests(selectedInterests.map(Number));
    } catch (e) {
      // Non-blocking — navigate anyway
    }
    navigation.navigate('DiscoveryFeed');
  };

  const cardWidth = (width - 24 * 2 - 16) / 2; // padding * 2 - gap, divided by 2 cols
  const isReady = selectedInterests.length >= 3;

  return (
    <View style={styles.container}>
      {/* Background decorative blurs */}
      <View
        style={[
          styles.blurGradient,
          {
            top: -120,
            left: -120,
            backgroundColor: Theme.colors.primary,
            opacity: 0.08,
          },
        ]}
      />
      <View
        style={[
          styles.blurGradient,
          {
            bottom: -80,
            right: -80,
            backgroundColor: Theme.colors.secondary,
            opacity: 0.05,
          },
        ]}
      />

      {/* Fixed Header */}
      <View style={styles.header}>
        <Text style={styles.logoText}>NEON NOCTURNE</Text>
        <TouchableOpacity style={styles.avatarBtn}>
          <Image
            source={{
              uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuACbYMDPv51QbMp4Cw6iW3L8HNg6XBXOCH86Bvk7aHiFvjskVQhcupbSGmH0ILEwP56ibdD1awZ3qRCIi2_ez2DWS-i0lOw9YcYSmqKx98Z868VDRKKe0Q897SCQDwI0Khw1O3bkprwbcij6Bl5onmvp3B3tGiwnBHPyEZZUXX5D19-nRX8Lf2hiKJGyNrqGO3GFoIszFUw-xX3IpT8Y4rT_7ebv10XYgCtXRFPDL509o2_VhlGGFN6vbRf1klAhgDR32cGWB30mQ',
            }}
            style={styles.avatarImage}
          />
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SafeAreaView>
          {/* Step Indicator */}
          <Text style={styles.stepIndicator}>STEP 02 / ONBOARDING</Text>

          {/* Hero Title */}
          <View style={styles.heroSection}>
            <Text style={styles.heroTitle}>
              CHOOSE YOUR{'\n'}
              <Text style={styles.heroTitleGreen}>VIBE.</Text>
            </Text>
            <Text style={styles.heroSubtitle}>
              Select at least 3 categories to synchronize your pulse with the
              night.
            </Text>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <MaterialIcons
              name="search"
              size={24}
              color={Theme.colors.outline}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search interests..."
              placeholderTextColor={Theme.colors.outline}
            />
          </View>

          {/* Interest Grid */}
          <View style={styles.gridContainer}>
            {interestsData.map((item) => {
              const isActive = selectedInterests.includes(item.id);
              const isFullWidth = item.colSpan === 2;
              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.9}
                  onPress={() => toggleInterest(item.id)}
                  style={[
                    styles.card,
                    { width: isFullWidth ? '100%' : cardWidth },
                    isActive ? styles.cardActive : styles.cardInactive,
                  ]}
                >
                  <Image
                    source={{ uri: item.image }}
                    style={[
                      styles.cardBgImage,
                      { opacity: isActive ? 0.25 : 0.1 },
                    ]}
                  />
                  <MaterialIcons
                    name={item.icon as any}
                    size={32}
                    color={
                      isActive
                        ? Theme.colors.onPrimaryContainer
                        : Theme.colors.primary
                    }
                    style={styles.cardIcon}
                  />
                  <Text
                    style={[
                      styles.cardTitle,
                      {
                        color: isActive
                          ? Theme.colors.onPrimaryContainer
                          : Theme.colors.text,
                      },
                    ]}
                  >
                    {item.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </SafeAreaView>
      </ScrollView>

      {/* Fixed Bottom Action Bar */}
      <LinearGradient
        colors={['rgba(26,4,37,0)', 'rgba(26,4,37,0.95)']}
        style={styles.bottomBar}
      >
        {/* Progress Row */}
        <View style={styles.progressRow}>
          <View style={styles.progressBarsRow}>
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                style={[
                  styles.progressBar,
                  {
                    backgroundColor:
                      i < selectedInterests.length
                        ? Theme.colors.secondary
                        : Theme.colors.surfaceContainerHigh,
                  },
                  i < selectedInterests.length && {
                    shadowColor: Theme.colors.secondary,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.5,
                    shadowRadius: 6,
                    elevation: 3,
                  },
                ]}
              />
            ))}
          </View>
          <Text style={styles.progressText}>
            {selectedInterests.length} / 3 SELECTED
          </Text>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={[styles.continueBtn, !isReady && styles.continueBtnDisabled]}
          disabled={!isReady}
          activeOpacity={0.8}
          onPress={handleContinue}
        >
          <Text
            style={[
              styles.continueBtnText,
              !isReady && styles.continueBtnTextDisabled,
            ]}
          >
            CONTINUE
          </Text>
          <MaterialIcons
            name="arrow-forward"
            size={22}
            color={isReady ? Theme.colors.onPrimaryContainer : Theme.colors.outline}
          />
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  blurGradient: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    zIndex: -1,
  },
  /* ---- Header ---- */
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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(223,142,255,0.05)',
  },
  logoText: {
    fontWeight: '900',
    fontStyle: 'italic',
    fontSize: 20,
    letterSpacing: 2,
    color: Theme.colors.secondary,
    textShadowColor: 'rgba(47,248,1,0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  avatarBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(89,62,99,0.15)',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  /* ---- Scroll Content ---- */
  scrollContent: {
    paddingTop: 120,
    paddingHorizontal: 24,
    paddingBottom: 200,
  },
  /* ---- Step Indicator ---- */
  stepIndicator: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 3,
    color: Theme.colors.primary,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  /* ---- Hero ---- */
  heroSection: {
    marginBottom: 32,
  },
  heroTitle: {
    fontWeight: '900',
    fontSize: 48,
    lineHeight: 52,
    letterSpacing: -1,
    color: Theme.colors.text,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  heroTitleGreen: {
    fontStyle: 'italic',
    color: Theme.colors.secondary,
    textShadowColor: 'rgba(47,248,1,0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  heroSubtitle: {
    fontSize: 18,
    color: Theme.colors.textMuted,
    maxWidth: '85%',
    lineHeight: 26,
  },
  /* ---- Search ---- */
  searchContainer: {
    position: 'relative',
    marginBottom: 40,
  },
  searchIcon: {
    position: 'absolute',
    left: 20,
    top: 20,
    zIndex: 10,
  },
  searchInput: {
    backgroundColor: Theme.colors.surfaceContainerLowest,
    height: 64,
    borderRadius: 32,
    paddingLeft: 56,
    paddingRight: 24,
    fontSize: 18,
    color: Theme.colors.text,
  },
  /* ---- Grid ---- */
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  card: {
    height: 160,
    borderRadius: 16,
    padding: 24,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  cardActive: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
    borderWidth: 2,
    transform: [{ scale: 1.02 }],
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 5,
  },
  cardInactive: {
    backgroundColor: Theme.colors.surfaceContainerHigh,
  },
  cardBgImage: {
    position: 'absolute',
    width: '200%',
    height: '200%',
    top: '-50%',
    left: '-50%',
  },
  cardIcon: {
    marginBottom: 8,
  },
  cardTitle: {
    fontWeight: '900',
    fontSize: 18,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  /* ---- Bottom Bar ---- */
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 24,
    paddingTop: 48,
    paddingBottom: 48,
    gap: 16,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  progressBarsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  progressBar: {
    height: 6,
    width: 48,
    borderRadius: 3,
  },
  progressText: {
    color: Theme.colors.secondary,
    fontWeight: '900',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  continueBtn: {
    width: '100%',
    height: 64,
    borderRadius: 32,
    backgroundColor: Theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 8,
  },
  continueBtnDisabled: {
    backgroundColor: Theme.colors.surfaceContainerHighest,
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
    borderWidth: 1,
    borderColor: 'rgba(89,62,99,0.15)',
  },
  continueBtnText: {
    color: Theme.colors.onPrimaryContainer,
    fontWeight: '900',
    fontSize: 18,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  continueBtnTextDisabled: {
    color: Theme.colors.outline,
  },
});
