export type Step = {
  id: string;
  title: string;
  description: string;
  iconType: "document" | "location";
  color: "blue" | "emerald" | "amber" | "rose";
  actionText?: string;
};

export type InteractivePrompt = {
  question: string;
  subtitle: string;
  iconType: "card" | "help";
  yesText: string;
  noText: string;
};

export type IntentMatch = {
  intent: string;
  welcomeMessage: string;
  steps: Step[];
  interactivePrompt?: InteractivePrompt;
  isUnsupported?: boolean;
};

const KNOWLEDGE_BASE: Record<string, IntentMatch> = {
  change_address: {
    intent: "Address Change — Moving to Kita-ku",
    welcomeMessage:
      "Welcome to Kita-ku! I can help you complete your address change registration. Please follow the steps below.",
    steps: [
      {
        id: "step-1",
        title: "Prepare Your Moving-Out Certificate",
        description:
          "You will need a Moving-Out Certificate (転出証明書) issued by your previous ward or city office. If you have not obtained it yet, you must visit your old ward office first before proceeding.",
        iconType: "document",
        color: "amber",
      },
      {
        id: "step-2",
        title: "Fill Out the Moving-In Notification Form",
        description:
          "Complete the Moving-In Notification form (転入届) available at the Information Desk. This registers your new address in Kita-ku. You must submit it within 14 days of moving in.",
        iconType: "document",
        color: "blue",
        actionText: "Get Form at Info Desk",
      },
      {
        id: "step-3",
        title: "Submit at Window 3 — Resident Registration",
        description:
          "Bring your completed Moving-In Notification form and your Moving-Out Certificate to Window 3 on the 1st floor (Resident Registration Counter).",
        iconType: "location",
        color: "emerald",
      },
    ],
    interactivePrompt: {
      question: "Do you have your My Number Card with you today?",
      subtitle:
        "Bringing your My Number Card allows us to update your address on it at the same counter, saving you an extra visit.",
      iconType: "card",
      yesText: "Yes, I have it",
      noText: "No, not today",
    },
  },

  unsupported: {
    intent: "Unsupported Request",
    welcomeMessage:
      "I'm sorry, I currently only support address change for residents moving to Kita-ku. Please ask me about changing your address.",
    steps: [],
    isUnsupported: true,
  },
};

export function matchQuery(transcript: string): IntentMatch {
  const lower = transcript.toLowerCase();

  const isAddressChange =
    lower.includes("address") ||
    lower.includes("change address") ||
    lower.includes("moved") ||
    lower.includes("moving") ||
    lower.includes("move") ||
    lower.includes("kita-ku") ||
    lower.includes("kita ku") ||
    lower.includes("kitaku") ||
    lower.includes("new resident") ||
    lower.includes("relocat") ||
    lower.includes("transfer") ||
    lower.includes("register") ||
    lower.includes("registration") ||
    lower.includes("転入") ||
    lower.includes("転出") ||
    lower.includes("住所変更");

  if (isAddressChange) {
    return KNOWLEDGE_BASE["change_address"];
  }

  return KNOWLEDGE_BASE["unsupported"];
}
