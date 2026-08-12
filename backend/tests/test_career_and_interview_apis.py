import uuid
import pytest
import json
from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal
from app.models.models import User, CareerAnalysis, InterviewSession
from app.core.config import settings

client = TestClient(app)

def _register_user():
    email = f"test-ci-{uuid.uuid4().hex}@example.com"
    payload = {"name": "CI User", "email": email, "password": "secure-password"}
    response = client.post("/auth/register", json=payload)
    assert response.status_code == 200
    data = response.json()
    return email, data["access_token"]

def _auth_headers(token: str):
    return {"Authorization": f"Bearer {token}"}

# ── Career Endpoint Tests ───────────────────────────────────────────────────

def test_career_history_unauthorized():
    response = client.get("/career/history")
    assert response.status_code == 401

def test_career_history_and_delete_success():
    email, token = _register_user()
    headers = _auth_headers(token)

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        assert user is not None

        # 1. Create a dummy career analysis record
        analysis = CareerAnalysis(
            user_id=user.id,
            target_role="Frontend Engineer",
            location="Remote",
            resume_analysis={"ats_score": 90},
            market_analysis={"trend": "High demand"},
            roadmap={"id": "mock-roadmap-id", "weeks": []},
            linkedin_strategy={"headline": "Mock Headline"}
        )
        db.add(analysis)
        db.commit()
        db.refresh(analysis)
        analysis_id = analysis.id
    finally:
        db.close()

    # 2. Get history and check analysis presence
    response = client.get("/career/history", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["id"] == analysis_id
    assert data[0]["target_role"] == "Frontend Engineer"

    # 3. Delete analysis record
    delete_response = client.delete(f"/career/history/{analysis_id}", headers=headers)
    assert delete_response.status_code == 200
    assert delete_response.json()["status"] == "success"

    # 4. Verify deleted
    response = client.get("/career/history", headers=headers)
    data = response.json()
    assert not any(item["id"] == analysis_id for item in data)

def test_delete_career_analysis_not_found():
    _, token = _register_user()
    headers = _auth_headers(token)
    response = client.delete(f"/career/history/{str(uuid.uuid4())}", headers=headers)
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_run_full_analysis_stream():
    email, token = _register_user()
    headers = _auth_headers(token)

    class MockGraph:
        async def astream(self, initial_state, stream_mode="updates"):
            # Yield log events
            yield {"node_name": {"logs": ["Simulated node log line 1"]}}
            # Yield final data update
            yield {
                "final_node": {
                    "resume_analysis": {"ats_score": 88},
                    "market_analysis": {"trend": "Positive"},
                    "roadmap": [{"week": 1, "topic": "Docker Basics"}],
                    "linkedin_strategy": {"about_section": "Mock section"}
                }
            }

    with patch("app.api.career.create_career_graph") as mock_create_graph:
        mock_create_graph.return_value = MockGraph()

        payload = {
            "resume_text": "Experienced Python Developer with expertise in Docker.",
            "target_role": "Platform Engineer",
            "location": "San Francisco, CA",
            "experience_level": "intermediate",
            "learning_style": "balanced"
        }

        # Mock save_market_analysis to prevent DB errors
        with patch("app.api.career.save_market_analysis") as mock_save:
            response = client.post("/career/full-analysis/stream", json=payload, headers=headers)
            assert response.status_code == 200
            assert "text/event-stream" in response.headers["content-type"]
            
            # Read and parse streamed lines
            lines = response.content.decode().split("\n\n")
            non_empty_lines = [l.strip() for l in lines if l.strip()]
            
            assert len(non_empty_lines) >= 2
            
            # First line should be node log message
            first_event = json.loads(non_empty_lines[0].replace("data:", "").strip())
            assert first_event["type"] == "log"
            assert "Simulated node log line 1" in first_event["message"]

            # Last line should be the success payload result
            final_event = json.loads(non_empty_lines[-1].replace("data:", "").strip())
            assert final_event["type"] == "result"
            payload_data = final_event["payload"]
            assert payload_data["status"] == "success"
            assert payload_data["output"]["resume_analysis"]["ats_score"] == 88


# ── Interview Endpoint Tests ────────────────────────────────────────────────

def test_interview_history_unauthorized():
    response = client.get("/interview/history")
    assert response.status_code == 401

def test_interview_history_detail_and_delete_success():
    email, token = _register_user()
    headers = _auth_headers(token)

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        assert user is not None

        # 1. Create a dummy mock interview session
        session = InterviewSession(
            user_id=user.id,
            target_role="Data Scientist",
            chat_history=[{"role": "assistant", "content": "Welcome!"}],
            score=82.5,
            status="completed"
        )
        db.add(session)
        db.commit()
        db.refresh(session)
        session_id = session.id
    finally:
        db.close()

    # 2. Get history and check session presence
    response = client.get("/interview/history", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "history" in data
    assert len(data["history"]) >= 1
    assert data["history"][0]["id"] == session_id
    assert data["history"][0]["target_role"] == "Data Scientist"

    # 3. Get specific interview details
    detail_response = client.get(f"/interview/{session_id}", headers=headers)
    assert detail_response.status_code == 200
    detail_data = detail_response.json()
    assert detail_data["id"] == session_id
    assert len(detail_data["chat_history"]) == 1

    # 4. Delete mock interview session
    delete_response = client.delete(f"/interview/{session_id}", headers=headers)
    assert delete_response.status_code == 200
    assert "deleted successfully" in delete_response.json()["message"]

    # 5. Verify deleted from details
    response = client.get(f"/interview/{session_id}", headers=headers)
    assert response.status_code == 404
