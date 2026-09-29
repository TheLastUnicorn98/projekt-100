// Nährwerte: Durchschnitt gängiger Packungsangaben, je `per` Einheiten (100 g, 100 ml, 1 Stück …).
// `veg: true` zählt fürs Gemüse-Minimum, `fiber` sind Ballaststoffe.
export const ITEMS = {
  haferflocken: { name: 'Haferflocken', unit: 'g', per: 100, kcal: 370, protein: 13.5, fat: 7, carbs: 59, fiber: 10, cat: 'trocken' },
  reis: { name: 'Reis', unit: 'g', per: 100, kcal: 350, protein: 7, fat: 0.6, carbs: 78, fiber: 1.4, cat: 'trocken' },
  nudeln: { name: 'Nudeln', unit: 'g', per: 100, kcal: 355, protein: 12.5, fat: 1.5, carbs: 70, fiber: 3, cat: 'trocken' },
  kartoffeln: { name: 'Kartoffeln', unit: 'g', per: 100, kcal: 72, protein: 2, fat: 0.1, carbs: 15, fiber: 2, cat: 'obst' },
  suesskartoffeln: { name: 'Süßkartoffeln', unit: 'g', per: 100, kcal: 86, protein: 1.6, fat: 0.1, carbs: 20, fiber: 3, cat: 'obst' },
  vollkornbrot: { name: 'Vollkornbrot', unit: 'Scheibe', per: 1, kcal: 108, protein: 3.8, fat: 0.8, carbs: 19, fiber: 3.8, cat: 'trocken', one: 'Scheibe Vollkornbrot', many: 'Scheiben Vollkornbrot' },
  wraps: { name: 'Weizen-Wraps', unit: 'Stück', per: 1, kcal: 190, protein: 5.5, fat: 4.5, carbs: 31, fiber: 2, cat: 'trocken', one: 'Wrap', many: 'Wraps' },
  reiswaffeln: { name: 'Reiswaffeln', unit: 'Stück', per: 1, kcal: 30, protein: 0.6, fat: 0.2, carbs: 6.4, fiber: 0.3, cat: 'trocken', one: 'Reiswaffel', many: 'Reiswaffeln' },

  haehnchenbrust: { name: 'Hähnchenbrust', unit: 'g', per: 100, kcal: 110, protein: 23.5, fat: 1.5, carbs: 0, fiber: 0, cat: 'fleisch' },
  haehnchenschenkel: { name: 'Hähnchenschenkelfilet ohne Haut', unit: 'g', per: 100, kcal: 120, protein: 20, fat: 4, carbs: 0, fiber: 0, cat: 'fleisch' },
  putenbrust: { name: 'Putenbrust', unit: 'g', per: 100, kcal: 105, protein: 24, fat: 1, carbs: 0, fiber: 0, cat: 'fleisch' },
  rinderhack: { name: 'Rinderhack, mager', unit: 'g', per: 100, kcal: 150, protein: 20, fat: 8, carbs: 0, fiber: 0, cat: 'fleisch' },
  rinderhuefte: { name: 'Rinderhüftsteak', unit: 'g', per: 100, kcal: 120, protein: 22, fat: 3.5, carbs: 0, fiber: 0, cat: 'fleisch' },
  schweinelachs: { name: 'Schweinelachs', unit: 'g', per: 100, kcal: 125, protein: 22, fat: 4, carbs: 0, fiber: 0, cat: 'fleisch' },
  putenaufschnitt: { name: 'Putenbrust-Aufschnitt', unit: 'g', per: 100, kcal: 105, protein: 20, fat: 2, carbs: 1.5, fiber: 0, cat: 'kuehl' },
  lachs: { name: 'Lachsfilet (TK)', unit: 'g', per: 100, kcal: 200, protein: 20, fat: 13, carbs: 0, fiber: 0, cat: 'tk' },
  kabeljau: { name: 'Kabeljau- oder Seelachsfilet (TK)', unit: 'g', per: 100, kcal: 80, protein: 18, fat: 0.8, carbs: 0, fiber: 0, cat: 'tk' },
  garnelen: { name: 'Garnelen (TK)', unit: 'g', per: 100, kcal: 70, protein: 16, fat: 0.8, carbs: 0.5, fiber: 0, cat: 'tk' },
  thunfisch: { name: 'Thunfisch im eigenen Saft', unit: 'Dose', per: 1, kcal: 154, protein: 35, fat: 1.4, carbs: 0, fiber: 0, cat: 'trocken' },

  eier: { name: 'Eier', unit: 'Stück', per: 1, kcal: 80, protein: 7, fat: 5.5, carbs: 0.3, fiber: 0, cat: 'kuehl', one: 'Ei', many: 'Eier' },
  magerquark: { name: 'Magerquark', unit: 'g', per: 100, kcal: 68, protein: 12, fat: 0.3, carbs: 4, fiber: 0, cat: 'kuehl' },
  skyr: { name: 'Skyr', unit: 'g', per: 100, kcal: 63, protein: 11, fat: 0.2, carbs: 4, fiber: 0, cat: 'kuehl' },
  huettenkaese: { name: 'Hüttenkäse', unit: 'g', per: 100, kcal: 98, protein: 12.3, fat: 4.3, carbs: 2.6, fiber: 0, cat: 'kuehl' },
  milch: { name: 'Milch 1,5 %', unit: 'ml', per: 100, kcal: 47, protein: 3.33, fat: 1.5, carbs: 4.8, fiber: 0, cat: 'kuehl' },
  proteinpudding: { name: 'Protein-Pudding', unit: 'Becher', per: 1, kcal: 150, protein: 20, fat: 3, carbs: 10, fiber: 0, cat: 'kuehl' },
  kokosmilch: { name: 'Kokosmilch light', unit: 'ml', per: 100, kcal: 80, protein: 0.8, fat: 8, carbs: 1.5, fiber: 0, cat: 'trocken' },

  tk_gemuese_mix: { name: 'TK-Gemüsemischung', unit: 'g', per: 100, kcal: 40, protein: 2.7, fat: 0.3, carbs: 5.7, fiber: 3, cat: 'tk', veg: true },
  tk_brokkoli: { name: 'TK-Brokkoli', unit: 'g', per: 100, kcal: 30, protein: 3, fat: 0.3, carbs: 3, fiber: 3, cat: 'tk', veg: true },
  tk_bohnen: { name: 'TK-Brechbohnen', unit: 'g', per: 100, kcal: 30, protein: 2, fat: 0.2, carbs: 4.5, fiber: 3, cat: 'tk', veg: true },
  tk_paprika: { name: 'TK-Paprika-Mix', unit: 'g', per: 100, kcal: 30, protein: 1.2, fat: 0.3, carbs: 5, fiber: 2, cat: 'tk', veg: true },
  tk_spinat: { name: 'TK-Blattspinat', unit: 'g', per: 100, kcal: 20, protein: 2.5, fat: 0.4, carbs: 0.6, fiber: 2.5, cat: 'tk', veg: true },
  tk_rosenkohl: { name: 'TK-Rosenkohl', unit: 'g', per: 100, kcal: 40, protein: 4, fat: 0.3, carbs: 4, fiber: 4, cat: 'tk', veg: true },
  tomaten: { name: 'Gehackte Tomaten (Dose)', unit: 'g', per: 100, kcal: 22, protein: 1.2, fat: 0.2, carbs: 3.5, fiber: 1, cat: 'trocken', veg: true },
  kidneybohnen: { name: 'Kidneybohnen (Dose, abgetropft)', unit: 'g', per: 100, kcal: 100, protein: 7, fat: 0.5, carbs: 14, fiber: 6.5, cat: 'trocken', veg: true },
  mais: { name: 'Mais (Dose, abgetropft)', unit: 'g', per: 100, kcal: 80, protein: 2.5, fat: 1.2, carbs: 15, fiber: 3, cat: 'trocken', veg: true },
  rohkost: { name: 'Rohkost (Gurke, Möhren, Tomaten)', unit: 'g', per: 100, kcal: 25, protein: 0.8, fat: 0.2, carbs: 4.5, fiber: 2, cat: 'obst', veg: true },
  tk_beeren: { name: 'TK-Beeren', unit: 'g', per: 100, kcal: 45, protein: 1, fat: 0.3, carbs: 9, fiber: 4, cat: 'tk' },
  banane: { name: 'Bananen', unit: 'Stück', per: 1, kcal: 110, protein: 1.4, fat: 0.2, carbs: 24, fiber: 2.5, cat: 'obst', one: 'Banane', many: 'Bananen' },
  apfel: { name: 'Äpfel', unit: 'Stück', per: 1, kcal: 80, protein: 0.4, fat: 0.2, carbs: 18, fiber: 3.5, cat: 'obst', one: 'Apfel', many: 'Äpfel' },

  whey: { name: 'Impact Whey', unit: 'g', per: 100, kcal: 400, protein: 76.7, fat: 6.7, carbs: 6.7, fiber: 0, cat: 'vorrat', showAmount: true },
  nuesse: { name: 'Nüsse, ungesalzen', unit: 'g', per: 100, kcal: 633, protein: 20, fat: 53.3, carbs: 10, fiber: 8, cat: 'trocken' },
  erdnussbutter: { name: 'Erdnussbutter', unit: 'EL', per: 1, kcal: 90, protein: 3.8, fat: 7.5, carbs: 1.8, fiber: 1, cat: 'vorrat' },
  sojasauce: { name: 'Sojasauce', unit: 'EL', per: 1, kcal: 10, protein: 1, fat: 0, carbs: 1, fiber: 0, cat: 'vorrat' },
  honig: { name: 'Honig', unit: 'TL', per: 1, kcal: 21, protein: 0, fat: 0, carbs: 5.3, fiber: 0, cat: 'vorrat' },
  oel: { name: 'Öl', unit: 'TL', per: 1, kcal: 45, protein: 0, fat: 5, carbs: 0, fiber: 0, cat: 'vorrat' },
  gewuerz: { name: 'Gewürze', unit: '', per: 1, kcal: 0, protein: 0, fat: 0, carbs: 0, fiber: 0, cat: 'vorrat' },
};

export const CATEGORIES = [
  { id: 'fleisch', label: 'Fleisch' },
  { id: 'kuehl', label: 'Kühlregal' },
  { id: 'tk', label: 'Tiefkühl' },
  { id: 'obst', label: 'Obst & Gemüse' },
  { id: 'trocken', label: 'Trocken & Dosen' },
];

export const SLOTS = [
  { id: 'fruehstueck', label: 'Frühstück' },
  { id: 'mittag', label: 'Mittag' },
  { id: 'abend', label: 'Abend' },
  { id: 'snack', label: 'Snack' },
  { id: 'extra', label: 'Extra-Snack' },
];

export const KINDS = { fruehstueck: 'Frühstück', haupt: 'Hauptgericht', snack: 'Snack' };

export const DEVICES = {
  reiskocher: 'Reiskocher',
  airfryer: 'Airfryer',
  ofen: 'Ofen',
  herd: 'Herd',
  ohne: 'Ohne Kochen',
  frei: 'Frei',
};

export const PROTEINS = {
  haehnchen: 'Hähnchen',
  pute: 'Pute',
  rind: 'Rind',
  schwein: 'Schwein',
  fisch: 'Fisch',
  ei: 'Eier',
  milch: 'Quark & Co.',
};

export const DEFAULT_PREFS = {
  devices: ['reiskocher', 'airfryer', 'ofen', 'herd', 'ohne'],
  proteins: Object.keys(PROTEINS),
  maxTime: 20,
  freeEvening: true,
};

// Standardwoche, solange noch keine Woche gewischt wurde. Schlüssel wie Date.getDay(): 0 = Sonntag.
export const WEEK_PLAN = {
  1: { fruehstueck: 'porridge', mittag: 'bowl_thunfisch', abend: 'abend_schenkel_kartoffel', snack: 'snack_nuesse' },
  2: { fruehstueck: 'quark_bowl', mittag: 'bowl_haehnchen', abend: 'abend_brust_reis', snack: 'snack_nuesse' },
  3: { fruehstueck: 'porridge', mittag: 'bowl_thunfisch', abend: 'abend_schweinelachs', snack: 'snack_shake' },
  4: { fruehstueck: 'quark_bowl', mittag: 'bowl_haehnchen', abend: 'abend_schenkel_kartoffel', snack: 'snack_nuesse' },
  5: { fruehstueck: 'porridge', mittag: 'bowl_thunfisch', abend: 'abend_huefte', snack: 'snack_nuesse' },
  6: { fruehstueck: 'shake_fruehstueck', mittag: 'bowl_haehnchen', abend: 'frei', snack: null },
  0: { fruehstueck: 'porridge', mittag: 'bowl_haehnchen', abend: 'abend_schenkel_reis', snack: 'snack_nuesse' },
};

export const STANDARD_SNACKS = ['snack_nuesse', 'snack_shake'];
