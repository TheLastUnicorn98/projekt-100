"""Pixelgrafiken für den Kampf: Held, drei Gegner und die Burg-Landschaft.

    python tools/make_pixel.py            # alle fehlenden
    python tools/make_pixel.py drache     # nur diese, auch wenn es sie schon gibt

ComfyUI malt ein großes Bild, danach wird es echte Pixelgrafik: klein rechnen, Hintergrund von
den Rändern her entfernen, auf wenige Farben reduzieren. In der App wird es scharf hochskaliert.
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
    "8-bit pixel art video game background, medieval stone castle on a green hill at sunset, orange and purple sky, "
    "rolling hills, dirt path in the foreground, retro 32-color palette, crisp large pixels, wide scene, "
    "no characters, no text"
)


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


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    only = sys.argv[1:]
    names = list(ASSETS) + ["burg"]
    todo = [n for n in names if n in only] if only else [n for n in names if not (OUT / f"{n}.png").exists()]
    for name in todo:
        seed = zlib.crc32(name.encode()) % 2**31
        if name == "burg":
            raw = generate(LANDSCAPE, seed, 1344, 768)
            img = raw.resize((320, 183), Image.BOX).quantize(colors=32, method=Image.Quantize.MEDIANCUT).convert("RGB")
        else:
            desc, height = ASSETS[name]
            img = to_sprite(generate(f"{desc}, {SPRITE}", seed), height)
        img.save(OUT / f"{name}.png", optimize=True)
        print(name, img.size, flush=True)
    call("/free", {"unload_models": True, "free_memory": True})
    print("FERTIG", flush=True)


if __name__ == "__main__":
    main()
