import React, { useEffect, useState } from "react";
import { Mail, Copy, Check, X } from "lucide-react";
import { PageHero, SectionHead, Principles, HoverList } from "../components/UI.jsx";
import { Reveal } from "../components/Motion.jsx";
import { T } from "../content/Editable.jsx";
import { ROLES, VALUES, CONTACT, HIRING, EXPERTISE, WORK_WITH_US } from "../data.js";

// each role borrows the photograph of the discipline it sits in
const roleImg = (team) =>
  (EXPERTISE.find((e) => e.title === team) ?? EXPERTISE[0]).img.replace("w=1600", "w=900");

const subjectFor = (role) => `Application: ${role.title}`;
const bodyFor = (role) =>
  `Hello CoArchitive team,\n\nI'd like to apply for the ${role.title} role (${role.team} · ${role.type} · ${role.loc}).\nMy CV and portfolio are attached.\n\nThank you,\n`;

// Gmail's web compose window, pre-filled. Opens in a new tab so the careers
// page stays where it is.
const gmailFor = (role) =>
  `https://mail.google.com/mail/?view=cm&fs=1&tf=1&to=${encodeURIComponent(CONTACT.email)}` +
  `&su=${encodeURIComponent(subjectFor(role))}&body=${encodeURIComponent(bodyFor(role))}`;

// fallback for anyone not on Gmail — hands the draft to their desktop mail app
const mailtoFor = (role) =>
  `mailto:${CONTACT.email}?subject=${encodeURIComponent(subjectFor(role))}&body=${encodeURIComponent(bodyFor(role))}`;

// Clicking a role opens this panel instead of jumping straight to a mail
// client: it shows the address, opens a pre-filled Gmail draft and confirms
// once the draft has been opened.
function ApplyDialog({ role, onClose }) {
  const [copied, setCopied] = useState(false);
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const copy = () => {
    navigator.clipboard?.writeText(CONTACT.email).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      () => {}
    );
  };

  const openGmail = () => {
    window.open(gmailFor(role), "_blank", "noopener,noreferrer");
    setOpened(true);
  };

  return (
    <div className="apply-veil" onClick={onClose}>
      <div
        className="apply-card"
        role="dialog"
        aria-modal="true"
        aria-label={`Apply for ${role.title}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="apply-x" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        <span className="eyebrow">Apply by email</span>
        <h3 className="apply-title">{role.title}</h3>
        <p className="apply-meta">{`${role.team} · ${role.type} · ${role.loc}`}</p>
        <p className="apply-body">
          Applications for this role are read by email. We will open a Gmail draft addressed to{" "}
          <span className="note-mail">{CONTACT.email}</span> with the subject already filled in —
          attach your CV and portfolio before sending.
        </p>

        <div className="apply-actions">
          <button type="button" className="btn-md" onClick={openGmail}>
            <Mail size={16} />
            {opened ? "Open Gmail again" : "Send email via Gmail"}
          </button>
          <button type="button" className="btn ghost-btn sm" onClick={copy}>
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? "Copied" : "Copy email"}
          </button>
        </div>

        <p className="apply-status" role="status" aria-live="polite">
          {opened
            ? "Gmail draft opened in a new tab — attach your CV and hit send."
            : copied
              ? "Address copied to your clipboard."
              : ""}
        </p>
        <a className="apply-alt" href={mailtoFor(role)}>
          Prefer your own mail app? Open the draft there instead.
        </a>
      </div>
    </div>
  );
}

export default function Careers() {
  const [role, setRole] = useState(null);

  return (
    <>
      <PageHero
        ek="hero.careers"
        eyebrow="Careers"
        title="Build across *boundaries.*"
        lede="If you want to work next to people whose training is nothing like yours, this is the right practice."
        img="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=2000&q=85"
        meta={[`${ROLES.length} open roles`, "India · hybrid", "Jobs · internships · freelancing"]}
      />

      <section className="sec grey">
        <SectionHead ek="careers.join.head" kicker="Ways to join" title="Jobs, internships *and freelancing*" />
        <Principles ek="careers.join" items={WORK_WITH_US} />
        <Reveal as="p" className="note">
          <T as="span" k="careers.join.note" markup={false} multiline>
            {`To apply for an internship or freelance work, write to ${CONTACT.email} with your CV and portfolio.`}
          </T>
        </Reveal>
      </section>

      <section className="sec">
        <SectionHead ek="careers.roles.head" kicker="Open roles" title="Where we're *hiring*" />
        <HoverList
          ek="careers.roles"
          items={ROLES.map((r) => ({
            title: r.title,
            meta: `${r.team} · ${r.type} · ${r.loc}`,
            img: roleImg(r.team),
            onSelect: () => setRole(r),
          }))}
        />
        <Reveal as="p" className="note">
          <T as="span" k="careers.roles.note" markup={false} multiline>
            {`Don't see your discipline? Write to ${CONTACT.email} — we read everything.`}
          </T>
        </Reveal>
      </section>

      <section className="sec dark">
        <SectionHead ek="careers.hire.head" kicker="How we hire" title="Four steps, *no surprises*" />
        <ol className="process">
          {HIRING.map(([t, d], i) => (
            <Reveal as="li" key={i} delay={i * 120}>
              <span className="process-no">{String(i + 1).padStart(2, "0")}</span>
              <T as="h3" k={`careers.hire.${i}.title`} markup={false}>
                {t}
              </T>
              <T as="p" k={`careers.hire.${i}.body`} markup={false}>
                {d}
              </T>
            </Reveal>
          ))}
        </ol>
      </section>

      <section className="sec grey">
        <SectionHead ek="careers.working.head" kicker="Working here" title="What you can *expect*" />
        <Principles ek="careers.working" items={VALUES} />
      </section>

      {role && <ApplyDialog role={role} onClose={() => setRole(null)} />}
    </>
  );
}
