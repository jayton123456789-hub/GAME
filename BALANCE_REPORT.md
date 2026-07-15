# Balance and Play-Test Report

## Automated browser play-test

The main test launches Chromium and verifies:

- Main hub and all 20 skill nodes render
- Real Space-bar hold/release input advances a seeded run
- Pause and resume preserve run state
- Three perk choices render and the selected perk enters the HUD
- Final-approach forecast and boss HUD render
- A boss strike removes persistent armor
- Summary rewards and browser save data complete correctly
- The 844×390 mobile-landscape layout remains playable
- No uncaught JavaScript or browser-console errors occur

Screenshots and machine-readable reports are included in `tests/artifacts/`.

## Progression probes

Both probes use a deterministic, idealized controller that holds on descents and releases on climbs.

### No permanent upgrades purchased

- Gate 1: attempt 3
- Gate 2: attempt 6
- Gate 3: attempt 9
- Gate 4: attempt 13
- Prism Bulwark defeated: attempt 13

This keeps even a very clean no-upgrade route inside the intended 12–15 attempt campaign window.

### One prioritized upgrade after each run

The probe buys from Momentum and Destruction in a practical order: launch force, impact power, retention, gate penetration, perfect boost, combo conversion, and speed cap.

- Prism Bulwark defeated: attempt 9

That validates the intended split: meaningful purchases pull a strong player into the 8–10 attempt range without making upgrades mandatory for eventual completion.
