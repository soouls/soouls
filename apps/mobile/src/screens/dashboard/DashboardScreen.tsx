import { useAuth } from '@clerk/clerk-expo';
import { PlusCircle, Settings } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../components/ui/Card';
import { useEntries } from '../../hooks/useEntries';
import { getEntryTitle, getEntryPlainText } from '../../utils/entries';
import type { entries } from '../../utils/trpc';

export function DashboardScreen({ navigation }: any) {
  const { signOut } = useAuth();
  const { data: entriesData, isLoading: isLoadingEntries } = useEntries(5);
  // Optional: Wire getInsights here as per phase 3, although we are in phase 1 mostly.
  // const { data: insightsData } = trpc.private.home.getInsights.useQuery();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good Morning,</Text>
          <Text style={styles.title}>Your Journal</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Settings')}
          style={styles.headerButton}
        >
          <Settings color="#1C1C1E" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>-</Text>
            <Text style={styles.statLabel}>Entries this week</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>-</Text>
            <Text style={styles.statLabel}>Day streak</Text>
          </Card>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Entries</Text>
          <TouchableOpacity onPress={() => navigation.navigate('EntryList')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {isLoadingEntries ? (
          <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 24 }} />
        ) : (
          entriesData?.items.map((entry) => {
            const title = getEntryTitle(entry);
            const plainText = getEntryPlainText(entry);
            const dateStr = new Date(entry.createdAt).toLocaleDateString();

            return (
              <Card key={entry.id} style={styles.entryCard}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle} numberOfLines={1}>{title}</Text>
                  <Text style={styles.entryDate}>{dateStr}</Text>
                </View>
                <Text style={styles.entrySnippet} numberOfLines={2}>
                  {plainText}
                </Text>
              </Card>
            );
          })
        )}
      </ScrollView>

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
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  headerButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    padding: 16,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
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
