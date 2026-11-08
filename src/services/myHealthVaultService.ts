import AsyncStorage from '@react-native-async-storage/async-storage';
import { FoodLog, WeightLog, WaterLog, SleepLog, StepLog } from '../types';

export interface MyHealthVaultRecordPayload {
  provider: 'KERALA_FIT';
  type: 'STEPS' | 'WEIGHT' | 'SLEEP_MINUTES' | 'CALORIES_INTAKE' | 'WATER_ML' | 'CALORIES_BURNED';
  value: number;
  unit: string;
  startTime: string; // ISO 8601
  endTime?: string;  // ISO 8601
  sourceRecordId: string;
}

export interface MyHealthVaultReport {
  id: string;
  reportName: string;
  reportType?: string;
  originalFileName: string;
  mimeType: string;
  fileSize: number;
  reportDate?: string;
  source: string;
  createdAt: string;
}

export interface SyncResult {
  success: boolean;
  inserted: number;
  skipped: number;
  total: number;
  error?: string;
  timestamp: string;
}

const STORAGE_KEYS = {
  TOKEN: '@keralafit_myhealthvault_token',
  API_URL: '@keralafit_myhealthvault_api_url',
  LAST_SYNC: '@keralafit_myhealthvault_last_sync',
  USER_EMAIL: '@keralafit_myhealthvault_email',
};

// Default URL: fallback to localhost / standard Android emulator loopback / LAN
const DEFAULT_API_URL = 'http://10.0.2.2:8080'; // or 'http://localhost:8080' for iOS / web

class MyHealthVaultService {
  private apiUrl: string = DEFAULT_API_URL;
  private token: string | null = null;

  async init(): Promise<void> {
    try {
      const storedUrl = await AsyncStorage.getItem(STORAGE_KEYS.API_URL);
      if (storedUrl) this.apiUrl = storedUrl;

      const storedToken = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
      if (storedToken) this.token = storedToken;
    } catch {
      // Ignore storage errors on startup
    }
  }

  setApiUrl(url: string): void {
    this.apiUrl = url.replace(/\/$/, '');
    AsyncStorage.setItem(STORAGE_KEYS.API_URL, this.apiUrl);
  }

  getApiUrl(): string {
    return this.apiUrl;
  }

  async getToken(): Promise<string | null> {
    if (!this.token) {
      this.token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
    }
    return this.token;
  }

  async isAuthenticated(): Promise<boolean> {
    const t = await this.getToken();
    return !!t;
  }

  async logout(): Promise<void> {
    this.token = null;
    await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_EMAIL);
  }

  /**
   * Authenticates or auto-registers with MyHealthVault API
   */
  async loginOrRegister(email: string, password: string, displayName: string = 'Sarang S.'): Promise<{ success: boolean; error?: string }> {
    try {
      // 1. Try logging in first
      const loginRes = await fetch(`${this.apiUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (loginRes.ok) {
        const data = await loginRes.json();
        const token = data.accessToken || data.token;
        if (token) {
          this.token = token;
          await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
          await AsyncStorage.setItem(STORAGE_KEYS.USER_EMAIL, email);
          return { success: true };
        }
      }

      // 2. If login failed with 401 or user not found, try auto-registering
      const regRes = await fetch(`${this.apiUrl}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, displayName }),
      });

      if (regRes.ok) {
        const regData = await regRes.json();
        const token = regData.accessToken || regData.token;
        if (token) {
          this.token = token;
          await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
          await AsyncStorage.setItem(STORAGE_KEYS.USER_EMAIL, email);
          return { success: true };
        }
      }

      const errText = await regRes.text();
      return { success: false, error: errText || 'Could not connect to MyHealthVault API' };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error connecting to MyHealthVault' };
    }
  }

  /**
   * Syncs all Kerala Fit nutrition, step, hydration, weight and sleep logs to MyHealthVault
   */
  async syncToVault(data: {
    foodLogs: FoodLog[];
    stepLogs: StepLog[];
    waterLogs: WaterLog[];
    weightLogs: WeightLog[];
    sleepLogs: SleepLog[];
  }): Promise<SyncResult> {
    const token = await this.getToken();
    const nowIso = new Date().toISOString();

    if (!token) {
      return {
        success: false,
        inserted: 0,
        skipped: 0,
        total: 0,
        error: 'Not authenticated with MyHealthVault. Please connect your vault first.',
        timestamp: nowIso,
      };
    }

    const records: MyHealthVaultRecordPayload[] = [];

    // 1. Food Logs -> CALORIES_INTAKE
    for (const food of data.foodLogs) {
      records.push({
        provider: 'KERALA_FIT',
        type: 'CALORIES_INTAKE',
        value: food.calories,
        unit: 'kcal',
        startTime: food.timestamp,
        sourceRecordId: `kf_food_${food.id}`,
      });
    }

    // 2. Step Logs -> STEPS
    for (const step of data.stepLogs) {
      records.push({
        provider: 'KERALA_FIT',
        type: 'STEPS',
        value: step.steps,
        unit: 'count',
        startTime: step.timestamp,
        sourceRecordId: `kf_step_${step.id}`,
      });
    }

    // 3. Water Logs -> WATER_ML
    for (const water of data.waterLogs) {
      records.push({
        provider: 'KERALA_FIT',
        type: 'WATER_ML',
        value: water.amount,
        unit: 'ml',
        startTime: water.timestamp,
        sourceRecordId: `kf_water_${water.id}`,
      });
    }

    // 4. Weight Logs -> WEIGHT
    for (const weight of data.weightLogs) {
      records.push({
        provider: 'KERALA_FIT',
        type: 'WEIGHT',
        value: weight.weight,
        unit: 'kg',
        startTime: weight.timestamp,
        sourceRecordId: `kf_weight_${weight.id}`,
      });
    }

    // 5. Sleep Logs -> SLEEP_MINUTES
    for (const sleep of data.sleepLogs) {
      records.push({
        provider: 'KERALA_FIT',
        type: 'SLEEP_MINUTES',
        value: Math.round(sleep.duration * 60),
        unit: 'min',
        startTime: sleep.timestamp,
        sourceRecordId: `kf_sleep_${sleep.id}`,
      });
    }

    if (records.length === 0) {
      return {
        success: true,
        inserted: 0,
        skipped: 0,
        total: 0,
        timestamp: nowIso,
      };
    }

    try {
      // Chunk records to max 500 per batch to conform to API limit
      const batch = records.slice(0, 500);
      const res = await fetch(`${this.apiUrl}/api/v1/health/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(batch),
      });

      if (!res.ok) {
        const errText = await res.text();
        return {
          success: false,
          inserted: 0,
          skipped: 0,
          total: batch.length,
          error: `Server responded with ${res.status}: ${errText}`,
          timestamp: nowIso,
        };
      }

      const resJson = await res.json();
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, nowIso);

      return {
        success: true,
        inserted: resJson.inserted || 0,
        skipped: resJson.skipped || 0,
        total: batch.length,
        timestamp: nowIso,
      };
    } catch (err: any) {
      return {
        success: false,
        inserted: 0,
        skipped: 0,
        total: records.length,
        error: err?.message || 'Sync network request failed',
        timestamp: nowIso,
      };
    }
  }

  /**
   * Fetches user's clinical diagnostic reports and prescriptions from MyHealthVault
   */
  async getClinicalReports(): Promise<MyHealthVaultReport[]> {
    const token = await this.getToken();
    if (!token) return [];

    try {
      const res = await fetch(`${this.apiUrl}/api/v1/reports`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        return await res.json();
      }
      return [];
    } catch {
      return [];
    }
  }

  async getLastSync(): Promise<string | null> {
    return await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
  }

  /**
   * Queries the unified AI Coach on the Spring Boot backend
   */
  async getAiCoachAdvice(query: string): Promise<string> {
    try {
      const res = await fetch(`${this.apiUrl}/api/v1/coach/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.response || '';
      }
    } catch {}
    return '';
  }

  /**
   * Direct logging of a meal to the unified Spring Boot backend
   */
  async logFoodMeal(name: string, category: string, calories: number, mealType: string) {
    const token = await this.getToken();
    if (!token) return null;
    try {
      const res = await fetch(`${this.apiUrl}/api/v1/fitness/food`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, category, calories, mealType }),
      });
      if (res.ok) return await res.json();
    } catch {}
    return null;
  }

  /**
   * Direct logging of a workout to the unified Spring Boot backend
   */
  async logWorkout(planName: string, durationMinutes: number) {
    const token = await this.getToken();
    if (!token) return null;
    try {
      const res = await fetch(`${this.apiUrl}/api/v1/fitness/workout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ planName, durationMinutes }),
      });
      if (res.ok) return await res.json();
    } catch {}
    return null;
  }

  /**
   * Fetches unified health & fitness summary (calories + workouts + medical reports count)
   */
  async getUnifiedSummary() {
    const token = await this.getToken();
    if (!token) return null;
    try {
      const res = await fetch(`${this.apiUrl}/api/v1/fitness/summary`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) return await res.json();
    } catch {}
    return null;
  }
}

export const myHealthVaultService = new MyHealthVaultService();

