import json
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'tests'/'artifacts'; OUT.mkdir(parents=True,exist_ok=True)
html=(ROOT/'index.html').read_text()
css=(ROOT/'styles.css').read_text()
js=(ROOT/'src'/'main.js').read_text()
base='<base href="https://prism.local/">'
storage='''<script>const __ls={};Object.defineProperty(window,'localStorage',{value:{getItem:k=>Object.prototype.hasOwnProperty.call(__ls,k)?__ls[k]:null,setItem:(k,v)=>{__ls[k]=String(v)},removeItem:k=>delete __ls[k],clear:()=>{for(const k in __ls)delete __ls[k]}}});</script>'''
inline=html.replace('<head>','<head>'+base+storage).replace('<link rel="stylesheet" href="styles.css" />',f'<style>{css}</style>').replace('<script defer src="src/main.js"></script>',f'<script>\n{js}\n</script>')
try:
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage','--allow-file-access-from-files'])
        page=browser.new_page(viewport={'width':1280,'height':720},device_scale_factor=1)
        errors=[]
        def route_asset(route):
            from urllib.parse import urlparse
            rel=urlparse(route.request.url).path.lstrip('/')
            path=(ROOT/rel).resolve()
            if str(path).startswith(str(ROOT.resolve())) and path.exists() and path.is_file():
                ctype='application/octet-stream'
                if path.suffix=='.svg': ctype='image/svg+xml'
                elif path.suffix=='.png': ctype='image/png'
                elif path.suffix=='.webmanifest': ctype='application/manifest+json'
                elif path.suffix=='.js': ctype='text/javascript'
                elif path.suffix=='.css': ctype='text/css'
                route.fulfill(status=200,body=path.read_bytes(),content_type=ctype)
            else:
                route.abort()
        page.route('https://prism.local/**',route_asset)
        page.on('console',lambda msg: errors.append(f'console {msg.type}: {msg.text}') if msg.type=='error' and 'service worker' not in msg.text.lower() else None)
        page.on('pageerror',lambda err: errors.append(f'pageerror: {err}'))
        page.set_content(inline,wait_until='load')
        page.wait_for_timeout(500)
        page.screenshot(path=str(OUT/'01-hub.png'))
        assert page.locator('#hub.active').count()==1
        assert 'PRISM RUSH' in page.locator('h1').inner_text()

        page.locator('[data-panel="skills"]').click()
        page.wait_for_selector('#panelOverlay.active')
        assert page.locator('.skill-node').count()==20
        page.screenshot(path=str(OUT/'02-skill-tree.png'))
        page.locator('#panelBack').click()

        page.evaluate('window.__PRISM_DEBUG__.startRun(424242)')
        page.wait_for_selector('#gameHud.active')
        start=page.evaluate('window.__PRISM_DEBUG__.state()')
        for hold_ms,release_ms in [(650,550),(900,700),(500,650),(850,700),(550,600)]:
            page.keyboard.down('Space');page.wait_for_timeout(hold_ms);page.keyboard.up('Space');page.wait_for_timeout(release_ms)
        mid=page.evaluate('window.__PRISM_DEBUG__.state()')
        assert mid['player']['x']>start['player']['x']+250, (start,mid)
        assert mid['player']['peakSpeed']>0
        page.screenshot(path=str(OUT/'03-gameplay.png'))

        page.locator('#pauseBtn').click();page.wait_for_selector('#pauseOverlay.active')
        assert page.evaluate('window.__PRISM_DEBUG__.state().mode')=='paused'
        page.locator('#resumeBtn').click();page.wait_for_timeout(100)
        assert page.evaluate('window.__PRISM_DEBUG__.state().mode')=='playing'

        page.evaluate('window.__PRISM_DEBUG__.openPerk(0)')
        page.wait_for_selector('#perkOverlay.active')
        assert page.locator('.perk-card').count()==3
        page.screenshot(path=str(OUT/'04-perk-machine.png'))
        page.locator('.perk-card').first.click();page.wait_for_timeout(150)
        assert page.evaluate('Object.values(window.__PRISM_DEBUG__.state().perks).reduce((a,b)=>a+b,0)')>=1
        assert page.locator('.perk-chip').count()>=1

        page.evaluate('window.__PRISM_DEBUG__.warp(8200, 980, false)')
        page.wait_for_timeout(500)
        page.screenshot(path=str(OUT/'05-final-approach.png'))
        before=page.evaluate('window.__PRISM_DEBUG__.state().boss.armor')
        page.evaluate('window.__PRISM_DEBUG__.strikeBoss()')
        page.wait_for_timeout(250)
        after=page.evaluate('window.__PRISM_DEBUG__.state().boss.armor')
        assert after<before

        page.evaluate("window.__PRISM_DEBUG__.finish('boss')")
        page.wait_for_selector('#summaryOverlay.active')
        assert int(page.locator('#summaryGold').inner_text().replace(',',''))>=0
        page.screenshot(path=str(OUT/'06-summary.png'))
        page.locator('#summaryHubBtn').click();page.wait_for_selector('#hub.active')
        assert page.evaluate('JSON.parse(localStorage.getItem("prismRushBreakpointSave_v1")).totalRuns')>=1

        page.set_viewport_size({'width':844,'height':390});page.wait_for_timeout(120)
        page.screenshot(path=str(OUT/'07-mobile-landscape.png'))
        assert page.locator('#rotatePrompt').evaluate('(e)=>getComputedStyle(e).display')=='none'

        if errors: raise AssertionError('\n'.join(errors))
        report={'status':'PASS','start_x':round(start['player']['x'],1),'mid_x':round(mid['player']['x'],1),'peak_speed':round(mid['player']['peakSpeed'],1),'boss_armor_before':before,'boss_armor_after':after,'screenshots':[p.name for p in sorted(OUT.glob('*.png'))]}
        (OUT/'report.json').write_text(json.dumps(report,indent=2))
        print(json.dumps(report,indent=2))
        browser.close()
finally:
    pass
