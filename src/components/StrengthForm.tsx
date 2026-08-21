"use client";

import { useState } from "react";
import { Plus, Trash2, Dumbbell } from "lucide-react";
import type { StrengthExercise, StrengthSessionData } from "@/lib/types";
import { generateId } from "@/lib/formulas";

interface StrengthFormProps {
  customExercises: string[];
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

  const addNamedExercise = () => {
    const name = newExerciseName.trim();
    if (!name) return;
    setExercises((prev) => [...prev, emptyExercise(name)]);
    setNewExerciseName("");
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
                onClick={() =>
                  setExercises((prev) => [...prev, emptyExercise(name)])
                }
                className="rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-xs font-medium text-sky-300 transition hover:bg-sky-500/20"
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
          onClick={addNamedExercise}
          className="rounded-xl bg-sky-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-sky-400"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-4">
        {exercises.map((ex, exIdx) => (
          <div
            key={ex.id}
            className="rounded-2xl border border-white/8 bg-[#2c2c2e]/80 p-4"
          >
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
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-2 grid grid-cols-[1fr_1fr_auto] gap-2 text-[10px] font-medium uppercase tracking-wide text-zinc-500">
              <span>Weight (kg)</span>
              <span>Reps</span>
              <span className="w-8" />
            </div>

            {ex.sets.map((set, setIdx) => (
              <div
                key={set.id}
                className="mb-2 grid grid-cols-[1fr_1fr_auto] items-center gap-2"
              >
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-zinc-600">
                    {setIdx + 1}
                  </span>
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
                    className="w-full rounded-lg border border-white/10 bg-[#1c1c1e] py-1.5 pl-6 pr-2 text-sm text-zinc-100 outline-none focus:border-sky-500/50"
                    placeholder="0"
                  />
                </div>
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
                  className="w-full rounded-lg border border-white/10 bg-[#1c1c1e] px-2 py-1.5 text-sm text-zinc-100 outline-none focus:border-sky-500/50"
                  placeholder="0"
                />
                <button
                  type="button"
                  onClick={() => removeSet(ex.id, set.id)}
                  className="rounded-lg p-1.5 text-zinc-600 hover:text-red-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => addSet(ex.id)}
              className="mt-1 flex items-center gap-1 text-xs font-medium text-sky-400 hover:text-sky-300"
            >
              <Plus className="h-3.5 w-3.5" /> Add set
            </button>

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
        ))}
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
