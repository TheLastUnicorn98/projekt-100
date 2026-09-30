import * as B from '../battle.js';
import * as FX from '../fx.js';
import * as SFX from '../sfx.js';
import { formatNumber } from '../logic.js';
import { esc, icon, fmt, dateShort } from '../ui.js';

const HERO = { sprite: 'img/pixel/held.png', w: 38 };
const WIDTHS = { drache: 86, oger: 89, ritter: 60 };
const fmt0 = (v) => formatNumber(Math.round(v), 0);
const kgLabel = (kg) => `${formatNumber(kg, kg % 1 ? (Math.round(kg * 100) % 10 ? 2 : 1) : 0)} kg`;

function logCard(ctx, round) {
  const { s, state } = ctx;
  const last = round ?? state.battle.last;
  const nowKg = round ? round.toKg : (state.battle.seen?.kg ?? s.startKg);
  const done = Math.max(0, Math.min(100, ((s.startKg - nowKg) / (s.startKg - s.targetKg)) * 100));
  const line = last
    ? `${round && !ctx.replaying ? 'Neue Runde' : 'Letzte Runde'} am ${dateShort(last.date)}: ${kgLabel(last.fromKg)} → ${kgLabel(last.toKg)}`
    : 'Noch keine Runde. Trag dein Gewicht ein, dann greift dein Ritter an.';
  return `<section class="card battle-log">
  <p>${line}</p>
  <p class="muted small">${formatNumber(done, 1)} % des Biests besiegt · noch ${formatNumber(Math.max(0, nowKg - s.targetKg), 1)} kg bis zum Ziel</p>
  ${state.battle.last && !round ? '<button class="btn sm" data-action="battle-replay">Letzte Runde nochmal ansehen</button>' : ''}
</section>`;
}

export function battleView(ctx) {
  const { state, s, entries } = ctx;
  const battle = state.battle;
  const monster = B.MONSTERS[battle.monster] ?? B.MONSTERS.drache;
  const round = ctx.round;
  const max = B.maxHp(s);
  const kg = round ? round.fromKg : (battle.seen?.kg ?? entries[entries.length - 1]?.kg ?? s.startKg);
  const hp = round ? round.fromHp : B.monsterHp(s, kg);
  const pct = Math.max(0, Math.min(100, (hp / max) * 100));
  const idle = round ? '' : B.quote(hp <= 0 ? 'sieg' : 'patt', ctx.todayISO);
  const foes = Object.entries(B.MONSTERS)
    .map(
      ([id, m]) => `<button class="foe ${battle.monster === id ? 'is-active' : ''}" data-action="battle-monster" data-id="${id}" aria-pressed="${battle.monster === id}">
  <img class="pixel" src="${m.sprite}" alt="" style="--w:${WIDTHS[id]}"><span>${esc(m.name)}</span></button>`,
    )
    .join('');
  return `<header class="swipe-top">
  <a class="icon-btn" href="#heute" aria-label="Zurück">${icon('zurueck')}</a>
  <div><p class="eyebrow">Kampf um dein Ziel</p><h1>${esc(monster.name)}</h1></div>
  <button class="icon-btn" data-action="battle-sound" aria-pressed="${battle.sound}" aria-label="${battle.sound ? 'Ton ausschalten' : 'Ton einschalten'}">${icon(battle.sound ? 'ton' : 'stumm')}</button>
</header>
<section class="arena ${hp <= 0 ? 'is-defeated' : ''}" data-max="${max}" aria-label="Kampfszene">
  <img class="arena-bg pixel" src="img/pixel/burg.png" alt="">
  <div class="hud">
    <p class="hud-name">${esc(monster.name)}</p>
    <div class="hp" role="meter" aria-label="Lebenspunkte" aria-valuemin="0" aria-valuemax="${max}" aria-valuenow="${hp}"><i style="width:${pct}%"></i></div>
    <p class="hud-hp"><span class="hp-num">${fmt(hp)}</span> / ${fmt(max)}</p>
  </div>
  <img class="sprite hero pixel" src="${HERO.sprite}" alt="Dein Ritter" style="--w:${HERO.w}">
  <img class="sprite foe-sprite pixel" src="${monster.sprite}" alt="${esc(monster.name)}" style="--w:${WIDTHS[battle.monster] ?? 86}">
  <p class="dmg" hidden></p>
</section>
<section class="dialog" aria-live="polite">
  <p class="dialog-who">Dein Ritter</p>
  <p class="dialog-text">${esc(idle)}</p>
</section>
${logCard(ctx, round)}
<h2 class="foes-title">Wähle deinen Gegner</h2>
<div class="foes">${foes}</div>
<p class="hint">Lebenspunkte sind die Kalorien bis zum Ziel. Jedes Kilo weniger trifft das Biest mit rund 5.800 Punkten.</p>`;
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function typeText(el, text) {
  el.textContent = '';
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = text;
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    let i = 0;
    const tick = () => {
      el.textContent = text.slice(0, ++i);
      if (i < text.length) setTimeout(tick, 22);
      else resolve();
    };
    tick();
  });
}

// Spielt eine Runde ab: Angriff mit Schaden, Heilung des Monsters mit Mutmach-Spruch oder Sieg.
export async function playRound(main, round, sound) {
  const arena = main.querySelector('.arena');
  const hero = main.querySelector('.hero');
  const foe = main.querySelector('.foe-sprite');
  const bar = main.querySelector('.hp i');
  const num = main.querySelector('.hp-num');
  const dmg = main.querySelector('.dmg');
  const text = main.querySelector('.dialog-text');
  if (!arena || !hero || !foe) return;
  const max = Number(arena.dataset.max);
  const pct = (hp) => `${Math.max(0, Math.min(100, (hp / max) * 100))}%`;
  const setHp = (from, to, ms) => {
    bar.animate([{ width: pct(from) }, { width: pct(to) }], { duration: ms, easing: 'steps(14, end)', fill: 'forwards' });
    FX.countUp(num, from, to, fmt0, ms);
  };
  const float = (label, cls) => {
    dmg.textContent = label;
    dmg.className = `dmg ${cls}`;
    dmg.hidden = false;
    dmg.animate(
      [
        { opacity: 0, transform: 'translate(-50%, 8px)' },
        { opacity: 1, transform: 'translate(-50%, -10px)', offset: 0.2 },
        { opacity: 1, transform: 'translate(-50%, -24px)', offset: 0.8 },
        { opacity: 0, transform: 'translate(-50%, -34px)' },
      ],
      { duration: 1500, easing: 'linear', fill: 'forwards' },
    );
  };
  text.textContent = '';
  await wait(400);

  if (round.type === 'treffer' || round.type === 'sieg') {
    const crit = round.damage >= B.KCAL_PER_KG;
    const dist = foe.getBoundingClientRect().left - hero.getBoundingClientRect().right + 12;
    const dash = hero.animate([{ transform: 'translateX(0)' }, { transform: `translateX(${dist}px)` }], {
      duration: 280,
      easing: 'steps(6, end)',
      fill: 'forwards',
    });
    await dash.finished;
    SFX.play('slash', sound);
    hero.animate(
      [
        { transform: `translateX(${dist}px) rotate(0deg)` },
        { transform: `translateX(${dist}px) rotate(-20deg)` },
        { transform: `translateX(${dist}px) rotate(0deg)` },
      ],
      { duration: 200, easing: 'steps(3, end)' },
    );
    await wait(110);
    SFX.play(crit ? 'crit' : 'hit', sound);
    FX.haptic(crit ? [30, 40, 60] : 25);
    foe.animate([{ filter: 'none' }, { filter: 'brightness(3) saturate(0)' }, { filter: 'none' }, { filter: 'brightness(3) saturate(0)' }, { filter: 'none' }], {
      duration: 400,
      easing: 'steps(4, end)',
    });
    foe.animate([{ translate: '0 0' }, { translate: '8px 0' }, { translate: '-6px 0' }, { translate: '4px 0' }, { translate: '0 0' }], {
      duration: 400,
      easing: 'steps(4, end)',
    });
    arena.animate([{ translate: '0 0' }, { translate: '-3px 2px' }, { translate: '2px -2px' }, { translate: '0 0' }], { duration: 240, easing: 'steps(3, end)' });
    float(`-${fmt0(round.damage)}`, crit ? 'is-crit' : 'is-hit');
    setHp(round.fromHp, round.toHp, 1000);
    await wait(350);
    dash.cancel();
    await hero.animate([{ transform: `translateX(${dist}px)` }, { transform: 'translateX(0)' }], { duration: 320, easing: 'steps(6, end)' }).finished;
    if (round.type === 'sieg') {
      await wait(400);
      SFX.play('victory', sound);
      foe.animate([{ transform: 'none', opacity: 1 }, { transform: 'translateY(24px) rotate(90deg)', opacity: 0 }], {
        duration: 1000,
        easing: 'steps(8, end)',
        fill: 'forwards',
      });
      FX.fireworks(6);
      await typeText(text, B.quote('sieg', round.date));
    } else {
      await typeText(text, `${crit ? 'Kritischer Treffer!' : B.quote('treffer', round.date)} ${fmt0(round.damage)} Kalorien Schaden.`);
    }
  } else if (round.type === 'heilung') {
    SFX.play('laugh', sound);
    foe.animate(
      [{ translate: '0 0', scale: '1' }, { translate: '0 -12px', scale: '1.06' }, { translate: '0 0', scale: '1' }, { translate: '0 -7px', scale: '1.03' }, { translate: '0 0', scale: '1' }],
      { duration: 760, easing: 'steps(6, end)' },
    );
    await wait(420);
    SFX.play('heal', sound);
    float(`+${fmt0(-round.damage)}`, 'is-heal');
    setHp(round.fromHp, round.toHp, 900);
    await wait(900);
    await typeText(text, B.quote('heilung', round.date));
  } else {
    await typeText(text, B.quote('patt', round.date));
  }
}
