from copy import deepcopy
from urllib.parse import quote


def _avatar(shop_name, color):
    initials = "".join(part[:1] for part in shop_name.replace("-", " ").split()[:2]).upper() or shop_name[:2].upper()
    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">'
        f'<rect width="160" height="160" rx="34" fill="{color}"/>'
        f'<circle cx="118" cy="38" r="36" fill="rgba(255,255,255,0.22)"/>'
        f'<text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" '
        f'font-family="Arial, sans-serif" font-size="42" font-weight="700" fill="white">{initials}</text>'
        f'</svg>'
    )
    return f"data:image/svg+xml;charset=UTF-8,{quote(svg)}"


def _slugify_title(title):
    return "".join(character.lower() if character.isalnum() else "-" for character in title).strip("-").replace("--", "-")


def _product_image(title, color):
    safe_title = title[:34]
    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="420" height="320" viewBox="0 0 420 320">'
        f'<rect width="420" height="320" rx="28" fill="#fff8f1"/>'
        f'<rect x="34" y="34" width="352" height="252" rx="24" fill="{color}"/>'
        f'<circle cx="330" cy="82" r="54" fill="rgba(255,255,255,0.22)"/>'
        f'<rect x="70" y="190" width="210" height="22" rx="11" fill="rgba(255,255,255,0.78)"/>'
        f'<rect x="70" y="226" width="150" height="18" rx="9" fill="rgba(255,255,255,0.58)"/>'
        f'<text x="70" y="138" font-family="Arial, sans-serif" font-size="26" font-weight="700" fill="white">{safe_title}</text>'
        f'</svg>'
    )
    return f"data:image/svg+xml;charset=UTF-8,{quote(svg)}"


def _best_sellers(shop_slug, base_listing_id, titles, base_price, sales_start, color="#f58220", first_url=None):
    products = []

    for index, title in enumerate(titles[:4]):
        listing_id = str(base_listing_id + index)
        url = first_url if index == 0 and first_url else (
            f"https://www.etsy.com/shop/{shop_slug}"
            f"?search_query={quote(title)}"
        )
        products.append(
            {
                "listingId": listing_id,
                "title": title,
                "listingUrl": url,
                "listingUrlVerified": bool(index == 0 and first_url),
                "shopSearchUrlVerified": not bool(index == 0 and first_url),
                "imageUrl": _product_image(title, color),
                "price": round(base_price * (1 + index * 0.16), 2),
                "sales": max(1, int(sales_start / (index + 1))),
                "favorites": max(1, int(sales_start * 1.8 / (index + 2))),
                "shopSlug": shop_slug,
            }
        )

    return products


SHOP_FIXTURES = [
    {
        "listingId": "4484891246",
        "listingTitle": "Later Gator PNG After While Crocodile",
        "listingUrl": "https://www.etsy.com/listing/4484891246/later-gator-png-after-while-crocodile?ref=shop_home_active_8&crt=1&dd=1&logging_key=0e1ea5458b11c9de27706967b951fb089a1e94ed%3A4484891246",
        "listingUrlVerified": True,
        "shopName": "Craftcornerclub",
        "shopUrl": "https://www.etsy.com/shop/Craftcornerclub",
        "shopUrlVerified": True,
        "shopAvatarUrl": _avatar("Craftcornerclub", "#f59e9e"),
        "createdAt": "Aug 2024",
        "country": "US",
        "category": "craft-supplies-and-tools",
        "listingCount": 1000,
        "shopFavorites": 4700,
        "shopReviews": 1700,
        "totalShopSales": 85400,
        "sales1Day": 1400,
        "sales7Day": 5800,
        "sales30Day": 16900,
        "price": 4.99,
        "views": 34100,
        "keywords": ["digital clipart", "svg", "digital bundle", "printable"],
        "tags": ["digital clipart", "svg bundle", "commercial use", "printable graphics", "craft supply", "png bundle", "cricut design", "sublimation art", "digital paper", "vintage clipart", "planner clipart", "instant download", "pod graphics"],
        "searchIntents": ["svg", "png", "digital download", "printable", "clipart", "sublimation", "cricut", "halloween", "christmas", "teacher gift", "valentine", "mother day", "father day"],
        "bestSellers": _best_sellers(
            "Craftcornerclub",
            2001101,
            ["Digital Vintage Clipart Bundle", "Commercial Use SVG Bundle", "Printable Graphics Mega Pack", "Vintage PNG Sublimation Art"],
            4.99,
            5200,
            "#f59e9e",
        ),
    },
    {
        "listingId": "1871968773",
        "listingTitle": "Peaches and Cream Zinnia Seeds Mix",
        "listingUrl": "https://www.etsy.com/listing/1871968773/peaches-and-cream-zinnia-seeds-mix?ref=shop_home_feat_5&pro=1&sts=1&logging_key=7cb4ebf940fe44bd507233a6031fa06805450f24%3A1871968773",
        "listingUrlVerified": True,
        "shopName": "SeedCult",
        "shopUrl": "https://www.etsy.com/shop/SeedCult",
        "shopUrlVerified": True,
        "shopAvatarUrl": _avatar("SeedCult", "#111827"),
        "createdAt": "Oct 2018",
        "country": "US",
        "category": "home-and-living",
        "listingCount": 749,
        "shopFavorites": 37700,
        "shopReviews": 76400,
        "totalShopSales": 871500,
        "sales1Day": 1400,
        "sales7Day": 9900,
        "sales30Day": 43800,
        "price": 8.0,
        "views": 480000,
        "keywords": ["seed", "garden", "plant printable", "botanical"],
        "tags": ["seed packet", "garden printable", "plant labels", "botanical art", "herb garden", "vegetable seeds", "spring garden", "greenhouse printable", "plant lover gift", "gardening planner", "seed storage", "garden labels", "botanical template"],
        "searchIntents": ["garden", "seed", "plant", "botanical", "flower", "herb", "spring", "earth day", "mother day gift", "plant lover gift"],
        "bestSellers": _best_sellers(
            "SeedCult",
            1078899099,
            ["Sacred Lotus Bonsai Seeds Pink Nelumbo", "Plant Seed Packet Printable", "Herb Garden Seed Storage Labels", "Botanical Plant Lover Gift Set"],
            8.0,
            9800,
            "#111827",
            first_url="https://www.etsy.com/listing/1078899099/sacred-lotus-bonsai-seeds-pink-nelumbo?ref=shop_home_feat_2&pro=1&sts=1&logging_key=87475a4d1f551b490021bc139fa74231cce4d6ac%3A1078899099",
        ),
    },
    {
        "listingId": "1551096207",
        "listingTitle": "Personalized Name Necklace By CaitlynMinimalist",
        "listingUrl": "https://www.etsy.com/listing/1551096207/personalized-name-necklace-by?ref=shop_home_feat_1&pro=1&frs=1&sts=1&logging_key=0a5ccfa3989f036eeae3d4d838633734f77707cf%3A1551096207",
        "listingUrlVerified": True,
        "shopName": "CaitlynMinimalist",
        "shopUrl": "https://www.etsy.com/shop/CaitlynMinimalist",
        "shopUrlVerified": True,
        "shopAvatarUrl": _avatar("CaitlynMinimalist", "#b08968"),
        "createdAt": "Nov 2014",
        "country": "US",
        "category": "jewelry",
        "listingCount": 2700,
        "shopFavorites": 504800,
        "shopReviews": 737100,
        "totalShopSales": 3700000,
        "sales1Day": 784,
        "sales7Day": 5200,
        "sales30Day": 21700,
        "price": 28.0,
        "views": 1250000,
        "keywords": ["minimalist jewelry", "personalized jewelry", "necklace"],
        "tags": ["personalized necklace", "minimalist jewelry", "name necklace", "gold necklace", "custom jewelry", "dainty necklace", "gift for her", "birthstone necklace", "initial necklace", "silver jewelry", "everyday necklace", "bridesmaid jewelry", "mothers day gift"],
        "searchIntents": ["jewelry", "necklace", "personalized gift", "custom gift", "gift for her", "mother day", "mom gift", "christmas gift", "birthday gift", "wedding"],
        "bestSellers": _best_sellers(
            "CaitlynMinimalist",
            2001301,
            ["Personalized Name Necklace", "Minimalist Birthstone Necklace", "Dainty Initial Necklace", "Custom Bridesmaid Jewelry Gift"],
            28.0,
            8700,
            "#b08968",
        ),
    },
    {
        "listingId": "1799829619",
        "listingTitle": "Sterling Silver Enamel Bluebell Flower",
        "listingUrl": "https://www.etsy.com/listing/1799829619/sterling-silver-enamel-bluebell-flower?ref=shop_home_feat_1&bes=1&sts=1&logging_key=8afe3a078bb41750d3eab4228265878bfa27568d%3A1799829619",
        "listingUrlVerified": True,
        "shopName": "SilverRainSilver",
        "shopUrl": "https://www.etsy.com/shop/SilverRainSilver",
        "shopUrlVerified": True,
        "shopAvatarUrl": _avatar("SilverRainSilver", "#9ca3af"),
        "createdAt": "Apr 2015",
        "country": "GB",
        "category": "jewelry",
        "listingCount": 6600,
        "shopFavorites": 137400,
        "shopReviews": 418100,
        "totalShopSales": 2100000,
        "sales1Day": 684,
        "sales7Day": 4900,
        "sales30Day": 21200,
        "price": 22.5,
        "views": 910000,
        "keywords": ["silver jewelry", "stacking ring", "minimal jewelry"],
        "tags": ["silver ring", "stacking ring", "minimalist ring", "sterling silver", "gift for her", "silver jewelry", "thumb ring", "dainty ring", "boho ring", "ring set", "custom ring", "everyday jewelry", "simple silver ring"],
        "searchIntents": ["jewelry", "ring", "silver", "sterling silver", "flower jewelry", "gift for her", "mother day", "christmas gift", "birthday gift"],
        "bestSellers": _best_sellers(
            "SilverRainSilver",
            2001401,
            ["Silver Jewelry Stackable Ring", "Sterling Silver Thumb Ring", "Minimalist Ring Set", "Simple Silver Everyday Ring"],
            22.5,
            7600,
            "#9ca3af",
        ),
    },
    {
        "listingId": "4322812435",
        "listingTitle": "All She Does Is Beach Patch",
        "listingUrl": "https://www.etsy.com/listing/4322812435/all-she-does-is-beach-patch?ref=shop_home_active_14&pro=1&logging_key=5dd1f789bf08eea9392cf37eb52280a8c2e69825%3A4322812435",
        "listingUrlVerified": True,
        "shopName": "PricklyPatchTx",
        "shopUrl": "https://www.etsy.com/shop/PricklyPatchTx",
        "shopUrlVerified": True,
        "shopAvatarUrl": _avatar("PricklyPatchTx", "#111827"),
        "createdAt": "May 2024",
        "country": "US",
        "category": "craft-supplies-and-tools",
        "listingCount": 514,
        "shopFavorites": 3300,
        "shopReviews": 3900,
        "totalShopSales": 82800,
        "sales1Day": 674,
        "sales7Day": 1700,
        "sales30Day": 7400,
        "price": 5.25,
        "views": 64200,
        "keywords": ["patch", "embroidery", "digital file"],
        "tags": ["embroidery patch", "patch file", "machine embroidery", "cute patch", "western patch", "hat patch", "digital embroidery", "patch design", "texas patch", "stitch file", "embroidery download", "badge patch", "applique patch"],
        "searchIntents": ["patch", "embroidery", "badge", "applique", "beach", "summer", "hat patch", "western", "digital file", "halloween patch"],
        "bestSellers": _best_sellers(
            "PricklyPatchTx",
            2001501,
            ["Cute Patch Embroidery File", "Western Hat Patch Design", "Texas Patch Digital Embroidery", "Applique Badge Patch File"],
            5.25,
            3100,
            "#111827",
        ),
    },
    {
        "listingId": "1873218463",
        "listingTitle": "16G 18G 20G Implant Grade Titanium Hinged",
        "listingUrl": "https://www.etsy.com/listing/1873218463/16g18g20g-implant-grade-titanium-hinged?ref=shop_home_active_1&pro=1&sts=1&logging_key=edb9dadc12bfab226dcab516e500c5c9232e1eff%3A1873218463",
        "listingUrlVerified": True,
        "shopName": "OuferJewelry",
        "shopUrl": "https://www.etsy.com/shop/OuferJewelry",
        "shopUrlVerified": True,
        "shopAvatarUrl": _avatar("OuferJewelry", "#e5e7eb"),
        "createdAt": "Nov 2019",
        "country": "US",
        "category": "jewelry",
        "listingCount": 2100,
        "shopFavorites": 57900,
        "shopReviews": 115400,
        "totalShopSales": 651000,
        "sales1Day": 671,
        "sales7Day": 4900,
        "sales30Day": 15400,
        "price": 19.99,
        "views": 390000,
        "keywords": ["body jewelry", "fine jewelry", "gift"],
        "tags": ["body jewelry", "minimal jewelry", "gold hoop", "silver hoop", "jewelry gift", "earring set", "dainty jewelry", "nose ring", "gift for her", "everyday earring", "cartilage earring", "fine jewelry", "personalized jewelry"],
        "searchIntents": ["jewelry", "body jewelry", "earring", "nose ring", "cartilage", "titanium", "gift for her", "christmas gift", "mother day"],
        "bestSellers": _best_sellers(
            "OuferJewelry",
            2001601,
            ["Minimal Fine Jewelry Gift", "Gold Hoop Earring Set", "Dainty Nose Ring Jewelry", "Cartilage Earring Gift for Her"],
            19.99,
            6900,
            "#e5e7eb",
        ),
    },
    {
        "listingId": "1278385305",
        "listingTitle": "Survival Garden Medicinal Herb",
        "listingUrl": "https://www.etsy.com/listing/1278385305/survival-garden-medicinal-herb?ref=shop_home_feat_3&pro=1&frs=1&logging_key=a9d24bc4d1e522a2122d56f44bada46f4dbb4817%3A1278385305",
        "listingUrlVerified": True,
        "shopName": "SeedTherapy",
        "shopUrl": "https://www.etsy.com/shop/SeedTherapy",
        "shopUrlVerified": True,
        "shopAvatarUrl": _avatar("SeedTherapy", "#0f172a"),
        "createdAt": "Sep 2019",
        "country": "US",
        "category": "paper-and-party-supplies",
        "listingCount": 697,
        "shopFavorites": 37400,
        "shopReviews": 91600,
        "totalShopSales": 996900,
        "sales1Day": 609,
        "sales7Day": 4700,
        "sales30Day": 20700,
        "price": 7.95,
        "views": 522000,
        "keywords": ["therapy worksheet", "mental health printable", "journal"],
        "tags": ["therapy worksheet", "mental health", "self care printable", "cbt worksheet", "anxiety worksheet", "journal prompts", "therapy planner", "printable workbook", "mindfulness pdf", "wellness journal", "counseling worksheet", "digital download", "self help worksheet"],
        "searchIntents": ["therapy", "mental health", "self care", "wellness", "worksheet", "printable", "journal", "planner", "garden", "herb", "medicinal herb"],
        "bestSellers": _best_sellers(
            "SeedTherapy",
            2001701,
            ["Therapy Worksheet Printable", "CBT Anxiety Worksheet Bundle", "Mental Health Journal Prompts", "Printable Self Care Workbook"],
            7.95,
            7200,
            "#0f172a",
        ),
    },
    {
        "listingId": "820024569",
        "listingTitle": "Sale National Parks Wilderness Wonders",
        "listingUrl": "https://www.etsy.com/listing/820024569/sale-national-parks-wilderness-wonders?ref=shop_home_feat_1&pro=1&sts=1&logging_key=e98a0dcbf7d6952b3e7d76687b6b5145db5cfcd3%3A1599773917",
        "listingUrlVerified": True,
        "shopName": "CuteLittleFabricShop",
        "shopUrl": "https://www.etsy.com/shop/CuteLittleFabricShop",
        "shopUrlVerified": True,
        "shopAvatarUrl": _avatar("CuteLittleFabricShop", "#14b8a6"),
        "createdAt": "Aug 2015",
        "country": "US",
        "category": "craft-supplies-and-tools",
        "listingCount": 16300,
        "shopFavorites": 29400,
        "shopReviews": 117800,
        "totalShopSales": 617500,
        "sales1Day": 401,
        "sales7Day": 2800,
        "sales30Day": 9900,
        "price": 12.0,
        "views": 340000,
        "keywords": ["fabric", "sewing", "pattern"],
        "tags": ["fabric shop", "sewing pattern", "quilt fabric", "cotton fabric", "fabric bundle", "sewing supplies", "fat quarter", "quilting cotton", "floral fabric", "craft fabric", "yard fabric", "cute fabric", "pattern pack"],
        "searchIntents": ["fabric", "sewing", "quilt", "cotton", "pattern", "national parks", "wilderness", "outdoor", "craft supplies", "christmas sewing", "mother day craft"],
        "bestSellers": _best_sellers(
            "CuteLittleFabricShop",
            2001801,
            ["Fabric Sewing Pattern Pack", "Quilt Fabric Bundle", "Floral Cotton Fat Quarter Set", "Cute Craft Fabric Yard Pack"],
            12.0,
            4100,
            "#14b8a6",
        ),
    },
]


def get_listing_fixtures():
    return deepcopy(SHOP_FIXTURES)
