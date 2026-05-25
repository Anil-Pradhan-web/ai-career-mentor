import pytest
from app.core.ats_engine import estimate_experience

def test_estimate_experience_single_range():
    # Jan 2020 to Dec 2020 should be about 11-12 months (approx 0.9 or 1.0 years)
    text = "Software Engineer at TechCorp (Jan 2020 - Dec 2020)"
    exp = estimate_experience(text)
    assert 0.8 <= exp <= 1.0

def test_estimate_experience_numeric_dates():
    # 06/2018 - 12/2020 is 2.5 years (30 months)
    text = "Fullstack Dev (06/2018 - 12/2020)"
    exp = estimate_experience(text)
    assert 2.3 <= exp <= 2.7

def test_estimate_experience_overlapping_ranges():
    # Overlapping ranges should merge and not double-count
    # Job A: Jan 2018 - Dec 2020 (3 years)
    # Job B: Jun 2018 - Jun 2020 (overlapping, inside A)
    # Total merged should be exactly from Jan 2018 to Dec 2020 (3 years)
    text = "Senior Engineer (Jan 2018 - Dec 2020) and Co-Founder (Jun 2018 - Jun 2020)"
    exp = estimate_experience(text)
    assert 2.8 <= exp <= 3.1

def test_estimate_experience_sequential_ranges():
    # Sequential ranges should be added together
    # Job A: 2015 - 2017 (2 years)
    # Job B: 2017 - 2020 (3 years)
    # Job C: 2020 - 2022 (2 years)
    # Total should be around 7.0 years
    text = "Job 1 (2015 - 2017), Job 2 (2017 - 2020), Job 3 (2020 - 2022)"
    exp = estimate_experience(text)
    assert 6.5 <= exp <= 8.5

def test_estimate_experience_future_and_invalid():
    # Future dates should be ignored (e.g. 2030 - 2035)
    text = "Future student (2030 - 2035) but past experience (Jan 2018 - Dec 2020)"
    exp = estimate_experience(text)
    assert 2.8 <= exp <= 3.1
