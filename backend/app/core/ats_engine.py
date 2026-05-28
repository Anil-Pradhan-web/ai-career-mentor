import re

# Master database of typical tech skills for extraction
KNOWN_SKILLS = [
    "Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "Go", "Rust", "PHP", "Ruby", "Swift", "Kotlin",
    "React", "Angular", "Vue.js", "Node.js", "Express", "Django", "Flask", "FastAPI", "Spring Boot", "ASP.NET",
    "SQL", "MySQL", "PostgreSQL", "MongoDB", "Redis", "Cassandra", "Elasticsearch", "Neo4j",
    "AWS", "GCP", "Azure", "Docker", "Kubernetes", "Terraform", "Jenkins", "Git", "GitHub Actions", "CI/CD",
    "Machine Learning", "Deep Learning", "NLP", "Computer Vision", "TensorFlow", "PyTorch", "Scikit-Learn",
    "Pandas", "NumPy", "Apache Spark", "Hadoop", "Kafka", "Data Analysis", "System Design", "Microservices",
    "REST API", "GraphQL", "Agile", "Scrum", "Linux", "Bash",
]

# Section headers that indicate professional experience context
# Year-only ranges are only trusted when found near these keywords
_EXPERIENCE_CONTEXT_KEYWORDS = [
    "experience", "employment", "work history", "career", "position", "role",
    "intern", "internship", "job", "company", "organization", "corp", "inc", "ltd",
    "engineer", "developer", "analyst", "manager", "lead", "architect",
    "present", "current", "full-time", "part-time", "contract",
]

# Action verbs — expanded from 12 → 30 for better coverage
ACTION_VERBS = [
    # Original 12
    "developed", "engineered", "built", "designed", "led", "managed",
    "created", "implemented", "optimized", "increased", "decreased", "improved",
    # Added
    "architected", "spearheaded", "launched", "scaled", "deployed", "automated",
    "delivered", "reduced", "accelerated", "streamlined", "refactored", "migrated",
    "integrated", "collaborated", "mentored", "established", "modernized", "transformed",
    "resolved", "pioneered",
]


def extract_skills(text: str) -> list:
    """Deterministically extracts known tech skills from resume text."""
    found_skills = set()
    text_lower = text.lower()
    for skill in KNOWN_SKILLS:
        pattern = r"\b" + re.escape(skill.lower()) + r"\b"
        if re.search(pattern, text_lower):
            found_skills.add(skill)
    return list(found_skills)


def estimate_experience(text: str) -> float:
    """
    Estimates total years of professional experience by parsing date ranges.

    Fixes vs original:
    - Year-only ranges (2018-2022) are only accepted when context nearby
      suggests employment (not project descriptions, education years, etc.)
    - Negative durations are guarded (start > end → skip)
    - All intervals merged to avoid double-counting overlapping roles
    """
    import datetime

    now = datetime.datetime.now()
    current_year = now.year
    current_month = now.month

    intervals = []

    month_map = {
        "jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6,
        "jul": 7, "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12,
    }
    months_regex = r"(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*"

    # ── 1. Month-Year ranges (most reliable, no context check needed) ─────────
    month_year_pattern = (
        rf"\b({months_regex})\s*((?:19|20)\d{{2}})\s*(?:-|to|–)\s*"
        rf"([pP]resent|[cC]urrent|[nN]ow|{months_regex}\s*(?:19|20)\d{{2}})\b"
    )
    for match in re.finditer(month_year_pattern, text, re.IGNORECASE):
        start_m_str, start_y_str, end_str = match.groups()
        try:
            start_year = int(start_y_str)
            if start_year > current_year:
                continue
            start_month = month_map.get(start_m_str[:3].lower(), 1)

            if any(kw in end_str.lower() for kw in ["present", "current", "now"]):
                end_year, end_month = current_year, current_month
            else:
                end_m_match = re.search(rf"({months_regex})", end_str, re.IGNORECASE)
                end_y_match = re.search(r"((?:19|20)\d{2})", end_str)
                if end_m_match and end_y_match:
                    end_year = int(end_y_match.group(1))
                    end_month = month_map.get(end_m_match.group(1)[:3].lower(), 1)
                else:
                    continue

            start_idx = start_year * 12 + start_month
            end_idx = end_year * 12 + end_month
            if start_idx < end_idx:  # strictly less — guards zero/negative durations
                intervals.append((start_idx, end_idx))
        except Exception:
            continue

    # ── 2. Numeric MM/YYYY ranges ─────────────────────────────────────────────
    numeric_month_year_pattern = (
        r"\b(0?[1-9]|1[0-2])\s*[\/-]\s*((?:19|20)\d{2})\s*(?:-|to|–)\s*"
        r"([pP]resent|[cC]urrent|[nN]ow|(?:0?[1-9]|1[0-2])\s*[\/-]\s*(?:19|20)\d{2})\b"
    )
    for match in re.finditer(numeric_month_year_pattern, text, re.IGNORECASE):
        start_m_str, start_y_str, end_str = match.groups()
        try:
            start_year = int(start_y_str)
            if start_year > current_year:
                continue
            start_month = int(start_m_str)

            if any(kw in end_str.lower() for kw in ["present", "current", "now"]):
                end_year, end_month = current_year, current_month
            else:
                end_parts = re.findall(r"\d+", end_str)
                if len(end_parts) == 2:
                    end_month, end_year = int(end_parts[0]), int(end_parts[1])
                else:
                    continue

            start_idx = start_year * 12 + start_month
            end_idx = end_year * 12 + end_month
            if start_idx < end_idx:
                intervals.append((start_idx, end_idx))
        except Exception:
            continue

    # ── 3. Year-only ranges — ONLY accepted near employment context keywords ──
    # Fix: prevents project/education years from inflating experience
    year_only_pattern = r"\b((?:19|20)\d{2})\s*(?:-|to|–)\s*([pP]resent|[cC]urrent|[nN]ow|(?:19|20)\d{2})\b"
    for match in re.finditer(year_only_pattern, text, re.IGNORECASE):
        s_y, e_y = match.groups()
        try:
            start_year = int(s_y)
            if start_year > current_year:
                continue

            # Context check: look 200 chars around match for employment signals
            ctx_start = max(0, match.start() - 200)
            ctx_end = min(len(text), match.end() + 200)
            surrounding = text[ctx_start:ctx_end].lower()
            has_employment_context = any(kw in surrounding for kw in _EXPERIENCE_CONTEXT_KEYWORDS)
            if not has_employment_context:
                continue

            if any(kw in e_y.lower() for kw in ["present", "current", "now"]):
                end_year, end_month = current_year, current_month
            else:
                end_year = int(e_y)
                end_month = 12

            start_idx = start_year * 12 + 1
            end_idx = end_year * 12 + end_month
            if start_idx < end_idx:
                intervals.append((start_idx, end_idx))
        except Exception:
            continue

    if not intervals:
        return 0.0

    # ── Merge overlapping intervals ───────────────────────────────────────────
    intervals.sort(key=lambda x: x[0])
    merged = [intervals[0]]
    for curr_start, curr_end in intervals[1:]:
        prev_start, prev_end = merged[-1]
        if curr_start <= prev_end + 1:
            merged[-1] = (prev_start, max(prev_end, curr_end))
        else:
            merged.append((curr_start, curr_end))

    total_months = sum(max(0, end - start) for start, end in merged)
    return min(round(total_months / 12, 1), 25.0)


def calculate_ats_score(text: str, found_skills: list) -> dict:
    """
    Deterministically calculates an ATS score.

    Fixes vs original:
    - Achievement regex now requires 2+ digit numbers to avoid version noise
      (Python 3, Node 18, v2 won't match)
    - action_verbs expanded from 12 → 30
    - Dead `modern_baseline` variable removed
    """
    text_length = len(text)

    # 1. Keyword Score (Max 35)
    keyword_score = min(len(found_skills) * 2, 35)

    # 2. Achievement / Metrics Score (Max 30)
    # Require at least 2-digit numbers to avoid version number noise (Node 18, Python 3)
    metrics_count = len(re.findall(r"\b\d{2,}(?:%|x)\b", text.lower()))
    metrics_count += len(re.findall(r"\b\d{2,}[km]\b", text.lower()))
    metrics_count += len(re.findall(r"\$\d{2,}", text))
    achievement_score = min(metrics_count * 4, 30)

    # 3. Action Verbs Score (Max 20) — expanded verb list
    verbs_found = sum(1 for verb in ACTION_VERBS if re.search(r"\b" + verb + r"\b", text.lower()))
    action_verbs_score = min(verbs_found * 2, 20)

    # 4. Length & Formatting Score (Max 15)
    if 1500 <= text_length <= 5000:
        length_score = 15
    elif text_length > 5000:
        length_score = 10
    else:
        length_score = 5

    total_score = keyword_score + achievement_score + action_verbs_score + length_score

    return {
        "total_score": total_score,
        "breakdown": {
            "keywords": keyword_score,
            "achievements": achievement_score,
            "action_verbs": action_verbs_score,
            "formatting_and_length": length_score,
        },
    }


def analyze_resume_deterministically(text: str) -> dict:
    """
    Runs the full deterministic ATS pipeline.
    Returns baseline hints for the LLM agent — NOT final values.
    """
    skills = extract_skills(text)
    experience = estimate_experience(text)
    score_data = calculate_ats_score(text, skills)

    # Gap analysis — check against industry baseline skills
    gaps = []
    if not any(s in skills for s in ["AWS", "GCP", "Azure", "Docker", "Kubernetes"]):
        gaps.append("Missing Cloud/DevOps fundamentals (AWS, Docker, Kubernetes)")
    if not any(s in skills for s in ["CI/CD", "Jenkins", "GitHub Actions"]):
        gaps.append("Lack of Continuous Integration/Deployment (CI/CD) experience")
    if not any(s in skills for s in ["SQL", "PostgreSQL", "MySQL", "MongoDB"]):
        gaps.append("Missing core database technologies (SQL, NoSQL)")

    if not gaps:
        gaps = ["Strong profile across modern stack, consider adding system architecture experience"]

    # Basic Strengths Detection
    strengths = []
    if score_data["breakdown"]["achievements"] > 15:
        strengths.append("Strong use of quantified metrics and achievements")
    if len(skills) > 10:
        strengths.append(f"Broad technical stack covering {len(skills)} recognizable technologies")
    if experience > 3.0:
        strengths.append(f"Solid professional experience ({experience} years)")

    if len(strengths) < 3:
        strengths.append("Clear and readable resume formatting")
        strengths.append("Demonstrates foundational technical knowledge")

    return {
        # Pass full skills list — LLM will use as hints and may extend/correct
        "technical_skills": skills,
        "soft_skills": [],  # LLM fills this
        "years_of_experience": experience,
        "experience_breakdown": [],  # LLM fills this from full text
        "ats_score": score_data["total_score"],
        "ats_score_breakdown": score_data["breakdown"],
        "top_strengths": strengths[:3],
        "skill_gaps": gaps[:5],
    }