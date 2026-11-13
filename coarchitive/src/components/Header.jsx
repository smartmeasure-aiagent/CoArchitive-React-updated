import React, { useState, useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "../router.jsx";
import Logo from "./Logo.jsx";
import { useScrollFrame } from "./Motion.jsx";
import { T } from "../content/Editable.jsx";
import { NAV, TAGLINE } from "../data.js";

export default function Header({ route }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const bar = useRef(null);

  // one frame loop drives both the solid state and the reading-progress line
  useScrollFrame(() => {
    const y = window.scrollY;
    setScrolled(y > 12);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.current?.style.setProperty("--read", max > 0 ? (y / max).toFixed(4) : "0");
  });

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const close = () => setOpen(false);
  const cls = ["hdr", scrolled && "scrolled", open && "menu-open"].filter(Boolean).join(" ");

  return (
    <>
      <header className={cls}>
        <Link to="home" className="logo-link" onClick={close} aria-label="CoArchitive — home">
          <Logo size={36} />
        </Link>

        <nav className="hdr-nav">
          {NAV.map((n, i) => (
            <Link
              key={n.label}
              to={n.to}
              anchor={n.anchor}
              className={route === n.to && !n.anchor ? "on" : ""}
            >
              <T as="span" k={`nav.${i}.label`} markup={false}>
                {n.label}
              </T>
            </Link>
          ))}
        </nav>

        <Link to="contact" className="btn sm hdr-cta">
          <T as="span" k="nav.cta" markup={false}>
            Book a consultation
          </T>
        </Link>

        <button
          className={open ? "burger open" : "burger"}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <span />
          <span />
        </button>

        <div className="hdr-read" ref={bar} aria-hidden="true" />
      </header>

      <div className={open ? "menu-overlay open" : "menu-overlay"}>
        <div className="menu-inner">
          {NAV.map((n, i) => (
            <Link
              key={n.label}
              to={n.to}
              anchor={n.anchor}
              onClick={close}
              className="menu-item"
              style={{ "--i": i }}
            >
              <span className="menu-no">{String(i + 1).padStart(2, "0")}</span>
              <T as="span" k={`nav.${i}.label`} markup={false}>
                {n.label}
              </T>
              <ArrowRight size={20} />
            </Link>
          ))}
          <p className="menu-tagline">
            <T as="span" k="company.tagline" markup={false}>
              {TAGLINE}
            </T>
          </p>
        </div>
      </div>
    </>
  );
}
