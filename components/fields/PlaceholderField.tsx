"use client";

import React from "react";

type Props = {
  id: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  error?: string;
};

export default function PlaceholderField({
  id,
  type = "text",
  placeholder,
  value,
  onChange,
  onFocus,
  onBlur,
  error,
}: Props) {
  return (
    <div className="flex flex-col gap-1">
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        className={`w-full px-4 py-3 rounded-lg border text-sm bg-white transition-colors
          focus:outline-none focus:ring-2 focus:ring-blue-500
          ${error ? "border-red-400" : "border-gray-300"}`}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
