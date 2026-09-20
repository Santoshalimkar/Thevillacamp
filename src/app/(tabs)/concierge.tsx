import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Colors } from "../../theme/colors";
import {
  ChatMessage,
  SUGGESTED_PROMPTS,
  sendConciergeMessage,
} from "../../services/conciergeService";
import { PropertyItem } from "../../services/propertyService";

export default function ConciergeScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m-1",
      sender: "bot",
      text: "Namaste! I am your Villa & Camp AI Concierge. Tell me your dream destination, budget, or preferred vibe, and I'll find the perfect getaway for you!",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    try {
      const response = await sendConciergeMessage(query);
      const botMsg: ChatMessage = {
        id: `b-${Date.now()}`,
        sender: "bot",
        text: response.text,
        recommendations: response.recommendations,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleOpenWhatsApp = () => {
    const text = encodeURIComponent(
      "Hello The Villa & Camp! I am looking for luxury stays and assistance with my booking."
    );
    Linking.openURL(`https://wa.me/919820000000?text=${text}`);
  };

  const renderRecommendationCard = (item: PropertyItem) => {
    const photo =
      item.images?.[0] ||
      item.propertyImage ||
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400";
    const price = item.price || item.basePrice || 14000;

    return (
      <TouchableOpacity
        key={item._id || item.id}
        style={styles.recCard}
        activeOpacity={0.88}
        onPress={() =>
          router.push({
            pathname: "/property/[id]",
            params: { id: item._id || item.id || "" },
          } as any)
        }
      >
        <Image source={{ uri: photo }} style={styles.recImage} resizeMode="cover" />
        <View style={styles.recInfo}>
          <Text style={styles.recTitle} numberOfLines={1}>
            {item.name || "Luxury Villa"}
          </Text>
          <Text style={styles.recLocation} numberOfLines={1}>
            {item.address?.city || item.city || "Lonavala"}
          </Text>
          <Text style={styles.recPrice}>
            ₹{price.toLocaleString("en-IN")} <Text style={styles.recNight}>/ night</Text>
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image
              source={require("../../../assets/brand/ai-mascot.png")}
              style={styles.mascotAvatar}
              resizeMode="contain"
            />
            <View>
              <View style={styles.badgeRow}>
                <Text style={styles.headerTitle}>AI Concierge</Text>
                <View style={styles.onlineBadge}>
                  <View style={styles.onlineDot} />
                  <Text style={styles.onlineText}>24/7 Live</Text>
                </View>
              </View>
              <Text style={styles.headerSubtitle}>The Villa & Camp Travel Advisor</Text>
            </View>
          </View>

          {/* WhatsApp Direct Hotline */}
          <TouchableOpacity
            style={styles.whatsappBtn}
            onPress={handleOpenWhatsApp}
            activeOpacity={0.8}
          >
            <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
            <Text style={styles.whatsappBtnText}>WhatsApp</Text>
          </TouchableOpacity>
        </View>

        {/* Message List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => {
            const isUser = item.sender === "user";
            return (
              <View
                style={[
                  styles.messageBubbleContainer,
                  isUser ? styles.msgRight : styles.msgLeft,
                ]}
              >
                <View
                  style={[
                    styles.messageBubble,
                    isUser ? styles.userBubble : styles.botBubble,
                  ]}
                >
                  <Text style={[styles.messageText, isUser && styles.userMessageText]}>
                    {item.text}
                  </Text>
                  <Text style={styles.timestamp}>{item.timestamp}</Text>
                </View>

                {/* Recommendations */}
                {item.recommendations && item.recommendations.length > 0 && (
                  <View style={styles.recommendationsList}>
                    <Text style={styles.recSectionTitle}>RECOMMENDED FOR YOU</Text>
                    {item.recommendations.map(renderRecommendationCard)}
                  </View>
                )}
              </View>
            );
          }}
          ListFooterComponent={
            isTyping ? (
              <View style={styles.typingIndicator}>
                <Text style={styles.typingText}>Concierge is searching stays...</Text>
              </View>
            ) : null
          }
        />

        {/* Suggested Prompts */}
        <View style={styles.suggestionsContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={SUGGESTED_PROMPTS}
            keyExtractor={(item, index) => `sug-${index}`}
            contentContainerStyle={styles.suggestionsContent}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionPill}
                onPress={() => handleSend(item)}
                activeOpacity={0.7}
              >
                <Ionicons name="sparkles-outline" size={12} color={Colors.primary} />
                <Text style={styles.suggestionText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ask concierge (e.g. villa with pool in Lonavala)..."
            placeholderTextColor={Colors.textTertiary}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={() => handleSend()}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
            disabled={!inputText.trim()}
            onPress={() => handleSend()}
          >
            <Ionicons name="arrow-up" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    backgroundColor: Colors.card,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  mascotAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.text,
  },
  onlineBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
  },
  onlineText: {
    fontSize: 10,
    color: Colors.success,
    fontWeight: "700",
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  whatsappBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(37, 211, 102, 0.12)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(37, 211, 102, 0.3)",
  },
  whatsappBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#25D366",
  },
  messageList: {
    padding: 16,
    gap: 14,
  },
  messageBubbleContainer: {
    marginVertical: 4,
  },
  msgLeft: {
    alignItems: "flex-start",
  },
  msgRight: {
    alignItems: "flex-end",
  },
  messageBubble: {
    maxWidth: "82%",
    padding: 14,
    borderRadius: 18,
  },
  botBubble: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  messageText: {
    color: Colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  userMessageText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  timestamp: {
    fontSize: 10,
    color: Colors.textTertiary,
    marginTop: 6,
    alignSelf: "flex-end",
  },
  recommendationsList: {
    marginTop: 12,
    width: "100%",
    gap: 10,
  },
  recSectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: Colors.textSecondary,
    letterSpacing: 0.8,
  },
  recCard: {
    flexDirection: "row",
    backgroundColor: Colors.cardSecondary,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  recImage: {
    width: 90,
    height: 80,
  },
  recInfo: {
    flex: 1,
    padding: 10,
    justifyContent: "center",
  },
  recTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text,
  },
  recLocation: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  recPrice: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.primary,
    marginTop: 4,
  },
  recNight: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: "400",
  },
  typingIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  typingText: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontStyle: "italic",
  },
  suggestionsContainer: {
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    paddingVertical: 8,
    backgroundColor: Colors.background,
  },
  suggestionsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  suggestionPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.card,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  suggestionText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 10,
  },
  input: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.cardSecondary,
    paddingHorizontal: 16,
    color: Colors.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
});
