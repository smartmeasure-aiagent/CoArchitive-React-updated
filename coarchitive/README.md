# CoArchitive — React Website

A multidisciplinary-consultancy website. The home page opens on a scroll-driven
build sequence: one courtyard house drawn as a sketch, turned into a working
drawing, modelled, built, finished, connected to its street, and finally seen as
part of a city — seven acts the visitor scrolls through.

## The build sequence

Lives in `src/sequence/`:

```
sequence/
  stages.js          the seven acts: copy, sheet number, drawing stage, scale
  BuildSequence.jsx  the pinned scroll stage — copy, title block, act rail, skip
  Drawings.jsx       acts 01–02, drawn as SVG that draws itself in
  world.js           acts 03–07, a procedural Three.js scene (no external assets)
  sequence.css       the stage, the sky per act, the drawing title block
```

`world.js` builds every object from boxes and cylinders at runtime: the study
model, the construction frame with its scaffolding and crane, the finished house
with its jali and terrace garden, the street with its services, lighting and
traffic, and the city grid around it. Three.js is loaded as its own chunk after
first paint, so the page text renders before the 3D does.

Where WebGL is unavailable, or the visitor asks for reduced motion, the same
seven acts render as a plain stacked page with the two drawings still shown.

## What is included

- React 18 + Vite
- **Multi-page** app with a dependency-free hash router (`src/router.jsx`)
- Home page built around a seven-act scroll sequence (SVG drawings + Three.js)
- Inner pages: Architecture, Planning, Expertise, About, Careers, Contact, Offices
- Filterable Projects and Insights feeds
- Sticky header with full-screen mobile menu; large editorial footer with newsletter + link columns
- Responsive desktop / tablet / mobile layout, `prefers-reduced-motion` respected
- Original CoArchitive copy; Lucide icons
- No third-party logo, source code, proprietary text, project imagery or branding

## Structure

```
src/
  main.jsx            entry
  App.jsx             route table
  router.jsx          useRoute() / navigate() / <Link>
  data.js             all content (nav, expertise, projects, insights, offices, roles…)
  components/         Header, Footer, Logo, UI (PageHero, SectionHead, Card, Stats)
  pages/              one file per route
  styles.css          design system (tokens at the top of the file)
  legacy-layout.css   section geometry the inner pages are built on
  pages-skin.css      inner pages, re-skinned to the current design language
  home.css            home page sections
  sequence/           the scroll-driven build sequence (see above)
public/brand/         drop the logo artwork here — see its README.txt
```

## Run

1. Install Node.js 18+
2. `npm install`
3. `npm run dev`
4. Open the local URL shown by Vite

## Build

`npm run build` → `dist/`, then `npm run preview`

## Editing content — the admin editor

The site has a built-in admin at **`/#/admin`**. Once connected to a free
Supabase project (one-time setup in [`ADMIN_SETUP.md`](ADMIN_SETUP.md)), you can
log in, turn on **Edit mode**, and click any text or image on the site to change
it. Edits save to Supabase and every visitor sees them immediately — no code
changes, no redeploy. Until Supabase is connected, the site runs on the built-in
defaults below and `/#/admin` shows the setup steps.

How it works: every editable field has a stable key and ships a *default* value
from the code; an admin override is stored in the `site_content` table and shown
to all visitors. Images upload to a public `site-images` Storage bucket. See
[`src/content/`](src/content/) for the store (`ContentContext.jsx`) and the
inline-edit primitives (`Editable.jsx` — `T`, `EImg`, `EBg`).

## Homepage animation (3 designs, admin-switchable)

The home page opens on a scroll-driven 3D build sequence that assembles one of
three delivered architecture scenes (`public/architecture/models/Architecture-1
/2/3.glb`), re-coloured into the site's sand/green palette. Design 1 is the
default. In **Edit mode** an admin sees a picker on the hero to switch to design
2 or 3; the choice is saved in Supabase (`home.animation.variant`) so every
visitor gets it. Each step's caption is editable inline like the rest of the
site. Code: [`src/components/ArchHero.jsx`](src/components/ArchHero.jsx) +
[`src/sequence/archScene.js`](src/sequence/archScene.js). Where WebGL is
unavailable, the matching poster frame stands in.

## Editing content in code

Almost everything is in [`src/data.js`](src/data.js) — nav items, the eight expertise verticals,
projects, insights, offices, open roles and values. Company details (name, tagline, head office,
email, phone) are taken from the letterhead and sit at the top of the same file.

Colours, spacing and type scale are CSS custom properties at the top of
[`src/styles.css`](src/styles.css): `--green` and `--sand` are sampled from the brand mark.

## Before launch

- Drop the logo artwork at `public/brand/coarchitive-mark.png` — until then `src/components/Logo.jsx`
  renders an approximate inline SVG reconstruction of the mark.
- Replace the Unsplash placeholder URLs in `src/data.js` with your own or licensed photography.
- Wire the Contact form and the footer newsletter field to a real endpoint — both are inert.
- Routes are hash-based (`/#/projects`) so the site deploys to any static host without server
  rewrites. Swap to a history router if you want clean URLs.

## Brand safety

The design takes general inspiration from architectural/editorial web conventions and from the
information architecture common to multidisciplinary consultancies. It is not a reproduction of
another firm's website.
