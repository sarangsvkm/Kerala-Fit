import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import Theme from '../theme';
import Card from '../components/Card';
import { Send, Sparkles, MessageSquare } from 'lucide-react-native';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'coach';
  timestamp: Date;
}

export const CoachScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello Sarang! I'm your Kerala Fit AI Coach. 🌴\n\nI can help you navigate eating out at local hotels, managing portion sizes, or finding healthy alternatives to traditional dishes. Ask me anything!",
      sender: 'coach',
      timestamp: new Date()
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  // Quick query responses
  const getHeuristicResponse = (query: string): string => {
    const text = query.toLowerCase();

    if (text.includes('porotta') || text.includes('parotta') || text.includes('beef')) {
      return "⚠️ Porotta & Beef Fry analysis:\n\n• Kerala Porotta is made of refined flour (Maida) and hydrogenated fats (Dalda/Vanaspati), carrying ~250-300 kcal per piece with zero fiber.\n• Beef Fry (Ularthiyathu) is high in protein but usually fried in heavy coconut oil, raising saturated fat content.\n\n💡 Healthy Swap:\n1. Choose Wheat Porotta or Chapati / Appam instead of normal Porotta.\n2. Swap Beef Fry for Beef Curry (gravy based) which uses less oil, or choose Fish Curry / Grilled Chicken.";
    }

    if (text.includes('biryani') || text.includes('mandi') || text.includes('manthi') || text.includes('al faham')) {
      return "🍛 Biryani, Mandi & Al Faham guidelines:\n\n• Chicken Biryani or Kuzhimanthi rice is cooked with ghee, animal fat, and high oil, averaging 650-800 kcal per plate.\n• Al Faham is charcoal-grilled, which makes it a great protein source! But watch out for hotel mayonnaise (which adds ~150 kcal per scoop).\n\n💡 Smart Eating Tips:\n1. Order Al Faham with Kubboos (Arabic flatbread) and Salad. Skip or limit mayonnaise.\n2. If eating Biryani/Mandi: Eat only half the rice, focus on the chicken piece, and ask for green salads.";
    }

    if (text.includes('breakfast') || text.includes('idli') || text.includes('dosa') || text.includes('puttu') || text.includes('appam')) {
      return "🥞 Kerala Breakfast nutritional ranking:\n\n1. Idli & Sambar (Grade: A+): Steamed, fermented, oil-free. High fiber and protein from Sambar lentils.\n2. Appam & Vegetable Stew (Grade: A): Appam is fermented rice batter, very light (~100 kcal). Stew contains coconut milk but is veggie-rich.\n3. Puttu & Kadala Curry (Grade: B+): Puttu is filling (~250 kcal). Kadala (black chickpeas) is an amazing plant-based protein source!\n4. Ghee Dosa / Poori Masala (Grade: C): High in refined oil/fats. Avoid for daily breakfast.";
    }

    if (text.includes('hotel') || text.includes('restaurant') || text.includes('eating out') || text.includes('dining')) {
      return "🏪 Dining Out Healthy in Kerala:\n\n• Look for steamed options like Puttu, Appam, or Idli.\n• Opt for Fish Curry (spicy, sour curry) over deep-fried fish.\n• Order a side of vegetable Thoran (cabbage, beans) or Sambar to ensure you get fiber.\n• Drink warm water (Jeeraka vellom or Karingali) instead of sweetened juices/sodas.";
    }

    if (text.includes('weight loss') || text.includes('diet') || text.includes('fat loss')) {
      return "📉 Weight Loss Blueprint:\n\n1. Calorie Deficit: Ensure you eat less than your goal (e.g. 1800 kcal). Log meals in the Food tab.\n2. Protein & Fiber: Increase lentils, fish, chicken breast, egg whites, and vegetable thorans.\n3. Hydration: Drink 3L of water. Water helps boost metabolism and controls hunger pangs.\n4. NEAT: Walk at least 8,000 steps daily. Use the Steps tab to track!";
    }

    // Default response
    return "Thank you for asking! For a healthy Kerala diet, I recommend focusing on steamed foods (Puttu, Appam, Idli), protein-rich curries (Kadala curry, Fish curry, Egg roast), and reducing refined oils, sugar, and Maida. \n\nLet me know if you want specific recommendations for a particular dish!";
  };

  const handleSendMessage = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: textToSend,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');

    // Simulate AI thinking and reply
    setTimeout(() => {
      const coachReply: Message = {
        id: (Date.now() + 1).toString(),
        text: getHeuristicResponse(textToSend),
        sender: 'coach',
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, coachReply]);
      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }, 800);
  };

  const QUICK_QUESTIONS = [
    "Is Porotta & Beef safe for weight loss?",
    "Healthy Kerala breakfast options",
    "Tips for eating out at local hotels",
    "How to manage Biryani calories?"
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner Card */}
        <Card accentColor={Theme.colors.coach} style={styles.bannerCard}>
          <View style={styles.bannerRow}>
            <Sparkles color={Theme.colors.coach} size={24} />
            <Text style={styles.bannerTitle}>Kerala Fit AI Health Coach</Text>
          </View>
          <Text style={styles.bannerText}>Get nutrition advice tailored to Kerala cuisine and hotel foods.</Text>
        </Card>

        {/* Message Bubbles */}
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <View key={msg.id} style={[styles.bubbleWrapper, isUser ? styles.userWrapper : styles.coachWrapper]}>
              <View style={[styles.bubble, isUser ? styles.userBubble : styles.coachBubble]}>
                <Text style={styles.bubbleText}>{msg.text}</Text>
              </View>
              <Text style={styles.bubbleTime}>
                {msg.timestamp.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      {/* Suggested Quick Questions */}
      <View style={styles.suggestionsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestionsScroll}>
          {QUICK_QUESTIONS.map((q, i) => (
            <TouchableOpacity key={i} style={styles.suggestionBtn} onPress={() => handleSendMessage(q)}>
              <Text style={styles.suggestionText}>{q}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Input Row */}
      <View style={styles.inputRow}>
        <TextInput
          placeholder="Ask coach about Dosa, Biryani, Weight loss..."
          placeholderTextColor={Theme.colors.textMuted}
          style={styles.input}
          value={inputVal}
          onChangeText={setInputVal}
          onSubmitEditing={() => handleSendMessage(inputVal)}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={() => handleSendMessage(inputVal)}>
          <Send size={18} color={Theme.colors.text} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: Theme.spacing.lg,
    paddingBottom: Theme.spacing.lg,
  },
  bannerCard: {
    marginBottom: Theme.spacing.lg,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.xs,
  },
  bannerTitle: {
    color: Theme.colors.text,
    fontSize: Theme.typography.sizes.md,
    fontWeight: Theme.typography.weights.bold,
    marginLeft: Theme.spacing.sm,
  },
  bannerText: {
    color: Theme.colors.textSecondary,
    fontSize: Theme.typography.sizes.xs,
    lineHeight: 16,
  },
  bubbleWrapper: {
    marginBottom: Theme.spacing.md,
    maxWidth: '80%',
  },
  userWrapper: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  coachWrapper: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  bubble: {
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
  },
  userBubble: {
    backgroundColor: Theme.colors.coach,
    borderBottomRightRadius: 2,
  },
  coachBubble: {
    backgroundColor: Theme.colors.card,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderBottomLeftRadius: 2,
  },
  bubbleText: {
    color: Theme.colors.text,
    fontSize: Theme.typography.sizes.sm,
    lineHeight: 20,
  },
  bubbleTime: {
    color: Theme.colors.textMuted,
    fontSize: 9,
    marginTop: 4,
  },
  suggestionsWrapper: {
    paddingVertical: Theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    backgroundColor: 'rgba(10, 11, 16, 0.5)',
  },
  suggestionsScroll: {
    paddingHorizontal: Theme.spacing.lg,
  },
  suggestionBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    paddingVertical: Theme.spacing.xs,
    paddingHorizontal: Theme.spacing.md,
    borderRadius: Theme.borderRadius.round,
    marginRight: Theme.spacing.sm,
  },
  suggestionText: {
    color: Theme.colors.textSecondary,
    fontSize: 11,
    fontWeight: Theme.typography.weights.medium,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.card,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    paddingBottom: Platform.OS === 'ios' ? Theme.spacing.xl : Theme.spacing.md,
  },
  input: {
    flex: 1,
    height: 42,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    color: Theme.colors.text,
    paddingHorizontal: Theme.spacing.md,
    fontSize: Theme.typography.sizes.sm,
    marginRight: Theme.spacing.sm,
  },
  sendBtn: {
    backgroundColor: Theme.colors.coach,
    width: 42,
    height: 42,
    borderRadius: Theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CoachScreen;
