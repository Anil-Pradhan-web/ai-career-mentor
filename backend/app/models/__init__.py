# ORM models are imported directly where needed (e.g. auth routes).
# Do NOT import here — database.py runs create_engine() at module level
# which causes a startup hang when no DB is configured yet.
