// Wischen wie bei Tinder: ziehen, Stempel einblenden, loslassen. Rechts = will ich, links = nicht, hoch = unbedingt.
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const THRESHOLD_X = 110;
const THRESHOLD_UP = 130;

export function attachSwipe(card, { onVote, onTap }) {
  let start = null;
  let dx = 0;
  let dy = 0;

  const show = () => {
    card.style.transform = `translate(${dx}px, ${dy}px) rotate(${dx / 16}deg)`;
    card.style.setProperty('--like', clamp01(dx / THRESHOLD_X));
    card.style.setProperty('--nope', clamp01(-dx / THRESHOLD_X));
    card.style.setProperty('--super', Math.abs(dx) < 70 ? clamp01(-dy / THRESHOLD_UP) : 0);
  };

  const reset = () => {
    dx = 0;
    dy = 0;
    card.style.transform = '';
    for (const p of ['--like', '--nope', '--super']) card.style.setProperty(p, 0);
  };

  // Karte hinauswerfen, dann erst die Stimme zählen, damit man die Bewegung sieht.
  card.fly = (vote) => {
    card.classList.add('is-leaving');
    const x = vote === 2 ? dx : vote * window.innerWidth * 1.3;
    const y = vote === 2 ? -window.innerHeight : dy + 40;
    card.style.transform = `translate(${x}px, ${y}px) rotate(${vote === 2 ? 0 : vote * 28}deg)`;
    card.style.setProperty(vote === 1 ? '--like' : vote === -1 ? '--nope' : '--super', 1);
    setTimeout(() => onVote(vote), 230);
  };

  card.addEventListener('pointerdown', (e) => {
    start = { x: e.clientX, y: e.clientY };
    dx = 0;
    dy = 0;
    try {
      card.setPointerCapture(e.pointerId);
    } catch {
      // Manche Browser erlauben das nicht für jeden Zeiger, das Ziehen klappt trotzdem.
    }
    card.classList.add('is-dragging');
  });

  card.addEventListener('pointermove', (e) => {
    if (!start) return;
    dx = e.clientX - start.x;
    dy = e.clientY - start.y;
    show();
  });

  const end = () => {
    if (!start) return;
    start = null;
    card.classList.remove('is-dragging');
    if (Math.abs(dx) < 6 && Math.abs(dy) < 6) {
      reset();
      onTap();
    } else if (dx > THRESHOLD_X) card.fly(1);
    else if (dx < -THRESHOLD_X) card.fly(-1);
    else if (dy < -THRESHOLD_UP && Math.abs(dx) < 90) card.fly(2);
    else reset();
  };
  card.addEventListener('pointerup', end);
  card.addEventListener('pointercancel', end);
}
