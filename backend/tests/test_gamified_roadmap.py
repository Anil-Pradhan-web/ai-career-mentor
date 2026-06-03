"""
Tests for gamified roadmap endpoints:
  - PUT /roadmap/{roadmap_id}/toggle-week/{week_number}
  - GET /roadmap/{roadmap_id}/quiz/{week_number}
"""
import uuid
import pytest
from fastapi.testclient import TestClient
from app.core.database import SessionLocal
from app.models.models import CareerRoadmap, User
from app.main import app

client = TestClient(app)

def _register_user():
    email = f"test-gamified-{uuid.uuid4().hex}@example.com"
    payload = {"name": "Gamified User", "email": email, "password": "secure-password"}
    response = client.post("/auth/register", json=payload)
    assert response.status_code == 200
    data = response.json()
    return email, data["access_token"]

def _create_mock_roadmap(user_email: str):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == user_email).first()
        assert user is not None
        
        # Standard 8-week structure
        steps = []
        for i in range(1, 9):
            steps.append({
                "week": i,
                "topic": f"Topic Week {i} (SQL databases)",
                "skill_gap_addressed": "SQL",
                "estimated_hours": 10,
                "mini_project": "Mini Project",
                "success_criteria": "Done",
                "resource_search_queries": [],
                "completed": False
            })
            
        roadmap = CareerRoadmap(
            user_id=user.id,
            target_role="Backend Engineer",
            steps=steps
        )
        db.add(roadmap)
        db.commit()
        db.refresh(roadmap)
        return roadmap.id
    finally:
        db.close()

def test_unauthorized_endpoints():
    response = client.put("/roadmap/some-id/toggle-week/1")
    assert response.status_code == 401
    
    response = client.get("/roadmap/some-id/quiz/1")
    assert response.status_code == 401

def test_toggle_week_success():
    email, token = _register_user()
    roadmap_id = _create_mock_roadmap(email)
    headers = {"Authorization": f"Bearer {token}"}
    
    # Toggle week 1 (False -> True)
    response = client.put(f"/roadmap/{roadmap_id}/toggle-week/1", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Week 1 completion updated"
    assert data["weeks"][0]["completed"] is True
    
    # Toggle week 1 again (True -> False)
    response = client.put(f"/roadmap/{roadmap_id}/toggle-week/1", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["weeks"][0]["completed"] is False
    
    # Explicitly set completed to True
    response = client.put(f"/roadmap/{roadmap_id}/toggle-week/1?completed=true", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["weeks"][0]["completed"] is True
    
    # Toggle non-existent week
    response = client.put(f"/roadmap/{roadmap_id}/toggle-week/99", headers=headers)
    assert response.status_code == 404

def test_get_week_quiz_success():
    email, token = _register_user()
    roadmap_id = _create_mock_roadmap(email)
    headers = {"Authorization": f"Bearer {token}"}
    
    # Get quiz for week 1 (topic: "Topic Week 1 (SQL databases)")
    # Since we test locally and settings.LLM_PROVIDER might fall back or fail,
    # it should cleanly return either AI generated quiz or fallback quiz
    response = client.get(f"/roadmap/{roadmap_id}/quiz/1", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 5
    for question in data:
        assert "question" in question
        assert "options" in question
        assert len(question["options"]) == 4
        assert "answer" in question
        assert question["answer"] in ("A", "B", "C", "D")
        
    # Get quiz for non-existent week
    response = client.get(f"/roadmap/{roadmap_id}/quiz/99", headers=headers)
    assert response.status_code == 404


def test_get_week_quiz_rate_limit():
    from app.core import rate_limit
    email, token = _register_user()
    roadmap_id = _create_mock_roadmap(email)
    headers = {"Authorization": f"Bearer {token}"}

    # Clear rate limiter stats
    rate_limit.redis_client = None
    rate_limit._usage_fallback.clear()

    original_debug = rate_limit.settings.DEBUG
    rate_limit.settings.DEBUG = False
    try:
        # We can hit it 3 times (the limit is 3)
        for i in range(3):
            response = client.get(f"/roadmap/{roadmap_id}/quiz/1", headers=headers)
            assert response.status_code == 200

        # The 4th hit should return 429
        response = client.get(f"/roadmap/{roadmap_id}/quiz/1", headers=headers)
        assert response.status_code == 429
        assert "limit" in response.json()["detail"].lower()
    finally:
        rate_limit.settings.DEBUG = original_debug
