import type { Metadata } from "next";
import "./globals.css";
import { ExperimentProvider } from "@/context/ExperimentContext";

export const metadata: Metadata = {
  title: "UI 원칙 실효성 검증 실험",
  description: "HCI 연구를 위한 A/B 실험 프로토타입",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <ExperimentProvider>{children}</ExperimentProvider>
      </body>
    </html>
  );
}
