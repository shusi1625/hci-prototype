"use client";

import { useCallback, useEffect, useRef } from "react";
import { useExperiment } from "@/context/ExperimentContext";
import { log } from "@/lib/logger";
import type { LogEvent } from "@/types/log";

type LogExtra = Partial<Pick<LogEvent, "targetId" | "value" | "meta">>;

export function useLogger(screenId: string, taskId: string = "main") {
  const { state, currentCondition, currentScenarioId } = useExperiment();
  const enterTimeRef = useRef<number>(Date.now());

  const emit = useCallback(
    (eventType: string, extra?: LogExtra) => {
      log({
        participantId: state.participantId,
        sessionId: state.sessionId,
        groupId: state.config.groupId,
        condition: currentCondition,
        scenarioId: currentScenarioId,
        taskRunIndex: state.currentTaskRunIndex,
        taskId,
        screenId,
        eventType,
        ...extra,
      });
    },
    [
      currentCondition,
      currentScenarioId,
      state.currentTaskRunIndex,
      state.participantId,
      state.sessionId,
      taskId,
      screenId,
    ]
  );

  useEffect(() => {
    enterTimeRef.current = Date.now();
    emit("screen_enter");
    return () => {
      emit("screen_exit", {
        meta: { durationMs: Date.now() - enterTimeRef.current },
      });
    };
    // Screen timing should be bound to the route screen, not every state update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screenId]);

  return { emit };
}

export function useInputLogger(screenId: string, taskId: string = "main") {
  const { emit } = useLogger(screenId, taskId);
  const focusTimeRef = useRef<Record<string, number>>({});

  const onFocus = useCallback(
    (fieldId: string) => {
      focusTimeRef.current[fieldId] = Date.now();
      emit("input_focus", { targetId: fieldId });
    },
    [emit]
  );

  const onBlur = useCallback(
    (fieldId: string, value: string) => {
      const duration = focusTimeRef.current[fieldId]
        ? Date.now() - focusTimeRef.current[fieldId]
        : 0;
      emit("input_blur", {
        targetId: fieldId,
        value: value.length > 0 ? "filled" : "empty",
        meta: { durationMs: duration },
      });
    },
    [emit]
  );

  const onChange = useCallback(
    (fieldId: string, value: string) => {
      emit("input_change", {
        targetId: fieldId,
        meta: { length: value.length },
      });
    },
    [emit]
  );

  const onValidationError = useCallback(
    (fieldId: string, errorMsg: string) => {
      emit("validation_error", {
        targetId: fieldId,
        value: errorMsg,
      });
    },
    [emit]
  );

  const onInvalidSubmit = useCallback(() => {
    emit("invalid_submit");
  }, [emit]);

  return { onFocus, onBlur, onChange, onValidationError, onInvalidSubmit, emit };
}
