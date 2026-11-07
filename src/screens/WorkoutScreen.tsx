import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Alert, Modal } from 'react-native';
import Theme from '../theme';
import Card from '../components/Card';
import { Play, Pause, RotateCcw, CheckCircle2, Dumbbell, Award, ArrowRight } from 'lucide-react-native';

interface WorkoutScreenProps {
  onCompleteWorkout: (planName: string) => void;
  completedWorkouts: { id: string; planName: string; timestamp: string }[];
}

// Workout Plans DB
const WORKOUT_PLANS = [
  {
    id: 'walking',
    name: 'Walking Plan',
    description: 'Perfect for active recovery and cardio vascular health.',
    durationMinutes: 20,
    color: '#10b981',
    exercises: [
      { name: 'Warm-up stretch', durationSeconds: 60, reps: 'Stretch body' },
      { name: 'Brisky Walk', durationSeconds: 300, reps: 'High intensity' },
      { name: 'Steady Walk', durationSeconds: 600, reps: 'Medium intensity' },
      { name: 'Cool down walk', durationSeconds: 120, reps: 'Low intensity' },
    ]
  },
  {
    id: 'yoga',
    name: 'Yoga Plan',
    description: 'Improve flexibility, balance, and mindfulness.',
    durationMinutes: 15,
    color: '#0ea5e9',
    exercises: [
      { name: 'Pranayama breathing', durationSeconds: 180, reps: 'Steady deep breaths' },
      { name: 'Surya Namaskar (Sun Salutations)', durationSeconds: 300, reps: '5 reps' },
      { name: 'Trikonasana (Triangle Pose)', durationSeconds: 120, reps: 'Hold both sides' },
      { name: 'Savasana (Corpse Pose)', durationSeconds: 300, reps: 'Complete relaxation' },
    ]
  },
  {
    id: 'weightloss',
    name: 'Weight Loss Plan',
    description: 'High intensity interval training (HIIT) to burn fat.',
    durationMinutes: 12,
    color: '#f43f5e',
    exercises: [
      { name: 'Jumping Jacks', durationSeconds: 45, reps: 'Fast pace' },
      { name: 'Bodyweight Squats', durationSeconds: 45, reps: '20 reps' },
      { name: 'Push-ups', durationSeconds: 30, reps: 'As many as possible' },
      { name: 'Mountain Climbers', durationSeconds: 45, reps: 'Fast core' },
      { name: 'Rest', durationSeconds: 30, reps: 'Catch breath' },
      { name: 'Burpees', durationSeconds: 45, reps: 'High intensity' },
    ]
  },
  {
    id: 'sixpack',
    name: 'Six Pack Plan',
    description: 'Strengthen and carve your core muscle groups.',
    durationMinutes: 10,
    color: '#a855f7',
    exercises: [
      { name: 'Abdominal Crunches', durationSeconds: 45, reps: '25 reps' },
      { name: 'Plank Hold', durationSeconds: 60, reps: 'Static hold' },
      { name: 'Russian Twists', durationSeconds: 45, reps: '40 twists' },
      { name: 'Leg Raises', durationSeconds: 45, reps: '15 reps' },
      { name: 'Flutter Kicks', durationSeconds: 45, reps: 'Continuous' },
    ]
  }
];

export const WorkoutScreen: React.FC<WorkoutScreenProps> = ({
  onCompleteWorkout,
  completedWorkouts,
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState('walking');
  const [activePlan, setActivePlan] = useState(WORKOUT_PLANS[0]);
  
  // Timer State
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const intervalRef = useRef<any>(null);

  const selectPlan = (id: string) => {
    setSelectedPlanId(id);
    const plan = WORKOUT_PLANS.find(p => p.id === id);
    if (plan) setActivePlan(plan);
  };

  // Start workout routine
  const startWorkout = () => {
    setCurrentExerciseIndex(0);
    setTimeLeft(activePlan.exercises[0].durationSeconds);
    setIsTimerActive(true);
  };

  // Timer tick effect
  useEffect(() => {
    if (isTimerActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isTimerActive && timeLeft === 0) {
      // Move to next exercise or finish
      if (currentExerciseIndex < activePlan.exercises.length - 1) {
        const nextIndex = currentExerciseIndex + 1;
        setCurrentExerciseIndex(nextIndex);
        setTimeLeft(activePlan.exercises[nextIndex].durationSeconds);
        // Play small alert/vib simulation
      } else {
        // Workout finished!
        setIsTimerActive(false);
        onCompleteWorkout(activePlan.name);
        Alert.alert(
          'Workout Completed! 🎉',
          `Congratulations! You finished the ${activePlan.name}. Keep up the great work!`
        );
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isTimerActive, timeLeft]);

  // Pause / Resume
  const togglePause = () => {
    setIsTimerActive(!isTimerActive);
  };

  // Skip
  const skipExercise = () => {
    if (currentExerciseIndex < activePlan.exercises.length - 1) {
      const nextIndex = currentExerciseIndex + 1;
      setCurrentExerciseIndex(nextIndex);
      setTimeLeft(activePlan.exercises[nextIndex].durationSeconds);
    } else {
      setIsTimerActive(false);
      onCompleteWorkout(activePlan.name);
      Alert.alert(
        'Workout Completed! 🎉',
        `Congratulations! You finished the ${activePlan.name}.`
      );
    }
  };

  // Reset/Quit Workout
  const cancelWorkout = () => {
    setIsTimerActive(false);
    setTimeLeft(0);
  };

  // Formatter helper
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const currentExercise = activePlan.exercises[currentExerciseIndex];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* Header Overview */}
      <Card accentColor={Theme.colors.workout}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Fitness Program</Text>
            <Text style={styles.headerSub}>Select routine and follow exercise timers</Text>
          </View>
          <View style={styles.iconContainer}>
            <Dumbbell color={Theme.colors.workout} size={28} />
          </View>
        </View>
      </Card>

      {/* Plan tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.plansTabs}>
        {WORKOUT_PLANS.map((plan) => (
          <TouchableOpacity
            key={plan.id}
            style={[
              styles.planTabButton,
              selectedPlanId === plan.id ? { backgroundColor: plan.color, borderColor: plan.color } : null
            ]}
            onPress={() => selectPlan(plan.id)}
          >
            <Text style={[styles.planTabText, selectedPlanId === plan.id ? { color: '#fff' } : null]}>
              {plan.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Active Plan Card Details */}
      <Card title={activePlan.name} subtitle={activePlan.description}>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>⏱ {activePlan.durationMinutes} mins total</Text>
          <Text style={styles.metaText}>🏃 {activePlan.exercises.length} exercises</Text>
        </View>

        {/* Exercises list */}
        <View style={styles.exList}>
          {activePlan.exercises.map((ex, i) => (
            <View key={i} style={styles.exRow}>
              <View style={styles.exIndexBg}>
                <Text style={styles.exIndexText}>{i + 1}</Text>
              </View>
              <View style={styles.exDetails}>
                <Text style={styles.exName}>{ex.name}</Text>
                <Text style={styles.exReps}>{ex.reps}</Text>
              </View>
              <Text style={styles.exDuration}>{formatTime(ex.durationSeconds)}</Text>
            </View>
          ))}
        </View>

        {/* Start button */}
        <TouchableOpacity style={[styles.startBtn, { backgroundColor: activePlan.color }]} onPress={startWorkout}>
          <Play size={20} color={Theme.colors.text} />
          <Text style={styles.startBtnText}>Start Workout</Text>
        </TouchableOpacity>
      </Card>

      {/* Timer Circuit Active Panel (Modal) */}
      <Modal visible={isTimerActive || timeLeft > 0} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Award color={activePlan.color} size={48} style={styles.modalIcon} />
            <Text style={styles.modalPlanTitle}>{activePlan.name}</Text>
            
            {/* Current Exercise */}
            {currentExercise && (
              <View style={styles.currentExBox}>
                <Text style={styles.currentExTitle}>Exercise {currentExerciseIndex + 1} of {activePlan.exercises.length}</Text>
                <Text style={styles.currentExName}>{currentExercise.name}</Text>
                <Text style={styles.currentExReps}>{currentExercise.reps}</Text>
              </View>
            )}

            {/* Big Countdown Timer */}
            <View style={styles.timerCircle}>
              <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
            </View>

            {/* Controls */}
            <View style={styles.modalControls}>
              <TouchableOpacity style={styles.controlBtn} onPress={cancelWorkout}>
                <RotateCcw size={24} color={Theme.colors.textSecondary} />
                <Text style={styles.controlBtnLabel}>Quit</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.controlBtnPlay, { backgroundColor: activePlan.color }]} onPress={togglePause}>
                {isTimerActive ? (
                  <Pause size={28} color={Theme.colors.text} />
                ) : (
                  <Play size={28} color={Theme.colors.text} />
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.controlBtn} onPress={skipExercise}>
                <ArrowRight size={24} color={Theme.colors.textSecondary} />
                <Text style={styles.controlBtnLabel}>Skip</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Completed Workouts History */}
      <Card title="Workout Completion History" subtitle="Your recently completed workout programs">
        {completedWorkouts.length > 0 ? (
          completedWorkouts.map((log) => {
            const date = new Date(log.timestamp);
            const dateStr = date.toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });
            return (
              <View key={log.id} style={styles.historyRow}>
                <View style={styles.historyLeft}>
                  <CheckCircle2 color={Theme.colors.success} size={18} />
                  <Text style={styles.historyNameText}>{log.planName}</Text>
                </View>
                <Text style={styles.historyDateText}>{dateStr}</Text>
              </View>
            );
          })
        ) : (
          <Text style={styles.emptyLogsText}>No completed workouts logged. Click Start Workout above to begin training!</Text>
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
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    width: 44,
    height: 44,
    borderRadius: Theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.2)',
  },
  plansTabs: {
    flexDirection: 'row',
    marginBottom: Theme.spacing.md,
  },
  planTabButton: {
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.round,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginRight: Theme.spacing.sm,
    backgroundColor: Theme.colors.card,
  },
  planTabText: {
    color: Theme.colors.textSecondary,
    fontSize: Theme.typography.sizes.xs,
    fontWeight: Theme.typography.weights.semibold,
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: Theme.spacing.md,
  },
  metaText: {
    color: Theme.colors.textSecondary,
    fontSize: Theme.typography.sizes.xs,
    marginRight: Theme.spacing.lg,
  },
  exList: {
    marginVertical: Theme.spacing.md,
  },
  exRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  exIndexBg: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exIndexText: {
    color: Theme.colors.textSecondary,
    fontSize: Theme.typography.sizes.xs,
    fontWeight: Theme.typography.weights.bold,
  },
  exDetails: {
    flex: 1,
    marginLeft: Theme.spacing.md,
  },
  exName: {
    color: Theme.colors.text,
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.semibold,
  },
  exReps: {
    color: Theme.colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  exDuration: {
    color: Theme.colors.textSecondary,
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.semibold,
  },
  startBtn: {
    flexDirection: 'row',
    height: 48,
    borderRadius: Theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Theme.spacing.md,
  },
  startBtnText: {
    color: Theme.colors.text,
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.bold,
    marginLeft: Theme.spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 11, 16, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
    padding: Theme.spacing.xxl,
    alignItems: 'center',
  },
  modalIcon: {
    marginBottom: Theme.spacing.sm,
  },
  modalPlanTitle: {
    color: Theme.colors.text,
    fontSize: Theme.typography.sizes.md,
    fontWeight: Theme.typography.weights.bold,
    marginBottom: Theme.spacing.xl,
    textTransform: 'uppercase',
  },
  currentExBox: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xxl,
  },
  currentExTitle: {
    color: Theme.colors.textSecondary,
    fontSize: 10,
    fontWeight: Theme.typography.weights.semibold,
    textTransform: 'uppercase',
    marginBottom: Theme.spacing.xs,
  },
  currentExName: {
    color: Theme.colors.text,
    fontSize: Theme.typography.sizes.lg,
    fontWeight: Theme.typography.weights.bold,
    textAlign: 'center',
  },
  currentExReps: {
    color: Theme.colors.textSecondary,
    fontSize: Theme.typography.sizes.sm,
    marginTop: Theme.spacing.sm,
  },
  timerCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 6,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.huge,
  },
  timerText: {
    color: Theme.colors.text,
    fontSize: 32,
    fontWeight: Theme.typography.weights.bold,
  },
  modalControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: Theme.spacing.lg,
  },
  controlBtn: {
    alignItems: 'center',
  },
  controlBtnLabel: {
    color: Theme.colors.textSecondary,
    fontSize: 10,
    marginTop: Theme.spacing.xs,
    fontWeight: Theme.typography.weights.medium,
  },
  controlBtnPlay: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
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
  historyNameText: {
    color: Theme.colors.text,
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.semibold,
    marginLeft: Theme.spacing.md,
  },
  historyDateText: {
    color: Theme.colors.textSecondary,
    fontSize: Theme.typography.sizes.xs,
  },
  emptyLogsText: {
    color: Theme.colors.textSecondary,
    fontSize: Theme.typography.sizes.sm,
    textAlign: 'center',
    paddingVertical: Theme.spacing.md,
  },
});

export default WorkoutScreen;
