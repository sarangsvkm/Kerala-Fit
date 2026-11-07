export interface UserProfile {
  name: string;
  weightGoal: number;
  calorieGoal: number;
  stepGoal: number;
  waterGoal: number;
}

export interface FoodLog {
  id: string;
  name: string;
  category: 'Vegetarian' | 'Non-Vegetarian' | 'Other';
  calories: number;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';
  timestamp: string; // ISO date
}

export interface WeightLog {
  id: string;
  weight: number;
  timestamp: string; // ISO date
}

export interface WaterLog {
  id: string;
  amount: number; // in ml
  timestamp: string; // ISO date
}

export interface SleepLog {
  id: string;
  duration: number; // in hours
  deepSleep: number; // deep sleep % (0-100)
  score: number; // calculated sleep score (0-100)
  timestamp: string; // ISO date
}

export interface StepLog {
  id: string;
  steps: number;
  timestamp: string; // ISO date
}

export interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  exercises: { name: string; durationSeconds: number; reps?: string }[];
  durationMinutes: number;
}
