import React from "react";
import { PageHero, SectionHead, Principles, ScrollStatement, ServiceGrid, ConsultPopup } from "../components/UI.jsx";
import { PLANNING_SERVICES, GIS_SERVICES, TRANSPORT_SERVICES, SOFTWARE } from "../data.js";

export default function Planning() {
  return (
    <>
      <PageHero
        ek="hero.planning"
        eyebrow="Planning"
        title="Cities and regions planned *as one system.*"
        lede="Urban and regional planning, GIS and transportation brought together — so growth, land and movement are decided as one."
        img="https://images.unsplash.com/photo-1717700299581-c2fc3fad4ee8?auto=format&fit=crop&w=2200&q=85"
        meta={["Urban & regional planning", "GIS & spatial mapping", "Transportation"]}
      />

      <ScrollStatement
        ek="planning.statement"
        kicker="Why planning"
        text="Good places are not accidents. They are *planned* — with people, nature and infrastructure in the same frame."
      />

      <section className="sec">
        <SectionHead ek="planning.svc.head" kicker="Planning services" title="From local area *to region*" link="contact" linkLabel="Book a consultation" />
        <ServiceGrid ek="planning.svc" items={PLANNING_SERVICES} />
      </section>

      <section className="sec grey">
        <SectionHead ek="planning.gis.head" kicker="GIS & spatial" title="Decisions built *on the map*" />
        <ServiceGrid ek="planning.gis" items={GIS_SERVICES} />
      </section>

      <section className="sec">
        <SectionHead ek="planning.transport.head" kicker="Transportation services" title="Movement designed *as a network*" />
        <ServiceGrid ek="planning.transport" items={TRANSPORT_SERVICES} />
        <ConsultPopup />
      </section>

      <section className="sec grey">
        <SectionHead ek="planning.software.head" kicker="Software expertise" title="Tools we *model with*" />
        <Principles ek="planning.software" items={SOFTWARE} />
      </section>
    </>
  );
}
