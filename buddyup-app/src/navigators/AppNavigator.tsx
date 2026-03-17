import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { observer } from "mobx-react-lite";
import { Ionicons } from "@expo/vector-icons";
import { MMKV } from "react-native-mmkv";

import { authStore } from "@/stores/authStore";
import { colors } from "@/theme";

// Screens
import WelcomeScreen from "@/screens/Auth/WelcomeScreen";
import LoginScreen from "@/screens/Auth/LoginScreen";
import RegisterScreen from "@/screens/Auth/RegisterScreen";
import InterestsScreen from "@/screens/Onboarding/InterestsScreen";
import AvatarPickerScreen from "@/screens/Onboarding/AvatarPickerScreen";
import DiscoverScreen from "@/screens/Discover/DiscoverScreen";
import LikesScreen from "@/screens/Likes/LikesScreen";
import ChatsListScreen from "@/screens/Chat/ChatsListScreen";
import ChatScreen from "@/screens/Chat/ChatScreen";
import ProfileScreen from "@/screens/Profile/ProfileScreen";
import LocationFilterScreen from "@/screens/Map/LocationFilterScreen";

// Phase 2 screens
import GroupsListScreen from "@/screens/Groups/GroupsListScreen";
import GroupDetailScreen from "@/screens/Groups/GroupDetailScreen";
import CreateGroupScreen from "@/screens/Groups/CreateGroupScreen";
import BulletinBoardScreen from "@/screens/Bulletin/BulletinBoardScreen";
import CreatePostScreen from "@/screens/Bulletin/CreatePostScreen";
import EventsScreen from "@/screens/Events/EventsScreen";
import EventDetailScreen from "@/screens/Events/EventDetailScreen";
import CreateEventScreen from "@/screens/Events/CreateEventScreen";
import SuperConnectsScreen from "@/screens/SuperConnect/SuperConnectsScreen";
import SettingsScreen from "@/screens/Settings/SettingsScreen";
import BlockedUsersScreen from "@/screens/Settings/BlockedUsersScreen";

// Phase 3 screens
import LeaderboardScreen from "@/screens/Leaderboard/LeaderboardScreen";
import ChallengesScreen from "@/screens/Challenges/ChallengesScreen";
import AnalyticsScreen from "@/screens/Profile/AnalyticsScreen";
import TravelMapScreen from "@/screens/Profile/TravelMapScreen";

// Phase 4 screens
import BuddyPassScreen from "@/screens/Premium/BuddyPassScreen";

// Notification screen
import NotificationsScreen from "@/screens/Notifications/NotificationsScreen";

const _storage = new MMKV();
const ONBOARDING_KEY = "onboarding_complete";

export function markOnboardingComplete() {
  _storage.set(ONBOARDING_KEY, true);
}

function isOnboardingComplete(): boolean {
  // Check MMKV flag first (set after registration completes)
  if (_storage.getBoolean(ONBOARDING_KEY)) return true;
  // Fallback: if user already has avatar + interests, treat as complete
  const user = authStore.user;
  if (!user) return false;
  return !!(user.avatar_character_id && user.interests?.length > 0);
}

const AuthStack = createNativeStackNavigator();
const MainTab = createBottomTabNavigator();
const ChatStack = createNativeStackNavigator();
const GroupStack = createNativeStackNavigator();
const BulletinStack = createNativeStackNavigator();
const EventStack = createNativeStackNavigator();
const RootStack = createNativeStackNavigator();

function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{ headerShown: false, animation: "slide_from_right" }}
    >
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="Interests" component={InterestsScreen} />
      <AuthStack.Screen name="AvatarPicker" component={AvatarPickerScreen} />
    </AuthStack.Navigator>
  );
}

function ChatNavigator() {
  return (
    <ChatStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.bgCard },
        headerTintColor: colors.text,
        headerTitleStyle: { fontFamily: "System" },
      }}
    >
      <ChatStack.Screen name="ChatsList" component={ChatsListScreen} options={{ title: "Messages" }} />
      <ChatStack.Screen name="Chat" component={ChatScreen} options={{ title: "" }} />
    </ChatStack.Navigator>
  );
}

function GroupsNavigator() {
  return (
    <GroupStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.bgCard },
        headerTintColor: colors.text,
        headerShown: false,
      }}
    >
      <GroupStack.Screen name="GroupsList" component={GroupsListScreen} />
      <GroupStack.Screen name="GroupDetail" component={GroupDetailScreen} />
      <GroupStack.Screen name="CreateGroup" component={CreateGroupScreen} />
    </GroupStack.Navigator>
  );
}

function BulletinNavigator() {
  return (
    <BulletinStack.Navigator screenOptions={{ headerShown: false }}>
      <BulletinStack.Screen name="BulletinBoard" component={BulletinBoardScreen} />
      <BulletinStack.Screen name="CreatePost" component={CreatePostScreen} />
    </BulletinStack.Navigator>
  );
}

function EventsNavigator() {
  return (
    <EventStack.Navigator screenOptions={{ headerShown: false }}>
      <EventStack.Screen name="EventsList" component={EventsScreen} />
      <EventStack.Screen name="EventDetail" component={EventDetailScreen} />
      <EventStack.Screen name="CreateEvent" component={CreateEventScreen} />
    </EventStack.Navigator>
  );
}

function TabNavigator() {
  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: {
          backgroundColor: colors.bgCard,
          borderTopColor: colors.border,
          height: 80,
          paddingBottom: 16,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: "600" },
        headerShown: false,
        tabBarIcon: ({ focused, color }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            Discover: focused ? "flame" : "flame-outline",
            Likes: focused ? "heart" : "heart-outline",
            Messages: focused ? "chatbubbles" : "chatbubbles-outline",
            Groups: focused ? "people" : "people-outline",
            Bulletin: focused ? "clipboard" : "clipboard-outline",
            Events: focused ? "calendar" : "calendar-outline",
            Profile: focused ? "person" : "person-outline",
          };
          return <Ionicons name={icons[route.name] ?? "ellipse"} size={22} color={color} />;
        },
      })}
    >
      <MainTab.Screen name="Discover" component={DiscoverScreen} />
      <MainTab.Screen name="Likes" component={LikesScreen} />
      <MainTab.Screen name="Messages" component={ChatNavigator} />
      <MainTab.Screen name="Groups" component={GroupsNavigator} />
      <MainTab.Screen name="Bulletin" component={BulletinNavigator} />
      <MainTab.Screen name="Events" component={EventsNavigator} />
      <MainTab.Screen name="Profile" component={ProfileScreen} />
    </MainTab.Navigator>
  );
}

export const navigationRef = React.createRef<any>();

const linking = {
  prefixes: ["buddyup://"],
  config: {
    screens: {
      Main: {
        screens: {
          Messages: {
            screens: {
              Chat: "chat/:matchId",
            },
          },
        },
      },
    },
  },
} as any;

export const AppNavigator = observer(() => {
  const onboardingDone = isOnboardingComplete();

  return (
    <NavigationContainer ref={navigationRef} linking={linking}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {!authStore.isAuthenticated || !onboardingDone ? (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <>
            <RootStack.Screen name="Main" component={TabNavigator} />
            <RootStack.Screen
              name="LocationFilter"
              component={LocationFilterScreen}
              options={{ presentation: "modal" }}
            />
            <RootStack.Screen
              name="SuperConnects"
              component={SuperConnectsScreen}
              options={{ presentation: "modal" }}
            />
            <RootStack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{ presentation: "modal" }}
            />
            <RootStack.Screen
              name="BlockedUsers"
              component={BlockedUsersScreen}
            />
            <RootStack.Screen name="Leaderboard" component={LeaderboardScreen} />
            <RootStack.Screen name="Challenges" component={ChallengesScreen} />
            <RootStack.Screen name="Analytics" component={AnalyticsScreen} />
            <RootStack.Screen name="TravelMap" component={TravelMapScreen} />
            <RootStack.Screen
              name="BuddyPass"
              component={BuddyPassScreen}
              options={{ presentation: "modal" }}
            />
            <RootStack.Screen name="Notifications" component={NotificationsScreen} />
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
});
