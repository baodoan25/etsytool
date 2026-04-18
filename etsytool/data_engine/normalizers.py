import re 
from datetime import datetime ,timezone 
from urllib .parse import urlparse 


def thanh_chuoi (gia_tri ,fallback =""):
    if gia_tri is None :
        return fallback 

    return str (gia_tri )


def thanh_so (gia_tri ,fallback =0 ):
    if gia_tri is None :
        return fallback 

    if isinstance (gia_tri ,(int ,float )):
        return gia_tri 

    cleaned =re .sub (r"[^0-9.\-]","",str (gia_tri ))

    if not cleaned :
        return fallback 

    try :
        parsed =float (cleaned )
    except ValueError :
        return fallback 

    return int (parsed )if parsed .is_integer ()else parsed 


def thanh_boolean (gia_tri ):
    if isinstance (gia_tri ,bool ):
        return gia_tri 

    if isinstance (gia_tri ,str ):
        return gia_tri .strip ().lower ()in {"1","true","yes","y"}

    return bool (gia_tri )


def gia_tri_dau_tien (nguon ,*keys ,fallback =""):
    for khoa in keys :
        gia_tri =nguon .get (khoa )

        if gia_tri not in (None ,""):
            return gia_tri 

    return fallback 


def chon_url_anh (nguon ):
    direct_image =gia_tri_dau_tien (
    nguon ,
    "thumbnailUrl",
    "imageUrl",
    "image",
    "mainImage",
    "primaryImage",
    "img",
    )

    if direct_image :
        return thanh_chuoi (direct_image )

    for khoa in ("images","listingImages","photos","imageUrls"):
        images =nguon .get (khoa )

        if not isinstance (images ,list )or not images :
            continue 

        first_image =images [0 ]

        if isinstance (first_image ,str ):
            return first_image 

        if isinstance (first_image ,dict ):
            image_url =gia_tri_dau_tien (
            first_image ,
            "url_fullxfull",
            "url_570xN",
            "url_340x270",
            "url_170x135",
            "url",
            )

            if image_url :
                return thanh_chuoi (image_url )

    return ""


def trich_ma_listing (raw_listing ):
    ma_listing =gia_tri_dau_tien (raw_listing ,"listingId","listing_id","id")

    if ma_listing :
        return thanh_chuoi (ma_listing )

    url_listing =thanh_chuoi (gia_tri_dau_tien (raw_listing ,"listingUrl","url","link"))
    match =re .search (r"/listing/(\d+)",url_listing )

    return match .group (1 )if match else ""


def la_url_etsy_tin_cay (raw_url ):
    if not raw_url :
        return False 

    parsed_url =urlparse (str (raw_url ))
    hostname =parsed_url .hostname or ""

    return parsed_url .scheme in {"http","https"}and (hostname =="etsy.com"or hostname .endswith (".etsy.com"))


def chuan_hoa_danh_sach_the (gia_tri ):
    if not gia_tri :
        return []

    if isinstance (gia_tri ,str ):
        return [tag .strip ()for tag in re .split (r"[,|;]",gia_tri )if tag .strip ()]

    if isinstance (gia_tri ,list ):
        tags =[]

        for muc in gia_tri :
            if isinstance (muc ,str ):
                tags .append (muc .strip ())
            elif isinstance (muc ,dict ):
                label =gia_tri_dau_tien (muc ,"label","name","tag","value")

                if label :
                    tags .append (thanh_chuoi (label ).strip ())

        return [tag for tag in tags if tag ]

    return []


def chuan_hoa_ban_ghi_listing (raw_listing ,nguon ="apify"):
    url_listing =thanh_chuoi (gia_tri_dau_tien (raw_listing ,"listingUrl","url","link","productUrl"))
    shop_url =thanh_chuoi (gia_tri_dau_tien (raw_listing ,"shopUrl","sellerUrl","storeUrl"))
    ten_shop =thanh_chuoi (gia_tri_dau_tien (raw_listing ,"shopName","sellerName","storeName","shop"))
    tieu_de =thanh_chuoi (gia_tri_dau_tien (raw_listing ,"listingTitle","title","name"))
    tags =chuan_hoa_danh_sach_the (gia_tri_dau_tien (raw_listing ,"tags","tagList","listingTags",fallback =[]))
    cac_tu_khoa =chuan_hoa_danh_sach_the (gia_tri_dau_tien (raw_listing ,"keywords","keyword","searchTerms",fallback =[]))
    price =thanh_so (gia_tri_dau_tien (raw_listing ,"price","salePrice","amount",fallback =0 ))
    favorites =thanh_so (gia_tri_dau_tien (raw_listing ,"favorites","favoriteCount","likes",fallback =0 ))
    reviews =thanh_so (gia_tri_dau_tien (raw_listing ,"reviews","reviewCount","shopReviews",fallback =0 ))
    views =thanh_so (gia_tri_dau_tien (raw_listing ,"views","viewCount",fallback =0 ))
    rating =thanh_so (gia_tri_dau_tien (raw_listing ,"rating","stars",fallback =0 ))
    doanh_so =thanh_so (gia_tri_dau_tien (raw_listing ,"sales","estimatedSales","sales30Day",fallback =0 ))
    ma_listing =trich_ma_listing (raw_listing )
    scraped_at =datetime .hien_tai (timezone .utc ).isoformat ()

    return {
    "listingId":ma_listing ,
    "listingTitle":tieu_de or f"Etsy Listing {ma_listing }".strip (),
    "listingUrl":url_listing ,
    "listingUrlVerified":la_url_etsy_tin_cay (url_listing )and "/listing/"in url_listing ,
    "shopName":ten_shop or "Unknown shop",
    "shopUrl":shop_url ,
    "shopUrlVerified":la_url_etsy_tin_cay (shop_url )and "/shop/"in shop_url ,
    "shopAvatarUrl":thanh_chuoi (gia_tri_dau_tien (raw_listing ,"shopAvatarUrl","sellerAvatar","shopIcon")),
    "thumbnailUrl":chon_url_anh (raw_listing ),
    "createdAt":thanh_chuoi (gia_tri_dau_tien (raw_listing ,"createdAt","dateCreated","publishedAt")),
    "country":thanh_chuoi (gia_tri_dau_tien (raw_listing ,"country","location","shopCountry")),
    "category":thanh_chuoi (gia_tri_dau_tien (raw_listing ,"category","categoryName",fallback ="all")),
    "listingCount":thanh_so (gia_tri_dau_tien (raw_listing ,"listingCount","shopListingCount",fallback =0 )),
    "shopFavorites":thanh_so (gia_tri_dau_tien (raw_listing ,"shopFavorites","sellerFavorites",fallback =favorites )),
    "shopReviews":reviews ,
    "sales1Day":0 ,
    "sales7Day":0 ,
    "sales30Day":doanh_so ,
    "price":price ,
    "totalShopSales":thanh_so (gia_tri_dau_tien (raw_listing ,"totalShopSales","shopSales",fallback =doanh_so )),
    "views":views ,
    "favorites":favorites ,
    "keywords":cac_tu_khoa ,
    "tags":tags ,
    "searchIntents":[*cac_tu_khoa ,*tags ,tieu_de ,ten_shop ],
    "source":nguon ,
    "scrapedAt":scraped_at ,
    }
