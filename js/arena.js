// Die Kampfszene in Bewegung: Einmarsch bei jedem Öffnen, Runden mit Angriffen beider Seiten,
// Übungsschlag beim Antippen und Leben im Hintergrund. Läuft über die Web Animations API.
// Bewegung liegt auf `translate`, Schwünge auf `rotate`, Flügelschlag auf `scale`, das Wippen im
// Stand (CSS) auf `transform`. So stören sich die Ebenen nicht.
import * as B from './battle.js';
import * as FX from './fx.js';
import * as SFX from './sfx.js';
import { formatNumber } from './logic.js';

// Die Bühne misst 192 × 240 Bildpunkte, alle Maße hier sind in diesen Punkten.
const SCENE_W = 192;
const LANE = 104; // Unterkante der Figuren auf dem Weg, von unten
const SKY = [4, 22];
const BIRDS = [34, 68];
const WALKERS = [
  { id: 'bauer', w: 7, h: 10, speed: 9, weight: 3 },
  { id: 'magd', w: 7, h: 10, speed: 8, weight: 2 },
  { id: 'reiter', w: 18, h: 14, speed: 26, weight: 1.5, gait: 'gallop' },
  { id: 'schaf', w: 10, h: 6, speed: 6, weight: 2, herd: 3 },
  { id: 'huhn', w: 7, h: 7, speed: 11, weight: 1.5, gait: 'hop' },
];
const CLOUDS = [
  { id: 'wolke1', w: 34, h: 10 },
  { id: 'wolke2', w: 24, h: 8 },
  { id: 'wolke3', w: 44, h: 12 },
];
const DUST = ['#d9c7a3', '#b9a57f', '#efe2c4'];
const SPARKS = ['#fff6c2', '#ffd21f', '#ffffff'];
const FIRE = ['#ffd21f', '#ff9a1f', '#ff5a1f', '#fff1a8'];
const HEAL = ['#5cff8a', '#b8ffcc', '#2fd66b'];
const WHITE = 'brightness(3) saturate(0)';
const HURT = 'brightness(1.2) sepia(1) saturate(8) hue-rotate(-35deg)';
const STONE = 'grayscale(1) brightness(0.8) contrast(1.15)';

const fmt0 = (v) => formatNumber(Math.round(v), 0);
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (list) => list[Math.floor(Math.random() * list.length)];
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

let scene = null;

export function stopArena() {
  scene?.stop();
  scene = null;
}

export function sparArena() {
  scene?.spar();
}

export function startArena(main, options) {
  stopArena();
  const arena = main.querySelector('.arena');
  if (arena) scene = createScene(main, arena, options);
}

// Satz für das Ende einer Runde, auch ohne Animation.
function finalLine(round) {
  if (round.type === 'sieg') return B.quote('sieg', round.date);
  if (round.type === 'heilung') return B.quote('heilung', round.date);
  if (round.type === 'patt') return B.quote('patt', round.date);
  const crit = round.damage >= B.KCAL_PER_KG;
  return `${crit ? 'Kritischer Treffer!' : B.quote('treffer', round.date)} ${fmt0(round.damage)} Kalorien Schaden.`;
}

function createScene(main, arena, { round, monster: id, sound }) {
  const stage = arena.querySelector('.stage');
  const hero = arena.querySelector('.hero');
  const foe = arena.querySelector('.foe-sprite');
  const sky = arena.querySelector('.sky');
  const lane = arena.querySelector('.lane');
  const layer = arena.querySelector('.fx-layer');
  const hud = arena.querySelector('.hud');
  const bar = arena.querySelector('.hp i');
  const meter = arena.querySelector('.hp');
  const num = arena.querySelector('.hp-num');
  const text = main.querySelector('.dialog-text');
  const monster = B.MONSTERS[id] ?? B.MONSTERS.drache;
  const max = Number(arena.dataset.max);
  const idleLine = text.textContent;
  let hp = Number(arena.dataset.hp);
  let alive = true;
  let busy = true;
  let typing = 0;
  let counting = 0;
  const timers = new Set();
  const anims = new Set();
  const off = new Map([
    [hero, { x: 0, y: 0 }],
    [foe, { x: 0, y: 0 }],
  ]);
  const box = {};

  const later = (fn, ms) => {
    const t = setTimeout(() => {
      timers.delete(t);
      if (alive) fn();
    }, ms);
    timers.add(t);
  };
  const wait = (ms) => new Promise((resolve) => later(resolve, ms));
  const animate = (el, frames, opts) => {
    const a = el.animate(frames, opts);
    anims.add(a);
    const forget = () => anims.delete(a);
    a.finished.then(forget, forget);
    return a;
  };
  const vanish = (el, a) => a.finished.then(() => el.remove(), () => el.remove());
  const px = () => stage.clientWidth / SCENE_W;
  const sfx = (name) => SFX.play(name, sound());
  const gap = () => box.foe.x - (box.hero.x + box.hero.w);

  function measure(el) {
    const s = stage.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return { x: r.left - s.left, y: r.top - s.top, w: r.width, h: r.height };
  }

  // Punkt auf einer Figur, als Anteil ihrer Größe, dort wo sie gerade steht.
  function at(el, fx, fy) {
    const b = el === hero ? box.hero : box.foe;
    const o = off.get(el);
    return [b.x + o.x + b.w * fx, b.y + o.y + b.h * fy];
  }

  function place(el, x, y = 0) {
    off.set(el, { x, y });
    el.style.translate = `${x}px ${y}px`;
  }

  async function move(el, x, y, ms, easing = 'steps(6, end)') {
    const from = off.get(el);
    const a = animate(el, [{ translate: `${from.x}px ${from.y}px` }, { translate: `${x}px ${y}px` }], { duration: ms, easing, fill: 'forwards' });
    await a.finished;
    place(el, x, y);
    a.cancel();
  }

  // Kurzes Rucken um die aktuelle Stelle, ohne sie zu ändern.
  function nudge(el, points, ms) {
    const o = off.get(el);
    return animate(el, points.map(([dx, dy]) => ({ translate: `${o.x + dx}px ${o.y + dy}px` })), { duration: ms, easing: `steps(${points.length - 1}, end)` });
  }

  async function walk(el, x, ms, step = 'step') {
    el.classList.add('is-walking');
    const steps = Math.max(2, Math.round(ms / 260));
    for (let i = 0; i < steps; i++) later(() => sfx(step), (ms / steps) * (i + 0.5));
    await move(el, x, 0, ms, `steps(${Math.max(4, Math.round(ms / 90))}, end)`);
    el.classList.remove('is-walking');
  }

  const swing = (el, degrees, ms = 240) =>
    animate(el, [{ rotate: '0deg' }, { rotate: `${degrees[0]}deg`, offset: 0.35 }, { rotate: `${degrees[1]}deg`, offset: 0.7 }, { rotate: '0deg' }], {
      duration: ms,
      easing: 'steps(4, end)',
    });

  // Waffe schwingen: langsam ausholen, schnell zuschlagen, kurz halten, zurück.
  // Gibt die Zeit bis zum Treffer zurück. Ohne Waffe (Drache) kippt die ganze Figur.
  function wield(fighter, angles, ms = 440) {
    const weapon = fighter.querySelector('.weapon');
    if (!weapon) {
      swing(fighter, [-12, 8], ms);
      return ms * 0.5;
    }
    const [wind, strike] = angles;
    animate(
      weapon,
      [
        { rotate: '0deg' },
        { rotate: `${wind}deg`, offset: 0.45 },
        { rotate: `${strike}deg`, offset: 0.62 },
        { rotate: `${strike}deg`, offset: 0.82 },
        { rotate: '0deg' },
      ],
      { duration: ms, easing: 'steps(11, end)' },
    );
    swing(fighter, [-4, 3], ms);
    return ms * 0.6;
  }

  const flash = (el, filter = WHITE) =>
    animate(el, [{ filter: 'none' }, { filter }, { filter: 'none' }, { filter }, { filter: 'none' }], { duration: 380, easing: 'steps(4, end)' });

  function shake(strength = 2) {
    const d = strength * px() * 0.5;
    animate(stage, [{ translate: '0 0' }, { translate: `${-d}px ${d / 2}px` }, { translate: `${d}px ${-d / 2}px` }, { translate: `${-d / 2}px 0` }, { translate: '0 0' }], {
      duration: 260,
      easing: 'steps(4, end)',
    });
  }

  function type(line) {
    const token = ++typing;
    text.textContent = '';
    return new Promise((resolve) => {
      let i = 0;
      const tick = () => {
        if (token !== typing) return resolve();
        text.textContent = line.slice(0, ++i);
        if (i < line.length) later(tick, 22);
        else resolve();
      };
      tick();
    });
  }

  function countTo(from, to, ms) {
    const token = ++counting;
    const t0 = performance.now();
    const step = (now) => {
      if (token !== counting || !alive) return;
      const p = Math.min(1, (now - t0) / ms);
      num.textContent = fmt0(from + (to - from) * (1 - (1 - p) ** 3));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function hpTo(to, ms) {
    const pct = (v) => `${Math.max(0, Math.min(100, (v / max) * 100))}%`;
    animate(bar, [{ width: pct(hp) }, { width: pct(to) }], { duration: ms, easing: `steps(${Math.max(3, Math.round(ms / 60))}, end)`, fill: 'forwards' });
    countTo(hp, to, ms);
    meter.setAttribute('aria-valuenow', String(Math.round(to)));
    hp = to;
  }

  function hpSet(to) {
    bar.style.width = `${Math.max(0, Math.min(100, (to / max) * 100))}%`;
    num.textContent = fmt0(to);
    meter.setAttribute('aria-valuenow', String(Math.round(to)));
    hp = to;
  }

  // ---------- Effekte ----------

  function dot(x, y, size, color) {
    const el = document.createElement('i');
    const s = Math.max(2, Math.round(size * px()));
    el.className = 'pt';
    el.style.cssText = `left:${x - s / 2}px;top:${y - s / 2}px;width:${s}px;height:${s}px;background:${color}`;
    layer.append(el);
    return el;
  }

  function burst(x, y, { n = 8, colors = SPARKS, size = 2, spread = 14, rise = 10, ms = 420 } = {}) {
    const p = px();
    for (let i = 0; i < n; i++) {
      const el = dot(x, y, size, pick(colors));
      const dx = rand(-1, 1) * spread * p;
      const dy = -rand(0.2, 1) * rise * p;
      vanish(el, animate(el, [{ transform: 'translate(0, 0)', opacity: 1 }, { transform: `translate(${dx}px, ${dy}px)`, opacity: 0 }], { duration: ms * rand(0.7, 1.2), easing: 'steps(5, end)' }));
    }
  }

  function dustAt(el, n = 8) {
    const [x, y] = at(el, 0.5, 0.97);
    burst(x, y, { n, colors: DUST, size: 2, spread: 24, rise: 6, ms: 520 });
  }

  function floatText(label, cls, [x, y]) {
    const el = document.createElement('p');
    el.className = `dmg ${cls}`;
    el.textContent = label;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    layer.append(el);
    vanish(
      el,
      animate(
        el,
        [
          { opacity: 0, transform: 'translate(-50%, 6px)' },
          { opacity: 1, transform: 'translate(-50%, -8px)', offset: 0.2 },
          { opacity: 1, transform: 'translate(-50%, -20px)', offset: 0.8 },
          { opacity: 0, transform: 'translate(-50%, -30px)' },
        ],
        { duration: 1300, easing: 'linear' },
      ),
    );
  }

  function slash([x, y], { mirror = false, big = false } = {}) {
    const size = (big ? 30 : 20) * px();
    const el = document.createElement('img');
    el.src = 'img/pixel/hieb.png';
    el.alt = '';
    el.className = 'slash pixel';
    el.style.cssText = `left:${x - size / 2}px;top:${y - size / 2}px;width:${size}px;height:${size}px`;
    layer.append(el);
    const f = mirror ? -1 : 1;
    vanish(
      el,
      animate(
        el,
        [
          { opacity: 1, transform: `scale(${0.6 * f}, 0.6) rotate(-30deg)` },
          { opacity: 1, transform: `scale(${1.1 * f}, 1.1) rotate(10deg)`, offset: 0.6 },
          { opacity: 0, transform: `scale(${1.2 * f}, 1.2) rotate(20deg)` },
        ],
        { duration: 260, easing: 'steps(4, end)' },
      ),
    );
  }

  async function breathe(ms) {
    const p = px();
    const [mx, my] = at(foe, ...monster.aim);
    const [tx, ty] = at(hero, 0.85, 0.45);
    const end = performance.now() + ms;
    while (performance.now() < end) {
      for (let i = 0; i < 3; i++) {
        const el = dot(mx, my, rand(2, 4), pick(FIRE));
        const dx = tx - mx + rand(-4, 4) * p;
        const dy = ty - my + rand(-7, 7) * p;
        vanish(
          el,
          animate(el, [{ transform: 'translate(0, 0) scale(0.6)', opacity: 1 }, { transform: `translate(${dx}px, ${dy}px) scale(1.5)`, opacity: 0.2 }], {
            duration: rand(300, 420),
            easing: 'steps(6, end)',
          }),
        );
      }
      await wait(40);
    }
  }

  // ---------- Leben im Hintergrund ----------

  function bit(sheet, w, h, cls = '') {
    const p = px();
    const el = document.createElement('i');
    el.className = `bit ${cls}`;
    el.style.width = `${w * p}px`;
    el.style.height = `${h * p}px`;
    el.style.backgroundImage = `url(img/pixel/${sheet}.png)`;
    return el;
  }

  // Einmal quer über die Bühne. `midway`: startet schon unterwegs, damit die Szene gleich lebt.
  function traverse(el, parent, w, speed, dir, { midway = false, delay = 0 } = {}) {
    const p = px();
    const width = stage.clientWidth;
    const [from, to] = dir > 0 ? [-w * p, width] : [width, -w * p];
    const flip = dir > 0 ? '' : ' scaleX(-1)';
    const duration = ((width / p + w) / speed) * 1000;
    parent.append(el);
    const a = animate(el, [{ transform: `translateX(${from}px)${flip}` }, { transform: `translateX(${to}px)${flip}` }], {
      duration,
      delay: midway ? -rand(0.15, 0.6) * duration : delay,
      fill: 'backwards',
    });
    vanish(el, a);
    return a;
  }

  function cloud(c, midway) {
    const el = bit(c.id, c.w, c.h, 'cloud');
    el.style.top = `${rand(...SKY) * px()}px`;
    const dir = Math.random() < 0.7 ? 1 : -1;
    traverse(el, sky, c.w, rand(1.6, 3.2), dir, { midway }).finished.then(() => later(() => cloud(c, false), rand(1000, 6000)), () => {});
  }

  function flock() {
    const dir = Math.random() < 0.5 ? 1 : -1;
    const top = rand(...BIRDS);
    const speed = rand(22, 30);
    const count = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      const el = bit('vogel', 5, 3, 'walk flap');
      el.style.top = `${(top + rand(-5, 5)) * px()}px`;
      traverse(el, sky, 5, speed, dir, { delay: i * rand(180, 360) });
    }
  }

  function walker(midway = false) {
    const total = WALKERS.reduce((s, w) => s + w.weight, 0);
    let r = Math.random() * total;
    const kind = WALKERS.find((w) => (r -= w.weight) < 0) ?? WALKERS[0];
    const dir = Math.random() < 0.5 ? 1 : -1;
    const speed = kind.speed * rand(0.85, 1.15);
    const count = kind.herd ? 2 + Math.floor(Math.random() * (kind.herd - 1)) : 1;
    for (let i = 0; i < count; i++) {
      const el = bit(kind.id, kind.w, kind.h, `walk ${kind.gait ?? ''}`);
      el.style.bottom = `${(LANE + rand(-2, 1)) * px()}px`;
      const lag = (i * rand(12, 18) * 1000) / speed;
      traverse(el, lane, kind.w, speed, dir, { midway: midway && i === 0, delay: midway ? 0 : lag });
    }
  }

  function life() {
    CLOUDS.forEach((c) => cloud(c, true));
    walker(true);
    const nextWalker = () => {
      if (lane.childElementCount < 3) walker();
      later(nextWalker, rand(3500, 8000));
    };
    later(nextWalker, rand(2000, 4500));
    const nextFlock = () => {
      flock();
      later(nextFlock, rand(12000, 22000));
    };
    later(nextFlock, rand(2500, 7000));
  }

  // ---------- Ablauf ----------

  async function entrance() {
    if (monster.entrance === 'fly') {
      animate(foe, [{ scale: '1 1' }, { scale: '1.05 0.93' }], { duration: 160, iterations: 6, direction: 'alternate', easing: 'steps(2, end)' });
      await move(foe, 0, 0, 1000, 'steps(10, end)');
      sfx('thud');
      shake(4);
      dustAt(foe, 14);
    } else if (monster.entrance === 'stomp') {
      const start = off.get(foe).x;
      for (let i = 1; i <= 3; i++) {
        await move(foe, start * (1 - i / 3), 0, 260, 'steps(3, end)');
        sfx('thud');
        shake(i === 3 ? 4 : 2);
        dustAt(foe);
        await wait(140);
      }
    } else {
      await walk(foe, 0, 1000);
    }
  }

  async function intro(defeated) {
    const p = px();
    hud.style.opacity = '0';
    place(hero, -(box.hero.x + box.hero.w + 4 * p));
    const outside = stage.clientWidth - box.foe.x + 4 * p;
    if (!defeated) place(foe, monster.entrance === 'fly' ? outside * 0.7 : outside, monster.entrance === 'fly' ? -(box.foe.y + box.foe.h) : 0);
    arena.classList.remove('is-intro');
    const heroIn = walk(hero, 0, 1100);
    heroIn.catch(() => {}); // Verlässt man die Szene mitten im Einmarsch, bricht der Lauf ab.
    if (!defeated) {
      await wait(250);
      type(B.LINES.entrance(monster));
      await entrance();
    }
    await heroIn;
    hud.style.opacity = '';
    animate(hud, [{ opacity: 0, transform: 'translateY(-8px)' }, { opacity: 1, transform: 'none' }], { duration: 300, easing: 'steps(4, end)' });
    const target = hp;
    hp = 0;
    hpTo(target, 650);
    sfx('blip');
    await wait(700);
  }

  async function monsterAttack(blocked) {
    const p = px();
    type(B.LINES.attack(monster));
    sfx('roar');
    if (monster.entrance === 'fly') {
      // Tief Luft holen: Der Drache bläht sich auf und lehnt sich zurück, dann kommt der Feuerstoß.
      sfx('inhale');
      const inhale = animate(foe, [{ scale: '1 1', rotate: '0deg' }, { scale: '1.07 1.12', rotate: '6deg' }], { duration: 700, easing: 'steps(7, end)', fill: 'forwards' });
      await inhale.finished;
      await wait(120);
      sfx('fire');
      animate(foe, [{ scale: '1.07 1.12', rotate: '6deg' }, { scale: '0.96 0.94', rotate: '-5deg', offset: 0.15 }, { scale: '0.98 0.97', rotate: '-3deg', offset: 0.85 }, { scale: '1 1', rotate: '0deg' }], {
        duration: 950,
        easing: 'steps(9, end)',
      });
      inhale.cancel();
      await breathe(750);
    } else {
      const hitAt = wield(foe, monster.weapon.swing, 620);
      await wait(120);
      await move(foe, -gap() * (monster.entrance === 'stomp' ? 0.55 : 0.8), 0, 220, 'steps(4, end)');
      sfx('whoosh');
      await wait(Math.max(0, hitAt - 340));
      slash(at(hero, 0.8, 0.45), { mirror: true });
    }
    const [x, y] = at(hero, 0.85, 0.45);
    if (blocked) {
      sfx('clang');
      burst(x, y, { n: 12, spread: 12, rise: 14 });
      floatText('BLOCK!', 'is-block', at(hero, 0.5, 0));
      swing(hero, [-9, -4], 360);
      await move(hero, -4 * p, 0, 120, 'steps(2, end)');
    } else {
      sfx('hit');
      FX.haptic(30);
      flash(hero, HURT);
      shake(3);
      await move(hero, -14 * p, -5 * p, 160, 'steps(3, end)');
      await move(hero, -14 * p, 0, 120, 'steps(2, end)');
    }
    await Promise.all([move(foe, 0, 0, 320, 'steps(5, end)'), blocked ? move(hero, 0, 0, 240, 'steps(4, end)') : wait(0)]);
  }

  async function strike(damage, { crit = false, final = false } = {}) {
    const p = px();
    if (final) {
      sfx('jump');
      const { x } = off.get(hero);
      await move(hero, x + 3 * p, -26 * p, 220, 'steps(4, end)');
      await move(hero, x + 6 * p, 0, 150, 'steps(3, end)');
    }
    const hitAt = wield(hero, B.HERO.weapon.swing, final ? 400 : 440);
    await wait(hitAt * 0.55);
    sfx('whoosh');
    await wait(hitAt * 0.45);
    const hit = at(foe, 0.22, final ? 0.42 : 0.52);
    slash(hit, { big: final });
    sfx(final && crit ? 'crit' : 'hit');
    FX.haptic(final && crit ? [30, 40, 60] : 20);
    flash(foe);
    nudge(foe, [[0, 0], [6 * p, 0], [-2 * p, 0], [0, 0]], 300);
    shake(final ? 5 : 2);
    burst(...hit, { n: final ? 16 : 8, spread: final ? 20 : 12, rise: 14 });
    floatText(`-${fmt0(damage)}`, final && crit ? 'is-crit' : 'is-hit', at(foe, 0.5, 0.02));
    hpTo(hp - damage, final ? 700 : 450);
    await wait(final ? 460 : 320);
  }

  async function defeat() {
    const p = px();
    sfx('fall');
    await animate(foe, [{ filter: 'none' }, { filter: WHITE }, { filter: 'none' }, { filter: WHITE }, { filter: 'none' }, { filter: WHITE }, { filter: 'none' }], {
      duration: 620,
      easing: 'steps(6, end)',
    }).finished;
    // Besiegt heißt versteinert: Das Biest wird grau und bleibt als Statue stehen.
    await animate(foe, [{ filter: 'none' }, { filter: STONE }], { duration: 700, easing: 'steps(7, end)', fill: 'forwards' }).finished;
    arena.classList.add('is-defeated');
    shake(4);
    dustAt(foe, 16);
    sfx('victory');
    FX.fireworks(6);
    for (let i = 0; i < 2; i++) {
      sfx('jump');
      await move(hero, 0, -14 * p, 180, 'steps(3, end)');
      await move(hero, 0, 0, 180, 'steps(3, end)');
    }
  }

  async function fight(r) {
    const [a, b, c] = B.splitHits(r.damage);
    const crit = r.damage >= B.KCAL_PER_KG;
    await monsterAttack(true);
    await type(B.LINES.block);
    await walk(hero, gap() + 2 * px(), 380);
    await strike(a);
    await wait(120);
    await strike(b);
    await wait(160);
    await strike(c, { crit, final: true });
    await move(hero, 0, 0, 420, 'steps(7, end)');
    if (r.type === 'sieg') await defeat();
    else swing(foe, [-5, 4], 600);
    await type(finalLine(r));
  }

  async function feast(amount) {
    const p = px();
    const food = document.createElement('i');
    food.className = 'bit food';
    food.style.width = `${10 * p}px`;
    food.style.height = `${10 * p}px`;
    food.style.backgroundPositionX = `${Math.floor(Math.random() * 3) * 50}%`;
    const [mx, my] = at(foe, ...monster.mouth);
    const [sx, sy] = [mx - 5 * p, at(foe, 0.5, 0)[1] - 20 * p];
    food.style.left = `${sx}px`;
    food.style.top = `${sy}px`;
    layer.append(food);
    await animate(food, [{ transform: 'scale(0)' }, { transform: 'scale(1.3)' }, { transform: 'scale(1)' }], { duration: 260, easing: 'steps(3, end)' }).finished;
    sfx('blip');
    await wait(220);
    await animate(food, [{ transform: 'translate(0, 0) scale(1)' }, { transform: `translate(${mx - sx - 5 * p}px, ${my - sy - 5 * p}px) scale(0.4)` }], {
      duration: 320,
      easing: 'steps(5, end)',
      fill: 'forwards',
    }).finished;
    food.remove();
    sfx('munch');
    animate(foe, [{ scale: '1 1' }, { scale: '1.05 0.95' }, { scale: '0.97 1.03' }, { scale: '1.05 0.95' }, { scale: '1 1' }], { duration: 520, easing: 'steps(4, end)' });
    await wait(440);
    sfx('heal');
    burst(...at(foe, 0.5, 0.4), { n: 14, colors: HEAL, spread: 18, rise: 26, ms: 720 });
    floatText(`+${fmt0(amount)}`, 'is-heal', at(foe, 0.5, 0.02));
    hpTo(hp + amount, 800);
    await wait(820);
  }

  async function heal(r) {
    const p = px();
    await monsterAttack(false);
    type(B.LINES.hurt);
    await feast(-r.damage);
    await walk(hero, 0, 380);
    sfx('jump');
    await move(hero, 0, -8 * p, 140, 'steps(2, end)');
    await move(hero, 0, 0, 140, 'steps(2, end)');
    await type(finalLine(r));
  }

  async function clash(r) {
    type(B.LINES.clash);
    for (let i = 0; i < 2; i++) {
      const half = gap() / 2;
      const hitAt = wield(hero, B.HERO.weapon.swing, 520);
      wield(foe, monster.weapon?.swing ?? [0, 0], 520);
      await Promise.all([move(hero, half, 0, 260, 'steps(5, end)'), move(foe, -half, 0, 260, 'steps(5, end)')]);
      await wait(Math.max(0, hitAt - 260));
      sfx('clang');
      shake(2);
      burst(box.hero.x + box.hero.w + half, at(hero, 0, 0.45)[1], { n: 12, spread: 14, rise: 14 });
      await Promise.all([move(hero, 0, 0, 300, 'steps(5, end)'), move(foe, 0, 0, 300, 'steps(5, end)')]);
      await wait(200);
    }
    await type(finalLine(r));
  }

  async function spar() {
    if (busy || !alive || reduced()) return;
    busy = true;
    try {
      await walk(hero, gap() + 2 * px(), 300);
      const hitAt = wield(hero, B.HERO.weapon.swing);
      if (monster.weapon) wield(foe, monster.weapon.swing.map((a) => a * 0.4), 440);
      await wait(hitAt * 0.55);
      sfx('whoosh');
      await wait(hitAt * 0.45);
      const hit = at(foe, 0.22, 0.5);
      sfx('clang');
      burst(...hit, { n: 10, spread: 12, rise: 12 });
      nudge(foe, [[0, 0], [4 * px(), 0], [0, 0]], 200);
      await wait(200);
      await walk(hero, 0, 340);
      await type(pick(B.QUOTES.uebung));
    } finally {
      busy = false;
    }
  }

  async function run() {
    const defeated = hp <= 0 && !round;
    if (reduced()) {
      arena.classList.remove('is-intro');
      if (round) {
        hpSet(round.toHp);
        text.textContent = finalLine(round);
      }
      busy = false;
      return;
    }
    await Promise.all([...arena.querySelectorAll('.fighter img')].map((img) => img.decode().catch(() => {})));
    if (!alive) return;
    box.hero = measure(hero);
    box.foe = measure(foe);
    text.textContent = '';
    life();
    await intro(defeated);
    if (round) {
      await wait(250);
      if (round.type === 'treffer' || round.type === 'sieg') await fight(round);
      else if (round.type === 'heilung') await heal(round);
      else await clash(round);
    } else {
      await wait(900);
      await type(idleLine);
    }
    busy = false;
  }

  run().catch(() => {
    busy = false;
  });

  return {
    spar: () => spar().catch(() => {}),
    stop() {
      alive = false;
      timers.forEach(clearTimeout);
      timers.clear();
      anims.forEach((a) => a.cancel());
      anims.clear();
    },
  };
}
