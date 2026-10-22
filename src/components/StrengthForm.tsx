"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2, Dumbbell, History, Copy } from "lucide-react";
import type {
  StrengthExercise,
  StrengthSessionData,
  TrainingSession,
} from "@/lib/types";
import { generateId } from "@/lib/formulas";
import {
  getLastExercisePerformance,
  type PreviousSetData,
} from "@/lib/history";

interface StrengthFormProps {
  customExercises: string[];
  sessions?: TrainingSession[];
  dateKey?: string;
  initial?: StrengthSessionData;
  onSubmit: (data: StrengthSessionData) => void;
  onCancel: () => void;
}

function emptySet() {
  return { id: generateId(), weightKg: 0, reps: 0 };
}

function emptyExercise(name = ""): StrengthExercise {
  return {
    id: generateId(),
    name,
    rpe: 7,
    sets: [emptySet()],
  };
}

export function StrengthForm({
  customExercises,
  sessions = [],
  dateKey,
  initial,
  onSubmit,
  onCancel,
}: StrengthFormProps) {
  const [exercises, setExercises] = useState<StrengthExercise[]>(() => {
    if (initial?.exercises?.length) {
      return initial.exercises.map((ex) => ({
        ...ex,
        rpe: ex.rpe ?? initial.rpe ?? 7,
      }));
    }
    return [emptyExercise()];
  });
  const [newExerciseName, setNewExerciseName] = useState("");

  // Map each unique exercise name to its previous session history
  const exerciseHistories = useMemo(() => {
    const map: Record<string, ReturnType<typeof getLastExercisePerformance>> = {};
    for (const ex of exercises) {
      const key = ex.name.trim().toLowerCase();
      if (key && !(key in map)) {
        map[key] = getLastExercisePerformance(ex.name, sessions, dateKey);
      }
    }
    return map;
  }, [exercises, sessions, dateKey]);

  const updateExercise = (id: string, patch: Partial<StrengthExercise>) => {
    setExercises((prev) =>
      prev.map((ex) => (ex.id === id ? { ...ex, ...patch } : ex))
    );
  };

  const updateSet = (
    exId: string,
    setId: string,
    field: "weightKg" | "reps",
    value: number
  ) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exId) return ex;
        return {
          ...ex,
          sets: ex.sets.map((s) =>
            s.id === setId ? { ...s, [field]: value } : s
          ),
        };
      })
    );
  };

  const updateSetValues = (
    exId: string,
    setId: string,
    values: { weightKg?: number; reps?: number }
  ) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exId) return ex;
        return {
          ...ex,
          sets: ex.sets.map((s) =>
            s.id === setId ? { ...s, ...values } : s
          ),
        };
      })
    );
  };

  const addSet = (exId: string) => {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id === exId ? { ...ex, sets: [...ex.sets, emptySet()] } : ex
      )
    );
  };

  const removeSet = (exId: string, setId: string) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exId) return ex;
        const next = ex.sets.filter((s) => s.id !== setId);
        return { ...ex, sets: next.length ? next : [emptySet()] };
      })
    );
  };

  const removeExercise = (id: string) => {
    setExercises((prev) => {
      const next = prev.filter((e) => e.id !== id);
      return next.length ? next : [emptyExercise()];
    });
  };

  const copyAllLastSets = (
    exId: string,
    prevSets: PreviousSetData[],
    prevRpe?: number
  ) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exId) return ex;
        return {
          ...ex,
          rpe: prevRpe ?? ex.rpe,
          sets: prevSets.map((ps) => ({
            id: generateId(),
            weightKg: ps.weightKg,
            reps: ps.reps,
          })),
        };
      })
    );
  };

  const addNamedExercise = (nameToAdd?: string) => {
    const name = (nameToAdd ?? newExerciseName).trim();
    if (!name) return;

    setExercises((prev) => {
      // If the current list only has 1 blank untouched exercise, replace it
      if (
        prev.length === 1 &&
        !prev[0].name.trim() &&
        prev[0].sets.every((s) => !s.weightKg && !s.reps)
      ) {
        return [emptyExercise(name)];
      }
      return [...prev, emptyExercise(name)];
    });

    if (!nameToAdd) {
      setNewExerciseName("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = exercises
      .map((ex) => ({
        ...ex,
        name: ex.name.trim(),
        rpe: ex.rpe ?? 7,
        sets: ex.sets.filter((s) => s.weightKg > 0 || s.reps > 0),
      }))
      .filter((ex) => ex.name && ex.sets.length > 0);

    if (!cleaned.length) return;
    onSubmit({ exercises: cleaned });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center gap-2 text-sky-400">
        <Dumbbell className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Strength Session</h3>
      </div>

      {customExercises.length > 0 && (
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-500">
            Quick-add exercise
          </label>
          <div className="flex flex-wrap gap-1.5">
            {customExercises.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => addNamedExercise(name)}
                className="rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-xs font-medium text-sky-300 transition hover:bg-sky-500/20 active:scale-95"
              >
                + {name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={newExerciseName}
          onChange={(e) => setNewExerciseName(e.target.value)}
          placeholder="New exercise name…"
          className="flex-1 rounded-xl border border-white/10 bg-[#2c2c2e] px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20"
        />
        <button
          type="button"
          onClick={() => addNamedExercise()}
          className="rounded-xl bg-sky-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-sky-400 active:scale-95"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-4">
        {exercises.map((ex, exIdx) => {
          const history = exerciseHistories[ex.name.trim().toLowerCase()] ?? null;

          return (
            <div
              key={ex.id}
              className="rounded-2xl border border-white/8 bg-[#2c2c2e]/80 p-4"
            >
              {/* Exercise name row */}
              <div className="mb-3 flex items-center gap-2">
                <input
                  type="text"
                  value={ex.name}
                  onChange={(e) =>
                    updateExercise(ex.id, { name: e.target.value })
                  }
                  placeholder={`Exercise ${exIdx + 1}`}
                  className="flex-1 rounded-lg border border-white/10 bg-[#1c1c1e] px-3 py-1.5 text-sm font-medium text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-sky-500/50"
                  required
                />
                <button
                  type="button"
                  onClick={() => removeExercise(ex.id)}
                  className="rounded-lg p-1.5 text-zinc-500 hover:bg-red-500/10 hover:text-red-400"
                  title="Remove exercise"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Previous session banner */}
              {history ? (
                <div className="mb-3 flex items-center justify-between rounded-xl border border-sky-500/20 bg-sky-500/10 px-3 py-2 text-xs">
                  <div className="flex items-center gap-2 text-zinc-300">
                    <History className="h-3.5 w-3.5 shrink-0 text-sky-400" />
                    <span>
                      Last: <strong className="font-semibold text-white">{history.formattedDate}</strong>
                      {history.rpe ? (
                        <span className="ml-1.5 text-zinc-400">
                          · RPE {history.rpe}/10
                        </span>
                      ) : null}
                      <span className="ml-1.5 hidden text-zinc-500 sm:inline">
                        ({history.sets.length} {history.sets.length === 1 ? "set" : "sets"})
                      </span>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      copyAllLastSets(ex.id, history.sets, history.rpe)
                    }
                    className="flex items-center gap-1 font-semibold text-sky-400 transition hover:text-sky-300 active:scale-95"
                    title="Copy all sets, weights, and reps from last session"
                  >
                    <Copy className="h-3 w-3" />
                    <span>Copy all</span>
                  </button>
                </div>
              ) : ex.name.trim() ? (
                <div className="mb-3 flex items-center gap-1.5 px-1 text-[11px] text-zinc-500">
                  <span>First time logging this exercise</span>
                </div>
              ) : null}

              {/* Sets Table Header */}
              <div className="mb-2 grid grid-cols-[20px_1fr_1fr_1fr_28px] items-center gap-2 text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                <span className="text-center">Set</span>
                <span className="text-center">Previous</span>
                <span>Weight (kg)</span>
                <span>Reps</span>
                <span />
              </div>

              {/* Sets List */}
              {ex.sets.map((set, setIdx) => {
                const prevSet = history?.sets[setIdx];

                return (
                  <div
                    key={set.id}
                    className="mb-2 grid grid-cols-[20px_1fr_1fr_1fr_28px] items-center gap-2"
                  >
                    {/* Set Number */}
                    <span className="text-center text-xs font-semibold text-zinc-500">
                      {setIdx + 1}
                    </span>

                    {/* Previous Set (Click to autofill this set) */}
                    {prevSet ? (
                      <button
                        type="button"
                        onClick={() =>
                          updateSetValues(ex.id, set.id, {
                            weightKg: prevSet.weightKg,
                            reps: prevSet.reps,
                          })
                        }
                        title="Click to copy into inputs"
                        className="group flex h-[34px] w-full items-center justify-center gap-0.5 rounded-lg border border-white/10 bg-white/5 px-1 text-[11px] font-medium text-zinc-300 transition hover:border-sky-500/50 hover:bg-sky-500/15 hover:text-sky-300 sm:text-xs"
                      >
                        <span className="font-semibold text-zinc-200 group-hover:text-sky-200">
                          {prevSet.weightKg > 0 ? `${prevSet.weightKg}k` : "BW"}
                        </span>
                        <span className="text-zinc-500 group-hover:text-sky-400">
                          ×
                        </span>
                        <span className="font-semibold text-zinc-200 group-hover:text-sky-200">
                          {prevSet.reps}
                        </span>
                      </button>
                    ) : (
                      <div className="flex h-[34px] items-center justify-center text-xs text-zinc-600">
                        —
                      </div>
                    )}

                    {/* Weight Input */}
                    <input
                      type="number"
                      min={0}
                      step={0.5}
                      value={set.weightKg || ""}
                      onChange={(e) =>
                        updateSet(
                          ex.id,
                          set.id,
                          "weightKg",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="h-[34px] w-full rounded-lg border border-white/10 bg-[#1c1c1e] px-2 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-sky-500/50"
                      placeholder={prevSet ? String(prevSet.weightKg) : "0"}
                    />

                    {/* Reps Input */}
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={set.reps || ""}
                      onChange={(e) =>
                        updateSet(
                          ex.id,
                          set.id,
                          "reps",
                          parseInt(e.target.value, 10) || 0
                        )
                      }
                      className="h-[34px] w-full rounded-lg border border-white/10 bg-[#1c1c1e] px-2 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-sky-500/50"
                      placeholder={prevSet ? String(prevSet.reps) : "0"}
                    />

                    {/* Delete Set Button */}
                    <button
                      type="button"
                      onClick={() => removeSet(ex.id, set.id)}
                      className="flex h-[34px] w-[28px] items-center justify-center rounded-lg text-zinc-600 transition hover:bg-red-500/10 hover:text-red-400"
                      title="Delete set"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={() => addSet(ex.id)}
                className="mt-1 flex items-center gap-1 text-xs font-medium text-sky-400 hover:text-sky-300"
              >
                <Plus className="h-3.5 w-3.5" /> Add set
              </button>

              {/* Exercise RPE slider */}
              <div className="mt-3 border-t border-white/6 pt-3">
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-xs font-medium text-zinc-400">
                    Exercise RPE
                  </label>
                  <span className="rounded-md bg-sky-500/15 px-2 py-0.5 text-xs font-semibold text-sky-300">
                    {ex.rpe ?? 7}/10
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={0.5}
                  value={ex.rpe ?? 7}
                  onChange={(e) =>
                    updateExercise(ex.id, { rpe: parseFloat(e.target.value) })
                  }
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-zinc-700 accent-sky-500"
                />
                <div className="mt-1 flex justify-between text-[10px] text-zinc-600">
                  <span>Light (1)</span>
                  <span>Moderate (5–7)</span>
                  <span>Max effort (10)</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => setExercises((prev) => [...prev, emptyExercise()])}
        className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-sky-500/30 bg-sky-500/5 py-2.5 text-sm font-medium text-sky-400 hover:bg-sky-500/10"
      >
        <Plus className="h-4 w-4" /> Add exercise
      </button>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm font-medium text-zinc-400 hover:bg-zinc-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 rounded-xl bg-sky-500 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-400"
        >
          Save Session
        </button>
      </div>
    </form>
  );
}
