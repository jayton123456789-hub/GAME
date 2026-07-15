"""Deterministic progression probes for Prism Rush: Breakpoint."""
import json
from pathlib import Path
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'tests'/'artifacts'
html=(ROOT/'index.html').read_text(); css=(ROOT/'styles.css').read_text(); js=(ROOT/'src/main.js').read_text()
storage="""<script>const __ls={};Object.defineProperty(window,'localStorage',{value:{getItem:k=>Object.prototype.hasOwnProperty.call(__ls,k)?__ls[k]:null,setItem:(k,v)=>{__ls[k]=String(v)},removeItem:k=>delete __ls[k],clear:()=>{for(const k in __ls)delete __ls[k]}}});</script>"""
inline=html.replace('<head>','<head><base href="https://prism.local/">'+storage).replace('<link rel="stylesheet" href="styles.css" />',f'<style>{css}</style>').replace('<script defer src="src/main.js"></script>',f'<script>{js}</script>')
priority=['launchForce','impact','retention','gatePen','perfectBoost','comboDamage','speedCap','excessDamage','breakpoint','gateCarry']

def run_scenario(browser, buy_upgrades, seed_base):
    page=browser.new_page(viewport={'width':1280,'height':720})
    def route_asset(route):
        path=ROOT/urlparse(route.request.url).path.lstrip('/')
        if path.exists(): route.fulfill(body=path.read_bytes(),content_type='image/svg+xml' if path.suffix=='.svg' else 'application/octet-stream')
        else: route.abort()
    page.route('https://prism.local/**',route_asset)
    page.set_content(inline)
    attempts=[]; milestones={}; completion=None
    for run in range(1,17):
        page.evaluate(f'__PRISM_DEBUG__.startRun({seed_base+run})')
        state=page.evaluate('__PRISM_DEBUG__.step(20)')
        if state['mode']=='playing': state=page.evaluate('__PRISM_DEBUG__.step(5)')
        if buy_upgrades:
            for skill in priority:
                saved=page.evaluate('__PRISM_DEBUG__.save()')
                if skill not in saved['skills']:
                    page.evaluate(f'__PRISM_DEBUG__.buySkill("{skill}")')
                    break
        saved=page.evaluate('__PRISM_DEBUG__.save()')
        broken=sum(1 for v in saved['gateBroken'] if v)
        attempts.append({'attempt':run,'distance_m':round(state['player']['x']/10),'gates_broken':broken,'boss_armor':round(saved['bossArmor']),'gold':saved['gold'],'skills':list(saved['skills']),'world_complete':saved['worldComplete']})
        for idx,v in enumerate(saved['gateBroken'],1):
            if v and f'gate_{idx}' not in milestones: milestones[f'gate_{idx}']=run
        if saved['worldComplete']:
            completion=run;break
    page.close()
    return {'policy':'ideal slope-following; one prioritized upgrade purchased after each run' if buy_upgrades else 'ideal slope-following; no upgrades purchased','milestones':milestones,'boss_defeated_attempt':completion,'attempts':attempts}

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    no_upgrades=run_scenario(browser,False,1000)
    upgrade_path=run_scenario(browser,True,2000)
    browser.close()

assert 2 <= no_upgrades['milestones'].get('gate_1',99) <= 4, no_upgrades
assert 10 <= no_upgrades['milestones'].get('gate_4',99) <= 14, no_upgrades
assert 11 <= no_upgrades['boss_defeated_attempt'] <= 15, no_upgrades
assert 8 <= upgrade_path['boss_defeated_attempt'] <= 10, upgrade_path
report={'status':'PASS','no_upgrades':no_upgrades,'upgrade_path':upgrade_path}
(OUT/'balance-report.json').write_text(json.dumps(report,indent=2))
print(json.dumps({'status':'PASS','no_upgrade_clear':no_upgrades['boss_defeated_attempt'],'upgrade_clear':upgrade_path['boss_defeated_attempt'],'no_upgrade_milestones':no_upgrades['milestones'],'upgrade_milestones':upgrade_path['milestones']},indent=2))
