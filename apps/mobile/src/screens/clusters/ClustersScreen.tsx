import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Layers, RefreshCw, Sparkles, ChevronRight } from 'lucide-react-native';
import { Card } from '../../components/ui/Card';
import { trpc } from '../../utils/trpc';

export function ClustersScreen({ navigation }: any) {
  const { data, isLoading, refetch, isRefetching } = trpc.private.home.getClusters.useQuery(undefined);
  const reclusterMutation = trpc.private.home.recluster.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleRecluster = () => {
    (reclusterMutation.mutate as any)();
  };

  const renderClusterItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => navigation.navigate('ClusterDetail', { clusterId: item.id, clusterName: item.name })}
    >
      <Card style={styles.clusterCard}>
        <View style={styles.clusterHeader}>
          <View style={styles.clusterTitleContainer}>
            <View style={[styles.strengthBadge, item.strength === 'Dominant' ? styles.dominantBadge : styles.emergingBadge]}>
              <Text style={styles.strengthText}>{item.strength}</Text>
            </View>
            <Text style={styles.clusterName} numberOfLines={1}>
              {item.name}
            </Text>
          </View>
          <ChevronRight color="#C7C7CC" size={20} />
        </View>

        <Text style={styles.clusterDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.clusterFooter}>
          <View style={styles.tonesContainer}>
            {item.tones?.slice(0, 3).map((tone: string, idx: number) => (
              <View key={idx} style={styles.toneTag}>
                <Text style={styles.toneText}>#{tone}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.entryCount}>{item.entryCount} entries</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.subtitle}>AI Insights</Text>
          <Text style={styles.title}>Thought Clusters</Text>
        </View>
        <TouchableOpacity
          style={[styles.reclusterButton, reclusterMutation.isPending && styles.disabledButton]}
          onPress={handleRecluster}
          disabled={reclusterMutation.isPending}
        >
          {reclusterMutation.isPending ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <>
              <RefreshCw color="#007AFF" size={16} style={styles.buttonIcon} />
              <Text style={styles.reclusterText}>Re-cluster</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Analyzing thought patterns...</Text>
        </View>
      ) : (
        <FlatList
          data={data?.items || []}
          renderItem={renderClusterItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
          ListHeaderComponent={
            data?.headline ? (
              <Card style={styles.headlineCard}>
                <Sparkles color="#5856D6" size={22} style={{ marginBottom: 8 }} />
                <Text style={styles.headlineText}>{data.headline}</Text>
              </Card>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Layers color="#8E8E93" size={48} />
              <Text style={styles.emptyTitle}>No Clusters Yet</Text>
              <Text style={styles.emptyText}>
                Write more journal entries to allow AI to identify pattern clusters and recurring themes.
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
    justifyContent: 'space-between',
    alignItems: 'center',
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
  reclusterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5F1FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonIcon: {
    marginRight: 6,
  },
  reclusterText: {
    color: '#007AFF',
    fontSize: 13,
    fontWeight: '600',
  },
  listContent: {
    padding: 24,
  },
  headlineCard: {
    marginBottom: 20,
    backgroundColor: '#F4F3FF',
    borderWidth: 1,
    borderColor: '#E0DBFF',
    padding: 16,
  },
  headlineText: {
    fontSize: 15,
    color: '#3A3A3C',
    lineHeight: 22,
    fontWeight: '500',
  },
  clusterCard: {
    marginBottom: 16,
    padding: 18,
  },
  clusterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  clusterTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  strengthBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 10,
  },
  dominantBadge: {
    backgroundColor: '#E4F9EC',
  },
  emergingBadge: {
    backgroundColor: '#FFF4E5',
  },
  strengthText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  clusterName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1C1C1E',
    flex: 1,
  },
  clusterDescription: {
    fontSize: 14,
    color: '#636366',
    lineHeight: 20,
    marginBottom: 14,
  },
  clusterFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    paddingTop: 12,
  },
  tonesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  toneTag: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
  },
  toneText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  entryCount: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#8E8E93',
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
    lineHeight: 20,
  },
});
