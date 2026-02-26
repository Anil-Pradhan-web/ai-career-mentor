from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()
    assert response.json()["message"] == "Welcome to AI Career Mentor API 🚀"

def test_read_health():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "service" in data
    assert "provider" in data

def test_auth_protected_routes_without_token():
    # Attempt to access a protected route without auth token
    response = client.post("/roadmap/generate", json={"target_role": "Developer", "skill_gaps": ["React"]})
    assert response.status_code == 401
    assert response.json()["detail"] == "Not authenticated"

def test_market_trends_without_auth():
    # Attempt to access market trends without auth
    response = client.get("/market/trends?role=Developer&location=Remote")
    assert response.status_code == 401
    assert response.json()["detail"] == "Not authenticated"
