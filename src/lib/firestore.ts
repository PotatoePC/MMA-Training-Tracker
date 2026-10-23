import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  getDoc,
  onSnapshot,
  writeBatch,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import type { AppData, TrainingSession } from "./types";
import { createSeedData } from "./seed";
import { DEFAULT_CARDIO_TYPES, DEFAULT_EXERCISES } from "./types";

interface PreferencesDoc {
  customExercises?: string[];
  customCardioTypes?: string[];
  version?: number;
}

/**
 * Subscribes to real-time updates for a user's sessions and preferences.
 */
export function subscribeToUserData(
  userId: string,
  onData: (data: AppData) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  if (!db) {
    onData(createSeedData());
    return () => {};
  }

  const sessionsRef = collection(db, "users", userId, "sessions");
  const prefsRef = doc(db, "users", userId, "meta", "preferences");

  let currentSessions: TrainingSession[] = [];
  let customExercises: string[] = [...DEFAULT_EXERCISES];
  let customCardioTypes: string[] = [...DEFAULT_CARDIO_TYPES];

  const updateCombined = () => {
    onData({
      sessions: [...currentSessions].sort((a, b) => a.date.localeCompare(b.date)),
      customExercises,
      customCardioTypes,
      version: 1,
    });
  };

  // 1. Subscribe to sessions subcollection
  const unsubSessions = onSnapshot(
    sessionsRef,
    (snapshot) => {
      // Filter out any legacy seed sessions
      currentSessions = snapshot.docs
        .map((docSnap) => {
          const d = docSnap.data() as TrainingSession;
          return { ...d, id: docSnap.id };
        })
        .filter((s) => !s.id.startsWith("seed-"));

      // Clean up any lingering seed documents in cloud storage
      const seedDocs = snapshot.docs.filter((d) => d.id.startsWith("seed-"));
      if (seedDocs.length > 0 && db) {
        const batch = writeBatch(db);
        for (const docSnap of seedDocs) {
          batch.delete(docSnap.ref);
        }
        batch.commit().catch(console.error);
      }

      updateCombined();
    },
    (err) => {
      console.error("Firestore sessions subscription error:", err);
      onError?.(err);
    }
  );

  // 2. Subscribe to preferences document
  const unsubPrefs = onSnapshot(
    prefsRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as PreferencesDoc;
        if (data.customExercises) customExercises = data.customExercises;
        if (data.customCardioTypes) customCardioTypes = data.customCardioTypes;
      }
      updateCombined();
    },
    (err) => {
      console.error("Firestore preferences subscription error:", err);
      onError?.(err);
    }
  );

  return () => {
    unsubSessions();
    unsubPrefs();
  };
}

/**
 * Saves or updates a session in Cloud Firestore.
 */
export async function saveSessionCloud(
  userId: string,
  session: TrainingSession
): Promise<void> {
  if (!db) return;

  const sessionDocRef = doc(db, "users", userId, "sessions", session.id);
  await setDoc(sessionDocRef, session, { merge: true });

  // Update custom exercises/cardio if new ones exist
  const prefsRef = doc(db, "users", userId, "meta", "preferences");
  const prefsSnap = await getDoc(prefsRef);
  const currentPrefs: PreferencesDoc = prefsSnap.exists()
    ? (prefsSnap.data() as PreferencesDoc)
    : { customExercises: [...DEFAULT_EXERCISES], customCardioTypes: [...DEFAULT_CARDIO_TYPES] };

  let updated = false;
  let nextEx = currentPrefs.customExercises ? [...currentPrefs.customExercises] : [...DEFAULT_EXERCISES];
  let nextCar = currentPrefs.customCardioTypes ? [...currentPrefs.customCardioTypes] : [...DEFAULT_CARDIO_TYPES];

  if (session.strength?.exercises) {
    for (const ex of session.strength.exercises) {
      if (ex.name && !nextEx.includes(ex.name)) {
        nextEx.push(ex.name);
        updated = true;
      }
    }
  }

  if (session.cardio?.cardioType) {
    if (!nextCar.includes(session.cardio.cardioType)) {
      nextCar.push(session.cardio.cardioType);
      updated = true;
    }
  }

  if (updated) {
    await setDoc(
      prefsRef,
      {
        customExercises: nextEx.sort(),
        customCardioTypes: nextCar.sort(),
        version: 1,
      },
      { merge: true }
    );
  }
}

/**
 * Deletes a session from Cloud Firestore.
 */
export async function deleteSessionCloud(
  userId: string,
  sessionId: string
): Promise<void> {
  if (!db) return;
  const sessionDocRef = doc(db, "users", userId, "sessions", sessionId);
  await deleteDoc(sessionDocRef);
}

/**
 * Resets user cloud data (clears all cloud sessions).
 */
export async function resetUserCloudData(userId: string): Promise<void> {
  if (!db) return;

  const sessionsRef = collection(db, "users", userId, "sessions");
  const existingDocs = await getDocs(sessionsRef);

  const batch = writeBatch(db);
  for (const snap of existingDocs.docs) {
    batch.delete(snap.ref);
  }

  const seed = createSeedData();
  for (const s of seed.sessions) {
    const docRef = doc(db, "users", userId, "sessions", s.id);
    batch.set(docRef, s);
  }

  const prefsRef = doc(db, "users", userId, "meta", "preferences");
  batch.set(prefsRef, {
    customExercises: seed.customExercises,
    customCardioTypes: seed.customCardioTypes,
    version: 1,
  });

  await batch.commit();
}

/**
 * Migrates local data into the user's Firestore cloud storage.
 * If the user has never synced before, uploads existing local data or seeds it.
 */
export async function migrateLocalDataToCloud(
  userId: string,
  localData: AppData
): Promise<{ migrated: boolean; sessionCount: number }> {
  if (!db) return { migrated: false, sessionCount: 0 };

  const sessionsRef = collection(db, "users", userId, "sessions");
  const existingSnap = await getDocs(sessionsRef);

  // If cloud already has sessions, do not overwrite automatically
  if (!existingSnap.empty) {
    return { migrated: false, sessionCount: existingSnap.size };
  }

  const sessionsToUpload = (localData.sessions || []).filter(
    (s) => !s.id.startsWith("seed-")
  );

  const batch = writeBatch(db);

  for (const session of sessionsToUpload) {
    const docRef = doc(db, "users", userId, "sessions", session.id);
    batch.set(docRef, session);
  }

  const prefsRef = doc(db, "users", userId, "meta", "preferences");
  batch.set(
    prefsRef,
    {
      customExercises: localData.customExercises?.length
        ? localData.customExercises
        : [...DEFAULT_EXERCISES],
      customCardioTypes: localData.customCardioTypes?.length
        ? localData.customCardioTypes
        : [...DEFAULT_CARDIO_TYPES],
      version: localData.version ?? 1,
      migratedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  await batch.commit();
  return { migrated: true, sessionCount: sessionsToUpload.length };
}
