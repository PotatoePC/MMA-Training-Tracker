"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";
import type {
  CardioSessionData,
  CombatSessionData,
  SessionType,
  StrengthSessionData,
  TrainingSession,
} from "@/lib/types";
import { SESSION_COLORS } from "@/lib/types";
import { formatDayLabel } from "@/lib/calendar";
import { generateId } from "@/lib/formulas";
import { StrengthForm } from "./StrengthForm";
import { CardioForm } from "./CardioForm";
import { CombatForm } from "./CombatForm";
import { SessionDetail } from "./SessionDetail";

interface DayDrawerProps {
  dateKey: string;
  sessions: TrainingSession[];
  customExercises: string[];
  customCardioTypes: string[];
  onClose: () => void;
  onAdd: (session: TrainingSession) => void;
  onDelete: (id: string) => void;
}

type View = "list" | "pick" | SessionType;

export function DayDrawer({
  dateKey,
  sessions,
  customExercises,
  customCardioTypes,
  onClose,
  onAdd,
  onDelete,
}: DayDrawerProps) {
  const [view, setView] = useState<View>("list");
  const [y, m, d] = dateKey.split("-").map(Number);
  const dateObj = new Date(y, m - 1, d);
  const daySessions = sessions.filter((s) => s.date === dateKey);

  const saveStrength = (data: StrengthSessionData) => {
    onAdd({
      id: generateId(),
      date: dateKey,
      type: "strength",
      createdAt: new Date().toISOString(),
      strength: data,
    });
    setView("list");
  };

  const saveCardio = (data: CardioSessionData) => {
    onAdd({
      id: generateId(),
      date: dateKey,
      type: "cardio",
      createdAt: new Date().toISOString(),
      cardio: data,
    });
    setView("list");
  };

  const saveCombat = (type: "grappling" | "striking") => (data: CombatSessionData) => {
    onAdd({
      id: generateId(),
      date: dateKey,
      type,
      createdAt: new Date().toISOString(),
      combat: data,
    });
    setView("list");
  };

  const presets: { type: SessionType; desc: string }[] = [
    { type: "strength", desc: "Weights · sets · RPE" },
    { type: "cardio", desc: "Run · bike · duration" },
    { type: "grappling", desc: "BJJ · wrestling journal" },
    { type: "striking", desc: "Boxing · Muay Thai journal" },
  ];

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden
      />

      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-[#1c1c1e] shadow-2xl ring-1 ring-white/10">
        <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
              {view === "list"
                ? "Day detail"
                : view === "pick"
                  ? "Add session"
                  : SESSION_COLORS[view].label}
            </p>
            <h2 className="text-lg font-semibold tracking-tight text-zinc-100">
              {formatDayLabel(dateObj)}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-200"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {view === "list" && (
            <div className="space-y-4">
              {daySessions.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 py-12 text-center">
                  <p className="text-sm text-zinc-500">
                    No sessions logged this day
                  </p>
                  <p className="mt-1 text-xs text-zinc-600">
                    Tap below to add your first entry
                  </p>
                </div>
              ) : (
                daySessions.map((s) => (
                  <SessionDetail
                    key={s.id}
                    session={s}
                    onDelete={(id) => {
                      onDelete(id);
                    }}
                  />
                ))
              )}
            </div>
          )}

          {view === "pick" && (
            <div className="grid grid-cols-1 gap-3">
              <p className="mb-1 text-sm text-zinc-500">
                Choose a session type
              </p>
              {presets.map(({ type, desc }) => {
                const c = SESSION_COLORS[type];
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setView(type)}
                    className="flex items-center gap-4 rounded-2xl border border-white/8 bg-[#2c2c2e] p-4 text-left shadow-sm transition hover:bg-[#3a3a3c] hover:shadow-md"
                    style={{ borderLeftWidth: 4, borderLeftColor: c.hex }}
                  >
                    <span
                      className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                      style={{ backgroundColor: c.hex }}
                    >
                      {c.label[0]}
                    </span>
                    <div>
                      <p className="font-semibold text-zinc-100">{c.label}</p>
                      <p className="text-xs text-zinc-500">{desc}</p>
                    </div>
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setView("list")}
                className="mt-2 text-sm text-zinc-500 hover:text-zinc-300"
              >
                ← Back to day
              </button>
            </div>
          )}

          {view === "strength" && (
            <StrengthForm
              customExercises={customExercises}
              sessions={sessions}
              dateKey={dateKey}
              onSubmit={saveStrength}
              onCancel={() => setView("pick")}
            />
          )}
          {view === "cardio" && (
            <CardioForm
              customCardioTypes={customCardioTypes}
              onSubmit={saveCardio}
              onCancel={() => setView("pick")}
            />
          )}
          {view === "grappling" && (
            <CombatForm
              type="grappling"
              onSubmit={saveCombat("grappling")}
              onCancel={() => setView("pick")}
            />
          )}
          {view === "striking" && (
            <CombatForm
              type="striking"
              onSubmit={saveCombat("striking")}
              onCancel={() => setView("pick")}
            />
          )}
        </div>

        {view === "list" && (
          <div className="border-t border-white/8 p-4">
            <button
              type="button"
              onClick={() => setView("pick")}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0A84FF] py-3 text-sm font-semibold text-white shadow-sm shadow-blue-500/20 transition hover:bg-blue-500"
            >
              <Plus className="h-4 w-4" />
              Add Session
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
