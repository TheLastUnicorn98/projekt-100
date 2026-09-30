"""Kleine Pixelfiguren für den Kampf: Leute und Tiere im Hintergrund, Wolken, Hieb und Essen.

    python tools/make_leben.py            # schreibt alles nach img/pixel/
    python tools/make_leben.py --zeigen   # zusätzlich eine vergrößerte Vorschau nach .claude/tmp/

Die Figuren sind von Hand als Zeichenkarten gezeichnet, ein Zeichen pro Pixel. Mehrere Bilder einer
Figur liegen nebeneinander in einer Datei, die App schaltet zwischen ihnen um (Laufbewegung).
"""
import math
import random
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "img" / "pixel"

PAL = {
    "k": (27, 19, 32),
    "s": (240, 192, 144),
    "b": (122, 74, 42),
    "B": (74, 42, 26),
    "g": (58, 122, 58),
    "G": (138, 138, 148),
    "L": (206, 210, 220),
    "r": (200, 60, 60),
    "R": (140, 36, 40),
    "y": (232, 200, 112),
    "w": (245, 240, 230),
    "W": (196, 190, 206),
    "h": (156, 98, 56),
    "H": (92, 58, 34),
    "o": (232, 122, 42),
    "d": (214, 150, 80),
    "p": (240, 128, 170),
    "c": (250, 232, 196),
    "m": (178, 92, 44),
    "M": (120, 56, 28),
    "u": (70, 90, 160),
    "D": (46, 50, 60),
    "A": (112, 118, 132),
    "V": (150, 192, 226),
    "T": (104, 108, 116),
}

# Alle Figuren schauen nach rechts. Läuft eine nach links, spiegelt die App sie.
FIGUREN = {
    "bauer": [
        [
            "..yyy..",
            ".yyyyy.",
            "..ssk..",
            "..sss..",
            "cggggs.",
            "cgggg..",
            ".gggg..",
            ".bbbb..",
            ".b..b..",
            ".B..B..",
        ],
        [
            "..yyy..",
            ".yyyyy.",
            "..ssk..",
            "..sss..",
            "cggggs.",
            "cgggg..",
            ".gggg..",
            ".bbbb..",
            "..bb...",
            "..BB...",
        ],
    ],
    "magd": [
        [
            "..ww...",
            ".wwss..",
            ".wssk..",
            "..ss...",
            ".rrrrb.",
            ".rrrrbb",
            ".rrrr..",
            "rrrrrr.",
            ".rRrr..",
            ".B..B..",
        ],
        [
            "..ww...",
            ".wwss..",
            ".wssk..",
            "..ss...",
            ".rrrrb.",
            ".rrrrbb",
            ".rrrr..",
            "rrrrrr.",
            ".rrRr..",
            "..BB...",
        ],
    ],
    "reiter": [
        [
            "......rr..........",
            ".....LGG..........",
            ".....GGk..........",
            "....RGGG.......H..",
            "...RRGGGGG....hkH.",
            "...RR.GGG....hhhhh",
            "....R.GGb...hhhhk.",
            ".......bb..Hhh....",
            ".H...hhhhhhhhh....",
            "HH..hhhhhhhhhh....",
            ".H..hhhhhhhhhh....",
            "....hhhhhhhhhh....",
            "....h.h....h.h....",
            "....H.H....H.H....",
        ],
        [
            "......rr..........",
            ".....LGG..........",
            ".....GGk..........",
            "....RGGG.......H..",
            "...RRGGGGG....hkH.",
            "...RR.GGG....hhhhh",
            "....R.GGb...hhhhk.",
            ".......bb..Hhh....",
            ".H...hhhhhhhhh....",
            "HH..hhhhhhhhhh....",
            ".H..hhhhhhhhhh....",
            "....hhhhhhhhhh....",
            ".....hh....hh.....",
            ".....HH....HH.....",
        ],
    ],
    "schaf": [
        [
            "..wwww....",
            ".wwwwwwkk.",
            "wwwwwwwkkk",
            "wwwwwwww..",
            ".WWWWWW...",
            ".k.k..k.k.",
        ],
        [
            "..wwww....",
            ".wwwwwwkk.",
            "wwwwwwwkkk",
            "wwwwwwww..",
            ".WWWWWW...",
            "..kk..kk..",
        ],
    ],
    "huhn": [
        [
            "....r..",
            "...wwr.",
            "...wkwo",
            "ww.www.",
            "wwwwww.",
            ".wwwW..",
            "..o.o..",
        ],
        [
            "....r..",
            "...wwr.",
            "...wkwo",
            "ww.www.",
            "wwwwww.",
            ".wwwW..",
            "...oo..",
        ],
    ],
    "vogel": [
        [
            "k...k",
            ".kkk.",
            ".....",
        ],
        [
            ".....",
            ".kkk.",
            "k...k",
        ],
    ],
    # Hänger: Audi-Kombi mit Anhänger, schubst alle von der Straße.
    "haenger": [
        [
            "...................DDDDDDDDDDDDDD........",
            "..bbb.bbbb........DVVVVDVVVVDVVVVD.......",
            "..bBb.bBbb........DVVVVDVVVVDVVVVVDD.....",
            "GGGGGGGGGGGGGG...DDDDDDDDDDDDDDDDDDDDDD..",
            "GTTTTTTTTTTTTG...DAAAAAAAAAAAAAAAAAAAAADD",
            "GTTTTTTTTTTTTG...rDDDDDDDDDDDDDDDDDDDDDDy",
            "GGGGGGGGGGGGGGkkkDDDkkkDDDDDDDDDDDkkkDDDD",
            ".....kkGkk.........kkGkk.........kkGkk...",
            "......kkk...........kkk...........kkk....",
        ],
        [
            "...................DDDDDDDDDDDDDD........",
            "..bbb.bbbb........DVVVVDVVVVDVVVVD.......",
            "..bBb.bBbb........DVVVVDVVVVDVVVVVDD.....",
            "GGGGGGGGGGGGGG...DDDDDDDDDDDDDDDDDDDDDD..",
            "GTTTTTTTTTTTTG...DAAAAAAAAAAAAAAAAAAAAADD",
            "GTTTTTTTTTTTTG...rDDDDDDDDDDDDDDDDDDDDDDy",
            "GGGGGGGGGGGGGGkkkDDDkkkDDDDDDDDDDDkkkDDDD",
            ".....kGkkk.........kGkkk.........kGkkk...",
            "......kkk...........kkk...........kkk....",
        ],
    ],
    # Drei Leckereien, die das Monster frisst, wenn du zunimmst.
    "essen": [
        [
            "..........",
            ".....mmm..",
            "....mmmmm.",
            "...mmmmmmm",
            "...mmmmmmm",
            "...Mmmmmmm",
            "...wMmmmm.",
            "..ww.MMM..",
            ".www......",
            ".ww.......",
        ],
        [
            ".....r....",
            "....ppp...",
            "..pppppp..",
            ".cccccccc.",
            ".rrrrrrrr.",
            ".cccccccc.",
            ".cccccccc.",
            ".dddddddd.",
            "..........",
            "..........",
        ],
        [
            "..........",
            "...pppp...",
            ".ppyppppp.",
            "pppppppyp.",
            "ppp...ppp.",
            "pp.....pp.",
            "ppp...ppp.",
            "dpppppppd.",
            ".dddddddd.",
            "..dddddd..",
        ],
    ],
}


def zeichne(frames):
    h = len(frames[0])
    w = max(len(row) for frame in frames for row in frame)
    sheet = Image.new("RGBA", (w * len(frames), h), (0, 0, 0, 0))
    px = sheet.load()
    for i, frame in enumerate(frames):
        assert len(frame) == h, f"Bild {i} hat {len(frame)} statt {h} Zeilen"
        for y, row in enumerate(frame):
            for x, ch in enumerate(row):
                if ch != ".":
                    px[i * w + x, y] = PAL[ch] + (255,)
    return sheet


def hieb(size=20):
    """Ein Schwerthieb als Sichel: weiß innen, gelb am Rand, zu den Enden hin dünner."""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    px = img.load()
    c = (size - 1) / 2
    for y in range(size):
        for x in range(size):
            r = math.hypot(x - c, y - c)
            a = math.degrees(math.atan2(y - c, x - c))
            if abs(a) > 75:
                continue
            dicke = 2.6 * (1 - abs(a) / 90) + 0.6
            if 8.6 - dicke <= r <= 8.6:
                px[x, y] = PAL["w"] + (255,)
            elif 8.6 < r <= 9.6:
                px[x, y] = (255, 210, 31, 255)
    return img


def wolke(breite, hoehe, seed, hell, schatten):
    """Weiche Pixelwolke aus überlappenden Kreisen, unten etwas dunkler."""
    rnd = random.Random(seed)
    kreise = []
    x = hoehe * 0.5
    while x < breite - hoehe * 0.5:
        r = rnd.uniform(hoehe * 0.32, hoehe * 0.5)
        kreise.append((x, hoehe - r - 0.5, r))
        x += rnd.uniform(r * 0.7, r * 1.2)
    img = Image.new("RGBA", (breite, hoehe), (0, 0, 0, 0))
    px = img.load()
    for y in range(hoehe):
        for x in range(breite):
            if any(math.hypot(x - cx, y - cy) <= r for cx, cy, r in kreise):
                px[x, y] = (schatten if y >= hoehe * 0.62 else hell) + (255,)
    return img


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    bilder = {name: zeichne(frames) for name, frames in FIGUREN.items()}
    bilder["hieb"] = hieb()
    hell, schatten = (255, 238, 222), (240, 186, 196)
    for i, (w, h) in enumerate([(34, 10), (24, 8), (44, 12)], start=1):
        bilder[f"wolke{i}"] = wolke(w, h, seed=i * 7, hell=hell, schatten=schatten)
    for name, img in bilder.items():
        img.save(OUT / f"{name}.png", optimize=True)
        print(name, img.size)
    if "--zeigen" in sys.argv:
        s = 6
        breite = sum(i.width * s + 12 for i in bilder.values())
        hoehe = max(i.height for i in bilder.values()) * s
        vorschau = Image.new("RGBA", (breite, hoehe), (120, 150, 110, 255))
        x = 0
        for img in bilder.values():
            vorschau.alpha_composite(img.resize((img.width * s, img.height * s), Image.NEAREST), (x, 0))
            x += img.width * s + 12
        ziel = ROOT / ".claude" / "tmp" / "leben_vorschau.png"
        ziel.parent.mkdir(parents=True, exist_ok=True)
        vorschau.convert("RGB").save(ziel)
        print("Vorschau:", ziel)


if __name__ == "__main__":
    main()
