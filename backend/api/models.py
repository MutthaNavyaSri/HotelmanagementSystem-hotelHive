from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
import uuid
import json


class UserProfile(models.Model):
    """Extended User Profile Model"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    firebase_uid = models.CharField(max_length=255, unique=True, null=True, blank=True)
    is_admin = models.BooleanField(default=False)
    phone_number = models.CharField(max_length=20, null=True, blank=True)
    profile_image = models.ImageField(upload_to='profile_images/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} - {'Admin' if self.is_admin else 'User'}"

    class Meta:
        verbose_name = "User Profile"
        verbose_name_plural = "User Profiles"


class Room(models.Model):
    """Hotel Room Model"""
    ROOM_TYPE_CHOICES = [
        ('single', 'Single'),
        ('double', 'Double'),
        ('suite', 'Suite'),
        ('deluxe', 'Deluxe'),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField()
    room_type = models.CharField(max_length=50, choices=ROOM_TYPE_CHOICES)
    price_per_night = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    max_guests = models.IntegerField(default=2, validators=[MinValueValidator(1)])
    location = models.CharField(max_length=255, null=True, blank=True)  # Location field (e.g., "Downtown", "Beachfront", "Airport Area")
    amenities = models.JSONField(default=dict, blank=True)  # JSON field for amenities like [WiFi, AC, TV]
    
    # Rating and reviews
    total_rating = models.FloatField(default=0, validators=[MinValueValidator(0), MaxValueValidator(5)])
    rating_count = models.IntegerField(default=0)
    
    # Availability
    available_from = models.DateField(null=True, blank=True)
    available_to = models.DateField(null=True, blank=True)
    
    # Metadata
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='rooms_created')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Room"
        verbose_name_plural = "Rooms"

    def __str__(self):
        return f"{self.title} - ₹{self.price_per_night}/night"

    @property
    def average_rating(self):
        """Calculate average rating"""
        if self.rating_count == 0:
            return 0
        return round(self.total_rating / self.rating_count, 1)

    def update_rating(self):
        """Update room's rating based on reviews"""
        reviews = self.reviews.all()
        if reviews.exists():
            self.total_rating = sum([r.rating for r in reviews])
            self.rating_count = reviews.count()
            self.save()


class Image(models.Model):
    """Room Image Model - One-to-Many relationship"""
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='room_images/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['uploaded_at']
        verbose_name = "Image"
        verbose_name_plural = "Images"

    def __str__(self):
        return f"Image for {self.room.title}"


class Booking(models.Model):
    """Hotel Booking Model"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('pending_verification', 'Pending Verification'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='bookings')
    check_in = models.DateField()
    check_out = models.DateField()
    guests = models.IntegerField(default=1, validators=[MinValueValidator(1)])
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='pending')
    booking_id = models.CharField(max_length=50, unique=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Booking"
        verbose_name_plural = "Bookings"

    def __str__(self):
        return f"{self.booking_id} - {self.user.email}"

    def save(self, *args, **kwargs):
        """Auto-generate booking_id and calculate total price"""
        if not self.booking_id:
            # Generate unique booking ID: HMBK-YYYYMMDD-XXXXX
            date_str = timezone.now().strftime('%Y%m%d')
            random_str = str(uuid.uuid4()).split('-')[0].upper()[:5]
            self.booking_id = f"HMBK-{date_str}-{random_str}"
        
        # Calculate total price
        if self.check_in and self.check_out:
            nights = (self.check_out - self.check_in).days
            self.total_price = self.room.price_per_night * nights
        
        super().save(*args, **kwargs)

    def get_nights(self):
        """Get number of nights"""
        return (self.check_out - self.check_in).days


class Payment(models.Model):
    """Payment Model for booking"""
    STATUS_CHOICES = [
        ('pending_verification', 'Pending Verification'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='payment')
    transaction_id = models.CharField(max_length=100, unique=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='pending_verification')
    proof_screenshot = models.ImageField(upload_to='payment_proofs/')
    
    # User info
    user_name = models.CharField(max_length=255)
    user_email = models.EmailField()
    
    # Verification info
    verified_at = models.DateTimeField(null=True, blank=True)
    verified_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='verified_payments')
    rejection_reason = models.TextField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Payment"
        verbose_name_plural = "Payments"

    def __str__(self):
        return f"Payment for {self.booking.booking_id} - {self.status}"


class Review(models.Model):
    """Review Model for Rooms"""
    RATING_CHOICES = [
        (1, '1 Star'),
        (2, '2 Stars'),
        (3, '3 Stars'),
        (4, '4 Stars'),
        (5, '5 Stars'),
    ]

    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField(choices=RATING_CHOICES)
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ('booking', 'user')  # One review per booking per user
        verbose_name = "Review"
        verbose_name_plural = "Reviews"

    def __str__(self):
        return f"Review by {self.user.email} for {self.room.title}"

    def save(self, *args, **kwargs):
        """Update room rating when review is saved"""
        super().save(*args, **kwargs)
        self.room.update_rating()

    def delete(self, *args, **kwargs):
        """Update room rating when review is deleted"""
        room = self.room
        super().delete(*args, **kwargs)
        room.update_rating()

