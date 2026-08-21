export type SessionType = "strength" | "cardio" | "grappling" | "striking";

export interface ExerciseSet {
  id: string;
  weightKg: number;
  reps: number;
}

export interface StrengthExercise {
  id: string;
  name: string;
  sets: ExerciseSet[];
  rpe?: number;
}

export interface StrengthSessionData {
  exercises: StrengthExercise[];
  rpe?: number;
}

export interface CardioSessionData {
  cardioType: string;
  durationMinutes: number;
  runMode: boolean;
  distanceKm?: number;
  notes?: string;
}

export interface CombatSessionData {
  feltRating: number;
  learned: string;
  improvements: string;
}

export interface TrainingSession {
  id: string;
  date: string; // YYYY-MM-DD
  type: SessionType;
  createdAt: string;
  strength?: StrengthSessionData;
  cardio?: CardioSessionData;
  combat?: CombatSessionData;
}

export interface AppData {
  sessions: TrainingSession[];
  customExercises: string[];
  customCardioTypes: string[];
  version: number;
}

export const SESSION_COLORS: Record<
  SessionType,
  { bg: string; text: string; dot: string; border: string; label: string; hex: string }
> = {
  strength: {
    bg: "bg-sky-500/15",
    text: "text-sky-300",
    dot: "bg-sky-400",
    border: "border-sky-500/40",
    label: "Strength",
    hex: "#5B9BD5", // Steel Blue (dark-mode tuned)
  },
  cardio: {
    bg: "bg-emerald-500/15",
    text: "text-emerald-300",
    dot: "bg-emerald-400",
    border: "border-emerald-500/40",
    label: "Cardio",
    hex: "#30D158", // Emerald Green (dark-mode tuned)
  },
  grappling: {
    bg: "bg-purple-500/15",
    text: "text-purple-300",
    dot: "bg-purple-400",
    border: "border-purple-500/40",
    label: "Grappling",
    hex: "#BF5AF2", // Deep Purple (dark-mode tuned)
  },
  striking: {
    bg: "bg-red-500/15",
    text: "text-red-300",
    dot: "bg-red-400",
    border: "border-red-500/40",
    label: "Striking",
    hex: "#FF453A", // Crimson Red (dark-mode tuned)
  },
};

export const DEFAULT_EXERCISES = [
  "Barbell Back Squat",
  "Bench Press",
  "Deadlift",
  "Overhead Press",
  "Pull-Ups",
  "Romanian Deadlift",
  "Barbell Row",
  "Front Squat",
];

export const DEFAULT_CARDIO_TYPES = [
  "5k Run",
  "1k Intervals",
  "Home Route",
  "Assault Bike",
  "Rowing Erg",
  "Road Work",
];
