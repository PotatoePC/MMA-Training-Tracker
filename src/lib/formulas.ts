/** Epley 1-Rep Max formula: 1RM = w * (1 + r / 30) — result in kg */
export function epley1RM(weightKg: number, reps: number): number {
  if (weightKg <= 0 || reps <= 0) return 0;
  if (reps === 1) return weightKg;
  return weightKg * (1 + reps / 30);
}

/** Total volume for a set of sets: sum(weight * reps) in kg */
export function totalVolume(
  sets: { weightKg: number; reps?: number }[]
): number {
  return sets.reduce((sum, s) => sum + s.weightKg * (s.reps ?? 0), 0);
}

/** Best estimated 1RM from a list of sets */
export function bestEpley1RM(
  sets: { weightKg: number; reps?: number }[]
): number {
  if (!sets.length) return 0;
  return Math.max(...sets.map((s) => epley1RM(s.weightKg, s.reps ?? 0)));
}

/** Format duration seconds as e.g. 45s, 1m 30s */
export function formatDurationSeconds(seconds: number): string {
  if (!seconds || seconds <= 0) return "0s";
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const remainingSecs = Math.round(seconds % 60);
  if (remainingSecs === 0) return `${mins}m`;
  return `${mins}m ${remainingSecs}s`;
}

/**
 * Pace in min/km given duration (minutes) and distance (km).
 * Returns total minutes per km (e.g. 5.5 = 5:30 /km).
 */
export function paceMinPerKm(
  durationMinutes: number,
  distanceKm: number
): number {
  if (distanceKm <= 0 || durationMinutes <= 0) return 0;
  return durationMinutes / distanceKm;
}

/** Format pace as m:ss /km */
export function formatPace(minPerKm: number): string {
  if (!minPerKm || !isFinite(minPerKm)) return "—";
  const whole = Math.floor(minPerKm);
  const secs = Math.round((minPerKm - whole) * 60);
  if (secs === 60) return `${whole + 1}:00`;
  return `${whole}:${secs.toString().padStart(2, "0")}`;
}

/** Format duration minutes as h:mm or mm:ss style */
export function formatDuration(minutes: number): string {
  if (!minutes && minutes !== 0) return "—";
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m} min`;
}

export function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}
