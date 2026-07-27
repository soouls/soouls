import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LayoutDashboard, BookOpen, Layers, User, Settings } from 'lucide-react-native';

import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { EntryListScreen } from '../screens/journal/EntryListScreen';
import { CreateEntryScreen } from '../screens/journal/CreateEntryScreen';
import { EntryDetailScreen } from '../screens/journal/EntryDetailScreen';
import { ClustersScreen } from '../screens/clusters/ClustersScreen';
import { ClusterDetailScreen } from '../screens/clusters/ClusterDetailScreen';
import { AccountScreen } from '../screens/account/AccountScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';

export type MainTabParamList = {
  Dashboard: undefined;
  Journal: undefined;
  Clusters: undefined;
  Account: undefined;
  Settings: undefined;
};

export type AppStackParamList = {
  MainTabs: undefined;
  CreateEntry: undefined;
  EntryDetail: { id: string };
  ClusterDetail: { clusterId: string; clusterName?: string };
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<AppStackParamList>();

function MainTabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E5EA',
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Journal"
        component={EntryListScreen}
        options={{
          tabBarLabel: 'Journal',
          tabBarIcon: ({ color, size }) => <BookOpen color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Clusters"
        component={ClustersScreen}
        options={{
          tabBarLabel: 'Clusters',
          tabBarIcon: ({ color, size }) => <Layers color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{
          tabBarLabel: 'Account',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#FAFAFA' },
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen name="CreateEntry" component={CreateEntryScreen} />
      <Stack.Screen name="EntryDetail" component={EntryDetailScreen} />
      <Stack.Screen name="ClusterDetail" component={ClusterDetailScreen} />
    </Stack.Navigator>
  );
}
