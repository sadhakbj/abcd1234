export type SupportedLang = "en" | "ja" | "ne";

export type LangOption = {
  code: SupportedLang;
  label: string;
  nativeLabel: string;
  flag: string;
};

export const LANGUAGES: LangOption[] = [
  { code: "en", label: "English", nativeLabel: "English", flag: "🇬🇧" },
  { code: "ja", label: "Japanese", nativeLabel: "日本語", flag: "🇯🇵" },
  { code: "ne", label: "Nepali", nativeLabel: "नेपाली", flag: "🇳🇵" },
];

export type UIStrings = {
  voiceGuide: string;
  guideDescription: string;
  begin: string;
  listening: string;
  processingRequest: string;
  speakNow: string;
  processing: string;
  speaking: string;
  cancel: string;
  youAsked: string;
  startNew: string;
  askAnother: string;
  youSaid: string;
  stepLabel: string;
  stepIntro: string;
};

export const UI_STRINGS: Record<SupportedLang, UIStrings> = {
  en: {
    voiceGuide: "Voice Guide Assistant",
    guideDescription: "I can help you complete your ward office procedures smoothly. Just tap the button and tell me what you need.",
    begin: "Begin",
    listening: "I am listening... Please speak clearly.",
    processingRequest: "Processing your request...",
    speakNow: "Speak now...",
    processing: "Processing...",
    speaking: "Speaking",
    cancel: "Cancel",
    youAsked: "You asked:",
    startNew: "Start New Request",
    askAnother: "Ask Another Question",
    youSaid: "You said",
    stepLabel: "Step",
    stepIntro: "Here is what you need to do.",
  },
  ja: {
    voiceGuide: "音声ガイドアシスタント",
    guideDescription: "区役所の手続きをスムーズに行うお手伝いをします。ボタンを押して、ご用件をお聞かせください。",
    begin: "開始",
    listening: "お聞きしています...はっきりお話しください。",
    processingRequest: "リクエストを処理中...",
    speakNow: "お話しください...",
    processing: "処理中...",
    speaking: "読み上げ中",
    cancel: "キャンセル",
    youAsked: "お問い合わせ内容：",
    startNew: "新しいリクエスト",
    askAnother: "別の質問をする",
    youSaid: "お問い合わせ",
    stepLabel: "ステップ",
    stepIntro: "必要な手順は以下の通りです。",
  },
  ne: {
    voiceGuide: "भ्वाइस गाइड सहायक",
    guideDescription: "म तपाईंलाई वार्ड कार्यालयको काम सहज रूपमा पूरा गर्न मद्दत गर्न सक्छु। बटन थिच्नुहोस् र तपाईंलाई के चाहिन्छ भन्नुहोस्।",
    begin: "सुरु गर्नुहोस्",
    listening: "म सुनिरहेको छु... कृपया स्पष्ट बोल्नुहोस्।",
    processingRequest: "तपाईंको अनुरोध प्रशोधन गर्दै...",
    speakNow: "बोल्नुहोस्...",
    processing: "प्रशोधन गर्दै...",
    speaking: "बोल्दै",
    cancel: "रद्द गर्नुहोस्",
    youAsked: "तपाईंले सोध्नुभयो:",
    startNew: "नयाँ अनुरोध",
    askAnother: "अर्को प्रश्न सोध्नुहोस्",
    youSaid: "तपाईंले भन्नुभयो",
    stepLabel: "चरण",
    stepIntro: "यहाँ तपाईंले गर्नुपर्ने कुराहरू छन्।",
  },
};

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

type KnowledgeBase = Record<string, IntentMatch>;

const KNOWLEDGE_BASE: Record<SupportedLang, KnowledgeBase> = {
  en: {
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
    mynumber_pin_reset: {
      intent: "My Number Card — PIN Reset",
      welcomeMessage:
        "No worries! I can guide you through resetting your My Number Card PIN. Please follow the steps below.",
      steps: [
        {
          id: "step-1",
          title: "Bring Your My Number Card",
          description:
            "Make sure you have your My Number Card (マイナンバーカード) with you. You cannot reset the PIN without presenting the physical card.",
          iconType: "document",
          color: "amber",
        },
        {
          id: "step-2",
          title: "Go to the 6th Floor — My Number Card Counter",
          description:
            "Take the elevator to the 6th floor and head to the My Number Card Counter. Look for the signs that say マイナンバーカード窓口.",
          iconType: "location",
          color: "blue",
        },
        {
          id: "step-3",
          title: "Fill Out the PIN Reset Application",
          description:
            "At the counter, you will receive a PIN Reset Application form. Fill it out and submit it along with your My Number Card. Staff will verify your identity.",
          iconType: "document",
          color: "emerald",
          actionText: "Get Form at 6F Counter",
        },
        {
          id: "step-4",
          title: "Set Your New PIN",
          description:
            "Once verified, you will be asked to set a new PIN on the spot using a keypad. Your My Number Card will be returned to you immediately after.",
          iconType: "document",
          color: "rose",
        },
      ],
      interactivePrompt: {
        question: "Do you know which PIN you need to reset?",
        subtitle:
          "My Number Card has two PINs: a 4-digit PIN (for convenience store services) and a 6-16 digit Signature PIN (for e-Tax, online applications). The staff can help you reset either or both.",
        iconType: "help",
        yesText: "Yes, I know which one",
        noText: "Not sure, I need help",
      },
    },
    child_subsidy: {
      intent: "Child Subsidy Application (児童手当)",
      welcomeMessage:
        "I can help you apply for Child Subsidy (児童手当). This is a monthly allowance for families raising children under 15. Please follow the steps below.",
      steps: [
        {
          id: "step-1",
          title: "Prepare Required Documents",
          description:
            "You will need: your health insurance card, a bank passbook or card (for the account where you want the subsidy deposited), your My Number Card or notification card, and your child's health insurance card if different from yours.",
          iconType: "document",
          color: "amber",
        },
        {
          id: "step-2",
          title: "Fill Out the Application Form",
          description:
            "Pick up the Child Subsidy Application form (児童手当認定請求書) at the 2nd floor Children & Families Counter. Fill in your details, your child's information, and your bank account.",
          iconType: "document",
          color: "blue",
          actionText: "Get Form at 2F Counter",
        },
        {
          id: "step-3",
          title: "Submit at the 2nd Floor — Children & Families Section",
          description:
            "Bring your completed form and all required documents to the Children & Families Section (子ども・家庭課) on the 2nd floor. Processing usually takes about 15 minutes.",
          iconType: "location",
          color: "emerald",
        },
      ],
      interactivePrompt: {
        question: "Have you recently moved to Kita-ku?",
        subtitle:
          "If you just moved here, you need to apply within 15 days of your move-in date to avoid missing a month's payment. We can also help with your address change at the same time.",
        iconType: "help",
        yesText: "Yes, I just moved",
        noText: "No, I already live here",
      },
    },
    resident_certificate: {
      intent: "Resident Certificate (住民票)",
      welcomeMessage:
        "I can help you get a copy of your Resident Certificate (住民票の写し). This is one of the most common requests. Please follow the steps below.",
      steps: [
        {
          id: "step-1",
          title: "Bring Your ID",
          description:
            "You will need a valid photo ID such as your My Number Card, driver's license, passport, or residence card (在留カード). If you are requesting on behalf of someone else, you will also need a power of attorney (委任状).",
          iconType: "document",
          color: "amber",
        },
        {
          id: "step-2",
          title: "Fill Out the Request Form",
          description:
            "Pick up the Resident Certificate Request form (住民票の写し等交付申請書) at the 1st floor Information Desk. Select which information you need included (household members, My Number, etc.).",
          iconType: "document",
          color: "blue",
          actionText: "Get Form at Info Desk",
        },
        {
          id: "step-3",
          title: "Submit at Window 2 — Certificate Counter",
          description:
            "Submit your completed form and ID at Window 2 on the 1st floor (Certificate Issuance Counter). The fee is ¥300 per copy. Payment is by cash only.",
          iconType: "location",
          color: "emerald",
        },
      ],
      interactivePrompt: {
        question: "Do you have a My Number Card?",
        subtitle:
          "If you have a My Number Card, you can also get Resident Certificates at any convenience store (7-Eleven, Lawson, FamilyMart) using the multifunction copier — available 6:30 AM to 11:00 PM, including weekends. The fee is only ¥200.",
        iconType: "card",
        yesText: "Yes, I have it",
        noText: "No, I don't",
      },
    },
    unsupported: {
      intent: "Unsupported Request",
      welcomeMessage:
        "I'm sorry, I couldn't understand your request. I can help you with address changes, My Number Card PIN reset, child subsidy applications, or resident certificates. Please try again.",
      steps: [],
      isUnsupported: true,
    },
  },

  ja: {
    change_address: {
      intent: "住所変更 — 北区への転入",
      welcomeMessage:
        "北区へようこそ！住所変更届の手続きをお手伝いします。以下の手順に従ってください。",
      steps: [
        {
          id: "step-1",
          title: "転出証明書を準備する",
          description:
            "以前お住まいの区役所・市役所で発行された転出証明書が必要です。まだ取得していない場合は、先に以前の区役所で手続きを行ってください。",
          iconType: "document",
          color: "amber",
        },
        {
          id: "step-2",
          title: "転入届を記入する",
          description:
            "総合案内で配布している転入届の用紙に記入してください。転入届は北区での新しい住所を登録するためのものです。転入から14日以内に届出が必要です。",
          iconType: "document",
          color: "blue",
          actionText: "総合案内で用紙を受け取る",
        },
        {
          id: "step-3",
          title: "3番窓口（住民登録）で提出",
          description:
            "記入済みの転入届と転出証明書を、1階の3番窓口（住民登録カウンター）にお持ちください。",
          iconType: "location",
          color: "emerald",
        },
      ],
      interactivePrompt: {
        question: "マイナンバーカードをお持ちですか？",
        subtitle:
          "マイナンバーカードをお持ちいただければ、同じ窓口で住所変更も行えますので、再度ご来所いただく必要がなくなります。",
        iconType: "card",
        yesText: "はい、持っています",
        noText: "いいえ、今日は持っていません",
      },
    },
    mynumber_pin_reset: {
      intent: "マイナンバーカード — 暗証番号リセット",
      welcomeMessage:
        "マイナンバーカードの暗証番号リセットをご案内いたします。以下の手順に従ってください。",
      steps: [
        {
          id: "step-1",
          title: "マイナンバーカードをご持参ください",
          description:
            "マイナンバーカードをお持ちください。カードがないと暗証番号のリセットはできません。",
          iconType: "document",
          color: "amber",
        },
        {
          id: "step-2",
          title: "6階へ — マイナンバーカード窓口",
          description:
            "エレベーターで6階に上がり、マイナンバーカード窓口にお越しください。「マイナンバーカード窓口」の表示をお探しください。",
          iconType: "location",
          color: "blue",
        },
        {
          id: "step-3",
          title: "暗証番号リセット申請書を記入",
          description:
            "窓口で暗証番号リセット申請書を受け取り、記入してマイナンバーカードと一緒に提出してください。本人確認が行われます。",
          iconType: "document",
          color: "emerald",
          actionText: "6階窓口で用紙を受け取る",
        },
        {
          id: "step-4",
          title: "新しい暗証番号を設定",
          description:
            "本人確認後、その場でキーパッドを使って新しい暗証番号を設定します。設定後すぐにカードが返却されます。",
          iconType: "document",
          color: "rose",
        },
      ],
      interactivePrompt: {
        question: "どの暗証番号をリセットしますか？",
        subtitle:
          "マイナンバーカードには2種類の暗証番号があります：4桁の利用者証明用暗証番号（コンビニ等のサービス用）と、6〜16桁の署名用電子証明書暗証番号（e-Tax等用）。どちらもリセットできます。",
        iconType: "help",
        yesText: "わかっています",
        noText: "わかりません、助けてください",
      },
    },
    child_subsidy: {
      intent: "児童手当の申請",
      welcomeMessage:
        "児童手当の申請をお手伝いします。15歳以下のお子さまを養育するご家庭が対象の月額手当です。以下の手順に従ってください。",
      steps: [
        {
          id: "step-1",
          title: "必要書類を準備する",
          description:
            "健康保険証、振込先の通帳またはキャッシュカード、マイナンバーカードまたは通知カード、お子さまの健康保険証（別の場合）をご用意ください。",
          iconType: "document",
          color: "amber",
        },
        {
          id: "step-2",
          title: "申請書を記入する",
          description:
            "2階の子ども・家庭課窓口で児童手当認定請求書を受け取り、ご自身の情報、お子さまの情報、振込先口座を記入してください。",
          iconType: "document",
          color: "blue",
          actionText: "2階窓口で用紙を受け取る",
        },
        {
          id: "step-3",
          title: "2階 子ども・家庭課で提出",
          description:
            "記入済みの申請書と必要書類を2階の子ども・家庭課にお持ちください。手続きは約15分で完了します。",
          iconType: "location",
          color: "emerald",
        },
      ],
      interactivePrompt: {
        question: "最近北区に転入されましたか？",
        subtitle:
          "転入された場合、転入日から15日以内に申請しないと1ヶ月分の支給を逃す可能性があります。住所変更も同時にお手伝いできます。",
        iconType: "help",
        yesText: "はい、最近転入しました",
        noText: "いいえ、以前から住んでいます",
      },
    },
    resident_certificate: {
      intent: "住民票の写しの取得",
      welcomeMessage:
        "住民票の写しの取得をお手伝いします。最もよくあるお問い合わせの一つです。以下の手順に従ってください。",
      steps: [
        {
          id: "step-1",
          title: "本人確認書類をお持ちください",
          description:
            "マイナンバーカード、運転免許証、パスポート、在留カードなどの写真付き身分証明書が必要です。代理人の場合は委任状も必要です。",
          iconType: "document",
          color: "amber",
        },
        {
          id: "step-2",
          title: "申請書を記入する",
          description:
            "1階の総合案内で住民票の写し等交付申請書を受け取ってください。必要な記載事項（世帯員、マイナンバーなど）を選択してください。",
          iconType: "document",
          color: "blue",
          actionText: "総合案内で用紙を受け取る",
        },
        {
          id: "step-3",
          title: "2番窓口で提出 — 証明書発行カウンター",
          description:
            "記入済みの申請書と本人確認書類を1階の2番窓口（証明書発行カウンター）に提出してください。手数料は1通300円で、現金のみです。",
          iconType: "location",
          color: "emerald",
        },
      ],
      interactivePrompt: {
        question: "マイナンバーカードをお持ちですか？",
        subtitle:
          "マイナンバーカードがあれば、コンビニ（セブンイレブン、ローソン、ファミリーマート）のマルチコピー機でも住民票を取得できます。朝6:30〜夜23:00まで土日も利用可能で、手数料は200円です。",
        iconType: "card",
        yesText: "はい、持っています",
        noText: "いいえ、持っていません",
      },
    },
    unsupported: {
      intent: "対応外のリクエスト",
      welcomeMessage:
        "申し訳ございません。住所変更、マイナンバーカードの暗証番号リセット、児童手当の申請、住民票の取得についてお手伝いできます。もう一度お試しください。",
      steps: [],
      isUnsupported: true,
    },
  },

  ne: {
    change_address: {
      intent: "ठेगाना परिवर्तन — किता-कुमा बसाइँ सराइ",
      welcomeMessage:
        "किता-कुमा स्वागत छ! म तपाईंलाई ठेगाना परिवर्तन दर्ता पूरा गर्न मद्दत गर्न सक्छु। कृपया तलका चरणहरू पालना गर्नुहोस्।",
      steps: [
        {
          id: "step-1",
          title: "बसाइँ सराइ प्रमाणपत्र तयार गर्नुहोस्",
          description:
            "तपाईंलाई पहिलेको वार्ड वा सिटी कार्यालयबाट जारी गरिएको बसाइँ सराइ प्रमाणपत्र (転出証明書) चाहिन्छ। यदि तपाईंले अझै प्राप्त गर्नुभएको छैन भने, पहिले पुरानो वार्ड कार्यालयमा जानुपर्छ।",
          iconType: "document",
          color: "amber",
        },
        {
          id: "step-2",
          title: "बसाइँ सराइ सूचना फारम भर्नुहोस्",
          description:
            "सूचना डेस्कमा उपलब्ध बसाइँ सराइ सूचना फारम (転入届) भर्नुहोस्। यसले किता-कुमा तपाईंको नयाँ ठेगाना दर्ता गर्छ। बसाइँ सरेको १४ दिन भित्र पेश गर्नुपर्छ।",
          iconType: "document",
          color: "blue",
          actionText: "सूचना डेस्कमा फारम लिनुहोस्",
        },
        {
          id: "step-3",
          title: "विन्डो ३ मा पेश गर्नुहोस् — बासिन्दा दर्ता",
          description:
            "भरिएको बसाइँ सराइ सूचना फारम र बसाइँ सराइ प्रमाणपत्र पहिलो तल्लाको विन्डो ३ (बासिन्दा दर्ता काउन्टर) मा लैजानुहोस्।",
          iconType: "location",
          color: "emerald",
        },
      ],
      interactivePrompt: {
        question: "के तपाईंसँग आज माइ नम्बर कार्ड छ?",
        subtitle:
          "माइ नम्बर कार्ड ल्याउनुभयो भने, उही काउन्टरमा ठेगाना अपडेट गर्न सकिन्छ, जसले तपाईंलाई फेरि आउन नपर्ने बनाउँछ।",
        iconType: "card",
        yesText: "छ, मसँग छ",
        noText: "छैन, आज छैन",
      },
    },
    mynumber_pin_reset: {
      intent: "माइ नम्बर कार्ड — PIN रिसेट",
      welcomeMessage:
        "म तपाईंलाई माइ नम्बर कार्डको PIN रिसेट गर्न मद्दत गर्न सक्छु। कृपया तलका चरणहरू पालना गर्नुहोस्।",
      steps: [
        {
          id: "step-1",
          title: "माइ नम्बर कार्ड ल्याउनुहोस्",
          description:
            "तपाईंसँग माइ नम्बर कार्ड (マイナンバーカード) अवश्य हुनुपर्छ। कार्ड बिना PIN रिसेट गर्न सकिँदैन।",
          iconType: "document",
          color: "amber",
        },
        {
          id: "step-2",
          title: "६ औं तल्लामा जानुहोस् — माइ नम्बर कार्ड काउन्टर",
          description:
            "लिफ्टमा ६ औं तल्लामा जानुहोस् र माइ नम्बर कार्ड काउन्टरमा जानुहोस्। 「マイナンバーカード窓口」 लेखिएको साइनबोर्ड खोज्नुहोस्।",
          iconType: "location",
          color: "blue",
        },
        {
          id: "step-3",
          title: "PIN रिसेट आवेदन फारम भर्नुहोस्",
          description:
            "काउन्टरमा PIN रिसेट आवेदन फारम लिनुहोस्, भर्नुहोस् र माइ नम्बर कार्डसँग पेश गर्नुहोस्। कर्मचारीले तपाईंको पहिचान प्रमाणित गर्नेछन्।",
          iconType: "document",
          color: "emerald",
          actionText: "६ औं तल्लाको काउन्टरमा फारम लिनुहोस्",
        },
        {
          id: "step-4",
          title: "नयाँ PIN सेट गर्नुहोस्",
          description:
            "प्रमाणित भएपछि, तपाईंले त्यहीँ कीप्याड प्रयोग गरेर नयाँ PIN सेट गर्नुहुनेछ। सेट गरेपछि कार्ड तुरुन्तै फिर्ता दिइनेछ।",
          iconType: "document",
          color: "rose",
        },
      ],
      interactivePrompt: {
        question: "तपाईंलाई कुन PIN रिसेट गर्नुपर्छ थाहा छ?",
        subtitle:
          "माइ नम्बर कार्डमा दुई प्रकारका PIN छन्: ४ अंकको PIN (कन्भिनियन्स स्टोर सेवाहरूका लागि) र ६-१६ अंकको हस्ताक्षर PIN (e-Tax, अनलाइन आवेदनका लागि)। कर्मचारीले कुनै एक वा दुवै रिसेट गर्न मद्दत गर्न सक्छन्।",
        iconType: "help",
        yesText: "थाहा छ",
        noText: "थाहा छैन, मद्दत चाहिन्छ",
      },
    },
    child_subsidy: {
      intent: "बाल भत्ता आवेदन (児童手当)",
      welcomeMessage:
        "म तपाईंलाई बाल भत्ता (児童手当) को लागि आवेदन गर्न मद्दत गर्न सक्छु। यो १५ वर्ष मुनिका बालबालिका पाल्ने परिवारहरूको लागि मासिक भत्ता हो। कृपया तलका चरणहरू पालना गर्नुहोस्।",
      steps: [
        {
          id: "step-1",
          title: "आवश्यक कागजातहरू तयार गर्नुहोस्",
          description:
            "तपाईंलाई चाहिन्छ: स्वास्थ्य बीमा कार्ड, बैंक पासबुक वा कार्ड (भत्ता जम्मा हुने खाता), माइ नम्बर कार्ड वा सूचना कार्ड, र बच्चाको स्वास्थ्य बीमा कार्ड (फरक भएमा)।",
          iconType: "document",
          color: "amber",
        },
        {
          id: "step-2",
          title: "आवेदन फारम भर्नुहोस्",
          description:
            "२ औं तल्लाको बालबालिका र परिवार काउन्टरमा बाल भत्ता मान्यता अनुरोध फारम (児童手当認定請求書) लिनुहोस्। आफ्नो विवरण, बच्चाको जानकारी र बैंक खाता भर्नुहोस्।",
          iconType: "document",
          color: "blue",
          actionText: "२ औं तल्लाको काउन्टरमा फारम लिनुहोस्",
        },
        {
          id: "step-3",
          title: "२ औं तल्ला — बालबालिका र परिवार विभागमा पेश गर्नुहोस्",
          description:
            "भरिएको आवेदन फारम र सबै आवश्यक कागजातहरू २ औं तल्लाको बालबालिका र परिवार विभाग (子ども・家庭課) मा लैजानुहोस्। प्रशोधनमा करिब १५ मिनेट लाग्छ।",
          iconType: "location",
          color: "emerald",
        },
      ],
      interactivePrompt: {
        question: "के तपाईं भर्खरै किता-कुमा बसाइँ सर्नुभएको हो?",
        subtitle:
          "यदि भर्खरै सर्नुभएको हो भने, बसाइँ सरेको मितिबाट १५ दिन भित्र आवेदन गर्नुपर्छ नत्र एक महिनाको भुक्तानी छुट्न सक्छ। हामी ठेगाना परिवर्तनमा पनि सँगसँगै मद्दत गर्न सक्छौं।",
        iconType: "help",
        yesText: "हो, भर्खरै सरेँ",
        noText: "होइन, पहिलेदेखि बस्छु",
      },
    },
    resident_certificate: {
      intent: "बासिन्दा प्रमाणपत्र (住民票)",
      welcomeMessage:
        "म तपाईंलाई बासिन्दा प्रमाणपत्र (住民票の写し) को प्रतिलिपि प्राप्त गर्न मद्दत गर्न सक्छु। यो सबैभन्दा सामान्य अनुरोधहरू मध्ये एक हो। कृपया तलका चरणहरू पालना गर्नुहोस्।",
      steps: [
        {
          id: "step-1",
          title: "परिचयपत्र ल्याउनुहोस्",
          description:
            "माइ नम्बर कार्ड, सवारी चालक अनुमतिपत्र, राहदानी वा बसोबास कार्ड (在留カード) जस्ता फोटो सहितको वैध परिचयपत्र चाहिन्छ। अर्काको तर्फबाट अनुरोध गर्दा अख्तियारनामा (委任状) पनि चाहिन्छ।",
          iconType: "document",
          color: "amber",
        },
        {
          id: "step-2",
          title: "अनुरोध फारम भर्नुहोस्",
          description:
            "पहिलो तल्लाको सूचना डेस्कमा बासिन्दा प्रमाणपत्र अनुरोध फारम (住民票の写し等交付申請書) लिनुहोस्। कुन जानकारी समावेश गर्ने (परिवारका सदस्य, माइ नम्बर आदि) छान्नुहोस्।",
          iconType: "document",
          color: "blue",
          actionText: "सूचना डेस्कमा फारम लिनुहोस्",
        },
        {
          id: "step-3",
          title: "विन्डो २ मा पेश गर्नुहोस् — प्रमाणपत्र काउन्टर",
          description:
            "भरिएको फारम र परिचयपत्र पहिलो तल्लाको विन्डो २ (प्रमाणपत्र जारी काउन्टर) मा पेश गर्नुहोस्। शुल्क प्रति प्रतिलिपि ¥३०० हो। नगद मात्र स्वीकृत छ।",
          iconType: "location",
          color: "emerald",
        },
      ],
      interactivePrompt: {
        question: "के तपाईंसँग माइ नम्बर कार्ड छ?",
        subtitle:
          "माइ नम्बर कार्ड भएमा, कन्भिनियन्स स्टोर (सेभन-इलेभन, लसन, फ्यामिली मार्ट) को मल्टिफंक्शन कपियरबाट पनि बासिन्दा प्रमाणपत्र लिन सकिन्छ — बिहान ६:३० देखि राति ११:०० सम्म, शनिबार आइतबार पनि। शुल्क ¥२०० मात्र हो।",
        iconType: "card",
        yesText: "छ, मसँग छ",
        noText: "छैन",
      },
    },
    unsupported: {
      intent: "समर्थित नभएको अनुरोध",
      welcomeMessage:
        "माफ गर्नुहोस्, तपाईंको अनुरोध बुझ्न सकिएन। म ठेगाना परिवर्तन, माइ नम्बर कार्ड PIN रिसेट, बाल भत्ता आवेदन, वा बासिन्दा प्रमाणपत्रमा मद्दत गर्न सक्छु। कृपया फेरि प्रयास गर्नुहोस्।",
      steps: [],
      isUnsupported: true,
    },
  },
};

export const INTENT_DESCRIPTIONS = [
  { key: "change_address", description: "The user wants to change/register their address, report moving in or out, relocate to Kita-ku, or do residence registration." },
  { key: "mynumber_pin_reset", description: "The user wants to reset their My Number Card PIN, forgot their password/PIN, or has issues with their My Number Card authentication." },
  { key: "child_subsidy", description: "The user wants to apply for child subsidy/allowance (児童手当), receive financial support for raising children, or ask about child-related benefits." },
  { key: "resident_certificate", description: "The user wants to get a copy of their resident certificate (住民票), proof of residence, or a certified copy of their resident record." },
  { key: "unsupported", description: "The request does not match any supported ward office procedure." },
] as const;

export function getIntent(key: string, lang: SupportedLang): IntentMatch {
  const kb = KNOWLEDGE_BASE[lang];
  return kb[key] ?? kb["unsupported"];
}
