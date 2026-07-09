"use client";

import { useMemo, useState } from "react";
import { Heart, Plus } from "lucide-react";
import type { CardioSessionData } from "@/lib/types";
import { formatPace, paceMinPerKm } from "@/lib/formulas";

interface CardioFormProps {
  customCardioTypes: string[];
  initial?: CardioSessionData;
  onSubmit: (data: CardioSessionData) => void;
  onCancel: () => void;
}

export function CardioForm({
  customCardioTypes,
  initial,
  onSubmit,
  onCancel,
}: CardioFormProps) {
  const [cardioType, setCardioType] = useState(initial?.cardioType ?? "");
  const [durationMinutes, setDurationMinutes] = useState(
    initial?.durationMinutes ?? 0
  );
  const [runMode, setRunMode] = useState(initial?.runMode ?? false);
  const [distanceKm, setDistanceKm] = useState(initial?.distanceKm ?? 0);
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [customType, setCustomType] = useState("");

  const calculatedPace = useMemo(() => {
    if (!runMode || !distanceKm || !durationMinutes) return 0;
    return paceMinPerKm(durationMinutes, distanceKm);
  }, [runMode, distanceKm, durationMinutes]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const type = cardioType.trim() || customType.trim();
    if (!type || durationMinutes <= 0) return;
    onSubmit({
      cardioType: type,
      durationMinutes,
      runMode,
      distanceKm: runMode ? distanceKm : undefined,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center gap-2 text-emerald-400">
        <Heart className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Cardio Session</h3>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-500">
          Cardio type
        </label>
        <div className="mb-2 flex flex-wrap gap-1.5">
          {customCardioTypes.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setCardioType(t)}
              className={[
                "rounded-full border px-2.5 py-1 text-xs font-medium transition",
                cardioType === t
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20",
              ].join(" ")}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={customType}
            onChange={(e) => {
              setCustomType(e.target.value);
              setCardioType(e.target.value);
            }}
            placeholder="Or type a new cardio type…"
            className="flex-1 rounded-xl border border-white/10 bg-[#2c2c2e] px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
          />
          <button
            type="button"
            onClick={() => {
              if (customType.trim()) setCardioType(customType.trim());
            }}
            className="rounded-xl bg-emerald-500 px-3 py-2 text-white hover:bg-emerald-400"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        {cardioType && (
          <p className="mt-1.5 text-xs text-emerald-400">
            Selected: <strong>{cardioType}</strong>
          </p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-300">
          Total duration (minutes)
        </label>
        <input
          type="number"
          min={0.1}
          step={0.1}
          value={durationMinutes || ""}
          onChange={(e) =>
            setDurationMinutes(parseFloat(e.target.value) || 0)
          }
          required
          className="w-full rounded-xl border border-white/10 bg-[#2c2c2e] px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
          placeholder="e.g. 30"
        />
      </div>

      <div className="rounded-2xl border border-white/8 bg-[#2c2c2e]/80 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-zinc-200">Run Mode</p>
            <p className="text-xs text-zinc-500">
              Enable distance & pace (min/km) tracking
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={runMode}
            onClick={() => setRunMode((v) => !v)}
            className={[
              "relative h-7 w-12 rounded-full transition-colors",
              runMode ? "bg-emerald-500" : "bg-zinc-600",
            ].join(" ")}
          >
            <span
              className={[
                "absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform",
                runMode ? "translate-x-5" : "translate-x-0",
              ].join(" ")}
            />
          </button>
        </div>

        {runMode && (
          <div className="mt-4 space-y-3 border-t border-white/8 pt-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                Distance (km)
              </label>
              <input
                type="number"
                min={0.01}
                step={0.01}
                value={distanceKm || ""}
                onChange={(e) =>
                  setDistanceKm(parseFloat(e.target.value) || 0)
                }
                required={runMode}
                className="w-full rounded-xl border border-white/10 bg-[#1c1c1e] px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
                placeholder="e.g. 5.0"
              />
            </div>
            {calculatedPace > 0 && (
              <div className="rounded-xl bg-emerald-500/10 px-4 py-3 text-center ring-1 ring-emerald-500/20">
                <p className="text-[10px] font-medium uppercase tracking-wide text-emerald-400">
                  Calculated Pace
                </p>
                <p className="text-2xl font-semibold tabular-nums text-emerald-300">
                  {formatPace(calculatedPace)}
                  <span className="ml-1 text-sm font-normal text-emerald-500">
                    min/km
                  </span>
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-300">
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full resize-none rounded-xl border border-white/10 bg-[#2c2c2e] px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
          placeholder="How did it feel?"
        />
      </div>

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
          className="flex-1 rounded-xl bg-emerald-500 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-400"
        >
          Save Session
        </button>
      </div>
    </form>
  );
}
