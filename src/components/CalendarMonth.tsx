"use client";

import type { TrainingSession, SessionType } from "@/lib/types";
import { SESSION_COLORS } from "@/lib/types";
import {
  getMonthGrid,
  toDateKey,
  formatMonthTitle,
  isSameMonth,
  isSameDay,
  WEEKDAY_LABELS,
} from "@/lib/calendar";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarMonthProps {
  year: number;
  month: number;
  sessions: TrainingSession[];
  selectedDate: string | null;
  onSelectDate: (dateKey: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

export function CalendarMonth({
  year,
  month,
  sessions,
  selectedDate,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
  onToday,
}: CalendarMonthProps) {
  const days = getMonthGrid(year, month);
  const currentMonth = new Date(year, month, 1);
  const today = new Date();

  const sessionsByDate = new Map<string, SessionType[]>();
  for (const s of sessions) {
    const existing = sessionsByDate.get(s.date) ?? [];
    if (!existing.includes(s.type)) {
      existing.push(s.type);
    }
    sessionsByDate.set(s.date, existing);
  }

  return (
    <div className="flex h-full flex-col rounded-2xl bg-[#1c1c1e] shadow-sm ring-1 ring-white/8">
      <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
            {formatMonthTitle(year, month)}
          </h1>
          <button
            type="button"
            onClick={onToday}
            className="rounded-full bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-300 transition hover:bg-zinc-700"
          >
            Today
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPrevMonth}
            aria-label="Previous month"
            className="rounded-full p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={onNextMonth}
            aria-label="Next month"
            className="rounded-full p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-white/8">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="py-2 text-center text-[11px] font-medium uppercase tracking-wider text-zinc-500"
          >
            {label}
          </div>
        ))}
      </div>

      <div className="grid flex-1 grid-cols-7 grid-rows-6">
        {days.map((day) => {
          const key = toDateKey(day);
          const inMonth = isSameMonth(day, currentMonth);
          const isToday = isSameDay(day, today);
          const isSelected = selectedDate === key;
          const types = sessionsByDate.get(key) ?? [];
          const dayNum = day.getDate();

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectDate(key)}
              className={[
                "relative flex min-h-[72px] flex-col items-start border-b border-r border-white/6 p-1.5 text-left transition",
                "hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0A84FF]",
                !inMonth ? "bg-black/40" : "bg-transparent",
                isSelected ? "bg-[#0A84FF]/15 ring-2 ring-inset ring-[#0A84FF]" : "",
              ].join(" ")}
            >
              <span
                className={[
                  "flex h-7 w-7 items-center justify-center rounded-full text-sm",
                  isToday
                    ? "bg-[#0A84FF] font-semibold text-white"
                    : inMonth
                      ? "font-medium text-zinc-200"
                      : "text-zinc-600",
                ].join(" ")}
              >
                {dayNum}
              </span>

              {types.length > 0 && (
                <div className="mt-auto flex flex-wrap gap-1 px-0.5 pb-0.5">
                  {types.map((type) => (
                    <span
                      key={type}
                      title={SESSION_COLORS[type].label}
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: SESSION_COLORS[type].hex }}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-4 border-t border-white/8 px-5 py-3">
        {(Object.keys(SESSION_COLORS) as SessionType[]).map((type) => (
          <div key={type} className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: SESSION_COLORS[type].hex }}
            />
            <span className="text-xs text-zinc-500">
              {SESSION_COLORS[type].label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
