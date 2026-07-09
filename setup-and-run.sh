#!/usr/bin/env bash
# MMA Training Tracker — create, install, and launch
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

echo "→ Installing dependencies…"
npm install

echo "→ Starting development server…"
echo "  Open http://localhost:3000"
npm run dev
