import json 
import time 
from pathlib import Path 
from urllib import request 
from urllib .error import URLError ,HTTPError 

from django .conf import settings 


STOP_WORDS ={"a","an","and","day","for","gift","of","the","to","with"}
DEFAULT_MAX_EXPANDED_KEYWORDS =32 

LOCAL_INTENT_MAP ={
"mother":{
"intent":"Mother's Day gift",
"expandedKeywords":[
"mother day",
"mothers day",
"mother's day",
"mom gift",
"gift for mom",
"mama gift",
"mom floral svg",
"personalized name necklace",
"custom mom necklace",
],
"productAngles":["personalized jewelry","mom shirt","floral svg","gift mug"],
"holidayFits":["Mother's Day"],
},
"mom":{
"intent":"Mother's Day gift",
"expandedKeywords":[
"mom gift",
"gift for mom",
"mama gift",
"mother day",
"mother's day",
"mom floral svg",
"personalized name necklace",
],
"productAngles":["personalized jewelry","mom shirt","floral svg"],
"holidayFits":["Mother's Day"],
},
"teacher":{
"intent":"Teacher gift",
"expandedKeywords":[
"teacher gift",
"teacher appreciation",
"teacher appreciation png",
"classroom gift",
"school svg",
"christmas teacher gift",
],
"productAngles":["teacher mug","teacher shirt","printable card","ornament"],
"holidayFits":["Teacher Appreciation Week","Christmas"],
},
"patch":{
"intent":"Embroidered patch",
"expandedKeywords":[
"patch",
"patches",
"high quality patch",
"cool patches",
"denim patches",
"embroidered patch",
"jacket patch",
"hat patch",
],
"productAngles":["jacket patch","hat patch","iron on patch"],
"holidayFits":[],
},
"christmas":{
"intent":"Christmas gift",
"expandedKeywords":[
"christmas",
"xmas",
"holiday gift",
"christmas teacher gift",
"ornament",
"mug",
],
"productAngles":["ornament","teacher gift","holiday mug"],
"holidayFits":["Christmas"],
},
"xmas":{
"intent":"Christmas gift",
"expandedKeywords":[
"xmas",
"christmas",
"holiday gift",
"christmas teacher gift",
"ornament",
],
"productAngles":["ornament","teacher gift","holiday mug"],
"holidayFits":["Christmas"],
},
"halloween":{
"intent":"Halloween POD design",
"expandedKeywords":[
"halloween",
"spooky",
"ghost",
"halloween ghost png",
"pumpkin",
"witch",
],
"productAngles":["png design","shirt graphic","sticker","sublimation"],
"holidayFits":["Halloween"],
},
"zinnia":{
"intent":"Garden seeds",
"expandedKeywords":[
"zinnia",
"zinnia seeds",
"peaches and cream zinnia seeds",
"flower seeds",
"garden seeds",
],
"productAngles":["seed packet","flower seed","garden gift"],
"holidayFits":["Spring gardening"],
},
"golf":{
"intent":"Golf dad gift",
"expandedKeywords":[
"golf",
"funny golf hat",
"golf dad",
"dad gift",
"father day",
"sports gift",
],
"productAngles":["golf hat","dad shirt","novelty gift"],
"holidayFits":["Father's Day"],
},
}


def _tach_tu (gia_tri ):
    return [tu for tu in "".join (
    character .lower ()if character .isalnum ()else " "
    for character in str (gia_tri or "")
    ).split ()if tu and tu not in STOP_WORDS ]


def _duong_dan_bo_nho_dem ():
    thu_muc_du_lieu =Path (settings .DATA_ENGINE_DIR )
    thu_muc_du_lieu .mkdir (parents =True ,exist_ok =True )
    return thu_muc_du_lieu /"gemini_keyword_intent_cache.json"


def _doc_bo_nho_dem ():
    duong_dan =_duong_dan_bo_nho_dem ()

    if not duong_dan .exists ():
        return {}

    try :
        return json .loads (duong_dan .read_text (encoding ="utf-8"))
    except (OSError ,json .JSONDecodeError ):
        return {}


def _ghi_bo_nho_dem (bo_nho_dem ):
    duong_dan =_duong_dan_bo_nho_dem ()
    duong_dan .write_text (json .dumps (bo_nho_dem ,ensure_ascii =True ,indent =2 ),encoding ="utf-8")


def _chuan_hoa_ket_qua (truy_van ,ket_qua ,nguon ):
    da_mo_rong =[]
    max_keywords =getattr (settings ,"GEMINI_MAX_EXPANDED_KEYWORDS",DEFAULT_MAX_EXPANDED_KEYWORDS )

    for gia_tri in [truy_van ,*ket_qua .get ("expandedKeywords",[])]:
        da_chuan_hoa =str (gia_tri or "").strip ().lower ()

        if da_chuan_hoa and da_chuan_hoa not in da_mo_rong :
            da_mo_rong .append (da_chuan_hoa )

    return {
    "originalQuery":truy_van ,
    "intent":str (ket_qua .get ("intent")or truy_van or "General Etsy search").strip (),
    "expandedKeywords":da_mo_rong [:max_keywords ],
    "productAngles":[str (muc ).strip ()for muc in ket_qua .get ("productAngles",[])if str (muc ).strip ()][:8 ],
    "holidayFits":[str (muc ).strip ()for muc in ket_qua .get ("holidayFits",[])if str (muc ).strip ()][:6 ],
    "source":nguon ,
    }


def _goi_y_tu_khoa_du_phong (truy_van ):
    base =str (truy_van or "").strip ().lower ()

    if not base :
        return []

    modifiers =[
    "",
    "gift",
    "personalized",
    "custom",
    "funny",
    "cute",
    "vintage",
    "shirt",
    "sweatshirt",
    "hat",
    "mug",
    "tumbler",
    "sticker",
    "svg",
    "png",
    "sublimation",
    "printable",
    "template",
    "digital download",
    "bundle",
    ]
    ideas =[]

    for modifier in modifiers :
        tu_khoa =f"{base } {modifier }".strip ()

        if tu_khoa not in ideas :
            ideas .append (tu_khoa )

    return ideas 


def _mo_rong_cuc_bo (truy_van ):
    cac_tu =_tach_tu (truy_van )
    da_khop =[]

    for tu in cac_tu :
        if tu in LOCAL_INTENT_MAP :
            da_khop .append (LOCAL_INTENT_MAP [tu ])

    if not da_khop :
        return _chuan_hoa_ket_qua (
        truy_van ,
        {
        "intent":truy_van or "General Etsy search",
        "expandedKeywords":_goi_y_tu_khoa_du_phong (truy_van ),
        "productAngles":[],
        "holidayFits":[],
        },
        "local",
        )

    da_mo_rong =[]
    product_angles =[]
    holiday_fits =[]

    for muc in da_khop :
        da_mo_rong .extend (muc ["expandedKeywords"])
        product_angles .extend (muc ["productAngles"])
        holiday_fits .extend (muc ["holidayFits"])

    return _chuan_hoa_ket_qua (
    truy_van ,
    {
    "intent":da_khop [0 ]["intent"],
    "expandedKeywords":da_mo_rong ,
    "productAngles":product_angles ,
    "holidayFits":holiday_fits ,
    },
    "local",
    )


def _goi_gemini (truy_van ):
    khoa_api =getattr (settings ,"GEMINI_API_KEY","")

    if not khoa_api or not getattr (settings ,"GEMINI_INTENT_ENABLED",False ):
        return None 

    mo_hinh =getattr (settings ,"GEMINI_MODEL","gemini-1.5-flash")
    diem_cuoi =(
    "https://generativelanguage.googleapis.com/v1beta/models/"
    f"{mo_hinh }:generateContent?key={khoa_api }"
    )
    loi_nhac =(
    "Return only compact JSON for an Etsy seller keyword research search. "
    "Schema: intent string, expandedKeywords array, productAngles array, holidayFits array. "
    "Generate 24-32 Etsy buyer keywords across physical products, POD products, digital downloads, "
    "templates, SVG/PNG, gifts, personalization, seasonal angles, and common misspellings when useful. "
    "Do not invent sales metrics, ranking claims, prices, or URLs. "
    f"Query: {truy_van }"
    )
    tai_trong ={
    "contents":[{"parts":[{"text":loi_nhac }]}],
    "generationConfig":{
    "temperature":0.2 ,
    "responseMimeType":"application/json",
    },
    }
    noi_dung =json .dumps (tai_trong ).encode ("utf-8")
    yeu_cau =request .Request (
    diem_cuoi ,
    data =noi_dung ,
    headers ={"Content-Type":"application/json"},
    method ="POST",
    )

    try :
        with request .urlopen (yeu_cau ,timeout =getattr (settings ,"GEMINI_TIMEOUT_SECONDS",6 ))as phan_hoi :
            tai_trong_phan_hoi =json .loads (phan_hoi .read ().decode ("utf-8"))
    except (HTTPError ,URLError ,TimeoutError ,json .JSONDecodeError ,OSError ):
        return None 

    van_ban =(
    tai_trong_phan_hoi .get ("candidates",[{}])[0 ]
    .get ("content",{})
    .get ("parts",[{}])[0 ]
    .get ("text","")
    )

    try :
        return json .loads (van_ban )
    except json .JSONDecodeError :
        return None 


def mo_rong_truy_van_tu_khoa (truy_van ):
    truy_van_da_lam_sach =str (truy_van or "").strip ().lower ()

    if not truy_van_da_lam_sach :
        return _chuan_hoa_ket_qua ("",{"expandedKeywords":[]},"none")

    khoa_bo_nho_dem =truy_van_da_lam_sach 
    bo_nho_dem =_doc_bo_nho_dem ()
    da_luu_dem =bo_nho_dem .get (khoa_bo_nho_dem )
    hien_tai =int (time .time ())
    thoi_han_luu_dem =getattr (settings ,"GEMINI_INTENT_CACHE_TTL_SECONDS",604800 )

    if da_luu_dem and hien_tai -int (da_luu_dem .get ("cachedAt",0 ))<thoi_han_luu_dem :
        ket_qua_luu_dem =dict (da_luu_dem .get ("result",{}))
        ket_qua_luu_dem ["source"]=ket_qua_luu_dem .get ("source","cache")
        return ket_qua_luu_dem 

    gemini_result =_goi_gemini (truy_van_da_lam_sach )
    ket_qua =(
    _chuan_hoa_ket_qua (truy_van_da_lam_sach ,gemini_result ,"gemini")
    if gemini_result 
    else _mo_rong_cuc_bo (truy_van_da_lam_sach )
    )

    if ket_qua ["source"]=="gemini":
        bo_nho_dem [khoa_bo_nho_dem ]={"cachedAt":hien_tai ,"result":ket_qua }
        _ghi_bo_nho_dem (bo_nho_dem )

    return ket_qua 
