"use client";

import React from "react";

type Option = { value: string; label: string; description?: string };

type Props = {
  id: string;
  label?: string;
  options: Option[];
  value: string;
  onChange: (v: string) => void;
};

export default function RadioSelect({ id, label, options, value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <span className="text-sm text-gray-500">{label}</span>
      )}
      <div className="flex flex-col gap-2">
        {options.map((opt) => (
          <label
            key={opt.value}
            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors
              ${
                value === opt.value
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 bg-white hover:bg-gray-50"
              }`}
          >
            <input
              type="radio"
              name={id}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              className="mt-0.5 accent-blue-500"
            />
            <div>
              <p className="text-sm font-medium text-gray-800">{opt.label}</p>
              {opt.description && (
                <p className="text-xs text-gray-500 mt-0.5">{opt.description}</p>
              )}
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
