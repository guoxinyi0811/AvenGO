# AvenGO v1.7.1 Training-Flow Revision

Date: 2026-11-01
Scope: derive optional preparation from enabled exercise identities, add date-level venue recording and a portable custom-exercise catalog, then extend free combination with confirmed standalone machines. Existing templates, `workout-log`, and ledger semantics remain unchanged.

## v1.7.1 standalone machine library

The free-combination picker now includes five confirmed machines without adding them to a fixed template or Home/Gym replacement slot:

| Display name | exerciseId | Pattern |
|---|---|---|
| 髋外展（器械） | `machine_hip_abduction` | accessory |
| Calf Extension（器械） | `machine_calf_extension` | accessory |
| Leg Curl（器械） | `machine_leg_curl` | hinge |
| Leg Extension（器械） | `machine_leg_extension` | squat |
| Rear Delt（器械） | `machine_rear_delt` | accessory |

All five use lb actuals, independent weight / set / rep / RIR history, weighted trends, explicit preparation needs, and equipment setup plus the standard six instruction sections. Existing Leg Press, Chest Press, Cable Row, and Lat Pulldown IDs cover the other movements in the supplied friend-gym record. The supplied numbers are not defaults and are not inserted into `workout-log`.

## v1.7.0 dynamic preparation

- Every built-in and Gym exercise ID has an explicit `prepNeeds` array, including `[]`. The fixed vocabulary is `ankle`, `knee`, `hip`, `hamstring`, `thoracic`, `shoulder`, `wrist`, `chest`, and `lat`.
- Generation reads the current enabled plan items, not completion checkmarks. General preparation sorts dynamic items before mobility items, then by need frequency and fixed need order; concrete action IDs are deduplicated and capped at five.
- A separate specific-warm-up block lists the first main compound in each active Squat / Hinge / Push / Pull pattern. It uses a clearly easy set and an optional transition set rather than fixed percentages.
- Optional post-training stretches use the same need counts and a five-item cap. They make no recovery, soreness, metabolism, or mobility claim. None of these derived sections writes completion state.

## Venue and custom exercise identity

Daily records may add `venue:"home"|"my_gym"|"other"` and optional `venueLabel`. Venue is never activity: a venue-only date remains unmarked and does not affect totals, ledgers, suggestions, or AI input. CSV includes `venue` and `venue_label`.

Custom definitions live under `coach-card-custom-exercises`, separate from `workout-log`:

```json
{
  "id": "custom_<uuid>",
  "name": "坐姿腿屈伸",
  "normalizedName": "坐姿腿屈伸",
  "pattern": null,
  "subPattern": null,
  "prepNeeds": ["knee"]
}
```

IDs never change when the display name changes. A blank pattern stays `null`; it does not update the four-pattern ledger, while same-ID actuals and weighted trends remain available. Names matching built-in definitions reuse the built-in ID. Home, Gym, and custom histories never inherit one another’s values.

The JSON envelope is v6 and includes `customExercises`. Import remains compatible with v2–v5 and raw logs. Custom merge order is ID, normalized name, then append; imported log references are remapped when a remote ID reuses a local same-name identity. Unknown fields remain intact. AI requests exclude venue and may include a custom exercise name only when that action appears in the user-triggered compact strength summary.

## Gym Full Body A/B

`fullA` and `fullB` are retained as stable storage IDs. Their current configurations are Gym-only and contain no floor movements:

- Gym A: Leg Press, Shoulder Press, Cable Row, Cable RDL, Cable Lateral Raise, and Leg Press calf raise.
- Gym B: Chest Press or Incline Press, Lat Pulldown, Leg Press, Cable RDL, Cable Face Pull, and cable Pallof Press.

Chest Press and Incline Press remain separate exercise IDs. Leg Press is the same `machine_leg_press` in both plans. Cable Pallof Press uses `cable_pallof_press`, independent from the Home band `pallof_press`. Existing records that stored `templateId:"fullA"` or `"fullB"` are not rewritten; completed Home movements remain readable and are labelled as older Home records.

Cable Row retains `exerciseId:"cable_row"` and its UI name. Its setup now specifies the Dual Row seated machine, not a cable tower.

Every machine/cable detail has `setup` followed by the standard six fields. Home dumbbell, bodyweight, and band details keep the six-field structure and do not render an equipment-setup section.

## Training configuration

### Lower Hinge

| Role | Default movement | Full dose | Relationship |
| --- | --- | --- | --- |
| Main Hinge | Dumbbell RDL | 3 × 8–12 | Remains the main bilateral loading movement. |
| Unilateral Hinge | B-stance RDL | 2/side × 8–10 | Default unilateral-control choice. |
| Secondary replacement | Single-leg RDL | 2/side × 6–8 | Replaces B-stance after stability is established; it is never parallel required work. |
| Hip extension | Glute bridge / single-leg bridge | 2–3 × 10–15 | Unchanged identity. |
| Knee flexion | Towel sliding leg curl | 2 × 8–12 | No unconfirmed cable alternative. |
| Anti-rotation | Pallof press | 2/side × 8–12 | Unchanged identity. |

The bilateral and unilateral slots have different roles. Progressing the unilateral slot does not retire or replace bilateral RDL.

### Pull

| Role | Movement | Full dose | Default |
| --- | --- | --- | --- |
| Main horizontal pull | One-arm dumbbell row | 3/side × 8–12 | Included |
| Vertical pull | Band pulldown | 3 × 8–12 | Included |
| Upper back / rear deltoid | Prone T | 2 × 10–15 | Included |
| Second horizontal pull | Seated band row | 2 × 10–15 | Optional and collapsed, including in Full |

### Preparation and Accessory

- Template warm-ups are rendered as optional preparation: 2–5 minutes of self-selected general movement, followed by a few uncounted repetitions with no load or a lighter version of the first main movement.
- Preparation has no checkbox, incomplete state, reminder, or gate before the main movement.
- Accessory includes 21 mobility, core, shoulder/upper-back, lower-body, neck, and carry movements. Each unselected row directly shows its best-fit plan and pre/post timing; the session-level strength check-in stays hidden.

## Concrete exercise identity

Gym Full Body A/B are the current defaults for the stable `fullA` / `fullB` IDs. Other supported plans keep the one-tap Home/Gym switch; stored values remain per-slot exercise IDs, not a global location flag.

| Shared pattern/role | Home exerciseId | Gym exerciseId(s) |
| --- | --- | --- |
| Squat | `goblet_squat` | `machine_leg_press` |
| Vertical push | `dumbbell_shoulder_press` | `machine_shoulder_press` |
| Horizontal push | `incline_pushup` | `machine_chest_press`, `machine_incline_press` |
| Vertical pull | `band_pulldown` | `machine_lat_pulldown` |
| Horizontal pull | `one_arm_dumbbell_row` | `cable_row` |
| Shoulder abduction | `dumbbell_lateral_raise` | `cable_lateral_raise` |
| Upper back / rear deltoid | `prone_t` | `cable_face_pull` |
| Hinge | `dumbbell_rdl` | `cable_rdl` |
| Calf raise | `calf_raise` | `machine_calf_press` |
| Anti-rotation | `pallof_press` | `cable_pallof_press` |

Chest Press and Incline Press are deliberately separate histories. Pattern equality affects only existing pattern-ledger attribution; it never permits weight or RIR inheritance.

New actual values are stored under the concrete exerciseId. The adapter reads `actuals[exerciseId]` first and the matching historical name key second. When a historical record is edited, the original name-keyed object is retained and a current ID-keyed value is written; unknown fields are copied forward. There is no bulk migration.

Per-day choices are optional:

```json
{
  "exerciseChoices": {
    "push": {
      "incline_pushup": "machine_chest_press"
    }
  },
  "actuals": {
    "machine_chest_press": {
      "weight": 45,
      "sets": 3,
      "reps": [10, 10, 9],
      "rir": 2
    }
  }
}
```

All strength-machine `weight` values use lb. Machine increments are still unknown, and no conversion to Home dumbbell load is allowed. A machine exercise starts blank unless that same exerciseId has earlier history.

## Export and compatibility

- `workout-log` and local-date keys are unchanged.
- Existing `day`, `doneA`, `doneB`, `doneExercises`, `selectedExercises`, actuals, reviews, notes, cardio and cycle fields are not migrated or removed.
- JSON envelope version is 6. The importer continues to accept v2–v5 envelopes and a raw date dictionary.
- CSV writes Home, Gym, and custom values to `weight_lb`, uses `weight_basis:lb`, retains `aerobic_machine_reading`, and includes `venue` / `venue_label`.
- “复制最新数据” scans existing records without mutating them, keeps one latest actual per concrete exercise ID and one latest entry per cardio type, and appends current pattern gaps plus the latest cycle marker. It does not copy a four-week session log or import prompt examples.
- The unchanged ledger functions are `entryMode`, `hasStrengthActivity`, `completionSourceForEntry`, `patternsForEntry`, `displayTemplateIdForEntry`, and `patternLedger`.
- The AI summary carries exerciseId and lb values. Gym actions enter same-ID load evaluation; the Worker still forbids cross-ID comparison, Home/Gym conversion, merged Chest/Incline history, invented machine increments, and Gym encouragement.

## Verification record

Automated commands:

```text
node tests/exercise-layer.test.mjs
node worker/test.mjs
git diff --check
```

The exercise test covers the prior Gym and compatibility fixtures plus explicit prep needs, dynamic ordering and caps, exact no-claim stretch copy, venue-only persistence, CSV venue fields, custom UUID identity, nullable patterns, rename continuity, same-name import remapping, custom weighted trends, v6 round trips, and AI venue exclusion.

Manual local-browser checks at 375 × 812 covered:

- Home load retained after switching a supported split plan to Gym and back.
- New machine load initially blank; recorded machine load, per-set reps and RIR survive rerender/reload.
- Calendar-created machine record uses the selected Compact dose and immediately appears in the existing pattern ledger and machine-only trend.
- JSON copy/import and CSV download complete on the mobile layout.
- Accessory shows no checkboxes or session completion control until individual tools are added.
- Document width stayed within the viewport and the console reported no errors or warnings.

No live AI review was requested during testing. Worker behavior was checked with its in-memory AI stub, so no cloud inference allocation was consumed.

## Known limits

- Strength-machine displays use lb. The current machine/cable instructions include the supplied station setup; Cable Row is specifically the Dual Row seated machine. Station-specific diagrams and safety labels still take precedence where hardware differs.
- Cable leg curl, barbells and all still-unconfirmed machines remain absent. The confirmed selectorized `machine_leg_curl` is a separate identity.
- `prototype-en.html` remains non-persistent; it previews dynamic preparation, venue, custom-action, Gym Full Body A, equipment setup, Cardio day, and data/privacy terminology without reading `workout-log`.
- There is still no Service Worker; installation does not guarantee an offline cold start.

Conservative technique references used for the new machine notes: [Mayo Clinic leg press](https://www.mayoclinic.org/healthy-lifestyle/fitness/multimedia/leg-press/vid-20084684), [NASM chest press machine](https://www.nasm.org/resource-center/exercise-library/chest-press-machine), [ACE seated row](https://www.acefitness.org/resources/everyone/exercise-library/168/seated-row/), [ACE Romanian deadlift](https://www.acefitness.org/continuing-education/certified/may-2025/8865/the-ace-do-it-better-series-the-romanian-deadlift/), and [ACE seated lat pulldown](https://www.acefitness.org/resources/everyone/exercise-library/158/seated-lat-pulldown/). These references do not establish which exact machines or attachments exist in the user’s building.
