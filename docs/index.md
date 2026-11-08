---
layout: home

hero:
  name: 'ShadowTrain'
  text: 'Workout Logger for Runners'
  tagline: Offline-first. Fixed-kettlebell & calisthenics step-loading. Plan-aware streaks & achievements. Zero cloud.
  actions:
    - theme: brand
      text: Read MVP Spec
      link: /spec
    - theme: alt
      text: CI & Testing
      link: /ci-and-testing
    - theme: alt
      text: Coverage Report
      link: /coverage
    - theme: alt
      text: View on GitHub
      link: https://github.com/ccmueller355/shadowtrain

features:
  - icon: 🏋️
    title: Minimalist Core Kit
    details: First-class support for fixed kettlebell, gymnastic rings, bodyweight, hand grippers, skipping rope, and stretching — with any gym equipment toggleable.
  - icon: ⚙️
    title: Deterministic 80/20 Engine
    details: Pure TypeScript progression engine supporting fixed-weight rep/set step-loading, timed +15s holds/skipping, and linear plate increments.
  - icon: 🔥
    title: Streaks & Achievements
    details: Duolingo-inspired plan-aware weekly streaks (with rest-day shield) and short-, mid-, and long-term achievement badges.
  - icon: 🎨
    title: Five Shadow Themes
    details: Fixer's Notebook (dark noir), Stuffer Shack (aged parchment), Decker's Den (synth terminal), Cyber Blue, and Fiddler's Green.
  - icon: 📱
    title: 100% Local-First
    details: On-device SQLite (WAL mode) + AsyncStorage persistence with full JSON export. Zero accounts, zero telemetry, zero cloud.
  - icon: ⏱️
    title: Fast Logging & Rest Timer
    details: Pre-fills "last done" working sets with a one-line progression chip and triggers a haptic countdown timer on set checkoff.
---

## Build Roadmap Overview

```mermaid
flowchart LR
  P1["Phase 1: Foundation\nM0 Scaffold (Done)\nM1 SQLite Schema (Done)\nM2 Exercise Seed (Done)"] --> P2["Phase 2: Playable Logger\nM3 Session Logger (Done)\nM4 Last-Done Prefill\nM5 Step-Loading Engine"]
  P2 --> P3["Phase 3: Telemetry & Gamification\nM6 Progress & PRs\nM7 Settings & Export\nM10 Streaks & Achievements"]
  P3 --> P4["Phase 4: Chrome & Deploy\nM8 AI Pose Assets\nM9 EAS Android APK"]
```

| Milestone                   | Status     | Focus                                                                           |
| :-------------------------- | :--------- | :------------------------------------------------------------------------------ |
| **M0 — Scaffold**           | ✅ Landed  | Expo SDK 58 app shell, 5 shadow themes, tab/session routes, CT & CI harness     |
| **M1 — SQLite Layer**       | ✅ Landed  | `expo-sqlite` v1 schema, migrations, serialized write queue, repo helpers       |
| **M2 — Exercise Seed**      | ✅ Landed  | `core-kit-exercises.json` + public dataset import & `availableEquipment` filter |
| **M3 — Session Logger**     | ✅ Landed  | Log sets (`reps`/`weight` or `duration_sec`), checkoff, haptic rest timer       |
| **M4 — Last-Done Prefill**  | ⏳ Next    | Automatic pre-fill from most recent working sets per exercise                   |
| **M5 — Progression Engine** | 📋 Planned | `suggestNext()` deterministic rules + unit test suite & UI suggestion chips     |
| **M6 — Progress View**      | 📋 Planned | Weekly volume/time chart + Personal Records (PR) table                          |
| **M7 — Settings & I/O**     | 📋 Planned | Kit toggles, fixed KB weight, goal/units, 1-file JSON export/import + CSV log   |
| **M8 — First Image Batch**  | 📋 Planned | 25–30 core-kit start/end cyberpunk WebP illustrations + fallback card           |
| **M9 — Distribution Build** | 📋 Planned | EAS internal Android APK build & survival across restarts                       |
| **M10 — Gamification**      | 📋 Planned | Plan-aware weekly streaks (rest-day shield) & short/mid/long-term achievements  |
