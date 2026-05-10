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
    Estimates total years of experience by searching for date patterns like 'Jan 2020 - Present'.
    A highly robust ATS would use SpaCy here. This is a basic deterministic fallback.
    """
    # Look for year patterns like 2018 - 2021 or 2022 - Present
    date_patterns = re.findall(r'((?:19|20)\d{2})\s*(?:-|to|–)\s*([pP]resent|[cC]urrent|(?:19|20)\d{2})', text)
    
    total_years = 0.0
    for start_year_str, end_year_str in date_patterns:
        try:
            start = int(start_year_str)
            if end_year_str.lower() in ["present", "current"]:
                import datetime
                end = datetime.datetime.now().year
            else:
                end = int(end_year_str)
                
            diff = max(0, end - start)
            if diff > 0:
                total_years += diff
            elif end == start:
                total_years += 0.5 # Assume half a year if same year
        except ValueError:
            pass
            
    return min(total_years, 25.0) # Cap at 25 years

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
