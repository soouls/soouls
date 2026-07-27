import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Search, Plus, BookOpen, ChevronRight } from 'lucide-react-native';
import { Card } from '../../components/ui/Card';
import { trpc } from '../../utils/trpc';
import { getEntryTitle, getEntryPlainText } from '../../utils/entries';

export function EntryListScreen({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, refetch, isRefetching } = trpc.private.entries.getAll.useQuery({
    limit: 50,
    search: searchQuery.trim() || undefined,
  });

  const renderItem = ({ item }: { item: any }) => {
    const title = getEntryTitle(item);
    const plainText = getEntryPlainText(item);
    const dateStr = item.createdAt
      ? new Date(item.createdAt).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '';

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => navigation.navigate('EntryDetail', { id: item.id })}
      >
        <Card style={styles.entryCard}>
          <View style={styles.entryHeader}>
            <Text style={styles.entryTitle} numberOfLines={1}>
              {title}
            </Text>
            <Text style={styles.entryDate}>{dateStr}</Text>
          </View>

          <Text style={styles.entrySnippet} numberOfLines={3}>
            {plainText}
          </Text>

          <View style={styles.entryFooter}>
            <View style={styles.badgeGroup}>
              {item.type && (
                <View style={styles.typeBadge}>
                  <Text style={styles.typeText}>{item.type}</Text>
                </View>
              )}
              {item.sentimentLabel && (
                <View style={[styles.sentimentChip, { backgroundColor: item.sentimentColor || '#E5F1FF' }]}>
                  <Text style={styles.sentimentText}>{item.sentimentLabel}</Text>
                </View>
              )}
            </View>
            <ChevronRight color="#C7C7CC" size={18} />
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft color="#007AFF" size={28} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Entries</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CreateEntry')} style={styles.addButton}>
          <Plus color="#007AFF" size={24} />
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Search color="#8E8E93" size={18} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search entries..."
          placeholderTextColor="#8E8E93"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          data={data?.items || []}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <BookOpen color="#8E8E93" size={48} />
              <Text style={styles.emptyTitle}>No Entries Found</Text>
              <Text style={styles.emptyText}>
                {searchQuery ? 'No entries match your search query.' : 'Write your first journal entry to get started.'}
              </Text>
            </View>
          }
        />
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
  addButton: {
    width: 70,
    alignItems: 'flex-end',
    paddingRight: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFEFF4',
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1C1C1E',
  },
  listContainer: {
    padding: 20,
  },
  entryCard: {
    marginBottom: 14,
    padding: 16,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryTitle: {
    fontSize: 17,
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
    marginBottom: 12,
  },
  entryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeBadge: {
    backgroundColor: '#E5F1FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
  },
  typeText: {
    fontSize: 11,
    color: '#007AFF',
    fontWeight: '600',
    textTransform: 'capitalize',
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
});
