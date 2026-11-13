import React from "react";
import { PageHero, SectionHead, Principles, ServiceGrid, ConsultPopup } from "../components/UI.jsx";
import { Reveal } from "../components/Motion.jsx";
import { T, EImg } from "../content/Editable.jsx";
import { ARCH_SERVICES, ARCH_PHILOSOPHY, ARCH_IDEAS, RESIDENTIAL_PROJECTS, VASTU, INTERIOR } from "../data.js";

// Photo with the project's status revealed on hover (always shown on touch).
function Project({ ek, title, location, status, body, img, delay }) {
  return (
    <Reveal as="article" className="proj" delay={delay}>
      <div className="proj-img">
        <EImg k={`${ek}.img`} src={img} alt={title} loading="lazy" decoding="async" />
        <span className={status === "Completed" ? "proj-status done" : "proj-status"}>
          <T as="span" k={`${ek}.status`} markup={false}>
            {status}
          </T>
        </span>
      </div>
      <T as="h3" k={`${ek}.title`} markup={false}>
        {title}
      </T>
      {location && (
        <T as="span" k={`${ek}.location`} markup={false} className="proj-loc">
          {location}
        </T>
      )}
      <T as="p" k={`${ek}.body`} markup={false}>
        {body}
      </T>
    </Reveal>
  );
}

function TwoCol({ ek, kicker, title, children }) {
  return (
    <div className="two-col">
      <Reveal className="two-col-head">
        <T as="span" k={`${ek}.kicker`} markup={false} className="eyebrow">
          {kicker}
        </T>
        <T as="h2" k={`${ek}.title`}>
          {title}
        </T>
      </Reveal>
      <div className="prose">{children}</div>
    </div>
  );
}

export default function Architecture() {
  return (
    <>
      <PageHero
        ek="hero.architecture"
        eyebrow="Architecture"
        title="Spaces designed for people, *built for tomorrow.*"
        lede="Architecture that responds to climate, context and the people who use it — from a single home to a complete development."
        img="https://images.unsplash.com/photo-1789303225087-8307ece66da3?auto=format&fit=crop&w=2200&q=85"
        meta={["Residential · Vastu · Interior", "Climate-responsive design", "Concept → turnkey"]}
      />

      <section className="sec">
        <TwoCol
          ek="arch.philosophy.head"
          kicker="What architecture means to us"
          title="Buildings that give back — to people, place *and climate.*"
        >
          {ARCH_PHILOSOPHY.map((para, i) => (
            <Reveal as="p" key={i} delay={i * 90}>
              <T as="span" k={`arch.philosophy.${i}`} markup={false} multiline>
                {para}
              </T>
            </Reveal>
          ))}
        </TwoCol>
      </section>

      <section className="sec grey">
        <SectionHead ek="arch.ideas.head" kicker="Ideas we build with" title="Sustainable by *design, not by add-on*" />
        <Principles ek="arch.ideas" items={ARCH_IDEAS} />
      </section>

      <section className="sec" id="residential">
        <SectionHead ek="arch.residential.head" kicker="Residential" title="Homes we have *designed*" link="contact" linkLabel="Plan your home" />
        <div className="proj-grid">
          {RESIDENTIAL_PROJECTS.map((p, i) => (
            <Project key={i} ek={`arch.residential.${i}`} {...p} delay={i * 90} />
          ))}
        </div>
      </section>

      <section className="sec grey" id="vastu">
        <TwoCol
          ek="arch.vastu.head"
          kicker="Vastu"
          title="Tradition and good design, *in the same plan.*"
        >
          {VASTU.intro.map((para, i) => (
            <Reveal as="p" key={i} delay={i * 90}>
              <T as="span" k={`arch.vastu.intro.${i}`} markup={false} multiline>
                {para}
              </T>
            </Reveal>
          ))}
        </TwoCol>
        <div className="arch-points">
          <Principles ek="arch.vastu.points" items={VASTU.points} />
        </div>
      </section>

      <section className="sec" id="interior">
        <TwoCol
          ek="arch.interior.head"
          kicker="Interior"
          title="The building's idea, *carried inside.*"
        >
          <Reveal as="p">
            <T as="span" k="arch.interior.intro" markup={false} multiline>
              {INTERIOR.intro}
            </T>
          </Reveal>
        </TwoCol>
        <div className="int-gallery">
          {INTERIOR.gallery.map((src, i) => (
            <Reveal key={i} variant="clip" delay={i * 90}>
              <EImg k={`arch.interior.gallery.${i}`} src={src} alt="" loading="lazy" decoding="async" />
            </Reveal>
          ))}
        </div>
        <Principles ek="arch.interior.points" items={INTERIOR.points} />
      </section>

      <section className="sec grey">
        <SectionHead ek="arch.services.head" kicker="Architectural services" title="From first plan *to final render*" link="contact" linkLabel="Book a consultation" />
        <ServiceGrid ek="arch.services" items={ARCH_SERVICES} />
        <ConsultPopup />
      </section>
    </>
  );
}
