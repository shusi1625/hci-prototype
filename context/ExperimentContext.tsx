"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type {
  Condition,
  CounterbalanceGroup,
  ExperimentConfig,
  ExperimentState,
  FormData,
  PlanData,
  ParticipantProfile,
  ScenarioId,
  StaticJudgment,
  SurveyData,
  TaskRun,
} from "@/types/log";
import { loadState, saveState } from "@/lib/logger";
import {
  COUNTERBALANCE_GROUPS,
  generateParticipantId,
  generateSessionId,
  TASK_SCENARIOS,
} from "@/lib/experiment";

const DEFAULT_CONFIG: ExperimentConfig = {
  groupId: "G1",
  phaseOrder: ["static", "task"],
  conditionOrder: ["A", "B"],
  scenarioOrder: ["student-card", "premium-simple"],
};

const DEFAULT_FORM: FormData = { name: "", email: "", password: "" };
const DEFAULT_PLAN: PlanData = { plan: "", payment: "" };
const DEFAULT_PROFILE: ParticipantProfile = {
  majorCategory: "",
  uxExperience: "",
  digitalSkill: 0,
  serviceUseFrequency: "",
};

const DEFAULT_SURVEY: SurveyData = {
  easierVersion: "",
  preferredVersion: "",
  inputClearA: 0,
  inputClearB: 0,
  optionCompareA: 0,
  optionCompareB: 0,
  ctaPredictableA: 0,
  ctaPredictableB: 0,
  overallEaseA: 0,
  overallEaseB: 0,
  feltDifference: 0,
  biggestDifference: "",
  mostHelpful: "",
  mindChanged: null,
  mindChangedDetail: "",
  finalComment: "",
};

const defaultState: ExperimentState = {
  participantId: "",
  sessionId: "",
  config: DEFAULT_CONFIG,
  participantProfile: DEFAULT_PROFILE,
  currentPhase: "static",
  currentTaskRunIndex: 0,
  currentScreen: "start",
  logs: [],
  staticJudgments: [],
  taskRuns: [],
  surveyData: DEFAULT_SURVEY,
};

type ExperimentContextType = {
  state: ExperimentState;
  currentCondition: Condition;
  currentScenarioId: ScenarioId;
  currentScenario: (typeof TASK_SCENARIOS)[ScenarioId];
  hasSecondTaskRun: boolean;
  initSession: (
    config: ExperimentConfig,
    participantProfile: ParticipantProfile,
    participantId?: string
  ) => ExperimentState;
  setCurrentScreen: (screen: string) => void;
  addStaticJudgment: (judgment: StaticJudgment) => void;
  completeTaskRun: (formData: FormData, planData: PlanData) => void;
  setSurveyData: (data: Partial<SurveyData>) => void;
  resetSession: () => void;
  currentFormData: FormData;
  currentPlanData: PlanData;
  setCurrentFormData: (data: Partial<FormData>) => void;
  setCurrentPlanData: (data: Partial<PlanData>) => void;
};

const ExperimentContext = createContext<ExperimentContextType | null>(null);

function normalizeConfig(config?: Partial<ExperimentConfig>): ExperimentConfig {
  const groupId: CounterbalanceGroup = config?.groupId ?? "G1";
  const groupConfig = COUNTERBALANCE_GROUPS[groupId].config;

  return {
    groupId,
    phaseOrder: config?.phaseOrder ?? groupConfig.phaseOrder,
    conditionOrder: config?.conditionOrder ?? groupConfig.conditionOrder,
    scenarioOrder: config?.scenarioOrder ?? groupConfig.scenarioOrder,
  };
}

export function ExperimentProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ExperimentState>(defaultState);
  const [currentFormData, setCurrentFormDataState] = useState<FormData>(DEFAULT_FORM);
  const [currentPlanData, setCurrentPlanDataState] = useState<PlanData>(DEFAULT_PLAN);

  useEffect(() => {
    const saved = loadState();
    if (saved?.participantId) {
      setState((prev) => ({
        ...prev,
        ...saved,
        config: normalizeConfig(saved.config),
        participantProfile: { ...DEFAULT_PROFILE, ...saved.participantProfile },
        surveyData: { ...DEFAULT_SURVEY, ...saved.surveyData },
      }));
    }
  }, []);

  const updateState = (partial: Partial<ExperimentState>) => {
    setState((prev) => {
      const next = { ...prev, ...partial };
      saveState(next);
      return next;
    });
  };

  const currentCondition: Condition =
    state.config.conditionOrder[state.currentTaskRunIndex] ?? "A";
  const currentScenarioId: ScenarioId =
    state.config.scenarioOrder[state.currentTaskRunIndex] ?? "student-card";
  const currentScenario = TASK_SCENARIOS[currentScenarioId];
  const hasSecondTaskRun = state.currentTaskRunIndex === 0;

  const initSession = (
    config: ExperimentConfig,
    participantProfile: ParticipantProfile,
    participantId?: string
  ) => {
    const normalizedConfig = normalizeConfig(config);
    const firstPhase = normalizedConfig.phaseOrder[0];
    const newState: ExperimentState = {
      ...defaultState,
      participantId: participantId?.trim() || generateParticipantId(),
      sessionId: generateSessionId(),
      config: normalizedConfig,
      participantProfile,
      currentPhase: firstPhase,
      currentTaskRunIndex: 0,
      currentScreen: firstPhase === "static" ? "static" : "signup",
    };

    setState(newState);
    saveState(newState);
    setCurrentFormDataState(DEFAULT_FORM);
    setCurrentPlanDataState(DEFAULT_PLAN);
    return newState;
  };

  const setCurrentScreen = (screen: string) => {
    updateState({ currentScreen: screen });
  };

  const addStaticJudgment = (judgment: StaticJudgment) => {
    setState((prev) => {
      const next = {
        ...prev,
        staticJudgments: [...prev.staticJudgments, judgment],
      };
      saveState(next);
      return next;
    });
  };

  const completeTaskRun = (formData: FormData, planData: PlanData) => {
    setState((prev) => {
      const scenarioId = prev.config.scenarioOrder[prev.currentTaskRunIndex] ?? "student-card";
      const scenario = TASK_SCENARIOS[scenarioId];
      const run: TaskRun = {
        condition: prev.config.conditionOrder[prev.currentTaskRunIndex] ?? "A",
        scenarioId,
        formData,
        planData,
        success:
          planData.plan === scenario.expectedPlan &&
          planData.payment === scenario.expectedPayment,
      };
      const taskRuns = [...prev.taskRuns, run];
      const isSecondRun = prev.currentTaskRunIndex === 1;

      let nextPhase: ExperimentState["currentPhase"];
      let nextTaskRunIndex = prev.currentTaskRunIndex;
      let nextScreen: string;

      if (isSecondRun) {
        const taskPhaseIdx = prev.config.phaseOrder.indexOf("task");
        if (taskPhaseIdx === 0) {
          nextPhase = "static";
          nextScreen = "static";
        } else {
          nextPhase = "survey";
          nextScreen = "survey";
        }
      } else {
        nextPhase = "task";
        nextTaskRunIndex = 1;
        nextScreen = "transition";
      }

      const next: ExperimentState = {
        ...prev,
        taskRuns,
        currentPhase: nextPhase,
        currentTaskRunIndex: nextTaskRunIndex,
        currentScreen: nextScreen,
      };
      saveState(next);
      return next;
    });

    setCurrentFormDataState(DEFAULT_FORM);
    setCurrentPlanDataState(DEFAULT_PLAN);
  };

  const setSurveyData = (data: Partial<SurveyData>) => {
    setState((prev) => {
      const next = { ...prev, surveyData: { ...prev.surveyData, ...data } };
      saveState(next);
      return next;
    });
  };

  const resetSession = () => {
    setState(defaultState);
    saveState(defaultState);
    setCurrentFormDataState(DEFAULT_FORM);
    setCurrentPlanDataState(DEFAULT_PLAN);
  };

  const setCurrentFormData = (data: Partial<FormData>) => {
    setCurrentFormDataState((prev) => ({ ...prev, ...data }));
  };

  const setCurrentPlanData = (data: Partial<PlanData>) => {
    setCurrentPlanDataState((prev) => ({ ...prev, ...data }));
  };

  return (
    <ExperimentContext.Provider
      value={{
        state,
        currentCondition,
        currentScenarioId,
        currentScenario,
        hasSecondTaskRun,
        initSession,
        setCurrentScreen,
        addStaticJudgment,
        completeTaskRun,
        setSurveyData,
        resetSession,
        currentFormData,
        currentPlanData,
        setCurrentFormData,
        setCurrentPlanData,
      }}
    >
      {children}
    </ExperimentContext.Provider>
  );
}

export function useExperiment() {
  const ctx = useContext(ExperimentContext);
  if (!ctx) throw new Error("useExperiment must be used within ExperimentProvider");
  return ctx;
}
