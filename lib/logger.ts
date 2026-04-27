import type { ExperimentState, LogEvent } from "@/types/log";

const STORAGE_KEY = "hci_experiment_logs";
const STATE_KEY = "hci_experiment_state";

function csvEscape(value: unknown): string {
  if (value === undefined || value === null) return "";
  const text = typeof value === "object" ? JSON.stringify(value) : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export function log(event: Omit<LogEvent, "timestamp">): void {
  const entry: LogEvent = {
    ...event,
    timestamp: Date.now(),
  };

  try {
    const existing = getRawLogs();
    existing.push(entry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch (e) {
    console.error("Log write failed:", e);
  }
}

export function getRawLogs(): LogEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function exportLogs(): void {
  const logs = getRawLogs();
  const blob = new Blob([JSON.stringify(logs, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `hci_logs_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportLogsAsCSV(): void {
  const logs = getRawLogs();
  if (logs.length === 0) return;

  const headers: (keyof LogEvent)[] = [
    "participantId",
    "sessionId",
    "groupId",
    "condition",
    "scenarioId",
    "taskRunIndex",
    "taskId",
    "screenId",
    "eventType",
    "timestamp",
    "targetId",
    "value",
    "meta",
  ];

  const rows = logs.map((entry) =>
    headers.map((header) => csvEscape(entry[header])).join(",")
  );

  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `hci_logs_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function clearLogs(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(STATE_KEY);
}

export function saveState(state: Partial<ExperimentState>): void {
  try {
    const existing = loadState() || {};
    localStorage.setItem(STATE_KEY, JSON.stringify({ ...existing, ...state }));
  } catch (e) {
    console.error("State save failed:", e);
  }
}

export function loadState(): ExperimentState | null {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
