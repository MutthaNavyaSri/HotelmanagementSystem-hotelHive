# Email Setup & Testing Guide

## Overview
The hotel management system now automatically sends confirmation emails to users when an admin marks their booking status as "confirmed" in the Django admin panel.

## How It Works

1. **Admin Updates Booking**: Admin goes to Django admin at `http://127.0.0.1:8000/admin/`
2. **Change Status**: Changes booking status to "confirmed"
3. **Signal Triggered**: Django signal detects the status change
4. **Email Sent**: Automatic email is sent to the user's registered email address

## Configuration

### Email Backend
Currently set to **Console Email Backend** for development (prints emails to console instead of sending)

To change to actual SMTP email:

1. Update `.env` file:
```
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@hotelmanagement.com
```

2. For Gmail: Use "App Password" instead of regular password
   - Enable 2FA on your Gmail account
   - Generate an App Password: https://myaccount.google.com/apppasswords

## Testing

### Method 1: Django Admin UI
1. Go to `http://127.0.0.1:8000/admin/`
2. Login with admin credentials
3. Navigate to Bookings
4. Select a booking with status "pending" or "pending_verification"
5. Change status to "confirmed"
6. Click Save
7. Check console output - you should see email confirmation message

### Method 2: Django Shell
```bash
cd backend
python manage.py shell

# Then paste the code from test_email_signal.py
# Or run directly:
python test_email_signal.py
```

### Method 3: API (Admin Only)
```bash
# Get admin token first, then:
curl -X PATCH http://127.0.0.1:8000/api/bookings/{booking_id}/ \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{"status": "confirmed"}'
```

## Email Statuses

| Status | Email Action |
|--------|-------------|
| pending | No email |
| pending_verification | No email |
| **confirmed** | ✅ Email sent to user |
| completed | No email |
| cancelled | No email |

## Email Template Content

The email includes:
- Booking confirmation message
- Booking ID
- Room details
- Check-in & Check-out dates
- Number of guests
- Total price
- HTML formatted with styling

## Frontend Setup

The frontend no longer has a dedicated admin panel. Instead:
- Link to Django Admin: `http://127.0.0.1:8000/admin/` (shown in navbar as "Django Admin")
- Only authenticated admin users can access Django admin
- Admins login with their staff credentials

## Workflow

```
Customer Books Room
    ↓
Booking Created (Status: pending)
    ↓
Customer Completes Payment
    ↓
Booking Created (Status: pending)
    ↓
[Admin Updates Status to "confirmed" in Django Admin]
    ↓
Signal Triggered
    ↓
✉️ Email Sent to User
    ↓
Customer Receives Confirmation Email
```

## Troubleshooting

### Email not sending?
1. Check console output for error messages
2. Verify `EMAIL_BACKEND` setting
3. If using SMTP, check credentials
4. Make sure user has valid email address

### Signal not triggering?
1. Ensure `api/signals.py` exists
2. Verify `api/apps.py` has `ready()` method with signal import
3. Restart Django server: `python manage.py runserver`

### Email format issues?
1. Check that user has valid email in database
2. Verify booking has all required fields (user, room, dates, price)
3. Check signal function in `api/signals.py`

## Database Check

```bash
# View admin details
python manage.py shell
>>> from django.contrib.auth.models import User
>>> admins = User.objects.filter(is_staff=True)
>>> for admin in admins:
...     print(f"{admin.username} - {admin.email}")
```

## Next Steps

1. **Test the flow**: Create booking → Update to confirmed → Check email
2. **Customize email**: Edit `api/signals.py` to change email template
3. **Add more statuses**: Add signals for other status changes if needed
4. **Production setup**: Configure real SMTP service before going live
