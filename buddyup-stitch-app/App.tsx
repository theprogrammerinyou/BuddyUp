import React from 'react';
import { LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Suppress deprecation warnings originating from third-party navigation libraries
LogBox.ignoreLogs([
  'InteractionManager has been deprecated',
  'SafeAreaView has been deprecated',
]);

// Screen imports
import OnboardingScreen from './src/screens/OnboardingScreen';
import SelectInterestsScreen from './src/screens/SelectInterestsScreen';
import DiscoveryFeedScreen from './src/screens/DiscoveryFeedScreen';
import MapViewScreen from './src/screens/MapViewScreen';
import MessagesListScreen from './src/screens/MessagesListScreen';
import MessagesChatScreen from './src/screens/MessagesChatScreen';
import MatchesListScreen from './src/screens/MatchesListScreen';
import NotificationsCenterScreen from './src/screens/NotificationsCenterScreen';
import UserProfileScreen from './src/screens/UserProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import CreateActivityStep1Screen from './src/screens/CreateActivityStep1Screen';
import CreateActivityStep2Screen from './src/screens/CreateActivityStep2Screen';
import ActivityDetailsScreen from './src/screens/ActivityDetailsScreen';
import ActivityLeaderboardScreen from './src/screens/ActivityLeaderboardScreen';
import EventAccessQRScreen from './src/screens/EventAccessQRScreen';
import FriendsDiscoveryScreen from './src/screens/FriendsDiscoveryScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Auth / Onboarding */}
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="SelectInterests" component={SelectInterestsScreen} />

        {/* Core Tabs */}
        <Stack.Screen name="DiscoveryFeed" component={DiscoveryFeedScreen} />
        <Stack.Screen name="MapView" component={MapViewScreen} />
        <Stack.Screen name="MatchesList" component={MatchesListScreen} />
        <Stack.Screen name="MessagesList" component={MessagesListScreen} />
        <Stack.Screen name="MessagesChat" component={MessagesChatScreen} />

        {/* Activity Screens */}
        <Stack.Screen name="CreateActivityStep1" component={CreateActivityStep1Screen} />
        <Stack.Screen name="CreateActivityStep2" component={CreateActivityStep2Screen} />
        <Stack.Screen name="ActivityDetails" component={ActivityDetailsScreen} />
        <Stack.Screen name="ActivityLeaderboard" component={ActivityLeaderboardScreen} />
        <Stack.Screen name="EventAccessQR" component={EventAccessQRScreen} />

        {/* Social / Discovery */}
        <Stack.Screen name="FriendsDiscovery" component={FriendsDiscoveryScreen} />
        <Stack.Screen name="NotificationsCenter" component={NotificationsCenterScreen} />

        {/* Profile */}
        <Stack.Screen name="UserProfile" component={UserProfileScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
