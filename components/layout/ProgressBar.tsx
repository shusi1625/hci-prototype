"use client";

import React from "react";

const SCREEN_ORDER = ["start", "static", "signup", "plan", "confirm", "survey", "end"];

type Props = {
  currentScreen: string;
};

export default function ProgressBar({ currentScreen }: Props) {
  const idx = SCREEN_ORDER.indexOf(currentScreen);
  const progress = idx < 0 ? 0 : Math.round((idx / (SCREEN_ORDER.length - 1)) * 100);

  if (currentScreen === "start" || currentScreen === "end") return null;

  return (
    <div className="w-full bg-gray-200 rounded-full h-1.5 mb-6">
      <div
        className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
