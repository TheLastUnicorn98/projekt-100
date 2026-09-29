// Einfache Gerichte, angelehnt an beliebte schnelle Rezepte. Nährwerte rechnet die App aus den Zutaten.
// `side: [min, max, schritt]` markiert die Beilage, deren Menge der Planer anpasst, damit der Tag passt.
// Das Bild liegt unter img/<id>.webp.

const REIS = 'Reis waschen und mit so viel Wasser wie immer in den Reiskocher geben.';
const KARTOFFELN = 'Kartoffeln in 2-cm-Würfel schneiden, mit 1 TL Öl und Salz mischen und bei 200 °C in den Airfryer. Sie brauchen etwa 25 Minuten.';
const GEMUESE = 'Das TK-Gemüse für die letzten 10 Minuten dazugeben, zwischendurch einmal schütteln.';
const DURCH = 'Aufschneiden: Innen darf nichts mehr rosa sein.';
const OFEN = 'Passt nicht alles in den Airfryer? Alles aufs Blech, 200 °C Umluft, etwa 30 Minuten.';

export const RECIPES = {
  // ---------- Frühstück ----------
  porridge: {
    name: 'Whey-Porridge', slot: 'fruehstueck', device: 'reiskocher', time: 5, proteins: ['milch'],
    ingredients: [
      { item: 'haferflocken', amount: 70, side: [40, 150] },
      { item: 'whey', amount: 30 },
      { item: 'tk_beeren', amount: 100 },
    ],
    steps: [
      'Haferflocken und Wasser im Verhältnis 1:2 in den Reiskocher, Porridge-Programm starten.',
      'Nach dem Kochen 2–3 Minuten abkühlen lassen, dann das Whey einrühren. Zu heiß klumpt es.',
      'TK-Beeren unterheben, die tauen in der Wärme von selbst auf.',
    ],
    tip: 'Reiskocher nicht randvoll machen, Porridge schäumt hoch.',
  },
  quark_bowl: {
    name: 'Quark-Bowl mit Banane', slot: 'fruehstueck', device: 'ohne', time: 3, proteins: ['milch'],
    ingredients: [
      { item: 'magerquark', amount: 250 },
      { item: 'haferflocken', amount: 40, side: [20, 120] },
      { item: 'banane', amount: 1 },
    ],
    steps: ['Quark in eine Schüssel, Haferflocken drüber, Banane in Scheiben obendrauf.'],
    tip: 'Mit einem Schluck Wasser oder Milch wird der Quark cremiger.',
  },
  shake_fruehstueck: {
    name: 'Bananen-Shake', slot: 'fruehstueck', device: 'ohne', time: 2, proteins: ['milch'],
    ingredients: [
      { item: 'whey', amount: 30 },
      { item: 'milch', amount: 300, side: [200, 600, 50] },
      { item: 'banane', amount: 1 },
    ],
    steps: ['Whey mit der Milch im Shaker schütteln, die Banane dazu essen.'],
  },
  overnight_oats: {
    name: 'Overnight Oats mit Skyr', slot: 'fruehstueck', device: 'ohne', time: 5, proteins: ['milch'],
    ingredients: [
      { item: 'haferflocken', amount: 60, side: [30, 120] },
      { item: 'skyr', amount: 200 },
      { item: 'milch', amount: 100 },
      { item: 'tk_beeren', amount: 100 },
    ],
    steps: [
      'Abends Haferflocken, Skyr und Milch in einem Glas verrühren, die gefrorenen Beeren obendrauf.',
      'Über Nacht in den Kühlschrank. Morgens nur noch umrühren.',
    ],
  },
  ruehrei_brot: {
    name: 'Spinat-Rührei mit Brot', slot: 'fruehstueck', device: 'herd', time: 10, proteins: ['ei'],
    ingredients: [
      { item: 'eier', amount: 3 },
      { item: 'tk_spinat', amount: 100 },
      { item: 'vollkornbrot', amount: 2, side: [1, 5, 1] },
      { item: 'oel', amount: 1 },
    ],
    steps: [
      'Spinat mit dem Öl in der Pfanne auftauen lassen.',
      'Eier verquirlen, salzen, dazugeben und bei mittlerer Hitze stocken lassen.',
      'Mit dem Brot essen.',
    ],
  },
  eiermuffins: {
    name: 'Eiermuffins aus dem Airfryer', slot: 'fruehstueck', device: 'airfryer', time: 10, proteins: ['ei', 'pute'],
    ingredients: [
      { item: 'eier', amount: 3 },
      { item: 'putenaufschnitt', amount: 50, note: 'klein geschnitten' },
      { item: 'tk_paprika', amount: 100 },
      { item: 'vollkornbrot', amount: 1, side: [0, 4, 1] },
    ],
    steps: [
      'Eier verquirlen, salzen, Paprika und Aufschnitt unterrühren.',
      'In Silikon-Muffinförmchen füllen und bei 160 °C etwa 12 Minuten in den Airfryer.',
    ],
    tip: 'Die Muffins halten 3 Tage im Kühlschrank. Gleich die doppelte Menge machen.',
  },
  huettenkaese_brot: {
    name: 'Hüttenkäse-Brote', slot: 'fruehstueck', device: 'ohne', time: 5, proteins: ['milch', 'pute'],
    ingredients: [
      { item: 'vollkornbrot', amount: 2, side: [1, 5, 1] },
      { item: 'huettenkaese', amount: 200 },
      { item: 'putenaufschnitt', amount: 50 },
      { item: 'rohkost', amount: 100 },
    ],
    steps: ['Brote mit Hüttenkäse und Aufschnitt belegen, Rohkost dazu.'],
  },
  skyr_apfel: {
    name: 'Skyr mit Apfel und Nüssen', slot: 'fruehstueck', device: 'ohne', time: 3, proteins: ['milch'],
    ingredients: [
      { item: 'skyr', amount: 300 },
      { item: 'apfel', amount: 1 },
      { item: 'haferflocken', amount: 30, side: [0, 100] },
      { item: 'nuesse', amount: 10 },
    ],
    steps: ['Apfel klein schneiden, mit Haferflocken und gehackten Nüssen auf den Skyr.'],
  },
  laugenbrezel_huettenkaese: {
    name: 'Laugenbrezel mit Hüttenkäse', slot: 'fruehstueck', device: 'ohne', time: 3, proteins: ['milch'], region: 'schwaebisch',
    ingredients: [
      { item: 'laugenbrezel', amount: 1, side: [1, 3, 1] },
      { item: 'huettenkaese', amount: 200 },
      { item: 'rohkost', amount: 100, note: 'Radieschen und Gurke' },
      { item: 'gewuerz', amount: 0, text: 'Schnittlauch, Salz' },
    ],
    steps: ['Brezel aufschneiden, mit Hüttenkäse und Schnittlauch füllen.', 'Radieschen und Gurke dazu.'],
  },

  // ---------- Hauptgerichte ----------
  bowl_haehnchen: {
    name: 'Hähnchen-Reis-Bowl', slot: 'haupt', device: 'reiskocher', time: 10, proteins: ['haehnchen'],
    ingredients: [
      { item: 'reis', amount: 100, side: [50, 250] },
      { item: 'tk_gemuese_mix', amount: 300 },
      { item: 'haehnchenbrust', amount: 180, note: 'in 2-cm-Würfeln' },
      { item: 'sojasauce', amount: 1 },
      { item: 'oel', amount: 2 },
    ],
    steps: [
      REIS,
      'TK-Gemüse gefroren obendrauf, Hähnchenwürfel darauf verteilen. Nicht umrühren.',
      'Sojasauce und Öl darüberträufeln, Reiskocher starten.',
      `Nach dem Kochen das größte Stück ${DURCH.toLowerCase()}`,
    ],
  },
  bowl_thunfisch: {
    name: 'Thunfisch-Reis-Bowl', slot: 'haupt', device: 'reiskocher', time: 5, proteins: ['fisch'],
    ingredients: [
      { item: 'reis', amount: 100, side: [50, 250] },
      { item: 'tk_gemuese_mix', amount: 300 },
      { item: 'thunfisch', amount: 1 },
      { item: 'sojasauce', amount: 1 },
      { item: 'oel', amount: 2 },
    ],
    steps: [
      REIS,
      'TK-Gemüse gefroren obendrauf, Thunfisch darauf verteilen. Nicht umrühren.',
      'Sojasauce und Öl darüberträufeln, Reiskocher starten, danach einmal durchmischen.',
    ],
    tip: 'Dosen mit „Skipjack“ oder „Echter Bonito“ enthalten am wenigsten Quecksilber.',
  },
  teriyaki_haehnchen: {
    name: 'Teriyaki-Hähnchen', slot: 'haupt', device: 'reiskocher', time: 10, proteins: ['haehnchen'],
    ingredients: [
      { item: 'reis', amount: 90, side: [50, 250] },
      { item: 'tk_brokkoli', amount: 250 },
      { item: 'haehnchenbrust', amount: 200, note: 'in Streifen' },
      { item: 'sojasauce', amount: 2 },
      { item: 'honig', amount: 1 },
      { item: 'oel', amount: 1 },
    ],
    steps: [
      'Hähnchen mit Sojasauce, Honig und Öl verrühren und kurz ziehen lassen.',
      REIS,
      'Brokkoli und Hähnchen samt Soße obendrauf, Reiskocher starten.',
      `Danach ${DURCH.toLowerCase()}`,
    ],
  },
  haehnchen_curry: {
    name: 'Hähnchen-Curry', slot: 'haupt', device: 'reiskocher', time: 10, proteins: ['haehnchen'],
    ingredients: [
      { item: 'reis', amount: 90, side: [50, 250] },
      { item: 'tk_gemuese_mix', amount: 250 },
      { item: 'haehnchenbrust', amount: 200, note: 'in Würfeln' },
      { item: 'kokosmilch', amount: 100 },
      { item: 'gewuerz', amount: 0, text: '1 TL Currypulver, Salz' },
    ],
    steps: [
      'Reis waschen und mit etwas weniger Wasser als sonst in den Reiskocher geben.',
      'Gemüse und Hähnchen obendrauf, Kokosmilch mit dem Curry verrühren und darübergießen.',
      `Reiskocher starten, danach umrühren. ${DURCH}`,
    ],
  },
  abend_schenkel_kartoffel: {
    name: 'Hähnchenschenkel mit Kartoffeln', slot: 'haupt', device: 'airfryer', alt: ['ofen'], time: 15, proteins: ['haehnchen'],
    ingredients: [
      { item: 'haehnchenschenkel', amount: 250 },
      { item: 'kartoffeln', amount: 350, side: [200, 900, 50] },
      { item: 'tk_brokkoli', amount: 250 },
      { item: 'oel', amount: 2 },
      { item: 'gewuerz', amount: 0, text: 'Salz, Paprika, Hähnchengewürz' },
    ],
    steps: [KARTOFFELN, 'Hähnchen mit 1 TL Öl und Gewürz einreiben und nach 5 Minuten dazulegen, es braucht etwa 20 Minuten.', GEMUESE, DURCH],
    tip: OFEN,
  },
  abend_brust_reis: {
    name: 'Hähnchenbrust mit Reis', slot: 'haupt', device: 'airfryer', alt: ['ofen'], time: 10, proteins: ['haehnchen'],
    ingredients: [
      { item: 'haehnchenbrust', amount: 250 },
      { item: 'reis', amount: 70, side: [40, 220] },
      { item: 'tk_brokkoli', amount: 250 },
      { item: 'oel', amount: 2 },
      { item: 'gewuerz', amount: 0, text: 'Salz, Paprika, Knoblauch' },
    ],
    steps: [REIS, 'Hähnchenbrust mit Öl und Gewürz einreiben, bei 200 °C etwa 18 Minuten in den Airfryer, nach der Hälfte wenden.', GEMUESE, DURCH],
  },
  abend_schenkel_reis: {
    name: 'Hähnchenschenkel mit Reis und Rosenkohl', slot: 'haupt', device: 'airfryer', alt: ['ofen'], time: 10, proteins: ['haehnchen'],
    ingredients: [
      { item: 'haehnchenschenkel', amount: 250 },
      { item: 'reis', amount: 70, side: [40, 220] },
      { item: 'tk_rosenkohl', amount: 250 },
      { item: 'oel', amount: 1 },
      { item: 'gewuerz', amount: 0, text: 'Salz, Paprika, Hähnchengewürz' },
    ],
    steps: [REIS, 'Hähnchen mit Öl und Gewürz einreiben, bei 200 °C etwa 20 Minuten in den Airfryer, einmal wenden.', GEMUESE, DURCH],
  },
  haehnchen_wrap: {
    name: 'Crispy-Hähnchen-Wraps', slot: 'haupt', device: 'airfryer', alt: ['ofen'], time: 15, proteins: ['haehnchen', 'milch'],
    ingredients: [
      { item: 'haehnchenbrust', amount: 200, note: 'in Streifen' },
      { item: 'wraps', amount: 2, side: [1, 4, 1] },
      { item: 'tk_paprika', amount: 200 },
      { item: 'skyr', amount: 100, note: 'mit Knoblauch und Salz als Soße' },
      { item: 'oel', amount: 1 },
    ],
    steps: [
      'Hähnchenstreifen mit Öl, Paprikapulver und Salz mischen, bei 200 °C 12 Minuten in den Airfryer.',
      'Paprika-Mix für die letzten 6 Minuten dazu.',
      'Wraps mit Soße bestreichen, Hähnchen und Paprika rein, einrollen.',
    ],
  },
  haehnchen_suesskartoffel: {
    name: 'Hähnchen mit Süßkartoffel-Pommes', slot: 'haupt', device: 'airfryer', alt: ['ofen'], time: 15, proteins: ['haehnchen'],
    ingredients: [
      { item: 'haehnchenschenkel', amount: 220 },
      { item: 'suesskartoffeln', amount: 350, side: [200, 900, 50] },
      { item: 'tk_bohnen', amount: 250 },
      { item: 'oel', amount: 2 },
      { item: 'gewuerz', amount: 0, text: 'Salz, Paprika' },
    ],
    steps: [
      'Süßkartoffeln in Stifte schneiden, mit 1 TL Öl und Salz bei 200 °C etwa 20 Minuten in den Airfryer.',
      'Hähnchen mit 1 TL Öl und Gewürz einreiben und nach 5 Minuten dazulegen.',
      GEMUESE,
      DURCH,
    ],
  },
  pute_paprika_reis: {
    name: 'Puten-Paprika-Reis', slot: 'haupt', device: 'reiskocher', time: 10, proteins: ['pute'],
    ingredients: [
      { item: 'reis', amount: 90, side: [50, 250] },
      { item: 'tk_paprika', amount: 250 },
      { item: 'putenbrust', amount: 200, note: 'in Würfeln' },
      { item: 'tomaten', amount: 200 },
      { item: 'oel', amount: 1 },
      { item: 'gewuerz', amount: 0, text: 'Paprikapulver, Salz' },
    ],
    steps: [
      'Reis waschen und mit etwas weniger Wasser als sonst in den Reiskocher geben.',
      'Paprika, Pute und Tomaten obendrauf, würzen, Öl drüber, Reiskocher starten.',
      'Danach umrühren. Die Pute muss innen durch sein.',
    ],
  },
  pute_gyros: {
    name: 'Puten-Gyros mit Kartoffeln', slot: 'haupt', device: 'airfryer', alt: ['ofen'], time: 15, proteins: ['pute', 'milch'],
    ingredients: [
      { item: 'putenbrust', amount: 220, note: 'in Streifen' },
      { item: 'kartoffeln', amount: 300, side: [150, 900, 50] },
      { item: 'tk_paprika', amount: 200 },
      { item: 'skyr', amount: 100, note: 'mit Knoblauch als Tzatziki' },
      { item: 'oel', amount: 2 },
      { item: 'gewuerz', amount: 0, text: 'Gyrosgewürz' },
    ],
    steps: [KARTOFFELN, 'Pute mit 1 TL Öl und Gyrosgewürz mischen und für die letzten 12 Minuten dazu.', 'Paprika für die letzten 8 Minuten dazu.', 'Mit dem Skyr-Tzatziki essen.'],
  },
  abend_huefte: {
    name: 'Hüftsteak mit Kartoffeln', slot: 'haupt', device: 'airfryer', alt: ['ofen'], time: 15, proteins: ['rind'],
    ingredients: [
      { item: 'rinderhuefte', amount: 250 },
      { item: 'kartoffeln', amount: 350, side: [200, 900, 50] },
      { item: 'tk_bohnen', amount: 250 },
      { item: 'oel', amount: 2 },
      { item: 'gewuerz', amount: 0, text: 'Salz, Pfeffer' },
    ],
    steps: [KARTOFFELN, 'Steak mit 1 TL Öl einreiben und für die letzten 8–10 Minuten dazu, einmal wenden.', GEMUESE, 'Steak 3 Minuten ruhen lassen, dann salzen und pfeffern.'],
  },
  chili_con_carne: {
    name: 'Chili con Carne', slot: 'haupt', device: 'herd', time: 15, proteins: ['rind'],
    ingredients: [
      { item: 'rinderhack', amount: 200 },
      { item: 'kidneybohnen', amount: 150 },
      { item: 'mais', amount: 80 },
      { item: 'tomaten', amount: 250 },
      { item: 'tk_paprika', amount: 150 },
      { item: 'reis', amount: 50, side: [0, 220] },
      { item: 'gewuerz', amount: 0, text: 'Chili, Kreuzkümmel, Salz' },
    ],
    steps: [
      'Reis im Reiskocher starten.',
      'Hack im Topf ohne Öl krümelig braten.',
      'Paprika, Tomaten, Bohnen und Mais dazu, würzen, 10 Minuten köcheln.',
    ],
    tip: 'Chili schmeckt am zweiten Tag noch besser.',
  },
  hack_reis_pfanne: {
    name: 'Hack-Reis-Pfanne', slot: 'haupt', device: 'herd', time: 15, proteins: ['rind'],
    ingredients: [
      { item: 'rinderhack', amount: 180 },
      { item: 'reis', amount: 80, side: [40, 220] },
      { item: 'tk_gemuese_mix', amount: 250 },
      { item: 'sojasauce', amount: 1 },
      { item: 'oel', amount: 1 },
    ],
    steps: ['Reis im Reiskocher starten.', 'Hack in der Pfanne mit dem Öl krümelig braten, Gemüse dazu, 5 Minuten weiterbraten.', 'Reis unterheben, mit Sojasauce abschmecken.'],
  },
  burger_bowl: {
    name: 'Burger-Bowl mit Wedges', slot: 'haupt', device: 'airfryer', alt: ['ofen'], time: 15, proteins: ['rind', 'milch'],
    ingredients: [
      { item: 'rinderhack', amount: 180, note: 'zu 2 Patties geformt' },
      { item: 'kartoffeln', amount: 300, side: [150, 900, 50] },
      { item: 'rohkost', amount: 200 },
      { item: 'skyr', amount: 100, note: 'mit Senf und Gewürzgurke als Burgersoße' },
      { item: 'oel', amount: 1 },
    ],
    steps: [
      'Kartoffeln in Spalten schneiden, mit dem Öl und Salz bei 200 °C etwa 22 Minuten in den Airfryer.',
      'Patties salzen und für die letzten 10 Minuten dazu, einmal wenden.',
      'Rohkost klein schneiden, alles in eine Schüssel, Soße drüber.',
    ],
  },
  abend_schweinelachs: {
    name: 'Schweinelachs mit Kartoffeln', slot: 'haupt', device: 'airfryer', alt: ['ofen'], time: 15, proteins: ['schwein'],
    ingredients: [
      { item: 'schweinelachs', amount: 250 },
      { item: 'kartoffeln', amount: 350, side: [200, 900, 50] },
      { item: 'tk_bohnen', amount: 250 },
      { item: 'oel', amount: 2 },
      { item: 'gewuerz', amount: 0, text: 'Salz, Pfeffer, Paprika' },
    ],
    steps: [KARTOFFELN, 'Schweinelachs mit 1 TL Öl und Gewürz einreiben und für die letzten 12–15 Minuten dazu, einmal wenden.', GEMUESE],
  },
  schwein_bowl: {
    name: 'Honig-Soja-Schwein mit Reis', slot: 'haupt', device: 'reiskocher', time: 10, proteins: ['schwein'],
    ingredients: [
      { item: 'reis', amount: 90, side: [50, 250] },
      { item: 'tk_gemuese_mix', amount: 250 },
      { item: 'schweinelachs', amount: 200, note: 'in dünnen Streifen' },
      { item: 'sojasauce', amount: 2 },
      { item: 'honig', amount: 1 },
    ],
    steps: ['Fleisch mit Sojasauce und Honig mischen.', REIS, 'Gemüse und Fleisch samt Soße obendrauf, Reiskocher starten, danach umrühren.'],
  },
  lachs_reis: {
    name: 'Lachs mit Reis und Brokkoli', slot: 'haupt', device: 'reiskocher', time: 5, proteins: ['fisch', 'milch'],
    ingredients: [
      { item: 'reis', amount: 90, side: [50, 250] },
      { item: 'tk_brokkoli', amount: 250 },
      { item: 'lachs', amount: 150 },
      { item: 'skyr', amount: 100, note: 'mit Dill und Zitrone als Soße' },
      { item: 'sojasauce', amount: 1 },
    ],
    steps: [REIS, 'Brokkoli und den gefrorenen Lachs obendrauf legen, Sojasauce drüber, Reiskocher starten.', 'Mit der Skyr-Soße essen.'],
  },
  kabeljau_kartoffel: {
    name: 'Knusper-Fisch mit Kartoffeln', slot: 'haupt', device: 'airfryer', alt: ['ofen'], time: 10, proteins: ['fisch', 'milch'],
    ingredients: [
      { item: 'kabeljau', amount: 250 },
      { item: 'kartoffeln', amount: 400, side: [200, 900, 50] },
      { item: 'tk_spinat', amount: 250 },
      { item: 'skyr', amount: 100, note: 'mit Kräutern als Soße' },
      { item: 'oel', amount: 2 },
    ],
    steps: [KARTOFFELN, 'Fisch mit 1 TL Öl, Salz und Paprika einreiben, gefroren für die letzten 15 Minuten dazu.', 'Spinat in der Mikrowelle oder im Topf erhitzen, salzen.'],
  },
  thunfisch_nudeln: {
    name: 'Thunfisch-Tomaten-Nudeln', slot: 'haupt', device: 'herd', time: 15, proteins: ['fisch'],
    ingredients: [
      { item: 'nudeln', amount: 100, side: [50, 250] },
      { item: 'thunfisch', amount: 1 },
      { item: 'tomaten', amount: 250 },
      { item: 'tk_spinat', amount: 150 },
      { item: 'oel', amount: 1 },
    ],
    steps: ['Nudeln kochen.', 'Tomaten, Spinat und Öl im Topf 5 Minuten köcheln, salzen.', 'Thunfisch und Nudeln unterheben.'],
  },
  garnelen_reis: {
    name: 'Knoblauch-Garnelen-Reis', slot: 'haupt', device: 'reiskocher', time: 5, proteins: ['fisch'],
    ingredients: [
      { item: 'reis', amount: 100, side: [50, 250] },
      { item: 'tk_gemuese_mix', amount: 300 },
      { item: 'garnelen', amount: 250 },
      { item: 'sojasauce', amount: 1 },
      { item: 'oel', amount: 2 },
      { item: 'gewuerz', amount: 0, text: '2 Knoblauchzehen, gehackt' },
    ],
    steps: [REIS, 'Gemüse und gefrorene Garnelen obendrauf, Knoblauch, Sojasauce und Öl drüber.', 'Reiskocher starten, danach umrühren.'],
  },
  shakshuka: {
    name: 'Shakshuka mit Brot', slot: 'haupt', device: 'herd', time: 15, proteins: ['ei', 'milch'],
    ingredients: [
      { item: 'eier', amount: 4 },
      { item: 'tomaten', amount: 400 },
      { item: 'tk_paprika', amount: 150 },
      { item: 'huettenkaese', amount: 100 },
      { item: 'vollkornbrot', amount: 2, side: [1, 5, 1] },
      { item: 'gewuerz', amount: 0, text: 'Kreuzkümmel, Paprika, Salz' },
    ],
    steps: ['Paprika und Tomaten in der Pfanne 8 Minuten köcheln, würzen.', '4 Mulden machen, Eier hineinschlagen, Deckel drauf, 6 Minuten stocken lassen.', 'Hüttenkäse drüber, mit dem Brot essen.'],
  },
  ofenkartoffel_huettenkaese: {
    name: 'Ofenkartoffel mit Hüttenkäse', slot: 'haupt', device: 'airfryer', alt: ['ofen'], time: 10, proteins: ['milch'],
    ingredients: [
      { item: 'kartoffeln', amount: 400, side: [250, 900, 50] },
      { item: 'huettenkaese', amount: 300 },
      { item: 'tk_brokkoli', amount: 250 },
      { item: 'gewuerz', amount: 0, text: 'Salz, Pfeffer, Schnittlauch' },
    ],
    steps: ['Kartoffeln halbieren und bei 200 °C etwa 25 Minuten in den Airfryer.', GEMUESE, 'Hüttenkäse würzen und auf die heißen Kartoffeln geben.'],
  },

  // ---------- Schwäbisch, leichter gekocht ----------
  maultaschen_ei: {
    name: 'Maultaschen mit Ei und Spinat', slot: 'haupt', device: 'herd', time: 15, proteins: ['schwein', 'ei'], region: 'schwaebisch',
    ingredients: [
      { item: 'maultaschen', amount: 3, side: [2, 6, 1] },
      { item: 'eier', amount: 3 },
      { item: 'tk_spinat', amount: 250 },
      { item: 'zwiebeln', amount: 50 },
      { item: 'oel', amount: 1 },
    ],
    steps: [
      'Maultaschen in Streifen schneiden und mit der gewürfelten Zwiebel im Öl anbraten.',
      'Spinat dazugeben, bis er aufgetaut ist.',
      'Eier verquirlen, drübergießen und stocken lassen. Salzen, pfeffern.',
    ],
    tip: 'Der Klassiker „Maultaschen mit Ei“, hier mit Spinat statt viel Butter.',
  },
  linsen_spaetzle: {
    name: 'Linsen mit Spätzle und Saitenwürstle', slot: 'haupt', device: 'herd', time: 15, proteins: ['haehnchen'], region: 'schwaebisch',
    ingredients: [
      { item: 'linsen', amount: 250 },
      { item: 'tk_suppengemuese', amount: 150 },
      { item: 'spaetzle', amount: 125, side: [75, 300, 25] },
      { item: 'gefluegelwiener', amount: 100, note: 'als Saitenwürstle' },
      { item: 'bruehe', amount: 1 },
      { item: 'gewuerz', amount: 0, text: 'Essig, Senf, Pfeffer' },
    ],
    steps: [
      'Suppengemüse mit der Brühe in 100 ml Wasser 5 Minuten kochen, Linsen dazu, mit einem Schuss Essig abschmecken.',
      'Die Würstle 5 Minuten in heißem Wasser ziehen lassen, nicht kochen, sonst platzen sie.',
      'Spätzle in der Pfanne oder Mikrowelle erwärmen.',
    ],
  },
  kartoffelsalat_pute: {
    name: 'Schwäbischer Kartoffelsalat mit Putenschnitzel', slot: 'haupt', device: 'airfryer', alt: ['ofen'], time: 20, proteins: ['pute'], region: 'schwaebisch',
    ingredients: [
      { item: 'kartoffeln', amount: 350, side: [200, 900, 50] },
      { item: 'putenbrust', amount: 220, note: 'als dünne Schnitzel' },
      { item: 'rohkost', amount: 200, note: 'Gurke und Feldsalat' },
      { item: 'zwiebeln', amount: 50 },
      { item: 'bruehe', amount: 1 },
      { item: 'oel', amount: 2 },
      { item: 'gewuerz', amount: 0, text: 'Essig, Senf, Salz, Pfeffer' },
    ],
    steps: [
      'Kartoffeln im Reiskocher oder Topf garen, pellen und in dünne Scheiben schneiden.',
      'Zwiebel fein hacken, mit 100 ml heißer Brühe, Essig, Senf und Öl verrühren und über die warmen Kartoffeln gießen. 10 Minuten ziehen lassen, dann wird er schön schlonzig.',
      'Schnitzel salzen und pfeffern, bei 200 °C 8–10 Minuten in den Airfryer, einmal wenden.',
      'Gurke und Feldsalat dazu.',
    ],
  },
  gaisburger_marsch: {
    name: 'Schneller Gaisburger Marsch', slot: 'haupt', device: 'herd', time: 20, proteins: ['rind'], region: 'schwaebisch',
    ingredients: [
      { item: 'rinderhuefte', amount: 200, note: 'in dünnen Streifen' },
      { item: 'kartoffeln', amount: 250, side: [100, 700, 50] },
      { item: 'spaetzle', amount: 60 },
      { item: 'tk_suppengemuese', amount: 250 },
      { item: 'zwiebeln', amount: 50 },
      { item: 'bruehe', amount: 2 },
    ],
    steps: [
      'Kartoffeln würfeln und mit Suppengemüse und Brühe in 600 ml Wasser 12 Minuten kochen.',
      'Fleischstreifen und Spätzle dazu und 3 Minuten ziehen lassen.',
      'Zwiebel in Ringen ohne Fett in der Pfanne bräunen und obendrauf geben.',
    ],
    tip: 'Das Original köchelt stundenlang mit Suppenfleisch. Mit dünnen Hüftstreifen geht es in 20 Minuten.',
  },
  zwiebelrostbraten: {
    name: 'Zwiebelrostbraten mit Spätzle', slot: 'haupt', device: 'herd', time: 20, proteins: ['rind'], region: 'schwaebisch',
    ingredients: [
      { item: 'rinderhuefte', amount: 200 },
      { item: 'spaetzle', amount: 150, side: [75, 300, 25] },
      { item: 'zwiebeln', amount: 150 },
      { item: 'tk_bohnen', amount: 250 },
      { item: 'oel', amount: 2 },
      { item: 'gewuerz', amount: 0, text: 'Senf, Salz, Pfeffer' },
    ],
    steps: [
      'Zwiebeln in Ringen mit 1 TL Öl langsam goldbraun braten und herausnehmen.',
      'Steak dünn mit Senf bestreichen und im restlichen Öl 2–3 Minuten pro Seite braten.',
      'Spätzle und Bohnen in der Pfanne erwärmen, die Zwiebeln aufs Fleisch.',
    ],
  },
  kaesespaetzle_light: {
    name: 'Käsespätzle, leichter', slot: 'haupt', device: 'herd', time: 15, proteins: ['milch'], region: 'schwaebisch',
    ingredients: [
      { item: 'spaetzle', amount: 200, side: [100, 350, 25] },
      { item: 'kaese_light', amount: 60, note: 'gerieben' },
      { item: 'skyr', amount: 100 },
      { item: 'zwiebeln', amount: 100 },
      { item: 'rohkost', amount: 200, note: 'grüner Salat dazu' },
      { item: 'oel', amount: 1 },
    ],
    steps: [
      'Zwiebeln in Ringen mit dem Öl goldbraun braten.',
      'Spätzle in der Pfanne erwärmen, Skyr und Käse unterrühren, bis alles schmilzt. Salzen, pfeffern.',
      'Zwiebeln obendrauf, Salat dazu.',
    ],
    tip: 'Skyr statt Sahne und leichter Käse sparen gut die Hälfte der Kalorien.',
  },
  schupfnudeln_sauerkraut: {
    name: 'Schupfnudeln mit Sauerkraut und Kasseler', slot: 'haupt', device: 'herd', time: 15, proteins: ['schwein'], region: 'schwaebisch',
    ingredients: [
      { item: 'schupfnudeln', amount: 200, side: [100, 400, 25] },
      { item: 'sauerkraut', amount: 250 },
      { item: 'kasseler', amount: 200, note: 'in Würfeln' },
      { item: 'zwiebeln', amount: 50 },
      { item: 'oel', amount: 1 },
    ],
    steps: [
      'Kasseler und Zwiebel im Öl anbraten.',
      'Schupfnudeln dazu und goldbraun braten.',
      'Sauerkraut unterheben und 5 Minuten mitbraten.',
    ],
  },
  frei: {
    name: 'Freier Abend', slot: 'haupt', device: 'frei', time: 0, proteins: [],
    fixed: { kcal: 1000, protein: 30, fat: 45, carbs: 100, fiber: 5, veg: 0 },
    ingredients: [],
    steps: ['Burger oder Pizza, ganz ohne schlechtes Gewissen.', 'Dafür gibt es heute keinen Snack.'],
    tip: 'Die Nährwerte sind eine grobe Schätzung.',
  },

  // ---------- Snacks ----------
  snack_nuesse: {
    name: 'Nüsse und Banane', slot: 'snack', device: 'ohne', time: 1, proteins: [],
    ingredients: [{ item: 'nuesse', amount: 30 }, { item: 'banane', amount: 1 }],
    steps: ['Die Nüsse abwiegen statt aus der Tüte zu essen. 30 g sind schnell überschritten.'],
  },
  snack_shake: {
    name: 'Eiweiß-Shake', slot: 'snack', device: 'ohne', time: 1, proteins: ['milch'],
    ingredients: [{ item: 'whey', amount: 30 }, { item: 'milch', amount: 300 }],
    steps: ['Whey mit der Milch im Shaker schütteln.'],
  },
  skyr_beeren: {
    name: 'Skyr mit Beeren', slot: 'snack', device: 'ohne', time: 2, proteins: ['milch'],
    ingredients: [{ item: 'skyr', amount: 250 }, { item: 'tk_beeren', amount: 100 }],
    steps: ['Beeren am Vorabend in den Kühlschrank legen oder kurz in der Mikrowelle antauen.'],
  },
  protein_pudding: {
    name: 'Protein-Pudding', slot: 'snack', device: 'ohne', time: 0, proteins: ['milch'],
    ingredients: [{ item: 'proteinpudding', amount: 1 }],
    steps: ['Deckel auf, Löffel rein.'],
  },
  reiswaffeln_erdnuss: {
    name: 'Reiswaffeln mit Erdnussbutter', slot: 'snack', device: 'ohne', time: 2, proteins: [],
    ingredients: [{ item: 'reiswaffeln', amount: 3 }, { item: 'erdnussbutter', amount: 1 }],
    steps: ['Erdnussbutter dünn auf die Reiswaffeln streichen.'],
  },
  huettenkaese_rohkost: {
    name: 'Hüttenkäse mit Rohkost', slot: 'snack', device: 'ohne', time: 3, proteins: ['milch'],
    ingredients: [{ item: 'huettenkaese', amount: 200 }, { item: 'rohkost', amount: 200 }],
    steps: ['Rohkost in Sticks schneiden und in den Hüttenkäse dippen.'],
  },
  quark_apfel: {
    name: 'Zimt-Quark mit Apfel', slot: 'snack', device: 'ohne', time: 3, proteins: ['milch'],
    ingredients: [{ item: 'magerquark', amount: 250 }, { item: 'apfel', amount: 1 }, { item: 'gewuerz', amount: 0, text: 'Zimt' }],
    steps: ['Apfel klein schneiden, mit Zimt unter den Quark rühren.'],
  },
  eier_airfryer: {
    name: 'Eier aus dem Airfryer mit Rohkost', slot: 'snack', device: 'airfryer', time: 2, proteins: ['ei'],
    ingredients: [{ item: 'eier', amount: 2 }, { item: 'rohkost', amount: 150 }],
    steps: ['Eier bei 150 °C 15 Minuten in den Airfryer, dann kalt abschrecken.', 'Mit Salz und Rohkost essen.'],
    tip: 'Gleich 6 Eier machen, sie halten im Kühlschrank eine Woche.',
  },
};
