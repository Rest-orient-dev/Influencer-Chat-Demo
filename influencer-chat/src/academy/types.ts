export type BubbleRole = "orient" | "influencer";

export type ChatBubble = {
  role: BubbleRole;
  text: string;
  note?: string;
};

export type TutorialSection = {
  heading: string;
  body?: string;
  bullets?: string[];
  bubbles?: ChatBubble[];
};

export type TutorialActivity = {
  type: "tutorial";
  id: string;
  title: string;
  minutes: number;
  goal: string;
  sections: TutorialSection[];
};

export type CaseActivity = {
  type: "case";
  id: string;
  title: string;
  minutes: number;
  verdict: "good" | "bad";
  setup: string;
  messages: ChatBubble[];
  takeaways: string[];
};

export type GuidedStep = {
  id: string;
  situation: string;
  incoming?: ChatBubble[];
  task: string;
  hint: string;
  keywords: string[];
  match?: "all" | "any";
  requireNumber?: boolean;
  numberOrKeywords?: boolean;
  modelAnswer: string;
  explanation: string;
};

export type GuidedActivity = {
  type: "guided";
  id: string;
  title: string;
  minutes: number;
  intro: string;
  steps: GuidedStep[];
};

export type DrillChoice = {
  kind: "choice";
  prompt: string;
  options: string[];
  answer: number;
  why: string;
};

export type DrillOrder = {
  kind: "order";
  prompt: string;
  items: string[];
  why: string;
};

export type DrillTap = {
  kind: "tap";
  context: string;
  bubbles: ChatBubble[];
  options: string[];
  answer: number;
  why: string;
};

export type DrillFill = {
  kind: "fill";
  prompt: string;
  before: string;
  after: string;
  options: string[];
  answer: number;
  why: string;
};

export type DrillItem = DrillChoice | DrillOrder | DrillTap | DrillFill;

export type DrillActivity = {
  type: "drill";
  id: string;
  title: string;
  minutes: number;
  intro: string;
  items: DrillItem[];
};

export type AcademyActivity =
  | TutorialActivity
  | CaseActivity
  | GuidedActivity
  | DrillActivity;

export type AcademyUnit = {
  id: string;
  order: number;
  title: string;
  subtitle: string;
  minutes: number;
  practiceCta?: boolean;
  activities: AcademyActivity[];
};

export type ActivityScore = {
  correct: number;
  total: number;
  completedAt: string;
};

export type AcademyProgress = {
  userId: string;
  completedActivityIds: string[];
  scores: Record<string, ActivityScore>;
  updatedAt: string;
};
