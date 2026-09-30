// Kampf gegen das Monster: Lebenspunkte sind die Kalorien, die bis zum Ziel noch fehlen.
// Gerechnet wie im Plan: 1 kg auf der Waage = 5/6 kg Fett = 5/6 × 7.000 kcal.
import { PLAN } from './logic.js';

export const KCAL_PER_KG = PLAN.kcalPerKg * PLAN.fatShare;

export const MONSTERS = {
  drache: { name: 'Kalorien-Drache', sprite: 'img/pixel/drache.png' },
  oger: { name: 'Vielfraß-Oger', sprite: 'img/pixel/oger.png' },
  ritter: { name: 'Schwarzer Ritter', sprite: 'img/pixel/ritter-schwarz.png' },
};

export const QUOTES = {
  heilung: [
    'Nur Wasser in der Rüstung. Voran!',
    'Ein Ritter fällt und steht wieder auf!',
    'Die Waage schwankt, der Wochenschnitt nicht. Weiter, Kamerad!',
    'Kein Rückzug! Wir halten die Burg.',
    'Auch die längste Belagerung endet mit einem Sieg.',
    'Heute ein Kratzer, morgen ein Treffer.',
    'Salz und Wasser, kein Fett. Das Biest freut sich zu früh!',
    'Schwert schärfen, Plan halten, weiterkämpfen.',
    'Ein guter Ritter zählt Wochen, nicht Tage.',
    'Hol Luft, Freund. Die nächste Runde gehört uns.',
  ],
  patt: [
    'Das Biest wartet. Trag dein Gewicht ein, dann greifen wir an!',
    'Stillstand ist kein Rückschritt. Wir bleiben dran.',
  ],
  treffer: ['Treffer!', 'Volltreffer!', 'Das hat gesessen!', 'Weiter so, das Biest wankt!'],
  sieg: ['Das Biest ist besiegt! Du hast dein Ziel erreicht.'],
};

export function maxHp(settings) {
  return Math.max(1, Math.round((settings.startKg - settings.targetKg) * KCAL_PER_KG));
}

export function monsterHp(settings, kg) {
  return Math.max(0, Math.round((kg - settings.targetKg) * KCAL_PER_KG));
}

// Neue Runde: letzter Eintrag gegenüber dem Stand, gegen den zuletzt gekämpft wurde.
export function pendingRound(entries, settings, seen) {
  const last = entries[entries.length - 1];
  if (!last || (seen && seen.date === last.date && seen.kg === last.kg)) return null;
  const fromKg = seen?.kg ?? settings.startKg;
  const fromHp = monsterHp(settings, fromKg);
  const toHp = monsterHp(settings, last.kg);
  const type = toHp <= 0 ? 'sieg' : toHp < fromHp ? 'treffer' : toHp > fromHp ? 'heilung' : 'patt';
  return { date: last.date, fromKg, toKg: last.kg, fromHp, toHp, damage: fromHp - toHp, type };
}

// Spruch passend zum Ausgang, für denselben Tag immer derselbe.
export function quote(type, iso) {
  const list = QUOTES[type] ?? QUOTES.patt;
  let h = 0;
  for (const ch of iso) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return list[h % list.length];
}
