// Kleine Effekte ohne Bibliothek: Konfetti, Feuerwerk, Hochzählen, Plopp, Vibration.
// Alles läuft offline und schaltet sich bei „Bewegung reduzieren“ ab.

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const COLORS = ['#f2a747', '#ee7d98', '#5cbf86', '#8ccfb2', '#ffd21f', '#3d9bff'];
const SPRING = 'cubic-bezier(.34,1.56,.64,1)';
const EASE_OUT = 'cubic-bezier(.22,1,.36,1)';

export function haptic(pattern = 12) {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    // Kein Vibrationsmotor oder nicht erlaubt: dann eben ohne.
  }
}

export function pop(el, scale = 1.22, duration = 420) {
  if (!el || reduced()) return;
  el.animate([{ transform: 'scale(1)' }, { transform: `scale(${scale})` }, { transform: 'scale(1)' }], { duration, easing: SPRING });
}

export function flash(el, className, duration = 700) {
  if (!el || reduced()) return;
  el.classList.add(className);
  setTimeout(() => el.classList.remove(className), duration);
}

// Zahl von `from` auf `to` hochzählen. `format` bekommt den Zwischenwert.
export function countUp(el, from, to, format, duration = 750) {
  if (!el) return;
  if (reduced() || from === to) {
    el.textContent = format(to);
    return;
  }
  const t0 = performance.now();
  const step = (now) => {
    const p = Math.min(1, (now - t0) / duration);
    el.textContent = format(from + (to - from) * (1 - (1 - p) ** 3));
    if (p < 1) requestAnimationFrame(step);
  };
  el.textContent = format(from);
  requestAnimationFrame(step);
}

// SVG-Ring (stroke-dashoffset) von einem Füllstand zum nächsten gleiten lassen.
export function tweenRing(circle, fromOffset, duration = 900) {
  if (!circle || reduced()) return;
  const to = Number(circle.getAttribute('stroke-dashoffset'));
  if (!Number.isFinite(fromOffset) || Math.abs(fromOffset - to) < 0.5) return;
  circle.animate([{ strokeDashoffset: fromOffset }, { strokeDashoffset: to }], { duration, easing: EASE_OUT });
}

export function tweenWidth(el, fromPct, duration = 600) {
  if (!el || reduced()) return;
  const to = el.style.width;
  el.animate([{ width: `${fromPct}%` }, { width: to }], { duration, easing: EASE_OUT });
}

// ---------- Partikel ----------

let canvas = null;
let ctx = null;
let particles = [];
let raf = 0;

function resize() {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function ensureCanvas() {
  if (canvas?.isConnected) return;
  canvas = document.createElement('canvas');
  canvas.className = 'fx-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.append(canvas);
  ctx = canvas.getContext('2d');
  resize();
  window.addEventListener('resize', resize);
}

function loop() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  particles = particles.filter((p) => p.life > 0);
  for (const p of particles) {
    p.update();
    p.draw(ctx);
  }
  ctx.globalAlpha = 1;
  raf = particles.length ? requestAnimationFrame(loop) : 0;
}

function start() {
  if (!raf) raf = requestAnimationFrame(loop);
}

function piece(x, y, vx, vy, color) {
  const size = 6 + Math.random() * 5;
  const spin = (Math.random() - 0.5) * 0.35;
  let rot = Math.random() * Math.PI;
  return {
    life: 120 + Math.random() * 50,
    update() {
      vx *= 0.985;
      vy = vy * 0.985 + 0.26;
      x += vx;
      y += vy;
      rot += spin;
      this.life -= 1;
    },
    draw(c) {
      c.save();
      c.translate(x, y);
      c.rotate(rot);
      c.globalAlpha = Math.min(1, this.life / 30);
      c.fillStyle = color;
      c.fillRect(-size / 2, -size / 4, size, (size / 2) * (0.35 + Math.abs(Math.sin(rot * 2))));
      c.restore();
    },
  };
}

// Konfetti-Schuss nach oben, zum Beispiel aus einem Knopf heraus.
export function confetti({ x = innerWidth / 2, y = innerHeight * 0.6, count = 90, spread = 55, power = 12, colors = COLORS } = {}) {
  if (reduced()) return;
  ensureCanvas();
  for (let i = 0; i < count; i++) {
    const angle = ((-90 + (Math.random() - 0.5) * spread * 2) * Math.PI) / 180;
    const v = power * (0.5 + Math.random() * 0.65);
    particles.push(piece(x, y, Math.cos(angle) * v, Math.sin(angle) * v, colors[i % colors.length]));
  }
  start();
}

export function confettiFrom(el, options = {}) {
  const r = el?.getBoundingClientRect();
  confetti(r ? { x: r.left + r.width / 2, y: r.top + r.height / 2, ...options } : options);
}

function spark(x, y, vx, vy, color) {
  return {
    life: 50 + Math.random() * 30,
    update() {
      vx *= 0.965;
      vy = vy * 0.965 + 0.05;
      x += vx;
      y += vy;
      this.life -= 1;
    },
    draw(c) {
      c.globalAlpha = Math.min(1, this.life / 35);
      c.fillStyle = color;
      c.beginPath();
      c.arc(x, y, 2.1, 0, Math.PI * 2);
      c.fill();
    },
  };
}

function explode(x, y) {
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  const n = 70;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const v = 2 + Math.random() * 3.4;
    particles.push(spark(x, y, Math.cos(a) * v, Math.sin(a) * v, Math.random() < 0.25 ? '#fff6dc' : color));
  }
}

function rocket(tx, ty) {
  const x = tx + (Math.random() - 0.5) * 30;
  let y = innerHeight + 8;
  const frames = 36;
  const vy = (ty - y) / frames;
  particles.push({
    life: frames,
    update() {
      y += vy;
      this.life -= 1;
      if (this.life <= 0) explode(x, y);
    },
    draw(c) {
      c.globalAlpha = 1;
      c.fillStyle = '#fff1c9';
      c.beginPath();
      c.arc(x, y, 2.4, 0, Math.PI * 2);
      c.fill();
    },
  });
  start();
}

// Kleines Feuerwerk: ein paar Raketen, leicht versetzt.
export function fireworks(bursts = 3) {
  if (reduced()) return;
  ensureCanvas();
  for (let b = 0; b < bursts; b++) {
    setTimeout(() => rocket(innerWidth * (0.18 + Math.random() * 0.64), innerHeight * (0.16 + Math.random() * 0.22)), b * 260);
  }
}
