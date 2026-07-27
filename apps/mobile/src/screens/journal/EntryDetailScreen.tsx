import React from 'react';
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
import { ChevronLeft, Trash2, CheckCircle2, Calendar, Tag } from 'lucide-react-native';
import { Card } from '../../components/ui/Card';
import { trpc, queryClient } from '../../utils/trpc';
import { getEntryTitle, getEntryPlainText } from '../../utils/entries';

export function EntryDetailScreen({ route, navigation }: any) {
  const { id } = route.params || {};

  const { data: entry, isLoading } = trpc.private.entries.getOne.useQuery(
    { id },
    { enabled: !!id }
  );

  const deleteMutation = trpc.private.entries.delete.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries();
      navigation.goBack();
    },
  });

  const convertToTaskMutation = trpc.private.tasks.convertToTask.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries();
      Alert.alert('Success', 'Entry converted to task successfully!');
    },
  });

  const handleDelete = () => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this journal entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteMutation.mutate({ id }),
        },
      ]
    );
  };

  const handleConvertToTask = () => {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 3);

    convertToTaskMutation.mutate({
      entryId: id,
      deadline: deadline.toISOString(),
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  if (!entry) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft color="#007AFF" size={28} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Entry not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const rawEntry = entry as any;
  const title = getEntryTitle(entry);
  const plainText = getEntryPlainText(entry);
  const dateStr = rawEntry.createdAt
    ? new Date(rawEntry.createdAt).toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft color="#007AFF" size={28} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.actionIconButton}
            onPress={handleDelete}
            disabled={deleteMutation.isPending}
          >
            <Trash2 color="#FF3B30" size={22} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{title}</Text>

        <View style={styles.metaRow}>
          {dateStr ? (
            <View style={styles.metaItem}>
              <Calendar color="#8E8E93" size={14} style={{ marginRight: 4 }} />
              <Text style={styles.metaText}>{dateStr}</Text>
            </View>
          ) : null}

          {rawEntry.type ? (
            <View style={styles.typeBadge}>
              <Tag color="#007AFF" size={12} style={{ marginRight: 4 }} />
              <Text style={styles.typeText}>{rawEntry.type}</Text>
            </View>
          ) : null}

          {rawEntry.sentimentLabel ? (
            <View
              style={[
                styles.sentimentBadge,
                { backgroundColor: rawEntry.sentimentColor || '#E5F1FF' },
              ]}
            >
              <Text style={styles.sentimentText}>{rawEntry.sentimentLabel}</Text>
            </View>
          ) : null}
        </View>

        <Card style={styles.bodyCard}>
          <Text style={styles.bodyText}>{plainText}</Text>
        </Card>

        {rawEntry.type !== 'task' && (
          <TouchableOpacity
            style={[styles.taskButton, convertToTaskMutation.isPending && styles.disabledButton]}
            onPress={handleConvertToTask}
            disabled={convertToTaskMutation.isPending}
          >
            {convertToTaskMutation.isPending ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <CheckCircle2 color="#FFFFFF" size={20} style={{ marginRight: 8 }} />
                <Text style={styles.taskButtonText}>Convert to Task</Text>
              </>
            )}
          </TouchableOpacity>
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
  },
  backText: {
    color: '#007AFF',
    fontSize: 16,
    marginLeft: -4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIconButton: {
    padding: 8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    fontSize: 13,
    color: '#8E8E93',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5F1FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 10,
  },
  typeText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  sentimentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  sentimentText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  bodyCard: {
    padding: 20,
    marginBottom: 24,
    minHeight: 180,
  },
  bodyText: {
    fontSize: 16,
    color: '#2C2C2E',
    lineHeight: 26,
  },
  taskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#34C759',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 32,
  },
  disabledButton: {
    opacity: 0.6,
  },
  taskButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
