// ---------------------------------------------------------------------------
// Editable-content store.
//
// The whole site reads its text and images through this context. Every editable
// field has a stable string key. Code ships the *default* value; an admin can
// override it, and the override is stored in Supabase and shown to every
// visitor. If a key has no override, the default is used — so the site always
// works, even with an empty database.
//
//   getValue(key, fallback)  -> current text/url (override or default)
//   setValue(key, value)     -> save an override (admins only)
//   clearValue(key)          -> remove an override, revert to the default
//   uploadImage(file)        -> upload to Storage, returns a public URL
//
// Auth is Supabase email/password. Anyone with a login is treated as an admin.
// ---------------------------------------------------------------------------

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  supabase,
  SUPABASE_READY,
  CONTENT_TABLE,
  IMAGE_BUCKET,
} from "./supabaseClient.js";

const ContentContext = createContext(null);

const EDIT_PREF_KEY = "coa-admin-editing";

export function ContentProvider({ children }) {
  // map of key -> override value (text string or image URL)
  const [overrides, setOverrides] = useState({});
  const [loaded, setLoaded] = useState(!SUPABASE_READY);
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(!SUPABASE_READY);
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState({ state: "idle", message: "" }); // idle | saving | saved | error

  const statusTimer = useRef(null);

  // ---- initial load of every override ----
  useEffect(() => {
    if (!SUPABASE_READY) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase.from(CONTENT_TABLE).select("key,value");
      if (cancelled) return;
      if (!error && Array.isArray(data)) {
        const map = {};
        for (const row of data) map[row.key] = row.value;
        setOverrides(map);
      } else if (error) {
        // A missing table or RLS problem shouldn't break the site — just log.
        console.warn("[content] could not load overrides:", error.message);
      }
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // ---- auth session ----
  useEffect(() => {
    if (!SUPABASE_READY) return;
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setSession(data?.session ?? null);
      setAuthReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s ?? null);
    });
    return () => {
      cancelled = true;
      sub?.subscription?.unsubscribe();
    };
  }, []);

  const isAdmin = Boolean(session?.user);

  // restore edit-mode preference once the admin is known
  useEffect(() => {
    if (!isAdmin) {
      setEditing(false);
      return;
    }
    try {
      setEditing(localStorage.getItem(EDIT_PREF_KEY) === "1");
    } catch {}
  }, [isAdmin]);

  const setEditingPref = useCallback((on) => {
    setEditing(on);
    try {
      localStorage.setItem(EDIT_PREF_KEY, on ? "1" : "0");
    } catch {}
  }, []);

  // ---- status helper ----
  const flash = useCallback((state, message) => {
    setStatus({ state, message });
    if (statusTimer.current) clearTimeout(statusTimer.current);
    if (state === "saved") {
      statusTimer.current = setTimeout(() => setStatus({ state: "idle", message: "" }), 1800);
    }
  }, []);

  // ---- read ----
  const getValue = useCallback(
    (key, fallback) => {
      const v = overrides[key];
      return v === undefined || v === null ? fallback : v;
    },
    [overrides]
  );

  // ---- write ----
  const setValue = useCallback(
    async (key, value) => {
      // optimistic local update so edits feel instant
      setOverrides((prev) => ({ ...prev, [key]: value }));
      if (!SUPABASE_READY) {
        flash("error", "Supabase is not configured — change not saved.");
        return { ok: false };
      }
      flash("saving", "Saving…");
      const { error } = await supabase
        .from(CONTENT_TABLE)
        .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
      if (error) {
        flash("error", error.message || "Could not save");
        return { ok: false, error };
      }
      flash("saved", "Saved");
      return { ok: true };
    },
    [flash]
  );

  const clearValue = useCallback(
    async (key) => {
      setOverrides((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      if (!SUPABASE_READY) return { ok: false };
      flash("saving", "Resetting…");
      const { error } = await supabase.from(CONTENT_TABLE).delete().eq("key", key);
      if (error) {
        flash("error", error.message || "Could not reset");
        return { ok: false, error };
      }
      flash("saved", "Reset to default");
      return { ok: true };
    },
    [flash]
  );

  // ---- image upload ----
  const uploadImage = useCallback(async (file) => {
    if (!SUPABASE_READY) return { ok: false, error: "Supabase not configured" };
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
    const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    flash("saving", "Uploading image…");
    const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(path, file, {
      cacheControl: "31536000",
      upsert: false,
      contentType: file.type || undefined,
    });
    if (error) {
      flash("error", error.message || "Upload failed");
      return { ok: false, error: error.message };
    }
    const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path);
    flash("saved", "Image uploaded");
    return { ok: true, url: data.publicUrl };
  }, [flash]);

  // ---- auth actions ----
  const signIn = useCallback(async (email, password) => {
    if (!SUPABASE_READY) return { ok: false, error: "Supabase not configured" };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? { ok: false, error: error.message } : { ok: true };
  }, []);

  const signOut = useCallback(async () => {
    setEditingPref(false);
    if (SUPABASE_READY) await supabase.auth.signOut();
  }, [setEditingPref]);

  const value = useMemo(
    () => ({
      ready: SUPABASE_READY,
      loaded,
      authReady,
      isAdmin,
      session,
      editing: isAdmin && editing,
      setEditing: setEditingPref,
      status,
      getValue,
      setValue,
      clearValue,
      uploadImage,
      signIn,
      signOut,
    }),
    [
      loaded,
      authReady,
      isAdmin,
      session,
      editing,
      setEditingPref,
      status,
      getValue,
      setValue,
      clearValue,
      uploadImage,
      signIn,
      signOut,
    ]
  );

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error("useContent must be used inside <ContentProvider>");
  return ctx;
}
