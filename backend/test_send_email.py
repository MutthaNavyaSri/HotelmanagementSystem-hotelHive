"""
Test Email Signal - Run this to verify email is being sent

Usage:
    python manage.py shell < test_send_email.py

Or directly:
    python test_send_email.py
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hotelmanagement.settings')
django.setup()

from api.models import Booking
from django.utils import timezone
from datetime import timedelta

print("\n" + "="*60)
print("EMAIL SIGNAL TEST")
print("="*60)

# Find a pending booking
pending_bookings = Booking.objects.filter(status='pending').order_by('-created_at')

if not pending_bookings.exists():
    print("\n❌ No pending bookings found!")
    print("   Create a booking first and try again.")
else:
    booking = pending_bookings.first()
    
    print(f"\n📋 Found Booking: #{booking.id}")
    print(f"   User Email: {booking.user.email}")
    print(f"   Current Status: {booking.status}")
    print(f"   Room: {booking.room.title}")
    
    # Simulate admin changing status to 'confirmed'
    print(f"\n🔄 Updating booking status to 'confirmed'...")
    print(f"   Watching for signal to trigger and email to send...\n")
    
    # Update the booking
    booking.status = 'confirmed'
    booking.save()  # This triggers the signal
    
    print(f"\n✅ Booking saved!")
    print(f"   Check console output above for email message.")
    print(f"   Look for: '✅ Confirmation email sent to {booking.user.email}'")
    
    # Verify the status changed
    booking.refresh_from_db()
    print(f"\n🔍 Verification:")
    print(f"   New Status: {booking.status}")
    
    if booking.status == 'confirmed':
        print(f"   ✅ Status successfully changed to confirmed")
    else:
        print(f"   ❌ Status was not updated!")

print("\n" + "="*60 + "\n")
