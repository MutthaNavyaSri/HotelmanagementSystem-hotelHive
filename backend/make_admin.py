import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hotelmanagement.settings')
django.setup()

from django.contrib.auth.models import User

# Find the test user and make them admin
user = User.objects.filter(email='test@example.com').first()
if user:
    user.is_staff = True
    user.is_superuser = True
    user.save()
    user.profile.is_admin = True
    user.profile.save()
    print(f"✅ User '{user.username}' is now an admin")
    print(f"  - is_staff: {user.is_staff}")
    print(f"  - is_superuser: {user.is_superuser}")
    print(f"  - profile.is_admin: {user.profile.is_admin}")
else:
    print("❌ Test user not found")
