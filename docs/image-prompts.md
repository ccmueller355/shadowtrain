# ShadowTrain — Anchored Image Prompts & 5 Trainer Roster

Single source of truth for **Milestone M8**:

1. **5 Sharp HD Trainer Portraits (`1024×1024` WebP)** — 1 per Trainer Dossier page (`assets/trainers/<trainer_id>.webp`).
2. **Core-Kit Exercise Showcase Poses (`start` & `end` WebP)** — demonstrated by each movement's specialist trainer (`assets/exercises/<exercise_id>/{start,end}.webp`).

---

## 1. Visual Anchor Contract (`Æ CYBERNETICS`)

All Trainer portraits and Exercise Showcase illustrations share this strict visual anchor so they match the app icon and Cyber-Orc splash screen:

- **Background**: Deep matte charcoal-black (`#14101c`) with a subtle glowing electric-cyan (`#00f0ff`) hexagonal wireframe frame and minimal HUD telemetry accents.
- **Lighting**: High-contrast dramatic rim-lighting — electric cyan (`#00f0ff`) primary rim-light and vibrant neon orange (`#ff8c00`) cyberware/energy accents.
- **Render Style**: Sharp, high-detail cyberpunk digital illustration (semi-realistic comic/concept-art finish, zero blur, crisp silhouette).

---

## 2. The 5 Unlockable Shadow Trainers (HD Portrait Prompts)

### 1. `orc-merc` — Kaelen "Tusk" Vorga (Starter · `0 ¥`)

- **Race / Class**: Orc Male — Bodybuilder & Heavy Weapons Mercenary
- **Specialty**: Heavy Kettlebell Power, Barbell/Dumbbell Hypertrophy, Heavy Grip Crushers
- **HD Portrait Prompt (`assets/trainers/orc-merc.webp`)**:
  > Sharp 1024x1024 cyberpunk character portrait of Kaelen "Tusk" Vorga, a massive, heavily muscled Shadowrun Orc bodybuilder and heavy-weapons mercenary. Prominent lower tusks, glowing neon orange (`#ff8c00`) ballistic cyber-visor, matte-chrome cybernetic left arm with glowing orange plasma conduits, resting one hand on a heavy cast-iron kettlebell with a glowing cyan circuit core. Framed by a crisp electric-cyan (`#00f0ff`) neon hexagon on a deep matte charcoal (`#14101c`) background.

### 2. `human-decker` — Valerie "Glitch" Vance (`250 ¥` Creds)

- **Race / Class**: Human Female — Attractive Elite Shadow-Decker
- **Specialty**: High-Density Minimalist Kit, Jump Rope Conditioning, Kettlebell & Core Intervals
- **HD Portrait Prompt (`assets/trainers/human-decker.webp`)**:
  > Sharp 1024x1024 cyberpunk character portrait of Valerie "Glitch" Vance, an athletic, attractive 28-year-old female shadow-decker in fitted dark carbon-fiber athletic gear with glowing cyan (`#00f0ff`) neural-jack temple implants and a holographic orange (`#ff8c00`) data-wristband, holding a high-speed neon-cord skipping rope and a matte-black kettlebell. Framed by a crisp electric-cyan (`#00f0ff`) neon hexagon on a deep matte charcoal (`#14101c`) background.

### 3. `human-soldier` — Marcus "Vanguard" Kade (`500 ¥` Creds)

- **Race / Class**: Human Male — Cyber-Modded Universal Soldier
- **Specialty**: Tactical Hybrid Split (`Workout A / B`), Push/Pull/Hinge/Squat Combat Readiness
- **HD Portrait Prompt (`assets/trainers/human-soldier.webp`)**:
  > Sharp 1024x1024 cyberpunk character portrait of Marcus "Vanguard" Kade, a rugged, muscular cyber-modded universal soldier with subdermal titanium plating seams along his shoulders, a glowing orange (`#ff8c00`) tactical ocular implant, and military compression gear, racked with dual kettlebells in front-rack position. Framed by a crisp electric-cyan (`#00f0ff`) neon hexagon on a deep matte charcoal (`#14101c`) background.

### 4. `elf-mage` — Lyra "Aether" Vael (`750 ¥` Creds)

- **Race / Class**: Elf Female — Attractive Hermetic Mage & Astral Adept
- **Specialty**: Deep Mobility Flow, Stretching, Turkish Get-Ups & Isometric Control
- **HD Portrait Prompt (`assets/trainers/elf-mage.webp`)**:
  > Sharp 1024x1024 cyberpunk character portrait of Lyra "Aether" Vael, a striking, athletic female Shadowrun Elf mage with pointed elven ears, silver-white hair, glowing orange (`#ff8c00`) arcane sigil tattoos along her collarbone and forearms, wearing sleek dark mobility gear while holding a kettlebell effortlessly overhead in a Turkish Get-Up lockout surrounded by subtle cyan (`#00f0ff`) mana-circuit geometry. Framed by a crisp electric-cyan neon hexagon on a deep matte charcoal (`#14101c`) background.

### 5. `elf-wraith` — Soren "Wraith" Kael (`1,000 ¥` Creds)

- **Race / Class**: Elf Male — Wraith Assassin & Calisthenics / Rings Acrobat
- **Specialty**: Convict Calisthenics Ladders (Level 1→3), Gymnastic Rings Mastery & Silent Leverage
- **HD Portrait Prompt (`assets/trainers/elf-wraith.webp`)**:
  > Sharp 1024x1024 cyberpunk character portrait of Soren "Wraith" Kael, a lean, shredded male Shadowrun Elf wraith assassin and calisthenics acrobat with pointed elven ears, a matte-black stealth half-mask, and a glowing neon orange (`#ff8c00`) target-reticle eye implant, suspended in a dead-silent Ring L-Sit on glowing cyan (`#00f0ff`) gymnastic rings. Framed by a crisp electric-cyan neon hexagon on a deep matte charcoal (`#14101c`) background.

---

## 3. Specialist Exercise Showcase Mapping (`start` / `end` Poses)

Instead of generating 5 duplicate icon sets for every exercise, each movement in `core-kit-exercises.json` is showcased by its **Specialist Trainer**:

| Trainer (`ID`)                               | Showcased Exercise Categories / Movements                                                                                               |
| :------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------- |
| **Kaelen "Tusk" Vorga (`orc-merc`)**         | Heavy Kettlebell (`Swing`, `Goblet Squat`, `Strict Press`, `Clean & Press`, `Snatch`, `Row`, `Deadlift`), `Hand Gripper`, `Barbell`     |
| **Soren "Wraith" Kael (`elf-wraith`)**       | All `Gymnastic Rings` movements (`Ring Row`, `Support Hold`, `Ring Push-Up`, `Ring Dip`, `Chin-Up`, `L-Sit`) & `Bodyweight` Ladders     |
| **Lyra "Aether" Vael (`elf-mage`)**          | All `Stretching` & Mobility movements (`90/90 Hip`, `Couch Stretch`, `Deep Squat Pry`, `Cossack`, `Thoracic Bridge`) + `Turkish Get-Up` |
| **Valerie "Glitch" Vance (`human-decker`)**  | All `Skipping Rope` (`Basic Bounce`, `Boxer Step`, `High Knees / Double-Unders`) + `Kettlebell Halo` & Core Holds                       |
| **Marcus "Vanguard" Kade (`human-soldier`)** | Tactical Hybrid / Compound Gym & Split movements (`Dumbbell`, `Cable`, `Loaded Carries`, `Pull-Ups`)                                    |
