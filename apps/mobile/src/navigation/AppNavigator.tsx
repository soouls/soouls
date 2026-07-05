import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { CreateEntryScreen } from '../screens/journal/CreateEntryScreen';
import { EntryListScreen } from '../screens/journal/EntryListScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';

export type AppStackParamList = {
  Dashboard: undefined;
  CreateEntry: undefined;
  EntryList: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

export function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#FAFAFA' },
      }}
    >
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="CreateEntry" component={CreateEntryScreen} />
      <Stack.Screen name="EntryList" component={EntryListScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}
