"use client";

import type { TrainingSession, SessionType } from "@/lib/types";
import { SESSION_COLORS } from "@/lib/types";

interface StatsBarProps {
  sessions: TrainingSession[];
  year: number;
  month: number;
}

export function StatsBar({ sessions, year, month }: StatsBarProps) {
  const prefix = `${year}-${String(month + 1).padStart(2, "0")}`;
  const monthSessions = sessions.filter((s) => s.date.startsWith(prefix));

  const counts: Record<SessionType, number> = {
    strength: 0,
    cardio: 0,
    grappling: 0,
    striking: 0,
  };
  for (const s of monthSessions) {
    counts[s.type]++;
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {(Object.keys(counts) as SessionType[]).map((type) => {
        const c = SESSION_COLORS[type];
        return (
          <div
            key={type}
            className="rounded-2xl bg-[#1c1c1e] p-4 shadow-sm ring-1 ring-white/8"
          >
            <div className="mb-2 flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: c.hex }}
              />
              <span className="text-xs font-medium text-zinc-500">
                {c.label}
              </span>
            </div>
            <p className="text-2xl font-semibold tabular-nums tracking-tight text-zinc-100">
              {counts[type]}
            </p>
            <p className="text-[11px] text-zinc-600">this month</p>
          </div>
        );
      })}
    </div>
  );
}
