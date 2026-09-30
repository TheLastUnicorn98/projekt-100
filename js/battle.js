// Kampf gegen das Monster: Lebenspunkte sind die Kalorien, die bis zum Ziel noch fehlen.
// Gerechnet wie im Plan: 1 kg auf der Waage = 5/6 kg Fett = 5/6 × 7.000 kcal.
import { PLAN } from './logic.js';

export const KCAL_PER_KG = PLAN.kcalPerKg * PLAN.fatShare;

// w: Breite der Pixelgrafik. aim und mouth: Waffe und Maul als Anteil der Bildgröße (von links oben).
// sprite zeigt die ganze Figur (Auswahl), body die Figur ohne Waffe (Kampf). weapon.pivot ist der
// Drehpunkt in Bildpunkten der Figur, swing die Winkel für Ausholen und Zuschlagen.
export const HERO = {
  body: 'img/pixel/held-koerper.png',
  w: 38,
  weapon: { src: 'img/pixel/held-waffe.png', x: -6, w: 44, pivot: [7, 37], front: true, swing: [150, -50] },
};

export const MONSTERS = {
  drache: { name: 'Kalorien-Drache', sprite: 'img/pixel/drache.png', w: 86, attack: 'Feueratem', entrance: 'fly', aim: [0.08, 0.22], mouth: [0.08, 0.22] },
  oger: {
    name: 'Vielfraß-Oger',
    sprite: 'img/pixel/oger.png',
    body: 'img/pixel/oger-koerper.png',
    w: 89,
    attack: 'Keulenschlag',
    entrance: 'stomp',
    aim: [0.12, 0.07],
    mouth: [0.47, 0.23],
    weapon: { src: 'img/pixel/oger-waffe.png', x: 0, w: 89, pivot: [14, 45], swing: [50, -110] },
  },
  ritter: {
    name: 'Schwarzer Ritter',
    sprite: 'img/pixel/ritter-schwarz.png',
    body: 'img/pixel/ritter-schwarz-koerper.png',
    w: 60,
    attack: 'Schwerthieb',
    entrance: 'march',
    aim: [0.04, 0.88],
    mouth: [0.5, 0.1],
    weapon: { src: 'img/pixel/ritter-schwarz-waffe.png', x: 0, w: 60, pivot: [21, 49], swing: [120, -25] },
  },
};

export const LINES = {
  entrance: (m) => `${m.name} stellt sich dir in den Weg!`,
  attack: (m) => `${m.name} setzt ${m.attack} ein!`,
  block: 'Geblockt! Jetzt schlägst du zurück.',
  hurt: 'Autsch! Das Biest nascht und heilt sich.',
  clash: 'Kräftemessen! Keiner weicht zurück.',
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
  uebung: [
    'Übungsschlag! Echten Schaden macht nur die Waage.',
    'Gut gezielt. Der echte Treffer kommt beim Wiegen.',
    'Nur geübt. Das Biest zittert trotzdem.',
  ],
};

// Der Schaden einer Runde verteilt sich auf drei Schläge, der letzte ist der stärkste.
export function splitHits(damage) {
  const part = Math.round(damage * 0.3);
  return [part, part, damage - 2 * part];
}

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
