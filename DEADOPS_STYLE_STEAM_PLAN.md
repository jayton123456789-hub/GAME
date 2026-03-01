# **NEON GRAVE: LAST STAND**
### 2D Top-Down Horde Shooter (Python) — Full Product Plan

---

## 0) One-Line Pitch (storefront hook)
**A brutal, stylish top-down survival shooter where every run is a build-crafting power trip: survive the city, break the horde, and become a one-person apocalypse.**

## 1) Vision + Success Criteria

## Vision
Make a **Dead Ops Arcade-inspired** top-down shooter that is:
- Fast and satisfying in the first 60 seconds
- Visually "premium indie" despite using curated online assets
- Deep enough to keep players engaged for 8+ hours
- Scoped realistically for a solo dev build in Python

## Success Criteria (MVP-to-Launch)
- 10 minutes after install: player says "this feels good"
- 2 hours: player has multiple viable builds discovered
- 8 hours: player has unlocked higher difficulties + meta progression
- Steam reviews praise: **feel, readability, replayability, juice**

---

## 2) Core Design Pillars (non-negotiable)
1. **Juicy Combat Feel** — recoil, flash, impact, sound layering, screenshake
2. **Readable Chaos** — no visual clutter; clear threat silhouettes/colors
3. **Build Discovery** — each run feels different via upgrades + weapon synergies
4. **Short Sessions, Long Progress** — 20–35 min runs + persistent unlocks
5. **Low Scope, High Polish** — fewer systems, finished better

---

## 3) Player Experience (from app click to ~8 hours)

## 0:00–0:03 (First Launch)
- Splash logo → title scene with animated rain/fog/neon signage
- Music: low gritty synth/hip-hop pulse
- Menu options: **Play / Upgrades / Arsenal / Settings / Quit**
- First-time tooltip: "Twin-stick or WASD + mouse. Survive. Extract. Upgrade."

## 0:03–0:10 (First Run)
- Intro map: "District 7"
- Player starts with pistol + one tactical (frag)
- First enemies spawn in light waves to teach movement + aim
- 2-minute mark: first elite appears (teaches priority targeting)
- 5-minute mark: mini-boss + first "big win" loot chest
- Win/lose screen always rewards account XP and scrap currency

## 0:10–1:00 (Early Retention)
- Player unlocks 2nd weapon, first passive tree nodes, maybe first class trait
- Encounters first build-defining upgrade cards
- Learns loop: **run → earn scrap → unlock gear/perks → stronger/funner next run**

## 1:00–3:00 (Depth Phase)
- Multiple guns unlocked
- Discovers synergies (e.g., bleed + crit + chain lightning rounds)
- Sees map/event variety (blackout event, toxic fog, turret convoy)
- Starts aiming for specific builds

## 3:00–8:00 (Mastery + “Beat the Game”)
- Beats Normal campaign chain (3 zones + final boss)
- Unlocks Veteran difficulty
- Unlocks at least one high-tier class + ultimate weapon mod
- Feels there’s still reason to continue (challenge modifiers + leaderboard score chase)

**Definition of "beat" at ~8 hours:**
- Finish final boss on Normal
- Unlock Veteran
- Complete at least 1 run with a specialized build archetype

---

## 4) Genre/Camera/Movement Spec
- **Genre:** Top-down horde shooter / arcade roguelite
- **Camera:** fixed overhead, slight fake depth via shadows and vertical offsets
- **Controls:**
  - KBM: WASD move, mouse aim, LMB fire, RMB tactical/alt, Space dash
  - Controller (phase 2): left stick move, right stick aim
- **Session length:** 20–35 min

---

## 5) Core Gameplay Loop

### In-Run Loop (moment-to-moment)
Move → aim → shoot → dodge → collect XP/scrap drops → pick upgrades every level-up → survive events → kill boss → extract/continue.

### Meta Loop (between runs)
Spend scrap in:
- **Arsenal** (weapon unlocks/mod tiers)
- **Operative Upgrades** (account-wide stat tweaks)
- **Class unlocks** (playstyle changes)
- **Cosmetics** (late)

---

## 6) Content Plan (what exists at launch)

## Playable Characters / Classes (3)
1. **Striker** — balanced, recoil control bonus
2. **Ghost** — mobility, crit/weakpoint style
3. **Bulwark** — tanky, explosive resistance, heavy weapon bonus

## Weapons (12 total)
### Starter (4)
- 9mm Pistol
- SMG-9
- Pump Shotgun
- Burst Rifle

### Mid-tier unlocks (5)
- LMG
- DMR
- Dual Machine Pistols
- Auto Shotgun
- Carbine

### High-tier (3)
- Arc Cannon
- Rail Rifle
- Incendiary Minigun (limited ammo pickups)

## Enemy Roster (10)
- Basic Walker
- Runner
- Spitter
- Armored Brute
- Bomber
- Leaper
- Shield Carrier
- Summoner
- Elite Stalker
- Zone Boss variants

## Bosses (4)
- District Warden
- Tunnel Colossus
- Siren Engine
- Final: The Gravecore

## Maps/Zones (3 main + 1 final)
1. **District 7 Streets** (neon urban)
2. **Metro Catacombs** (tight corridors + ambush)
3. **Blacksite Yard** (open lanes + hazards)
4. **Gravecore Reactor** (final multi-phase arena)

---

## 7) Replayability Systems
1. **Roguelite upgrade draft** each level-up (3 random cards)
2. **Weapon mod rolls** per run (e.g., toxic rounds / ricochet / overpressure)
3. **Challenge mutators** after first clear:
   - glass cannon
   - night mode
   - elite swarms
   - no healing drops
4. **Difficulty tiers** (Recruit / Normal / Veteran / Nightmare)
5. **Meta unlocks** and long-tail progression
6. **Score/challenge contracts** for mastery play

---

## 8) “Fun Assurance” Framework (how we ensure it’s fun)

## A. Feel Checklist (must pass)
- Time-to-first-kill < 10 sec
- Gunfire audio punch layered (shot + mechanical + impact)
- Visible hit confirmation every bullet
- Dash has invuln frames and clear SFX/VFX
- Elite enemy telegraphs readable under chaos

## B. Playtest Cadence
- 20-minute internal test after each mechanic merge
- Weekly "fresh player" test with 3 people
- Track: deaths, quit points, confusion points, favorite moments

## C. Metrics Targets
- D1 session avg > 25 min
- >70% players complete first boss after 2 attempts
- At least 3 distinct viable builds on Normal

## D. Boredom Killers
- New event every ~90 sec
- Upgrade decisions every 45–75 sec
- No dead periods > 20 sec

---

## 9) Art Direction (make mixed assets look premium)

## Style Lock
- Base tone: dark asphalt/steel/charcoal
- Accent palette: neon cyan, hazard orange, toxic lime, blood red
- Lighting feel: night city + hard muzzle flash
- Texture detail medium; silhouettes clean

## Visual Rules
- Enemies must read by silhouette first, color second
- Bullets/projectiles high contrast always
- Player outlined subtly for readability
- Every entity has grounded shadow

## Unification Pass (critical)
All downloaded assets go through:
1. Palette normalization
2. Contrast normalization
3. Edge cleanup + outline policy
4. Shared VFX overlays
5. Final LUT/post-process pass

---

## 10) Asset Sourcing Plan (online assets + licensing)

## Sources
- Kenney (base props/UI)
- itch.io paid packs (characters/enemies/tiles)
- OpenGameArt (supplemental, license-vetted)
- Freesound/Zapsplat (SFX, licensed)
- Incompetech or custom loops (temporary music until custom OST)

## Licensing Process (mandatory)
- Every asset recorded in `/docs/ASSET_REGISTER.md`
- Fields: source URL, author, license, proof screenshot/date
- Only commercial-use-compatible assets
- If ambiguous license: reject asset

## Asset Buckets Needed
- Characters: 1 player base + 10 enemy spritesheets
- Weapons: top-down weapon sprites + muzzle + shell FX
- Environment: tilesets for 3 zones + props + decals
- FX: explosions, sparks, blood pops, smoke, electricity
- UI: minimalist sci-fi HUD pack + icon set
- Audio: 100+ SFX events, 6 music tracks (loopable)

---

## 11) Technical Plan (Python)

## Engine Choice
- **pygame-ce** for compatibility and community support

## Architecture
- `core/` game loop, state machine, config
- `entities/` player, enemy, projectile, pickups
- `systems/` combat, AI, spawn, loot, upgrades, collisions
- `content/` data-driven JSON (weapons/enemies/cards/maps)
- `ui/` hud, menus, tooltips, results
- `assets/` organized by type with manifest
- `save/` profile progression + settings

## Key Libraries
- pygame-ce
- pytmx (if tiled maps)
- numpy (optional perf/math)
- pyinstaller (build)

## Performance Targets
- 60 FPS target on mid-range PC
- Cap active enemies/projectiles with LOD logic
- Object pooling for bullets + FX

---

## 12) UX & UI Flow

## Main Menu
- Big CTA: PLAY
- Quick loadout display
- Daily contract teaser

## In-Game HUD
- HP/Armor bars
- Ammo + reload cue
- Dash cooldown
- Mini objective/event banner
- XP bar and level-up flash

## Level-up Screen
- 3 cards + reroll token (limited)
- Clear rarity colors + short tooltips

## Run End Screen
- Kills, time, accuracy, boss kills, scrap earned
- Buttons: Retry / Return to Hub

## Hub Screens
- Arsenal (guns + mods)
- Upgrades (meta tree)
- Operatives (class select)
- Records (stats)

---

## 13) Audio Plan
- Combat SFX layers per gun to avoid weak feel
- Enemy vocal cues per type (stalker hiss, bomber beep)
- Music intensity ramps with threat level
- Subtle reverb/LPF in tunnels map
- Master bus ducking for important cues (boss telegraphs)

---

## 14) Balance Plan

## Early Game
- Low enemy HP, frequent ammo drops
- Teaches confidence

## Mid Game
- Mixed packs + elite pressure + route decisions

## Late Game
- Arena modifiers + boss mechanics + resource tension

## Build Archetypes (must all win Normal)
- Crit burst
- DOT/status spread
- Tank/explosive bruiser
- Mobility glass cannon

---

## 15) Production Roadmap

## Phase 1 — Vertical Slice (2–3 weeks)
- One map, 3 enemy types, 2 weapons, 1 boss
- Full feel polish baseline

## Phase 2 — Core Content (4–6 weeks)
- Expand weapons/enemies/upgrades
- Add 2nd and 3rd maps
- Meta progression v1

## Phase 3 — Replay Layer (2–3 weeks)
- Difficulty tiers, mutators, contracts
- Unlock economy tuning

## Phase 4 — Steam Prep (2 weeks)
- QA pass, controller support (if included)
- Trailer capture, capsule art, store copy
- Build/depot pipeline + achievements

---

## 16) Steam Commercial Plan

## Positioning
"Dead Ops energy + modern indie polish + buildcraft replayability"

## Price
- Launch: **$7.99–$9.99**
- 10% launch discount for first week

## Conversion Drivers
- Crisp GIF-ready combat moments
- Strong trailer first 5 seconds (muzzle chaos + boss reveal)
- Clear feature bullets (classes, builds, mutators, bosses)

## Store Page Must-Haves
- 1 short hook trailer (45–60s)
- 8–12 screenshots with readable action
- “Why replay” section explicit

---

## 17) Risk Register + Mitigation
1. **Scope creep** → content freeze gate before launch
2. **Asset mismatch** → strict style lock + unification pipeline
3. **Combat feels weak** → prioritize juice early, weekly feel tests
4. **Performance dips** → pooling/caps/profiling in Phase 1
5. **Legal/license issues** → asset register mandatory from day 1

---

## 18) Definition of Done (Launch)
- Complete Normal campaign (3 zones + final)
- 3 classes, 12 weapons, 10 enemies, 4 bosses
- 40+ upgrade cards
- 3+ viable build archetypes
- Stable Steam build, save system, settings, credits/licenses
- Trailer, store assets, launch checklist done

---

## 19) Immediate Next Execution Steps (no planning debt)
1. Create repo structure and starter `pygame-ce` app shell
2. Implement player movement/aim/shoot + one enemy + hit feedback
3. Build style prototype scene with chosen palette
4. Draft `ASSET_REGISTER.md` and collect first legal asset pack set
5. Produce first playable in 72 hours

---

## 20) Project Naming Alternatives (if needed)
- Neon Grave: Last Stand (primary)
- Blacklight Outbreak
- Dead District Zero
- Nightfall Protocol
- Hollow City: Extraction

---

## Final Call
This plan is intentionally built to be **sellable, scoped, and fun-first**. We are not making a giant dream game first — we’re making a **tight banger** that plays hard, looks clean, and can actually ship on Steam.
