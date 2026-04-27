"use client";

import React from "react";

type Option = { value: string; label: string };

type Props = {
  id: string;
  label?: string;
  options: Option[];
  value: string;
  onChange: (v: string) => void;
  onOpen?: () => void;
  placeholder?: string;
};

export default function DropdownSelect({
  id,
  label,
  options,
  value,
  onChange,
  onOpen,
  placeholder = "선택하세요",
}: Props) {
  return (
    <div className="flex flex-col gap-1">
      {label && <span className="text-sm text-gray-500">{label}</span>}
      <select
        id={id}
        value={value}
        onFocus={onOpen}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
