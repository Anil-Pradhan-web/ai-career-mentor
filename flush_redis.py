import redis

redis_url = "rediss://default:gQAAAAAAAas6AAIgcDE0NmEzM2U2MmJhMzg0ZjRlYmVlNWNmYWVkNWMxMjZjMQ@creative-raccoon-109370.upstash.io:6379"

try:
    r = redis.from_url(redis_url)
    r.flushall()
    print("SUCCESS: Redis flushed.")
except Exception as e:
    print(f"ERROR: {e}")
