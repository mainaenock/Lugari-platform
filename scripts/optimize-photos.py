"""Generate web-size crops from the supplied offline photo archive."""
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
ARCHIVE = ROOT / "Nabii_Nabwera_Development_Photos"
OUTPUT = ROOT / "public" / "media"
SELECTION = {
    "hero": ('1029165899222014', 480, 960, 1440),
    "manyonyi-water": ('1377519171053350', 480, 960),
    "manyonyi-water-tank": ('1377518927720041', 960),
    "manyonyi-water-works": ('1377519054386695', 960),
    "lukusi-electricity": ('1451899693615297', 480, 960),
    "lukusi-electricity-poles": ('1451899800281953', 960),
    "kwambu-school": ('779835140821759', 480, 960),
    "kwambu-school-front": ('779835097488430', 960),
    "mahiga-school": ('1039744404830830', 480, 960),
    "maturu-school": ('1026100009528603', 480, 960),
    "muyugi-school": ('01_Photo_781674377304502', 480, 960),
    "muyugi-school-grounds": ('05_Photo_781674517304488', 960),
    "st-cecilia-school": ('1013480337457237', 480, 960),
    "sosiani-school": ('01_Classrooms_564479555690653', 480, 960),
    "mbagara-road": ('1200848795387056', 480, 960),
    "manyonyi-road": ('1412637940874806', 480, 960),
    "majengo-road": ('1029165709222033', 480, 960),
    "football": ('02_Photo_562903485848260', 480, 960),
    "volleyball": ('04_Photo_783639920441281', 480, 960),
}

def optimize():
    photos = {path.stem: path for path in ARCHIVE.rglob("*.jpg")}
    OUTPUT.mkdir(parents=True, exist_ok=True)
    originals = set()
    for name, (entry, *widths) in SELECTION.items():
        path = photos[entry]
        originals.add(path)
        with Image.open(path) as photo:
            source = ImageOps.exif_transpose(photo).convert("RGB")
            for width in widths:
                height = round(source.height * width / source.width)
                destination = OUTPUT / f"{name}-{width}.webp"
                source.resize((width, height), Image.Resampling.LANCZOS).save(
                    destination, "WEBP", quality=74, method=6
                )
    baseline = sum(path.stat().st_size for path in originals)
    compressed = sum(path.stat().st_size for path in OUTPUT.glob("*.webp"))
    print(f"{len(originals)} originals: {baseline:,} bytes; all web variants: {compressed:,} bytes")

if __name__ == "__main__":
    optimize()
