import React from "react";
import { Link } from "../router.jsx";
import Logo from "./Logo.jsx";
import { T } from "../content/Editable.jsx";
import { useContent } from "../content/ContentContext.jsx";
import { COMPANY, CONTACT, TAGLINE } from "../data.js";

const COLS = [
  {
    head: "Practice",
    links: [
      ["architecture", "Architecture"],
      ["planning", "Planning"],
      ["expertise", "Environment"],
    ],
  },
  {
    head: "Studio",
    links: [
      ["about", "About"],
      ["about", "People"],
      ["home", "Blogs"],
    ],
  },
  {
    head: "Join",
    links: [
      ["careers", "Career"],
      ["contact", "Contact"],
    ],
  },
];

export default function Footer() {
  const { getValue } = useContent();
  const company = getValue("company.name", COMPANY);
  const email = getValue("contact.email", CONTACT.email);
  return (
    <footer className="ftr">
      <div className="wrap">
        <div className="ftr-grid">
          <div className="ftr-brand">
            <Logo size={46} word={false} />
            <T as="p" k="footer.tag" markup={false} multiline className="ftr-tag">
              {`${TAGLINE}. Head office in Medchal Malkajgiri, Telangana.`}
            </T>
          </div>

          {COLS.map((c, ci) => (
            <div key={c.head} className="ftr-col">
              <T as="h4" k={`footer.col.${ci}.head`} markup={false}>
                {c.head}
              </T>
              <ul>
                {c.links.map(([to, label], li) => (
                  <li key={label}>
                    <Link to={to}>
                      <T as="span" k={`footer.col.${ci}.link.${li}`} markup={false}>
                        {label}
                      </T>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="ftr-col ftr-news">
            <T as="h4" k="footer.news.head" markup={false}>
              Newsletter
            </T>
            <T as="p" k="footer.news.body" markup={false}>
              Project news and ideas, no more than once a month.
            </T>
            <form className="ftr-form" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Your email" aria-label="Your email" />
              <button type="submit" className="btn tan sm">
                Sign up
              </button>
            </form>
          </div>
        </div>

        <div className="ftr-base">
          <span>
            © {new Date().getFullYear()} {company}
          </span>
          <a href={`mailto:${email}`}>{email}</a>
          <a href={CONTACT.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}
