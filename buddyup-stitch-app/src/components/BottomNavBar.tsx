import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Theme } from '../theme/theme';

type TabName = 'explore' | 'activity' | 'messages' | 'profile';

const tabs: { key: TabName; icon: keyof typeof MaterialIcons.glyphMap; screen: string }[] = [
  { key: 'explore', icon: 'explore', screen: 'DiscoveryFeed' },
  { key: 'activity', icon: 'bolt', screen: 'MatchesList' },
  { key: 'messages', icon: 'chat-bubble', screen: 'MessagesList' },
  { key: 'profile', icon: 'person', screen: 'UserProfile' },
];

interface BottomNavBarProps {
  activeTab: TabName;
  navigation: any;
}

export default function BottomNavBar({ activeTab, navigation }: BottomNavBarProps) {
  return (
    <View style={styles.bottomNav}>
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <TouchableOpacity
            key={tab.key}
            style={isActive ? styles.navItemActive : styles.navItem}
            onPress={() => {
              if (!isActive) navigation.navigate(tab.screen);
            }}
          >
            <MaterialIcons
              name={tab.icon}
              size={28}
              color={isActive ? Theme.colors.surface : Theme.colors.outlineVariant}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 96,
    backgroundColor: 'rgba(26,4,37,0.9)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(89,62,99,0.15)',
    borderTopLeftRadius: 48,
    borderTopRightRadius: 48,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 16,
  },
  navItemActive: {
    backgroundColor: Theme.colors.primary,
    padding: 16,
    borderRadius: 32,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    transform: [{ scale: 1.1 }],
  },
  navItem: {
    padding: 16,
  },
});
