import os
import sys
from dotenv import load_dotenv
from sqlalchemy.orm import Session

# Add backend directory to sys.path so we can import app modules
sys.path.append(r"c:\Users\ANIL\Desktop\ai-career-mentor\backend")

# Load environment
dotenv_path = r"c:\Users\ANIL\Desktop\ai-career-mentor\backend\.env"
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path)
    print("Loaded .env successfully.")

from app.core.database import SessionLocal
from app.models.models import User, DailyAnalytics
from app.agents.registry import call_llm
from app.core import observability as obs
from app.core.config import settings

def test_pipeline():
    db = SessionLocal()
    admin_email = "anilpradhan9644@gmail.com"
    
    # 1. Check if admin user exists, if not create one for testing
    user = db.query(User).filter(User.email == admin_email).first()
    if not user:
        print(f"Admin user {admin_email} not found. Creating a test one...")
        user = User(
            name="Anil Pradhan",
            email=admin_email,
            hashed_pw="test_hashed_password"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        print("Created admin user.")
    else:
        print(f"Admin user exists: {user}")

    print("\n--- Current Redis Client State ---")
    print("redis_client:", obs.redis_client)
    
    # If redis_client is None because settings.DEBUG is True, we can temporarily force it for the test
    # to make sure the Redis pipeline works as expected.
    import redis
    original_redis = obs.redis_client
    redis_url = os.getenv("REDIS_URL", "")
    if not obs.redis_client and redis_url:
        print("Forcing Redis client connection for test...")
        obs.redis_client = redis.from_url(
            redis_url,
            decode_responses=True,
            socket_connect_timeout=3,
            socket_timeout=3
        )
        print("Forced Redis client ping:", obs.redis_client.ping())

    try:
        # Clear/initialize some test metrics in Redis for today to have clean logs
        from datetime import datetime, timezone
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        
        # 2. Track a simulated LLM call
        print("\n--- Simulating LLM Calls ---")
        print("Tracking LLM call on groq...")
        obs.track_llm_call(provider="groq", latency=0.45, input_tokens=800, output_tokens=1200)
        
        print("Tracking LLM call on nvidia...")
        obs.track_llm_call(provider="nvidia", latency=1.20, input_tokens=500, output_tokens=900)

        print("Tracking LLM call on google...")
        obs.track_llm_call(provider="google", latency=0.85, input_tokens=1000, output_tokens=1500)

        # 3. Track active websockets and user
        print("\n--- Simulating active websockets and users ---")
        obs.track_active_websocket("connect")
        obs.track_active_websocket("connect")
        obs.track_active_websocket("disconnect") # net should be +1
        obs.track_active_user(user.id)

        # 4. Track errors
        print("\n--- Simulating error tracking ---")
        obs.track_error("Simulated Test Error", "Traceback for testing pipeline")

        # 5. Sync to Postgres
        print("\n--- Testing Redis -> Postgres Sync ---")
        # Reset last sync time to bypass 60-second guard
        obs._last_sync_time = 0.0
        obs.sync_redis_to_postgres(db)

        # 6. Retrieve metrics from DB
        analytics = db.query(DailyAnalytics).filter(DailyAnalytics.date == datetime.now(timezone.utc).date()).first()
        print("\n--- Verification from Database ---")
        if analytics:
            print("Postgres DailyAnalytics record found!")
            print(f"Date: {analytics.date}")
            print(f"Total Requests: {analytics.total_requests}")
            print(f"Total Tokens: {analytics.total_tokens}")
            print(f"Estimated Cost: ${analytics.estimated_cost:.6f}")
            print(f"Fallback Count: {analytics.fallback_count}")
            print(f"Error Count: {analytics.error_count}")
        else:
            print("ERROR: Postgres DailyAnalytics record not created!")

        # 7. Check admin API metrics payload
        # This mirrors app.api.admin.get_admin_metrics logic
        print("\n--- Reconstructing Admin API payload ---")
        active_users = obs.get_active_users_count()
        active_ws = 0
        if obs.redis_client:
            val = obs.redis_client.get("metrics:active_ws")
            active_ws = int(val) if val else 0
        else:
            active_ws = obs._in_memory_metrics["active_ws"]

        latencies = {}
        for p in ["nvidia", "groq", "google"]:
            if obs.redis_client:
                lats = obs.redis_client.lrange(f"metrics:latency:{p}", 0, 49)
                latencies[p] = [float(l) for l in lats]
            else:
                latencies[p] = obs._in_memory_metrics["latencies"].get(p, [])

        error_logs = obs.get_error_logs()
        
        history = db.query(DailyAnalytics).order_by(DailyAnalytics.date.desc()).limit(7).all()
        historical_chart = [
            {
                "date": str(h.date),
                "requests": h.total_requests,
                "tokens": h.total_tokens,
                "cost": round(h.estimated_cost, 4),
                "fallbacks": h.fallback_count,
                "errors": h.error_count,
            }
            for h in reversed(history)
        ]

        payload = {
            "active_users": active_users,
            "active_websockets": active_ws,
            "latencies": latencies,
            "error_logs": error_logs,
            "historical_chart": historical_chart,
            "settings": {
                "llm_provider": "hybrid",
                "active_model": settings.active_model,
            }
        }
        print("API payload successfully generated:")
        import json
        print(json.dumps(payload, indent=2))

    finally:
        # Restore original client state
        obs.redis_client = original_redis
        db.close()

if __name__ == "__main__":
    test_pipeline()
