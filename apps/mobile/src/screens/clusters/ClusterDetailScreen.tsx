import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Lightbulb, Compass, BookOpen } from 'lucide-react-native';
import { Card } from '../../components/ui/Card';
import { trpc } from '../../utils/trpc';

export function ClusterDetailScreen({ route, navigation }: any) {
  const { clusterId, clusterName } = route.params || {};

  const { data: detail, isLoading } = trpc.private.home.getClusterDetail.useQuery(
    { clusterId },
    { enabled: !!clusterId }
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft color="#007AFF" size={28} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {clusterName || 'Cluster Detail'}
        </Text>
        <View style={{ width: 70 }} />
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : !detail ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Unable to load cluster details.</Text>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Cluster Header Card */}
          <Card style={styles.summaryCard}>
            <Text style={styles.sectionTag}>Narrative Summary</Text>
            <Text style={styles.narrative}>{detail.narrative}</Text>
          </Card>

          {/* Key Ideas */}
          {detail.keyIdeas && detail.keyIdeas.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <Lightbulb color="#FF9500" size={20} style={{ marginRight: 8 }} />
                <Text style={styles.sectionTitle}>Key Ideas</Text>
              </View>
              {detail.keyIdeas.map((idea, index) => (
                <Card key={index} style={styles.ideaCard}>
                  <Text style={styles.ideaLabel}>{idea.label}</Text>
                  <Text style={styles.ideaDesc}>{idea.description}</Text>
                </Card>
              ))}
            </View>
          )}

          {/* Observations & Next Steps */}
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <Compass color="#5856D6" size={20} style={{ marginRight: 8 }} />
              <Text style={styles.sectionTitle}>AI Guidance</Text>
            </View>

            {detail.observation && (
              <Card style={styles.guidanceCard}>
                <Text style={styles.guidanceLabel}>Observation</Text>
                <Text style={styles.guidanceText}>{detail.observation}</Text>
              </Card>
            )}

            {detail.nextStep && (
              <Card style={[styles.guidanceCard, { backgroundColor: '#EBF5FF' }]}>
                <Text style={[styles.guidanceLabel, { color: '#007AFF' }]}>Recommended Action</Text>
                <Text style={styles.guidanceText}>{detail.nextStep}</Text>
              </Card>
            )}

            {detail.reflectionPrompt && (
              <Card style={[styles.guidanceCard, { backgroundColor: '#FDF7E7' }]}>
                <Text style={[styles.guidanceLabel, { color: '#B36B00' }]}>Reflection Prompt</Text>
                <Text style={styles.guidanceText}>{detail.reflectionPrompt}</Text>
              </Card>
            )}
          </View>

          {/* Highlights */}
          {detail.highlights && detail.highlights.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <BookOpen color="#34C759" size={20} style={{ marginRight: 8 }} />
                <Text style={styles.sectionTitle}>Associated Entries</Text>
              </View>
              {detail.highlights.map((highlight) => (
                <TouchableOpacity
                  key={highlight.id}
                  onPress={() => navigation.navigate('EntryDetail', { id: highlight.id })}
                >
                  <Card style={styles.highlightCard}>
                    <Text style={styles.highlightTitle}>{highlight.title}</Text>
                    <Text style={styles.highlightDate}>
                      {new Date(highlight.createdAt).toLocaleDateString()}
                    </Text>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          )}
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
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 15,
    color: '#8E8E93',
  },
  summaryCard: {
    padding: 20,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  sectionTag: {
    fontSize: 12,
    fontWeight: '700',
    color: '#007AFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  narrative: {
    fontSize: 16,
    color: '#1C1C1E',
    lineHeight: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  ideaCard: {
    padding: 16,
    marginBottom: 10,
  },
  ideaLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  ideaDesc: {
    fontSize: 14,
    color: '#636366',
    lineHeight: 20,
  },
  guidanceCard: {
    padding: 16,
    marginBottom: 10,
    backgroundColor: '#F2F2F7',
  },
  guidanceLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3A3A3C',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  guidanceText: {
    fontSize: 14,
    color: '#1C1C1E',
    lineHeight: 20,
  },
  highlightCard: {
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  highlightTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1C1E',
    flex: 1,
    marginRight: 10,
  },
  highlightDate: {
    fontSize: 12,
    color: '#8E8E93',
  },
});
