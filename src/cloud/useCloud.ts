import { useCallback, useEffect, useRef, useState } from "react";
import { command, emptyCloudData, loadCloudData } from "./data";
import { supabase } from "../lib/supabase";
import type { PrototypeData } from "../utils/prototypeStore";

export interface RealtimeChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  text: string;
  createdAt: string;
}

export function useCloud(
  enabled: boolean,
  userId: string | null,
  authLoading: boolean,
  apply: (data: PrototypeData) => void,
  receiveMessage?: (message: RealtimeChatMessage) => void,
) {
  const [loadedFor, setLoadedFor] = useState<string | undefined>();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [realtimeReady, setRealtimeReady] = useState(false);
  const applyRef = useRef(apply);
  applyRef.current = apply;
  const receiveMessageRef = useRef(receiveMessage);
  receiveMessageRef.current = receiveMessage;
  const identity = userId || "public";
  const current = useRef(identity);
  current.current = identity;
  const generation = useRef(0);
  const pending = useRef(false);
  const mutation = useRef(false);
  const syncedFor = useRef<string | undefined>(undefined);
  const refresh = useCallback(async () => {
    if (!enabled || authLoading || pending.current || mutation.current) return;
    const ticket = ++generation.current;
    pending.current = true;
    try {
      // Profile sync can take an Edge Function round trip. Start it in parallel so
      // the app shell and existing data do not wait for it.
      const sync = userId && syncedFor.current !== identity
        ? command("sync").then(
            () => true,
            () => false,
          )
        : null;
      const data = await loadCloudData(userId);
      if (current.current !== identity || ticket !== generation.current) return;
      applyRef.current(data);
      setLoadedFor(identity);
      setError("");
      if (sync) {
        if (!(await sync)) return;
        if (current.current !== identity || ticket !== generation.current) return;
        syncedFor.current = identity;
        const synced = await loadCloudData(userId);
        if (current.current !== identity || ticket !== generation.current) return;
        applyRef.current(synced);
      }
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
  useEffect(() => {
    if (!enabled || authLoading || !userId || !supabase) {
      setRealtimeReady(false);
      return;
    }
    const channel = supabase
      .channel(`chat-messages-${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        (payload) => {
          const row = payload.new as Record<string, unknown>;
          receiveMessageRef.current?.({
            id: String(row.id),
            roomId: String(row.room_id),
            senderId: row.sender_id ? String(row.sender_id) : "system",
            text: String(row.body || ""),
            createdAt: String(row.created_at),
          });
        },
      )
      .subscribe((status) => {
        setRealtimeReady(status === "SUBSCRIBED");
      });
    return () => {
      setRealtimeReady(false);
      void supabase.removeChannel(channel);
    };
  }, [enabled, authLoading, userId]);
  const run = async (
    action: string,
    data: Record<string, unknown> = {},
    after?: (result: { id?: string; roomId?: string }) => void,
  ) => {
    const isMessage = action === "message";
    // Reading notifications must never swallow a message the user just sent.
    // Message IDs make concurrent sends safe and idempotent on the server.
    if (mutation.current && !isMessage) return false;
    if (!isMessage) mutation.current = true;
    const showBusy = !isMessage;
    if (showBusy) setBusy(true);
    setError("");
    const actor = current.current;
    try {
      const result = await command(action, data);
      if (current.current !== actor) return false;
      // INSERT events keep both chat participants in sync. Avoid reloading every
      // unrelated table after a message is committed.
      if (isMessage) {
        after?.(result);
        return true;
      }
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
      if (!isMessage) mutation.current = false;
      if (showBusy) setBusy(false);
    }
  };
  return {
    ready: !enabled || (!authLoading && loadedFor === identity),
    error,
    busy,
    realtimeReady,
    refresh,
    run,
  };
}
