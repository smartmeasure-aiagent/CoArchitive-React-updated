import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, X } from "lucide-react";
import { Link } from "../router.jsx";
import { T, EImg } from "../content/Editable.jsx";
import { useContent } from "../content/ContentContext.jsx";
import {
  Reveal,
  Counter,
  useScrollProgress,
  usePointerVars,
  finePointer,
  reducedMotion,
} from "./Motion.jsx";

// Build a field key from an optional edit-key base. When `ek` is absent the
// component simply renders static (non-editable) content.
const key = (ek, ...parts) => (ek ? [ek, ...parts].join(".") : null);

const pad2 = (n) => String(n).padStart(2, "0");

// "*word*" in copy is set in the italic accent face
export const emphasise = (text) =>
  text.split(/(\*[^*]+\*)/).map((part, i) =>
    part.startsWith("*") ? <em key={i}>{part.slice(1, -1)}</em> : part
  );

const plain = (text) => text.replace(/\*/g, "");

// Splits copy into words, keeping track of which ones sit inside *…*.
function words(text) {
  const out = [];
  text.split(/(\*[^*]+\*)/).forEach((part) => {
    const em = part.startsWith("*");
    (em ? part.slice(1, -1) : part).split(/\s+/).filter(Boolean).forEach((w) => out.push({ w, em }));
  });
  return out;
}

// ---------- contour-line background ----------

export function Contours({ className = "", count = 10, cx = 1200, cy = 420, base = 70, step = 46, seed = 1.7 }) {
  const paths = useMemo(() => {
    const list = [];
    for (let k = 0; k < count; k++) {
      const r0 = base + k * step;
      const pts = [];
      for (let a = 0; a <= 64; a++) {
        const t = (a / 64) * Math.PI * 2;
        const wob = Math.sin(t * 3 + seed + k * 0.35) * 0.07 + Math.sin(t * 5 - seed * 0.6 + k * 0.2) * 0.035;
        const r = r0 * (1 + wob);
        pts.push(`${(cx + Math.cos(t) * r * 1.25).toFixed(1)},${(cy + Math.sin(t) * r).toFixed(1)}`);
      }
      list.push("M" + pts.join("L") + "Z");
    }
    return list;
  }, [count, cx, cy, base, step, seed]);

  return (
    <svg className={`contours ${className}`} viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {paths.map((d, i) => (
        <path key={i} d={d} pathLength="1" style={{ "--i": i }} />
      ))}
    </svg>
  );
}

// ---------- page hero ----------

// Dark band with the header floating over it. With `img` the copy sits on a
// photograph (`half` keeps it shorter); without, drawn contour lines fill it.
// `meta` is an optional row of short facts along the bottom edge.
export function PageHero({ eyebrow, title, lede, img, half, meta, ek }) {
  const ref = useRef(null);
  useScrollProgress(ref);
  const { editing, getValue } = useContent();
  const titleV = getValue(key(ek, "title"), title);
  const list = words(titleV);
  const cls = ["phero", img ? "has-img" : "plain", half && "half"].filter(Boolean).join(" ");

  return (
    <section className={cls} ref={ref}>
      {img ? (
        <>
          <div className="phero-img">
            <EImg k={key(ek, "img")} src={img} alt="" fetchpriority="high" decoding="async" />
          </div>
          <div className="phero-scrim" />
        </>
      ) : (
        <Contours className="phero-contours" cx={1260} cy={380} count={9} seed={eyebrow.length * 0.7} />
      )}

      <div className="phero-body">
        <T as="span" k={key(ek, "eyebrow")} markup={false} className="eyebrow in-up" style={{ "--d": "60ms" }}>
          {eyebrow}
        </T>
        {editing && ek ? (
          <h1>
            <T as="span" k={key(ek, "title")}>
              {title}
            </T>
          </h1>
        ) : (
          <h1 aria-label={plain(titleV)}>
            {list.map(({ w, em }, i) => (
              <React.Fragment key={i}>
                {i > 0 && " "}
                <span className="word" aria-hidden="true">
                  <span style={{ "--d": `${140 + i * 55}ms` }}>{em ? <em>{w}</em> : w}</span>
                </span>
              </React.Fragment>
            ))}
          </h1>
        )}
        {lede && (
          <T as="p" k={key(ek, "lede")} markup={false} multiline className="in-up" style={{ "--d": `${320 + list.length * 55}ms` }}>
            {lede}
          </T>
        )}
      </div>

      {meta && (
        <div className="phero-meta in-up" style={{ "--d": `${480 + list.length * 55}ms` }}>
          {meta.map((m, i) => (
            <T as="span" key={i} k={key(ek, "meta", i)} markup={false}>
              {m}
            </T>
          ))}
        </div>
      )}
    </section>
  );
}

// ---------- section heading ----------

export function SectionHead({ kicker, title, link, linkLabel, ek }) {
  return (
    <div className="shead">
      <Reveal>
        {kicker && (
          <T as="span" k={key(ek, "kicker")} markup={false} className="eyebrow">
            {kicker}
          </T>
        )}
        <T as="h2" k={key(ek, "title")}>
          {title}
        </T>
      </Reveal>
      {link && (
        <Reveal delay={120}>
          <Link to={link} className="text-link">
            <T as="span" k={key(ek, "linkLabel")} markup={false}>
              {linkLabel}
            </T>{" "}
            <ArrowRight size={16} />
          </Link>
        </Reveal>
      )}
    </div>
  );
}

// ---------- card ----------

// The photo settles in as the card enters, and a "View" label trails the
// cursor over it on mouse devices.
export function Card({ to, img, category, meta, title, blurb, size = "", delay = 0, ek }) {
  const media = useRef(null);
  usePointerVars(media);
  return (
    <Reveal className={`card-cell ${size}`} delay={delay}>
      <Link to={to} className="card">
        <div className="card-media" ref={media}>
          <EImg k={key(ek, "img")} className="card-img" src={img} alt="" loading="lazy" decoding="async" />
          <span className="card-cursor" aria-hidden="true">
            View
          </span>
        </div>
        <div className="card-body">
          <span className="card-cat">
            <T as="span" k={key(ek, "category")} markup={false}>
              {category}
            </T>
            {meta ? <em>{meta}</em> : null}
          </span>
          <T as="h3" k={key(ek, "title")} markup={false}>
            {title}
          </T>
          {blurb && (
            <T as="p" k={key(ek, "blurb")} markup={false}>
              {blurb}
            </T>
          )}
          <span className="card-go">
            Learn more <ArrowUpRight size={16} />
          </span>
        </div>
      </Link>
    </Reveal>
  );
}

// Dark tile that fills the last slot of a three-column feed when the final
// row would otherwise have one card missing.
export function FeedCta({ count, kicker, title, to, label, delay = 0, ek }) {
  if (count % 3 !== 2) return null;
  return (
    <Reveal className="card-cell feed-cta-cell" delay={delay}>
      <Link to={to} className="feed-cta">
        <T as="span" k={key(ek, "kicker")} markup={false} className="eyebrow">
          {kicker}
        </T>
        <T as="strong" k={key(ek, "title")}>
          {title}
        </T>
        <em>
          <T as="span" k={key(ek, "label")} markup={false}>
            {label}
          </T>{" "}
          <ArrowUpRight size={16} />
        </em>
      </Link>
    </Reveal>
  );
}

// ---------- stats ----------

// Whole numbers (optionally with a trailing +) count up; anything else, such
// as a symbol, is shown as written.
export function Stats({ items, ek }) {
  const { editing, getValue } = useContent();
  return (
    <div className="stats">
      {items.map(([n, label], i) => {
        const nV = getValue(key(ek, i, "0"), n);
        const m = /^(\d+)(\+?)$/.exec(nV);
        return (
          <Reveal key={i} delay={i * 90}>
            {editing && ek ? (
              <T as="b" k={key(ek, i, "0")} markup={false}>
                {n}
              </T>
            ) : (
              <b>{m ? <Counter to={Number(m[1])} pad={m[1].length} suffix={m[2]} /> : nV}</b>
            )}
            <T as="span" k={key(ek, i, "1")} markup={false}>
              {label}
            </T>
          </Reveal>
        );
      })}
    </div>
  );
}

// ---------- principles ----------

export function Principles({ items, ek }) {
  return (
    <div className="values">
      {items.map(([t, d], i) => (
        <Reveal key={i} className="value" delay={i * 90}>
          <span className="value-no">{pad2(i + 1)}</span>
          <T as="h4" k={key(ek, i, "0")} markup={false}>
            {t}
          </T>
          <T as="p" k={key(ek, i, "1")} markup={false}>
            {d}
          </T>
        </Reveal>
      ))}
    </div>
  );
}

// ---------- service cards ----------

// Photo, number, name and one line for each service.
export function ServiceGrid({ items, ek }) {
  return (
    <div className="svc-grid">
      {items.map((it, i) => (
        <Reveal as="article" key={i} className="svc" delay={(i % 3) * 90}>
          <div className="svc-img">
            <EImg k={key(ek, i, "img")} src={it.img} alt="" loading="lazy" decoding="async" />
          </div>
          <span className="svc-no">{pad2(i + 1)}</span>
          <T as="h3" k={key(ek, i, "title")} markup={false}>
            {it.title}
          </T>
          <T as="p" k={key(ek, i, "body")} markup={false}>
            {it.body}
          </T>
        </Reveal>
      ))}
    </div>
  );
}

// ---------- consultation pop-up ----------

// Drop <ConsultPopup /> after a page's services: once that point scrolls into
// view a card slides in inviting a consultation. Closing it keeps it closed for
// the rest of the visit.
const POPUP_KEY = "consult-popup-closed";

export function ConsultPopup() {
  const mark = useRef(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let closed = false;
    try {
      closed = sessionStorage.getItem(POPUP_KEY) === "1";
    } catch {}
    const el = mark.current;
    if (closed || !el || !("IntersectionObserver" in window)) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setOpen(true);
        obs.disconnect();
      }
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const close = () => {
    setOpen(false);
    try {
      sessionStorage.setItem(POPUP_KEY, "1");
    } catch {}
  };

  return (
    <>
      <div ref={mark} aria-hidden="true" />
      <aside className={open ? "consult on" : "consult"} aria-hidden={!open} aria-label="Book a consultation">
        <button type="button" className="consult-x" aria-label="Close" onClick={close} tabIndex={open ? 0 : -1}>
          <X size={16} />
        </button>
        <span className="eyebrow">Start your journey with us</span>
        <strong>
          Let’s design <em>together.</em>
        </strong>
        <Link to="contact" className="btn-lg" onClick={close} tabIndex={open ? 0 : -1}>
          Book a consultation <ArrowRight size={18} />
        </Link>
      </aside>
    </>
  );
}

// ---------- about story ----------

// The client's About Us text, kept line for line. `link` adds a "read more"
// under it (used on Home, where the full About page is one click away).
export function AboutStory({ story, link, ek }) {
  return (
    <section className="sec two-col story">
      <Reveal className="two-col-head">
        <T as="span" k={key(ek, "eyebrow")} markup={false} className="eyebrow">
          About us
        </T>
        <T as="h2" k={key(ek, "heading")}>
          To bring cities, systems, people and ideas *closer together.*
        </T>
      </Reveal>
      <div className="prose">
        {story.stanzas.map((lines, i) => (
          <Reveal as="p" key={i} delay={i * 90}>
            <T as="span" k={key(ek, "stanza", i)} markup={false} multiline>
              {lines.join("\n")}
            </T>
          </Reveal>
        ))}
        <Reveal as="p" className="story-motto">
          <T as="span" k={key(ek, "motto")} markup={false}>
            {story.motto}
          </T>
        </Reveal>
        <Reveal as="p">
          <T as="span" k={key(ek, "closing")} markup={false}>
            {story.closing}
          </T>
        </Reveal>
        {link && (
          <Reveal>
            <Link to={link} className="text-link">
              More about us <ArrowRight size={16} />
            </Link>
          </Reveal>
        )}
      </div>
    </section>
  );
}

// ---------- scroll statement ----------

// A pinned sentence whose words brighten one by one as the page scrolls.
export function ScrollStatement({ id, kicker, text, dark, ek }) {
  const ref = useRef(null);
  useScrollProgress(ref, "pinned");
  const { editing, getValue } = useContent();
  const textV = getValue(key(ek, "text"), text);
  const list = words(textV);
  return (
    <section id={id} className={dark ? "stmt dark" : "stmt"} ref={ref} style={{ "--n": list.length }}>
      <div className="stmt-stage">
        <div className="stmt-inner">
          <T as="span" k={key(ek, "kicker")} markup={false} className="eyebrow">
            {kicker}
          </T>
          {editing && ek ? (
            <p className="stmt-text">
              <T as="span" k={key(ek, "text")}>
                {text}
              </T>
            </p>
          ) : (
            <p className="stmt-text">
              {list.map(({ w, em }, i) => (
                <span key={i} style={{ "--i": i }}>
                  {em ? <em>{w}</em> : w}{" "}
                </span>
              ))}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

// ---------- hover list ----------

// Rows that reveal a photograph trailing the cursor (mouse only). Each item:
// { title, meta, img, to } for an internal link, { …, href } for mailto etc.
// or { …, onSelect } to handle the click in the page (e.g. open a dialog).
export function HoverList({ items, ek }) {
  const wrap = useRef(null);
  const float = useRef(null);
  const [active, setActive] = useState(-1);

  useEffect(() => {
    const el = wrap.current;
    const f = float.current;
    if (!finePointer() || reducedMotion()) return;
    let x = 0, y = 0, tx = 0, ty = 0, raf = 0, started = false;
    // eased follow, so the image lags the cursor slightly
    const loop = () => {
      x += (tx - x) * 0.16;
      y += (ty - y) * 0.16;
      f.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.5 ? requestAnimationFrame(loop) : 0;
    };
    const move = (e) => {
      const r = el.getBoundingClientRect();
      tx = e.clientX - r.left;
      ty = e.clientY - r.top;
      if (!started) {
        x = tx;
        y = ty;
        started = true;
      }
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const leave = () => (started = false);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="hlist" ref={wrap} onPointerLeave={() => setActive(-1)}>
      <div className="hlist-float" ref={float} aria-hidden="true">
        <div className={active >= 0 ? "hlist-frame on" : "hlist-frame"}>
          {items.map((it, i) => (
            <img key={it.title} src={it.img} alt="" loading="lazy" decoding="async" className={i === active ? "on" : ""} />
          ))}
        </div>
      </div>

      {items.map((it, i) => {
        const inner = (
          <>
            <span className="hlist-no">{pad2(i + 1)}</span>
            <T as="h3" k={key(ek, i, "title")} markup={false}>
              {it.title}
            </T>
            <T as="span" k={key(ek, i, "meta")} markup={false} className="hlist-meta">
              {it.meta}
            </T>
            <ArrowUpRight className="hlist-go" size={20} />
          </>
        );
        const props = { className: "hlist-row", onPointerEnter: () => setActive(i) };
        return (
          <Reveal key={i} delay={i * 70}>
            {it.onSelect ? (
              <button type="button" onClick={it.onSelect} {...props}>
                {inner}
              </button>
            ) : it.href ? (
              <a href={it.href} {...props}>
                {inner}
              </a>
            ) : (
              <Link to={it.to} {...props}>
                {inner}
              </Link>
            )}
          </Reveal>
        );
      })}
    </div>
  );
}

// ---------- filter chips ----------

export function Filters({ options, value, onChange, count }) {
  return (
    <div className="filters" role="group" aria-label="Filter">
      {options.map((f) => (
        <button key={f} type="button" className={value === f ? "chip on" : "chip"} aria-pressed={value === f} onClick={() => onChange(f)}>
          {f}
        </button>
      ))}
      <span className="count" aria-live="polite">
        {count}
      </span>
    </div>
  );
}
