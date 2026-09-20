import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m-1",
      sender: "bot",
      text: "Namaste! I am your Villa & Camp AI Concierge. Tell me your dream destination, budget, or preferred vibe, and I'll find the perfect verified stay for you!",
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
    } catch {
      const errorMsg: ChatMessage = {
        id: `e-${Date.now()}`,
        sender: "bot",
        text: "I'm having a little trouble connecting to my stay catalog right now. You can tap the WhatsApp button above to chat with our team directly!",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleOpenWhatsAppConcierge = () => {
    const text = encodeURIComponent(
      "Hello The Villa & Camp! I am using the mobile app and would like personalized stay recommendations."
    );
    Linking.openURL(`https://wa.me/919820000000?text=${text}`);
  };

  const handlePressProperty = (prop: PropertyItem) => {
    const id = prop._id || prop.id;
    if (id) {
      router.push({
        pathname: "/property/[id]",
        params: { id, categoryId: prop.categoryId || "" },
      } as any);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 10) }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={require("../../../assets/brand/ai-mascot.png")}
            style={styles.mascotAvatar}
          />
          <View>
            <View style={styles.titleRow}>
              <Text style={styles.titleText}>AI Concierge</Text>
              <View style={styles.onlineBadge}>
                <View style={styles.onlineDot} />
                <Text style={styles.onlineText}>Online</Text>
              </View>
            </View>
            <Text style={styles.subtitleText}>The Villa & Camp Travel Advisor</Text>
          </View>
        </View>

        {/* WhatsApp Direct Help */}
        <TouchableOpacity
          style={styles.whatsappBtn}
          onPress={handleOpenWhatsAppConcierge}
          activeOpacity={0.8}
        >
          <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
          <Text style={styles.whatsappBtnText}>WhatsApp</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.chatArea}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => {
            const isUser = item.sender === "user";
            return (
              <View
                style={[
                  styles.messageBubbleWrapper,
                  isUser ? styles.userBubbleWrapper : styles.botBubbleWrapper,
                ]}
              >
                {!isUser && (
                  <Image
                    source={require("../../../assets/brand/ai-mascot.png")}
                    style={styles.botIconMini}
                  />
                )}
                <View
                  style={[
                    styles.bubble,
                    isUser ? styles.userBubble : styles.botBubble,
                  ]}
                >
                  <Text style={[styles.messageText, isUser && styles.userMessageText]}>
                    {item.text}
                  </Text>

                  {/* Property Recommendations if any */}
                  {item.recommendations && item.recommendations.length > 0 && (
                    <View style={styles.recommendationsList}>
                      <Text style={styles.recSectionTitle}>HANDPICKED FOR YOU</Text>
                      {item.recommendations.map((rec: PropertyItem, i: number) => (
                        <TouchableOpacity
                          key={rec._id || `rec-${i}`}
                          style={styles.recCard}
                          activeOpacity={0.88}
                          onPress={() => handlePressProperty(rec)}
                        >
                          <Image
                            source={{
                              uri:
                                rec.images?.[0] ||
                                rec.propertyImage ||
                                "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800",
                            }}
                            style={styles.recImage}
                          />
                          <View style={styles.recInfo}>
                            <Text style={styles.recTitle} numberOfLines={1}>
                              {rec.title}
                            </Text>
                            <Text style={styles.recLocation} numberOfLines={1}>
                              {rec.address?.city || rec.city || "Maharashtra"}
                            </Text>
                            <Text style={styles.recPrice}>
                              ₹{(rec.price || 12000).toLocaleString("en-IN")}{" "}
                              <Text style={styles.recNight}>/ night</Text>
                            </Text>
                          </View>
                          <Ionicons
                            name="chevron-forward"
                            size={18}
                            color="#9CA3AF"
                            style={{ alignSelf: "center", marginRight: 8 }}
                          />
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  <Text style={styles.timestamp}>{item.timestamp}</Text>
                </View>
              </View>
            );
          }}
          ListFooterComponent={
            isTyping ? (
              <View style={styles.typingIndicator}>
                <Text style={styles.typingText}>Concierge is curating stays...</Text>
              </View>
            ) : null
          }
        />

        {/* Suggested Prompts */}
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={SUGGESTED_PROMPTS}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => `sug-${i}`}
            contentContainerStyle={styles.suggestionsContent}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionPill}
                activeOpacity={0.7}
                onPress={() => handleSend(item)}
              >
                <Ionicons name="sparkles" size={12} color="#FF5A1F" />
                <Text style={styles.suggestionText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Input Bar with Bottom Inset */}
        <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, 10) }]}>
          <TextInput
            style={styles.input}
            placeholder="Ask about pool villas, camps, group trips..."
            placeholderTextColor="#9CA3AF"
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
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
    borderWidth: 2,
    borderColor: "#FDBA74",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  titleText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  onlineBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 4,
    borderWidth: 0.5,
    borderColor: "#A7F3D0",
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
  },
  onlineText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#059669",
  },
  subtitleText: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 1,
  },
  whatsappBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    gap: 4,
  },
  whatsappBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#15803D",
  },
  chatArea: {
    flex: 1,
  },
  messagesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 14,
  },
  messageBubbleWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  userBubbleWrapper: {
    justifyContent: "flex-end",
  },
  botBubbleWrapper: {
    justifyContent: "flex-start",
  },
  botIconMini: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginBottom: 4,
  },
  bubble: {
    maxWidth: "80%",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  userBubble: {
    backgroundColor: "#FF5A1F",
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    color: "#111827",
    fontSize: 14,
    lineHeight: 20,
  },
  userMessageText: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
  timestamp: {
    fontSize: 10,
    color: "#9CA3AF",
    marginTop: 6,
    alignSelf: "flex-end",
  },
  recommendationsList: {
    marginTop: 12,
    width: "100%",
    gap: 10,
  },
  recSectionTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: "#6B7280",
    letterSpacing: 0.6,
  },
  recCard: {
    flexDirection: "row",
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  recImage: {
    width: 80,
    height: 74,
  },
  recInfo: {
    flex: 1,
    padding: 10,
    justifyContent: "center",
  },
  recTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
  },
  recLocation: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 2,
  },
  recPrice: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FF5A1F",
    marginTop: 4,
  },
  recNight: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "400",
  },
  typingIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  typingText: {
    fontSize: 12,
    color: "#9CA3AF",
    fontStyle: "italic",
  },
  suggestionsContainer: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
  },
  suggestionsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  suggestionPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFF7ED",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#FDBA74",
  },
  suggestionText: {
    fontSize: 12,
    color: "#EA580C",
    fontWeight: "600",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 10,
  },
  input: {
    flex: 1,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 16,
    color: "#111827",
    fontSize: 13,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FF5A1F",
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
});
