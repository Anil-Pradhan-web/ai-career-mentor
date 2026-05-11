import requests
import concurrent.futures
from ddgs import DDGS
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
    """Basic structural validation of a URL."""
    return url.startswith("http") and "duckduckgo.com" not in url

def rank_and_validate(results: list[dict], max_results: int = 2) -> list[str]:
    valid_urls = []
    
    # Sort by quality domain presence
    def score_result(res):
        score = 0
        href = (res.get("href") or res.get("content", "")).lower()
        if any(domain in href for domain in HIGH_QUALITY_DOMAINS):
            score += 10
        return score
        
    results = sorted(results, key=score_result, reverse=True)
    
    for res in results:
        url = res.get("href") or res.get("content")
        if not url:
            continue
        if is_valid_url(url):
            valid_urls.append(url)
            if len(valid_urls) >= max_results:
                break
                
    return valid_urls

def fetch_resources_for_topic(topic: str, queries: list[str]) -> dict:
    """
    Given a topic, retrieve categorized resources using DuckDuckGo.
    Includes fallbacks if search fails.
    """
    logger.info(f"Fetching resources for topic: {topic}")
    
    # ── Always use YouTube Search link for reliability ──
    safe_topic = topic.replace(" ", "+")
    youtube_resources = [f"https://www.youtube.com/results?search_query={safe_topic}+tutorial"]
    
    article_resources = []
    github_resources = []
    official_docs = []
    
    # ── Fallback resources (in case search is blocked) ──
    fallbacks = {
        "article_resources": [f"https://google.com/search?q={safe_topic}+tutorial"],
        "github_resources": [f"https://github.com/search?q={safe_topic}"],
        "official_docs": ["https://roadmap.sh"]
    }

    try:
        with DDGS(timeout=8) as ddgs:
            # One broad query (skip searching for youtube to save time)
            combined_query = f"{topic} article github documentation tutorial"
            results = list(ddgs.text(combined_query, max_results=8))
            
            for res in results:
                url = res.get("href", "").lower()
                if not url or not url.startswith("http") or "youtube.com" in url or "youtu.be" in url:
                    continue
                
                if "github.com" in url:
                    if len(github_resources) < 1: github_resources.append(url)
                elif any(d in url for d in ["docs", "official", "developer.mozilla", "kubernetes.io", "react.dev", "postgresql.org", "fastapi.tiangolo"]):
                    if len(official_docs) < 1: official_docs.append(url)
                else:
                    if len(article_resources) < 2: article_resources.append(url)
    except Exception as e:
        logger.warning(f"DDG Search failed for {topic}: {e}")

    # Use fallbacks if lists are empty
    return {
        "youtube_resources": youtube_resources,
        "article_resources": article_resources if article_resources else fallbacks["article_resources"],
        "github_resources": github_resources if github_resources else fallbacks["github_resources"],
        "official_docs": official_docs if official_docs else fallbacks["official_docs"]
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
                topic = week_dict.get("topic", "Coding")
                safe_topic = topic.replace(" ", "+")
                week_dict["youtube_resources"] = [f"https://www.youtube.com/results?search_query={safe_topic}"]
                week_dict["article_resources"] = [f"https://google.com/search?q={safe_topic}+tutorial"]
                week_dict["github_resources"] = [f"https://github.com/search?q={safe_topic}"]
                week_dict["official_docs"] = ["https://roadmap.sh"]
                
    return weeks
