from django .http import Http404 ,JsonResponse 
from django .views .decorators .http import require_GET 
import re 
from urllib .parse import quote 

from .ai_engine .keyword_intent import mo_rong_truy_van_tu_khoa 
from .dev_keyword_data import lay_thong_tin_tu_khoa 
from .dev_shop_data import lay_du_lieu_mau_listing 
from .data_engine .storage import tai_listing_da_chuan_hoa 


SEARCH_ALIASES ={
"mother":{"mother","mom","mama","mommy"},
"mom":{"mother","mom","mama","mommy"},
"father":{"father","dad","daddy","papa"},
"dad":{"father","dad","daddy","papa"},
"valentine":{"valentine","valentines"},
"christmas":{"christmas","xmas","holiday","ornament"},
"xmas":{"christmas","xmas","holiday","ornament"},
"halloween":{"halloween","spooky","ghost","pumpkin","witch"},
"spooky":{"halloween","spooky","ghost","pumpkin","witch"},
"teacher":{"teacher","classroom","school","educator"},
"school":{"teacher","classroom","school","student","back"},
"graduation":{"graduation","graduate","grad","class"},
"graduate":{"graduation","graduate","grad","class"},
"jewelry":{"jewelry","necklace","ring","earring","bracelet"},
"necklace":{"jewelry","necklace","personalized","gift"},
"garden":{"garden","seed","plant","botanical","flower","herb"},
"seed":{"garden","seed","plant","botanical","flower","herb"},
"svg":{"svg","png","digital","printable","clipart","sublimation"},
"png":{"svg","png","digital","printable","clipart","sublimation"},
"digital":{"svg","png","digital","printable","clipart","download"},
"patch":{"patch","embroidery","badge","applique"},
"fabric":{"fabric","sewing","quilt","cotton","pattern"},
"therapy":{"therapy","mental","wellness","self","care","worksheet"},
"gift":{"gift","present","personalized","custom"},
}


def _chuan_hoa_tu_tim_kiem (tu ):
    tu =tu .strip ().lower ()

    if len (tu )>4 and tu .endswith ("s"):
        tu =tu [:-1 ]

    return tu 


def _tach_tu_tim_kiem (gia_tri ):
    da_chuan_hoa =re .sub (r"[^a-z0-9]+"," ",str (gia_tri or "").lower ())
    return [_chuan_hoa_tu_tim_kiem (tu )for tu in da_chuan_hoa .split ()if tu ]


def _mo_rong_tu_tim_kiem (cac_tu ):
    da_mo_rong =set (cac_tu )

    for tu in cac_tu :
        da_mo_rong .update (SEARCH_ALIASES .get (tu ,set ()))

    return da_mo_rong 


def _khop_van_ban_tim_kiem (truy_van ,cac_ung_vien ):
    query_tokens =_tach_tu_tim_kiem (truy_van )

    if not query_tokens :
        return True 

    expanded_query_tokens =_mo_rong_tu_tim_kiem (query_tokens )
    candidate_text =" ".join (str (ung_vien or "")for ung_vien in cac_ung_vien )
    candidate_tokens =set (_tach_tu_tim_kiem (candidate_text ))
    expanded_candidate_tokens =_mo_rong_tu_tim_kiem (candidate_tokens )

    meaningful_query_tokens =[
    tu 
    for tu in query_tokens 
    if tu not in {"day","for","the","and","to","of"}
    ]
    tokens_to_match =meaningful_query_tokens or query_tokens 

    return all (
    tu in expanded_candidate_tokens 
    or bool (SEARCH_ALIASES .get (tu ,set ())&expanded_candidate_tokens )
    for tu in tokens_to_match 
    )


def _khop_bat_ky_van_ban_tim_kiem (queries ,cac_ung_vien ):
    cleaned_queries =[str (truy_van or "").strip ()for truy_van in queries if str (truy_van or "").strip ()]

    if not cleaned_queries :
        return True 

    return any (_khop_van_ban_tim_kiem (truy_van ,cac_ung_vien )for truy_van in cleaned_queries )


DIGITAL_KEYWORD_TERMS ={
"svg",
"png",
"digital",
"download",
"printable",
"template",
"sublimation",
"clipart",
"bundle",
"planner",
"invitation",
"card",
}

PHYSICAL_KEYWORD_TERMS ={
"shirt",
"sweatshirt",
"hat",
"mug",
"tumbler",
"necklace",
"ring",
"patch",
"bag",
"tote",
"sticker",
"ornament",
"toy",
"treat",
"bandana",
"supplies",
}


def _mam_tu_khoa_on_dinh (tu_khoa ):
    return sum ((chi_muc +1 )*ord (character )for chi_muc ,character in enumerate (tu_khoa ))


def _uoc_tinh_chi_so_tu_khoa_ai (tu_khoa ,thu_hang ):
    cac_tu =set (_tach_tu_tim_kiem (tu_khoa ))
    mam =_mam_tu_khoa_on_dinh (tu_khoa )
    so_tu =max (1 ,len (cac_tu ))
    co_y_dinh_so =bool (cac_tu &DIGITAL_KEYWORD_TERMS )
    co_y_dinh_vat_ly =bool (cac_tu &PHYSICAL_KEYWORD_TERMS )

    if co_y_dinh_so and co_y_dinh_vat_ly :
        phan_tram_so =58 +mam %13 
    elif co_y_dinh_so :
        phan_tram_so =78 +mam %17 
    elif co_y_dinh_vat_ly or cac_tu &{"gift","custom","personalized"}:
        phan_tram_so =8 +mam %20 
    else :
        phan_tram_so =30 +mam %35 

    phan_tram_so =min (95 ,max (5 ,phan_tram_so ))
    phan_tram_vat_ly =100 -phan_tram_so 

    moc_canh_tranh =5200 +mam %3400 
    giam_theo_do_cu_the =max (0 ,so_tu -1 )*(430 +mam %90 )
    tong_listing =max (85 ,moc_canh_tranh -giam_theo_do_cu_the )

    if co_y_dinh_so :
        tong_listing =int (tong_listing *0.72 )
    elif co_y_dinh_vat_ly :
        tong_listing =int (tong_listing *0.92 )

    diem =max (34 ,min (97 ,88 -thu_hang +mam %14 -max (0 ,so_tu -3 )*3 ))
    doanh_so =max (6 ,int ((diem *9 )+(mam %170 )-(tong_listing /42 )))
    doanh_so_truoc =max (1 ,int (doanh_so *(0.48 +(mam %35 )/100 )))
    phan_tram_tang_truong =int (((doanh_so -doanh_so_truoc )/doanh_so_truoc )*100 )
    listing_moi =max (1 ,int (tong_listing /(34 +mam %38 )))
    phan_tram_tang_listing_moi =(mam %180 )-35 

    return {
    "sales":doanh_so ,
    "previousSales":doanh_so_truoc ,
    "growthPercent":phan_tram_tang_truong ,
    "score":diem ,
    "newListings":listing_moi ,
    "newListingsGrowthPercent":phan_tram_tang_listing_moi ,
    "totalListings":tong_listing ,
    "physicalPercent":phan_tram_vat_ly ,
    "digitalPercent":phan_tram_so ,
    }


def _gia_tri_doanh_so_listing (listing ,khoang_thoi_gian ):
    if "estimatedSalesMap"in listing :
        return listing ["estimatedSalesMap"].get (khoang_thoi_gian ,listing ["estimatedSalesMap"].get ("7",0 ))

    return listing .get (f"sales{khoang_thoi_gian }Day",listing .get ("sales30Day",listing .get ("sales7Day",0 )))


def _url_tim_san_pham_shop (listing ):
    return f'{listing ["shopUrl"]}?search_query={quote (listing ["listingTitle"])}'


def _dong_goi_san_pham_ban_chay (listing ,khoang_thoi_gian ):
    co_url_listing_xac_minh =listing .get ("listingUrlVerified",False )

    return {
    "listingId":listing ["listingId"],
    "title":listing ["listingTitle"],
    "listingUrl":listing ["listingUrl"]if co_url_listing_xac_minh else _url_tim_san_pham_shop (listing ),
    "listingUrlVerified":co_url_listing_xac_minh ,
    "shopSearchUrlVerified":not co_url_listing_xac_minh and listing .get ("shopUrlVerified",False ),
    "imageUrl":listing .get ("thumbnailUrl",listing .get ("shopAvatarUrl","")),
    "price":listing .get ("price",0 ),
    "sales":_gia_tri_doanh_so_listing (listing ,khoang_thoi_gian ),
    "favorites":listing .get ("favorites",listing .get ("shopFavorites",0 )),
    }


def _lay_san_pham_ban_chay_shop (listing ,khoang_thoi_gian ,nguon_listing ):
    ten_shop =listing ["shopName"]
    listing_cua_shop =[
    san_pham 
    for san_pham in nguon_listing 
    if san_pham .get ("shopName")==ten_shop 
    ]
    san_pham_da_sap_xep =sorted (
    listing_cua_shop ,
    key =lambda san_pham :_gia_tri_doanh_so_listing (san_pham ,khoang_thoi_gian ),
    reverse =True ,
    )

    return [_dong_goi_san_pham_ban_chay (san_pham ,khoang_thoi_gian )for san_pham in san_pham_da_sap_xep [:4 ]]


def _lay_nguon_listing ():
    du_lieu_mau =lay_du_lieu_mau_listing ()
    cac_listing_da_nhap =tai_listing_da_chuan_hoa ()
    da_gop ={}

    for listing in [*du_lieu_mau ,*cac_listing_da_nhap ]:
        ma_listing =str (listing .get ("listingId")or "").strip ()
        url_listing =str (listing .get ("listingUrl")or "").strip ()
        khoa =ma_listing or url_listing 

        if not khoa :
            continue 

        da_gop [khoa ]=listing 

    return list (da_gop .values ())


def _khop_truy_van (listing ,che_do_tim_kiem ,truy_van_tim_kiem ,cac_truy_van_mo_rong =None ):
    if not truy_van_tim_kiem :
        return True 

    if che_do_tim_kiem =="shop":
        truy_van =truy_van_tim_kiem .strip ().lower ()
        cac_ung_vien =[listing ["shopName"],listing ["shopUrl"],listing ["listingId"]]
        return any (truy_van in str (ung_vien ).lower ()for ung_vien in cac_ung_vien )
    elif che_do_tim_kiem =="tag":
        cac_ung_vien =listing .get ("tags",[])
    else :
        cac_ung_vien =[
        listing ["listingTitle"],
        listing ["shopName"],
        listing .get ("category",""),
        *listing .get ("keywords",[]),
        *listing .get ("tags",[]),
        *listing .get ("searchIntents",[]),
        ]

    return _khop_bat_ky_van_ban_tim_kiem (cac_truy_van_mo_rong or [truy_van_tim_kiem ],cac_ung_vien )


def _khop_thoi_gian_tao (listing ,thoi_gian_tao ):
    if thoi_gian_tao in ("","all",None ):
        return True 

    try :
        return listing .get ("createdDaysAgo",9999 )<int (thoi_gian_tao )
    except (TypeError ,ValueError ):
        return True 


def _khop_danh_muc (listing ,danh_muc ):
    return danh_muc in ("","all",None )or listing ["category"]==danh_muc 


def _khop_tiem_nang (listing ,khoang_thoi_gian ,chi_tiem_nang ):
    if not chi_tiem_nang :
        return True 

    doanh_so_uoc_tinh =listing .get (f"sales{khoang_thoi_gian }Day",listing .get ("estimatedSalesMap",{}).get (khoang_thoi_gian ,0 ))
    so_ngay_da_tao =listing .get ("createdDaysAgo")
    moi_hoac_chua_xac_minh =so_ngay_da_tao is None or so_ngay_da_tao <=30 
    return moi_hoac_chua_xac_minh and (doanh_so_uoc_tinh >=50 or listing .get ("goodReviews",0 )>=10 )


def _dong_goi_listing (listing ,khoang_thoi_gian ,nguon_listing =None ):
    nguon_listing =nguon_listing or [listing ]
    doanh_so_uoc_tinh =_gia_tri_doanh_so_listing (listing ,khoang_thoi_gian )
    serialized ={
    "listingId":listing ["listingId"],
    "listingTitle":listing ["listingTitle"],
    "listingUrl":listing ["listingUrl"],
    "listingUrlVerified":listing .get ("listingUrlVerified",False ),
    "shopName":listing ["shopName"],
    "shopUrl":listing ["shopUrl"],
    "shopUrlVerified":listing .get ("shopUrlVerified",False ),
    "shopAvatarUrl":listing .get ("shopAvatarUrl",listing .get ("thumbnailUrl","")),
    "thumbnailUrl":listing .get ("shopAvatarUrl",listing .get ("thumbnailUrl","")),
    "createdAt":listing .get ("createdAt",""),
    "country":listing .get ("country",""),
    "listingCount":listing .get ("listingCount",0 ),
    "shopFavorites":listing .get ("shopFavorites",listing .get ("favorites",0 )),
    "shopReviews":listing .get ("shopReviews",0 ),
    "sales1Day":listing .get ("sales1Day",listing .get ("estimatedSalesMap",{}).get ("1",0 )),
    "sales7Day":listing .get ("sales7Day",listing .get ("estimatedSalesMap",{}).get ("7",0 )),
    "sales30Day":listing .get ("sales30Day",listing .get ("estimatedSalesMap",{}).get ("30",0 )),
    "price":listing ["price"],
    "totalShopSales":listing ["totalShopSales"],
    "estimatedSales":doanh_so_uoc_tinh ,
    "views":listing ["views"],
    "favorites":listing .get ("shopFavorites",listing .get ("favorites",0 )),
    "keywords":listing .get ("keywords",[]),
    "tags":listing .get ("tags",[]),
    "bestSellers":_lay_san_pham_ban_chay_shop (listing ,khoang_thoi_gian ,nguon_listing ),
    }
    return serialized 


def _sap_xep_listing (cac_listing ,sap_xep_theo ,khoang_thoi_gian ):
    if sap_xep_theo =="best-selling":
        return sorted (
        cac_listing ,
        key =lambda listing :listing .get (f"sales{khoang_thoi_gian }Day",listing .get ("estimatedSalesMap",{}).get (khoang_thoi_gian ,0 )),
        reverse =True ,
        )

    if sap_xep_theo =="most-viewed":
        return sorted (cac_listing ,key =lambda listing :listing ["views"],reverse =True )

    return sorted (cac_listing ,key =lambda listing :listing .get ("createdDaysAgo",9999 ))


@require_GET 
def xem_listing_hang_dau (request ):
    khoang_thoi_gian =request .GET .get ("timeframe","7")
    che_do_tim_kiem =request .GET .get ("searchMode","keyword")
    truy_van_tim_kiem =(
    request .GET .get ("searchQuery")
    or request .GET .get ("keyword")
    or request .GET .get ("niche")
    or request .GET .get ("shopQuery")
    or ""
    )
    danh_muc =request .GET .get ("category","all")
    thoi_gian_tao =request .GET .get ("createdTime","all")
    sap_xep_theo =request .GET .get ("sortBy","best-selling")
    chi_tiem_nang =request .GET .get ("potentialOnly","false").lower ()=="true"
    y_dinh =(
    mo_rong_truy_van_tu_khoa (truy_van_tim_kiem )
    if truy_van_tim_kiem and che_do_tim_kiem !="shop"
    else {
    "originalQuery":truy_van_tim_kiem ,
    "intent":truy_van_tim_kiem ,
    "expandedKeywords":[truy_van_tim_kiem ]if truy_van_tim_kiem else [],
    "productAngles":[],
    "holidayFits":[],
    "source":"none",
    }
    )
    cac_truy_van_mo_rong =y_dinh .get ("expandedKeywords",[truy_van_tim_kiem ])

    cac_listing =_lay_nguon_listing ()
    da_loc =[
    listing 
    for listing in cac_listing 
    if _khop_danh_muc (listing ,danh_muc )
    and _khop_thoi_gian_tao (listing ,thoi_gian_tao )
    and _khop_truy_van (listing ,che_do_tim_kiem ,truy_van_tim_kiem ,cac_truy_van_mo_rong )
    and _khop_tiem_nang (listing ,khoang_thoi_gian ,chi_tiem_nang )
    ]
    da_sap_xep =_sap_xep_listing (da_loc ,sap_xep_theo ,khoang_thoi_gian )

    return JsonResponse (
    {
    "items":[_dong_goi_listing (listing ,khoang_thoi_gian ,cac_listing )for listing in da_sap_xep ],
    "meta":{
    "timeframe":khoang_thoi_gian ,
    "category":danh_muc ,
    "searchMode":che_do_tim_kiem ,
    "searchQuery":truy_van_tim_kiem ,
    "count":len (da_sap_xep ),
    "intent":y_dinh ,
    },
    }
    )


def _tao_goi_y_tu_khoa_ai (y_dinh ,cac_muc_hien_co ):
    cac_tu_khoa_hien_co ={
    str (muc .get ("keyword")or "").strip ().lower ()
    for muc in cac_muc_hien_co 
    }
    cac_goi_y =[]

    for chi_muc ,tu_khoa in enumerate (y_dinh .get ("expandedKeywords",[]),start =1 ):
        tu_khoa_da_chuan_hoa =str (tu_khoa or "").strip ().lower ()

        if not tu_khoa_da_chuan_hoa or tu_khoa_da_chuan_hoa in cac_tu_khoa_hien_co :
            continue 

        chi_so =_uoc_tinh_chi_so_tu_khoa_ai (tu_khoa_da_chuan_hoa ,chi_muc )
        cac_tu_khoa_hien_co .add (tu_khoa_da_chuan_hoa )
        cac_goi_y .append (
        {
        "keyword":tu_khoa_da_chuan_hoa ,
        **chi_so ,
        "holiday":", ".join (y_dinh .get ("holidayFits",[])[:2 ])or "AI keyword idea",
        "holidayDate":"",
        "holidayFit":"Estimate",
        "holidayReason":"Estimated from keyword intent. Connect live Etsy metrics to replace these estimates with real sales and competition.",
        "intentTags":[
        y_dinh .get ("intent",""),
        *y_dinh .get ("productAngles",[]),
        *y_dinh .get ("holidayFits",[]),
        ],
        "source":y_dinh .get ("source","ai"),
        "isAiSuggestion":True ,
        "metricsAreEstimated":True ,
        }
        )

    return cac_goi_y 


@require_GET 
def xem_chi_tiet_listing (request ,ma_listing ):
    listing =next ((muc for muc in _lay_nguon_listing ()if muc ["listingId"]==str (ma_listing )),None )

    if not listing :
        raise Http404 ("Listing not found")

    return JsonResponse (
    {
    "listingId":listing ["listingId"],
    "title":listing ["listingTitle"],
    "listingUrl":listing ["listingUrl"],
    "listingUrlVerified":listing .get ("listingUrlVerified",False ),
    "imageUrl":listing .get ("shopAvatarUrl",listing .get ("thumbnailUrl","")),
    "shopAvatarUrl":listing .get ("shopAvatarUrl",listing .get ("thumbnailUrl","")),
    "shopName":listing ["shopName"],
    "tags":listing ["tags"][:13 ],
    }
    )


@require_GET 
def xem_thong_tin_tu_khoa (request ):
    truy_van =request .GET .get ("query","").strip ().lower ()
    sap_xep_theo =request .GET .get ("sortBy","sales")
    khoang_thoi_gian =request .GET .get ("timeframe","1")
    cac_muc =lay_thong_tin_tu_khoa ()
    y_dinh =mo_rong_truy_van_tu_khoa (truy_van )if truy_van else {
    "originalQuery":"",
    "intent":"",
    "expandedKeywords":[],
    "productAngles":[],
    "holidayFits":[],
    "source":"none",
    }

    if truy_van :
        cac_muc =[
        muc 
        for muc in cac_muc 
        if _khop_bat_ky_van_ban_tim_kiem (
        y_dinh .get ("expandedKeywords",[truy_van ]),
        [
        muc .get ("keyword",""),
        *muc .get ("intentTags",[]),
        ],
        )
        ]
        cac_muc =[*cac_muc ,*_tao_goi_y_tu_khoa_ai (y_dinh ,cac_muc )]

    if sap_xep_theo =="score":
        cac_muc =sorted (cac_muc ,key =lambda muc :muc ["score"],reverse =True )
    elif sap_xep_theo =="new-listings":
        cac_muc =sorted (cac_muc ,key =lambda muc :muc ["newListings"],reverse =True )
    elif sap_xep_theo =="total-listings":
        cac_muc =sorted (cac_muc ,key =lambda muc :muc ["totalListings"],reverse =True )
    else :
        cac_muc =sorted (cac_muc ,key =lambda muc :muc ["sales"],reverse =True )

    return JsonResponse (
    {
    "items":cac_muc ,
    "meta":{
    "query":truy_van ,
    "sortBy":sap_xep_theo ,
    "timeframe":khoang_thoi_gian ,
    "count":len (cac_muc ),
    "market":"USA",
    "intent":y_dinh ,
    },
    }
    )
