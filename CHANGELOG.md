# Changelog

## 2026-08-29 — v1.3.2 pattern-ledger source fix

- Fixed the movement ledger so it reads one compatible completion field instead of merging `doneExercises`, `doneA`, and `doneB` across data generations.
- Treats completed movements as training-history facts even when an older calendar edit left the stored template label out of sync; a clear one-pattern mismatch is displayed under the matching template without rewriting the backup.
- Separated completed-action facts from inferred pattern coverage: an explicit empty array no longer means every template action was completed, while records that truly predate completion arrays may still infer pattern coverage without fabricating action names.
- Split-day ledger dates now follow the session's primary pattern, so an auxiliary Hinge movement inside Lower Squat does not reset the dedicated Hinge interval; Full Body and custom sessions still follow the patterns actually completed.
- When the calendar editor changes a template, it now retains only completed actions shared with the destination template; actual-value history remains untouched.
- Standardized pattern-level UI labels and report output to `Squat` / `Hinge`.

## 2026-08-28 — v1.3.1 input default priority

- Fixed strength-input defaults so a previous actual record keeps its weight, sets, reps, and RIR across Full / Compact / Light selections.
- When no previous actual exists, both sets and reps now come from the currently selected investment level instead of falling back to the Full recommendation.
- Kept current-day manual entries as the highest-priority values and made no storage-schema changes.

## 2026-08-28 — v1.3.0 training coverage expansion

- Added six-part instructions for dumbbell lateral raises, calf raises, towel sliding leg curls, farmer carries / suitcase marches, chin tucks, and gentle four-way neck isometrics.
- Rebalanced six templates: Full Body A adds calves; Full Body B and Push add lateral raises; Lower Squat adds calves; Lower Hinge adds knee-flexion hamstring work; Accessory adds calf, carry, and neck work.
- Kept the existing pattern architecture: lateral raises, calves, and neck work are accessories; towel curls use Hinge; carries use the already reserved Carry type and now appear in free combination.
- Grouped the longer Accessory session into joint / neck-shoulder, lower-body stability, and loaded-stability blocks without changing the log schema.
- Added an optional RDL grip note for B-stance single-dumbbell work or familiar use of lifting straps; it never automatically increases load.

## 2026-08-24 — v1.2.2 calendar history sync

- Made past-date edits immediately refresh the home-page movement ledger, training reference, statistics, weight trend, and weekly strength bars without requiring a reload.
- Made explicit “rest” and “no strength” choices override retained legacy strength fields when deriving activity.
- Stopped unchecked movements with retained actual-value snapshots from appearing in the movement ledger, summaries, trends, reports, or CSV exports; actuals-only legacy records remain supported when no completion array exists.

## 2026-08-20 — v1.2.1 fixed-band progression and compact defaults

- Added a separate English UI prototype for reviewing terminology and mobile layout without reading or changing production training data.
- Added direct links to the Chinese app and English prototype in both README language sections.
- Changed fixed-band progression to add 1–2 reps per set first, then one set up to four, then band-length / end-range-pause adjustments; it no longer suggests buying or selecting a heavier band.
- Made untouched actual-value fields use the compact plan's set count after switching from Full to Compact, while preserving values already entered for the current day.
- Extended the AI equipment guard so fixed-band advice follows the same progression order and never infers menstrual-cycle-based load changes.

## 2026-08-11 — v1.2.0 AI coach review

### Local coaching rules

- Added a neutral “可优先考虑” ledger marker when a main movement pattern has been absent for more than 10 days or has never appeared in existing history.
- Added bodyweight and band progression suggestions after repeated top-range work, including optional load recording for bridges and bodyweight squats.
- Kept every rule local, immediate, optional, and independent from network or AI availability.

### AI review layer

- Added a user-triggered eight-week coaching review with loading, graceful failure, same-data caching, explicit regeneration, and up to 12 locally stored historical reviews.
- Limited outbound data to strength movements, actual weight / sets / reps / RIR, weekly frequency / recorded sets, and pattern gaps. Names, period data, cardio, notes, and raw JSON are excluded.
- Added a Cloudflare Worker that uses the Workers AI binding with a fixed model and prompt, validates request size and shape, restricts CORS to the GitHub Pages origin, and applies per-device plus global rate limits without requiring a third-party API key.
- Upgraded full JSON backups to version 4 with optional review history while retaining v2/v3 and raw-log import compatibility.

### Deployment

- Deployed the Workers AI endpoint at `https://avengo-coach.guoxinyi0811.workers.dev/review`; local coaching rules remain fully usable if the network or daily cloud allocation is unavailable.

## 2026-08-11 — v1.1.0 movement-pattern iteration

### Training architecture

- Replaced the A/B-only picker with a movement-pattern ledger for Squat, Hinge, Push, and Pull.
- Added Full Body A / B, Push, Pull, Lower Squat, Lower Hinge, Accessory / Conditioning, and free-combination choices; every choice remains available.
- Added 10-day frequency guidance, priority-pattern suggestions, and a soft long-absence reminder for horizontal / vertical push and pull.
- Added `pattern` / `subPattern` movement metadata and read-time mapping for legacy A/B records without migration.

### Recording and progression

- Added `templateId`, `selectedExercises`, and `doneExercises` as optional log fields.
- Added RIR quick choices and neutral progressive-overload hints based on recent repetitions, load, and available reps.
- Extended past-date editing, monthly summaries, 14-day reports, CSV exports, trends, and weekly bars to understand the new template model.
- Bumped the lossless JSON backup envelope to version 3 while continuing to accept v2 and raw legacy logs.

### Documentation

- Updated README with the new prototype flow, mobile installation, local serving, privacy, and License sections.
- Updated HANDOFF with v1.1 data fields, compatibility rules, logic, UI limitations, and regression coverage.

## 2026-08-11 — Quiet minimal visual reset

### UI-only changes

- Removed the in-app zine collage mark, paper grain, photocopy borders, archive labels, hard offset shadows, and magenta interaction system.
- Rebuilt the visual layer around warm mineral neutrals, open spacing, hairline dividers, soft surfaces, and a restrained sage accent.
- Simplified the header to a small product wordmark and content-first title; the existing PNG remains available only as the install icon and favicon.
- Returned labels and numeric controls to the system sans stack, reserving the system serif stack for a few structural headings.
- Kept neutral effort levels, 44px touch targets, clear focus states, reduced-motion support, and every existing workflow unchanged.
- Updated PWA theme/background colors to match the new warm off-white canvas.
- Condensed the README and added a direct online prototype plus a short example workflow.

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
