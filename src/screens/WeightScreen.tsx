import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import Theme from '../theme';
import Card from '../components/Card';
import CustomChart from '../components/CustomChart';
import { WeightLog } from '../types';
import { Scale, Plus, Trash2, TrendingDown } from 'lucide-react-native';

interface WeightScreenProps {
  weightLogs: WeightLog[];
  onAddWeightLog: (weight: number) => void;
  onDeleteWeightLog: (id: string) => void;
  targetWeight: number;
}

export const WeightScreen: React.FC<WeightScreenProps> = ({
  weightLogs,
  onAddWeightLog,
  onDeleteWeightLog,
  targetWeight,
}) => {
  const [weightInput, setWeightInput] = useState('');

  // Handle logging weight
  const handleAddWeight = () => {
    if (!weightInput) return;
    const wt = parseFloat(weightInput);
    if (isNaN(wt) || wt <= 0 || wt > 300) {
      Alert.alert('Invalid Weight', 'Please enter a realistic weight value.');
      return;
    }
    onAddWeightLog(wt);
    setWeightInput('');
  };

  const latestWeight = weightLogs.length > 0 ? weightLogs[0].weight : targetWeight;
  const initialWeight = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weight : targetWeight;
  const weightDiff = latestWeight - initialWeight;
  const isLoss = weightDiff < 0;

  // Prepare chart data (reverse logs to show chronological order)
  const chartData = [...weightLogs]
    .reverse()
    .slice(-7) // Show last 7 entries
    .map((log) => {
      const date = new Date(log.timestamp);
      const day = date.toLocaleDateString(undefined, { weekday: 'short' });
      return {
        label: day,
        value: log.weight,
      };
    });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* Overview Card */}
      <Card accentColor={Theme.colors.weight}>
        <View style={styles.overviewRow}>
          <View>
            <Text style={styles.headerTitle}>Weight Tracker</Text>
            <Text style={styles.headerSub}>Monitor weight and BMI changes</Text>
          </View>
          <View style={styles.iconContainer}>
            <Scale color={Theme.colors.weight} size={28} />
          </View>
        </View>

        <View style={styles.metricGrid}>
          <View style={styles.metricBox}>
            <Text style={styles.metricValue}>{latestWeight.toFixed(1)} kg</Text>
            <Text style={styles.metricLabel}>Current Weight</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricBox}>
            <Text style={styles.metricValue}>{targetWeight.toFixed(1)} kg</Text>
            <Text style={styles.metricLabel}>Target Goal</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricBox}>
            <Text style={[styles.metricValue, { color: isLoss ? Theme.colors.success : Theme.colors.danger }]}>
              {isLoss ? '' : '+'}{weightDiff.toFixed(1)} kg
            </Text>
            <Text style={styles.metricLabel}>Total Progress</Text>
          </View>
        </View>
      </Card>

      {/* Interactive Trend Chart */}
      <Card title="Weight Progress Graph" subtitle="Weight trend over the last 7 logs">
        {chartData.length > 0 ? (
          <CustomChart type="line" data={chartData} color={Theme.colors.weight} suffix=" kg" />
        ) : (
          <Text style={styles.emptyLogsText}>Log your weight multiple times to see the trend graph.</Text>
        )}
      </Card>

      {/* Input log card */}
      <Card title="Log Today's Weight" subtitle="Record current weight in kilograms">
        <View style={styles.inputRow}>
          <TextInput
            placeholder="e.g. 74.5"
            placeholderTextColor={Theme.colors.textMuted}
            style={styles.input}
            keyboardType="numeric"
            value={weightInput}
            onChangeText={(txt) => setWeightInput(txt.replace(/[^0-9.]/g, ''))}
          />
          <TouchableOpacity style={styles.logBtn} onPress={handleAddWeight}>
            <Plus size={20} color={Theme.colors.text} />
            <Text style={styles.logBtnText}>Log Weight</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Weight Log History */}
      <Card title="Weight Log History" subtitle="List of all recorded logs">
        {weightLogs.length > 0 ? (
          weightLogs.map((log) => {
            const date = new Date(log.timestamp);
            const formattedDate = date.toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });
            const formattedTime = date.toLocaleTimeString(undefined, {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <View key={log.id} style={styles.historyRow}>
                <View>
                  <Text style={styles.historyDate}>{formattedDate}</Text>
                  <Text style={styles.historyTime}>{formattedTime}</Text>
                </View>
                <View style={styles.historyRight}>
                  <Text style={styles.historyWeight}>{log.weight.toFixed(1)} kg</Text>
                  <TouchableOpacity onPress={() => onDeleteWeightLog(log.id)} style={styles.deleteBtn}>
                    <Trash2 size={16} color={Theme.colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        ) : (
          <Text style={styles.emptyLogsText}>No weight logs recorded yet.</Text>
        )}
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  contentContainer: {
    padding: Theme.spacing.lg,
    paddingBottom: Theme.spacing.huge * 2,
  },
  overviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  headerTitle: {
    color: Theme.colors.text,
    fontSize: Theme.typography.sizes.lg,
    fontWeight: Theme.typography.weights.bold,
  },
  headerSub: {
    color: Theme.colors.textSecondary,
    fontSize: Theme.typography.sizes.xs,
    marginTop: 2,
  },
  iconContainer: {
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
    width: 44,
    height: 44,
    borderRadius: Theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.2)',
  },
  metricGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Theme.spacing.xs,
  },
  metricBox: {
    flex: 1,
    alignItems: 'center',
  },
  metricValue: {
    color: Theme.colors.text,
    fontSize: Theme.typography.sizes.md,
    fontWeight: Theme.typography.weights.bold,
  },
  metricLabel: {
    color: Theme.colors.textSecondary,
    fontSize: Theme.typography.sizes.xs,
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 35,
    backgroundColor: Theme.colors.border,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.md,
    color: Theme.colors.text,
    height: 44,
    paddingHorizontal: Theme.spacing.md,
    fontSize: Theme.typography.sizes.sm,
    marginRight: Theme.spacing.sm,
  },
  logBtn: {
    backgroundColor: Theme.colors.weight,
    flexDirection: 'row',
    height: 44,
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: Theme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logBtnText: {
    color: Theme.colors.text,
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.bold,
    marginLeft: Theme.spacing.xs,
  },
  emptyLogsText: {
    color: Theme.colors.textSecondary,
    fontSize: Theme.typography.sizes.sm,
    textAlign: 'center',
    paddingVertical: Theme.spacing.lg,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  historyDate: {
    color: Theme.colors.text,
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.semibold,
  },
  historyTime: {
    color: Theme.colors.textSecondary,
    fontSize: Theme.typography.sizes.xs,
    marginTop: 2,
  },
  historyRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyWeight: {
    color: Theme.colors.text,
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.bold,
    marginRight: Theme.spacing.md,
  },
  deleteBtn: {
    padding: Theme.spacing.sm,
  },
});

export default WeightScreen;
