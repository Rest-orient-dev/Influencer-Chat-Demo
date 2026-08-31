export type UserRole = "agent" | "admin";

export type AppUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type ContactOrigin = "instagram_dm" | "inbound" | "referral";

export type Influencer = {
  id: string;
  name: string;
  handle: string;
  platform: "instagram" | "tiktok" | "youtube";
  followerBand: "micro" | "mid" | "macro" | "mega";
  avgPriceEur: number;
  instagramUrl?: string;
  personaPrompt: string;
};

export type ChatMessage = {
  id: string;
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

export type SessionStatus = "active" | "completed";

export type ChatSession = {
  id: string;
  userId: string;
  influencerId: string;
  title: string;
  status: SessionStatus;
  collaborationRound: number;
  contactOrigin?: ContactOrigin;
  createdAt: string;
  updatedAt: string;
};

export type DimensionScore = {
  score: number;
  notes: string[];
  correct?: string[];
  incorrect?: string[];
};

export type EvaluationReport = {
  summary: string;
  correct: string[];
  incorrect: string[];
};

export type EvaluationResult = {
  sessionId: string;
  overallScore: number;
  spanishGrammar: DimensionScore;
  priceReasonableness: DimensionScore;
  negotiationSkill: DimensionScore;
  professionalism: DimensionScore;
  goalAchieved: {
    achieved: boolean;
    evidence: string[];
    missing: string[];
  };
  report?: EvaluationReport;
  createdAt: string;
};

export type BootstrapResponse = {
  users: AppUser[];
  influencers: Influencer[];
  sessions: ChatSession[];
  messages: ChatMessage[];
  evaluations: EvaluationResult[];
};
