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
  zwiebeln: { name: 'Zwiebeln', unit: 'g', per: 100, kcal: 40, protein: 1.2, fat: 0.1, carbs: 8, fiber: 1.8, cat: 'obst', veg: true },

  // Schwäbisches
  laugenbrezel: { name: 'Laugenbrezeln', unit: 'Stück', per: 1, kcal: 220, protein: 7, fat: 2, carbs: 43, fiber: 2, cat: 'trocken', one: 'Laugenbrezel', many: 'Laugenbrezeln' },
  maultaschen: { name: 'Maultaschen (Kühlregal)', unit: 'Stück', per: 1, kcal: 156, protein: 6.5, fat: 6.4, carbs: 17.3, fiber: 1.2, cat: 'kuehl', one: 'Maultasche', many: 'Maultaschen' },
  spaetzle: { name: 'Spätzle (Kühlregal)', unit: 'g', per: 100, kcal: 188, protein: 7, fat: 2.5, carbs: 34, fiber: 1.5, cat: 'kuehl' },
  schupfnudeln: { name: 'Schupfnudeln (Kühlregal)', unit: 'g', per: 100, kcal: 160, protein: 4, fat: 1, carbs: 33, fiber: 2, cat: 'kuehl' },
  linsen: { name: 'Linsen (Dose, abgetropft)', unit: 'g', per: 100, kcal: 110, protein: 8, fat: 0.5, carbs: 16, fiber: 6, cat: 'trocken', veg: true },
  sauerkraut: { name: 'Sauerkraut', unit: 'g', per: 100, kcal: 20, protein: 1.5, fat: 0.3, carbs: 1, fiber: 3, cat: 'trocken', veg: true },
  tk_suppengemuese: { name: 'TK-Suppengemüse', unit: 'g', per: 100, kcal: 30, protein: 1.5, fat: 0.3, carbs: 5, fiber: 2.5, cat: 'tk', veg: true },
  gefluegelwiener: { name: 'Geflügel-Wiener', unit: 'g', per: 100, kcal: 190, protein: 14, fat: 14, carbs: 1, fiber: 0, cat: 'kuehl' },
  kasseler: { name: 'Kasseler, mager', unit: 'g', per: 100, kcal: 130, protein: 21, fat: 5, carbs: 0.5, fiber: 0, cat: 'fleisch' },
  kaese_light: { name: 'Reibekäse light', unit: 'g', per: 100, kcal: 270, protein: 29, fat: 17, carbs: 0.5, fiber: 0, cat: 'kuehl' },
  bruehe: { name: 'Gemüsebrühe (Pulver)', unit: 'TL', per: 1, kcal: 10, protein: 0.3, fat: 0.5, carbs: 1, fiber: 0, cat: 'vorrat' },

  whey: { name: 'Impact Whey', unit: 'g', per: 100, kcal: 400, protein: 76.7, fat: 6.7, carbs: 6.7, fiber: 0, cat: 'vorrat', showAmount: true },
  nuesse: { name: 'Nüsse, ungesalzen', unit: 'g', per: 100, kcal: 633, protein: 20, fat: 53.3, carbs: 10, fiber: 8, cat: 'trocken' },
  erdnussbutter: { name: 'Erdnussbutter', unit: 'EL', per: 1, kcal: 90, protein: 3.8, fat: 7.5, carbs: 1.8, fiber: 1, cat: 'vorrat' },
  sojasauce: { name: 'Sojasauce', unit: 'EL', per: 1, kcal: 10, protein: 1, fat: 0, carbs: 1, fiber: 0, cat: 'vorrat' },
  honig: { name: 'Honig', unit: 'TL', per: 1, kcal: 21, protein: 0, fat: 0, carbs: 5.3, fiber: 0, cat: 'vorrat' },
  oel: { name: 'Öl', unit: 'TL', per: 1, kcal: 45, protein: 0, fat: 5, carbs: 0, fiber: 0, cat: 'vorrat' },
  gewuerz: { name: 'Gewürze', unit: '', per: 1, kcal: 0, protein: 0, fat: 0, carbs: 0, fiber: 0, cat: 'vorrat' },

  // Für die viralen Rezepte
  sauerteigbrot: { name: 'Sauerteigbrot', unit: 'Scheibe', per: 1, kcal: 112, protein: 3.5, fat: 0.7, carbs: 21.5, fiber: 3, cat: 'trocken', one: 'Scheibe Sauerteigbrot', many: 'Scheiben Sauerteigbrot' },
  pesto: { name: 'Pesto Genovese (Glas)', unit: 'EL', per: 1, kcal: 75, protein: 0.8, fat: 7.5, carbs: 0.9, fiber: 0.3, cat: 'trocken' },
  weizenmehl: { name: 'Weizenmehl Type 405', unit: 'g', per: 100, kcal: 345, protein: 10, fat: 1, carbs: 72, fiber: 4, cat: 'trocken' },
  frischkaese_light: { name: 'Frischkäse leicht', unit: 'g', per: 100, kcal: 140, protein: 7.5, fat: 11, carbs: 3.5, fiber: 0, cat: 'kuehl' },
  raeucherlachs: { name: 'Räucherlachs', unit: 'g', per: 100, kcal: 185, protein: 21.5, fat: 11, carbs: 0, fiber: 0, cat: 'kuehl' },
  feta_light: { name: 'Feta leicht', unit: 'g', per: 100, kcal: 190, protein: 19, fat: 12, carbs: 1, fiber: 0, cat: 'kuehl' },
  parmesan: { name: 'Parmesan', unit: 'g', per: 100, kcal: 392, protein: 33, fat: 28, carbs: 0, fiber: 0, cat: 'kuehl' },
  kochcreme: { name: 'Kochcreme 7 % Fett', unit: 'ml', per: 100, kcal: 85, protein: 1.1, fat: 7.2, carbs: 4.3, fiber: 0, cat: 'kuehl' },
  getrocknete_tomaten: { name: 'Getrocknete Tomaten in Öl (abgetropft)', unit: 'g', per: 100, kcal: 180, protein: 4.5, fat: 12, carbs: 11, fiber: 6, cat: 'trocken' },
  roemersalat: { name: 'Römersalatherzen', unit: 'g', per: 100, kcal: 17, protein: 1.2, fat: 0.3, carbs: 1.8, fiber: 1.8, cat: 'obst', veg: true },
  kirschtomaten: { name: 'Kirschtomaten', unit: 'g', per: 100, kcal: 20, protein: 1, fat: 0.3, carbs: 3, fiber: 1.3, cat: 'obst', veg: true },
  haehnchen_gegart: { name: 'Hähnchenbrust-Streifen, gegart (Kühlregal)', unit: 'g', per: 100, kcal: 120, protein: 23, fat: 2.5, carbs: 1, fiber: 0, cat: 'kuehl' },
  paprikaschote: { name: 'Paprika (rot oder gelb)', unit: 'Stück', per: 1, kcal: 55, protein: 2, fat: 0.8, carbs: 9.6, fiber: 5.4, cat: 'obst', veg: true, one: 'Paprikaschote', many: 'Paprikaschoten' },
  champignons: { name: 'Champignons, frisch', unit: 'g', per: 100, kcal: 20, protein: 3, fat: 0.3, carbs: 0.6, fiber: 2, cat: 'obst', veg: true },
  eiklar: { name: 'Eiklar (flüssig, Kühlregal)', unit: 'ml', per: 100, kcal: 48, protein: 11, fat: 0.1, carbs: 0.7, fiber: 0, cat: 'kuehl' },
  tomaten_frisch: { name: 'Tomaten, frisch', unit: 'g', per: 100, kcal: 18, protein: 1, fat: 0.2, carbs: 2.6, fiber: 1.3, cat: 'obst', veg: true },
  butter: { name: 'Butter', unit: 'g', per: 100, kcal: 741, protein: 0.7, fat: 83, carbs: 0.6, fiber: 0, cat: 'kuehl' },
  broetchen: { name: 'Weizenbrötchen (Aufbackbrötchen)', unit: 'Stück', per: 1, kcal: 150, protein: 5, fat: 1, carbs: 29, fiber: 1.5, cat: 'trocken', one: 'Brötchen', many: 'Brötchen' },
  kochschinken: { name: 'Kochschinken, mager', unit: 'g', per: 100, kcal: 110, protein: 20, fat: 3, carbs: 1, fiber: 0, cat: 'kuehl' },
  zitrone: { name: 'Zitronen', unit: 'Stück', per: 1, kcal: 25, protein: 0.5, fat: 0.3, carbs: 3, fiber: 0.5, cat: 'obst', one: 'Zitrone', many: 'Zitronen' },
  fladenbrot: { name: 'Fladenbrot (türkisch)', unit: 'g', per: 100, kcal: 260, protein: 8.5, fat: 1.5, carbs: 52, fiber: 2.5, cat: 'trocken' },
  austernsosse: { name: 'Austernsoße', unit: 'EL', per: 1, kcal: 20, protein: 0.4, fat: 0, carbs: 4.5, fiber: 0, cat: 'trocken' },
  tomatenmark: { name: 'Tomatenmark', unit: 'EL', per: 1, kcal: 13, protein: 0.7, fat: 0.1, carbs: 2, fiber: 0.5, cat: 'trocken' },
  putenhack: { name: 'Puten- oder Geflügelhack', unit: 'g', per: 100, kcal: 130, protein: 21, fat: 5, carbs: 0, fiber: 0, cat: 'fleisch' },
  gochujang: { name: 'Gochujang (koreanische Chilipaste)', unit: 'EL', per: 1, kcal: 42, protein: 1.1, fat: 0.4, carbs: 7.2, fiber: 0.4, cat: 'trocken' },
  nori: { name: 'Nori-Algenblätter (Sushi)', unit: 'Stück', per: 1, kcal: 7, protein: 1, fat: 0.1, carbs: 1, fiber: 0.9, cat: 'trocken', one: 'Nori-Blatt', many: 'Nori-Blätter' },
  avocado: { name: 'Avocado', unit: 'g', per: 100, kcal: 170, protein: 2, fat: 16, carbs: 1.9, fiber: 6.5, cat: 'obst' },
  weisskohl: { name: 'Weißkohl oder Spitzkohl', unit: 'g', per: 100, kcal: 25, protein: 1.4, fat: 0.2, carbs: 4.2, fiber: 3, cat: 'obst', veg: true },
  gurke: { name: 'Salatgurken', unit: 'Stück', per: 1, kcal: 50, protein: 2.4, fat: 0.8, carbs: 7.2, fiber: 2, cat: 'obst', veg: true, one: 'Salatgurke', many: 'Salatgurken' },
  putensalami: { name: 'Puten-Salami', unit: 'g', per: 100, kcal: 230, protein: 20, fat: 16.5, carbs: 1, fiber: 0, cat: 'kuehl' },
  erdbeeren: { name: 'Erdbeeren', unit: 'g', per: 100, kcal: 32, protein: 0.7, fat: 0.4, carbs: 5.5, fiber: 2, cat: 'obst' },
  karamellkekse: { name: 'Karamellgebäck (Lotus-Art)', unit: 'Stück', per: 1, kcal: 38, protein: 0.4, fat: 1.5, carbs: 5.7, fiber: 0.1, cat: 'trocken', one: 'Karamellkeks', many: 'Karamellkekse' },
  zartbitter: { name: 'Zartbitterschokolade (70 %)', unit: 'g', per: 100, kcal: 566, protein: 9.5, fat: 41, carbs: 34, fiber: 10, cat: 'trocken' },
  fruehlingszwiebeln: { name: 'Frühlingszwiebeln', unit: 'Stück', per: 1, kcal: 5, protein: 0.3, fat: 0.1, carbs: 0.7, fiber: 0.4, cat: 'obst', veg: true, one: 'Frühlingszwiebel', many: 'Frühlingszwiebeln' },
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
