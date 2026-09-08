# AvenGO v1.5.0 Training-Flow Revision

Date: 2026-09-07
Scope: exercise configuration, per-slot implementation choice, and the minimum persistence adapter required to keep concrete exercise histories separate. No template or ledger rule was added.

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

Home remains the default for a new record. One plan-level button switches every available slot to Gym or back to Home; the stored values remain per-slot exercise IDs, not a global location flag.

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
- JSON envelope version is 5. The importer continues to accept v2–v5 envelopes and a raw date dictionary.
- CSV keeps its existing columns, writes Home and Gym values to `weight_lb`, uses `weight_basis:lb`, and appends `aerobic_machine_reading`.
- The unchanged ledger functions are `entryMode`, `hasStrengthActivity`, `completionSourceForEntry`, `patternsForEntry`, `displayTemplateIdForEntry`, and `patternLedger`.
- The AI summary carries exerciseId and lb values. Gym actions enter same-ID load evaluation; the Worker still forbids cross-ID comparison, Home/Gym conversion, merged Chest/Incline history, invented machine increments, and Gym encouragement.

## Verification record

Automated commands:

```text
node tests/exercise-layer.test.mjs
node worker/test.mjs
git diff --check
```

The exercise test covers plan-wide one-tap Home/Gym switching, nine independent Gym histories, three-way horizontal-push separation, bilateral/unilateral Hinge structure, legacy Light records, Full/Compact defaults, cardio readings, CSV lb fields, Accessory timing, and the known pattern-ledger fixture.

Manual local-browser checks at 375 × 812 covered:

- Home load retained after switching to Gym and back.
- New machine load initially blank; recorded machine load, per-set reps and RIR survive rerender/reload.
- Calendar-created machine record uses the selected Compact dose and immediately appears in the existing pattern ledger and machine-only trend.
- JSON copy/import and CSV download complete on the mobile layout.
- Accessory shows no checkboxes or session completion control until individual tools are added.
- Document width stayed within the viewport and the console reported no errors or warnings.

No live AI review was requested during testing. Worker behavior was checked with its in-memory AI stub, so no cloud inference allocation was consumed.

## Known limits

- Gym station models and attachments were not inspected; the user confirmed that strength-machine displays use lb. All nine Gym instructions keep `needsReview: true` and defer setup details to the station diagram.
- Cable leg curl, barbells and all unconfirmed machines remain absent.
- `prototype-en.html` remains non-persistent and shows the one-tap Home/Gym control, Cardio day, warm-up line, and cardio-machine reading.
- There is still no Service Worker; installation does not guarantee an offline cold start.

Conservative technique references used for the new machine notes: [Mayo Clinic leg press](https://www.mayoclinic.org/healthy-lifestyle/fitness/multimedia/leg-press/vid-20084684), [NASM chest press machine](https://www.nasm.org/resource-center/exercise-library/chest-press-machine), [ACE seated row](https://www.acefitness.org/resources/everyone/exercise-library/168/seated-row/), [ACE Romanian deadlift](https://www.acefitness.org/continuing-education/certified/may-2025/8865/the-ace-do-it-better-series-the-romanian-deadlift/), and [ACE seated lat pulldown](https://www.acefitness.org/resources/everyone/exercise-library/158/seated-lat-pulldown/). These references do not establish which exact machines or attachments exist in the user’s building.
