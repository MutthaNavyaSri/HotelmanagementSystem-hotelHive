#!/usr/bin/env python
"""
Test script to diagnose why newly added rooms aren't showing on the website
Run this with: python manage.py shell < test_rooms.py
Or: python test_rooms.py
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hotelmanagement.settings')
django.setup()

from api.models import Room, Image
from django.core.management import call_command

print("=" * 70)
print("ROOM LISTING DIAGNOSTIC TEST")
print("=" * 70)

# Test 1: Check database for all rooms
print("\n1️⃣  Checking database for rooms...")
all_rooms = Room.objects.all()
print(f"   Total rooms in database: {all_rooms.count()}")

if all_rooms.count() > 0:
    print("\n   Room Details:")
    for room in all_rooms.order_by('-created_at')[:5]:  # Last 5 rooms
        print(f"\n   ✓ ID: {room.id}")
        print(f"     Title: {room.title}")
        print(f"     Type: {room.room_type}")
        print(f"     Price: ${room.price_per_night}/night")
        print(f"     Max Guests: {room.max_guests}")
        print(f"     Created: {room.created_at}")
        print(f"     Images: {room.images.count()}")
        print(f"     Ratings: {room.rating_count} reviews")
else:
    print("   ⚠️  No rooms found in database!")

# Test 2: Check API serialization
print("\n\n2️⃣  Testing API Serialization...")
from rest_framework.test import APIRequestFactory
from api.serializers import RoomListSerializer

if all_rooms.count() > 0:
    latest_room = all_rooms.latest('created_at')
    print(f"   Testing with room: '{latest_room.title}' (ID: {latest_room.id})")
    
    try:
        factory = APIRequestFactory()
        request = factory.get('/api/rooms/')
        serializer = RoomListSerializer(latest_room, context={'request': request})
        data = serializer.data
        print(f"   ✅ Serialization successful!")
        print(f"   Serialized data keys: {list(data.keys())}")
        print(f"   Primary Image: {data.get('primary_image', 'None')}")
        print(f"   Average Rating: {data.get('average_rating', 'None')}")
    except Exception as e:
        print(f"   ❌ Serialization error: {e}")
        import traceback
        traceback.print_exc()
else:
    print("   ⚠️  No rooms to test serialization")

# Test 3: Test full list serialization
print("\n\n3️⃣  Testing RoomViewSet list endpoint...")
from api.views import RoomViewSet
from rest_framework.test import APIRequestFactory

if all_rooms.count() > 0:
    try:
        factory = APIRequestFactory()
        request = factory.get('/api/rooms/')
        view = RoomViewSet.as_view({'get': 'list'})
        response = view(request)
        print(f"   Status Code: {response.status_code}")
        print(f"   Response type: {type(response.data).__name__}")
        
        if hasattr(response.data, 'keys'):
            print(f"   Response keys: {list(response.data.keys())}")
            if 'results' in response.data:
                print(f"   Rooms in results: {len(response.data['results'])}")
        else:
            print(f"   Response data type: {type(response.data)}")
            print(f"   Number of items: {len(response.data) if isinstance(response.data, list) else 'N/A'}")
    except Exception as e:
        print(f"   ❌ API test error: {e}")
        import traceback
        traceback.print_exc()

# Test 4: Check for any Django errors
print("\n\n4️⃣  Running Django check command...")
print("   Running: python manage.py check")
from io import StringIO
from django.core.management import call_command

try:
    call_command('check', stdout=StringIO(), stderr=StringIO())
    print("   ✅ No Django errors found")
except Exception as e:
    print(f"   ⚠️  Warning: {e}")

# Test 5: Verify Image relationships
print("\n\n5️⃣  Checking Image relationships...")
total_images = Image.objects.count()
rooms_without_images = all_rooms.filter(images__isnull=True).distinct().count()
rooms_with_images = all_rooms.filter(images__isnull=False).distinct().count()

print(f"   Total images in database: {total_images}")
print(f"   Rooms with images: {rooms_with_images}")
print(f"   Rooms WITHOUT images: {rooms_without_images}")

if rooms_without_images > 0:
    print("\n   ⚠️  Note: Rooms without images will still display,")
    print("       but the primary_image field will be None")

print("\n" + "=" * 70)
print("TEST COMPLETE")
print("=" * 70)
print("\n📝 Interpretation:")
print("   • If rooms show in Step 1 but not in Step 2: Serialization issue")
print("   • If rooms show in Step 1 & 2 but not Step 3: API endpoint issue") 
print("   • If all tests pass: The issue is on the frontend (JavaScript)")
print("   • If no rooms in Step 1: No rooms saved in database")
