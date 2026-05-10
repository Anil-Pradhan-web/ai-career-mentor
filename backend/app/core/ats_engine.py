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
    Estimates total years of experience by searching for date patterns.
    Handles 'Month Year - Present' or 'Month Year - Month Year'.
    If only years are present, it tries to be conservative.
    """
    import datetime
    now = datetime.datetime.now()
    current_year = now.year
    current_month = now.month

    # 1. Month patterns (Jan, Feb... or January, February...)
    months = r"(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*"
    # Patterns like "Jan 2020 - Mar 2022" or "January 2020 to Present"
    month_year_pattern = rf"({months})\s*((?:19|20)\d{{2}})\s*(?:-|to|–)\s*([pP]resent|[cC]urrent|{months}\s*(?:19|20)\d{{2}})"
    
    found_ranges = []
    
    # Try Month-Year matches
    matches = re.findall(month_year_pattern, text, re.IGNORECASE)
    month_map = {
        "jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6,
        "jul": 7, "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12
    }

    for start_m_str, start_y_str, end_str in matches:
        try:
            start_year = int(start_y_str)
            start_month = month_map.get(start_m_str[:3].lower(), 1)
            
            if any(kw in end_str.lower() for kw in ["present", "current"]):
                end_year = current_year
                end_month = current_month
            else:
                # Extract month and year from end_str (e.g. "Mar 2022")
                end_m_match = re.search(rf"({months})", end_str, re.IGNORECASE)
                end_y_match = re.search(r"((?:19|20)\d{2})", end_str)
                if end_m_match and end_y_match:
                    end_year = int(end_y_match.group(1))
                    end_month = month_map.get(end_m_match.group(1)[:3].lower(), 1)
                else:
                    continue
            
            start_total = start_year * 12 + start_month
            end_total = end_year * 12 + end_month
            diff_months = max(0, end_total - start_total)
            found_ranges.append(diff_months)
        except:
            continue

    # 2. Fallback to Year-only patterns if no month patterns found
    if not found_ranges:
        year_only_pattern = r"((?:19|20)\d{2})\s*(?:-|to|–)\s*([pP]resent|[cC]urrent|(?:19|20)\d{2})"
        year_matches = re.findall(year_only_pattern, text, re.IGNORECASE)
        for s_y, e_y in year_matches:
            try:
                start = int(s_y)
                if any(kw in e_y.lower() for kw in ["present", "current"]):
                    end = current_year
                else:
                    end = int(e_y)
                
                # If it's a future or far-off date, likely education or invalid
                if start > current_year: continue
                
                diff = max(0, end - start)
                if diff > 0:
                    found_ranges.append(diff * 12)
                elif end == start:
                    found_ranges.append(3) # Assume 3 months for single year mention
            except:
                continue

    if not found_ranges:
        return 0.0

    # To avoid overcounting (e.g. 5 projects in 1 year), we take the MAX range 
    # instead of summing all ranges, or we could sum but cap it.
    # In a basic regex engine, projects and work look the same. 
    # We take the longest single duration as the primary experience indicator.
    total_months = max(found_ranges)
    
    # If there are multiple ranges, maybe they are sequential. 
    # Let's take the top 2 ranges and sum them if they don't seem like the same thing.
    if len(found_ranges) > 1:
        found_ranges.sort(reverse=True)
        # If the second range is significant, add a fraction of it
        total_months = found_ranges[0] + (sum(found_ranges[1:]) * 0.3)

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
        "years_of_experience": experience,
        "ats_score": score_data["total_score"],
        "ats_score_breakdown": score_data["breakdown"],
        "top_strengths": strengths[:3],
        "skill_gaps": gaps[:5]
    }
