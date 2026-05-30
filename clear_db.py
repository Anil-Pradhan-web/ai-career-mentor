#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
clear_db.py -- AI Career Mentor database cleaner.

Clears all records from the PostgreSQL/SQLite database while preserving schemas.
Reads DATABASE_URL from backend/.env automatically.
Use --neon to target the production Neon database URL.
"""
import os
import sys
import argparse
from pathlib import Path

# Add backend directory to Python path to import app modules
backend_dir = Path(__file__).parent / "backend"
sys.path.append(str(backend_dir))

# -- Parse Arguments -----------------------------------------------------------
parser = argparse.ArgumentParser(description="Clear AI Career Mentor database tables")
parser.add_argument(
    "--neon",
    action="store_true",
    help="Force clear the production Neon Postgres database instead of the active configured DB",
)
args = parser.parse_args()

# -- Load .env ----------------------------------------------------------------
env_path = backend_dir / ".env"
neon_url_commented = ""
active_db_url = ""

if env_path.exists():
    with open(env_path) as f:
        for line in f:
            line_stripped = line.strip()
            # Try to capture commented Neon URL for convenience
            if line_stripped.startswith("#") and "neon.tech" in line_stripped:
                parts = line_stripped.split("=", 1)
                if len(parts) == 2:
                    neon_url_commented = parts[1].strip().strip('"').strip("'")
            elif line_stripped and not line_stripped.startswith("#") and "=" in line_stripped:
                k, _, v = line_stripped.partition("=")
                os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))
    print(f"[OK] Loaded env from {env_path}")
else:
    print(f"[WARN] No .env found at {env_path} -- using system env vars")

# -- Choose Database URL --------------------------------------------------------
if args.neon:
    # If the user specified --neon, use the commented Neon URL from .env
    if neon_url_commented:
        DATABASE_URL = neon_url_commented
        print("[INFO] Targeting Neon DB from commented configuration in .env")
    else:
        print("[ERROR] --neon was specified but no commented Neon database URL was found in backend/.env")
        sys.exit(1)
else:
    DATABASE_URL = os.getenv("DATABASE_URL", "")
    if not DATABASE_URL:
        print("[ERROR] DATABASE_URL not set. Cannot connect to database.")
        sys.exit(1)

# Normalize PostgreSQL URL schema (Render/Neon/Heroku compatibility)
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Mask credentials for printing
db_print = DATABASE_URL
if "@" in DATABASE_URL:
    db_print = DATABASE_URL.split("@")[-1]
print(f"[INFO] Connecting to database: {db_print}...")

try:
    from sqlalchemy import create_engine, text
    from sqlalchemy.orm import sessionmaker
    
    # Simple connection engine
    engine = create_engine(DATABASE_URL, echo=False)
    Session = sessionmaker(bind=engine)
    session = Session()
    print("[OK] Connected to database successfully.")
except Exception as e:
    print(f"[ERROR] Failed to connect to database: {e}")
    sys.exit(1)

# -- Clear Data ----------------------------------------------------------------
try:
    # We delete from tables in reverse foreign key dependency order
    tables = [
        "activity_logs",
        "interview_sessions",
        "career_roadmaps",
        "resumes",
        "market_analyses",
        "daily_analytics",
        "users"
    ]
    
    print("\n[INFO] Clearing records from tables...")
    
    for table in tables:
        try:
            # Wrap the SQL execution in text() for SQLAlchemy 2.0 compliance
            result = session.execute(text(f"DELETE FROM {table};"))
            row_count = result.rowcount
            if row_count is None or row_count == -1:
                print(f"  - Cleared table: {table}")
            else:
                print(f"  - Cleared table: {table} ({row_count} row(s) deleted)")
            session.commit()
        except Exception as table_err:
            session.rollback()
            print(f"  - [SKIPPED] Table {table} (failed to clear or doesn't exist)")
            
    print("\n[SUCCESS] Database records cleared successfully!")
    
except Exception as e:
    session.rollback()
    print(f"\n[ERROR] Failed to clear database records: {e}")
    sys.exit(1)
finally:
    session.close()
