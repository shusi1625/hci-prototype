"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useExperiment } from "@/context/ExperimentContext";
import { useLogger } from "@/hooks/useLogger";
import ScreenLayout from "@/components/layout/ScreenLayout";
import PhaseProgressBar from "@/components/layout/PhaseProgressBar";
import ScenarioBrief from "@/components/layout/ScenarioBrief";
import DropdownSelect from "@/components/selection/DropdownSelect";
import RadioSelect from "@/components/selection/RadioSelect";
import { PAYMENT_OPTIONS, PLAN_OPTIONS } from "@/lib/experiment";

export default function PlanPage() {
  const router = useRouter();
  const {
    state,
    currentCondition,
    currentScenario,
    currentPlanData,
    setCurrentPlanData,
    setCurrentScreen,
  } = useExperiment();
  const isB = currentCondition === "B";
  const { emit } = useLogger("plan");

  const [plan, setPlan] = useState(currentPlanData.plan);
  const [payment, setPayment] = useState(currentPlanData.payment);
  const [errors, setErrors] = useState<{ plan?: string; payment?: string }>({});
  const prevPlan = useRef(plan);
  const prevPayment = useRef(payment);
  const firstPlanSelectTime = useRef<number | null>(null);
  const firstPaymentSelectTime = useRef<number | null>(null);
  const planSelectCount = useRef(0);
  const paymentSelectCount = useRef(0);
  const planReselectCount = useRef(0);
  const paymentReselectCount = useRef(0);
  const startTime = useRef(Date.now());

  useEffect(() => {
    setCurrentScreen("plan");
    emit("plan_options_visible", {
      meta: {
        planOptionCount: PLAN_OPTIONS.length,
        paymentOptionCount: PAYMENT_OPTIONS.length,
        expectedPlan: currentScenario.expectedPlan,
        expectedPayment: currentScenario.expectedPayment,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePlanChange = (value: string) => {
    if (!firstPlanSelectTime.current) {
      firstPlanSelectTime.current = Date.now() - startTime.current;
    }
    const isReselect = prevPlan.current !== "" && prevPlan.current !== value;
    planSelectCount.current += 1;
    if (isReselect) planReselectCount.current += 1;
    emit(isReselect ? "option_reselect" : "option_select", {
      targetId: "plan",
      value,
      meta: {
        timeToFirstSelectMs: firstPlanSelectTime.current,
        selectCount: planSelectCount.current,
        reselectCount: planReselectCount.current,
        isTargetChoice: value === currentScenario.expectedPlan,
      },
    });
    prevPlan.current = value;
    setPlan(value);
    setCurrentPlanData({ plan: value });
    setErrors((prev) => ({ ...prev, plan: undefined }));
  };

  const handlePaymentChange = (value: string) => {
    if (!firstPaymentSelectTime.current) {
      firstPaymentSelectTime.current = Date.now() - startTime.current;
    }
    const isReselect = prevPayment.current !== "" && prevPayment.current !== value;
    paymentSelectCount.current += 1;
    if (isReselect) paymentReselectCount.current += 1;
    emit(isReselect ? "option_reselect" : "option_select", {
      targetId: "payment",
      value,
      meta: {
        timeToFirstSelectMs: firstPaymentSelectTime.current,
        selectCount: paymentSelectCount.current,
        reselectCount: paymentReselectCount.current,
        isTargetChoice: value === currentScenario.expectedPayment,
      },
    });
    prevPayment.current = value;
    setPayment(value);
    setCurrentPlanData({ payment: value });
    setErrors((prev) => ({ ...prev, payment: undefined }));
  };

  const handleSubmit = () => {
    const newErrors: typeof errors = {};
    if (!plan) newErrors.plan = "플랜을 선택해주세요.";
    if (!payment) newErrors.payment = "결제 방식을 선택해주세요.";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      emit("invalid_submit", { meta: newErrors });
      return;
    }

    emit("plan_step_complete", {
      meta: {
        totalTimeMs: Date.now() - startTime.current,
        selectedPlan: plan,
        selectedPayment: payment,
        planCorrect: plan === currentScenario.expectedPlan,
        paymentCorrect: payment === currentScenario.expectedPayment,
        planSelectCount: planSelectCount.current,
        paymentSelectCount: paymentSelectCount.current,
        planReselectCount: planReselectCount.current,
        paymentReselectCount: paymentReselectCount.current,
        planTimeToFirstSelectMs: firstPlanSelectTime.current,
        paymentTimeToFirstSelectMs: firstPaymentSelectTime.current,
      },
    });
    router.push("/study/confirm");
  };

  return (
    <ScreenLayout title="플랜 선택" subtitle="지정된 플랜과 결제 방식을 선택해주세요.">
      <PhaseProgressBar
        currentPhase="task"
        currentScreen="plan"
        config={state.config}
        currentTaskRunIndex={state.currentTaskRunIndex}
      />

      <ScenarioBrief scenario={currentScenario} />

      <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-6">
        <div>
          {isB ? (
            <RadioSelect
              id="plan"
              label="플랜 선택"
              options={PLAN_OPTIONS}
              value={plan}
              onChange={handlePlanChange}
            />
          ) : (
            <DropdownSelect
              id="plan"
              label="플랜 선택"
              options={PLAN_OPTIONS}
              value={plan}
              onChange={handlePlanChange}
              onOpen={() => emit("option_widget_open", { targetId: "plan" })}
              placeholder="플랜을 선택하세요"
            />
          )}
          {errors.plan && <p className="text-xs text-red-500 mt-1">{errors.plan}</p>}
        </div>

        <div>
          {isB ? (
            <RadioSelect
              id="payment"
              label="결제 방식"
              options={PAYMENT_OPTIONS}
              value={payment}
              onChange={handlePaymentChange}
            />
          ) : (
            <DropdownSelect
              id="payment"
              label="결제 방식"
              options={PAYMENT_OPTIONS}
              value={payment}
              onChange={handlePaymentChange}
              onOpen={() => emit("option_widget_open", { targetId: "payment" })}
              placeholder="결제 방식을 선택하세요"
            />
          )}
          {errors.payment && <p className="text-xs text-red-500 mt-1">{errors.payment}</p>}
        </div>

        <button
          onClick={handleSubmit}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors text-sm"
        >
          {isB ? "플랜 선택 완료" : "다음"}
        </button>
      </div>
    </ScreenLayout>
  );
}
