const $ = (q, root = document) => root.querySelector(q);
const $$ = (q, root = document) => [...root.querySelectorAll(q)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const easeOut = t => 1 - Math.pow(1 - t, 3);
const fmt = n => Math.round(n).toLocaleString();
const TAU = Math.PI * 2;

class RNG {
  constructor(seed = 1) { this.seed = seed >>> 0 || 1; }
  next() { let t = this.seed += 0x6D2B79F5; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }
  range(a, b) { return a + (b - a) * this.next(); }
  int(a, b) { return Math.floor(this.range(a, b + 1)); }
  pick(arr) { return arr[Math.floor(this.next() * arr.length)]; }
  shuffle(arr) { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(this.next() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; }
}

const SAVE_KEY = 'prismRushBreakpointSave_v1';
const defaultSave = () => ({
  version: 1,
  gold: 0,
  cores: 0,
  totalRuns: 0,
  totalGold: 0,
  bestDistance: 0,
  bestCombo: 0,
  bestSpeed: 0,
  bestBossDamage: 0,
  bossArmor: 3600,
  worldComplete: false,
  gateDamage: [0, 0, 0, 0],
  gateBroken: [false, false, false, false],
  skills: {},
  shells: { prism: true, solar: false, void: false, aurora: false },
  equippedShell: 'prism',
  settings: { audio: true, haptics: true, reducedMotion: false },
  history: [],
  challenges: { perfects: 0, gates: 0, coins: 0 }
});

function loadSave() {
  try {
    const raw = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (!raw || raw.version !== 1) return defaultSave();
    const base = defaultSave();
    return { ...base, ...raw, settings: { ...base.settings, ...raw.settings }, shells: { ...base.shells, ...raw.shells }, challenges: { ...base.challenges, ...raw.challenges } };
  } catch { return defaultSave(); }
}

let save = loadSave();
function persist() { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); updateHub(); }

const SKILL_BRANCHES = [
  {
    id: 'momentum', name: 'Momentum', color: '#63f6ff', icon: 'momentum', desc: 'Distance, retention and speed cap.',
    nodes: [
      ['launchForce','Kinetic Ignition','Start every run with a stronger launch.',120],
      ['retention','Vector Memory','Clean landings preserve more velocity.',260],
      ['perfectBoost','Prism Wake','Perfect landings deliver a larger burst.',460],
      ['speedCap','Overdrive Shell','Raise maximum controllable speed.',730],
      ['gateCarry','Breach Momentum','Keep more speed after breaking gates.',1050]
    ]
  },
  {
    id: 'control', name: 'Control', color: '#8e7bff', icon: 'control', desc: 'Forgiveness without removing mastery.',
    nodes: [
      ['cleanWindow','Tangent Sense','Widen the clean landing range.',120],
      ['perfectWindow','Apex Timing','Slightly widen the perfect window.',270],
      ['diveResponse','Gravity Link','Holding pulls the core down faster.',480],
      ['roughLoss','Recovery Matrix','Rough landings lose less speed.',750],
      ['crashGuard','Flow State','The first crash each run becomes rough.',1080]
    ]
  },
  {
    id: 'destruction', name: 'Destruction', color: '#ff557e', icon: 'destruction', desc: 'Gate pressure and boss conversion.',
    nodes: [
      ['impact','Impact Lattice','All collision damage is increased.',130],
      ['gatePen','Gatebreaker','Deal substantially more gate damage.',280],
      ['comboDamage','Chain Reactor','Combos convert into more impact power.',500],
      ['excessDamage','Redline Payload','Excess speed adds bonus damage.',780],
      ['breakpoint','Breakpoint','First boss strike scales from peak speed.',1120]
    ]
  },
  {
    id: 'fortune', name: 'Fortune', color: '#ffd45b', icon: 'fortune', desc: 'Gold, rarity and build flexibility.',
    nodes: [
      ['coinValue','Prism Mint','Every coin is worth more gold.',120],
      ['magnet','Attractor Field','Increase natural coin pickup range.',260],
      ['runMult','Route Dividend','Sector progress boosts final payout.',460],
      ['rarity','Refined Chips','Improve the chance of upgraded perks.',730],
      ['freeReroll','Golden Route','Gain one free perk reroll each run.',1050]
    ]
  }
];

const SKILLS = Object.fromEntries(SKILL_BRANCHES.flatMap(branch => branch.nodes.map((n, i) => [n[0], { id:n[0], name:n[1], desc:n[2], cost:n[3], branch:branch.id, index:i }])));
const hasSkill = id => !!save.skills[id];

const PERKS = [
  { id:'afterburn', name:'Afterburn', family:'MOMENTUM', icon:'afterburn', color:'#63f6ff', desc:'Perfect landings produce an additional speed burst.', rarity:'UNCOMMON' },
  { id:'valleyCharge', name:'Valley Charge', family:'MOMENTUM', icon:'valley-charge', color:'#63f6ff', desc:'Holding through a full downhill stores bonus launch energy.', rarity:'COMMON' },
  { id:'elasticShell', name:'Elastic Shell', family:'MOMENTUM', icon:'elastic-shell', color:'#63f6ff', desc:'The first rough landing in each sector is treated as clean.', rarity:'RARE' },
  { id:'wideWindow', name:'Wide Window', family:'PRECISION', icon:'wide-window', color:'#8e7bff', desc:'Slightly enlarges the perfect landing angle.', rarity:'COMMON' },
  { id:'echoLanding', name:'Echo Landing', family:'PRECISION', icon:'echo-landing', color:'#8e7bff', desc:'Every third perfect landing triggers its burst twice.', rarity:'RARE' },
  { id:'comboShield', name:'Combo Shield', family:'PRECISION', icon:'combo-shield', color:'#8e7bff', desc:'One rough landing does not break the current combo.', rarity:'UNCOMMON' },
  { id:'siegeCore', name:'Siege Core', family:'DESTRUCTION', icon:'siege-core', color:'#ff557e', desc:'Increase damage against gates and outer boss armor.', rarity:'COMMON' },
  { id:'fracture', name:'Fracture', family:'DESTRUCTION', icon:'fracture', color:'#ff557e', desc:'The first boss strike ignores part of its armor.', rarity:'RARE' },
  { id:'reboundStrike', name:'Rebound Strike', family:'DESTRUCTION', icon:'rebound-strike', color:'#ff557e', desc:'After striking the boss, return with additional launch force.', rarity:'UNCOMMON' },
  { id:'coinMagnet', name:'Coin Magnet', family:'FORTUNE', icon:'coin-magnet', color:'#ffd45b', desc:'Nearby gold bends strongly toward the ball.', rarity:'COMMON' },
  { id:'compoundInterest', name:'Compound Interest', family:'FORTUNE', icon:'compound-interest', color:'#ffd45b', desc:'Each completed sector raises the final gold multiplier.', rarity:'UNCOMMON' },
  { id:'goldenRhythm', name:'Golden Rhythm', family:'FORTUNE', icon:'golden-rhythm', color:'#ffd45b', desc:'Perfect chains steadily increase coin value.', rarity:'RARE' }
];
const PERK_MAP = Object.fromEntries(PERKS.map(p => [p.id,p]));

const SHELLS = [
  { id:'prism', name:'Prism Core', price:0, a:'#bfffff', b:'#2771d8', desc:'Balanced crystalline shell with a cyan wake.' },
  { id:'solar', name:'Solar Flare', price:850, a:'#fff1a0', b:'#ff6b3d', desc:'A heated amber core with ember sparks.' },
  { id:'void', name:'Null Pearl', price:1350, a:'#d7b4ff', b:'#432080', desc:'Deep-violet shell with a fractured star trail.' },
  { id:'aurora', name:'Aurora Pulse', price:1900, a:'#92ffd7', b:'#ec62ff', desc:'Iridescent shell that shifts through the spectrum.' }
];

class AudioEngine {
  constructor(){ this.ctx=null; this.master=null; this.musicTimer=0; this.step=0; }
  ensure(){
    if(!save.settings.audio) return;
    if(!this.ctx){
      this.ctx=new (window.AudioContext||window.webkitAudioContext)();
      this.master=this.ctx.createGain(); this.master.gain.value=.18; this.master.connect(this.ctx.destination);
    }
    if(this.ctx.state==='suspended') this.ctx.resume();
  }
  tone(freq=440,dur=.12,type='sine',gain=.2,slide=0){
    if(!save.settings.audio) return; this.ensure(); if(!this.ctx) return;
    const t=this.ctx.currentTime, o=this.ctx.createOscillator(), g=this.ctx.createGain();
    o.type=type; o.frequency.setValueAtTime(freq,t); if(slide) o.frequency.exponentialRampToValueAtTime(Math.max(30,freq+slide),t+dur);
    g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(gain,t+.01); g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    o.connect(g); g.connect(this.master); o.start(t); o.stop(t+dur+.03);
  }
  noise(dur=.12,gain=.14,highpass=500){
    if(!save.settings.audio) return; this.ensure(); if(!this.ctx) return;
    const len=this.ctx.sampleRate*dur, buf=this.ctx.createBuffer(1,len,this.ctx.sampleRate), data=buf.getChannelData(0);
    for(let i=0;i<len;i++) data[i]=(Math.random()*2-1)*(1-i/len);
    const src=this.ctx.createBufferSource(), filter=this.ctx.createBiquadFilter(), g=this.ctx.createGain();
    src.buffer=buf; filter.type='highpass'; filter.frequency.value=highpass; g.gain.value=gain;
    src.connect(filter); filter.connect(g); g.connect(this.master); src.start();
  }
  click(){this.tone(680,.055,'triangle',.11,-90)}
  coin(){this.tone(940,.09,'sine',.13,280)}
  clean(){this.tone(370,.11,'triangle',.13,120)}
  perfect(combo=1){this.tone(520+Math.min(combo,8)*24,.16,'sine',.18,260);setTimeout(()=>this.tone(780+combo*18,.1,'triangle',.1,120),45)}
  rough(){this.noise(.12,.13,180);this.tone(130,.13,'sawtooth',.08,-45)}
  crash(){this.noise(.25,.22,70);this.tone(85,.33,'square',.12,-35)}
  gateBreak(){this.noise(.45,.25,120);[110,165,220,330].forEach((f,i)=>setTimeout(()=>this.tone(f,.3,'sawtooth',.1,180),i*45))}
  bossHit(){this.noise(.35,.25,180);this.tone(70,.4,'sawtooth',.18,90);setTimeout(()=>this.tone(420,.25,'square',.12,-190),90)}
  upgrade(){[440,554,659,880].forEach((f,i)=>setTimeout(()=>this.tone(f,.16,'triangle',.13,80),i*65)}
  startMusic(){this.ensure();this.musicTimer=0;this.step=0}
  updateMusic(dt,intensity=0){
    if(!save.settings.audio||!this.ctx)return;
    this.musicTimer-=dt; if(this.musicTimer>0)return;
    const scale=[110,130.81,146.83,164.81,196,220]; const f=scale[this.step%scale.length]*(intensity>.65?2:1);
    this.tone(f,.17,'triangle',.035+intensity*.025,20); if(this.step%4===0)this.tone(55,.28,'sine',.045,0);
    this.musicTimer=.29-intensity*.08; this.step++;
  }
}
const audio=new AudioEngine();
function haptic(pattern){ if(save.settings.haptics&&navigator.vibrate) navigator.vibrate(pattern); }

const canvas=$('#game'), ctx=canvas.getContext('2d',{alpha:false});
let W=innerWidth,H=innerHeight,DPR=Math.min(devicePixelRatio||1,2);
function resize(){ W=innerWidth;H=innerHeight;DPR=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(W*DPR);canvas.height=Math.round(H*DPR);canvas.style.width=W+'px';canvas.style.height=H+'px';ctx.setTransform(DPR,0,0,DPR,0,0); }
addEventListener('resize',resize);resize();

const app={mode:'hub',game:null,panel:null,inputHeld:false,lastInputHeld:false,pointerId:null};

class Terrain {
  constructor(seed){
    this.seed=seed;this.rng=new RNG(seed);this.points=[];this.length=9400;
    this.build();
  }
  build(){
    const patterns={
      safe:[0,90,130,60,-10,30], speed:[0,120,175,70,-55,-10], precision:[0,70,140,25,-95,-15],
      launch:[0,125,170,30,-145,-30], recovery:[0,65,95,50,5,20], coin:[0,105,150,55,-70,-10],
      final:[0,145,190,50,-155,-25], boss:[0,110,165,45,-120,-10]
    };
    const plan=['safe','speed','coin','recovery','precision','speed','launch','recovery','coin','precision','speed','recovery','launch','coin','precision','speed','final','boss'];
    let x=0, base=485; this.points.push({x:0,y:base,type:'start'});
    for(let s=0;s<plan.length;s++){
      const type=plan[s], arr=patterns[type], width=type==='final'||type==='boss'?520:this.rng.range(430,560);
      const amp=this.rng.range(.86,1.12); const jitter=this.rng.range(-18,18);
      for(let i=1;i<arr.length;i++){
        const px=x+(i/(arr.length-1))*width;
        let y=base+arr[i]*amp+jitter*(i/(arr.length-1));
        y=clamp(y,300,635);
        this.points.push({x:px,y,type});
      }
      x+=width; base=this.points[this.points.length-1].y;
    }
    // Extend through boss bumper.
    this.length=x+500;
    this.points.push({x:this.length,y:470,type:'boss'});
    // Smooth transitions and enforce authored gate approach heights.
    for(let k=0;k<3;k++) for(let i=1;i<this.points.length-1;i++) this.points[i].y=(this.points[i-1].y+this.points[i].y*2+this.points[i+1].y)/4;
  }
  locate(x){
    x=clamp(x,0,this.length);
    let lo=0,hi=this.points.length-1;
    while(lo<hi-1){const m=(lo+hi)>>1;if(this.points[m].x<=x)lo=m;else hi=m;}
    return lo;
  }
  at(x){
    const i=this.locate(x), p0=this.points[Math.max(0,i-1)],p1=this.points[i],p2=this.points[Math.min(this.points.length-1,i+1)],p3=this.points[Math.min(this.points.length-1,i+2)];
    const span=Math.max(1,p2.x-p1.x),t=clamp((x-p1.x)/span,0,1),t2=t*t,t3=t2*t;
    const y=.5*((2*p1.y)+(-p0.y+p2.y)*t+(2*p0.y-5*p1.y+4*p2.y-p3.y)*t2+(-p0.y+3*p1.y-3*p2.y+p3.y)*t3);
    const dy=.5*((-p0.y+p2.y)+2*(2*p0.y-5*p1.y+4*p2.y-p3.y)*t+3*(-p0.y+3*p1.y-3*p2.y+p3.y)*t2)/span;
    return {y,slope:dy};
  }
}

class Particle {
  constructor(x,y,vx,vy,life,size,color,type='dot'){Object.assign(this,{x,y,vx,vy,life,maxLife:life,size,color,type,rot:Math.random()*TAU})}
}

class Game {
  constructor(seed=Date.now()%2147483647){
    this.seed=seed;this.rng=new RNG(seed);this.terrain=new Terrain(seed);this.fixed=1/120;this.acc=0;this.last=performance.now();
    this.camera={x:0,y:360,zoom:1,shake:0,flash:0,desat:0};
    this.player={x:170,y:0,vx:0,vy:0,r:25,grounded:true,speed:360,combo:0,bestCombo:0,peakSpeed:0,charge:0,squash:0,angle:0,trail:[],crashGuard:hasSkill('crashGuard'),sectorElastic:{},comboShield:true};
    const t=this.terrain.at(this.player.x);this.player.y=t.y-this.player.r;
    this.gateXs=[1900,3700,5500,7000];
    this.gates=this.gateXs.map((x,i)=>{
      const max=[2400,3200,4200,5200][i],persistent=save.gateBroken[i]?0:save.gateDamage[i];
      return {x,max,baseHp:save.gateBroken[i]?190:Math.max(120,max-persistent),hp:save.gateBroken[i]?190:Math.max(120,max-persistent),broken:false,index:i,flash:0};
    });
    this.bossX=Math.min(this.terrain.length-260,8950);this.recoveryX=this.bossX-1450;
    this.coins=[];this.makeCoins();
    this.particles=[];this.rings=[];this.floaters=[];this.runGold=0;this.rawCoins=0;this.damage=0;this.distance=0;this.sectors=0;
    this.perks={};this.rerolls=hasSkill('freeReroll')?1:0;this.perkPending=null;this.pauseReason='';this.state='playing';this.lowSpeedTime=0;this.elapsed=0;this.gatesBroken=0;this.perfects=0;this.landings=0;this.currentSector=0;
    this.boss={active:false,pass:1,armor:save.bossArmor,armorMax:3600,shield:1250,shieldMax:1250,core:2300,coreMax:2300,cooldown:0,direction:1,hitFlash:0,defeated:false};
    this.intro=5;this.endTimer=0;this.pendingEnd=null;this.slowmo=1;this.success=false;this.lastGrade='FLOW';
    audio.startMusic();
    this.syncHud();
  }
  perkLevel(id){return this.perks[id]||0}
  makeCoins(){
    const rng=new RNG(this.seed^0xA531);let x=420;
    while(x<this.bossX-250){
      const gap=rng.range(95,165),count=rng.int(3,7),arc=rng.range(50,125),spacing=rng.range(40,58);
      for(let i=0;i<count;i++){
        const cx=x+i*spacing,ground=this.terrain.at(cx).y;
        const wave=Math.sin((i/(Math.max(1,count-1)))*Math.PI);
        this.coins.push({x:cx,y:ground-55-wave*arc,r:12,collected:false,phase:rng.range(0,TAU)});
      }
      x+=count*spacing+gap;
    }
  }
  start(){
    $('#hub').classList.remove('active');$('#gameHud').classList.add('active');$('#gameHud').setAttribute('aria-hidden','false');
    app.mode='game';app.game=this;this.last=performance.now();this.loopId=requestAnimationFrame(t=>this.loop(t));
  }
  stop(){cancelAnimationFrame(this.loopId);}
  loop(now){
    if(app.game!==this)return;
    const raw=Math.min(.05,(now-this.last)/1000);this.last=now;
    const timeScale=this.state==='playing'?this.slowmo:0;
    this.acc+=raw*timeScale;
    let steps=0;while(this.acc>=this.fixed&&steps<10){this.update(this.fixed);this.acc-=this.fixed;steps++;}
    this.render(raw);this.updateDom();
    this.loopId=requestAnimationFrame(t=>this.loop(t));
  }
  getStats(){
    return {
      launch:360+(hasSkill('launchForce')?90:0),
      retention:hasSkill('retention')?1.055:1.015,
      perfectBoost:hasSkill('perfectBoost')?1.16:1.1,
      cap:hasSkill('speedCap')?1320:1120,
      gateCarry:hasSkill('gateCarry')?.86:.73,
      cleanWindow:(hasSkill('cleanWindow')?.91:.935),
      perfectWindow:(hasSkill('perfectWindow')?.972:.982),
      dive:hasSkill('diveResponse')?1600:1350,
      rough:hasSkill('roughLoss')?.79:.66,
      impact:hasSkill('impact')?1.26:1,
      gatePen:hasSkill('gatePen')?1.34:1,
      comboDamage:hasSkill('comboDamage')?.1:.068,
      excess:hasSkill('excessDamage')?.0018:.0008,
      coin:hasSkill('coinValue')?1.45:1,
      magnet:hasSkill('magnet')?110:72,
      runMult:hasSkill('runMult')?.1:.055
    };
  }
  update(dt){
    if(this.state!=='playing')return;
    this.elapsed+=dt;this.intro=Math.max(0,this.intro-dt);this.camera.flash=Math.max(0,this.camera.flash-dt*2.5);this.camera.desat=Math.max(0,this.camera.desat-dt*2.7);this.camera.shake=Math.max(0,this.camera.shake-dt*8);
    this.boss.cooldown=Math.max(0,this.boss.cooldown-dt);this.boss.hitFlash=Math.max(0,this.boss.hitFlash-dt*3);
    this.gates.forEach(g=>g.flash=Math.max(0,g.flash-dt*3));
    const p=this.player,s=this.getStats();
    if(this.elapsed<.15)p.speed=s.launch;
    const held=app.inputHeld, justReleased=app.lastInputHeld&&!held;app.lastInputHeld=held;
    if(p.grounded){
      const surf=this.terrain.at(p.x), dir=this.boss.direction,tx=dir/Math.sqrt(1+surf.slope*surf.slope),ty=surf.slope*tx;
      const downhill=ty>0;
      let accel=940*ty;
      if(held&&downhill){accel+=700*Math.abs(ty)+140;p.charge=clamp(p.charge+dt*(.75+Math.abs(ty)),0,1.5+this.perkLevel('valleyCharge')*.45)}
      else p.charge=Math.max(0,p.charge-dt*.18);
      p.speed=clamp(p.speed+accel*dt-p.speed*.018*dt,60,s.cap+this.perkLevel('afterburn')*70);
      p.vx=tx*p.speed;p.vy=ty*p.speed;p.x+=p.vx*dt;p.y=this.terrain.at(p.x).y-p.r;
      p.angle=Math.atan2(p.vy,p.vx);
      const uphill=ty<-.10;
      if(!held&&uphill&&p.speed>300&&(justReleased||p.charge>.08)){
        const boost=1+Math.min(.14,p.charge*.075)+this.perkLevel('valleyCharge')*.03;
        p.grounded=false;p.vx*=boost;p.vy=p.vy*boost-25-Math.min(100,p.charge*46);p.speed=Math.hypot(p.vx,p.vy);p.charge=0;
        this.emitTrailBurst(p.x,p.y,8,'#63f6ff');audio.tone(250,.1,'triangle',.07,150);
      }
    }else{
      const oldX=p.x,oldY=p.y,dive=held?s.dive:850;
      p.vy+=dive*dt;p.vx*=Math.pow(.9994,dt*120);
      const nextX=p.x+p.vx*dt,nextY=p.y+p.vy*dt,travel=Math.hypot(nextX-oldX,nextY-oldY),substeps=Math.max(1,Math.ceil(travel/(p.r*.42)));
      let collided=false;
      for(let i=1;i<=substeps;i++){
        const t=i/substeps,sx=lerp(oldX,nextX,t),sy=lerp(oldY,nextY,t),surf=this.terrain.at(sx);
        if(sy+p.r>=surf.y&&p.vy>-250){p.x=sx;p.y=sy;this.land(surf);collided=true;break;}
      }
      if(!collided){p.x=nextX;p.y=nextY;p.speed=Math.hypot(p.vx,p.vy);p.angle=Math.atan2(p.vy,p.vx);}
    }
    p.peakSpeed=Math.max(p.peakSpeed,p.speed);this.distance=Math.max(this.distance,p.x);
    p.trail.push({x:p.x,y:p.y,life:1});if(p.trail.length>60)p.trail.shift();p.trail.forEach(t=>t.life-=dt*2.1);p.trail=p.trail.filter(t=>t.life>0);
    this.collectCoins(dt);this.checkGates();this.checkBoss();this.updateParticles(dt);this.updateSector();
    if(!this.boss.active&&this.elapsed>2){
      if(p.speed<115)this.lowSpeedTime+=dt;else this.lowSpeedTime=Math.max(0,this.lowSpeedTime-dt*2);
      if(this.lowSpeedTime>2.2)this.scheduleEnd('momentum');
    }
    if(p.y>850)this.scheduleEnd('crash');
    this.camera.zoom=lerp(this.camera.zoom,1-clamp((p.speed-500)/4000,0,.16),dt*2.2);
    const lead=(this.boss.direction>0?W*.26:-W*.12)/(H/720);
    this.camera.x=lerp(this.camera.x,p.x-lead,1-Math.pow(.002,dt));
    this.camera.y=lerp(this.camera.y,p.y-30,1-Math.pow(.01,dt));
    if(this.slowmo<1)this.slowmo=Math.min(1,this.slowmo+dt*.9);
    audio.updateMusic(dt,clamp((p.speed-250)/1000,0,1));
    if(this.pendingEnd){this.endTimer-=dt;if(this.endTimer<=0)this.finishRun(this.pendingEnd)}
  }
  updateSector(){
    const old=this.currentSector;this.currentSector=clamp(Math.floor(this.player.x/(this.bossX/5)),0,4);
    if(this.currentSector>old){this.sectors=Math.max(this.sectors,this.currentSector);this.floatText(this.player.x,this.player.y-80,`SECTOR ${this.currentSector+1}`,'#63f6ff',1.2)}
  }
  land(surf){
    const p=this.player,s=this.getStats(),dir=this.boss.direction,tx=dir/Math.sqrt(1+surf.slope*surf.slope),ty=surf.slope*tx;
    const mag=Math.max(1,Math.hypot(p.vx,p.vy));const dot=(p.vx/mag)*tx+(p.vy/mag)*ty;
    let grade=dot>=s.perfectWindow-this.perkLevel('wideWindow')*.006?'PERFECT':dot>=s.cleanWindow?'CLEAN':dot>=.69?'ROUGH':'CRASH';
    const sector=Math.floor(p.x/(this.bossX/5));
    if(grade==='ROUGH'&&this.perkLevel('elasticShell')&&!p.sectorElastic[sector]){grade='CLEAN';p.sectorElastic[sector]=true;this.floatText(p.x,p.y-55,'ELASTIC SAVE','#63f6ff',.9)}
    if(grade==='CRASH'&&p.crashGuard){grade='ROUGH';p.crashGuard=false;this.floatText(p.x,p.y-60,'FLOW STATE SAVE','#8e7bff',1)}
    const projected=Math.max(70,p.vx*tx+p.vy*ty);
    p.grounded=true;p.x=clamp(p.x,0,this.terrain.length);p.y=surf.y-p.r;
    this.landings++;
    if(grade==='PERFECT'){
      p.combo++;p.bestCombo=Math.max(p.bestCombo,p.combo);this.perfects++;
      let mult=s.perfectBoost+this.perkLevel('afterburn')*.045;
      if(this.perkLevel('echoLanding')&&p.combo%3===0){mult+=.11*this.perkLevel('echoLanding');this.rings.push({x:p.x,y:p.y,r:16,life:1,color:'#ff4fc8'});this.floatText(p.x,p.y-75,'ECHO','#ff4fc8',.8)}
      p.speed=clamp(projected*mult+42,70,s.cap+this.perkLevel('afterburn')*70);
      this.rings.push({x:p.x,y:surf.y,r:12,life:1,color:'#63f6ff'});this.emitTrailBurst(p.x,p.y,20,'#63f6ff');this.camera.shake=.24;audio.perfect(p.combo);haptic([12]);
    }else if(grade==='CLEAN'){
      p.speed=clamp(projected*s.retention+10,70,s.cap);this.rings.push({x:p.x,y:surf.y,r:10,life:.65,color:'#8e7bff'});this.emitTrailBurst(p.x,p.y,9,'#8e7bff');audio.clean();haptic(6);
    }else if(grade==='ROUGH'){
      if(this.perkLevel('comboShield')&&p.comboShield){p.comboShield=false;this.floatText(p.x,p.y-62,'COMBO SHIELD','#8e7bff',1)}else p.combo=Math.max(0,p.combo-2);
      p.speed=Math.max(105,projected*s.rough);p.squash=.7;this.camera.shake=.55;this.camera.desat=.35;this.emitDust(p.x,surf.y,18);audio.rough();haptic([18,20,18]);
    }else{
      p.combo=0;p.speed=Math.max(70,projected*.34);p.squash=1;this.camera.shake=1;this.camera.desat=.65;this.camera.flash=.18;this.emitDust(p.x,surf.y,35);audio.crash();haptic([30,30,45]);
    }
    p.vx=tx*p.speed;p.vy=ty*p.speed;this.lastGrade=grade;this.showGrade(grade);
  }
  showGrade(grade){
    const el=$('#comboHud');$('#landingGrade').textContent=grade;el.classList.remove('hit');void el.offsetWidth;el.classList.add('hit');setTimeout(()=>el.classList.remove('hit'),180);
  }
  collectCoins(dt){
    const p=this.player,s=this.getStats(),mag=s.magnet+this.perkLevel('coinMagnet')*65;
    for(const c of this.coins){
      if(c.collected||Math.abs(c.x-p.x)>mag+90)continue;
      let dx=p.x-c.x,dy=p.y-c.y,d=Math.hypot(dx,dy);
      if(d<mag&&this.perkLevel('coinMagnet')){const pull=(1-d/mag)*850*dt;c.x+=dx/d*pull;c.y+=dy/d*pull;d=Math.hypot(p.x-c.x,p.y-c.y)}
      if(d<p.r+c.r+7){
        c.collected=true;const rhythm=1+this.perkLevel('goldenRhythm')*Math.min(.7,p.combo*.035);const value=Math.round(6*s.coin*rhythm);
        this.runGold+=value;this.rawCoins++;this.emitCoin(c.x,c.y);audio.coin();
      }
    }
  }
  gateDamage(g){
    const p=this.player,s=this.getStats();let dmg=(p.speed*.62+Math.max(0,p.speed-650)*.3)*(1+p.combo*.045)*s.impact*s.gatePen*(1+this.perkLevel('siegeCore')*.24);
    if(this.perkLevel('fracture')&&this.gatesBroken===0)dmg*=1.08;
    return Math.round(dmg);
  }
  checkGates(){
    const p=this.player;if(this.boss.direction<0)return;
    for(const g of this.gates){
      if(g.broken||Math.abs(p.x-g.x)>80)continue;
      if(p.x+p.r>=g.x&&p.vx>0){
        const dmg=this.gateDamage(g);g.hp-=dmg;g.flash=1;this.camera.shake=1.2;this.camera.flash=.35;this.floatText(g.x,this.terrain.at(g.x).y-170,`-${fmt(dmg)}`,'#ffd45b',1);audio.bossHit();haptic([25,20,35]);
        if(!save.gateBroken[g.index]){save.gateDamage[g.index]=clamp(save.gateDamage[g.index]+dmg,0,g.max);}
        if(g.hp<=0){
          g.broken=true;this.gatesBroken++;save.gateBroken[g.index]=true;save.gateDamage[g.index]=g.max;save.challenges.gates++;
          p.speed*=this.getStats().gateCarry;p.x=g.x+45;this.breakGate(g);persist();
          if(g.index<3)setTimeout(()=>{if(app.game===this&&this.state==='playing')this.openPerkMachine(g.index)},620);
        }else{
          p.grounded=false;p.vx=-Math.max(260,p.speed*.34);p.vy=-180;p.speed=Math.hypot(p.vx,p.vy);this.boss.direction=-1;
          persist();this.scheduleEnd('gate',1.15);
        }
      }
    }
  }
  breakGate(g){
    audio.gateBreak();haptic([35,25,55]);this.slowmo=.22;const y=this.terrain.at(g.x).y;
    for(let i=0;i<55;i++){const a=this.rng.range(-2.5,-.6),sp=this.rng.range(120,520);this.particles.push(new Particle(g.x+this.rng.range(-20,20),y-this.rng.range(30,200),Math.cos(a)*sp,Math.sin(a)*sp,this.rng.range(.6,1.4),this.rng.range(4,15),i%3?'#63f6ff':'#ff4fc8','shard'))}
    this.rings.push({x:g.x,y:y-80,r:20,life:1.5,color:'#ffd45b'});this.floatText(g.x,y-230,'GATE SHATTERED','#ffd45b',1.4);
  }
  openPerkMachine(index){
    this.state='perk';this.pauseReason='perk';this.perkPending=index;app.inputHeld=false;app.lastInputHeld=false;
    const overlay=$('#perkOverlay');overlay.classList.add('active');overlay.setAttribute('aria-hidden','false');this.rollPerks();
  }
  rollPerks(){
    const weighted=[...PERKS];if(hasSkill('rarity'))weighted.push(...PERKS.filter(p=>p.rarity!=='COMMON'));
    const rng=new RNG(this.seed+this.perkPending*997+Object.values(this.perks).reduce((a,b)=>a+b,0)*41+this.rerolls*13);
    const choices=[];const ids=new Set();while(choices.length<3){const p=rng.pick(weighted);if(!ids.has(p.id)){ids.add(p.id);choices.push(p)}}
    const box=$('#perkChoices');box.innerHTML='';
    choices.forEach(p=>{
      const level=this.perkLevel(p.id)+1;const card=document.createElement('button');card.className='perk-card';card.style.setProperty('--perk-color',p.color);card.style.setProperty('--perk-glow',p.color+'99');
      card.innerHTML=`<span class="perk-rarity">${p.rarity}</span><span class="perk-level">TIER ${level}</span><div class="perk-art"><img src="assets/icons/${p.icon}.svg" alt=""/></div><h3>${p.name}${level>1?` ${roman(level)}`:''}</h3><p>${p.desc}</p><span class="perk-family">${p.family} BUILD</span><i class="perk-pick">＋</i>`;
      card.addEventListener('click',()=>this.choosePerk(p.id));box.appendChild(card);
    });
    $('#rerollCount').textContent=this.rerolls;$('#rerollBtn').disabled=this.rerolls<=0;
  }
  reroll(){if(this.rerolls<=0)return;this.rerolls--;audio.click();this.rollPerks()}
  choosePerk(id){
    this.perks[id]=(this.perks[id]||0)+1;audio.upgrade();haptic([15,20,25]);this.syncPerks();
    $('#perkOverlay').classList.remove('active');$('#perkOverlay').setAttribute('aria-hidden','true');this.state='playing';this.pauseReason='';this.perkPending=null;this.last=performance.now();toast('RUN MODIFIER',`${PERK_MAP[id].name} ${roman(this.perks[id])}`);
  }
  bossDamage(){
    const p=this.player,s=this.getStats();let dmg=p.speed*1.16*(1+p.combo*s.comboDamage)*s.impact*(1+Math.max(0,p.speed-650)*s.excess);
    if(hasSkill('breakpoint')&&this.boss.pass===1)dmg+=p.peakSpeed*.52;
    if(this.perkLevel('fracture')&&this.boss.pass===1)dmg*=1.25;
    return Math.round(dmg);
  }
  checkBoss(){
    const p=this.player,b=this.boss;
    if(!b.active&&p.x>this.bossX-1100){b.active=true;$('#bossHud').classList.add('active');$('#bossHud').setAttribute('aria-hidden','false');toast('BOSS APPROACH','Convert the chain into impact power.');}
    if(!b.active)return;
    if(b.direction<0&&p.x<=this.recoveryX){
      b.direction=1;p.grounded=false;p.vx=Math.max(480,Math.abs(p.vx)*(1.03+this.perkLevel('reboundStrike')*.08));p.vy=-140;p.speed=Math.hypot(p.vx,p.vy);this.rings.push({x:p.x,y:p.y,r:20,life:1.2,color:'#ff4fc8'});this.floatText(p.x,p.y-70,'REBOUND CHANNEL','#ff4fc8',1.2);audio.tone(250,.25,'triangle',.14,430);return;
    }
    if(b.direction>0&&b.cooldown<=0&&p.x+p.r>=this.bossX-35){this.strikeBoss();}
  }
  strikeBoss(){
    const p=this.player,b=this.boss,dmg=this.bossDamage();let remaining=dmg,armorHit=0,shieldHit=0,coreHit=0;
    if(b.armor>0){armorHit=Math.min(b.armor,remaining);b.armor-=armorHit;remaining-=armorHit;save.bossArmor=b.armor;}
    if(remaining>0&&b.armor<=0&&b.shield>0){shieldHit=Math.min(b.shield,remaining);b.shield-=shieldHit;remaining-=shieldHit;}
    if(remaining>0&&b.armor<=0&&b.shield<=0){coreHit=Math.min(b.core,remaining);b.core-=coreHit;remaining-=coreHit;}
    const dealt=armorHit+shieldHit+coreHit;this.damage+=dealt;save.bestBossDamage=Math.max(save.bestBossDamage,dealt);persist();
    this.camera.shake=2.2;this.camera.flash=.75;this.slowmo=.13;b.hitFlash=1;audio.bossHit();haptic([45,30,65]);
    for(let i=0;i<80;i++){const a=this.rng.range(Math.PI*.65,Math.PI*1.35),sp=this.rng.range(130,650);this.particles.push(new Particle(this.bossX-40,this.terrain.at(this.bossX).y-160,Math.cos(a)*sp,Math.sin(a)*sp,this.rng.range(.5,1.5),this.rng.range(4,18),i%3?'#ff4fc8':'#63f6ff','shard'))}
    this.floatText(this.bossX-90,this.terrain.at(this.bossX).y-270,`IMPACT ${fmt(dealt)}`,'#ffd45b',1.6);
    if(b.core<=0){b.defeated=true;this.success=true;save.worldComplete=true;if(save.cores<1)save.cores=1;persist();setTimeout(()=>this.scheduleEnd('victory',.1),900);return;}
    if(b.pass>=3){this.scheduleEnd('boss',1.25);return;}
    b.pass++;b.direction=-1;b.cooldown=.9;p.grounded=false;p.x=this.bossX-90;p.vx=-Math.max(520,p.speed*(.68+this.perkLevel('reboundStrike')*.07));p.vy=-260;p.speed=Math.hypot(p.vx,p.vy);p.combo=Math.max(0,p.combo-1);
  }
  scheduleEnd(reason,delay=.8){if(this.pendingEnd)return;this.pendingEnd=reason;this.endTimer=delay;}
  finishRun(reason){
    if(this.state==='summary')return;clearToasts();this.state='summary';this.pendingEnd=null;app.inputHeld=false;app.lastInputHeld=false;
    const progress=clamp(this.distance/this.bossX,0,1),sectorBonus=1+this.sectors*this.getStats().runMult+this.perkLevel('compoundInterest')*.08*this.sectors;
    const bossBonus=Math.round(this.damage*.035),distanceBonus=Math.round(progress*90),gateBonus=this.gatesBroken*45;
    const attemptBonus=40+Math.round(progress*35);
    const banked=Math.round((this.runGold+distanceBonus+gateBonus+bossBonus+attemptBonus)*sectorBonus)+(reason==='victory'?550:0);
    const oldBest=save.bestDistance,oldCombo=save.bestCombo;
    save.gold+=banked;save.totalGold+=banked;save.totalRuns++;save.bestDistance=Math.max(save.bestDistance,this.distance);save.bestCombo=Math.max(save.bestCombo,this.player.bestCombo);save.bestSpeed=Math.max(save.bestSpeed,this.player.peakSpeed);save.challenges.perfects+=this.perfects;save.challenges.coins+=this.rawCoins;
    save.history.unshift({date:Date.now(),distance:Math.round(this.distance),gold:banked,combo:this.player.bestCombo,damage:Math.round(this.damage),reason,seed:this.seed});save.history=save.history.slice(0,12);persist();
    const overlay=$('#summaryOverlay');overlay.classList.add('active');overlay.setAttribute('aria-hidden','false');
    $('#summaryKicker').textContent=reason==='victory'?'WORLD CORE SECURED':reason==='boss'?'BOSS ENCOUNTER COMPLETE':'RUN COMPLETE';
    $('#summaryTitle').textContent=reason==='victory'?'BREAKPOINT REACHED':reason==='gate'?'GATE HELD THE LINE':reason==='boss'?'THE BULWARK ENDURES':'MOMENTUM LOST';
    $('#summarySubtitle').textContent=reason==='victory'?'Neon Expanse is open. The core is yours.':reason==='gate'?'Its fractures remain. Upgrade and hit it harder.':reason==='boss'?'Outer armor damage remains between attempts.':'Gold is banked. Your next launch begins stronger.';
    $('#summaryDistance').textContent=`${Math.round(this.distance/10)} m`;$('#summaryGold').textContent=fmt(banked);$('#summaryCombo').textContent=`x${this.player.bestCombo}`;$('#summaryDamage').textContent=fmt(this.damage);
    $('#distanceRecord').textContent=this.distance>oldBest?'NEW RECORD':'';$('#comboRecord').textContent=this.player.bestCombo>oldCombo?'NEW RECORD':'';
    $('#goldBreakdown').textContent=`COINS ${this.runGold} · ROUTE +${distanceBonus+gateBonus} · ATTEMPT +${attemptBonus}`;$('#damageBreakdown').textContent=this.damage?`ARMOR REMAINS ${fmt(save.bossArmor)}`:'BOSS NOT REACHED';
    this.renderAdvice();
  }
  renderAdvice(){
    const affordable=Object.values(SKILLS).filter(s=>!save.skills[s.id]&&save.gold>=s.cost&&this.skillUnlocked(s.id)).slice(0,4);const box=$('#adviceNodes');box.innerHTML='';
    $('#upgradeAdvice').textContent=affordable.length?`${affordable.length} MEANINGFUL UPGRADE${affordable.length>1?'S':''} READY`:'NEXT UPGRADE IN REACH';
    affordable.forEach(s=>{const img=document.createElement('img');img.src=`assets/icons/${SKILL_BRANCHES.find(b=>b.id===s.branch).icon}.svg`;img.title=s.name;box.appendChild(img)});
  }
  skillUnlocked(id){const s=SKILLS[id];if(s.index===0)return true;const branch=SKILL_BRANCHES.find(b=>b.id===s.branch);return !!save.skills[branch.nodes[s.index-1][0]]}
  emitTrailBurst(x,y,n,color){for(let i=0;i<n;i++){const a=this.rng.range(0,TAU),sp=this.rng.range(40,220);this.particles.push(new Particle(x,y,Math.cos(a)*sp,Math.sin(a)*sp,this.rng.range(.3,.75),this.rng.range(2,7),color))}}
  emitDust(x,y,n){for(let i=0;i<n;i++){const a=this.rng.range(Math.PI,TAU),sp=this.rng.range(20,200);this.particles.push(new Particle(x,y,Math.cos(a)*sp,Math.sin(a)*sp,this.rng.range(.4,1),this.rng.range(4,12),'#8be8ed'))}}
  emitCoin(x,y){for(let i=0;i<10;i++){const a=this.rng.range(0,TAU),sp=this.rng.range(40,150);this.particles.push(new Particle(x,y,Math.cos(a)*sp,Math.sin(a)*sp,this.rng.range(.25,.6),this.rng.range(2,5),'#ffd45b'))}this.floatText(x,y-15,'+GOLD','#ffd45b',.55)}
  floatText(x,y,text,color,life=1){this.floaters.push({x,y,text,color,life,maxLife:life})}
  updateParticles(dt){
    for(const p of this.particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=420*dt;p.vx*=Math.pow(.985,dt*60);p.life-=dt;p.rot+=dt*3}
    this.particles=this.particles.filter(p=>p.life>0);for(const r of this.rings){r.r+=240*dt;r.life-=dt}this.rings=this.rings.filter(r=>r.life>0);
    for(const f of this.floaters){f.y-=32*dt;f.life-=dt}this.floaters=this.floaters.filter(f=>f.life>0);
    this.player.squash=Math.max(0,this.player.squash-dt*3);
  }
  syncPerks(){const strip=$('#perkStrip');strip.innerHTML='';Object.entries(this.perks).forEach(([id,lv])=>{const p=PERK_MAP[id],el=document.createElement('div');el.className='perk-chip';el.title=p.name;el.innerHTML=`<img src="assets/icons/${p.icon}.svg" alt="${p.name}"/><b>${lv}</b>`;strip.appendChild(el)})}
  syncHud(){this.syncPerks();$('#touchInstruction').classList.remove('hidden');setTimeout(()=>$('#touchInstruction').classList.add('hidden'),6500)}
  updateDom(){
    const p=this.player,b=this.boss;const prog=clamp(p.x/this.bossX,0,1);$('#progressFill').style.width=`${prog*100}%`;$('#progressMarker').style.left=`${prog*100}%`;
    const kmh=Math.round(p.speed*.32);$('#speedValue').textContent=kmh;$('#speedFill').style.width=`${clamp(p.speed/this.getStats().cap*100,0,100)}%`;$('#runGold').textContent=fmt(this.runGold);$('#comboValue').textContent=`x${p.combo}`;
    const forecast=Math.round(this.bossDamage());$('#forecastValue').textContent=fmt(forecast);$('#forecastHud').classList.toggle('active',p.x>this.bossX-1200&&b.direction>0);
    const nearGate=this.gates.find(g=>!g.broken&&Math.abs(g.x-p.x)<600&&this.boss.direction>0);const gateEl=$('#gateOverlay');gateEl.classList.toggle('active',!!nearGate);
    if(nearGate){$('#gateLabel').textContent=`GATE 0${nearGate.index+1}`;const pct=clamp(nearGate.hp/nearGate.baseHp*100,0,100);$('#gateHealthText').textContent=`${Math.ceil(pct)}%`;$('#gateHealthFill').style.width=`${pct}%`}
    if(b.active){$('#bossPassLabel').textContent=`PASS ${b.pass} / 3`;setBar('armor',b.armor,b.armorMax);setBar('shield',b.shield,b.shieldMax);setBar('core',b.core,b.coreMax)}
  }
  render(dt){
    ctx.save();ctx.setTransform(DPR,0,0,DPR,0,0);this.drawSky();
    const scale=(H/720)*this.camera.zoom,shake=this.camera.shake>0?this.camera.shake*7:0,sx=(Math.random()-.5)*shake,sy=(Math.random()-.5)*shake;
    ctx.translate(W/2+sx,H/2+sy);ctx.scale(scale,scale);ctx.translate(-this.camera.x,-this.camera.y);
    this.drawBackMountains(scale);this.drawTerrain(scale);this.drawCoins();this.drawMachines();this.drawBoss();this.drawParticles();this.drawPlayer();this.drawFloaters();ctx.restore();
    if(this.camera.desat>0){ctx.save();ctx.globalAlpha=this.camera.desat*.23;ctx.fillStyle='#c8d1df';ctx.fillRect(0,0,W,H);ctx.restore()}
    if(this.camera.flash>0){ctx.save();ctx.globalAlpha=this.camera.flash*.5;ctx.fillStyle=this.boss.active?'#ff62d2':'#b8ffff';ctx.fillRect(0,0,W,H);ctx.restore()}
    if(this.intro>0)this.drawIntro();
  }
  drawSky(){
    const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#151146');g.addColorStop(.42,'#6b277c');g.addColorStop(.7,'#e14f8e');g.addColorStop(1,'#ff9a76');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    const sunX=W*.78-(this.camera.x*.015)%W,sunY=H*.38;const rg=ctx.createRadialGradient(sunX,sunY,0,sunX,sunY,H*.32);rg.addColorStop(0,'rgba(255,236,192,.45)');rg.addColorStop(.18,'rgba(255,139,174,.16)');rg.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=rg;ctx.fillRect(0,0,W,H);
    ctx.save();ctx.globalAlpha=.55;for(let i=0;i<35;i++){const x=((i*173-this.camera.x*.025)%(W+80)+W+80)%(W+80)-40,y=30+(i*97%(Math.max(80,H*.55)));const tw=.6+.4*Math.sin(this.elapsed*2+i);ctx.fillStyle=i%4?'#bffcff':'#ffb9eb';ctx.globalAlpha=.18+.25*tw;ctx.fillRect(x,y,1.5,1.5)}ctx.restore();
  }
  drawBackMountains(){
    const left=this.camera.x-W/(H/720),right=this.camera.x+W/(H/720);for(let layer=0;layer<3;layer++){
      const par=.12+layer*.13,base=610+layer*35,amp=80-layer*12;ctx.beginPath();ctx.moveTo(left,900);
      for(let x=left-100;x<=right+100;x+=80){const y=base+Math.sin((x*par+this.seed*17)*.0031)*amp+Math.sin((x*par)*.007)*amp*.35;ctx.lineTo(x,y)}ctx.lineTo(right,900);ctx.closePath();ctx.fillStyle=['rgba(30,29,78,.38)','rgba(23,24,72,.55)','rgba(16,19,60,.76)'][layer];ctx.fill();
    }
  }
  drawTerrain(){
    const viewWorld=W/(H/720)/this.camera.zoom,left=this.camera.x-viewWorld*.65,right=this.camera.x+viewWorld*.65;
    ctx.save();ctx.shadowColor='#63f6ff';ctx.shadowBlur=20;ctx.beginPath();let first=true;for(let x=left-80;x<=right+80;x+=18){const y=this.terrain.at(x).y;if(first){ctx.moveTo(x,y);first=false}else ctx.lineTo(x,y)}ctx.lineTo(right+80,900);ctx.lineTo(left-80,900);ctx.closePath();
    const g=ctx.createLinearGradient(0,300,0,780);g.addColorStop(0,'#76fbff');g.addColorStop(.18,'#2dd5e5');g.addColorStop(.62,'#116f9f');g.addColorStop(1,'#0b285f');ctx.fillStyle=g;ctx.fill();ctx.shadowBlur=0;
    ctx.beginPath();first=true;for(let x=left-80;x<=right+80;x+=12){const y=this.terrain.at(x).y;if(first){ctx.moveTo(x,y);first=false}else ctx.lineTo(x,y)}ctx.strokeStyle='rgba(210,255,255,.9)';ctx.lineWidth=3;ctx.stroke();
    ctx.globalAlpha=.22;ctx.beginPath();first=true;for(let x=left-80;x<=right+80;x+=24){const y=this.terrain.at(x).y+18;if(first){ctx.moveTo(x,y);first=false}else ctx.lineTo(x,y)}ctx.strokeStyle='#76fbff';ctx.lineWidth=8;ctx.stroke();ctx.restore();
  }
  drawCoins(){
    for(const c of this.coins){if(c.collected||Math.abs(c.x-this.camera.x)>W/(H/720))continue;const pulse=1+.12*Math.sin(this.elapsed*5+c.phase);ctx.save();ctx.translate(c.x,c.y);ctx.rotate(this.elapsed*2+c.phase);ctx.scale(pulse,pulse);ctx.shadowColor='#ffd45b';ctx.shadowBlur=18;ctx.fillStyle='#ffd45b';ctx.beginPath();ctx.moveTo(0,-11);ctx.lineTo(9,0);ctx.lineTo(0,11);ctx.lineTo(-9,0);ctx.closePath();ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle='rgba(255,255,255,.8)';ctx.lineWidth=2;ctx.stroke();ctx.restore()}
  }
  drawMachines(){
    for(const g of this.gates){if(g.broken||Math.abs(g.x-this.camera.x)>W/(H/720))continue;const ground=this.terrain.at(g.x).y;ctx.save();ctx.translate(g.x,ground);if(g.flash>0){ctx.shadowColor='#ff557e';ctx.shadowBlur=45}
      ctx.fillStyle='#121638';ctx.strokeStyle='#63f6ff';ctx.lineWidth=4;roundRect(ctx,-34,-230,68,230,16);ctx.fill();ctx.stroke();
      for(let i=0;i<5;i++){ctx.fillStyle=i%2?'#282f70':'#1b2054';roundRect(ctx,-30,-220+i*43,60,34,9);ctx.fill();ctx.strokeStyle=g.flash>0?'#ffd45b':'rgba(99,246,255,.4)';ctx.lineWidth=2;ctx.stroke()}
      ctx.fillStyle='#ff4fc8';ctx.shadowColor='#ff4fc8';ctx.shadowBlur=16;ctx.beginPath();ctx.arc(0,-118,11,0,TAU);ctx.fill();ctx.restore();
    }
  }
  drawBoss(){
    if(Math.abs(this.bossX-this.camera.x)>W/(H/720)*1.2)return;const y=this.terrain.at(this.bossX).y-145,b=this.boss;ctx.save();ctx.translate(this.bossX,y);const pulse=1+.03*Math.sin(this.elapsed*3);ctx.scale(pulse,pulse);ctx.shadowColor=b.hitFlash?'#fff':'#ff4fc8';ctx.shadowBlur=b.hitFlash?70:32;
    ctx.strokeStyle='#63f6ff';ctx.lineWidth=5;ctx.fillStyle='#14183d';for(let i=0;i<8;i++){ctx.save();ctx.rotate(i*TAU/8+this.elapsed*.08);roundRect(ctx,52,-18,95,36,10);ctx.fill();ctx.stroke();ctx.restore()}
    ctx.beginPath();ctx.arc(0,0,105,0,TAU);ctx.fillStyle='#20265d';ctx.fill();ctx.strokeStyle='#8e7bff';ctx.lineWidth=9;ctx.stroke();
    ctx.beginPath();ctx.arc(0,0,70,0,TAU);ctx.fillStyle='#0b0d2b';ctx.fill();ctx.strokeStyle='#63f6ff';ctx.lineWidth=5;ctx.stroke();
    for(let i=0;i<6;i++){ctx.save();ctx.rotate(i*TAU/6-this.elapsed*.23);ctx.fillStyle=i%2?'#ff4fc8':'#63f6ff';roundRect(ctx,40,-6,26,12,4);ctx.fill();ctx.restore()}
    const core=ctx.createRadialGradient(-10,-12,2,0,0,45);core.addColorStop(0,'#fff');core.addColorStop(.18,'#ffd4f1');core.addColorStop(.45,b.armor>0?'#ff4fc8':b.shield>0?'#63f6ff':'#ffd45b');core.addColorStop(1,'rgba(255,79,200,0)');ctx.fillStyle=core;ctx.beginPath();ctx.arc(0,0,48,0,TAU);ctx.fill();
    ctx.restore();
  }
  drawParticles(){
    for(const r of this.rings){ctx.save();ctx.globalAlpha=clamp(r.life,0,1);ctx.strokeStyle=r.color;ctx.lineWidth=5*r.life;ctx.shadowColor=r.color;ctx.shadowBlur=15;ctx.beginPath();ctx.ellipse(r.x,r.y,r.r,r.r*.28,0,0,TAU);ctx.stroke();ctx.restore()}
    for(const p of this.particles){ctx.save();ctx.globalAlpha=clamp(p.life/p.maxLife,0,1);ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.fillStyle=p.color;ctx.shadowColor=p.color;ctx.shadowBlur=8;if(p.type==='shard'){ctx.beginPath();ctx.moveTo(-p.size,0);ctx.lineTo(p.size*.7,-p.size*.45);ctx.lineTo(p.size*.3,p.size*.7);ctx.closePath();ctx.fill()}else{ctx.beginPath();ctx.arc(0,0,p.size,0,TAU);ctx.fill()}ctx.restore()}
  }
  drawPlayer(){
    const p=this.player,shell=SHELLS.find(s=>s.id===save.equippedShell)||SHELLS[0];
    if(p.trail.length>2){ctx.save();ctx.lineCap='round';for(let i=1;i<p.trail.length;i++){const a=p.trail[i-1],b=p.trail[i],life=b.life;ctx.globalAlpha=life*.42;ctx.strokeStyle=shell.a;ctx.lineWidth=(3+10*life)*(p.speed/700);ctx.shadowColor=shell.a;ctx.shadowBlur=14;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke()}ctx.restore()}
    const sq=p.squash;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.angle*.18);ctx.scale(1+sq*.28,1-sq*.22);ctx.shadowColor=shell.a;ctx.shadowBlur=24+Math.min(28,p.speed/40);
    const g=ctx.createRadialGradient(-p.r*.35,-p.r*.38,2,0,0,p.r*1.25);g.addColorStop(0,'#fff');g.addColorStop(.12,shell.a);g.addColorStop(.58,shell.b);g.addColorStop(1,'#101330');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,p.r,0,TAU);ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle='rgba(230,255,255,.82)';ctx.lineWidth=2.5;ctx.stroke();ctx.globalAlpha=.42;ctx.beginPath();ctx.arc(0,0,p.r*.58,0,TAU);ctx.stroke();ctx.beginPath();ctx.moveTo(-p.r*.72,0);ctx.lineTo(p.r*.72,0);ctx.stroke();ctx.restore();
    if(app.inputHeld){ctx.save();ctx.globalAlpha=.5+.2*Math.sin(this.elapsed*8);ctx.strokeStyle='#ff4fc8';ctx.lineWidth=3;ctx.setLineDash([7,7]);ctx.beginPath();ctx.moveTo(p.x,p.y+35);ctx.lineTo(p.x,p.y+100);ctx.stroke();ctx.restore()}
  }
  drawFloaters(){for(const f of this.floaters){ctx.save();ctx.globalAlpha=clamp(f.life/f.maxLife,0,1);ctx.fillStyle=f.color;ctx.shadowColor=f.color;ctx.shadowBlur=12;ctx.font='900 20px system-ui';ctx.textAlign='center';ctx.fillText(f.text,f.x,f.y);ctx.restore()}}
  drawIntro(){
    const t=clamp((5-this.intro)/1.1,0,1),fade=clamp(this.intro/1.1,0,1);ctx.save();ctx.globalAlpha=Math.min(t,fade);ctx.textAlign='center';ctx.fillStyle='white';ctx.font=`900 ${Math.min(38,W*.04)}px system-ui`;ctx.shadowColor='#63f6ff';ctx.shadowBlur=18;ctx.fillText('HOLD TO DIVE',W/2,H*.42);ctx.font=`800 ${Math.min(14,W*.015)}px system-ui`;ctx.fillStyle='#c9d2ef';ctx.fillText('Release while climbing to convert the valley into speed.',W/2,H*.48);ctx.restore();
  }
}

function roundRect(c,x,y,w,h,r){c.beginPath();c.roundRect(x,y,w,h,r)}
function roman(n){return ['I','II','III','IV','V'][Math.min(4,n-1)]||String(n)}
function setBar(id,v,max){const pct=clamp(v/max*100,0,100);$(`#${id}Bar`).style.width=`${pct}%`;$(`#${id}Text`).textContent=`${Math.ceil(pct)}%`}

function clearToasts(){ $('#toastLayer').innerHTML=''; }
function startRun(seed){
  audio.ensure();clearToasts();closeAllOverlays();if(app.game)app.game.stop();const game=new Game(seed||Math.floor(Math.random()*2147483646)+1);app.game=game;game.start();
}
function endToHub(){
  clearToasts();if(app.game)app.game.stop();app.game=null;app.mode='hub';app.inputHeld=false;app.lastInputHeld=false;closeAllOverlays();$('#gameHud').classList.remove('active');$('#bossHud').classList.remove('active');$('#gateOverlay').classList.remove('active');$('#hub').classList.add('active');updateHub();drawHubBackdrop();
}
function closeAllOverlays(){$$('.overlay,.panel-overlay').forEach(el=>{el.classList.remove('active');el.setAttribute('aria-hidden','true')})}

function updateHub(){
  $('#hubGold').textContent=fmt(save.gold);$('#hubCores').textContent=fmt(save.cores);$('#bestDistance').textContent=`${Math.round(save.bestDistance/10)} m`;$('#bestCombo').textContent=`x${save.bestCombo}`;
  $('#bossProgress').textContent=save.worldComplete?'CORE SECURED':save.bossArmor<3600?`${Math.ceil((1-save.bossArmor/3600)*100)}% FRACTURED`:'LOCKED';$('#runCount').textContent=`${save.totalRuns} RUN${save.totalRuns===1?'':'S'}`;
  $('#shellCount').textContent=`${Object.values(save.shells).filter(Boolean).length} / ${SHELLS.length}`;const affordable=Object.values(SKILLS).filter(s=>!save.skills[s.id]&&save.gold>=s.cost&&skillUnlockedGlobal(s.id)).length;$('#skillAffordable').textContent=`${affordable} READY`;
  $('#panelGold').textContent=fmt(save.gold);
}
function skillUnlockedGlobal(id){const s=SKILLS[id];if(s.index===0)return true;const b=SKILL_BRANCHES.find(x=>x.id===s.branch);return !!save.skills[b.nodes[s.index-1][0]]}

function drawHubBackdrop(){
  ctx.save();ctx.setTransform(DPR,0,0,DPR,0,0);const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#141044');g.addColorStop(.6,'#8a2c7d');g.addColorStop(1,'#ff8d7e');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);ctx.restore();
}

function toast(title,msg){const el=document.createElement('div');el.className='toast';el.innerHTML=`<strong>${title}</strong>${msg}`;$('#toastLayer').appendChild(el);setTimeout(()=>el.remove(),2850)}

function openPanel(type){
  clearToasts();app.panel=type;app.mode='panel';$('#panelOverlay').classList.add('active');$('#panelOverlay').setAttribute('aria-hidden','false');$('#panelGold').textContent=fmt(save.gold);renderPanel(type);audio.click();
}
function closePanel(){$('#panelOverlay').classList.remove('active');$('#panelOverlay').setAttribute('aria-hidden','true');app.panel=null;app.mode=app.game?'game':'hub';updateHub()}
function renderPanel(type){
  const titles={skills:['PERMANENT PROGRESSION','SKILL TREE'],worlds:['CAMPAIGN ROUTES','WORLD MAP'],collection:['COSMETIC ARMORY','PRISM SHELLS'],records:['RUN ANALYSIS','RECORDS & CHALLENGES'],settings:['SYSTEM CONTROL','SETTINGS']};
  $('#panelEyebrow').textContent=titles[type][0];$('#panelTitle').textContent=titles[type][1];const box=$('#panelContent');box.innerHTML='';
  if(type==='skills')renderSkills(box);if(type==='worlds')renderWorlds(box);if(type==='collection')renderCollection(box);if(type==='records')renderRecords(box);if(type==='settings')renderSettings(box);
}
function renderSkills(box){
  const layout=document.createElement('div');layout.className='skill-layout';
  SKILL_BRANCHES.forEach(branch=>{
    const col=document.createElement('section');col.className='skill-branch';col.style.setProperty('--branch',branch.color);col.innerHTML=`<div class="branch-head"><img src="assets/icons/${branch.icon}.svg" alt=""/><div><b>${branch.name}</b><small>${branch.desc}</small></div></div>`;
    branch.nodes.forEach((n,i)=>{
      if(i){const link=document.createElement('div');link.className='skill-link'+(save.skills[branch.nodes[i-1][0]]?' on':'');col.appendChild(link)}
      const [id,name,desc,cost]=n,owned=!!save.skills[id],unlocked=i===0||!!save.skills[branch.nodes[i-1][0]],can=unlocked&&!owned&&save.gold>=cost;
      const btn=document.createElement('button');btn.className=`skill-node${owned?' owned':''}`;btn.disabled=owned||!unlocked;btn.style.setProperty('--branch',branch.color);
      btn.innerHTML=`<img src="assets/icons/${branch.icon}.svg" alt=""/><span><b>${name}</b><small>${desc}</small></span><i class="skill-cost">${owned?'ACTIVE':unlocked?`◆ ${cost}`:'LOCKED'}</i>`;
      if(can)btn.title='Purchase upgrade';btn.addEventListener('click',()=>purchaseSkill(id));col.appendChild(btn);
    });layout.appendChild(col);
  });box.appendChild(layout);
}
function purchaseSkill(id){const s=SKILLS[id];if(!s||save.skills[id]||!skillUnlockedGlobal(id)||save.gold<s.cost)return;save.gold-=s.cost;save.skills[id]=true;persist();audio.upgrade();haptic([15,25,35]);toast('UPGRADE INSTALLED',s.name);renderPanel('skills')}
function renderWorlds(box){
  const grid=document.createElement('div');grid.className='world-grid';const worlds=[
    ['Neon Expanse','neon','ACTIVE CAMPAIGN','Smooth cyan dunes, prism gates and the Bulwark.',save.worldComplete?100:clamp((1-save.bossArmor/3600)*100,0,95)],
    ['Rust Canyon','rust','CORE LOCKED','Sharper routes, collapsing ledges and the Burrower.',0],['Cryo Circuit','cryo','CORE LOCKED','Low-friction ice and the Glass Warden.',0],['Ember Foundry','ember','CORE LOCKED','Molten slopes and the Furnace Heart.',0],['The Null Frontier','null','CORE LOCKED','Inverted curves and the Crown of Zero.',0]
  ];
  worlds.forEach((w,i)=>{const card=document.createElement('article');card.className='world-card'+(i?' locked':'');card.innerHTML=`<div class="world-art ${w[1]}"></div><i>${w[2]}</i><h3>${w[0]}</h3><p>${w[3]}</p><div class="world-progress"><b style="width:${w[4]}%"></b></div>`;grid.appendChild(card)});box.appendChild(grid)
}
function renderCollection(box){
  const grid=document.createElement('div');grid.className='collection-grid';SHELLS.forEach(s=>{const owned=save.shells[s.id],equipped=save.equippedShell===s.id;const card=document.createElement('article');card.className='shell-card'+(equipped?' equipped':'');card.innerHTML=`<div class="shell-preview"><div class="shell-ball" style="--shell-a:${s.a};--shell-b:${s.b}"></div></div><h3>${s.name}</h3><p>${s.desc}</p><button class="${equipped?'secondary-button':'primary-button'}">${equipped?'EQUIPPED':owned?'EQUIP':`UNLOCK · ◆ ${s.price}`}</button>`;
    card.querySelector('button').addEventListener('click',()=>{if(!owned){if(save.gold<s.price){toast('INSUFFICIENT GOLD',`${fmt(s.price-save.gold)} more required.`);return}save.gold-=s.price;save.shells[s.id]=true}save.equippedShell=s.id;persist();audio.upgrade();renderPanel('collection')});grid.appendChild(card)});box.appendChild(grid)
}
function renderRecords(box){
  const grid=document.createElement('div');grid.className='records-grid';const stats=[['BEST DISTANCE',`${Math.round(save.bestDistance/10)} m`,'Longest route penetration.'],['PEAK SPEED',`${Math.round(save.bestSpeed*.32)} km/h`,'Highest recorded core velocity.'],['BEST COMBO',`x${save.bestCombo}`,'Longest perfect landing chain.'],['TOTAL GOLD',fmt(save.totalGold),'Persistent currency earned.']];
  stats.forEach(s=>{const c=document.createElement('article');c.className='record-card';c.innerHTML=`<span>${s[0]}</span><strong>${s[1]}</strong><p>${s[2]}</p>`;grid.appendChild(c)});
  const ch=document.createElement('article');ch.className='record-card';ch.style.gridColumn='1/-1';ch.innerHTML='<span>ACTIVE CHALLENGES</span><h3>Route Objectives</h3>';
  const challenges=[['wide-window','Tangent Master',save.challenges.perfects,25,'Land 25 perfects'],['destruction','Fracture Line',save.challenges.gates,8,'Break 8 gates'],['coin','Prism Hoard',save.challenges.coins,120,'Collect 120 route coins']];
  challenges.forEach(([icon,name,val,target,desc])=>{const pct=clamp(val/target*100,0,100);const d=document.createElement('div');d.className='challenge';d.innerHTML=`<img src="assets/icons/${icon}.svg" alt=""/><span><b>${name}</b><small>${desc}</small><div class="world-progress"><b style="width:${pct}%"></b></div></span><i>${Math.min(val,target)} / ${target}</i>`;ch.appendChild(d)});grid.appendChild(ch);
  const hist=document.createElement('article');hist.className='record-card';hist.style.gridColumn='1/-1';hist.innerHTML='<span>RECENT RUNS</span><h3>Flight Recorder</h3>';
  if(!save.history.length)hist.innerHTML+='<p>No launches recorded yet.</p>';else save.history.slice(0,6).forEach(r=>{const d=document.createElement('div');d.className='challenge';d.innerHTML=`<img src="assets/icons/${r.reason==='victory'?'boss':'launch'}.svg" alt=""/><span><b>${new Date(r.date).toLocaleDateString()} · Seed ${r.seed}</b><small>${Math.round(r.distance/10)} m · x${r.combo} combo · ${fmt(r.damage)} damage</small></span><i>◆ ${fmt(r.gold)}</i>`;hist.appendChild(d)});grid.appendChild(hist);box.appendChild(grid)
}
function renderSettings(box){
  const grid=document.createElement('div');grid.className='settings-grid';const settings=[['audio','audio','Audio System','Reactive soundtrack and synthesized impact effects.'],['haptics','haptics','Haptic Feedback','Touch vibration for landings, gates and boss strikes.'],['reducedMotion','motion','Reduced Motion','Reduce menu motion and screen shake intensity.']];
  settings.forEach(([key,icon,name,desc])=>{const c=document.createElement('article');c.className='setting-card';c.innerHTML=`<img src="assets/icons/${icon}.svg" alt=""/><span><h3>${name}</h3><p>${desc}</p></span><button class="toggle ${save.settings[key]?'on':''}" aria-label="Toggle ${name}"><i></i></button>`;c.querySelector('button').addEventListener('click',()=>{save.settings[key]=!save.settings[key];persist();if(key==='reducedMotion')document.documentElement.classList.toggle('reduced-motion',save.settings[key]);renderPanel('settings')});grid.appendChild(c)});
  const tools=document.createElement('div');tools.className='save-tools';tools.innerHTML=`<div class="save-box"><h3>Export Save Code</h3><textarea readonly id="exportCode">${btoa(unescape(encodeURIComponent(JSON.stringify(save))))}</textarea><button class="secondary-button" id="copySave">COPY BACKUP</button></div><div class="save-box"><h3>Import Save Code</h3><textarea id="importCode" placeholder="Paste a Breakpoint save code"></textarea><button class="secondary-button" id="importSave">RESTORE BACKUP</button></div>`;grid.appendChild(tools);box.appendChild(grid);
  $('#copySave').addEventListener('click',async()=>{await navigator.clipboard?.writeText($('#exportCode').value);toast('SAVE COPIED','Backup code copied to clipboard.')});
  $('#importSave').addEventListener('click',()=>{try{const data=JSON.parse(decodeURIComponent(escape(atob($('#importCode').value.trim()))));if(data.version!==1)throw 0;save={...defaultSave(),...data};persist();toast('SAVE RESTORED','Progress imported successfully.');renderPanel('settings')}catch{toast('INVALID SAVE','That backup code could not be read.')}})
}

function pauseGame(){if(!app.game||app.game.state!=='playing')return;app.game.state='paused';$('#pauseOverlay').classList.add('active');$('#pauseOverlay').setAttribute('aria-hidden','false');app.inputHeld=false;audio.click()}
function resumeGame(){if(!app.game)return;$('#pauseOverlay').classList.remove('active');$('#pauseOverlay').setAttribute('aria-hidden','true');app.game.state='playing';app.game.last=performance.now();audio.click()}

$('#playBtn').addEventListener('click',()=>startRun());$('#settingsBtn').addEventListener('click',()=>openPanel('settings'));$$('.nav-card').forEach(b=>b.addEventListener('click',()=>openPanel(b.dataset.panel)));$('#panelBack').addEventListener('click',closePanel);
$('#pauseBtn').addEventListener('click',pauseGame);$('#resumeBtn').addEventListener('click',resumeGame);$('#restartBtn').addEventListener('click',()=>startRun());$('#quitBtn').addEventListener('click',endToHub);$('#againBtn').addEventListener('click',()=>startRun());$('#summaryHubBtn').addEventListener('click',endToHub);$('#summarySkillsBtn').addEventListener('click',()=>{if(app.game)app.game.stop();app.game=null;$('#summaryOverlay').classList.remove('active');$('#gameHud').classList.remove('active');$('#bossHud').classList.remove('active');$('#hub').classList.add('active');openPanel('skills')});$('#rerollBtn').addEventListener('click',()=>app.game?.reroll());

function beginInput(e){
  if(app.mode==='game'&&app.game?.state==='playing'){app.inputHeld=true;audio.ensure();if(e?.pointerId!=null)app.pointerId=e.pointerId;e?.preventDefault?.()}
}
function endInput(e){if(app.pointerId!=null&&e?.pointerId!=null&&e.pointerId!==app.pointerId)return;app.inputHeld=false;app.pointerId=null;e?.preventDefault?.()}
canvas.addEventListener('pointerdown',beginInput,{passive:false});addEventListener('pointerup',endInput,{passive:false});addEventListener('pointercancel',endInput,{passive:false});
addEventListener('keydown',e=>{
  if(e.code==='Space'){e.preventDefault();if(!e.repeat){if(app.mode==='hub')startRun();else if(app.game?.state==='summary')startRun();else beginInput(e)}}
  if(e.code==='Escape'){if(app.panel)closePanel();else if(app.game?.state==='playing')pauseGame();else if(app.game?.state==='paused')resumeGame()}
});addEventListener('keyup',e=>{if(e.code==='Space')endInput(e)});

function magneticButtons(){for(const b of $$('.magnetic')){b.addEventListener('pointermove',e=>{const r=b.getBoundingClientRect(),x=(e.clientX-r.left-r.width/2)*.05,y=(e.clientY-r.top-r.height/2)*.08;b.style.transform=`translate(${x}px,${y}px) scale(1.01)`});b.addEventListener('pointerleave',()=>b.style.transform='')}}magneticButtons();

if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
document.documentElement.classList.toggle('reduced-motion',save.settings.reducedMotion);updateHub();drawHubBackdrop();

window.__PRISM_DEBUG__={
  startRun:(seed=12345)=>startRun(seed),
  state:()=>app.game?{mode:app.game.state,player:{...app.game.player},gold:app.game.runGold,gates:app.game.gates.map(g=>({hp:g.hp,broken:g.broken})),boss:{...app.game.boss},perks:{...app.game.perks}}:{mode:app.mode,save},
  grantGold:(n=5000)=>{save.gold+=n;persist();return save.gold},
  reset:()=>{save=defaultSave();persist();location.reload()},
  setHold:v=>{app.inputHeld=!!v},
  finish:reason=>app.game?.finishRun(reason),
  choosePerk:id=>app.game?.choosePerk(id),
  openPerk:(index=0)=>app.game?.openPerkMachine(index),
  warp:(x,speed=700,airborne=false)=>{if(!app.game)return null;const g=app.game,p=g.player;p.x=x;p.speed=speed;const surf=g.terrain.at(x);p.grounded=!airborne;p.y=surf.y-p.r;p.vx=speed;p.vy=airborne?120:surf.slope*speed;g.camera.x=x;return {x:p.x,y:p.y};},
  strikeBoss:()=>app.game?.strikeBoss(),
  save:()=>JSON.parse(JSON.stringify(save)),
  buySkill:id=>{purchaseSkill(id);return !!save.skills[id]},
  step:(seconds=1,policy='slope')=>{if(!app.game)return null;const g=app.game,steps=Math.max(1,Math.floor(seconds/g.fixed));for(let i=0;i<steps&&g.state==='playing';i++){if(policy==='slope'){const surf=g.terrain.at(g.player.x);app.inputHeld=surf.slope*g.boss.direction>.035;}g.update(g.fixed);}app.inputHeld=false;return window.__PRISM_DEBUG__.state();}
};
