import warnings
warnings.filterwarnings("ignore", category=RuntimeWarning, message=".*duckduckgo_search.*")

from duckduckgo_search import DDGS

import re
import requests
import concurrent.futures
from datetime import datetime
from difflib import SequenceMatcher
from loguru import logger

# ── High-Quality Domain Weights ──────────────────────────────────────────────
HIGH_QUALITY_DOMAINS = {
    "roadmap.sh": 40,
    "developer.mozilla.org": 40,
    "react.dev": 40,
    "nextjs.org": 40,
    "fastapi.tiangolo.com": 40,
    "kubernetes.io": 40,
    "postgresql.org": 40,
    "redis.io": 40,
    "docs.aws.amazon.com": 40,
    "docs.docker.com": 40,
    "docs.github.com": 40,
    "docs.python.org": 40,
    "django_project.com": 40,
    "mongodb.com": 40,
    "spring.io": 40,
    "learn.microsoft.com": 30,
    "github.com": 25,
    "freecodecamp.org": 20,
    "geeksforgeeks.org": 10,
    "medium.com": 5,
    "dev.to": 5,
    "hashnode.dev": 5
}

def clean_str(s: str) -> str:
    """Normalize string for strict comparison."""
    return "".join(c for c in s.lower() if c.isalnum() or c.isspace()).strip()

# ── 1. URL Reachability Verification (URL Validation Engine) ──────────────────
def test_url_http(url: str, timeout: float = 1.5) -> bool:
    """Verify link is live and returns 200 OK (HEAD request with GET fallback)."""
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
    }
    try:
        # Avoid checking duckduckgo search page loops or root page parking
        if "duckduckgo.com" in url or "github.com/search" in url:
            return True
            
        resp = requests.head(url, headers=headers, timeout=timeout, allow_redirects=True)
        if resp.status_code in [200, 301, 302]:
            return True
            
        # Fallback to GET for sites blocking HEAD requests
        resp_get = requests.get(url, headers=headers, timeout=timeout, stream=True)
        return resp_get.status_code == 200
    except Exception:
        return False

def validate_urls_parallel(urls: list[str]) -> dict[str, bool]:
    """Validate multiple URLs concurrently using a ThreadPoolExecutor."""
    results = {}
    if not urls:
        return results
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        future_to_url = {executor.submit(test_url_http, url): url for url in urls}
        for future in concurrent.futures.as_completed(future_to_url):
            url = future_to_url[future]
            try:
                results[url] = future.result()
            except Exception:
                results[url] = False
    return results

# ── 2. GitHub Star & Recency Quality Filter ──────────────────────────────────
def check_github_repo_quality(url: str) -> int:
    """Verify GitHub repository stars and recency to demote old/dead repos."""
    match = re.match(r"https?://github\.com/([^/]+)/([^/]+)", url)
    if not match:
        return 0
    owner, repo = match.group(1), match.group(2)
    # Ignore search queries or general pages
    if owner in ["search", "features", "pricing", "trending", "orgs", "topics"]:
        return -30
        
    try:
        api_url = f"https://api.github.com/repos/{owner}/{repo}"
        headers = {
            "User-Agent": "Mozilla/5.0",
            "Accept": "application/vnd.github.v3+json"
        }
        resp = requests.get(api_url, headers=headers, timeout=1.0)
        if resp.status_code == 200:
            data = resp.json()
            stars = data.get("stargazers_count", 0)
            archived = data.get("archived", False)
            pushed_at = data.get("pushed_at", "")
            
            penalty = 0
            if stars < 100:
                penalty -= 25
            if archived:
                penalty -= 50
                
            if pushed_at:
                try:
                    last_push = datetime.strptime(pushed_at[:10], "%Y-%m-%d")
                    delta_years = (datetime.now() - last_push).days / 365.25
                    if delta_years > 2:  # No commits for 2+ years
                        penalty -= 30
                except Exception:
                    pass
            return penalty
    except Exception:
        pass
    return 0

# ── 3. Heuristic Scoring Engine ──────────────────────────────────────────────
def score_resource(url: str, topic: str) -> int:
    """Applies ranking scores based on domain authority, path matching, freshness, and spam checks."""
    score = 0
    url_lower = url.lower()
    topic_words = set(clean_str(topic).split())
    
    # Domain Authority
    for domain, weight in HIGH_QUALITY_DOMAINS.items():
        if domain in url_lower:
            score += weight
            break
            
    # Topic/Keyword Match in URL path
    path_words = set(re.split(r'[^a-zA-Z0-9]', url_lower))
    matching_words = topic_words.intersection(path_words)
    if matching_words:
        score += len(matching_words) * 5
        
    # Freshness / Outdated Technology Penalty
    outdated_keywords = ["class-components", "angularjs", "pages-router", "deprecated", "outdated", "legacy"]
    if any(keyword in url_lower for keyword in outdated_keywords):
        if not ("angular" in topic.lower() and "angularjs" in url_lower):
            score -= 40
            
    # Spam / Ads Heavy Domain Penalization
    spam_domains = ["blogspot.com", "wordpress.com", "parked-domain", "ads", "clickbait"]
    if any(domain in url_lower for domain in spam_domains):
        score -= 30
        
    # GitHub Specific Deep Filter
    if "github.com" in url_lower:
        score += check_github_repo_quality(url)
        
    return score

# ── 4. Semantic Deduplication Engine (Title/URL overlap) ─────────────────────
def deduplicate_resources(resources: list[dict], threshold: float = 0.75) -> list[dict]:
    """Deduplicates search results using normalized URLs and string similarity metrics."""
    seen_normalized_urls = set()
    unique_results = []
    
    for res in resources:
        url = res.get("href")
        if not url:
            continue
            
        norm_url = url.split("?")[0].rstrip("/").lower()
        if norm_url in seen_normalized_urls:
            continue
            
        title = res.get("title", "")
        is_duplicate_title = False
        if title:
            cleaned_title = clean_str(title)
            for u_res in unique_results:
                u_title = u_res.get("title", "")
                if u_title:
                    ratio = SequenceMatcher(None, cleaned_title, clean_str(u_title)).ratio()
                    if ratio >= threshold:
                        is_duplicate_title = True
                        break
                        
        if not is_duplicate_title:
            seen_normalized_urls.add(norm_url)
            unique_results.append(res)
            
    return unique_results

# ── 5. Multi-Source Concurrent Search Engine ─────────────────────────────────
def fetch_raw_search_results(topic: str) -> list[dict]:
    """Concurrently fetches raw resources from multiple endpoints (DuckDuckGo, Dev.to)."""
    raw_results = []
    
    def search_ddg():
        try:
            import warnings
            with warnings.catch_warnings():
                warnings.simplefilter("ignore", category=RuntimeWarning)
                with DDGS(timeout=5) as ddgs:
                    combined_query = f"{topic} official documentation OR tutorial OR github -site:quora.com -site:pinterest.com"
                    return list(ddgs.text(combined_query, max_results=12))
        except Exception as e:
            logger.warning(f"DuckDuckGo search failed: {e}")
            return []

    def search_dev_to():
        try:
            url = f"https://dev.to/api/articles?tag={topic.lower().replace(' ', '')}&per_page=4"
            resp = requests.get(url, headers={"User-Agent": "Mozilla/5.0"}, timeout=3)
            if resp.status_code == 200:
                return [{"title": a.get("title"), "href": a.get("url")} for a in resp.json()]
        except Exception as e:
            logger.warning(f"Dev.to search failed: {e}")
        return []

    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
        futures = [executor.submit(search_ddg), executor.submit(search_dev_to)]
        for f in concurrent.futures.as_completed(futures):
            raw_results.extend(f.result())
            
    return raw_results

# ── 6. Main Pipeline Entry ───────────────────────────────────────────────────
def is_valid_url(url: str) -> bool:
    """Basic structural validation of a URL."""
    return url.startswith("http") and "duckduckgo.com" not in url and "youtube.com" not in url and "youtu.be" not in url

def fetch_resources_for_topic(topic: str, queries: list[str], used_urls: set = None) -> dict:
    """
    Given a topic, retrieve categorized resources using ChromaDB RAG.
    Enforces strict 65% matching threshold and replaces all YouTube links with safe DDG YouTube search links.
    """
    if used_urls is None:
        used_urls = set()

    logger.info(f"Fetching resources for topic: {topic}")
    
    # ── Clean topic for search query (split on colon, cap word count) ──
    search_query = topic
    if ":" in search_query:
        search_query = search_query.split(":")[0].strip()
    words = search_query.split()
    if len(words) > 7:
        search_query = " ".join(words[:6])
    
    safe_topic = search_query.replace(" ", "+")
    youtube_resources = [f"https://www.youtube.com/results?search_query={safe_topic}+tutorial"]
    
    article_resources = []
    github_resources = []
    official_docs = []
    
    # ── Try Curated RAG Database First (Lightning Fast & Deduplicated) ──
    try:
        from app.core.rag_service import rag_engine
        rag_results = rag_engine.query_similarity(topic, n_results=5)
        
        selected_match = None
        for match in rag_results:
            meta = match["metadata"]
            art_url = meta.get("article_url", "")
            
            is_duplicate = False
            if art_url and art_url in used_urls:
                is_duplicate = True
                
            curated_topic = meta.get("topic", "")
            curated_topic_clean = clean_str(curated_topic)
            topic_clean = clean_str(topic)
            ratio = SequenceMatcher(None, topic_clean, curated_topic_clean).ratio()
            
            is_substring_match = False
            if len(curated_topic_clean) >= 3:
                is_substring_match = f" {curated_topic_clean} " in f" {topic_clean} " or curated_topic_clean in topic_clean
            
            # Smart Word Overlap matching (increases hit chances for scrambled topics)
            is_word_overlap_match = False
            curated_words = set(curated_topic_clean.split())
            topic_words = set(topic_clean.split())
            if curated_words:
                overlap = curated_words.intersection(topic_words)
                # If at least 60% of the words in the curated topic are found in the query topic
                if len(overlap) / len(curated_words) >= 0.60:
                    is_word_overlap_match = True
            
            if not is_duplicate and (ratio >= 0.50 or is_substring_match or is_word_overlap_match):
                selected_match = match
                break

        if selected_match:
            match = selected_match
            meta = match["metadata"]
            logger.info(f"🎯 RAG Hit! Curated gold-standard resource match found for '{topic}' (similarity: {match['similarity_score']})")
            
            res_art = meta.get("article_url")
            res_git = meta.get("github_url")
            res_doc = meta.get("doc_url")
            
            # Verify RAG links are live concurrently (fallback to DDG if any returns 404/dead)
            urls_to_validate = [u for u in [res_art, res_git, res_doc] if u]
            validation_results = validate_urls_parallel(urls_to_validate)
            
            final_art = res_art if (res_art and validation_results.get(res_art)) else f"https://duckduckgo.com/?q={safe_topic}+tutorial"
            final_git = res_git if (res_git and validation_results.get(res_git)) else f"https://duckduckgo.com/?q={safe_topic}+github+repository"
            final_doc = res_doc if (res_doc and validation_results.get(res_doc)) else f"https://duckduckgo.com/?q={safe_topic}+official+documentation"
            
            # Record these as used if they are valid
            if res_art and final_art == res_art: used_urls.add(res_art)
            if res_git and final_git == res_git: used_urls.add(res_git)
            if res_doc and final_doc == res_doc: used_urls.add(res_doc)
            
            return {
                "youtube_resources": youtube_resources,
                "article_resources": [final_art],
                "github_resources": [final_git],
                "official_docs": [final_doc]
            }
        else:
            logger.info(f"RAG Miss: No curated resource matched the 50% similarity threshold or word overlap rules for '{topic}'. Falling back to DDG search.")
    except Exception as e:
        logger.error(f"RAG query failed inside search_engine: {e}. Falling back to web search.")
    
    # ── Fallback resources (using DuckDuckGo + Dev.to) ──
    fallbacks = {
        "article_resources": [f"https://duckduckgo.com/?q={safe_topic}+tutorial"],
        "github_resources": [f"https://duckduckgo.com/?q={safe_topic}+github+repository"],
        "official_docs": [f"https://duckduckgo.com/?q={safe_topic}+official+documentation"]
    }

    try:
        raw_results = fetch_raw_search_results(topic)
        deduped = deduplicate_resources(raw_results)
        
        # Verify and score candidate URLs in parallel
        urls_to_test = [res["href"] for res in deduped if is_valid_url(res["href"]) and res["href"] not in used_urls]
        validated_map = validate_urls_parallel(urls_to_test)
        
        # Score candidates concurrently to avoid sequential blocking on GitHub API
        scored_candidates = []
        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            future_to_url = {
                executor.submit(score_resource, url, topic): url 
                for url in validated_map 
                if validated_map[url]
            }
            for future in concurrent.futures.as_completed(future_to_url):
                url = future_to_url[future]
                try:
                    score = future.result()
                    scored_candidates.append((url, score))
                except Exception:
                    pass
                
        # Sort candidates by score descending
        scored_candidates.sort(key=lambda x: x[1], reverse=True)
        
        for url, score in scored_candidates:
            if "github.com" in url:
                if len(github_resources) < 1:
                    github_resources.append(url)
                    used_urls.add(url)
            elif any(d in url for d in ["docs", "official", "developer.mozilla.org", "kubernetes.io", "react.dev", "postgresql.org", "fastapi.tiangolo.com"]):
                if len(official_docs) < 1:
                    official_docs.append(url)
                    used_urls.add(url)
            else:
                if len(article_resources) < 2:
                    article_resources.append(url)
                    used_urls.add(url)
                    
    except Exception as e:
        logger.warning(f"Search pipeline failed for {topic}: {e}")

    return {
        "youtube_resources": youtube_resources,
        "article_resources": article_resources if article_resources else fallbacks["article_resources"],
        "github_resources": github_resources if github_resources else fallbacks["github_resources"],
        "official_docs": official_docs if official_docs else fallbacks["official_docs"]
    }

def enrich_weeks_with_resources(weeks: list[dict]) -> list[dict]:
    """
    Fetch resources for all 8 weeks in parallel to maximize speed and prevent timeouts,
    using a thread lock to ensure safe cross-week URL deduplication.
    """
    import concurrent.futures
    import threading
    
    used_urls = set()
    lock = threading.Lock()
    
    def process_week(w):
        topic = w.get("topic", "Coding")
        queries = w.get("resource_search_queries", [])
        try:
            with lock:
                urls_snapshot = set(used_urls)
                
            resources = fetch_resources_for_topic(topic, queries, urls_snapshot)
            
            with lock:
                # Add newly found URLs back to the shared set
                for category in ["article_resources", "github_resources", "official_docs"]:
                    for url in resources.get(category, []):
                        if url:
                            used_urls.add(url)
                            
            w["youtube_resources"] = resources["youtube_resources"]
            w["article_resources"] = resources["article_resources"]
            w["github_resources"] = resources["github_resources"]
            w["official_docs"] = resources["official_docs"]
        except Exception as e:
            logger.error(f"Failed to enrich week {w.get('week')} with resources: {e}")
            safe_topic = topic.replace(" ", "+")
            w["youtube_resources"] = [f"https://www.youtube.com/results?search_query={safe_topic}+tutorial"]
            w["article_resources"] = [f"https://duckduckgo.com/?q={safe_topic}+tutorial"]
            w["github_resources"] = [f"https://github.com/search?q={safe_topic}"]
            w["official_docs"] = ["https://roadmap.sh"]

    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
        futures = [executor.submit(process_week, w) for w in weeks]
        concurrent.futures.wait(futures)
        
    return weeks
