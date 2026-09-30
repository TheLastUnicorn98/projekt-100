// Leise Hintergrundmusik im Kampf: eine kleine mittelalterliche Weise (A-Dorisch) als 8-Bit-Schleife.
// Melodie auf Pulswelle, Bass auf Dreieck, dazu leise Trommeln. Geplant wird immer ein Stück voraus,
// damit die Töne trotz Timer-Schwankungen genau im Takt kommen.
import { audioContext } from './sfx.js';

const BPM = 126;
const EIGHTH = 60 / BPM / 2;
const VOLUME = 0.35;

// Takte mit „|“ getrennt, Ton:Dauer in Achteln, „-“ ist eine Pause. Teil A und B, je 8 Takte.
const MELODY = [
  'E5:2 A4:1 B4:1 C5:2 D5:2 | E5:3 D5:1 C5:2 B4:2 | A4:2 C5:1 B4:1 A4:2 G4:2 | A4:6 -:2',
  'E5:2 A4:1 B4:1 C5:2 D5:2 | E5:2 G5:2 F#5:2 E5:2 | D5:2 C5:1 B4:1 C5:2 B4:2 | A4:6 -:2',
  'C5:2 E5:2 G5:3 E5:1 | F5:2 E5:2 D5:4 | B4:2 D5:2 G5:3 F5:1 | E5:6 -:2',
  'A5:2 G5:1 F5:1 E5:2 D5:2 | C5:2 D5:1 E5:1 D5:2 B4:2 | C5:2 B4:1 A4:1 G#4:2 B4:2 | A4:6 -:2',
].join(' | ');
const BASS = [
  'A2:2 E3:2 A2:2 E3:2 | G2:2 D3:2 G2:2 D3:2 | F2:2 C3:2 G2:2 D3:2 | A2:2 E3:2 A2:2 E3:2',
  'A2:2 E3:2 A2:2 E3:2 | C3:2 G3:2 D3:2 A3:2 | G2:2 D3:2 E2:2 B2:2 | A2:2 E3:2 A2:4',
  'C3:2 G3:2 C3:2 G3:2 | F2:2 C3:2 G2:2 D3:2 | G2:2 D3:2 G2:2 D3:2 | C3:2 G3:2 C3:2 E3:2',
  'F2:2 C3:2 F2:2 C3:2 | A2:2 E3:2 G2:2 D3:2 | F2:2 C3:2 E2:2 B2:2 | A2:2 E3:2 A2:4',
].join(' | ');
const STEPS = { C: -9, D: -7, E: -5, F: -4, G: -2, A: 0, B: 2 };

function freq(name) {
  const [, letter, sharp, octave] = /^([A-G])(#?)(\d)$/.exec(name);
  return 440 * 2 ** ((STEPS[letter] + (sharp ? 1 : 0) + (Number(octave) - 4) * 12) / 12);
}

function parse(text, voice) {
  const events = [];
  let at = 0;
  for (const token of text.replaceAll('|', ' ').split(/\s+/).filter(Boolean)) {
    const [note, len] = token.split(':');
    if (note !== '-') events.push({ at, len: Number(len), voice, f: freq(note) });
    at += Number(len);
  }
  return { events, length: at };
}

const melody = parse(MELODY, 'melody');
const bass = parse(BASS, 'bass');
const LENGTH = melody.length;
const drums = [];
for (let i = 0; i < LENGTH; i++) {
  if (i % 4 === 0) drums.push({ at: i, voice: 'kick' });
  else if (i % 2 === 1) drums.push({ at: i, voice: 'hat' });
}
const EVENTS = [...melody.events, ...bass.events, ...drums].sort((a, b) => a.at - b.at);

let master = null;
let timer = 0;
let loopStart = 0;
let cursor = 0;
let wanted = false;
let enabled = true;
const waves = new WeakMap();
const noises = new WeakMap();

// Pulswelle mit 25 % Tastverhältnis klingt nach alter Konsole.
function pulse(a) {
  if (!waves.has(a)) {
    const n = 32;
    const real = new Float32Array(n);
    const imag = new Float32Array(n);
    for (let k = 1; k < n; k++) real[k] = (2 / (k * Math.PI)) * Math.sin(k * Math.PI * 0.25);
    waves.set(a, a.createPeriodicWave(real, imag));
  }
  return waves.get(a);
}

function noiseBuffer(a) {
  if (!noises.has(a)) {
    const buffer = a.createBuffer(1, a.sampleRate * 0.2, a.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    noises.set(a, buffer);
  }
  return noises.get(a);
}

function voice(a, ev, t) {
  const gain = a.createGain();
  gain.connect(master);
  if (ev.voice === 'hat') {
    const src = a.createBufferSource();
    const filter = a.createBiquadFilter();
    src.buffer = noiseBuffer(a);
    filter.type = 'highpass';
    filter.frequency.value = 6500;
    gain.gain.setValueAtTime(0.03, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    src.connect(filter).connect(gain);
    src.start(t);
    src.stop(t + 0.06);
    return;
  }
  const osc = a.createOscillator();
  if (ev.voice === 'kick') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.12);
    gain.gain.setValueAtTime(0.16, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
    osc.connect(gain);
    osc.start(t);
    osc.stop(t + 0.15);
    return;
  }
  const d = ev.len * EIGHTH;
  const vol = ev.voice === 'melody' ? 0.07 : 0.12;
  if (ev.voice === 'melody') osc.setPeriodicWave(pulse(a));
  else osc.type = 'triangle';
  osc.frequency.value = ev.f;
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.linearRampToValueAtTime(vol, t + 0.012);
  gain.gain.exponentialRampToValueAtTime(vol * 0.55, t + 0.1);
  gain.gain.setValueAtTime(vol * 0.55, t + d * 0.8);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + d * 0.97);
  osc.connect(gain);
  osc.start(t);
  osc.stop(t + d);
}

function schedule() {
  const a = audioContext();
  if (!a || !master) return;
  const horizon = a.currentTime + 0.3;
  for (;;) {
    const ev = EVENTS[cursor];
    const t = loopStart + ev.at * EIGHTH;
    if (t > horizon) break;
    if (t >= a.currentTime - 0.02) voice(a, ev, t);
    cursor += 1;
    if (cursor === EVENTS.length) {
      cursor = 0;
      loopStart += LENGTH * EIGHTH;
    }
  }
}

function level() {
  const a = audioContext();
  if (a && master) master.gain.setTargetAtTime(enabled && wanted && !document.hidden ? VOLUME : 0, a.currentTime, 0.15);
}

function begin() {
  const a = audioContext();
  if (!a || timer) return;
  if (!master) {
    master = a.createGain();
    master.gain.value = 0;
    master.connect(a.destination);
  }
  loopStart = a.currentTime + 0.15;
  cursor = 0;
  timer = setInterval(schedule, 100);
  schedule();
  level();
}

function halt() {
  clearInterval(timer);
  timer = 0;
  level();
}

export function startMusic(on) {
  wanted = true;
  enabled = on;
  if (on && !document.hidden) begin();
  level();
}

export function stopMusic() {
  wanted = false;
  halt();
}

export function setMusicEnabled(on) {
  enabled = on;
  if (on && wanted && !document.hidden) begin();
  if (!on) halt();
  level();
}

// Im Hintergrund (App gewechselt, Bildschirm aus) schweigt die Musik.
document.addEventListener('visibilitychange', () => {
  if (document.hidden) halt();
  else if (wanted && enabled) begin();
});
