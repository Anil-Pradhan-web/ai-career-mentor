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
    "github": "Git",
    "gitlab": "Git",
    "system design": "System Design",
    "c++": "C++",
    "cpp": "C++",
    "rust": "Rust",
    "golang": "Go",
    "nest.js": "NestJS",
    "nestjs": "NestJS",
    "tailwind": "TailwindCSS",
    "tailwindcss": "TailwindCSS",
    "sass": "Sass",
    "less": "Less",
    "langchain": "LangChain",
    "langgraph": "LangGraph",
    "autogen": "AutoGen",
    "ag2": "AutoGen",
    "pydantic": "Pydantic",
    "sqlalchemy": "SQLAlchemy",
    "alembic": "Alembic",
    "sqlite": "SQLite",
    "mariadb": "MariaDB",
    "firebase": "Firebase",
    "supabase": "Supabase",
    "prisma": "Prisma",
    "apollo": "Apollo GraphQL",
    "kafka": "Apache Kafka",
    "rabbitmq": "RabbitMQ",
    "prometheus": "Prometheus",
    "grafana": "Grafana",
    "sentry": "Sentry",
    "datadog": "Datadog",
    "elastic": "Elasticsearch",
    "elasticsearch": "Elasticsearch",
    "nginx": "Nginx",
    "apache": "Apache",
    "terraform": "Terraform",
    "ansible": "Ansible",
    "pandas": "Pandas",
    "numpy": "NumPy",
    "scikit-learn": "Scikit-Learn",
    "scikit learn": "Scikit-Learn",
    "sklearn": "Scikit-Learn",
    "opencv": "OpenCV",
    "swift": "Swift",
    "kotlin": "Kotlin",
    "dart": "Dart",
    "flutter": "Flutter",
    "react native": "React Native",
    "xamarin": "Xamarin",
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

def is_education_or_project_context(context_before: str) -> bool:
    """Helper to detect if context preceding a date range is academic or project-related."""
    context_lower = context_before.lower()
    
    # Check for education indicators
    edu_indicators = [
        "education", "college", "university", "school", "b.tech", "btech", 
        "m.tech", "mtech", "b.e.", "b.sc", "m.sc", "bachelor", "master", 
        "phd", "academic", "hsc", "ssc", "coursework", "degree", "cgpa", "cgp"
    ]
    if any(kw in context_lower for kw in edu_indicators):
        return True
        
    # Check for personal/academic project indicators (excluding professional titles like Project Manager)
    if "project" in context_lower or "hackathon" in context_lower:
        job_keywords = ["manager", "lead", "engineer", "director", "coordinator", "professional"]
        if any(j in context_lower for j in job_keywords):
            return False
        return True
        
    return False


def estimate_experience(text: str) -> float:
    """
    Estimates total years of experience by searching for date patterns,
    combining Month-Year, Numeric MM/YYYY, and Year-only ranges,
    and merging overlapping intervals to calculate true cumulative experience.
    """
    now = datetime.now()
    current_year = now.year
    current_month = now.month

    intervals = []

    # Map month string to numeric month
    month_map = {
        "jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6,
        "jul": 7, "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12
    }
    months_regex = r"(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*"

    # 1. Match Text Month-Year ranges (e.g., "Jan 2020 - Mar 2022", "January 2020 to Present")
    month_year_pattern = rf"\b({months_regex})\s*((?:19|20)\d{{2}})\s*(?:-|to|–)\s*([pP]resent|[cC]urrent|[nN]ow|{months_regex}\s*(?:19|20)\d{{2}})\b"
    for match in re.finditer(month_year_pattern, text, re.IGNORECASE):
        context_before = text[max(0, match.start() - 150):match.start()]
        if is_education_or_project_context(context_before):
            continue
        start_m_str, start_y_str, end_str = match.groups()
        try:
            start_year = int(start_y_str)
            if start_year > current_year:
                continue
            start_month = month_map.get(start_m_str[:3].lower(), 1)
            
            if any(kw in end_str.lower() for kw in ["present", "current", "now"]):
                end_year = current_year
                end_month = current_month
            else:
                end_m_match = re.search(rf"({months_regex})", end_str, re.IGNORECASE)
                end_y_match = re.search(r"((?:19|20)\d{2})", end_str)
                if end_m_match and end_y_match:
                    end_year = int(end_y_match.group(1))
                    end_month = month_map.get(end_m_match.group(1)[:3].lower(), 12)
                else:
                    continue
            
            start_idx = start_year * 12 + start_month
            end_idx = end_year * 12 + end_month
            if start_idx <= end_idx:
                intervals.append((start_idx, end_idx))
        except Exception:
            continue

    # 2. Match Numeric Month-Year ranges (e.g., "06/2018 - 12/2022", "5-2019 to Present")
    numeric_month_year_pattern = r"\b(0?[1-9]|1[0-2])\s*[\/-]\s*((?:19|20)\d{2})\s*(?:-|to|–)\s*([pP]resent|[cC]urrent|[nN]ow|(?:0?[1-9]|1[0-2])\s*[\/-]\s*(?:19|20)\d{2})\b"
    for match in re.finditer(numeric_month_year_pattern, text, re.IGNORECASE):
        context_before = text[max(0, match.start() - 150):match.start()]
        if is_education_or_project_context(context_before):
            continue
        start_m_str, start_y_str, end_str = match.groups()
        try:
            start_year = int(start_y_str)
            if start_year > current_year:
                continue
            start_month = int(start_m_str)
            
            if any(kw in end_str.lower() for kw in ["present", "current", "now"]):
                end_year = current_year
                end_month = current_month
            else:
                end_parts = re.findall(r"\d+", end_str)
                if len(end_parts) == 2:
                    end_month = int(end_parts[0])
                    end_year = int(end_parts[1])
                else:
                    continue
            
            start_idx = start_year * 12 + start_month
            end_idx = end_year * 12 + end_month
            if start_idx <= end_idx:
                intervals.append((start_idx, end_idx))
        except Exception:
            continue

    # 3. Match Year-only ranges (e.g., "2018 - 2022", "2019 to Present")
    year_only_pattern = r"\b((?:19|20)\d{2})\s*(?:-|to|–)\s*([pP]resent|[cC]urrent|[nN]ow|(?:19|20)\d{2})\b"
    for match in re.finditer(year_only_pattern, text, re.IGNORECASE):
        context_before = text[max(0, match.start() - 150):match.start()]
        if is_education_or_project_context(context_before):
            continue
        s_y, e_y = match.groups()
        try:
            start_year = int(s_y)
            if start_year > current_year:
                continue
            if any(kw in e_y.lower() for kw in ["present", "current", "now"]):
                end_year = current_year
                end_month = current_month
            else:
                end_year = int(e_y)
                end_month = 12
            
            start_idx = start_year * 12 + 1
            end_idx = end_year * 12 + end_month
            if start_idx <= end_idx:
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