# PRISM RUSH: BREAKPOINT

A self-contained, offline-capable HTML5 game implementing the Neon Expanse vertical slice.

## Play

Open the GitHub Pages site and rotate a phone to landscape.

## Controls

- **Hold:** left mouse, touch anywhere, or Space — dive and cling to descending terrain.
- **Release:** launch from the rising slope.
- **Escape:** pause or close a menu.

## Included systems

- Fixed-timestep custom momentum physics with tangent-based landings
- Perfect, clean, rough, and crash states
- Authored procedural route assembly with a reproducible seed
- Four persistent-damage gates
- Three in-run perk machines with 12 stackable perks
- Four-branch permanent skill tree with 20 upgrades
- Three-pass Prism Bulwark boss encounter
- Persistent armor, regenerating run shield, and core phase
- Gold economy, cosmetics, records, challenges, save export/import
- Procedural particles, original vector art, reactive WebAudio soundtrack and SFX
- Mobile landscape UI, touch controls, haptics, PWA installation and offline cache

## Save data

Progress is saved automatically in browser local storage after every run and purchase. Settings includes a save-code export/import backup.

## Testing

`tests/playtest.py` launches Chromium through Playwright, checks UI navigation, starts a seeded run, exercises hold/release input, validates canvas state, opens the pause menu, tests a deterministic perk selection, verifies summary flow, and captures screenshots.

`tests/balance_probe.py` runs two deterministic campaign simulations: an ideal no-upgrade route that clears on attempt 13, and a practical one-upgrade-per-run route that clears on attempt 9.
