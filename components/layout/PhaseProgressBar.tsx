"use client";

import React from "react";
import type { ExperimentConfig } from "@/types/log";

type Phase = "static" | "task" | "survey";

const TASK_SCREEN_PROGRESS: Record<string, number> = {
  signup: 25,
  plan: 60,
  confirm: 85,
  transition: 100,
};

type Props = {
  currentPhase: Phase | "end";
  currentScreen: string;
  config: ExperimentConfig;
  staticQuestionIndex?: number;
  currentTaskRunIndex?: number;
};

const PHASE_LABELS: Record<Phase, string> = {
  static: "정적 판단",
  task: "실제 과업",
  survey: "사후 설문",
};

export default function PhaseProgressBar({
  currentPhase,
  currentScreen,
  config,
  staticQuestionIndex = 0,
  currentTaskRunIndex = 0,
}: Props) {
  if (currentPhase === "end") return null;

  const phases: Phase[] = [...config.phaseOrder, "survey"];

  let innerProgress = 0;
  if (currentPhase === "static") {
    innerProgress = Math.round(((staticQuestionIndex + 0.5) / 3) * 100);
  } else if (currentPhase === "task") {
    const base = currentTaskRunIndex === 0 ? 0 : 50;
    const screenPct = TASK_SCREEN_PROGRESS[currentScreen] ?? 10;
    innerProgress = base + Math.round(screenPct / 2);
  } else if (currentPhase === "survey") {
    innerProgress = 50;
  }

  return (
    <div className="mb-8">
      <div className="flex items-start gap-2 mb-3">
        {phases.map((phase, idx) => {
          const phaseIdx = phases.indexOf(currentPhase as Phase);
          const isDone = idx < phaseIdx;
          const isActive = idx === phaseIdx;

          return (
            <React.Fragment key={phase}>
              <div className="flex flex-col items-center gap-1.5 flex-1">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                    ${
                      isDone
                        ? "bg-blue-500 text-white"
                        : isActive
                        ? "bg-blue-600 text-white ring-4 ring-blue-100"
                        : "bg-gray-200 text-gray-400"
                    }`}
                >
                  {isDone ? (
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    idx + 1
                  )}
                </div>
                <span
                  className={`text-xs font-medium text-center leading-tight
                    ${isActive ? "text-blue-700" : isDone ? "text-blue-400" : "text-gray-400"}`}
                >
                  {PHASE_LABELS[phase]}
                </span>
              </div>

              {idx < phases.length - 1 && (
                <div className="flex-1 h-0.5 mt-3.5 rounded-full overflow-hidden bg-gray-200">
                  <div
                    className="h-full bg-blue-400 transition-all duration-500"
                    style={{ width: isDone ? "100%" : "0%" }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-500"
          style={{ width: `${innerProgress}%` }}
        />
      </div>

      {currentPhase === "task" && (
        <p className="text-xs text-gray-400 mt-1.5">
          과업 수행 {currentTaskRunIndex + 1} / 2 (조건{" "}
          {currentTaskRunIndex === 0
            ? config.conditionOrder[0]
            : config.conditionOrder[1]}
          )
        </p>
      )}
    </div>
  );
}
