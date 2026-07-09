# MMA Training Tracker (2026)

Apple Calendar–inspired MMA & athletic training tracker built with **Next.js (App Router)**, **Tailwind CSS**, **TypeScript**, **Recharts**, and **Lucide React**.

All metrics are **strictly metric**: weights in **kg**, distances in **km**, pace in **min/km**.

## Features

- **Monthly calendar** for 2026 with color-coded session dots
- **Day drawer** to view / add sessions for any date
- **Quick-add presets**: Strength · Cardio · Grappling · Striking
- **Strength**: multi-exercise sets (kg × reps), RPE 1–10, volume + Epley 1RM charts
- **Cardio**: dynamic types, Run Mode toggle, auto pace (min/km)
- **Grappling / Striking journals**: felt rating, learned, focus points
- **Persistent localStorage** with 2026 seed data

## Quick start

```bash
cd mma-training-tracker
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Color legend

| Session   | Color        |
|-----------|--------------|
| Strength  | Steel Blue   |
| Cardio    | Emerald Green|
| Grappling | Deep Purple  |
| Striking  | Crimson Red  |

## Stack

- Next.js 16 · React 19 · Tailwind CSS 4
- Recharts · Lucide React · date-fns

## Data

Sessions are stored under `localStorage` key `mma-training-tracker-v1`. Use the reset icon in the header to restore seed data.
