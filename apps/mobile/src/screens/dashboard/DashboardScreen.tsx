import React from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PlusCircle, Flame, BookOpen, Sparkles, ChevronRight, Layers } from 'lucide-react-native';
import { Card } from '../../components/ui/Card';
import { trpc } from '../../utils/trpc';
import { getEntryTitle, getEntryPlainText } from '../../utils/entries';

export function DashboardScreen({ navigation }: any) {
  const { data: insights, isLoading: isLoadingInsights, refetch: refetchInsights, isRefetching } =
    trpc.private.home.getInsights.useQuery(undefined);

  const { data: entriesData, isLoading: isLoadingEntries } = trpc.private.entries.getAll.useQuery({
    limit: 5,
  });

  const refreshInsightsMutation = trpc.private.home.refreshInsights.useMutation({
    onSuccess: () => {
      refetchInsights();
    },
  });

  const onRefresh = () => {
    refreshInsightsMutation.mutate({});
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.title}>Your Journal</Text>
        </View>
        <TouchableOpacity
          style={styles.clustersShortcut}
          onPress={() => navigation.navigate('Clusters')}
        >
          <Layers color="#007AFF" size={22} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching || refreshInsightsMutation.isPending} onRefresh={onRefresh} />}
      >
        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Flame color="#FF9500" size={24} style={{ marginBottom: 4 }} />
            <Text style={styles.statNumber}>
              {isLoadingInsights ? '-' : insights?.overview?.currentStreak ?? 0}
            </Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </Card>

          <Card style={styles.statCard}>
            <BookOpen color="#007AFF" size={24} style={{ marginBottom: 4 }} />
            <Text style={styles.statNumber}>
              {isLoadingInsights ? '-' : insights?.overview?.entryCount ?? 0}
            </Text>
            <Text style={styles.statLabel}>Total Entries</Text>
          </Card>
        </View>

        {/* AI Dominant Theme / Insights Banner */}
        {insights?.dominantTheme ? (
          <Card style={styles.themeBanner}>
            <View style={styles.bannerHeader}>
              <Sparkles color="#5856D6" size={18} style={{ marginRight: 6 }} />
              <Text style={styles.bannerTag}>Current Dominant Theme</Text>
            </View>
            <Text style={styles.dominantThemeText}>{insights.dominantTheme}</Text>
            {insights.statLine ? (
              <Text style={styles.statLineText}>{insights.statLine}</Text>
            ) : null}
          </Card>
        ) : null}

        {/* Recent Entries Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Entries</Text>
          <TouchableOpacity onPress={() => navigation.navigate('EntryList')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {isLoadingEntries ? (
          <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 24 }} />
        ) : !entriesData?.items || entriesData.items.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>No journal entries yet.</Text>
            <Text style={styles.emptySubtext}>Tap the + button below to write your first entry.</Text>
          </Card>
        ) : (
          entriesData.items.map((entry) => {
            const title = getEntryTitle(entry);
            const plainText = getEntryPlainText(entry);
            const dateStr = entry.createdAt
              ? new Date(entry.createdAt).toLocaleDateString()
              : '';

            return (
              <TouchableOpacity
                key={entry.id}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('EntryDetail', { id: entry.id })}
              >
                <Card style={styles.entryCard}>
                  <View style={styles.entryHeader}>
                    <Text style={styles.entryTitle} numberOfLines={1}>
                      {title}
                    </Text>
                    <Text style={styles.entryDate}>{dateStr}</Text>
                  </View>
                  <Text style={styles.entrySnippet} numberOfLines={2}>
                    {plainText}
                  </Text>
                  <View style={styles.entryCardFooter}>
                    {entry.sentimentLabel && (
                      <View
                        style={[
                          styles.sentimentChip,
                          { backgroundColor: entry.sentimentColor || '#E5F1FF' },
                        ]}
                      >
                        <Text style={styles.sentimentText}>{entry.sentimentLabel}</Text>
                      </View>
                    )}
                    <ChevronRight color="#C7C7CC" size={16} />
                  </View>
                </Card>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* FAB to create entry */}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CreateEntry')}>
        <PlusCircle color="#FFFFFF" size={32} />
      </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  greeting: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 2,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  clustersShortcut: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    padding: 16,
  },
  statNumber: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    fontWeight: '500',
  },
  themeBanner: {
    backgroundColor: '#F4F3FF',
    borderWidth: 1,
    borderColor: '#E0DBFF',
    padding: 18,
    marginBottom: 24,
  },
  bannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  bannerTag: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5856D6',
    textTransform: 'uppercase',
  },
  dominantThemeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  statLineText: {
    fontSize: 13,
    color: '#636366',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  seeAll: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  entryCard: {
    marginBottom: 12,
    padding: 16,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    flex: 1,
    marginRight: 8,
  },
  entryDate: {
    fontSize: 12,
    color: '#8E8E93',
  },
  entrySnippet: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 10,
  },
  entryCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sentimentChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sentimentText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
