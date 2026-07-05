import { ChevronLeft } from 'lucide-react-native';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../components/ui/Card';

export function EntryListScreen({ navigation }: any) {
  // Mock data for initial UI scaffolding
  const entries = [
    {
      id: '1',
      title: 'Morning Reflection',
      snippet:
        'Today I woke up feeling energetic and ready to tackle the day. The sun was shining through the window...',
      date: 'Today, 8:00 AM',
    },
    {
      id: '2',
      title: 'Work Challenges',
      snippet:
        'Had a tough meeting but learned a lot about communication and setting clear boundaries with the team.',
      date: 'Yesterday, 6:30 PM',
    },
    {
      id: '3',
      title: 'Weekend Plans',
      snippet:
        'Thinking about going hiking this weekend. Need to pack some extra water and maybe some snacks.',
      date: 'Oct 15, 2:00 PM',
    },
    {
      id: '4',
      title: 'New Ideas',
      snippet:
        'Just had a great idea for a new project. I should start sketching it out before I forget the details.',
      date: 'Oct 14, 10:15 AM',
    },
  ];

  const renderItem = ({ item }: { item: (typeof entries)[0] }) => (
    <Card style={styles.entryCard}>
      <View style={styles.entryHeader}>
        <Text style={styles.entryTitle}>{item.title}</Text>
        <Text style={styles.entryDate}>{item.date}</Text>
      </View>
      <Text style={styles.entrySnippet} numberOfLines={3}>
        {item.snippet}
      </Text>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft color="#007AFF" size={28} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Entries</Text>
        <View style={{ width: 70 }} />
      </View>

      <FlatList
        data={entries}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
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
  listContainer: {
    padding: 24,
  },
  entryCard: {
    marginBottom: 16,
    padding: 20,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  entryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    flex: 1,
    marginRight: 8,
  },
  entryDate: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  entrySnippet: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
});
