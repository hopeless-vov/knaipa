import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootStackParamList, TabParamList } from '../types';
import BottomNav from '../components/BottomNav';
import SplashView from '../components/SplashView';
import { useAuthSession } from '../hooks/useAuthSession';
import { useSavedBootstrap } from '../hooks/useSavedBootstrap';

// Auth screens
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import ForgotScreen from '../screens/ForgotScreen';

// Tab screens
import DiscoverScreen from '../screens/DiscoverScreen';
import SavedScreen from '../screens/SavedScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Stack screens
import PlaceDetailScreen from '../screens/PlaceDetailScreen';
import FiltersScreen from '../screens/FiltersScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <BottomNav {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Discover" component={DiscoverScreen} />
      <Tab.Screen name="Saved" component={SavedScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const { user, restoring } = useAuthSession();
  useSavedBootstrap();

  if (restoring) {
    return <SplashView />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 280,
      }}
    >
      {user ? (
        <>
          {/* Main tabs */}
          <Stack.Screen name="Main" component={TabNavigator} />

          {/* Place detail */}
          <Stack.Screen name="PlaceDetail" component={PlaceDetailScreen} />

          {/* Filters — modal slide */}
          <Stack.Screen
            name="Filters"
            component={FiltersScreen}
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
        </>
      ) : (
        <>
          {/* Auth — slide right */}
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="Forgot" component={ForgotScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
