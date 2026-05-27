import re

# Master database of typical tech skills for extraction
KNOWN_SKILLS = [
    "Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "Go", "Rust", "PHP", "Ruby", "Swift", "Kotlin",
    "React", "Angular", "Vue.js", "Node.js", "Express", "Django", "Flask", "FastAPI", "Spring Boot", "ASP.NET",
    "SQL", "MySQL", "PostgreSQL", "MongoDB", "Redis", "Cassandra", "Elasticsearch", "Neo4j",
    "AWS", "GCP", "Azure", "Docker", "Kubernetes", "Terraform", "Jenkins", "Git", "GitHub Actions", "CI/CD",
    "Machine Learning", "Deep Learning", "NLP", "Computer Vision", "TensorFlow", "PyTorch", "Scikit-Learn",
    "Pandas", "NumPy", "Apache Spark", "Hadoop", "Kafka", "Data Analysis", "System Design", "Microservices",
    "REST API", "GraphQL", "Agile", "Scrum", "Linux", "Bash"
]

def extract_skills(text: str) -> list:
    """Deterministically extracts known tech skills from resume text."""
    found_skills = set()
    text_lower = text.lower()
    
    for skill in KNOWN_SKILLS:
        # Create a word-boundary regex for the skill to avoid partial matches
        # For example, "Go" shouldn't match "Google"
        pattern = r'\b' + re.escape(skill.lower()) + r'\b'
        if re.search(pattern, text_lower):
            found_skills.add(skill)
            
    return list(found_skills)

def estimate_experience(text: str) -> float:
    """
    Estimates total years of experience by searching for date patterns,
    combining Month-Year, Numeric MM/YYYY, and Year-only ranges,
    and merging overlapping intervals to calculate true cumulative experience.
    """
    import datetime
    import re
    
    now = datetime.datetime.now()
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
                    end_month = month_map.get(end_m_match.group(1)[:3].lower(), 1)
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
                # Extract month and year from end_str (e.g. "12/2022" or "12-2022")
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
                end_month = 12 # Default to end of year
            
            start_idx = start_year * 12 + 1 # Default to start of year
            end_idx = end_year * 12 + end_month
            
            if start_idx <= end_idx:
                intervals.append((start_idx, end_idx))
        except Exception:
            continue

    if not intervals:
        return 0.0

    # ── Interval Merging Algorithm ────────────────────────────────────────────
    # Sort by start_idx
    intervals.sort(key=lambda x: x[0])
    
    merged = [intervals[0]]
    for current in intervals[1:]:
        prev_start, prev_end = merged[-1]
        curr_start, curr_end = current
        
        # If current interval overlaps or is contiguous with previous, merge
        if curr_start <= prev_end + 1:
            merged[-1] = (prev_start, max(prev_end, curr_end))
        else:
            merged.append(current)

    # Sum up total months from merged intervals
    total_months = 0
    for start, end in merged:
        duration = max(1, end - start)
        if duration > 0:
            total_months += duration

    years = round(total_months / 12, 1)
    return min(years, 25.0)

def calculate_ats_score(text: str, found_skills: list) -> dict:
    """Deterministically calculates an ATS score based on keyword density, metrics, and formatting."""
    
    text_length = len(text)
    
    # 1. Keyword Score (Max 35)
    # 2 points per relevant tech skill found, capped at 35
    keyword_score = min(len(found_skills) * 2, 35)
    
    # 2. Achievement / Metrics Score (Max 30)
    # Look for quantified achievements (e.g. 15%, 10x, $5M)
    metrics_count = len(re.findall(r'\b\d+(?:%|x|k|m|b)\b', text.lower()))
    metrics_count += len(re.findall(r'\$\d+', text))
    achievement_score = min(metrics_count * 4, 30)
    
    # 3. Action Verbs Score (Max 20)
    action_verbs = ["developed", "engineered", "built", "designed", "led", "managed", "created", "implemented", "optimized", "increased", "decreased", "improved"]
    verbs_found = sum(1 for verb in action_verbs if verb in text.lower())
    action_verbs_score = min(verbs_found * 2, 20)
    
    # 4. Length & Formatting Score (Max 15)
    # Ideal resume length is ~2000-4000 characters
    if 1500 <= text_length <= 5000:
        length_score = 15
    elif text_length > 5000:
        length_score = 10  # A bit too long
    else:
        length_score = 5   # Too short
        
    total_score = keyword_score + achievement_score + action_verbs_score + length_score
    
    return {
        "total_score": total_score,
        "breakdown": {
            "keywords": keyword_score,
            "achievements": achievement_score,
            "action_verbs": action_verbs_score,
            "formatting_and_length": length_score
        }
    }

def analyze_resume_deterministically(text: str) -> dict:
    """Runs the full deterministic ATS pipeline."""
    skills = extract_skills(text)
    experience = estimate_experience(text)
    score_data = calculate_ats_score(text, skills)
    
    # Basic Gap Analysis (comparing found skills vs modern baseline)
    modern_baseline = {"Cloud/DevOps": ["AWS", "Docker", "CI/CD"], "Testing": ["Jest", "PyTest", "JUnit"]}
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
        "technical_skills": skills[:15],
        "soft_skills": [],  # Deterministic engine cannot extract soft skills — LLM will fill this
        "years_of_experience": experience,
        "experience_breakdown": [],
        "ats_score": score_data["total_score"],
        "ats_score_breakdown": score_data["breakdown"],
        "top_strengths": strengths[:3],
        "skill_gaps": gaps[:5]
    }
