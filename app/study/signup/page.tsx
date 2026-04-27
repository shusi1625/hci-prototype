"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useExperiment } from "@/context/ExperimentContext";
import { useInputLogger } from "@/hooks/useLogger";
import ScreenLayout from "@/components/layout/ScreenLayout";
import PhaseProgressBar from "@/components/layout/PhaseProgressBar";
import ScenarioBrief from "@/components/layout/ScenarioBrief";
import PlaceholderField from "@/components/fields/PlaceholderField";
import LabeledField from "@/components/fields/LabeledField";
import { getConditionLabel } from "@/lib/experiment";

type Errors = { name?: string; email?: string; password?: string };

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function SignupPage() {
  const router = useRouter();
  const {
    state,
    currentCondition,
    currentScenario,
    currentFormData,
    setCurrentFormData,
    setCurrentScreen,
  } = useExperiment();

  const isB = currentCondition === "B";
  const { onFocus, onBlur, onChange, onValidationError, onInvalidSubmit, emit } =
    useInputLogger("signup");

  const [name, setName] = useState(currentFormData.name);
  const [email, setEmail] = useState(currentFormData.email);
  const [password, setPassword] = useState(currentFormData.password);
  const [errors, setErrors] = useState<Errors>({});
  const changeCounts = React.useRef({ name: 0, email: 0, password: 0 });
  const validationErrorCount = React.useRef(0);

  useEffect(() => {
    setCurrentScreen("signup");
    emit("task_run_start", {
      meta: {
        expectedPlan: currentScenario.expectedPlan,
        expectedPayment: currentScenario.expectedPayment,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validate = (): boolean => {
    const newErrors: Errors = {};
    if (!name.trim()) {
      newErrors.name = "이름을 입력해주세요.";
      validationErrorCount.current += 1;
      onValidationError("name", "empty");
    }
    if (!validateEmail(email)) {
      newErrors.email = "올바른 이메일 형식을 입력해주세요.";
      validationErrorCount.current += 1;
      onValidationError("email", "invalid_format");
    }
    if (password.length < 8) {
      newErrors.password = "비밀번호는 8자 이상이어야 합니다.";
      validationErrorCount.current += 1;
      onValidationError("password", "too_short");
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      onInvalidSubmit();
      return;
    }
    setCurrentFormData({ name, email, password });
    emit("field_complete", {
      meta: {
        fields: ["name", "email", "password"],
        changeCounts: changeCounts.current,
        validationErrorCount: validationErrorCount.current,
      },
    });
    router.push("/study/plan");
  };

  return (
    <ScreenLayout title="계정 정보 입력" subtitle="서비스 가입에 필요한 정보를 입력해주세요.">
      <PhaseProgressBar
        currentPhase="task"
        currentScreen="signup"
        config={state.config}
        currentTaskRunIndex={state.currentTaskRunIndex}
      />

      <ScenarioBrief scenario={currentScenario} />
      <div className="bg-gray-100 rounded-xl p-3 mb-6 text-xs text-gray-600">
        현재 UI: <strong>{getConditionLabel(currentCondition)}</strong>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-5">
        {isB ? (
          <>
            <LabeledField
              id="name"
              label="이름"
              placeholder="홍길동"
              value={name}
              onChange={(v) => {
                changeCounts.current.name += 1;
                setName(v);
                onChange("name", v);
                setCurrentFormData({ name: v });
              }}
              onFocus={() => onFocus("name")}
              onBlur={() => onBlur("name", name)}
              error={errors.name}
            />
            <LabeledField
              id="email"
              type="email"
              label="이메일"
              placeholder="example@email.com"
              value={email}
              onChange={(v) => {
                changeCounts.current.email += 1;
                setEmail(v);
                onChange("email", v);
                setCurrentFormData({ email: v });
              }}
              onFocus={() => onFocus("email")}
              onBlur={() => onBlur("email", email)}
              error={errors.email}
            />
            <LabeledField
              id="password"
              type="password"
              label="비밀번호"
              placeholder="8자 이상 입력"
              value={password}
              onChange={(v) => {
                changeCounts.current.password += 1;
                setPassword(v);
                onChange("password", v);
                setCurrentFormData({ password: v });
              }}
              onFocus={() => onFocus("password")}
              onBlur={() => onBlur("password", password)}
              error={errors.password}
            />
          </>
        ) : (
          <>
            <PlaceholderField
              id="name"
              placeholder="이름을 입력하세요"
              value={name}
              onChange={(v) => {
                changeCounts.current.name += 1;
                setName(v);
                onChange("name", v);
                setCurrentFormData({ name: v });
              }}
              onFocus={() => onFocus("name")}
              onBlur={() => onBlur("name", name)}
              error={errors.name}
            />
            <PlaceholderField
              id="email"
              type="email"
              placeholder="이메일 주소를 입력하세요"
              value={email}
              onChange={(v) => {
                changeCounts.current.email += 1;
                setEmail(v);
                onChange("email", v);
                setCurrentFormData({ email: v });
              }}
              onFocus={() => onFocus("email")}
              onBlur={() => onBlur("email", email)}
              error={errors.email}
            />
            <PlaceholderField
              id="password"
              type="password"
              placeholder="비밀번호를 8자 이상 입력하세요"
              value={password}
              onChange={(v) => {
                changeCounts.current.password += 1;
                setPassword(v);
                onChange("password", v);
                setCurrentFormData({ password: v });
              }}
              onFocus={() => onFocus("password")}
              onBlur={() => onBlur("password", password)}
              error={errors.password}
            />
          </>
        )}
        <button
          onClick={handleSubmit}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors text-sm mt-2"
        >
          다음
        </button>
      </div>
    </ScreenLayout>
  );
}
