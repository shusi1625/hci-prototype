"use client";

import React, { useEffect, useState } from "react";
import { useExperiment } from "@/context/ExperimentContext";
import { useLogger } from "@/hooks/useLogger";
import { clearLogs, exportLogs, exportLogsAsCSV, getRawLogs } from "@/lib/logger";
import { PAYMENT_LABELS, PLAN_LABELS, TASK_SCENARIOS } from "@/lib/experiment";

export default function EndPage() {
  const { state, setCurrentScreen, resetSession } = useExperiment();
  const { emit } = useLogger("end");
  const [logCount, setLogCount] = useState(0);
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    setCurrentScreen("end");
    emit("session_end", {
      meta: {
        groupId: state.config.groupId,
        conditionOrder: state.config.conditionOrder,
        phaseOrder: state.config.phaseOrder,
        scenarioOrder: state.config.scenarioOrder,
        participantId: state.participantId,
        participantProfile: state.participantProfile,
        taskRunCount: state.taskRuns.length,
        taskRuns: state.taskRuns.map((run) => ({
          condition: run.condition,
          scenarioId: run.scenarioId,
          success: run.success,
        })),
      },
    });
    setLogCount(getRawLogs().length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClear = () => {
    clearLogs();
    resetSession();
    setCleared(true);
    setLogCount(0);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            실험이 완료되었습니다
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            참여해주셔서 감사합니다. 아래에서 로그 데이터를 내려받을 수 있습니다.
          </p>

          <div className="bg-gray-50 rounded-xl p-4 text-left flex flex-col gap-2 mb-4">
            <Row label="참가자 ID" value={state.participantId || "-"} />
            <Row label="세션 ID" value={state.sessionId || "-"} />
            <Row label="그룹" value={state.config.groupId} />
            <Row
              label="단계 순서"
              value={`${state.config.phaseOrder[0]} → ${state.config.phaseOrder[1]} → survey`}
            />
            <Row
              label="조건 순서"
              value={`${state.config.conditionOrder[0]} → ${state.config.conditionOrder[1]}`}
            />
            <Row
              label="시나리오 순서"
              value={`${state.config.scenarioOrder[0]} → ${state.config.scenarioOrder[1]}`}
            />
            <Row label="기록된 이벤트" value={`${logCount}개`} />
          </div>

          {state.taskRuns.length > 0 && (
            <div className="bg-blue-50 rounded-xl p-4 text-left mb-4">
              <p className="text-xs font-semibold text-blue-600 mb-3">과업 수행 결과</p>
              {state.taskRuns.map((run, index) => {
                const scenario = TASK_SCENARIOS[run.scenarioId];
                return (
                  <div key={`${run.condition}-${run.scenarioId}`} className="mb-3 last:mb-0">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">
                        조건 {run.condition} ({index + 1}번째)
                      </span>
                      <span className={`font-medium ${run.success ? "text-green-600" : "text-red-500"}`}>
                        {run.success ? "과업 성공" : "목표와 다름"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      목표: {PLAN_LABELS[scenario.expectedPlan]}, {PAYMENT_LABELS[scenario.expectedPayment]}
                    </p>
                    <p className="text-xs text-gray-500">
                      선택: {PLAN_LABELS[run.planData.plan] || "-"}, {PAYMENT_LABELS[run.planData.payment] || "-"}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {state.staticJudgments.length > 0 && (
            <div className="bg-green-50 rounded-xl p-4 text-left mb-6">
              <p className="text-xs font-semibold text-green-600 mb-3">정적 판단 결과</p>
              {state.staticJudgments.map((judgment) => (
                <div key={judgment.questionId} className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{judgment.questionId}</span>
                  <span className="font-medium text-gray-800">
                    {judgment.choice} 선택 · 확신도 {judgment.confidence}/5
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button
              onClick={exportLogs}
              disabled={cleared}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-colors text-sm"
            >
              JSON으로 내려받기
            </button>
            <button
              onClick={exportLogsAsCSV}
              disabled={cleared}
              className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-colors text-sm"
            >
              CSV로 내려받기
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-sm font-semibold text-gray-700 mb-1">다음 참가자 실험 준비</p>
          <p className="text-xs text-gray-400 mb-4">
            로그를 내려받은 뒤 초기화하면 다음 참가자의 실험을 새로 시작할 수 있습니다.
          </p>
          {!cleared ? (
            <button
              onClick={handleClear}
              className="w-full py-2.5 border border-red-300 text-red-500 hover:bg-red-50 font-medium rounded-xl transition-colors text-sm"
            >
              로그 초기화 및 새 세션 준비
            </button>
          ) : (
            <a
              href="/study/start"
              className="block w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl transition-colors text-sm text-center"
            >
              새 참가자 실험 시작
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center gap-4">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-xs font-medium text-gray-800 font-mono text-right">{value}</span>
    </div>
  );
}
