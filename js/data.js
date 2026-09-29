// Nährwerte: Durchschnitt gängiger Packungsangaben, je `per` Einheiten (100 g, 100 ml, 1 Stück …).
export const ITEMS = {
  haferflocken: { name: 'Haferflocken', unit: 'g', per: 100, kcal: 370, protein: 13.5, fat: 7, carbs: 59, cat: 'trocken' },
  whey: { name: 'Impact Whey', unit: 'g', per: 100, kcal: 400, protein: 76.7, fat: 6.7, carbs: 6.7, cat: 'vorrat', showAmount: true },
  tk_beeren: { name: 'TK-Beeren', unit: 'g', per: 100, kcal: 45, protein: 1, fat: 0.3, carbs: 9, cat: 'tk' },
  magerquark: { name: 'Magerquark', unit: 'g', per: 100, kcal: 68, protein: 12, fat: 0.3, carbs: 4, cat: 'kuehl' },
  milch: { name: 'Milch 1,5 %', unit: 'ml', per: 100, kcal: 47, protein: 3.33, fat: 1.5, carbs: 4.8, cat: 'kuehl' },
  banane: { name: 'Bananen', unit: 'Stück', per: 1, kcal: 110, protein: 1.4, fat: 0.2, carbs: 24, cat: 'obst' },
  reis: { name: 'Reis', unit: 'g', per: 100, kcal: 350, protein: 7, fat: 0.58, carbs: 78, cat: 'trocken' },
  tk_gemuese_mix: { name: 'TK-Gemüsemischung (Mittagessen)', unit: 'g', per: 100, kcal: 40, protein: 2.67, fat: 0.33, carbs: 5.67, cat: 'tk' },
  tk_gemuese: { name: 'TK-Brokkoli, -Bohnen oder -Rosenkohl (Abendessen)', unit: 'g', per: 100, kcal: 30, protein: 3, fat: 0.3, carbs: 3, cat: 'tk' },
  thunfisch: { name: 'Thunfisch im eigenen Saft', unit: 'Dose', per: 1, kcal: 154, protein: 35, fat: 1.4, carbs: 0, cat: 'trocken' },
  sojasauce: { name: 'Sojasauce', unit: 'EL', per: 1, kcal: 10, protein: 1, fat: 0, carbs: 1, cat: 'vorrat' },
  oel: { name: 'Öl', unit: 'g', per: 1, kcal: 9, protein: 0, fat: 1, carbs: 0, cat: 'vorrat' },
  gewuerz: { name: 'Gewürze', unit: '', per: 1, kcal: 0, protein: 0, fat: 0, carbs: 0, cat: 'vorrat' },
  haehnchenbrust: { name: 'Hähnchenbrust', unit: 'g', per: 100, kcal: 110, protein: 23.5, fat: 1.5, carbs: 0, cat: 'fleisch' },
  haehnchenschenkel: { name: 'Hähnchenschenkelfilet ohne Haut', unit: 'g', per: 100, kcal: 120, protein: 20, fat: 4, carbs: 0, cat: 'fleisch' },
  schweinelachs: { name: 'Schweinelachs', unit: 'g', per: 100, kcal: 125, protein: 22, fat: 4, carbs: 0, cat: 'fleisch' },
  rinderhuefte: { name: 'Rinderhüftsteak', unit: 'g', per: 100, kcal: 120, protein: 22, fat: 3.5, carbs: 0, cat: 'fleisch' },
  kartoffeln: { name: 'Kartoffeln', unit: 'g', per: 100, kcal: 72, protein: 2, fat: 0.1, carbs: 15, cat: 'obst' },
  nuesse: { name: 'Nüsse, ungesalzen', unit: 'g', per: 100, kcal: 633, protein: 20, fat: 53.3, carbs: 10, cat: 'trocken' },
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
];

export const DEVICES = {
  reiskocher: 'Reiskocher',
  airfryer: 'Airfryer',
  ohne: 'Ohne Kochen',
  frei: 'Frei',
};

const KARTOFFELN_AIRFRYER =
  'Kartoffeln in 2-cm-Würfel schneiden, mit 1 TL Öl und Salz mischen und bei 200 °C in den Airfryer. Sie brauchen insgesamt etwa 25 Minuten.';
const GEMUESE_ZULETZT = 'Das TK-Gemüse für die letzten 10 Minuten dazugeben, zwischendurch einmal schütteln.';
const HAEHNCHEN_CHECK = 'Hähnchen aufschneiden: Innen darf nichts mehr rosa sein.';
const REIS_START = 'Reis waschen und mit so viel Wasser wie immer in den Reiskocher geben.';

export const RECIPES = {
  porridge: {
    name: 'Whey-Porridge', slot: 'fruehstueck', device: 'reiskocher',
    ingredients: [
      { item: 'haferflocken', amount: 70, text: '70 g Haferflocken' },
      { item: 'whey', amount: 30, text: '30 g Impact Whey' },
      { item: 'tk_beeren', amount: 100, text: '100 g TK-Beeren' },
    ],
    steps: [
      'Haferflocken und Wasser im Verhältnis 1:2 in den Reiskocher, Porridge-Programm starten.',
      'Nach dem Kochen 2–3 Minuten abkühlen lassen, dann das Whey einrühren. Zu heiß klumpt es.',
      'TK-Beeren unterheben, die tauen in der Wärme von selbst auf.',
    ],
    tip: 'Reiskocher nicht randvoll machen, Porridge schäumt beim Kochen hoch.',
  },
  quark_bowl: {
    name: 'Quark-Bowl', slot: 'fruehstueck', device: 'ohne',
    ingredients: [
      { item: 'magerquark', amount: 250, text: '250 g Magerquark' },
      { item: 'haferflocken', amount: 40, text: '40 g Haferflocken' },
      { item: 'banane', amount: 1, text: '1 Banane' },
    ],
    steps: ['Quark in eine Schüssel, Haferflocken drüber, Banane in Scheiben obendrauf.'],
    tip: 'Mit einem Schluck Wasser oder Milch wird der Quark cremiger.',
  },
  shake_fruehstueck: {
    name: 'Shake mit Banane', slot: 'fruehstueck', device: 'ohne',
    ingredients: [
      { item: 'whey', amount: 30, text: '30 g Impact Whey' },
      { item: 'milch', amount: 300, text: '300 ml Milch 1,5 %' },
      { item: 'banane', amount: 1, text: '1 Banane' },
    ],
    steps: ['Whey mit der Milch im Shaker schütteln, die Banane dazu essen.'],
  },
  bowl_thunfisch: {
    name: 'Thunfisch-Reis-Bowl', slot: 'mittag', device: 'reiskocher',
    ingredients: [
      { item: 'reis', amount: 120, text: '120 g Reis' },
      { item: 'tk_gemuese_mix', amount: 300, text: '300 g TK-Gemüsemischung' },
      { item: 'thunfisch', amount: 1, text: '1 Dose Thunfisch im eigenen Saft, abgetropft' },
      { item: 'sojasauce', amount: 1, text: '1 EL Sojasauce' },
      { item: 'oel', amount: 10, text: '1 EL Sesam- oder Olivenöl' },
    ],
    steps: [
      REIS_START,
      'TK-Gemüse gefroren obendrauf legen und den Thunfisch darauf verteilen. Nicht umrühren.',
      'Sojasauce und Öl darüberträufeln, Reiskocher starten.',
      'Nach dem Kochen einmal durchmischen.',
    ],
    tip: 'Am besten Dosen mit „Skipjack“ oder „Echter Bonito“ kaufen, die enthalten am wenigsten Quecksilber. Wird der Reis zu weich, nimm beim nächsten Mal einen Schluck weniger Wasser.',
  },
  bowl_haehnchen: {
    name: 'Hähnchen-Reis-Bowl', slot: 'mittag', device: 'reiskocher',
    ingredients: [
      { item: 'reis', amount: 120, text: '120 g Reis' },
      { item: 'tk_gemuese_mix', amount: 300, text: '300 g TK-Gemüsemischung' },
      { item: 'haehnchenbrust', amount: 150, text: '150 g Hähnchenbrust in 2-cm-Würfeln' },
      { item: 'sojasauce', amount: 1, text: '1 EL Sojasauce' },
      { item: 'oel', amount: 10, text: '1 EL Sesam- oder Olivenöl' },
    ],
    steps: [
      REIS_START,
      'TK-Gemüse gefroren obendrauf legen und die Hähnchenwürfel darauf verteilen. Nicht umrühren.',
      'Sojasauce und Öl darüberträufeln, Reiskocher starten.',
      'Nach dem Kochen das größte Stück aufschneiden: Innen darf nichts mehr rosa sein.',
    ],
    tip: 'Eingefrorene Würfel am Vorabend zum Auftauen in den Kühlschrank legen.',
  },
  abend_schenkel_kartoffel: {
    name: 'Hähnchenschenkel mit Kartoffeln', slot: 'abend', device: 'airfryer',
    ingredients: [
      { item: 'haehnchenschenkel', amount: 250, text: '250 g Hähnchenschenkelfilet ohne Haut' },
      { item: 'kartoffeln', amount: 350, text: '350 g Kartoffeln' },
      { item: 'tk_gemuese', amount: 250, text: '250 g TK-Gemüse, z. B. Brokkoli' },
      { item: 'oel', amount: 10, text: '2 TL Öl' },
      { item: 'gewuerz', amount: 0, text: 'Salz, Paprika, Hähnchengewürz' },
    ],
    steps: [
      KARTOFFELN_AIRFRYER,
      'Hähnchen mit 1 TL Öl und Gewürz einreiben und nach 5 Minuten dazulegen. Es braucht etwa 20 Minuten.',
      GEMUESE_ZULETZT,
      HAEHNCHEN_CHECK,
    ],
    tip: 'Passt nicht alles in den Airfryer? Alles aufs Ofenblech, 200 °C Umluft, etwa 30 Minuten.',
  },
  abend_brust_reis: {
    name: 'Hähnchenbrust mit Reis', slot: 'abend', device: 'airfryer',
    ingredients: [
      { item: 'haehnchenbrust', amount: 250, text: '250 g Hähnchenbrust' },
      { item: 'reis', amount: 70, text: '70 g Reis' },
      { item: 'tk_gemuese', amount: 250, text: '250 g TK-Gemüse, z. B. Brokkoli' },
      { item: 'oel', amount: 10, text: '2 TL Öl' },
      { item: 'gewuerz', amount: 0, text: 'Salz, Paprika, Knoblauch' },
    ],
    steps: [
      REIS_START,
      'Hähnchenbrust mit dem Öl und Gewürz einreiben und bei 200 °C etwa 18 Minuten in den Airfryer, nach der Hälfte wenden.',
      GEMUESE_ZULETZT,
      HAEHNCHEN_CHECK,
    ],
    tip: 'Brust ist magerer als Schenkel, deshalb gibt es hier 1 TL Öl mehr.',
  },
  abend_schweinelachs: {
    name: 'Schweinelachs mit Kartoffeln', slot: 'abend', device: 'airfryer',
    ingredients: [
      { item: 'schweinelachs', amount: 250, text: '250 g Schweinelachs' },
      { item: 'kartoffeln', amount: 350, text: '350 g Kartoffeln' },
      { item: 'tk_gemuese', amount: 250, text: '250 g TK-Gemüse, z. B. grüne Bohnen' },
      { item: 'oel', amount: 10, text: '2 TL Öl' },
      { item: 'gewuerz', amount: 0, text: 'Salz, Pfeffer, Paprika' },
    ],
    steps: [
      KARTOFFELN_AIRFRYER,
      'Schweinelachs mit 1 TL Öl und Gewürz einreiben und für die letzten 12–15 Minuten dazulegen, einmal wenden.',
      GEMUESE_ZULETZT,
    ],
  },
  abend_huefte: {
    name: 'Hüftsteak mit Kartoffeln', slot: 'abend', device: 'airfryer',
    ingredients: [
      { item: 'rinderhuefte', amount: 250, text: '250 g Rinderhüftsteak' },
      { item: 'kartoffeln', amount: 350, text: '350 g Kartoffeln' },
      { item: 'tk_gemuese', amount: 250, text: '250 g TK-Gemüse, z. B. Brokkoli' },
      { item: 'oel', amount: 10, text: '2 TL Öl' },
      { item: 'gewuerz', amount: 0, text: 'Salz, Pfeffer' },
    ],
    steps: [
      KARTOFFELN_AIRFRYER,
      'Steak mit 1 TL Öl einreiben und für die letzten 8–10 Minuten dazulegen, einmal wenden. Wie lange genau, hängt von der Dicke ab und davon, wie durch du es magst.',
      GEMUESE_ZULETZT,
      'Steak vor dem Anschneiden 3 Minuten ruhen lassen, dann salzen und pfeffern.',
    ],
  },
  abend_schenkel_reis: {
    name: 'Hähnchenschenkel mit Reis', slot: 'abend', device: 'airfryer',
    ingredients: [
      { item: 'haehnchenschenkel', amount: 250, text: '250 g Hähnchenschenkelfilet ohne Haut' },
      { item: 'reis', amount: 70, text: '70 g Reis' },
      { item: 'tk_gemuese', amount: 250, text: '250 g TK-Gemüse, z. B. Rosenkohl' },
      { item: 'oel', amount: 5, text: '1 TL Öl' },
      { item: 'gewuerz', amount: 0, text: 'Salz, Paprika, Hähnchengewürz' },
    ],
    steps: [
      REIS_START,
      'Hähnchen mit dem Öl und Gewürz einreiben und bei 200 °C etwa 20 Minuten in den Airfryer, einmal wenden.',
      GEMUESE_ZULETZT,
      HAEHNCHEN_CHECK,
    ],
  },
  snack_nuesse: {
    name: 'Nüsse und Banane', slot: 'snack', device: 'ohne',
    ingredients: [
      { item: 'nuesse', amount: 30, text: '30 g Nüsse, ungesalzen' },
      { item: 'banane', amount: 1, text: '1 Banane' },
    ],
    steps: ['Die Nüsse abwiegen statt aus der Tüte zu essen. 30 g sind schnell überschritten.'],
  },
  snack_shake: {
    name: 'Eiweiß-Shake', slot: 'snack', device: 'ohne',
    ingredients: [
      { item: 'whey', amount: 30, text: '30 g Impact Whey' },
      { item: 'milch', amount: 300, text: '300 ml Milch 1,5 %' },
    ],
    steps: ['Whey mit der Milch im Shaker schütteln.'],
  },
  frei: {
    name: 'Freier Abend', slot: 'abend', device: 'frei',
    fixed: { kcal: 1000, protein: 30, fat: 45, carbs: 100 },
    ingredients: [],
    steps: ['Burger oder Pizza, ganz ohne schlechtes Gewissen.', 'Dafür gibt es heute keinen Snack.'],
    tip: 'Die Nährwerte sind eine grobe Schätzung.',
  },
};

// Schlüssel = Wochentag wie Date.getDay(): 0 = Sonntag … 6 = Samstag.
export const WEEK_PLAN = {
  1: { fruehstueck: 'porridge', mittag: 'bowl_thunfisch', abend: 'abend_schenkel_kartoffel', snack: 'snack_nuesse' },
  2: { fruehstueck: 'quark_bowl', mittag: 'bowl_haehnchen', abend: 'abend_brust_reis', snack: 'snack_nuesse' },
  3: { fruehstueck: 'porridge', mittag: 'bowl_thunfisch', abend: 'abend_schweinelachs', snack: 'snack_shake' },
  4: { fruehstueck: 'quark_bowl', mittag: 'bowl_haehnchen', abend: 'abend_schenkel_kartoffel', snack: 'snack_nuesse' },
  5: { fruehstueck: 'porridge', mittag: 'bowl_thunfisch', abend: 'abend_huefte', snack: 'snack_nuesse' },
  6: { fruehstueck: 'shake_fruehstueck', mittag: 'bowl_haehnchen', abend: 'frei', snack: null },
  0: { fruehstueck: 'porridge', mittag: 'bowl_haehnchen', abend: 'abend_schenkel_reis', snack: 'snack_nuesse' },
};

export const SWAPS = {
  fruehstueck: ['porridge', 'quark_bowl', 'shake_fruehstueck'],
  mittag: ['bowl_thunfisch', 'bowl_haehnchen'],
  abend: ['abend_schenkel_kartoffel', 'abend_brust_reis', 'abend_schweinelachs', 'abend_huefte', 'abend_schenkel_reis', 'frei'],
  snack: ['snack_nuesse', 'snack_shake'],
};
