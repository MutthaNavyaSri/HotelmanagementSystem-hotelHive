import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hotelmanagement.settings')
django.setup()

from api.models import Room

# Check all rooms
rooms = Room.objects.all()
print(f"📊 Total rooms in database: {rooms.count()}")
print("\nRoom List:")
print("-" * 100)

for i, room in enumerate(rooms, 1):
    print(f"{i}. ID: {room.id:<3} | Title: {room.title:<30} | Type: {room.room_type:<8} | Location: {room.location:<25} | Price: ${room.price_per_night}")

print("-" * 100)

# Check if any rooms are inactive/deleted
print(f"\n✅ Rooms displayed: {rooms.count()}")
