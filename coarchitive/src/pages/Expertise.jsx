import React, { useState } from "react";
import { Plus } from "lucide-react";
import { PageHero } from "../components/UI.jsx";
import { Reveal } from "../components/Motion.jsx";
import { T, EImg } from "../content/Editable.jsx";
import { useContent } from "../content/ContentContext.jsx";
import { EXPERTISE } from "../data.js";

export default function Expertise() {
  const { getValue } = useContent();
  const [active, setActive] = useState(0);
  // the picture stays on the last opened discipline when everything is closed
  const [shown, setShown] = useState(0);

  const toggle = (i) => {
    setActive(active === i ? -1 : i);
    setShown(i);
  };

  return (
    <>
      <PageHero
        ek="hero.expertise"
        eyebrow="Expertise"
        title="One practice. *Many disciplines.*"
        lede="Eight verticals that are staffed as one team. Most of our work sits where two or three of them overlap."
        meta={["08 verticals", "Staffed as one team", "Concept → operation"]}
      />

      <section className="sec split">
        <div className="split-media" aria-hidden="true">
          <div className="split-frame">
            {EXPERTISE.map((e, i) => (
              <img
                key={e.slug}
                src={getValue(`expertise.${e.slug}.img`, e.img)}
                alt=""
                loading={i ? "lazy" : "eager"}
                decoding="async"
                className={i === shown ? "on" : ""}
              />
            ))}
            <span className="split-no">
              {EXPERTISE[shown].no}
              <i> / {String(EXPERTISE.length).padStart(2, "0")}</i>
            </span>
          </div>
        </div>

        <div className="acc">
          {EXPERTISE.map((e, i) => {
            const on = active === i;
            return (
              <Reveal key={e.slug} className={on ? "acc-item on" : "acc-item"} delay={i * 50}>
                <button
                  type="button"
                  className="acc-row"
                  id={`acc-${e.slug}`}
                  aria-expanded={on}
                  aria-controls={`acc-p-${e.slug}`}
                  onClick={() => toggle(i)}
                  onPointerEnter={() => setShown(i)}
                >
                  <span className="acc-no">{e.no}</span>
                  <T as="strong" k={`expertise.${e.slug}.title`} markup={false}>
                    {e.title}
                  </T>
                  <Plus size={20} />
                </button>
                <div className="acc-panel" id={`acc-p-${e.slug}`} role="region" aria-labelledby={`acc-${e.slug}`}>
                  <div>
                    <T as="p" k={`expertise.${e.slug}.short`} markup={false} className="acc-short">
                      {e.short}
                    </T>
                    <T as="p" k={`expertise.${e.slug}.body`} markup={false} multiline>
                      {e.body}
                    </T>
                    <EImg k={`expertise.${e.slug}.img`} src={e.img} alt="" loading="lazy" decoding="async" className="acc-inline" />
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>
    </>
  );
}
