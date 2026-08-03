import json
import os
import io
import time
import urllib.request
from PIL import Image, ImageDraw, ImageEnhance

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))

STATES_JSON_PATH = os.path.join(PROJECT_ROOT, "public/data/states.json")
GEOJSON_PATH = os.path.join(PROJECT_ROOT, "public/data/geo/india-states.geojson")
OUTPUT_DIR = os.path.join(PROJECT_ROOT, "public/images/states/satellite")

os.makedirs(OUTPUT_DIR, exist_ok=True)

SLUG_TO_GEO_NAME = {
    "andaman-and-nicobar-islands": "Andaman and Nicobar",
    "andhra-pradesh": "Andhra Pradesh",
    "arunachal-pradesh": "Arunachal Pradesh",
    "assam": "Assam",
    "bihar": "Bihar",
    "chandigarh": "Chandigarh",
    "chhattisgarh": "Chhattisgarh",
    "dadra-and-nagar-haveli-and-daman-and-diu": "Dadra and Nagar Haveli",
    "delhi": "Delhi",
    "goa": "Goa",
    "gujarat": "Gujarat",
    "haryana": "Haryana",
    "himachal-pradesh": "Himachal Pradesh",
    "jammu-and-kashmir": "Jammu and Kashmir",
    "jharkhand": "Jharkhand",
    "karnataka": "Karnataka",
    "kerala": "Kerala",
    "ladakh": "Jammu and Kashmir",
    "lakshadweep": "Lakshadweep",
    "madhya-pradesh": "Madhya Pradesh",
    "maharashtra": "Maharashtra",
    "manipur": "Manipur",
    "meghalaya": "Meghalaya",
    "mizoram": "Mizoram",
    "nagaland": "Nagaland",
    "odisha": "Orissa",
    "puducherry": "Puducherry",
    "punjab": "Punjab",
    "rajasthan": "Rajasthan",
    "sikkim": "Sikkim",
    "tamil-nadu": "Tamil Nadu",
    "telangana": "Andhra Pradesh",
    "tripura": "Tripura",
    "uttar-pradesh": "Uttar Pradesh",
    "uttarakhand": "Uttaranchal",
    "west-bengal": "West Bengal"
}

with open(STATES_JSON_PATH, "r", encoding="utf-8") as f:
    states_list = json.load(f)

with open(GEOJSON_PATH, "r", encoding="utf-8") as f:
    geo_data = json.load(f)

geo_features = {}
for feat in geo_data["features"]:
    name = feat["properties"].get("NAME_1") or feat["properties"].get("name")
    if name:
        geo_features[name] = feat

def get_coords(geometry):
    if geometry["type"] == "Polygon":
        return [pt for ring in geometry["coordinates"] for pt in ring]
    elif geometry["type"] == "MultiPolygon":
        return [pt for poly in geometry["coordinates"] for ring in poly for pt in ring]
    return []

width, height = 1200, 800

for state in states_list:
    slug = state["slug"]
    state_name = state["name"]
    target_file = os.path.join(OUTPUT_DIR, f"{slug}.png")

    geo_name = SLUG_TO_GEO_NAME.get(slug)
    feat = geo_features.get(geo_name) if geo_name else None

    if not feat:
        print(f"Skipping {slug} ({state_name}) - GeoJSON feature not found")
        continue

    geom = feat["geometry"]
    all_pts = get_coords(geom)
    if not all_pts:
        continue

    lngs = [p[0] for p in all_pts]
    lats = [p[1] for p in all_pts]

    min_lng, max_lng = min(lngs), max(lngs)
    min_lat, max_lat = min(lats), max(lats)

    # 8% padding around bounding box
    lng_pad = (max_lng - min_lng) * 0.08
    lat_pad = (max_lat - min_lat) * 0.08

    if lng_pad == 0: lng_pad = 0.1
    if lat_pad == 0: lat_pad = 0.1

    min_lng -= lng_pad
    max_lng += lng_pad
    min_lat -= lat_pad
    max_lat += lat_pad

    url = (
        f"https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/export?"
        f"bbox={min_lng},{min_lat},{max_lng},{max_lat}&bboxSR=4326&imageSR=4326&size={width},{height}&f=image"
    )

    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            img_data = resp.read()

        sat_img = Image.open(io.BytesIO(img_data)).convert("RGBA")

        # Increase exposure / brightness & contrast for vibrant satellite topology
        brightness_enhancer = ImageEnhance.Brightness(sat_img)
        sat_img = brightness_enhancer.enhance(1.35)
        contrast_enhancer = ImageEnhance.Contrast(sat_img)
        sat_img = contrast_enhancer.enhance(1.1)

        # Light gray background (bg-zinc-100: #f4f4f5)
        out_img = Image.new("RGBA", (width, height), (244, 244, 245, 255))

        # Anti-aliased polygon mask
        mask = Image.new("L", (width, height), 0)
        draw = ImageDraw.Draw(mask)

        def project(pt):
            x = int((pt[0] - min_lng) / (max_lng - min_lng) * width)
            y = int((max_lat - pt[1]) / (max_lat - min_lat) * height)
            return (x, y)

        if geom["type"] == "Polygon":
            for ring in geom["coordinates"]:
                poly = [project(pt) for pt in ring]
                draw.polygon(poly, fill=255)
        elif geom["type"] == "MultiPolygon":
            for poly in geom["coordinates"]:
                for ring in poly:
                    p = [project(pt) for pt in ring]
                    draw.polygon(p, fill=255)

        out_img.paste(sat_img, (0, 0), mask)
        out_img.save(target_file, format="PNG")
        print(f"✓ Generated bright light-gray satellite map for {state_name} ({slug})")
    except Exception as err:
        print(f"✕ Failed to generate satellite map for {state_name}: {err}")

    time.sleep(0.05)

print("\nAll state satellite images regenerated with light gray background & enhanced exposure!")
