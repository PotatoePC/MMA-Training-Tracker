"use client";

import {
  Dumbbell,
  Heart,
  Shield,
  Swords,
  Trash2,
  Weight,
} from "lucide-react";
import type { TrainingSession } from "@/lib/types";
import { SESSION_COLORS } from "@/lib/types";
import {
  bestEpley1RM,
  formatDuration,
  formatPace,
  paceMinPerKm,
  totalVolume,
} from "@/lib/formulas";

interface SessionDetailProps {
  session: TrainingSession;
  onDelete: (id: string) => void;
}

export function SessionDetail({ session, onDelete }: SessionDetailProps) {
  const colors = SESSION_COLORS[session.type];

  const Icon =
    session.type === "strength"
      ? Dumbbell
      : session.type === "cardio"
        ? Heart
        : session.type === "grappling"
          ? Shield
          : Swords;

  return (
    <div
      className="rounded-2xl border p-4"
      style={{
        borderColor: `${colors.hex}40`,
        backgroundColor: `${colors.hex}12`,
      }}
    >
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-full"
            style={{ backgroundColor: `${colors.hex}28` }}
          >
            <Icon className="h-4 w-4" style={{ color: colors.hex }} />
          </span>
          <div>
            <p className="text-sm font-semibold" style={{ color: colors.hex }}>
              {colors.label}
            </p>
            <p className="text-[11px] text-zinc-500">
              {new Date(session.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onDelete(session.id)}
          className="rounded-lg p-1.5 text-zinc-600 transition hover:bg-red-500/10 hover:text-red-400"
          title="Delete session"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {session.type === "strength" && session.strength && (
        <div className="space-y-3">
          {session.strength.exercises.map((ex) => {
            const vol = totalVolume(ex.sets);
            const oneRm = bestEpley1RM(ex.sets);
            return (
              <div
                key={ex.id}
                className="rounded-xl bg-black/30 p-3 ring-1 ring-white/6"
              >
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold text-zinc-200">
                    {ex.name}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                    <span className="flex items-center gap-0.5">
                      <Weight className="h-3 w-3" />
                      {vol.toLocaleString()} kg vol
                    </span>
                    <span>1RM ≈ {oneRm.toFixed(1)} kg</span>
                  </div>
                </div>
                <div className="space-y-1">
                  {ex.sets.map((s, i) => (
                    <div
                      key={s.id}
                      className="flex items-center gap-3 text-xs text-zinc-400"
                    >
                      <span className="w-5 text-zinc-600">#{i + 1}</span>
                      <span className="font-medium tabular-nums text-zinc-300">
                        {s.weightKg} kg
                      </span>
                      <span className="text-zinc-600">×</span>
                      <span className="tabular-nums">{s.reps} reps</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          <p className="text-xs text-zinc-500">
            Session RPE:{" "}
            <strong className="text-zinc-300">{session.strength.rpe}/10</strong>
          </p>
        </div>
      )}

      {session.type === "cardio" && session.cardio && (
        <div className="space-y-2 rounded-xl bg-black/30 p-3 ring-1 ring-white/6">
          <p className="text-sm font-semibold text-zinc-200">
            {session.cardio.cardioType}
          </p>
          <div className="flex flex-wrap gap-3 text-xs text-zinc-400">
            <span>
              Duration:{" "}
              <strong className="text-zinc-300">
                {formatDuration(session.cardio.durationMinutes)}
              </strong>
            </span>
            {session.cardio.runMode && session.cardio.distanceKm != null && (
              <>
                <span>
                  Distance:{" "}
                  <strong className="text-zinc-300">
                    {session.cardio.distanceKm} km
                  </strong>
                </span>
                <span>
                  Pace:{" "}
                  <strong className="text-zinc-300">
                    {formatPace(
                      paceMinPerKm(
                        session.cardio.durationMinutes,
                        session.cardio.distanceKm
                      )
                    )}{" "}
                    min/km
                  </strong>
                </span>
              </>
            )}
          </div>
          {session.cardio.notes && (
            <p className="text-xs italic text-zinc-500">
              {session.cardio.notes}
            </p>
          )}
        </div>
      )}

      {(session.type === "grappling" || session.type === "striking") &&
        session.combat && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">Felt</span>
              <div className="flex gap-0.5">
                {Array.from({ length: 10 }, (_, i) => (
                  <span
                    key={i}
                    className="h-2 w-2 rounded-full"
                    style={{
                      backgroundColor:
                        i < session.combat!.feltRating
                          ? colors.hex
                          : "#3A3A3C",
                    }}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-zinc-300">
                {session.combat.feltRating}/10
              </span>
            </div>
            {session.combat.learned && (
              <div className="rounded-xl bg-black/30 p-3 ring-1 ring-white/6">
                <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                  What I learned
                </p>
                <p className="text-sm leading-relaxed text-zinc-300 whitespace-pre-wrap">
                  {session.combat.learned}
                </p>
              </div>
            )}
            {session.combat.improvements && (
              <div className="rounded-xl bg-black/30 p-3 ring-1 ring-white/6">
                <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                  Focus points
                </p>
                <p className="text-sm leading-relaxed text-zinc-300 whitespace-pre-wrap">
                  {session.combat.improvements}
                </p>
              </div>
            )}
          </div>
        )}
    </div>
  );
}
