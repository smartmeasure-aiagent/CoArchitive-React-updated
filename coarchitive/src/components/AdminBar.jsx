// Floating control shown to a logged-in admin on every page. Toggles Edit mode
// and shows save status. Hidden entirely for ordinary visitors.

import React, { useEffect } from "react";
import { useContent } from "../content/ContentContext.jsx";
import { navigate } from "../router.jsx";

export default function AdminBar() {
  const { isAdmin, editing, setEditing, status, signOut } = useContent();

  // reflect edit mode on <html> so edit-only CSS can scope to it
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("coa-editing", Boolean(editing));
    return () => root.classList.remove("coa-editing");
  }, [editing]);

  if (!isAdmin) return null;

  return (
    <div className="coa-adminbar" role="region" aria-label="Admin controls">
      <b className="coa-hide-sm">Admin</b>
      <label className={editing ? "coa-toggle on" : "coa-toggle"}>
        <input
          type="checkbox"
          checked={editing}
          onChange={(e) => setEditing(e.target.checked)}
          style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
        />
        <span className="coa-switch" aria-hidden="true" />
        <span>{editing ? "Editing" : "Edit mode"}</span>
      </label>

      {status.state !== "idle" && (
        <span className={`coa-status ${status.state}`} aria-live="polite">
          {status.message}
        </span>
      )}

      <span className="coa-sep coa-hide-sm" />
      <a
        className="coa-link coa-hide-sm"
        href="#/home"
        onClick={(e) => {
          e.preventDefault();
          navigate("home");
        }}
      >
        View site
      </a>
      <span className="coa-sep" />
      <button
        type="button"
        className="coa-link"
        onClick={async () => {
          await signOut();
          navigate("admin");
        }}
      >
        Log out
      </button>
    </div>
  );
}
