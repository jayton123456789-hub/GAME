# **PROJECT BONKDOWN**
### Top-Down BONK-Style Horde Roguelite (Python) — Full Production Plan v3

> Direction lock: **No crafting. Pure combat + movement + upgrade chaos.**

---

## 0) Important Scope + Legal Guardrail
You asked for a "top-down Megabonk ripoff." We can absolutely build that **feel** and loop, but to protect your Steam launch we should avoid 1:1 copying names, art, enemies, UI, and exact content.

**Target:** make a game that players describe as:
- "Megabonk energy in top-down"
- "faster, cleaner, more readable"
- "same dopamine loop, different identity"

---

## 1) Research Summary (what Megabonk appears to be)
Based on available Steam listing signals:
- Core fantasy: **smash through endless enemies**
- Core loop: **kill → loot/XP → level up → absurd builds**
- Tags include: **Action Roguelike, Roguelite, Bullet Hell**
- Single-player, controller support, achievements, leaderboards
- Selling point is **build variety and power escalation**

So our top-down version should prioritize:
1. Swarm pressure
2. Fast power growth
3. Wild upgrade synergies
4. Punchy impact/juice
5. Replayability over story

---

## 2) Product Vision
Build a **top-down horde roguelite** that is:
- instantly fun in 30 seconds
- highly replayable for 8+ hours
- polished enough for Steam at low price
- scoped for Python (`pygame-ce`) ship

### One-line hook
**Dash, blast, and BONK through escalating swarms while stacking ridiculous upgrades into run-breaking builds.**

---

## 3) Name Pass (less basic)
Primary candidates:
1. **BONKDOWN: OVERDRIVE**
2. **BULLETHEAD: BONK PROTOCOL**
3. **SMASHLOOP: ZERO**
4. **OVERBONK ARENA**
5. **NEON BONK: LAST WAVE**

**Current working title:** `BONKDOWN: OVERDRIVE` (strong + marketable)

---

## 4) Core Pillars (hard constraints)
1. **No Crafting, No Survival Busywork**
2. **Combat Every Second** (minimal downtime)
3. **Movement Mastery** (dash, kite, reposition)
4. **Build Explosion** (synergies create crazy power spikes)
5. **Readable Chaos** (clean visual language under pressure)

---

## 5) The Exact Loop (run architecture)

## In-Run Loop (20–35 min)
1. Spawn in arena zone
2. Fight escalating enemy waves
3. Gain XP quickly
4. Every level: choose 1 of 3 upgrades
5. Periodic elite waves + mini-boss
6. Stage boss at time gate
7. Continue to next biome or end run

## Between Runs
- Spend currency on permanent unlocks
- Unlock classes/weapons/modifiers
- Start next run stronger but still skill-gated

**No crafting menus. No resource trees. Just fight and build.**

---

## 6) Player Journey (0 to 8 hours)

## 0:00–0:05
- Start app
- Immediate menu with PLAY front and center
- 1-line controls and no fluff

## 0:05–0:20
- First run tutorialized through gameplay only
- First elite by minute 2
- First crazy combo by minute 6
- First boss by minute 10–12

## 0:20–2:00
- Unlock 2nd class + multiple weapons
- Learn build archetypes
- Begin intentional build choices

## 2:00–5:00
- Clear multiple biomes
- Discover high-synergy combinations
- Start challenge modifiers

## 5:00–8:00
- First full clear on Normal
- Unlock Veteran mode + advanced mutators
- Achieve first truly broken build run

"Beat" at ~8h = first full campaign clear + Veteran unlock.

---

## 7) Combat Design (feel first)

## Player Actions
- Move (WASD / left stick)
- Aim (mouse / right stick)
- Fire
- Dash (i-frames)
- Heavy BONK ability (short cooldown crowd control)
- Ultimate meter burst (build-dependent)

## Feel Targets
- Hit feedback every impact (flash + pop sound + tiny freeze)
- Dash responsiveness < 60ms perceived input lag
- Time-to-first-kill < 8 seconds
- Every 60–90 seconds: meaningful power decision

---

## 8) Content Scope (launch v1)

## Classes (4)
1. **Bruiser** — melee-heavy, knockback chain
2. **Ranger** — precision/crit
3. **Gunner** — high ROF sustain
4. **Volt** — elemental chain effects

## Weapons (12)
- Melee: bat, hammer, blade gauntlet
- Ranged: pistol, SMG, shotgun, burst rifle, LMG, railgun, arc cannon, grenade launcher, saw launcher

## Enemies (10)
- fodder runner
- tank brute
- ranged spitter
- exploder
- jumper
- shielder
- summoner
- elite hunter
- phase stalker
- support totem unit

## Bosses (4)
- Biome 1 boss
- Biome 2 boss
- Biome 3 boss
- Final Core boss

## Biomes (3 + final)
1. Neon alleys
2. Industrial blastworks
3. Blacksite ruins
4. Final reactor

---

## 9) Upgrade System (the heart)

## Per-level Upgrade Cards
- 3 choices per level
- rarity tiers: common/rare/epic/legendary
- weighted by current build tags

## Upgrade Families
- BONK (melee force, shockwave, stun)
- Bullet (projectiles, ricochet, pierce, split)
- Elemental (burn, shock, toxic)
- Defense (armor, dodge, lifesteal)
- Utility (dash resets, magnet radius, XP boost)

## Example Run-Breaking Synergies
- **Thunder BONK:** melee slam triggers chain lightning + stun
- **Shotgun Bloom:** pellet split + burn spread + lifesteal
- **Rail Cascade:** pierce + rebound + crit explosion
- **Dash Reaper:** dash leaves damaging trails + cooldown resets on kill

These synergies are the replay engine.

---

## 10) Replayability Systems
1. random upgrade offerings
2. class + weapon combinations
3. enemy modifier rotations
4. difficulty tiers (Normal, Veteran, Nightmare)
5. challenge mutators
6. unlock goals + achievements
7. score/challenge leaderboard loop

---

## 11) Fun Assurance (non-negotiable QA)

## Playtest Cadence
- Daily: 15-min combat feel pass
- Weekly: 3 fresh players, no coaching

## Metrics to Track
- quit point timestamp
- first-death cause
- first-fun-spike moment
- upgrade pick rates
- boss clear rates

## Hard Targets
- >70% players reach first boss by run 2
- >60% choose "one more run" after first death
- 4 viable build archetypes at launch

---

## 12) Visual Direction (top-down Megabonk-style, not copy)

## Art Identity
- chunkier silhouettes
- high contrast projectiles
- exaggerated impact FX
- bold color-coded danger language

## Palette
- base: charcoal, steel, deep navy
- accents: neon cyan, electric purple, hot orange, toxic green

## VFX Stack
- muzzle flashes
- enemy hit flashes
- impact decals
- shockwaves
- damage numbers toggle
- screen shake tiers (light/med/heavy)

Goal: chaos feels hype but still readable.

---

## 13) Audio Direction
- thick impact sounds for BONK identity
- distinct enemy cues for threat recognition
- adaptive music intensity as wave threat rises
- boss intro stingers
- mix prioritizes clarity under high SFX load

---

## 14) UX Flow (fast, no friction)

## Main Menu
- Play
- Loadout
- Upgrades
- Records
- Settings

## In-Run HUD
- HP/armor
- ammo/heat
- dash cooldown
- XP bar
- wave timer + threat level
- mini objective (boss incoming etc.)

## Post-Run
- kills/time/bosses
- build recap
- unlock progress
- instant restart button

---

## 15) Technical Plan (Python)

## Engine
- `pygame-ce`

## Architecture
- `src/core` loop/states/config
- `src/entities` player/enemies/projectiles/pickups
- `src/systems` combat/spawn/ai/upgrade/progression
- `src/content` JSON data-driven balance content
- `src/ui` menu/hud/results
- `assets` sprites/sfx/music/fonts
- `docs` design/license registers

## Performance
- 60 FPS target
- object pooling for bullets/fx/enemies
- cap + simplify behavior when swarm count spikes

---

## 16) Steam Product Strategy

## Positioning
"Top-down BONK horde roguelite with absurd build escalation."

## Price
- $7.99–$9.99
- launch discount 10%

## Storefront Must-Haves
- trailer with huge chaos in first 5 seconds
- GIF shots of broken builds
- clear bullets: classes, builds, bosses, replay loop

---

## 17) Production Roadmap (10 weeks)

## Week 1–2: Vertical Slice
- one biome, 2 classes, 4 weapons, 4 enemy types, 1 boss
- core feel done

## Week 3–6: Content Core
- full classes + weapon baseline
- upgrade system depth
- more enemies + elites

## Week 7–8: Replay Layer
- mutators, difficulty tiers, progression tuning

## Week 9–10: Ship Prep
- bugfix/balance
- trailer/screenshots
- Steam integration and release checklist

---

## 18) Definition of Done (v1)
- full Normal clear path
- 4 classes
- 12 weapons
- 10 enemies
- 4 bosses
- 50+ upgrades
- stable save/settings
- Steam achievements + leaderboards + cloud

---

## 19) Immediate Build Tasks (next execution)
1. Create Python project skeleton in repo
2. Implement player movement/aim/fire/dash
3. Implement wave spawner + 2 enemy archetypes
4. Add upgrade card draft system (3 choices)
5. Add first boss prototype
6. Hook run-end and meta-currency rewards

---

## 20) Final Direction Lock
This is now a **no-crafting**, **top-down**, **Megabonk-feel** game plan focused on what sells:
- satisfying combat
- clear replay loop
- high polish
- manageable scope

We keep the feel, not a legal 1:1 clone.
