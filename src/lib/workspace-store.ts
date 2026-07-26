import { supabase, supabaseConfigured } from "@/lib/supabase";

/**
 * User-owned workspace data: notes, named watchlists, saved layouts, alerts.
 *
 * Every call here is fail-soft. The tables arrive in a migration that may not have
 * been applied yet, so a missing table degrades to "no rows" rather than breaking
 * the workspace.
 */

export type Note = {
  id: string;
  symbol: string;
  body: string;
  starred: boolean;
  source: string;
  created_at: string;
};

export type WatchlistGroup = {
  id: string;
  name: string;
  symbols: string[];
  position: number;
};

export type Layout = { id: string; name: string; state: Record<string, unknown> };

export type Alert = {
  id: string;
  kind: string;
  symbol: string | null;
  filer: string | null;
  threshold: number | null;
  schedule: string | null;
  note: string | null;
  active: boolean;
  triggered_at: string | null;
};

async function soft<T>(run: () => PromiseLike<{ data: T | null; error: unknown }>, fallback: T) {
  if (!supabaseConfigured) return fallback;
  try {
    const { data, error } = await run();
    if (error) return fallback;
    return data ?? fallback;
  } catch {
    return fallback;
  }
}

/* ── notes ───────────────────────────────────────────────────────────────── */

export const listNotes = (userId: string) =>
  soft<Note[]>(
    () =>
      supabase
        .from("notes")
        .select("id,symbol,body,starred,source,created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(200),
    [],
  );

export const insertNote = (
  userId: string,
  note: { body: string; symbol?: string; starred?: boolean; source?: string },
) =>
  soft<Note[]>(
    () =>
      supabase
        .from("notes")
        .insert({
          user_id: userId,
          body: note.body.slice(0, 2000),
          symbol: (note.symbol ?? "—").toUpperCase(),
          starred: note.starred ?? false,
          source: note.source ?? "agent",
        })
        .select("id,symbol,body,starred,source,created_at"),
    [],
  );

export const updateNote = (id: string, patch: { body?: string; starred?: boolean }) =>
  soft<Note[]>(
    () =>
      supabase
        .from("notes")
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select("id,symbol,body,starred,source,created_at"),
    [],
  );

export const deleteNote = (id: string) =>
  soft<unknown[]>(() => supabase.from("notes").delete().eq("id", id).select("id"), []);

/* ── named watchlists ────────────────────────────────────────────────────── */

export const listGroups = (userId: string) =>
  soft<WatchlistGroup[]>(
    () =>
      supabase
        .from("watchlist_groups")
        .select("id,name,symbols,position")
        .eq("user_id", userId)
        .order("position", { ascending: true }),
    [],
  );

export const insertGroup = (userId: string, name: string, symbols: string[], position: number) =>
  soft<WatchlistGroup[]>(
    () =>
      supabase
        .from("watchlist_groups")
        .insert({ user_id: userId, name: name.slice(0, 40), symbols, position })
        .select("id,name,symbols,position"),
    [],
  );

export const updateGroup = (id: string, patch: { name?: string; symbols?: string[] }) =>
  soft<WatchlistGroup[]>(
    () =>
      supabase
        .from("watchlist_groups")
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select("id,name,symbols,position"),
    [],
  );

export const deleteGroup = (id: string) =>
  soft<unknown[]>(() => supabase.from("watchlist_groups").delete().eq("id", id).select("id"), []);

/* ── layouts ─────────────────────────────────────────────────────────────── */

export const listLayouts = (userId: string) =>
  soft<Layout[]>(() => supabase.from("layouts").select("id,name,state").eq("user_id", userId), []);

export const upsertLayout = (userId: string, name: string, state: Record<string, unknown>) =>
  soft<Layout[]>(
    () =>
      supabase
        .from("layouts")
        .upsert(
          { user_id: userId, name: name.slice(0, 40), state, updated_at: new Date().toISOString() },
          { onConflict: "user_id,name" },
        )
        .select("id,name,state"),
    [],
  );

/* ── alerts ──────────────────────────────────────────────────────────────── */

export const listAlerts = (userId: string) =>
  soft<Alert[]>(
    () =>
      supabase
        .from("alerts")
        .select("id,kind,symbol,filer,threshold,schedule,note,active,triggered_at")
        .eq("user_id", userId)
        .eq("active", true),
    [],
  );

export const insertAlert = (
  userId: string,
  alert: {
    kind: string;
    symbol?: string;
    filer?: string;
    threshold?: number;
    schedule?: string;
    note?: string;
  },
) =>
  soft<Alert[]>(
    () =>
      supabase
        .from("alerts")
        .insert({
          user_id: userId,
          kind: alert.kind,
          symbol: alert.symbol?.toUpperCase() ?? null,
          filer: alert.filer ?? null,
          threshold: alert.threshold ?? null,
          schedule: alert.schedule ?? null,
          note: alert.note ?? null,
        })
        .select("id,kind,symbol,filer,threshold,schedule,note,active,triggered_at"),
    [],
  );

export const cancelAlert = (id: string) =>
  soft<unknown[]>(
    () => supabase.from("alerts").update({ active: false }).eq("id", id).select("id"),
    [],
  );
