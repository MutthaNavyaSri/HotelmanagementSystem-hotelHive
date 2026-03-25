import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hotelmanagement.settings')
django.setup()

from api.models import Booking, Payment

# Clear all test bookings
deleted_count, _ = Booking.objects.all().delete()
print(f"✅ Deleted {deleted_count} bookings")

# Clear all test payments  
deleted_count, _ = Payment.objects.all().delete()
print(f"✅ Deleted payments")

print("\n📊 Database cleaned!")
print("You can now test booking again without conflicts.")
