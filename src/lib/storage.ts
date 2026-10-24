import type { AppData, TrainingSession } from "./types";
import { createSeedData } from "./seed";

const STORAGE_KEY = "mma-training-tracker-v1";

export function loadData(): AppData {
  if (typeof window === "undefined") {
    return createSeedData();
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seed = createSeedData();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw) as AppData;
    if (!parsed.sessions || !Array.isArray(parsed.sessions)) {
      const seed = createSeedData();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }

    // Filter out any legacy placeholder/seed sessions
    const cleanSessions = parsed.sessions.filter(
      (s) => !s.id.startsWith("seed-")
    );

    const cleanData: AppData = {
      sessions: cleanSessions,
      customExercises: parsed.customExercises ?? [],
      customCardioTypes: parsed.customCardioTypes ?? [],
      isometricExercises: parsed.isometricExercises ?? [],
      version: parsed.version ?? 1,
    };

    // If placeholder sessions were in localStorage, overwrite with clean data
    if (cleanSessions.length !== parsed.sessions.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanData));
    }

    return cleanData;
  } catch {
    const seed = createSeedData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }
}

export function saveData(data: AppData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function addSession(session: TrainingSession): AppData {
  const data = loadData();
  data.sessions = [...data.sessions, session].sort((a, b) =>
    a.date.localeCompare(b.date)
  );
  if (session.strength) {
    if (!data.isometricExercises) {
      data.isometricExercises = [];
    }
    for (const ex of session.strength.exercises) {
      if (ex.name && !data.customExercises.includes(ex.name)) {
        data.customExercises = [...data.customExercises, ex.name].sort();
      }
      if (ex.mode === "isometric") {
        if (!data.isometricExercises.includes(ex.name)) {
          data.isometricExercises.push(ex.name);
        }
      } else if (ex.mode === "reps") {
        data.isometricExercises = data.isometricExercises.filter(
          (n) => n.toLowerCase() !== ex.name.toLowerCase()
        );
      }
    }
  }
  if (session.cardio?.cardioType) {
    if (!data.customCardioTypes.includes(session.cardio.cardioType)) {
      data.customCardioTypes = [
        ...data.customCardioTypes,
        session.cardio.cardioType,
      ].sort();
    }
  }
  saveData(data);
  return data;
}

export function updateSession(session: TrainingSession): AppData {
  const data = loadData();
  data.sessions = data.sessions.map((s) =>
    s.id === session.id ? session : s
  );
  if (session.strength) {
    if (!data.isometricExercises) {
      data.isometricExercises = [];
    }
    for (const ex of session.strength.exercises) {
      if (ex.name && !data.customExercises.includes(ex.name)) {
        data.customExercises = [...data.customExercises, ex.name].sort();
      }
      if (ex.mode === "isometric") {
        if (!data.isometricExercises.includes(ex.name)) {
          data.isometricExercises.push(ex.name);
        }
      } else if (ex.mode === "reps") {
        data.isometricExercises = data.isometricExercises.filter(
          (n) => n.toLowerCase() !== ex.name.toLowerCase()
        );
      }
    }
  }
  saveData(data);
  return data;
}

export function deleteSession(id: string): AppData {
  const data = loadData();
  data.sessions = data.sessions.filter((s) => s.id !== id);
  saveData(data);
  return data;
}

export function resetToSeed(): AppData {
  const seed = createSeedData();
  saveData(seed);
  return seed;
}

export function getSessionsForDate(
  sessions: TrainingSession[],
  date: string
): TrainingSession[] {
  return sessions.filter((s) => s.date === date);
}

export function getSessionTypesForDate(
  sessions: TrainingSession[],
  date: string
): Set<string> {
  return new Set(
    sessions.filter((s) => s.date === date).map((s) => s.type)
  );
}
