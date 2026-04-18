import json 
from pathlib import Path 

from django .conf import settings 

from .normalizers import chuan_hoa_ban_ghi_listing 


def lay_thu_muc_data_engine ():
    thu_muc_du_lieu =Path (settings .DATA_ENGINE_DIR )
    thu_muc_du_lieu .mkdir (parents =True ,exist_ok =True )
    return thu_muc_du_lieu 


def lay_thu_muc_tho ():
    raw_dir =lay_thu_muc_data_engine ()/"raw"/"apify"
    raw_dir .mkdir (parents =True ,exist_ok =True )
    return raw_dir 


def lay_duong_dan_da_chuan_hoa ():
    normalized_dir =lay_thu_muc_data_engine ()/"normalized"
    normalized_dir .mkdir (parents =True ,exist_ok =True )
    return normalized_dir /"listings.json"


def ghi_cac_muc_chay_tho (run_id ,cac_muc ):
    raw_path =lay_thu_muc_tho ()/f"{run_id }.jsonl"

    with raw_path .open ("w",encoding ="utf-8")as raw_file :
        for muc in cac_muc :
            raw_file .write (json .dumps (muc ,ensure_ascii =False ))
            raw_file .write ("\n")

    return raw_path 


def tai_listing_da_chuan_hoa ():
    duong_dan_da_chuan_hoa =lay_duong_dan_da_chuan_hoa ()

    if not duong_dan_da_chuan_hoa .exists ():
        return []

    with duong_dan_da_chuan_hoa .open ("r",encoding ="utf-8")as normalized_file :
        tai_trong =json .load (normalized_file )

    if isinstance (tai_trong ,list ):
        return tai_trong 

    return tai_trong .get ("items",[])


def luu_listing_da_chuan_hoa (cac_listing ):
    duong_dan_da_chuan_hoa =lay_duong_dan_da_chuan_hoa ()
    tmp_path =duong_dan_da_chuan_hoa .with_suffix (".tmp")

    with tmp_path .open ("w",encoding ="utf-8")as tmp_file :
        json .dump ({"items":cac_listing },tmp_file ,ensure_ascii =False ,indent =2 )

    tmp_path .replace (duong_dan_da_chuan_hoa )
    return duong_dan_da_chuan_hoa 


def gop_listing (existing_listings ,listing_moi ):
    da_gop ={}

    for listing in [*existing_listings ,*listing_moi ]:
        ma_listing =str (listing .get ("listingId")or "").strip ()
        url_listing =str (listing .get ("listingUrl")or "").strip ()
        khoa =ma_listing or url_listing 

        if not khoa :
            continue 

        da_gop [khoa ]=listing 

    return list (da_gop .values ())


def nhap_cac_muc_tho (raw_items ,nguon ="apify"):
    normalized_items =[
    chuan_hoa_ban_ghi_listing (muc ,nguon =nguon )
    for muc in raw_items 
    ]
    normalized_items =[
    muc 
    for muc in normalized_items 
    if muc .get ("listingId")or muc .get ("listingUrl")
    ]
    merged_items =gop_listing (tai_listing_da_chuan_hoa (),normalized_items )
    duong_dan_da_chuan_hoa =luu_listing_da_chuan_hoa (merged_items )

    return {
    "normalizedItems":normalized_items ,
    "totalItems":len (merged_items ),
    "normalizedPath":duong_dan_da_chuan_hoa ,
    }
