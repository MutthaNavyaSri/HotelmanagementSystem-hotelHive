import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hotelmanagement.settings')
django.setup()

from api.models import Room

# Create test rooms
rooms_data = [
    {"title": "Deluxe Suite", "description": "Luxury room with ocean view", "room_type": "deluxe", "price_per_night": 150, "max_guests": 2},
    {"title": "Standard Double Room", "description": "Comfortable room with WiFi", "room_type": "double", "price_per_night": 80, "max_guests": 2},
    {"title": "Family Suite", "description": "Spacious room for families", "room_type": "suite", "price_per_night": 200, "max_guests": 4},
    {"title": "Budget Single Room", "description": "Economy room", "room_type": "single", "price_per_night": 50, "max_guests": 1},
]

# Clear existing rooms first
Room.objects.all().delete()

for data in rooms_data:
    room = Room.objects.create(**data)
    print(f"✅ Created: {room.title} ({room.room_type}) - ${room.price_per_night}/night")

print(f"\n📊 Total rooms in database: {Room.objects.count()}")
