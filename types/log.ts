export type Condition = "A" | "B";
export type Phase = "static" | "task";
export type ScenarioId = "student-card" | "premium-simple";
export type CounterbalanceGroup = "G1" | "G2" | "G3" | "G4";

export type ParticipantProfile = {
  majorCategory: "design_cs" | "non_design_cs" | "";
  uxExperience: "yes" | "no" | "";
  digitalSkill: number;
  serviceUseFrequency: "low" | "medium" | "high" | "";
};

export type ExperimentConfig = {
  groupId: CounterbalanceGroup;
  phaseOrder: [Phase, Phase];
  conditionOrder: [Condition, Condition];
  scenarioOrder: [ScenarioId, ScenarioId];
};

export type LogEvent = {
  participantId: string;
  sessionId: string;
  groupId?: CounterbalanceGroup;
  condition: Condition;
  scenarioId?: ScenarioId;
  taskRunIndex?: number;
  taskId: string;
  screenId: string;
  eventType: string;
  timestamp: number;
  targetId?: string;
  value?: string;
  meta?: Record<string, any>;
};

export type TaskRun = {
  condition: Condition;
  scenarioId: ScenarioId;
  formData: FormData;
  planData: PlanData;
  success: boolean;
};

export type ExperimentState = {
  participantId: string;
  sessionId: string;
  config: ExperimentConfig;
  participantProfile: ParticipantProfile;
  currentPhase: "static" | "task" | "survey" | "end";
  currentTaskRunIndex: number;
  currentScreen: string;
  logs: LogEvent[];
  staticJudgments: StaticJudgment[];
  taskRuns: TaskRun[];
  surveyData: SurveyData;
};

export type StaticJudgment = {
  questionId: string;
  choice: Condition;
  confidence: number;
  reason: string;
  responseTimeMs: number;
};

export type FormData = {
  name: string;
  email: string;
  password: string;
};

export type PlanData = {
  plan: string;
  payment: string;
};

export type SurveyData = {
  easierVersion: string;
  preferredVersion: string;
  inputClearA: number;
  inputClearB: number;
  optionCompareA: number;
  optionCompareB: number;
  ctaPredictableA: number;
  ctaPredictableB: number;
  overallEaseA: number;
  overallEaseB: number;
  feltDifference: number;
  biggestDifference: string;
  mostHelpful: string;
  mindChanged: boolean | null;
  mindChangedDetail: string;
  finalComment: string;
};
