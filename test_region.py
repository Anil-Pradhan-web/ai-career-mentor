import re

REGION_DATA = {
    "india": {
        "currency": "INR",
        "symbol": "₹",
        "hubs": [
            "bangalore", "bengaluru", "hyderabad", "mumbai",
            "delhi", "noida", "gurgaon", "pune",
            "chennai", "kolkata", "bhubaneswar"
        ],
    },
    "usa": {
        "currency": "USD",
        "symbol": "$",
        "hubs": ["san francisco", "new york", "seattle", "austin", "chicago", "boston"],
    }
}

def _detect_region(location: str) -> str:
    loc = location.lower()
    for region, data in REGION_DATA.items():
        if region in loc or any(h in loc for h in data["hubs"]):
            return region
    return "global"

print(f"Detecting 'Bangalore, India': {_detect_region('Bangalore, India')}")
print(f"Detecting 'India': {_detect_region('India')}")
print(f"Detecting 'Remote (India-based)': {_detect_region('Remote (India-based)')}")
print(f"Detecting 'San Francisco, USA': {_detect_region('San Francisco, USA')}")
