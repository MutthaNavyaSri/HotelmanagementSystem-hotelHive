# Booking Status Update - Troubleshooting Guide

## Problem: Can't Update Status in Django Admin

### Solution 1: Edit Status from List View (EASIEST)

1. Go to Django Admin: `http://127.0.0.1:8000/admin/`
2. Click on **"Bookings"**
3. You'll see list of bookings with a **Status** column
4. **Click directly on the status value** (e.g., "Pending") 
5. A dropdown will appear with options:
   - Pending
   - Pending Verification
   - **Confirmed** ← Select this
6. Click outside or press Save
7. ✅ Email sent automatically!

### Solution 2: Edit from Booking Detail Form

1. Go to Django Admin: `http://127.0.0.1:8000/admin/`
2. Click on **"Bookings"**
3. Click on the **Booking ID** (e.g., "#1")
4. You'll see the full booking form
5. Scroll down to **"Status & Pricing"** section
6. Find the **Status** dropdown
7. Change it from "Pending" to **"Confirmed"**
8. Click **"SAVE"** button (green button at bottom right)
9. ✅ Booking updated! Email sent!

## Common Issues & Fixes

### Issue 1: "Status field is grayed out / read-only"
**Solution:**
- Make sure you're logged in as an **admin/superuser**
- Not just staff user - must have "Superuser" checkbox checked
- If needed, create admin: `python manage.py createsuperuser`

### Issue 2: "Status field doesn't appear at all"
**Solution:**
- The admin form might need to be reloaded
- Try clearing browser cache: Press `Ctrl + Shift + Delete`
- Or restart Django server: `python manage.py runserver`

### Issue 3: "Changes don't save"
**Solution:**
1. Check browser console for errors (F12 → Console tab)
2. Check Django server console for error messages
3. Make sure booking data is valid:
   ```bash
   python manage.py shell
   >>> from api.models import Booking
   >>> booking = Booking.objects.first()
   >>> print(booking.status)  # Should show current status
   ```

### Issue 4: "Email not sending"
**Solution:**
- Check Django console output - should show:
  ```
  ✅ Confirmation email sent to user@email.com
  ```
- If using console backend (default):
  - Emails print to console instead of sending
  - This is correct for testing
- To switch to real email sending, update `.env`:
  ```
  EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
  EMAIL_HOST=smtp.gmail.com
  EMAIL_HOST_USER=your-email@gmail.com
  EMAIL_HOST_PASSWORD=your-app-password
  ```

## Test Script

To verify everything is set up correctly:

```bash
cd backend
python test_admin_setup.py
```

This will show:
- ✅ Admin users available
- ✅ Bookings in database
- ✅ Email configuration status

## Quick Start

**Fastest way to update booking status:**

1. Terminal: `cd backend && python manage.py runserver`
2. Browser: `http://127.0.0.1:8000/admin/`
3. Login with admin credentials
4. Click "Bookings"
5. Click status value → select "Confirmed" → Save
6. Done! ✅

## Database Verification

To manually check booking status:

```bash
python manage.py shell

# Check pending bookings
from api.models import Booking
pending = Booking.objects.filter(status='pending')
for b in pending:
    print(f"Booking #{b.id}: {b.user.email} - Status: {b.status}")

# Update one booking
booking = pending.first()
booking.status = 'confirmed'
booking.save(update_fields=['status'])
```

## Admin User Creation

If you don't have an admin account:

```bash
cd backend
python manage.py createsuperuser

# Follow prompts:
# Username: admin
# Email: admin@example.com
# Password: (enter secure password)
# Superuser: yes
```

Then login at `http://127.0.0.1:8000/admin/`
