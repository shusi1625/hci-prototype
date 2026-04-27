import type { Condition, CounterbalanceGroup, ExperimentConfig, ScenarioId } from "@/types/log";

export function generateId(prefix: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 6);
  return `${prefix}_${timestamp}_${random}`;
}

export function generateParticipantId(): string {
  return generateId("P");
}

export function generateSessionId(): string {
  return generateId("S");
}

export function getConditionLabel(condition: Condition): string {
  return condition === "A"
    ? "조건 A: 비가이드라인형"
    : "조건 B: 가이드라인형";
}

export const COUNTERBALANCE_GROUPS: Record<
  CounterbalanceGroup,
  {
    id: CounterbalanceGroup;
    label: string;
    description: string;
    config: ExperimentConfig;
  }
> = {
  G1: {
    id: "G1",
    label: "G1",
    description: "A + 학생/카드 → B + 프리미엄/간편",
    config: {
      groupId: "G1",
      phaseOrder: ["static", "task"],
      conditionOrder: ["A", "B"],
      scenarioOrder: ["student-card", "premium-simple"],
    },
  },
  G2: {
    id: "G2",
    label: "G2",
    description: "B + 학생/카드 → A + 프리미엄/간편",
    config: {
      groupId: "G2",
      phaseOrder: ["static", "task"],
      conditionOrder: ["B", "A"],
      scenarioOrder: ["student-card", "premium-simple"],
    },
  },
  G3: {
    id: "G3",
    label: "G3",
    description: "A + 프리미엄/간편 → B + 학생/카드",
    config: {
      groupId: "G3",
      phaseOrder: ["static", "task"],
      conditionOrder: ["A", "B"],
      scenarioOrder: ["premium-simple", "student-card"],
    },
  },
  G4: {
    id: "G4",
    label: "G4",
    description: "B + 프리미엄/간편 → A + 학생/카드",
    config: {
      groupId: "G4",
      phaseOrder: ["static", "task"],
      conditionOrder: ["B", "A"],
      scenarioOrder: ["premium-simple", "student-card"],
    },
  },
};

export const SCREENS = {
  START: "start",
  STATIC: "static",
  SIGNUP: "signup",
  PLAN: "plan",
  CONFIRM: "confirm",
  TRANSITION: "transition",
  SURVEY: "survey",
  END: "end",
} as const;

export const SCREEN_ROUTES: Record<string, string> = {
  [SCREENS.START]: "/study/start",
  [SCREENS.STATIC]: "/study/static",
  [SCREENS.SIGNUP]: "/study/signup",
  [SCREENS.PLAN]: "/study/plan",
  [SCREENS.CONFIRM]: "/study/confirm",
  [SCREENS.TRANSITION]: "/study/transition",
  [SCREENS.SURVEY]: "/study/survey",
  [SCREENS.END]: "/study/end",
};

export const TASK_SCENARIOS: Record<
  ScenarioId,
  {
    id: ScenarioId;
    title: string;
    instruction: string;
    expectedPlan: string;
    expectedPayment: string;
    ctaB: string;
  }
> = {
  "student-card": {
    id: "student-card",
    title: "학생 플랜 가입",
    instruction: "학생 인증이 가능하며 월 비용을 가장 낮추고 싶습니다. 카드 결제로 가입을 완료하세요.",
    expectedPlan: "student",
    expectedPayment: "card",
    ctaB: "카드 결제로 회원가입 완료",
  },
  "premium-simple": {
    id: "premium-simple",
    title: "프리미엄 플랜 가입",
    instruction: "팀원과 함께 사용할 예정이며 저장공간이 가장 큰 플랜이 필요합니다. 간편결제로 구독을 시작하세요.",
    expectedPlan: "premium",
    expectedPayment: "simple",
    ctaB: "간편결제로 구독 시작하기",
  },
};

export const PLAN_OPTIONS = [
  {
    value: "basic",
    label: "Basic",
    description: "월 9,900원 · 개인용 · 저장공간 10GB · 공유 불가",
  },
  {
    value: "student",
    label: "Student",
    description: "월 4,900원 · 학생 인증 필요 · 저장공간 30GB · 공유 불가",
  },
  {
    value: "premium",
    label: "Premium",
    description: "월 19,900원 · 개인/팀 · 저장공간 100GB · 공유 가능",
  },
];

export const PAYMENT_OPTIONS = [
  { value: "card", label: "신용/체크카드" },
  { value: "transfer", label: "계좌이체" },
  { value: "simple", label: "간편결제" },
];

export const PLAN_LABELS: Record<string, string> = {
  basic: "Basic (월 9,900원)",
  student: "Student (월 4,900원)",
  premium: "Premium (월 19,900원)",
};

export const PAYMENT_LABELS: Record<string, string> = {
  card: "신용/체크카드",
  transfer: "계좌이체",
  simple: "간편결제",
};

export const STATIC_QUESTIONS = [
  {
    id: "G1",
    title: "입력 필드 레이블",
    description: "회원가입 화면에서 입력 필드를 어떻게 안내하는 편이 더 사용하기 좋아 보이나요?",
    optionA: { label: "A", description: "placeholder만 제공" },
    optionB: { label: "B", description: "항상 보이는 label 제공" },
  },
  {
    id: "G2",
    title: "옵션 선택 방식",
    description: "여러 옵션 중 하나를 선택할 때 어떤 UI가 더 적절해 보이나요?",
    optionA: { label: "A", description: "Dropdown 사용" },
    optionB: { label: "B", description: "Radio Button 사용" },
  },
  {
    id: "G3",
    title: "CTA 버튼 문구",
    description: "최종 제출 버튼에는 어떤 문구가 더 적절해 보이나요?",
    optionA: { label: "A", description: "모호한 문구: 다음, 확인" },
    optionB: { label: "B", description: "명확한 행동 문구: 카드 결제로 회원가입 완료" },
  },
];
