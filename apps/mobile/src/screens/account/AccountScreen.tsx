import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Download, LogOut, Flame, Calendar, BookOpen, Trash2, Award } from 'lucide-react-native';
import { Card } from '../../components/ui/Card';
import { trpc } from '../../utils/trpc';

export function AccountScreen({ navigation }: any) {
  const { signOut } = useAuth();
  const { user } = useUser();
  const utils = trpc.useUtils();
  const [isExporting, setIsExporting] = useState(false);

  const { data: account, isLoading } = trpc.private.home.getAccount.useQuery(undefined);

  const deleteAccountMutation = trpc.private.home.deleteAccount.useMutation({
    onSuccess: () => {
      signOut();
    },
  });

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const data = await utils.private.home.exportAccountData.fetch(undefined);
      Alert.alert(
        'Data Export Ready',
        `Exported ${data.entries?.length || 0} entries successfully. Exported at: ${new Date(data.exportedAt).toLocaleString()}`
      );
    } catch (err) {
      Alert.alert('Export Failed', 'Could not export account data at this time.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently erase all your journal entries, clusters, and insights. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => (deleteAccountMutation.mutate as any)(),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.subtitle}>Profile & Activity</Text>
        <Text style={styles.title}>Your Account</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileSection}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {user?.firstName?.charAt(0) ||
                user?.emailAddresses[0]?.emailAddress?.charAt(0)?.toUpperCase() ||
                'U'}
            </Text>
          </View>
          <Text style={styles.name}>{user?.fullName || user?.firstName || 'Journaler'}</Text>
          <Text style={styles.email}>{user?.emailAddresses[0]?.emailAddress}</Text>

          {account?.bio ? <Text style={styles.bio}>{account.bio}</Text> : null}
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 24 }} />
        ) : (
          <>
            {/* Account Stats Grid */}
            <View style={styles.statsGrid}>
              <Card style={styles.statCard}>
                <Flame color="#FF9500" size={24} style={styles.statIcon} />
                <Text style={styles.statNumber}>{account?.stats?.streak || 0}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </Card>

              <Card style={styles.statCard}>
                <BookOpen color="#007AFF" size={24} style={styles.statIcon} />
                <Text style={styles.statNumber}>{account?.stats?.entries || 0}</Text>
                <Text style={styles.statLabel}>Total Entries</Text>
              </Card>

              <Card style={styles.statCard}>
                <Calendar color="#34C759" size={24} style={styles.statIcon} />
                <Text style={styles.statNumber}>{account?.stats?.daysJoined || 1}</Text>
                <Text style={styles.statLabel}>Days Active</Text>
              </Card>

              <Card style={styles.statCard}>
                <Award color="#5856D6" size={24} style={styles.statIcon} />
                <Text style={styles.statNumberText} numberOfLines={1}>
                  {account?.stats?.mostActivePeriod || 'Morning'}
                </Text>
                <Text style={styles.statLabel}>Active Time</Text>
              </Card>
            </View>

            {/* Writing Profile */}
            {account?.writingProfile && (
              <Card style={styles.sectionCard}>
                <Text style={styles.cardHeaderTag}>Writing Persona</Text>
                <Text style={styles.profileTitle}>{account.writingProfile.title}</Text>
                <Text style={styles.profileDesc}>{account.writingProfile.description}</Text>

                <View style={styles.tagsRow}>
                  {account.writingProfile.tags?.map((tag, idx) => (
                    <View key={idx} style={styles.tagBadge}>
                      <Text style={styles.tagText}>#{tag}</Text>
                    </View>
                  ))}
                </View>
              </Card>
            )}

            {/* Core Themes */}
            {account?.coreThemes && account.coreThemes.length > 0 && (
              <Card style={styles.sectionCard}>
                <Text style={styles.cardHeaderTag}>Core Themes</Text>
                {account.coreThemes.map((theme, idx) => (
                  <View key={idx} style={styles.themeRow}>
                    <View style={styles.themeHeader}>
                      <Text style={styles.themeLabel}>{theme.label}</Text>
                      <Text style={styles.themePercent}>{theme.percent}%</Text>
                    </View>
                    <View style={styles.progressBarBg}>
                      <View style={[styles.progressBarFill, { width: `${Math.min(100, theme.percent)}%` }]} />
                    </View>
                  </View>
                ))}
              </Card>
            )}

            {/* Actions Card */}
            <Card style={styles.actionCard}>
              <TouchableOpacity
                style={styles.actionRow}
                onPress={handleExport}
                disabled={isExporting}
              >
                <Download color="#007AFF" size={20} style={styles.actionIcon} />
                <Text style={styles.actionText}>Export My Data (JSON)</Text>
                {isExporting && (
                  <ActivityIndicator size="small" color="#007AFF" style={{ marginLeft: 8 }} />
                )}
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity style={styles.actionRow} onPress={() => signOut()}>
                <LogOut color="#8E8E93" size={20} style={styles.actionIcon} />
                <Text style={[styles.actionText, { color: '#8E8E93' }]}>Sign Out</Text>
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity style={styles.actionRow} onPress={handleDeleteAccount}>
                <Trash2 color="#FF3B30" size={20} style={styles.actionIcon} />
                <Text style={[styles.actionText, { color: '#FF3B30' }]}>Delete Account</Text>
              </TouchableOpacity>
            </Card>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    backgroundColor: '#FFFFFF',
  },
  subtitle: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
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
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 30,
    color: '#FFF',
    fontWeight: 'bold',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#8E8E93',
  },
  bio: {
    fontSize: 14,
    color: '#636366',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  statIcon: {
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  statNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  sectionCard: {
    padding: 20,
    marginBottom: 20,
  },
  cardHeaderTag: {
    fontSize: 12,
    fontWeight: '700',
    color: '#007AFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  profileTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 6,
  },
  profileDesc: {
    fontSize: 14,
    color: '#636366',
    lineHeight: 20,
    marginBottom: 14,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagBadge: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 6,
  },
  tagText: {
    fontSize: 12,
    color: '#3A3A3C',
    fontWeight: '500',
  },
  themeRow: {
    marginBottom: 14,
  },
  themeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  themeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  themePercent: {
    fontSize: 13,
    color: '#8E8E93',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  actionCard: {
    marginBottom: 32,
    paddingVertical: 4,
    paddingHorizontal: 0,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  actionIcon: {
    marginRight: 12,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginLeft: 52,
  },
});
