#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
clear_cache.py -- AI Career Mentor production cache cleaner.

Usage:
    # Clear all AI cache keys (default)
    python clear_cache.py

    # Clear only a specific feature
    python clear_cache.py --feature market
    python clear_cache.py --feature resume
    python clear_cache.py --feature roadmap
    python clear_cache.py --feature linkedin
    python clear_cache.py --feature full_analysis

    # List all cache keys without deleting
    python clear_cache.py --list

    # Also clear rate-limit counters (usage:*)
    python clear_cache.py --all

Reads REDIS_URL from backend/.env automatically.
"""
import os
import sys
import argparse
from pathlib import Path

# -- Load .env ----------------------------------------------------------------
env_path = Path(__file__).parent / "backend" / ".env"
if env_path.exists():
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, _, v = line.partition("=")
                os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))
    print(f"[OK] Loaded env from {env_path}")
else:
    print(f"[WARN] No .env found at {env_path} -- using system env vars")

# -- Redis connect -------------------------------------------------------------
REDIS_URL = os.getenv("REDIS_URL", "")
if not REDIS_URL:
    print("[ERROR] REDIS_URL not set. Cannot connect to Upstash Redis.")
    print("        Set it in backend/.env:  REDIS_URL=rediss://...")
    sys.exit(1)

try:
    import redis
    r = redis.from_url(REDIS_URL, decode_responses=True, socket_connect_timeout=5)
    r.ping()
    print(f"[OK] Connected to Redis: {REDIS_URL[:50]}...")
except Exception as e:
    print(f"[ERROR] Redis connection failed: {e}")
    sys.exit(1)

# -- Feature -> cache key prefix mapping --------------------------------------
FEATURE_PREFIXES = {
    "resume":        "ai_cache:resume",
    "market":        "ai_cache:market",
    "roadmap":       "ai_cache:roadmap",
    "linkedin":      "ai_cache:linkedin",
    "full_analysis": "ai_cache:full_analysis",
}


def scan_keys(pattern: str) -> list:
    return r.keys(pattern)


def delete_keys(keys: list) -> int:
    if not keys:
        return 0
    return r.delete(*keys)


def main():
    parser = argparse.ArgumentParser(description="Clear AI Career Mentor Redis cache")
    parser.add_argument(
        "--feature",
        choices=list(FEATURE_PREFIXES.keys()),
        help="Clear only a specific feature's cache",
    )
    parser.add_argument(
        "--list",
        action="store_true",
        help="List all cache keys without deleting",
    )
    parser.add_argument(
        "--all",
        action="store_true",
        help="Also clear rate-limit counters (usage:*)",
    )
    args = parser.parse_args()
    print()

    # -- LIST MODE ------------------------------------------------------------
    if args.list:
        cache_keys = scan_keys("ai_cache:*")
        usage_keys = scan_keys("usage:*")
        all_keys = sorted(cache_keys + usage_keys)
        if not all_keys:
            print("[INFO] No cache keys found in Redis.")
        else:
            print(f"[INFO] Found {len(all_keys)} keys:\n")
            for k in all_keys:
                ttl = r.ttl(k)
                ttl_str = f"TTL {ttl}s" if ttl > 0 else "no TTL"
                print(f"  {k}   ({ttl_str})")
        return

    # -- FEATURE-SPECIFIC DELETE ----------------------------------------------
    if args.feature:
        prefix = FEATURE_PREFIXES[args.feature]
        keys = scan_keys(f"{prefix}:*")
        deleted = delete_keys(keys)
        print(f"[DEL] {prefix}:*  -> deleted {deleted} key(s)")
        print(f"\n[DONE] Total deleted: {deleted}")
        return

    # -- DEFAULT: clear all ai_cache:* ----------------------------------------
    patterns = ["ai_cache:*"]
    if args.all:
        patterns.append("usage:*")

    total = 0
    for pat in patterns:
        keys = scan_keys(pat)
        deleted = delete_keys(keys)
        total += deleted
        print(f"[DEL] {pat}  -> deleted {deleted} key(s)")

    print(f"\n[DONE] Total deleted: {total}")


if __name__ == "__main__":
    main()
