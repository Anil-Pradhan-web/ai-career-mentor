"""Validate curated roadmap resource metadata and URLs.

Usage:
    python backend/scripts/validate_resources.py
    python backend/scripts/validate_resources.py --skip-network

The script performs two layers of checks:
  1. Local JSON/schema checks for curated_resources.json.
  2. Optional network checks for every URL using HEAD with GET fallback.

Exit codes:
  0 = all required checks passed
  1 = schema/URL-format errors or network URL failures were found
"""
from __future__ import annotations

import argparse
import json
import ssl
import sys
from collections import Counter, defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
from urllib.request import Request, urlopen

RESOURCE_FILE = Path(__file__).resolve().parents[1] / "app" / "data" / "curated_resources.json"
REQUIRED_FIELDS = ("topic", "title", "article_url", "github_url", "doc_url")
URL_FIELDS = ("article_url", "github_url", "doc_url")
DEFAULT_TIMEOUT_SECONDS = 8


@dataclass(frozen=True)
class UrlCheckResult:
    index: int
    topic: str
    field: str
    url: str
    ok: bool
    status: int | None
    reason: str


def load_resources(path: Path) -> list[dict]:
    with path.open("r", encoding="utf-8") as file:
        data = json.load(file)
    if not isinstance(data, list):
        raise ValueError("curated_resources.json must contain a top-level JSON array.")
    return data


def is_valid_url(value: str) -> bool:
    parsed = urlparse(value)
    return parsed.scheme in {"http", "https"} and bool(parsed.netloc)


def validate_schema(resources: list[dict]) -> list[str]:
    errors: list[str] = []
    topic_counts = Counter(str(item.get("topic", "")).strip().lower() for item in resources)

    for index, item in enumerate(resources, start=1):
        if not isinstance(item, dict):
            errors.append(f"#{index}: item must be an object, got {type(item).__name__}")
            continue

        for field in REQUIRED_FIELDS:
            value = item.get(field)
            if not isinstance(value, str) or not value.strip():
                errors.append(f"#{index} ({item.get('topic', 'unknown')}): missing/empty field '{field}'")

        for field in URL_FIELDS:
            value = item.get(field)
            if isinstance(value, str) and value.strip() and not is_valid_url(value.strip()):
                errors.append(f"#{index} ({item.get('topic', 'unknown')}): invalid URL in '{field}' -> {value}")

    for topic, count in topic_counts.items():
        if topic and count > 1:
            errors.append(f"duplicate topic '{topic}' appears {count} times")

    return errors


def iter_urls(resources: list[dict]) -> Iterable[tuple[int, str, str, str]]:
    for index, item in enumerate(resources, start=1):
        topic = str(item.get("topic", "unknown"))
        for field in URL_FIELDS:
            url = str(item.get(field, "")).strip()
            if url:
                yield index, topic, field, url


def request_url(url: str, method: str, timeout: int) -> tuple[int | None, str]:
    headers = {
        "User-Agent": "Mozilla/5.0 (compatible; AI-Career-Mentor-Resource-Validator/1.0)",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    }
    request = Request(url, method=method, headers=headers)
    context = ssl.create_default_context()
    with urlopen(request, timeout=timeout, context=context) as response:
        return response.status, response.reason


def check_url(index: int, topic: str, field: str, url: str, timeout: int) -> UrlCheckResult:
    if not is_valid_url(url):
        return UrlCheckResult(index, topic, field, url, False, None, "invalid URL format")

    try:
        status, reason = request_url(url, "HEAD", timeout)
    except HTTPError as error:
        if error.code in {403, 405, 429}:  # Retry restricted/method-limited URLs with GET.
            try:
                status, reason = request_url(url, "GET", timeout)
            except HTTPError as get_error:
                status, reason = get_error.code, str(get_error.reason)
            except URLError as get_error:
                return UrlCheckResult(index, topic, field, url, False, None, str(get_error.reason))
            except Exception as get_error:  # noqa: BLE001 - CLI diagnostics should include unexpected network errors.
                return UrlCheckResult(index, topic, field, url, False, None, str(get_error))
        else:
            status, reason = error.code, str(error.reason)
    except URLError as error:
        return UrlCheckResult(index, topic, field, url, False, None, str(error.reason))
    except Exception as error:  # noqa: BLE001 - CLI diagnostics should include unexpected network errors.
        return UrlCheckResult(index, topic, field, url, False, None, str(error))

    ok = status is not None and 200 <= status < 400
    return UrlCheckResult(index, topic, field, url, ok, status, reason)


def validate_urls(resources: list[dict], timeout: int) -> list[UrlCheckResult]:
    return [check_url(index, topic, field, url, timeout) for index, topic, field, url in iter_urls(resources)]


def print_summary(resources: list[dict], schema_errors: list[str], url_results: list[UrlCheckResult]) -> None:
    print(f"Resource file: {RESOURCE_FILE}")
    print(f"Total resources: {len(resources)}")
    print(f"Expected fields: {', '.join(REQUIRED_FIELDS)}")

    coverage = defaultdict(int)
    for item in resources:
        for field in URL_FIELDS:
            if item.get(field):
                coverage[field] += 1
    print("URL coverage: " + ", ".join(f"{field}={coverage[field]}" for field in URL_FIELDS))

    if schema_errors:
        print("\nSchema / local validation errors:")
        for error in schema_errors:
            print(f"  - {error}")
    else:
        print("\nSchema / local validation: OK")

    if url_results:
        failures = [result for result in url_results if not result.ok]
        print(f"Network URL validation: {len(url_results) - len(failures)}/{len(url_results)} passed")
        if failures:
            print("\nURL failures:")
            for result in failures:
                status = result.status if result.status is not None else "n/a"
                print(
                    f"  - #{result.index} {result.topic} [{result.field}] "
                    f"status={status} reason={result.reason} url={result.url}"
                )


def main() -> int:
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except AttributeError:
        pass  # Fallback for Python versions or environments where reconfigure is not available
        
    parser = argparse.ArgumentParser(description="Validate curated roadmap resources and URLs.")
    parser.add_argument("--file", type=Path, default=RESOURCE_FILE, help="Path to curated_resources.json")
    parser.add_argument("--skip-network", action="store_true", help="Only run JSON/schema/URL-format checks")
    parser.add_argument("--timeout", type=int, default=DEFAULT_TIMEOUT_SECONDS, help="Per-request timeout in seconds")
    args = parser.parse_args()

    resources = load_resources(args.file)
    schema_errors = validate_schema(resources)
    url_results: list[UrlCheckResult] = [] if args.skip_network else validate_urls(resources, args.timeout)
    print_summary(resources, schema_errors, url_results)

    has_url_failures = any(not result.ok for result in url_results)
    return 1 if schema_errors or has_url_failures else 0


if __name__ == "__main__":
    sys.exit(main())
