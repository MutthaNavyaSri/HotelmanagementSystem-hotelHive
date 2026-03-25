import requests
import json

BASE_URL = "http://localhost:8000/api"

# Test 4: Login FIRST to get token
print("4. Testing login...")
try:
    response = requests.post(f"{BASE_URL}/auth/firebase-login/", json={
        "email": "test@example.com",
        "firebase_uid": "test-user-" + str(__import__('time').time())
    })
    print(f"Status: {response.status_code}")
    login_data = response.json()
    print(json.dumps(login_data, indent=2)[:500])
    token = login_data.get('token') if login_data.get('success') else None
except Exception as e:
    print(f"❌ Error: {e}")
    token = None

# Test 1: Get rooms
print("\n1. Getting rooms...")
try:
    response = requests.get(f"{BASE_URL}/rooms/")
    print(f"Status: {response.status_code}")
    data = response.json()
    if isinstance(data, dict) and 'results' in data:
        print(f"✅ Returns {len(data['results'])} rooms")
        for room in data['results'][:2]:
            print(f"  - {room.get('title')}: ${room.get('price_per_night')}/night")
    elif isinstance(data, list):
        print(f"✅ Returns list of {len(data)} rooms")
        if data:
            print("First room:", json.dumps(data[0], indent=2)[:200])
    else:
        print(json.dumps(data, indent=2)[:500])
except Exception as e:
    print(f"❌ Error: {e}")

# Test 2: Get recommendations
print("\n2. Getting recommendations...")
try:
    response = requests.get(f"{BASE_URL}/rooms/recommendations/")
    print(f"Status: {response.status_code}")
    data = response.json()
    if isinstance(data, list):
        print(f"✅ Returns list of {len(data)} recommendations")
    else:
        print(json.dumps(data, indent=2)[:500])
except Exception as e:
    print(f"❌ Error: {e}")

# Test 3: Admin stats (with authentication)
print("\n3. Getting admin stats...")
try:
    headers = {}
    if token:
        headers['Authorization'] = f'Bearer {token}'
        print(f"Using token: {token[:30]}...")
    
    response = requests.get(f"{BASE_URL}/admin/dashboard/stats/", headers=headers)
    print(f"Status: {response.status_code}")
    data = response.json()
    if response.status_code == 200:
        print(f"✅ Admin Stats retrieved successfully:")
        print(json.dumps(data, indent=2))
    else:
        print(json.dumps(data, indent=2)[:500])
except Exception as e:
    print(f"❌ Error: {e}")

print("\n" + "="*50)
print("📊 SUMMARY")
print("="*50)
