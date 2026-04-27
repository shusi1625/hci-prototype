"use client";

import React from "react";
import type { ScenarioId } from "@/types/log";

type Scenario = {
  id: ScenarioId;
  title: string;
  instruction: string;
};

export default function ScenarioBrief({ scenario }: { scenario: Scenario }) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6 text-xs text-amber-900">
      <p className="font-semibold text-amber-700 mb-1">과업 지시문</p>
      <p className="font-medium leading-relaxed">{scenario.instruction}</p>
    </div>
  );
}
