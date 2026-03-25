import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hotelmanagement.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import Room, Booking, UserProfile
from datetime import datetime, timedelta

print("\n=== CHECKING DATABASE ===\n")

# Check users
users = User.objects.all()
print(f"Total Users: {users.count()}")
for user in users:
    print(f"  - {user.email} ({user.username})")
    bookings = Booking.objects.filter(user=user)
    print(f"    Bookings: {bookings.count()}")
    for booking in bookings:
        print(f"      * Booking #{booking.id}: {booking.room.title if booking.room else 'N/A'} - Status: {booking.status}")

print(f"\nTotal Bookings in DB: {Booking.objects.count()}")
print(f"Total Rooms: {Room.objects.count()}")

print("\n=== CLEAR ALL DATA (Optional) ===\n")
print("To clear user data, run:")
print("  python manage.py shell")
print("  >>> from django.contrib.auth.models import User")
print("  >>> User.objects.filter(email='your-email@test.com').delete()")
print("\nOR delete from Django Admin:")
print("  http://127.0.0.1:8000/admin/")
print("  Go to Users -> Select user -> Delete")
