"use client";

import { useCallback, useState } from "react";
import {
  CalendarDays,
  ChartLine,
  RotateCcw,
  Cloud,
  CloudCheck,
  User as UserIcon,
  Loader2,
} from "lucide-react";
import { useSessions } from "@/hooks/useSessions";
import { useAuth } from "@/context/AuthContext";
import { addMonths, subMonths } from "@/lib/calendar";
import type { TrainingSession } from "@/lib/types";
import { SESSION_COLORS } from "@/lib/types";
import { CalendarMonth } from "./CalendarMonth";
import { DayDrawer } from "./DayDrawer";
import { Analytics } from "./Analytics";
import { StatsBar } from "./StatsBar";
import { AuthModal } from "./AuthModal";

type MainView = "calendar" | "analytics";

export function AppShell() {
  const {
    sessions,
    customExercises,
    customCardioTypes,
    ready,
    syncStatus,
    addSession,
    deleteSession,
    reset,
  } = useSessions();

  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const [viewDate, setViewDate] = useState(() => new Date(2026, 6, 1));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [mainView, setMainView] = useState<MainView>("calendar");

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const onPrevMonth = useCallback(() => {
    setViewDate((d) => subMonths(d, 1));
  }, []);

  const onNextMonth = useCallback(() => {
    setViewDate((d) => addMonths(d, 1));
  }, []);

  const onToday = useCallback(() => {
    const now = new Date();
    if (now.getFullYear() === 2026) {
      setViewDate(new Date(2026, now.getMonth(), 1));
      const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      setSelectedDate(key);
    } else {
      setViewDate(new Date(2026, 6, 1));
    }
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-[#0A84FF]" />
          <p className="text-sm text-zinc-500">Loading training log…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <header className="sticky top-0 z-30 border-b border-white/8 bg-[#1c1c1e]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0A84FF] text-white shadow-sm shadow-blue-500/20">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-semibold tracking-tight text-zinc-100 sm:text-lg">
                MMA Training Tracker
              </h1>
              <div className="flex items-center gap-2">
                <p className="text-[11px] text-zinc-500">
                  2026 · Metric only (kg · km · min/km)
                </p>
                <span className="text-zinc-700">·</span>
                {syncStatus === "syncing" ? (
                  <span className="flex items-center gap-1 text-[10px] text-sky-400">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Syncing…
                  </span>
                ) : syncStatus === "synced" ? (
                  <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                    <Cloud className="h-3 w-3" />
                    Cloud Synced
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] text-zinc-500">
                    Local mode
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => setMainView("calendar")}
              className={[
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition",
                mainView === "calendar"
                  ? "bg-zinc-100 text-zinc-900"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200",
              ].join(" ")}
            >
              <CalendarDays className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Calendar</span>
            </button>
            <button
              type="button"
              onClick={() => setMainView("analytics")}
              className={[
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition",
                mainView === "analytics"
                  ? "bg-zinc-100 text-zinc-900"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200",
              ].join(" ")}
            >
              <ChartLine className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Analytics</span>
            </button>

            {/* Auth / Sync Button */}
            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className={[
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition",
                user
                  ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                  : "border border-[#0A84FF]/30 bg-[#0A84FF]/10 text-[#0A84FF] hover:bg-[#0A84FF]/20",
              ].join(" ")}
            >
              <UserIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">
                {user ? user.email?.split("@")[0] : "Sync / Log in"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (
                  confirm(
                    "Clear all sessions and reset to default? This cannot be undone."
                  )
                ) {
                  reset();
                }
              }}
              title="Clear all data"
              className="ml-1 rounded-full p-2 text-zinc-600 transition hover:bg-zinc-800 hover:text-zinc-400"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-5 px-4 py-6 sm:px-6">
        <StatsBar sessions={sessions} year={year} month={month} />

        {mainView === "calendar" ? (
          <CalendarMonth
            year={year}
            month={month}
            sessions={sessions}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onPrevMonth={onPrevMonth}
            onNextMonth={onNextMonth}
            onToday={onToday}
          />
        ) : (
          <Analytics sessions={sessions} />
        )}

        {mainView === "calendar" && (
          <RecentJournals sessions={sessions} />
        )}
      </main>

      {selectedDate && (
        <DayDrawer
          dateKey={selectedDate}
          sessions={sessions}
          customExercises={customExercises}
          customCardioTypes={customCardioTypes}
          onClose={() => setSelectedDate(null)}
          onAdd={addSession}
          onDelete={deleteSession}
        />
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
}

function RecentJournals({ sessions }: { sessions: TrainingSession[] }) {
  const combat = sessions
    .filter((s) => s.type === "grappling" || s.type === "striking")
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);

  if (!combat.length) return null;

  return (
    <div className="rounded-2xl bg-[#1c1c1e] p-5 shadow-sm ring-1 ring-white/8">
      <h3 className="mb-3 text-sm font-semibold text-zinc-200">
        Recent Combat Journals
      </h3>
      <div className="space-y-3">
        {combat.map((s) => {
          const colors = SESSION_COLORS[s.type];
          return (
            <div
              key={s.id}
              className="rounded-xl border border-white/6 bg-[#2c2c2e]/50 p-3"
              style={{ borderLeftWidth: 3, borderLeftColor: colors.hex }}
            >
              <div className="mb-1 flex items-center justify-between">
                <span
                  className="text-xs font-semibold"
                  style={{ color: colors.hex }}
                >
                  {colors.label}
                </span>
                <span className="text-[11px] text-zinc-500">{s.date}</span>
              </div>
              <p className="line-clamp-2 text-sm text-zinc-400">
                {s.combat?.learned || "No notes"}
              </p>
              <p className="mt-1 text-[11px] text-zinc-500">
                Felt {s.combat?.feltRating}/10
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
