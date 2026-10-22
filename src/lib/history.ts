import type { TrainingSession } from "./types";
import { bestEpley1RM, totalVolume } from "./formulas";
import { formatShortDate } from "./calendar";

export interface PreviousSetData {
  setNumber: number;
  weightKg: number;
  reps: number;
}

export interface PreviousExerciseHistory {
  sessionId: string;
  date: string;
  formattedDate: string;
  rpe?: number;
  sets: PreviousSetData[];
  best1RM: number;
  totalVolume: number;
}

export function formatPrevSet(
  set?: { weightKg: number; reps: number } | null
): string {
  if (!set) return "—";
  if (set.weightKg === 0 && set.reps > 0) return `BW × ${set.reps}`;
  if (set.weightKg > 0 && set.reps === 0) return `${set.weightKg}kg`;
  if (set.weightKg === 0 && set.reps === 0) return "—";
  return `${set.weightKg}kg × ${set.reps}`;
}

/**
 * Finds the most recent previous performance of an exercise across past sessions.
 */
export function getLastExercisePerformance(
  exerciseName: string,
  sessions: TrainingSession[] = [],
  currentDate?: string,
  excludeSessionId?: string
): PreviousExerciseHistory | null {
  const target = exerciseName.trim().toLowerCase();
  if (!target || !sessions.length) return null;

  // Filter only strength sessions that contain this exercise with valid sets
  const eligible = sessions.filter((s) => {
    if (s.type !== "strength" || !s.strength?.exercises) return false;
    if (excludeSessionId && s.id === excludeSessionId) return false;
    return s.strength.exercises.some(
      (ex) =>
        ex.name.trim().toLowerCase() === target &&
        ex.sets &&
        ex.sets.length > 0 &&
        ex.sets.some((st) => st.weightKg > 0 || st.reps > 0)
    );
  });

  if (!eligible.length) return null;

  // Prioritize sessions strictly before currentDate if currentDate is given
  const beforeDate = currentDate
    ? eligible.filter((s) => s.date < currentDate)
    : [];

  const pool = beforeDate.length > 0 ? beforeDate : eligible;

  // Sort descending: newest date first, then newest createdAt
  const sorted = [...pool].sort((a, b) => {
    const dComp = b.date.localeCompare(a.date);
    if (dComp !== 0) return dComp;
    return (b.createdAt || "").localeCompare(a.createdAt || "");
  });

  const lastSession = sorted[0];
  if (!lastSession || !lastSession.strength) return null;

  const matchingEx = lastSession.strength.exercises.find(
    (ex) => ex.name.trim().toLowerCase() === target
  );
  if (!matchingEx || !matchingEx.sets || !matchingEx.sets.length) return null;

  const validSets = matchingEx.sets.filter((s) => s.weightKg > 0 || s.reps > 0);
  if (!validSets.length) return null;

  const sets: PreviousSetData[] = validSets.map((s, idx) => ({
    setNumber: idx + 1,
    weightKg: s.weightKg,
    reps: s.reps,
  }));

  let formattedDate = lastSession.date;
  try {
    formattedDate = formatShortDate(lastSession.date);
  } catch {
    // fallback to raw date
  }

  return {
    sessionId: lastSession.id,
    date: lastSession.date,
    formattedDate,
    rpe: matchingEx.rpe ?? lastSession.strength.rpe,
    sets,
    best1RM: bestEpley1RM(validSets),
    totalVolume: totalVolume(validSets),
  };
}
