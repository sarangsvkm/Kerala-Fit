export const Theme = {
  colors: {
    background: '#0a0b10', // Deep obsidian black
    card: '#151724',       // Soft dark navy card
    cardOverlay: 'rgba(30, 32, 48, 0.6)', // Glassmorphism backdrop color
    border: 'rgba(255, 255, 255, 0.08)',
    borderLight: 'rgba(255, 255, 255, 0.15)',
    
    // Feature-specific accents
    primary: '#10b981',    // Emerald Green (Dashboard, General)
    steps: '#fbbf24',      // Amber Gold (Steps, Activity)
    water: '#0ea5e9',      // Sky Blue (Water, Hydration)
    sleep: '#6366f1',      // Indigo (Sleep)
    calories: '#f43f5e',   // Rose Red (Food tracker)
    weight: '#ec4899',     // Pink (Weight management)
    workout: '#a855f7',    // Purple (Workouts)
    coach: '#14b8a6',      // Teal (AI Coach)

    // Typography
    text: '#ffffff',       // Pure white
    textSecondary: '#94a3b8', // Slate grey
    textMuted: '#64748b',  // Dark grey
    
    // Statuses
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    huge: 32,
  },
  
  borderRadius: {
    sm: 6,
    md: 10,
    lg: 16,
    xl: 24,
    round: 9999,
  },
  
  typography: {
    fontFamily: 'System',
    sizes: {
      xs: 11,
      sm: 13,
      md: 15,
      lg: 18,
      xl: 22,
      xxl: 28,
      huge: 36,
    },
    weights: {
      light: '300' as const,
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
      heavy: '900' as const,
    }
  }
};

export default Theme;
