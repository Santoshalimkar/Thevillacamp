import React from "react";
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../theme/colors";

interface RazorpayModalProps {
  visible: boolean;
  orderData: {
    id: string;
    amount: number;
    currency?: string;
  } | null;
  propertyTitle: string;
  customerDetails: {
    name: string;
    email: string;
    contact: string;
  };
  razorpayKey: string;
  onSuccess: (data: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  onDismiss: () => void;
  onError: (err: any) => void;
}

export const RazorpayModal: React.FC<RazorpayModalProps> = ({
  visible,
  orderData,
  propertyTitle,
  customerDetails,
  razorpayKey,
  onSuccess,
  onDismiss,
  onError,
}) => {
  if (!visible || !orderData) return null;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
        <style>
          body {
            background-color: #0c0d0f;
            color: #ffffff;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            padding: 20px;
            box-sizing: border-box;
            text-align: center;
          }
          .spinner {
            border: 3px solid rgba(255, 90, 31, 0.2);
            border-top: 3px solid #ff5a1f;
            border-radius: 50%;
            width: 44px;
            height: 44px;
            animation: spin 0.8s linear infinite;
            margin-bottom: 20px;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          h2 { margin: 0 0 8px 0; font-size: 18px; }
          p { margin: 0; color: #a0a4b0; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="spinner"></div>
        <h2>Opening Razorpay Checkout</h2>
        <p>Connecting to secure payment gateway...</p>
        <script>
          window.onload = function() {
            var options = {
              "key": "${razorpayKey}",
              "amount": "${orderData.amount}",
              "currency": "${orderData.currency || "INR"}",
              "name": "THE VILLA CAMP",
              "description": "Booking for ${propertyTitle.replace(/"/g, "")}",
              "image": "https://res.cloudinary.com/db60uwvhk/image/upload/v1755287276/My%20Brand/Logo2_wkqqgs.png",
              "order_id": "${orderData.id}",
              "prefill": {
                "name": "${customerDetails.name}",
                "email": "${customerDetails.email}",
                "contact": "${customerDetails.contact}"
              },
              "theme": {
                "color": "#ff5a1f"
              },
              "handler": function (response){
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  status: 'success',
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature
                }));
              },
              "modal": {
                "ondismiss": function(){
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    status: 'dismissed'
                  }));
                }
              }
            };
            var rzp = new Razorpay(options);
            rzp.on('payment.failed', function (response){
              window.ReactNativeWebView.postMessage(JSON.stringify({
                status: 'error',
                error: response.error
              }));
            });
            rzp.open();
          };
        </script>
      </body>
    </html>
  `;

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.status === "success") {
        onSuccess({
          razorpay_payment_id: data.razorpay_payment_id,
          razorpay_order_id: data.razorpay_order_id,
          razorpay_signature: data.razorpay_signature,
        });
      } else if (data.status === "dismissed") {
        onDismiss();
      } else if (data.status === "error") {
        onError(data.error);
      }
    } catch (e) {
      onError(e);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Secure Payment</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={onDismiss}>
            <Ionicons name="close" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <WebView
          originWhitelist={["*"]}
          source={{ html: htmlContent }}
          onMessage={handleMessage}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          )}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.card,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
  },
  closeBtn: {
    padding: 4,
  },
  webview: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    position: "absolute",
    inset: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background,
  },
});
