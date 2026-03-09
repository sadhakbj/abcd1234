export type SupportedLang = "en" | "ja" | "zh" | "ko" | "vi" | "ne";

export type LangOption = {
  code: SupportedLang;
  label: string;
  nativeLabel: string;
  flag: string;
};

export const LANGUAGES: LangOption[] = [
  { code: "en", label: "English", nativeLabel: "English", flag: "🇬🇧" },
  { code: "ja", label: "Japanese", nativeLabel: "日本語", flag: "🇯🇵" },
  { code: "zh", label: "Chinese", nativeLabel: "中文", flag: "🇨🇳" },
  { code: "ko", label: "Korean", nativeLabel: "한국어", flag: "🇰🇷" },
  { code: "vi", label: "Vietnamese", nativeLabel: "Tiếng Việt", flag: "🇻🇳" },
  { code: "ne", label: "Nepali", nativeLabel: "नेपाली", flag: "🇳🇵" },
];

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
    unsupported: {
      intent: "Unsupported Request",
      welcomeMessage:
        "I'm sorry, I couldn't understand your request. I can help you with address change registration or My Number Card PIN reset. Please try again.",
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
    unsupported: {
      intent: "対応外のリクエスト",
      welcomeMessage:
        "申し訳ございません。住所変更またはマイナンバーカードの暗証番号リセットについてお手伝いできます。もう一度お試しください。",
      steps: [],
      isUnsupported: true,
    },
  },

  zh: {
    change_address: {
      intent: "地址变更 — 搬入北区",
      welcomeMessage:
        "欢迎来到北区！我可以帮您办理地址变更登记。请按照以下步骤操作。",
      steps: [
        {
          id: "step-1",
          title: "准备迁出证明",
          description:
            "您需要由之前的区役所或市役所出具的迁出证明（転出証明書）。如果还没有取得，请先前往之前的区役所办理。",
          iconType: "document",
          color: "amber",
        },
        {
          id: "step-2",
          title: "填写迁入通知表",
          description:
            "在服务台领取迁入通知表（転入届）并填写。此表用于在北区登记您的新地址。必须在搬入后14天内提交。",
          iconType: "document",
          color: "blue",
          actionText: "在服务台领取表格",
        },
        {
          id: "step-3",
          title: "在3号窗口提交 — 居民登记",
          description:
            "将填写好的迁入通知表和迁出证明提交至1楼的3号窗口（居民登记柜台）。",
          iconType: "location",
          color: "emerald",
        },
      ],
      interactivePrompt: {
        question: "您今天带了My Number卡吗？",
        subtitle:
          "如果带了My Number卡，可以在同一窗口更新地址，免去再次来访。",
        iconType: "card",
        yesText: "是的，我带了",
        noText: "没有带",
      },
    },
    mynumber_pin_reset: {
      intent: "My Number卡 — 密码重置",
      welcomeMessage:
        "我可以帮您重置My Number卡的密码。请按照以下步骤操作。",
      steps: [
        {
          id: "step-1",
          title: "携带您的My Number卡",
          description:
            "请务必携带您的My Number卡（マイナンバーカード）。没有卡片无法重置密码。",
          iconType: "document",
          color: "amber",
        },
        {
          id: "step-2",
          title: "前往6楼 — My Number卡窗口",
          description:
            "乘电梯到6楼，前往My Number卡窗口。请寻找标有「マイナンバーカード窓口」的指示牌。",
          iconType: "location",
          color: "blue",
        },
        {
          id: "step-3",
          title: "填写密码重置申请表",
          description:
            "在窗口领取密码重置申请表，填写后连同My Number卡一起提交。工作人员会进行身份验证。",
          iconType: "document",
          color: "emerald",
          actionText: "在6楼窗口领取表格",
        },
        {
          id: "step-4",
          title: "设置新密码",
          description:
            "验证通过后，您可以当场使用键盘设置新密码。设置完成后卡片会立即归还。",
          iconType: "document",
          color: "rose",
        },
      ],
      interactivePrompt: {
        question: "您知道需要重置哪个密码吗？",
        subtitle:
          "My Number卡有两个密码：4位数密码（用于便利店等服务）和6-16位签名密码（用于e-Tax等在线申请）。工作人员可以帮您重置任一或两个密码。",
        iconType: "help",
        yesText: "知道",
        noText: "不确定，需要帮助",
      },
    },
    unsupported: {
      intent: "不支持的请求",
      welcomeMessage:
        "抱歉，我无法理解您的请求。我可以帮您办理地址变更或My Number卡密码重置。请再试一次。",
      steps: [],
      isUnsupported: true,
    },
  },

  ko: {
    change_address: {
      intent: "주소 변경 — 기타구로 전입",
      welcomeMessage:
        "기타구에 오신 것을 환영합니다! 주소 변경 등록을 도와드리겠습니다. 아래 단계를 따라주세요.",
      steps: [
        {
          id: "step-1",
          title: "전출 증명서 준비",
          description:
            "이전에 거주하시던 구청 또는 시청에서 발급한 전출 증명서(転出証明書)가 필요합니다. 아직 받지 못하셨다면 이전 구청에서 먼저 수속해 주세요.",
          iconType: "document",
          color: "amber",
        },
        {
          id: "step-2",
          title: "전입신고서 작성",
          description:
            "안내 데스크에서 전입신고서(転入届) 용지를 받아 작성해 주세요. 이 신고서로 기타구에 새 주소를 등록합니다. 전입 후 14일 이내에 제출해야 합니다.",
          iconType: "document",
          color: "blue",
          actionText: "안내 데스크에서 용지 받기",
        },
        {
          id: "step-3",
          title: "3번 창구에서 제출 — 주민 등록",
          description:
            "작성한 전입신고서와 전출 증명서를 1층 3번 창구(주민등록 카운터)에 제출해 주세요.",
          iconType: "location",
          color: "emerald",
        },
      ],
      interactivePrompt: {
        question: "마이넘버 카드를 가지고 오셨나요?",
        subtitle:
          "마이넘버 카드를 가지고 오시면 같은 창구에서 주소 변경도 가능하여 재방문할 필요가 없습니다.",
        iconType: "card",
        yesText: "네, 가지고 왔습니다",
        noText: "아니요, 오늘은 없습니다",
      },
    },
    mynumber_pin_reset: {
      intent: "마이넘버 카드 — 비밀번호 재설정",
      welcomeMessage:
        "마이넘버 카드 비밀번호 재설정을 도와드리겠습니다. 아래 단계를 따라주세요.",
      steps: [
        {
          id: "step-1",
          title: "마이넘버 카드를 지참해 주세요",
          description:
            "마이넘버 카드(マイナンバーカード)를 반드시 가지고 오세요. 카드 없이는 비밀번호를 재설정할 수 없습니다.",
          iconType: "document",
          color: "amber",
        },
        {
          id: "step-2",
          title: "6층으로 이동 — 마이넘버 카드 창구",
          description:
            "엘리베이터를 타고 6층으로 올라가 마이넘버 카드 창구로 가세요. 「マイナンバーカード窓口」 표시를 찾으세요.",
          iconType: "location",
          color: "blue",
        },
        {
          id: "step-3",
          title: "비밀번호 재설정 신청서 작성",
          description:
            "창구에서 비밀번호 재설정 신청서를 받아 작성한 후 마이넘버 카드와 함께 제출하세요. 본인 확인이 진행됩니다.",
          iconType: "document",
          color: "emerald",
          actionText: "6층 창구에서 용지 받기",
        },
        {
          id: "step-4",
          title: "새 비밀번호 설정",
          description:
            "본인 확인 후 키패드를 사용하여 현장에서 새 비밀번호를 설정합니다. 설정 후 즉시 카드가 반환됩니다.",
          iconType: "document",
          color: "rose",
        },
      ],
      interactivePrompt: {
        question: "어떤 비밀번호를 재설정해야 하는지 아시나요?",
        subtitle:
          "마이넘버 카드에는 두 가지 비밀번호가 있습니다: 4자리 비밀번호(편의점 서비스용)와 6-16자리 서명용 비밀번호(e-Tax 등 온라인 신청용). 직원이 둘 다 재설정을 도와드릴 수 있습니다.",
        iconType: "help",
        yesText: "네, 알고 있습니다",
        noText: "모르겠습니다, 도움이 필요합니다",
      },
    },
    unsupported: {
      intent: "지원되지 않는 요청",
      welcomeMessage:
        "죄송합니다. 요청을 이해하지 못했습니다. 주소 변경 또는 마이넘버 카드 비밀번호 재설정을 도와드릴 수 있습니다. 다시 시도해 주세요.",
      steps: [],
      isUnsupported: true,
    },
  },

  vi: {
    change_address: {
      intent: "Thay đổi địa chỉ — Chuyển đến Kita-ku",
      welcomeMessage:
        "Chào mừng đến Kita-ku! Tôi có thể giúp bạn hoàn thành đăng ký thay đổi địa chỉ. Vui lòng làm theo các bước dưới đây.",
      steps: [
        {
          id: "step-1",
          title: "Chuẩn bị Giấy chứng nhận chuyển đi",
          description:
            "Bạn cần Giấy chứng nhận chuyển đi (転出証明書) do văn phòng quận hoặc thành phố trước đó cấp. Nếu chưa có, bạn phải đến văn phòng quận cũ trước.",
          iconType: "document",
          color: "amber",
        },
        {
          id: "step-2",
          title: "Điền Đơn thông báo chuyển đến",
          description:
            "Điền vào Đơn thông báo chuyển đến (転入届) có tại Bàn Thông tin. Đơn này đăng ký địa chỉ mới của bạn tại Kita-ku. Bạn phải nộp trong vòng 14 ngày kể từ khi chuyển đến.",
          iconType: "document",
          color: "blue",
          actionText: "Lấy đơn tại Bàn Thông tin",
        },
        {
          id: "step-3",
          title: "Nộp tại Quầy số 3 — Đăng ký cư trú",
          description:
            "Mang Đơn thông báo chuyển đến đã điền và Giấy chứng nhận chuyển đi đến Quầy số 3 tầng 1 (Quầy đăng ký cư trú).",
          iconType: "location",
          color: "emerald",
        },
      ],
      interactivePrompt: {
        question: "Hôm nay bạn có mang theo thẻ My Number không?",
        subtitle:
          "Mang theo thẻ My Number giúp chúng tôi cập nhật địa chỉ trên thẻ ngay tại quầy, giúp bạn không cần quay lại.",
        iconType: "card",
        yesText: "Có, tôi có mang",
        noText: "Không, hôm nay không có",
      },
    },
    mynumber_pin_reset: {
      intent: "Thẻ My Number — Đặt lại mã PIN",
      welcomeMessage:
        "Tôi có thể giúp bạn đặt lại mã PIN thẻ My Number. Vui lòng làm theo các bước dưới đây.",
      steps: [
        {
          id: "step-1",
          title: "Mang theo thẻ My Number của bạn",
          description:
            "Hãy chắc chắn bạn có thẻ My Number (マイナンバーカード). Bạn không thể đặt lại mã PIN nếu không có thẻ.",
          iconType: "document",
          color: "amber",
        },
        {
          id: "step-2",
          title: "Đến tầng 6 — Quầy thẻ My Number",
          description:
            "Đi thang máy lên tầng 6 và đến Quầy thẻ My Number. Tìm biển hiệu ghi「マイナンバーカード窓口」.",
          iconType: "location",
          color: "blue",
        },
        {
          id: "step-3",
          title: "Điền đơn đặt lại mã PIN",
          description:
            "Tại quầy, bạn sẽ nhận được đơn đặt lại mã PIN. Điền và nộp cùng thẻ My Number. Nhân viên sẽ xác minh danh tính của bạn.",
          iconType: "document",
          color: "emerald",
          actionText: "Lấy đơn tại quầy tầng 6",
        },
        {
          id: "step-4",
          title: "Đặt mã PIN mới",
          description:
            "Sau khi xác minh, bạn sẽ đặt mã PIN mới ngay tại chỗ bằng bàn phím. Thẻ sẽ được trả lại ngay sau đó.",
          iconType: "document",
          color: "rose",
        },
      ],
      interactivePrompt: {
        question: "Bạn có biết mình cần đặt lại mã PIN nào không?",
        subtitle:
          "Thẻ My Number có hai mã PIN: mã PIN 4 chữ số (cho dịch vụ cửa hàng tiện lợi) và mã PIN chữ ký 6-16 chữ số (cho e-Tax, đăng ký trực tuyến). Nhân viên có thể giúp bạn đặt lại một hoặc cả hai.",
        iconType: "help",
        yesText: "Có, tôi biết",
        noText: "Không chắc, tôi cần giúp",
      },
    },
    unsupported: {
      intent: "Yêu cầu không được hỗ trợ",
      welcomeMessage:
        "Xin lỗi, tôi không hiểu yêu cầu của bạn. Tôi có thể giúp bạn thay đổi địa chỉ hoặc đặt lại mã PIN thẻ My Number. Vui lòng thử lại.",
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
    unsupported: {
      intent: "समर्थित नभएको अनुरोध",
      welcomeMessage:
        "माफ गर्नुहोस्, तपाईंको अनुरोध बुझ्न सकिएन। म ठेगाना परिवर्तन वा माइ नम्बर कार्ड PIN रिसेटमा मद्दत गर्न सक्छु। कृपया फेरि प्रयास गर्नुहोस्।",
      steps: [],
      isUnsupported: true,
    },
  },
};

const ADDRESS_KEYWORDS: Record<SupportedLang, string[]> = {
  en: ["address", "change address", "moved", "moving", "move", "kita-ku", "kita ku", "kitaku", "new resident", "relocat", "transfer", "register", "registration"],
  ja: ["転入", "転出", "住所変更", "引っ越し", "引越", "住所", "北区"],
  zh: ["地址", "搬家", "搬入", "迁入", "迁出", "转入", "北区", "住址"],
  ko: ["주소", "전입", "전출", "이사", "주소변경", "기타구"],
  vi: ["địa chỉ", "chuyển", "chuyển đến", "chuyển đi", "đăng ký", "kita"],
  ne: ["ठेगाना", "बसाइँ", "सराइ", "दर्ता", "किता"],
};

const MYNUMBER_PIN_KEYWORDS: Record<SupportedLang, string[]> = {
  en: ["my number", "mynumber", "pin", "pin reset", "forgot pin", "reset pin", "password", "forgot password", "card pin", "number card"],
  ja: ["マイナンバー", "暗証番号", "パスワード", "ピン", "リセット", "忘れ"],
  zh: ["密码", "重置", "my number", "忘记密码", "重设"],
  ko: ["마이넘버", "비밀번호", "재설정", "핀", "잊어"],
  vi: ["my number", "mã pin", "đặt lại", "quên mã", "mật khẩu"],
  ne: ["माइ नम्बर", "पिन", "रिसेट", "बिर्सेको", "पासवर्ड"],
};

export function matchQuery(transcript: string, lang: SupportedLang = "en"): IntentMatch {
  const lower = transcript.toLowerCase();
  const kb = KNOWLEDGE_BASE[lang];

  const allPinKeywords = Object.values(MYNUMBER_PIN_KEYWORDS).flat();
  const isPinReset = allPinKeywords.some((kw) => lower.includes(kw.toLowerCase()));

  if (isPinReset) {
    return kb["mynumber_pin_reset"];
  }

  const allAddressKeywords = Object.values(ADDRESS_KEYWORDS).flat();
  const isAddressChange = allAddressKeywords.some((kw) => lower.includes(kw.toLowerCase()));

  if (isAddressChange) {
    return kb["change_address"];
  }

  return kb["unsupported"];
}
