import sys
import os
import httpx
from dotenv import load_dotenv

# Load env variables
env_path = "c:\\Users\\ANIL\\Desktop\\ai-career-mentor\\backend\\.env"
load_dotenv(dotenv_path=env_path)

api_key = os.getenv("NVIDIA_API_KEY")
model = os.getenv("NVIDIA_MODEL", "meta/llama-3.3-70b-instruct")
print(f"API Key exists: {bool(api_key)}")
print(f"Model: {model}")

# Generate a prompt similar to the market search data prompt
prompt = "You are a helpful assistant. Output JSON.\n\nContext:\n" + ("A" * 15000)

async def main():
    async with httpx.AsyncClient(timeout=35.0) as client:
        try:
            print("Sending request to integrate.api.nvidia.com...")
            res = await client.post(
                "https://integrate.api.nvidia.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                json={
                    "model": model,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.1,
                    "max_tokens": 1400,
                },
            )
            print(f"Response Status: {res.status_code}")
            print(f"Response Headers: {dict(res.headers)}")
            print(f"Response Body: {res.text[:1000]}")
        except Exception as e:
            print(f"EXCEPTION: {type(e).__name__}: {str(e)}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
