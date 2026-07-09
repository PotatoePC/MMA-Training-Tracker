"use client";

import { useState } from "react";
import { Swords, Shield } from "lucide-react";
import type { CombatSessionData, SessionType } from "@/lib/types";
import { SESSION_COLORS } from "@/lib/types";

interface CombatFormProps {
  type: "grappling" | "striking";
  initial?: CombatSessionData;
  onSubmit: (data: CombatSessionData) => void;
  onCancel: () => void;
}

export function CombatForm({
  type,
  initial,
  onSubmit,
  onCancel,
}: CombatFormProps) {
  const [feltRating, setFeltRating] = useState(initial?.feltRating ?? 7);
  const [learned, setLearned] = useState(initial?.learned ?? "");
  const [improvements, setImprovements] = useState(
    initial?.improvements ?? ""
  );

  const colors = SESSION_COLORS[type as SessionType];
  const Icon = type === "grappling" ? Shield : Swords;
  const accent =
    type === "grappling"
      ? {
          text: "text-purple-300",
          btn: "bg-purple-600 hover:bg-purple-500",
          ring: "accent-purple-500",
          badge: "bg-purple-500/20 text-purple-300",
          border: "focus:border-purple-500/50 focus:ring-purple-500/20",
          active: "bg-purple-600 text-white",
        }
      : {
          text: "text-red-400",
          btn: "bg-red-600 hover:bg-red-500",
          ring: "accent-red-500",
          badge: "bg-red-500/20 text-red-300",
          border: "focus:border-red-500/50 focus:ring-red-500/20",
          active: "bg-red-600 text-white",
        };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      feltRating,
      learned: learned.trim(),
      improvements: improvements.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className={`flex items-center gap-2 ${accent.text}`}>
        <Icon className="h-5 w-5" />
        <h3 className="text-lg font-semibold">{colors.label} Journal</h3>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-zinc-300">
            How I felt this session
          </label>
          <span
            className={`rounded-full px-2.5 py-0.5 text-sm font-semibold ${accent.badge}`}
          >
            {feltRating}/10
          </span>
        </div>
        <input
          type="range"
          min={1}
          max={10}
          value={feltRating}
          onChange={(e) => setFeltRating(parseInt(e.target.value, 10))}
          className={`h-2 w-full cursor-pointer appearance-none rounded-full bg-zinc-700 ${accent.ring}`}
        />
        <div className="mt-2 flex justify-between gap-1">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setFeltRating(n)}
              className={[
                "flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition",
                feltRating === n
                  ? accent.active
                  : "bg-zinc-800 text-zinc-500 hover:bg-zinc-700 hover:text-zinc-300",
              ].join(" ")}
            >
              {n}
            </button>
          ))}
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-zinc-600">
          <span>Poor</span>
          <span>Excellent</span>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-300">
          What I learned this session
        </label>
        <textarea
          value={learned}
          onChange={(e) => setLearned(e.target.value)}
          rows={4}
          className={`w-full resize-y rounded-xl border border-white/10 bg-[#2c2c2e] px-3 py-2.5 text-sm leading-relaxed text-zinc-100 placeholder:text-zinc-600 outline-none focus:ring-2 ${accent.border}`}
          placeholder="Techniques, insights, coaching cues…"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-300">
          Areas for improvement / Focus points
        </label>
        <textarea
          value={improvements}
          onChange={(e) => setImprovements(e.target.value)}
          rows={4}
          className={`w-full resize-y rounded-xl border border-white/10 bg-[#2c2c2e] px-3 py-2.5 text-sm leading-relaxed text-zinc-100 placeholder:text-zinc-600 outline-none focus:ring-2 ${accent.border}`}
          placeholder="What to drill next, mistakes to fix…"
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
          className={`flex-1 rounded-xl py-2.5 text-sm font-semibold text-white shadow-sm ${accent.btn}`}
        >
          Save Session
        </button>
      </div>
    </form>
  );
}
