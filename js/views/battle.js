import * as B from '../battle.js';
import { formatNumber } from '../logic.js';
import { esc, icon, fmt, dateShort } from '../ui.js';

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

// Kämpfer aus Körper und Waffe. Die Waffe dreht sich um ihren Drehpunkt (Hand oder Schulter).
function fighter(cls, body, w, alt, weapon) {
  const arm = weapon
    ? `<img class="weapon pixel${weapon.front ? ' is-front' : ''}" src="${weapon.src}" alt="" style="--x:${weapon.x};--ww:${weapon.w};--ox:${weapon.pivot[0] - weapon.x};--oy:${weapon.pivot[1]}">`
    : '';
  return `<div class="fighter ${cls}" style="--w:${w}"><img class="body pixel" src="${body}" alt="${esc(alt)}">${arm}</div>`;
}

// Die Bühne ist 192 × 240 Bildpunkte groß, alles darauf liegt im selben Pixelraster (--px).
// Bewegung, Hintergrundleben und Kampf spielt js/arena.js ab.
export function battleView(ctx) {
  const { state, s, entries } = ctx;
  const battle = state.battle;
  const id = B.MONSTERS[battle.monster] ? battle.monster : 'drache';
  const monster = B.MONSTERS[id];
  const round = ctx.round;
  const max = B.maxHp(s);
  const kg = round ? round.fromKg : (battle.seen?.kg ?? entries[entries.length - 1]?.kg ?? s.startKg);
  const hp = round ? round.fromHp : B.monsterHp(s, kg);
  const pct = Math.max(0, Math.min(100, (hp / max) * 100));
  const foes = Object.entries(B.MONSTERS)
    .map(
      ([key, m]) => `<button class="foe ${id === key ? 'is-active' : ''}" data-action="battle-monster" data-id="${key}" aria-pressed="${id === key}">
  <img class="pixel" src="${m.sprite}" alt=""><span>${esc(m.name)}</span></button>`,
    )
    .join('');
  return `<header class="swipe-top battle-top">
  <a class="icon-btn" href="#heute" aria-label="Zurück">${icon('zurueck')}</a>
  <div><p class="eyebrow">Kampf um dein Ziel</p><h1>${esc(monster.name)}</h1></div>
  <button class="icon-btn" data-action="battle-sound" aria-pressed="${battle.sound}" aria-label="${battle.sound ? 'Ton ausschalten' : 'Ton einschalten'}">${icon(battle.sound ? 'ton' : 'stumm')}</button>
</header>
<section class="arena is-intro${hp <= 0 ? ' is-defeated' : ''}" data-action="battle-spar" data-max="${max}" data-hp="${hp}" aria-label="Kampfszene. Antippen für einen Übungsschlag.">
  <div class="stage">
    <img class="arena-bg pixel" src="img/pixel/burg-hoch.png" alt="">
    <div class="sky" aria-hidden="true"></div>
    <div class="lane" aria-hidden="true"></div>
    ${fighter('hero', B.HERO.body, B.HERO.w, 'Dein Ritter', B.HERO.weapon)}
    ${fighter('foe-sprite', monster.body ?? monster.sprite, monster.w, monster.name, monster.weapon)}
    <div class="fx-layer" aria-hidden="true"></div>
  </div>
  <div class="hud">
    <p class="hud-name">${esc(monster.name)}</p>
    <div class="hp" role="meter" aria-label="Lebenspunkte" aria-valuemin="0" aria-valuemax="${max}" aria-valuenow="${hp}"><i style="width:${pct}%"></i></div>
    <p class="hud-hp"><span class="hp-num">${fmt(hp)}</span> / ${fmt(max)}</p>
  </div>
  ${battle.last ? `<button class="arena-replay" data-action="battle-replay" aria-label="Letzte Runde nochmal ansehen">${icon('undo', 'sm')}<span>Nochmal</span></button>` : ''}
</section>
<section class="dialog" aria-live="polite">
  <p class="dialog-who">Dein Ritter</p>
  <p class="dialog-text">${round ? '' : esc(B.quote(hp <= 0 ? 'sieg' : 'patt', ctx.todayISO))}</p>
</section>
${logCard(ctx, round)}
<h2 class="foes-title">Wähle deinen Gegner</h2>
<div class="foes">${foes}</div>
<p class="hint">Lebenspunkte sind die Kalorien bis zum Ziel. Jedes Kilo weniger trifft das Biest mit rund 5.800 Punkten. Tipp auf die Szene für einen Übungsschlag.</p>`;
}
