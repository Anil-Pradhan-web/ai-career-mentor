import warnings
# Suppress the duckduckgo_search import warning before importing the package
warnings.filterwarnings("ignore", category=RuntimeWarning, module="duckduckgo_search")
warnings.filterwarnings("ignore", message=".*duckduckgo_search.*renamed.*")

import concurrent.futures
from difflib import SequenceMatcher
from duckduckgo_search import DDGS
from loguru import logger

HIGH_QUALITY_DOMAINS = [
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
    return url.startswith("http") and "duckduckgo.com" not in url and "youtube.com" not in url and "youtu.be" not in url

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

def clean_str(s: str) -> str:
    """Normalize string for strict comparison."""
    return "".join(c for c in s.lower() if c.isalnum() or c.isspace()).strip()

def fetch_resources_for_topic(topic: str, queries: list[str], used_urls: set = None) -> dict:
    """
    Given a topic, retrieve categorized resources using ChromaDB RAG.
    Enforces strict 65% matching threshold and replaces all YouTube links with safe DDG YouTube search links.
    """
    if used_urls is None:
        used_urls = set()

    logger.info(f"Fetching resources for topic: {topic}")
    
    # ── Always use safe DuckDuckGo YouTube Search link ──
    safe_topic = topic.replace(" ", "+")
    youtube_resources = [f"https://duckduckgo.com/?q=site%3Ayoutube.com+{safe_topic}+tutorial"]
    
    article_resources = []
    github_resources = []
    official_docs = []
    
    # ── Try Curated RAG Database First (Lightning Fast & Deduplicated) ──
    try:
        from app.core.rag_service import rag_engine
        # Query for top 5 matches to allow deduplication fallback
        rag_results = rag_engine.query_similarity(topic, n_results=5)
        
        selected_match = None
        for match in rag_results:
            meta = match["metadata"]
            art_url = meta.get("article_url", "")
            
            # Check if these major URLs are already used in previous weeks
            is_duplicate = False
            if art_url and art_url in used_urls:
                is_duplicate = True
                
            # Calculate match ratio with the curated topic name (Strict 65% match)
            curated_topic = meta.get("topic", "")
            ratio = SequenceMatcher(None, clean_str(topic), clean_str(curated_topic)).ratio()
            
            if not is_duplicate and ratio >= 0.65:
                selected_match = match
                break

        if selected_match:
            match = selected_match
            meta = match["metadata"]
            logger.info(f"🎯 RAG Hit! Curated gold-standard resource match found for '{topic}' (similarity: {match['similarity_score']})")
            
            res_art = meta.get("article_url")
            res_git = meta.get("github_url")
            res_doc = meta.get("doc_url")
            
            # Record these as used
            if res_art: used_urls.add(res_art)
            if res_git: used_urls.add(res_git)
            if res_doc: used_urls.add(res_doc)
            
            return {
                "youtube_resources": youtube_resources, # Direct YouTube URLs are removed/replaced
                "article_resources": [res_art] if res_art else [f"https://duckduckgo.com/?q={safe_topic}+tutorial"],
                "github_resources": [res_git] if res_git else [f"https://github.com/search?q={safe_topic}"],
                "official_docs": [res_doc] if res_doc else ["https://roadmap.sh"]
            }
        else:
            logger.info(f"RAG Miss: No curated resource matched the strict 65% match threshold for '{topic}'. Falling back to DDG search.")
    except Exception as e:
        logger.error(f"RAG query failed inside search_engine: {e}. Falling back to web search.")
    
    # ── Fallback resources (using DuckDuckGo) ──
    fallbacks = {
        "article_resources": [f"https://duckduckgo.com/?q={safe_topic}+tutorial"],
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
                
                # Deduplicate fallback web search results too!
                if url in used_urls:
                    continue
                
                if "github.com" in url:
                    if len(github_resources) < 1: 
                      github_resources.append(url)
                      used_urls.add(url)
                elif any(d in url for d in ["docs", "official", "developer.mozilla", "kubernetes.io", "react.dev", "postgresql.org", "fastapi.tiangolo"]):
                    if len(official_docs) < 1: 
                      official_docs.append(url)
                      used_urls.add(url)
                else:
                    if len(article_resources) < 2: 
                      article_resources.append(url)
                      used_urls.add(url)
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
    Sequentially fetch resources for all 8 weeks to allow robust cross-week URL deduplication.
    Sequential RAG is sub-millisecond, so this is ultra-fast and avoids duplicate urls.
    """
    used_urls = set()
    
    for w in weeks:
        topic = w.get("topic", "Coding")
        queries = w.get("resource_search_queries", [])
        try:
            resources = fetch_resources_for_topic(topic, queries, used_urls)
            w["youtube_resources"] = resources["youtube_resources"]
            w["article_resources"] = resources["article_resources"]
            w["github_resources"] = resources["github_resources"]
            w["official_docs"] = resources["official_docs"]
        except Exception as e:
            logger.error(f"Failed to enrich week {w.get('week')} with resources: {e}")
            safe_topic = topic.replace(" ", "+")
            w["youtube_resources"] = [f"https://duckduckgo.com/?q=site%3Ayoutube.com+{safe_topic}+tutorial"]
            w["article_resources"] = [f"https://duckduckgo.com/?q={safe_topic}+tutorial"]
            w["github_resources"] = [f"https://github.com/search?q={safe_topic}"]
            w["official_docs"] = ["https://roadmap.sh"]
    return weeks
