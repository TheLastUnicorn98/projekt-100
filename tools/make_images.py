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
    "pesto_eier": "three sunny-side-up fried eggs with crispy browned green basil pesto edges on a thick slice of toasted sourdough bread spread with cottage cheese, a drizzle of honey and red chili flakes, on a plate",
    "tortilla_faltwrap": "a golden toasted triangle-folded tortilla wrap cut in half, showing stacked layers of scrambled egg, turkey ham, melted cheese and tomato slices, on a plate",
    "huettenkaese_pancakes": "a stack of small fluffy golden oat pancakes topped with warm mixed berries and their purple juice, on a plate",
    "skyr_bagel_lachs": "two golden homemade sesame bagels sliced open and topped with cream cheese, smoked salmon, cucumber slices and fresh dill, on a plate",
    "baked_oats": "a small round ceramic baking dish of golden baked oats with a domed cake-like top and purple berries baked into it, a spoonful scooped out showing the soft fluffy inside",
    "joghurt_toast": "two slices of toasted sourdough bread with a baked, softly set golden yogurt custard filling in the center, topped with juicy baked mixed berries and a drizzle of honey, on a plate",
    "feta_spiegeleier": "three sunny-side-up fried eggs set in a ring of melted golden crispy crumbled feta cheese, sprinkled with chili flakes and oregano, on a slice of whole grain bread, cherry tomatoes beside, on a plate",
    "wolkeneier": "three fluffy white baked egg clouds with golden browned peaks and a glossy runny orange yolk nestled in the center of each, speckled with grated parmesan and chives, one slice of whole grain bread beside, on a plate",
    "dampfei": "Korean steamed egg puffed up above the rim of a small black earthenware pot, fluffy pale yellow egg custard topped with sliced green onions and a few drops of sesame oil, a slice of whole grain bread beside",
    "crispy_eggs": "four halved hard-boiled eggs lying yolk side up on large irregular lacy golden fried parmesan cheese crisps that spread out around each egg like a crunchy frame, sprinkled with chives and paprika, served in a frying pan, a slice of whole grain bread beside",
    "frambled_eggs": "a slice of toasted sourdough bread spread with cottage cheese and topped with rustic frambled eggs, fried egg whites with crispy lacy brown edges folded with softly scrambled runny yolk, sprinkled with chives and chili flakes, on a plate",
    "hot_honey_bowl": "a bowl with golden roasted orange sweet potato cubes, browned seasoned ground beef and a scoop of cottage cheese side by side, drizzled with glossy honey flecked with red chili flakes, sliced green onions on top",
    "tuerkische_nudeln": "a shallow plate of short pasta on a bed of thick white garlic yogurt, topped with crispy browned ground beef and drizzled with bright red paprika chili oil, chopped fresh parsley",
    "bigmac_tacos": "two folded flour tortilla tacos with a thin crispy seared beef patty pressed onto the tortilla, melted cheese, shredded romaine lettuce, finely diced onion, pickle slices and pink burger sauce, on a wooden board",
    "lasagne_suppe": "a deep bowl of rich red tomato soup with ground beef and ruffled lasagna noodle pieces, topped with a dollop of creamy white cheese, grated parmesan and a fresh basil leaf",
    "marry_me_chicken": "seared golden chicken breast pieces in a creamy orange sun-dried tomato sauce with wilted spinach in a skillet, sprinkled with parmesan and chili flakes, a mound of white rice on the side",
    "alfredo_huettenkaese": "a bowl of fettuccine in a creamy white alfredo sauce with sliced golden chicken breast and bright green broccoli florets, grated parmesan and cracked black pepper on top",
    "tomaten_reis_haehnchen": "a bowl of reddish tomato-tinted rice mixed with diced chicken, green peas, corn and carrot cubes, soft mashed tomato pieces through it, sprinkled with sliced green onions",
    "caesar_pizza": "a round golden baked chicken crust pizza on parchment paper, topped with chopped romaine lettuce tossed in creamy caesar dressing, shaved parmesan and toasted bread croutons, cut into slices",
    "feta_pasta": "a small baking dish of penne pasta tossed with blistered burst cherry tomatoes, creamy melted white feta and golden roasted chicken pieces, fresh basil leaves on top",
    "bohnensalat_haehnchen": "a glass meal prep container filled with a finely diced dense bean salad of red kidney beans, yellow corn, cucumber, tomato, red onion, small chicken pieces and crumbled white feta, fresh herbs and a lime wedge",
    "haehnchen_fajita_quesadilla": "golden crispy chicken quesadilla triangles filled with melted cheese, seared chicken strips, red and green bell peppers and onions, a small bowl of creamy orange chipotle honey dip on the side",
    "philly_cheesesteak_paprika": "four roasted red and yellow bell pepper halves stuffed with thinly sliced seared beef, caramelized onions and mushrooms, topped with bubbling melted cheese, white rice on the side",
    "oyakodon": "Japanese oyakodon: a deep bowl of white rice topped with tender chicken pieces in softly set silky egg with sliced onions in a light savory broth, garnished with sliced green scallions, a small dish of cucumber slices beside",
    "bieber_haehnchenbaellchen": "golden chicken meatballs simmered in rich red tomato sauce in a skillet, topped with creamy dollops of cottage cheese, grated parmesan and fresh basil leaves, a portion of penne pasta beside",
    "swamp_soup": "a deep bowl of vivid green chicken and rice soup, shredded chicken and rice in a bright green herb and spinach broth, topped with sliced scallions and a lemon wedge",
    "tomaten_ruehrei_reis": "Chinese tomato and egg stir-fry: fluffy yellow scrambled egg curds and juicy red tomato wedges in a glossy light sauce, sprinkled with sliced green scallions, served next to a bowl of white rice",
    "steakwuerfel_knoblauch": "seared golden-brown beef steak bites glistening with garlic butter and chopped parsley, halved roasted baby potatoes and broccoli florets on a plate",
    "chopped_italian_sandwich": "two crusty white bread rolls stuffed with a finely chopped mix of turkey, ham, cheese, iceberg lettuce, tomato, red onion and pepperoncini in a creamy herb dressing, a wooden cutting board with more chopped filling beside",
    "reiskocher_bratreis": "rice cooker fried rice with diced chicken, scrambled egg pieces, peas, carrots and corn, glossy with soy sauce, sprinkled with sliced scallions, served in a bowl",
    "pfeffer_haehnchen": "boneless chicken thigh fillets with a crust of coarsely cracked black peppercorns covered in a creamy peppercorn sauce, roasted potato wedges and broccoli florets on a plate, no bones",
    "zitronen_haehnchen_reis": "one-pot Greek lemon chicken and rice: golden seared boneless chicken thigh fillets resting on fluffy white rice flecked with oregano and lemon zest in a wide pan, lemon wedges, a small cucumber and tomato salad beside",
    "backpapier_doener": "homemade doner kebab: a toasted Turkish flatbread pocket stuffed with thin sliced spiced beef doner strips, lettuce, tomato, cucumber, red cabbage and onion, drizzled with white garlic yogurt sauce, a few loose meat strips beside on the plate",
    "rind_brokkoli": "beef and broccoli stir-fry: thin tender beef strips and bright green broccoli florets coated in a glossy dark brown garlic ginger sauce, served beside white rice in a bowl, sprinkled with sesame seeds",
    "dirty_spaghetti": "dirty spaghetti in a deep skillet: spaghetti tossed in a thick rusty brown-red cajun spiced sauce with browned crumbled ground beef, sliced smoked sausage coins and diced red and green bell pepper, sprinkled with chopped parsley",
    "puten_feta_baellchen": "golden brown turkey meatballs speckled with green spinach and white feta crumbles, served on white rice with a cucumber and tomato salad and a small bowl of tzatziki with dill",
    "gochujang_bowl": "a deep bowl of white rice in a light golden broth, topped with glossy red gochujang honey ground beef, broccoli florets, sliced spring onions and sesame seeds",
    "blech_kafta": "sheet pan kafta: a flat baked slab of spiced ground beef with green parsley flecks scored into diamond pieces next to golden potato wedges and blistered halved tomatoes on a baking tray, a small bowl of white garlic yogurt sauce and cucumber slices beside",
    "lachs_bowl_mariko": "salmon rice bowl: flaked pink salmon mashed into white rice in a bowl, drizzled with soy sauce and swirls of creamy orange sriracha mayo, sesame seeds, sliced cucumber and avocado on the side, squares of roasted nori seaweed",
    "fruehlingsrollen_bowl": "egg roll in a bowl: stir-fried ground turkey with thinly shredded green cabbage in a savory soy ginger sauce, topped with sliced spring onions and sesame seeds, a scoop of white rice on the side, in a dark bowl",
    "gurkensalat_lachs": "a clear round container filled with paper-thin cucumber slices in a glossy soy sesame dressing, topped with folded smoked salmon ribbons, small dollops of cream cheese, fresh dill and sesame seeds",
    "huettenkaese_pizza": "a small round ceramic baking dish with bubbling golden melted cheese over cottage cheese and tomato sauce, topped with crispy curled salami slices and dried oregano",
    "huettenkaese_eis": "a small bowl with two scoops of pale pink creamy strawberry ice cream flecked with strawberry pieces, fresh halved strawberries on top, a spoon beside",
    "skyr_lotus_cheesecake": "a small glass jar of thick white skyr set like cheesecake, soft caramelized biscuits visible standing inside through the glass, crumbled caramel biscuit on top, a spoon beside",
    "skyr_schoko_cluster": "bite-sized clusters of white yogurt and diced red strawberries coated in glossy dark chocolate on parchment paper, one cluster broken open showing pink and white inside",
    "huettenkaese_keksteig": "a small bowl of thick creamy beige cookie dough with chopped dark chocolate chunks folded in, a spoon scooping a dollop, a few chocolate pieces beside the bowl",
    "mayak_eier": "halved soft-boiled eggs with jammy orange yolks and soy-browned whites in a small bowl of dark soy marinade with sliced green onions, red chili rings and sesame seeds",
    "thunfischsalat_mcconaughey": "a bowl of chunky tuna salad with diced green apple, red onion, chopped pickles and corn kernels, topped with sliced green jalapenos, a lemon wedge on the side",
    "egg_flight": "six hard-boiled egg halves lined up in a row on a wooden board, each pair with a different topping: cottage cheese with chives, smoked salmon with dill, soy sauce with sesame and chili flakes",
    "thunfischbrot": "a small flat rectangular savory protein loaf baked from blended tuna and egg, looking like a dense golden-brown baked frittata slab, cut into four thick slices showing a pale beige fine crumb with green chive flecks, on a wooden board with a small bowl of cottage cheese, not bakery bread",
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
