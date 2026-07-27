import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { ChevronLeft, LogOut, Bell, Layers, Sparkles, Eye, Save } from 'lucide-react-native';
import { Card } from '../../components/ui/Card';
import { trpc } from '../../utils/trpc';

export function SettingsScreen({ navigation }: any) {
  const { signOut } = useAuth();
  const { user } = useUser();

  const { data: settings, isLoading, refetch } = trpc.private.home.getSettings.useQuery(undefined);
  const updateSettingsMutation = trpc.private.home.updateSettings.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleToggle = (key: string, value: boolean) => {
    updateSettingsMutation.mutate({
      [key]: value,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft color="#007AFF" size={28} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 70 }} />
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* User Header */}
          <View style={styles.profileSection}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {user?.firstName?.charAt(0) ||
                  user?.emailAddresses[0]?.emailAddress?.charAt(0)?.toUpperCase() ||
                  'U'}
              </Text>
            </View>
            <Text style={styles.name}>{user?.fullName || user?.firstName || 'User'}</Text>
            <Text style={styles.email}>{user?.emailAddresses[0]?.emailAddress}</Text>
          </View>

          {/* Preferences Section */}
          <Text style={styles.sectionTitle}>Journaling & AI</Text>
          <Card style={styles.settingsCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Layers color="#1C1C1E" size={20} style={styles.icon} />
                <View style={styles.labelContainer}>
                  <Text style={styles.settingLabel}>Auto-Clustering</Text>
                  <Text style={styles.settingSublabel}>Automatically organize related entries</Text>
                </View>
              </View>
              <Switch
                value={settings?.autoClustering ?? true}
                onValueChange={(val) => handleToggle('autoClustering', val)}
                trackColor={{ false: '#D1D1D6', true: '#34C759' }}
                disabled={updateSettingsMutation.isPending}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Sparkles color="#1C1C1E" size={20} style={styles.icon} />
                <View style={styles.labelContainer}>
                  <Text style={styles.settingLabel}>AI Suggestions</Text>
                  <Text style={styles.settingSublabel}>Receive prompts and key insights</Text>
                </View>
              </View>
              <Switch
                value={settings?.suggestions ?? true}
                onValueChange={(val) => handleToggle('suggestions', val)}
                trackColor={{ false: '#D1D1D6', true: '#34C759' }}
                disabled={updateSettingsMutation.isPending}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Save color="#1C1C1E" size={20} style={styles.icon} />
                <View style={styles.labelContainer}>
                  <Text style={styles.settingLabel}>Autosave Drafts</Text>
                  <Text style={styles.settingSublabel}>Automatically sync entry changes</Text>
                </View>
              </View>
              <Switch
                value={settings?.autosave ?? true}
                onValueChange={(val) => handleToggle('autosave', val)}
                trackColor={{ false: '#D1D1D6', true: '#34C759' }}
                disabled={updateSettingsMutation.isPending}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Eye color="#1C1C1E" size={20} style={styles.icon} />
                <View style={styles.labelContainer}>
                  <Text style={styles.settingLabel}>Focus Mode</Text>
                  <Text style={styles.settingSublabel}>Distraction-free writing interface</Text>
                </View>
              </View>
              <Switch
                value={settings?.focusMode ?? false}
                onValueChange={(val) => handleToggle('focusMode', val)}
                trackColor={{ false: '#D1D1D6', true: '#34C759' }}
                disabled={updateSettingsMutation.isPending}
              />
            </View>
          </Card>

          <Text style={styles.sectionTitle}>Notifications</Text>
          <Card style={styles.settingsCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Bell color="#1C1C1E" size={20} style={styles.icon} />
                <View style={styles.labelContainer}>
                  <Text style={styles.settingLabel}>Daily Reminders</Text>
                  <Text style={styles.settingSublabel}>Remind me to journal every day</Text>
                </View>
              </View>
              <Switch
                value={settings?.dailyReminder ?? true}
                onValueChange={(val) => handleToggle('dailyReminder', val)}
                trackColor={{ false: '#D1D1D6', true: '#34C759' }}
                disabled={updateSettingsMutation.isPending}
              />
            </View>
          </Card>

          <Text style={styles.sectionTitle}>Account</Text>
          <Card style={styles.settingsCard}>
            <TouchableOpacity style={styles.settingRow} onPress={() => signOut()}>
              <View style={styles.settingLeft}>
                <LogOut color="#FF3B30" size={20} style={styles.icon} />
                <Text style={[styles.settingLabel, { color: '#FF3B30' }]}>Sign Out</Text>
              </View>
            </TouchableOpacity>
          </Card>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    backgroundColor: '#FFF',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 70,
  },
  backText: {
    color: '#007AFF',
    fontSize: 16,
    marginLeft: -4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarText: {
    fontSize: 28,
    color: '#FFF',
    fontWeight: 'bold',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  email: {
    fontSize: 14,
    color: '#8E8E93',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  settingsCard: {
    marginBottom: 24,
    paddingVertical: 4,
    paddingHorizontal: 0,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  icon: {
    marginRight: 12,
  },
  labelContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  settingSublabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginLeft: 48,
  },
});
