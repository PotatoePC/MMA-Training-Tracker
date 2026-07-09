"use client";

import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import {
  BarChart3,
  Activity,
  Timer,
  Gauge,
  Dumbbell,
  Heart,
} from "lucide-react";
import type { TrainingSession } from "@/lib/types";
import { SESSION_COLORS } from "@/lib/types";
import {
  bestEpley1RM,
  formatPace,
  paceMinPerKm,
  totalVolume,
} from "@/lib/formulas";
import { formatShortDate } from "@/lib/calendar";

interface AnalyticsProps {
  sessions: TrainingSession[];
}

type Tab =
  | "strength-volume"
  | "strength-1rm"
  | "cardio-time"
  | "cardio-pace";

const GRID = "#2c2c2e";
const TICK = "#71717a";
const TOOLTIP_STYLE = {
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "#2c2c2e",
  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
  fontSize: 12,
  color: "#e4e4e7",
};

export function Analytics({ sessions }: AnalyticsProps) {
  const [tab, setTab] = useState<Tab>("strength-volume");
  const [selectedExercise, setSelectedExercise] = useState<string>("");
  const [selectedCardioType, setSelectedCardioType] = useState<string>("");

  const strengthSessions = useMemo(
    () => sessions.filter((s) => s.type === "strength" && s.strength),
    [sessions]
  );

  const cardioSessions = useMemo(
    () => sessions.filter((s) => s.type === "cardio" && s.cardio),
    [sessions]
  );

  const exerciseNames = useMemo(() => {
    const names = new Set<string>();
    for (const s of strengthSessions) {
      for (const ex of s.strength!.exercises) {
        names.add(ex.name);
      }
    }
    return Array.from(names).sort();
  }, [strengthSessions]);

  const cardioTypes = useMemo(() => {
    const types = new Set<string>();
    for (const s of cardioSessions) {
      types.add(s.cardio!.cardioType);
    }
    return Array.from(types).sort();
  }, [cardioSessions]);

  const activeExercise = selectedExercise || exerciseNames[0] || "";
  const activeCardioType = selectedCardioType || cardioTypes[0] || "";

  const volumeData = useMemo(() => {
    if (!activeExercise) return [];
    return strengthSessions
      .map((s) => {
        const ex = s.strength!.exercises.find((e) => e.name === activeExercise);
        if (!ex) return null;
        const volume = totalVolume(ex.sets);
        const maxWeight = Math.max(...ex.sets.map((set) => set.weightKg), 0);
        return {
          date: s.date,
          label: formatShortDate(s.date),
          volume,
          maxWeight,
        };
      })
      .filter(Boolean)
      .sort((a, b) => a!.date.localeCompare(b!.date)) as {
      date: string;
      label: string;
      volume: number;
      maxWeight: number;
    }[];
  }, [strengthSessions, activeExercise]);

  const oneRmData = useMemo(() => {
    if (!activeExercise) return [];
    return strengthSessions
      .map((s) => {
        const ex = s.strength!.exercises.find((e) => e.name === activeExercise);
        if (!ex) return null;
        return {
          date: s.date,
          label: formatShortDate(s.date),
          oneRm: Math.round(bestEpley1RM(ex.sets) * 10) / 10,
        };
      })
      .filter(Boolean)
      .sort((a, b) => a!.date.localeCompare(b!.date)) as {
      date: string;
      label: string;
      oneRm: number;
    }[];
  }, [strengthSessions, activeExercise]);

  const cardioTimeData = useMemo(() => {
    if (!activeCardioType) return [];
    return cardioSessions
      .filter((s) => s.cardio!.cardioType === activeCardioType)
      .map((s) => ({
        date: s.date,
        label: formatShortDate(s.date),
        duration: s.cardio!.durationMinutes,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [cardioSessions, activeCardioType]);

  const cardioTimeByType = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of cardioSessions) {
      const t = s.cardio!.cardioType;
      map.set(t, (map.get(t) ?? 0) + s.cardio!.durationMinutes);
    }
    return Array.from(map.entries()).map(([name, total]) => ({
      name,
      total: Math.round(total * 10) / 10,
    }));
  }, [cardioSessions]);

  const paceData = useMemo(() => {
    return cardioSessions
      .filter(
        (s) =>
          s.cardio!.runMode &&
          s.cardio!.distanceKm &&
          s.cardio!.distanceKm > 0 &&
          (!activeCardioType || s.cardio!.cardioType === activeCardioType)
      )
      .map((s) => {
        const pace = paceMinPerKm(
          s.cardio!.durationMinutes,
          s.cardio!.distanceKm!
        );
        return {
          date: s.date,
          label: formatShortDate(s.date),
          pace: Math.round(pace * 100) / 100,
          paceLabel: formatPace(pace),
          type: s.cardio!.cardioType,
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [cardioSessions, activeCardioType]);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    {
      id: "strength-volume",
      label: "Volume & Intensity",
      icon: <Dumbbell className="h-3.5 w-3.5" />,
    },
    {
      id: "strength-1rm",
      label: "Calculated 1RM",
      icon: <BarChart3 className="h-3.5 w-3.5" />,
    },
    {
      id: "cardio-time",
      label: "Total Time",
      icon: <Timer className="h-3.5 w-3.5" />,
    },
    {
      id: "cardio-pace",
      label: "Pace (min/km)",
      icon: <Gauge className="h-3.5 w-3.5" />,
    },
  ];

  const isStrengthTab = tab.startsWith("strength");

  return (
    <div className="rounded-2xl bg-[#1c1c1e] shadow-sm ring-1 ring-white/8">
      <div className="flex items-center gap-2 border-b border-white/8 px-5 py-4">
        <Activity className="h-5 w-5 text-zinc-500" />
        <h2 className="text-lg font-semibold tracking-tight text-zinc-100">
          Progress Analytics
        </h2>
      </div>

      <div className="flex flex-wrap gap-1.5 border-b border-white/8 px-4 py-3">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={[
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition",
              tab === t.id
                ? t.id.startsWith("strength")
                  ? "bg-sky-500 text-white"
                  : "bg-emerald-500 text-white"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200",
            ].join(" ")}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-5">
        {isStrengthTab && exerciseNames.length > 0 && (
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-500">
              Exercise
            </label>
            <select
              value={activeExercise}
              onChange={(e) => setSelectedExercise(e.target.value)}
              className="w-full max-w-xs rounded-xl border border-white/10 bg-[#2c2c2e] px-3 py-2 text-sm text-zinc-100 outline-none focus:border-sky-500/50"
            >
              {exerciseNames.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        )}

        {!isStrengthTab && cardioTypes.length > 0 && (
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-500">
              Cardio type
            </label>
            <select
              value={activeCardioType}
              onChange={(e) => setSelectedCardioType(e.target.value)}
              className="w-full max-w-xs rounded-xl border border-white/10 bg-[#2c2c2e] px-3 py-2 text-sm text-zinc-100 outline-none focus:border-emerald-500/50"
            >
              {cardioTypes.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        )}

        {tab === "strength-volume" && (
          <div>
            <p className="mb-3 text-sm text-zinc-500">
              Weight (kg) and total volume over time for{" "}
              <strong className="text-zinc-200">{activeExercise || "—"}</strong>
            </p>
            {volumeData.length === 0 ? (
              <EmptyChart message="No strength data for this exercise yet." />
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={volumeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: TICK }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      yAxisId="left"
                      tick={{ fontSize: 11, fill: TICK }}
                      axisLine={false}
                      tickLine={false}
                      label={{
                        value: "Volume (kg)",
                        angle: -90,
                        position: "insideLeft",
                        style: { fontSize: 11, fill: TICK },
                      }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fontSize: 11, fill: TICK }}
                      axisLine={false}
                      tickLine={false}
                      label={{
                        value: "Max weight (kg)",
                        angle: 90,
                        position: "insideRight",
                        style: { fontSize: 11, fill: TICK },
                      }}
                    />
                    <Tooltip
                      contentStyle={TOOLTIP_STYLE}
                      formatter={(value, name) => [
                        `${value} kg`,
                        name === "volume" ? "Total Volume" : "Max Weight",
                      ]}
                    />
                    <Legend wrapperStyle={{ color: TICK }} />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="volume"
                      name="Total Volume"
                      stroke={SESSION_COLORS.strength.hex}
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: SESSION_COLORS.strength.hex }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="maxWeight"
                      name="Max Weight"
                      stroke="#38BDF8"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={{ r: 3, fill: "#38BDF8" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {tab === "strength-1rm" && (
          <div>
            <p className="mb-1 text-sm text-zinc-500">
              Estimated 1-Rep Max (Epley) for{" "}
              <strong className="text-zinc-200">{activeExercise || "—"}</strong>
            </p>
            <p className="mb-3 text-[11px] text-zinc-600">
              Formula: 1RM = weight × (1 + reps / 30) · results in kg
            </p>
            {oneRmData.length === 0 ? (
              <EmptyChart message="No 1RM data for this exercise yet." />
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={oneRmData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: TICK }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: TICK }}
                      axisLine={false}
                      tickLine={false}
                      unit=" kg"
                      domain={["auto", "auto"]}
                    />
                    <Tooltip
                      contentStyle={TOOLTIP_STYLE}
                      formatter={(value) => [`${value} kg`, "Est. 1RM"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="oneRm"
                      name="Est. 1RM (kg)"
                      stroke={SESSION_COLORS.strength.hex}
                      strokeWidth={2.5}
                      dot={{ r: 5, fill: SESSION_COLORS.strength.hex }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {tab === "cardio-time" && (
          <div className="space-y-6">
            <div>
              <p className="mb-3 text-sm text-zinc-500">
                Duration progression for{" "}
                <strong className="text-zinc-200">
                  {activeCardioType || "—"}
                </strong>
              </p>
              {cardioTimeData.length === 0 ? (
                <EmptyChart message="No cardio sessions for this type yet." />
              ) : (
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={cardioTimeData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 11, fill: TICK }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: TICK }}
                        axisLine={false}
                        tickLine={false}
                        unit=" min"
                      />
                      <Tooltip
                        contentStyle={TOOLTIP_STYLE}
                        formatter={(value) => [`${value} min`, "Duration"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="duration"
                        name="Duration (min)"
                        stroke={SESSION_COLORS.cardio.hex}
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: SESSION_COLORS.cardio.hex }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div>
              <p className="mb-3 flex items-center gap-1.5 text-sm text-zinc-500">
                <Heart className="h-3.5 w-3.5 text-emerald-400" />
                Total time by cardio type (all sessions)
              </p>
              {cardioTimeByType.length === 0 ? (
                <EmptyChart message="No cardio data yet." />
              ) : (
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cardioTimeByType}>
                      <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: TICK }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: TICK }}
                        axisLine={false}
                        tickLine={false}
                        unit=" min"
                      />
                      <Tooltip
                        contentStyle={TOOLTIP_STYLE}
                        formatter={(value) => [`${value} min`, "Total time"]}
                      />
                      <Bar
                        dataKey="total"
                        name="Total minutes"
                        fill={SESSION_COLORS.cardio.hex}
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "cardio-pace" && (
          <div>
            <p className="mb-1 text-sm text-zinc-500">
              Pace (min/km) over time
              {activeCardioType ? (
                <>
                  {" "}
                  for{" "}
                  <strong className="text-zinc-200">{activeCardioType}</strong>
                </>
              ) : null}
            </p>
            <p className="mb-3 text-[11px] text-zinc-600">
              Lower is faster · only Run Mode sessions with distance are shown
            </p>
            {paceData.length === 0 ? (
              <EmptyChart message="No run-mode pace data yet. Enable Run Mode and log distance (km)." />
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={paceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: TICK }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: TICK }}
                      axisLine={false}
                      tickLine={false}
                      domain={["auto", "auto"]}
                      tickFormatter={(v) => formatPace(v)}
                      reversed
                    />
                    <Tooltip
                      contentStyle={TOOLTIP_STYLE}
                      formatter={(value) => [
                        `${formatPace(Number(value))} min/km`,
                        "Pace",
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="pace"
                      name="Pace (min/km)"
                      stroke={SESSION_COLORS.cardio.hex}
                      strokeWidth={2.5}
                      dot={{ r: 5, fill: SESSION_COLORS.cardio.hex }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-black/30">
      <p className="text-sm text-zinc-500">{message}</p>
    </div>
  );
}
