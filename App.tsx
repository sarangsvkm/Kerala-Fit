import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, View, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Theme from './src/theme';
import { UserProfile, FoodLog, WeightLog, WaterLog, SleepLog, StepLog } from './src/types';

// Screens
import DashboardScreen from './src/screens/DashboardScreen';
import FoodScreen from './src/screens/FoodScreen';
import WeightScreen from './src/screens/WeightScreen';
import WaterScreen from './src/screens/WaterScreen';
import SleepScreen from './src/screens/SleepScreen';
import StepScreen from './src/screens/StepScreen';
import WorkoutScreen from './src/screens/WorkoutScreen';
import CoachScreen from './src/screens/CoachScreen';
import ReportsScreen from './src/screens/ReportsScreen';

// Navigation Icons
import { 
  Home, 
  Flame, 
  Scale, 
  Droplet, 
  Moon, 
  Activity, 
  Dumbbell, 
  Sparkles, 
  FileText 
} from 'lucide-react-native';

const STORAGE_KEYS = {
  PROFILE: '@keralafit_profile',
  FOOD_LOGS: '@keralafit_food_logs',
  WEIGHT_LOGS: '@keralafit_weight_logs',
  WATER_LOGS: '@keralafit_water_logs',
  SLEEP_LOGS: '@keralafit_sleep_logs',
  STEP_LOGS: '@keralafit_step_logs',
  WORKOUT_LOGS: '@keralafit_workout_logs',
};

export default function App() {
  // Navigation Screen State
  const [currentScreen, setCurrentScreen] = useState<string>('Dashboard');

  // Global App States
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Sarang S.',
    weightGoal: 70.0,
    calorieGoal: 2000,
    stepGoal: 8000,
    waterGoal: 3000,
  });

  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([]);
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([]);
  const [stepLogs, setStepLogs] = useState<StepLog[]>([]);
  const [completedWorkouts, setCompletedWorkouts] = useState<{ id: string; planName: string; timestamp: string }[]>([]);

  // Load state and populate seed data on mount
  useEffect(() => {
    const initApp = async () => {
      try {
        const storedProfile = await AsyncStorage.getItem(STORAGE_KEYS.PROFILE);
        const storedFood = await AsyncStorage.getItem(STORAGE_KEYS.FOOD_LOGS);
        const storedWeight = await AsyncStorage.getItem(STORAGE_KEYS.WEIGHT_LOGS);
        const storedWater = await AsyncStorage.getItem(STORAGE_KEYS.WATER_LOGS);
        const storedSleep = await AsyncStorage.getItem(STORAGE_KEYS.SLEEP_LOGS);
        const storedSteps = await AsyncStorage.getItem(STORAGE_KEYS.STEP_LOGS);
        const storedWorkouts = await AsyncStorage.getItem(STORAGE_KEYS.WORKOUT_LOGS);

        if (storedProfile) setUserProfile(JSON.parse(storedProfile));

        // If weight logs are empty, initialize with beautiful seed data showing progress
        if (storedWeight) {
          setWeightLogs(JSON.parse(storedWeight));
        } else {
          const seedWeight: WeightLog[] = [
            { id: 'w1', weight: 74.8, timestamp: new Date().toISOString() },
            { id: 'w2', weight: 75.2, timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString() },
            { id: 'w3', weight: 75.6, timestamp: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString() },
            { id: 'w4', weight: 76.0, timestamp: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString() },
            { id: 'w5', weight: 76.3, timestamp: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString() },
            { id: 'w6', weight: 76.8, timestamp: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString() },
          ];
          setWeightLogs(seedWeight);
          await AsyncStorage.setItem(STORAGE_KEYS.WEIGHT_LOGS, JSON.stringify(seedWeight));
        }

        // Initialize food logs seed
        if (storedFood) {
          setFoodLogs(JSON.parse(storedFood));
        } else {
          const seedFood: FoodLog[] = [
            { id: 'f1', name: 'Idli (2 nos) & Sambar', category: 'Vegetarian', calories: 200, mealType: 'Breakfast', timestamp: new Date().toISOString() },
            { id: 'f2', name: 'Fish Curry & Rice', category: 'Non-Vegetarian', calories: 480, mealType: 'Lunch', timestamp: new Date().toISOString() },
            { id: 'f3', name: 'Puttu & Kadala', category: 'Vegetarian', calories: 400, mealType: 'Breakfast', timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString() },
            { id: 'f4', name: 'Chicken Biryani', category: 'Non-Vegetarian', calories: 550, mealType: 'Lunch', timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString() },
          ];
          setFoodLogs(seedFood);
          await AsyncStorage.setItem(STORAGE_KEYS.FOOD_LOGS, JSON.stringify(seedFood));
        }

        // Initialize water logs seed
        if (storedWater) {
          setWaterLogs(JSON.parse(storedWater));
        } else {
          const seedWater: WaterLog[] = [
            { id: 'wa1', amount: 250, timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
            { id: 'wa2', amount: 500, timestamp: new Date().toISOString() },
            { id: 'wa3', amount: 500, timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString() },
          ];
          setWaterLogs(seedWater);
          await AsyncStorage.setItem(STORAGE_KEYS.WATER_LOGS, JSON.stringify(seedWater));
        }

        // Initialize sleep logs seed
        if (storedSleep) {
          setSleepLogs(JSON.parse(storedSleep));
        } else {
          const seedSleep: SleepLog[] = [
            { id: 'sl1', duration: 7.2, deepSleep: 22, score: 85, timestamp: new Date().toISOString() },
            { id: 'sl2', duration: 6.5, deepSleep: 15, score: 68, timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString() },
            { id: 'sl3', duration: 7.8, deepSleep: 26, score: 92, timestamp: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString() },
          ];
          setSleepLogs(seedSleep);
          await AsyncStorage.setItem(STORAGE_KEYS.SLEEP_LOGS, JSON.stringify(seedSleep));
        }

        // Initialize step logs seed
        if (storedSteps) {
          setStepLogs(JSON.parse(storedSteps));
        } else {
          const seedSteps: StepLog[] = [
            { id: 'st1', steps: 4200, timestamp: new Date().toISOString() },
            { id: 'st2', steps: 8400, timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString() },
            { id: 'st3', steps: 6100, timestamp: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString() },
            { id: 'st4', steps: 9200, timestamp: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString() },
            { id: 'st5', steps: 7800, timestamp: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString() },
            { id: 'st6', steps: 5400, timestamp: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString() },
            { id: 'st7', steps: 8700, timestamp: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString() },
          ];
          setStepLogs(seedSteps);
          await AsyncStorage.setItem(STORAGE_KEYS.STEP_LOGS, JSON.stringify(seedSteps));
        }

        if (storedWorkouts) setCompletedWorkouts(JSON.parse(storedWorkouts));

      } catch (err) {
        console.error('Failed to load storage data:', err);
      }
    };

    initApp();
  }, []);

  // State mutator wrappers that auto-update local state and AsyncStorage
  const handleAddFoodLog = async (log: Omit<FoodLog, 'id' | 'timestamp'>) => {
    const newLog: FoodLog = {
      ...log,
      id: Math.random().toString(),
      timestamp: new Date().toISOString(),
    };
    const updated = [newLog, ...foodLogs];
    setFoodLogs(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.FOOD_LOGS, JSON.stringify(updated));
  };

  const handleDeleteFoodLog = async (id: string) => {
    const updated = foodLogs.filter(log => log.id !== id);
    setFoodLogs(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.FOOD_LOGS, JSON.stringify(updated));
  };

  const handleAddWeightLog = async (weight: number) => {
    const newLog: WeightLog = {
      id: Math.random().toString(),
      weight,
      timestamp: new Date().toISOString(),
    };
    const updated = [newLog, ...weightLogs];
    setWeightLogs(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.WEIGHT_LOGS, JSON.stringify(updated));
  };

  const handleDeleteWeightLog = async (id: string) => {
    const updated = weightLogs.filter(log => log.id !== id);
    setWeightLogs(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.WEIGHT_LOGS, JSON.stringify(updated));
  };

  const handleAddWaterLog = async (amount: number) => {
    const newLog: WaterLog = {
      id: Math.random().toString(),
      amount,
      timestamp: new Date().toISOString(),
    };
    const updated = [newLog, ...waterLogs];
    setWaterLogs(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.WATER_LOGS, JSON.stringify(updated));
  };

  const handleDeleteWaterLog = async (id: string) => {
    const updated = waterLogs.filter(log => log.id !== id);
    setWaterLogs(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.WATER_LOGS, JSON.stringify(updated));
  };

  const handleAddSleepLog = async (log: Omit<SleepLog, 'id' | 'timestamp'>) => {
    const newLog: SleepLog = {
      ...log,
      id: Math.random().toString(),
      timestamp: new Date().toISOString(),
    };
    const updated = [newLog, ...sleepLogs];
    setSleepLogs(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.SLEEP_LOGS, JSON.stringify(updated));
  };

  const handleDeleteSleepLog = async (id: string) => {
    const updated = sleepLogs.filter(log => log.id !== id);
    setSleepLogs(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.SLEEP_LOGS, JSON.stringify(updated));
  };

  const handleSyncSleepLogs = async (mockLogs: Omit<SleepLog, 'id' | 'timestamp'>[]) => {
    const newLogs: SleepLog[] = mockLogs.map((log, index) => ({
      ...log,
      id: `synced-sleep-${Date.now()}-${index}`,
      timestamp: new Date(Date.now() - (index + 1) * 24 * 3600 * 1000).toISOString(),
    }));
    const updated = [...newLogs, ...sleepLogs];
    setSleepLogs(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.SLEEP_LOGS, JSON.stringify(updated));
  };

  const handleAddStepLog = async (steps: number) => {
    const newLog: StepLog = {
      id: Math.random().toString(),
      steps,
      timestamp: new Date().toISOString(),
    };
    const updated = [newLog, ...stepLogs];
    setStepLogs(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.STEP_LOGS, JSON.stringify(updated));
  };

  const handleSyncStepLogs = async (steps: number) => {
    const newLog: StepLog = {
      id: `synced-step-${Date.now()}`,
      steps,
      timestamp: new Date().toISOString(),
    };
    const updated = [newLog, ...stepLogs];
    setStepLogs(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.STEP_LOGS, JSON.stringify(updated));
  };

  const handleCompleteWorkout = async (planName: string) => {
    const newLog = {
      id: Math.random().toString(),
      planName,
      timestamp: new Date().toISOString(),
    };
    const updated = [newLog, ...completedWorkouts];
    setCompletedWorkouts(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.WORKOUT_LOGS, JSON.stringify(updated));
  };

  // Nav Items configuration
  const NAV_ITEMS = [
    { name: 'Dashboard', icon: Home, color: Theme.colors.primary },
    { name: 'Food', icon: Flame, color: Theme.colors.calories },
    { name: 'Weight', icon: Scale, color: Theme.colors.weight },
    { name: 'Water', icon: Droplet, color: Theme.colors.water },
    { name: 'Sleep', icon: Moon, color: Theme.colors.sleep },
    { name: 'Steps', icon: Activity, color: Theme.colors.steps },
    { name: 'Workout', icon: Dumbbell, color: Theme.colors.workout },
    { name: 'AI Coach', icon: Sparkles, color: Theme.colors.coach },
    { name: 'Reports', icon: FileText, color: Theme.colors.primary },
  ];

  // Screen renderer router
  const renderScreen = () => {
    switch (currentScreen) {
      case 'Dashboard':
        return (
          <DashboardScreen
            user={userProfile}
            foodLogs={foodLogs}
            weightLogs={weightLogs}
            waterLogs={waterLogs}
            sleepLogs={sleepLogs}
            stepLogs={stepLogs}
            onNavigate={(screen) => setCurrentScreen(screen)}
          />
        );
      case 'Food':
        return (
          <FoodScreen
            foodLogs={foodLogs}
            onAddFoodLog={handleAddFoodLog}
            onDeleteFoodLog={handleDeleteFoodLog}
          />
        );
      case 'Weight':
        return (
          <WeightScreen
            weightLogs={weightLogs}
            onAddWeightLog={handleAddWeightLog}
            onDeleteWeightLog={handleDeleteWeightLog}
            targetWeight={userProfile.weightGoal}
          />
        );
      case 'Water':
        return (
          <WaterScreen
            waterLogs={waterLogs}
            onAddWaterLog={handleAddWaterLog}
            onDeleteWaterLog={handleDeleteWaterLog}
            waterGoal={userProfile.waterGoal}
          />
        );
      case 'Sleep':
        return (
          <SleepScreen
            sleepLogs={sleepLogs}
            onAddSleepLog={handleAddSleepLog}
            onDeleteSleepLog={handleDeleteSleepLog}
            onSyncSleepLogs={handleSyncSleepLogs}
          />
        );
      case 'Steps':
        return (
          <StepScreen
            stepLogs={stepLogs}
            onAddStepLog={handleAddStepLog}
            onSyncStepLogs={handleSyncStepLogs}
            stepGoal={userProfile.stepGoal}
          />
        );
      case 'Workout':
        return (
          <WorkoutScreen
            onCompleteWorkout={handleCompleteWorkout}
            completedWorkouts={completedWorkouts}
          />
        );
      case 'AI Coach':
        return <CoachScreen />;
      case 'Reports':
        return (
          <ReportsScreen
            foodLogs={foodLogs}
            weightLogs={weightLogs}
            waterLogs={waterLogs}
            sleepLogs={sleepLogs}
            stepLogs={stepLogs}
          />
        );
      default:
        return <Text style={styles.errorText}>Screen not found</Text>;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Theme.colors.background} />
      
      {/* Top Banner App Name */}
      <View style={styles.appBar}>
        <Text style={styles.appTitle}>🌴 KERALA <Text style={{ color: Theme.colors.primary }}>FIT</Text></Text>
        <Text style={styles.appSub}>AI Health Partner</Text>
      </View>

      {/* Main Screen Panel */}
      <View style={styles.mainContent}>
        {renderScreen()}
      </View>

      {/* Horizontal Scrollable Premium Nav Bar */}
      <View style={styles.navigationPanel}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.navScrollContent}>
          {NAV_ITEMS.map((item) => {
            const IconComponent = item.icon;
            const isActive = currentScreen === item.name;
            return (
              <TouchableOpacity
                key={item.name}
                style={[
                  styles.navItem, 
                  isActive ? { borderBottomColor: item.color, borderBottomWidth: 2 } : null
                ]}
                onPress={() => setCurrentScreen(item.name)}
              >
                <IconComponent 
                  color={isActive ? item.color : Theme.colors.textSecondary} 
                  size={isActive ? 22 : 18} 
                />
                <Text style={[
                  styles.navText, 
                  isActive ? { color: item.color, fontWeight: 'bold' } : null
                ]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  appBar: {
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    backgroundColor: Theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
    alignItems: 'center',
  },
  appTitle: {
    fontSize: Theme.typography.sizes.md,
    fontWeight: Theme.typography.weights.heavy,
    color: '#fff',
    letterSpacing: 2,
  },
  appSub: {
    fontSize: 9,
    fontWeight: Theme.typography.weights.semibold,
    color: Theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: 2,
  },
  mainContent: {
    flex: 1,
  },
  navigationPanel: {
    backgroundColor: Theme.colors.card,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    height: 56,
  },
  navScrollContent: {
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.sm,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Theme.spacing.md,
    height: '100%',
    minWidth: 70,
  },
  navText: {
    color: Theme.colors.textSecondary,
    fontSize: 10,
    marginTop: 4,
  },
  errorText: {
    color: Theme.colors.danger,
    fontSize: Theme.typography.sizes.md,
    textAlign: 'center',
    marginTop: Theme.spacing.huge,
  },
});
