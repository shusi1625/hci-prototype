"use client";

import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useExperiment } from "@/context/ExperimentContext";
import { useLogger } from "@/hooks/useLogger";
import ScreenLayout from "@/components/layout/ScreenLayout";
import PhaseProgressBar from "@/components/layout/PhaseProgressBar";
import ScenarioBrief from "@/components/layout/ScenarioBrief";
import { PAYMENT_LABELS, PLAN_LABELS } from "@/lib/experiment";

export default function ConfirmPage() {
  const router = useRouter();
  const {
    state,
    currentCondition,
    currentScenario,
    currentFormData,
    currentPlanData,
    completeTaskRun,
    setCurrentScreen,
  } = useExperiment();
  const isB = currentCondition === "B";
  const { emit } = useLogger("confirm");
  const ctaLabel = isB ? currentScenario.ctaB : "확인";

  const ctaVisibleTime = useRef<number>(Date.now());
  const startTime = useRef<number>(Date.now());

  useEffect(() => {
    setCurrentScreen("confirm");
    ctaVisibleTime.current = Date.now();
    emit("cta_visible", {
      targetId: "cta_button",
      value: ctaLabel,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = () => {
    const delayMs = Date.now() - ctaVisibleTime.current;
    const success =
      currentPlanData.plan === currentScenario.expectedPlan &&
      currentPlanData.payment === currentScenario.expectedPayment;

    emit("button_click", {
      targetId: "cta_button",
      meta: {
        preClickDelayMs: delayMs,
        totalScreenTimeMs: Date.now() - startTime.current,
        ctaLabel,
        ctaClarity: isB ? "explicit" : "ambiguous",
        success,
      },
    });
    emit("submit_success", {
      meta: {
        selectedPlan: currentPlanData.plan,
        selectedPayment: currentPlanData.payment,
        expectedPlan: currentScenario.expectedPlan,
        expectedPayment: currentScenario.expectedPayment,
        success,
      },
    });
    emit("task_run_complete", {
      meta: {
        success,
        selectedPlan: currentPlanData.plan,
        selectedPayment: currentPlanData.payment,
        expectedPlan: currentScenario.expectedPlan,
        expectedPayment: currentScenario.expectedPayment,
      },
    });

    completeTaskRun(currentFormData, currentPlanData);

    const isSecondRun = state.currentTaskRunIndex === 1;
    if (isSecondRun) {
      router.push(state.config.phaseOrder.indexOf("task") === 0 ? "/study/static" : "/study/survey");
    } else {
      router.push("/study/transition");
    }
  };

  const handleBack = () => {
    emit("back_navigation", { targetId: "confirm_back" });
    router.back();
  };

  return (
    <ScreenLayout title="선택 정보 검토" subtitle="입력한 정보와 선택한 항목을 확인하세요.">
      <PhaseProgressBar
        currentPhase="task"
        currentScreen="confirm"
        config={state.config}
        currentTaskRunIndex={state.currentTaskRunIndex}
      />

      <ScenarioBrief scenario={currentScenario} />

      <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-4 mb-4">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            회원 정보
          </p>
          <div className="flex flex-col gap-2">
            <Row label="이름" value={currentFormData.name || "-"} />
            <Row label="이메일" value={currentFormData.email || "-"} />
            <Row label="비밀번호" value="********" />
          </div>
        </div>
        <div className="border-t border-gray-100" />
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            선택 정보
          </p>
          <div className="flex flex-col gap-2">
            <Row
              label="플랜"
              value={PLAN_LABELS[currentPlanData.plan] || "-"}
            />
            <Row
              label="결제 방식"
              value={PAYMENT_LABELS[currentPlanData.payment] || "-"}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={handleSubmit}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors text-base"
        >
          {ctaLabel}
        </button>
        <button
          onClick={handleBack}
          className="w-full py-3 text-gray-500 text-sm hover:text-gray-700 transition-colors"
        >
          이전으로 돌아가기
        </button>
      </div>
    </ScreenLayout>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex justify-between items-center gap-4">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-right text-gray-800">
        {value}
      </span>
    </div>
  );
}
