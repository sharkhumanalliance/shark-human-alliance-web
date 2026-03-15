export type QuizQuestion = {
  id: number;
  question: string;
  options: {
    text: string;
    scores: { basic: number; protected: number; nonsnack: number };
  }[];
};

export type QuizResult = {
  type: "basic" | "protected" | "nonsnack";
  title: string;
  sharkName: string;
  description: string;
  trait: string;
  membership: string;
  membershipHref: string;
};

export const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "You spot a shark fin while swimming. What do you do?",
    options: [
      {
        text: "Wave politely and hope diplomacy works",
        scores: { basic: 2, protected: 1, nonsnack: 0 },
      },
      {
        text: "Show your Alliance membership card (waterproof edition)",
        scores: { basic: 0, protected: 2, nonsnack: 1 },
      },
      {
        text: "Hold up a sign that says 'NOT FOOD' in large letters",
        scores: { basic: 0, protected: 0, nonsnack: 3 },
      },
      {
        text: "Swim towards it — you've been waiting to network",
        scores: { basic: 1, protected: 2, nonsnack: 0 },
      },
    ],
  },
  {
    id: 2,
    question: "What's your ideal beach day outfit?",
    options: [
      {
        text: "Classic swimsuit, nothing fancy",
        scores: { basic: 2, protected: 0, nonsnack: 0 },
      },
      {
        text: "Neon pink wetsuit with 'FRIEND' written on the back",
        scores: { basic: 0, protected: 2, nonsnack: 1 },
      },
      {
        text: "Full medieval armor — you're not taking any chances",
        scores: { basic: 0, protected: 0, nonsnack: 3 },
      },
      {
        text: "Matching outfit with your shark bestie (you wish)",
        scores: { basic: 1, protected: 2, nonsnack: 0 },
      },
    ],
  },
  {
    id: 3,
    question: "A shark accidentally bumps into your surfboard. Your reaction?",
    options: [
      {
        text: "\"No worries, mate! Happens to the best of us.\"",
        scores: { basic: 2, protected: 1, nonsnack: 0 },
      },
      {
        text: "File a formal incident report with the Alliance",
        scores: { basic: 0, protected: 2, nonsnack: 1 },
      },
      {
        text: "Immediately laminate yourself in 'inedible' stickers",
        scores: { basic: 0, protected: 0, nonsnack: 3 },
      },
      {
        text: "Offer the shark your spare surfboard as a peace offering",
        scores: { basic: 1, protected: 2, nonsnack: 0 },
      },
    ],
  },
  {
    id: 4,
    question: "How would you describe your relationship with the ocean?",
    options: [
      {
        text: "I enjoy it from a safe distance — like the beach",
        scores: { basic: 2, protected: 0, nonsnack: 1 },
      },
      {
        text: "I'm a regular visitor who respects all ocean residents",
        scores: { basic: 0, protected: 2, nonsnack: 0 },
      },
      {
        text: "The ocean is great, as long as nothing in it eats me",
        scores: { basic: 0, protected: 1, nonsnack: 2 },
      },
      {
        text: "I've already applied for dual citizenship (land/sea)",
        scores: { basic: 1, protected: 2, nonsnack: 0 },
      },
    ],
  },
  {
    id: 5,
    question: "What would you bring to a shark dinner party?",
    options: [
      {
        text: "A nice bottle of seawater and good conversation",
        scores: { basic: 2, protected: 1, nonsnack: 0 },
      },
      {
        text: "A formal peace treaty, notarized and laminated",
        scores: { basic: 0, protected: 2, nonsnack: 1 },
      },
      {
        text: "A sign around your neck: 'GUEST, NOT APPETIZER'",
        scores: { basic: 0, protected: 0, nonsnack: 3 },
      },
      {
        text: "Premium tuna as a diplomatic gift",
        scores: { basic: 1, protected: 2, nonsnack: 0 },
      },
    ],
  },
];

export const quizResults: Record<string, QuizResult> = {
  basic: {
    type: "basic",
    title: "The Casual Diplomat",
    sharkName: "Your spirit shark: The Laid-Back Leopard Shark",
    description:
      "You approach shark-human relations with calm optimism and zero panic. You believe that a friendly wave and good vibes are enough to build bridges across species. Sharks appreciate your chill energy — even if they sometimes wonder why you're so relaxed.",
    trait: "Diplomatic • Relaxed • Optimistic",
    membership: "Basic Membership ($9)",
    membershipHref: "/membership#basic",
  },
  protected: {
    type: "protected",
    title: "The Trusted Ally",
    sharkName: "Your spirit shark: The Wise Hammerhead",
    description:
      "You take shark-human relations seriously but keep it fun. You're the kind of person who reads the Alliance newsletter, files proper incident reports, and brings quality tuna to diplomatic events. Sharks genuinely like you — which is saying something.",
    trait: "Reliable • Warm • Organized",
    membership: "Protected Friend Status ($19)",
    membershipHref: "/membership#protected",
  },
  nonsnack: {
    type: "nonsnack",
    title: "The Survival Expert",
    sharkName: "Your spirit shark: The Cautious Nurse Shark",
    description:
      "Let's be honest — you're here primarily because you'd prefer not to be confused with lunch. And that's perfectly valid. Your survival instincts are strong, your anti-snack game is legendary, and sharks respect your clarity. You know exactly what you are: not food.",
    trait: "Cautious • Strategic • Very Much Not Food",
    membership: "Non-Snack Recognition ($29)",
    membershipHref: "/membership#nonsnack",
  },
};
