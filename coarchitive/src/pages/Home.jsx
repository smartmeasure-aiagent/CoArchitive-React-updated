import React, { useState } from "react";
import { ArrowRight, ArrowLeft, Plus, Minus, Check, Copy } from "lucide-react";
import { Link } from "../router.jsx";
import ArchHero from "../components/ArchHero.jsx";
import { Reveal } from "../components/Motion.jsx";
import Logo from "../components/Logo.jsx";
import { IdeaIcon, MarkDiagram } from "../components/Marks.jsx";
import { T, EImg } from "../content/Editable.jsx";
import { useContent } from "../content/ContentContext.jsx";
import {
  ABOUT_STORY,
  ARCH_IDEAS,
  CAREER_WAYS,
  CONTACT,
  DIRECTORS,
  HEAD_OFFICE,
  HELP_WITH,
  HOME_STATS,
  MARK,
  NOTES,
  PRACTICES,
  SAMPLE_PROJECTS,
  TEAM,
  WHY,
} from "../data.js";
import "../home.css";

/* The page tells the practice's story after the build:
   who we are → why we exist → what we do → how we think → what we have drawn
   → who we are made of → what we are writing → how to join → how to start. */

const Head = ({ ek, eyebrow, lines, accent, className = "" }) => (
  <Reveal className={`sec-head ${className}`}>
    {eyebrow && (
      <T as="span" k={`${ek}.eyebrow`} markup={false} className="eyebrow">
        {eyebrow}
      </T>
    )}
    <h2 className="d2">
      <T as="span" k={`${ek}.lines`} markup={false}>
        {lines.join(" ")}
      </T>{" "}
      {accent && (
        <T as="em" k={`${ek}.accent`} markup={false} className="ac">
          {accent}
        </T>
      )}
    </h2>
  </Reveal>
);

/* ------------------------------------------------------------ 01 · about */

function About() {
  return (
    <section className="section h-about" id="about">
      <span className="ghost">About</span>
      <div className="wrap h-about-grid">
        <div>
          <Reveal>
            <T as="span" k="home.about.eyebrow" markup={false} className="eyebrow">
              About CoArchitive
            </T>
          </Reveal>
          <div className="h-story">
            {ABOUT_STORY.stanzas.map((lines, i) => (
              <Reveal as="p" key={i} delay={i * 60} className="body-serif">
                <T as="span" k={`home.about.stanza.${i}`} markup={false} multiline>
                  {lines.join(" ")}
                </T>
              </Reveal>
            ))}
            <Reveal as="p" delay={240} className="body-serif h-motto">
              <em>
                <T as="span" k="home.about.motto" markup={false}>
                  {ABOUT_STORY.motto}
                </T>
              </em>{" "}
              <T as="span" k="home.about.closing" markup={false}>
                {ABOUT_STORY.closing}
              </T>
            </Reveal>
          </div>
        </div>

        <Reveal className="h-mark" delay={120}>
          <T as="span" k="home.mark.label" markup={false} className="mono">
            Our mark
          </T>
          <MarkDiagram />
          <dl>
            {MARK.map(([glyph, title, body], i) => (
              <div key={i}>
                <dt>
                  <i aria-hidden="true">{glyph}</i>
                  <T as="span" k={`home.mark.${i}.title`} markup={false}>
                    {title}
                  </T>
                </dt>
                <T as="dd" k={`home.mark.${i}.body`} markup={false}>
                  {body}
                </T>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- 02 · why */

function Why() {
  return (
    <section className="h-why">
      <Reveal variant="clip" className="h-why-img">
        <EImg k="home.why.img" src={WHY.img} alt="" loading="lazy" decoding="async" />
        <T as="span" k="home.why.caption" markup={false} className="mono h-why-cap">
          {WHY.caption}
        </T>
      </Reveal>
      <div className="h-why-copy on-green">
        <Reveal>
          <T as="span" k="home.why.eyebrow" markup={false} className="eyebrow">
            {WHY.eyebrow}
          </T>
        </Reveal>
        <Reveal as="h2" className="d2" delay={60}>
          <T as="span" k="home.why.head0" markup={false}>
            {WHY.head[0]}
          </T>{" "}
          <em className="ac">
            <T as="span" k="home.why.head1" markup={false}>
              {WHY.head[1]}
            </T>
          </em>
        </Reveal>
        <Reveal as="p" className="lede" delay={120}>
          <T as="span" k="home.why.body" markup={false} multiline>
            {WHY.body}
          </T>
        </Reveal>
        <Reveal delay={180}>
          <a className="btn tan" href="#services" onClick={jump("services")}>
            <T as="span" k="home.why.cta" markup={false}>
              Explore our services
            </T>{" "}
            <ArrowRight size={16} />
          </a>
        </Reveal>
      </div>
    </section>
  );
}

const jump = (id) => (e) => {
  e.preventDefault();
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
};

/* --------------------------------------------------------- 03 · services */

function Services() {
  const [i, setI] = useState(0);
  const p = PRACTICES[i];
  const step = (d) => setI((v) => (v + d + PRACTICES.length) % PRACTICES.length);

  return (
    <section className="section h-services" id="services">
      <span className="ghost">Services</span>
      <div className="wrap">
        <Head ek="home.services" eyebrow="What we do" lines={["Five practices,"]} accent="one team." />
        <Reveal as="p" className="lede h-services-lede" delay={80}>
          <T as="span" k="home.services.lede" markup={false} multiline>
            From a single home to a regional plan. Pick a practice to see the services and the
            tools we use.
          </T>
        </Reveal>

        <div className="h-tabs" role="tablist" aria-label="Practices">
          {PRACTICES.map((t, n) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={n === i}
              className={n === i ? "on" : ""}
              onClick={() => setI(n)}
            >
              <T as="span" k={`practice.${t.key}.tab`} markup={false}>
                {t.tab}
              </T>
            </button>
          ))}
        </div>

        <div className="h-practice" key={p.key}>
          <figure className="h-practice-img">
            <EImg k={`practice.${p.key}.img`} src={p.img} alt="" loading="lazy" decoding="async" />
            <figcaption className="mono">
              <T as="span" k={`practice.${p.key}.tab`} markup={false}>
                {p.tab}
              </T>
            </figcaption>
          </figure>

          <div className="h-practice-copy">
            <T as="h3" k={`practice.${p.key}.title`} markup={false} className="d3">
              {p.title}
            </T>
            <T as="p" k={`practice.${p.key}.body`} markup={false} multiline className="lede">
              {p.body}
            </T>

            <span className="mono h-practice-label">Services</span>
            <ul className="h-service-list">
              {p.services.map((s, si) => {
                const name = typeof s === "string" ? s : s.name;
                const note = typeof s === "string" ? null : s.note;
                return (
                  <li key={si}>
                    <T as="span" k={`practice.${p.key}.svc.${si}`} markup={false}>
                      {name}
                    </T>
                    {note && <i>{note}</i>}
                  </li>
                );
              })}
            </ul>

            <div className="h-practice-actions">
              <Link to="contact" className="btn">
                Book a consultation <ArrowRight size={16} />
              </Link>
              <a className="btn ghost-btn" href="#ideas" onClick={jump("ideas")}>
                Ideas we build with
              </a>
              <div className="h-arrows">
                <button onClick={() => step(-1)} aria-label="Previous practice">
                  <ArrowLeft size={16} />
                </button>
                <button onClick={() => step(1)} aria-label="Next practice">
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ 04 · ideas */

function Ideas() {
  return (
    <section className="section tint h-ideas" id="ideas">
      <span className="ghost">Ideas</span>
      <div className="wrap">
        <Head
          ek="home.ideas"
          eyebrow="What architecture means to us"
          lines={["Buildings that give back,"]}
          accent="to people, place and climate."
        />
        <Reveal as="p" className="lede h-ideas-lede" delay={80}>
          <T as="span" k="home.ideas.lede" markup={false} multiline>
            We design from climate and context first. Orientation, shade, air and local materials
            shape the plan before anything else, so comfort is built into the structure instead of
            added with machines.
          </T>
        </Reveal>

        <div className="h-idea-grid">
          {ARCH_IDEAS.map(([title, body], n) => (
            <Reveal className="h-idea" key={n} delay={n * 50}>
              <IdeaIcon n={n} />
              <T as="h3" k={`home.idea.${n}.title`} markup={false} className="d4">
                {title}
              </T>
              <T as="p" k={`home.idea.${n}.body`} markup={false} multiline>
                {body}
              </T>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------- 05 · projects */

const FILTERS = ["All", "Completed", "Ongoing"];

function Projects() {
  const [f, setF] = useState("All");
  const list = SAMPLE_PROJECTS.filter((p) => f === "All" || p.status === f);

  return (
    <section className="section h-projects" id="projects">
      <span className="ghost">Projects</span>
      <div className="wrap">
        <Head ek="home.projects" eyebrow="Residential" lines={["Homes on the"]} accent="drawing board." />

        <div className="h-chips">
          {FILTERS.map((x) => (
            <button key={x} className={x === f ? "on" : ""} onClick={() => setF(x)}>
              {x}
            </button>
          ))}
        </div>

        <div className="h-proj-grid">
          {list.map((p) => {
            const n = SAMPLE_PROJECTS.indexOf(p);
            return (
              <Reveal className="h-proj" key={n} delay={0}>
                <figure>
                  <EImg k={`home.project.${n}.img`} src={p.img} alt="" loading="lazy" decoding="async" />
                  <span className="h-sample mono">Sample</span>
                  <span className={`h-status mono ${p.status.toLowerCase()}`}>{p.status}</span>
                </figure>
                <T as="h3" k={`home.project.${n}.title`} markup={false} className="d4">
                  {p.title}
                </T>
                <div className="h-proj-meta mono">
                  <T as="span" k={`home.project.${n}.kind`} markup={false}>
                    {p.kind}
                  </T>
                  <T as="span" k={`home.project.${n}.size`} markup={false}>
                    {p.size}
                  </T>
                </div>
                <T as="p" k={`home.project.${n}.body`} markup={false} multiline>
                  {p.body}
                </T>
              </Reveal>
            );
          })}
        </div>

        <Reveal className="h-demo">
          <span className="mono">Demo</span>
          <T as="p" k="home.projects.demo" markup={false} multiline>
            These cards are placeholders with stock images. Real projects, photographs and
            locations replace them.
          </T>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ 06 · stats */

function Stats() {
  return (
    <section className="h-stats">
      <div className="wrap h-stat-grid">
        {HOME_STATS.map(([n, label, body], i) => (
          <Reveal className="h-stat" key={i} delay={i * 70}>
            <T as="b" k={`home.stat.${i}.n`} markup={false}>
              {n}
            </T>
            <T as="span" k={`home.stat.${i}.label`} markup={false} className="mono">
              {label}
            </T>
            <T as="p" k={`home.stat.${i}.body`} markup={false} multiline>
              {body}
            </T>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ----------------------------------------------------------- 07 · people */

function Person({ p, ek }) {
  const [open, setOpen] = useState(false);
  return (
    <Reveal className="h-person">
      <div className="h-portrait">
        <EImg k={`${ek}.photo`} src={p.photo} alt="" loading="lazy" decoding="async" onError={fallback(p.fallback)} />
      </div>
      <T as="h3" k={`${ek}.name`} markup={false} className="d4">
        {p.name}
      </T>
      <T as="span" k={`${ek}.role`} markup={false} className="mono">
        {p.role}
      </T>
      <ul className="h-quals">
        {p.quals?.map((q, i) => (
          <T as="li" key={i} k={`${ek}.qual.${i}`} markup={false}>
            {q}
          </T>
        ))}
      </ul>
      {p.bio && (
        <>
          <button className="h-read" onClick={() => setOpen(!open)} aria-expanded={open}>
            Read profile
            {open ? <Minus size={15} /> : <Plus size={15} />}
          </button>
          {open && (
            <div className="h-bio">
              {p.bio.map((b, i) => (
                <T as="p" key={i} k={`${ek}.bio.${i}`} markup={false} multiline>
                  {b}
                </T>
              ))}
            </div>
          )}
        </>
      )}
    </Reveal>
  );
}

// the portrait file may not be dropped in yet; fall back to the placeholder
const fallback = (src) => (e) => {
  if (src && e.currentTarget.src !== src) e.currentTarget.src = src;
};

function People() {
  return (
    <section className="section h-people" id="people">
      <span className="ghost">People</span>
      <div className="wrap">
        <Head ek="home.people" eyebrow="People" lines={["Different expertise,"]} accent="shared purpose." />
        <div className="h-people-grid">
          {DIRECTORS.map((p, i) => (
            <Person key={p.name} p={p} ek={`home.director.${i}`} />
          ))}
        </div>

        <T as="h3" k="home.people.sub" markup={false} className="d3 h-sub">
          Expert members
        </T>
        <div className="h-members">
          {TEAM.map((m, i) => (
            <Reveal className="h-member" key={m.name}>
              <EImg k={`home.member.${i}.photo`} src={m.photo} alt="" loading="lazy" decoding="async" onError={fallback(m.fallback)} />
              <div>
                <T as="b" k={`home.member.${i}.name`} markup={false}>
                  {m.name}
                </T>
                <span className="mono">
                  <T as="span" k={`home.member.${i}.role`} markup={false}>
                    {m.role}
                  </T>{" "}
                  · profile to be added
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ 08 · notes */

function Notes() {
  return (
    <section className="section h-notes" id="blogs">
      <div className="wrap">
        <Head ek="home.notes" eyebrow="Blogs" lines={["Notes from the"]} accent="drawing table." />
        <div className="h-note-grid">
          {NOTES.map(([tag, title, body], i) => (
            <Reveal className="h-note" key={i} delay={i * 70}>
              <div className="h-note-top mono">
                <T as="span" k={`home.note.${i}.tag`} markup={false}>
                  {tag}
                </T>
                <span>Planned</span>
              </div>
              <T as="h3" k={`home.note.${i}.title`} markup={false} className="d4">
                {title}
              </T>
              <T as="p" k={`home.note.${i}.body`} markup={false} multiline>
                {body}
              </T>
              <span className="mono h-soon">Coming soon</span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------- 09 · careers */

const MOSAIC = [
  { img: DIRECTORS[1].photo, fb: DIRECTORS[1].fallback },
  { tone: "green" },
  { img: TEAM[1].photo, fb: TEAM[1].fallback },
  { tone: "sand" },
  { tone: "blue" },
  { img: DIRECTORS[0].photo, fb: DIRECTORS[0].fallback },
  { logo: true },
  { img: TEAM[0].photo, fb: TEAM[0].fallback },
  { tone: "green-dark" },
  { img: DIRECTORS[2].photo, fb: DIRECTORS[2].fallback },
  { tone: "sand" },
  { slot: true },
];

function Careers() {
  const [copied, setCopied] = useState(false);
  const { getValue } = useContent();
  const email = getValue("contact.email", CONTACT.email);
  const copy = () => {
    navigator.clipboard?.writeText(email).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      () => {}
    );
  };

  return (
    <section className="section tint h-careers" id="careers">
      <span className="ghost">Careers</span>
      <div className="wrap h-careers-grid">
        <Reveal className="h-mosaic" variant="scale">
          {MOSAIC.map((m, i) => (
            <div key={i} className={`h-tile ${m.tone || ""}`}>
              {m.img && <img src={m.img} alt="" loading="lazy" onError={fallback(m.fb)} />}
              {m.logo && <Logo size={40} word={false} />}
              {m.slot && <span className="mono">This could be you</span>}
            </div>
          ))}
        </Reveal>

        <div>
          <Head ek="home.career" eyebrow="Career" lines={["Your place"]} accent="could be here." />
          <Reveal as="p" className="lede" delay={60}>
            <T as="span" k="home.career.lede" markup={false} multiline>
              We are a young, multidisciplinary practice. If you work across architecture, planning,
              environment or GIS, we would like to hear from you.
            </T>
          </Reveal>

          <dl className="h-ways">
            {CAREER_WAYS.map(([title, body], i) => (
              <Reveal key={i} delay={i * 60}>
                <T as="dt" k={`home.career.${i}.title`} markup={false} className="d4">
                  {title}
                </T>
                <T as="dd" k={`home.career.${i}.body`} markup={false} multiline>
                  {body}
                </T>
              </Reveal>
            ))}
          </dl>

          <Reveal className="h-copy-row" delay={200}>
            <span className="mono h-email">{email}</span>
            <button className="btn ghost-btn sm" onClick={copy}>
              {copied ? <Check size={15} /> : <Copy size={15} />}
              {copied ? "Copied" : "Copy email"}
            </button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------- 10 · contact */

function Contact() {
  const [sent, setSent] = useState(false);
  const { getValue } = useContent();
  const email = getValue("contact.email", CONTACT.email);
  const phone = getValue("contact.phone", CONTACT.phone);
  return (
    <section className="h-contact on-green" id="contact">
      <div className="wrap h-contact-grid">
        <div>
          <Reveal>
            <T as="span" k="home.contact.eyebrow" markup={false} className="eyebrow">
              Start your journey with us
            </T>
          </Reveal>
          <Reveal as="h2" className="d2" delay={60}>
            <T as="span" k="home.contact.head" markup={false}>
              Let&apos;s design
            </T>{" "}
            <em className="ac">
              <T as="span" k="home.contact.accent" markup={false}>
                together.
              </T>
            </em>
          </Reveal>

          <dl className="h-contact-list">
            <div>
              <T as="dt" k="home.contact.emailLabel" markup={false} className="mono">
                Email
              </T>
              <dd>
                <a href={`mailto:${email}`}>{email}</a>
              </dd>
            </div>
            <div>
              <T as="dt" k="home.contact.phoneLabel" markup={false} className="mono">
                Phone
              </T>
              <dd>
                <a href={`tel:${phone.replace(/\s+/g, "")}`}>{phone}</a>
              </dd>
            </div>
            <div>
              <T as="dt" k="home.contact.officeLabel" markup={false} className="mono">
                {HEAD_OFFICE.label}
              </T>
              <T as="dd" k="home.contact.officeLines" markup={false} multiline>
                {HEAD_OFFICE.lines.join(", ")}
              </T>
            </div>
            <div>
              <T as="dt" k="home.contact.followLabel" markup={false} className="mono">
                Follow
              </T>
              <dd>
                <a href={CONTACT.linkedin} target="_blank" rel="noreferrer">
                  LinkedIn · CoArchitive
                </a>
              </dd>
            </div>
          </dl>
        </div>

        <Reveal as="form" className="h-form" delay={120} onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
          <div className="field">
            <label htmlFor="c-name">Name</label>
            <input id="c-name" name="name" required />
          </div>
          <div className="field">
            <label htmlFor="c-email">Email</label>
            <input id="c-email" name="email" type="email" required />
          </div>
          <div className="field">
            <label htmlFor="c-help">I need help with</label>
            <select id="c-help" name="help" defaultValue={HELP_WITH[0]}>
              {HELP_WITH.map((h) => (
                <option key={h}>{h}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="c-note">About the project</label>
            <textarea id="c-note" name="note" rows={3} />
          </div>
          <button type="submit" className="btn tan">
            {sent ? "Thank you — we will be in touch" : "Book a consultation"}
            {!sent && <ArrowRight size={16} />}
          </button>
        </Reveal>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- the page */

export default function Home() {
  return (
    <>
      <ArchHero />
      <About />
      <Why />
      <Services />
      <Ideas />
      <Projects />
      <Stats />
      <People />
      <Notes />
      <Careers />
      <Contact />
    </>
  );
}
