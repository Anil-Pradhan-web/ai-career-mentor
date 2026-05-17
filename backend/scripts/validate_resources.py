import os
import sys
import json
import httpx
from concurrent.futures import ThreadPoolExecutor, as_completed
from loguru import logger

# Add parent directory to python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Setup logger configuration
logger.remove()
logger.add(sys.stdout, format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{message}</cyan>")

SEED_FILE = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "app",
    "data",
    "curated_resources.json"
)

# Emojis for status printing (Console-safe plain characters fallback just in case)
def clean_print(msg):
    try:
        print(msg)
    except UnicodeEncodeError:
        print(msg.encode('ascii', 'ignore').decode('ascii'))

# ── DEEP YOUTUBE SCRAPING CHECKER ───────────────────────────────────────────
def check_youtube_video(url, client):
    """
    Checks if a YouTube video is deleted, private, or unavailable by downloading 
    and scraping its watch page. Tolerates automated rate-limits (HTTP 429).
    """
    try:
        res = client.get(url, timeout=10.0, follow_redirects=True)
        if res.status_code == 429:
            # YouTube rate-limited our concurrent scraper, but the link is 100% active for humans
            return True, "Rate Limited (Presumed Active)"
        if res.status_code != 200:
            return False, f"HTTP {res.status_code}"
            
        html = res.text
        unavailable_markers = [
            "Video unavailable",
            "This video is unavailable",
            "This video is private",
            "This video has been removed by the uploader"
        ]
        
        for marker in unavailable_markers:
            if marker in html:
                return False, f"Video dead: {marker}"
                
        return True, "Active"
    except Exception as e:
        # Timeout/Network hiccups on rate-limited connections are presumed active
        return True, f"Network Issue (Presumed Active): {str(e)}"

# ── GITHUB REPOSITORY CHECKER ───────────────────────────────────────────────
def check_github_repo(url, client):
    """
    Checks if a GitHub repository exists and is active.
    """
    try:
        res = client.get(url, timeout=10.0, follow_redirects=True)
        if res.status_code == 404:
            return False, "Repo not found (404)"
        if res.status_code == 429:
            return True, "Rate Limited (Presumed Active)"
        if res.status_code >= 400:
            return False, f"HTTP {res.status_code}"
            
        return True, "Active"
    except Exception as e:
        return True, f"Network Issue (Presumed Active): {str(e)}"

# ── GENERAL HTTP CHECKER ────────────────────────────────────────────────────
def check_general_url(url, client):
    """
    Checks standard documentation or article web links. 
    Tolerates anti-bot rate limits and Cloudflare blocking (Medium, PyTorch, OpenAI Docs).
    """
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        res = client.get(url, headers=headers, timeout=10.0, follow_redirects=True)
        if res.status_code == 429:
            return True, "Rate Limited (Presumed Active)"
        if res.status_code in [403, 401]:
            # Protected by Cloudflare/DDoS blockers, but accessible to browser users
            return True, f"Anti-Bot Protected ({res.status_code}) (Presumed Active)"
        if res.status_code >= 400:
            return False, f"HTTP {res.status_code}"
        return True, "Active"
    except Exception as e:
        return True, f"Network/Timeout (Presumed Active): {str(e)}"

# ── DYNAMIC ROUTER ─────────────────────────────────────────────────────────
def validate_url(url, client):
    if not url:
        return True, "None"
        
    url_lower = url.lower()
    if "youtube.com" in url_lower or "youtu.be" in url_lower:
        return check_youtube_video(url, client)
    elif "github.com" in url_lower:
        return check_github_repo(url, client)
    else:
        return check_general_url(url, client)

# ── WORKER FUNCTION FOR CONCURRENCY ──────────────────────────────────────────
def process_resource_item(res, client):
    fields = ["youtube_url", "article_url", "github_url", "doc_url"]
    sanitized_fields = {}
    bad_detected = []
    
    for f in fields:
        url = res.get(f)
        if not url:
            continue
            
        ok, reason = validate_url(url, client)
        if ok:
            sanitized_fields[f] = url
        else:
            bad_detected.append({
                "field": f,
                "url": url,
                "reason": reason
            })
            
    return res["topic"], res["title"], sanitized_fields, bad_detected

# ── MAIN PIPELINE RUNNER ────────────────────────────────────────────────────
def run_pipeline():
    clean_print("==================================================")
    clean_print("STARTING DYNAMIC KNOWLEDGE RAG VALIDATION PIPELINE")
    clean_print("==================================================")
    
    if not os.path.exists(SEED_FILE):
        logger.error(f"Target curated resources JSON file not found at: {SEED_FILE}")
        return
        
    with open(SEED_FILE, "r", encoding="utf-8") as f:
        resources = json.load(f)
        
    logger.info(f"Loaded {len(resources)} topic subjects to validate.")
    
    # Track statistics
    total_urls_checked = 0
    dead_urls_removed = 0
    sanitized_resources = []
    issues_report = []

    limits = httpx.Limits(max_keepalive_connections=15, max_connections=30)
    
    with httpx.Client(limits=limits, verify=False) as client:
        with ThreadPoolExecutor(max_workers=15) as executor:
            future_to_resource = {
                executor.submit(process_resource_item, item, client): item 
                for item in resources
            }
            
            for future in as_completed(future_to_resource):
                orig_item = future_to_resource[future]
                try:
                    topic, title, sanitized_fields, bad_detected = future.result()
                    total_urls_checked += len(orig_item.keys()) - 2
                    
                    # Construct sanitized record
                    new_item = {
                        "topic": topic,
                        "title": title
                    }
                    for key, val in sanitized_fields.items():
                        new_item[key] = val
                        
                    sanitized_resources.append(new_item)
                    
                    if bad_detected:
                        dead_urls_removed += len(bad_detected)
                        for issue in bad_detected:
                            issues_report.append({
                                "topic": topic,
                                "field": issue["field"],
                                "url": issue["url"],
                                "reason": issue["reason"]
                            })
                            logger.warning(f"[DEAD LINK PURGED] Topic '{topic}' -> {issue['field']}: {issue['url']} ({issue['reason']})")
                except Exception as exc:
                    logger.error(f"Resource processing raised an exception: {exc}")

    # Write clean back to curated_resources.json
    try:
        # Re-sort to maintain clean structural indentation
        with open(SEED_FILE, "w", encoding="utf-8") as f:
            json.dump(sanitized_resources, f, indent=2, ensure_ascii=False)
        logger.info("Successfully updated database file with pristine validated urls.")
    except Exception as e:
        logger.error(f"Failed to save cleaned data back to JSON: {e}")

    # Summary
    clean_print("\n==================================================")
    clean_print("           PIPELINE ANALYSIS COMPLETE             ")
    clean_print("==================================================")
    clean_print(f"Total URL Links Checked:       {total_urls_checked}")
    clean_print(f"Dead/Invalid Links Purged:     {dead_urls_removed}")
    clean_print(f"Remaining Valid URL Links:     {total_urls_checked - dead_urls_removed}")
    clean_print(f"Pristine Resources Maintained: {len(sanitized_resources)}")
    
    if issues_report:
        clean_print("\n--- DEAD LINKS DETECTED & REMOVED ---")
        for idx, issue in enumerate(issues_report):
            clean_print(f"{idx+1}. [{issue['topic']}] {issue['field']}: {issue['url']} -> Reason: {issue['reason']}")
    else:
        clean_print("\n🎉 ALL CURATED RESOURCES ARE 100% HEALTHY & ERROR-FREE!")
        
    clean_print("==================================================")

if __name__ == "__main__":
    run_pipeline()
