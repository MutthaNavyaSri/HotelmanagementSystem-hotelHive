"""
Django Admin Status Update Test Script

Usage:
1. Navigate to Django admin: http://127.0.0.1:8000/admin/
2. Go to Bookings
3. You can now:
   - Edit status directly from the list view (click on status in the table)
   - Or click on a booking to open full edit form
   - Change status from 'Pending' to 'Confirmed'
   - Click Save
   - Check console for email confirmation

If you still can't update:
Run this script to verify the setup:
    python test_admin_setup.py
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hotelmanagement.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import Booking

print("\n" + "="*60)
print("DJANGO ADMIN STATUS UPDATE TEST")
print("="*60)

# Check if admin user exists
admin_users = User.objects.filter(is_staff=True, is_superuser=True)
if admin_users.exists():
    print(f"\n✅ Admin users found: {admin_users.count()}")
    for admin in admin_users:
        print(f"   - {admin.username} ({admin.email})")
else:
    print("\n❌ No admin users found!")
    print("   To create admin user, run: python manage.py createsuperuser")

# Check bookings
pending_bookings = Booking.objects.filter(status='pending')
print(f"\n📋 Bookings Status Summary:")
print(f"   - Pending: {pending_bookings.count()}")
print(f"   - Pending Verification: {Booking.objects.filter(status='pending_verification').count()}")
print(f"   - Confirmed: {Booking.objects.filter(status='confirmed').count()}")
print(f"   - Completed: {Booking.objects.filter(status='completed').count()}")
print(f"   - Cancelled: {Booking.objects.filter(status='cancelled').count()}")

if pending_bookings.exists():
    print(f"\n✅ Found pending bookings:")
    for booking in pending_bookings[:3]:
        print(f"   - Booking #{booking.id}: {booking.user.email}")
        print(f"     Room: {booking.room.title}")
        print(f"     Status: {booking.status}")

# Check email configuration
from django.conf import settings
print(f"\n📧 Email Configuration:")
print(f"   - Backend: {settings.EMAIL_BACKEND}")
print(f"   - From Email: {settings.DEFAULT_FROM_EMAIL}")

if settings.EMAIL_BACKEND == 'django.core.mail.backends.console.EmailBackend':
    print(f"   - Mode: Console (emails print to console for testing)")
else:
    print(f"   - Mode: SMTP (real email sending)")

print("\n" + "="*60)
print("INSTRUCTIONS TO UPDATE BOOKING STATUS:")
print("="*60)
print("""
1. Go to Django Admin: http://127.0.0.1:8000/admin/
2. Click on "Bookings"
3. You should see a list of all bookings
4. TWO WAYS TO UPDATE STATUS:

   METHOD 1 - Edit from List (Faster):
   - Find booking with status "Pending"
   - Click on the status field dropdown
   - Select "Confirmed"
   - Click "Save"

   METHOD 2 - Edit Full Form:
   - Click on the booking ID
   - Scroll to "Status & Pricing" section
   - Change Status dropdown to "Confirmed"
   - Click "Save" button
   - Success! Email sent automatically

5. Check console output for:
   ✅ Confirmation email sent to user@email.com
""")
print("="*60 + "\n")
