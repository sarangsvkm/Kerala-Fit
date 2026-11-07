import React from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import Theme from '../theme';
import Card from '../components/Card';
import RingProgress from '../components/RingProgress';
import { UserProfile, FoodLog, WeightLog, WaterLog, SleepLog, StepLog } from '../types';
import { Activity, Flame, Droplet, Moon, Scale, TrendingUp } from 'lucide-react-native';

interface DashboardScreenProps {
  user: UserProfile;
  foodLogs: FoodLog[];
  weightLogs: WeightLog[];
  waterLogs: WaterLog[];
  sleepLogs: SleepLog[];
  stepLogs: StepLog[];
  onNavigate: (screen: string) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  user,
  foodLogs,
  weightLogs,
  waterLogs,
  sleepLogs,
  stepLogs,
  onNavigate,
}) => {
  // Calculations
  const todayStr = new Date().toISOString().split('T')[0];
  
  const todayCalories = foodLogs
    .filter(log => log.timestamp.startsWith(todayStr))
    .reduce((sum, log) => sum + log.calories, 0);

  const todayWater = waterLogs
    .filter(log => log.timestamp.startsWith(todayStr))
    .reduce((sum, log) => sum + log.amount, 0);

  const todaySteps = stepLogs
    .filter(log => log.timestamp.startsWith(todayStr))
    .reduce((sum, log) => sum + log.steps, 0);

  const latestWeight = weightLogs.length > 0 
    ? weightLogs[0].weight 
    : user.weightGoal; // Fallback or current weight
    
  // BMI calculation (assume height is 1.75m for Sarang)
  const heightM = 1.75;
  const bmi = latestWeight / (heightM * heightM);
  let bmiCategory = 'Normal';
  let bmiColor = Theme.colors.success;
  if (bmi < 18.5) {
    bmiCategory = 'Underweight';
    bmiColor = Theme.colors.warning;
  } else if (bmi >= 25 && bmi < 30) {
    bmiCategory = 'Overweight';
    bmiColor = Theme.colors.warning;
  } else if (bmi >= 30) {
    bmiCategory = 'Obese';
    bmiColor = Theme.colors.danger;
  }

  const latestSleep = sleepLogs.length > 0 ? sleepLogs[0] : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* Header Profile Section */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hi, {user.name} 👋</Text>
          <Text style={styles.subtitle}>Track your daily fitness & diet</Text>
        </View>
        <TouchableOpacity style={styles.profileBadge} onPress={() => onNavigate('Reports')}>
          <TrendingUp color={Theme.colors.primary} size={20} />
          <Text style={styles.profileBadgeText}>Reports</Text>
        </TouchableOpacity>
      </View>

      {/* Main Rings Section */}
      <View style={styles.ringsContainer}>
        {/* Calories Ring */}
        <TouchableOpacity style={styles.ringCard} onPress={() => onNavigate('Food')}>
          <Card style={styles.innerRingCard}>
            <RingProgress
              progress={todayCalories / user.calorieGoal}
              color={Theme.colors.calories}
              size={110}
              strokeWidth={10}
            >
              <Flame color={Theme.colors.calories} size={24} />
            </RingProgress>
            <Text style={styles.ringLabel}>Calorie Intake</Text>
            <Text style={styles.ringValue}>
              {todayCalories} / <Text style={styles.mutedText}>{user.calorieGoal} kcal</Text>
            </Text>
          </Card>
        </TouchableOpacity>

        {/* Steps Ring */}
        <TouchableOpacity style={styles.ringCard} onPress={() => onNavigate('Steps')}>
          <Card style={styles.innerRingCard}>
            <RingProgress
              progress={todaySteps / user.stepGoal}
              color={Theme.colors.steps}
              size={110}
              strokeWidth={10}
            >
              <Activity color={Theme.colors.steps} size={24} />
            </RingProgress>
            <Text style={styles.ringLabel}>Daily Steps</Text>
            <Text style={styles.ringValue}>
              {todaySteps} / <Text style={styles.mutedText}>{user.stepGoal}</Text>
            </Text>
          </Card>
        </TouchableOpacity>
      </View>

      {/* Water Tracking Card */}
      <TouchableOpacity onPress={() => onNavigate('Water')}>
        <Card title="Water Intake" subtitle="Stay hydrated throughout the day" headerRight={<Droplet color={Theme.colors.water} size={22} />} accentColor={Theme.colors.water}>
          <View style={styles.waterProgressContainer}>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${Math.min(100, (todayWater / user.waterGoal) * 100)}%` }]} />
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricText}>{todayWater} ml logged</Text>
              <Text style={styles.metricGoalText}>Goal: {user.waterGoal} ml</Text>
            </View>
          </View>
        </Card>
      </TouchableOpacity>

      {/* Sleep Quality Card */}
      <TouchableOpacity onPress={() => onNavigate('Sleep')}>
        <Card title="Sleep Status" subtitle="Data synced from Health Connect" headerRight={<Moon color={Theme.colors.sleep} size={22} />} accentColor={Theme.colors.sleep}>
          {latestSleep ? (
            <View style={styles.sleepRow}>
              <View style={styles.sleepMetric}>
                <Text style={styles.sleepValueText}>{latestSleep.duration} hrs</Text>
                <Text style={styles.sleepSubtext}>Duration</Text>
              </View>
              <View style={styles.sleepDivider} />
              <View style={styles.sleepMetric}>
                <Text style={styles.sleepValueText}>{latestSleep.deepSleep}%</Text>
                <Text style={styles.sleepSubtext}>Deep Sleep</Text>
              </View>
              <View style={styles.sleepDivider} />
              <View style={styles.sleepMetric}>
                <Text style={[styles.sleepValueText, { color: Theme.colors.sleep }]}>{latestSleep.score}</Text>
                <Text style={styles.sleepSubtext}>Sleep Score</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.emptyCardText}>No sleep logs recorded for today. Tap to add.</Text>
          )}
        </Card>
      </TouchableOpacity>

      {/* Weight & BMI Card */}
      <TouchableOpacity onPress={() => onNavigate('Weight')}>
        <Card title="Weight & BMI" subtitle="Track your fitness progress" headerRight={<Scale color={Theme.colors.weight} size={22} />} accentColor={Theme.colors.weight}>
          <View style={styles.weightRow}>
            <View style={styles.weightColumn}>
              <Text style={styles.weightMainText}>{latestWeight.toFixed(1)} kg</Text>
              <Text style={styles.weightSubtext}>Current Weight</Text>
            </View>
            <View style={styles.sleepDivider} />
            <View style={styles.weightColumn}>
              <Text style={styles.weightMainText}>{bmi.toFixed(1)}</Text>
              <Text style={styles.weightSubtext}>BMI Status</Text>
            </View>
            <View style={styles.sleepDivider} />
            <View style={styles.weightColumn}>
              <View style={[styles.bmiBadge, { backgroundColor: bmiColor }]}>
                <Text style={styles.bmiBadgeText}>{bmiCategory}</Text>
              </View>
            </View>
          </View>
        </Card>
      </TouchableOpacity>

      {/* Quick Coach Insight */}
      <TouchableOpacity onPress={() => onNavigate('Coach')}>
        <Card title="AI Coach Tip" subtitle="Personalized suggestion" accentColor={Theme.colors.coach}>
          <Text style={styles.coachText}>
            {todayCalories > user.calorieGoal * 0.8
              ? "You are close to your calorie limit today. Choose lighter options like Dosa or Kadala curry instead of Mandi or Beef Biryani for your next meal."
              : "Great job maintaining your logs! Staying active helps burn calories. Take a 20-minute walking workout if you plan to eat out tonight."}
          </Text>
          <Text style={styles.coachLink}>Ask Coach for more advice →</Text>
        </Card>
      </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
    marginTop: Theme.spacing.sm,
  },
  greeting: {
    color: Theme.colors.text,
    fontSize: Theme.typography.sizes.xl,
    fontWeight: Theme.typography.weights.bold,
  },
  subtitle: {
    color: Theme.colors.textSecondary,
    fontSize: Theme.typography.sizes.sm,
    marginTop: 2,
  },
  profileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingVertical: Theme.spacing.xs,
    paddingHorizontal: Theme.spacing.md,
    borderRadius: Theme.borderRadius.round,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  profileBadgeText: {
    color: Theme.colors.primary,
    fontSize: Theme.typography.sizes.xs,
    fontWeight: Theme.typography.weights.semibold,
    marginLeft: Theme.spacing.xs,
  },
  ringsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.md,
  },
  ringCard: {
    width: '48%',
  },
  innerRingCard: {
    alignItems: 'center',
    padding: Theme.spacing.md,
    marginBottom: 0,
  },
  ringLabel: {
    color: Theme.colors.textSecondary,
    fontSize: Theme.typography.sizes.xs,
    fontWeight: Theme.typography.weights.medium,
    marginTop: Theme.spacing.md,
  },
  ringValue: {
    color: Theme.colors.text,
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.bold,
    marginTop: 2,
  },
  mutedText: {
    color: Theme.colors.textMuted,
  },
  waterProgressContainer: {
    marginTop: Theme.spacing.xs,
  },
  progressBarBg: {
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: Theme.borderRadius.sm,
    overflow: 'hidden',
    marginBottom: Theme.spacing.sm,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Theme.colors.water,
    borderRadius: Theme.borderRadius.sm,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricText: {
    color: Theme.colors.text,
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.semibold,
  },
  metricGoalText: {
    color: Theme.colors.textSecondary,
    fontSize: Theme.typography.sizes.xs,
  },
  sleepRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Theme.spacing.xs,
  },
  sleepMetric: {
    flex: 1,
    alignItems: 'center',
  },
  sleepValueText: {
    color: Theme.colors.text,
    fontSize: Theme.typography.sizes.md,
    fontWeight: Theme.typography.weights.bold,
  },
  sleepSubtext: {
    color: Theme.colors.textSecondary,
    fontSize: Theme.typography.sizes.xs,
    marginTop: 2,
  },
  sleepDivider: {
    width: 1,
    height: 30,
    backgroundColor: Theme.colors.border,
  },
  weightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weightColumn: {
    flex: 1,
    alignItems: 'center',
  },
  weightMainText: {
    color: Theme.colors.text,
    fontSize: Theme.typography.sizes.md,
    fontWeight: Theme.typography.weights.bold,
  },
  weightSubtext: {
    color: Theme.colors.textSecondary,
    fontSize: Theme.typography.sizes.xs,
    marginTop: 2,
  },
  bmiBadge: {
    paddingVertical: Theme.spacing.xs,
    paddingHorizontal: Theme.spacing.md,
    borderRadius: Theme.borderRadius.sm,
  },
  bmiBadgeText: {
    color: Theme.colors.background,
    fontSize: Theme.typography.sizes.xs,
    fontWeight: Theme.typography.weights.bold,
  },
  coachText: {
    color: Theme.colors.text,
    fontSize: Theme.typography.sizes.sm,
    lineHeight: 20,
  },
  coachLink: {
    color: Theme.colors.coach,
    fontSize: Theme.typography.sizes.xs,
    fontWeight: Theme.typography.weights.semibold,
    marginTop: Theme.spacing.sm,
  },
  emptyCardText: {
    color: Theme.colors.textSecondary,
    fontSize: Theme.typography.sizes.sm,
    textAlign: 'center',
    paddingVertical: Theme.spacing.sm,
  },
});

export default DashboardScreen;
