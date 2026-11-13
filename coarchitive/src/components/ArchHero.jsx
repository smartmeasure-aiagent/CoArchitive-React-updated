// Homepage opening animation — scroll-driven.
//
// Plays one of the three delivered architecture scenes (GLB) in a live Three.js
// renderer, with scroll progress scrubbing the baked construction animation —
// the building assembles as you scroll, and a short "quote" for each step
// cross-fades in. Design 1 is the default; an admin can switch to 2 or 3 in
// Edit mode (saved in Supabase for all visitors) and edit every quote in place.
//
// The model loads lazily after the poster paints. Where WebGL is missing the
// matching poster frame stands in with the opening copy.

import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowDown } from "lucide-react";
import { T } from "../content/Editable.jsx";
import { useContent } from "../content/ContentContext.jsx";
import "./arch-hero.css";

export const DESIGNS = [
  { id: "1", name: "Courtyard Atelier", model: "/architecture/models/Architecture-1.glb", poster: "/architecture/01-Poster.jpg" },
  { id: "2", name: "Canopy Residence", model: "/architecture/models/Architecture-2.glb", poster: "/architecture/02-Poster.jpg" },
  { id: "3", name: "Connected Quarter", model: "/architecture/models/Architecture-3.glb", poster: "/architecture/03-Poster.jpg" },
];

// Each step is a quote pinned to a point in the scroll (0 → 1). Copy is the
// courtyard-house story, mapped to the GLB's construction phases.
const STEPS = [
  {
    at: 0.0,
    hero: true,
    rail: "Site",
    eyebrow: "CoArchitive",
    title: "Every place begins as a *line on paper.*",
    body: "CoArchitive plans and designs homes, towns and regions. Scroll to watch one idea become a building.",
  },
  {
    at: 0.26,
    rail: "Frame",
    eyebrow: "Foundation",
    title: "Frame first, *then walls.*",
    body: "Columns and slabs are set out on the plot — measured, checked and ready for sanction.",
  },
  {
    at: 0.5,
    rail: "Structure",
    eyebrow: "Structure",
    title: "Walls, glazing *and light.*",
    body: "Brick walls rise, the upper floor takes shape, and openings are placed for air and daylight.",
  },
  {
    at: 0.74,
    rail: "Finish",
    eyebrow: "Finished",
    title: "A home that *gives back.*",
    body: "A roof and façade, a jali for shade, planting and a terrace garden that cools the floors below.",
  },
  {
    at: 0.96,
    rail: "Place",
    eyebrow: "Connected",
    title: "Part of a *place.*",
    body: "Energy, water and the street around it — the same thinking that scales up to a whole city.",
  },
];

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

function webglOK() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

const jumpTo = (id) => (e) => {
  e.preventDefault();
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
};

function StepCopy({ step, i }) {
  const Title = (
    <T as={step.hero ? "h1" : "h2"} k={`home.hero.step.${i}.title`} className={step.hero ? "d1" : "d2"}>
      {step.title}
    </T>
  );
  return (
    <>
      <T as="span" k={`home.hero.step.${i}.eyebrow`} markup={false} className="eyebrow">
        {step.eyebrow}
      </T>
      {Title}
      <T as="p" k={`home.hero.step.${i}.body`} markup={false} multiline className="lede">
        {step.body}
      </T>
      {step.hero && (
        <>
          <a className="btn tan arch-hero-cta" href="#about" onClick={jumpTo("about")}>
            Explore the practice <ArrowRight size={16} />
          </a>
          <span className="arch-hero-cue mono">
            <i /> Scroll to build
          </span>
        </>
      )}
    </>
  );
}

function VariantPicker({ current, onPick }) {
  return (
    <div className="arch-pick" onClick={(e) => e.stopPropagation()}>
      <span className="arch-pick-label">Homepage animation</span>
      <div className="arch-pick-row">
        {DESIGNS.map((d) => (
          <button
            key={d.id}
            type="button"
            className={d.id === current ? "arch-pick-item on" : "arch-pick-item"}
            onClick={() => onPick(d.id)}
            title={d.name}
          >
            <img src={d.poster} alt="" loading="lazy" />
            <b>{`0${d.id}`}</b>
            <span>{d.name}</span>
          </button>
        ))}
      </div>
      <small>Saved for every visitor</small>
    </div>
  );
}

export default function ArchHero() {
  const { getValue, setValue, editing } = useContent();
  const variant = String(getValue("home.animation.variant", "1"));
  const design = DESIGNS.find((d) => d.id === variant) || DESIGNS[0];

  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const copyRefs = useRef([]);
  const railFill = useRef(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [step, setStep] = useState(0);

  const use3D = webglOK();

  // --- 3D scene + scroll scrubbing ---
  useEffect(() => {
    if (!use3D || editing) return;
    setReady(false);
    setFailed(false);

    let scene = null;
    let alive = true;
    let raf = 0;
    let ro = null;
    let lastStep = -1;

    const sizeIt = () => {
      if (!scene || !sectionRef.current) return;
      const r = sectionRef.current.getBoundingClientRect();
      scene.resize(r.width, Math.min(r.height, window.innerHeight));
    };

    const progress = () => {
      const el = sectionRef.current;
      if (!el) return 0;
      const travel = el.offsetHeight - window.innerHeight;
      const y = window.scrollY - el.offsetTop;
      return clamp(travel > 0 ? y / travel : 0, 0, 1);
    };

    const tick = () => {
      if (!alive) return;
      raf = requestAnimationFrame(tick);
      const p = progress();
      if (scene) scene.setProgress(p);

      // cross-fade each step's copy by proximity to the scroll point
      let nearest = 0;
      let best = 1;
      STEPS.forEach((s, i) => {
        const el = copyRefs.current[i];
        const d = Math.abs(p - s.at);
        if (d < best) {
          best = d;
          nearest = i;
        }
        if (el) {
          const o = clamp(1 - d / 0.11, 0, 1);
          el.style.opacity = String(o * o * (3 - 2 * o)); // smoothstep
          el.style.transform = `translate3d(0, ${(p - s.at) * -70}px, 0)`;
          el.style.pointerEvents = o > 0.6 ? "auto" : "none";
        }
      });
      if (railFill.current) railFill.current.style.transform = `scaleX(${p})`;
      if (nearest !== lastStep) {
        lastStep = nearest;
        setStep(nearest);
      }
    };

    import("../sequence/archScene.js")
      .then(({ createArchScene }) => {
        if (!alive || !canvasRef.current) return;
        scene = createArchScene(canvasRef.current, {});
        sizeIt();
        scene.start();
        scene
          .load(design.model)
          .then(() => alive && setReady(true))
          .catch((err) => {
            console.warn("[arch-hero] model load failed:", err?.message || err);
            alive && setFailed(true);
          });
        ro = new ResizeObserver(sizeIt);
        ro.observe(sectionRef.current);
      })
      .catch((err) => {
        console.warn("[arch-hero] renderer failed:", err?.message || err);
        setFailed(true);
      });

    window.addEventListener("resize", sizeIt, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro?.disconnect();
      window.removeEventListener("resize", sizeIt);
      scene?.dispose();
    };
  }, [design.model, use3D, editing]);

  const showCanvas = use3D && ready && !failed && !editing;

  // --- editing mode: stacked, fully-visible quotes so each can be edited ---
  if (editing) {
    return (
      <section className="arch-hero arch-hero-edit">
        <div className="arch-hero-stage">
          <div className="arch-hero-media" aria-hidden="true">
            <img src={design.poster} alt="" className="arch-hero-poster" style={{ opacity: 1 }} />
            <div className="arch-hero-scrim" />
          </div>
          <div className="arch-hero-editcol">
            {STEPS.map((s, i) => (
              <div key={i} className="arch-hero-copy arch-step-static">
                <StepCopy step={s} i={i} />
              </div>
            ))}
          </div>
          <VariantPicker current={variant} onPick={(id) => setValue("home.animation.variant", id)} />
        </div>
      </section>
    );
  }

  // --- WebGL unavailable: simple poster hero with the opening quote ---
  if (!use3D || failed) {
    return (
      <section className="arch-hero arch-hero-static">
        <div className="arch-hero-media" aria-hidden="true">
          <img src={design.poster} alt="" className="arch-hero-poster" style={{ opacity: 1 }} fetchpriority="high" />
          <div className="arch-hero-scrim" />
        </div>
        <div className="arch-hero-copy">
          <StepCopy step={STEPS[0]} i={0} />
        </div>
      </section>
    );
  }

  // --- the scroll-driven build ---
  return (
    <section className="arch-hero arch-hero-scroll" ref={sectionRef} style={{ "--steps": STEPS.length }}>
      <div className="arch-hero-stage">
        <div className="arch-hero-media" aria-hidden="true">
          <canvas ref={canvasRef} className="arch-hero-canvas" style={{ opacity: showCanvas ? 1 : 0 }} />
          <img
            src={design.poster}
            alt=""
            className="arch-hero-poster"
            style={{ opacity: showCanvas ? 0 : 1 }}
            fetchpriority="high"
            decoding="async"
          />
          <div className="arch-hero-scrim" />
        </div>

        <div className="arch-hero-copywrap">
          {STEPS.map((s, i) => (
            <div
              key={i}
              ref={(el) => (copyRefs.current[i] = el)}
              className="arch-hero-copy arch-step"
              style={{ opacity: i === 0 ? 1 : 0 }}
              aria-hidden={step !== i}
            >
              <StepCopy step={s} i={i} />
            </div>
          ))}
        </div>

        <div className="arch-hero-rail" aria-hidden="true">
          <div className="arch-hero-rail-track">
            <i ref={railFill} />
          </div>
          <ol>
            {STEPS.map((s, i) => (
              <li key={i} className={step === i ? "on" : ""}>
                <b>{`0${i + 1}`}</b>
                <span>{s.rail}</span>
              </li>
            ))}
          </ol>
        </div>

        <button type="button" className="arch-hero-skip" onClick={jumpTo("about")}>
          Skip the build <ArrowDown size={13} />
        </button>
      </div>
    </section>
  );
}
