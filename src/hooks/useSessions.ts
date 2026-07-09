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

export function useSessions() {
  const [data, setData] = useState<AppData | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setData(loadData());
    setReady(true);
  }, []);

  const refresh = useCallback(() => {
    setData(loadData());
  }, []);

  const addSession = useCallback((session: TrainingSession) => {
    const next = storageAdd(session);
    setData({ ...next });
  }, []);

  const updateSession = useCallback((session: TrainingSession) => {
    const next = storageUpdate(session);
    setData({ ...next });
  }, []);

  const deleteSession = useCallback((id: string) => {
    const next = storageDelete(id);
    setData({ ...next });
  }, []);

  const reset = useCallback(() => {
    const next = resetToSeed();
    setData({ ...next });
  }, []);

  return {
    data,
    sessions: data?.sessions ?? [],
    customExercises: data?.customExercises ?? [],
    customCardioTypes: data?.customCardioTypes ?? [],
    ready,
    addSession,
    updateSession,
    deleteSession,
    reset,
    refresh,
  };
}
