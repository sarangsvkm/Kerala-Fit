import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, TextInput, FlatList } from 'react-native';
import Theme from '../theme';
import Card from '../components/Card';
import { FoodLog } from '../types';
import { Flame, Plus, Trash2, Search, Leaf, Drumstick } from 'lucide-react-native';

interface FoodScreenProps {
  foodLogs: FoodLog[];
  onAddFoodLog: (log: Omit<FoodLog, 'id' | 'timestamp'>) => void;
  onDeleteFoodLog: (id: string) => void;
}

// Pre-defined Kerala food database
const KERALA_FOODS = {
  Vegetarian: [
    { name: 'Idli (2 nos)', calories: 120 },
    { name: 'Dosa (1 no)', calories: 120 },
    { name: 'Appam (1 no)', calories: 100 },
    { name: 'Puttu (1 cup)', calories: 250 },
    { name: 'Kadala Curry (1 serving)', calories: 150 },
    { name: 'Sambar (1 cup)', calories: 80 },
    { name: 'Aviyal (1 serving)', calories: 140 },
    { name: 'Parippu Curry (1 serving)', calories: 120 },
  ],
  NonVegetarian: [
    { name: 'Fish Curry (1 serving)', calories: 180 },
    { name: 'Chicken Curry (1 serving)', calories: 240 },
    { name: 'Beef Curry (1 serving)', calories: 320 },
    { name: 'Al Faham Chicken (1/4 piece)', calories: 400 },
    { name: 'Chicken Mandi (1 serving)', calories: 650 },
    { name: 'Chicken Biryani (1 serving)', calories: 550 },
    { name: 'Beef Fry (1 serving)', calories: 340 },
    { name: 'Egg Curry (1 serving)', calories: 160 },
  ],
};

export const FoodScreen: React.FC<FoodScreenProps> = ({
  foodLogs,
  onAddFoodLog,
  onDeleteFoodLog,
}) => {
  const [activeTab, setActiveTab] = useState<'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks'>('Breakfast');
  const [foodCategory, setFoodCategory] = useState<'Vegetarian' | 'Non-Vegetarian'>('Vegetarian');
  
  // Custom Food Form
  const [customName, setCustomName] = useState('');
  const [customCalories, setCustomCalories] = useState('');
  const [customCat, setCustomCat] = useState<'Vegetarian' | 'Non-Vegetarian' | 'Other'>('Vegetarian');

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];
  const todayLogs = foodLogs.filter(log => log.timestamp.startsWith(todayStr));
  const todayCalories = todayLogs.reduce((sum, log) => sum + log.calories, 0);

  // Quick log handler
  const handleQuickLog = (name: string, calories: number, cat: 'Vegetarian' | 'Non-Vegetarian') => {
    onAddFoodLog({
      name,
      calories,
      category: cat,
      mealType: activeTab,
    });
  };

  // Custom log handler
  const handleCustomLog = () => {
    if (!customName || !customCalories) return;
    const cals = parseInt(customCalories);
    if (isNaN(cals)) return;

    onAddFoodLog({
      name: customName,
      calories: cals,
      category: customCat,
      mealType: activeTab,
    });

    // Reset form
    setCustomName('');
    setCustomCalories('');
  };

  // Filter foods based on search query
  const availableFoods = foodCategory === 'Vegetarian' ? KERALA_FOODS.Vegetarian : KERALA_FOODS.NonVegetarian;
  const filteredFoods = availableFoods.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* Header Panel */}
      <Card accentColor={Theme.colors.calories}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Diet Tracker</Text>
            <Text style={styles.headerSub}>Control and log daily calories</Text>
          </View>
          <View style={styles.calorieBadge}>
            <Flame color={Theme.colors.calories} size={20} />
            <Text style={styles.calorieBadgeText}>{todayCalories} kcal</Text>
          </View>
        </View>
      </Card>

      {/* Meal type selector tab bar */}
      <View style={styles.tabsContainer}>
        {(['Breakfast', 'Lunch', 'Dinner', 'Snacks'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabButton, activeTab === tab ? styles.activeTabButton : null]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab ? styles.activeTabText : null]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Logging Options */}
      <Card title={`Add to ${activeTab}`} subtitle="Log traditional Kerala foods or custom recipes">
        {/* Toggle Category */}
        <View style={styles.catToggle}>
          <TouchableOpacity
            style={[styles.toggleBtn, foodCategory === 'Vegetarian' ? styles.toggleBtnActiveVeg : null]}
            onPress={() => setFoodCategory('Vegetarian')}
          >
            <Leaf size={16} color={foodCategory === 'Vegetarian' ? '#fff' : Theme.colors.success} />
            <Text style={[styles.toggleBtnText, foodCategory === 'Vegetarian' ? styles.toggleTextActive : null]}>Vegetarian</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, foodCategory === 'Non-Vegetarian' ? styles.toggleBtnActiveNonVeg : null]}
            onPress={() => setFoodCategory('Non-Vegetarian')}
          >
            <Drumstick size={16} color={foodCategory === 'Non-Vegetarian' ? '#fff' : Theme.colors.calories} />
            <Text style={[styles.toggleBtnText, foodCategory === 'Non-Vegetarian' ? styles.toggleTextActive : null]}>Non-Veg</Text>
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <View style={styles.searchContainer}>
          <Search size={16} color={Theme.colors.textSecondary} />
          <TextInput
            placeholder="Search traditional foods..."
            placeholderTextColor={Theme.colors.textMuted}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Quick List */}
        <View style={styles.foodList}>
          {filteredFoods.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.foodItemRow}
              onPress={() => handleQuickLog(item.name, item.calories, foodCategory)}
            >
              <View>
                <Text style={styles.foodItemName}>{item.name}</Text>
                <Text style={styles.foodItemCals}>{item.calories} kcal</Text>
              </View>
              <View style={styles.plusIcon}>
                <Plus size={16} color={Theme.colors.text} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Custom Food Logger */}
        <Text style={styles.sectionDivider}>Or Log Custom Food</Text>
        
        <View style={styles.customForm}>
          <TextInput
            placeholder="Food name (e.g. Kappa & Meen Curry)"
            placeholderTextColor={Theme.colors.textMuted}
            style={styles.input}
            value={customName}
            onChangeText={setCustomName}
          />
          <View style={styles.formRow}>
            <TextInput
              placeholder="Calories (kcal)"
              placeholderTextColor={Theme.colors.textMuted}
              style={[styles.input, { flex: 1, marginRight: Theme.spacing.sm }]}
              keyboardType="numeric"
              value={customCalories}
              onChangeText={customCalories => setCustomCalories(customCalories.replace(/[^0-9]/g, ''))}
            />
            {/* Custom Category selection */}
            <View style={styles.miniToggleContainer}>
              {(['Vegetarian', 'Non-Vegetarian'] as const).map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.miniToggleBtn, customCat === cat ? styles.miniToggleActive : null]}
                  onPress={() => setCustomCat(cat)}
                >
                  <Text style={[styles.miniToggleText, customCat === cat ? styles.miniToggleTextActive : null]}>
                    {cat === 'Vegetarian' ? 'Veg' : 'Non-Veg'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <TouchableOpacity style={styles.logBtn} onPress={handleCustomLog}>
            <Text style={styles.logBtnText}>Log Custom Meal</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Logged Foods List for Today */}
      <Card title="Today's Meal Log" subtitle="Log history for today">
        {todayLogs.length > 0 ? (
          todayLogs.map((log) => (
            <View key={log.id} style={styles.logItemRow}>
              <View style={styles.logItemDetails}>
                <Text style={styles.logItemMealType}>{log.mealType}</Text>
                <Text style={styles.logItemName}>{log.name}</Text>
                <Text style={[
                  styles.logItemCategory,
                  log.category === 'Vegetarian' ? { color: Theme.colors.success } : { color: Theme.colors.calories }
                ]}>
                  {log.category}
                </Text>
              </View>
              <View style={styles.logItemRight}>
                <Text style={styles.logItemCals}>{log.calories} kcal</Text>
                <TouchableOpacity onPress={() => onDeleteFoodLog(log.id)} style={styles.deleteBtn}>
                  <Trash2 size={16} color={Theme.colors.danger} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyLogsText}>No food logged today. Start by tapping items above!</Text>
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
  calorieBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.2)',
  },
  calorieBadgeText: {
    color: Theme.colors.calories,
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.bold,
    marginLeft: Theme.spacing.xs,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.xs,
    marginBottom: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  tabButton: {
    flex: 1,
    paddingVertical: Theme.spacing.sm,
    alignItems: 'center',
    borderRadius: Theme.borderRadius.sm,
  },
  activeTabButton: {
    backgroundColor: Theme.colors.calories,
  },
  tabText: {
    color: Theme.colors.textSecondary,
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.semibold,
  },
  activeTabText: {
    color: Theme.colors.text,
  },
  catToggle: {
    flexDirection: 'row',
    marginBottom: Theme.spacing.md,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginRight: Theme.spacing.md,
    flex: 1,
  },
  toggleBtnActiveVeg: {
    backgroundColor: Theme.colors.success,
    borderColor: Theme.colors.success,
  },
  toggleBtnActiveNonVeg: {
    backgroundColor: Theme.colors.calories,
    borderColor: Theme.colors.calories,
  },
  toggleBtnText: {
    color: Theme.colors.textSecondary,
    fontSize: Theme.typography.sizes.xs,
    fontWeight: Theme.typography.weights.semibold,
    marginLeft: Theme.spacing.xs,
  },
  toggleTextActive: {
    color: Theme.colors.text,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    paddingHorizontal: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: Theme.colors.text,
    fontSize: Theme.typography.sizes.sm,
    marginLeft: Theme.spacing.sm,
  },
  foodList: {
    marginBottom: Theme.spacing.lg,
  },
  foodItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginBottom: Theme.spacing.sm,
  },
  foodItemName: {
    color: Theme.colors.text,
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.medium,
  },
  foodItemCals: {
    color: Theme.colors.textSecondary,
    fontSize: Theme.typography.sizes.xs,
    marginTop: 2,
  },
  plusIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    width: 28,
    height: 28,
    borderRadius: Theme.borderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionDivider: {
    color: Theme.colors.textSecondary,
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.semibold,
    marginVertical: Theme.spacing.md,
    alignSelf: 'center',
  },
  customForm: {
    marginTop: Theme.spacing.xs,
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
    marginBottom: Theme.spacing.sm,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: Theme.spacing.md,
    alignItems: 'center',
  },
  miniToggleContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    padding: 3,
  },
  miniToggleBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: Theme.borderRadius.sm,
  },
  miniToggleActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  miniToggleText: {
    color: Theme.colors.textSecondary,
    fontSize: 11,
    fontWeight: Theme.typography.weights.semibold,
  },
  miniToggleTextActive: {
    color: Theme.colors.text,
  },
  logBtn: {
    backgroundColor: Theme.colors.calories,
    borderRadius: Theme.borderRadius.md,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logBtnText: {
    color: Theme.colors.text,
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.bold,
  },
  logItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  logItemDetails: {
    flex: 1,
  },
  logItemMealType: {
    color: Theme.colors.textMuted,
    fontSize: 10,
    fontWeight: Theme.typography.weights.bold,
    textTransform: 'uppercase',
  },
  logItemName: {
    color: Theme.colors.text,
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.semibold,
    marginVertical: 2,
  },
  logItemCategory: {
    fontSize: 11,
    fontWeight: Theme.typography.weights.medium,
  },
  logItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logItemCals: {
    color: Theme.colors.text,
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

export default FoodScreen;
