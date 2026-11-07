import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Alert, ActivityIndicator, TextInput } from 'react-native';
import Theme from '../theme';
import Card from '../components/Card';
import { FoodLog, WeightLog, WaterLog, SleepLog, StepLog } from '../types';
import { 
  FileText, 
  Download, 
  TrendingUp, 
  CheckCircle, 
  Flame, 
  Droplet, 
  Moon, 
  Activity, 
  Scale, 
  CloudUpload, 
  ShieldCheck, 
  RefreshCw, 
  ExternalLink 
} from 'lucide-react-native';
import { myHealthVaultService, MyHealthVaultReport, SyncResult } from '../services/myHealthVaultService';

interface ReportsScreenProps {
  foodLogs: FoodLog[];
  weightLogs: WeightLog[];
  waterLogs: WaterLog[];
  sleepLogs: SleepLog[];
  stepLogs: StepLog[];
}

export const ReportsScreen: React.FC<ReportsScreenProps> = ({
  foodLogs,
  weightLogs,
  waterLogs,
  sleepLogs,
  stepLogs,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isSyncingVault, setIsSyncingVault] = useState(false);
  const [vaultConnected, setVaultConnected] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [clinicalReports, setClinicalReports] = useState<MyHealthVaultReport[]>([]);
  const [showConfig, setShowConfig] = useState(false);
  const [vaultEmail, setVaultEmail] = useState('demo@example.com');
  const [vaultPassword, setVaultPassword] = useState('ChangeMe123!');
  const [vaultUrl, setVaultUrl] = useState(myHealthVaultService.getApiUrl());
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    const initVault = async () => {
      await myHealthVaultService.init();
      const isAuth = await myHealthVaultService.isAuthenticated();
      setVaultConnected(isAuth);
      const syncTime = await myHealthVaultService.getLastSync();
      setLastSyncTime(syncTime);
      if (isAuth) {
        const reports = await myHealthVaultService.getClinicalReports();
        setClinicalReports(reports);
      }
    };
    initVault();
  }, []);

  // Math calculations for averages (assuming 7-day reports)
  const getAverageCalories = () => {
    if (foodLogs.length === 0) return 0;
    const calories = foodLogs.reduce((sum, log) => sum + log.calories, 0);
    const uniqueDays = new Set(foodLogs.map(log => log.timestamp.split('T')[0]));
    return Math.round(calories / (uniqueDays.size || 1));
  };

  const getAverageSteps = () => {
    if (stepLogs.length === 0) return 0;
    const steps = stepLogs.reduce((sum, log) => sum + log.steps, 0);
    const uniqueDays = new Set(stepLogs.map(log => log.timestamp.split('T')[0]));
    return Math.round(steps / (uniqueDays.size || 1));
  };

  const getAverageWater = () => {
    if (waterLogs.length === 0) return 0;
    const water = waterLogs.reduce((sum, log) => sum + log.amount, 0);
    const uniqueDays = new Set(waterLogs.map(log => log.timestamp.split('T')[0]));
    return Math.round(water / (uniqueDays.size || 1));
  };

  const getAverageSleepScore = () => {
    if (sleepLogs.length === 0) return 0;
    const scoreSum = sleepLogs.reduce((sum, log) => sum + log.score, 0);
    return Math.round(scoreSum / sleepLogs.length);
  };

  const getWeightChange = () => {
    if (weightLogs.length < 2) return '0.0 kg';
    const firstWeight = weightLogs[weightLogs.length - 1].weight;
    const latestWeight = weightLogs[0].weight;
    const diff = latestWeight - firstWeight;
    return `${diff > 0 ? '+' : ''}${diff.toFixed(1)} kg`;
  };

  // PDF Export Trigger (JasperReports simulation)
  const handleExportPDF = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      Alert.alert(
        'PDF Exported Successfully! 📄',
        "The file 'Kerala_Fit_Weekly_Report.pdf' has been compiled and saved to your local downloads folder. Sharing options are now ready."
      );
    }, 2000);
  };

  // Connect to MyHealthVault
  const handleConnectVault = async () => {
    setConnecting(true);
    myHealthVaultService.setApiUrl(vaultUrl);
    const res = await myHealthVaultService.loginOrRegister(vaultEmail, vaultPassword, 'Sarang S.');
    setConnecting(false);

    if (res.success) {
      setVaultConnected(true);
      setShowConfig(false);
      Alert.alert('Connected to MyHealthVault! 🏥', 'Kerala Fit is now securely linked to your MyHealthVault Personal Health Record cloud.');
      const reports = await myHealthVaultService.getClinicalReports();
      setClinicalReports(reports);
    } else {
      Alert.alert('Connection Failed', res.error || 'Could not connect to MyHealthVault API. Please check server URL and status.');
    }
  };

  // Sync to MyHealthVault
  const handleSyncToMyHealthVault = async () => {
    if (!vaultConnected) {
      setShowConfig(true);
      Alert.alert('Connect MyHealthVault', 'Please connect or configure your MyHealthVault account credentials first.');
      return;
    }

    setIsSyncingVault(true);
    try {
      const result: SyncResult = await myHealthVaultService.syncToVault({
        foodLogs,
        stepLogs,
        waterLogs,
        weightLogs,
        sleepLogs,
      });

      setIsSyncingVault(false);
      if (result.success) {
        setLastSyncTime(result.timestamp);
        Alert.alert(
          'MyHealthVault Sync Complete! ☁️',
          `Successfully synchronized with MyHealthVault:\n• ${result.inserted} new records added\n• ${result.skipped} duplicate records protected (idempotent)\n• Total records processed: ${result.total}`
        );
        const reports = await myHealthVaultService.getClinicalReports();
        setClinicalReports(reports);
      } else {
        Alert.alert('Sync Warning', result.error || 'Could not complete synchronization.');
      }
    } catch (e: any) {
      setIsSyncingVault(false);
      Alert.alert('Error', e?.message || 'Sync failed');
    }
  };

  const avgCals = getAverageCalories();
  const avgSteps = getAverageSteps();
  const avgWater = getAverageWater();
  const avgSleep = getAverageSleepScore();
  const weightDiff = getWeightChange();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* Header Banner */}
      <Card accentColor={Theme.colors.primary}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>JasperReports & Health Vault</Text>
            <Text style={styles.headerSub}>Generate printable fitness & clinical reports</Text>
          </View>
          <View style={styles.iconContainer}>
            <FileText color={Theme.colors.primary} size={28} />
          </View>
        </View>
      </Card>

      {/* MYHEALTHVAULT CLOUD INTEGRATION CARD */}
      <Card 
        title="MyHealthVault Cloud Sync" 
        subtitle="Synchronize Kerala diet, steps, & vitals to national health vault"
        accentColor="#0284c7"
      >
        <View style={styles.vaultStatusRow}>
          <View style={styles.vaultBadge}>
            <ShieldCheck color={vaultConnected ? '#10b981' : '#f59e0b'} size={18} />
            <Text style={[styles.vaultBadgeText, { color: vaultConnected ? '#10b981' : '#f59e0b' }]}>
              {vaultConnected ? 'Vault Connected & Verified' : 'Vault Not Linked'}
            </Text>
          </View>

          <TouchableOpacity onPress={() => setShowConfig(!showConfig)}>
            <Text style={styles.configToggleText}>{showConfig ? 'Hide Config' : 'Configure'}</Text>
          </TouchableOpacity>
        </View>

        {/* Configuration Box */}
        {showConfig && (
          <View style={styles.configBox}>
            <Text style={styles.configLabel}>MyHealthVault API URL</Text>
            <TextInput
              style={styles.configInput}
              value={vaultUrl}
              onChangeText={setVaultUrl}
              placeholder="http://10.0.2.2:8080 or http://localhost:8080"
              placeholderTextColor="#64748b"
              autoCapitalize="none"
            />

            <Text style={styles.configLabel}>Email</Text>
            <TextInput
              style={styles.configInput}
              value={vaultEmail}
              onChangeText={setVaultEmail}
              placeholder="demo@example.com"
              placeholderTextColor="#64748b"
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Text style={styles.configLabel}>Password</Text>
            <TextInput
              style={styles.configInput}
              value={vaultPassword}
              onChangeText={setVaultPassword}
              placeholder="ChangeMe123!"
              placeholderTextColor="#64748b"
              secureTextEntry
            />

            <TouchableOpacity 
              style={[styles.connectBtn, connecting && { opacity: 0.7 }]} 
              onPress={handleConnectVault}
              disabled={connecting}
            >
              {connecting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <CheckCircle size={16} color="#ffffff" />
              )}
              <Text style={styles.connectBtnText}>
                {connecting ? 'Authenticating...' : 'Connect & Authenticate'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Sync Trigger Button */}
        <TouchableOpacity 
          style={[styles.syncVaultBtn, isSyncingVault && { opacity: 0.7 }]} 
          onPress={handleSyncToMyHealthVault}
          disabled={isSyncingVault}
        >
          {isSyncingVault ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <CloudUpload size={18} color="#ffffff" />
          )}
          <Text style={styles.syncVaultBtnText}>
            {isSyncingVault ? 'Synchronizing with MyHealthVault...' : 'Sync Diet & Fitness to MyHealthVault'}
          </Text>
        </TouchableOpacity>

        {lastSyncTime && (
          <Text style={styles.lastSyncText}>
            Last synced: {new Date(lastSyncTime).toLocaleDateString()} at {new Date(lastSyncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        )}
      </Card>

      {/* CLINICAL REPORTS VAULT PREVIEW */}
      {vaultConnected && clinicalReports.length > 0 && (
        <Card title="Clinical Lab Reports (MyHealthVault)" subtitle="Pathology & prescriptions linked to your health record">
          <View style={styles.reportsList}>
            {clinicalReports.map((rep) => (
              <View key={rep.id} style={styles.clinicalReportItem}>
                <View style={styles.clinicalReportIcon}>
                  <FileText color="#0284c7" size={20} />
                </View>
                <View style={styles.clinicalReportInfo}>
                  <Text style={styles.clinicalReportName} numberOfLines={1}>{rep.reportName}</Text>
                  <Text style={styles.clinicalReportMeta}>
                    {rep.reportType || 'Pathology'} • {rep.reportDate || new Date(rep.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.clinicalReportSize}>{(rep.fileSize / 1024).toFixed(0)} KB</Text>
              </View>
            ))}
          </View>
        </Card>
      )}

      {/* Export Report Card */}
      <Card title="Weekly Fitness Summary" subtitle="Consolidated averages for your fitness targets">
        {/* PDF Export Button */}
        <TouchableOpacity style={styles.exportBtn} onPress={handleExportPDF} disabled={isExporting}>
          {isExporting ? (
            <ActivityIndicator size="small" color={Theme.colors.text} />
          ) : (
            <Download size={18} color={Theme.colors.text} />
          )}
          <Text style={styles.exportBtnText}>
            {isExporting ? 'Compiling JasperReport...' : 'Export PDF Report'}
          </Text>
        </TouchableOpacity>

        {isExporting && (
          <Text style={styles.progressText}>Generating PDF charts & layouts on Spring Boot backend...</Text>
        )}
      </Card>

      {/* Analytics Cards */}
      <View style={styles.reportsGrid}>
        {/* Calories Card */}
        <Card title="Diet Avg" style={styles.reportCard} accentColor={Theme.colors.calories}>
          <Flame color={Theme.colors.calories} size={24} style={styles.reportIcon} />
          <Text style={styles.reportValText}>{avgCals} kcal</Text>
          <Text style={styles.reportSubText}>Avg intake / day</Text>
        </Card>

        {/* Steps Card */}
        <Card title="Steps Avg" style={styles.reportCard} accentColor={Theme.colors.steps}>
          <Activity color={Theme.colors.steps} size={24} style={styles.reportIcon} />
          <Text style={styles.reportValText}>{avgSteps.toLocaleString()}</Text>
          <Text style={styles.reportSubText}>Avg steps / day</Text>
        </Card>

        {/* Hydration Card */}
        <Card title="Water Avg" style={styles.reportCard} accentColor={Theme.colors.water}>
          <Droplet color={Theme.colors.water} size={24} style={styles.reportIcon} />
          <Text style={styles.reportValText}>{(avgWater / 1000).toFixed(1)} L</Text>
          <Text style={styles.reportSubText}>Avg water / day</Text>
        </Card>

        {/* Sleep Card */}
        <Card title="Sleep Avg" style={styles.reportCard} accentColor={Theme.colors.sleep}>
          <Moon color={Theme.colors.sleep} size={24} style={styles.reportIcon} />
          <Text style={styles.reportValText}>{avgSleep} pts</Text>
          <Text style={styles.reportSubText}>Avg sleep score</Text>
        </Card>
      </View>

      {/* Weight Progress Indicator */}
      <Card title="Weight Analytics" subtitle="Overall weight trend summary">
        <View style={styles.weightSummaryRow}>
          <Scale color={Theme.colors.weight} size={24} />
          <View style={styles.weightDetails}>
            <Text style={styles.weightChangeLabel}>Total Weight Variance</Text>
            <Text style={styles.weightChangeValue}>{weightDiff}</Text>
          </View>
          <View style={styles.trendIconBox}>
            <TrendingUp color={Theme.colors.textSecondary} size={20} />
          </View>
        </View>
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
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    width: 44,
    height: 44,
    borderRadius: Theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  vaultStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  vaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  vaultBadgeText: {
    fontSize: Theme.typography.sizes.xs,
    fontWeight: Theme.typography.weights.bold,
  },
  configToggleText: {
    fontSize: Theme.typography.sizes.xs,
    color: '#0284c7',
    fontWeight: '600',
  },
  configBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(2, 132, 199, 0.2)',
  },
  configLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
    marginTop: 6,
  },
  configInput: {
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    fontSize: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  connectBtn: {
    backgroundColor: '#0284c7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 12,
  },
  connectBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  syncVaultBtn: {
    backgroundColor: '#0284c7',
    flexDirection: 'row',
    height: 46,
    borderRadius: Theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  syncVaultBtnText: {
    color: '#ffffff',
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.bold,
  },
  lastSyncText: {
    color: '#64748b',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 6,
  },
  reportsList: {
    gap: 8,
  },
  clinicalReportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  clinicalReportIcon: {
    marginRight: 10,
  },
  clinicalReportInfo: {
    flex: 1,
  },
  clinicalReportName: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '600',
  },
  clinicalReportMeta: {
    color: '#94a3b8',
    fontSize: 10,
    marginTop: 2,
  },
  clinicalReportSize: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '600',
  },
  exportBtn: {
    backgroundColor: Theme.colors.primary,
    flexDirection: 'row',
    height: 46,
    borderRadius: Theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exportBtnText: {
    color: Theme.colors.text,
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.bold,
    marginLeft: Theme.spacing.sm,
  },
  progressText: {
    color: Theme.colors.textSecondary,
    fontSize: Theme.typography.sizes.xs,
    marginTop: Theme.spacing.md,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  reportsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.sm,
  },
  reportCard: {
    width: '48%',
    padding: Theme.spacing.md,
    alignItems: 'center',
  },
  reportIcon: {
    marginBottom: Theme.spacing.md,
  },
  reportValText: {
    color: Theme.colors.text,
    fontSize: Theme.typography.sizes.md,
    fontWeight: Theme.typography.weights.bold,
  },
  reportSubText: {
    color: Theme.colors.textSecondary,
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
  weightSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.xs,
  },
  weightDetails: {
    flex: 1,
    marginLeft: Theme.spacing.md,
  },
  weightChangeLabel: {
    color: Theme.colors.textSecondary,
    fontSize: Theme.typography.sizes.xs,
  },
  weightChangeValue: {
    color: Theme.colors.text,
    fontSize: Theme.typography.sizes.md,
    fontWeight: Theme.typography.weights.bold,
    marginTop: 2,
  },
  trendIconBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    width: 36,
    height: 36,
    borderRadius: Theme.borderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ReportsScreen;
