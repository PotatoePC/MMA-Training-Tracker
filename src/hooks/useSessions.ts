"use client";

import { useCallback, useEffect, useState } from "react";
import type { AppData, TrainingSession } from "@/lib/types";
import {
  loadData,
  addSession as storageAdd,
  updateSession as storageUpdate,
  deleteSession as storageDelete,
  resetToSeed,
} from "@/lib/storage";
import {
  subscribeToUserData,
  saveSessionCloud,
  deleteSessionCloud,
  resetUserCloudData,
  migrateLocalDataToCloud,
} from "@/lib/firestore";
import { useAuth } from "@/context/AuthContext";

export function useSessions() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<AppData | null>(null);
  const [ready, setReady] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"synced" | "syncing" | "guest">("guest");

  useEffect(() => {
    if (authLoading) return;

    if (user) {
      setSyncStatus("syncing");

      // Auto-migrate local data into Firestore if this is the user's first cloud sync
      const localData = loadData();
      migrateLocalDataToCloud(user.uid, localData)
        .catch((err) => console.error("Initial migration error:", err))
        .finally(() => {
          // Subscribe to real-time updates from Firestore
          const unsubscribe = subscribeToUserData(
            user.uid,
            (cloudData) => {
              setData(cloudData);
              setReady(true);
              setSyncStatus("synced");
            },
            (err) => {
              console.error("Cloud subscription error:", err);
              // Fallback to local
              setData(loadData());
              setReady(true);
              setSyncStatus("guest");
            }
          );
          return () => unsubscribe();
        });
    } else {
      // Unauthenticated / Guest mode -> LocalStorage
      setData(loadData());
      setReady(true);
      setSyncStatus("guest");
    }
  }, [user, authLoading]);

  const refresh = useCallback(() => {
    if (!user) {
      setData(loadData());
    }
  }, [user]);

  const addSession = useCallback(
    async (session: TrainingSession) => {
      if (user) {
        setSyncStatus("syncing");
        // Optimistic local update
        setData((prev) => {
          if (!prev) return null;
          const next = {
            ...prev,
            sessions: [...prev.sessions, session].sort((a, b) =>
              a.date.localeCompare(b.date)
            ),
          };
          return next;
        });
        await saveSessionCloud(user.uid, session);
        setSyncStatus("synced");
      } else {
        const next = storageAdd(session);
        setData({ ...next });
      }
    },
    [user]
  );

  const updateSession = useCallback(
    async (session: TrainingSession) => {
      if (user) {
        setSyncStatus("syncing");
        setData((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            sessions: prev.sessions.map((s) => (s.id === session.id ? session : s)),
          };
        });
        await saveSessionCloud(user.uid, session);
        setSyncStatus("synced");
      } else {
        const next = storageUpdate(session);
        setData({ ...next });
      }
    },
    [user]
  );

  const deleteSession = useCallback(
    async (id: string) => {
      if (user) {
        setSyncStatus("syncing");
        setData((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            sessions: prev.sessions.filter((s) => s.id !== id),
          };
        });
        await deleteSessionCloud(user.uid, id);
        setSyncStatus("synced");
      } else {
        const next = storageDelete(id);
        setData({ ...next });
      }
    },
    [user]
  );

  const reset = useCallback(async () => {
    if (user) {
      setSyncStatus("syncing");
      await resetUserCloudData(user.uid);
      setSyncStatus("synced");
    } else {
      const next = resetToSeed();
      setData({ ...next });
    }
  }, [user]);

  return {
    data,
    sessions: data?.sessions ?? [],
    customExercises: data?.customExercises ?? [],
    customCardioTypes: data?.customCardioTypes ?? [],
    isometricExercises: data?.isometricExercises ?? [],
    ready: ready && !authLoading,
    syncStatus,
    addSession,
    updateSession,
    deleteSession,
    reset,
    refresh,
  };
}
