"use client";

import React from "react";

type Props = {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string;
};

export default function ScreenLayout({
  title,
  subtitle,
  children,
  maxWidth = "max-w-lg",
}: Props) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start py-10 px-4">
      <div className={`w-full ${maxWidth}`}>
        {(title || subtitle) && (
          <div className="mb-6">
            {title && (
              <h1 className="text-xl font-bold text-gray-900">{title}</h1>
            )}
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
