import { View, Text, StyleSheet } from 'react-native';

const progressItems = [
  { title: 'Project setup', completed: true },
  { title: 'TypeScript Task interface', completed: true },
  { title: 'Initial task data', completed: true },
  { title: 'Home screen', completed: true },
  { title: 'Task List screen', completed: false },
  { title: 'Add Task screen', completed: false },
  { title: 'Navigation', completed: false },
  { title: 'Task state management', completed: false },
  { title: 'Add task functionality', completed: false },
  { title: 'Complete task functionality', completed: false },
  { title: 'Delete task functionality', completed: false },
  { title: 'Input validation', completed: false },
  { title: 'Final testing', completed: false },
];

export default function DevelopmentProgress() {
  const completedCount = progressItems.filter(
    (item) => item.completed
  ).length;

  const progress =
    (completedCount / progressItems.length) * 100;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Development Progress
      </Text>

      <Text style={styles.percentage}>
        {Math.round(progress)}%
      </Text>

      <View style={styles.progressBackground}>
        <View
          style={[
            styles.progressFill,
            { width: `${progress}%` },
          ]}
        />
      </View>

      <Text style={styles.count}>
        {completedCount} of {progressItems.length} completed
      </Text>

      <View style={styles.list}>
        {progressItems.map((item) => (
          <View
            key={item.title}
            style={styles.item}
          >
            <Text style={styles.check}>
              {item.completed ? '✓' : '○'}
            </Text>

            <Text
              style={[
                styles.itemText,
                item.completed && styles.completedText,
              ]}
            >
              {item.title}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 24,
  },

  title: {
    fontSize: 18,
    fontWeight: '700',
  },

  percentage: {
    fontSize: 32,
    fontWeight: '700',
    marginTop: 12,
  },

  progressBackground: {
    height: 8,
    backgroundColor: '#E5E5E5',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 10,
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#222222',
    borderRadius: 10,
  },

  count: {
    fontSize: 13,
    color: '#777777',
    marginTop: 8,
  },

  list: {
    marginTop: 18,
  },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  check: {
    width: 25,
    fontSize: 18,
  },

  itemText: {
    fontSize: 14,
  },

  completedText: {
    color: '#777777',
  },
});