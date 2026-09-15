import { useCallback, useEffect, useRef, useState } from "react";
import { command, emptyCloudData, loadCloudData } from "./data";
import type { PrototypeData } from "../utils/prototypeStore";

export function useCloud(
  enabled: boolean,
  userId: string | null,
  authLoading: boolean,
  apply: (data: PrototypeData) => void,
) {
  const [loadedFor, setLoadedFor] = useState<string | undefined>();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const applyRef = useRef(apply);
  applyRef.current = apply;
  const identity = userId || "public";
  const current = useRef(identity);
  current.current = identity;
  const generation = useRef(0);
  const pending = useRef(false);
  const mutation = useRef(false);
  const refresh = useCallback(async () => {
    if (!enabled || authLoading || pending.current || mutation.current) return;
    const ticket = ++generation.current;
    pending.current = true;
    try {
      if (userId) await command("sync");
      const data = await loadCloudData(userId);
      if (current.current !== identity || ticket !== generation.current) return;
      applyRef.current(data);
      setLoadedFor(identity);
      setError("");
    } catch (e) {
      if (current.current === identity)
        setError(
          e instanceof Error ? e.message : "데이터를 불러오지 못했어요.",
        );
    } finally {
      pending.current = false;
    }
  }, [enabled, userId, identity, authLoading]);
  useEffect(() => {
    if (!enabled) return;
    generation.current++;
    setLoadedFor(undefined);
    applyRef.current(emptyCloudData());
    // Requests started for a previous identity must finish before the next load.
    const retry = setInterval(() => {
      if (!pending.current) void refresh();
    }, 8000);
    void refresh();
    const focus = () => void refresh();
    window.addEventListener("focus", focus);
    return () => {
      generation.current++;
      clearInterval(retry);
      window.removeEventListener("focus", focus);
    };
  }, [refresh, enabled]);
  const run = async (
    action: string,
    data: Record<string, unknown> = {},
    after?: (result: { id?: string; roomId?: string }) => void,
  ) => {
    if (mutation.current) return false;
    mutation.current = true;
    setBusy(true);
    setError("");
    const actor = current.current;
    try {
      const result = await command(action, data);
      if (current.current !== actor) return false;
      // Invalidate a poll that began before this write, then load the committed state.
      generation.current++;
      try {
        const next = await loadCloudData(userId);
        if (current.current !== actor) return false;
        applyRef.current(next);
        setLoadedFor(actor);
      } catch {
        setError(
          "저장은 완료됐지만 최신 목록을 불러오지 못했어요. 다시 불러오기를 눌러 주세요.",
        );
      }
      if (current.current !== actor) return false;
      after?.(result);
      return true;
    } catch (e) {
      if (current.current === actor)
        setError(e instanceof Error ? e.message : "저장하지 못했어요.");
      return false;
    } finally {
      mutation.current = false;
      setBusy(false);
    }
  };
  return {
    ready: !enabled || (!authLoading && loadedFor === identity),
    error,
    busy,
    refresh,
    run,
  };
}
