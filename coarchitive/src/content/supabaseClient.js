// Supabase connection for the editable-content system.
//
// Configuration comes from Vite env vars (see .env.example). If they are not
// set, SUPABASE_READY is false and the whole site runs exactly as before —
// defaults only, no admin. This keeps local builds working before Supabase is
// wired up, and means a missing/incorrect key can never take the site down.

import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const SUPABASE_READY = Boolean(url && anonKey);

export const supabase = SUPABASE_READY ? createClient(url, anonKey) : null;

// Table that stores content overrides (one row per editable field).
export const CONTENT_TABLE = "site_content";

// Public Storage bucket that holds admin-uploaded images.
export const IMAGE_BUCKET = "site-images";
