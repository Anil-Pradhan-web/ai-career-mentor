import requests
import concurrent.futures
from duckduckgo_search import DDGS
from loguru import logger

HIGH_QUALITY_DOMAINS = [
    "youtube.com",
    "roadmap.sh",
    "developer.mozilla.org",
    "redis.io",
    "kubernetes.io",
    "postgresql.org",
    "fastapi.tiangolo.com",
    "docs.aws.amazon.com",
    "github.com",
    "medium.com",
    "dev.to",
    "freecodecamp.org",
    "geeksforgeeks.org"
]

def is_valid_url(url: str) -> bool:
    try:
        r = requests.head(url, timeout=3, headers={"User-Agent": "Mozilla/5.0"})
        # Some sites block HEAD requests or return 405 Method Not Allowed
        if r.status_code == 405:
            r = requests.get(url, timeout=3, headers={"User-Agent": "Mozilla/5.0"}, stream=True)
        return r.status_code < 400
    except:
        return False

def rank_and_validate(results: list[dict], max_results: int = 2) -> list[str]:
    valid_urls = []
    
    # Sort by quality domain presence
    def score_result(res):
        score = 0
        href = res.get("href", "").lower()
        if any(domain in href for domain in HIGH_QUALITY_DOMAINS):
            score += 10
        return score
        
    results = sorted(results, key=score_result, reverse=True)
    
    for res in results:
        url = res.get("href")
        if not url:
            continue
        if is_valid_url(url):
            valid_urls.append(url)
            if len(valid_urls) >= max_results:
                break
                
    return valid_urls

def fetch_resources_for_topic(topic: str, queries: list[str]) -> dict:
    """
    Given a topic and some LLM-generated specific queries, 
    retrieve categorized resources using DuckDuckGo.
    """
    logger.info(f"Fetching resources for topic: {topic}")
    
    youtube_resources = []
    article_resources = []
    github_resources = []
    official_docs = []
    
    with DDGS() as ddgs:
        # 1. YouTube
        try:
            yt_query = f"{topic} tutorial site:youtube.com"
            yt_res = list(ddgs.text(yt_query, max_results=5))
            youtube_resources = rank_and_validate(yt_res, max_results=2)
        except Exception as e:
            logger.warning(f"DDG Search failed for YouTube: {e}")

        # 2. Articles (use the first query suggested by LLM, or default)
        try:
            art_query = queries[0] if queries else f"{topic} tutorial OR article"
            art_res = list(ddgs.text(art_query, max_results=5))
            article_resources = rank_and_validate(art_res, max_results=2)
        except Exception as e:
            logger.warning(f"DDG Search failed for Articles: {e}")

        # 3. GitHub
        try:
            gh_query = f"{topic} example github"
            gh_res = list(ddgs.text(gh_query, max_results=3))
            github_resources = rank_and_validate(gh_res, max_results=1)
        except Exception as e:
            logger.warning(f"DDG Search failed for GitHub: {e}")

        # 4. Docs
        try:
            doc_query = f"{topic} official documentation"
            doc_res = list(ddgs.text(doc_query, max_results=3))
            official_docs = rank_and_validate(doc_res, max_results=1)
        except Exception as e:
            logger.warning(f"DDG Search failed for Docs: {e}")

    return {
        "youtube_resources": youtube_resources,
        "article_resources": article_resources,
        "github_resources": github_resources,
        "official_docs": official_docs
    }

def enrich_weeks_with_resources(weeks: list[dict]) -> list[dict]:
    """
    Concurrently fetch resources for all 8 weeks.
    """
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
        future_to_week = {
            executor.submit(fetch_resources_for_topic, w.get("topic", "Coding"), w.get("resource_search_queries", [])): w
            for w in weeks
        }
        
        for future in concurrent.futures.as_completed(future_to_week):
            week_dict = future_to_week[future]
            try:
                resources = future.result()
                week_dict["youtube_resources"] = resources["youtube_resources"]
                week_dict["article_resources"] = resources["article_resources"]
                week_dict["github_resources"] = resources["github_resources"]
                week_dict["official_docs"] = resources["official_docs"]
            except Exception as e:
                logger.error(f"Failed to enrich week {week_dict.get('week')} with resources: {e}")
                week_dict["youtube_resources"] = []
                week_dict["article_resources"] = []
                week_dict["github_resources"] = []
                week_dict["official_docs"] = []
                
    return weeks
