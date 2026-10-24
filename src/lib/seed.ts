import type { AppData, TrainingSession } from "./types";
import { DEFAULT_CARDIO_TYPES, DEFAULT_EXERCISES } from "./types";

export const SEED_SESSIONS: TrainingSession[] = [];

export function createSeedData(): AppData {
  return {
    sessions: [],
    customExercises: [...DEFAULT_EXERCISES],
    customCardioTypes: [...DEFAULT_CARDIO_TYPES],
    isometricExercises: [],
    version: 1,
  };
}
