from django .conf import settings 


DEFAULT_EXTEND_OUTPUT_FUNCTION ="""($) => {
    const result = {};
    return result;
}"""


def tao_du_lieu_chay (start_urls ,max_items =1000 ,end_page =1 ,include_description =False ):
    return {
    "startUrls":list (start_urls ),
    "includeDescription":include_description ,
    "includeVariationPrices":False ,
    "maxItems":max_items ,
    "endPage":end_page ,
    "search":None ,
    "extendOutputFunction":DEFAULT_EXTEND_OUTPUT_FUNCTION ,
    "customMapFunction":"(object) => { return {...object} }",
    "proxy":{
    "useApifyProxy":True ,
    "apifyProxyGroups":["RESIDENTIAL"],
    },
    }


def chay_actor_etsy (start_urls ,max_items =1000 ,end_page =1 ,include_description =False ,actor_id =None ,tu =None ):
    api_token =tu or settings .APIFY_API_TOKEN 
    selected_actor_id =actor_id or settings .APIFY_ETSY_ACTOR_ID 

    if not api_token :
        raise RuntimeError ("Missing APIFY_API_TOKEN. Set it in your environment before running Apify ingestion.")

    try :
        from apify_client import ApifyClient 
    except ImportError as exc :
        raise RuntimeError ("Missing Python package apify-client. Install it with: pip install apify-client")from exc 

    client =ApifyClient (api_token )
    run_input =tao_du_lieu_chay (
    start_urls =start_urls ,
    max_items =max_items ,
    end_page =end_page ,
    include_description =include_description ,
    )
    run =client .actor (selected_actor_id ).call (run_input =run_input )
    dataset_id =run ["defaultDatasetId"]
    cac_muc =list (client .dataset (dataset_id ).iterate_items ())

    return {
    "actorId":selected_actor_id ,
    "datasetId":dataset_id ,
    "runId":run .get ("id")or dataset_id ,
    "runInput":run_input ,
    "items":cac_muc ,
    }
