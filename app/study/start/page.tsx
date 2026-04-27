"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useExperiment } from "@/context/ExperimentContext";
import { log } from "@/lib/logger";
import { COUNTERBALANCE_GROUPS } from "@/lib/experiment";
import type { CounterbalanceGroup, ParticipantProfile } from "@/types/log";

const GROUP_IDS = ["G1", "G2", "G3", "G4"] as const;

const DEFAULT_PROFILE: ParticipantProfile = {
  majorCategory: "",
  uxExperience: "",
  digitalSkill: 0,
  serviceUseFrequency: "",
};

export default function StartPage() {
  const router = useRouter();
  const { initSession } = useExperiment();

  const [participantId, setParticipantId] = useState("");
  const [groupId, setGroupId] = useState<CounterbalanceGroup>("G1");
  const [profile, setProfile] = useState<ParticipantProfile>(DEFAULT_PROFILE);
  const [error, setError] = useState("");

  const selectedGroup = COUNTERBALANCE_GROUPS[groupId];

  const updateProfile = <K extends keyof ParticipantProfile>(
    key: K,
    value: ParticipantProfile[K]
  ) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
    setError("");
  };

  const handleStart = () => {
    const isProfileComplete =
      profile.majorCategory &&
      profile.uxExperience &&
      profile.digitalSkill > 0 &&
      profile.serviceUseFrequency;

    if (!isProfileComplete) {
      setError("참가자 특성 문항과 그룹 배정을 모두 입력해주세요.");
      return;
    }

    const session = initSession(selectedGroup.config, profile, participantId);

    log({
      participantId: session.participantId,
      sessionId: session.sessionId,
      groupId: session.config.groupId,
      condition: session.config.conditionOrder[0],
      scenarioId: session.config.scenarioOrder[0],
      taskRunIndex: 0,
      taskId: "main",
      screenId: "start",
      eventType: "session_start",
      meta: {
        groupId,
        phaseOrder: session.config.phaseOrder,
        conditionOrder: session.config.conditionOrder,
        scenarioOrder: session.config.scenarioOrder,
        participantProfile: profile,
        participantIdManual: !!participantId.trim(),
      },
    });

    router.push("/study/static");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-4">
          <div className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">
            HCI 유저 스터디
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            UI 원칙 실효성 검증 실험
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            참가자 특성을 기록하고 4개 counterbalancing 그룹 중 하나를 배정합니다.
            정적 판단은 항상 먼저 진행하며, 실제 과업은 조건 순서와 시나리오 순서를
            교차해 수행합니다.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-4 mb-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-sm font-bold text-gray-700 mb-5">참가자 정보</h2>

            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                참가자 ID <span className="text-gray-400 font-normal">(비우면 자동 생성)</span>
              </label>
              <input
                type="text"
                placeholder="예: P001"
                value={participantId}
                onChange={(e) => setParticipantId(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <SelectField
              label="전공 계열"
              value={profile.majorCategory}
              onChange={(value) =>
                updateProfile("majorCategory", value as ParticipantProfile["majorCategory"])
              }
              options={[
                { value: "", label: "선택하세요" },
                { value: "design_cs", label: "디자인/컴퓨터 관련" },
                { value: "non_design_cs", label: "비관련 전공" },
              ]}
            />

            <SelectField
              label="UX/UI 또는 프론트엔드 경험"
              value={profile.uxExperience}
              onChange={(value) =>
                updateProfile("uxExperience", value as ParticipantProfile["uxExperience"])
              }
              options={[
                { value: "", label: "선택하세요" },
                { value: "yes", label: "있음" },
                { value: "no", label: "없음" },
              ]}
            />

            <div className="mb-5">
              <p className="text-sm font-medium text-gray-700 mb-2">
                디지털 서비스 숙련도
              </p>
              <div className="grid grid-cols-7 gap-1.5">
                {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                  <button
                    key={n}
                    onClick={() => updateProfile("digitalSkill", n)}
                    className={`h-9 rounded-lg border text-sm font-semibold transition-all
                      ${profile.digitalSkill === n
                        ? "border-blue-500 bg-blue-500 text-white"
                        : "border-gray-300 text-gray-600 hover:border-gray-400"
                      }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-400 px-1 mt-1">
                <span>낮음</span>
                <span>높음</span>
              </div>
            </div>

            <SelectField
              label="온라인 회원가입/결제 서비스 사용 빈도"
              value={profile.serviceUseFrequency}
              onChange={(value) =>
                updateProfile(
                  "serviceUseFrequency",
                  value as ParticipantProfile["serviceUseFrequency"]
                )
              }
              options={[
                { value: "", label: "선택하세요" },
                { value: "low", label: "낮음" },
                { value: "medium", label: "중간" },
                { value: "high", label: "높음" },
              ]}
            />
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-sm font-bold text-gray-700 mb-3">그룹 배정</h2>
            <p className="text-xs text-gray-500 leading-relaxed mb-4">
              각 그룹은 조건 순서와 시나리오 순서를 교차합니다. 모집 중에는 UX 경험자와
              숙련도가 특정 그룹에 몰리지 않도록 빈 그룹부터 균형 있게 배정하세요.
            </p>
            <div className="flex flex-col gap-2">
              {GROUP_IDS.map((id) => {
                const group = COUNTERBALANCE_GROUPS[id];
                return (
                  <button
                    key={id}
                    onClick={() => {
                      setGroupId(id);
                      setError("");
                    }}
                    className={`p-3 rounded-xl border text-left transition-all
                      ${groupId === id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                      }`}
                  >
                    <span className="block text-sm font-bold text-gray-800">{group.label}</span>
                    <span className="block text-xs text-gray-500 mt-0.5">
                      {group.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-gray-100 rounded-xl px-4 py-3 mb-4 flex flex-col gap-1">
          <p className="text-xs font-semibold text-gray-500 mb-1">현재 설정 요약</p>
          <p className="text-xs text-gray-600">
            그룹: <strong>{selectedGroup.label}</strong>
          </p>
          <p className="text-xs text-gray-600">
            흐름: <strong>정적 판단 → 실제 과업 1 → 실제 과업 2 → 사후 설문</strong>
          </p>
          <p className="text-xs text-gray-600">
            조건:{" "}
            <strong>
              {selectedGroup.config.conditionOrder[0]} → {selectedGroup.config.conditionOrder[1]}
            </strong>
          </p>
          <p className="text-xs text-gray-600">
            시나리오:{" "}
            <strong>
              {selectedGroup.config.scenarioOrder[0]} → {selectedGroup.config.scenarioOrder[1]}
            </strong>
          </p>
        </div>

        {error && <p className="text-sm text-red-500 text-center mb-3">{error}</p>}

        <button
          onClick={handleStart}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold
            rounded-xl transition-colors text-base"
        >
          실험 시작하기
        </button>
        <p className="text-xs text-gray-400 text-center mt-3">
          예상 소요 시간: 약 15~20분
        </p>
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block mb-5">
      <span className="block text-sm font-medium text-gray-700 mb-1">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white
          focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
