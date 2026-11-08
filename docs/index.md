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
      text: 5 Shadow Trainers
      link: /image-prompts
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
    title: 5 Trainers, Creds & Streaks
    details: Start with the Orc Merc and earn Creds (¥) from missions, weekly streaks, and 3-level achievements to unlock the Decker, Universal Soldier, Elf Mage, and Elf Wraith Assassin.
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
  P1["Phase 1: Foundation\nM0 Scaffold (Done)\nM1 SQLite Schema (Done)\nM2 Exercise Seed (Done)"] --> P2["Phase 2: Playable Logger\nM3 Session Logger (Done)\nM4 Last-Done Prefill (Done)\nM5 Step-Loading Engine (Done)"]
  P2 --> P3["Phase 3: Telemetry & Gamification\nM6 Progress & Stats\nM7 Settings & Export\nM10 Streaks & Achievements"]
  P3 --> P4["Phase 4: Chrome & Deploy\nM8 AI Pose Assets\nM9 EAS Android APK"]
```

| Milestone                    | Status     | Focus                                                                           |
| :--------------------------- | :--------- | :------------------------------------------------------------------------------ |
| **M0 — Scaffold**            | ✅ Landed  | Expo SDK 58 app shell, 5 shadow themes, tab/session routes, CT & CI harness     |
| **M1 — SQLite Layer**        | ✅ Landed  | `expo-sqlite` v1 schema, migrations, serialized write queue, repo helpers       |
| **M2 — Exercise Seed**       | ✅ Landed  | `core-kit-exercises.json` + public dataset import & `availableEquipment` filter |
| **M3 — Session Logger**      | ✅ Landed  | Log sets (`reps`/`weight` or `duration_sec`), checkoff, haptic rest timer       |
| **M4 — Last-Done Prefill**   | ✅ Landed  | Automatic pre-fill from most recent working sets per exercise                   |
| **M5 — Progression Engine**  | ✅ Landed  | `suggestNext()` deterministic rules + unit test suite & UI suggestion chips     |
| **M6 — Progress & Stats**    | ⏳ Next    | `Last Workout`/`Week`/`Month` + `◀/▶` scrubber, intensity heatmap & PR table    |
| **M7 — Settings & Trainers** | 📋 Planned | 5-Trainer Dossier & Split selector, kit toggles, 1-file JSON I/O + CSV log      |
| **M8 — Trainer HD & Poses**  | 📋 Planned | 5 sharp HD Trainer portraits + 25–30 core-kit specialist WebP illustrations     |
| **M9 — Distribution Build**  | 📋 Planned | EAS internal Android APK build & survival across restarts                       |
| **M10 — Creds & Streaks**    | 📋 Planned | Creds (`¥`) mission economy to unlock all 5 Trainers + weekly streaks & badges  |
