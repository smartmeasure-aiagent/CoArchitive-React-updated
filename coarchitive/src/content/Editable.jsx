// ---------------------------------------------------------------------------
// Inline-edit primitives.
//
//   <T k="about.hero.title">Default text *italic*</T>   editable text
//   <EImg k="home.why.img" src={defaultUrl} ... />       editable <img>
//   <EBg  k="team.x.photo" layers={[a,b]} .../>          editable background-image box
//
// In normal viewing these render exactly like plain text / images. When an
// admin turns on Edit mode, text becomes click-to-edit and images gain a
// "replace / paste URL" overlay. Everything is keyed by a stable string `k`.
// ---------------------------------------------------------------------------

import React, { useEffect, useRef, useState } from "react";
import { useContent } from "./ContentContext.jsx";

// "*word*" -> italic accent, matching the rest of the site.
function emphasise(text) {
  if (typeof text !== "string") return text;
  return text.split(/(\*[^*]+\*)/).map((part, i) =>
    part.startsWith("*") && part.endsWith("*") && part.length > 1 ? (
      <em key={i}>{part.slice(1, -1)}</em>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );
}

// value may contain \n for multiline fields.
function renderText(value, { markup, multiline }) {
  let nodes = multiline
    ? value.split("\n").flatMap((line, i) => (i === 0 ? [line] : [<br key={`br${i}`} />, line]))
    : [value];
  if (markup) {
    nodes = value
      .split("\n")
      .flatMap((line, i) => (i === 0 ? emphasise(line) : [<br key={`br${i}`} />, ...emphasise(line)]));
  }
  return nodes;
}

// -------- editable text element (contentEditable) --------
function EditableText({ value, onCommit, Tag, className, style, multiline, title }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (el && el.textContent !== value) el.textContent = value;
  }, [value]);

  const commit = () => {
    const el = ref.current;
    if (!el) return;
    const next = multiline ? el.innerText.replace(/ /g, " ") : el.textContent.replace(/ /g, " ");
    if (next !== value) onCommit(next);
  };

  return (
    <Tag
      ref={ref}
      className={["coa-edit-text", className].filter(Boolean).join(" ")}
      style={style}
      title={title || "Click to edit — *word* = italic"}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        // keep a click from activating a surrounding <a>/<button>; the caret is
        // already placed on mousedown, so this doesn't hurt editing.
        e.stopPropagation();
        e.preventDefault();
      }}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          if (ref.current) ref.current.textContent = value;
          ref.current?.blur();
        }
        if (!multiline && e.key === "Enter") {
          e.preventDefault();
          ref.current?.blur();
        }
      }}
    />
  );
}

export function T({
  k,
  children,
  as = "span",
  markup = true,
  multiline = false,
  className,
  style,
}) {
  const { getValue, setValue, editing } = useContent();
  const fallback = typeof children === "string" ? children : String(children ?? "");
  const value = getValue(k, fallback);
  const Tag = as;

  // No key, or not in edit mode → render plain (and never editable).
  if (!editing || !k) {
    return (
      <Tag className={className} style={style}>
        {renderText(value, { markup, multiline })}
      </Tag>
    );
  }
  return (
    <EditableText
      value={value}
      onCommit={(next) => setValue(k, next)}
      Tag={Tag}
      className={className}
      style={style}
      multiline={multiline}
    />
  );
}

// -------- editable image overlay (shared) --------
function ImageEditOverlay({ k, current }) {
  const { setValue, clearValue, uploadImage } = useContent();
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    const res = await uploadImage(file);
    setBusy(false);
    if (res.ok) {
      await setValue(k, res.url);
      setOpen(false);
    }
  };

  const applyUrl = async () => {
    const u = url.trim();
    if (!u) return;
    await setValue(k, u);
    setUrl("");
    setOpen(false);
  };

  return (
    <div className="coa-edit-img-ui" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        className="coa-edit-img-btn"
        onClick={(e) => {
          e.preventDefault();
          setOpen((v) => !v);
        }}
      >
        {busy ? "Working…" : "✎ Edit image"}
      </button>
      {open && (
        <div className="coa-edit-img-pop" onClick={(e) => e.preventDefault()}>
          <button type="button" className="coa-pop-row" onClick={() => fileRef.current?.click()}>
            ⤴ Upload a file
          </button>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
          <div className="coa-pop-url">
            <input
              type="text"
              value={url}
              placeholder="Paste image URL"
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  applyUrl();
                }
              }}
            />
            <button type="button" onClick={applyUrl}>
              Set
            </button>
          </div>
          <button
            type="button"
            className="coa-pop-row coa-pop-reset"
            onClick={() => {
              clearValue(k);
              setOpen(false);
            }}
          >
            ↺ Reset to default
          </button>
        </div>
      )}
    </div>
  );
}

// -------- editable <img> --------
export function EImg({ k, src, alt = "", className, style, wrapClassName, ...imgProps }) {
  const { getValue, editing } = useContent();
  const value = getValue(k, src);

  if (!editing || !k) {
    return <img src={value} alt={alt} className={className} style={style} {...imgProps} />;
  }
  return (
    <span className={["coa-edit-img", wrapClassName].filter(Boolean).join(" ")}>
      <img src={value} alt={alt} className={className} style={style} {...imgProps} />
      <ImageEditOverlay k={k} current={value} />
    </span>
  );
}

// -------- editable background-image box --------
// `layers` are CSS background-image url()s stacked top-first. The first layer is
// the editable one (e.g. a portrait), later layers are fallbacks drawn beneath.
export function EBg({ k, layers = [], className, style, role, "aria-label": ariaLabel, children }) {
  const { getValue, editing } = useContent();
  const top = getValue(k, layers[0]);
  const all = [top, ...layers.slice(1)].filter(Boolean);
  const bg = all.map((u) => `url(${u})`).join(", ");
  const merged = { ...style, backgroundImage: bg };

  if (!editing || !k) {
    return (
      <div className={className} style={merged} role={role} aria-label={ariaLabel}>
        {children}
      </div>
    );
  }
  return (
    <div className={["coa-edit-img", className].filter(Boolean).join(" ")} style={merged} role={role} aria-label={ariaLabel}>
      {children}
      <ImageEditOverlay k={k} current={top} />
    </div>
  );
}
