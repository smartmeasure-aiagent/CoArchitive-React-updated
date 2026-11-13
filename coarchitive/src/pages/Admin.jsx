// The /#/admin console: configuration help, login, or a short "you're in" panel.

import React, { useState } from "react";
import { useContent } from "../content/ContentContext.jsx";
import { navigate } from "../router.jsx";

export default function Admin() {
  const { ready, authReady, isAdmin, signIn, setEditing } = useContent();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  // --- Supabase not configured yet ---
  if (!ready) {
    return (
      <div className="coa-admin-page">
        <div className="coa-admin-card">
          <h1>Admin setup</h1>
          <p className="sub">
            The editable-content backend isn’t connected yet. Create a free Supabase
            project, then add its keys so this site can store your edits.
          </p>
          <div className="coa-admin-note">
            <p>
              1. Create a <code>.env</code> file in the project root with:
            </p>
            <p>
              <code>VITE_SUPABASE_URL=…</code>
              <br />
              <code>VITE_SUPABASE_ANON_KEY=…</code>
            </p>
            <p>
              2. Run the SQL in <code>ADMIN_SETUP.md</code> to create the content table,
              the image bucket and the access rules.
            </p>
            <p>
              3. On your host (Vercel), add the same two variables under Environment
              Variables and redeploy.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --- already logged in ---
  if (isAdmin) {
    return (
      <div className="coa-admin-page">
        <div className="coa-admin-card">
          <h1>You’re signed in</h1>
          <div className="coa-admin-ok">Admin access is active on this browser.</div>
          <p className="coa-admin-note">
            Turn on <strong>Edit mode</strong> and browse the site — click any text to
            rewrite it, or any image to replace it. Changes save instantly and every
            visitor sees them.
          </p>
          <div style={{ height: 18 }} />
          <button
            className="coa-admin-btn"
            onClick={() => {
              setEditing(true);
              navigate("home");
            }}
          >
            Enable Edit mode & open the site
          </button>
        </div>
      </div>
    );
  }

  // --- login form ---
  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    const res = await signIn(email.trim(), password);
    setBusy(false);
    if (!res.ok) {
      setErr(res.error || "Could not sign in.");
      return;
    }
    setEditing(true);
    navigate("home");
  };

  return (
    <div className="coa-admin-page">
      <div className="coa-admin-card">
        <h1>Admin login</h1>
        <p className="sub">Sign in to edit the website’s text and images.</p>
        <form onSubmit={onSubmit}>
          {err && <div className="coa-admin-err">{err}</div>}
          <label htmlFor="adm-email">Email</label>
          <input
            id="adm-email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label htmlFor="adm-pass">Password</label>
          <input
            id="adm-pass"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="coa-admin-btn" type="submit" disabled={busy || !authReady}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
