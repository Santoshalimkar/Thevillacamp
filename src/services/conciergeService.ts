import { api } from "./api";
import { fetchProperties, PropertyItem } from "./propertyService";

export interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  recommendations?: PropertyItem[];
}

export const SUGGESTED_PROMPTS = [
  "Find luxury villas with private pool in Lonavala",
  "Pet-friendly campsites near Pawna Lake",
  "Budget-friendly cottages in Alibaug for 6 guests",
  "Weekend getaway with scenic mountain view",
];

export async function sendConciergeMessage(
  userText: string
): Promise<{ text: string; recommendations: PropertyItem[] }> {
  try {
    const textLower = userText.toLowerCase();

    // Determine category or search terms
    let search = "";
    if (textLower.includes("lonavala")) search = "Lonavala";
    else if (textLower.includes("alibaug")) search = "Alibaug";
    else if (textLower.includes("pawna")) search = "Pawna";
    else if (textLower.includes("igatpuri")) search = "Igatpuri";
    else if (textLower.includes("karjat")) search = "Karjat";
    else if (textLower.includes("mahabaleshwar")) search = "Mahabaleshwar";
    else if (textLower.includes("pool")) search = "Pool";
    else if (textLower.includes("camp")) search = "Camp";

    const res = await fetchProperties({ search, limit: 4 });
    const properties: PropertyItem[] = res?.data || [];

    let reply = `Here are some hand-picked stays tailored for your trip!`;
    if (search) {
      reply = `I found some breathtaking properties in and around ${search} for you. Would you like to check availability or see more details?`;
    }
    if (properties.length === 0) {
      reply = `I couldn't find exact matches for that query, but our 24/7 Concierge on WhatsApp can curate a custom villa or campsite for you right away!`;
    }

    return { text: reply, recommendations: properties };
  } catch {
    return {
      text: "I ran into a quick hiccup searching the live catalog. You can explore all our stays or connect with our concierge directly on WhatsApp!",
      recommendations: [],
    };
  }
}
