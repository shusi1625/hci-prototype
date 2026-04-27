"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useExperiment } from "@/context/ExperimentContext";
import { useLogger } from "@/hooks/useLogger";
import { STATIC_QUESTIONS, PLAN_OPTIONS } from "@/lib/experiment";
import ScreenLayout from "@/components/layout/ScreenLayout";
import PhaseProgressBar from "@/components/layout/PhaseProgressBar";
import type { StaticJudgment } from "@/types/log";

function G1Preview({ variant }: { variant: "A" | "B" }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 flex flex-col gap-2.5">
      {variant === "A" ? (
        <>
          <input disabled placeholder="이름을 입력하세요" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-400 bg-gray-50" />
          <input disabled placeholder="이메일 주소를 입력하세요" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-400 bg-gray-50" />
          <input disabled placeholder="비밀번호를 8자 이상 입력하세요" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-400 bg-gray-50" />
        </>
      ) : (
        <>
          {[
            ["이름", "홍길동"],
            ["이메일", "example@email.com"],
            ["비밀번호", "8자 이상"],
          ].map(([label, placeholder]) => (
            <div key={label} className="flex flex-col gap-0.5">
              <label className="text-xs font-medium text-gray-700">{label}</label>
              <input disabled placeholder={placeholder} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-400 bg-gray-50" />
            </div>
          ))}
        </>
      )}
    </div>
  );
}

function G2Preview({ variant }: { variant: "A" | "B" }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 flex flex-col gap-2">
      <p className="text-xs text-gray-500">플랜 선택</p>
      {variant === "A" ? (
        <select disabled className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs bg-gray-50 text-gray-500">
          <option>선택하세요</option>
          {PLAN_OPTIONS.map((p) => <option key={p.value}>{p.label}</option>)}
        </select>
      ) : (
        <div className="flex flex-col gap-1.5">
          {PLAN_OPTIONS.map((p) => (
            <label key={p.value} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg text-xs cursor-pointer">
              <input type="radio" disabled className="accent-blue-500" />
              <span className="font-medium text-gray-700">{p.label}</span>
              <span className="text-gray-400">{p.description.split(",")[0]}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function G3Preview({ variant }: { variant: "A" | "B" }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 flex flex-col items-center gap-3 py-6">
      <p className="text-xs text-gray-500">입력 정보와 선택 정보를 확인한 뒤 제출합니다.</p>
      <button disabled className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg opacity-80">
        {variant === "A" ? "확인" : "카드 결제로 회원가입 완료"}
      </button>
    </div>
  );
}

const PREVIEWS: Record<string, (v: "A" | "B") => React.ReactNode> = {
  G1: (v) => <G1Preview variant={v} />,
  G2: (v) => <G2Preview variant={v} />,
  G3: (v) => <G3Preview variant={v} />,
};

export default function StaticPage() {
  const router = useRouter();
  const { state, addStaticJudgment, setCurrentScreen } = useExperiment();
  const { emit } = useLogger("static");

  const [currentIdx, setCurrentIdx] = useState(0);
  const [choice, setChoice] = useState<"A" | "B" | null>(null);
  const [confidence, setConfidence] = useState(0);
  const [reason, setReason] = useState("");
  const questionStartTime = useRef<number>(Date.now());

  const question = STATIC_QUESTIONS[currentIdx];
  const isLast = currentIdx === STATIC_QUESTIONS.length - 1;

  useEffect(() => {
    setCurrentScreen("static");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    questionStartTime.current = Date.now();
    emit("static_question_view", { targetId: question.id });
    setChoice(null);
    setConfidence(0);
    setReason("");
  }, [currentIdx, emit, question.id]);

  const handleNext = () => {
    if (!choice || confidence === 0) return;

    const judgment: StaticJudgment = {
      questionId: question.id,
      choice,
      confidence,
      reason,
      responseTimeMs: Date.now() - questionStartTime.current,
    };
    addStaticJudgment(judgment);
    emit("static_submit", { targetId: question.id, meta: judgment });

    if (isLast) {
      router.push(state.config.phaseOrder.indexOf("task") === 1 ? "/study/signup" : "/study/survey");
    } else {
      setCurrentIdx((idx) => idx + 1);
    }
  };

  return (
    <ScreenLayout maxWidth="max-w-2xl">
      <PhaseProgressBar
        currentPhase="static"
        currentScreen="static"
        config={state.config}
        staticQuestionIndex={currentIdx}
      />

      <div className="mb-6">
        <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
          문항 {currentIdx + 1} / {STATIC_QUESTIONS.length}
        </span>
        <h2 className="text-lg font-bold text-gray-900 mt-2">{question.title}</h2>
        <p className="text-sm text-gray-500 mt-1">{question.description}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {(["A", "B"] as const).map((variant) => (
          <button
            key={variant}
            onClick={() => {
              setChoice(variant);
              emit("static_choice_select", { targetId: question.id, value: variant });
            }}
            className={`flex flex-col gap-2 p-3 rounded-2xl border-2 transition-all text-left
              ${choice === variant
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 bg-gray-50 hover:border-gray-300"
              }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-md
                ${choice === variant ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600"}`}>
                {variant === "A" ? question.optionA.label : question.optionB.label}
              </span>
              {choice === variant && <span className="text-blue-500 text-sm">선택됨</span>}
            </div>
            <div className="pointer-events-none">{PREVIEWS[question.id](variant)}</div>
            <p className="text-xs text-gray-500 text-center">
              {variant === "A" ? question.optionA.description : question.optionB.description}
            </p>
          </button>
        ))}
      </div>

      <div className="mb-5">
        <p className="text-sm font-medium text-gray-700 mb-2">이 판단에 얼마나 확신하나요?</p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => {
                setConfidence(n);
                emit("static_confidence_select", { targetId: question.id, value: String(n) });
              }}
              className={`flex-1 py-2 rounded-lg border text-sm font-semibold transition-all
                ${confidence === n
                  ? "border-blue-500 bg-blue-500 text-white"
                  : "border-gray-300 text-gray-600 hover:border-gray-400"
                }`}
            >
              {n}
            </button>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
          <span>전혀 확신 없음</span>
          <span>매우 확신</span>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          선택 이유 <span className="text-gray-400 font-normal">(선택 사항)</span>
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="왜 이쪽이 더 적절하다고 생각하나요?"
          rows={2}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm resize-none
            focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        onClick={handleNext}
        disabled={!choice || confidence === 0}
        className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300
          disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors text-sm"
      >
        {isLast
          ? state.config.phaseOrder.indexOf("task") === 1
            ? "실제 과업 시작하기"
            : "사후 설문으로 이동"
          : "다음 문항"}
      </button>
    </ScreenLayout>
  );
}
