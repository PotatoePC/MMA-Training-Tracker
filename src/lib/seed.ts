import type { AppData, TrainingSession } from "./types";
import { DEFAULT_CARDIO_TYPES, DEFAULT_EXERCISES } from "./types";

/**
 * Seed data for 2026 — 3–4 sessions per category scattered across months
 * so charts and calendar dots are immediately visible.
 */
export const SEED_SESSIONS: TrainingSession[] = [
  // ── Strength (4) ──
  {
    id: "seed-str-1",
    date: "2026-01-08",
    type: "strength",
    createdAt: "2026-01-08T18:00:00.000Z",
    strength: {
      exercises: [
        {
          id: "ex-1a",
          name: "Barbell Back Squat",
          rpe: 7,
          sets: [
            { id: "s1", weightKg: 100, reps: 5 },
            { id: "s2", weightKg: 100, reps: 5 },
            { id: "s3", weightKg: 105, reps: 4 },
          ],
        },
        {
          id: "ex-1b",
          name: "Bench Press",
          rpe: 7,
          sets: [
            { id: "s4", weightKg: 80, reps: 6 },
            { id: "s5", weightKg: 80, reps: 6 },
            { id: "s6", weightKg: 85, reps: 5 },
          ],
        },
      ],
    },
  },
  {
    id: "seed-str-2",
    date: "2026-02-12",
    type: "strength",
    createdAt: "2026-02-12T18:30:00.000Z",
    strength: {
      exercises: [
        {
          id: "ex-2a",
          name: "Barbell Back Squat",
          rpe: 8,
          sets: [
            { id: "s7", weightKg: 105, reps: 5 },
            { id: "s8", weightKg: 110, reps: 4 },
            { id: "s9", weightKg: 110, reps: 4 },
          ],
        },
        {
          id: "ex-2b",
          name: "Deadlift",
          rpe: 8,
          sets: [
            { id: "s10", weightKg: 140, reps: 5 },
            { id: "s11", weightKg: 150, reps: 3 },
            { id: "s12", weightKg: 150, reps: 3 },
          ],
        },
      ],
    },
  },
  {
    id: "seed-str-3",
    date: "2026-03-20",
    type: "strength",
    createdAt: "2026-03-20T17:45:00.000Z",
    strength: {
      exercises: [
        {
          id: "ex-3a",
          name: "Barbell Back Squat",
          rpe: 8,
          sets: [
            { id: "s13", weightKg: 110, reps: 5 },
            { id: "s14", weightKg: 115, reps: 4 },
            { id: "s15", weightKg: 115, reps: 3 },
          ],
        },
        {
          id: "ex-3b",
          name: "Bench Press",
          rpe: 8,
          sets: [
            { id: "s16", weightKg: 85, reps: 6 },
            { id: "s17", weightKg: 90, reps: 5 },
            { id: "s18", weightKg: 90, reps: 4 },
          ],
        },
      ],
    },
  },
  {
    id: "seed-str-4",
    date: "2026-05-06",
    type: "strength",
    createdAt: "2026-05-06T18:15:00.000Z",
    strength: {
      exercises: [
        {
          id: "ex-4a",
          name: "Barbell Back Squat",
          rpe: 9,
          sets: [
            { id: "s19", weightKg: 120, reps: 4 },
            { id: "s20", weightKg: 125, reps: 3 },
            { id: "s21", weightKg: 125, reps: 3 },
          ],
        },
        {
          id: "ex-4b",
          name: "Deadlift",
          rpe: 9,
          sets: [
            { id: "s22", weightKg: 160, reps: 4 },
            { id: "s23", weightKg: 170, reps: 2 },
            { id: "s24", weightKg: 170, reps: 2 },
          ],
        },
        {
          id: "ex-4c",
          name: "Bench Press",
          rpe: 8,
          sets: [
            { id: "s25", weightKg: 92.5, reps: 5 },
            { id: "s26", weightKg: 95, reps: 4 },
            { id: "s27", weightKg: 95, reps: 3 },
          ],
        },
      ],
    },
  },

  // ── Cardio (4) ──
  {
    id: "seed-car-1",
    date: "2026-01-15",
    type: "cardio",
    createdAt: "2026-01-15T07:00:00.000Z",
    cardio: {
      cardioType: "5k Run",
      durationMinutes: 28,
      runMode: true,
      distanceKm: 5,
      notes: "Easy aerobic base run",
    },
  },
  {
    id: "seed-car-2",
    date: "2026-02-22",
    type: "cardio",
    createdAt: "2026-02-22T07:30:00.000Z",
    cardio: {
      cardioType: "5k Run",
      durationMinutes: 26.5,
      runMode: true,
      distanceKm: 5,
      notes: "Slightly faster pace",
    },
  },
  {
    id: "seed-car-3",
    date: "2026-04-03",
    type: "cardio",
    createdAt: "2026-04-03T08:00:00.000Z",
    cardio: {
      cardioType: "Home Route",
      durationMinutes: 42,
      runMode: true,
      distanceKm: 8,
      notes: "Longer road work",
    },
  },
  {
    id: "seed-car-4",
    date: "2026-06-10",
    type: "cardio",
    createdAt: "2026-06-10T06:45:00.000Z",
    cardio: {
      cardioType: "Assault Bike",
      durationMinutes: 20,
      runMode: false,
      notes: "HIIT intervals — 30s on / 30s off",
    },
  },
  {
    id: "seed-car-5",
    date: "2026-03-08",
    type: "cardio",
    createdAt: "2026-03-08T07:15:00.000Z",
    cardio: {
      cardioType: "5k Run",
      durationMinutes: 25.2,
      runMode: true,
      distanceKm: 5,
      notes: "PR attempt — felt strong",
    },
  },

  // ── Grappling (4) ──
  {
    id: "seed-grp-1",
    date: "2026-01-22",
    type: "grappling",
    createdAt: "2026-01-22T19:00:00.000Z",
    combat: {
      feltRating: 7,
      learned:
        "Improved hip escape timing against side control. Partner showed a tighter knee slice pass setup that I need to drill.",
      improvements:
        "Still slow on recovering half guard. Focus on framing earlier and not letting the crossface settle.",
    },
  },
  {
    id: "seed-grp-2",
    date: "2026-03-05",
    type: "grappling",
    createdAt: "2026-03-05T19:30:00.000Z",
    combat: {
      feltRating: 8,
      learned:
        "Worked triangle entries from closed guard. Found better angle by shifting hips more aggressively before locking the figure-four.",
      improvements:
        "Need stronger grip retention on sleeve control before initiating sweeps. Arms got tired mid-round.",
    },
  },
  {
    id: "seed-grp-3",
    date: "2026-04-18",
    type: "grappling",
    createdAt: "2026-04-18T18:45:00.000Z",
    combat: {
      feltRating: 6,
      learned:
        "Drilled takedown defense — sprawl reaction improved. Coach emphasized hand-fighting before level change.",
      improvements:
        "Conditioning dropped in round 4. Need more anaerobic work. Also defend the body lock better on the cage.",
    },
  },
  {
    id: "seed-grp-4",
    date: "2026-06-02",
    type: "grappling",
    createdAt: "2026-06-02T19:00:00.000Z",
    combat: {
      feltRating: 9,
      learned:
        "Hit a clean armbar from mount in live rolling. Transition from S-mount felt natural after last month's drilling.",
      improvements:
        "Stay calmer when opponent starts scrambling — don't rush the finish and lose position.",
    },
  },

  // ── Striking (4) ──
  {
    id: "seed-stk-1",
    date: "2026-01-29",
    type: "striking",
    createdAt: "2026-01-29T18:00:00.000Z",
    combat: {
      feltRating: 7,
      learned:
        "Refined jab-cross-low kick combination. Coach adjusted my lead foot placement for better hip rotation on the kick.",
      improvements:
        "Chin still rising on power shots. Keep rear hand glued to cheek when throwing the lead hook.",
    },
  },
  {
    id: "seed-stk-2",
    date: "2026-02-28",
    type: "striking",
    createdAt: "2026-02-28T17:30:00.000Z",
    combat: {
      feltRating: 8,
      learned:
        "Worked clinch knees and dirty boxing entries. Better at controlling the double collar tie before firing.",
      improvements:
        "Footwork when exiting the clinch — step out on angles rather than straight back into range.",
    },
  },
  {
    id: "seed-stk-3",
    date: "2026-05-14",
    type: "striking",
    createdAt: "2026-05-14T18:00:00.000Z",
    combat: {
      feltRating: 6,
      learned:
        "Pad work focused on counter timing — slipping the jab and returning a rear uppercut. Timing is improving.",
      improvements:
        "Leg kick defense late in rounds. Check more consistently and don't plant the lead leg too long.",
    },
  },
  {
    id: "seed-stk-4",
    date: "2026-06-20",
    type: "striking",
    createdAt: "2026-06-20T17:45:00.000Z",
    combat: {
      feltRating: 9,
      learned:
        "Sparring felt sharp. Landed clean 1-2-body kick sequences and stayed composed under pressure. Distance management was on point.",
      improvements:
        "Still overcommitting on the rear hand occasionally. Stay balanced and ready to pivot after combinations.",
    },
  },

  // ── July 2026 (default month view) ──
  {
    id: "seed-str-5",
    date: "2026-07-03",
    type: "strength",
    createdAt: "2026-07-03T18:00:00.000Z",
    strength: {
      exercises: [
        {
          id: "ex-5a",
          name: "Barbell Back Squat",
          rpe: 8.5,
          sets: [
            { id: "s28", weightKg: 125, reps: 4 },
            { id: "s29", weightKg: 130, reps: 3 },
            { id: "s30", weightKg: 130, reps: 2 },
          ],
        },
        {
          id: "ex-5b",
          name: "Bench Press",
          rpe: 7.5,
          sets: [
            { id: "s31", weightKg: 95, reps: 5 },
            { id: "s32", weightKg: 97.5, reps: 4 },
            { id: "s33", weightKg: 100, reps: 3 },
          ],
        },
      ],
    },
  },
  {
    id: "seed-car-6",
    date: "2026-07-07",
    type: "cardio",
    createdAt: "2026-07-07T06:30:00.000Z",
    cardio: {
      cardioType: "5k Run",
      durationMinutes: 24.5,
      runMode: true,
      distanceKm: 5,
      notes: "Summer PR effort — cooler morning",
    },
  },
  {
    id: "seed-grp-5",
    date: "2026-07-08",
    type: "grappling",
    createdAt: "2026-07-08T19:00:00.000Z",
    combat: {
      feltRating: 8,
      learned:
        "Drilled guard retention against heavy pressure. Better at creating frames with elbows before the pass lands.",
      improvements:
        "Hip mobility still limits my butterfly sweeps — add dedicated mobility work before class.",
    },
  },
  {
    id: "seed-stk-5",
    date: "2026-07-09",
    type: "striking",
    createdAt: "2026-07-09T17:30:00.000Z",
    combat: {
      feltRating: 7,
      learned:
        "Focused on teep-jab rhythm and exiting on the 45. Pad holder mixed levels well.",
      improvements:
        "Recover hands faster after low kicks. Don't leave the head open while resetting stance.",
    },
  },
];

export function createSeedData(): AppData {
  return {
    sessions: SEED_SESSIONS,
    customExercises: [...DEFAULT_EXERCISES],
    customCardioTypes: [...DEFAULT_CARDIO_TYPES],
    version: 1,
  };
}
