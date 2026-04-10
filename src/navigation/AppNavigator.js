import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { House, Package, Settings } from 'lucide-react-native';
import * as SecureStore from 'expo-secure-store';

import HomeScreen from '../screens/HomeScreen';
import ProjectDetailScreen from '../screens/ProjectDetailScreen';
import CreateProjectScreen from '../screens/CreateProjectScreen';
import PartDetailScreen from '../screens/PartDetailScreen';
import GalleryScreen from '../screens/GalleryScreen';
import ReferenceBoardScreen from '../screens/ReferenceBoardScreen';
import InventoryScreen from '../screens/InventoryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import EditProjectScreen from '../screens/EditProjectScreen';

const Tab = createBottomTabNavigator();
const RootStack = createStackNavigator();
const HomeStack = createStackNavigator();

const COLORS = {
  bg: '#0F172A',
  surface: '#1E293B',
  accent: '#A855F7',
  textSecondary: '#94A3B8',
  border: '#334155',
};

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.surface },
        headerTintColor: '#F8FAFC',
        headerTitleStyle: { fontWeight: '700' },
        cardStyle: { backgroundColor: COLORS.bg },
      }}
    >
      <HomeStack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'CraftLog', headerShown: false }}
      />
      <HomeStack.Screen
        name="ProjectDetail"
        component={ProjectDetailScreen}
        options={{ title: 'Détail du projet' }}
      />
      <HomeStack.Screen
        name="CreateProject"
        component={CreateProjectScreen}
        options={{ title: 'Nouveau projet' }}
      />
      <HomeStack.Screen
        name="PartDetail"
        component={PartDetailScreen}
        options={({ route }) => ({ title: route.params?.partName ?? 'Pièce' })}
      />
      <HomeStack.Screen
        name="Gallery"
        component={GalleryScreen}
        options={({ route }) => ({ title: route.params?.projectName ?? 'Galerie' })}
      />
      <HomeStack.Screen
        name="ReferenceBoard"
        component={ReferenceBoardScreen}
        options={({ route }) => ({ title: `Planche — ${route.params?.projectName ?? 'Référence'}` })}
      />
      <HomeStack.Screen
        name="EditProject"
        component={EditProjectScreen}
        options={{ title: 'Modifier le projet' }}
      />
    </HomeStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: 'Projets',
          tabBarIcon: ({ color, size }) => <House color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Inventory"
        component={InventoryScreen}
        options={{
          tabBarLabel: 'Inventaire',
          tabBarIcon: ({ color, size }) => <Package color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Réglages',
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    SecureStore.getItemAsync('hasSeenOnboarding').then((val) => {
      setInitialRoute(val === 'true' ? 'Main' : 'Onboarding');
    });
  }, []);

  if (!initialRoute) return null; // Attend la vérification AsyncStorage

  return (
    <NavigationContainer>
      <RootStack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{ headerShown: false, cardStyle: { backgroundColor: '#0F172A' } }}
      >
        <RootStack.Screen name="Onboarding" component={OnboardingScreen} />
        <RootStack.Screen name="Main" component={MainTabs} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
