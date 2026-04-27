"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useExperiment } from "@/context/ExperimentContext";
import { useLogger } from "@/hooks/useLogger";
import ScreenLayout from "@/components/layout/ScreenLayout";
import PhaseProgressBar from "@/components/layout/PhaseProgressBar";
import { getConditionLabel } from "@/lib/experiment";

export default function TransitionPage() {
  const router = useRouter();
  const { state, currentCondition, currentScenario, setCurrentScreen } = useExperiment();
  const { emit } = useLogger("transition");

  const prevCondition =
    state.config.conditionOrder[state.currentTaskRunIndex - 1] ?? state.config.conditionOrder[0];

  useEffect(() => {
    setCurrentScreen("transition");
    emit("condition_transition", {
      meta: {
        from: prevCondition,
        to: currentCondition,
        nextScenarioId: currentScenario.id,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ScreenLayout maxWidth="max-w-md">
      <PhaseProgressBar
        currentPhase="task"
        currentScreen="transition"
        config={state.config}
        currentTaskRunIndex={state.currentTaskRunIndex}
      />

      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          첫 번째 과업이 완료되었습니다
        </h2>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          잠시 쉬었다가 두 번째 조건의 과업을 진행합니다. 이번에는 다른 시나리오를
          사용해 반복 학습 효과를 줄입니다.
        </p>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 text-left">
          <p className="text-xs font-semibold text-blue-600 mb-2">다음 과업 안내</p>
          <p className="text-sm text-gray-700 font-medium">{currentScenario.instruction}</p>
          <p className="text-xs text-gray-500 mt-2">
            과업 {state.currentTaskRunIndex + 1} / 2 · {getConditionLabel(currentCondition)}
          </p>
        </div>

        <button
          onClick={() => router.push("/study/signup")}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold
            rounded-xl transition-colors text-base"
        >
          두 번째 과업 시작하기
        </button>
      </div>
    </ScreenLayout>
  );
}
