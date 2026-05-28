# backend/app/core/ats_engine.py

"""
Production-Grade Deterministic ATS Engine

Features:
- Fast deterministic ATS scoring
- Experience extraction with overlap merging
- Skill alias support
- OCR garbage protection
- Resume spam prevention
- Metric detection
- Action verb scoring
- Cloud/DevOps gap analysis
- Production-safe parsing
"""

import re
from collections import Counter
from datetime import datetime

# ─────────────────────────────────────────────────────────────────────────────
# Limits
# ─────────────────────────────────────────────────────────────────────────────

MAX_TEXT_LENGTH = 15000

# ─────────────────────────────────────────────────────────────────────────────
# Skill Database
# ─────────────────────────────────────────────────────────────────────────────

SKILL_ALIASES = {
    "python": "Python",
    "java": "Java",
    "javascript": "JavaScript",
    "typescript": "TypeScript",
    "node": "Node.js",
    "nodejs": "Node.js",
    "node.js": "Node.js",
    "react": "React",
    "reactjs": "React",
    "react.js": "React",
    "next": "Next.js",
    "nextjs": "Next.js",
    "next.js": "Next.js",
    "vue": "Vue.js",
    "vuejs": "Vue.js",
    "vue.js": "Vue.js",
    "angular": "Angular",
    "mongodb": "MongoDB",
    "postgres": "PostgreSQL",
    "postgresql": "PostgreSQL",
    "mysql": "MySQL",
    "redis": "Redis",
    "docker": "Docker",
    "kubernetes": "Kubernetes",
    "k8s": "Kubernetes",
    "aws": "AWS",
    "azure": "Azure",
    "gcp": "GCP",
    "fastapi": "FastAPI",
    "django": "Django",
    "flask": "Flask",
    "spring": "Spring Boot",
    "tensorflow": "TensorFlow",
    "pytorch": "PyTorch",
    "machine learning": "Machine Learning",
    "deep learning": "Deep Learning",
    "nlp": "NLP",
    "sql": "SQL",
    "rest api": "REST API",
    "graphql": "GraphQL",
    "ci/cd": "CI/CD",
    "github actions": "GitHub Actions",
    "jenkins": "Jenkins",
    "linux": "Linux",
    "git": "Git",
    "system design": "System Design",
}

# ─────────────────────────────────────────────────────────────────────────────
# Action Verbs
# ─────────────────────────────────────────────────────────────────────────────

ACTION_VERBS = {
    "developed",
    "engineered",
    "built",
    "designed",
    "led",
    "managed",
    "created",
    "implemented",
    "optimized",
    "improved",
    "architected",
    "spearheaded",
    "launched",
    "scaled",
    "deployed",
    "automated",
    "delivered",
    "reduced",
    "accelerated",
    "streamlined",
    "refactored",
    "migrated",
    "integrated",
    "collaborated",
    "mentored",
    "modernized",
    "transformed",
    "resolved",
    "pioneered",
}

# ─────────────────────────────────────────────────────────────────────────────
# Experience Keywords
# ─────────────────────────────────────────────────────────────────────────────

EXPERIENCE_CONTEXT = {
    "experience",
    "employment",
    "work",
    "career",
    "intern",
    "internship",
    "engineer",
    "developer",
    "analyst",
    "manager",
    "lead",
    "architect",
    "company",
    "organization",
    "full-time",
    "part-time",
}

# ─────────────────────────────────────────────────────────────────────────────
# Text Cleaning
# ─────────────────────────────────────────────────────────────────────────────

def clean_text(text: str) -> str:

    if not text:
        return ""

    text = text[:MAX_TEXT_LENGTH]

    text = text.replace("\x00", " ")
    text = text.replace("\uf0b7", " ")

    text = " ".join(text.split())

    return text.strip()

# ─────────────────────────────────────────────────────────────────────────────
# OCR Garbage Detection
# ─────────────────────────────────────────────────────────────────────────────

def is_garbage_text(text: str) -> bool:

    if not text:
        return True

    weird_chars = sum(
        1
        for c in text
        if not c.isprintable()
    )

    ratio = weird_chars / max(len(text), 1)

    return ratio > 0.2

# ─────────────────────────────────────────────────────────────────────────────
# Skill Extraction
# ─────────────────────────────────────────────────────────────────────────────

def extract_skills(text: str) -> list:

    text_lower = text.lower()

    found = []

    for alias, canonical in SKILL_ALIASES.items():

        if alias in text_lower:
            found.append(canonical)

    return sorted(set(found))

# ─────────────────────────────────────────────────────────────────────────────
# Experience Estimation
# ─────────────────────────────────────────────────────────────────────────────

def estimate_experience(text: str) -> float:

    now = datetime.now()

    current_year = now.year
    current_month = now.month

    intervals = []

    months = {
        "jan": 1,
        "feb": 2,
        "mar": 3,
        "apr": 4,
        "may": 5,
        "jun": 6,
        "jul": 7,
        "aug": 8,
        "sep": 9,
        "oct": 10,
        "nov": 11,
        "dec": 12,
    }

    month_pattern = (
        r"(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)"
    )

    pattern = (
        rf"{month_pattern}\s+(\d{{4}})"
        rf"\s*(?:-|to|–)\s*"
        rf"(Present|Current|Now|{month_pattern}\s+\d{{4}})"
    )

    matches = re.finditer(
        pattern,
        text,
        re.IGNORECASE,
    )

    for match in matches:

        try:

            start_month = months[
                match.group(1)[:3].lower()
            ]

            start_year = int(match.group(2))

            end_raw = match.group(3).lower()

            if end_raw in ["present", "current", "now"]:

                end_year = current_year
                end_month = current_month

            else:

                end_parts = end_raw.split()

                end_month = months[
                    end_parts[0][:3]
                ]

                end_year = int(end_parts[1])

            start_idx = (
                start_year * 12
                + start_month
            )

            end_idx = (
                end_year * 12
                + end_month
            )

            if start_idx < end_idx:

                intervals.append(
                    (start_idx, end_idx)
                )

        except Exception:
            continue

    if not intervals:
        return 0.0

    # Merge overlaps
    intervals.sort()

    merged = [intervals[0]]

    for curr_start, curr_end in intervals[1:]:

        prev_start, prev_end = merged[-1]

        if curr_start <= prev_end:

            merged[-1] = (
                prev_start,
                max(prev_end, curr_end),
            )

        else:

            merged.append(
                (curr_start, curr_end)
            )

    total_months = sum(
        max(0, end - start)
        for start, end in merged
    )

    years = round(total_months / 12, 1)

    if years == 0 and total_months > 0:
        years = 0.1

    return min(years, 25.0)

# ─────────────────────────────────────────────────────────────────────────────
# ATS Score
# ─────────────────────────────────────────────────────────────────────────────

def calculate_ats_score(
    text: str,
    skills: list,
) -> dict:

    text_lower = text.lower()

    # ── Keywords ─────────────────────────────────────

    keyword_score = min(
        len(skills) * 2,
        35,
    )

    # ── Metrics ──────────────────────────────────────

    metric_patterns = [
        r"\b\d+(?:\.\d+)?%",
        r"\b\d+(?:\.\d+)?x\b",
        r"\$\d+(?:,\d+)*(?:\.\d+)?",
        r"\b\d+(?:\.\d+)?[kKmMbB]\b",
    ]

    metrics_count = 0

    for pattern in metric_patterns:

        metrics_count += len(
            re.findall(pattern, text)
        )

    achievement_score = min(
        metrics_count * 4,
        30,
    )

    # ── Action Verbs ─────────────────────────────────

    found_verbs = {
        verb
        for verb in ACTION_VERBS
        if verb in text_lower
    }

    action_score = min(
        len(found_verbs) * 2,
        20,
    )

    # ── Length Score ─────────────────────────────────

    length = len(text)

    if 1500 <= length <= 5000:
        format_score = 15

    elif length > 5000:
        format_score = 10

    else:
        format_score = 5

    total = (
        keyword_score
        + achievement_score
        + action_score
        + format_score
    )

    return {
        "total_score": total,
        "breakdown": {
            "keywords": keyword_score,
            "achievements": achievement_score,
            "action_verbs": action_score,
            "formatting_and_length": format_score,
        },
    }

# ─────────────────────────────────────────────────────────────────────────────
# Strength Detection
# ─────────────────────────────────────────────────────────────────────────────

def detect_strengths(
    skills: list,
    experience: float,
    ats_breakdown: dict,
):

    strengths = []

    if len(skills) >= 10:

        strengths.append(
            f"Strong technical breadth across {len(skills)} technologies"
        )

    if experience >= 2:

        strengths.append(
            f"Professional experience of {experience} years"
        )

    if ats_breakdown["achievements"] >= 15:

        strengths.append(
            "Strong quantified achievements"
        )

    if ats_breakdown["action_verbs"] >= 15:

        strengths.append(
            "Strong action-oriented resume writing"
        )

    if not strengths:

        strengths = [
            "Good technical foundation",
            "Clear resume structure",
            "Demonstrates learning mindset",
        ]

    return strengths[:5]

# ─────────────────────────────────────────────────────────────────────────────
# Gap Detection
# ─────────────────────────────────────────────────────────────────────────────

def detect_skill_gaps(skills: list):

    gaps = []

    cloud_stack = {
        "AWS",
        "Azure",
        "GCP",
        "Docker",
        "Kubernetes",
    }

    if not any(s in skills for s in cloud_stack):

        gaps.append(
            "Missing Cloud/DevOps stack exposure"
        )

    if "CI/CD" not in skills:

        gaps.append(
            "No CI/CD tooling experience"
        )

    if not any(
        s in skills
        for s in [
            "SQL",
            "MongoDB",
            "PostgreSQL",
            "MySQL",
        ]
    ):

        gaps.append(
            "Missing database technologies"
        )

    if "System Design" not in skills:

        gaps.append(
            "No evidence of system design knowledge"
        )

    if not gaps:

        gaps.append(
            "Strong modern engineering stack"
        )

    return gaps[:5]

# ─────────────────────────────────────────────────────────────────────────────
# Main ATS Pipeline
# ─────────────────────────────────────────────────────────────────────────────

def analyze_resume_deterministically(
    text: str,
) -> dict:

    text = clean_text(text)

    if is_garbage_text(text):

        return {
            "technical_skills": [],
            "soft_skills": [],
            "years_of_experience": 0.0,
            "experience_breakdown": [],
            "ats_score": 0,
            "ats_score_breakdown": {
                "keywords": 0,
                "achievements": 0,
                "action_verbs": 0,
                "formatting_and_length": 0,
            },
            "top_strengths": [],
            "skill_gaps": [
                "Resume text extraction failed"
            ],
        }

    skills = extract_skills(text)

    experience = estimate_experience(text)

    ats = calculate_ats_score(
        text,
        skills,
    )

    strengths = detect_strengths(
        skills,
        experience,
        ats["breakdown"],
    )

    gaps = detect_skill_gaps(skills)

    return {
        "technical_skills": skills,
        "soft_skills": [],
        "years_of_experience": experience,
        "experience_breakdown": [],
        "ats_score": ats["total_score"],
        "ats_score_breakdown": ats["breakdown"],
        "top_strengths": strengths,
        "skill_gaps": gaps,
    }