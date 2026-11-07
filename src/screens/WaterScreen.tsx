import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, TextInput, Switch, Alert } from 'react-native';
import Theme from '../theme';
import Card from '../components/Card';
import { WaterLog } from '../types';
import { Droplet, Plus, Trash2, Bell } from 'lucide-react-native';

interface WaterScreenProps {
  waterLogs: WaterLog[];
  onAddWaterLog: (amount: number) => void;
  onDeleteWaterLog: (id: string) => void;
  waterGoal: number;
}

export const WaterScreen: React.FC<WaterScreenProps> = ({
  waterLogs,
  onAddWaterLog,
  onDeleteWaterLog,
  waterGoal,
}) => {
  const [customAmount, setCustomAmount] = useState('');
  const [remindersEnabled, setRemindersEnabled] = useState(true);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayLogs = waterLogs.filter((log) => log.timestamp.startsWith(todayStr));
  const todayTotal = todayLogs.reduce((sum, log) => sum + log.amount, 0);
  const progressPercent = Math.min(100, Math.round((todayTotal / waterGoal) * 100));

  // Quick log
  const handleQuickLog = (amount: number) => {
    onAddWaterLog(amount);
  };

  // Custom log
  const handleCustomLog = () => {
    if (!customAmount) return;
    const amount = parseInt(customAmount);
    if (isNaN(amount) || amount <= 0 || amount > 5000) {
      Alert.alert('Invalid Amount', 'Please enter a water volume between 1ml and 5000ml.');
      return;
    }
    onAddWaterLog(amount);
    setCustomAmount('');
  };

  // Reminder trigger
  const handleToggleReminders = (value: boolean) => {
    setRemindersEnabled(value);
    if (value) {
      Alert.alert(
        'Reminders Enabled',
        'Kerala Fit will notify you every 2 hours to drink water and stay hydrated!'
      );
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* Overview header */}
      <Card accentColor={Theme.colors.water}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Hydration Tracker</Text>
            <Text style={styles.headerSub}>Track daily water consumption</Text>
          </View>
          <View style={styles.iconContainer}>
            <Droplet color={Theme.colors.water} size={28} />
          </View>
        </View>

        {/* Beaker / Visual Level Indicator */}
        <View style={styles.beakerContainer}>
          <View style={styles.beakerFrame}>
            <View style={[styles.beakerWater, { height: `${progressPercent}%` }]} />
            <Text style={styles.beakerPercent}>{progressPercent}%</Text>
          </View>
          <View style={styles.beakerDetails}>
            <Text style={styles.beakerLoggedText}>{todayTotal} ml</Text>
            <Text style={styles.beakerGoalText}>Goal: {waterGoal} ml</Text>
          </View>
        </View>
      </Card>

      {/* Preset log options */}
      <Card title="Quick Log" subtitle="Tap to quickly add common measurements">
        <View style={styles.quickGrid}>
          <TouchableOpacity style={styles.quickBtn} onPress={() => handleQuickLog(250)}>
            <View style={styles.quickIconBg}>
              <Droplet color={Theme.colors.water} size={18} />
            </View>
            <Text style={styles.quickAmountText}>250 ml</Text>
            <Text style={styles.quickLabelText}>Glass</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickBtn} onPress={() => handleQuickLog(500)}>
            <View style={styles.quickIconBg}>
              <Droplet color={Theme.colors.water} size={24} />
            </View>
            <Text style={styles.quickAmountText}>500 ml</Text>
            <Text style={styles.quickLabelText}>Bottle</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickBtn} onPress={() => handleQuickLog(1000)}>
            <View style={styles.quickIconBg}>
              <Droplet color={Theme.colors.water} size={30} />
            </View>
            <Text style={styles.quickAmountText}>1.0 L</Text>
            <Text style={styles.quickLabelText}>Flask</Text>
          </TouchableOpacity>
        </View>

        {/* Custom entry */}
        <Text style={styles.customSectionDivider}>Log Custom Amount</Text>
        <View style={styles.customInputRow}>
          <TextInput
            placeholder="Volume in ml (e.g. 350)"
            placeholderTextColor={Theme.colors.textMuted}
            style={styles.input}
            keyboardType="numeric"
            value={customAmount}
            onChangeText={(txt) => setCustomAmount(txt.replace(/[^0-9]/g, ''))}
          />
          <TouchableOpacity style={styles.customLogBtn} onPress={handleCustomLog}>
            <Plus size={18} color={Theme.colors.text} />
            <Text style={styles.customLogBtnText}>Add</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Hydration Reminders */}
      <Card title="Hydration Reminders" subtitle="Get notified throughout the day" headerRight={<Bell color={Theme.colors.textSecondary} size={18} />}>
        <View style={styles.remindersRow}>
          <Text style={styles.remindersLabel}>Enable hourly reminder notifications</Text>
          <Switch
            value={remindersEnabled}
            onValueChange={handleToggleReminders}
            trackColor={{ false: '#2a2b36', true: Theme.colors.water }}
            thumbColor={'#fff'}
          />
        </View>
      </Card>

      {/* Hydration logs for today */}
      <Card title="Hydration Logs Today" subtitle="Logs history for today">
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
                  <Droplet color={Theme.colors.water} size={16} />
                  <Text style={styles.historyTime}>{timeStr}</Text>
                </View>
                <View style={styles.historyRight}>
                  <Text style={styles.historyAmount}>{log.amount} ml</Text>
                  <TouchableOpacity onPress={() => onDeleteWaterLog(log.id)} style={styles.deleteBtn}>
                    <Trash2 size={16} color={Theme.colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        ) : (
          <Text style={styles.emptyLogsText}>No water logged yet for today. Stay healthy, drink water!</Text>
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
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
    width: 44,
    height: 44,
    borderRadius: Theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(14, 165, 233, 0.2)',
  },
  beakerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing.sm,
  },
  beakerFrame: {
    width: 90,
    height: 140,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 2,
    borderColor: Theme.colors.borderLight,
    borderBottomLeftRadius: Theme.borderRadius.md,
    borderBottomRightRadius: Theme.borderRadius.md,
    borderTopLeftRadius: Theme.borderRadius.sm,
    borderTopRightRadius: Theme.borderRadius.sm,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.xxl,
  },
  beakerWater: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Theme.colors.water,
    opacity: 0.85,
  },
  beakerPercent: {
    color: Theme.colors.text,
    fontSize: Theme.typography.sizes.md,
    fontWeight: Theme.typography.weights.bold,
    zIndex: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  beakerDetails: {
    justifyContent: 'center',
  },
  beakerLoggedText: {
    color: Theme.colors.text,
    fontSize: Theme.typography.sizes.xl,
    fontWeight: Theme.typography.weights.bold,
  },
  beakerGoalText: {
    color: Theme.colors.textSecondary,
    fontSize: Theme.typography.sizes.sm,
    marginTop: Theme.spacing.xs,
  },
  quickGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.lg,
  },
  quickBtn: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.md,
    paddingVertical: Theme.spacing.md,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  quickIconBg: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  quickAmountText: {
    color: Theme.colors.text,
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.bold,
  },
  quickLabelText: {
    color: Theme.colors.textSecondary,
    fontSize: 10,
    marginTop: 2,
  },
  customSectionDivider: {
    color: Theme.colors.textSecondary,
    fontSize: Theme.typography.sizes.xs,
    fontWeight: Theme.typography.weights.semibold,
    marginVertical: Theme.spacing.sm,
    alignSelf: 'center',
  },
  customInputRow: {
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
    height: 42,
    paddingHorizontal: Theme.spacing.md,
    fontSize: Theme.typography.sizes.sm,
    marginRight: Theme.spacing.sm,
  },
  customLogBtn: {
    backgroundColor: Theme.colors.water,
    flexDirection: 'row',
    height: 42,
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: Theme.spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customLogBtnText: {
    color: Theme.colors.text,
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.bold,
    marginLeft: Theme.spacing.xs,
  },
  remindersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Theme.spacing.xs,
  },
  remindersLabel: {
    color: Theme.colors.text,
    fontSize: Theme.typography.sizes.sm,
    flex: 1,
    marginRight: Theme.spacing.md,
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
  historyRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyAmount: {
    color: Theme.colors.textSecondary,
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.bold,
    marginRight: Theme.spacing.md,
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

export default WaterScreen;
