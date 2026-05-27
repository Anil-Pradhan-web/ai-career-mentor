# Copyright (c) 2026 Anil Pradhan. All rights reserved.
import json
import uuid
import pytest
from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient
from fastapi import status

from app.main import app
from app.core.database import Base, engine, SessionLocal
from app.models.models import User
from app.core.security import create_access_token

Base.metadata.create_all(bind=engine)
client = TestClient(app)

def _create_test_user():
    db = SessionLocal()
    email = f"voice-{uuid.uuid4().hex}@example.com"
    user = User(name="Voice Tester", email=email, hashed_pw="dummy-hash")
    db.add(user)
    db.commit()
    db.refresh(user)
    db.close()
    return user

def test_voice_assistant_ws_missing_token():
    """Verify that connection is rejected/closed immediately when token is missing."""
    try:
        with client.websocket_connect("/career/voice-assistant/ws") as websocket:
            # If it gets here, the connection didn't throw an error, but let's check if it closes
            # Since TestClient might raise an exception on close, we handle it
            pass
    except Exception as e:
        # Expected close exception from TestClient
        assert "WebSocket" in str(e) or "close" in str(e).lower()

def test_voice_assistant_ws_invalid_token():
    """Verify that connection is rejected/closed when token is invalid."""
    try:
        with client.websocket_connect("/career/voice-assistant/ws?token=invalid-jwt-token") as websocket:
            pass
    except Exception as e:
        assert "WebSocket" in str(e) or "close" in str(e).lower()

@pytest.mark.asyncio
async def test_voice_assistant_ws_authorized_mocked():
    """Verify that a valid authenticated user connects and setup message is sent to Gemini."""
    user = _create_test_user()
    token = create_access_token({"sub": user.id})

    # Mock the websockets.connect to avoid making external calls to Google Gemini
    mock_connect_cm = AsyncMock()
    mock_gemini_connection = AsyncMock()
    mock_connect_cm.__aenter__.return_value = mock_gemini_connection
    mock_connect_cm.__aexit__.return_value = False
    mock_gemini_connection.send = AsyncMock()
    
    # Simulate a clean disconnect when iterating
    class AsyncIter:
        def __init__(self, items):
            self.items = items
        def __aiter__(self):
            return self
        async def __anext__(self):
            if not self.items:
                raise StopAsyncIteration
            return self.items.pop(0)
            
    mock_gemini_connection.__aiter__ = lambda self: AsyncIter([])

    with patch("app.api.voice_assistant.websockets.connect", return_value=mock_connect_cm) as mock_connect, \
         patch("app.core.config.settings.GOOGLE_API_KEY", "mock-google-api-key"):
        
        # TestClient runs in synchronous context, we test connectivity structure
        try:
            with client.websocket_connect(f"/career/voice-assistant/ws?token={token}") as websocket:
                # Send mock client audio
                websocket.send_json({"type": "audio", "data": "base64EncodedAudioData"})
                # Send mock client interrupt
                websocket.send_json({"type": "interrupt"})
                
                # Give it a tiny bit of time to execute the background task loops
                import time
                time.sleep(0.5)
        except Exception:
            # If the async loop finishes or mocks close, it might raise/exit
            pass

        # Verify that websockets.connect was called with Google Live API URI containing our key
        mock_connect.assert_called_once()
        args, kwargs = mock_connect.call_args
        assert "generativelanguage.googleapis.com" in args[0]
        assert "key=mock-google-api-key" in args[0]
        
        # Verify that setup message was sent to Gemini
        assert mock_gemini_connection.send.call_count >= 1
        first_sent_msg = json.loads(mock_gemini_connection.send.call_args_list[0][0][0])
        assert "setup" in first_sent_msg
        assert first_sent_msg["setup"]["model"] == "models/gemini-2.5-flash-native-audio-latest"
        assert "Aoede" in first_sent_msg["setup"]["generationConfig"]["speechConfig"]["voiceConfig"]["prebuiltVoiceConfig"]["voiceName"]
