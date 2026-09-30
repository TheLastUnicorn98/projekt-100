// 8-Bit-Töne mit der Web-Audio-API, ohne Tondateien. Rechteck- und Rauschklänge wie auf alten Konsolen.

let audio = null;

function ctx() {
  if (!audio) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audio = new AC();
  }
  if (audio.state === 'suspended') audio.resume().catch(() => {});
  return audio;
}

function tone(freq, start, duration, { type = 'square', volume = 0.08, slideTo } = {}) {
  const a = ctx();
  if (!a) return;
  const t = a.currentTime + start;
  const osc = a.createOscillator();
  const gain = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + duration);
  gain.gain.setValueAtTime(volume, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(gain).connect(a.destination);
  osc.start(t);
  osc.stop(t + duration + 0.02);
}

function noise(start, duration, volume = 0.12) {
  const a = ctx();
  if (!a) return;
  const t = a.currentTime + start;
  const buffer = a.createBuffer(1, Math.ceil(a.sampleRate * duration), a.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const src = a.createBufferSource();
  const filter = a.createBiquadFilter();
  const gain = a.createGain();
  src.buffer = buffer;
  filter.type = 'highpass';
  filter.frequency.value = 1800;
  gain.gain.value = volume;
  src.connect(filter).connect(gain).connect(a.destination);
  src.start(t);
}

const SOUNDS = {
  slash: () => noise(0, 0.14),
  hit: () => {
    tone(220, 0, 0.14, { slideTo: 70 });
    noise(0, 0.08, 0.08);
  },
  crit: () => {
    tone(330, 0, 0.1, { slideTo: 90 });
    tone(165, 0.05, 0.18, { slideTo: 55, volume: 0.07 });
    noise(0, 0.12, 0.1);
  },
  heal: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.07, 0.12, { type: 'triangle', volume: 0.07 })),
  laugh: () => [196, 185, 175, 165].forEach((f, i) => tone(f, i * 0.11, 0.09, { volume: 0.06 })),
  victory: () =>
    [
      [523, 0, 0.12],
      [659, 0.12, 0.12],
      [784, 0.24, 0.12],
      [1047, 0.36, 0.34],
      [784, 0.72, 0.1],
      [1047, 0.84, 0.5],
    ].forEach(([f, s, d]) => tone(f, s, d, { volume: 0.07 })),
  blip: () => tone(880, 0, 0.05, { volume: 0.04 }),
};

export function play(name, enabled = true) {
  if (!enabled || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  try {
    SOUNDS[name]?.();
  } catch {
    // Ton ist Beiwerk. Klappt er nicht, läuft der Kampf trotzdem.
  }
}
