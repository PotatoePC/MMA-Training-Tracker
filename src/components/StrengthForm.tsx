"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2, Dumbbell, History, Copy, Timer, Repeat } from "lucide-react";
import type {
  StrengthExercise,
  StrengthSessionData,
  TrainingSession,
  ExerciseMode,
} from "@/lib/types";
import { generateId, formatDurationSeconds } from "@/lib/formulas";
import {
  getLastExercisePerformance,
  formatPrevSet,
  type PreviousSetData,
} from "@/lib/history";

interface StrengthFormProps {
  customExercises: string[];
  isometricExercises?: string[];
  sessions?: TrainingSession[];
  dateKey?: string;
  initial?: StrengthSessionData;
  onSubmit: (data: StrengthSessionData) => void;
  onCancel: () => void;
}

function emptySet() {
  return { id: generateId(), weightKg: 0, reps: 0, timeSeconds: 0 };
}

function emptyExercise(name = "", mode: ExerciseMode = "reps"): StrengthExercise {
  return {
    id: generateId(),
    name,
    mode,
    rpe: 7,
    sets: [emptySet()],
  };
}

export function StrengthForm({
  customExercises,
  isometricExercises = [],
  sessions = [],
  dateKey,
  initial,
  onSubmit,
  onCancel,
}: StrengthFormProps) {
  // Map each unique exercise name to its previous session history
  const exerciseHistories = useMemo(() => {
    const map: Record<string, ReturnType<typeof getLastExercisePerformance>> = {};
    if (initial?.exercises) {
      for (const ex of initial.exercises) {
        const key = ex.name.trim().toLowerCase();
        if (key && !(key in map)) {
          map[key] = getLastExercisePerformance(ex.name, sessions, dateKey);
        }
      }
    }
    for (const name of customExercises) {
      const key = name.trim().toLowerCase();
      if (key && !(key in map)) {
        map[key] = getLastExercisePerformance(name, sessions, dateKey);
      }
    }
    return map;
  }, [initial, customExercises, sessions, dateKey]);

  // Helper to determine if an exercise is saved as isometric
  const isIsometricExercise = (name: string): boolean => {
    const clean = name.trim().toLowerCase();
    if (!clean) return false;

    // 1. Check passed isometricExercises list
    if (isometricExercises.some((n) => n.trim().toLowerCase() === clean)) {
      return true;
    }

    // 2. Check previous session history
    const history = exerciseHistories[clean];
    if (history?.mode === "isometric") return true;
    if (history?.mode === "reps") return false;

    // 3. Check any past session in sessions
    for (const s of sessions) {
      if (s.type === "strength" && s.strength?.exercises) {
        const match = s.strength.exercises.find(
          (e) => e.name.trim().toLowerCase() === clean
        );
        if (match?.mode === "isometric") return true;
        if (match?.mode === "reps") return false;
      }
    }

    return false;
  };

  const [exercises, setExercises] = useState<StrengthExercise[]>(() => {
    if (initial?.exercises?.length) {
      return initial.exercises.map((ex) => ({
        ...ex,
        mode: ex.mode ?? (isIsometricExercise(ex.name) ? "isometric" : "reps"),
        rpe: ex.rpe ?? initial.rpe ?? 7,
      }));
    }
    return [emptyExercise()];
  });
  const [newExerciseName, setNewExerciseName] = useState("");
  const [newExerciseMode, setNewExerciseMode] = useState<ExerciseMode>("reps");

  const updateExercise = (id: string, patch: Partial<StrengthExercise>) => {
    setExercises((prev) =>
      prev.map((ex) => (ex.id === id ? { ...ex, ...patch } : ex))
    );
  };

  const toggleMode = (exId: string, mode: ExerciseMode) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exId) return ex;
        return {
          ...ex,
          mode,
        };
      })
    );
  };

  const updateSet = (
    exId: string,
    setId: string,
    field: "weightKg" | "reps" | "timeSeconds",
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
    values: { weightKg?: number; reps?: number; timeSeconds?: number }
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
            reps: ps.reps ?? 0,
            timeSeconds: ps.timeSeconds ?? 0,
          })),
        };
      })
    );
  };

  const handleNameChange = (exId: string, currentMode: ExerciseMode | undefined, newName: string) => {
    const isIso = isIsometricExercise(newName);
    updateExercise(exId, {
      name: newName,
      // If the exercise name matches a known isometric exercise, auto-set mode to isometric
      ...(isIso ? { mode: "isometric" } : {}),
    });
  };

  const addNamedExercise = (nameToAdd?: string, preferredMode?: ExerciseMode) => {
    const name = (nameToAdd ?? newExerciseName).trim();
    if (!name) return;

    const mode = preferredMode ?? (isIsometricExercise(name) ? "isometric" : newExerciseMode);

    setExercises((prev) => {
      // If the current list only has 1 blank untouched exercise, replace it
      if (
        prev.length === 1 &&
        !prev[0].name.trim() &&
        prev[0].sets.every((s) => !s.weightKg && !s.reps && !s.timeSeconds)
      ) {
        return [emptyExercise(name, mode)];
      }
      return [...prev, emptyExercise(name, mode)];
    });

    if (!nameToAdd) {
      setNewExerciseName("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = exercises
      .map((ex) => {
        const isIso = ex.mode === "isometric";
        return {
          ...ex,
          name: ex.name.trim(),
          mode: isIso ? ("isometric" as const) : ("reps" as const),
          rpe: ex.rpe ?? 7,
          sets: ex.sets.filter((s) =>
            isIso
              ? s.weightKg > 0 || (s.timeSeconds ?? 0) > 0
              : s.weightKg > 0 || (s.reps ?? 0) > 0
          ),
        };
      })
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

      {/* Quick-add exercises */}
      {customExercises.length > 0 && (
        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs font-medium uppercase tracking-wide text-zinc-500">
            <span>Quick-add exercise</span>
            <span className="flex items-center gap-3 text-[10px] normal-case font-normal text-zinc-500">
              <span className="inline-flex items-center gap-1 text-sky-400">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-400" /> Reps
              </span>
              <span className="inline-flex items-center gap-1 text-amber-400">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Isometric
              </span>
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {customExercises.map((name) => {
              const isIso = isIsometricExercise(name);
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => addNamedExercise(name, isIso ? "isometric" : "reps")}
                  className={[
                    "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition active:scale-95",
                    isIso
                      ? "border-amber-500/40 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25"
                      : "border-sky-500/30 bg-sky-500/10 text-sky-300 hover:bg-sky-500/20",
                  ].join(" ")}
                  title={isIso ? "Isometric exercise (Auto-adds as time & weight)" : "Reps exercise"}
                >
                  {isIso ? (
                    <Timer className="h-3 w-3 text-amber-400 shrink-0" />
                  ) : (
                    <span className="text-sky-400/80">+</span>
                  )}
                  <span>{name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Add custom exercise row */}
      <div className="space-y-2">
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
            title="Add exercise"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <span className="text-[11px] text-zinc-500">Default mode for new:</span>
          <button
            type="button"
            onClick={() => setNewExerciseMode("reps")}
            className={[
              "rounded-lg px-2 py-0.5 text-xs font-medium transition",
              newExerciseMode === "reps"
                ? "bg-sky-500/20 text-sky-300 border border-sky-500/30 font-semibold"
                : "text-zinc-500 hover:text-zinc-300",
            ].join(" ")}
          >
            Weight & Reps
          </button>
          <button
            type="button"
            onClick={() => setNewExerciseMode("isometric")}
            className={[
              "rounded-lg px-2 py-0.5 text-xs font-medium transition flex items-center gap-1",
              newExerciseMode === "isometric"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold"
                : "text-zinc-500 hover:text-zinc-300",
            ].join(" ")}
          >
            <Timer className="h-3 w-3" /> Isometric
          </button>
        </div>
      </div>

      {/* Exercises list */}
      <div className="space-y-4">
        {exercises.map((ex, exIdx) => {
          const isIso = ex.mode === "isometric";
          const history = exerciseHistories[ex.name.trim().toLowerCase()] ?? null;

          return (
            <div
              key={ex.id}
              className={[
                "rounded-2xl border p-4 transition-all",
                isIso
                  ? "border-amber-500/30 bg-[#2c2c2e]/90 ring-1 ring-amber-500/10 shadow-sm shadow-amber-950/20"
                  : "border-white/8 bg-[#2c2c2e]/80",
              ].join(" ")}
            >
              {/* Exercise Name Input */}
              <div className="mb-2.5 flex items-center gap-2">
                <input
                  type="text"
                  value={ex.name}
                  onChange={(e) => handleNameChange(ex.id, ex.mode, e.target.value)}
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

              {/* Mode Toggle: Weight & Reps vs Isometric */}
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="inline-flex rounded-xl border border-white/8 bg-[#1c1c1e] p-1 text-xs">
                  <button
                    type="button"
                    onClick={() => toggleMode(ex.id, "reps")}
                    className={[
                      "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition",
                      !isIso
                        ? "bg-sky-500 text-white font-semibold shadow-sm"
                        : "text-zinc-400 hover:text-zinc-200",
                    ].join(" ")}
                  >
                    <Repeat className="h-3 w-3" />
                    <span>Weight & Reps</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleMode(ex.id, "isometric")}
                    className={[
                      "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition",
                      isIso
                        ? "bg-amber-500 text-black font-semibold shadow-sm"
                        : "text-zinc-400 hover:text-zinc-200",
                    ].join(" ")}
                  >
                    <Timer className="h-3 w-3" />
                    <span>Isometric (Time & Weight)</span>
                  </button>
                </div>

                {isIso && (
                  <span className="hidden sm:inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-300 ring-1 ring-amber-500/30">
                    <Timer className="h-2.5 w-2.5" /> Isometric Hold
                  </span>
                )}
              </div>

              {/* Previous session banner */}
              {history ? (
                <div
                  className={[
                    "mb-3 flex items-center justify-between rounded-xl border px-3 py-2 text-xs",
                    isIso
                      ? "border-amber-500/25 bg-amber-500/10 text-amber-200"
                      : "border-sky-500/20 bg-sky-500/10 text-zinc-300",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-2">
                    <History
                      className={[
                        "h-3.5 w-3.5 shrink-0",
                        isIso ? "text-amber-400" : "text-sky-400",
                      ].join(" ")}
                    />
                    <span>
                      Last:{" "}
                      <strong className="font-semibold text-white">
                        {history.formattedDate}
                      </strong>
                      {isIso && history.totalTimeSeconds ? (
                        <span className="ml-1.5 font-medium text-amber-300">
                          · {formatDurationSeconds(history.totalTimeSeconds)} hold
                        </span>
                      ) : null}
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
                    className={[
                      "flex items-center gap-1 font-semibold transition active:scale-95",
                      isIso
                        ? "text-amber-400 hover:text-amber-300"
                        : "text-sky-400 hover:text-sky-300",
                    ].join(" ")}
                    title="Copy all sets, weights, and times/reps from last session"
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
                <span>{isIso ? "Time (sec)" : "Reps"}</span>
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
                            timeSeconds: prevSet.timeSeconds,
                          })
                        }
                        title="Click to copy into inputs"
                        className={[
                          "group flex h-[34px] w-full items-center justify-center gap-0.5 rounded-lg border px-1 text-[11px] font-medium transition sm:text-xs",
                          isIso
                            ? "border-amber-500/20 bg-amber-500/10 text-amber-200 hover:border-amber-500/50 hover:bg-amber-500/20 hover:text-amber-100"
                            : "border-white/10 bg-white/5 text-zinc-300 hover:border-sky-500/50 hover:bg-sky-500/15 hover:text-sky-300",
                        ].join(" ")}
                      >
                        <span className="truncate">
                          {formatPrevSet(prevSet, ex.mode ?? "reps")}
                        </span>
                      </button>
                    ) : (
                      <div className="flex h-[34px] items-center justify-center text-xs text-zinc-600">
                        —
                      </div>
                    )}

                    {/* Weight Input (kg) */}
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
                      title="Weight (kg) — enter 0 for bodyweight"
                    />

                    {/* Reps or Time Input */}
                    {isIso ? (
                      <div className="relative">
                        <input
                          type="number"
                          min={0}
                          step={1}
                          value={set.timeSeconds || ""}
                          onChange={(e) =>
                            updateSet(
                              ex.id,
                              set.id,
                              "timeSeconds",
                              parseInt(e.target.value, 10) || 0
                            )
                          }
                          className="h-[34px] w-full rounded-lg border border-amber-500/30 bg-[#1c1c1e] px-2 text-sm text-amber-200 placeholder:text-zinc-600 outline-none focus:border-amber-500/60"
                          placeholder={
                            prevSet?.timeSeconds ? String(prevSet.timeSeconds) : "sec"
                          }
                          title="Hold time in seconds"
                        />
                        {(set.timeSeconds ?? 0) >= 60 && (
                          <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] font-medium text-amber-400/80">
                            {formatDurationSeconds(set.timeSeconds!)}
                          </span>
                        )}
                      </div>
                    ) : (
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
                        title="Reps"
                      />
                    )}

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
                className={[
                  "mt-1 flex items-center gap-1 text-xs font-medium transition",
                  isIso
                    ? "text-amber-400 hover:text-amber-300"
                    : "text-sky-400 hover:text-sky-300",
                ].join(" ")}
              >
                <Plus className="h-3.5 w-3.5" /> Add set
              </button>

              {/* Exercise RPE slider */}
              <div className="mt-3 border-t border-white/6 pt-3">
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-xs font-medium text-zinc-400">
                    Exercise RPE
                  </label>
                  <span
                    className={[
                      "rounded-md px-2 py-0.5 text-xs font-semibold",
                      isIso
                        ? "bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/30"
                        : "bg-sky-500/15 text-sky-300 ring-1 ring-sky-500/30",
                    ].join(" ")}
                  >
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
                  className={[
                    "h-1.5 w-full cursor-pointer appearance-none rounded-full bg-zinc-700",
                    isIso ? "accent-amber-500" : "accent-sky-500",
                  ].join(" ")}
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
        onClick={() => setExercises((prev) => [...prev, emptyExercise("", newExerciseMode)])}
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
