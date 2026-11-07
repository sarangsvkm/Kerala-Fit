import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import Theme from '../theme';
import Card from '../components/Card';
import { SleepLog } from '../types';
import { Moon, RefreshCw, Trash2, Calendar, ShieldAlert } from 'lucide-react-native';

interface SleepScreenProps {
  sleepLogs: SleepLog[];
  onAddSleepLog: (log: Omit<SleepLog, 'id' | 'timestamp'>) => void;
  onDeleteSleepLog: (id: string) => void;
  onSyncSleepLogs: (mockLogs: Omit<SleepLog, 'id' | 'timestamp'>[]) => void;
}

export const SleepScreen: React.FC<SleepScreenProps> = ({
  sleepLogs,
  onAddSleepLog,
  onDeleteSleepLog,
  onSyncSleepLogs,
}) => {
  const [duration, setDuration] = useState('');
  const [deepSleep, setDeepSleep] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  // Live sleep score preview calculation
  const getSleepScore = (durStr: string, deepStr: string) => {
    const dur = parseFloat(durStr);
    const deep = parseFloat(deepStr);
    if (isNaN(dur) || isNaN(deep) || dur <= 0 || deep < 0 || deep > 100) return 0;
    
    // Duration score (out of 50): 7-9 hours is optimal (50 pts), 6-7 or 9-10 is okay (35 pts), others (15-20 pts)
    let durScore = 20;
    if (dur >= 7 && dur <= 9) durScore = 50;
    else if (dur >= 6 && dur <= 10) durScore = 35;
    
    // Deep sleep score (out of 50): 20-30% is optimal (50 pts), 15-20% or 30-35% is okay (35 pts), others (20 pts)
    let deepScore = 20;
    if (deep >= 20 && deep && deep <= 30) deepScore = 50;
    else if (deep >= 15 && deep <= 35) deepScore = 35;

    return durScore + deepScore;
  };

  const currentScore = getSleepScore(duration, deepSleep);

  const handleAddSleep = () => {
    const dur = parseFloat(duration);
    const deep = parseFloat(deepSleep);
    if (isNaN(dur) || dur <= 0 || dur > 24) {
      Alert.alert('Invalid Duration', 'Please enter a valid sleep duration between 0.1 and 24 hours.');
      return;
    }
    if (isNaN(deep) || deep < 0 || deep > 100) {
      Alert.alert('Invalid Deep Sleep', 'Deep sleep must be a percentage between 0% and 100%.');
      return;
    }
    
    const score = getSleepScore(duration, deepSleep);
    
    onAddSleepLog({
      duration: dur,
      deepSleep: deep,
      score,
    });

    setDuration('');
    setDeepSleep('');
  };

  // Sync health connect simulation
  const handleSyncHealthConnect = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      // Create some mock entries
      const mockEntries: Omit<SleepLog, 'id' | 'timestamp'>[] = [
        { duration: 7.5, deepSleep: 24, score: 90 },
        { duration: 6.8, deepSleep: 18, score: 70 },
        { duration: 8.2, deepSleep: 28, score: 95 },
      ];
      onSyncSleepLogs(mockEntries);
      Alert.alert(
        'Sync Complete',
        'Successfully fetched and synchronized the last 3 days of sleep logs from Health Connect!'
      );
    }, 1500);
  };

  const latestLog = sleepLogs.length > 0 ? sleepLogs[0] : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* Overview header */}
      <Card accentColor={Theme.colors.sleep}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Sleep Analysis</Text>
            <Text style={styles.headerSub}>Monitor rest and deep sleep cycles</Text>
          </View>
          <View style={styles.iconContainer}>
            <Moon color={Theme.colors.sleep} size={28} />
          </View>
        </View>

        {latestLog ? (
          <View style={styles.metricsContainer}>
            <View style={styles.scoreGauge}>
              <Text style={styles.gaugeVal}>{latestLog.score}</Text>
              <Text style={styles.gaugeLabel}>Today's Score</Text>
            </View>
            <View style={styles.metricGrid}>
              <View style={styles.metricBox}>
                <Text style={styles.metricValText}>{latestLog.duration} hrs</Text>
                <Text style={styles.metricLabelText}>Sleep Time</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricBox}>
                <Text style={styles.metricValText}>{latestLog.deepSleep}%</Text>
                <Text style={styles.metricLabelText}>Deep Sleep</Text>
              </View>
            </View>
          </View>
        ) : (
          <Text style={styles.emptyHeaderText}>No sleep logs today. Record your sleep manually or sync with your wearable device below.</Text>
        )}
      </Card>

      {/* Sync wear device simulation */}
      <Card title="Health Connect Integration" subtitle="Auto sync metrics from Mi Fitness, Fitbit, etc.">
        <TouchableOpacity style={styles.syncBtn} onPress={handleSyncHealthConnect} disabled={isSyncing}>
          {isSyncing ? (
            <ActivityIndicator size="small" color={Theme.colors.text} />
          ) : (
            <RefreshCw size={18} color={Theme.colors.text} />
          )}
          <Text style={styles.syncBtnText}>{isSyncing ? 'Syncing...' : 'Sync Device Data'}</Text>
        </TouchableOpacity>
        <View style={styles.infoBox}>
          <ShieldAlert size={14} color={Theme.colors.textSecondary} />
          <Text style={styles.infoText}>Data is encrypted and synced locally using Android Health Connect APIs.</Text>
        </View>
      </Card>

      {/* Log sleep manually */}
      <Card title="Log Sleep Manually" subtitle="Log hours of rest and sleep quality">
        <View style={styles.form}>
          <View style={styles.formRow}>
            <View style={styles.inputCol}>
              <Text style={styles.inputLabel}>Sleep Duration (hrs)</Text>
              <TextInput
                placeholder="e.g. 7.5"
                placeholderTextColor={Theme.colors.textMuted}
                style={styles.input}
                keyboardType="numeric"
                value={duration}
                onChangeText={(txt) => setDuration(txt.replace(/[^0-9.]/g, ''))}
              />
            </View>
            <View style={styles.inputCol}>
              <Text style={styles.inputLabel}>Deep Sleep (%)</Text>
              <TextInput
                placeholder="e.g. 25"
                placeholderTextColor={Theme.colors.textMuted}
                style={styles.input}
                keyboardType="numeric"
                value={deepSleep}
                onChangeText={(txt) => setDeepSleep(txt.replace(/[^0-9]/g, ''))}
              />
            </View>
          </View>

          {currentScore > 0 && (
            <View style={styles.scorePreviewBox}>
              <Text style={styles.previewLabel}>Estimated Sleep Score:</Text>
              <Text style={[styles.previewValue, { color: Theme.colors.sleep }]}>{currentScore} / 100</Text>
            </View>
          )}

          <TouchableOpacity style={styles.logBtn} onPress={handleAddSleep}>
            <Moon size={18} color={Theme.colors.text} />
            <Text style={styles.logBtnText}>Log Sleep</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Sleep History */}
      <Card title="Sleep Log History" subtitle="Historical sleep records">
        {sleepLogs.length > 0 ? (
          sleepLogs.map((log) => {
            const date = new Date(log.timestamp);
            const dateStr = date.toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
            return (
              <View key={log.id} style={styles.historyRow}>
                <View style={styles.historyLeft}>
                  <Calendar color={Theme.colors.textSecondary} size={16} />
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyDate}>{dateStr}</Text>
                    <Text style={styles.historyStats}>
                      {log.duration} hrs • {log.deepSleep}% deep
                    </Text>
                  </View>
                </View>
                <View style={styles.historyRight}>
                  <View style={styles.scoreBadge}>
                    <Text style={styles.scoreBadgeText}>{log.score}</Text>
                  </View>
                  <TouchableOpacity onPress={() => onDeleteSleepLog(log.id)} style={styles.deleteBtn}>
                    <Trash2 size={16} color={Theme.colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        ) : (
          <Text style={styles.emptyLogsText}>No sleep records. Log a session to build your sleep history.</Text>
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
    marginBottom: Theme.spacing.md,
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
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    width: 44,
    height: 44,
    borderRadius: Theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  metricsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: Theme.spacing.sm,
  },
  scoreGauge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: Theme.colors.sleep,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
  },
  gaugeVal: {
    color: Theme.colors.text,
    fontSize: Theme.typography.sizes.xl,
    fontWeight: Theme.typography.weights.bold,
  },
  gaugeLabel: {
    color: Theme.colors.textSecondary,
    fontSize: 8,
    textTransform: 'uppercase',
    marginTop: 1,
  },
  metricGrid: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  metricBox: {
    alignItems: 'center',
  },
  metricValText: {
    color: Theme.colors.text,
    fontSize: Theme.typography.sizes.md,
    fontWeight: Theme.typography.weights.bold,
  },
  metricLabelText: {
    color: Theme.colors.textSecondary,
    fontSize: Theme.typography.sizes.xs,
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 30,
    backgroundColor: Theme.colors.border,
  },
  emptyHeaderText: {
    color: Theme.colors.textSecondary,
    fontSize: Theme.typography.sizes.sm,
    lineHeight: 20,
    textAlign: 'center',
    paddingVertical: Theme.spacing.sm,
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
    marginBottom: Theme.spacing.md,
  },
  syncBtnText: {
    color: Theme.colors.text,
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.bold,
    marginLeft: Theme.spacing.sm,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.01)',
    padding: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  infoText: {
    color: Theme.colors.textSecondary,
    fontSize: 10,
    marginLeft: Theme.spacing.sm,
    flex: 1,
  },
  form: {
    marginTop: Theme.spacing.xs,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.md,
  },
  inputCol: {
    flex: 1,
    marginHorizontal: 4,
  },
  inputLabel: {
    color: Theme.colors.textSecondary,
    fontSize: Theme.typography.sizes.xs,
    fontWeight: Theme.typography.weights.semibold,
    marginBottom: Theme.spacing.sm,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderColor: Theme.colors.border,
    borderWidth: 1,
    borderRadius: Theme.borderRadius.md,
    color: Theme.colors.text,
    height: 42,
    paddingHorizontal: Theme.spacing.md,
    fontSize: Theme.typography.sizes.sm,
  },
  scorePreviewBox: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.1)',
  },
  previewLabel: {
    color: Theme.colors.textSecondary,
    fontSize: Theme.typography.sizes.sm,
    marginRight: Theme.spacing.sm,
  },
  previewValue: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.bold,
  },
  logBtn: {
    backgroundColor: Theme.colors.sleep,
    flexDirection: 'row',
    height: 44,
    borderRadius: Theme.borderRadius.md,
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
  historyInfo: {
    marginLeft: Theme.spacing.md,
  },
  historyDate: {
    color: Theme.colors.text,
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.semibold,
  },
  historyStats: {
    color: Theme.colors.textSecondary,
    fontSize: Theme.typography.sizes.xs,
    marginTop: 2,
  },
  historyRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    width: 32,
    height: 32,
    borderRadius: Theme.borderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
    marginRight: Theme.spacing.md,
  },
  scoreBadgeText: {
    color: Theme.colors.sleep,
    fontSize: Theme.typography.sizes.xs,
    fontWeight: Theme.typography.weights.bold,
  },
  deleteBtn: {
    padding: Theme.spacing.sm,
  },
  emptyLogsText: {
    color: Theme.colors.textSecondary,
    fontSize: Theme.typography.sizes.sm,
    textAlign: 'center',
    paddingVertical: Theme.spacing.md,
  },
});

export default SleepScreen;
