"""Erzeugt die Food-Fotos für Projekt 100 mit ComfyUI (Z-Image-Turbo, Apache 2.0) und speichert sie als WebP.

    python tools/make_images.py              # alle fehlenden Bilder
    python tools/make_images.py porridge     # nur diese Gerichte, auch wenn es sie schon gibt

ComfyUI muss unter http://127.0.0.1:8188 laufen. Graph wie qwen-test/zimage_test.py (8 Schritte, cfg 1).
Die Bilder landen nicht im ComfyUI-Ausgabeordner, sondern nur als Vorschau (temp) und dann in img/.
"""
import io
import json
import sys
import time
import urllib.parse
import urllib.request
import zlib
from pathlib import Path

from PIL import Image

API = "http://127.0.0.1:8188"
OUT = Path(__file__).resolve().parent.parent / "img"
UNET, CLIP, VAE = ("z_image_turbo_int8_convrot.safetensors", "qwen_3_4b_fp8_mixed.safetensors", "ae.safetensors")
STYLE = (
    "food photography, three-quarter view from above, served on dark ceramic tableware on a rustic wooden table, "
    "soft natural window light, appetizing, realistic, high detail, shallow depth of field, "
    "no text, no logos, no people, no hands"
)

DISHES = {
    "porridge": "a bowl of creamy oatmeal porridge topped with blueberries and raspberries",
    "quark_bowl": "a bowl of thick white quark topped with oat flakes and fresh banana slices",
    "shake_fruehstueck": "a tall glass of creamy vanilla protein milkshake next to a whole banana",
    "overnight_oats": "a glass jar of overnight oats layered with white skyr yogurt and mixed berries",
    "ruehrei_brot": "scrambled eggs with wilted spinach on a plate with two slices of whole grain bread",
    "eiermuffins": "six crustless fluffy egg bites made only of baked whisked egg, visible diced red and yellow bell pepper and ham inside, sitting in colorful silicone muffin cups, one slice of whole grain bread beside, no pastry, no crust, no tart shell",
    "huettenkaese_brot": "two open sandwiches of whole grain bread with cottage cheese and turkey slices, cucumber and carrot sticks on the side",
    "skyr_apfel": "a bowl of skyr yogurt topped with diced apple, oat flakes and chopped walnuts",
    "bowl_haehnchen": "a rice bowl with diced chicken breast and steamed broccoli, carrots and peas, glossy soy sauce",
    "bowl_thunfisch": "a rice bowl with flaked tuna and steamed broccoli, carrots and peas, drizzled with soy sauce",
    "teriyaki_haehnchen": "teriyaki chicken strips in glossy sauce over white rice with broccoli florets, sesame seeds",
    "haehnchen_curry": "creamy coconut chicken curry with vegetables served with white rice",
    "abend_schenkel_kartoffel": "crispy golden roasted chicken thighs with roasted potato cubes and broccoli",
    "abend_brust_reis": "sliced grilled chicken breast with paprika seasoning, white rice and broccoli",
    "abend_schenkel_reis": "roasted chicken thigh fillets with white rice and roasted brussels sprouts",
    "haehnchen_wrap": "two tortilla wraps filled with crispy chicken strips, bell peppers and garlic yogurt sauce, cut in half",
    "haehnchen_suesskartoffel": "sliced boneless chicken thigh fillet strips, golden crispy meat without any bone, next to orange sweet potato fries and green beans, no bones, no drumsticks, no chicken legs",
    "pute_paprika_reis": "one-pot turkey and rice with red bell peppers in tomato sauce, paprika seasoning",
    "pute_gyros": "turkey gyros strips with roasted potatoes, bell peppers and a small bowl of tzatziki",
    "abend_huefte": "sliced medium beef steak with roasted potato cubes and green beans",
    "chili_con_carne": "a bowl of chili con carne with kidney beans, corn and ground beef, white rice on the side",
    "hack_reis_pfanne": "a pan of stir-fried ground beef with rice and mixed vegetables",
    "burger_bowl": "a burger bowl with grilled beef patties, potato wedges, lettuce, tomatoes, cucumber and burger sauce",
    "abend_schweinelachs": "grilled pork loin steaks with roasted potato cubes and green beans",
    "schwein_bowl": "honey soy glazed pork strips with white rice and stir-fried vegetables",
    "lachs_reis": "a salmon fillet with white rice, broccoli and a creamy dill yogurt sauce",
    "kabeljau_kartoffel": "a crispy golden white fish fillet with roasted potatoes, spinach and an herb yogurt dip",
    "thunfisch_nudeln": "penne pasta with tomato sauce, tuna and spinach",
    "garnelen_reis": "garlic shrimp with white rice and mixed vegetables",
    "shakshuka": "shakshuka with four poached eggs in tomato and pepper sauce in a cast iron pan, cottage cheese on top, whole grain bread slices on the side",
    "ofenkartoffel_huettenkaese": "halved baked potatoes topped with cottage cheese and chives, broccoli on the side",
    "snack_nuesse": "a small bowl of mixed unsalted nuts next to a banana",
    "snack_shake": "a tall glass of chocolate protein shake",
    "skyr_beeren": "a bowl of skyr yogurt topped with mixed berries",
    "protein_pudding": "a small cup of chocolate pudding with a spoon",
    "reiswaffeln_erdnuss": "three rice cakes spread with peanut butter",
    "huettenkaese_rohkost": "a bowl of cottage cheese with cucumber, carrot and bell pepper sticks for dipping",
    "quark_apfel": "a bowl of creamy quark with diced apple and a sprinkle of cinnamon",
    "eier_airfryer": "two halved hard-boiled eggs with cucumber and carrot sticks",
    "laugenbrezel_huettenkaese": "a German lye pretzel (Laugenbrezel) sliced open and filled with cottage cheese and chives, radishes and cucumber slices on the side",
    "maultaschen_ei": "Swabian Maultaschen: large flat rectangular German pasta pockets filled with meat and spinach, cut into wide strips, pan-fried with scrambled egg and spinach in a pan, no round dumplings, no gyoza",
    "linsen_spaetzle": "a plate of brown lentil stew with carrots, next to irregular short squiggly homemade Swabian egg noodles (Spaetzle, thick uneven little dumpling strands, not macaroni, not pasta tubes), and two Wiener sausages",
    "kartoffelsalat_pute": "Swabian potato salad with thinly sliced potatoes in a glossy vinegar broth dressing with chives, a golden thin turkey schnitzel, cucumber and lamb's lettuce",
    "gaisburger_marsch": "Gaisburger Marsch, a hearty German beef stew with potato cubes, Spaetzle egg noodles, carrots and celery in clear broth, topped with golden fried onions, in a deep bowl",
    "zwiebelrostbraten": "Zwiebelrostbraten: a pan-seared sirloin steak topped with a heap of thin golden fried onion strips (not breaded rings), with irregular short squiggly homemade Swabian egg noodles (Spaetzle, thick uneven little dumpling strands, not macaroni, not pasta tubes) and green beans, brown gravy",
    "kaesespaetzle_light": "Kaesespaetzle in a cast iron pan: irregular short squiggly homemade Swabian egg noodles (Spaetzle, thick uneven little dumpling strands, not macaroni, not pasta tubes) mixed with melted cheese, topped with crispy fried onion strips, a small green salad beside",
    "schupfnudeln_sauerkraut": "Schupfnudeln, German potato finger noodles pan-fried golden with sauerkraut and diced smoked pork loin in a pan",
}


def call(path, data=None):
    body = json.dumps(data).encode() if data is not None else None
    req = urllib.request.Request(API + path, data=body, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()


def graph(prompt, seed, width=1024, height=1024):
    return {
        "1": {"class_type": "UNETLoader", "inputs": {"unet_name": UNET, "weight_dtype": "default"}},
        "2": {"class_type": "CLIPLoader", "inputs": {"clip_name": CLIP, "type": "lumina2", "device": "default"}},
        "3": {"class_type": "VAELoader", "inputs": {"vae_name": VAE}},
        "4": {"class_type": "CLIPTextEncode", "inputs": {"clip": ["2", 0], "text": prompt}},
        "5": {"class_type": "ConditioningZeroOut", "inputs": {"conditioning": ["4", 0]}},
        "6": {"class_type": "EmptySD3LatentImage", "inputs": {"width": width, "height": height, "batch_size": 1}},
        "7": {"class_type": "ModelSamplingAuraFlow", "inputs": {"model": ["1", 0], "shift": 3.0}},
        "8": {"class_type": "KSampler",
              "inputs": {"model": ["7", 0], "positive": ["4", 0], "negative": ["5", 0], "latent_image": ["6", 0],
                         "seed": seed, "steps": 8, "cfg": 1.0, "sampler_name": "res_multistep",
                         "scheduler": "simple", "denoise": 1.0}},
        "9": {"class_type": "VAEDecode", "inputs": {"samples": ["8", 0], "vae": ["3", 0]}},
        "10": {"class_type": "PreviewImage", "inputs": {"images": ["9", 0]}},
    }


def generate(prompt, seed, width=1024, height=1024):
    """Ein Bild erzeugen und als PIL-Bild zurückgeben."""
    pid = json.loads(call("/prompt", {"prompt": graph(prompt, seed, width, height)}))["prompt_id"]
    t0 = time.time()
    while True:
        time.sleep(1)
        hist = json.loads(call("/history/" + pid))
        if pid in hist:
            break
        if time.time() - t0 > 600:
            raise RuntimeError("nach 10 Minuten kein Bild")
    run = hist[pid]
    if run.get("status", {}).get("status_str") != "success":
        raise RuntimeError(json.dumps(run.get("status"), ensure_ascii=False)[:500])
    img = next(i for node in run["outputs"].values() for i in node.get("images", []))
    qs = urllib.parse.urlencode({"filename": img["filename"], "subfolder": img["subfolder"], "type": img["type"]})
    return Image.open(io.BytesIO(call("/view?" + qs))).convert("RGB")


def render(name, prompt):
    t0 = time.time()
    raw = generate(f"{prompt}, {STYLE}", zlib.crc32(name.encode()) % 2**31)
    w, h = raw.size
    crop_w = int(h * 3 / 4)
    left = (w - crop_w) // 2
    raw.crop((left, 0, left + crop_w, h)).resize((600, 800), Image.LANCZOS).save(OUT / f"{name}.webp", "WEBP", quality=78, method=6)
    return time.time() - t0


def main():
    OUT.mkdir(exist_ok=True)
    only = sys.argv[1:]
    todo = [k for k in DISHES if k in only] if only else [k for k in DISHES if not (OUT / f"{k}.webp").exists()]
    print(f"{len(todo)} Bilder zu erzeugen", flush=True)
    failed = []
    for i, name in enumerate(todo, 1):
        try:
            print(f"{i}/{len(todo)} {name} {render(name, DISHES[name]):.0f} s", flush=True)
        except Exception as e:  # ein kaputtes Bild soll den Rest nicht aufhalten
            failed.append(name)
            print(f"{i}/{len(todo)} {name} FEHLER {e}", flush=True)
    call("/free", {"unload_models": True, "free_memory": True})
    print("FERTIG" + (f", fehlgeschlagen: {', '.join(failed)}" if failed else ""), flush=True)


if __name__ == "__main__":
    main()
