import sys
import os

# Add backend to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "backend")))

from app.core.database import SessionLocal
from app.models.models import CareerRoadmap

def main():
    db = SessionLocal()
    try:
        roadmap = db.query(CareerRoadmap).order_by(CareerRoadmap.created_at.desc()).first()
        if not roadmap:
            print("No roadmaps found in database.")
            return
        
        print(f"Roadmap ID: {roadmap.id}")
        print(f"Steps Type: {type(roadmap.steps)}")
        print(f"Steps Value: {roadmap.steps}")
    finally:
        db.close()

if __name__ == "__main__":
    main()
