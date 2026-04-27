"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useExperiment } from "@/context/ExperimentContext";
import { useLogger } from "@/hooks/useLogger";
import ScreenLayout from "@/components/layout/ScreenLayout";
import PhaseProgressBar from "@/components/layout/PhaseProgressBar";
import type { SurveyData } from "@/types/log";

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

function LikertRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-gray-700">{label}</p>
      <div className="grid grid-cols-7 gap-1.5">
        {[1, 2, 3, 4, 5, 6, 7].map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`h-9 rounded-lg border text-sm font-semibold transition-all
              ${value === n
                ? "border-blue-500 bg-blue-500 text-white"
                : "border-gray-300 text-gray-600 hover:border-gray-400"
              }`}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-400 px-1">
        <span>전혀 그렇지 않다</span>
        <span>매우 그렇다</span>
      </div>
    </div>
  );
}

function ChoiceRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-gray-700">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all
              ${value === opt.value
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-300 text-gray-600 hover:border-gray-400"
              }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-5">
      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">{title}</h3>
      {children}
    </div>
  );
}

function ConditionRatingPair({
  labelA,
  labelB,
  valueA,
  valueB,
  onChangeA,
  onChangeB,
}: {
  labelA: string;
  labelB: string;
  valueA: number;
  valueB: number;
  onChangeA: (v: number) => void;
  onChangeB: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <LikertRow label={labelA} value={valueA} onChange={onChangeA} />
      <LikertRow label={labelB} value={valueB} onChange={onChangeB} />
    </div>
  );
}

export default function SurveyPage() {
  const router = useRouter();
  const { state, setSurveyData, setCurrentScreen } = useExperiment();
  const { emit } = useLogger("survey");
  const [survey, setSurvey] = useState<SurveyData>(DEFAULT_SURVEY);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    setCurrentScreen("survey");
    emit("survey_start", {
      meta: {
        groupId: state.config.groupId,
        participantProfile: state.participantProfile,
        taskRuns: state.taskRuns.map((run) => ({
          condition: run.condition,
          scenarioId: run.scenarioId,
          success: run.success,
        })),
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = <K extends keyof SurveyData>(key: K, value: SurveyData[K]) => {
    setSurvey((prev) => ({ ...prev, [key]: value }));
    emit("survey_answer", { targetId: key, value: String(value) });
  };

  const handleSubmit = () => {
    const ok =
      survey.easierVersion &&
      survey.preferredVersion &&
      survey.inputClearA > 0 &&
      survey.inputClearB > 0 &&
      survey.optionCompareA > 0 &&
      survey.optionCompareB > 0 &&
      survey.ctaPredictableA > 0 &&
      survey.ctaPredictableB > 0 &&
      survey.overallEaseA > 0 &&
      survey.overallEaseB > 0 &&
      survey.feltDifference > 0 &&
      survey.biggestDifference &&
      survey.mostHelpful &&
      survey.mindChanged !== null;

    if (!ok) {
      setSubmitError("필수 문항에 모두 응답해주세요.");
      return;
    }

    setSurveyData(survey);
    emit("survey_submit", { meta: survey });
    router.push("/study/end");
  };

  const conditionOptions = [
    { value: "A", label: `조건 A${state.config.conditionOrder[0] === "A" ? " (먼저 수행)" : " (나중 수행)"}` },
    { value: "B", label: `조건 B${state.config.conditionOrder[0] === "B" ? " (먼저 수행)" : " (나중 수행)"}` },
    { value: "same", label: "비슷했다" },
  ];

  return (
    <ScreenLayout
      title="사후 설문"
      subtitle="두 조건을 모두 경험한 뒤 느낀 차이를 응답해주세요."
      maxWidth="max-w-lg"
    >
      <PhaseProgressBar currentPhase="survey" currentScreen="survey" config={state.config} />

      <div className="flex flex-col gap-6">
        <Section title="A. 선호도">
          <ChoiceRow
            label="실제로 사용하기 더 편했던 버전은 무엇입니까?"
            options={conditionOptions}
            value={survey.easierVersion}
            onChange={(v) => update("easierVersion", v)}
          />
          <ChoiceRow
            label="실제 서비스라면 어느 버전을 사용하고 싶습니까?"
            options={conditionOptions}
            value={survey.preferredVersion}
            onChange={(v) => update("preferredVersion", v)}
          />
        </Section>

        <Section title="B. 조건별 평가">
          <ConditionRatingPair
            labelA="조건 A에서 무엇을 입력해야 하는지 명확했다."
            labelB="조건 B에서 무엇을 입력해야 하는지 명확했다."
            valueA={survey.inputClearA}
            valueB={survey.inputClearB}
            onChangeA={(v) => update("inputClearA", v)}
            onChangeB={(v) => update("inputClearB", v)}
          />
          <ConditionRatingPair
            labelA="조건 A에서 선택지를 빠르게 비교할 수 있었다."
            labelB="조건 B에서 선택지를 빠르게 비교할 수 있었다."
            valueA={survey.optionCompareA}
            valueB={survey.optionCompareB}
            onChangeA={(v) => update("optionCompareA", v)}
            onChangeB={(v) => update("optionCompareB", v)}
          />
          <ConditionRatingPair
            labelA="조건 A에서 최종 버튼을 누르면 어떤 일이 일어날지 예측할 수 있었다."
            labelB="조건 B에서 최종 버튼을 누르면 어떤 일이 일어날지 예측할 수 있었다."
            valueA={survey.ctaPredictableA}
            valueB={survey.ctaPredictableB}
            onChangeA={(v) => update("ctaPredictableA", v)}
            onChangeB={(v) => update("ctaPredictableB", v)}
          />
          <ConditionRatingPair
            labelA="조건 A는 전체적으로 과업을 수행하기 편했다."
            labelB="조건 B는 전체적으로 과업을 수행하기 편했다."
            valueA={survey.overallEaseA}
            valueB={survey.overallEaseB}
            onChangeA={(v) => update("overallEaseA", v)}
            onChangeB={(v) => update("overallEaseB", v)}
          />
        </Section>

        <Section title="C. 차이 인지">
          <LikertRow
            label="두 버전 간 차이를 명확히 느꼈다."
            value={survey.feltDifference}
            onChange={(v) => update("feltDifference", v)}
          />
          <ChoiceRow
            label="가장 크게 느껴진 차이는 무엇입니까?"
            options={[
              { value: "input", label: "입력 필드" },
              { value: "option", label: "옵션 선택 방식" },
              { value: "cta", label: "버튼 문구" },
              { value: "other", label: "기타" },
            ]}
            value={survey.biggestDifference}
            onChange={(v) => update("biggestDifference", v)}
          />
        </Section>

        <Section title="D. 원인 해석">
          <ChoiceRow
            label="과업 수행에 가장 도움이 된 요소는 무엇입니까?"
            options={[
              { value: "input", label: "입력 필드 레이블" },
              { value: "option", label: "옵션 선택 방식" },
              { value: "cta", label: "버튼 문구" },
              { value: "none", label: "특별히 없음" },
            ]}
            value={survey.mostHelpful}
            onChange={(v) => update("mostHelpful", v)}
          />
          <div className="flex flex-col gap-2">
            <p className="text-sm text-gray-700">
              화면만 보고 판단했을 때와 실제로 사용했을 때 생각이 달라졌습니까?
            </p>
            <div className="flex gap-3">
              {[
                { value: true, label: "달라졌다" },
                { value: false, label: "달라지지 않았다" },
              ].map((opt) => (
                <button
                  key={String(opt.value)}
                  onClick={() => update("mindChanged", opt.value)}
                  className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all
                    ${survey.mindChanged === opt.value
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-300 text-gray-600 hover:border-gray-400"
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          {survey.mindChanged === true && (
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-700">
                어떤 점에서 달라졌습니까? <span className="text-gray-400">(선택 사항)</span>
              </label>
              <textarea
                value={survey.mindChangedDetail}
                onChange={(e) => update("mindChangedDetail", e.target.value)}
                placeholder="자유롭게 작성해주세요."
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-700">
              추가 의견 <span className="text-gray-400">(선택 사항)</span>
            </label>
            <textarea
              value={survey.finalComment}
              onChange={(e) => update("finalComment", e.target.value)}
              placeholder="불편했던 점이나 기억나는 차이가 있다면 적어주세요."
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </Section>

        {submitError && <p className="text-sm text-red-500 text-center">{submitError}</p>}

        <button
          onClick={handleSubmit}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors text-base"
        >
          설문 제출 완료
        </button>
      </div>
    </ScreenLayout>
  );
}
