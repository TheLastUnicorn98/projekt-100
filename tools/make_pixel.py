"""Pixelgrafiken für den Kampf: Held, drei Gegner und die Burg-Landschaft.

    python tools/make_pixel.py            # alle fehlenden
    python tools/make_pixel.py drache     # nur diese, auch wenn es sie schon gibt
    python tools/make_pixel.py --waffen   # nur Waffen aus den fertigen Figuren herauslösen

ComfyUI malt ein großes Bild, danach wird es echte Pixelgrafik: klein rechnen, Hintergrund von
den Rändern her entfernen, auf wenige Farben reduzieren. In der App wird es scharf hochskaliert.
Die kleinen Figuren im Hintergrund zeichnet tools/make_leben.py von Hand.
"""
import sys
import zlib
from collections import deque
from pathlib import Path

from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent))
from make_images import call, generate  # noqa: E402

OUT = Path(__file__).resolve().parent.parent / "img" / "pixel"
SPRITE = (
    "8-bit pixel art video game sprite, retro 16-color palette, crisp large pixels, full body, centered, "
    "plain flat solid light gray background, no shadow, no text, no border"
)
ASSETS = {
    "held": ("a small brave knight with shiny silver armor, red plume on the helmet, blue tunic, round shield and raised sword, side view facing right", 64),
    "drache": ("a chubby green dragon monster with small bat wings, big belly, sharp teeth and horns, side view facing left", 96),
    "oger": ("a huge fat green ogre with a big wooden club and a brown loincloth, angry face, side view facing left", 96),
    "ritter-schwarz": ("an evil black knight in dark spiked armor with glowing red eyes and a huge sword, side view facing left", 96),
}
LANDSCAPE = (
    "8-bit pixel art video game background, tall vertical scene, medieval stone castle with round towers and red flags "
    "on a hill in the distance, sunset sky with orange, pink and purple bands, rolling green hills, a dirt road crossing "
    "the scene horizontally in the middle distance, wide flat open grass meadow in the foreground for a battle, "
    "retro 32-color palette, crisp large pixels, no characters, no people, no animals, no text"
)
LANDSCAPE_SEED = 11
# Das Modell malt trotz Verbot kleine Leute auf die Wiese. Diese Stellen (bei Seed 11) werden übermalt.
LANDSCAPE_PATCHES = [(48, 164, 55, 174), (94, 170, 100, 181), (70, 172, 76, 181), (33, 177, 38, 180)]

# Graue Reste vom Bildhintergrund, die das Freistellen übrig lässt, nach Augenschein festgelegt.
# "keep" bleibt unangetastet (Gesicht und Zehen des Ogers, Schwert des Ritters),
# an der Klinge wird nur der weiße Saum entfernt ("rim").
CLEANUP = {
    "oger": {"keep": [(34, 10, 52, 26), (0, 86, 89, 94)]},
    "ritter-schwarz": {"keep": [(0, 48, 22, 93)], "rim": (0, 46, 24, 93)},
}


def remove_background(img, tolerance=38):
    """Alle Pixel, die von den Rändern aus erreichbar und randfarben sind, werden durchsichtig."""
    img = img.convert("RGBA")
    w, h = img.size
    px = img.load()
    border = [px[x, y] for x in range(w) for y in (0, h - 1)] + [px[x, y] for y in range(h) for x in (0, w - 1)]
    ref = tuple(sorted(c[i] for c in border)[len(border) // 2] for i in range(3))
    close = lambda c: sum((c[i] - ref[i]) ** 2 for i in range(3)) <= tolerance**2  # noqa: E731
    seen = set()
    queue = deque((x, y) for x in range(w) for y in (0, h - 1)) + deque((x, y) for y in range(h) for x in (0, w - 1))
    while queue:
        x, y = queue.popleft()
        if (x, y) in seen or not (0 <= x < w and 0 <= y < h):
            continue
        seen.add((x, y))
        if not close(px[x, y]):
            continue
        px[x, y] = (0, 0, 0, 0)
        queue.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))
    return img


def to_sprite(raw, height):
    small = raw.resize((128, 128), Image.BOX)
    cut = remove_background(small)
    cut = cut.crop(cut.getbbox())
    scale = height / cut.height
    cut = cut.resize((max(1, round(cut.width * scale)), height), Image.BOX)
    alpha = cut.getchannel("A").point(lambda a: 255 if a > 110 else 0)
    rgb = cut.convert("RGB").quantize(colors=16, method=Image.Quantize.MEDIANCUT).convert("RGB")
    out = rgb.convert("RGBA")
    out.putalpha(alpha)
    return out


def light_grey(c, light=140, sat=60):
    return sum(c[:3]) / 3 >= light and max(c[:3]) - min(c[:3]) <= sat


def clean(img, keep=(), rim=None, passes=2, min_hole=6):
    """Entfernt hellgraue Reste: den Saum am Umriss und eingeschlossene Flächen zwischen Armen und Beinen."""
    img = img.convert("RGBA")
    w, h = img.size
    px = img.load()
    kept = lambda x, y: any(x0 <= x < x1 and y0 <= y < y1 for x0, y0, x1, y1 in keep)  # noqa: E731
    solid = lambda x, y: 0 <= x < w and 0 <= y < h and px[x, y][3] > 0  # noqa: E731
    edge = lambda x, y: not all(solid(x + dx, y + dy) for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)))  # noqa: E731
    for _ in range(passes):
        seam = [(x, y) for y in range(h) for x in range(w) if solid(x, y) and not kept(x, y) and light_grey(px[x, y]) and edge(x, y)]
        for p in seam:
            px[p] = (0, 0, 0, 0)
    grey = lambda x, y: solid(x, y) and not kept(x, y) and light_grey(px[x, y], sat=25)  # noqa: E731
    seen = set()
    for y in range(h):
        for x in range(w):
            if (x, y) in seen or not grey(x, y):
                continue
            blob, stack = [], [(x, y)]
            seen.add((x, y))
            while stack:
                cx, cy = stack.pop()
                blob.append((cx, cy))
                for n in ((cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1)):
                    if n not in seen and grey(*n):
                        seen.add(n)
                        stack.append(n)
            if len(blob) >= min_hole:
                for p in blob:
                    px[p] = (0, 0, 0, 0)
    if rim:
        x0, y0, x1, y1 = rim
        seam = [(x, y) for y in range(y0, y1) for x in range(x0, x1) if solid(x, y) and sum(px[x, y][:3]) / 3 >= 170 and edge(x, y)]
        for p in seam:
            px[p] = (0, 0, 0, 0)
    return img


def patch(img, boxes, grow=2, shift=14):
    """Übermalt Stellen mit dem Gras derselben Zeile ein Stück daneben."""
    img = img.copy()
    px = img.load()
    w, h = img.size
    boxes = [(x0 - grow, y0 - grow, x1 + grow, y1 + grow) for x0, y0, x1, y1 in boxes]
    covered = lambda x, y: any(a <= x <= c and b <= y <= d for a, b, c, d in boxes)  # noqa: E731
    for x0, y0, x1, y1 in boxes:
        for y in range(max(0, y0), min(h, y1 + 1)):
            for x in range(max(0, x0), min(w, x1 + 1)):
                for dx in (shift, -shift, 2 * shift, -2 * shift):
                    if 0 <= x + dx < w and not covered(x + dx, y):
                        px[x, y] = px[x + dx, y]
                        break
    return img



# ---------- Waffen als eigene Teile ----------
# Damit in der App nur der Arm mit dem Schwert oder die Keule schwingt, werden diese Pixel aus der
# Figur herausgelöst: <name>-koerper.png ohne Waffe, <name>-waffe.png nur die Waffe (gleiches Raster,
# links ggf. etwas Rand). Die Bereiche sind nach Augenschein am Pixelraster festgelegt.
SKIN = lambda c: c[1] > c[0] + 40 and c[1] > 120  # noqa: E731  Ogerhaut


def _hero_arm(x, y, c):
    return x <= 9 and 37 <= y <= 54 and c[:3] not in {(23, 61, 112), (14, 109, 220)}


def _oger_club(x, y, c):
    if SKIN(c):
        return False
    return (x <= 22 and y <= 35) or (13 <= x <= 17 and y == 36) or (14 <= x <= 21 and 53 <= y <= 68)


def _knight_sword(x, y, c):
    light = sum(c[:3]) / 3
    if x <= 17 and y >= 50:
        return light >= 40
    return 18 <= x <= 27 and 43 <= y <= 52 and light >= 130


WEAPONS = {
    "held": {"take": _hero_arm, "margin": 6},
    "oger": {"take": _oger_club},
    "ritter-schwarz": {"take": _knight_sword, "fill": (20, 20, 23)},
}


def split_weapon(name):
    rule = WEAPONS[name]
    src = Image.open(OUT / f"{name}.png").convert("RGBA")
    w, h = src.size
    m = rule.get("margin", 0)
    body = src.copy()
    weapon = Image.new("RGBA", (w + m, h), (0, 0, 0, 0))
    sp, bp, wp = src.load(), body.load(), weapon.load()
    for y in range(h):
        for x in range(w):
            c = sp[x, y]
            if c[3] and rule["take"](x, y, c):
                wp[x + m, y] = c
                inside = 0 < x < w - 1 and all(sp[x + dx, y + dy][3] and not rule["take"](x + dx, y + dy, sp[x + dx, y + dy]) for dx, dy in ((1, 0), (-1, 0), (0, -1), (0, 1)))
                bp[x, y] = rule["fill"] + (255,) if "fill" in rule and inside else (0, 0, 0, 0)
    if name == "held":
        # Die Klinge ist im Original nur ein Stummel. Sie wird nach links unten verlängert.
        for i in range(1, 7):
            x, y = m - i, 54 + round(i * 3 / 7)
            wp[x, y] = (242, 244, 243, 255)
            if i <= 4:
                wp[x, y - 1] = (210, 215, 212, 255)
    if name == "oger":
        # Der Stiel hinter der Faust ist im Original verdeckt. Er wird durchgehend nachgezeichnet.
        for y in range(36, 53):
            left = round(12 + 3 * (y - 35) / 18)
            for i, c in enumerate([(15, 13, 10), (75, 57, 39), (133, 86, 59), (133, 86, 59), (75, 57, 39), (0, 0, 0)]):
                if not wp[left + i, y][3]:
                    wp[left + i, y] = c + (255,)
    body.save(OUT / f"{name}-koerper.png", optimize=True)
    weapon.crop((0, 0, w + m, h)).save(OUT / f"{name}-waffe.png", optimize=True)
    return body, weapon


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    if "--waffen" in sys.argv:
        for name in WEAPONS:
            split_weapon(name)
        return
    only = sys.argv[1:]
    names = list(ASSETS) + ["burg-hoch"]
    todo = [n for n in names if n in only] if only else [n for n in names if not (OUT / f"{n}.png").exists()]
    for name in todo:
        seed = zlib.crc32(name.encode()) % 2**31
        if name == "burg-hoch":
            raw = generate(LANDSCAPE, LANDSCAPE_SEED, 768, 960)
            img = raw.resize((192, 240), Image.BOX).quantize(colors=32, method=Image.Quantize.MEDIANCUT).convert("RGB")
            img = patch(img, LANDSCAPE_PATCHES)
        else:
            desc, height = ASSETS[name]
            img = to_sprite(generate(f"{desc}, {SPRITE}", seed), height)
            if name in CLEANUP:
                img = clean(img, **CLEANUP[name])
        img.save(OUT / f"{name}.png", optimize=True)
        print(name, img.size, flush=True)
    call("/free", {"unload_models": True, "free_memory": True})
    for name in WEAPONS:
        split_weapon(name)
    print("FERTIG", flush=True)


if __name__ == "__main__":
    main()
