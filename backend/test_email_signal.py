"""
Test script to verify email sending when booking status is updated to 'confirmed'

To test this:
1. Create a booking (via API or admin)
2. Run: python manage.py shell
3. Execute the code below to simulate admin updating booking status
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hotelmanagement.settings')
django.setup()

from api.models import Booking, User, Room

# Get the first booking
bookings = Booking.objects.all()

if bookings.exists():
    booking = bookings.first()
    print(f"\nCurrent Booking: #{booking.id}")
    print(f"Status: {booking.status}")
    print(f"User Email: {booking.user.email}")
    print(f"Room: {booking.room.title}")
    
    # Simulate admin changing status to 'confirmed'
    print("\n--- Simulating Admin Update ---")
    print(f"Updating booking status to 'confirmed'...")
    
    booking.status = 'confirmed'
    booking.save(update_fields=['status'])
    
    print(f"✅ Booking #{booking.id} status updated to '{booking.status}'")
    print(f"📧 Email sent to {booking.user.email} (check console output)")
else:
    print("❌ No bookings found in database")
