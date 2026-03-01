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
};

const KNOWLEDGE_BASE: Record<string, IntentMatch> = {
  moving_in: {
    intent: "Moving In",
    welcomeMessage:
      "Welcome to Kita-ku! Here are your next steps for moving in.",
    steps: [
      {
        id: "step-1",
        title: "Fill out Notification Form",
        description:
          "Complete the 'Moving-in Notification' form required for new residents of Kita-ku.",
        iconType: "document",
        color: "blue",
        actionText: "Complete Form on Tablet",
      },
      {
        id: "step-2",
        title: "Head to Window #4",
        description:
          "Once your form is complete, please take it to the 2nd floor and proceed to Window number 4 for submission.",
        iconType: "location",
        color: "emerald",
      },
    ],
    interactivePrompt: {
      question: "Do you have your My Number Card with you today?",
      subtitle: "We can speed up your application if you have it.",
      iconType: "card",
      yesText: "Yes, I do",
      noText: "No, I don't",
    },
  },
  taxes: {
    intent: "Taxes",
    welcomeMessage: "Let's get your tax documents sorted.",
    steps: [
      {
        id: "step-1",
        title: "Get a Number Ticket",
        description:
          "Please take a ticket from the machine near the entrance for the Taxation Department.",
        iconType: "document",
        color: "amber",
      },
      {
        id: "step-2",
        title: "Wait at Area B",
        description:
          "Proceed to waiting Area B on the 3rd floor. We will call your number shortly.",
        iconType: "location",
        color: "blue",
      },
    ],
  },
  my_number_newborn: {
    intent: "Newborn My Number Card",
    welcomeMessage:
      "Congratulations on your new baby! Let's get their My Number Card application started.",
    steps: [
      {
        id: "step-1",
        title: "Birth Registration Verification",
        description:
          "First, we need to confirm the Birth Registration has been processed at the Family Registry counter (Window 7).",
        iconType: "document",
        color: "rose",
        actionText: "Check Status",
      },
      {
        id: "step-2",
        title: "Photo Capture",
        description:
          "We can take a photo of your baby for the card right here, or you can use a photo you brought.",
        iconType: "document",
        color: "blue",
      },
      {
        id: "step-3",
        title: "Application Submission",
        description:
          "Submit the 'Individual Number Card Application' form at Window 5.",
        iconType: "location",
        color: "emerald",
      },
    ],
    interactivePrompt: {
      question: "Do you have the baby's photo with you?",
      subtitle: "If not, we can take one now for free.",
      iconType: "card",
      yesText: "Yes, I have it",
      noText: "No, take it now",
    },
  },
  unknown: {
    intent: "Unknown",
    welcomeMessage: "I'm sorry, I couldn't understand your request.",
    steps: [
      {
        id: "step-1",
        title: "Speak to a Human Guide",
        description:
          "Please approach the general information desk right behind you for assistance.",
        iconType: "location",
        color: "rose",
      },
    ],
  },
};

export function matchQuery(transcript: string): IntentMatch {
  const lower = transcript.toLowerCase();

  if (
    lower.includes("moved") ||
    lower.includes("moving") ||
    lower.includes("kita-ku") ||
    lower.includes("new resident")
  ) {
    return KNOWLEDGE_BASE["moving_in"];
  }

  if (
    lower.includes("tax") ||
    lower.includes("taxes") ||
    lower.includes("payment")
  ) {
    return KNOWLEDGE_BASE["taxes"];
  }

  if (
    (lower.includes("my number") || lower.includes("mynumber")) &&
    (lower.includes("baby") ||
      lower.includes("born") ||
      lower.includes("child"))
  ) {
    return KNOWLEDGE_BASE["my_number_newborn"];
  }

  return KNOWLEDGE_BASE["unknown"];
}
