from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
from api.models import Booking


@receiver(post_save, sender=Booking)
def send_booking_confirmation_email(sender, instance, created, update_fields, **kwargs):
    """
    Signal handler to send confirmation email when booking status is updated to 'confirmed'
    """
    # Check if this is an update (not a creation)
    if not created:
        # Check if status was updated (update_fields can be None when saving from admin)
        # So we check: if update_fields is None (full save) OR if it contains 'status'
        if update_fields is None or 'status' in update_fields:
            # Only send email if new status is 'confirmed'
            if instance.status == 'confirmed':
                try:
                    subject = f'Booking Confirmation - HotelHive #{instance.id}'
                    
                    # Get user email
                    user_email = instance.user.email
                    
                    # Prepare email message
                    message = f"""
Dear {instance.user.first_name or instance.user.username},

Your booking has been confirmed!

Booking Details:
---------------
Booking ID: {instance.id}
Room: {instance.room.title}
Check-in Date: {instance.check_in.strftime('%B %d, %Y')}
Check-out Date: {instance.check_out.strftime('%B %d, %Y')}
Number of Guests: {instance.guests}
Total Price: ${instance.total_price:.2f}

Your booking is now confirmed. You will soon receive more details about your stay via email.

If you have any questions, please contact our customer support team.

Best regards,
Hotel Management Team
http://127.0.0.1:5173
                    """
                    
                    html_message = f"""
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2563eb;">Booking Confirmation</h1>
        
        <p>Dear {instance.user.first_name or instance.user.username},</p>
        
        <p>Your booking has been confirmed! ✅</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #1f2937; margin-top: 0;">Booking Details</h2>
            <p><strong>Booking ID:</strong> #{instance.id}</p>
            <p><strong>Room:</strong> {instance.room.title}</p>
            <p><strong>Check-in Date:</strong> {instance.check_in.strftime('%B %d, %Y')}</p>
            <p><strong>Check-out Date:</strong> {instance.check_out.strftime('%B %d, %Y')}</p>
            <p><strong>Number of Guests:</strong> {instance.guests}</p>
            <p><strong>Total Price:</strong> ${instance.total_price:.2f}</p>
        </div>
        
        <p>Your booking is now confirmed. You will soon receive more details about your stay via email.</p>
        
        <p>If you have any questions, please contact our customer support team.</p>
        
        <p style="color: #6b7280; font-size: 14px;">
            Best regards,<br>
            HotelHive Team<br>
            <a href="http://127.0.0.1:5173" style="color: #2563eb;">Visit our website</a>
        </p>
    </div>
</body>
</html>
                    """
                    
                    # Send email
                    send_mail(
                        subject=subject,
                        message=message,
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=[user_email],
                        html_message=html_message,
                        fail_silently=False,
                    )
                    
                    print(f"✅ Confirmation email sent to {user_email} for booking #{instance.id}")
                    
                except Exception as e:
                    print(f"❌ Failed to send confirmation email for booking #{instance.id}: {str(e)}")
