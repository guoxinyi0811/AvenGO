# Changelog

## 2026-08-11 — Quiet minimal visual reset

### UI-only changes

- Removed the in-app zine collage mark, paper grain, photocopy borders, archive labels, hard offset shadows, and magenta interaction system.
- Rebuilt the visual layer around warm mineral neutrals, open spacing, hairline dividers, soft surfaces, and a restrained sage accent.
- Simplified the header to a small product wordmark and content-first title; the existing PNG remains available only as the install icon and favicon.
- Returned labels and numeric controls to the system sans stack, reserving the system serif stack for a few structural headings.
- Kept neutral effort levels, 44px touch targets, clear focus states, reduced-motion support, and every existing workflow unchanged.
- Updated PWA theme/background colors to match the new warm off-white canvas.

## 2026-08-10 — Neutral concurrent-training iteration

### Functional and data changes

- Reframed the three historical `state` values as neutral effort levels: 完整 / 精简 / 轻量. Stored values remain unchanged for backward compatibility.
- Replaced traffic-light UI copy and removed achievement, failure, and streak-pressure language.
- Added a six-part instruction schema for every atomic movement: setup, breathing, tempo, force sequence, correct sensation, and common errors.
- Added a broader movement-detail catalog for squat, hinge, push, pull, core, and warm-up patterns. Ambiguous foot-inversion and frog-position variants are explicitly marked `needsReview:true`.
- Added optional `rir` to action actuals. Existing actuals without RIR remain valid.
- Added past-date movement selection and actual-value editing for weight, sets, reps, and RIR.
- Decoupled cardio from day type. New records do not use `dayType:"aero"`; cardio may coexist with strength, rest, or no strength arrangement.
- Preserved legacy `dayType:"aero"` records through read-time interpretation without destructive migration.
- Added versioned full JSON backup, legacy raw-log JSON import, and row-oriented CSV export.
- Added an optional local display name under `coach-card-profile`; the default product experience is generic.
- Removed hard-coded personal history injection and personalized coaching-dialogue copy. Existing local records are never deleted.

### Documentation

- Rewrote README copy for a general-purpose home-training product.
- Corrected the offline claim: the current repository has a manifest but no Service Worker.
- Added `HANDOFF.md` with full storage, compatibility, logic, UI, and regression constraints.

### Visual system

- Applied a usable Minimal Zine Coach Card system: warm paper, charcoal ink, restrained photocopy lines, archive labels, and a lightweight inline scan texture.
- Added the user-provided collage logo as the header mark, favicon, Apple touch icon, and manifest icon without redrawing it.
- Limited magenta to narrow brand and interaction anchors; effort levels remain a neutral blue-gray scale.
- Reworked hierarchy, Chinese typography, spacing, action cards, six-part instruction scanning, and numeric actual-value inputs.
- Converted action completion and detail triggers to semantic 44px buttons with focus, pressed, and expanded states.
- Added reduced-motion handling and verified normal text contrast; `--soft` against paper is above WCAG AA.
- Verified 375px and desktop layouts without horizontal overflow and captured both review screenshots.
