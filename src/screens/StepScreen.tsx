import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import Theme from '../theme';
import Card from '../components/Card';
import CustomChart from '../components/CustomChart';
import RingProgress from '../components/RingProgress';
import { StepLog } from '../types';
import { Activity, RefreshCw, Plus, Calendar } from 'lucide-react-native';

interface StepScreenProps {
  stepLogs: StepLog[];
  onAddStepLog: (steps: number) => void;
  onSyncStepLogs: (steps: number) => void;
  stepGoal: number;
}

export const StepScreen: React.FC<StepScreenProps> = ({
  stepLogs,
  onAddStepLog,
  onSyncStepLogs,
  stepGoal,
}) => {
  const [stepsInput, setStepsInput] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayLogs = stepLogs.filter((log) => log.timestamp.startsWith(todayStr));
  const todayTotal = todayLogs.reduce((sum, log) => sum + log.steps, 0);

  const handleAddSteps = () => {
    if (!stepsInput) return;
    const steps = parseInt(stepsInput);
    if (isNaN(steps) || steps <= 0 || steps > 100000) {
      Alert.alert('Invalid Steps', 'Please enter a realistic step count.');
      return;
    }
    onAddStepLog(steps);
    setStepsInput('');
  };

  const handleSyncWearable = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      // Generate a random step sync count (e.g. 3500 steps)
      const syncedSteps = Math.floor(Math.random() * 4000) + 2000;
      onSyncStepLogs(syncedSteps);
      Alert.alert(
        'Mi Fitness Synced',
        `Successfully synced ${syncedSteps.toLocaleString()} new steps from your wearable device!`
      );
    }, 1200);
  };

  // Generate weekly chart data
  const getWeeklyChartData = () => {
    const dataByDay: { [key: string]: number } = {};
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    // Initialize days
    last7Days.forEach((day) => {
      const dateObj = new Date(day);
      const label = dateObj.toLocaleDateString(undefined, { weekday: 'short' });
      dataByDay[label] = 0;
    });

    // Populate log data
    stepLogs.forEach((log) => {
      const dayStr = log.timestamp.split('T')[0];
      if (last7Days.includes(dayStr)) {
        const dateObj = new Date(log.timestamp);
        const label = dateObj.toLocaleDateString(undefined, { weekday: 'short' });
        dataByDay[label] = (dataByDay[label] || 0) + log.steps;
      }
    });

    return Object.keys(dataByDay).map((key) => ({
      label: key,
      value: dataByDay[key],
    }));
  };

  const weeklyChartData = getWeeklyChartData();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* Overview ring header */}
      <Card accentColor={Theme.colors.steps}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Activity Tracker</Text>
            <Text style={styles.headerSub}>Monitor daily steps & movement</Text>
          </View>
          <View style={styles.iconContainer}>
            <Activity color={Theme.colors.steps} size={28} />
          </View>
        </View>

        <View style={styles.ringPanel}>
          <RingProgress
            progress={todayTotal / stepGoal}
            color={Theme.colors.steps}
            size={130}
            strokeWidth={12}
          >
            <Text style={styles.ringTotalText}>{todayTotal.toLocaleString()}</Text>
            <Text style={styles.ringGoalText}>Goal: {stepGoal.toLocaleString()}</Text>
          </RingProgress>
        </View>
      </Card>

      {/* Sync wear device simulation */}
      <Card title="Wearable Sync" subtitle="Synchronize steps with Mi Fitness & Wear OS">
        <TouchableOpacity style={styles.syncBtn} onPress={handleSyncWearable} disabled={isSyncing}>
          {isSyncing ? (
            <ActivityIndicator size="small" color={Theme.colors.text} />
          ) : (
            <RefreshCw size={18} color={Theme.colors.text} />
          )}
          <Text style={styles.syncBtnText}>{isSyncing ? 'Syncing...' : 'Sync Mi Fitness Data'}</Text>
        </TouchableOpacity>
      </Card>

      {/* Weekly Stats Bar Chart */}
      <Card title="Weekly Statistics" subtitle="Daily step records for the last 7 days">
        <CustomChart type="bar" data={weeklyChartData} color={Theme.colors.steps} />
      </Card>

      {/* Manual Steps Entry */}
      <Card title="Log Steps Manually" subtitle="Add step increments directly">
        <View style={styles.inputRow}>
          <TextInput
            placeholder="e.g. 5000"
            placeholderTextColor={Theme.colors.textMuted}
            style={styles.input}
            keyboardType="numeric"
            value={stepsInput}
            onChangeText={(txt) => setStepsInput(txt.replace(/[^0-9]/g, ''))}
          />
          <TouchableOpacity style={styles.logBtn} onPress={handleAddSteps}>
            <Plus size={20} color={Theme.colors.text} />
            <Text style={styles.logBtnText}>Log Steps</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Step logs history */}
      <Card title="Steps Log History" subtitle="Today's step record details">
        {todayLogs.length > 0 ? (
          todayLogs.map((log) => {
            const date = new Date(log.timestamp);
            const timeStr = date.toLocaleTimeString(undefined, {
              hour: '2-digit',
              minute: '2-digit',
            });
            return (
              <View key={log.id} style={styles.historyRow}>
                <View style={styles.historyLeft}>
                  <Calendar color={Theme.colors.textSecondary} size={16} />
                  <Text style={styles.historyTime}>{timeStr}</Text>
                </View>
                <Text style={styles.historySteps}>+{log.steps.toLocaleString()} steps</Text>
              </View>
            );
          })
        ) : (
          <Text style={styles.emptyLogsText}>No steps logged for today. Go active and record your walking!</Text>
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
  headerRow: {
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
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    width: 44,
    height: 44,
    borderRadius: Theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.2)',
  },
  ringPanel: {
    alignItems: 'center',
    paddingVertical: Theme.spacing.sm,
  },
  ringTotalText: {
    color: Theme.colors.text,
    fontSize: Theme.typography.sizes.xl,
    fontWeight: Theme.typography.weights.bold,
  },
  ringGoalText: {
    color: Theme.colors.textSecondary,
    fontSize: Theme.typography.sizes.xs,
    marginTop: 2,
  },
  syncBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: Theme.colors.border,
    borderWidth: 1,
    flexDirection: 'row',
    height: 44,
    borderRadius: Theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  syncBtnText: {
    color: Theme.colors.text,
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.bold,
    marginLeft: Theme.spacing.sm,
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
    backgroundColor: Theme.colors.steps,
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
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyTime: {
    color: Theme.colors.text,
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.semibold,
    marginLeft: Theme.spacing.md,
  },
  historySteps: {
    color: Theme.colors.steps,
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.bold,
  },
  emptyLogsText: {
    color: Theme.colors.textSecondary,
    fontSize: Theme.typography.sizes.sm,
    textAlign: 'center',
    paddingVertical: Theme.spacing.md,
  },
});

export default StepScreen;
